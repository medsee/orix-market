/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EAF3DE',
          100: '#C0DD97',
          200: '#97C459',
          400: '#639922',
          500: '#3B6D11',
          600: '#1D9E75',
          700: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        brand: {
          green: '#1D9E75',
          light: '#EAF3DE',
          dark:  '#0F6E56',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
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
      },
    },
  },
  plugins: [],
}
