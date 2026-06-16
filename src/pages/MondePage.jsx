import { useState, useRef, useEffect } from 'react'
import Navbar         from '../components/Navbar'
import WorldMap       from '../components/WorldMap'
import WorldMap2      from '../components/WorldMap2'
import WorldMap3      from '../components/WorldMap3'
import WorldMap4      from '../components/WorldMap4'
import './MondePage.css'

const MAPS = [
  { id: 'westeros',       label: 'Westeros',                component: WorldMap  },
  { id: 'westeros-cite',  label: 'Westeros + Cités Libres', component: WorldMap2 },
  { id: 'westeros-essos', label: 'Westeros + Essos',        component: WorldMap3 },
  { id: 'monde-connu',    label: 'Le Monde Connu',          component: WorldMap4 },
]

// Carte affichée par défaut au chargement de la page
const INITIAL_MAP = 'westeros-cite'

// Durée de la phase de sortie (doit correspondre à la transition CSS .monde-map-stage)
const TRANSITION_OUT_MS = 320

const MondePage = () => {
  const [activeMap, setActiveMap]     = useState(INITIAL_MAP)
  const [shownMap,  setShownMap]      = useState(INITIAL_MAP)
  // 'idle' = affichage stable · 'out' = carte actuelle s'éloigne/se voile
  // · 'in' = nouvelle carte positionnée (sans transition) avant son entrée
  const [phase, setPhase]             = useState('idle')

  const timers         = useRef([])
  const stageRefs      = useRef({})    // { [mapId]: HTMLDivElement }
  // Callbacks de ref stables par carte — évite le cycle null→element à chaque
  // rendu qu'une arrow function inline déclencherait (React rappelle l'ancienne
  // ref avec null, puis la nouvelle avec l'élément, à chaque re-render).
  const stageRefCbs    = useRef({})
  // Devient true au premier changement d'onglet — permet de passer instant=true
  // aux cartes suivantes pour éviter un re-déclenchement du fondu d'entrée.
  const hasNavigatedRef = useRef(false)

  // Retourne (et met en cache) un callback de ref stable pour chaque carte.
  const getStageRef = (id) => {
    if (!stageRefCbs.current[id]) {
      stageRefCbs.current[id] = (el) => { if (el) stageRefs.current[id] = el }
    }
    return stageRefCbs.current[id]
  }

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const goToMap = (id) => {
    // On n'interrompt pas une navigation vers la même carte
    if (id === activeMap) return
    // Annule toute transition en cours avant d'en démarrer une nouvelle —
    // plus robuste que bloquer via "phase !== idle" qui peut se retrouver bloqué.
    clearTimers()
    hasNavigatedRef.current = true
    setActiveMap(id)
    setPhase('out')

    const t = setTimeout(() => {
      setShownMap(id)
      setPhase('in')
      // Forcer un reflow synchrone : le navigateur "voit" l'état --in (sans
      // transition) avant que la transition vers idle ne démarre.
      // setTimeout (pas requestAnimationFrame) pour rester fiable même si
      // l'onglet passe en arrière-plan pendant l'animation.
      const t2 = setTimeout(() => {
        const el = stageRefs.current[id]
        if (el) void el.offsetHeight
        setPhase('idle')
      }, 20)
      timers.current.push(t2)
    }, TRANSITION_OUT_MS)
    timers.current.push(t)
  }

  return (
    <>
      <Navbar />
      <div className="monde-tabs">
        {MAPS.map(map => (
          <button
            key={map.id}
            className={`monde-tab ${activeMap === map.id ? 'monde-tab-active' : ''}`}
            onClick={() => goToMap(map.id)}
          >
            {map.label}
          </button>
        ))}
      </div>
      <main>
        {MAPS.map(map => {
          const isShown = map.id === shownMap
          const Comp    = map.component

          // Classe CSS du slot :
          //   · carte affichée → stage class selon la phase de transition
          //   · carte cachée  → monde-map-hidden (display:none mais composant monté)
          const slotClass = isShown
            ? (phase === 'idle'
                ? 'monde-map-stage'
                : `monde-map-stage monde-map-stage--${phase}`)
            : 'monde-map-hidden'

          // instant=true pour toutes les cartes pré-montées en arrière-plan
          // (elles sont déjà dans le DOM et leur section sera immédiatement
          // visible à l'écran quand on les affiche — pas besoin du fondu 0.8s).
          // La carte par défaut conserve son animation naturelle au premier
          // chargement (instant=false tant que hasNavigatedRef est false).
          const instant = map.id !== INITIAL_MAP || hasNavigatedRef.current

          return (
            <div
              key={map.id}
              ref={getStageRef(map.id)}
              className={slotClass}
            >
              <Comp onNavigate={goToMap} instant={instant} />
            </div>
          )
        })}
      </main>
    </>
  )
}

export default MondePage
