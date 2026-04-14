import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * PS1 Button Mapping Constants
 * Maps PlayStation 1 buttons to standard Gamepad API indices
 */
export const PS1_BUTTONS = {
  // Face buttons (Standard Gamepad layout)
  TRIANGLE: 3,      // Y button (index 3)
  CIRCLE: 1,        // B button (index 1)
  CROSS: 0,         // A button (index 0)
  SQUARE: 2,        // X button (index 2)

  // Shoulder buttons
  L1: 4,            // Left bumper (index 4)
  R1: 5,            // Right bumper (index 5)
  L2: 6,            // Left trigger (index 6)
  R2: 7,            // Right trigger (index 7)

  // Select/Start
  SELECT: 8,        // Back button (index 8)
  START: 9,         // Start button (index 9)

  // Analog stick buttons (if applicable)
  L3: 10,           // Left stick press (index 10)
  R3: 11,           // Right stick press (index 11)
}

/**
 * D-Pad mapping (typically axes 0 and 1)
 */
export const PS1_AXES = {
  LEFT_STICK_X: 0,  // Horizontal left stick
  LEFT_STICK_Y: 1,  // Vertical left stick
  RIGHT_STICK_X: 2, // Horizontal right stick
  RIGHT_STICK_Y: 3, // Vertical right stick
}

/**
 * Keyboard fallback key mappings
 */
export const KEYBOARD_MAP = {
  // Face buttons
  'ArrowUp': 'TRIANGLE',
  'KeyW': 'TRIANGLE',
  'ArrowRight': 'CIRCLE',
  'KeyD': 'CIRCLE',
  'ArrowDown': 'CROSS',
  'KeyS': 'CROSS',
  'ArrowLeft': 'SQUARE',
  'KeyA': 'SQUARE',

  // Shoulder buttons
  'KeyQ': 'L1',
  'KeyE': 'R1',
  'KeyR': 'L2',
  'KeyT': 'R2',

  // Select/Start
  'ShiftLeft': 'SELECT',
  'ShiftRight': 'SELECT',
  'Enter': 'START',
  'Space': 'START',
}

/**
 * Web Gamepad API hook
 * Detects gamepad connections, maps PS1 buttons, and provides keyboard fallback
 * 
 * Features:
 * - USB/Bluetooth gamepad detection via gamepadconnected event
 * - Standard Gamepad API button mapping
 * - Keyboard input fallback
 * - Real-time button state tracking
 * - Connection status monitoring
 */
