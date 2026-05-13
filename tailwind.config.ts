import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        blush: {
          50: "#fff5f7",
          100: "#ffe5ec",
          200: "#ffd1dc",
          300: "#ffb3c6",
          400: "#ff8fae",
          500: "#f76b94",
          600: "#e34d7c",
          700: "#bd3a64",
          800: "#963154",
          900: "#7a2a47",
        },
        cream: {
          50: "#fffaf5",
          100: "#fff3e8",
          200: "#fde7d2",
          300: "#fad4ad",
        },
        ink: {
          900: "#2a1f24",
          800: "#3a2a31",
          700: "#5b424b",
          500: "#85636e",
          400: "#a6818c",
        },
        border: "hsl(340 30% 90%)",
        input: "hsl(340 30% 92%)",
        ring: "hsl(340 60% 70%)",
        background: "#fffaf6",
        foreground: "#2a1f24",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(243, 130, 165, 0.25)",
        glow: "0 0 40px -10px rgba(243, 130, 165, 0.35)",
        card: "0 4px 24px -6px rgba(154, 70, 92, 0.12)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "blush-gradient":
          "linear-gradient(135deg, #fff5f7 0%, #ffe5ec 50%, #fde7d2 100%)",
        "petal-gradient":
          "radial-gradient(circle at 20% 20%, #ffd1dc 0%, transparent 40%), radial-gradient(circle at 80% 60%, #fde7d2 0%, transparent 40%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
