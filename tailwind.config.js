/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            // Палитра Alvasti: ночь, пепел, кость, кровь и угли.
            colors: {
                night: { DEFAULT: "#0a0809", 900: "#120e0f", 800: "#1a1415", 700: "#241c1c" },
                bone: { DEFAULT: "#e8dfd0", muted: "#8f847a" },
                blood: { DEFAULT: "#b3261e", light: "#e0483c", dark: "#6e1410" },
                ember: "#ff7a3d",
            },
            fontFamily: {
                display: ["'Cormorant SC'", "Georgia", "serif"],
                sans: ["Manrope", "system-ui", "sans-serif"],
                mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
                hand: ["Caveat", "cursive"],
                serif: ["'Cormorant Garamond'", "Georgia", "serif"],
            },
        },
    },
    plugins: [],
};