export function useGamepad() {
  const [gamepadState, setGamepadState] = useState({
    isConnected: false,
    gamepadIndex: null,
    gamepadId: null,
    buttons: {},
    axes: {},
    lastPressed: null,
  })

  const [keyboardState, setKeyboardState] = useState({
    keysPressed: new Set(),
    mappedButtons: {},
  })

  const gamepadRef = useRef(null)
  const animationFrameRef = useRef(null)
  const pressedButtonsRef = useRef(new Set())

  /**
   * Map gamepad button index to PS1 button name
   */
  const mapGamepadButton = useCallback((buttonIndex) => {
    const reverseMap = Object.entries(PS1_BUTTONS).reduce((acc, [name, index]) => {
      acc[index] = name
      return acc
    }, {})
    return reverseMap[buttonIndex] || `BUTTON_${buttonIndex}`
  }, [])

  /**
   * Poll gamepad state using requestAnimationFrame
   * This is necessary as gamepad state is only available via navigator.getGamepads()
   */
  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads()
    
    if (!gamepadRef.current && gamepads.length > 0) {
      // Auto-detect first gamepad if not set
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          gamepadRef.current = i
          break
        }
      }
    }

    if (gamepadRef.current !== null) {
      const gamepad = gamepads[gamepadRef.current]
      
      if (gamepad) {
        const buttons = {}
        const axes = {}
        let lastPressed = null

        // Map button states
        gamepad.buttons.forEach((button, index) => {
          const ps1Button = mapGamepadButton(index)
          buttons[ps1Button] = {
            pressed: button.pressed,
            value: button.value || 0,
            touched: button.touched || false,
          }

          // Track pressed state changes
          const buttonKey = `${index}_${button.pressed}`
          if (button.pressed && !pressedButtonsRef.current.has(index)) {
            lastPressed = ps1Button
            pressedButtonsRef.current.add(index)
          } else if (!button.pressed) {
            pressedButtonsRef.current.delete(index)
          }
        })

        // Map axis states
        if (gamepad.axes.length >= 4) {
          axes.LEFT_STICK_X = gamepad.axes[PS1_AXES.LEFT_STICK_X] || 0
          axes.LEFT_STICK_Y = gamepad.axes[PS1_AXES.LEFT_STICK_Y] || 0
          axes.RIGHT_STICK_X = gamepad.axes[PS1_AXES.RIGHT_STICK_X] || 0
          axes.RIGHT_STICK_Y = gamepad.axes[PS1_AXES.RIGHT_STICK_Y] || 0
        }

        // Deadzone filtering for analog sticks
        const DEADZONE = 0.1
        Object.keys(axes).forEach(key => {
          if (Math.abs(axes[key]) < DEADZONE) {
            axes[key] = 0
          }
        })

        setGamepadState(prev => ({
          ...prev,
          buttons,
          axes,
          lastPressed: lastPressed || prev.lastPressed,
        }))
      }
    }

    animationFrameRef.current = requestAnimationFrame(pollGamepad)
  }, [mapGamepadButton])

  /**
   * Handle gamepad connection
   */
  const handleGamepadConnected = useCallback((e) => {
    console.log('Gamepad connected:', e.gamepad.id)
    
    gamepadRef.current = e.gamepad.index

    setGamepadState(prev => ({
      ...prev,
      isConnected: true,
      gamepadIndex: e.gamepad.index,
      gamepadId: e.gamepad.id,
    }))

    // Start polling
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(pollGamepad)
    }
  }, [pollGamepad])

  /**
   * Handle gamepad disconnection
   */
  const handleGamepadDisconnected = useCallback((e) => {
    console.log('Gamepad disconnected:', e.gamepad.id)
    
    gamepadRef.current = null
    pressedButtonsRef.current.clear()

    setGamepadState({
      isConnected: false,
      gamepadIndex: null,
      gamepadId: null,
      buttons: {},
      axes: {},
      lastPressed: null,
    })

    // Stop polling if no gamepad
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  /**
   * Handle keyboard input
   */
  const handleKeyDown = useCallback((e) => {
    const mappedButton = KEYBOARD_MAP[e.code]
    
    if (mappedButton) {
      setKeyboardState(prev => {
        const newKeys = new Set(prev.keysPressed)
        newKeys.add(e.code)
        
        const newMappedButtons = { ...prev.mappedButtons }
        newMappedButtons[mappedButton] = {
          pressed: true,
          value: 1.0,
          source: 'keyboard',
        }

        return {
          keysPressed: newKeys,
          mappedButtons: newMappedButtons,
        }
      })

      setGamepadState(prev => ({
        ...prev,
        lastPressed: mappedButton,
      }))
    }
  }, [])

  const handleKeyUp = useCallback((e) => {
    const mappedButton = KEYBOARD_MAP[e.code]
    
    if (mappedButton) {
      setKeyboardState(prev => {
        const newKeys = new Set(prev.keysPressed)
        newKeys.delete(e.code)
        
        const newMappedButtons = { ...prev.mappedButtons }
        delete newMappedButtons[mappedButton]

        return {
          keysPressed: newKeys,
          mappedButtons: newMappedButtons,
        }
      })
    }
  }, [])

  /**
   * Set up event listeners
   */
  useEffect(() => {
    // Gamepad events
    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    // Keyboard events
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Check for already-connected gamepads
    const gamepads = navigator.getGamepads()
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        handleGamepadConnected({ gamepad: gamepads[i] })
        break
      }
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleGamepadConnected, handleGamepadDisconnected, handleKeyDown, handleKeyUp])

  /**
   * Get combined input state (gamepad + keyboard)
   */
  const getCombinedState = useCallback(() => {
    const combined = { ...gamepadState.buttons }
    
    // Merge keyboard inputs
    Object.entries(keyboardState.mappedButtons).forEach(([button, state]) => {
      combined[button] = state
    })

    return {
      ...gamepadState,
      buttons: combined,
      inputSource: gamepadState.isConnected ? 'gamepad' : 'keyboard',
    }
  }, [gamepadState, keyboardState.mappedButtons])

  /**
   * Check if a specific PS1 button is pressed
   */
  const isButtonPressed = useCallback((buttonName) => {
    const gamepadButton = gamepadState.buttons[buttonName]
    const keyboardButton = keyboardState.mappedButtons[buttonName]
    
    return (gamepadButton && gamepadButton.pressed) || 
           (keyboardButton && keyboardButton.pressed)
  }, [gamepadState.buttons, keyboardState.mappedButtons])

  return {
    gamepadState,
    keyboardState,
    getCombinedState,
    isButtonPressed,
  }
}

export default useGamepad
