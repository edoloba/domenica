import { useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import EditionDetail from './pages/EditionDetail'
// Archive disabled until there's content to show — re-enable the import,
// the route below, and the ARCHIVE link in Footer.jsx once the sister has
// added media to the Archive page/items.
// import Archive from './pages/Archive'
import Footer from './components/Footer'
import WorkOverlay from './components/WorkOverlay'
import Cursor from './components/Cursor'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [workOpen, setWorkOpen] = useState(false)
  const [workClosing, setWorkClosing] = useState(false)
  const [homeHovered, setHomeHovered] = useState(null) // 'domenica' | 'work' | null — shared with Home's own zones
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

  // Bridges the footer "WORK" label and the revealed list (wherever it lives —
  // the overlay on other pages, or Home's own stage) into one hoverable zone:
  // entering either cancels the pending close, leaving either schedules it.
  const handleHomeWorkEnter = () => {
    if (!hasHover) return
    clearTimeout(closeTimer.current)
    setHomeHovered('work')
  }
  const handleHomeWorkLeave = () => {
    if (!hasHover) return
    closeTimer.current = setTimeout(() => {
      setHomeHovered(h => (h === 'work' ? null : h))
    }, 150)
  }

  const handleWorkEnter = () => {
    if (!hasHover) return
    if (isHome) return handleHomeWorkEnter()
    clearTimeout(closeTimer.current)
    clearTimeout(unmountTimer.current)
    setWorkClosing(false)
    setWorkOpen(true)
  }

  const handleWorkLeave = () => {
    if (!hasHover) return
    if (isHome) return handleHomeWorkLeave()
    closeTimer.current = setTimeout(startClose, 150)
  }

  const handleWorkClick = () => {
    if (isHome) {
      setHomeHovered(h => h === 'work' ? null : 'work')
      return
    }
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
      <Cursor />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              hovered={homeHovered}
              setHovered={setHomeHovered}
              onWorkAreaEnter={handleHomeWorkEnter}
              onWorkAreaLeave={handleHomeWorkLeave}
            />
          }
        />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/editions/:slug" element={<EditionDetail />} />
        {/* <Route path="/archive" element={<Archive />} /> */}
      </Routes>
      {workOpen && (
        <WorkOverlay
          closing={workClosing}
          onMouseEnter={handleOverlayEnter}
          onMouseLeave={handleOverlayLeave}
          onSelect={startClose}
        />
      )}
      <Footer
        onWorkEnter={handleWorkEnter}
        onWorkLeave={handleWorkLeave}
        onWorkClick={handleWorkClick}
      />
    </>
  )
}
