import React, { useEffect, useRef, useState, useCallback } from 'react'
import { REGIONS4 as REGIONS, LIEUX4 as LIEUX, LEGEND_GROUPS4, MAP4_W as MAP_W, MAP4_H as MAP_H, MASK_DIR4 } from '../data/mapData4'
import './WorldMap.css'
import './WorldMap4.css'

const MASK_DIR  = MASK_DIR4
const MAP_IMG   = `${MASK_DIR4}/carte%20entiere.webp`
const PT_SCALE  = 0.1
const PT_W      = Math.round(MAP_W * PT_SCALE)
const PT_H      = Math.round(MAP_H * PT_SCALE)

const toPercent = (x, y) => ({
  left: `${(x / MAP_W) * 100}%`,
  top:  `${(y / MAP_H) * 100}%`,
})

function useRegionPixelData() {
  const pixelData = useRef({})

  useEffect(() => {
    REGIONS.forEach(region => {
      const img = new window.Image()
      img.src = `${MASK_DIR}/${encodeURIComponent(region.maskFile)}?v=pixel4`
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

// ─── Panneaux ──────────────────────────────────────────────────────────────────
const PanneauDefault = () => (
  <div className="panel-default">
    <span className="panel-default-sigil">🌍</span>
    <p className="panel-default-title">Le Monde Connu</p>
    <p className="panel-default-text">
      De Westeros aux Terres de l'Ombre, explorez le monde connu tel que cartographié par les Maester de la Citadelle.
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
        lieu.type === 'capital'    ? 'Capitale'      :
        lieu.type === 'stronghold' ? 'Château Fort'  :
        lieu.type === 'fortress'   ? 'Forteresse'    :
        lieu.type === 'town'       ? 'Ville'         :
        lieu.type === 'island'     ? 'Île'           :
        lieu.type === 'ruin'       ? 'Ruines'        :
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

// ─── Marqueur ──────────────────────────────────────────────────────────────────
const MarqueurLieu = React.memo(({ lieu, region, isVisible, isActive, onClick }) => {
  const pos    = toPercent(lieu.x, lieu.y)
  const accent = region?.accent || '#c9a84c'
  return (
    <button
      className={`map-lieu ${lieu.level === 1 ? 'lieu-major' : 'lieu-minor'} ${isActive ? 'lieu-active' : ''} ${isVisible ? 'lieu-visible' : 'lieu-hidden'} ${lieu.labelPos === 'top' ? 'lieu-label-above' : ''}`}
      style={{ ...pos, '--accent': accent }}
      onClick={onClick}
      title={lieu.nom}
      data-lieu-id={lieu.id}
    >
      <span className="lieu-dot" />
      {lieu.level === 1 && <span className="lieu-pulse-ring" />}
      <span className="lieu-label">{lieu.nom}</span>
      {isActive && <span className="lieu-active-ring" />}
    </button>
  )
})

// ─── Carte SVG partagée (normale + fullscreen) ────────────────────────────────
const MapContent = ({ containerRef, activeRegions, activeLieu, panelRegion, LIEUX, getRegion, isLieuVisible, handleMapClick, handleMapMouseMove, handleLieuClick }) => (
  <div
    ref={containerRef}
    className={`worldmap-map-container ${activeRegions.length > 0 ? 'map-tilt has-active-region' : ''}`}
    style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
    onClick={handleMapClick}
    onMouseMove={handleMapMouseMove}
  >
    <img className="worldmap-img" src={MAP_IMG} alt="Carte du Monde Connu" draggable="false" />
    <div className="worldmap-map-overlay" />

    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:3, pointerEvents:'none', overflow:'visible' }}>
      <defs>
        <filter id="inv4-shared" colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix type="matrix"
            values="-1 0 0 0 1
                     0 -1 0 0 1
                     0  0 -1 0 1
                     0  0  0 1 0" />
        </filter>
        {REGIONS.map(region => (
          <mask key={region.id} id={`msk4-${region.id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <image
              href={`${MASK_DIR}/${encodeURIComponent(region.maskFile)}`}
              x="0" y="0" width="100%" height="100%"
              preserveAspectRatio="none"
              filter="url(#inv4-shared)"
            />
          </mask>
        ))}
        <filter id="region-glow-4" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {REGIONS.map(region => {
        const isActive = activeRegions.some(r => r.id === region.id)
        const isPanel  = panelRegion?.id === region.id
        return (
          <rect
            key={region.id}
            x="0" y="0" width="100%" height="100%"
            fill={region.houseColor}
            mask={`url(#msk4-${region.id})`}
            opacity={isActive ? 1 : 0}
            filter={isActive && isPanel ? 'url(#region-glow-4)' : undefined}
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
  </div>
)

// ─── Légende accordéon ─────────────────────────────────────────────────────────
const LegendAccordion = ({ activeRegions, onRegionClick }) => {
  const [openGroups, setOpenGroups] = useState(() => new Set(['WESTEROS']))

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
      {LEGEND_GROUPS4.map(group => {
        const isOpen    = openGroups.has(group.label)
        const activeCount = group.ids.filter(id => activeRegions.some(r => r.id === id)).length
        return (
          <div key={group.label} className={`legend4-group ${isOpen ? 'legend4-group-open' : ''}`}>
            <button className="legend4-group-header" onClick={() => toggleGroup(group.label)}>
              <span className="legend4-group-label">{group.label}</span>
              <span className="legend4-group-meta">
                {activeCount > 0 && <span className="legend4-active-badge">{activeCount}</span>}
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
                      className={`legend-item ${isActive ? 'legend-active' : ''}`}
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

// ─── Modale plein écran avec zoom vers curseur + pan ─────────────────────────
// Toujours visible : en plein écran on ne filtre plus les lieux par région active
const fsAlwaysVisible = () => true
// Aucune région en surbrillance en plein écran — la sélection est purement informative
const FS_NO_ACTIVE_REGIONS = []

const FullscreenMap = ({ activeLieu, panelRegion, getRegion, panelAnchor, handleLieuClick, handleRegionClick, closePanel, findRegion, onClose }) => {
  // State pour le rendu
  const [zoom, setZoom] = useState(1)
  const [pan,  setPan]  = useState({ x: 0, y: 0 })

  // Refs pour les handlers (pas de closure périmée)
  const zoomRef      = useRef(1)
  const panRef       = useRef({ x: 0, y: 0 })
  const isDragging   = useRef(false)
  const dragStart    = useRef({ x: 0, y: 0 })
  const dragPanStart = useRef({ x: 0, y: 0 })
  const didDrag      = useRef(false)
  const wrapperRef   = useRef(null)
  const fsMapRef     = useRef(null)
  const rafRef       = useRef(null)

  const ZOOM_MIN  = 1
  const ZOOM_MAX  = 8
  const ZOOM_STEP = 0.25

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

  // Calcule le pan clampé selon le zoom et la taille du wrapper
  const getClampedPan = useCallback((p, z) => {
    if (!wrapperRef.current) return p
    const { width, height } = wrapperRef.current.getBoundingClientRect()
    // Avec transform: scale(z) translate(tx, ty), le déplacement écran = z * tx
    // Max déplacement écran = (z-1)/2 * dimension → max tx = (z-1)/(2z) * dimension
    const maxX = width  * (z - 1) / (2 * z)
    const maxY = height * (z - 1) / (2 * z)
    return { x: clamp(p.x, -maxX, maxX), y: clamp(p.y, -maxY, maxY) }
  }, [])

  // Applique zoom + pan et synchronise refs + state
  const applyTransform = useCallback((z, p) => {
    zoomRef.current = z
    panRef.current  = p
    setZoom(z)
    setPan(p)
  }, [])

  // ── Wheel : zoom vers le curseur ──────────────────────────────────────────
  // Ajout impératif avec { passive: false } pour pouvoir appeler preventDefault
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const rect   = el.getBoundingClientRect()
      // Position du curseur relative au centre du wrapper (en px écran)
      const mx = e.clientX - rect.left - rect.width  / 2
      const my = e.clientY - rect.top  - rect.height / 2

      const prevZ = zoomRef.current
      const newZ  = clamp(prevZ + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), ZOOM_MIN, ZOOM_MAX)
      if (newZ === prevZ) return

      // Avec transform: scale(z) translate(tx, ty), le point sous curseur est à :
      //   contenu = (mx/z - tx, my/z - ty)
      // On veut le même point sous curseur après newZ :
      //   newTx = mx*(1/newZ - 1/prevZ) + prevTx
      const prevP = panRef.current
      const newP  = getClampedPan({
        x: mx * (1 / newZ - 1 / prevZ) + prevP.x,
        y: my * (1 / newZ - 1 / prevZ) + prevP.y,
      }, newZ)

      applyTransform(newZ, newP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [getClampedPan, applyTransform])

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Drag / pan ────────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0) return
    isDragging.current   = true
    didDrag.current      = false
    dragStart.current    = { x: e.clientX, y: e.clientY }
    dragPanStart.current = { ...panRef.current }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
    if (!didDrag.current) return
    // Avec scale(z) translate(tx), déplacement écran = z*dtx → dtx = dx/z pour 1:1
    const z   = zoomRef.current
    const newP = getClampedPan({
      x: dragPanStart.current.x + dx / z,
      y: dragPanStart.current.y + dy / z,
    }, z)
    panRef.current = newP
    setPan(newP)
  }, [getClampedPan])

  const handlePointerUp = useCallback((e) => {
    const wasDrag = didDrag.current
    isDragging.current = false
    didDrag.current    = false
    if (!wasDrag && fsMapRef.current) {
      // `setPointerCapture` redirige TOUS les événements du pointeur vers le
      // wrapper — y compris le `click` qui suit. Le `onClick` natif des
      // marqueurs ne se déclenche donc jamais ici : on doit détecter et gérer
      // nous-mêmes la sélection du lieu à partir du point de relâchement réel.
      const elAtPoint = document.elementFromPoint(e.clientX, e.clientY)
      const lieuEl = elAtPoint?.closest && elAtPoint.closest('.map-lieu')
      if (lieuEl) {
        const lieu = LIEUX.find(l => l.id === lieuEl.getAttribute('data-lieu-id'))
        if (lieu) handleLieuClick(lieu, e)
        return
      }
      const region = findRegion(e.clientX, e.clientY, fsMapRef.current)
      if (region) handleRegionClick(region, e)
    }
  }, [findRegion, handleRegionClick, handleLieuClick])

  // ── Boutons ───────────────────────────────────────────────────────────────
  const zoomIn  = () => { const z = clamp(zoomRef.current + 0.5, ZOOM_MIN, ZOOM_MAX); applyTransform(z, getClampedPan(panRef.current, z)) }
  const zoomOut = () => { const z = clamp(zoomRef.current - 0.5, ZOOM_MIN, ZOOM_MAX); applyTransform(z, getClampedPan(panRef.current, z)) }
  const reset   = () => applyTransform(1, { x: 0, y: 0 })

  // ── Curseur adaptatif ─────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return
    const cx = e.clientX, cy = e.clientY
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      if (!wrapperRef.current) return
      if (isDragging.current) { wrapperRef.current.style.cursor = 'grabbing'; return }
      const region = findRegion(cx, cy, fsMapRef.current)
      wrapperRef.current.style.cursor = region ? 'pointer' : zoomRef.current > 1 ? 'grab' : 'default'
    })
  }, [findRegion])

  return (
    <div className="fs-overlay" onClick={onClose}>
      {/* Contrôles */}
      <div className="fs-controls" onClick={e => e.stopPropagation()}>
        <button className="fs-btn" onClick={zoomIn} title="Zoom +">＋</button>
        <span className="fs-zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="fs-btn" onClick={zoomOut} title="Zoom −">－</button>
        <button className="fs-btn fs-btn-reset" onClick={reset} title="Réinitialiser">⟲</button>
        <button className="fs-btn fs-btn-close" onClick={onClose} title="Fermer (Échap)">✕</button>
      </div>

      <div className="fs-hint">Molette pour zoomer vers le curseur · Drag pour déplacer · Clic en dehors pour fermer</div>

      {/* Zone carte */}
      <div
        ref={wrapperRef}
        className="fs-map-wrapper"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseMove={handleMouseMove}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="fs-map-inner"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <MapContent
            containerRef={fsMapRef}
            activeRegions={FS_NO_ACTIVE_REGIONS}
            activeLieu={activeLieu}
            panelRegion={panelRegion}
            LIEUX={LIEUX}
            getRegion={getRegion}
            isLieuVisible={fsAlwaysVisible}
            handleMapClick={() => {}}
            handleMapMouseMove={() => {}}
            handleLieuClick={handleLieuClick}
          />
        </div>
      </div>

      {/* Panneau d'info flottant — apparaît du côté opposé au clic, déplaçable */}
      {(activeLieu || panelRegion) && (
        <FloatingInfoPanel anchorSide={panelAnchor} onClose={closePanel}>
          {activeLieu
            ? <PanneauLieu lieu={activeLieu} region={getRegion(activeLieu)} />
            : <PanneauRegion region={panelRegion} />}
        </FloatingInfoPanel>
      )}
    </div>
  )
}

// ─── Panneau d'info flottant (plein écran) ────────────────────────────────────
// Positionné par défaut du côté opposé au clic (anchorSide), et librement
// déplaçable par l'utilisateur via sa poignée — la position manuelle est
// alors conservée jusqu'à la fermeture du panneau.
const FloatingInfoPanel = ({ anchorSide, onClose, children }) => {
  const panelRef  = useRef(null)
  const [dragPos, setDragPos] = useState(null) // { x, y } en px viewport, ou null = position ancrée par défaut
  const dragState = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 })

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

  // Les handlers attachés à `window` pendant le drag sont conservés dans la ref
  // pour garantir un retrait propre (même closure pour add/removeEventListener).
  const onDragStart = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    const rect = panelRef.current.getBoundingClientRect()
    dragState.current.active = true
    dragState.current.startX = e.clientX
    dragState.current.startY = e.clientY
    dragState.current.baseX  = dragPos ? dragPos.x : rect.left
    dragState.current.baseY  = dragPos ? dragPos.y : rect.top

    const move = (ev) => {
      if (!dragState.current.active) return
      const dx = ev.clientX - dragState.current.startX
      const dy = ev.clientY - dragState.current.startY
      const w  = panelRef.current?.offsetWidth  || 280
      const h  = panelRef.current?.offsetHeight || 200
      setDragPos({
        x: clamp(dragState.current.baseX + dx, 8, window.innerWidth  - w - 8),
        y: clamp(dragState.current.baseY + dy, 8, window.innerHeight - h - 8),
      })
    }
    const up = () => {
      dragState.current.active = false
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const style = dragPos ? { left: dragPos.x, top: dragPos.y } : undefined
  const anchorClass = dragPos ? 'fs-info-panel-floating' : `fs-info-panel-${anchorSide}`

  return (
    <div
      ref={panelRef}
      className={`fs-info-panel ${anchorClass}`}
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <div className="fs-info-panel-handle" onPointerDown={onDragStart}>
        <span className="fs-info-panel-handle-grip">⠿⠿</span>
        <span className="fs-info-panel-handle-label">Déplacer</span>
        <button className="fs-info-panel-close" onClick={onClose} title="Fermer">✕</button>
      </div>
      <div className="fs-info-panel-body">
        {children}
      </div>
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────────────────────────
const WorldMap4 = ({ onNavigate, instant }) => {
  const [activeRegions, setActiveRegions] = useState([])
  const [activeLieu,    setActiveLieu]    = useState(null)
  const [panelRegion,   setPanelRegion]   = useState(null)
  const [isFullscreen,  setIsFullscreen]  = useState(false)
  // Côté d'ancrage par défaut du panneau flottant en plein écran
  // ('right' = panneau à droite, pour un clic dans la moitié gauche de l'écran, etc.)
  const [panelAnchor,   setPanelAnchor]   = useState('right')

  const sectionRef      = useRef(null)
  const eyebrowRef      = useRef(null)
  const titleRef        = useRef(null)
  const mapContainerRef = useRef(null)
  const rafRef          = useRef(null)

  const findRegion = useRegionPixelData()
  const getRegion  = (lieu) => REGIONS.find(r => r.id === lieu.regionId)

  const isLieuVisible = (lieu) =>
    activeRegions.length === 0 || activeRegions.some(r => r.id === lieu.regionId)

  const handleLieuClick = (lieu, e) => {
    e.stopPropagation()
    if (activeLieu?.id === lieu.id) setActiveLieu(null)
    else { setActiveLieu(lieu); setPanelRegion(getRegion(lieu) || null) }
  }

  const handleRegionClick = useCallback((region, e) => {
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
  }, [])

  // ── Sélection en plein écran : purement informative ───────────────────────
  // Pas de surbrillance régionale, pas de filtrage des lieux — la carte ne
  // bouge pas visuellement, seul le panneau d'info change. Le panneau apparaît
  // du côté opposé au point cliqué pour ne jamais gêner la zone regardée.
  const pickAnchorSide = (e) => {
    if (!e || typeof e.clientX !== 'number') return
    setPanelAnchor(e.clientX < window.innerWidth / 2 ? 'right' : 'left')
  }

  const handleFsRegionClick = (region, e) => {
    if (e) e.stopPropagation()
    pickAnchorSide(e)
    setActiveLieu(null)
    setPanelRegion(prev => (prev?.id === region.id ? null : region))
  }

  const handleFsLieuClick = (lieu, e) => {
    if (e) e.stopPropagation()
    pickAnchorSide(e)
    if (activeLieu?.id === lieu.id) setActiveLieu(null)
    else { setActiveLieu(lieu); setPanelRegion(getRegion(lieu) || null) }
  }

  const closeFsPanel = () => { setActiveLieu(null); setPanelRegion(null) }

  const handleMapClick = (e) => {
    const region = findRegion(e.clientX, e.clientY, mapContainerRef.current)
    if (region) handleRegionClick(region, e)
    else { setActiveRegions([]); setActiveLieu(null); setPanelRegion(null) }
  }

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

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

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

  return (
    <>
      <section ref={sectionRef} className="worldmap-section">
        <div className="worldmap-bg-texture" />

        <header className="worldmap-header">
          <p ref={eyebrowRef} className="worldmap-eyebrow">DE WESTEROS AUX TERRES DE L'OMBRE</p>
          <div className="worldmap-ornament">
            <span className="worldmap-ornament-line" />
            <span className="worldmap-ornament-rune">✦</span>
            <span className="worldmap-ornament-line" />
          </div>
          <h1 ref={titleRef} className="worldmap-title">
            Le <em>Monde Connu</em>
          </h1>
          <p className="worldmap-subtitle">
            Cliquez pour sélectionner · Multi-sélection possible · Cliquez sur zone vide pour tout effacer
          </p>
        </header>

        <div className="worldmap-layout">
          <div className="worldmap-map-wrapper" style={{ position: 'relative' }}>
            {/* Bouton plein écran */}
            <button
              className="map4-fullscreen-btn"
              onClick={() => setIsFullscreen(true)}
              title="Agrandir la carte"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Agrandir
            </button>

            {onNavigate && (
              <div className="map-nav-left">
                <button
                  className="map-nav-arrow"
                  onClick={(e) => { e.stopPropagation(); onNavigate('westeros-essos') }}
                  title="Voir Westeros + Essos"
                >
                  <span className="map-nav-arrow-icon">‹</span>
                  <span className="map-nav-arrow-label">Essos + Westeros</span>
                </button>
              </div>
            )}

            <MapContent
              containerRef={mapContainerRef}
              activeRegions={activeRegions}
              activeLieu={activeLieu}
              panelRegion={panelRegion}
              LIEUX={LIEUX}
              getRegion={getRegion}
              isLieuVisible={isLieuVisible}
              handleMapClick={handleMapClick}
              handleMapMouseMove={handleMapMouseMove}
              handleLieuClick={handleLieuClick}
            />
          </div>

          <div className="worldmap-panel">{renderPanel()}</div>
        </div>

        {/* Légende accordéon */}
        <LegendAccordion
          activeRegions={activeRegions}
          onRegionClick={(region) => handleRegionClick(region, null)}
        />
      </section>

      {/* Plein écran */}
      {isFullscreen && (
        <FullscreenMap
          activeLieu={activeLieu}
          panelRegion={panelRegion}
          getRegion={getRegion}
          panelAnchor={panelAnchor}
          handleLieuClick={handleFsLieuClick}
          handleRegionClick={handleFsRegionClick}
          closePanel={closeFsPanel}
          findRegion={findRegion}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </>
  )
}

export default WorldMap4
