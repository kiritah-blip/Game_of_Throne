import React, { useEffect, useRef, useState } from 'react'
import { CATEGORIES, EPOQUES } from '../data/historyData'
import './History.css'

// Photos dont le cadrage par défaut (object-fit: cover, centré) coupe la tête
// du sujet — on ajuste la zone visible verticalement pour révéler le visage
// plutôt que le torse/armure. Valeur par image car le décalage nécessaire varie.
const HEAD_CROP_FIX = {
  'AEGON_IV':                                      'center top',
  'Daemon_Blackfyre':                              'center top',
  'AERYS_II':                                      'center top',
  'Lyanna_S7_E7':                                  'center 25%',
  'Rhaegar_and_lyanna_s7_finale_3':                'center top',
  'La Conquête des Targaryen (Aegon Ier)/images.jpg': 'center top',
  '350px-MAEGOR_I':                                'center top',
  '101_Jaehaerys':                                 'center top',
  '350px-Jaehaerys&Alysanne':                      'center 25%',
  'Aegon_II_Targaryen_-_Tom_Glynn-Carney':         'center 25%',
}
const getHeadFixPosition = (src) => {
  const match = Object.entries(HEAD_CROP_FIX).find(([keyword]) => src.includes(keyword))
  return match ? match[1] : null
}

// ─── Galerie d'images ─────────────────────────────────────────────────────────
const GalerieImages = ({ images, accent }) => {
  const [current, setCurrent] = useState(0)
  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <div className="epoch-gallery">
      {images.map((src, i) => (
        <img
          key={src}
          className={`gallery-img ${i === current ? 'gallery-active' : ''}`}
          src={src}
          alt=""
          style={getHeadFixPosition(src) ? { objectPosition: getHeadFixPosition(src) } : undefined}
          onError={e => { e.target.style.display = 'none' }}
          draggable="false"
        />
      ))}
      {images.length > 1 && (
        <div className="gallery-controls">
          <button className="gallery-btn" onClick={prev}>‹</button>
          <div className="gallery-thumbs">
            {images.map((_, i) => (
              <button
                key={i}
                className={`gallery-thumb ${i === current ? 'thumb-active' : ''}`}
                style={{ background: i === current ? accent : undefined }}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
          <button className="gallery-btn" onClick={next}>›</button>
        </div>
      )}
    </div>
  )
}

// ─── Carte d'une époque (accordéon) ──────────────────────────────────────────
const EpoqueCarte = ({ epoque, index, isExpanded, onToggle }) => {
  const ref  = useRef(null)
  const bodyRef = useRef(null)
  const isLeft = index % 2 === 0

  // Entrance animation
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('epoch-visible'), index * 50)
          obs.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [index])

  const card = (
    <div
      className={`epoch-card ${isExpanded ? 'epoch-card-open' : ''}`}
      style={{ '--accent': epoque.accent, '--border': epoque.border }}
    >
      {/* ── En-tête cliquable (toujours visible) ── */}
      <button className="epoch-card-header" onClick={onToggle}>
        <div className="epoch-thumb-wrap">
          <img
            className="epoch-thumb"
            src={epoque.images[0]}
            alt=""
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="epoch-thumb-overlay" />
        </div>
        <div className="epoch-header-info">
          <span className="epoch-header-tag" style={{ color: epoque.accent }}>{epoque.tag}</span>
          <h2 className="epoch-header-title">{epoque.titre}</h2>
          <p className="epoch-header-resume">{epoque.resume}</p>
        </div>
        <div
          className={`epoch-chevron ${isExpanded ? 'chevron-open' : ''}`}
          style={{ color: epoque.accent }}
        >
          ▼
        </div>
      </button>

      {/* ── Corps expansible ── */}
      <div
        ref={bodyRef}
        className={`epoch-body ${isExpanded ? 'body-open' : ''}`}
      >
        <div className="epoch-body-inner">
          <GalerieImages images={epoque.images} accent={epoque.accent} />

          <div className="epoch-content">
            <div className="epoch-divider">
              <span className="epoch-divider-line" />
              <span className="epoch-divider-diamond" />
              <span className="epoch-divider-line" />
            </div>
            <p className="epoch-description">{epoque.description}</p>

            <p className="epoch-events-title">Événements Clés</p>
            <ul className="epoch-events">
              {epoque.evenements.map((evt, i) => (
                <li key={i} className="epoch-event">{evt}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const meta = (
    <div className="epoch-meta" style={{ '--accent': epoque.accent }}>
      <span className="epoch-meta-tag">{epoque.tag}</span>
      <div className="epoch-dot" />
      <span className="epoch-annee">{epoque.annee}</span>
    </div>
  )

  return (
    <div
      ref={ref}
      className={`epoch ${isLeft ? 'epoch-left' : 'epoch-right'}`}
      style={{ '--accent': epoque.accent }}
    >
      {isLeft ? (
        <>{card}{meta}<div className="epoch-spacer" /></>
      ) : (
        <><div className="epoch-spacer" />{meta}{card}</>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
const History = () => {
  const [categorie, setCategorie]   = useState('toutes')
  const [expanded,  setExpanded]    = useState(new Set())
  const sectionRef  = useRef(null)
  const eyebrowRef  = useRef(null)
  const titleRef    = useRef(null)

  // Filtre
  const filteredEpoques = categorie === 'toutes'
    ? EPOQUES
    : EPOQUES.filter(e => e.categorie === categorie)

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Changer de catégorie ferme toutes les cartes
  const handleCategorie = (id) => {
    setCategorie(id)
    setExpanded(new Set())
  }

  // Header entrance
  useEffect(() => {
    const els = [eyebrowRef.current, titleRef.current].filter(Boolean)
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          els.forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 150))
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="history-section">
      <div className="history-bg-texture" />

      {/* ── Header ── */}
      <header className="history-header">
        <p ref={eyebrowRef} className="history-eyebrow">DES ORIGINES À LA FIN D'UN RÈGNE</p>
        <div className="history-ornament">
          <span className="history-ornament-line" />
          <span className="history-ornament-rune">✦</span>
          <span className="history-ornament-line" />
        </div>
        <h1 ref={titleRef} className="history-title">
          Les Chroniques de<br /><em>Westeros</em>
        </h1>
        <p className="history-subtitle">
          12&nbsp;000 ans d'histoire — de l'Ère de l'Aube jusqu'à la Grande Guerre
        </p>
      </header>

      {/* ── Filtres ── */}
      <div className="history-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn ${categorie === cat.id ? 'filter-active' : ''}`}
            onClick={() => handleCategorie(cat.id)}
          >
            <span className="filter-icon">{cat.icon}</span>
            <span className="filter-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── Compteur ── */}
      <p className="history-count">
        <span style={{ color: '#c9a84c' }}>{filteredEpoques.length}</span> époque{filteredEpoques.length > 1 ? 's' : ''} — cliquez une carte pour la développer
      </p>

      {/* ── Timeline ── */}
      <div className="timeline">
        <div className="timeline-line" />
        {filteredEpoques.map((epoque, i) => (
          <EpoqueCarte
            key={epoque.id}
            epoque={epoque}
            index={i}
            isExpanded={expanded.has(epoque.id)}
            onToggle={() => toggleExpand(epoque.id)}
          />
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="history-footer">
        <span className="history-footer-line" />
        <span className="history-footer-sigil">📜</span>
        <span className="history-footer-line" />
      </div>
    </section>
  )
}

export default History
