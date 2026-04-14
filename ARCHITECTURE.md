# PS1 Emulator - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PS1 Emulator Web App                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  App Component                         │  │
│  │  - Power button state management                       │  │
│  │  - Console layout (PS1 styling)                        │  │
│  │  - LED indicators                                      │  │
│  │  - Controller ports visualization                      │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              EmulatorScreen Component                  │  │
│  │  - 4:3 aspect ratio container                          │  │
│  │  - File selection UI (BIOS → ROM)                      │  │
│  │  - Step-by-step loading workflow                       │  │
│  │  - CRT scanlines effects                               │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              useEmulator Hook                          │  │
│  │  - EmulatorJS script loading                           │  │
│  │  - File validation & blob URL creation                 │  │
│  │  - Emulator lifecycle (init/stop/pause/resume)        │  │
│  │  - Progress tracking & error handling                  │  │
│  │  - Resource cleanup on unmount                         │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              EmulatorJS (CDN)                          │  │
│  │  - WebAssembly PlayStation 1 core                      │  │
│  │  - PCSX-ReARMed emulator                               │  │
│  │  - Canvas rendering                                    │  │
│  │  - Audio output                                        │  │
│  │  - Input handling                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Console Container
│   ├── Header (Logo + LEDs)
│   ├── Screen Container (4:3 aspect ratio)
│   │   ├── [Power Off] → Static "POWER OFF" screen
│   │   └── [Power On] → EmulatorScreen
│   │       ├── BIOS Selection Screen
│   │       ├── ROM Selection Screen
│   │       ├── Ready Screen (start button)
│   │       ├── Loading Screen (progress bar)
│   │       ├── Emulator Canvas (game running)
│   │       └── Error Screen (retry option)
│   ├── Controls (Power button + Status)
│   └── Controller Ports (Port 1, Port 2, Memory)
```

## Data Flow

### File Loading Sequence

```
1. User clicks POWER button
   ↓
2. App sets isPoweredOn = true
   ↓
3. EmulatorScreen mounts
   ↓
4. User selects BIOS file
   ↓
5. File validation (.bin/.rom)
   ↓
6. setBiosFile(file) → step = 'rom'
   ↓
7. User selects ROM file
   ↓
8. File validation (.bin/.cue/.iso/.img/.chd/.pbp)
   ↓
9. setRomFile(file) → step = 'ready'
   ↓
10. User clicks START EMULATOR
    ↓
11. initializeEmulator(biosFile, romFile)
    ↓
12. useEmulator hook:
    a. Load EmulatorJS script from CDN
    b. Create blob URLs for files
    c. Configure emulator settings
    d. Inject canvas into container
    e. Start emulator
    ↓
13. Emulator running in 4:3 container
```

## useEmulator Hook API

### State Shape

```javascript
{
  isLoaded: boolean,      // Emulator fully loaded
  isRunning: boolean,     // Emulator actively running
  isLoading: boolean,     // Loading in progress
  error: string | null,   // Error message if any
  biosFile: string | null, // BIOS filename
  romFile: string | null,  // ROM filename
  progress: number         // 0-100 loading progress
}
```

### Methods

```javascript
initializeEmulator(biosFile, romFile)
  - Validates container availability
  - Loads EmulatorJS script dynamically
  - Creates blob URLs from File objects
  - Configures PlayStation 1 core
  - Initializes and starts emulator
  - Returns: Promise<void>

stopEmulator()
  - Revokes blob URLs
  - Clears canvas container
  - Resets EmulatorJS globals
  - Resets state to initial
  - Returns: void

pauseEmulator()
  - Calls EJS_pause()
  - Updates isRunning state
  - Returns: void

resumeEmulator()
  - Calls EJS_resume()
  - Updates isRunning state
  - Returns: void

takeScreenshot()
  - Calls EJS_screenshot()
  - Returns: DataURL | null
