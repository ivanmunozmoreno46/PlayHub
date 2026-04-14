# Gamepad & Keyboard Support Documentation

## Overview

The PS1 Emulator now includes full input support through:
1. **Web Gamepad API** - USB and Bluetooth gamepad detection
2. **Keyboard Fallback** - Full keyboard mapping as backup

## 🎮 Web Gamepad API

### Connection Detection

The application automatically detects gamepads when they connect via:
- **USB** - Wired connection
- **Bluetooth** - Wireless connection

```javascript
// Automatic event listeners
window.addEventListener('gamepadconnected', handler)
window.addEventListener('gamepaddisconnected', handler)
```

### Connection Status Indicator

A visual indicator in the top-right corner shows gamepad status:

**Disconnected State:**
- Gray gamepad icon
- "NO PAD" label
- Gray dot indicator

**Connected State:**
- Green gamepad icon with glow effect
- "PAD" label
- Green blinking LED
- Hover tooltip shows gamepad name

### PS1 Button Mapping

Standard Gamepad API buttons mapped to PS1 controls:

```
PS1 Controller Layout:
     L1                    R1
   ┌────┐              ┌────┐
   │    │              │    │
L2 │    │              │    │ R2
   └────┘              └────┘

     △ TRIANGLE (Y)
   ◇           ○ CIRCLE (B)
      SQUARE (X)   × CROSS (A)

   ← D-Pad →    SELECT (8)  START (9)
     ↓
```

**Button Index Mapping:**
| PS1 Button | Gamepad Index | Standard Name |
|------------|---------------|---------------|
| CROSS (×)  | 0             | A Button      |
| CIRCLE (○) | 1             | B Button      |
| SQUARE (□) | 2             | X Button      |
| TRIANGLE (△)| 3            | Y Button      |
| L1         | 4             | Left Bumper   |
| R1         | 5             | Right Bumper  |
| L2         | 6             | Left Trigger  |
| R2         | 7             | Right Trigger |
| SELECT     | 8             | Back          |
| START      | 9             | Start         |
| L3         | 10            | L Stick Press |
| R3         | 11            | R Stick Press |

### Analog Stick Mapping

| PS1 Control     | Axis | Direction |
|-----------------|------|-----------|
| Left Stick X    | 0    | ← →       |
| Left Stick Y    | 1    | ↑ ↓       |
| Right Stick X   | 2    | ← →       |
| Right Stick Y   | 3    | ↑ ↓       |

**Deadzone Filtering:**
- Deadzone threshold: 0.1 (10%)
- Values below threshold are zeroed to prevent drift

### Supported Gamepads

✅ Xbox Controllers (360, One, Series X/S)  
✅ PlayStation Controllers (DualShock 4, DualSense)  
✅ Nintendo Switch Pro Controller  
✅ Generic USB gamepads (XInput/DirectInput)  
✅ Bluetooth gamepads (when paired with system)  

## ⌨️ Keyboard Fallback

### Key Mapping

Full keyboard support as fallback when no gamepad is detected:

#### D-Pad (Arrow Keys)
```
↑ ArrowUp    → TRIANGLE
↓ ArrowDown  → CROSS
← ArrowLeft  → SQUARE
→ ArrowRight → CIRCLE
```

#### Face Buttons (WASD-style)
```
W → TRIANGLE
A → SQUARE
S → CROSS
D → CIRCLE
```

#### Shoulder Buttons
```
Q → L1 (Left Bumper)
E → R1 (Right Bumper)
R → L2 (Left Trigger)
T → R2 (Right Trigger)
```

#### System Buttons
```
Left/Right Shift → SELECT
Enter/Space      → START
```

### Complete Keyboard Layout

```
┌─────────────────────────────────────────┐
│         KEYBOARD LAYOUT                 │
├─────────────────────────────────────────┤
│                                         │
│   Q        W ↑ E         R      T       │
│  (L1)  (△)  │  (R1)     (L2)   (R2)     │
│          ← ↓ →                          │
│         (□)(×)(○)                        │
│                                         │
│   A    S    D                           │
│  (□)  (×)  (○)                           │
│                                         │
│  L-Shift: SELECT    Enter: START        │
│                                         │
└─────────────────────────────────────────┘
```

### Visual Keyboard Reference

Click the **"VIEW KEYS"** button in the input status bar to see a visual overlay showing all keyboard mappings.

## 🔧 Technical Implementation

### useGamepad Hook

