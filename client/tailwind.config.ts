import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        brand: {
          50: '#FFF1EC',
          100: '#FFE1D7',
          200: '#FFC3B3',
          300: '#FF9C83',
          400: '#FF7658',
          500: '#F35B3F',
          600: '#DE452E',
          700: '#B93625',
          800: '#8F2B23',
          900: '#63241F',
        },
        sky: {
          DEFAULT: '#0EA5E9',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        ink: '#17242B',
        surface: {
          DEFAULT: '#F7F5F0',
          dark: '#101B20',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#111A2E',
        },
        line: {
          DEFAULT: '#E5E7EB',
          dark: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)',
        lift: '0 4px 8px rgba(15,23,42,0.06), 0 16px 32px rgba(15,23,42,0.10)',
        glow: '0 8px 32px rgba(37,99,235,0.24)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #DE452E 0%, #F39A45 100%)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
