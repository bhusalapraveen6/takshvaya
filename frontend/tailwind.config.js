/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#F0F9F8',
          100: '#D5ECE9',
          200: '#B0DDD7',
          300: '#7EC6BD',
          400: '#4DA79D',
          500: '#2A887E',
          600: '#1A6B63',
          700: '#0B4F4A', // Core Brand Deep Teal
          800: '#083D39',
          900: '#052A27',
        },
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E4',
          200: '#FFD5CE',
          300: '#FFB3A5',
          400: '#FF8A74',
          500: '#FF6F59', // Core Brand Warm Coral
          600: '#E8523A',
          700: '#C23822',
          800: '#9E2D1A',
          900: '#7F2718',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7', // Core Soft Cream background
          200: '#F7F3EA',
          300: '#EDE6D6',
          400: '#DDD2BA',
        },
        surface: {
          dark: '#0D1B1E', // Dark mode background
          card: '#152528',
          border: '#22383C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 79, 74, 0.08)',
        'card': '0 8px 30px -4px rgba(11, 79, 74, 0.12)',
        'glow': '0 0 25px -5px rgba(255, 111, 89, 0.3)',
      },
    },
  },
  plugins: [],
};
