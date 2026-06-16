import { useEffect, useRef, useState } from 'react'
import './HistoireTransition.css'

// ── Paramètres chroma key (normalisés 0..1) ──────────────────────────────────
const GREEN_THRESHOLD = 0.12
const EDGE_SOFTNESS   = 0.07

// ── Lecture ──────────────────────────────────────────────────────────────────
const PLAYBACK_RATE = 1.0
// Dès que la page de droite (rectangle vert) est visible, on accélère la
// vidéo pour raccourcir l'attente avant le zoom final — le zoom lui-même
// (transition CSS) garde sa durée normale, indépendante de playbackRate.
const FAST_PLAYBACK_RATE = 3.0
// Déclenche le zoom avant la toute dernière frame (qui peut rester figée).
const END_AT_PCT    = 0.97

// ── Quadrilatère vert (page de droite du livre) ──────────────────────────────
// La caméra zoome progressivement sur la page tout au long de la vidéo : le
// quadrilatère vert bouge et grandit entre ~48% et 97% de la lecture de
// "Video Histoire.mp4" (1280×720). On a relevé ses 4 coins (haut-gauche,
// haut-droite, bas-droite, bas-gauche), en coordonnées normalisées (0..1)
// DANS LA TEXTURE VIDÉO, à plusieurs instants — et on interpole entre ces
// relevés à chaque frame pour suivre le zoom caméra.
const QUAD_KEYFRAMES = [
  { t: 0.48, tl: [693 / 1280, 206 / 720], tr: [941 / 1280,  228 / 720], br: [924 / 1280,  588 / 720], bl: [660 / 1280, 561 / 720] },
  { t: 0.50, tl: [693 / 1280, 204 / 720], tr: [945 / 1280,  225 / 720], br: [928 / 1280,  590 / 720], bl: [661 / 1280, 565 / 720] },
  { t: 0.55, tl: [692 / 1280, 198 / 720], tr: [954 / 1280,  218 / 720], br: [938 / 1280,  596 / 720], bl: [663 / 1280, 574 / 720] },
  { t: 0.60, tl: [693 / 1280, 186 / 720], tr: [965 / 1280,  204 / 720], br: [951 / 1280,  599 / 720], bl: [663 / 1280, 580 / 720] },
  { t: 0.65, tl: [692 / 1280, 172 / 720], tr: [979 / 1280,  190 / 720], br: [966 / 1280,  603 / 720], bl: [664 / 1280, 584 / 720] },
  { t: 0.70, tl: [692 / 1280, 155 / 720], tr: [995 / 1280,  172 / 720], br: [983 / 1280,  607 / 720], bl: [667 / 1280, 591 / 720] },
  { t: 0.75, tl: [693 / 1280, 137 / 720], tr: [1013 / 1280, 155 / 720], br: [1000 / 1280, 614 / 720], bl: [669 / 1280, 598 / 720] },
  { t: 0.80, tl: [693 / 1280, 121 / 720], tr: [1030 / 1280, 136 / 720], br: [1019 / 1280, 621 / 720], bl: [671 / 1280, 606 / 720] },
  { t: 0.85, tl: [693 / 1280, 106 / 720], tr: [1048 / 1280, 120 / 720], br: [1037 / 1280, 629 / 720], bl: [672 / 1280, 614 / 720] },
  { t: 0.90, tl: [691 / 1280,  94 / 720], tr: [1062 / 1280, 104 / 720], br: [1054 / 1280, 636 / 720], bl: [675 / 1280, 625 / 720] },
  { t: 0.92, tl: [689 / 1280,  90 / 720], tr: [1068 / 1280,  99 / 720], br: [1060 / 1280, 637 / 720], bl: [677 / 1280, 629 / 720] },
  { t: 0.95, tl: [689 / 1280,  85 / 720], tr: [1072 / 1280,  91 / 720], br: [1070 / 1280, 639 / 720], bl: [680 / 1280, 634 / 720] },
  { t: 0.97, tl: [687 / 1280,  82 / 720], tr: [1075 / 1280,  86 / 720], br: [1074 / 1280, 639 / 720], bl: [681 / 1280, 636 / 720] },
]

