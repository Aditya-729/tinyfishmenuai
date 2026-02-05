import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "midnight-900": "#0b1220",
        "midnight-800": "#101a2c",
        "midnight-700": "#16253f",
        "frost-100": "#f8fafc",
        "frost-200": "#e2e8f0",
        "lava-500": "#fb7185",
        "mint-500": "#22d3ee",
      },
      boxShadow: {
        soft: "0 24px 60px rgba(15, 23, 42, 0.35)",
        neumorphic:
          "16px 16px 32px rgba(12, 18, 30, 0.65), -12px -12px 24px rgba(255, 255, 255, 0.04)",
        clay:
          "0 14px 30px rgba(15, 23, 42, 0.25), inset 0 4px 12px rgba(255, 255, 255, 0.15)",
        glass:
          "0 8px 30px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top, rgba(56, 189, 248, 0.25), transparent 55%), radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.3), transparent 50%)",
        "clay-gradient":
          "linear-gradient(135deg, rgba(94, 234, 212, 0.4), rgba(251, 113, 133, 0.35))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        reveal: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0px)", opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        reveal: "reveal 0.7s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
