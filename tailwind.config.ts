/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        celo: { DEFAULT: '#35D07F', dark: '#1a8f53' },
        midnight: '#0a0b1e',
        card: '#13143a',
      }
    },
  },
  plugins: [],
}
