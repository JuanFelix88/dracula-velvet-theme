# Project guidelines

- Dracula Velvet is based on the custom Dracula palette from pnex.
- Keep editor implementations self-contained: Zed lives in `zed-theme/`; future ports get sibling folders.
- Edit `zed-theme/palette.json` and `zed-theme/scripts/build.mjs`, not the generated `zed-theme/themes/dracula-velvet.json`.
- Preserve the original ANSI palette unless a color change is explicitly requested.
- Keep comments and documentation comments upright and regular weight (`font_style: normal`, `font_weight: 400`).
- Run `npm ci`, `npm run build`, and `npm test` inside `zed-theme/`. Include the generated theme in commits.
- Keep installation non-destructive: back up existing theme files and never modify user settings automatically.
- Keep `README.md` concise and in English. Update it and this file when paths, commands, or project structure change.
- Do not commit `node_modules/`, backups, or local editor settings.
