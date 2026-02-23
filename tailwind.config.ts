import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        accent: {
          violet: "#8B5CF6",
          pink: "#EC4899",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(236, 72, 153, 0.2)",
        "glow-sm": "0 0 15px rgba(139, 92, 246, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
