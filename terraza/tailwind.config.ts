import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#faf7f2',
          100: '#f5f0e6',
          200: '#e8dfc8',
          300: '#dcc7a1',
          400: '#d1ad7a',
          500: '#c8a96e',
          600: '#b89651',
          700: '#967a3d',
          800: '#6b5629',
          900: '#4a3c1a',
          950: '#2a220d',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
