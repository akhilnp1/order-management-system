/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0F0D",
          soft: "#1A211D",
          faint: "#2E3A33",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          soft: "#F4F8F5",
        },
        signal: {
          DEFAULT: "#16A34A",
          deep: "#0B5D34",
          soft: "#DCFCE3",
          bright: "#22C55E",
        },
      },
      fontFamily: {
        display: [
          "-apple-system", "'Segoe UI'", "'Helvetica Neue'", "Arial", "sans-serif",
        ],
        body: [
          "-apple-system", "'Segoe UI'", "system-ui", "Arial", "sans-serif",
        ],
        mono: [
          "'SFMono-Regular'", "'SF Mono'", "Consolas", "'Liberation Mono'", "Menlo", "monospace",
        ],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "80%, 100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "flash-sweep": {
          "0%": { backgroundColor: "rgba(22,163,74,0.16)" },
          "100%": { backgroundColor: "rgba(22,163,74,0)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "bar-1": { "0%,100%": { height: "30%" }, "50%": { height: "90%" } },
        "bar-2": { "0%,100%": { height: "60%" }, "50%": { height: "20%" } },
        "bar-3": { "0%,100%": { height: "45%" }, "50%": { height: "75%" } },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite",
        "flash-sweep": "flash-sweep 1.2s ease-out",
        "rise-in": "rise-in 0.35s ease-out both",
        "bar-1": "bar-1 1s ease-in-out infinite",
        "bar-2": "bar-2 1s ease-in-out infinite 0.15s",
        "bar-3": "bar-3 1s ease-in-out infinite 0.3s",
      },
    },
  },
  plugins: [],
};

