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
        space: {
          950: '#030712',
          900: '#0B0F19',
          850: '#111827',
          800: '#1F2937',
          700: '#374151',
          cyan: '#38BDF8',
          nebula: '#818CF8',
          starlight: '#F59E0B',
          cosmic: '#A855F7',
          aurora: '#10B981'
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, #1E1B4B 0%, #0B0F19 60%, #030712 100%)',
        'nebula-glow': 'radial-gradient(circle at 50% 50%, rgba(129, 140, 248, 0.15) 0%, transparent 60%)',
        'cyan-glow': 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 60%)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
