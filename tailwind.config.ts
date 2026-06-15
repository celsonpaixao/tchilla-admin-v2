import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Marca Tchilla
        blue: {
          DEFAULT: "#14AAE9",
          50: "#E8F7FE",
          100: "#C2EBFB",
          200: "#8FD9F7",
          600: "#0E8FCB",
          700: "#0A6F9E",
          800: "#0A567A",
        },
        navy: {
          DEFAULT: "#0E2A42",
          700: "#1C3A52",
          800: "#122B40",
          900: "#0A2030",
        },
        pink: {
          DEFAULT: "#FF4D8D",
          50:  "#FFF1F6",
          100: "#FFE3EC",
          200: "#FFC6D9",
          400: "#FF6FA0",
          600: "#ED2F74",
          700: "#C81E5E",
          800: "#A41A4F",
        },
        // Cinzas quentes (de acordo com o design system)
        gray: {
          25: "#FBFAF9",
          50: "#F6F5F3",
          100: "#EFEDEA",
          150: "#E9E6E2",
          200: "#E2DFDA",
          300: "#D2CEC8",
          400: "#ABA69E",
          500: "#827D75",
          600: "#615C55",
          700: "#47433D",
          800: "#2F2C27",
          900: "#1C1A17",
        },
        // Status
        success: {
          DEFAULT: "#1F8A5B",
          bg: "#E7F6EE",
          fg: "#136B45",
          bd: "#BFE6CF",
        },
        warning: {
          DEFAULT: "#C07C12",
          bg: "#FBF1DB",
          fg: "#8A5A12",
          bd: "#EFD9A8",
        },
        danger: {
          DEFAULT: "#C0392B",
          bg: "#FBEAE8",
          fg: "#9A2A20",
          bd: "#EFC9C4",
        },
        // Semânticos
        background: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--blue)",
          hover: "#0F97D0",
          press: "#0E8FCB",
        },
      },
      fontFamily: {
        sans:    ["Hanken Grotesk", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        mono:    ["Space Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        md: ["15px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "28px" }],
        "2xl": ["20px", { lineHeight: "30px" }],
        "3xl": ["24px", { lineHeight: "32px" }],
        "4xl": ["28px", { lineHeight: "36px" }],
      },
      borderRadius: {
        xs: "3px",
        sm: "5px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "18px",
        "2xl": "24px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(14,42,66,.06)",
        sm: "0 1px 3px rgba(14,42,66,.08), 0 1px 2px rgba(14,42,66,.05)",
        DEFAULT: "0 4px 12px -2px rgba(14,42,66,.12), 0 2px 6px -2px rgba(14,42,66,.07)",
        md: "0 4px 12px -2px rgba(14,42,66,.12), 0 2px 6px -2px rgba(14,42,66,.07)",
        lg: "0 16px 40px -12px rgba(14,42,66,.22), 0 6px 14px -8px rgba(14,42,66,.12)",
        pink: "0 10px 28px -10px rgba(255,77,141,.45)",
      },
      spacing: {
        sidebar: "240px",
        topbar: "60px",
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
        "slide-in-up": "slide-in-up 0.2s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        shimmer: "shimmer 1.8s infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;
