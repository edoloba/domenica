import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DomenicaOverlay from './DomenicaOverlay'

const DURATION = 300 // ms — must match CSS animation

export default function DomenicaLink({ className }) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef(null)
  const unmountTimer = useRef(null)
  const navigate = useNavigate()

  const handleEnter = () => {
    clearTimeout(closeTimer.current)
    clearTimeout(unmountTimer.current)
    setClosing(false)
    setOpen(true)
  }

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => {
      setClosing(true)
      unmountTimer.current = setTimeout(() => {
        setOpen(false)
        setClosing(false)
      }, DURATION)
    }, 150)
  }

  return (
    <>
      <span
        className={className}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        DOMENICA
      </span>
      {open && (
        <DomenicaOverlay
          closing={closing}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        />
      )}
    </>
  )
}
