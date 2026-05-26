import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        night: "#080b18",
        ink: "#11172a",
        electric: "#5ee7ff",
        violet: "#8b5cf6",
        magenta: "#d946ef",
        lime: "#a3e635"
      },
      boxShadow: {
        glow: "0 0 60px rgba(94, 231, 255, 0.18)",
        halo: "0 0 0 1px rgba(255,255,255,0.08), 0 22px 70px rgba(0,0,0,0.34)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.28)"
      },
      animation: {
        "gradient-shift": "gradient-shift 12s ease infinite",
        "float-soft": "float-soft 8s ease-in-out infinite",
        "draw-line": "draw-line 1.2s ease-out both"
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "float-soft": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -8px, 0)" }
        },
        "draw-line": {
          from: { strokeDashoffset: "820" },
          to: { strokeDashoffset: "0" }
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
