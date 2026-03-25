'use client'

import { useEffect, useRef } from 'react'

export default function JoyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const pastels = [
      'rgba(255, 182, 193, 0.4)',  // pink
      'rgba(255, 218, 185, 0.4)',  // peach
      'rgba(221, 160, 221, 0.4)',  // plum
      'rgba(173, 216, 230, 0.4)',  // light blue
      'rgba(152, 251, 152, 0.4)',  // pale green
      'rgba(255, 255, 186, 0.4)',  // light yellow
      'rgba(199, 178, 255, 0.4)',  // lavender
    ]

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Trail history
    const trail: { x: number; y: number; color: string; size: number; alpha: number }[] = []

    function animate() {
      t += 0.008

      const w = canvas!.width
      const h = canvas!.height

      // Gentle fade for contrails
      ctx!.fillStyle = 'rgba(15, 10, 25, 0.025)'
      ctx!.fillRect(0, 0, w, h)

      // Swaying path — combination of sine waves for organic movement
      const x = w / 2 + Math.sin(t * 1.1) * w * 0.28 + Math.sin(t * 2.7) * w * 0.08
      const y = h / 2 + Math.sin(t * 0.8 + 1) * h * 0.25 + Math.cos(t * 1.9) * h * 0.1

      // Add trail points
      const colorIdx = Math.floor((t * 3) % pastels.length)
      trail.push({ x, y, color: pastels[colorIdx], size: 40 + Math.sin(t * 3) * 10, alpha: 1 })

      // Draw contrails
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        p.alpha -= 0.003

        if (p.alpha <= 0) {
          trail.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.globalAlpha = p.alpha * 0.6
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.fill()
        ctx!.restore()
      }

      // Draw the text
      const fontSize = Math.min(w, h) * 0.06
      ctx!.save()
      ctx!.globalAlpha = 1
      ctx!.font = `italic ${fontSize}px Georgia, serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'

      // Glow
      ctx!.shadowColor = 'rgba(255, 200, 255, 0.8)'
      ctx!.shadowBlur = 30

      // Slight rotation following movement direction
      const dx = Math.cos(t * 1.1) * 1.1 + Math.cos(t * 2.7) * 2.7 * 0.08
      const dy = Math.cos(t * 0.8 + 1) * 0.8 - Math.sin(t * 1.9) * 1.9 * 0.1
      const angle = Math.atan2(dy, dx) * 0.15

      ctx!.translate(x, y)
      ctx!.rotate(angle)
      ctx!.fillStyle = '#fff'
      ctx!.fillText('i love you', 0, 0)
      ctx!.restore()

      animId = requestAnimationFrame(animate)
    }

    // Initial fill
    ctx.fillStyle = '#0f0a19'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0f0a19] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
