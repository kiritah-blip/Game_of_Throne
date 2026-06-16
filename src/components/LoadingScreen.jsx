import { useEffect, useRef, useState } from 'react'
import './LoadingScreen.css'

// Poids relatifs en MB après compression (pour pondérer la barre)
// one.mp4 est géré par <link rel="preload"> dans index.html + Hero_v2 a son propre
// indicateur de chargement. On ne le précharge pas ici pour éviter d'avorter
// le transfert en cours lors du démontage (el.src='') et d'interférer avec Hero_v2.
const VIDEOS = [
  { src: '/Transition/Video%20Histoire.mp4',   weight: 3.0 },
  { src: '/Transition/Video%20Dragon.mp4',     weight: 4.1 },
  { src: '/Transition/Video%20Maison.mp4',     weight: 1.5 },
  { src: '/Transition/Video%20Monde.mp4',      weight: 1.7 },
  { src: '/Transition/Video%20Personnage.mp4', weight: 0.3 },
]
const TOTAL_WEIGHT = VIDEOS.reduce((s, v) => s + v.weight, 0)
const THRESHOLD    = 0.85   // disparaît à 85 %
const MAX_WAIT_MS  = 12000  // disparaît quoi qu'il arrive après 12 s

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress]   = useState(0)
  const [visible,  setVisible]    = useState(true)
  const [exiting,  setExiting]    = useState(false)
  const videoRefs  = useRef([])
  const buffered   = useRef(VIDEOS.map(() => 0))   // fraction 0..1 par vidéo
  const doneRef    = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setExiting(true)
    setTimeout(() => { setVisible(false); onDone?.() }, 900)
  }

  useEffect(() => {
    const timerId = setTimeout(finish, MAX_WAIT_MS)

    // Calcule le progrès global pondéré et met à jour la barre
    const recalc = () => {
      const weighted = VIDEOS.reduce(
        (sum, v, i) => sum + buffered.current[i] * v.weight, 0
      )
      const p = Math.min(weighted / TOTAL_WEIGHT, 1)
      setProgress(p)
      if (p >= THRESHOLD) finish()
    }

    // Crée des éléments <video> cachés pour chaque transition
    videoRefs.current = VIDEOS.map((v, i) => {
      const el = document.createElement('video')
      el.src      = v.src
      el.preload  = 'auto'
      el.muted    = true
      el.style.display = 'none'
      document.body.appendChild(el)

      const onProgress = () => {
        if (!el.duration) return
        try {
          buffered.current[i] = el.buffered.length
            ? el.buffered.end(el.buffered.length - 1) / el.duration
            : 0
        } catch (_) {}
        recalc()
      }
      const onCanPlay = () => { buffered.current[i] = 1; recalc() }

      el.addEventListener('progress',    onProgress)
      el.addEventListener('canplaythrough', onCanPlay)
      el.addEventListener('error',       () => { buffered.current[i] = 1; recalc() })
      el.load()
      return el
    })

    // Incrément visuel régulier pour que la barre ne soit jamais figée
    const tickId = setInterval(recalc, 300)

    return () => {
      clearTimeout(timerId)
      clearInterval(tickId)
      videoRefs.current.forEach(el => {
        el.pause()
        el.src = ''
        el.remove()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  const pct = Math.round(progress * 100)

  return (
    <div className={`ls-root ${exiting ? 'ls-exit' : ''}`}>
      <div className="ls-bg" />

      {/* Ornements coins */}
      {['tl','tr','bl','br'].map(pos => (
        <div key={pos} className={`ls-corner ls-corner-${pos}`}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2 L2 20 M2 2 L20 2" stroke="#c9a84c" strokeWidth="1.2" strokeOpacity="0.6"/>
            <rect x="1" y="1" width="5" height="5" fill="none" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.7"/>
          </svg>
        </div>
      ))}

      <div className="ls-content">
        {/* Logo */}
        <div className="ls-sigil">⚔</div>
        <h1 className="ls-title">GAME OF THRONES</h1>
        <p  className="ls-sub">The Chronicles of Westeros</p>

        {/* Séparateur */}
        <div className="ls-divider">
          <div className="ls-divider-line" />
          <div className="ls-divider-diamond" />
          <div className="ls-divider-line" />
        </div>

        {/* Barre de chargement */}
        <div className="ls-bar-wrap">
          <div className="ls-bar-fill" style={{ width: `${pct}%` }} />
          <div className="ls-bar-glow"  style={{ left:  `${pct}%` }} />
        </div>

        <div className="ls-bar-labels">
          <span className="ls-bar-label-left">Chargement des chroniques…</span>
          <span className="ls-bar-label-right">{pct} %</span>
        </div>
      </div>
    </div>
  )
}
