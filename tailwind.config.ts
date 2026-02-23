import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "glow-up": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(34, 197, 94, 0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.8)" },
        },
        "glow-down": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.8)" },
          "50%": { boxShadow: "0 0 8px rgba(34, 197, 94, 0.4)" },
        },
      },
      animation: {
        "glow-up": "glow-up 2s ease-in-out infinite",
        "glow-down": "glow-down 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

