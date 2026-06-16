import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useDragonTransition } from './DragonTransitionContext'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

// ─── Données des chapitres (en français) ─────────────────────────────────────
const CHAPITRES = [
  {
    id: 'prologue',
    progress: [0, 0.12],
    title: 'Les Chroniques Anciennes',
    subtitle: 'UN CHANT DE GLACE ET DE FEU',
    body: 'Au commencement, il n\'y avait que les mots des Maesters — des secrets scellés dans d\'anciens tomes, attendant une main assez courageuse pour les ouvrir.',
    sigil: '✦',
  },
  {
    id: 'winterfell',
    progress: [0.12, 0.30],
    title: 'Le Nord se Souvient',
    subtitle: 'MAISON STARK — WINTERFELL',
    body: 'L\'hiver vient. Au-delà des anciens remparts, les souffles froids du Nord portent des récits plus vieux que le Mur lui-même.',
    sigil: '⚔',
  },
  {
    id: 'westeros',
    progress: [0.30, 0.52],
    title: 'Les Sept Royaumes',
    subtitle: 'LE ROYAUME DE WESTEROS',
    body: 'Des pics nuageux des Eyrie aux sables rouges de Dorne — sept royaumes, un trône, mille raisons de saigner.',
    sigil: '♜',
  },
  {
    id: 'kings-landing',
    progress: [0.52, 0.70],
    title: 'Là où les Couronnes se Gagnent',
    subtitle: 'KING\'S LANDING — LA CAPITALE',
    body: 'La ville qui dévore les rois entiers. L\'or et la trahison parfument l\'air. Chaque sourire ici dissimule une lame.',
    sigil: '👑',
  },
  {
    id: 'swords',
    progress: [0.70, 0.87],
    title: 'Mille Lames',
    subtitle: 'FORGÉES DANS LA CONQUÊTE',
    body: 'Mille épées, rendues par les ennemis d\'Aegon le Conquérant. Fondues. Remodelées. Transformées en quelque chose de terrible et de magnifique.',
    sigil: '⚒',
  },
  {
    id: 'throne',
    progress: [0.87, 1.0],
    title: 'Le Trône de Fer',
    subtitle: 'QUAND ON JOUE AU JEU DES TRÔNES',
    body: 'On gagne — ou on meurt.',
    sigil: '♔',
  },
]

