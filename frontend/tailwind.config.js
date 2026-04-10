/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d6efd',
        accent: '#06b6d4'
      }
    }
  },
  plugins: [],
}
