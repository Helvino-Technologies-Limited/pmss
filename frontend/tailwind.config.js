/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        primary: {
          50: '#E7F3FF', 100: '#C3D9FD', 200: '#9EC3FB',
          300: '#6BA4F8', 400: '#4690F6', 500: '#1877F2',
          600: '#166FE5', 700: '#1065D5', 800: '#0B55B8', 900: '#083D8A'
        },
        success: { 500: '#22c55e', 600: '#16a34a' },
        danger:  { 500: '#ef4444', 600: '#dc2626' },
        warning: { 500: '#f59e0b', 600: '#d97706' }
      }
    }
  },
  plugins: []
}
