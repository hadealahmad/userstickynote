# Twitter Sticky Notes

A Chrome extension that lets you attach private sticky notes to Twitter (X) user profiles and timeline tweets.

## Features
- **Profile & Timeline Integration**: seamless UI injection next to timeline tweet actions and profile user actions.
- **Multiple Notes**: Add, edit, and keep track of multiple secure notes for each single user.
- **Context Source**: Notes inherently capture the source tweet or profile URL as reading context so you can trace your thoughts back.
- **Shadcn UI**: Includes modern interfaces that are native to dark mode and Vue 3 reactive states.

## Getting Started
It's built with Vite, Vue 3, Shadcn-Vue, Tailwind, and CRXJS.

1. Install dependencies:
   ```bash
   bun install
   ```
2. Build extension:
   ```bash
   bun run build
   ```
3. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer Mode" on the top right
   - Click "Load unpacked" and select the `dist` folder generated from the build

## License
MIT
