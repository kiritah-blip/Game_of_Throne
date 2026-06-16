import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDragonTransition } from './DragonTransitionContext'
import './Navbar.css'

const NAV_LIENS = [
  { label: 'Accueil',      to: '/' },
  { label: 'Le Monde',     to: '/monde' },
  { label: 'Personnages',  to: '/personnages' },
  { label: 'Maisons',      to: '/maisons' },
  { label: 'Dragons',      to: '/dragons' },
  { label: 'Histoire',     to: '/histoire' },
]

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    triggerDragon,     cancelDragon,     dragonActive,
    triggerMonde,      cancelMonde,      mondeActive,
    triggerMaison,     cancelMaison,     maisonActive,
    triggerPersonnage, cancelPersonnage, personnageActive,
    triggerHistoire,   cancelHistoire,   histoireActive,
  } = useDragonTransition() || {}

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Annule toutes les transitions actives (appelé avant d'en déclencher une nouvelle
  // ou lors d'une navigation directe via <Link>).
  const cancelAll = () => {
    if (dragonActive)     cancelDragon?.()
    if (mondeActive)      cancelMonde?.()
    if (maisonActive)     cancelMaison?.()
    if (personnageActive) cancelPersonnage?.()
    if (histoireActive)   cancelHistoire?.()
  }

  return (
    <nav className="standalone-nav">
      <Link to="/" className="standalone-nav-logo">Game of Thrones</Link>
      <ul className="standalone-nav-links">
        {NAV_LIENS.map(l => {

          // ── Le Monde : transition chroma key ──────────────────────────────
          if (l.to === '/monde') {
            return (
              <li key={l.to}>
                <button
                  className={`nav-link-btn ${isActive(l.to) ? 'nav-active' : ''}`}
                  onClick={() => {
                    // Déjà sur /monde sans animation → rien
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

          // ── Personnages : transition chroma key auto ──────────────────────
          if (l.to === '/personnages') {
            return (
              <li key={l.to}>
                <button
                  className={`nav-link-btn ${isActive(l.to) ? 'nav-active' : ''}`}
                  onClick={() => {
                    // Déjà sur /personnages sans animation → rien
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

          // ── Maisons : transition "insérez la clé" ─────────────────────────
          // Phase waiting : vidéo en pause + invite de clic.
          // Phase playing : animation chroma key → révèle MaisonsPage.
          if (l.to === '/maisons') {
            return (
              <li key={l.to}>
                <button
                  className={`nav-link-btn ${isActive(l.to) ? 'nav-active' : ''}`}
                  onClick={() => {
                    // Déjà sur /maisons sans animation → rien
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

          // ── Dragons : transition vidéo dragon ─────────────────────────────
          if (l.to === '/dragons') {
            return (
              <li key={l.to}>
                <button
                  className={`nav-link-btn ${isActive(l.to) ? 'nav-active' : ''}`}
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

          // ── Histoire : transition chroma key + zoom dans la page ──────────
          if (l.to === '/histoire') {
            return (
              <li key={l.to}>
                <button
                  className={`nav-link-btn ${isActive(l.to) ? 'nav-active' : ''}`}
                  onClick={() => {
                    // Déjà sur /histoire sans animation → rien
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

          // ── Tous les autres liens : annule toutes les transitions actives ──
          return (
            <li key={l.to}>
              <Link
                to={l.to}
                className={isActive(l.to) ? 'nav-active' : ''}
                onClick={cancelAll}
              >
                {l.label}
              </Link>
            </li>
          )

        })}
      </ul>
    </nav>
  )
}

export default Navbar
