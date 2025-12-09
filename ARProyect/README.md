# 🚗 AR Car Tuner & Configurator

A WebAR experience that allows users to visualize, customize, and drive a Nissan 240SX using Augmented Reality and Computer Vision.

![AR Concept](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)

## ✨ Características

### 1. 🎨 Personalización (Tuning)
-   **Cambio de Color en Tiempo Real:** Interfaz flotante para pintar la carrocería.
-   **Materiales PBR:** Pintura metálica con reflejos realistas (HDR).

### 2. 🕹️ Conducción Híbrida
-   **Joystick Virtual:** Control táctil en pantalla para acelerar y girar.
-   **Física Arcade:** Sistema de velocidad, aceleración y fricción adaptado a escala de mesa.

### 3. 🖐️ Control por Gestos (IA)
Usa tu mano frente a la cámara para conducir sin tocar la pantalla:
-   **Mano Abierta 🖐️:** Acelerar (Adelante).
-   **Puño Cerrado ✊:** Frenar/Parar.
-   **Amor y Paz (✌️):** Reversa.
-   **Posición Lateral:** Mueve tu mano a la izquierda/derecha de la pantalla para girar el volante.
-   *Powered by Google MediaPipe Hands.*

### 4. 🔊 Audio Procedural
-   **Motor Sintetizado:** El sonido del motor se genera en tiempo real (Web Audio API) y cambia de tono según las RPM/Velocidad.
-   **Efectos UI:** Feedback sonoro al interactuar.

## 🛠️ Tecnologías

-   **A-Frame & Three.js:** Renderizado 3D.
-   **AR.js:** Tracking de marcadores (Hiro).
-   **MediaPipe Hands:** Visión Artificial para detección de gestos.
-   **TypeScript:** Lógica de negocio tipada y segura.
-   **Vite:** Entorno de desarrollo rápido.

## 🚀 Instalación y Uso

### Prerrequisitos
-   Node.js instalado.
-   Un dispositivo con cámara (Móvil o Laptop).
-   El marcador **Hiro** impreso o visible en otra pantalla. [Descargar Marcador](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)

### Pasos
1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```

3.  **Abrir en el navegador:**
    -   Visita `https://localhost:3000` (o la IP local mostrada).
    -   **Nota:** Debes aceptar los permisos de cámara y el certificado SSL (si es local).

4.  **¡A disfrutar!**
    -   Apunta al marcador Hiro.
    -   Espera a que cargue el modelo y la IA ("🖐️ IA de Manos Activada").
    -   Toca la pantalla una vez para activar el sonido.

## ⚠️ Notas Importantes
-   **Rendimiento:** El uso simultáneo de AR y Detección de Manos es intensivo. Se recomienda un móvil de gama media-alta o PC.
-   **Audio:** Los navegadores bloquean el audio automático. Es necesario hacer clic/tap al menos una vez para escuchar el motor.
