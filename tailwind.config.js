/** @type {import('tailwindcss').Config} */
export default {
  // Tambahkan baris ini:
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
