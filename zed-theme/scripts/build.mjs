import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const p = JSON.parse(readFileSync(new URL('palette.json', root), 'utf8'));
const alpha = (color, opacity) => color + opacity;
const transparent = alpha(p.background, '00');

// Preserve pnex's continuous background; lift only interactive surfaces.
const style = {
  'background.appearance': 'opaque',
  background: p.background,
  'surface.background': p.background,
  'elevated_surface.background': p.black,
  border: alpha(p.brightBlack, '40'),
  'border.variant': alpha(p.brightBlack, '26'),
  'border.focused': p.blue,
  'border.selected': p.blue,
  'border.transparent': transparent,
  'border.disabled': alpha(p.brightBlack, '26'),
  'element.background': p.black,
  'element.hover': p.cursorAccent,
  'element.active': p.selection,
  'element.selected': p.selection,
  'element.disabled': p.background,
  'ghost_element.background': transparent,
  'ghost_element.hover': p.cursorAccent,
  'ghost_element.active': p.selection,
  'ghost_element.selected': p.selection,
  'ghost_element.disabled': transparent,
  'drop_target.background': alpha(p.blue, '26'),
  text: p.foreground,
  'text.muted': p.brightBlack,
  'text.placeholder': p.brightBlack,
  'text.disabled': alpha(p.brightBlack, '99'),
  'text.accent': p.blue,
  icon: p.foreground,
  'icon.muted': p.brightBlack,
  'icon.placeholder': p.brightBlack,
  'icon.disabled': alpha(p.brightBlack, '99'),
  'icon.accent': p.blue,
  'status_bar.background': p.background,
  'title_bar.background': p.background,
  'title_bar.inactive_background': p.background,
  'toolbar.background': p.background,
  'tab_bar.background': p.background,
  'tab.inactive_background': p.background,
  'tab.active_background': p.black,
  'panel.background': p.background,
  'panel.focused_border': p.blue,
  'panel.indent_guide': alpha(p.brightBlack, '26'),
  'panel.indent_guide_active': p.brightBlack,
  'panel.indent_guide_hover': p.selection,
  'pane.focused_border': alpha(p.blue, '66'),
  'pane_group.border': alpha(p.brightBlack, '40'),
  'scrollbar.thumb.background': alpha(p.brightBlack, '40'),
  'scrollbar.thumb.hover_background': alpha(p.brightBlack, '80'),
  'scrollbar.thumb.border': transparent,
  'scrollbar.track.background': transparent,
  'scrollbar.track.border': transparent,
  'editor.foreground': p.foreground,
  'editor.background': p.background,
  'editor.gutter.background': p.background,
  'editor.subheader.background': p.black,
  'editor.active_line.background': alpha(p.black, '99'),
  'editor.highlighted_line.background': p.black,
  'editor.line_number': p.brightBlack,
  'editor.active_line_number': p.foreground,
  'editor.invisible': alpha(p.brightBlack, '66'),
  'editor.wrap_guide': alpha(p.brightBlack, '26'),
  'editor.active_wrap_guide': alpha(p.brightBlack, '66'),
  'editor.indent_guide': alpha(p.brightBlack, '26'),
  'editor.indent_guide_active': alpha(p.brightBlack, '80'),
  'editor.document_highlight.read_background': alpha(p.cyan, '1f'),
  'editor.document_highlight.write_background': alpha(p.blue, '26'),
  'editor.document_highlight.bracket_background': alpha(p.blue, '33'),
  'search.match_background': alpha(p.yellow, '33'),
  'link_text.hover': p.cyan,
  'terminal.background': p.background,
  'terminal.foreground': p.foreground,
  'terminal.bright_foreground': p.brightWhite,
  'terminal.dim_foreground': p.brightBlack,
  'terminal.ansi.background': p.background,
};

// Copy all 16 ANSI colors without substituting the stock Dracula palette.
for (const color of ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']) {
  style[`terminal.ansi.${color}`] = p[color];
  style[`terminal.ansi.bright_${color}`] = p[`bright${color[0].toUpperCase()}${color.slice(1)}`];
}

for (const [state, color] of Object.entries({
  conflict: p.yellow,
  created: p.green,
  deleted: p.red,
  error: p.red,
  hidden: p.brightBlack,
  hint: p.cyan,
  ignored: p.brightBlack,
  info: p.cyan,
  modified: p.blue,
  predictive: p.brightBlack,
  renamed: p.cyan,
  success: p.green,
  unreachable: p.brightBlack,
  warning: p.yellow,
})) {
  style[state] = color;
  style[`${state}.background`] = alpha(color, '1a');
  style[`${state}.border`] = alpha(color, '66');
}

style.accents = [p.blue, p.magenta, p.cyan, p.green, p.yellow, p.red];
style.players = [
  { cursor: p.cursor, background: p.cursor, selection: p.selection },
  ...style.accents.map(color => ({ cursor: color, background: color, selection: alpha(color, '33') })),
];

// pnex has no editor syntax theme. Map language captures onto its existing colors.
const token = (color, extra = {}) => ({ color, ...extra });
style.syntax = {
  attribute: token(p.green),
  boolean: token(p.blue),
  comment: token(p.brightBlack, { font_style: 'italic' }),
  'comment.doc': token(p.brightBlack, { font_style: 'italic' }),
  constant: token(p.blue),
  constructor: token(p.cyan),
  embedded: token(p.foreground),
  emphasis: token(p.foreground, { font_style: 'italic' }),
  'emphasis.strong': token(p.foreground, { font_weight: 700 }),
  enum: token(p.cyan),
  function: token(p.green),
  'function.builtin': token(p.cyan),
  'function.method': token(p.green),
  'function.macro': token(p.green),
  hint: token(p.cyan),
  keyword: token(p.magenta),
  label: token(p.cyan),
  link_text: token(p.cyan),
  link_uri: token(p.cyan),
  namespace: token(p.cyan),
  number: token(p.blue),
  operator: token(p.magenta),
  predictive: token(p.brightBlack),
  preproc: token(p.magenta),
  primary: token(p.foreground),
  property: token(p.foreground),
  punctuation: token(p.foreground),
  'punctuation.bracket': token(p.foreground),
  'punctuation.delimiter': token(p.foreground),
  'punctuation.list_marker': token(p.magenta),
  'punctuation.special': token(p.magenta),
  string: token(p.yellow),
  'string.escape': token(p.magenta),
  'string.regex': token(p.cyan),
  'string.special': token(p.cyan),
  'string.special.symbol': token(p.blue),
  tag: token(p.magenta),
  'text.literal': token(p.yellow),
  title: token(p.blue, { font_weight: 700 }),
  type: token(p.cyan),
  'type.builtin': token(p.cyan),
  variable: token(p.foreground),
  'variable.special': token(p.blue),
  variant: token(p.blue),
};

const theme = {
  $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
  name: 'Dracula Velvet',
  author: 'Juan Andrade',
  themes: [{ name: 'Dracula Velvet', appearance: 'dark', style }],
};
mkdirSync(new URL('themes/', root), { recursive: true });
writeFileSync(new URL('themes/dracula-velvet.json', root), JSON.stringify(theme, null, 2) + '\n');
console.log('Generated: themes/dracula-velvet.json');
