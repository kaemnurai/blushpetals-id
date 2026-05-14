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
          300: "#c4a0a9",
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
        "4xl": "2.5rem",
        "5xl": "3rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(243, 130, 165, 0.28)",
        glow: "0 0 40px -8px rgba(243, 130, 165, 0.5)",
        "glow-sm": "0 0 20px -8px rgba(243, 130, 165, 0.45)",
        card: "0 4px 24px -6px rgba(154, 70, 92, 0.12), 0 1px 4px -2px rgba(154, 70, 92, 0.06)",
        premium:
          "0 20px 60px -15px rgba(154, 70, 92, 0.22), 0 4px 20px -8px rgba(243, 130, 165, 0.18)",
        float:
          "0 8px 32px -8px rgba(154, 70, 92, 0.2), 0 0 0 1px rgba(255, 209, 220, 0.45)",
        elevated:
          "0 2px 8px rgba(0,0,0,0.04), 0 12px 40px -12px rgba(154, 70, 92, 0.16)",
        "inner-glow": "inset 0 0 20px rgba(247, 107, 148, 0.08)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-6px) rotate(0.8deg)" },
          "66%": { transform: "translateY(-3px) rotate(-0.4deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-wa": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37, 211, 102, 0.38)" },
          "60%": { boxShadow: "0 0 0 10px rgba(37, 211, 102, 0)" },
        },
        "pulse-blush": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(247, 107, 148, 0.3)" },
          "60%": { boxShadow: "0 0 0 10px rgba(247, 107, 148, 0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-gentle": "float-gentle 8s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-wa": "pulse-wa 2.4s ease-in-out infinite",
        "pulse-blush": "pulse-blush 2.4s ease-in-out infinite",
        "slide-up": "slide-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
      },
      backgroundImage: {
        "blush-gradient":
          "linear-gradient(135deg, #fff8f9 0%, #ffe8ef 45%, #fef3ea 100%)",
        "petal-gradient":
          "radial-gradient(ellipse at 18% 18%, rgba(255, 209, 220, 0.75) 0%, transparent 48%), radial-gradient(ellipse at 82% 72%, rgba(253, 231, 210, 0.75) 0%, transparent 48%)",
        "hero-texture":
          "radial-gradient(circle at 28% 22%, rgba(255, 209, 220, 0.55) 0%, transparent 52%), radial-gradient(circle at 72% 78%, rgba(253, 231, 210, 0.55) 0%, transparent 52%), linear-gradient(150deg, #fff8f9 0%, #fef8f4 100%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)",
        "footer-gradient":
          "linear-gradient(180deg, #fffaf6 0%, #fff5f7 50%, #ffe5ec 100%)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
