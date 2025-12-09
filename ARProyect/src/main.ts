import { initAR } from './ar/arScene';
import { setupUIControls } from './ui/uiController';
import { VirtualJoystick } from './ui/joystick';
import { GestureController } from './ui/gestureController';
import { HandTracker } from './ai/handTracker';
import { AudioManager } from './ui/audioManager';

// Global instances
export let joystick: VirtualJoystick | null = null;
export let gestureController: GestureController | null = null;
export let handTracker: HandTracker | null = null;
export let audioManager: AudioManager | null = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando AR...');

    try {
        // Verificar soporte de cámara
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Cámara no soportada en este navegador');
        }

        // Inicializar AR
        initAR();

        // Configurar controles UI
        setupUIControls();

        // Initialize Joystick
        try {
            const joystick = new VirtualJoystick('joystick-container');
            (window as any).joystick = joystick;
            console.log('🎮 Joystick initialized');

            const gestures = new GestureController();
            (window as any).gestureController = gestures;
            console.log('👆 Gestures initialized');

            const tracker = new HandTracker();
            (window as any).handTracker = tracker;

            setTimeout(() => {
                tracker.start();
                console.log('🖐️ Hand Tracker started');
                const status = document.getElementById('status');
                if (status) status.textContent = '🖐️ IA de Manos Activada - Levanta tu mano';
            }, 3000);

            // Audio Init
            const audio = new AudioManager();
            (window as any).audioManager = audio;

            // Unlock audio on first interaction
            const unlockAudio = () => {
                audio.init().then(() => {
                    audio.startEngine();
                    audio.playClick();
                });
                document.body.removeEventListener('click', unlockAudio);
                document.body.removeEventListener('touchstart', unlockAudio);
            };
            document.body.addEventListener('click', unlockAudio);
            document.body.addEventListener('touchstart', unlockAudio);

        } catch (e) {
            console.warn('Controls init failed:', e);
        }

        // Mostrar status inicial
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = '📷 Iniciando cámara...';
        }

    } catch (error) {
        console.error('❌ Error de inicialización:', error);
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = '❌ Error: ' + (error as Error).message;
        }
    }
});
