import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const config = process.platform === 'win32'
  ? join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Zed')
  : join(process.env.XDG_CONFIG_HOME || join(homedir(), '.config'), 'zed');
const directory = join(config, 'themes');
const destination = join(directory, 'dracula-velvet.json');
mkdirSync(directory, { recursive: true });
if (existsSync(destination)) {
  const backup = `${destination}.backup-${Date.now()}`;
  copyFileSync(destination, backup);
  console.log(`Backup: ${backup}`);
}
copyFileSync(new URL('../themes/dracula-velvet.json', import.meta.url), destination);
console.log(`Installed: ${destination}`);
console.log('Restart Zed and select Dracula Velvet using "theme selector: toggle".');
console.log('settings.json was not modified.');
