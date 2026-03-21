import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

export default function NetworkBackground() {
  const canvasRef = useRef(null)
  const location = useLocation()
  const isInteractive = useRef(location.pathname === "/")

  useEffect(() => {
    isInteractive.current = location.pathname === "/"
  }, [location.pathname])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    const nodes = []
    const NODE_COUNT = 60

    const mouse = {
      x: null,
      y: null,
      radius: 120,
    }

    // Track mouse
    window.addEventListener("mousemove", (e) => {
      if (isInteractive.current) {
        mouse.x = e.clientX
        mouse.y = e.clientY
      } else {
        mouse.x = null
        mouse.y = null
      }
    })

    window.addEventListener("mouseleave", () => {
      mouse.x = null
      mouse.y = null
    })

    // Create nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            let opacity = 1 - dist / 120

            // Boost opacity near cursor
            if (mouse.x && mouse.y) {
              const mx = nodes[i].x - mouse.x
              const my = nodes[i].y - mouse.y
              const mDist = Math.sqrt(mx * mx + my * my)

              if (mDist < mouse.radius) {
                opacity += 0.5
              }
            }

            ctx.strokeStyle = `rgba(6, 214, 160, ${opacity})`;
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        // Cursor interaction (repel or attract)
        if (mouse.x && mouse.y) {
          const dx = node.x - mouse.x
          const dy = node.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            node.x += dx * force * 0.02
            node.y += dy * force * 0.02
          }
        }

        // Move
        node.x += node.vx
        node.y += node.vy

        // Bounce
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255,255,255,0.8)"
        ctx.fill()
      })

      // Cursor glow
      if (mouse.x && mouse.y) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, mouse.radius
        )
        gradient.addColorStop(0, "rgba(16,185,129,0.15)")
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      }

      requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -2,
        pointerEvents: "none",
      }}
    />
  )
}