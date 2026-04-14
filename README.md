# PS1 Emulator Web Application

A retro-styled PlayStation 1 emulator web application built with React, Tailwind CSS, and EmulatorJS.

## Features

- 🎮 **Authentic PS1 Aesthetic**: Cool Gray color palette, retro fonts, and physical button designs
- 📺 **4:3 Aspect Ratio**: Strict screen ratio matching the original PlayStation display
- 💾 **BIOS & ROM Loading**: Sequential file selection (BIOS first, then game ROM)
- 🕹️ **EmulatorJS Integration**: WebAssembly-based PlayStation 1 emulation
- ⚡ **Lifecycle Management**: React hook for emulator initialization, pause, resume, and cleanup
- 🎨 **CRT Effects**: Scanlines and screen flicker for authentic retro feel
- 🔌 **Controller Ports**: Visual representation of PS1 controller and memory card ports

## Tech Stack

- **React 18**: UI framework with hooks (useState, useRef, useCallback, useEffect)
- **Tailwind CSS**: Utility-first styling with custom PS1 theme
- **Vite**: Fast build tool and dev server
- **EmulatorJS**: WebAssembly-based emulator loaded from CDN
- **Web APIs**: Blob URLs for local file handling

## Architecture

### Components

- **App.jsx**: Main console layout with power button and status LEDs
- **EmulatorScreen.jsx**: Screen container with 4:3 aspect ratio and file loading UI
- **useEmulator.js**: Custom React hook managing emulator lifecycle

### Emulator Lifecycle (`useEmulator` hook)

1. **Script Loading**: Dynamically loads EmulatorJS from CDN
2. **File Validation**: Validates BIOS (.bin) and ROM (.bin, .cue, .iso, .img, .chd, .pbp)
3. **URL Creation**: Converts local files to blob URLs
4. **Configuration**: Sets up PlayStation 1 core (PCSX-ReARMed)
5. **Initialization**: Loads and starts emulator
6. **Cleanup**: Properly releases resources on unmount

### File Loading Flow

```
Power On → BIOS Selection → ROM Selection → Start Emulator → Game Running
```

## Setup & Running

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd ps1-emulator
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## BIOS Requirements

The emulator requires a PlayStation 1 BIOS file. Supported files:

- `scph5501.bin` (US)
- `scph7001.bin` (US)
- `scph1001.bin` (US)
- `scph5502.bin` (EU)
- `scph7002.bin` (EU)
- `scph1002.bin` (EU)

**Note**: You must dump the BIOS from your own PlayStation console.

## ROM Support

Supported ROM formats:

- `.bin` / `.cue` (Raw disc images)
- `.iso` (ISO 9660 images)
- `.img` (Disk images)
- `.chd` (Compressed Hunks of Data)
- `.pbp` (PlayStation Book Project)

## Project Structure

```
ps1-emulator/
├── public/
│   ├── emulator/
│   │   └── config.json          # Emulator configuration
│   └── vite.svg
├── src/
│   ├── components/
│   │   └── EmulatorScreen.jsx   # Screen & file loading UI
│   ├── hooks/
│   │   └── useEmulator.js       # Emulator lifecycle hook
│   ├── App.jsx                  # Main console layout
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles & CRT effects
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color palette:

```js
colors: {
  'ps1-dark': '#1a1a1e',
  'ps1-gray': '#2d2d35',
  'ps1-light': '#3a3a45',
  'ps1-accent': '#4a4a55',
  'ps1-led-green': '#00ff41',
  'ps1-led-red': '#ff3333',
}
```

### Emulator Settings

Modify `public/emulator/config.json` to adjust emulator behavior:

```json
{
  "settings": {
    "autoSave": true,
    "pauseOnBlur": true,
    "volume": 1.0
  }
}
```

## Known Limitations

- EmulatorJS is loaded from CDN (requires internet connection)
- Save states are stored in browser localStorage
- Performance depends on device capabilities
- Some PS1 games may have compatibility issues

## License

This project is for educational purposes only. PlayStation is a trademark of Sony Interactive Entertainment.
