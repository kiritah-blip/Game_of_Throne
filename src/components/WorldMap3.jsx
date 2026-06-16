import React, { useEffect, useRef, useState } from 'react'
import { REGIONS3 as REGIONS, LIEUX3 as LIEUX, LEGEND_GROUPS3, MAP3_W as MAP_W, MAP3_H as MAP_H, MASK_DIR3 } from '../data/mapData3'
import './WorldMap.css'
import './WorldMap4.css'

// ─── Config ───────────────────────────────────────────────────────────────────
const MASK_DIR   = MASK_DIR3
const MAP_IMG    = `${MASK_DIR3}/Carte%20Westeros%20+%20Essos.png`
// Résolution réduite pour le pixel-testing : 5× plus légère → 25× moins de données
const PT_SCALE   = 0.2
const PT_W       = Math.round(MAP_W * PT_SCALE)
const PT_H       = Math.round(MAP_H * PT_SCALE)

const toPercent = (x, y) => ({
  left: `${(x / MAP_W) * 100}%`,
  top:  `${(y / MAP_H) * 100}%`,
})

// ─── Hook pixel-testing à basse résolution ───────────────────────────────────
function useRegionPixelData() {
  const pixelData = useRef({})

  useEffect(() => {
    REGIONS.forEach(region => {
      const img = new window.Image()
      img.src = `${MASK_DIR}/${encodeURIComponent(region.maskFile)}?v=pixel3`
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width  = PT_W
        canvas.height = PT_H
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, PT_W, PT_H)
        try { pixelData.current[region.id] = ctx.getImageData(0, 0, PT_W, PT_H).data } catch(_) {}
      }
    })
  }, [])

  const findRegion = (clientX, clientY, containerEl) => {
    if (!containerEl) return null
    const rect = containerEl.getBoundingClientRect()
    const px = Math.round((clientX - rect.left) / rect.width  * PT_W)
    const py = Math.round((clientY - rect.top)  / rect.height * PT_H)
    if (px < 0 || px >= PT_W || py < 0 || py >= PT_H) return null

    for (const region of REGIONS) {
      const data = pixelData.current[region.id]
      if (!data) continue
      const idx  = (py * PT_W + px) * 4
      const a    = data[idx + 3]
      if (a < 40) continue
      const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3
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
        Plusieurs régions peuvent être sélectionnées simultanément.
        Cliquez sur une région active pour la désélectionner.
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
      {region.faits.map((f, i) => <li key={i} className="region-fact">{f}</li>)}
    </ul>
    <p className="region-panel-devise">{region.devise}</p>
  </div>
)

const PanneauLieu = ({ lieu, region }) => (
  <div className="region-panel lieu-panel" style={{ '--accent': region?.accent || '#c9a84c' }}>
    <p className="region-panel-eyebrow">
      {region?.maison || 'Lieu Notable'} — {
        lieu.type === 'capital'   ? 'Capitale'        :
        lieu.type === 'stronghold'? 'Château Fort'    :
        lieu.type === 'fortress'  ? 'Forteresse'      :
        lieu.type === 'town'      ? 'Ville'           :
        lieu.type === 'island'    ? 'Île'             :
        lieu.type === 'ruin'      ? 'Ruines'          :
                                    "Point d'intérêt"
      }
    </p>
    <h2 className="region-panel-title">{lieu.nom}</h2>
    <div className="region-panel-divider">
      <span className="rpd-line" /><span className="rpd-diamond" /><span className="rpd-line" />
    </div>
    <p className="region-panel-desc">{lieu.desc}</p>
    {region && <p className="lieu-region-link" style={{ color: region.accent }}>✦ Région : {region.nom}</p>}
  </div>
)

// ─── Marqueur ────────────────────────────────────────────────────────────────
const MarqueurLieu = React.memo(({ lieu, region, isVisible, isActive, onClick }) => {
  const pos    = toPercent(lieu.x, lieu.y)
  const accent = region?.accent || '#c9a84c'
  return (
    <button
      className={`map-lieu ${lieu.level === 1 ? 'lieu-major' : 'lieu-minor'} ${isActive ? 'lieu-active' : ''} ${isVisible ? 'lieu-visible' : 'lieu-hidden'} ${lieu.labelPos === 'top' ? 'lieu-label-above' : ''}`}
      style={{ ...pos, '--accent': accent }}
      onClick={onClick}
      title={lieu.nom}
    >
      <span className="lieu-dot" />
      {lieu.level === 1 && <span className="lieu-pulse-ring" />}
      <span className="lieu-label">{lieu.nom}</span>
      {isActive && <span className="lieu-active-ring" />}
    </button>
  )
})

// ─── Accordéon de légende (même structure que WorldMap4) ─────────────────────
const LegendAccordion3 = ({ activeRegions, onRegionClick }) => {
  const [openGroups, setOpenGroups] = useState(() => new Set())

  const toggleGroup = (label) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className="legend4-accordion">
      {LEGEND_GROUPS3.map(group => {
        const isOpen      = openGroups.has(group.label)
        const activeCount = group.ids.filter(id => activeRegions.some(r => r.id === id)).length
        return (
          <div key={group.label} className={`legend4-group${isOpen ? ' legend4-group-open' : ''}`}>
            <button className="legend4-group-header" onClick={() => toggleGroup(group.label)}>
              <span className="legend4-group-label">{group.label}</span>
              <span className="legend4-group-meta">
                {activeCount > 0 && (
                  <span className="legend4-active-badge">{activeCount}</span>
                )}
                <span className="legend4-count">{group.ids.length}</span>
                <span className="legend4-chevron">{isOpen ? '▲' : '▼'}</span>
              </span>
            </button>
            <div className="legend4-group-body">
              <div className="legend4-items">
                {group.ids.map(id => {
                  const region   = REGIONS.find(r => r.id === id)
                  if (!region) return null
                  const isActive = activeRegions.some(r => r.id === id)
                  return (
                    <button
                      key={id}
                      className={`legend-item${isActive ? ' legend-active' : ''}`}
                      style={{ '--accent': region.accent }}
                      onClick={() => onRegionClick(region)}
                    >
                      <span className="legend-dot" style={{ background: region.accent }} />
                      {region.nom}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
const WorldMap3 = ({ onNavigate, instant }) => {
  const [activeRegions, setActiveRegions] = useState([])
  const [activeLieu,    setActiveLieu]    = useState(null)
  const [panelRegion,   setPanelRegion]   = useState(null)

  const sectionRef      = useRef(null)
  const eyebrowRef      = useRef(null)
  const titleRef        = useRef(null)
  const mapContainerRef = useRef(null)
  // RAF throttle pour le mousemove
  const rafRef          = useRef(null)

  const findRegion = useRegionPixelData()
  const getRegion  = (lieu) => REGIONS.find(r => r.id === lieu.regionId)

  // Aucune région active → tout visible ; sinon → seulement les régions actives
  const isLieuVisible = (lieu) =>
    activeRegions.length === 0 || activeRegions.some(r => r.id === lieu.regionId)

  // ── Clic marqueur ─────────────────────────────────────────────────────────
  const handleLieuClick = (lieu, e) => {
    e.stopPropagation()
    if (activeLieu?.id === lieu.id) {
      setActiveLieu(null)
    } else {
      setActiveLieu(lieu)
      setPanelRegion(getRegion(lieu) || null)
    }
  }

  // ── Toggle région (multi-sélect) ──────────────────────────────────────────
  const handleRegionClick = (region, e) => {
    if (e) e.stopPropagation()
    setActiveLieu(null)
    setActiveRegions(prev => {
      const already = prev.some(r => r.id === region.id)
      if (already) {
        const next = prev.filter(r => r.id !== region.id)
        setPanelRegion(next.length > 0 ? next[next.length - 1] : null)
        return next
      }
      setPanelRegion(region)
      return [...prev, region]
    })
  }

  // ── Clic zone vide → tout vider ───────────────────────────────────────────
  const handleMapClick = (e) => {
    const region = findRegion(e.clientX, e.clientY, mapContainerRef.current)
    if (region) handleRegionClick(region)
    else { setActiveRegions([]); setActiveLieu(null); setPanelRegion(null) }
  }

  // ── Mousemove throttlé via RAF ─────────────────────────────────────────────
  const handleMapMouseMove = (e) => {
    if (rafRef.current) return
    const cx = e.clientX, cy = e.clientY
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const region = findRegion(cx, cy, mapContainerRef.current)
      if (mapContainerRef.current)
        mapContainerRef.current.style.cursor = region ? 'pointer' : 'default'
    })
  }

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])


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
    if (panelRegion) return <PanneauRegion region={panelRegion} />
    return <PanneauDefault />
  }

  const hasActive = activeRegions.length > 0

  return (
    <section ref={sectionRef} className="worldmap-section">
      <div className="worldmap-bg-texture" />

      <header className="worldmap-header">
        <p ref={eyebrowRef} className="worldmap-eyebrow">WESTEROS ET ESSOS — LE MONDE CONNU</p>
        <div className="worldmap-ornament">
          <span className="worldmap-ornament-line" />
          <span className="worldmap-ornament-rune">✦</span>
          <span className="worldmap-ornament-line" />
        </div>
        <h1 ref={titleRef} className="worldmap-title">
          Westeros &amp; <em>Essos</em>
        </h1>
        <p className="worldmap-subtitle">
          Cliquez pour sélectionner · Multi-sélection possible · Cliquez sur zone vide pour tout effacer
        </p>
      </header>

      <div className="worldmap-layout">
        <div className="worldmap-map-wrapper">
          <div
            ref={mapContainerRef}
            className={`worldmap-map-container ${hasActive ? 'map-tilt has-active-region' : ''}`}
            style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
          >
            <img className="worldmap-img" src={MAP_IMG} alt="Carte Westeros et Essos" draggable="false" />
            <div className="worldmap-map-overlay" />

            {/* ── Un seul filtre partagé + un masque par région ── */}
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none', overflow:'visible' }}>
              <defs>
                {/* Filtre d'inversion partagé (PNG fond blanc → masque blanc) */}
                <filter id="inv3-shared" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
                  <feColorMatrix type="matrix"
                    values="-1 0 0 0 1
                             0 -1 0 0 1
                             0  0 -1 0 1
                             0  0  0 1 0" />
                </filter>
                {REGIONS.map(region => (
                  <mask key={region.id} id={`msk3-${region.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                    <image
                      href={`${MASK_DIR}/${encodeURIComponent(region.maskFile)}`}
                      x="0" y="0" width="100%" height="100%"
                      preserveAspectRatio="none"
                      filter="url(#inv3-shared)"
                    />
                  </mask>
                ))}
                {/* Glow uniquement pour la région affichée dans le panneau */}
                <filter id="region-glow-3" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {REGIONS.map(region => {
                const isActive  = activeRegions.some(r => r.id === region.id)
                const isPanel   = panelRegion?.id === region.id
                return (
                  <rect
                    key={region.id}
                    x="0" y="0" width="100%" height="100%"
                    fill={region.houseColor}
                    mask={`url(#msk3-${region.id})`}
                    opacity={isActive ? 1 : 0}
                    filter={isActive && isPanel ? 'url(#region-glow-3)' : undefined}
                    style={{ transition: 'opacity 0.4s ease' }}
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
                    onClick={(e) => { e.stopPropagation(); onNavigate('westeros-cite') }}
                    title="Voir Westeros + Cités Libres"
                  >
                    <span className="map-nav-arrow-icon">‹</span>
                    <span className="map-nav-arrow-label">Cités Libres</span>
                  </button>
                </div>
                <div className="map-nav-right">
                  <button
                    className="map-nav-arrow"
                    onClick={(e) => { e.stopPropagation(); onNavigate('monde-connu') }}
                    title="Voir le reste du monde"
                  >
                    <span className="map-nav-arrow-label">Monde Connu</span>
                    <span className="map-nav-arrow-icon">»</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="worldmap-panel">{renderPanel()}</div>
      </div>

      {/* ── Accordéon de catégories sous la carte ── */}
      <LegendAccordion3
        activeRegions={activeRegions}
        onRegionClick={(region) => handleRegionClick(region, null)}
      />

    </section>
  )
}

export default WorldMap3
