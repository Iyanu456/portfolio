import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        accent: "#F05A28",
        muted: "var(--color-muted)",
        line: "var(--color-line)"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Arial", "Helvetica", "sans-serif"]
      },
      letterSpacing: {
        editorial: "-0.055em"
      },
      boxShadow: {
        quiet: "0 12px 40px rgba(23, 23, 23, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
