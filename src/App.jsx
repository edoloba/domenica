import { useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import EditionDetail from './pages/EditionDetail'
import Footer from './components/Footer'
import WorkOverlay from './components/WorkOverlay'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
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

  const handleWorkEnter = () => {
    if (isHome) return
    clearTimeout(closeTimer.current)
    clearTimeout(unmountTimer.current)
    setWorkClosing(false)
    setWorkOpen(true)
  }

  const handleWorkLeave = () => {
    if (isHome) return
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
