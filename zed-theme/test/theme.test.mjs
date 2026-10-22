import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import Ajv from 'ajv';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const theme = read('themes/dracula-velvet.json');
const palette = read('palette.json');
const schema = read('schema/zed-theme-v0.2.0.json');
const style = theme.themes[0].style;

test('tema válido segundo o schema oficial do Zed', () => {
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  assert.ok(validate(theme), JSON.stringify(validate.errors, null, 2));
  assert.equal(theme.themes.length, 1);
  assert.equal(theme.name, 'Dracula Velvet');
  assert.equal(theme.themes[0].name, 'Dracula Velvet');
  assert.equal(theme.themes[0].appearance, 'dark');
  // The official schema allows extra properties: reject typos explicitly.
  for (const key of Object.keys(style)) {
    assert.ok(key in schema.definitions.ThemeStyleContent.properties, `Unknown style: ${key}`);
  }
});

test('todas as cores vêm da paleta do pnex, com alfa opcional', () => {
  const colors = new Set(Object.values(palette).filter(c => c.startsWith('#')).map(c => c.toLowerCase()));
  function check(value) {
    if (typeof value === 'string' && value.startsWith('#')) {
      assert.match(value, /^#[\da-f]{6}([\da-f]{2})?$/i);
      assert.ok(colors.has(value.slice(0, 7).toLowerCase()), value);
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(check);
    }
  }
  check(style);
});

test('fundo contínuo, cursor e seleção preservados', () => {
  for (const key of ['background', 'editor.background', 'editor.gutter.background', 'terminal.background', 'panel.background', 'title_bar.background', 'status_bar.background']) {
    assert.equal(style[key], palette.background, key);
  }
  assert.equal(style['editor.foreground'], palette.foreground);
  assert.equal(style.players[0].cursor, palette.cursor);
  assert.equal(style.players[0].selection, palette.selection);
});

test('as 16 cores ANSI são idênticas às do pnex', () => {
  for (const color of ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']) {
    assert.equal(style[`terminal.ansi.${color}`], palette[color]);
    assert.equal(style[`terminal.ansi.bright_${color}`], palette[`bright${color[0].toUpperCase()}${color.slice(1)}`]);
  }
});

test('artefato entregue é reproduzível', () => {
  const path = new URL('themes/dracula-velvet.json', root);
  const before = readFileSync(path, 'utf8');
  execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build.mjs', root))]);
  assert.equal(readFileSync(path, 'utf8'), before);
});

test('instalador copia o tema, preserva settings e faz backup ao reinstalar', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'dracula-velvet-'));
  try {
    const env = { ...process.env, APPDATA: temporary, XDG_CONFIG_HOME: temporary };
    const install = () => execFileSync(process.execPath, [fileURLToPath(new URL('scripts/install.mjs', root))], { env });
    install();
    const config = join(temporary, process.platform === 'win32' ? 'Zed' : 'zed');
    const installed = join(config, 'themes', 'dracula-velvet.json');
    const settings = '{"theme":"keep-current-theme"}\n';
    writeFileSync(join(config, 'settings.json'), settings);
    assert.deepEqual(JSON.parse(readFileSync(installed, 'utf8')), theme);
    writeFileSync(installed, 'previous theme');
    install();
    const backup = readdirSync(join(config, 'themes')).find(name => name.includes('.backup-'));
    assert.ok(backup);
    assert.equal(readFileSync(join(config, 'themes', backup), 'utf8'), 'previous theme');
    assert.equal(readFileSync(join(config, 'settings.json'), 'utf8'), settings);
    assert.deepEqual(JSON.parse(readFileSync(installed, 'utf8')), theme);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
