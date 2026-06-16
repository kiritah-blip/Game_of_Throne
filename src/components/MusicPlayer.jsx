import { useState, useRef, useEffect } from 'react'
import './MusicPlayer.css'

const MUSIC_SRC = '/music/Game of Thrones - Main Theme (Extended) HD.mp3'
const CARD_W    = 272   // largeur de la carte étendue (px)
const BTN_SIZE  = 54    // diamètre du bouton toggle (px)

const MusicPlayer = () => {
  const audioRef       = useRef(null)
  const [playing,  setPlaying]  = useState(false)
  const [volume,   setVolume]   = useState(0.45)
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState(0)

  // Position du conteneur : bas-droite par défaut
  // left = bord gauche du conteneur ; le bouton est aligné à droite (flex-end)
  const [pos, setPos] = useState(() => ({
    left:   Math.max(0, window.innerWidth - 32 - CARD_W),
    bottom: 32,
  }))

  const dragRef  = useRef(null)   // données du drag en cours
  const movedRef = useRef(false)  // a-t-on bougé de plus de 4px ?

  // ── Audio ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.loop   = true
    const onTime = () => {
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100)
    }
    audio.addEventListener('timeupdate', onTime)
    return () => audio.removeEventListener('timeupdate', onTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Play / Pause ──────────────────────────────────────────────────────────
  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (playing) { audio.pause(); setPlaying(false) }
      else         { await audio.play(); setPlaying(true) }
    } catch (err) { console.warn('Lecture audio impossible :', err.message) }
  }

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const volIcon = volume === 0 ? '🔇' : volume < 0.35 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'

  // ── Drag & drop ───────────────────────────────────────────────────────────
  // Le bouton est à droite du conteneur (align-items: flex-end).
  // On déplace le conteneur ; la carte suit naturellement.
  const handleTogglePointerDown = (e) => {
    e.preventDefault()
    movedRef.current = false
    dragRef.current  = {
      startX:     e.clientX,
      startY:     e.clientY,
      origLeft:   pos.left,
      origBottom: pos.bottom,
    }

    const onMove = (ev) => {
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true

      // Clamp : le bouton (aligné à droite du conteneur) reste dans le viewport
      const maxLeft = window.innerWidth  - CARD_W   // bouton droit = bord droit
      const minLeft = BTN_SIZE - CARD_W             // bouton gauche = bord gauche (négatif = -218)
      const maxBot  = window.innerHeight - BTN_SIZE
      const minBot  = 0

      const newLeft   = Math.max(minLeft, Math.min(maxLeft, dragRef.current.origLeft   + dx))
      const newBottom = Math.max(minBot,  Math.min(maxBot,  dragRef.current.origBottom - dy))

      setPos({ left: newLeft, bottom: newBottom })
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
      // Clic simple (peu/pas de mouvement) → toggle la carte
      if (!movedRef.current) setExpanded(prev => !prev)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`music-player ${expanded ? 'mp-expanded' : ''} ${playing ? 'mp-playing' : ''}`}
      style={{ left: `${pos.left}px`, bottom: `${pos.bottom}px` }}
    >
      <audio ref={audioRef} src={MUSIC_SRC} preload="none" />

      {/* ── Carte étendue ── */}
      <div className="mp-card">
        <div className="mp-card-header">
          <div className="mp-card-info">
            <span className="mp-track-label">Thème Principal</span>
            <span className="mp-track-name">Game of Thrones</span>
            <span className="mp-track-sub">Main Theme — Extended</span>
          </div>
          <button className="mp-close" onClick={() => setExpanded(false)} aria-label="Fermer le lecteur">✕</button>
        </div>

        <div className="mp-divider" />

        <div className={`mp-wave-deco ${playing ? 'wave-active' : ''}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="mp-wave-bar" style={{ animationDelay: `${i * 0.075}s` }} />
          ))}
        </div>

        <div className="mp-controls">
          <button className="mp-play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Lecture'}>
            {playing
              ? <span className="mp-pause-icon">⏸</span>
              : <span className="mp-play-icon">▶</span>}
          </button>
        </div>

        <div className="mp-volume-row">
          <span className="mp-vol-icon" aria-hidden="true">{volIcon}</span>
          <input
            type="range" min="0" max="1" step="0.02"
            value={volume} onChange={handleVolume}
            className="mp-vol-slider" aria-label="Volume"
          />
        </div>

        <div className="mp-progress-wrap">
          <div className="mp-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── Bouton toggle (draggable) ── */}
      <button
        className="mp-toggle"
        onPointerDown={handleTogglePointerDown}
        aria-label={expanded ? 'Fermer le lecteur' : 'Ouvrir le lecteur de musique'}
        title="Cliquer pour ouvrir · Glisser pour déplacer"
      >
        {playing ? (
          <div className="mp-btn-wave" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="mp-btn-bar" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        ) : (
          <span className="mp-btn-note" aria-hidden="true">♪</span>
        )}
        {playing && <span className="mp-btn-pulse" aria-hidden="true" />}
      </button>
    </div>
  )
}

export default MusicPlayer
