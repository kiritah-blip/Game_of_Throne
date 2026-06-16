import { useState, useEffect, useRef } from 'react'
import './MaisonTransition.css'

// ── Paramètres chroma key — réglés pour la vidéo Maisons ────────────────────
// EDGE_SOFTNESS très réduit (0.01) = zone de transition quasi inexistante :
//   · les pixels sont soit 100% opaques, soit 100% transparents
//   · plus de pixels semi-transparents → plus d'aura noire sur le mécanisme bleu
//   · le vrai fond vert (greenness >> 0.12) reste pleinement keyé
// GREEN_THRESHOLD légèrement remonté (0.13) pour attraper le vert résiduel.
const GREEN_THRESHOLD = 0.13
const EDGE_SOFTNESS   = 0.01

// ── Vitesse de lecture ────────────────────────────────────────────────────────
// Vitesse normale pour conserver le côté cinématographique de l'ouverture de porte.
// Augmentez PLAYBACK_RATE si la vidéo est trop longue.
const PLAYBACK_RATE      = 1.0
// Pas d'accélération en 2ème partie (mettre à 1.0 = pas de changement de vitesse)
const PLAYBACK_RATE_FAST = 1.0
const CUT_AT_PCT         = 1.0   // désactive le changement de vitesse
const END_AT_PCT         = 0.92  // déclenche le fondu de sortie avant la fin réelle
const FADE_OUT_MS        = 350

// ── Seuil d'activation du chroma key ─────────────────────────────────────────
// Vidéo "Video Maison.mp4" ≈ 14.6 s. La lumière bleu/cyan de la serrure est
// visible dès le début, mais le VRAI fond vert n'apparaît dans la fente de la
// porte qu'à partir de ~9 s. Avant ce seuil, le shader ne fait AUCUNE découpe
// (alpha = 1 partout) : la lumière bleutée reste donc intacte, sans aura noire.
// Ajustez CHROMA_START_S si le vert apparaît plus tôt/tard dans la vidéo.
const VIDEO_DURATION_S = 14.591
const CHROMA_START_S   = 9.0
const CHROMA_START_PCT = CHROMA_START_S / VIDEO_DURATION_S

// ── Seuil d'ouverture de la porte (révèle le fond derrière le canvas) ───────
// Avant CHROMA_START_PCT, le canvas est 100% opaque (aucune découpe) donc le
// backdrop ne joue aucun rôle visuel — on l'aligne sur le même seuil pour
// révéler la page en arrière-plan exactement quand le chroma key démarre.
const DOOR_OPEN_PCT = CHROMA_START_PCT

// ── Vertex shader : quad plein écran + UV en mode "cover" ───────────────────
const VERT = `
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  uniform   vec2 u_uvScale;
  uniform   vec2 u_uvOffset;
  void main() {
    vec2 uv = a_pos * 0.5 + 0.5;
    uv.y    = 1.0 - uv.y;
    v_uv    = uv * u_uvScale + u_uvOffset;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`

// ── Fragment shader : détection vert + transparence ─────────────────────────
// Détection stricte du fond vert : le vert pur (G élevé, R et B faibles) est
// très différent du cyan/bleu de la lumière de la serrure (G ET B élevés).
// On exige donc G > seuil ET G nettement supérieur à R ET à B avant de
// considérer le pixel comme "fond vert" candidat à la découpe.
// u_active (0/1) coupe entièrement la découpe avant l'apparition du vert.
const FRAG = `
  precision mediump float;
  uniform sampler2D u_tex;
  uniform float     u_thr;
  uniform float     u_soft;
  uniform float     u_active;
  varying vec2      v_uv;
  void main() {
    vec4  c     = texture2D(u_tex, v_uv);
    float alpha = 1.0;
    bool  isPureGreen = c.g > 0.4 && c.g > c.r * 1.5 && c.g > c.b * 1.5;
    if (u_active > 0.5 && isPureGreen) {
      float greenness = c.g - max(c.r, c.b);
      if      (greenness > u_thr)            alpha = 0.0;
      else if (greenness > u_thr - u_soft)   alpha = (u_thr - greenness) / u_soft;
    }
    gl_FragColor = vec4(c.rgb, alpha);
  }
`

