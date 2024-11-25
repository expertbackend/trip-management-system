/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom-white': '0 3px 3px rgb(255, 255, 255)',
      },
      
    },
  },
  plugins: [],
}
