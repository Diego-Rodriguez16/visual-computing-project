// Declare global types for MediaPipe since we are using CDN scripts
declare var Hands: any;
declare var Camera: any;

/**
 * Handles Hand Tracking using Google MediaPipe Hands.
 * Detects gestures for driving the car:
 * - Open Hand: Forward
 * - Fist: Stop
 * - Peace Sign: Reverse
 * - Hand X Position: Steering
 */
export class HandTracker {
    private hands: any;
    private videoElement: HTMLVideoElement | null = null;
    private canvasElement: HTMLCanvasElement | null = null;
    private canvasCtx: CanvasRenderingContext2D | null = null;
    private camera: any = null;

    public isReady: boolean = false;

    // Outputs
    public steering: number = 0; // Range: -1 (Left) to 1 (Right)
    public throttle: number = 0; // Range: 1 (Fwd), 0 (Stop), -0.5 (Rev)
    public isHandDetected: boolean = false;

    constructor() {
        this.setupMediaPipe();
    }

    private setupMediaPipe() {
        this.hands = new Hands({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results: any) => this.onResults(results));
    }

    public async start() {
        // Find AR.js video element
        // AR.js creates a video element with id 'arjs-video' typically
        this.videoElement = document.querySelector('#arjs-video');

        if (!this.videoElement) {
            // Fallback: look for any video element
            this.videoElement = document.querySelector('video');
        }

        if (this.videoElement) {
            console.log("🖐️ HandTracker attached to video source");

            // We cannot use Camera utils easily because AR.js already controls the camera stream.
            // Using Camera utils would try to getUserMedia AGAIN, which might fail or freeze AR.js.
            // Instead, we will hook into the animation loop to send frames.

            this.isReady = true;
            this.processFrame();
        } else {
            console.warn("⚠️ HandTracker: No video element found. Retrying in 1s...");
            setTimeout(() => this.start(), 1000);
        }
    }

    private processFrame() {
        if (!this.videoElement || this.videoElement.paused || this.videoElement.ended) {
            requestAnimationFrame(() => this.processFrame());
            return;
        }

        // Send frame to MediaPipe
        // We limit frequency to save performance (e.g., every 2nd or 3rd frame) if needed.
        // For now, try every frame but acknowledge it might lag.
        this.hands.send({ image: this.videoElement }).then(() => {
            requestAnimationFrame(() => this.processFrame());
        });
    }

    private onResults(results: any) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.isHandDetected = true;
            const landmarks = results.multiHandLandmarks[0];

            // --- Logic ---

            // 1. Steering: Based on Hand X position (0 to 1)
            // Center is 0.5
            // < 0.4 = Left
            // > 0.6 = Right
            const wrist = landmarks[0];
            const x = 1.0 - wrist.x; // Mirror X since camera is mirrored usually? Or check results.
            // Try standard x first. If webcam is mirrored, input might be mirrored.
            // Usually user sees mirrored self. If I move hand to screen-right, x increases.

            // Let's assume Screen Left (x < 0.5) = Turn Left
            // Screen Right (x > 0.5) = Turn Right
            // Mapping [0..1] to [-1..1]
            let rawSteer = (wrist.x - 0.5) * 2;

            // Apply deadzone
            if (Math.abs(rawSteer) < 0.2) rawSteer = 0;

            // Invert? If I move hand right, x goes 0->1. I want to steer Right.
            // VirtualJoystick x>0 is steer right.
            this.steering = rawSteer * 2.0; // amplify

            // 2. Throttle: Logic
            // Open Hand (5 fingers) -> Forward (1)
            // Fist (0 fingers) -> Stop (0)
            // Peace (2 fingers) -> Reverse (-1)

            if (this.detectPeace(landmarks)) {
                this.throttle = -0.5; // Reverse half speed
            } else if (this.detectFist(landmarks)) {
                this.throttle = 0; // Stop
            } else {
                this.throttle = 1; // Go (Default if hand detected and not closed/peace)
            }

        } else {
            this.isHandDetected = false;
            this.steering = 0;
            this.throttle = 0;
        }
    }

    private detectPeace(landmarks: any[]): boolean {
        // Peace Sign: Index (8) and Middle (12) are open. Ring (16) and Pinky (20) are closed.

        const idxTip = landmarks[8];
        const idxPip = landmarks[6];

        const midTip = landmarks[12];
        const midPip = landmarks[10];

        const ringTip = landmarks[16];
        const ringPip = landmarks[14];

        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];

        // Open: Tip above PIP (y is smaller than PIP y)
        const idxOpen = idxTip.y < idxPip.y;
        const midOpen = midTip.y < midPip.y;

        // Closed: Tip below PIP (y is larger than PIP y)
        const ringClosed = ringTip.y > ringPip.y;
        const pinkyClosed = pinkyTip.y > pinkyPip.y;

        return idxOpen && midOpen && ringClosed && pinkyClosed;
    }

    private detectFist(landmarks: any[]): boolean {
        // Simple check: Is tip below PIP joint? (y > y_pip)
        // Note: Y increases downwards in screen coords.

        // Index Finger
        const idxTip = landmarks[8];
        const idxPip = landmarks[6]; // PIP joint

        // Middle Finger
        const midTip = landmarks[12];
        const midPip = landmarks[10];

        // Ring Finger
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];

        // If tips are lower (y is higher) OR close to palm base compared to PIP
        // Actually checking distance to wrist is safer for 2D

        const wrist = landmarks[0];

        function dist(a: any, b: any) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }

        const dTip = dist(idxTip, wrist);
        const dPip = dist(idxPip, wrist);

        // If tip is significantly closer to wrist than extended...
        // This is tricky in 2D depending on tilt.

        // Alternative: Check if tips are "below" PIPs (y value greater)
        const fingersClosed = (idxTip.y > idxPip.y) && (midTip.y > midPip.y) && (ringTip.y > ringPip.y);

        return fingersClosed;
    }
}
