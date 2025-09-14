/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
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
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      width: {
        sidebar: "240px",
        "sidebar-collapsed": "64px",
      },
      height: {
        header: "64px",
      },
    },
  },
  plugins: [],
};
