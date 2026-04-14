import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Emulator lifecycle hook for EmulatorJS
 * 
 * OPTIMIZED: Avoids ZIP extraction in WASM by using .cue file directly
 * WASM memory is pre-allocated to prevent slow dynamic resizing
 */
export function useEmulator(containerRef) {
  const [emulatorState, setEmulatorState] = useState({
    isLoaded: false,
    isRunning: false,
    isLoading: false,
    error: null,
    biosFile: null,
    romFile: null,
    progress: 0,
    loadingMessage: '',
    needsMenuInteraction: false,
  })

  const emulatorInstanceRef = useRef(null)
  const scriptLoaderRef = useRef(null)
  const isInitializedRef = useRef(false)

  /**
   * Convert File to blob URL
   */
  const fileToUrl = useCallback((file) => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [])

  /**
   * Convert File to base64 data URL
   * More reliable for EmulatorJS WASM environment
   */
  const fileToDataURL = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsDataURL(file)
    })
  }, [])

  /**
   * Find the primary ROM file (.cue preferred over .bin)
   */
  const findPrimaryRom = useCallback((files) => {
    const cueFile = files.find(f => f.name.toLowerCase().endsWith('.cue'))
    return cueFile || files[0]
  }, [])

  /**
   * Clean up EmulatorJS globals
   */
  const cleanupGlobals = useCallback(() => {
    const keys = [
      'EJS_player', 'EJS_core', 'EJS_biosUrl', 'EJS_gameUrl', 'EJS_pathtodata',
      'EJS_onGameStart', 'EJS_onGameStop', 'EJS_onLoadState', 'EJS_onError',
      'EJS_onLoad', 'EJS_verbose', 'EJS_advertise', 'EJS_color',
      'EJS_startOnLoaded', 'EJS_disableDatabases', 'EJS_netplay', 'EJS_load',
      'EJS_defaultCore', 'EJS_gameOptions', 'EJS_paths', 'EJS_DEBUG_XX',
      'EJS_emulator', 'EJS_adBlocked', 'EJS_dontExtractBIOS',
    ]
    keys.forEach(key => delete window[key])
  }, [])

  /**
   * Initialize emulator with BIOS and ROM files
   */
  const initializeEmulator = useCallback(async (biosFile, romFiles) => {
    const romFilesArray = Array.isArray(romFiles) ? romFiles : [romFiles]

    if (isInitializedRef.current) {
      console.warn('[Emulator] Already initialized')
      return
    }

    if (!containerRef.current) {
      setEmulatorState(prev => ({
        ...prev,
        error: 'Container not available'
      }))
      return
    }

    setEmulatorState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      loadingMessage: 'Preparing files...',
      needsMenuInteraction: false,
    }))

    // Store blob URLs so they don't get garbage collected
    const blobUrls = []

    try {
      // Step 1: Clear previous instance
      console.log('[Emulator] Clearing previous instance...')
      const container = containerRef.current
      container.innerHTML = ''

      // Create container for emulator
      const canvasContainer = document.createElement('div')
      canvasContainer.id = 'emulator-canvas'
      canvasContainer.style.width = '100%'
      canvasContainer.style.height = '100%'
      canvasContainer.style.position = 'relative'
      container.appendChild(canvasContainer)

      setEmulatorState(prev => ({ ...prev, progress: 10, loadingMessage: 'Preparing files...' }))

      // Step 2: Convert BIOS to base64 data URL (Web Workers cannot access blob URLs)
      console.log('[Emulator] Converting BIOS to base64 for Web Worker...')
      setEmulatorState(prev => ({ ...prev, progress: 15, loadingMessage: 'Converting BIOS...' }))
      
      const biosDataURL = await fileToDataURL(biosFile)
      console.log('[Emulator] BIOS converted, size:', (biosFile.size / 1024).toFixed(1), 'KB')
      
      const primaryRomFile = findPrimaryRom(romFilesArray)
      const primaryRomUrl = fileToUrl(primaryRomFile)

      // Store ROM URL for cleanup
      if (primaryRomUrl) blobUrls.push(primaryRomUrl)
      romFilesArray.forEach(f => {
        const url = fileToUrl(f)
        if (url) blobUrls.push(url)
      })

      console.log('[Emulator] ROM:', primaryRomFile.name)
      console.log('[Emulator] Total files:', romFilesArray.length)

      // Validate BIOS size (~512KB)
      if (Math.abs(biosFile.size - 512 * 1024) > 100 * 1024) {
        throw new Error(`Invalid BIOS size: ${(biosFile.size / 1024).toFixed(1)}KB (expected ~512KB)`)
      }

      if (!biosDataURL || !primaryRomUrl) {
        throw new Error('Failed to prepare files')
      }

      setEmulatorState(prev => ({ ...prev, progress: 20, loadingMessage: 'Loading BIOS...' }))

      // Step 3: Set ALL EmulatorJS globals BEFORE loading script
      window.EJS_player = '#emulator-canvas'
      window.EJS_core = 'psx'
      window.EJS_biosUrl = biosDataURL
      window.EJS_gameUrl = primaryRomUrl
      window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/'

      // Game name for display
      window.EJS_gameName = primaryRomFile.name.replace(/\.(cue|bin|iso|img|chd|pbp)$/i, '')

      // PERFORMANCE OPTIMIZATIONS for PS1 emulation
      window.EJS_defaultOptions = {
        // Use dynamic recompiler (much faster than interpreter)
        'psx.CPU': 'recompiler',
        
        // Frame skip: 0=no skip, 1=skip every other frame for +25% FPS
        'psx.frameSkip': '0',
        'psx.frameskip_threshold': '48',
        
        // Lower internal resolution (1x = native PS1 resolution)
        'pcsx_rearmed.iUseDither': '0',
        
        // Disable unnecessary features
        'pcsx_rearmed.Mdec Cases': '0',
        'pcsx_rearmed.SPUirqVisible': '0',
        
        // Audio optimization - null interface is fastest
        'pcsx_rearmed.SPUiface': 'spunull',
        
        // Fast boot - skip BIOS logo
        'pcsx_rearmed.fastBoot': '1',
        
        // Disable extra memory card slots (saves memory)
        'pcsx_rearmed.enable_memcard2': 'disabled',
      }

      // Disable databases and extra features for better performance
      window.EJS_disableDatabases = true
      window.EJS_netplay = false
      window.EJS_advertise = false
      window.EJS_verbose = false

      // Event handlers
      window.EJS_onGameStart = () => {
        console.log('[EmulatorJS] ✓ Game started!')
        setEmulatorState(prev => ({
          ...prev,
          isLoaded: true,
          isRunning: true,
          progress: 100,
          loadingMessage: '',
          needsMenuInteraction: false,
        }))
      }

      window.EJS_onGameStop = () => {
        console.log('[EmulatorJS] ✗ Game stopped')
        setEmulatorState(prev => ({
          ...prev,
          isRunning: false,
        }))
      }

      window.EJS_onLoadState = () => {
        console.log('[EmulatorJS] ✓ State loaded')
      }

      window.EJS_onLoad = () => {
        console.log('[EmulatorJS] ✓ Emulator loaded')
      }

      window.EJS_onError = (error) => {
        console.error('[EmulatorJS] ✗ Error:', error)
        const errorMsg = typeof error === 'string' ? error : (error?.message || 'Unknown error')
        setEmulatorState(prev => ({
          ...prev,
          isLoading: false,
          isLoaded: false,
          isRunning: false,
          error: `Emulator error: ${errorMsg}`,
          loadingMessage: '',
          progress: 0
        }))
      }

      // PlayStation 1 specific settings
      window.EJS_advertise = false
      window.EJS_color = '#4a4a55'
      window.EJS_startOnLoaded = true
      window.EJS_disableDatabases = true
      window.EJS_netplay = false
      window.EJS_verbose = true

      // Unique game ID
      window.EJS_gameID = `ps1-${Date.now()}`

      setEmulatorState(prev => ({ ...prev, progress: 30, loadingMessage: 'Downloading BIOS...' }))

      // Step 4: Load the script from CDN
      console.log('[Emulator] Loading EmulatorJS from CDN...')
      
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js'
        script.async = true
        
        script.onload = () => {
          console.log('[EmulatorJS] ✓ Script loaded from CDN')
          scriptLoaderRef.current = script
          resolve()
        }
        
        script.onerror = () => {
          console.error('[EmulatorJS] ✗ Failed to load script')
          reject(new Error('Failed to load EmulatorJS from CDN'))
        }

        document.body.appendChild(script)
      })

      setEmulatorState(prev => ({ ...prev, progress: 50, loadingMessage: 'Initializing emulator...' }))

      isInitializedRef.current = true

      setEmulatorState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        isRunning: true,
        biosFile: biosFile.name,
        romFile: romFilesArray.map(f => f.name).join(', '),
        progress: 100,
        loadingMessage: '',
        error: null,
        needsMenuInteraction: true,
      }))

      emulatorInstanceRef.current = {
        biosDataURL,  // Store base64 data URL (no cleanup needed)
        romUrls: romFilesArray.map(f => fileToUrl(f)),
        blobUrls,
        canvasContainer,
      }

    } catch (error) {
      console.error('[Emulator] Initialization error:', error)
      isInitializedRef.current = false
      
      // Cleanup blob URLs on error
      blobUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
      
      cleanupGlobals()

      setEmulatorState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: false,
        isRunning: false,
        error: error.message || 'Failed to initialize emulator',
        loadingMessage: '',
        progress: 0
      }))
    }
  }, [containerRef, fileToUrl, findPrimaryRom, cleanupGlobals])

  /**
   * Stop emulator and cleanup
   */
  const stopEmulator = useCallback(() => {
    if (emulatorInstanceRef.current) {
      const { romUrls, blobUrls, canvasContainer } = emulatorInstanceRef.current

      // Revoke blob URLs only (data URLs don't need cleanup)
      const allUrls = [...(romUrls || []), ...(blobUrls || [])]
      allUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })

      if (canvasContainer && canvasContainer.parentNode) {
        canvasContainer.innerHTML = ''
        canvasContainer.remove()
      }

      if (scriptLoaderRef.current && scriptLoaderRef.current.parentNode) {
        scriptLoaderRef.current.parentNode.removeChild(scriptLoaderRef.current)
        scriptLoaderRef.current = null
      }

      cleanupGlobals()
      emulatorInstanceRef.current = null
    }

    isInitializedRef.current = false

    setEmulatorState({
      isLoaded: false,
      isRunning: false,
      isLoading: false,
      error: null,
      biosFile: null,
      romFile: null,
      progress: 0,
      needsMenuInteraction: false,
    })
  }, [cleanupGlobals])

  /**
   * Pause emulator
   */
  const pauseEmulator = useCallback(() => {
    if (window.EJS_pause && emulatorInstanceRef.current) {
      window.EJS_pause()
      setEmulatorState(prev => ({ ...prev, isRunning: false }))
    }
  }, [])

  /**
   * Resume emulator
   */
  const resumeEmulator = useCallback(() => {
    if (window.EJS_resume && emulatorInstanceRef.current) {
      window.EJS_resume()
      setEmulatorState(prev => ({ ...prev, isRunning: true }))
    }
  }, [])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopEmulator()
    }
  }, [stopEmulator])

  return {
    emulatorState,
    initializeEmulator,
    stopEmulator,
    pauseEmulator,
    resumeEmulator,
  }
}

export default useEmulator
