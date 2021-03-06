/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: "#18191A",
        "dark-100": "#242526",
        "dark-200": "#3A3B3C",
        "dark-300": "#4E4F50",
        "light-100": "#F0F2F5",
        "light-200": "#E4E6EA",
        "light-300": "#D8DADE",
        primary: "#1A77F2",
      },
    },
  },
  plugins: [],
};
