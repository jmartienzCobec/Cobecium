/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "system-ui", "sans-serif"],
        display: ["Syne", "Barlow Condensed", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--border))",
        /* Base theme hex tokens for borders/patterns (style /2) */
        "base-orange": "var(--base-orange)",
        "base-teal": "var(--base-teal)",
        "base-card": "var(--base-card)",
      },
      borderColor: {
        "base-orange": "var(--base-orange)",
        "base-teal": "var(--base-teal)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-from-bottom-4": {
          "0%": { transform: "translateY(1rem)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-from-bottom-4": "slide-in-from-bottom-4 0.25s ease-out",
        "in": "fade-in 0.2s ease-out, slide-in-from-bottom-4 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
