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
          DEFAULT: '#0F4C5C',
          dark: '#0A343F',
          light: '#16697A',
        },
        secondary: {
          DEFAULT: '#2A9D8F',
          dark: '#21867A',
          light: '#42B5A7',
        },
        accent: {
          DEFAULT: '#F4A261',
          dark: '#E76F51',
          light: '#F8B88B',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#E2E8F0',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 76, 92, 0.08)',
        'elevated': '0 10px 25px -5px rgba(15, 76, 92, 0.12), 0 8px 10px -6px rgba(15, 76, 92, 0.06)',
      },
    },
  },
  plugins: [],
}
