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
