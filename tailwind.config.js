/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#258cf4",
        background: { light: "#f5f7f8", dark: "#101922" },
        surface: { light: "#ffffff", dark: "#1c2632" },
      },
    },
  },
  plugins: [],
};