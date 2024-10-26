/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      zIndex: {
        'auto': 'auto',
        'n2': -2,
        'n1': -1,
        '0': 0,
        '1': 1,
        '2': 2,
        '100': 100
      },
      fontFamily: {
        audiowide: ["Audiowide", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.arrow-hide':{
          '&::-webkit-inner-spin-button':{
            '-webkit-appearance': 'none',
            'margin': 0
          },
          '&::-webkit-outer-spin-button':{
            '-webkit-appearance': 'none',
            'margin': 0
          },
        }
      })
    })
  ],
}