// La carte-titre reste totalement invisible (opacity: 0, cf. CSS) tant que
// la vidéo joue normalement — son homographie est simplement maintenue à
// jour à chaque frame pour suivre le quadrilatère vert. Elle n'apparaît
// qu'au moment du fondu final (finish()), en même temps que le zoom/flou :
// ainsi aucun aplat de couleur ne risque de "transpercer" la page encore en
// train de tourner ni de jurer avec la teinte réelle du papier filmé.

// Pendant que la dernière page tourne, le rectangle chroma-keyé (cf.
// EDGE_SOFTNESS) découvre progressivement .hst-backdrop (couleur de base
// #050403, cf. CSS) : un fond noir tranche violemment avec la page tant
// qu'aucun changement n'est appliqué. PAGE_MATCH_START_TIME_S marque le début
// de cette découverte, PAGE_MATCH_END_TIME_S le moment où la page est
// entièrement à plat. Entre les deux, .hst-backdrop glisse PROGRESSIVEMENT
// (CSS transition, durée = PAGE_MATCH_DURATION_MS) vers la couleur réelle de
// la page, EN MÊME TEMPS que la carte-titre (texte + lueur dorée) apparaît en
// fondu — la rotation de la page, le changement de couleur et l'apparition du
// titre se terminent ainsi tous ensemble exactement à PAGE_MATCH_END_TIME_S,
// sans aucune étape brusque ni rectangle de couleur erronée.
const PAGE_MATCH_START_TIME_S = 10.33
const PAGE_MATCH_END_TIME_S   = 11.30
const PAGE_MATCH_DURATION_MS  = (PAGE_MATCH_END_TIME_S - PAGE_MATCH_START_TIME_S) * 1000
// Couleur mesurée directement sur la page du livre (pixels de la vidéo,
// zone de papier sans encre, juste avant que la page de droite ne soit
// recouverte par la carte-titre) — doit être strictement identique à celle
// du fond de .hst-title-card (cf. CSS) pour qu'aucune limite de rectangle ne
// soit visible une fois le fond basculé.
const PORTAL_CREAM_COLOR = '#e3d0b8'

// Agrandissement (autour de son centre) du quadrilatère couvert par la
// carte-titre par rapport au rectangle vert détecté — la marge ainsi créée
// est ensuite estompée en transparence via un masque (cf. .hst-title-card
// mask-image), pour fondre les bords de la carte dans la page du livre sans
// laisser de "délimitation" visible ni de frange du chroma key.
const QUAD_OVERSCALE = 1.18

// Interpole les 4 coins du quadrilatère vert pour une fraction de lecture
// donnée (0..1), par interpolation linéaire entre les relevés ci-dessus.
// Avant le premier relevé (page pas encore visible) ou après le dernier
// (calibration finale), on reste figé sur le relevé le plus proche.
function interpolateQuad(pct) {
  const kfs  = QUAD_KEYFRAMES
  const first = kfs[0]
  const last  = kfs[kfs.length - 1]
  if (pct <= first.t) return first
  if (pct >= last.t)  return last
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i]
    const b = kfs[i + 1]
    if (pct >= a.t && pct <= b.t) {
      const f = (pct - a.t) / (b.t - a.t)
      const lerp = (p, q) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]
      return { tl: lerp(a.tl, b.tl), tr: lerp(a.tr, b.tr), br: lerp(a.br, b.br), bl: lerp(a.bl, b.bl) }
    }
  }
  return last
}

