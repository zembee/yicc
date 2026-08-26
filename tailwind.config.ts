import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#212542",
          50: "#f4f5fa",
          100: "#e8eaf3",
          700: "#2d335a",
          800: "#212542",
          900: "#171a2e",
        },
        coral: {
          DEFAULT: "#FB7170",
          50: "#fff5f5",
          100: "#FFD7D7",
          400: "#fb8584",
          500: "#FB7170",
          600: "#e85857",
        },
        lavender: {
          DEFAULT: "#DBDFFF",
          50: "#f4f6ff",
          100: "#DBDFFF",
          200: "#c2c9ff",
          500: "#5867e8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8F9FA",
          border: "#EEEEEE",
        },
        ink: {
          DEFAULT: "#292929",
          muted: "#6B7280",
          subtle: "#9CA3AF",
        }
      },
      fontFamily: {
        sans: ['Kanit', 'Prompt', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(33, 37, 66, 0.05), 0 2px 6px -1px rgba(33, 37, 66, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(33, 37, 66, 0.08), 0 4px 10px -2px rgba(33, 37, 66, 0.04)',
        'modal': '0 20px 40px -15px rgba(33, 37, 66, 0.2)',
      }
    },
  },
  plugins: [],
};
export default config;
