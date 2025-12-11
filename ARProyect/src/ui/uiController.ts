export function setupUIControls() {
    try {
        const model = document.getElementById('model-container');
        if (!model) {
            console.error('Model container not found');
            return;
        }
        // Model selector: attach handler if element exists
        const modelSelect = document.getElementById('model-select') as HTMLSelectElement | null;
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                const path = (e.target as HTMLSelectElement).value;
                safeChangeModel(path);
                if ((window as any).audioManager) (window as any).audioManager.playClick();
            });
        }
        // Setup Color Picker
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = (e.target as HTMLElement).getAttribute('data-color');
                console.log('🎨 Color button clicked:', color);

                if (color) {
                    if (window.carManager) {
                        window.carManager.setCarColor(color);
                        // Play click sound if audio is ready
                        if ((window as any).audioManager) (window as any).audioManager.playClick();
                    } else {
                        console.error('❌ CarManager not initialized yet');
                    }
                }
            });
        });

        // Control buttons
        const rotateBtn = document.getElementById('rotate-btn');
        const resetBtn = document.getElementById('reset-btn');
        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');

        // Botón: Info
        if (infoBtn && infoPanel) {
            infoBtn.addEventListener('click', () => {
                const isVisible = infoPanel.style.display !== 'none';
                infoPanel.style.display = isVisible ? 'none' : 'block';
                if ((window as any).audioManager) (window as any).audioManager.playClick();
            });
        }

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
                const model = document.getElementById('model');
                if (model) {
                    model.setAttribute('scale', '20 20 20');
                    model.setAttribute('rotation', '0 0 0');
                }
                if (window.carManager) {
                    window.carManager.resetPosition();
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

/**
 * Cambia el modelo GLB del elemento `#model` de forma segura.
 * Mantiene visibles las demás interacciones (color/reset/rotar).
 */
function safeChangeModel(modelPath: string) {
    const modelElement = document.getElementById('model');
    if (!modelElement) {
        console.error('Model element not found');
        return;
    }

    // Hide while loading
    modelElement.setAttribute('visible', 'false');

    // Update status UI if present
    const status = document.getElementById('status');
    if (status) status.textContent = 'Cargando modelo...';

    // Ensure we encode URI parts (handles spaces)
    const safeUrl = encodeURI(modelPath);
    modelElement.setAttribute('gltf-model', `url(${safeUrl})`);

    // Add a one-time listener for model-loaded
    const onModelLoaded = () => {
        try {
            // Make visible
            modelElement.setAttribute('visible', 'true');

            // Reset transforms to a sensible default so reset button and carManager work
            modelElement.setAttribute('scale', '20 20 20');
            modelElement.setAttribute('rotation', '0 0 0');

            if (status) {
                status.textContent = 'Modelo cargado ✓';
                setTimeout(() => { if (status) status.textContent = 'Listo'; }, 1200);
            }

            // If a carManager exists, reset its position / rebind if needed
            if ((window as any).carManager) {
                try { (window as any).carManager.resetPosition(); } catch (e) { /* ignore */ }
            }
        } finally {
            modelElement.removeEventListener('model-loaded', onModelLoaded as EventListener);
        }
    };

    modelElement.addEventListener('model-loaded', onModelLoaded as EventListener);

    // Fallback: if A-Frame doesn't fire quickly, poll object3D
    const start = Date.now();
    const poll = () => {
        const obj = (modelElement as any).object3D;
        if (obj && obj.children && obj.children.length > 0) {
            // call handler manually
            onModelLoaded();
        } else if (Date.now() - start < 8000) { // timeout 8s
            setTimeout(poll, 150);
        } else {
            if (status) status.textContent = 'Error cargando modelo';
            console.error('Timeout cargando modelo:', modelPath);
        }
    };
    setTimeout(poll, 300);
}