```

## EmulatorJS Integration

### Configuration

```javascript
window.EJS_player = '#emulator-canvas'
window.EJS_core = 'psx'                    // PlayStation 1 core
window.EJS_biosUrl = blobUrl               // BIOS file URL
window.EJS_gameUrl = blobUrl               // ROM file URL
window.EJS_pathtodata = 'cdn path'         // EmulatorJS data path
window.EJS_advertise = false               // No ads
window.EJS_startOnLoaded = true            // Auto-start
window.EJS_disableDatabases = true         // Disable game DB
```

### Lifecycle Events

```
1. Script loaded → window.EJS_load exists
2. Configuration set → EJS_* globals
3. Emulator loads → Progress updates
4. Canvas injected → DOM manipulation
5. Game starts → User interaction enabled
6. Cleanup → URL.revokeObjectURL + DOM cleanup
```

## Aspect Ratio Management

### 4:3 Container

```jsx
<div style={{ aspectRatio: '4/3' }}>
  <div className="absolute inset-0">
    {/* Emulator canvas fills container */}
  </div>
</div>
```

**Key Properties:**
- `aspectRatio: '4/3'` - Strict ratio enforcement
- `maxWidth: '800px'` - Maximum width constraint
- `position: relative` - Container for absolute canvas
- `overflow: hidden` - Prevents content bleeding

## File Validation

### BIOS Files
```javascript
const validBiosNames = [
  'scph5501.bin', 'scph7001.bin', 'scph1001.bin',  // US
  'scph5502.bin', 'scph7002.bin', 'scph1002.bin',  // EU
  'scph5500.bin', 'scph7000.bin', 'scph1000.bin',  // JP
]

Validation: filename in list OR ends with .bin/.rom
```

### ROM Files
```javascript
Supported extensions:
  .bin  - Raw disc image
  .cue  - Cue sheet (with .bin)
  .iso  - ISO 9660 image
  .img  - Disk image
  .chd  - Compressed Hunks of Data
  .pbp  - PlayStation Book Project

Validation: filename ends with supported extension
```

## Error Handling

### Script Loading
```javascript
try {
  await loadEmulatorScript()
} catch (error) {
  setError('Failed to load EmulatorJS from CDN')
}
```

### File URL Creation
```javascript
const biosUrl = fileToUrl(biosFile)
if (!biosUrl) {
  throw new Error('Failed to create file URLs')
}
```

### Emulator Initialization
```javascript
try {
  await window.EJS_load()
} catch (error) {
  setError(error.message || 'Failed to initialize emulator')
  isInitializedRef.current = false
}
```

## Cleanup Strategy

### On Unmount
```javascript
useEffect(() => {
  return () => {
    stopEmulator()                    // Cleanup emulator
    // Remove script tag
    if (scriptLoaderRef.current) {
      scriptLoaderRef.current.remove()
    }
  }
}, [stopEmulator])
```

### Resource Release
```javascript
URL.revokeObjectURL(biosUrl)         // Free BIOS blob
URL.revokeObjectURL(romUrl)          // Free ROM blob
canvasContainer.innerHTML = ''        // Clear canvas
canvasContainer.remove()              // Remove from DOM
delete window.EJS_*                   // Clean globals
```

## Performance Considerations

### Memory Management
- Blob URLs revoked immediately on stop
- Canvas container completely removed
- EmulatorJS globals cleaned up
- Script loader removed from DOM

### Rendering Optimization
- useCallback for event handlers
- useRef for DOM references (no re-renders)
- Minimal state updates
- Conditional rendering based on state

### Loading Strategy
- Script loaded on-demand (not on mount)
- Progress updates at key milestones
- Async/await for clear flow control
- Prevents multiple initializations

## Browser Compatibility

### Required APIs
- **Blob URLs**: `URL.createObjectURL`, `URL.revokeObjectURL`
- **Dynamic Scripts**: `document.createElement('script')`
- **Canvas**: For emulator rendering
- **WebAssembly**: For emulator core

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

### Local File Processing
- Files processed entirely in browser
- No server uploads
- Blob URLs scoped to page lifecycle
- User-initiated file selection only

### CDN Loading
- EmulatorJS from trusted CDN
- Script integrity checks
- Error handling for failed loads
- No execution without user action

---

**Last Updated**: April 2026
**Version**: 1.0.0
