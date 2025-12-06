/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        whillo: '#FFF5E6',
      },
      screens: {
        'max-ms': { 'max': '360px' },
        'max-ml': { 'max': '480px' },
      },

      keyframes: {
        infinity: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(20px, 10px)' },
          '50%': { transform: 'translate(0, 20px)' },
          '75%': { transform: 'translate(-20px, 10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        fadeout: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      animation: {
        'infinity-once':
          'infinity 1.4s ease-in-out 3, fadeout 0.8s ease-out 4.2s forwards',
      },
    },
  },
  plugins: [],
};
