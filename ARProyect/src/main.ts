import { initAR } from './ar/arScene';
import { setupUIControls } from './ui/uiController';

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
