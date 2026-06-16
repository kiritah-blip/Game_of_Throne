import React, { useEffect, useRef, useState } from 'react'
import { REGIONS2 as REGIONS, LIEUX2 as LIEUX, MAP2_W as MAP_W, MAP2_H as MAP_H, MASK_DIR2 } from '../data/mapData2'
import './WorldMap.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MASK_DIR = MASK_DIR2
const MAP_IMG  = `${MASK_DIR2}/Carte%20Westeros%20+%20citee%20libre.webp`

const toPercent = (x, y) => ({
  left: `${(x / MAP_W) * 100}%`,
  top:  `${(y / MAP_H) * 100}%`,
})

// ─── Hook : charge les PNG masques pour le pixel-testing ─────────────────────
function useRegionPixelData() {
  const pixelData = useRef({})
  const ready     = useRef(false)

  useEffect(() => {
    let loaded = 0
    const total = REGIONS.length

    REGIONS.forEach(region => {
      const img = new window.Image()
      img.src = `${MASK_DIR}/${encodeURIComponent(region.maskFile)}?v=pixel2`
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = MAP_W; canvas.height = MAP_H
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, MAP_W, MAP_H)
        try { pixelData.current[region.id] = ctx.getImageData(0, 0, MAP_W, MAP_H).data } catch(_) {}
        loaded++
        if (loaded === total) ready.current = true
      }
      img.onerror = () => { loaded++; if (loaded === total) ready.current = true }
    })
  }, [])

  const findRegion = (clientX, clientY, containerEl) => {
    if (!containerEl) return null
    const rect = containerEl.getBoundingClientRect()
    const px = Math.round((clientX - rect.left) / rect.width  * MAP_W)
    const py = Math.round((clientY - rect.top)  / rect.height * MAP_H)
    if (px < 0 || px >= MAP_W || py < 0 || py >= MAP_H) return null

    for (const region of REGIONS) {
      const data = pixelData.current[region.id]
      if (!data) continue
      const idx = (py * MAP_W + px) * 4
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]
      if (a < 40) continue
      const brightness = (r + g + b) / 3
      if (brightness > 140) continue
      return region
    }
    return null
  }

  return findRegion
}

// ─── Panneaux ────────────────────────────────────────────────────────────────
const PanneauDefault = () => (
  <div className="panel-default">
    <span className="panel-default-sigil">🗺</span>
    <p className="panel-default-title">Explorez le Monde Connu</p>
    <p className="panel-default-text">
      Cliquez sur un territoire coloré ou un marqueur pour en savoir plus.
      <br /><br />
      <span style={{ color: 'rgba(201,168,76,0.5)', fontSize: '11px' }}>
        Les marqueurs secondaires apparaissent quand une région est sélectionnée.
      </span>
    </p>
  </div>
)

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

// ─── Marqueur ────────────────────────────────────────────────────────────────
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
      <span className="lieu-dot" />
      {isLevel1 && <span className="lieu-pulse-ring" />}
      <span className="lieu-label">{lieu.nom}</span>
      {isActive && <span className="lieu-active-ring" />}
    </button>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
