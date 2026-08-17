/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#1A1A19",
        darkCard: "#222220",
        darkCardHover: "#2B2B28",
        darkBorder: "#333330",
        glitter: {
          50: "#f0f7ff",
          100: "#e0effe",
          400: "#38bdf8",
          500: "#0070f3",
          600: "#0052cc",
          700: "#003db3",
          glow: "#00a3ff",
        },
      },
      animation: {
        'glitter-spin': 'glitterSpin 15s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        glitterSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(0, 163, 255, 0.6))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 35px rgba(0, 163, 255, 0.95))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        }
      },
    },
  },
  plugins: [],
};