export default function MaisonTransition({ onComplete }) {
  // Phase : 'waiting' = vidéo en pause + texte prompt
  //         'playing' = animation chroma key en cours
  const [phase,      setPhase]      = useState('waiting')
  const [videoReady, setVideoReady] = useState(false)

  const videoRef       = useRef(null)
  const canvasRef      = useRef(null)
  const backdropRef    = useRef(null)
  const rafRef         = useRef(null)
  const doneRef        = useRef(false)
  const finishTimerRef = useRef(null)
  const pageMainRef    = useRef(null)

  // ── Cache .page-main pendant toute la durée de la transition ─────────────
  useEffect(() => {
    const el = document.querySelector('.page-main')
    if (!el) return
    pageMainRef.current = el
    el.style.visibility = 'hidden'
    return () => { if (pageMainRef.current) pageMainRef.current.style.visibility = '' }
  }, [])

  // ── S'assure que la 1ère frame s'affiche et détecte quand prêt ───────────
  useEffect(() => {
    if (phase !== 'waiting') return
    const video = videoRef.current
    if (!video) return
    const showFirstFrame = () => { video.currentTime = 0.001 }
    const onReady = () => setVideoReady(true)
    if (video.readyState >= 3) {
      showFirstFrame(); setVideoReady(true)
    } else {
      video.addEventListener('loadedmetadata',  showFirstFrame, { once: true })
      video.addEventListener('canplay',         onReady,        { once: true })
    }
    return () => {
      video.removeEventListener('loadedmetadata', showFirstFrame)
      video.removeEventListener('canplay',        onReady)
    }
  }, [phase])

  // ── Démarrage de l'animation au clic ─────────────────────────────────────
  const startAnimation = () => {
    if (phase !== 'waiting') return
    setPhase('playing')
  }

  // ── WebGL chroma key (uniquement en phase 'playing') ─────────────────────
  useEffect(() => {
    if (phase !== 'playing') return

    const canvas = canvasRef.current
    const video  = videoRef.current
    if (!canvas || !video) return

    // ── Contexte WebGL transparent ─────────────────────────────────────────
    const gl = canvas.getContext('webgl', {
      alpha:              true,
      premultipliedAlpha: false,
      antialias:          false,
      depth:              false,
      stencil:            false,
    })
    if (!gl) { onComplete?.(); return }

    // ── Compilation des shaders ────────────────────────────────────────────
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

    // ── Quad plein écran ───────────────────────────────────────────────────
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1, -1, 1,
       1,-1,  1, 1, -1, 1,
    ]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // ── Uniforms ───────────────────────────────────────────────────────────
    const uTex      = gl.getUniformLocation(prog, 'u_tex')
    const uThr      = gl.getUniformLocation(prog, 'u_thr')
    const uSoft     = gl.getUniformLocation(prog, 'u_soft')
    const uActive   = gl.getUniformLocation(prog, 'u_active')
    const uUVScale  = gl.getUniformLocation(prog, 'u_uvScale')
    const uUVOffset = gl.getUniformLocation(prog, 'u_uvOffset')
    gl.uniform1i(uTex,  0)
    gl.uniform1f(uThr,  GREEN_THRESHOLD)
    gl.uniform1f(uSoft, EDGE_SOFTNESS)
    gl.uniform1f(uActive, 0)
    gl.uniform2f(uUVScale,  1, 1)
    gl.uniform2f(uUVOffset, 0, 0)

    // ── Texture vidéo ──────────────────────────────────────────────────────
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // ── Mise à l'échelle "cover" ───────────────────────────────────────────
    let uvReady = false
    const updateCover = () => {
      if (!video.videoWidth) return
      const vr = video.videoWidth / video.videoHeight
      const cr = canvas.width     / canvas.height
      let sx = 1, sy = 1, ox = 0, oy = 0
      if (vr > cr) { sx = cr / vr; ox = (1 - sx) / 2 }
      else         { sy = vr / cr; oy = (1 - sy) / 2 }
      gl.uniform2f(uUVScale,  sx, sy)
      gl.uniform2f(uUVOffset, ox, oy)
      uvReady = true
    }

    // ── Redimensionnement ──────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (uvReady) updateCover()
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Révèle le fond uniquement quand la porte commence à s'ouvrir ────────
    // Le backdrop reste opaque pendant toute la phase d'insertion de la clé :
    // les tons bleutés/cyan du mécanisme ne déclenchent pas le chroma key sur
    // la page en arrière-plan. Le fondu démarre à DOOR_OPEN_PCT (50% par défaut).
    let backdropHidden = false
    const fadeBackdrop = () => {
      if (backdropHidden || !backdropRef.current) return
      backdropHidden = true
      backdropRef.current.style.transition = 'opacity 0.4s ease'
      backdropRef.current.style.opacity    = '0'
    }

    // ── Fin d'animation ────────────────────────────────────────────────────
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      cancelAnimationFrame(rafRef.current)
      video.pause()
      const canvas = canvasRef.current
      if (canvas) {
        canvas.style.transition = `opacity ${FADE_OUT_MS}ms ease`
        canvas.style.opacity    = '0'
      }
      finishTimerRef.current = setTimeout(() => onComplete?.(), FADE_OUT_MS + 50)
    }

    const safetyTimer = setTimeout(finish, 60_000) // 60 s max
    video.addEventListener('ended', finish)
    video.addEventListener('error', finish)

    // ── Boucle de rendu WebGL ──────────────────────────────────────────────
    let lastVideoTime = -1

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      if (video.readyState < 2) return
      if (!uvReady) updateCover()
      if (video.currentTime === lastVideoTime) return
      lastVideoTime = video.currentTime

      if (video.duration > 0) {
        const pct = video.currentTime / video.duration
        // N'active le chroma key qu'une fois le vrai fond vert apparu
        // (≈ 9 s) : avant ça, la lumière bleu/cyan de la serrure reste
        // intacte, sans découpe ni aura noire.
        gl.uniform1f(uActive, pct >= CHROMA_START_PCT ? 1.0 : 0.0)
        // Révèle le fond seulement quand la porte commence à s'ouvrir
        if (pct >= DOOR_OPEN_PCT) fadeBackdrop()
        if (pct >= END_AT_PCT) { finish(); return }
        if (pct >= CUT_AT_PCT && video.playbackRate !== PLAYBACK_RATE_FAST) {
          video.playbackRate = PLAYBACK_RATE_FAST
        }
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    rafRef.current = requestAnimationFrame(draw)
    video.playbackRate = PLAYBACK_RATE
    video.play().catch(() => {})

    // ── Nettoyage ──────────────────────────────────────────────────────────
    return () => {
      clearTimeout(safetyTimer)
      clearTimeout(finishTimerRef.current)  // annule l'éventuel onComplete orphelin
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      video.removeEventListener('ended',  finish)
      video.removeEventListener('error',  finish)
      video.pause()
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(prog)
    }
  }, [phase, onComplete])

  return (
    <div className="mst-overlay">

      {/*
        ── Vidéo ──────────────────────────────────────────────────────────────
        En 'waiting' : full-screen visible (prévisualisation 1ère frame)
        En 'playing' : cachée hors-écran (alimente le WebGL)
      */}
      <video
        ref={videoRef}
        src="/Transition/Video%20Maison.mp4"
        muted
        playsInline
        preload="auto"
        className={phase === 'waiting' ? 'mst-video-cover' : 'mst-video-hidden'}
      />

      {/*
        ── Phase 'playing' : backdrop + canvas WebGL ─────────────────────────
        Le backdrop masque le flash potentiel pendant le tout premier rendu.
        Il disparaît en 150 ms dès que la vidéo est prête (canplay).
      */}
      {phase === 'playing' && (
        <>
          <div ref={backdropRef} className="mst-backdrop" />
          <canvas ref={canvasRef} className="mst-canvas" />
        </>
      )}

      {/*
        ── Phase 'waiting' : zone de clic + texte d'invite ──────────────────
        pointer-events: all sur l'overlay (.mst-waiting-layer) → clic capture
        sur toute la zone SOUS la navbar (z-index 100 > overlay 99).
        Le clic sur la navbar va toujours à la navbar (z-index supérieur).
      */}
      {phase === 'waiting' && !videoReady && (
        <div className="mst-loading-layer">
          <div className="mst-loading-inner">
            <div className="mst-loading-sigil">🔑</div>
            <div className="mst-loading-bar-wrap">
              <div className="mst-loading-bar-fill" />
            </div>
            <p className="mst-loading-text">Chargement…</p>
          </div>
        </div>
      )}

      {phase === 'waiting' && videoReady && (
        <div className="mst-waiting-layer" onClick={startAnimation}>
          <div className="mst-prompt">
            <div className="mst-prompt-ornament">✦</div>
            <h2 className="mst-prompt-title">INSÉREZ LA CLÉ</h2>
            <p className="mst-prompt-sub">Cliquez n'importe où pour continuer</p>
            <div className="mst-prompt-key">⚿</div>
          </div>
        </div>
      )}

    </div>
  )
}
