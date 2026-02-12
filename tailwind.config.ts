import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'claw': {
          'primary': '#6366f1',
          'secondary': '#8b5cf6',
          'accent': '#06b6d4',
          'surface': '#1e1b4b',
          'surface-light': '#312e81',
        },
      },
    },
  },
  plugins: [],
};

export default config;
