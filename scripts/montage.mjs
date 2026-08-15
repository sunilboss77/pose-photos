import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const CATEGORY_COUNTS = {
  trending: 30,
  aesthetic: 30,
  selfie: 30,
  couple: 20,
  friend: 20,
  family: 20,
  kid: 23,
}

const category = process.argv[2]
if (!category || !CATEGORY_COUNTS[category]) {
  console.error('usage: node scripts/montage.mjs <category>')
  process.exit(1)
}

const count = CATEGORY_COUNTS[category]
const cell = 220
const cols = 5
const rows = Math.ceil(count / cols)
const W = cols * cell
const H = rows * cell

const posesDir = path.join(process.cwd(), 'public', 'poses')
const composites = []

for (let i = 1; i <= count; i++) {
  const file = path.join(posesDir, `${category}-${i}.png`)
  const col = (i - 1) % cols
  const row = Math.floor((i - 1) / cols)
  const x = col * cell
  const y = row * cell
  if (!fs.existsSync(file)) continue
  const img = await sharp(file)
    .resize(cell - 8, cell - 8, { fit: 'contain', background: { r: 0, g: 0, b: 0 } })
    .toBuffer()
  composites.push({ input: img, left: x + 4, top: y + 4 })
  // number label
  const label = Buffer.from(
    `<svg width="${cell}" height="40"><text x="6" y="30" font-size="30" font-family="sans-serif" fill="#00ff88" font-weight="bold">${i}</text></svg>`,
  )
  composites.push({ input: label, left: x, top: y })
}

const out = path.join('/tmp/montage', `${category}.png`)
fs.mkdirSync('/tmp/montage', { recursive: true })
await sharp({ create: { width: W, height: H, channels: 3, background: { r: 15, g: 15, b: 15 } } })
  .composite(composites)
  .png()
  .toFile(out)
console.log('wrote', out, `${W}x${H}`)
