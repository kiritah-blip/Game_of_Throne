import React, { useEffect, useRef, useState } from 'react'
import { REGIONS, LIEUX, MAP_W, MAP_H } from '../data/mapData'
import { useRegionPixelData } from '../hooks/useRegionPixelData'
import './WorldMap.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MASK_DIR = '/map/R%C3%A9gion%20Westeros'

const maskUrl = (file) =>
  `url('${MASK_DIR}/${encodeURIComponent(file)}')`

const toPercent = (x, y) => ({
  left: `${(x / MAP_W) * 100}%`,
  top:  `${(y / MAP_H) * 100}%`,
})

// ─── Panneau par défaut ───────────────────────────────────────────────────────
const PanneauDefault = () => (
  <div className="panel-default">
    <span className="panel-default-sigil">🗺</span>
    <p className="panel-default-title">Explorez le Continent</p>
    <p className="panel-default-text">
      Cliquez sur un territoire coloré ou un marqueur pour en savoir plus.
      <br /><br />
      <span style={{ color: 'rgba(201,168,76,0.5)', fontSize: '11px' }}>
        Les marqueurs secondaires apparaissent quand une région est sélectionnée.
      </span>
    </p>
  </div>
)

// ─── Panneau région ───────────────────────────────────────────────────────────
const PanneauRegion = ({ region }) => (
  <div className="region-panel" style={{ '--accent': region.accent }}>
    <p className="region-panel-eyebrow">{region.maison}</p>
    <h2 className="region-panel-title">{region.nom}</h2>
    <div className="region-panel-divider">
      <span className="rpd-line" /><span className="rpd-diamond" /><span className="rpd-line" />
    </div>
    <div className="region-panel-infos">
      <div className="region-info-item">
        <span className="region-info-label">Siège du pouvoir</span>
        <span className="region-info-value">{region.siege}</span>
      </div>
      <div className="region-info-item">
        <span className="region-info-label">Dirigeant</span>
        <span className="region-info-value">{region.seigneur}</span>
      </div>
    </div>
    <p className="region-panel-desc">{region.description}</p>
    <p className="region-panel-facts-title">À Savoir</p>
    <ul className="region-panel-facts">
      {region.faits.map((f, i) => (
        <li key={i} className="region-fact">{f}</li>
      ))}
    </ul>
    <p className="region-panel-devise">{region.devise}</p>
  </div>
)

// ─── Panneau lieu ─────────────────────────────────────────────────────────────
const PanneauLieu = ({ lieu, region }) => (
  <div className="region-panel lieu-panel" style={{ '--accent': region?.accent || '#c9a84c' }}>
    <p className="region-panel-eyebrow">
      {region?.maison || 'Lieu Notable'} — {lieu.type === 'capital' ? 'Capitale' :
        lieu.type === 'stronghold' ? 'Château Fort' :
        lieu.type === 'fortress' ? 'Forteresse' :
        lieu.type === 'town' ? 'Ville' :
        lieu.type === 'island' ? 'Île' :
        lieu.type === 'ruin' ? 'Ruines' : 'Point d\'intérêt'}
    </p>
    <h2 className="region-panel-title">{lieu.nom}</h2>
    <div className="region-panel-divider">
      <span className="rpd-line" /><span className="rpd-diamond" /><span className="rpd-line" />
    </div>
    <p className="region-panel-desc">{lieu.desc}</p>
    {region && (
      <p className="lieu-region-link" style={{ color: region.accent }}>
        ✦ Région : {region.nom}
      </p>
    )}
  </div>
)

