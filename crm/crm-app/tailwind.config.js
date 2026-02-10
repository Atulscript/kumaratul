/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Discord-inspired theme matching your main site
        'discord-bg': '#313338',
        'discord-sidebar': '#2b2d31',
        'discord-element': '#1e1f22',
        'discord-hover': '#404249',
        'discord-blurple': '#5865F2',
        'discord-blurple-dark': '#4752C4',
        'discord-green': '#23a559',
        'discord-red': '#f23f43',
        'discord-text': '#f2f3f5',
        'discord-muted': '#949ba4',
        'discord-divider': '#3f4147',
      },
    },
  },
  plugins: [],
}
