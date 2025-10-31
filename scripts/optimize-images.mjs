// 批量生成 WebP/AVIF 与多尺寸缩略图
// 依赖: optionalDependencies 中的 sharp
import fs from 'fs'
import path from 'path'

let sharp
try {
  sharp = (await import('sharp')).default
} catch (e) {
  console.error('[img:optimize] 需要安装 sharp，运行: npm i -D sharp')
  process.exit(1)
}

const ROOT = process.cwd()
const ASSETS_DIR = path.join(ROOT, 'public', 'assets')
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png'])
const SIZES = [320, 480, 800, 1200]

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(full)
    else yield full
  }
}

async function convertOne(srcPath) {
  const ext = path.extname(srcPath).toLowerCase()
  if (!VALID_EXT.has(ext)) return
  const base = srcPath.slice(0, -ext.length)
  const buf = fs.readFileSync(srcPath)
  for (const w of SIZES) {
    const img = sharp(buf).resize({ width: w, withoutEnlargement: true })
    const webpOut = `${base}-w${w}.webp`
    const avifOut = `${base}-w${w}.avif`
    if (!fs.existsSync(webpOut)) {
      await img.webp({ quality: 72 }).toFile(webpOut)
      console.log('✔', path.relative(ROOT, webpOut))
    }
    if (!fs.existsSync(avifOut)) {
      await img.avif({ quality: 50 }).toFile(avifOut)
      console.log('✔', path.relative(ROOT, avifOut))
    }
  }
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('未找到 public/assets 目录')
    process.exit(1)
  }
  const tasks = []
  for (const p of walk(ASSETS_DIR)) tasks.push(convertOne(p))
  await Promise.all(tasks)
  console.log('完成：图片多格式/多尺寸已生成。')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


