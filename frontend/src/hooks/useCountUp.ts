import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 450) {
  const [display, setDisplay] = useState(target)
  const frameRef = useRef(0)
  const startRef = useRef(target)
  const startTimeRef = useRef(0)

  useEffect(() => {
    const start = startRef.current, diff = target - start
    if (Math.abs(diff) < 1) { setDisplay(target); startRef.current = target; return }
    startTimeRef.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * ease)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
      else startRef.current = target
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return display
}
