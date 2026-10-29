/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080A0D',
          sidebar: '#0C0F12',
          card: '#171A1F',
          elevated: '#20242A',
        },
        accent: {
          cyan: '#00E5F2',
          teal: '#00BFA6',
        },
        text: {
          primary: '#F4F7FA',
          secondary: '#929CA8',
        },
        border: {
          DEFAULT: '#30363D',
        },
        status: {
          success: '#28D7A0',
          warning: '#FFB547',
          danger: '#FF626E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 12px rgba(0, 229, 242, 0.25)',
        'glow-teal': '0 0 12px rgba(0, 191, 166, 0.25)',
        'glow-sm': '0 0 6px rgba(0, 229, 242, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