// ─── Liens de navigation ─────────────────────────────────────────────────────
const NAV_LIENS = [
  { label: 'Le Monde',    to: '/monde' },
  { label: 'Personnages', to: '/personnages' },
  { label: 'Maisons',     to: '/maisons' },
  { label: 'Dragons',     to: '/dragons' },
  { label: 'Histoire',    to: '/histoire' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// ─── Composant ───────────────────────────────────────────────────────────────
const Hero_v2 = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    triggerDragon,     cancelDragon,     dragonActive,
    triggerMonde,      cancelMonde,      mondeActive,
    triggerMaison,     cancelMaison,     maisonActive,
    triggerPersonnage, cancelPersonnage, personnageActive,
    triggerHistoire,   cancelHistoire,   histoireActive,
  } = useDragonTransition() || {}

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Annule toutes les transitions actives (appelé lors d'une navigation directe via <Link>).
  const cancelAll = () => {
    if (dragonActive)     cancelDragon?.()
    if (mondeActive)      cancelMonde?.()
    if (maisonActive)     cancelMaison?.()
    if (personnageActive) cancelPersonnage?.()
    if (histoireActive)   cancelHistoire?.()
  }

  const containerRef    = useRef(null)
  const stickyRef       = useRef(null)
  const videoRef        = useRef(null)
  const overlayRef      = useRef(null)
  const titleRef        = useRef(null)
  const subtitleRef     = useRef(null)
  const bodyRef         = useRef(null)
  const sigilRef        = useRef(null)
  const progressRef     = useRef(null)
  const vignetteRef     = useRef(null)
  const chapterLabelRef = useRef(null)
  const runeBarRef      = useRef(null)

  const [activeChapter, setActiveChapter] = useState(0)
  const [videoReady, setVideoReady]       = useState(false)

  // ─── Boutons CTA ─────────────────────────────────────────────────────────
  const commencerLaventure = () => {
    navigate('/maisons')
  }

  const explorerLeRoyaume = () => {
    navigate('/monde')
  }

  // ─── Transition de chapitre ───────────────────────────────────────────────
  const prevChapter = useRef(-1)
  const transitionChapter = (idx) => {
    if (prevChapter.current === idx) return
    prevChapter.current = idx
    setActiveChapter(idx)

    const ch = CHAPITRES[idx]
    const tl = gsap.timeline()

    tl.to([titleRef.current, subtitleRef.current, bodyRef.current, sigilRef.current], {
      y: -24, opacity: 0, duration: 0.35, ease: 'power2.in', stagger: 0.04,
    })
    .call(() => {
      if (titleRef.current)    titleRef.current.textContent    = ch.title
      if (subtitleRef.current) subtitleRef.current.textContent = ch.subtitle
      if (bodyRef.current)     bodyRef.current.textContent     = ch.body
      if (sigilRef.current)    sigilRef.current.textContent    = ch.sigil
    })
    .fromTo(
      [sigilRef.current, subtitleRef.current, titleRef.current, bodyRef.current],
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.07 }
    )

    if (chapterLabelRef.current) {
      gsap.fromTo(chapterLabelRef.current,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      )
      chapterLabelRef.current.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(CHAPITRES.length).padStart(2, '0')}`
    }
  }

  // ─── Initialisation ───────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onReady = () => setTimeout(() => setVideoReady(true), 1000)
    video.addEventListener('loadedmetadata', onReady)
    if (video.readyState >= 1) onReady()

    const ch0 = CHAPITRES[0]
    if (titleRef.current)    titleRef.current.textContent    = ch0.title
    if (subtitleRef.current) subtitleRef.current.textContent = ch0.subtitle
    if (bodyRef.current)     bodyRef.current.textContent     = ch0.body
    if (sigilRef.current)    sigilRef.current.textContent    = ch0.sigil

    return () => video.removeEventListener('loadedmetadata', onReady)
  }, [])

  // ─── GSAP ScrollTrigger ───────────────────────────────────────────────────
  useEffect(() => {
    if (!videoReady) return

    const video    = videoRef.current
    const duration = video.duration || 1
    const scrollHeight = window.innerHeight * 6

    const pinTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start:   'top top',
      end:     `+=${scrollHeight}`,
      pin:     stickyRef.current,
      pinSpacing: true,
      anticipatePin: 1,
    })

    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start:   'top top',
        end:     `+=${scrollHeight}`,
        scrub:   true,
        onUpdate: (self) => {
          const t = self.progress * duration
          if (Math.abs(video.currentTime - t) > 0.04) {
            video.currentTime = t
          }

          if (progressRef.current) {
            progressRef.current.style.width = `${self.progress * 100}%`
          }

          const p = self.progress
          const idx = CHAPITRES.findIndex(c => p >= c.progress[0] && p < c.progress[1])
          transitionChapter(idx === -1 ? CHAPITRES.length - 1 : idx)

          const vinInt = 0.55 + Math.sin(p * Math.PI) * 0.2
          if (vignetteRef.current) {
            vignetteRef.current.style.opacity = String(vinInt)
          }
        },
      },
    })

    gsap.to(overlayRef.current, {
      background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.0) 55%)',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${scrollHeight}`,
        scrub: true,
      },
    })

    if (runeBarRef.current) {
      const ticks = runeBarRef.current.querySelectorAll('.rune-tick')
      gsap.fromTo(ticks,
        { scaleY: 0, opacity: 0 },
        {
          scaleY: 1, opacity: 1, stagger: 0.06, duration: 0.6, ease: 'elastic.out(1,0.5)',
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
        }
      )
    }

    gsap.fromTo(
      [sigilRef.current, subtitleRef.current, titleRef.current, bodyRef.current],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 0.3 }
    )

    return () => {
      scrubTl.kill()
      pinTrigger.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoReady])

  // ─── Rendu ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Écran de chargement ── */}
      <div className={`got-loading ${videoReady ? 'hidden' : ''}`}>
        <div className="got-loading-logo">Game of Thrones</div>
        <div className="got-loading-sub">Les Chroniques de Westeros</div>
        <div className="got-loading-bar-wrap">
          <div className="got-loading-bar-fill" />
        </div>
      </div>

      {/* ── Conteneur principal ── */}
      <div
        ref={containerRef}
        className="got-container"
        style={{ height: `${window.innerHeight * 6 + window.innerHeight}px` }}
      >
        <div ref={stickyRef} className="got-sticky">

          {/* Vidéo */}
          <video
            ref={videoRef}
            className="got-video"
            src="/video/one.mp4"
            playsInline
            muted
            preload="auto"
          />

          {/* Calques */}
          <div ref={vignetteRef} className="got-vignette" />
          <div ref={overlayRef}  className="got-overlay" />
          <div className="got-grain" />

          {/* Ornements de coins */}
          {['tl','tr','bl','br'].map(pos => (
            <div key={pos} className={`got-corner got-corner-${pos}`}>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2 L2 20 M2 2 L20 2" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.5"/>
                <path d="M2 2 L8 8" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.4"/>
                <rect x="1" y="1" width="4" height="4" fill="none" stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.6"/>
              </svg>
            </div>
          ))}

          {/* Navigation */}
          <nav className="got-nav">
            <div className="got-nav-logo">Game of Thrones</div>
            <ul className="got-nav-links">
              {NAV_LIENS.map(l => {

                // ── Le Monde : transition chroma key ──────────────────────
                if (l.to === '/monde') {
                  return (
                    <li key={l.to}>
                      <button
                        onClick={() => {
                          if (isActive(l.to) && !mondeActive) return
                          if (dragonActive)     cancelDragon?.()
                          if (maisonActive)     cancelMaison?.()
                          if (personnageActive) cancelPersonnage?.()
                          if (histoireActive)   cancelHistoire?.()
                          triggerMonde?.()
                          if (!isActive(l.to)) navigate('/monde')
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  )
                }

                // ── Personnages : transition chroma key auto ──────────────
                if (l.to === '/personnages') {
                  return (
                    <li key={l.to}>
                      <button
                        onClick={() => {
                          if (isActive(l.to) && !personnageActive) return
                          if (dragonActive)   cancelDragon?.()
                          if (mondeActive)    cancelMonde?.()
                          if (maisonActive)   cancelMaison?.()
                          if (histoireActive) cancelHistoire?.()
                          triggerPersonnage?.()
                          if (!isActive(l.to)) navigate('/personnages')
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  )
                }

                // ── Maisons : transition "insérez la clé" ─────────────────
                if (l.to === '/maisons') {
                  return (
                    <li key={l.to}>
                      <button
                        onClick={() => {
                          if (isActive(l.to) && !maisonActive) return
                          if (dragonActive)     cancelDragon?.()
                          if (mondeActive)      cancelMonde?.()
                          if (personnageActive) cancelPersonnage?.()
                          if (histoireActive)   cancelHistoire?.()
                          triggerMaison?.()
                          if (!isActive(l.to)) navigate('/maisons')
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  )
                }

                // ── Dragons : transition vidéo dragon ─────────────────────
                if (l.to === '/dragons') {
                  return (
                    <li key={l.to}>
                      <button
                        onClick={() => {
                          if (isActive(l.to) && !dragonActive) return
                          if (mondeActive)      cancelMonde?.()
                          if (maisonActive)     cancelMaison?.()
                          if (personnageActive) cancelPersonnage?.()
                          if (histoireActive)   cancelHistoire?.()
                          triggerDragon?.()
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  )
                }

                // ── Histoire : transition chroma key + zoom dans la page ───
                if (l.to === '/histoire') {
                  return (
                    <li key={l.to}>
                      <button
                        onClick={() => {
                          if (isActive(l.to) && !histoireActive) return
                          if (dragonActive)     cancelDragon?.()
                          if (mondeActive)      cancelMonde?.()
                          if (maisonActive)     cancelMaison?.()
                          if (personnageActive) cancelPersonnage?.()
                          triggerHistoire?.()
                          if (!isActive(l.to)) navigate('/histoire')
                        }}
                      >
                        {l.label}
                      </button>
                    </li>
                  )
                }

                // ── Tous les autres liens : annule toutes les transitions ──
                return (
                  <li key={l.to}>
                    <Link to={l.to} onClick={cancelAll}>{l.label}</Link>
                  </li>
                )

              })}
            </ul>
          </nav>

          {/* Barre de runes */}
          <div ref={runeBarRef} className="got-rune-bar">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="rune-tick" />
            ))}
          </div>

          {/* Contenu principal */}
          <div className="got-content">
            <span ref={sigilRef} className="got-sigil" />
            <div className="got-divider">
              <div className="got-divider-line" />
              <div className="got-divider-diamond" />
              <div className="got-divider-line right" />
            </div>
            <span ref={subtitleRef} className="got-subtitle" />
            <h1 ref={titleRef} className="got-title" />
            <p ref={bodyRef} className="got-body" />
            <div className="got-cta-row">
              <button className="got-cta-btn" onClick={commencerLaventure}>
                Commencer l'Aventure
              </button>
              <button className="got-cta-ghost" onClick={explorerLeRoyaume}>
                Explorer le Royaume
              </button>
            </div>
          </div>

          {/* Panneau droit */}
          <div className="got-right-panel">
            <div ref={chapterLabelRef} className="got-chapter-label">01 / 06</div>
            <div className="got-vert-line" />
            <div className="got-dots">
              {CHAPITRES.map((_, i) => (
                <div
                  key={i}
                  className={`got-dot ${i === activeChapter ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Indication de défilement */}
          <div className="got-scroll-hint">
            <span>Défiler</span>
            <div className="arrow" />
          </div>

          {/* Barre de progression */}
          <div className="got-progress-bar-wrap">
            <div ref={progressRef} className="got-progress-bar-fill" />
          </div>

        </div>
      </div>
    </>
  )
}

export default Hero_v2
