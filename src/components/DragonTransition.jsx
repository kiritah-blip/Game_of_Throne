import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './DragonTransition.css'

// ── Timing ───────────────────────────────────────────────────────────────────
// Moment où la page Dragons est chargée en arrière-plan (feu couvre l'écran).
// 0.0 = début · 1.0 = fin. Ajustez selon le contenu réel de la vidéo.
const SWITCH_AT_PCT = 0.70

// Durée du fondu de sortie (ms) — révèle la page Dragons en dessous
const FADE_OUT_MS   = 500

export default function DragonTransition({ onComplete }) {
  const videoRef    = useRef(null)
  const overlayRef  = useRef(null)
  const navigate    = useNavigate()
  const location    = useLocation()
  const switchedRef = useRef(false)
  const doneRef     = useRef(false)
  // Chemin au moment du montage — sert à détecter une navigation externe
  const mountPath   = useRef(location.pathname)

  // ── Annulation si l'utilisateur navigue ailleurs pendant la transition ─────
  // Cas 1 : avant notre navigate('/dragons') → toute sortie de la page d'origine
  // Cas 2 : après notre navigate('/dragons') → l'utilisateur repart autre part
  useEffect(() => {
    if (doneRef.current) return
    const wentElsewhere = switchedRef.current
      ? location.pathname !== '/dragons'        // après notre switch interne
      : location.pathname !== mountPath.current // avant notre switch interne
    if (wentElsewhere) {
      doneRef.current = true
      videoRef.current?.pause()
      onComplete?.()
    }
  }, [location.pathname, onComplete])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // ── Fin de l'animation ────────────────────────────────────────────────────
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      video.pause()
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.transition = `opacity ${FADE_OUT_MS}ms ease`
        overlay.style.opacity    = '0'
      }
      setTimeout(() => onComplete?.(), FADE_OUT_MS + 50)
    }

    // ── Suivi de progression ──────────────────────────────────────────────────
    const handleTimeUpdate = () => {
      if (!video.duration || switchedRef.current) return
      const pct = video.currentTime / video.duration

      // Charge Dragons en arrière-plan pendant que les flammes couvrent l'écran
      if (pct >= SWITCH_AT_PCT) {
        switchedRef.current = true
        navigate('/dragons')
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended',      finish)
    video.addEventListener('error',      finish)

    // Sécurité : si la vidéo ne se termine jamais (bug réseau, etc.)
    const safetyTimer = setTimeout(finish, 20_000)

    return () => {
      clearTimeout(safetyTimer)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended',      finish)
      video.removeEventListener('error',      finish)
    }
  }, [navigate, onComplete])

  return (
    <div ref={overlayRef} className="dgt-overlay">
      <video
        ref={videoRef}
        src="/Transition/Video%20Dragon.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="dgt-video"
      />
    </div>
  )
}
