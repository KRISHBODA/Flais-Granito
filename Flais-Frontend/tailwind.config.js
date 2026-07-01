/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#f5f5f5',
          DEFAULT: '#e5e5e5',
          dark: '#737373',
        },
        accent: {
          light: '#d4d4d8',
          DEFAULT: '#52525b',
          dark: '#27272a',
        },
        beige: {
          50: '#fdfcfb',
          100: '#f7f4ef',
          200: '#eee9e0',
          300: '#e1d8c9',
          400: '#cbbdaf',
          500: '#b49f8b',
          600: '#a38772',
          700: '#886d5e',
          800: '#6f5a4f',
          900: '#5c4b43',
        }
      },
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif'],
        classic: ['"Montserrat"', 'sans-serif'],
        logo: ['"Montserrat"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in-scale': 'fadeInScale 1.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
