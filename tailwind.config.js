/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#fdf5e1',
        earth: {
          DEFAULT: '#34A853',
          light: '#6ECF81',
          dark: '#1E7A3A',
        },
        sunrise: {
          DEFAULT: '#ffd800',
          light: '#ffe94d',
          dark: '#ccad00',
          orange: '#e13f01',
        },
        warm: {
          50: '#fdf5e1',
          100: '#faecc4',
          200: '#f5d98a',
          300: '#86CF96',
          400: '#5BBD72',
          500: '#3DA857',
          600: '#2D8A43',
          700: '#1F6B31',
          800: '#154D22',
          900: '#0B2F14',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
