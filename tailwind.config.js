/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],

  theme: {
    extend: {
      keyframes: {
        move: {
          '100%': { transform: 'translate3d(0, 0, 1px) rotate(360deg)' }
        }
      },
      animation: {
        move: 'move 16s linear infinite'
      }
    }
  },

  plugins: []
};
