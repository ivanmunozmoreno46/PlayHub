# 🔧 Diagnóstico: Pantalla negra al cargar juego

## Causas más probables

### 1. ⚠️ El juego tarda en arrancar (lo más común)
Los juegos de PS1 pueden tardar **30-60 segundos** en cargar, especialmente:
- La BIOS muestra el logo de PlayStation
- Luego pantalla negra mientras carga el juego
- **Esto es NORMAL**, no es un error

### 2. 📁 Archivo .cue mal formado
Si tu juego tiene archivos `.bin` + `.cue`:
- El archivo `.cue` debe apuntar correctamente al `.bin`
- Si las rutas no coinciden, el emulador no encuentra el disco

### 3. 🔒 CORS / Blob URLs
EmulatorJS tiene problemas leyendo archivos locales grandes vía blob URLs.

---

## ✅ Soluciones

### Solución A: Esperar más tiempo
1. Carga BIOS + ROM
2. Click en START
3. **Espera al menos 60 segundos**
4. Deberías ver el logo de PlayStation (BIOS boot)

### Solución B: Abrir la consola del navegador
1. Presiona **F12** en el navegador
2. Ve a la pestaña **Console**
3. Busca mensajes que empiecen con `[EmulatorJS]` o `[Emulator]`

**Lo que deberías ver si funciona:**
```
[Emulator] Loading EmulatorJS script...
[EmulatorJS] Script loaded successfully
[Emulator] BIOS: scph5501.bin → blob:...
[Emulator] ROM: game.cue → blob:...
[Emulator] Starting EmulatorJS...
[EmulatorJS] ✓ Emulator loaded
[EmulatorJS] ✓ Game started!
```

**Si ves errores, compártelos.**

### Solución C: Verificar archivos del juego

#### Estructura correcta de archivos PS1:
```
Carpeta del juego/
├── game.cue     ← Hoja de índice (debe existir)
└── game.bin     ← Imagen del disco
```

#### Contenido del archivo .cue:
Abre el `.cue` con un editor de texto. Debe verse así:
```
FILE "game.bin" BINARY
  TRACK 01 MODE2/2352
    INDEX 01 00:00:00
```

**Si dice otro nombre de archivo**, renombra tu `.bin` para que coincida.

### Solución D: Probar con un solo archivo .iso
Si tienes problemas con `.cue` + `.bin`:
1. Convierte a `.iso` usando herramientas como:
   - **bchunk** (Linux/Mac): `bchunk image.bin image.cue output.iso`
   - **PowerISO** (Windows)
2. Carga solo el archivo `.iso`

---

## 🔍 Debug paso a paso

### Paso 1: Verificar BIOS
```
¿Tu archivo BIOS funciona?
→ Deberías ver el logo de PlayStation al iniciar
→ Si no ves nada, la BIOS no es válida
```

### Paso 2: Verificar ROM
```
¿El archivo ROM es válido?
→ Tamaño mínimo: ~200 MB
→ Extensiones: .bin, .cue, .iso, .chd
→ Si es < 50 MB, probablemente está corrupto
```

### Paso 3: Verificar consola del navegador
```
F12 → Console → Buscar errores en rojo
→ Si ves "Failed to load", hay problema de CORS
→ Si ves "Game started", funciona correctamente
```

---

## 💡 Truco: Forzar modo verbose

Abre la consola del navegador (F12) y ejecuta:
```javascript
window.EJS_verbose = true;
```

Esto activa logging detallado de EmulatorJS.

---

## 🆘 Si sigue sin funcionar

### Recopila esta información:
1. **Consola del navegador** (F12 → Console)
   - Copia y pega TODOS los mensajes
   
2. **Archivos que estás usando:**
   - BIOS: ¿nombre exacto del archivo?
   - ROM: ¿qué extensiones tiene? (.cue, .bin, .iso?)
   - Tamaño de cada archivo

3. **Navegador:**
   - ¿Chrome, Firefox, Edge?
   - ¿Versión?

4. **¿Qué ves exactamente?**
   - ¿Pantalla completamente negra?
   - ¿Logo de PlayStation y luego negro?
   - ¿Mensaje de error?

---

## 🎯 Solución definitiva recomendada

Si nada funciona, prueba este enfoque alternativo:

### Usar EmulatorJS directamente:
1. Ve a: https://emulatorjs.org/
2. Sube tu BIOS y ROM allí
3. Si funciona allí pero no en la app, es un problema de integración
4. Si tampoco funciona allí, el problema son los archivos
