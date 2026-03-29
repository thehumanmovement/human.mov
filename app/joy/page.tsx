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

    // Snake 1: soft pastels (original)
    const pastels1 = [
      'rgba(255, 182, 193, 0.4)',  // pink
      'rgba(255, 218, 185, 0.4)',  // peach
      'rgba(221, 160, 221, 0.4)',  // plum
      'rgba(173, 216, 230, 0.4)',  // light blue
      'rgba(152, 251, 152, 0.4)',  // pale green
      'rgba(255, 255, 186, 0.4)',  // light yellow
      'rgba(199, 178, 255, 0.4)',  // lavender
    ]

    // Snake 2: stronger masculine glittering colors
    const pastels2 = [
      'rgba(0, 180, 255, 0.5)',    // electric blue
      'rgba(0, 255, 200, 0.5)',    // teal
      'rgba(120, 80, 255, 0.5)',   // deep violet
      'rgba(255, 170, 0, 0.5)',    // amber gold
      'rgba(0, 220, 160, 0.5)',    // emerald
      'rgba(180, 120, 255, 0.5)',  // royal purple
      'rgba(50, 200, 255, 0.5)',   // cyan
    ]

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Trail histories
    const trail1: { x: number; y: number; color: string; size: number; alpha: number }[] = []
    const trail2: { x: number; y: number; color: string; size: number; alpha: number }[] = []

    // Sparkle particles for snake 2
    const sparkles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }[] = []

    function animate() {
      t += 0.006

      const w = canvas!.width
      const h = canvas!.height

      // Gentle fade for contrails
      ctx!.fillStyle = 'rgba(15, 10, 25, 0.02)'
      ctx!.fillRect(0, 0, w, h)

      // Shared orbit center with gentle drift
      const cx = w / 2 + Math.sin(t * 0.3) * w * 0.08
      const cy = h / 2 + Math.cos(t * 0.25) * h * 0.06

      // Orbit radius — they whirl around each other
      const orbitR = Math.min(w, h) * 0.12 + Math.sin(t * 0.7) * Math.min(w, h) * 0.04

      // Snake 1 path — orbiting + own flowing movement
      const angle1 = t * 1.4
      const x1 = cx + Math.cos(angle1) * orbitR + Math.sin(t * 2.3) * w * 0.08
      const y1 = cy + Math.sin(angle1) * orbitR + Math.cos(t * 1.7) * h * 0.06

      // Snake 2 path — opposite orbit + own flowing movement
      const angle2 = t * 1.4 + Math.PI // opposite side
      const x2 = cx + Math.cos(angle2) * orbitR + Math.sin(t * 2.1 + 2) * w * 0.08
      const y2 = cy + Math.sin(angle2) * orbitR + Math.cos(t * 1.5 + 1.5) * h * 0.06

      // Add trail points for snake 1
      const colorIdx1 = Math.floor((t * 3) % pastels1.length)
      trail1.push({ x: x1, y: y1, color: pastels1[colorIdx1], size: 40 + Math.sin(t * 3) * 10, alpha: 1 })

      // Add trail points for snake 2
      const colorIdx2 = Math.floor((t * 2.5 + 3) % pastels2.length)
      trail2.push({ x: x2, y: y2, color: pastels2[colorIdx2], size: 42 + Math.sin(t * 2.8) * 12, alpha: 1 })

      // Add sparkles for snake 2 (glittering effect)
      if (Math.random() < 0.6) {
        const sparkColor = pastels2[Math.floor(Math.random() * pastels2.length)].replace('0.5', '0.9')
        sparkles.push({
          x: x2 + (Math.random() - 0.5) * 30,
          y: y2 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          alpha: 1,
          size: 1.5 + Math.random() * 3,
          color: sparkColor,
        })
      }

      // Draw snake 1 contrails
      for (let i = trail1.length - 1; i >= 0; i--) {
        const p = trail1[i]
        p.alpha -= 0.003

        if (p.alpha <= 0) {
          trail1.splice(i, 1)
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

      // Draw snake 2 contrails
      for (let i = trail2.length - 1; i >= 0; i--) {
        const p = trail2[i]
        p.alpha -= 0.003

        if (p.alpha <= 0) {
          trail2.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.globalAlpha = p.alpha * 0.7
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.fill()
        ctx!.restore()
      }

      // Draw sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.x += s.vx
        s.y += s.vy
        s.alpha -= 0.015

        if (s.alpha <= 0) {
          sparkles.splice(i, 1)
          continue
        }

        ctx!.save()
        ctx!.globalAlpha = s.alpha
        ctx!.beginPath()
        // Diamond shape for glitter
        ctx!.moveTo(s.x, s.y - s.size)
        ctx!.lineTo(s.x + s.size * 0.6, s.y)
        ctx!.lineTo(s.x, s.y + s.size)
        ctx!.lineTo(s.x - s.size * 0.6, s.y)
        ctx!.closePath()
        ctx!.fillStyle = s.color
        ctx!.shadowColor = s.color
        ctx!.shadowBlur = 8
        ctx!.fill()
        ctx!.restore()
      }

      const fontSize = Math.min(w, h) * 0.055

      // Draw snake 1 text: "i love you"
      const dx1 = Math.cos(t * 1.4) * -1.4 + Math.cos(t * 2.3) * 2.3 * 0.08
      const dy1 = Math.cos(t * 1.4) * 1.4 - Math.sin(t * 1.7) * 1.7 * 0.06
      const textAngle1 = Math.atan2(dy1, dx1) * 0.15

      ctx!.save()
      ctx!.globalAlpha = 1
      ctx!.font = `italic ${fontSize}px Georgia, serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.shadowColor = 'rgba(255, 200, 255, 0.8)'
      ctx!.shadowBlur = 30
      ctx!.translate(x1, y1)
      ctx!.rotate(textAngle1)
      ctx!.fillStyle = '#fff'
      ctx!.fillText('i love you', 0, 0)
      ctx!.restore()

      // Draw snake 2 text: "I love you too" with glittering color
      const dx2 = Math.cos(t * 1.4 + Math.PI) * -1.4 + Math.cos(t * 2.1 + 2) * 2.1 * 0.08
      const dy2 = Math.cos(t * 1.4 + Math.PI) * 1.4 - Math.sin(t * 1.5 + 1.5) * 1.5 * 0.06
      const textAngle2 = Math.atan2(dy2, dx2) * 0.15

      // Cycling glitter color for the text
      const hue = (t * 40) % 360
      const textColor = `hsl(${hue}, 70%, 75%)`

      ctx!.save()
      ctx!.globalAlpha = 1
      ctx!.font = `bold italic ${fontSize * 1.05}px Georgia, serif`
      ctx!.textAlign = 'center'
      ctx!.textBaseline = 'middle'
      ctx!.shadowColor = `hsla(${hue}, 80%, 60%, 0.9)`
      ctx!.shadowBlur = 35
      ctx!.translate(x2, y2)
      ctx!.rotate(textAngle2)
      ctx!.fillStyle = textColor
      ctx!.fillText('I love you too', 0, 0)
      // Double glow pass
      ctx!.shadowBlur = 15
      ctx!.shadowColor = `hsla(${(hue + 60) % 360}, 90%, 70%, 0.6)`
      ctx!.fillText('I love you too', 0, 0)
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
