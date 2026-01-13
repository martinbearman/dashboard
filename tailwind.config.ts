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
        tron: {
          bg: "var(--tron-bg)",
          grid: "var(--tron-grid)",
          neon: "var(--tron-neon)",
          text: "var(--tron-text)",
          glow: "var(--tron-glow)",
          border: "var(--tron-border)",
        },
      },
    },
  },
  plugins: [],
};
export default config;

