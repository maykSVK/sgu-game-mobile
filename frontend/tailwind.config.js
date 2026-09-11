/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        sgu: {
          dark:   '#0a1628',
          navy:   '#0d1f3c',
          blue:   '#1a3a6c',
          accent: '#209cff',
          gold:   '#f0c040',
          text:   '#c8d8f0',
        },
      },
    },
  },
  plugins: [],
}
