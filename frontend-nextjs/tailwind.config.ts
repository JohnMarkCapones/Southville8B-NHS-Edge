import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Harmonious Blue-Based Color Palette
        "school-blue": "#2563EB", // Blue-600
        "school-gold": "#F59E0B", // Amber-500
        "school-green": "#10B981", // Emerald-500
        "school-red": "#EF4444", // Red-500

        // Blue-Harmonious Vibrant Colors
        "vibrant-blue": "#3B82F6", // Blue-500
        "vibrant-indigo": "#6366F1", // Indigo-500
        "vibrant-sky": "#0EA5E9", // Sky-500
        "vibrant-cyan": "#06B6D4", // Cyan-500
        "vibrant-teal": "#14B8A6", // Teal-500
        "vibrant-slate": "#64748B", // Slate-500

        // Accent colors that complement blue
        "accent-emerald": "#10B981", // Emerald-500
        "accent-amber": "#F59E0B", // Amber-500
        "accent-rose": "#F43F5E", // Rose-500
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        // Professional, subtle animations
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gentleGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" },
        },
        notification: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        notificationExit: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        searchExpand: {
          "0%": { width: "0", opacity: "0" },
          "100%": { width: "300px", opacity: "1" },
        },
        searchCollapse: {
          "0%": { width: "300px", opacity: "1" },
          "100%": { width: "0", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Professional animations
        fadeIn: "fadeIn 0.8s ease-out forwards",
        slideInUp: "slideInUp 0.8s ease-out forwards",
        slideInLeft: "slideInLeft 0.8s ease-out forwards",
        slideInRight: "slideInRight 0.8s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        gentleGlow: "gentleGlow 4s ease-in-out infinite",
        notification: "notification 0.3s ease-out",
        notificationExit: "notificationExit 0.3s ease-in",
        searchExpand: "searchExpand 0.3s ease-out",
        searchCollapse: "searchCollapse 0.3s ease-in",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
