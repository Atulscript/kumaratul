/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "gh-canvas": "#ffffff",
        "gh-canvas-subtle": "#f6f8fa",
        "gh-border": "#d0d7de",
        "gh-border-muted": "#d8dee4",
        "gh-canvas-dark": "#0d1117",
        "gh-canvas-subtle-dark": "#161b22",
        "gh-subtle-dark": "#21262d",
        "gh-inset-dark": "#010409",
        "gh-border-dark": "#30363d",
        "gh-fg-dark": "#e6edf3",
        "gh-muted-dark": "#8b949e",
        "gh-accent": "#2f81f7",
        "gh-green": "#238636",
        "gh-purple": "#a371f7",
        "gh-yellow": "#d29922",
        "gh-red": "#f85149",
        "gh-orange": "#d29922"
      },
      borderRadius: { "gh": "6px" },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        mono: ["'JetBrains Mono'", "SFMono-Regular", "Consolas", "'Liberation Mono'", "Menlo", "monospace"],
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
