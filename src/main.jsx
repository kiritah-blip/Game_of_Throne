import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// ── Pour revenir à la version originale, décommenter la ligne ci-dessous
// import App from './App.jsx'

// ── Version améliorée (navigation + français + boutons fonctionnels)
import App from './App_v2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
