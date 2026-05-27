const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'components', 'lib', 'prisma'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md']);
const BAD_RE = /(Ã.|Â.|â€|â€™|â€œ|â€|ï»¿|Ãƒ|Ã‚|�)/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && EXT.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(r));
const errors = [];

for (const file of files) {
  const buf = fs.readFileSync(file);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    errors.push(`${file}: BOM found`);
  }
  const txt = buf.toString('utf8');
  const lines = txt.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (BAD_RE.test(lines[i])) {
      errors.push(`${file}:${i + 1}: suspicious mojibake text`);
      break;
    }
  }
}

if (errors.length) {
  console.error('Encoding check failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`Encoding check passed (${files.length} files).`);