const WorldMap2 = ({ onNavigate, instant }) => {
  const [activeRegion, setActiveRegion] = useState(null)
  const [activeLieu,   setActiveLieu]   = useState(null)
  const [mapTilt,      setMapTilt]      = useState(false)
  const sectionRef      = useRef(null)
  const eyebrowRef      = useRef(null)
  const titleRef        = useRef(null)
  const mapContainerRef = useRef(null)

  const findRegion = useRegionPixelData()

  const getRegion = (lieu) => REGIONS.find(r => r.id === lieu.regionId)

  const isLieuVisible = (lieu) => {
    if (!activeRegion) return lieu.level === 1
    return lieu.regionId === activeRegion.id
  }

  const handleLieuClick = (lieu, e) => {
    e.stopPropagation()
    const region = getRegion(lieu)
    if (activeLieu?.id === lieu.id) {
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
      setActiveRegion(null); setActiveLieu(null); setMapTilt(false)
    } else {
      setActiveRegion(region); setActiveLieu(null); setMapTilt(true)
    }
  }

  const handleMapClick = (e) => {
    const region = findRegion(e.clientX, e.clientY, mapContainerRef.current)
    if (region) handleRegionClick(region)
    else { setActiveRegion(null); setActiveLieu(null); setMapTilt(false) }
  }

  const handleMapMouseMove = (e) => {
    const region = findRegion(e.clientX, e.clientY, mapContainerRef.current)
    if (mapContainerRef.current)
      mapContainerRef.current.style.cursor = region ? 'pointer' : 'default'
  }

  // `instant` : la carte est affichée via le changement d'onglet (MondePage),
  // la section est déjà visible à l'écran — on saute le fondu d'entrée.
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

  const renderPanel = () => {
    if (activeLieu) return <PanneauLieu lieu={activeLieu} region={getRegion(activeLieu)} />
    if (activeRegion) return <PanneauRegion region={activeRegion} />
    return <PanneauDefault />
  }

  return (
    <section ref={sectionRef} className="worldmap-section">
      <div className="worldmap-bg-texture" />

      <header className="worldmap-header">
        <p ref={eyebrowRef} className="worldmap-eyebrow">WESTEROS ET LES CITÉS LIBRES D'ESSOS</p>
        <div className="worldmap-ornament">
          <span className="worldmap-ornament-line" />
          <span className="worldmap-ornament-rune">✦</span>
          <span className="worldmap-ornament-line" />
        </div>
        <h1 ref={titleRef} className="worldmap-title">
          Westeros &amp; <em>Cités Libres</em>
        </h1>
        <p className="worldmap-subtitle">
          Cliquez sur un territoire pour l'explorer · Inclut Dorne et les neuf Cités Libres d'Essos
        </p>
      </header>

      <div className="worldmap-layout">
        <div className="worldmap-map-wrapper">
          <div
            ref={mapContainerRef}
            className={`worldmap-map-container ${mapTilt ? 'map-tilt' : ''} ${activeRegion ? 'has-active-region' : ''}`}
            style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
          >
            <img
              className="worldmap-img"
              src={MAP_IMG}
              alt="Carte Westeros et Cités Libres"
              draggable="false"
            />
            <div className="worldmap-map-overlay" />

            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none', overflow:'visible' }}>
              <defs>
                {REGIONS.map(region => (
                  <React.Fragment key={region.id}>
                    <filter id={`inv2-${region.id}`} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
                      <feColorMatrix type="matrix"
                        values="-1 0 0 0 1
                                 0 -1 0 0 1
                                 0  0 -1 0 1
                                 0  0  0 1 0" />
                    </filter>
                    <mask id={`msk2-${region.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                      <image
                        href={`${MASK_DIR}/${encodeURIComponent(region.maskFile)}`}
                        x="0" y="0" width="100%" height="100%"
                        preserveAspectRatio="none"
                        filter={`url(#inv2-${region.id})`}
                      />
                    </mask>
                  </React.Fragment>
                ))}
                <filter id="region-glow-2" x="-10%" y="-10%" width="120%" height="120%">
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
                    mask={`url(#msk2-${region.id})`}
                    opacity={isActive ? 1 : 0}
                    filter={isActive ? 'url(#region-glow-2)' : undefined}
                    style={{ transition: 'opacity 0.45s ease' }}
                  />
                )
              })}
            </svg>

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

            {['tl','tr','bl','br'].map(pos => (
              <div key={pos} className={`map-corner map-corner-${pos}`} />
            ))}

            {onNavigate && (
              <>
                <div className="map-nav-left">
                  <button
                    className="map-nav-arrow"
                    onClick={(e) => { e.stopPropagation(); onNavigate('westeros') }}
                    title="Voir Westeros en détail"
                  >
                    <span className="map-nav-arrow-icon">‹</span>
                    <span className="map-nav-arrow-label">Westeros</span>
                  </button>
                </div>
                <div className="map-nav-right">
                  <button
                    className="map-nav-arrow"
                    onClick={(e) => { e.stopPropagation(); onNavigate('westeros-essos') }}
                    title="Voir Essos + Westeros"
                  >
                    <span className="map-nav-arrow-label">Essos + Westeros</span>
                    <span className="map-nav-arrow-icon">›</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="worldmap-panel">
          {renderPanel()}
        </div>
      </div>

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

export default WorldMap2
