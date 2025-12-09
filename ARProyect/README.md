# WebAR Project

## Problemas Solucionados

1. **Orden de carga de scripts** - A-Frame ahora carga antes que AR.js
2. **HTTPS habilitado** - Requerido para acceso a cámara
3. **AR.js actualizado** - Usando versión compatible
4. **Manejo de errores** - Mejor feedback al usuario

## Instrucciones de Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar en modo desarrollo
```bash
npm run dev
```

### 3. Acceder a la aplicación
- Abre `https://localhost:3000` en tu navegador
- **Importante**: Acepta el certificado SSL autofirmado
- Permite acceso a la cámara cuando se solicite

### 4. Usar la aplicación
- Imprime el marcador Hiro: https://ar-js-org.github.io/AR.js/data/images/hiro.png
- Apunta la cámara al marcador
- El modelo 3D del Nissan 240SX aparecerá sobre el marcador

## Requisitos

- **HTTPS**: La aplicación requiere HTTPS para acceso a cámara
- **Navegador moderno**: Chrome, Firefox, Safari (con soporte WebRTC)
- **Marcador Hiro**: Impreso o en pantalla

## Controles

- **🔄 Rotar**: Rota el modelo 90 grados
- **↺ Reiniciar**: Restaura posición y escala original
- **Pinch**: Pellizca en pantalla táctil para escalar

## Solución de Problemas

1. **"Error de cámara"**: Verifica permisos de cámara en el navegador
2. **"Certificado no válido"**: Acepta el certificado SSL en desarrollo
3. **Modelo no aparece**: Asegúrate de que el marcador esté bien iluminado y visible
