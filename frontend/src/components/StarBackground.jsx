import { useEffect, useRef } from "react"
import "./stars.css"

export default function StarBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current

    const createStars = (count, className) => {
      for (let i = 0; i < count; i++) {
        const star = document.createElement("div")
        star.className = `star ${className}`

        const size = Math.random() * 2 + 1
        star.style.width = `${size}px`
        star.style.height = `${size}px`

        star.style.left = `${Math.random() * 100}%`
        star.style.top = `${Math.random() * 200}%`
        star.style.opacity = Math.random()

        container.appendChild(star)
      }
    };

    createStars(120, "layer-1")
    createStars(80, "layer-2")
    createStars(40, "layer-3")

  }, [])

  return <div ref={containerRef} className="stars-container"></div>
}
