/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lumeo: {
          obsidian: '#0B0C14',
          indigo: '#121526',
          surface: '#181C32',
          amber: '#F59E0B',
          gold: '#FBBF24',
          glow: '#FDE68A',
          teal: '#2DD4BF',
          tealDeep: '#0D9488',
          cream: '#FAF7F0',
          parchment: '#F2ECE1',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Atkinson Hyperlegible"', '"Inter"', 'system-ui', 'sans-serif'],
        dyslexic: ['"OpenDyslexic"', '"Atkinson Hyperlegible"', 'sans-serif'],
      },
      boxShadow: {
        'amber-glow': '0 0 35px -5px rgba(251, 191, 36, 0.28)',
        'teal-glow': '0 0 30px -5px rgba(45, 212, 191, 0.22)',
      },
    },
  },
  plugins: [],
};
