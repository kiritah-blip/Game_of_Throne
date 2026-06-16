import { useState, useCallback }   from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AccueilPage        from './pages/AccueilPage'
import MaisonsPage        from './pages/MaisonsPage'
import PersonnagesPage    from './pages/PersonnagesPage'
import MondePage          from './pages/MondePage'
import HistoirePage       from './pages/HistoirePage'
import DragonsPage        from './pages/DragonsPage'
import MusicPlayer         from './components/MusicPlayer'
import DragonTransition    from './components/DragonTransition'
import ChromaKeyTransition from './components/ChromaKeyTransition'
import MaisonTransition    from './components/MaisonTransition'
import PersonnagesTransition from './components/PersonnagesTransition'
import HistoireTransition  from './components/HistoireTransition'
import { DragonTransitionContext } from './components/DragonTransitionContext'
import './App.css'

function App() {
  // ── Transition Dragon ──────────────────────────────────────────────────────
  const [dragonActive, setDragonActive] = useState(false)
  const [dragonKey,    setDragonKey]    = useState(0)

  const triggerDragon = useCallback(() => {
    setDragonKey(k => k + 1)
    setDragonActive(true)
  }, [])
  const cancelDragon = useCallback(() => setDragonActive(false), [])
  const doneDragon   = useCallback(() => setDragonActive(false), [])

  // ── Transition Monde (ChromaKey) ───────────────────────────────────────────
  // Même pattern que Dragon : monté HORS de <Routes> → survit aux changements
  // de route et n'est jamais bloqué par la hiérarchie DOM des pages.
  const [mondeActive, setMondeActive] = useState(false)
  const [mondeKey,    setMondeKey]    = useState(0)

  const triggerMonde = useCallback(() => {
    setMondeKey(k => k + 1)
    setMondeActive(true)
  }, [])
  const cancelMonde = useCallback(() => setMondeActive(false), [])
  const doneMonde   = useCallback(() => setMondeActive(false), [])

  // ── Transition Maisons (ChromaKey + clic pour démarrer) ───────────────────
  // Même architecture hors Routes. Phase 'waiting' jusqu'au clic utilisateur,
  // puis phase 'playing' avec chroma key qui révèle MaisonsPage.
  const [maisonActive, setMaisonActive] = useState(false)
  const [maisonKey,    setMaisonKey]    = useState(0)

  const triggerMaison = useCallback(() => {
    setMaisonKey(k => k + 1)
    setMaisonActive(true)
  }, [])
  const cancelMaison = useCallback(() => setMaisonActive(false), [])
  const doneMaison   = useCallback(() => setMaisonActive(false), [])

  // ── Transition Personnages (ChromaKey auto-démarrage) ─────────────────────
  // Même pattern que Monde : démarre dès l'arrivée sur la page,
  // révèle PersonnagesPage à travers le chroma key, puis overlay disparaît.
  const [personnageActive, setPersonnageActive] = useState(false)
  const [personnageKey,    setPersonnageKey]    = useState(0)

  const triggerPersonnage = useCallback(() => {
    setPersonnageKey(k => k + 1)
    setPersonnageActive(true)
  }, [])
  const cancelPersonnage = useCallback(() => setPersonnageActive(false), [])
  const donePersonnage   = useCallback(() => setPersonnageActive(false), [])

  // ── Transition Histoire (ChromaKey + zoom dans la page) ───────────────────
  // Même pattern que Monde : démarre dès l'arrivée sur la page, révèle
  // HistoirePage à travers la page verte du livre, puis zoom dedans.
  const [histoireActive, setHistoireActive] = useState(false)
  const [histoireKey,    setHistoireKey]    = useState(0)

  const triggerHistoire = useCallback(() => {
    setHistoireKey(k => k + 1)
    setHistoireActive(true)
  }, [])
  const cancelHistoire = useCallback(() => setHistoireActive(false), [])
  const doneHistoire   = useCallback(() => setHistoireActive(false), [])

  return (
    <BrowserRouter>
      <DragonTransitionContext.Provider value={{
        triggerDragon,    cancelDragon,    dragonActive,
        triggerMonde,     cancelMonde,     mondeActive,
        triggerMaison,    cancelMaison,    maisonActive,
        triggerPersonnage, cancelPersonnage, personnageActive,
        triggerHistoire,  cancelHistoire,  histoireActive,
      }}>

        <MusicPlayer />

        {/* ── Overlay Dragon — hors Routes, survit aux changements de route ── */}
        {dragonActive && (
          <DragonTransition key={dragonKey} onComplete={doneDragon} />
        )}

        {/* ── Overlay Monde — même architecture que Dragon ─────────────────── */}
        {mondeActive && (
          <ChromaKeyTransition key={mondeKey} onComplete={doneMonde} />
        )}

        {/* ── Overlay Maisons — phase waiting (clic) + phase playing (chroma) ─ */}
        {maisonActive && (
          <MaisonTransition key={maisonKey} onComplete={doneMaison} />
        )}

        {/* ── Overlay Personnages — corbeau + toile qui s'envole avec lui ──── */}
        {personnageActive && (
          <PersonnagesTransition
            key={personnageKey}
            onComplete={donePersonnage}
          />
        )}

        {/* ── Overlay Histoire — chroma key + zoom dans la page du livre ───── */}
        {histoireActive && (
          <HistoireTransition key={histoireKey} onComplete={doneHistoire} />
        )}

        <Routes>
          <Route path="/"            element={<AccueilPage />} />
          <Route path="/maisons"     element={<MaisonsPage />} />
          <Route path="/personnages" element={<PersonnagesPage />} />
          <Route path="/monde"       element={<MondePage />} />
          <Route path="/histoire"    element={<HistoirePage />} />
          <Route path="/dragons"     element={<DragonsPage />} />
        </Routes>

      </DragonTransitionContext.Provider>
    </BrowserRouter>
  )
}

export default App