```javascript
import { useGamepad } from './hooks/useGamepad'

const {
  gamepadState,        // Connection status & button states
  keyboardState,       // Keyboard input states
  getCombinedState,    // Merged gamepad + keyboard state
  isButtonPressed,     // Helper to check specific button
} = useGamepad()
```

### State Structure

```javascript
gamepadState = {
  isConnected: true/false,     // Gamepad connected?
  gamepadIndex: 0,             // Navigator gamepad index
  gamepadId: "Gamepad Name",   // Device identifier
  buttons: {                   // Button states
    CROSS: { pressed: false, value: 0 },
    TRIANGLE: { pressed: true, value: 1 },
    // ...
  },
  axes: {                      // Analog stick positions
    LEFT_STICK_X: 0.0,
    LEFT_STICK_Y: 0.5,
    // ...
  },
  lastPressed: 'CROSS'         // Last pressed button name
}
```

### Polling Mechanism

Gamepad state is polled using `requestAnimationFrame` for smooth input:

```javascript
const pollGamepad = () => {
  const gamepads = navigator.getGamepads()
  // Read button/axis states
  animationFrameRef.current = requestAnimationFrame(pollGamepad)
}
```

**Why polling?**
- Web Gamepad API doesn't emit events for button presses
- Must poll `navigator.getGamepads()` continuously
- requestAnimationFrame ensures 60fps polling rate

### Input Source Priority

```javascript
inputSource = gamepadState.isConnected ? 'gamepad' : 'keyboard'
```

- **Gamepad connected**: Gamepad inputs take priority
- **No gamepad**: Keyboard inputs active automatically
- **Both active**: Both inputs work simultaneously

## 🎨 UI Components

### GamepadIndicator Component

Located in the top header, shows real-time connection status:

**Props:**
```javascript
<GamepadIndicator 
  isConnected={boolean}       // Connection status
  gamepadId={string}          // Device name
  inputSource={string}        // 'gamepad' | 'keyboard'
/>
```

**Features:**
- SVG gamepad icon
- Color-coded (gray/green)
- Blinking LED animation
- Hover tooltip with details
- Smooth transitions

### KeyboardMapping Component

Modal overlay showing all keyboard controls:

**Trigger:**
- Click "VIEW KEYS" button in input status bar

**Features:**
- Visual D-pad layout
- Face button mappings
- Shoulder button keys
- System button assignments
- Click outside to close

## 🐛 Troubleshooting

### Gamepad Not Detected

**Problem:** Gamepad icon stays gray

**Solutions:**
1. Press any button on gamepad (wakes it up)
2. Disconnect and reconnect USB
3. Check Bluetooth pairing
4. Try different USB port
5. Refresh browser page

### Button Not Working

**Problem:** Button presses not registered

**Solutions:**
1. Check browser console for errors (F12)
2. Verify gamepad works in OS settings
3. Try different gamepad standard (XInput vs DirectInput)
4. Check if browser supports Gamepad API

### Keyboard Not Responding

**Problem:** Keyboard inputs ignored

**Solutions:**
1. Click on browser window first (focus)
2. Check if caps lock is interfering
3. Try different keys from mapping
4. Close any modal dialogs

### Multiple Gamepads

**Problem:** Wrong gamepad detected

**Solution:**
- Application auto-selects first connected gamepad
- Disconnect other gamepads if conflict occurs
- Future update will add gamepad selection UI

## 📊 Browser Support

| Browser     | Version | Gamepad API | Keyboard |
|-------------|---------|-------------|----------|
| Chrome      | 90+     | ✅          | ✅       |
| Firefox     | 88+     | ✅          | ✅       |
| Edge        | 90+     | ✅          | ✅       |
| Safari      | 14+     | ⚠️ Limited  | ✅       |
| Opera       | 76+     | ✅          | ✅       |

**Note:** Safari has partial Gamepad API support. Chrome/Firefox recommended.

## 🔐 Security & Privacy

- All input processing happens **locally in browser**
- **No data sent to servers**
- Gamepad information only used for input mapping
- Keyboard events only captured for mapped keys

## 🚀 Future Enhancements

- [ ] Multiple gamepad support (2-player)
- [ ] Custom key mapping UI
- [ ] Vibration/force feedback
- [ ] Motion controls (gyroscope)
- [ ] Touch input for mobile
- [ ] Input recording/playback

---

**Last Updated:** April 2026  
**Version:** 1.0.0
