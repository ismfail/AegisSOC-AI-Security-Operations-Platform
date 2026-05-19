import type { Config } from "tailwindcss";

const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#09111f",
        panel: "#101b2e",
        signal: "#12d6a7",
        pulse: "#3b82f6",
        risk: "#f97316",
        breach: "#ef4444"
      },
      boxShadow: {
        glow: "0 18px 55px rgba(18, 214, 167, 0.16)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
