# Pulso · Deploy Guide

## Archivos del proyecto
```
pulso/
├── index.html       ← Dashboard principal
├── tracker.html     ← App GPS para el chofer
├── sw.js            ← Service Worker (segundo plano)
├── manifest.json    ← PWA config
├── icon-192.png     ← Icono app
├── icon-512.png     ← Icono app grande
└── _redirects       ← Netlify config
```

---

## PASO 1 — GitHub

1. Ir a https://github.com/new
2. Nombre del repo: `pulso-py`
3. Visibilidad: **Public** (necesario para Netlify free)
4. Crear repositorio
5. Subir todos los archivos de esta carpeta

---

## PASO 2 — Netlify

1. Ir a https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. Conectar con GitHub → seleccionar repo `pulso-py`
4. Build settings:
   - Build command: (dejar vacío)
   - Publish directory: `.`
5. **Deploy site**
6. En Site settings → Domain → cambiar a `pulso-py.netlify.app`

---

## PASO 3 — Instalar en el celular como PWA

### Android (Chrome):
1. Abrir `https://pulso-py.netlify.app/tracker.html`
2. Menú (3 puntos) → **Agregar a pantalla de inicio**
3. Confirmar → ícono aparece en el launcher

### iOS (Safari):
1. Abrir `https://pulso-py.netlify.app/tracker.html`
2. Botón compartir (cuadrado con flecha) → **Agregar a pantalla de inicio**
3. Confirmar

---

## PASO 4 — Permisos de batería (IMPORTANTE para 24/7)

### Android:
- Ajustes → Aplicaciones → Chrome → Batería → **Sin restricciones**
- O: Ajustes → Batería → Optimización de batería → Chrome → **No optimizar**

### iOS:
- La ubicación en segundo plano en Safari es limitada
- Recomendado: mantener la pantalla encendida mientras rastrea

---

## Firebase Realtime Database — Reglas de seguridad

En Firebase Console → Realtime Database → Reglas, pegar:

```json
{
  "rules": {
    "posiciones": {
      ".read": true,
      ".write": true
    },
    "historial": {
      ".read": true,
      ".write": true
    },
    "status": {
      ".read": true,
      ".write": true
    }
  }
}
```

(Válido por 30 días en modo prueba, luego configurar autenticación)
