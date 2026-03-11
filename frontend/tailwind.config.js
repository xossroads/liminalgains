/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#141414',
          800: '#1a1a1a',
          700: '#222222',
          600: '#2a2a2a',
          500: '#333333',
        },
        accent: {
          DEFAULT: '#c9a96e',
          dim: '#a08450',
          bright: '#dfc08a',
        },
        muted: {
          DEFAULT: '#6b6b6b',
          light: '#8a8a8a',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