// ── Homographie 4 points (DLT) ───────────────────────────────────────────────
// Résout la transformation projective 3x3 (h33 = 1) qui envoie les 4 points
// `src` sur les 4 points `dst`, dans l'ordre haut-gauche, haut-droite,
// bas-droite, bas-gauche.
function solveHomography(src, dst) {
  const A = []
  const b = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]
    const [X, Y] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X)
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y)
  }
  const n = 8
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
    }
    ;[M[col], M[piv]] = [M[piv], M[col]]
    const pivVal = M[col][col]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = M[r][col] / pivVal
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c]
    }
  }
  const h = M.map((row, i) => row[n] / row[i])
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1] // h11..h33
}

// Convertit une homographie 3x3 (mapping z=0, repère écran en px) en matrice
// CSS `matrix3d`, à utiliser avec `transform-origin: 0 0`.
function homographyToMatrix3d([h11, h12, h13, h21, h22, h23, h31, h32, h33]) {
  return `matrix3d(${h11},${h21},0,${h31}, ${h12},${h22},0,${h32}, 0,0,1,0, ${h13},${h23},0,${h33})`
}

// ── Timings du zoom final ─────────────────────────────────────────────────────
const ZOOM_DURATION_MS = 1100
// Échelle finale du zoom — assez grande pour que la zone de la carte-titre
// (calée sur la page de droite) finisse par occuper tout l'écran.
const FINAL_ZOOM_SCALE = 2.6
// Le zoom final est une vraie trajectoire de caméra : on ne "grossit" pas le
// canvas/la carte (scale), on les recule dans la profondeur (translateZ) sous
// une perspective CSS commune (perspective-origin = centre de la carte-titre).
// Pour une surface plate (le canvas), perspective(p) + translateZ(d) équivaut
// exactement à scale(p / (p - d)) — d est donc choisi pour reproduire
// FINAL_ZOOM_SCALE : d = p * (1 - 1/FINAL_ZOOM_SCALE). Pour la carte (plan
// incliné via son homographie), le même translateZ produit un agrandissement
// non uniforme — plus fort côté "proche" de la caméra — propre à un vrai
// travelling avant.
const PERSPECTIVE_PX = 1200
const ZOOM_TRANSLATE_Z = PERSPECTIVE_PX * (1 - 1 / FINAL_ZOOM_SCALE)
// Flou maximal appliqué au canvas/à la carte pendant le zoom final — effet
// "hyperespace" : on plonge dans le portail, tout devient flou en avançant.
const ZOOM_BLUR_PX = 26
// Le crossfade vers la vraie page HTML (onComplete, qui démonte tout
// l'overlay) doit intervenir AVANT que le flou "hyperespace" (ZOOM_BLUR_PX,
// ease-in) ne rende le titre du livre flou/pixelisé — autour des 2/3 du
// zoom. Le zoom (transform/filter du canvas et de la carte) continue de
// tourner normalement jusqu'à ZOOM_DURATION_MS, mais à CUTOVER_MS l'écran
// doit déjà être entièrement recouvert par .hst-wash-dark (même couleur que
// le fond de HistoirePage, #050403) : le canvas encore flou disparaît donc
// derrière ce voile, et le démontage qui révèle HistoirePage est invisible.
const CUTOVER_MS = ZOOM_DURATION_MS * 0.64

