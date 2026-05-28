/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          'dark-green': '#465241',
          'olive': '#65713F',
          'copper': '#CF8543',
          'beige': '#D9B37E',
        },
      },
      fontFamily: {
        'cardo': ['Cardo', 'Georgia', 'serif'],
        'lexend': ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
