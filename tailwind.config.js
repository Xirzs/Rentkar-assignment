/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",      // pages router
    "./app/**/*.{js,ts,jsx,tsx}",        // app router
    "./components/**/*.{js,ts,jsx,tsx}", // components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
