import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'chatgpt-main': '#1d1e20',
        'chatgpt-hover': '#1d1e20',
        'chatgpt-border': '#1d1e20',
        gray: {
          800: '#1d1e20',  // Override gray-800 with our color
        }
      },
      // ...existing theme config...
    }
  },
  // ...rest of config...
};
