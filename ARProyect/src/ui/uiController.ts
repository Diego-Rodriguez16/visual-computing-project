export function setupUIControls() {
    try {
        const model = document.getElementById('model-container');
        if (!model) {
            console.error('Model container not found');
            return;
        }

        // Setup Model Selector
        const modelSelect = document.getElementById('model-select') as HTMLSelectElement;
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                const modelPath = (e.target as HTMLSelectElement).value;
                changeModel(modelPath);
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
 * Cambia el modelo 3D que se muestra
 * @param modelPath Ruta al archivo del modelo GLB
 */
function changeModel(modelPath: string) {
    const modelElement = document.getElementById('model');
    if (!modelElement) {
        console.error('Model element not found');
        return;
    }

    console.log('🚗 Cambiando modelo a:', modelPath);

    // Mostrar indicador de carga
    const status = document.getElementById('status');
    if (status) {
        status.textContent = 'Cargando modelo...';
    }

    // Cambiar el atributo gltf-model
    modelElement.setAttribute('gltf-model', `url(${modelPath})`);

    // Esperar a que el modelo cargue
    const checkModelLoaded = () => {
        const object3D = (modelElement as any).object3D;
        if (object3D && object3D.children && object3D.children.length > 0) {
            // Modelo cargado exitosamente
            modelElement.setAttribute('visible', 'true');
            if (status) {
                status.textContent = 'Modelo cargado ✓';
                setTimeout(() => {
                    status.textContent = 'Listo';
                }, 1500);
            }

            // Reinicializar CarManager con el nuevo modelo
            if (window.carManager) {
                window.carManager.resetPosition();
            }
            console.log('✓ Modelo cargado exitosamente');
        } else {
            // Reintentar en 100ms
            setTimeout(checkModelLoaded, 100);
        }
    };

    // Usar event listener como fallback
    modelElement.addEventListener('model-loaded', () => {
        console.log('✓ Evento model-loaded disparado');
        if (status) {
            status.textContent = 'Modelo cargado ✓';
            setTimeout(() => {
                status.textContent = 'Listo';
            }, 1500);
        }
        if (window.carManager) {
            window.carManager.resetPosition();
        }
    }, { once: true });

    // Comprobar manualmente después de 500ms
    setTimeout(checkModelLoaded, 500);
}
