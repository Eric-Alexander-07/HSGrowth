import { CSSProperties, useEffect, useRef } from 'react'
import loraxImage from '../assets/lorax/lorax.png'

type LoraxEasterEggProps = {
  active: boolean
  onFinish?: () => void
}

const RUN_DURATION_MS = 10000

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 50,
  overflow: 'hidden',
}

const runnerStyle: CSSProperties = {
  position: 'absolute',
  bottom: '10%',
  left: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '14px',
  animation: 'lorax-run 10s linear forwards',
  pointerEvents: 'none',
}

const loraxStyle: CSSProperties = {
  height: '60vh',
  width: 'auto',
  objectFit: 'contain',
  filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.25))',
}

const bubbleStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.95)',
  color: '#0f6b38',
  fontWeight: 700,
  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.18)',
  border: '1px solid rgba(213, 170, 115, 0.6)',
  whiteSpace: 'nowrap',
  fontFamily: "'Nunito Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  pointerEvents: 'none',
}

const LoraxEasterEgg = ({ active, onFinish }: LoraxEasterEggProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const animationDoneRef = useRef(false)
  const audioDoneRef = useRef(false)
  const finishedRef = useRef(false)
  const handleEndedRef = useRef<(() => void) | null>(null)

  const resetFlags = () => {
    animationDoneRef.current = false
    audioDoneRef.current = false
    finishedRef.current = false
  }

  const maybeFinish = () => {
    if (finishedRef.current) return
    if (animationDoneRef.current && audioDoneRef.current) {
      finishedRef.current = true
      onFinish?.()
    }
  }

  useEffect(() => {
    if (!active) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      if (audioRef.current && handleEndedRef.current) {
        audioRef.current.removeEventListener('ended', handleEndedRef.current)
      }
      handleEndedRef.current = null
      resetFlags()
      return
    }

    resetFlags()

    if (!audioRef.current) {
      const audio = new Audio('/src/assets/lorax/Let_it_grow.m4a')
      audio.preload = 'auto'
      audioRef.current = audio
    }

    const audioEl = audioRef.current
    audioEl.currentTime = 0

    const handleEnded = () => {
      audioDoneRef.current = true
      maybeFinish()
    }
    audioEl.addEventListener('ended', handleEnded)
    handleEndedRef.current = handleEnded

    audioEl.play().catch(() => {
      // Playback kann von Browser blockiert sein; trotzdem nicht haengen bleiben
      audioDoneRef.current = true
      maybeFinish()
    })

    timeoutRef.current = window.setTimeout(() => {
      animationDoneRef.current = true
      maybeFinish()
    }, RUN_DURATION_MS)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (audioRef.current && handleEndedRef.current) {
        audioRef.current.removeEventListener('ended', handleEndedRef.current)
      }
      handleEndedRef.current = null
    }
  }, [active, onFinish])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      if (audioRef.current && handleEndedRef.current) {
        audioRef.current.removeEventListener('ended', handleEndedRef.current)
      }
    }
  }, [])

  if (!active) return null

  return (
    <div style={overlayStyle} aria-hidden="true">
      <div style={runnerStyle}>
        <img src={loraxImage} alt="Lorax sprintet durchs Bild" style={loraxStyle} />
        <div style={bubbleStyle}>Let it grow 🌱</div>
      </div>
    </div>
  )
}

export default LoraxEasterEgg
