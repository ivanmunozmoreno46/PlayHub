# PS1 Emulator - Quick Start Guide

## 🚀 Running the Application

The development server is already running at:
**http://localhost:5173**

## 📋 How to Use

### Step 1: Power On
Click the **POWER** button (left side) to turn on the console.
- LED will change from red to green
- Screen will activate

### Step 2: Load BIOS
The screen will prompt you to load a BIOS file first.
- Click "LOAD BIOS FILE" button
- Select your PS1 BIOS file (e.g., `scph5501.bin`)
- Supported formats: `.bin`, `.rom`

### Step 3: Load Game ROM
After BIOS is loaded, you'll be prompted to load a game.
- Click "LOAD ROM FILE" button
- Select your PS1 game file
- Supported formats: `.bin`, `.cue`, `.iso`, `.img`, `.chd`, `.pbp`

### Step 4: Start Emulator
Once both files are loaded:
- Click "START EMULATOR" button
- The emulator will initialize (progress bar shown)
- Game will start automatically

## 🎮 Controls

### Emulator Controls (built-in)
- **F1**: Save State
- **F2**: Load State
- **F3**: Screenshot
- **F4**: Fast Forward
- **Esc**: Menu

### PlayStation Controls (default mapping)
- **Arrow Keys**: D-Pad
- **Z**: Cross (×)
- **X**: Circle (○)
- **A**: Square (□)
- **S**: Triangle (△)
- **Q**: L1
- **W**: R1
- **E**: L2
- **R**: R2
- **Enter**: Start
- **Shift**: Select

## ⚙️ Features

- ✅ **4:3 Aspect Ratio**: Authentic PlayStation display
- ✅ **CRT Effects**: Scanlines and screen flicker
- ✅ **Save States**: Save/load game progress
- ✅ **BIOS Selection**: Supports multiple PS1 BIOS versions
- ✅ **Multiple ROM Formats**: Various game disc image formats
- ✅ **Auto-Start**: Emulator starts automatically after loading

## 🔧 Troubleshooting

### "Failed to load EmulatorJS"
- Check your internet connection (EmulatorJS loads from CDN)
- Refresh the page and try again

### "No BIOS Loaded"
- Make sure you're using a valid PS1 BIOS file
- Recommended: `scph5501.bin` (US version)

### Game not starting
- Verify the ROM file is a valid PS1 game
- Try converting .cue/.bin to .iso format
- Check browser console for errors (F12)

### Performance issues
- Close other browser tabs
- Enable hardware acceleration in browser settings
- Try a different browser (Chrome/Firefox recommended)

## 📁 File Structure

```
ps1-emulator/
├── src/
│   ├── hooks/
│   │   └── useEmulator.js      # Emulator lifecycle management
│   ├── components/
│   │   └── EmulatorScreen.jsx   # 4:3 screen & file loading
│   ├── App.jsx                  # Main console UI
│   └── main.jsx                 # Entry point
├── public/
│   └── emulator/
│       └── config.json          # Emulator configuration
└── package.json
```

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```js
colors: {
  'ps1-led-green': '#00ff41',  // LED color
  'ps1-gray': '#2d2d35',       // Console body
}
```

### Disable CRT Effects
In `EmulatorScreen.jsx`, set:
```js
const [showScanlines, setShowScanlines] = useState(false)
```

## 📝 Notes

- BIOS and ROM files are processed locally in your browser
- No files are uploaded to any server
- Save states are stored in browser localStorage
- EmulatorJS is loaded from `cdn.emulatorjs.org`

## 🎯 Next Steps

1. Get a PS1 BIOS file from your own console
2. Load your favorite PS1 game
3. Enjoy retro gaming in your browser!

---

**Happy Gaming!** 🎮✨
