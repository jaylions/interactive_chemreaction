/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atom: {
          C: '#FACC15', // 노랑 (탄소)
          H: '#F8FAFC', // 하양 (수소)
          O: '#EF4444', // 빨강 (산소)
          N: '#3B82F6', // 파랑 (질소)
        },
      },
      aspectRatio: {
        '16/9': '16 / 9',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
