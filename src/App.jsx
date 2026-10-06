import { useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import EditionDetail from './pages/EditionDetail'
import Archive from './pages/Archive'
import Footer from './components/Footer'
import WorkOverlay from './components/WorkOverlay'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isArchive = location.pathname === '/archive'
  const [workOpen, setWorkOpen] = useState(false)
  const [workClosing, setWorkClosing] = useState(false)
  const closeTimer = useRef(null)
  const unmountTimer = useRef(null)
  const DURATION = 300

  const startClose = () => {
    setWorkClosing(true)
    unmountTimer.current = setTimeout(() => {
      setWorkOpen(false)
      setWorkClosing(false)
    }, DURATION)
  }

  // Touch devices can fire a "ghost" mouseenter on tap (to support :hover CSS),
  // which would open the overlay right before the click handler closes it again.
  // Hover-driven open/close is desktop-only; tap always goes through handleWorkClick.
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  const handleWorkEnter = () => {
    if (isHome || !hasHover) return
    clearTimeout(closeTimer.current)
    clearTimeout(unmountTimer.current)
    setWorkClosing(false)
    setWorkOpen(true)
  }

  const handleWorkLeave = () => {
    if (isHome || !hasHover) return
    closeTimer.current = setTimeout(startClose, 150)
  }

  const handleWorkClick = () => {
    if (isHome) return
    if (workOpen) startClose()
    else setWorkOpen(true)
  }

  const handleOverlayEnter = () => {
    clearTimeout(closeTimer.current)
    clearTimeout(unmountTimer.current)
    setWorkClosing(false)
  }
  const handleOverlayLeave = () => {
    closeTimer.current = setTimeout(startClose, 150)
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/editions/:slug" element={<EditionDetail />} />
        <Route path="/archive" element={<Archive />} />
      </Routes>
      {workOpen && (
        <WorkOverlay
          closing={workClosing}
          onMouseEnter={handleOverlayEnter}
          onMouseLeave={handleOverlayLeave}
          onSelect={startClose}
        />
      )}
      {!isArchive && (
        <Footer
          onWorkEnter={handleWorkEnter}
          onWorkLeave={handleWorkLeave}
          onWorkClick={handleWorkClick}
        />
      )}
    </>
  )
}
