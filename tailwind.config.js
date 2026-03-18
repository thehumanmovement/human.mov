/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F0F7F2',
        earth: {
          DEFAULT: '#34A853',
          light: '#6ECF81',
          dark: '#1E7A3A',
        },
        warm: {
          50: '#F0F9F2',
          100: '#D6F0DC',
          200: '#B3E2BD',
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
        serif: ['var(--font-redaction)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
