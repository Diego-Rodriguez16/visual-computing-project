import { CarManager } from './carManager';

// Expose carManager globally for UI access (temporary pattern)
declare global {
    interface Window {
        carManager: CarManager | null;
    }
}

export function initAR() {
    try {
        const scene = document.querySelector('a-scene') as any;

        if (!scene) {
            throw new Error('Escena AR no encontrada');
        }

        // Esperar a que AR.js esté listo
        scene.addEventListener('loaded', () => {
            try {
                console.log('✅ Escena AR cargada');

                const model = document.getElementById('model') as any;
                const fallbackModel = document.getElementById('fallback-model') as any;
                const modelContainer = document.getElementById('model-container') as any;
                const marker = document.getElementById('marker') as any;
                const status = document.getElementById('status');

                if (!marker) {
                    console.error('❌ Marcador no encontrado');
                    if (status) status.textContent = '❌ Error: Marcador no encontrado';
                    return;
                }

                if (!model || !modelContainer) {
                    console.error('❌ Elementos del modelo no encontrados');
                    if (status) status.textContent = '❌ Error: Modelo no encontrado';
                    return;
                }

                let modelLoaded = false;
                const loadingProgress = document.getElementById('loading-progress');
                const progressFill = document.querySelector('.progress-fill') as HTMLElement;
                const progressText = document.querySelector('.progress-text') as HTMLElement;

                // Mostrar indicador de carga
                if (loadingProgress) {
                    loadingProgress.style.display = 'block';
                    if (progressText) progressText.textContent = 'Cargando modelo 3D (12MB)...';
                }

                // Simular progreso de carga
                let progress = 0;
                const progressInterval = setInterval(() => {
                    if (progress < 90 && !modelLoaded) {
                        progress += Math.random() * 10;
                        if (progressFill) progressFill.style.width = progress + '%';
                    }
                }, 200);

                // Manejar carga del modelo GLB
                if (model) {
                    model.addEventListener('model-loaded', () => {
                        console.log('✅ Modelo 3D cargado');
                        modelLoaded = true;
                        clearInterval(progressInterval);

                        if (progressFill) progressFill.style.width = '100%';
                        if (progressText) progressText.textContent = '✅ Modelo cargado!';

                        // Initialize Car Manager
                        const mesh = model.getObject3D('mesh');
                        if (mesh) {
                            window.carManager = new CarManager(mesh);
                        } else {
                            console.error("❌ Could not get THREE.Object3D from A-Frame entity");
                        }

                        setTimeout(() => {
                            if (loadingProgress) loadingProgress.style.display = 'none';
                            model.setAttribute('visible', 'true');
                            if (fallbackModel) fallbackModel.setAttribute('visible', 'false');
                            if (status) status.textContent = '✅ Modelo 3D listo - Busca el marcador';
                        }, 1000);
                    });

                    model.addEventListener('model-error', (event: any) => {
                        console.error('❌ Error cargando modelo GLB:', event.detail);
                        console.log('🔄 Usando modelo de respaldo');
                        modelLoaded = true;
                        clearInterval(progressInterval);

                        if (loadingProgress) loadingProgress.style.display = 'none';
                        if (status) status.textContent = '⚠️ Usando modelo simple - Busca el marcador';
                    });

                    // Timeout para modelo GLB (15 segundos)
                    setTimeout(() => {
                        if (!modelLoaded) {
                            console.log('⏰ Timeout del modelo GLB, usando respaldo');
                            modelLoaded = true;
                            clearInterval(progressInterval);

                            if (loadingProgress) loadingProgress.style.display = 'none';
                            if (status) status.textContent = '⚠️ Modelo simple activo - Busca el marcador';
                        }
                    }, 15000);
                }

                marker.addEventListener('markerFound', () => {
                    console.log('🎯 Marcador detectado!');
                    if (status) status.textContent = '✅ Marcador detectado';
                    if (modelContainer) {
                        modelContainer.setAttribute('visible', 'true');
                        console.log('👁️ Mostrando modelo...');
                    }
                    // Forzar visibilidad del modelo si está cargado
                    if (modelLoaded && model) {
                        model.setAttribute('visible', 'true');
                        console.log('🚗 Modelo del carro visible');
                    }
                });

                marker.addEventListener('markerLost', () => {
                    console.log('❌ Marcador perdido');
                    if (status) status.textContent = '❌ Buscando marcador...';
                    if (modelContainer) modelContainer.setAttribute('visible', 'false');
                });

                // Animación suave con requestAnimationFrame
                let lastTime = performance.now();

                function animate() {
                    const now = performance.now();
                    const dt = (now - lastTime) / 1000; // Delta in seconds
                    lastTime = now;

                    if (window.carManager) {
                        // Import dynamically or assume global for now if strict import fails circular
                        // Ideally pass simple input object
                        let input = { x: 0, y: 0 };

                        // Access joystick via global for now to avoid circular dependency since main imports arScene
                        // A better way is to pass an input provider, but let's stick to window hack for speed or 
                        // check if we can get it from the DOM/Global object we set up?
                        // Actually, let's just make main.ts export a getter or put joystick on window too.

                        if ((window as any).joystick) {
                            input.x = (window as any).joystick.deltaX;
                            input.y = (window as any).joystick.deltaY;
                        }

                        if ((window as any).gestureController) {
                            // Add gesture input (clamped sum)
                            input.x += (window as any).gestureController.deltaX;
                            input.y += (window as any).gestureController.deltaY;

                            // Clamp again
                            input.x = Math.max(-1, Math.min(1, input.x));
                            input.y = Math.max(-1, Math.min(1, input.y));
                        }

                        if ((window as any).handTracker && (window as any).handTracker.isHandDetected) {
                            const tracker = (window as any).handTracker;
                            // Steering
                            input.x += tracker.steering;

                            // Throttle Mapping
                            // HandTracker: 1 (Fwd), 0 (Stop), -0.5 (Rev)
                            // Car Input Y: -1 (Fwd), 0 (Stop), 1 (Rev)

                            if (tracker.throttle > 0.1) {
                                input.y = -1; // Full Speed Forward
                            } else if (tracker.throttle < -0.1) {
                                input.y = 1; // Reverse
                            } else {
                                // Coast/Stop if 0
                                // If Joystick is NOT being used, we should set to 0 to stop.
                                // If Joystick IS being used, we essentially override it if hand is detected as Fist?
                                // Let's just set to 0 if hand is explicitly 0 (Fist).
                                input.y = 0;
                            }
                        }

                        // Final clamp
                        input.x = Math.max(-1, Math.min(1, input.x));
                        input.y = Math.max(-1, Math.min(1, input.y));

                        window.carManager.update(dt, input);
                    }

                    requestAnimationFrame(animate);
                }
                animate();
            } catch (error) {
                console.error('❌ Error en evento loaded:', error);
                const status = document.getElementById('status');
                if (status) status.textContent = '❌ Error inicializando AR';
            }
        });

        // Manejar errores de AR
        scene.addEventListener('arError', (event: any) => {
            console.error('❌ Error AR:', event.detail);
            const status = document.getElementById('status');
            if (status) status.textContent = '❌ Error de cámara - Permite acceso';
        });

    } catch (error) {
        console.error('❌ Error inicializando AR:', error);
        const status = document.getElementById('status');
        if (status) status.textContent = '❌ Error de inicialización';
    }
}
