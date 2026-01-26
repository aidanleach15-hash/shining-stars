/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "stars-green": "#007A33",
        "stars-black": "#000000",
        "stars-white": "#ffffff",
        "stars-gray": "#F2F2F2",
      },
    },
  },
  plugins: [],
};
