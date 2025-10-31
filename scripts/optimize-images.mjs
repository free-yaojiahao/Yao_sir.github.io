// 压缩图片为 AVIF 格式
import fs from 'fs';
import path from 'path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('[img:optimize] 需要安装 sharp，运行: npm i -D sharp');
  process.exit(1);
}

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png']);

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function convertToAvif(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (!VALID_EXT.has(ext)) return;
  const base = srcPath.slice(0, -ext.length);
  const avifOut = `${base}.avif`;
  const buf = fs.readFileSync(srcPath);

  if (!fs.existsSync(avifOut)) {
    const img = sharp(buf);
    await img.avif({ quality: 50 }).toFile(avifOut);
    console.log('✔', path.relative(ROOT, avifOut));
  }
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('未找到 public/assets 目录');
    process.exit(1);
  }
  const tasks = [];
  for (const p of walk(ASSETS_DIR)) tasks.push(convertToAvif(p));
  await Promise.all(tasks);
  console.log('完成：图片已压缩为 AVIF 格式。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});