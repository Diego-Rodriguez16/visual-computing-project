export function setupUIControls() {
    try {
        const model = document.getElementById('model-container');
        if (!model) {
            console.error('Model container not found');
            return;
        }
        const rotateBtn = document.getElementById('rotate-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        // Botón: Rotar
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                if (model && (model as any).getAttribute) {
                    const rotation = (model as any).getAttribute('rotation') || { x: 0, y: 0, z: 0 };
                    (model as any).setAttribute('rotation', {
                        x: rotation.x,
                        y: rotation.y + 90,
                        z: rotation.z
                    });
                }
            });
        }
        
        // Botón: Reiniciar
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (model && (model as any).setAttribute) {
                    (model as any).setAttribute('rotation', { x: 0, y: 0, z: 0 });
                    (model as any).setAttribute('scale', { x: 1, y: 1, z: 1 });
                }
            });
        }
        
        // Gestos táctiles: Pinch para zoom
        let initialDistance = 0;
        let isGesturing = false;
        let lastUpdate = 0;
        const DISTANCE_SCALE_FACTOR = 200;
        const MIN_SCALE = 0.1;
        const MAX_SCALE = 2;
        const THROTTLE_MS = 16; // ~60fps
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                isGesturing = true;
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isGesturing && e.touches.length === 2 && model && initialDistance > 0) {
                const now = Date.now();
                if (now - lastUpdate < THROTTLE_MS) return;
                
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                const distance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                
                const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, distance / DISTANCE_SCALE_FACTOR));
                if ((model as any).setAttribute) {
                    (model as any).setAttribute('scale', { x: scale, y: scale, z: scale });
                }
                lastUpdate = now;
            }
        });
        
        document.addEventListener('touchend', () => {
            isGesturing = false;
            initialDistance = 0;
        });
        
    } catch (error) {
        console.error('❌ Error configurando controles UI:', error);
    }
}
