import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './PersonnagesTransition.css'

// ── Paramètres chroma key (normalisés 0..1) ──────────────────────────────────
// Identiques à ChromaKeyTransition : fond vert de "Video Personnage.mp4".
const GREEN_THRESHOLD = 0.12
const EDGE_SOFTNESS   = 0.07

// ── Lecture ───────────────────────────────────────────────────────────────────
// Le corbeau vole à son rythme naturel, aucune accélération.
const PLAYBACK_RATE = 1.0

// Déclenche le fondu de sortie juste avant la dernière frame (évite le
// morceau figé en fin de vidéo).
const END_AT_PCT  = 0.97
const FADE_OUT_MS = 350

// ── Envol de la toile (mesuré sur Video Personnage.mp4, 1280×720, 8.567s) ────
// Le corbeau reste quasi immobile au centre jusqu'à ~6.6s, puis bat des
// ailes et s'envole vers le haut (légère dérive vers la droite) pour
// disparaître par le haut du cadre vers 8.3s — juste avant END_AT_PCT.
// RAVEN_EXIT_START_S marque le début du battement d'ailes : c'est à cet
// instant que .pct-canvas-bg ("la toile") est arrachée et part dans la même
// direction que le corbeau, pour donner l'impression qu'il l'emporte avec
// lui dans sa fuite.
const RAVEN_EXIT_START_S = 6.85

// ── Masque radial du point de pince ─────────────────────────────────────────
// Petit SVG (dégradé radial noir → blanc, opacité 0 → 1) encodé en data-URI,
// utilisé dans <filter id="pct-crumple"> comme "feImage". Combiné au bruit de
// feTurbulence via feComposite, il rend le froissement neutre au point précis
// où le corbeau agrippe la toile (cx/cy ci-dessous = transform-origin de
// .pct-canvas-bg, cf. CSS) et de plus en plus marqué en s'en éloignant — comme
// les plis d'un mouchoir pincé qui rayonnent depuis le point de pince.
const PINCH_MASK_SVG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
    '<radialGradient id="g" cx="50%" cy="58%" r="65%">' +
      '<stop offset="0%" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="100%" stop-color="#fff" stop-opacity="1"/>' +
    '</radialGradient>' +
    '<rect width="100" height="100" fill="url(#g)"/>' +
  '</svg>'
)

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

