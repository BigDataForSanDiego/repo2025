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
          DEFAULT: '#2563EB',
          dark: '#1e40af',
          light: '#3b82f6',
        },
        secondary: {
          DEFAULT: '#F97316',
          dark: '#ea580c',
          light: '#fb923c',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34d399',
        },
        accent: '#8B5CF6',
        celebration: '#FCD34D',
      },
    },
  },
  plugins: [],
}

