/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ps1-dark': '#1a1a1e',
        'ps1-gray': '#2d2d35',
        'ps1-light': '#3a3a45',
        'ps1-accent': '#4a4a55',
        'ps1-text': '#c0c0c8',
        'ps1-highlight': '#5a5a66',
        'ps1-led-green': '#00ff41',
        'ps1-led-red': '#ff3333',
      },
      fontFamily: {
        'retro': ['"Press Start 2P"', 'monospace', 'system-ui'],
        'ps': ['"Orbitron"', 'sans-serif', 'system-ui'],
      },
      boxShadow: {
        'inset': 'inset 2px 2px 5px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(60,60,70,0.3)',
        'block': '4px 4px 10px rgba(0,0,0,0.6), -2px -2px 8px rgba(60,60,70,0.2)',
        'button': '2px 2px 6px rgba(0,0,0,0.5), -1px -1px 4px rgba(60,60,70,0.2)',
        'button-pressed': 'inset 1px 1px 3px rgba(0,0,0,0.6)',
        'screen': 'inset 3px 3px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,255,65,0.1)',
      },
      borderRadius: {
        'ps': '4px',
        'ps-lg': '8px',
      }
    },
  },
  plugins: [],
}
