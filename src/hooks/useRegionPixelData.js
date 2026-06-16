import { useEffect, useRef, useState } from 'react'

/**
 * Charge les masques de région en arrière-plan (par lots, pendant les idle)
 * pour le pixel-testing au click/hover sur la carte.
 *
 * @param {Array}  regions  - tableau de régions avec { id, maskFile }
 * @param {string} maskDir  - base URL du dossier de masques
 * @param {number} mapW     - largeur de référence des masques
 * @param {number} mapH     - hauteur de référence des masques
 * @returns {{ findRegion, loadedCount, totalCount }}
 */
export function useRegionPixelData(regions, maskDir, mapW, mapH) {
  const pixelData    = useRef({})
  const ready        = useRef(false)
  const [loadedCount, setLoadedCount] = useState(0)
  const total = regions.length

  useEffect(() => {
    let count     = 0
    let cancelled = false

    const loadOne = (region) => new Promise(resolve => {
      const img = new window.Image()
      img.src = `${maskDir}/${encodeURIComponent(region.maskFile)}?v=pixel2`
      img.onload = () => {
        if (cancelled) return resolve()
        const canvas = document.createElement('canvas')
        canvas.width = mapW; canvas.height = mapH
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, mapW, mapH)
        try {
          pixelData.current[region.id] = ctx.getImageData(0, 0, mapW, mapH).data
        } catch (_) {}
        count++
        if (count === total) ready.current = true
        setLoadedCount(count)
        resolve()
      }
      img.onerror = () => {
        count++
        if (count === total) ready.current = true
        resolve()
      }
    })

    const BATCH_SIZE = 4
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 16))

    const loadAll = async () => {
      for (let i = 0; i < regions.length; i += BATCH_SIZE) {
        if (cancelled) break
        // Attendre une période d'inactivité du navigateur
        await new Promise(res => idle(res, { timeout: 600 }))
        await Promise.all(regions.slice(i, i + BATCH_SIZE).map(loadOne))
      }
    }
    loadAll()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findRegion = (clientX, clientY, containerEl) => {
    if (!containerEl) return null
    const rect = containerEl.getBoundingClientRect()
    const px = Math.round((clientX - rect.left) / rect.width  * mapW)
    const py = Math.round((clientY - rect.top)  / rect.height * mapH)
    if (px < 0 || px >= mapW || py < 0 || py >= mapH) return null

    for (const region of regions) {
      const data = pixelData.current[region.id]
      if (!data) continue
      const idx = (py * mapW + px) * 4
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3]
      if (a < 40) continue
      const brightness = (r + g + b) / 3
      if (brightness > 140) continue
      return region
    }
    return null
  }

  return { findRegion, loadedCount, totalCount: total }
}
