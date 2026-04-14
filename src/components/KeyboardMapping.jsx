import { KEYBOARD_MAP } from '../hooks/useGamepad'

/**
 * KeyboardMapping Component
 * Visual reference showing keyboard controls as fallback
 */
function KeyboardMapping({ isOpen, onClose }) {
  if (!isOpen) return null

  // Group keys by function
  const dpad = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  const faceButtons = [
    { key: 'KeyW', button: 'TRIANGLE', label: 'W' },
    { key: 'KeyD', button: 'CIRCLE', label: 'D' },
    { key: 'KeyS', button: 'CROSS', label: 'S' },
    { key: 'KeyA', button: 'SQUARE', label: 'A' },
  ]
  const shoulder = [
    { key: 'KeyQ', button: 'L1', label: 'Q' },
    { key: 'KeyE', button: 'R1', label: 'E' },
    { key: 'KeyR', button: 'L2', label: 'R' },
    { key: 'KeyT', button: 'R2', label: 'T' },
  ]
  const system = [
    { key: 'ShiftLeft', button: 'SELECT', label: 'L-SHIFT' },
    { key: 'Enter', button: 'START', label: 'ENTER' },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-ps1-gray border-2 border-ps1-accent rounded-ps-lg shadow-block max-w-2xl w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="font-retro text-ps1-led-green text-sm">
            KEYBOARD CONTROLS
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-ps1-dark border border-ps1-accent rounded-ps font-retro text-[8px] text-ps1-text hover:brightness-110"
          >
            CLOSE
          </button>
        </div>

        {/* D-Pad Section */}
        <div className="mb-6">
          <div className="font-retro text-[10px] text-ps1-text mb-3">D-PAD</div>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <div className="w-12 h-12 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                <span className="font-retro text-[8px] text-ps1-led-green">↑</span>
              </div>
              <div></div>
              <div className="w-12 h-12 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                <span className="font-retro text-[8px] text-ps1-led-green">←</span>
              </div>
              <div className="w-12 h-12 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                <span className="font-retro text-[8px] text-ps1-text text-[6px]">·</span>
              </div>
              <div className="w-12 h-12 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                <span className="font-retro text-[8px] text-ps1-led-green">→</span>
              </div>
              <div></div>
              <div className="w-12 h-12 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                <span className="font-retro text-[8px] text-ps1-led-green">↓</span>
              </div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Face Buttons */}
        <div className="mb-6">
          <div className="font-retro text-[10px] text-ps1-text mb-3">FACE BUTTONS</div>
          <div className="grid grid-cols-2 gap-2">
            {faceButtons.map(({ key, button, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-12 h-8 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                  <span className="font-retro text-[8px] text-ps1-led-green">{label}</span>
                </div>
                <div className="font-retro text-[8px] text-ps1-text">
                  → {button}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shoulder Buttons */}
        <div className="mb-6">
          <div className="font-retro text-[10px] text-ps1-text mb-3">SHOULDER BUTTONS</div>
          <div className="grid grid-cols-2 gap-2">
            {shoulder.map(({ key, button, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-12 h-8 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                  <span className="font-retro text-[8px] text-ps1-led-green">{label}</span>
                </div>
                <div className="font-retro text-[8px] text-ps1-text">
                  → {button}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Buttons */}
        <div className="mb-6">
          <div className="font-retro text-[10px] text-ps1-text mb-3">SYSTEM</div>
          <div className="grid grid-cols-2 gap-2">
            {system.map(({ key, button, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-20 h-8 bg-ps1-dark border border-ps1-accent rounded-ps flex items-center justify-center">
                  <span className="font-retro text-[7px] text-ps1-led-green">{label}</span>
                </div>
                <div className="font-retro text-[8px] text-ps1-text">
                  → {button}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-ps1-accent pt-4 mt-4">
          <div className="font-retro text-[8px] text-ps1-accent text-center">
            Press any mapped key to control the game
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyboardMapping
