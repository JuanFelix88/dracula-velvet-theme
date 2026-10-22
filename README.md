# Dracula Velvet

A darker Dracula palette with soft pink and muted red, originally made for pnex.

## Zed

Download [`dracula-velvet.json`](zed-theme/themes/dracula-velvet.json) and place it in:

- **Windows:** `%APPDATA%\Zed\themes\`
- **macOS / Linux:** `~/.config/zed/themes/`

Restart Zed, run `theme selector: toggle`, and select **Dracula Velvet**.

Or install from this repository with Node.js:

```sh
node zed-theme/scripts/install.mjs
```

The installer backs up an existing copy and leaves your settings unchanged.

## Development

Each editor lives in its own folder. The Zed implementation is in [`zed-theme/`](zed-theme/).

```sh
cd zed-theme
npm ci
npm run build
npm test
```

Requires Node.js 20+. Edit `palette.json` for colors or `scripts/build.mjs` for mappings. The generated JSON is ready to use; no binary compilation required.
