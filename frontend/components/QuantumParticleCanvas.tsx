'use client'

import { useEffect, useRef } from 'react'

export default function QuantumParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Interactive mouse coordinates
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, radius: 200 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Vibrant Modern Light Colors
    const colors = ['#4f46e5', '#2563eb', '#7c3aed', '#db2777', '#d97706', '#059669', '#0284c7']

    // Interactive Click Burst Particles
    interface BurstParticle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      alpha: number
    }
    const burstParticles: BurstParticle[] = []

    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        burstParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
        })
      }
    }
    window.addEventListener('click', handleClick)

    // Constellation Nodes
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      alpha: number
    }

    const particles: Particle[] = []
    const particleCount = Math.min(90, Math.floor(width / 18))

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.5) * 1.1,
        radius: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
      })
    }

    // Floating Quantum Math & Simulation Symbols
    interface FloatingSymbol {
      x: number
      y: number
      vy: number
      symbol: string
      color: string
      size: number
      alpha: number
    }

    const mathSymbols = ['σ', '∑', 'Δ', 'P90', 'ABM', 'VaR', '∫', 'λ', 'μ', '10K', '⚡', '✦', '⚛']
    const symbols: FloatingSymbol[] = []
    for (let i = 0; i < 25; i++) {
      symbols.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -(Math.random() * 0.5 + 0.3),
        symbol: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.floor(Math.random() * 14 + 10),
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    // Shooting Lasers
    interface LaserPacket {
      x: number
      y: number
      length: number
      speed: number
      color: string
    }

    const lasers: LaserPacket[] = []
    const createLaser = () => {
      lasers.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.6),
        length: Math.random() * 140 + 90,
        speed: Math.random() * 14 + 9,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    let frameCount = 0
    let waveOffset = 0

    // Main Render Loop
    const render = () => {
      frameCount++
      waveOffset += 0.025

      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08

      ctx.clearRect(0, 0, width, height)

      // ── A. Multi-Color Aurora Spotlight Gradient ──
      const spotlight = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 400)
      spotlight.addColorStop(0, 'rgba(99, 102, 241, 0.08)')
      spotlight.addColorStop(0.3, 'rgba(168, 85, 247, 0.05)')
      spotlight.addColorStop(0.6, 'rgba(236, 72, 153, 0.03)')
      spotlight.addColorStop(1, 'rgba(248, 250, 252, 0)')
      ctx.fillStyle = spotlight
      ctx.fillRect(0, 0, width, height)

      // ── B. 3D Perspective Wave Grid Floor ──
      const horizonY = height * 0.62
      const lineCount = 34
      const centerX = width / 2

      for (let i = -lineCount; i <= lineCount; i++) {
        const startX = centerX + i * 22
        const endX = centerX + i * 95
        ctx.strokeStyle = `rgba(79, 70, 229, ${0.07 - Math.abs(i) * 0.002})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(startX, horizonY)
        ctx.lineTo(endX, height)
        ctx.stroke()
      }

      for (let y = horizonY; y < height; y += 20) {
        const progress = (y - horizonY) / (height - horizonY)
        const waveY = y + Math.sin(progress * 10 + waveOffset) * 5
        ctx.strokeStyle = `rgba(124, 58, 237, ${progress * 0.12})`
        ctx.beginPath()
        ctx.moveTo(0, waveY)
        ctx.lineTo(width, waveY)
        ctx.stroke()
      }

      // ── C. Render Floating Symbols ──
      ctx.font = 'bold 13px monospace'
      symbols.forEach((s) => {
        s.y += s.vy
        if (s.y < -20) s.y = height + 20
        ctx.fillStyle = s.color
        ctx.globalAlpha = s.alpha
        ctx.fillText(s.symbol, s.x, s.y)
        ctx.globalAlpha = 1
      })

      // ── D. Render Shooting Lasers ──
      if (frameCount % 35 === 0) createLaser()
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i]
        l.x += l.speed
        l.y += l.speed * 0.45

        ctx.beginPath()
        ctx.moveTo(l.x, l.y)
        ctx.lineTo(l.x - l.length, l.y - l.length * 0.45)
        ctx.strokeStyle = l.color
        ctx.lineWidth = 2
        ctx.shadowBlur = 10
        ctx.shadowColor = l.color
        ctx.stroke()
        ctx.shadowBlur = 0

        if (l.x > width + 200 || l.y > height + 200) {
          lasers.splice(i, 1)
        }
      }

      // ── E. Render Click Burst Particles ──
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i]
        bp.x += bp.vx
        bp.y += bp.vy
        bp.alpha -= 0.02
        bp.radius *= 0.96

        if (bp.alpha <= 0) {
          burstParticles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2)
        ctx.fillStyle = bp.color
        ctx.globalAlpha = bp.alpha
        ctx.shadowBlur = 10
        ctx.shadowColor = bp.color
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      // ── F. Render Constellation Particle Nodes ──
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]

        p1.x += p1.vx
        p1.y += p1.vy

        if (p1.x < 0 || p1.x > width) p1.vx *= -1
        if (p1.y < 0 || p1.y > height) p1.vy *= -1

        const dxMouse = mouse.x - p1.x
        const dyMouse = mouse.y - p1.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)
        if (distMouse < mouse.radius) {
          const force = (mouse.radius - distMouse) / mouse.radius
          p1.x -= (dxMouse / distMouse) * force * 4
          p1.y -= (dyMouse / distMouse) * force * 4
        }

        ctx.beginPath()
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2)
        ctx.fillStyle = p1.color
        ctx.shadowBlur = 8
        ctx.shadowColor = p1.color
        ctx.fill()
        ctx.shadowBlur = 0

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const alpha = (1 - dist / 150) * 0.25
            ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`
            ctx.lineWidth = 0.9
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90"
    />
  )
}
