/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta baseada na Identidade Visual (Azul Profundo + Laranja)
        navy: {
          DEFAULT: '#000D23', // Fundo Principal (Dark)
          light: '#04308C',   // Cards / Secundária
        },
        primary: {
          DEFAULT: '#007BBA', // Azul Vibrante (Ação)
          dark: '#005a8d',    // Hover
          light: '#4DB5F0',   // Detalhes
        },
        // Adicionei 'secondary' mapeando para navy-light para corrigir seu erro
        secondary: {
            DEFAULT: '#04308C', 
        },
        accent: {
          DEFAULT: '#F97316', // Laranja (Destaque/Alertas)
        },
        white: '#FFFFFF',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon': '0 0 15px rgba(0, 123, 186, 0.3)', // Brilho azul suave
        'neon-accent': '0 0 15px rgba(249, 115, 22, 0.3)', // Brilho laranja
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}