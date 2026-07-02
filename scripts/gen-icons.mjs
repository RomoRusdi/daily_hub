// One-off icon generator: draws the monochrome "H" mark into PNGs using
// only Node built-ins (zlib). Run: `node scripts/gen-icons.mjs`.
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('public')

const BG = [10, 10, 10] // #0A0A0A
const FG = [245, 245, 245] // #F5F5F5

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function drawIcon(size) {
  // RGBA raster, rounded-square dark bg with a light "H".
  const px = Buffer.alloc(size * size * 4)
  const radius = size * 0.22
  const stroke = size * 0.066
  const top = size * 0.29
  const bottom = size * 0.71
  const left = size * 0.34
  const right = size * 0.66
  const midY = size * 0.5

  const set = (x, y, color) => {
    const i = (y * size + x) * 4
    px[i] = color[0]
    px[i + 1] = color[1]
    px[i + 2] = color[2]
    px[i + 3] = 255
  }

  const inRoundedRect = (x, y) => {
    // corner rounding for the app-icon squircle-ish look
    const cx = Math.min(x, size - 1 - x)
    const cy = Math.min(y, size - 1 - y)
    if (cx >= radius || cy >= radius) return true
    const dx = radius - cx
    const dy = radius - cy
    return dx * dx + dy * dy <= radius * radius
  }

  const onH = (x, y) => {
    const half = stroke / 2
    const vLeft = Math.abs(x - left) <= half && y >= top && y <= bottom
    const vRight = Math.abs(x - right) <= half && y >= top && y <= bottom
    const bar = Math.abs(y - midY) <= half && x >= left && x <= right
    return vLeft || vRight || bar
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inRoundedRect(x, y)) {
        // transparent outside the squircle
        continue
      }
      set(x, y, onH(x, y) ? FG : BG)
    }
  }

  // PNG scanlines with filter byte 0 per row
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const idat = zlib.deflateSync(raw)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const targets = [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of targets) {
  fs.writeFileSync(path.join(OUT, name), drawIcon(size))
  console.log('wrote', name)
}
