/** @type {import('tailwindcss').Config} */
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
        '2': 2
      },
      fontFamily: {
        audiowide: ["Audiowide", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

