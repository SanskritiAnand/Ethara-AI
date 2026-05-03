/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf9',
          100: '#ccfbef',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
      },
    },
  },
  plugins: [],
}
