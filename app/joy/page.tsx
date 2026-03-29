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
      'rgba(255, 182, 193, 0.4)',
      'rgba(255, 218, 185, 0.4)',
      'rgba(221, 160, 221, 0.4)',
      'rgba(173, 216, 230, 0.4)',
      'rgba(152, 251, 152, 0.4)',
      'rgba(255, 255, 186, 0.4)',
      'rgba(199, 178, 255, 0.4)',
    ]

    // Snake 2: stronger masculine glittering colors
    const pastels2 = [
      'rgba(0, 180, 255, 0.5)',
      'rgba(0, 255, 200, 0.5)',
      'rgba(120, 80, 255, 0.5)',
      'rgba(255, 170, 0, 0.5)',
      'rgba(0, 220, 160, 0.5)',
      'rgba(180, 120, 255, 0.5)',
      'rgba(50, 200, 255, 0.5)',
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

    // Sparkle particles
    const sparkles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }[] = []

    // Touch/mouse interaction state
    let pointer = { x: -1, y: -1, active: false, dragging: -1 }
    let lastPointer = { x: -1, y: -1 }
    // Attraction offsets — how much each snake is pulled toward touch
    let attract1 = { x: 0, y: 0 }
    let attract2 = { x: 0, y: 0 }
    // Burst particles on tap/click
    const bursts: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string; life: number }[] = []
    // Repel force on tap (pushes snakes away briefly)
    let repel = { x: 0, y: 0, force: 0 }
    // Speed boost from swipe
    let speedBoost = 0

    function getPointerPos(e: MouseEvent | Touch) {
      const rect = canvas!.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    function distToSnake(px: number, py: number, sx: number, sy: number) {
      return Math.hypot(px - sx, py - sy)
    }

    // Burst effect on click/tap
    function createBurst(x: number, y: number, colors: string[]) {
      const count = 30 + Math.floor(Math.random() * 20)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = 2 + Math.random() * 5
        bursts.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: 2 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
        })
      }
    }

    // Mouse events
    function onMouseDown(e: MouseEvent) {
      const pos = getPointerPos(e)
      pointer = { ...pos, active: true, dragging: -1 }
      lastPointer = { ...pos }
    }
    function onMouseMove(e: MouseEvent) {
      const pos = getPointerPos(e)
      if (pointer.active) {
        // Track velocity for swipe speed boost
        const dx = pos.x - lastPointer.x
        const dy = pos.y - lastPointer.y
        speedBoost = Math.min(Math.hypot(dx, dy) * 0.002, 0.05)
      }
      lastPointer = { ...pos }
      pointer.x = pos.x
      pointer.y = pos.y
    }
    function onMouseUp() {
      if (pointer.active) {
        // Create burst at release point
        createBurst(pointer.x, pointer.y, [...pastels1.map(c => c.replace('0.4', '0.9')), ...pastels2.map(c => c.replace('0.5', '0.9'))])
        repel = { x: pointer.x, y: pointer.y, force: 1 }
      }
      pointer.active = false
      pointer.dragging = -1
    }
    function onClick(e: MouseEvent) {
      const pos = getPointerPos(e)
      createBurst(pos.x, pos.y, [...pastels1.map(c => c.replace('0.4', '0.9')), ...pastels2.map(c => c.replace('0.5', '0.9'))])
      repel = { x: pos.x, y: pos.y, force: 1.5 }
    }

    // Touch events
    function onTouchStart(e: TouchEvent) {
      e.preventDefault()
      const touch = e.touches[0]
      const pos = getPointerPos(touch)
      pointer = { ...pos, active: true, dragging: -1 }
      lastPointer = { ...pos }
      // Burst on touch
      createBurst(pos.x, pos.y, [...pastels1.map(c => c.replace('0.4', '0.9')), ...pastels2.map(c => c.replace('0.5', '0.9'))])
      repel = { x: pos.x, y: pos.y, force: 1 }
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const touch = e.touches[0]
      const pos = getPointerPos(touch)
      const dx = pos.x - lastPointer.x
      const dy = pos.y - lastPointer.y
      speedBoost = Math.min(Math.hypot(dx, dy) * 0.003, 0.06)
      lastPointer = { ...pos }
      pointer.x = pos.x
      pointer.y = pos.y
    }
    function onTouchEnd(e: TouchEvent) {
      e.preventDefault()
      pointer.active = false
      pointer.dragging = -1
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })

    function animate() {
      t += 0.006 + speedBoost
      speedBoost *= 0.95 // decay speed boost

      const w = canvas!.width
      const h = canvas!.height

      // Gentle fade for contrails
      ctx!.fillStyle = 'rgba(15, 10, 25, 0.02)'
      ctx!.fillRect(0, 0, w, h)

      // Shared orbit center with gentle drift
      let cx = w / 2 + Math.sin(t * 0.3) * w * 0.08
      let cy = h / 2 + Math.cos(t * 0.25) * h * 0.06

      // If pointer is active, attract the orbit center toward the pointer
      if (pointer.active || pointer.x > 0) {
        const pullStrength = pointer.active ? 0.08 : 0.02
        attract1.x += (pointer.x - cx - attract1.x) * pullStrength
        attract1.y += (pointer.y - cy - attract1.y) * pullStrength
      }
      // Decay attraction
      attract1.x *= 0.96
      attract1.y *= 0.96
      attract2.x *= 0.96
      attract2.y *= 0.96

      // Apply repel force (pushes snakes away from tap point)
      let repelX1 = 0, repelY1 = 0, repelX2 = 0, repelY2 = 0

      // Orbit radius — they whirl around each other
      const orbitR = Math.min(w, h) * 0.12 + Math.sin(t * 0.7) * Math.min(w, h) * 0.04

      // Snake 1 path
      const angle1 = t * 1.4
      let x1 = cx + Math.cos(angle1) * orbitR + Math.sin(t * 2.3) * w * 0.08 + attract1.x * 0.5
      let y1 = cy + Math.sin(angle1) * orbitR + Math.cos(t * 1.7) * h * 0.06 + attract1.y * 0.5

      // Snake 2 path
      const angle2 = t * 1.4 + Math.PI
      let x2 = cx + Math.cos(angle2) * orbitR + Math.sin(t * 2.1 + 2) * w * 0.08 + attract1.x * 0.3
      let y2 = cy + Math.sin(angle2) * orbitR + Math.cos(t * 1.5 + 1.5) * h * 0.06 + attract1.y * 0.3

      // Apply repel
      if (repel.force > 0.01) {
        const d1 = Math.max(distToSnake(repel.x, repel.y, x1, y1), 50)
        const d2 = Math.max(distToSnake(repel.x, repel.y, x2, y2), 50)
        const repelStr = repel.force * 80
        repelX1 = ((x1 - repel.x) / d1) * repelStr
        repelY1 = ((y1 - repel.y) / d1) * repelStr
        repelX2 = ((x2 - repel.x) / d2) * repelStr
        repelY2 = ((y2 - repel.y) / d2) * repelStr
        repel.force *= 0.92
        x1 += repelX1
        y1 += repelY1
        x2 += repelX2
        y2 += repelY2
      }

      // Add trail points for snake 1
      const colorIdx1 = Math.floor((t * 3) % pastels1.length)
      trail1.push({ x: x1, y: y1, color: pastels1[colorIdx1], size: 40 + Math.sin(t * 3) * 10, alpha: 1 })

      // Add trail points for snake 2
      const colorIdx2 = Math.floor((t * 2.5 + 3) % pastels2.length)
      trail2.push({ x: x2, y: y2, color: pastels2[colorIdx2], size: 42 + Math.sin(t * 2.8) * 12, alpha: 1 })

      // Add sparkles for snake 2
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

      // When pointer is active, both snakes emit extra sparkles toward cursor
      if (pointer.active) {
        for (let s = 0; s < 3; s++) {
          const fromX = s < 1.5 ? x1 : x2
          const fromY = s < 1.5 ? y1 : y2
          const colors = s < 1.5 ? pastels1 : pastels2
          const toAngle = Math.atan2(pointer.y - fromY, pointer.x - fromX)
          sparkles.push({
            x: fromX,
            y: fromY,
            vx: Math.cos(toAngle) * (2 + Math.random() * 3) + (Math.random() - 0.5),
            vy: Math.sin(toAngle) * (2 + Math.random() * 3) + (Math.random() - 0.5),
            alpha: 1,
            size: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)].replace(/0\.[45]/, '0.9'),
          })
        }
      }

      // Draw snake 1 contrails
      for (let i = trail1.length - 1; i >= 0; i--) {
        const p = trail1[i]
        p.alpha -= 0.003
        if (p.alpha <= 0) { trail1.splice(i, 1); continue }
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
        if (p.alpha <= 0) { trail2.splice(i, 1); continue }
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
        if (s.alpha <= 0) { sparkles.splice(i, 1); continue }
        ctx!.save()
        ctx!.globalAlpha = s.alpha
        ctx!.beginPath()
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

      // Draw burst particles
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i]
        b.x += b.vx
        b.y += b.vy
        b.vx *= 0.97
        b.vy *= 0.97
        b.life -= 0.018
        b.alpha = b.life

        if (b.life <= 0) { bursts.splice(i, 1); continue }

        ctx!.save()
        ctx!.globalAlpha = b.alpha
        // Star shape for bursts
        const spikes = 4
        const outerR = b.size * (0.5 + b.life * 0.5)
        const innerR = outerR * 0.4
        ctx!.beginPath()
        for (let j = 0; j < spikes * 2; j++) {
          const r = j % 2 === 0 ? outerR : innerR
          const a = (Math.PI * j) / spikes - Math.PI / 2
          if (j === 0) ctx!.moveTo(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r)
          else ctx!.lineTo(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r)
        }
        ctx!.closePath()
        ctx!.fillStyle = b.color
        ctx!.shadowColor = b.color
        ctx!.shadowBlur = 12
        ctx!.fill()
        ctx!.restore()
      }

      // Draw connecting light bridge when snakes are close or pointer pulls them
      const snakeDist = distToSnake(x1, y1, x2, y2)
      if (snakeDist < Math.min(w, h) * 0.35) {
        const bridgeAlpha = Math.max(0, 1 - snakeDist / (Math.min(w, h) * 0.35)) * 0.3
        const grad = ctx!.createLinearGradient(x1, y1, x2, y2)
        grad.addColorStop(0, `rgba(255, 200, 255, ${bridgeAlpha})`)
        grad.addColorStop(0.5, `rgba(200, 220, 255, ${bridgeAlpha * 1.5})`)
        grad.addColorStop(1, `rgba(100, 200, 255, ${bridgeAlpha})`)
        ctx!.save()
        ctx!.strokeStyle = grad
        ctx!.lineWidth = 2 + bridgeAlpha * 8
        ctx!.shadowColor = 'rgba(200, 200, 255, 0.5)'
        ctx!.shadowBlur = 20
        ctx!.beginPath()
        // Curved bridge
        const mx = (x1 + x2) / 2 + Math.sin(t * 3) * 30
        const my = (y1 + y2) / 2 + Math.cos(t * 2.5) * 30
        ctx!.moveTo(x1, y1)
        ctx!.quadraticCurveTo(mx, my, x2, y2)
        ctx!.stroke()
        ctx!.restore()
      }

      const fontSize = Math.min(w, h) * 0.055

      // Draw snake 1 text
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

      // Draw snake 2 text
      const dx2 = Math.cos(t * 1.4 + Math.PI) * -1.4 + Math.cos(t * 2.1 + 2) * 2.1 * 0.08
      const dy2 = Math.cos(t * 1.4 + Math.PI) * 1.4 - Math.sin(t * 1.5 + 1.5) * 1.5 * 0.06
      const textAngle2 = Math.atan2(dy2, dx2) * 0.15

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
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0f0a19] overflow-hidden touch-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