// Le wash crème (lueur du portail) monte en opacité puis redescend, le tout
// avant CUTOVER_MS — pendant ce temps le wash sombre (couleur exacte du fond
// de HistoirePage, #050403) monte en opacité avec un léger retard, pour
// atteindre l'opacité 1 exactement à CUTOVER_MS : la couleur glisse ainsi
// PROGRESSIVEMENT du beige vers le noir avant la bascule vers la vraie page
// (pas de coupure/flash brutal).
const WASH_CREAM_PEAK_MS  = CUTOVER_MS * 0.32
const WASH_CREAM_OUT_MS   = CUTOVER_MS * 0.38
const WASH_DARK_DELAY_MS  = CUTOVER_MS * 0.22
const WASH_DARK_FADE_MS   = CUTOVER_MS - WASH_DARK_DELAY_MS

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
const FRAG = `
  precision mediump float;
  uniform sampler2D u_tex;
  uniform float     u_thr;
  uniform float     u_soft;
  varying vec2      v_uv;
  void main() {
    vec4  c          = texture2D(u_tex, v_uv);
    float bWeighted  = c.b * 0.7;
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

export default function HistoireTransition({ onComplete }) {
  const [videoReady, setVideoReady] = useState(false)
  const canvasRef    = useRef(null)
  const videoRef     = useRef(null)
  const overlayRef   = useRef(null)
  const backdropRef  = useRef(null)
  const cardRef      = useRef(null)
  const cardGlowRef  = useRef(null)
  const washRef      = useRef(null)
  const washDarkRef  = useRef(null)
  const rafRef       = useRef(null)
  const doneRef      = useRef(false)
  const pageMatchStartedRef = useRef(false)
  const zoomTimerRef = useRef(null)
  const washTimerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    const card   = cardRef.current
    const cardGlow = cardGlowRef.current
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

    // ── Uniforms ────────────────────────────────────────────────────────────
    const uTex      = gl.getUniformLocation(prog, 'u_tex')
    const uThr      = gl.getUniformLocation(prog, 'u_thr')
    const uSoft     = gl.getUniformLocation(prog, 'u_soft')
    const uUVScale  = gl.getUniformLocation(prog, 'u_uvScale')
    const uUVOffset = gl.getUniformLocation(prog, 'u_uvOffset')
    gl.uniform1i(uTex,  0)
    gl.uniform1f(uThr,  GREEN_THRESHOLD)
    gl.uniform1f(uSoft, EDGE_SOFTNESS)
    gl.uniform2f(uUVScale,  1, 1)
    gl.uniform2f(uUVOffset, 0, 0)

    // ── Texture vidéo ───────────────────────────────────────────────────────
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // ── Mise à l'échelle "cover" ─────────────────────────────────────────────
    let uvReady = false
    let uvScaleX = 1, uvScaleY = 1, uvOffsetX = 0, uvOffsetY = 0

    // Coins (px écran) d'un quadrilatère normalisé (0..1, repère texture
    // vidéo), après mapping "cover" de la texture vidéo vers l'écran.
    const toScreen = ([nx, ny]) => [
      ((nx - uvOffsetX) / uvScaleX) * canvas.width,
      ((ny - uvOffsetY) / uvScaleY) * canvas.height,
    ]

    // Recalcule la position/perspective de la carte-titre (homographie
    // plein-écran → quadrilatère vert courant) en fonction de l'avancement de
    // la vidéo, pour suivre le zoom caméra qui déplace/agrandit la page de
    // droite du livre. La carte apparaît en fondu juste avant le suivi.
    const updateCardPreview = () => {
      if (!uvReady || !card) return
      const W = canvas.width
      const H = canvas.height
      const fullScreen = [[0, 0], [W, 0], [W, H], [0, H]]
      const last  = QUAD_KEYFRAMES[QUAD_KEYFRAMES.length - 1]
      const pct   = video.duration > 0 ? video.currentTime / video.duration : last.t
      const q     = interpolateQuad(pct)
      const quad  = [q.tl, q.tr, q.br, q.bl].map(toScreen)
      // Légèrement agrandi autour de son centre pour recouvrir la fine
      // frange verdâtre/sombre laissée par l'adoucissement des bords du
      // chroma key (EDGE_SOFTNESS) tout autour du rectangle.
      const ccx = quad.reduce((s, p) => s + p[0], 0) / 4
      const ccy = quad.reduce((s, p) => s + p[1], 0) / 4
      const coverQuad = quad.map(([x, y]) => [
        ccx + (x - ccx) * QUAD_OVERSCALE,
        ccy + (y - ccy) * QUAD_OVERSCALE,
      ])
      card.style.transform = homographyToMatrix3d(solveHomography(fullScreen, coverQuad))
    }

    const updateCover = () => {
      if (!video.videoWidth) return
      const vr = video.videoWidth / video.videoHeight
      const cr = canvas.width     / canvas.height
      let sx = 1, sy = 1, ox = 0, oy = 0
      if (vr > cr) { sx = cr / vr; ox = (1 - sx) / 2 }
      else         { sy = vr / cr; oy = (1 - sy) / 2 }
      gl.uniform2f(uUVScale,  sx, sy)
      gl.uniform2f(uUVOffset, ox, oy)
      uvScaleX = sx; uvScaleY = sy; uvOffsetX = ox; uvOffsetY = oy
      uvReady = true
      updateCardPreview()
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

    // ── Fin d'animation : fondu croisé vers HistoirePage ────────────────────
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      cancelAnimationFrame(rafRef.current)
      video.pause()

      // Cible du zoom final : le centre du quadrilatère vert (la page de
      // droite / la carte-titre), pas le centre de l'écran — sinon la page
      // de droite sort du cadre pendant le zoom.
      const q       = interpolateQuad(END_AT_PCT)
      const corners = [q.tl, q.tr, q.br, q.bl].map(toScreen)
      const cx = corners.reduce((s, p) => s + p[0], 0) / 4
      const cy = corners.reduce((s, p) => s + p[1], 0) / 4
      const origin = `${cx}px ${cy}px`

      // La caméra avance vers la page de droite : le canvas (livre entier)
      // se rapproche via perspective + translateZ et s'estompe en flou/fondu.
      // La carte-titre reste FIXE à sa position (homographie figée à END_AT_PCT)
      // — seule la caméra avance, pas la page elle-même.
      if (overlayRef.current) {
        overlayRef.current.style.perspective       = `${PERSPECTIVE_PX}px`
        overlayRef.current.style.perspectiveOrigin = origin
      }

      canvas.style.transition = `transform ${ZOOM_DURATION_MS}ms linear, opacity ${ZOOM_DURATION_MS}ms ease-in, filter ${ZOOM_DURATION_MS}ms ease-in`
      canvas.style.transform  = `translateZ(${ZOOM_TRANSLATE_Z}px)`
      canvas.style.opacity    = '0'
      canvas.style.filter     = `blur(${ZOOM_BLUR_PX}px)`

      // Carte : aucune transform supplémentaire — elle reste à sa position exacte
      if (card) {
        card.style.transition = `opacity ${ZOOM_DURATION_MS}ms ease`
        card.style.opacity    = '1'
      }

      if (cardGlow) {
        cardGlow.style.transition = `opacity ${ZOOM_DURATION_MS}ms ease`
        cardGlow.style.opacity    = '1'
      }

      if (backdropRef.current) {
        backdropRef.current.style.transition = `opacity ${ZOOM_DURATION_MS}ms ease`
        backdropRef.current.style.opacity    = '0'
      }

      // Wash crème : monte en opacité (le portail "irradie"), puis redescend
      // dès la moitié du zoom.
      if (washRef.current) {
        const wash = washRef.current
        wash.style.transition = `opacity ${WASH_CREAM_PEAK_MS}ms ease`
        wash.style.opacity    = '1'
        washTimerRef.current = setTimeout(() => {
          wash.style.transition = `opacity ${WASH_CREAM_OUT_MS}ms ease`
          wash.style.opacity    = '0'
        }, WASH_CREAM_PEAK_MS)
      }

      // Wash sombre : couleur exacte du fond de HistoirePage (#050403), monte
      // en opacité avec un léger retard sur le wash crème — au moment où
      // l'overlay disparaît, l'écran est déjà entièrement dans cette teinte,
      // identique à celle de la page en dessous : aucune coupure visible.
      if (washDarkRef.current) {
        const washDark = washDarkRef.current
        washDark.style.transition = `opacity ${WASH_DARK_FADE_MS}ms ease ${WASH_DARK_DELAY_MS}ms`
        washDark.style.opacity    = '1'
      }

      zoomTimerRef.current = setTimeout(() => onComplete?.(), CUTOVER_MS)
    }

    const safetyTimer = setTimeout(finish, 30_000)
    video.addEventListener('ended', finish)
    video.addEventListener('error', finish)

    // ── Boucle de rendu ─────────────────────────────────────────────────────
    let lastVideoTime = -1

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      if (video.readyState < 2) return
      if (!uvReady) updateCover()
      if (video.currentTime === lastVideoTime) return
      lastVideoTime = video.currentTime

      updateCardPreview()

      // Démarre le glissement progressif fond noir → crème + apparition du
      // titre, synchronisé avec la fin de rotation de la page (cf. constantes
      // PAGE_MATCH_*) : tout est terminé exactement quand la page est à plat.
      if (!pageMatchStartedRef.current && video.currentTime >= PAGE_MATCH_START_TIME_S) {
        pageMatchStartedRef.current = true
        const backdrop = backdropRef.current
        if (backdrop) {
          backdrop.style.transition      = `background-color ${PAGE_MATCH_DURATION_MS}ms linear`
          backdrop.style.backgroundColor = PORTAL_CREAM_COLOR
        }
        if (card) {
          card.style.transition = `opacity ${PAGE_MATCH_DURATION_MS}ms linear`
          card.style.opacity    = '1'
        }
        if (cardGlow) {
          cardGlow.style.transition = `opacity ${PAGE_MATCH_DURATION_MS}ms linear`
          cardGlow.style.opacity    = '1'
        }
      }

      if (video.duration > 0) {
        const pct = video.currentTime / video.duration
        if (pct >= END_AT_PCT) { finish(); return }
        // Accélère la lecture une fois la page de droite (rectangle vert)
        // visible, jusqu'au déclenchement du zoom final.
        const targetRate = pct >= QUAD_KEYFRAMES[0].t ? FAST_PLAYBACK_RATE : PLAYBACK_RATE
        if (video.playbackRate !== targetRate) video.playbackRate = targetRate
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    rafRef.current = requestAnimationFrame(draw)
    video.playbackRate = PLAYBACK_RATE

    const onCanPlay = () => {
      setVideoReady(true)
      video.play().catch(() => {})
    }
    if (video.readyState >= 3) {
      onCanPlay()
    } else {
      video.addEventListener('canplay', onCanPlay, { once: true })
    }

    // ── Nettoyage ───────────────────────────────────────────────────────────
    return () => {
      clearTimeout(safetyTimer)
      clearTimeout(zoomTimerRef.current)
      clearTimeout(washTimerRef.current)
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      video.removeEventListener('ended',  finish)
      video.removeEventListener('error',  finish)
      video.removeEventListener('canplay', onCanPlay)
      video.pause()
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(prog)
    }
  }, [onComplete])

  return (
    <div ref={overlayRef} className="hst-overlay">
      <div ref={backdropRef} className="hst-backdrop" />
      {!videoReady && (
        <div className="hst-loading">
          <div className="hst-loading-bar-wrap">
            <div className="hst-loading-bar-fill" />
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src="/Transition/Video%20Histoire.mp4"
        muted
        playsInline
        preload="auto"
        className="hst-video"
      />
      <canvas ref={canvasRef} className="hst-canvas" />
      <div ref={cardRef} className="hst-title-card">
        <div ref={cardGlowRef} className="hst-card-glow">
          <div className="hst-title-card-inner">
            <p className="hst-card-eyebrow">Des origines à la fin d'un règne</p>
            <div className="hst-card-ornament">
              <span className="hst-card-line" />
              <span className="hst-card-rune">✦</span>
              <span className="hst-card-line" />
            </div>
            <h2 className="hst-card-title">Les Chroniques de<br /><em>Westeros</em></h2>
            <p className="hst-card-subtitle">12 000 ans d'histoire</p>
          </div>
        </div>
      </div>
      <div ref={washRef} className="hst-wash" />
      <div ref={washDarkRef} className="hst-wash-dark" />
    </div>
  )
}
