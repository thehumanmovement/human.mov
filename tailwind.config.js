/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        earth: {
          DEFAULT: '#C4724E',
          light: '#D4A574',
          dark: '#8B4E32',
        },
        warm: {
          50: '#FDF8F4',
          100: '#F5EDE4',
          200: '#E8D5C4',
          300: '#D4B896',
          400: '#C4A67A',
          500: '#A68B6B',
          600: '#8B7355',
          700: '#6B5740',
          800: '#4A3C2C',
          900: '#2C231A',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-libre)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
