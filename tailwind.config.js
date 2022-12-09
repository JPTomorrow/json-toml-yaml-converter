/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#fff",
        "primary-2": "#fff",
        secondary: "#000",
        "secondary-2": "#000",
      },
    },
  },
  plugins: [],
};
