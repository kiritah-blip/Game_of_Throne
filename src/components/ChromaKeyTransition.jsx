import { useEffect, useRef } from 'react'
import './ChromaKeyTransition.css'

// ── Paramètres chroma key (normalisés 0..1) ──────────────────────────────────
// Ajustez si le fond vert reste visible (↓ threshold) ou si des éléments
// du parchemin disparaissent (↑ threshold).
const GREEN_THRESHOLD = 0.12   // agressif : attrape les verts compressés/sombres
const EDGE_SOFTNESS   = 0.07   // fondu de bord

// ── Vitesse de lecture ────────────────────────────────────────────────────────
const PLAYBACK_RATE      = 1.75  // vitesse sur la 1ère partie
const PLAYBACK_RATE_FAST = 4.5   // vitesse après la coupure
// Position de la coupure (0..1 = % de la durée totale).
// Réglez cette valeur en regardant la vidéo : si la coupure est à 4 s sur 10 s → 0.40
const CUT_AT_PCT         = 0.42

// Pourcentage de la vidéo à partir duquel on déclenche le fondu de sortie.
// Mis à 0.90 pour ne pas attendre la toute-dernière frame (qui peut rester
// figée 2 s sur le bord droit). Baissez si le morceau résiduel apparaît encore.
const END_AT_PCT         = 0.90

// Durée du fondu de sortie en ms (plus court = disparition plus franche)
const FADE_OUT_MS        = 350

// ── Vertex shader : quad plein écran + UV en mode "cover" ───────────────────
const VERT = `
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  uniform   vec2 u_uvScale;
  uniform   vec2 u_uvOffset;
  void main() {
    vec2 uv = a_pos * 0.5 + 0.5;
    uv.y    = 1.0 - uv.y;           /* flip Y (WebGL origine bas-gauche) */
    v_uv    = uv * u_uvScale + u_uvOffset;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`

// ── Fragment shader : détection vert + transparence ─────────────────────────
// Formule clé : c.g - max(c.r, c.b * 0.7)
//   Le facteur 0.7 sur le bleu permet de capturer les tons cyan/teal du fond
//   vert vidéo compressé (où bleu ≈ 80-90 % de vert) sans toucher au feu
//   orange (r domine → guard échoue) ni au parchemin jaune (r > g → guard échoue).
const FRAG = `
  precision mediump float;
  uniform sampler2D u_tex;
  uniform float     u_thr;
  uniform float     u_soft;
  varying vec2      v_uv;
  void main() {
    vec4  c          = texture2D(u_tex, v_uv);
    float bWeighted  = c.b * 0.7;           /* réduit le poids du bleu → détecte le teal */
    float alpha      = 1.0;
    if (c.g > c.r && c.g > bWeighted) {
      float greenness = c.g - max(c.r, bWeighted);
      if      (greenness > u_thr)              alpha = 0.0;
      else if (greenness > u_thr - u_soft)
        alpha = (u_thr - greenness) / u_soft;
    }
    gl_FragColor = vec4(c.rgb, alpha);
  }
`

