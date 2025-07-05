// client/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'golden': '#E6D690',  // Matches your logo perfectly
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}