// ─── Marqueur de lieu ─────────────────────────────────────────────────────────
const MarqueurLieu = ({ lieu, region, isVisible, isActive, onClick }) => {
  const pos = toPercent(lieu.x, lieu.y)
  const accent = region?.accent || '#c9a84c'
  const isLevel1 = lieu.level === 1

  return (
    <button
      className={`map-lieu
        ${isLevel1 ? 'lieu-major' : 'lieu-minor'}
        ${isActive ? 'lieu-active' : ''}
        ${isVisible ? 'lieu-visible' : 'lieu-hidden'}
        ${lieu.labelPos === 'top' ? 'lieu-label-above' : ''}
      `}
      style={{ ...pos, '--accent': accent }}
      onClick={onClick}
      title={lieu.nom}
    >
      {/* Dot */}
      <span className="lieu-dot" />
      {/* Pulse ring (uniquement sur les marqueurs level-1) */}
      {isLevel1 && <span className="lieu-pulse-ring" />}
      {/* Label */}
      <span className="lieu-label">{lieu.nom}</span>
      {/* Anneau actif */}
      {isActive && <span className="lieu-active-ring" />}
    </button>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
const WorldMap = ({ onNavigate, instant }) => {
  const [activeRegion, setActiveRegion] = useState(null)
  const [activeLieu,   setActiveLieu]   = useState(null)
  const [mapTilt,      setMapTilt]      = useState(false)
  const sectionRef      = useRef(null)
  const eyebrowRef      = useRef(null)
  const titleRef        = useRef(null)
  const mapContainerRef = useRef(null)

  // Pixel-testing : chargement lazy des masques en arrière-plan
  const { findRegion, loadedCount, totalCount } = useRegionPixelData(REGIONS, MASK_DIR, MAP_W, MAP_H)
  const masksReady = loadedCount === totalCount && totalCount > 0

  // ── Trouver la région d'un lieu ────────────────────────────────────────────
  const getRegion = (lieu) => REGIONS.find(r => r.id === lieu.regionId)

  // ── Visibilité d'un lieu ───────────────────────────────────────────────────
  // Sans région active : level-1 seulement (carte générale)
  // Avec région active : uniquement les marqueurs de cette région
  const isLieuVisible = (lieu) => {
    if (!activeRegion) return lieu.level === 1
    return lieu.regionId === activeRegion.id
  }

  // ── Interactions ───────────────────────────────────────────────────────────
  const handleLieuClick = (lieu, e) => {
    e.stopPropagation()
    const region = getRegion(lieu)
    if (activeLieu?.id === lieu.id) {
      // Déselectionner le lieu mais garder la région active
      setActiveLieu(null)
    } else {
      setActiveLieu(lieu)
      setActiveRegion(region || null)
      setMapTilt(true)
    }
  }

  const handleRegionClick = (region, e) => {
    if (e) e.stopPropagation()
    if (activeRegion?.id === region.id) {
      setActiveRegion(null)
      setActiveLieu(null)
      setMapTilt(false)
    } else {
      setActiveRegion(region)
      setActiveLieu(null)
      setMapTilt(true)
    }
  }

  // ── Clic sur la carte (pixel-testing) ────────────────────────────────────
  const handleMapClick = (e) => {
    // Si un marqueur a stopPropagation, on n'arrive jamais ici
    const region = findRegion(e.clientX, e.clientY, mapContainerRef.current)
    if (region) {
      handleRegionClick(region)
    } else {
      handleMapReset()
    }
  }

  const handleMapReset = () => {
    setActiveRegion(null)
    setActiveLieu(null)
    setMapTilt(false)
  }

  // ── Hover : change le curseur selon la zone survolée ─────────────────────
  const handleMapMouseMove = (e) => {
    const region = findRegion(e.clientX, e.clientY, mapContainerRef.current)
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = region ? 'pointer' : 'default'
    }
  }

  // ── Header animation ───────────────────────────────────────────────────────
  // `instant` : la carte est affichée via le changement d'onglet (MondePage),
  // la section est donc déjà visible à l'écran — on saute le fondu d'entrée
  // (0.8s, déclenché normalement au scroll) pour éviter un texte qui
  // "rattrape" en retard la transition zoom/pan du conteneur.
  useEffect(() => {
    const els = [eyebrowRef.current, titleRef.current].filter(Boolean)

    if (instant) {
      els.forEach(el => el.classList.add('visible'))
      return
    }

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
  }, [instant])

  // ── Panneau à afficher ─────────────────────────────────────────────────────
  const renderPanel = () => {
    if (activeLieu) return <PanneauLieu lieu={activeLieu} region={getRegion(activeLieu)} />
    if (activeRegion) return <PanneauRegion region={activeRegion} />
    return <PanneauDefault />
  }

  return (
    <section ref={sectionRef} className="worldmap-section">
      <div className="worldmap-bg-texture" />

      {/* ── Header ── */}
      <header className="worldmap-header">
        <p ref={eyebrowRef} className="worldmap-eyebrow">LES SEPT ROYAUMES ET LEURS TERRITOIRES</p>
        <div className="worldmap-ornament">
          <span className="worldmap-ornament-line" />
          <span className="worldmap-ornament-rune">✦</span>
          <span className="worldmap-ornament-line" />
        </div>
        <h1 ref={titleRef} className="worldmap-title">
          La Carte de<br /><em>Westeros</em>
        </h1>
        <p className="worldmap-subtitle">
          Cliquez sur un territoire pour l'explorer · Les marqueurs secondaires apparaissent au clic sur une région
        </p>
      </header>

      {/* ── Layout carte + panneau ── */}
      <div className="worldmap-layout">

        {/* ── Carte ── */}
        <div className="worldmap-map-wrapper">
          <div
            ref={mapContainerRef}
            className={`worldmap-map-container ${mapTilt ? 'map-tilt' : ''} ${activeRegion ? 'has-active-region' : ''}`}
            style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
          >
            {/* Image fond */}
            <img
              className="worldmap-img"
              src={`${MASK_DIR}/HBO_Map_of_Westeros.jpg`}
              alt="Carte de Westeros"
              draggable="false"
            />

            {/* Overlay sombre */}
            <div className="worldmap-map-overlay" />

            {/* ── Overlays SVG des régions (pixel-perfect, fonctionne avec fond blanc ou transparent) ── */}
            <svg
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none', overflow:'visible' }}
            >
              <defs>
                {REGIONS.map(region => (
                  <React.Fragment key={region.id}>
                    {/*
                      Filtre d'inversion : transforme les PNG "fond blanc + région noire"
                      en "fond noir + région blanche" pour que le masque SVG
                      (luminance : blanc = visible, noir = caché) fonctionne correctement.
                    */}
                    <filter id={`inv-${region.id}`} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
                      <feColorMatrix type="matrix"
                        values="-1 0 0 0 1
                                 0 -1 0 0 1
                                 0  0 -1 0 1
                                 0  0  0 1 0" />
                    </filter>
                    <mask id={`msk-${region.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                      <image
                        href={`${MASK_DIR}/${encodeURIComponent(region.maskFile)}`}
                        x="0" y="0" width="100%" height="100%"
                        preserveAspectRatio="none"
                        filter={`url(#inv-${region.id})`}
                      />
                    </mask>
                  </React.Fragment>
                ))}
                {/* Filtre glow pour la région active */}
                <filter id="region-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {REGIONS.map(region => {
                const isActive = activeRegion?.id === region.id
                return (
                  <rect
                    key={region.id}
                    x="0" y="0" width="100%" height="100%"
                    fill={region.houseColor}
                    mask={`url(#msk-${region.id})`}
                    opacity={isActive ? 1 : 0}
                    filter={isActive ? 'url(#region-glow)' : undefined}
                    style={{ transition: 'opacity 0.45s ease' }}
                  />
                )
              })}
            </svg>

            {/* ── Marqueurs des lieux ── */}
            {LIEUX.map(lieu => (
              <MarqueurLieu
                key={lieu.id}
                lieu={lieu}
                region={getRegion(lieu)}
                isVisible={isLieuVisible(lieu)}
                isActive={activeLieu?.id === lieu.id}
                onClick={(e) => handleLieuClick(lieu, e)}
              />
            ))}

            {/* Coins décoratifs */}
            {['tl','tr','bl','br'].map(pos => (
              <div key={pos} className={`map-corner map-corner-${pos}`} />
            ))}

            {onNavigate && (
              <div className="map-nav-right">
                <button
                  className="map-nav-arrow"
                  onClick={(e) => { e.stopPropagation(); onNavigate('westeros-cite') }}
                  title="Voir Westeros + Cités Libres"
                >
                  <span className="map-nav-arrow-label">Cités Libres</span>
                  <span className="map-nav-arrow-icon">›</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── Panneau info ── */}
        <div className="worldmap-panel">
          {renderPanel()}
        </div>
      </div>

      {/* ── Légende des régions ── */}
      <div className="worldmap-legend">
        {REGIONS.map(region => (
          <button
            key={region.id}
            className={`legend-item ${activeRegion?.id === region.id ? 'legend-active' : ''}`}
            style={{ '--accent': region.accent }}
            onClick={() => handleRegionClick(region)}
          >
            <span className="legend-dot" style={{ background: region.accent }} />
            {region.nom}
          </button>
        ))}
      </div>
    </section>
  )
}

export default WorldMap
