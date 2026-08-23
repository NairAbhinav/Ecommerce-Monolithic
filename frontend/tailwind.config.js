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
          50: '#f4f6ff',
          100: '#ebf0ff',
          200: '#dce5ff',
          300: '#c2d2ff',
          400: '#9cb5ff',
          500: '#6d8cff',
          600: '#4763ff',
          700: '#3449eb',
          800: '#2b3bc3',
          900: '#29359a',
          950: '#1d225b',
        },
        dark: {
          50: '#f6f6f7',
          100: '#eef0f2',
          200: '#dbe0e5',
          300: '#bdc6d0',
          400: '#98a5b5',
          500: '#7c8b9d',
          600: '#647285',
          700: '#525d6e',
          800: '#434c5a',
          900: '#1e293b', // Slate dark
          950: '#0f172a', // Deep navy black
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
