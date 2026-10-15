import { useEffect, useRef } from 'react'
import './Cursor.css'

const LERP = 0.2
const GROW_CURSORS = new Set(['pointer', 'zoom-in', 'zoom-out'])

export default function Cursor() {
  const dotRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const hasHover = window.matchMedia('(hover: hover)').matches
    if (!hasHover) return

    document.body.classList.add('custom-cursor-active')

    const dot = dotRef.current
    let rafId
    let hovering = false
    let visible = false

    function onMouseMove(e) {
      target.current.x = e.clientX
      target.current.y = e.clientY

      if (!visible) {
        visible = true
        pos.current.x = e.clientX
        pos.current.y = e.clientY
        dot.classList.add('is-visible')
      }

      const el = document.elementFromPoint(e.clientX, e.clientY)
      const cursorStyle = el ? getComputedStyle(el).cursor : 'default'
      const shouldGrow = GROW_CURSORS.has(cursorStyle)
      if (shouldGrow !== hovering) {
        hovering = shouldGrow
        dot.classList.toggle('is-hovering', hovering)
      }
    }

    function onMouseLeave() {
      visible = false
      dot.classList.remove('is-visible')
    }

    function tick() {
      pos.current.x += (target.current.x - pos.current.x) * LERP
      pos.current.y += (target.current.y - pos.current.y) * LERP
      dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return <div ref={dotRef} className="custom-cursor" />
}
