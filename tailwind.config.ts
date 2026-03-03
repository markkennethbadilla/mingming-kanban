import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e8805c',
          dark: '#d06a48',
          light: '#f4a98a',
        },
        secondary: {
          DEFAULT: '#7c6caa',
          dark: '#5e4f8c',
        },
        accent: {
          DEFAULT: '#f6c354',
          dark: '#e0a830',
        },
        surface: '#fff8f2',
        background: '#fef6ee',
        'paw-pink': '#f4a0b4',
        'yarn-red': '#e05555',
        'fish-blue': '#5ca8d4',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '4px 4px 0 rgba(61, 44, 30, 0.12)',
        'card-hover': '6px 6px 0 rgba(61, 44, 30, 0.15)',
        'elevated': '8px 8px 0 rgba(61, 44, 30, 0.12)',
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'cat-bounce': 'catBounce 1.5s ease-in-out infinite',
        'cat-wiggle': 'catWiggle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        catBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        catWiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
