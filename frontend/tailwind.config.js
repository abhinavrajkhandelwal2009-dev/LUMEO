/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lumeo: {
          primary: '#1D4ED8',
          secondary: '#0F172A',
          accent: '#FACC15',
          calm: '#E0F2FE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        dyslexic: ['"OpenDyslexic"', '"Comic Sans MS"', '"Trebuchet MS"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

