import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'steinbeis-purple': '#6a007d',
        'steinbeis-purple-light': '#8b00a8',
        'steinbeis-green': '#5e9c51',
        'steinbeis-gray': '#434549',
        'steinbeis-bg': '#f9f9fb',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
