import * as THREE from 'three';

export class CarManager {
    private model: THREE.Object3D;

    // Physics properties
    private velocity: number = 0;
    private steeringAngle: number = 0;

    // Config
    private maxSpeed: number = 0.1; // Reduced for tabletop AR (was 3.0)
    private acceleration: number = 0.05;
    private friction: number = 0.1;
    private turnSpeed: number = 1.5;

    constructor(model: THREE.Object3D) {
        this.model = model;
        this.debugModelStructure();
        this.applyEnvironmentMap();
    }

    /**
     * Updates car physics state.
     * @param dt Delta time in seconds
     * @param input Input state { x: -1..1, y: -1..1 }
     */
    public update(dt: number, input: { x: number, y: number }) {
        if (!this.model.visible) return;

        // --- Acceleration / Braking ---
        // Input.y is inverted on screen (up is negative usually, but let's assume joystick returns -1 for up, 1 for down. 
        // Actually usually up is -y in 2D, but we want up to be forward (+z or -z? usually -z in Three.js).
        // Let's assume Joystick returns y: -1 (up/forward) to 1 (down/backward).

        // Target speed based on input Y
        // We want -1 (up) to go forward.
        const throttle = -input.y;

        if (Math.abs(throttle) > 0.1) {
            this.velocity += throttle * this.acceleration * dt;
        } else {
            // Friction
            if (this.velocity > 0) {
                this.velocity -= this.friction * dt;
                if (this.velocity < 0) this.velocity = 0;
            } else if (this.velocity < 0) {
                this.velocity += this.friction * dt;
                if (this.velocity > 0) this.velocity = 0;
            }
        }

        // Clamp speed
        this.velocity = Math.max(Math.min(this.velocity, this.maxSpeed), -this.maxSpeed);

        // --- Steering ---
        // Only turn if moving (or just slightly moving) to simulate real car
        if (Math.abs(this.velocity) > 0.1) {
            const turnFactor = Math.abs(this.velocity) / this.maxSpeed; // Turn slower at low speeds? Or faster? Real cars turn same radius actually.
            // Let's just turn based on input
            this.model.rotation.y -= input.x * this.turnSpeed * dt * Math.sign(this.velocity);
        }

        // --- Audio Update ---
        if ((window as any).audioManager) {
            // Speed factor 0..1
            const speedFactor = Math.abs(this.velocity) / this.maxSpeed;
            (window as any).audioManager.updateEngineRPM(speedFactor);
        }

        // --- Position Update ---
        // Move Forward in local Z? Or Global? 
        // Car usually faces +Z or -Z. Let's assume -Z is forward for now, check model.
        // If we just rotate Y, we can translate along the local Z axis.

        const forward = new THREE.Vector3(0, 0, 1); // Assuming model faces +Z initially? Or -Z? Standard GLB cars often face +Z.
        // Actually simplest is "translateZ"

        // We need to check the model's forward vector.
        // Let's try transformDirection.
        // Or just use translateZ if the model logic supports it
        this.model.translateZ(this.velocity * dt);

        // Keep on ground (Optional: raycast for terrain later)
    }

    /**
     * Resets car position
     */
    public resetPosition() {
        this.model.position.set(0, 0, 0);
        this.model.rotation.set(0, 0, 0);
        this.velocity = 0;
    }

    /**
     * Logs the structure of the model to help identify parts.
     */
    private debugModelStructure() {
        console.group('🚗 Car Model Structure Debug');
        this.model.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
                console.log('Mesh found:', node.name, 'Material:', (node as THREE.Mesh).material);
            }
        });
        console.groupEnd();
    }

    /**
     * Sets the color of the car body.
     * @param colorHex Hex color string (e.g., "#FF0000")
     */
    public setCarColor(colorHex: string) {
        console.log(`🎨 Painting car: ${colorHex}`);

        // Convert hex string to THREE.Color
        const newColor = new THREE.Color(colorHex);

        this.model.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
                const mesh = node as THREE.Mesh;

                // CRITICAL: Since we don't know the exact mesh names yet,
                // we'll apply the color to any Standard/Physical material that isn't transparent (like glass).
                // We'll skip anything that looks like glass or rubber based on heuristic.

                const material = mesh.material as THREE.MeshStandardMaterial;

                if (material && material.isMeshStandardMaterial) {
                    // Heuristic: Don't paint glass (usually transparent) or wheels (usually very dark + low metalness/high roughness)
                    // For now, let's be aggressive and paint almost everything to see visual feedback, 
                    // except likely glass/transparent parts.

                    if (!material.transparent && material.opacity > 0.9) {
                        // Clone the material so we don't affect shared instances if we only wanted to target one
                        // But if they share materials, maybe we SHOULD affect all? 
                        // Let's modify the existing material for now to propagate changes if they share the "BodyPaint" material.
                        material.color.set(newColor);

                        // Apply shine (Reflections)
                        material.roughness = 0.2; // Shiny
                        material.metalness = 0.8; // Metallic

                        // If we have an envMap loaded globally, apply it.
                        // Or simple hack: High metalness + roughness 0.2 gives good "shiny" look even with default lights,
                        // but envMap is better.
                    }
                }
            }
        });
    }

    /**
     * Applies a standard environment map to the model for realistic reflections.
     */
    public applyEnvironmentMap() {
        new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/2294472375_24a3b8ef46_o.jpg', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            this.model.traverse((node) => {
                if ((node as THREE.Mesh).isMesh) {
                    const material = (node as THREE.Mesh).material as THREE.MeshStandardMaterial;
                    if (material && material.isMeshStandardMaterial) {
                        material.envMap = texture;
                        material.envMapIntensity = 1.0;
                        material.needsUpdate = true;
                    }
                }
            });
            console.log("✨ Environment Map Applied");
        });
    }
}
