<template>
  <canvas ref="canvas" class="fixed inset-0 w-full h-full pointer-events-none" style="z-index:0;" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let animId = null

onMounted(() => {
  const c = canvas.value
  const ctx = c.getContext('2d')

  function resize() {
    c.width  = window.innerWidth
    c.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Generate stars
  const stars = Array.from({ length: 180 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() < 0.85 ? 0.6 : (Math.random() < 0.7 ? 1.1 : 1.8),
    a: 0.2 + Math.random() * 0.8,
    speed: 0.0002 + Math.random() * 0.0006,
    phase: Math.random() * Math.PI * 2,
  }))

  // Nebula blobs
  const blobs = [
    { x: 0.15, y: 0.25, r: 0.35, c: 'rgba(10,40,100,0.25)' },
    { x: 0.8,  y: 0.6,  r: 0.3,  c: 'rgba(20,10,60,0.2)'  },
    { x: 0.5,  y: 0.85, r: 0.4,  c: 'rgba(0,30,80,0.18)'  },
  ]

  let t = 0
  function draw() {
    t += 0.016
    const W = c.width, H = c.height

    ctx.clearRect(0, 0, W, H)

    // Background
    const bg = ctx.createRadialGradient(W*0.5, H*0.3, 0, W*0.5, H*0.5, H)
    bg.addColorStop(0, '#0a1e3a')
    bg.addColorStop(0.5, '#060f1e')
    bg.addColorStop(1, '#020810')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Nebula blobs
    blobs.forEach(b => {
      const g = ctx.createRadialGradient(W*b.x, H*b.y, 0, W*b.x, H*b.y, W*b.r)
      g.addColorStop(0, b.c)
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    })

    // Horizon planet glow (bottom)
    const pg = ctx.createRadialGradient(W*0.5, H*1.05, 0, W*0.5, H*1.05, W*0.7)
    pg.addColorStop(0, 'rgba(20,100,200,0.18)')
    pg.addColorStop(0.4, 'rgba(10,50,120,0.08)')
    pg.addColorStop(1, 'transparent')
    ctx.fillStyle = pg
    ctx.fillRect(0, 0, W, H)

    // Stars
    stars.forEach(s => {
      const flicker = Math.sin(t * s.speed * 60 + s.phase) * 0.3 + 0.7
      ctx.beginPath()
      ctx.arc(W * s.x, H * s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(180,210,255,${s.a * flicker})`
      ctx.fill()

      // Bright star cross-flare
      if (s.r > 1.5) {
        ctx.strokeStyle = `rgba(200,230,255,${s.a * flicker * 0.5})`
        ctx.lineWidth = 0.5
        const len = s.r * 4
        ctx.beginPath()
        ctx.moveTo(W*s.x - len, H*s.y)
        ctx.lineTo(W*s.x + len, H*s.y)
        ctx.moveTo(W*s.x, H*s.y - len)
        ctx.lineTo(W*s.x, H*s.y + len)
        ctx.stroke()
      }
    })

    animId = requestAnimationFrame(draw)
  }
  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
})
</script>
