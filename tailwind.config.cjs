/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--accent)",
        border: "var(--border)",
        background: "var(--bg-main)",
        foreground: "var(--text-primary)",
        muted: {
          DEFAULT: "var(--text-muted)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-hover)",
        },
        card: "var(--bg-card)",
        soft: "var(--bg-soft)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
