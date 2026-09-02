import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aodi: {
          violet: {
            50: "#F6F0FA",
            100: "#E9DCF3",
            200: "#D2BBE4",
            500: "#7B3FA8",
            600: "#6B2D9A",
            700: "#4F1C7A",
            800: "#3D1560",
            900: "#2A0F3D",
            950: "#16071F",
          },
          gold: {
            DEFAULT: "#C9A84C",
            light: "#E4D19A",
            dark: "#A68532",
          },
          cream: {
            DEFAULT: "#F7F3EA",
            dark: "#EDE6D6",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-outfit)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 24px 80px -20px rgba(42, 15, 61, 0.35)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
