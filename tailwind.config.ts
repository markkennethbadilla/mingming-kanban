import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Ensure all relevant files are included
    "./public/**/*.html", // Include static HTML if applicable
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        neutral: "var(--neutral)",
      },
      fontFamily: {
        sans: ["Poppins", "Nunito", "sans-serif"],
      },
      boxShadow: {
        "soft-card": "0 4px 8px rgba(0, 0, 0, 0.05)",
        "hover-card": "0 6px 12px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        "rounded-card": "12px",
        "button-round": "9999px",
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