export default function ChromaKeyTransition({
  onComplete,
  videoSrc         = '/Transition/Video%20Monde.mp4',
  // blurBackground : floute la page derrière pendant toute l'animation.
  blurBackground   = false,
  // Contrôle de la vitesse — régler par vidéo :
  //   playbackRate     : vitesse de base (1.0 = normale, 1.75 = Monde)
  //   playbackRateFast : vitesse après cutAtPct (accélération 2ème partie)
  //   cutAtPct         : seuil d'accélération (1.0 = désactivé)
  //   endAtPct         : seuil de déclenchement du fondu de sortie (0..1)
  playbackRate     = PLAYBACK_RATE,
  playbackRateFast = PLAYBACK_RATE_FAST,
  cutAtPct         = CUT_AT_PCT,
  endAtPct         = END_AT_PCT,
}) {
  const canvasRef        = useRef(null)
  const videoRef         = useRef(null)
  const overlayRef       = useRef(null)
  const backdropRef      = useRef(null)   // masque le flash pendant le buffering uniquement
  const rafRef           = useRef(null)
  const doneRef          = useRef(false)
  // Stocke le setTimeout de finish() pour pouvoir l'annuler dans le cleanup.
  // Sans ça, si le composant est démonté (cancel ou restart) pendant le fade
  // de sortie, le onComplete() se déclenche sur la NOUVELLE instance et la tue.
  const finishTimerRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    if (!canvas || !video) return

    // ── Contexte WebGL transparent ───────────────────────────────────────────
    const gl = canvas.getContext('webgl', {
      alpha:             true,   // canvas transparent → page visible dessous
      premultipliedAlpha: false, // alpha "straight" = compositing correct
      antialias:         false,
      depth:             false,
      stencil:           false,
    })

    if (!gl) {
      // WebGL non disponible → passe directement à la suite
      onComplete?.()
      return
    }

    // ── Compilation des shaders ──────────────────────────────────────────────
    const mkShader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const vs   = mkShader(gl.VERTEX_SHADER,   VERT)
    const fs   = mkShader(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    gl.attachShader(prog, vs); gl.attachShader(prog, fs)
    gl.linkProgram(prog);      gl.useProgram(prog)

    // ── Quad plein écran ─────────────────────────────────────────────────────
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,   1,-1,  -1, 1,
       1,-1,   1, 1,  -1, 1,
    ]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // ── Uniforms ─────────────────────────────────────────────────────────────
    const uTex       = gl.getUniformLocation(prog, 'u_tex')
    const uThr       = gl.getUniformLocation(prog, 'u_thr')
    const uSoft      = gl.getUniformLocation(prog, 'u_soft')
    const uUVScale   = gl.getUniformLocation(prog, 'u_uvScale')
    const uUVOffset  = gl.getUniformLocation(prog, 'u_uvOffset')
    gl.uniform1i(uTex,  0)
    gl.uniform1f(uThr,  GREEN_THRESHOLD)
    gl.uniform1f(uSoft, EDGE_SOFTNESS)
    gl.uniform2f(uUVScale,  1, 1)   // mis à jour dès que les dimensions vidéo sont connues
    gl.uniform2f(uUVOffset, 0, 0)

    // ── Texture vidéo ────────────────────────────────────────────────────────
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // ── Mise à l'échelle "cover" (recadrage aspect ratio) ────────────────────
    let uvReady = false
    const updateCover = () => {
      if (!video.videoWidth) return
      const vr = video.videoWidth / video.videoHeight
      const cr = canvas.width    / canvas.height
      let sx = 1, sy = 1, ox = 0, oy = 0
      if (vr > cr) {
        // vidéo plus large → cadrer horizontalement
        sx = cr / vr;  ox = (1 - sx) / 2
      } else {
        // vidéo plus haute → cadrer verticalement
        sy = vr / cr;  oy = (1 - sy) / 2
      }
      gl.uniform2f(uUVScale,  sx, sy)
      gl.uniform2f(uUVOffset, ox, oy)
      uvReady = true
    }

    // ── Redimensionnement ────────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (uvReady) updateCover()
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Masque backdrop dès que la vidéo peut jouer ──────────────────────────
    // Écouter canplay EN PLUS du RAF : si readyState < 2 au premier tour de
    // boucle, le backdrop resterait noir jusqu'à la prochaine frame valide.
    let backdropHidden = false
    const fadeBackdrop = () => {
      if (backdropHidden || !backdropRef.current) return
      backdropHidden = true
      backdropRef.current.style.transition = 'opacity 0.2s ease'
      backdropRef.current.style.opacity    = '0'
    }
    video.addEventListener('canplay', fadeBackdrop)

    // ── Fin d'animation ──────────────────────────────────────────────────────
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      cancelAnimationFrame(rafRef.current)
      video.pause()
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.transition = `opacity ${FADE_OUT_MS}ms ease`
        overlay.style.opacity    = '0'
      }
      // Stocker le handle dans la ref pour pouvoir l'annuler dans le cleanup
      // si le composant est démonté avant que le timeout ne se déclenche.
      finishTimerRef.current = setTimeout(() => onComplete?.(), FADE_OUT_MS + 50)
    }

    const safetyTimer = setTimeout(finish, 30_000)
    video.addEventListener('ended', finish)
    video.addEventListener('error', finish)

    // ── Boucle de rendu (GPU — aucune charge CPU) ────────────────────────────
    let lastVideoTime  = -1

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      if (video.readyState < 2) return

      // Calcul de l'UV "cover" à la première frame valide
      if (!uvReady) updateCover()

      // N'upload la texture que si la vidéo a avancé (évite le travail inutile)
      if (video.currentTime === lastVideoTime) return
      lastVideoTime = video.currentTime

      // Retire le backdrop dès que la première frame est rendue sur le canvas
      // (double sécurité avec le listener canplay ci-dessus).
      fadeBackdrop()

      // Déclenche la fin AVANT la toute-dernière frame (évite le morceau figé)
      if (video.duration > 0) {
        const pct = video.currentTime / video.duration
        if (pct >= endAtPct) { finish(); return }
        // Accélère après la coupure (2ème partie de la vidéo)
        if (pct >= cutAtPct && video.playbackRate !== playbackRateFast) {
          video.playbackRate = playbackRateFast
        }
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    rafRef.current = requestAnimationFrame(draw)
    video.playbackRate = playbackRate
    video.play().catch(() => {})

    // ── Nettoyage ────────────────────────────────────────────────────────────
    return () => {
      clearTimeout(safetyTimer)
      // CRITIQUE : annule le setTimeout planifié dans finish().
      // Sans ce clear, si le composant est démonté (cancel ou restart avec
      // nouvelle key) pendant le fade de sortie, le onComplete() orphelin se
      // déclenche sur le contexte React suivant et tue la nouvelle instance.
      clearTimeout(finishTimerRef.current)
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      video.removeEventListener('canplay', fadeBackdrop)
      video.removeEventListener('ended', finish)
      video.removeEventListener('error', finish)
      video.pause()
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(prog)
    }
  }, [onComplete, playbackRate, playbackRateFast, cutAtPct, endAtPct])

  return (
    <div ref={overlayRef} className="ckt-overlay">
      {/*
        Backdrop opaque : couvre la page IMMÉDIATEMENT au montage du composant,
        avant même que la vidéo ne charge. Évite le flash de la carte (~0.3 s)
        pendant le buffering. Disparaît dès la première frame rendue sur le canvas
        → la carte redevient visible à travers les zones transparentes (chroma key).
      */}
      {/*
        Backdrop opaque : couvre la page IMMÉDIATEMENT au montage du composant,
        avant même que la vidéo ne charge. Évite le flash de la carte (~0.3 s)
        pendant le buffering. Disparaît dès la première frame rendue sur le canvas
        → la carte redevient visible à travers les zones transparentes (chroma key).
      */}
      <div ref={backdropRef} className="ckt-backdrop" />

      {/*
        Flou de fond optionnel (blurBackground=true).
        Positionné entre le backdrop et le canvas :
          · backdrop (z-index 0) : noir opaque → masque le flou pendant le buffering
          · blur   (z-index 1)   : backdrop-filter flou → floute la page derrière
          · canvas (z-index 2)   : animation WebGL par-dessus
        Fond semi-transparent pour assombrir légèrement et faire ressortir l'animation.
        Disparaît avec l'overlay parent au fondu de sortie (pas de code supplémentaire).
      */}
      {blurBackground && <div className="ckt-blur" />}

      {/*
        <video> dans le DOM, 1×1 px hors-écran.
        Ne pas utiliser display:none → bloque la lecture sur certains navigateurs.
        Pas de crossOrigin → inutile pour une resource same-origin (dossier public/).
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        className="ckt-video"
      />
      {/* canvas WebGL — résolution native de la fenêtre, rendu GPU */}
      <canvas ref={canvasRef} className="ckt-canvas" />
    </div>
  )
}
