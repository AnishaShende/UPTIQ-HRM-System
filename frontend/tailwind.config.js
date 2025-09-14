// import { Config } from 'tailwindcss' // Not needed in JS config files

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary colors from design system
        primary: {
          purple: {
            light: "#E8DCFF",
            medium: "#C4A9FF",
            dark: "#8B5FBF",
          },
          green: {
            light: "#D4F4DD",
            medium: "#A8E6C1",
            dark: "#4CAF50",
          },
          orange: {
            light: "#FFE4D6",
            medium: "#FFB08A",
            dark: "#FF7043",
          },
          blue: {
            light: "#E3F2FD",
            medium: "#90CAF9",
            dark: "#2196F3",
          },
        },
        // Neutral colors
        neutral: {
          white: "#FFFFFF",
          background: "#F8F9FA",
          cardBackground: "#FFFFFF",
          border: "#E9ECEF",
          shadow: "rgba(0, 0, 0, 0.08)",
        },
        // Text colors
        text: {
          primary: "#2C3E50",
          secondary: "#7F8C8D",
          muted: "#BDC3C7",
        },
        // Accent colors
        accent: {
          success: "#27AE60",
          warning: "#F39C12",
          error: "#E74C3C",
          info: "#3498DB",
        },
        // Standard color overrides for compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
        xl: "16px",
        "2xl": "24px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      spacing: {
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      boxShadow: {
        card: "0 4px 20px 0 rgba(0, 0, 0, 0.08)",
        soft: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
  plugins: [require("tailwindcss-animate")],
}

export default config
