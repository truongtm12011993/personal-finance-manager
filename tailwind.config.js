/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7C3AED",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          400: "#22d3ee",
          500: "#06B6D4",
          600: "#0891b2",
        },
        fin: {
          bg:      "#F8FAFC",
          surface: "#FFFFFF",
          border:  "#F1F5F9",
          text:    "#1E293B",
          muted:   "#64748B",
        },
      },
      backgroundImage: {
        "fin-gradient": "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
        "gradient-primary": "linear-gradient(to right, #7C3AED, #06B6D4)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "SF Pro Text", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        "fin":      "0 4px 20px -2px rgba(0,0,0,0.04), 0 2px 10px -4px rgba(0,0,0,0.04)",
        "fin-md":   "0 8px 30px -4px rgba(0,0,0,0.08)",
        "fin-glow": "0 0 0 4px rgba(124,58,237,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease both",
        "slide-up": "slideUp 0.25s ease both",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
