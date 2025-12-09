# Informe de Proyecto - Computación Visual

**Proyecto:** AR Car Tuner & Configurator  
**Curso:** Computación Visual  
**Fecha:** 9 de Diciembre, 2025  

---

## 0. Equipo de Trabajo

**Integrantes:**

- Breyner Ismael Ciro Otero
- [Nombre del Estudiante 2]
- [Nombre del Estudiante 3]
- [Nombre del Estudiante 4]

---

## 1. Definición del Proyecto

**Nombre:** AR Car Tuner & Configurator

**Descripción:**
Una aplicación web de Realidad Aumentada (WebAR) avanzada que permite a los usuarios no solo visualizar un modelo 3D de alta fidelidad (Nissan 240SX), sino interactuar profundamente con él mediante tecnologías de visión artificial y síntesis de audio.

**Alcance Implementado:**
El proyecto final incluye las siguientes funcionalidades clave:

1. **Visualización Realista:** Renderizado PBR con mapas de entorno HDR (High Dynamic Range) para reflejos realistas en la carrocería.
2. **Sistema de Tuning:** Personalización en tiempo real del color de la carrocería mediante una interfaz de usuario integrada.
3. **Conducción Híbrida:**

    **Joystick Virtual:** Control táctil en pantalla para aceleración y dirección.

    *   **Control por Gestos (Visión Artificial):** Integración de MediaPipe Hands para conducir el coche usando la mano frente a la cámara (Mano abierta para acelerar, Puño para frenar, Signo de Paz para reversa).
4. **Audio Sintetizado:** Motor de audio procedural que genera el sonido del motor y efectos de interfaz en tiempo real, sin depender de archivos de audio externos.

---

## 2. Justificación

**Importancia Académica:**
Este proyecto demuestra el dominio de múltiples disciplinas de la computación visual:

- **Computación Gráfica:** Manejo de grafos de escena (Scene Graphs), materiales PBR, y técnicas de iluminación basada en imágenes (IBL/HDR).
- **Transformaciones Geométricas:** Implementación de física básica (velocidad, aceleración, fricción) y cálculos de vectores para el movimiento del vehículo en el espacio 3D.
- **Visión por Computadora:** Uso de algoritmos de SLAM (vía AR.js) para el tracking de marcadores y Redes Neuronales (vía MediaPipe) para la detección de manos en tiempo real.

**Impacto y Aplicación:**
La solución desarrollada es un prototipo funcional de un "Configurador de Producto", una herramienta esencial en la industria 4.0 y el marketing digital, permitiendo experiencias inmersivas sin necesidad de instalar aplicaciones nativas.

---

## 3. Cronograma de Desarrollo

El desarrollo se estructuró para cubrir los hitos fundamentales en 13 semanas, culminando en la implementación de características avanzadas de IA.

| Fase | Actividades Principales | Estado |
|------|-------------------------|--------|
| **Fase 1** | Configuración del entorno, carga de modelo GLB, corrección de escala y problemas HTTPS. | ✅ Completado |
| **Fase 2** | Implementación del sistema de Tuning (Selector de Color) y manipulación de mallas. | ✅ Completado |
| **Fase 3** | Desarrollo de físicas de conducción y Joystick Virtual. | ✅ Completado |
| **Fase 4** | Integración de MediaPipe Hands para control por gestos y sistema de Audio Procedural. | ✅ Completado |

---

## 4. Referencias y Tecnologías

- **A-Frame & Three.js:** Motores gráficos para el renderizado web.
- **AR.js:** Librería ligera para tracking de marcadores en WebAR.
- **MediaPipe Hands (Google):** Solución de ML para tracking de manos de alta fidelidad.
- **Web Audio API:** Para la síntesis de sonido en tiempo real.
- **Modelo 3D:** Nissan 240SX (Optimizado para web).

---

## Entregables

1. **Repositorio:** [[URL del Repositorio](https://github.com/Diego-Rodriguez16/visual-computing-project.git)]
2. **Demo en vivo:** [URL si aplica]
