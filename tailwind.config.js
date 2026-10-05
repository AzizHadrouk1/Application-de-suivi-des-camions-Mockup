/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF3FF',
          100: '#DCE6FE',
          200: '#B9CCFD',
          300: '#8AA8FA',
          400: '#5A80F3',
          500: '#2F62EA',
          600: '#1E50D8',
          700: '#1A40B2',
          800: '#18358F',
          900: '#152C70',
        },
        accent: {
          50: '#E8F8FE',
          100: '#C9EFFD',
          200: '#97E0FA',
          400: '#3CC4F5',
          500: '#1FB2EE',
          600: '#0B8FC8',
          700: '#086F9E',
        },
        navy: {
          800: '#13215A',
          900: '#0E1A48',
          950: '#0A1236',
        },
        canvas: '#F4F6FA',
        line: '#E3E8F0',
        ink: {
          DEFAULT: '#0F1A33',
          muted: '#5B6478',
          subtle: '#8A93A6',
        },
        ok: { 50: '#ECFDF3', 100: '#D1FADF', 500: '#12B76A', 600: '#079455', 700: '#067647' },
        warn: { 50: '#FFF6ED', 100: '#FFEAD5', 500: '#F79009', 600: '#DC6803', 700: '#B54708' },
        danger: { 50: '#FEF3F2', 100: '#FEE4E2', 500: '#F04438', 600: '#D92D20', 700: '#B42318' },
        info: { 50: '#FEFBE8', 100: '#FEF7C3', 500: '#EAAA08', 700: '#A15C07' },
        offline: { 50: '#F2F4F7', 100: '#E4E7EC', 400: '#98A2B3', 600: '#667085' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.05)',
        pop: '0 12px 32px -8px rgba(10,18,54,0.18), 0 4px 8px -4px rgba(10,18,54,0.08)',
      },
    },
  },
  plugins: [],
};
