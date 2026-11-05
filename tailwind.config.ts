import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: "#0B2545",
          navy: "#001026",
          deep: "#1E3A8A",
          teal: "#00A896",
          tealDark: "#006B5F",
          tealLight: "#76F4E0",
          cardLight: "#FFFFFF",
          cardDark: "#131F37",
          bgLight: "#F8FAFC",
          bgDark: "#0A1120",
          surfaceDark: "#1E2D4A",
          borderLight: "#E2E8F0",
          borderDark: "#1E293B",
        },
        severity: {
          critical: "#DC2626",
          high: "#EA580C",
          medium: "#D97706",
          low: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderRadius: {
        gov: "12px",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
