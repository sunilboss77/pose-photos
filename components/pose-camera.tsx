'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Timer,
  Grid3x3,
  SwitchCamera,
  Ban,
  Download,
  X,
  ImageIcon,
  Zap,
  ZapOff,
} from 'lucide-react'
import { POSE_CATEGORIES, POSES } from '@/lib/poses'
import { cn } from '@/lib/utils'

type CapturedPhoto = {
  id: string
  dataUrl: string
}

export function PoseCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('trending')
  const [activePoseId, setActivePoseId] = useState<string | null>('trending-1')
  const [showGrid, setShowGrid] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 10>(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off')
  const [aspectRatio, setAspectRatio] = useState<'full' | '4:3' | '16:9'>('full')
  const [screenFlash, setScreenFlash] = useState(false)
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)

  const activePose = POSES.find((p) => p.id === activePoseId) ?? null
  const categoryPoses = POSES.filter((p) => p.category === activeCategory)
  const isMirrored = facingMode === 'user'

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        setCameraError(null)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.log('[v0] Camera error:', err)
        if (!cancelled) {
          setCameraError('कैमरा एक्सेस नहीं मिला। कृपया कैमरा अनुमति दें।')
        }
      }
    }

    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [facingMode])

  // Check if the current frame is dark (for auto flash)
  const isFrameDark = useCallback(() => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return false
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.drawImage(video, 0, 0, 64, 64)
    const { data } = ctx.getImageData(0, 0, 64, 64)
    let total = 0
    for (let i = 0; i < data.length; i += 4) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    const avg = total / (data.length / 4)
    return avg < 70
  }, [])

  // Try to toggle hardware torch (rear camera)
  const setTorch = useCallback(async (on: boolean) => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return false
    try {
      const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }
      if (!capabilities?.torch) return false
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] })
      return true
    } catch {
      return false
    }
  }, [])

  const takePhoto = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const shouldFlash =
      flashMode === 'on' || (flashMode === 'auto' && isFrameDark())

    let torchUsed = false
    if (shouldFlash) {
      if (facingMode === 'environment') {
        torchUsed = await setTorch(true)
      }
      if (!torchUsed) {
        // Screen flash for front camera or when torch is unsupported
        setScreenFlash(true)
      }
      // Give the sensor a moment to adjust to the light
      await new Promise((r) => setTimeout(r, torchUsed ? 350 : 250))
    }

    // Center-crop the frame to the selected aspect ratio (portrait)
    let sx = 0
    let sy = 0
    let sw = video.videoWidth
    let sh = video.videoHeight
    if (aspectRatio !== 'full') {
      const targetR = aspectRatio === '4:3' ? 3 / 4 : 9 / 16
      const videoR = sw / sh
      if (videoR > targetR) {
        sw = Math.round(sh * targetR)
        sx = Math.round((video.videoWidth - sw) / 2)
      } else {
        sh = Math.round(sw / targetR)
        sy = Math.round((video.videoHeight - sh) / 2)
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      if (torchUsed) setTorch(false)
      setScreenFlash(false)
      return
    }

    if (isMirrored) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh)

    if (torchUsed) setTorch(false)
    setScreenFlash(false)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setPhotos((prev) => [{ id: `${Date.now()}`, dataUrl }, ...prev])
    setFlash(true)
    setTimeout(() => setFlash(false), 180)
  }, [isMirrored, flashMode, facingMode, aspectRatio, isFrameDark, setTorch])

  const handleCapture = useCallback(() => {
    if (countdown !== null) return
    if (timerSeconds === 0) {
      takePhoto()
      return
    }
    let remaining = timerSeconds
    setCountdown(remaining)
    const interval = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        clearInterval(interval)
        setCountdown(null)
        takePhoto()
      } else {
        setCountdown(remaining)
      }
    }, 1000)
  }, [countdown, timerSeconds, takePhoto])

  function cycleTimer() {
    setTimerSeconds((t) => (t === 0 ? 3 : t === 3 ? 10 : 0))
  }

  function selectCategory(id: string) {
    setActiveCategory(id)
    const first = POSES.find((p) => p.category === id)
    setActivePoseId(first ? first.id : null)
  }

  function downloadPhoto(photo: CapturedPhoto) {
    const a = document.createElement('a')
    a.href = photo.dataUrl
    a.download = `pose-photo-${photo.id}.jpg`
    a.click()
  }

  return (
    <div className="relative mx-auto flex h-svh w-full max-w-md flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="z-10 flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
          aria-label="वापस जाएँ"
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAspectRatio((r) => (r === 'full' ? '4:3' : r === '4:3' ? '16:9' : 'full'))}
            className={cn(
              'flex h-10 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors hover:bg-accent',
              aspectRatio !== 'full' ? 'text-primary' : 'text-foreground',
            )}
            aria-label={`आस्पेक्ट रेशियो: ${aspectRatio === 'full' ? 'फुल स्क्रीन' : aspectRatio}`}
          >
            {aspectRatio === 'full' ? 'Full' : aspectRatio}
          </button>
          <button
            type="button"
            onClick={() => setFlashMode((m) => (m === 'off' ? 'on' : m === 'on' ? 'auto' : 'off'))}
            className={cn(
              'flex h-10 items-center justify-center gap-1 rounded-full px-2 transition-colors hover:bg-accent',
              flashMode !== 'off' ? 'text-primary' : 'text-foreground',
            )}
            aria-label={`फ्लैश: ${flashMode === 'off' ? 'बंद' : flashMode === 'on' ? 'चालू' : 'ऑटो'}`}
          >
            {flashMode === 'off' ? (
              <ZapOff className="size-5" aria-hidden="true" />
            ) : (
              <Zap className="size-5" aria-hidden="true" />
            )}
            {flashMode === 'auto' && <span className="text-sm font-semibold">A</span>}
          </button>
          <button
            type="button"
            onClick={cycleTimer}
            className={cn(
              'flex h-10 items-center justify-center gap-1 rounded-full px-2 transition-colors hover:bg-accent',
              timerSeconds > 0 ? 'text-primary' : 'text-foreground',
            )}
            aria-label={`टाइमर: ${timerSeconds === 0 ? 'बंद' : `${timerSeconds} सेकंड`}`}
          >
            <Timer className="size-5" aria-hidden="true" />
            {timerSeconds > 0 && <span className="text-sm font-semibold">{timerSeconds}s</span>}
          </button>
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            className={cn(
              'flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent',
              showGrid ? 'text-primary' : 'text-foreground',
            )}
            aria-label={showGrid ? 'ग्रिड बंद करें' : 'ग्रिड चालू करें'}
            aria-pressed={showGrid}
          >
            <Grid3x3 className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Viewfinder */}
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-black">
        <div
          className={cn(
            'relative overflow-hidden',
            aspectRatio === 'full' ? 'size-full' : 'max-h-full w-full',
          )}
          style={aspectRatio === 'full' ? undefined : { aspectRatio: aspectRatio === '4:3' ? '3 / 4' : '9 / 16' }}
        >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn('size-full object-cover', isMirrored && 'scale-x-[-1]')}
        />

        {/* Pose overlay: black background becomes transparent with screen blend */}
        {activePose && !cameraError && (
          <img
            src={activePose.src || '/placeholder.svg'}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-contain opacity-80 mix-blend-screen"
          />
        )}

        {/* Grid overlay */}
        {showGrid && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/3 top-0 h-full w-px bg-white/40" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-white/40" />
            <div className="absolute left-0 top-1/3 h-px w-full bg-white/40" />
            <div className="absolute left-0 top-2/3 h-px w-full bg-white/40" />
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center" role="status">
            <span className="text-8xl font-bold text-white drop-shadow-lg">{countdown}</span>
          </div>
        )}

        {/* Flash effect */}
        {flash && <div className="absolute inset-0 bg-white/90" aria-hidden="true" />}

        {/* Screen flash (fill light for front camera) */}
        {screenFlash && <div className="fixed inset-0 z-50 bg-white" aria-hidden="true" />}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-center text-base text-muted-foreground text-balance">{cameraError}</p>
          </div>
        )}
        </div>
      </div>

      {/* Controls */}
      <div className="z-10 flex flex-col gap-3 pb-4 pt-3">
        <div className="flex items-center justify-around px-6">
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-muted"
            aria-label={`गैलरी खोलें, ${photos.length} फोटो`}
          >
            {photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0].dataUrl || '/placeholder.svg'} alt="" className="size-full object-cover" />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!!cameraError}
            className="flex size-[76px] items-center justify-center rounded-full border-4 border-foreground disabled:opacity-40"
            aria-label="फोटो खींचें"
          >
            <span className="block size-[62px] rounded-full bg-foreground transition-transform active:scale-90" />
          </button>

          <button
            type="button"
            onClick={() => setFacingMode((f) => (f === 'user' ? 'environment' : 'user'))}
            className="flex size-14 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
            aria-label="कैमरा बदलें"
          >
            <SwitchCamera className="size-6" aria-hidden="true" />
          </button>
        </div>

        {/* Category tabs */}
        <nav className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]" aria-label="पोज़ श्रेणियाँ">
          {POSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              className={cn(
                'shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors',
                activeCategory === cat.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={activeCategory === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Pose thumbnails */}
        <div className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]" role="listbox" aria-label="पोज़ चुनें">
          <button
            type="button"
            onClick={() => setActivePoseId(null)}
            className={cn(
              'flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors',
              activePoseId === null ? 'ring-2 ring-primary' : 'hover:bg-accent',
            )}
            role="option"
            aria-selected={activePoseId === null}
            aria-label="कोई पोज़ नहीं"
          >
            <Ban className="size-6 text-muted-foreground" aria-hidden="true" />
          </button>
          {categoryPoses.map((pose) => (
            <button
              key={pose.id}
              type="button"
              onClick={() => setActivePoseId(pose.id)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-xl bg-muted transition-colors',
                activePoseId === pose.id ? 'ring-2 ring-primary' : 'hover:bg-accent',
              )}
              role="option"
              aria-selected={activePoseId === pose.id}
              aria-label={pose.alt}
            >
              <Image src={pose.src || '/placeholder.svg'} alt="" width={64} height={64} className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Gallery sheet */}
      {galleryOpen && (
        <div className="absolute inset-0 z-20 flex flex-col bg-background" role="dialog" aria-label="आपकी गैलरी">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold">आपकी गैलरी</h2>
            <button
              type="button"
              onClick={() => setGalleryOpen(false)}
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
              aria-label="गैलरी बंद करें"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {photos.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <p className="text-center text-muted-foreground text-balance">
                अभी कोई फोटो नहीं है। कैमरा से फोटो खींचें!
              </p>
            </div>
          ) : (
            <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto p-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.dataUrl || '/placeholder.svg'} alt="खींची गई फोटो" className="aspect-[3/4] w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => downloadPhoto(photo)}
                    className="absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
                    aria-label="फोटो डाउनलोड करें"
                  >
                    <Download className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
