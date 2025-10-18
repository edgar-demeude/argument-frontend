/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        surfaceAlt: "var(--surface-alt)",
        border: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
        },
        foreground: "var(--foreground)",
        muted: "var(--muted)",
      },
    },
  },
  plugins: [],
};
