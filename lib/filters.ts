export type CameraFilter = {
  id: string
  label: string
  // CSS filter string applied to the live preview and baked into captures
  css: string
}

// Premium LUT-style color grades implemented as CSS filter chains.
// These work both on the <video> preview and on the capture canvas (ctx.filter).
export const CAMERA_FILTERS: CameraFilter[] = [
  { id: 'normal', label: 'नॉर्मल', css: 'none' },
  { id: 'warm', label: 'वॉर्म', css: 'sepia(0.25) saturate(1.3) brightness(1.05) hue-rotate(-8deg)' },
  { id: 'cool', label: 'कूल', css: 'saturate(1.1) brightness(1.03) hue-rotate(12deg) contrast(1.05)' },
  { id: 'golden', label: 'गोल्डन ऑवर', css: 'sepia(0.35) saturate(1.45) brightness(1.08) contrast(1.05) hue-rotate(-12deg)' },
  { id: 'teal-orange', label: 'टील-ऑरेंज', css: 'contrast(1.15) saturate(1.35) hue-rotate(-5deg) brightness(1.02)' },
  { id: 'cinematic', label: 'सिनेमैटिक', css: 'contrast(1.2) saturate(0.9) brightness(0.96) sepia(0.12)' },
  { id: 'moody', label: 'मूडी', css: 'contrast(1.25) saturate(0.75) brightness(0.88)' },
  { id: 'film', label: 'फिल्म', css: 'contrast(0.95) saturate(0.85) brightness(1.06) sepia(0.18)' },
  { id: 'vintage', label: 'विंटेज', css: 'sepia(0.45) saturate(0.9) contrast(0.92) brightness(1.04)' },
  { id: 'pastel', label: 'पेस्टल', css: 'saturate(0.8) brightness(1.12) contrast(0.9)' },
  { id: 'portrait', label: 'पोर्ट्रेट', css: 'saturate(1.15) brightness(1.05) contrast(1.08) sepia(0.08)' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1) contrast(1.15) brightness(1.02)' },
  { id: 'noir', label: 'नॉयर', css: 'grayscale(1) contrast(1.4) brightness(0.9)' },
  { id: 'fresh', label: 'फ्रेश', css: 'saturate(1.25) brightness(1.08) contrast(1.02)' },
]

export function getFilterById(id: string): CameraFilter {
  return CAMERA_FILTERS.find((f) => f.id === id) ?? CAMERA_FILTERS[0]
}

// ---------------------------------------------------------------------------
// Canvas filter fallback (for browsers like iOS Safari where ctx.filter is
// not supported). We parse the CSS filter chain into a single 4x5 color
// matrix and apply it directly to the pixels — this matches the CSS Filter
// Effects spec, so the captured photo looks like the live preview.
// ---------------------------------------------------------------------------

let canvasFilterSupport: boolean | null = null

/** Detect whether CanvasRenderingContext2D.filter actually works. */
export function supportsCanvasFilter(): boolean {
  if (canvasFilterSupport !== null) return canvasFilterSupport
  if (typeof document === 'undefined') {
    return false
  }
  try {
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx || typeof ctx.filter !== 'string') {
      canvasFilterSupport = false
    } else {
      ctx.filter = 'brightness(0.5)'
      canvasFilterSupport = ctx.filter === 'brightness(0.5)'
    }
  } catch {
    canvasFilterSupport = false
  }
  return canvasFilterSupport
}

// 4x5 row-major color matrix: [r' g' b'] = M * [r g b 1] (offsets in 0-255)
type ColorMatrix = number[]

const IDENTITY: ColorMatrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
]

function multiply(a: ColorMatrix, b: ColorMatrix): ColorMatrix {
  // result = a applied AFTER b  (r' = a(b(r)))
  const out: ColorMatrix = new Array(12).fill(0)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      out[row * 4 + col] =
        a[row * 4 + 0] * b[0 * 4 + col] +
        a[row * 4 + 1] * b[1 * 4 + col] +
        a[row * 4 + 2] * b[2 * 4 + col]
    }
    out[row * 4 + 3] =
      a[row * 4 + 0] * b[0 * 4 + 3] +
      a[row * 4 + 1] * b[1 * 4 + 3] +
      a[row * 4 + 2] * b[2 * 4 + 3] +
      a[row * 4 + 3]
  }
  return out
}

function saturateMatrix(s: number): ColorMatrix {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0,
  ]
}

function sepiaMatrix(v: number): ColorMatrix {
  const i = 1 - v
  return [
    0.393 * v + i, 0.769 * v, 0.189 * v, 0,
    0.349 * v, 0.686 * v + i, 0.168 * v, 0,
    0.272 * v, 0.534 * v, 0.131 * v + i, 0,
  ]
}

function hueRotateMatrix(deg: number): ColorMatrix {
  const rad = (deg * Math.PI) / 180
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283, 0,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0,
  ]
}

function brightnessMatrix(b: number): ColorMatrix {
  return [
    b, 0, 0, 0,
    0, b, 0, 0,
    0, 0, b, 0,
  ]
}

function contrastMatrix(c: number): ColorMatrix {
  const o = 255 * (0.5 - 0.5 * c)
  return [
    c, 0, 0, o,
    0, c, 0, o,
    0, 0, c, o,
  ]
}

function parseAmount(raw: string): number {
  const t = raw.trim()
  if (t.endsWith('%')) return parseFloat(t) / 100
  return parseFloat(t)
}

/**
 * Convert a CSS filter chain (sepia/saturate/brightness/contrast/grayscale/
 * hue-rotate) into a single combined color matrix. Returns null when the
 * string is empty or 'none'.
 */
export function cssFilterToColorMatrix(filter: string): ColorMatrix | null {
  if (!filter || filter === 'none') return null
  let m = IDENTITY
  const re = /([a-z-]+)\(([^)]+)\)/gi
  let match: RegExpExecArray | null
  let found = false
  while ((match = re.exec(filter)) !== null) {
    const fn = match[1].toLowerCase()
    const arg = match[2]
    let step: ColorMatrix | null = null
    switch (fn) {
      case 'sepia':
        step = sepiaMatrix(Math.min(1, Math.max(0, parseAmount(arg))))
        break
      case 'saturate':
        step = saturateMatrix(Math.max(0, parseAmount(arg)))
        break
      case 'grayscale':
        step = saturateMatrix(1 - Math.min(1, Math.max(0, parseAmount(arg))))
        break
      case 'brightness':
        step = brightnessMatrix(Math.max(0, parseAmount(arg)))
        break
      case 'contrast':
        step = contrastMatrix(Math.max(0, parseAmount(arg)))
        break
      case 'hue-rotate':
        step = hueRotateMatrix(parseFloat(arg))
        break
      default:
        step = null
    }
    if (step) {
      // CSS filters apply left-to-right, so each new step wraps the previous
      m = multiply(step, m)
      found = true
    }
  }
  return found ? m : null
}

/** Apply a combined color matrix to ImageData pixels in place. */
export function applyColorMatrix(imageData: ImageData, m: ColorMatrix): void {
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    let nr = m[0] * r + m[1] * g + m[2] * b + m[3]
    let ng = m[4] * r + m[5] * g + m[6] * b + m[7]
    let nb = m[8] * r + m[9] * g + m[10] * b + m[11]
    if (nr < 0) nr = 0
    else if (nr > 255) nr = 255
    if (ng < 0) ng = 0
    else if (ng > 255) ng = 255
    if (nb < 0) nb = 0
    else if (nb > 255) nb = 255
    d[i] = nr
    d[i + 1] = ng
    d[i + 2] = nb
  }
}
