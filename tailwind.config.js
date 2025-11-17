/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whillo: '#FFF5E6', // your custom color
      },
      screens: {
      'max-ms': {'max': '360px'}, // mobile S max
      'max-ml': {'max': '480px'}, // mobile L max
    }
    },
  },
  plugins: [],
}
