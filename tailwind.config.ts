import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
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
        panel: "0 24px 80px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
