import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');
const VALID_EXT = new Set(['.jpg', '.jpeg', '.mp4', '.mov']); // 保留视频文件和 .jpg/.jpeg

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function deleteNonJpgImages(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_EXT.has(ext)) {
    fs.unlinkSync(filePath);
    console.log('已删除:', filePath);
  }
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('未找到 public/assets 目录');
    process.exit(1);
  }
  for (const filePath of walk(ASSETS_DIR)) {
    deleteNonJpgImages(filePath);
  }
  console.log('完成：所有非 .jpg 格式的图片已删除。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});