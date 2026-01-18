import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // optional (biar aman kalau nanti bikin src)
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--primary)",
        background: "var(--background-one)",
        foreground: "var(--text-one)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--text-one)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--text-one)",
        },
        destructive: {
          DEFAULT: "var(--red-one)",
          foreground: "var(--text-one)",
        },
        muted: {
          DEFAULT: "var(--surface-three)",
          foreground: "var(--text-four)",
        },
        accent: {
          DEFAULT: "var(--tertiary)",
          foreground: "var(--text-one)",
        },
        popover: {
          DEFAULT: "var(--surface-seven)",
          foreground: "var(--text-one)",
        },
        card: {
          DEFAULT: "var(--surface-seven)",
          foreground: "var(--text-one)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config

export default config
