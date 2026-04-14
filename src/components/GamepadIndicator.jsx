import { useState } from 'react'

/**
 * GamepadIndicator Component - Light Gray PS1 Theme
 */
function GamepadIndicator({ isConnected, gamepadId, inputSource }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      {/* Gamepad Icon */}
      <div
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300 cursor-pointer
          ${isConnected 
            ? 'bg-green-100 border-green-500 shadow-[0_0_6px_rgba(34,197,94,0.3)]' 
            : 'bg-gray-200 border-gray-400'
          }
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Gamepad SVG Icon */}
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          className={`transition-colors duration-300 ${isConnected ? 'text-green-700' : 'text-gray-500'}`}
        >
          {/* Gamepad body */}
          <path
            d="M6 9h12v6c0 1.5-1.5 3-3 3h-1l-1 2h-2l-1-2H9c-1.5 0-3-1.5-3-3V9z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          {/* D-pad */}
          <path
            d="M8 11h2v-2h2v2h2v2h-2v2h-2v-2H8v-2z"
            fill="currentColor"
            opacity="0.7"
          />
          {/* Face buttons */}
          <circle cx="15" cy="11" r="0.8" fill="currentColor" />
          <circle cx="17" cy="13" r="0.8" fill="currentColor" />
          <circle cx="13" cy="13" r="0.8" fill="currentColor" />
          <circle cx="15" cy="15" r="0.8" fill="currentColor" />
          {/* Shoulder buttons */}
          <path
            d="M7 8h3v1H7V8zM14 8h3v1h-3V8z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>

        {/* Status Text */}
        <span className={`font-retro text-[7px] ${isConnected ? 'text-green-700' : 'text-gray-600'}`}>
          {isConnected ? 'PAD' : 'NO PAD'}
        </span>

        {/* Connection indicator dot */}
        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 led-blink' : 'bg-gray-400'}`}></div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded shadow-lg whitespace-nowrap z-50">
          <div className="font-retro text-[8px] text-gray-200">
            {isConnected ? (
              <>
                <div className="text-green-400 mb-1">✓ GAMEPAD CONNECTED</div>
                <div className="text-gray-400 text-[6px] truncate max-w-[200px]">
                  {gamepadId?.substring(0, 40) || 'Unknown gamepad'}
                </div>
                <div className="text-gray-400 text-[6px] mt-1">
                  Input: {inputSource?.toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-400 mb-1">✗ NO GAMEPAD</div>
                <div className="text-gray-300 text-[6px]">
                  Connect USB/Bluetooth gamepad
                </div>
                <div className="text-gray-300 text-[6px] mt-1">
                  Or use keyboard fallback
                </div>
              </>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-gray-800 border-r border-b border-gray-600 rotate-45 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamepadIndicator
