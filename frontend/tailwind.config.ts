import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-hover": "#4f46e5",
        success: "#10b981",
        "success-hover": "#059669",
        danger: "#ef4444",
        "danger-hover": "#dc2626",
        secondary: "#64748b",
        "bg-dark": "#0f172a",
        "bg-card": "#1e293b",
        "bg-card-hover": "#334155",
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
        "border-color": "#334155",
      },
      animation: {
        pulse: "pulse 2s infinite",
        wave: "wave 1.2s ease-in-out infinite",
        slideIn: "slideIn 0.5s ease-out",
        bounce: "bounce 2s infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { height: "20px" },
          "50%": { height: "60px" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
