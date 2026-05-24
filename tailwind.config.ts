import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: { DEFAULT: '#E8860A', l: '#FEF3E2', d: '#7A430A', m: '#F5A623' },
        purple: { DEFAULT: '#534AB7', l: '#EEEDFE', d: '#26215C', m: '#8078D8' },
        rose: { DEFAULT: '#C84B6E', l: '#FCEEF3' },
        teal: { DEFAULT: '#1D9E75', l: '#E1F5EE' },
        earth: { DEFAULT: '#8B5E3C', l: '#F5EDE3' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
