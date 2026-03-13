/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // Example blue
        secondary: '#f97316', // Example orange (clearance feel)
      }
    },
  },
  plugins: [],
}
