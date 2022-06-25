/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#18191A",
        "dark-100": "#242526",
        "dark-200": "#3A3B3C",
        "dark-300": "#4E4F50",
        primary: "#1A77F2",
      },
    },
  },
  plugins: [],
};