export default function PersonnagesTransition({ onComplete }) {
  const canvasRef    = useRef(null)
  const videoRef     = useRef(null)
  const overlayRef   = useRef(null)
  const backdropRef  = useRef(null)
  const canvasBgRef  = useRef(null)
  const distortionRef = useRef(null)
  const lightingRef    = useRef(null)
  const rafRef       = useRef(null)
  const doneRef      = useRef(false)
  const exitStartedRef = useRef(false)
  const finishTimerRef = useRef(null)
  const exitTweensRef  = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    if (!canvas || !video) return

    const gl = canvas.getContext('webgl', {
      alpha:             true,
      premultipliedAlpha: false,
      antialias:         false,
      depth:             false,
      stencil:           false,
    })

    if (!gl) {
      onComplete?.()
      return
    }

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

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,   1,-1,  -1, 1,
       1,-1,   1, 1,  -1, 1,
    ]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

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

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    let uvReady = false
    const updateCover = () => {
      if (!video.videoWidth) return
      const vr = video.videoWidth / video.videoHeight
      const cr = canvas.width    / canvas.height
      let sx = 1, sy = 1, ox = 0, oy = 0
      if (vr > cr) {
        sx = cr / vr;  ox = (1 - sx) / 2
      } else {
        sy = vr / cr;  oy = (1 - sy) / 2
      }
      gl.uniform2f(uUVScale,  sx, sy)
      gl.uniform2f(uUVOffset, ox, oy)
      uvReady = true
    }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      if (uvReady) updateCover()
    }
    resize()
    window.addEventListener('resize', resize)

    let backdropHidden = false
    const fadeBackdrop = () => {
      if (backdropHidden || !backdropRef.current) return
      backdropHidden = true
      backdropRef.current.style.transition = 'opacity 0.2s ease'
      backdropRef.current.style.opacity    = '0'
    }
    video.addEventListener('canplay', fadeBackdrop)

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
      finishTimerRef.current = setTimeout(() => onComplete?.(), FADE_OUT_MS + 50)
    }

    const safetyTimer = setTimeout(finish, 30_000)
    video.addEventListener('ended', finish)
    video.addEventListener('error', finish)

    // ── Envol de la toile, accrochée à la patte du corbeau ───────────────────
    // Deux animations simultanées :
    //  1. la toile se froisse (feDisplacementMap.scale monte en flèche, comme
    //     une tension brutale au moment où le corbeau l'agrippe), puis
    //     continue de se chiffonner pendant qu'elle s'envole ;
    //  2. la toile est tirée vers le haut-droite, s'étire comme un tissu
    //     sous tension (scaleX < 1, scaleY > 1) avec un effet d'élan
    //     ("back.in") avant de partir, puis s'estompe.
    const animateRavenExit = () => {
      const bg         = canvasBgRef.current
      const distortion = distortionRef.current
      const lighting   = lightingRef.current
      if (!bg) return

      if (distortion) {
        exitTweensRef.current.push(
          gsap.fromTo(distortion,
            { attr: { scale: 0 } },
            { attr: { scale: 140 }, duration: 0.3, ease: 'power2.in' }
          ),
          gsap.to(distortion, {
            attr: { scale: 260 },
            duration: 1.1,
            delay: 0.3,
            ease: 'power1.inOut',
          })
        )
      }

      // Relief des plis (feDiffuseLighting.surfaceScale) : monte en même
      // temps que le froissement pour donner du volume aux plis (ombres et
      // reflets), comme les creux du mouchoir pincé sur la photo de référence.
      if (lighting) {
        exitTweensRef.current.push(
          gsap.fromTo(lighting,
            { attr: { surfaceScale: 0 } },
            { attr: { surfaceScale: 22 }, duration: 0.3, ease: 'power2.in' }
          ),
          gsap.to(lighting, {
            attr: { surfaceScale: 42 },
            duration: 1.1,
            delay: 0.3,
            ease: 'power1.inOut',
          })
        )
      }

      exitTweensRef.current.push(
        gsap.to(bg, {
          xPercent:  22,
          yPercent: -150,
          rotation:  16,
          scaleX:    0.78,
          scaleY:    1.3,
          opacity:   0,
          duration:  1.1,
          delay:     0.12,
          ease:      'back.in(1.6)',
        })
      )
    }

    let lastVideoTime = -1

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      if (video.readyState < 2) return

      if (!uvReady) updateCover()

      if (video.currentTime === lastVideoTime) return
      lastVideoTime = video.currentTime

      fadeBackdrop()

      // Le corbeau bat des ailes et s'envole : la "toile" derrière lui part
      // dans la même direction, comme accrochée à sa patte.
      if (!exitStartedRef.current && video.currentTime >= RAVEN_EXIT_START_S) {
        exitStartedRef.current = true
        animateRavenExit()
      }

      if (video.duration > 0) {
        const pct = video.currentTime / video.duration
        if (pct >= END_AT_PCT) { finish(); return }
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    rafRef.current = requestAnimationFrame(draw)
    video.playbackRate = PLAYBACK_RATE
    video.play().catch(() => {})

    return () => {
      clearTimeout(safetyTimer)
      clearTimeout(finishTimerRef.current)
      exitTweensRef.current.forEach(t => t.kill())
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
  }, [onComplete])

  return (
    <div ref={overlayRef} className="pct-overlay">
      {/*
        Filtre SVG de "froissement" appliqué à .pct-canvas-bg (cf. CSS) :
          1. feImage : masque radial centré sur le point de pince (cx/cy =
             transform-origin de .pct-canvas-bg) — noir/transparent au centre,
             blanc/opaque en s'éloignant.
          2. feTurbulence : bruit fractal, base du froissement.
          3. feComposite (arithmetic) : neutralise le bruit près du point de
             pince et le laisse plein en périphérie → déformation "conique",
             comme les plis d'un mouchoir pincé qui rayonnent depuis ce point.
          4. feDiffuseLighting : transforme ce bruit masqué en relief éclairé
             (ombres/reflets) — donne du VOLUME aux plis.
          5. feBlend (multiply) : applique ce relief sur la toile (SourceGraphic)
             → les plis deviennent visibles même sur un fond uni.
          6. feDisplacementMap : déforme géométriquement le résultat selon le
             même bruit masqué → étirement/plissement de la toile (et de tout
             ce qu'elle affiche).
        "scale" (étape 6) et "surfaceScale" (étape 4) sont animés par GSAP
        (cf. animateRavenExit) — 0 = toile lisse, valeurs élevées = toile
        chiffonnée/étirée au moment où le corbeau l'arrache.
      */}
      <svg className="pct-svg-defs" aria-hidden="true">
        <filter id="pct-crumple" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feImage href={PINCH_MASK_SVG} xlinkHref={PINCH_MASK_SVG} x="0%" y="0%" width="100%" height="100%" preserveAspectRatio="none" result="pinchMask" />
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.05" numOctaves="4" seed="7" result="noise" />
          <feComposite in="noise" in2="pinchMask" operator="arithmetic" k1="1" k2="0" k3="-0.5" k4="0.5" result="foldNoise" />
          <feDiffuseLighting ref={lightingRef} in="foldNoise" surfaceScale="0" diffuseConstant="1.25" lightingColor="#fff6e0" result="shading">
            <feDistantLight azimuth="235" elevation="55" />
          </feDiffuseLighting>
          <feBlend in="SourceGraphic" in2="shading" mode="multiply" result="shaded" />
          <feDisplacementMap ref={distortionRef} in="shaded" in2="foldNoise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Backdrop opaque : couvre la page pendant le buffering vidéo. */}
      <div ref={backdropRef} className="pct-backdrop" />

      {/*
        "Toile" unie derrière le corbeau : le fait ressortir, puis s'envole
        avec lui (cf. RAVEN_EXIT_START_S) en révélant PersonnagesPage dessous.
      */}
      <div ref={canvasBgRef} className="pct-canvas-bg" />

      <video
        ref={videoRef}
        src="/Transition/Video%20Personnage.mp4"
        muted
        playsInline
        preload="auto"
        className="pct-video"
      />
      <canvas ref={canvasRef} className="pct-canvas" />
    </div>
  )
}
