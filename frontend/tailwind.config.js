/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { 
        primary: "#A52A2A",
        secondary: "#FFEC81",
        tertiary: "#FADADD",
        base: "#FFFFF",
        text: "#1C1C1C"
      },
    },
    fontFamily: {
      heading: ["Playfair Display", "serif"],
      display: ['Lato', "serif"]
    }
  },
  plugins: [],
}