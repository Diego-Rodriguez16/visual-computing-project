export class GestureController {
    private startX: number = 0;
    private startY: number = 0;
    private isDragging: boolean = false;

    // Outputs (-1 to 1)
    public deltaX: number = 0;
    public deltaY: number = 0;

    // Configuration
    private sensitivity: number = 100; // Pixels to reach full magnitude

    constructor() {
        this.setupEvents();
    }

    private setupEvents() {
        // We attach to body to catch all drags not stopped by other UI
        document.body.addEventListener('touchstart', (e) => {
            // Ignore if touching a button or the visual joystick
            if ((e.target as HTMLElement).closest('.control-btn, #joystick-container, .color-btn')) {
                return;
            }

            this.isDragging = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.deltaX = 0;
            this.deltaY = 0;
        }, { passive: false });

        document.body.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            // Prevent scrolling
            if (e.cancelable) e.preventDefault();

            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            const diffX = x - this.startX;
            const diffY = y - this.startY;

            // Clamp to -1..1
            this.deltaX = Math.max(-1, Math.min(1, diffX / this.sensitivity));
            this.deltaY = Math.max(-1, Math.min(1, diffY / this.sensitivity));

        }, { passive: false });

        document.body.addEventListener('touchend', () => {
            this.isDragging = false;
            this.deltaX = 0;
            this.deltaY = 0;
        });

        // Mouse support for testing on desktop
        document.body.addEventListener('mousedown', (e) => {
            if ((e.target as HTMLElement).closest('.control-btn, #joystick-container, .color-btn')) {
                return;
            }
            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
        });

        document.body.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const diffX = e.clientX - this.startX;
            const diffY = e.clientY - this.startY;
            this.deltaX = Math.max(-1, Math.min(1, diffX / this.sensitivity));
            this.deltaY = Math.max(-1, Math.min(1, diffY / this.sensitivity));
        });

        document.body.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.deltaX = 0;
            this.deltaY = 0;
        });
    }
}
