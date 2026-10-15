import { useRef } from 'react'
import WorkList from '../components/WorkList'
import '../App.css'

export default function Home({ hovered, setHovered, onWorkAreaEnter, onWorkAreaLeave }) {
  const domActive = hovered === 'domenica'
  const workActive = hovered === 'work'
  const videoRef = useRef(null)
  const domCloseTimer = useRef(null)

  // Touch devices can fire a "ghost" mouseenter on tap (to support :hover CSS),
  // which would open a zone right before the click handler's toggle closes it again.
  // Hover-driven open/close is desktop-only; tap always goes through onClick.
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  // DOMENICA label, bio-text, and social-nav are three separate elements
  // (bio-text/social-nav are absolutely positioned so they don't push layout —
  // see App.css). Bridge them into one hoverable zone with a short grace delay,
  // same pattern as the WORK list: entering any of them cancels the pending close.
  const handleDomEnter = () => {
    if (!hasHover) return
    clearTimeout(domCloseTimer.current)
    setHovered('domenica')
  }
  const handleDomLeave = () => {
    if (!hasHover) return
    domCloseTimer.current = setTimeout(() => {
      setHovered(h => (h === 'domenica' ? null : h))
    }, 150)
  }

  const handleVideoEnter = () => {
    if (hasHover) videoRef.current?.play()
  }
  const handleVideoLeave = () => {
    if (hasHover) videoRef.current?.pause()
  }
  const handleVideoClick = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  return (
    <div className="page">

      {/* Reserves the DOMENICA label's own line-height in normal flow, so
          home-stage centers below it exactly as before (the zone below is
          absolutely positioned and doesn't affect layout). */}
      <div className="top-bar-spacer" />

      {/* DOMENICA hover/tap zone. One wrapping element with pointer-events:none —
          mouseenter/leave are tracked on it (entering/leaving its auto-enabled
          descendants doesn't count as leaving, so moving between the label, the
          bio paragraph, and the CV/INSTA/MAIL links never gaps), while empty space
          within its box still passes clicks/hover through to the video beneath. */}
      <div
        className={`dom-hover-zone${domActive ? ' is-active' : ''}`}
        onMouseEnter={handleDomEnter}
        onMouseLeave={handleDomLeave}
      >
        <div className="domenica-wrap">
          <span
            className="nav-label"
            onClick={() => setHovered(h => h === 'domenica' ? null : 'domenica')}
          >
            DOMENICA
          </span>
          <span className={`nav-label bio-text ${domActive ? 'is-visible' : ''}`}>
            {' '}
            <br />
            <br />
            I’m a multidisciplinary visual artist & art director based in Porto. My work lives at the intersection of cultural research, narrative, and graphic experimentation. I don't approach design as a simple exercise in problem-solving, but as an ongoing intellectual inquiry.
            <br />
            <br />
            Every project begins with a spark of curiosity: a subject to study, a book to unravel or an idea that demands context. Through reading, theory, and analysis, I build the conceptual foundation before giving it a visual shape. From there, I move fluidly across mediums, translating research into editorial objects, motion graphics, poster design, and identity systems.
            <br />
            <br />
            I view visual practice as a hybrid space where culture, typography, and experimentation meet. The goal is never just to construct an image, but to craft distinct visual languages: layered, intentional, and deeply rooted in story.
          </span>
        </div>

        <nav className={`social-nav ${domActive ? 'is-visible' : ''}`}>
          <a href="/Vittoria-Lovino-CV.pdf" download>CV</a>
          <a href="https://www.instagram.com/__svtl/" target="_blank">INSTA</a>
          <a href="mailto:domenicaarts@gmail.com" target="_blank">MAIL</a>
        </nav>
      </div>

      {/* Centered hero video + WORK list, stacked in the same area.
          The WORK trigger itself lives in the footer (shared state via props). */}
      <div className="home-stage">
        <video
          ref={videoRef}
          className={`home-video${(workActive || domActive) ? ' is-dimmed' : ''}`}
          src="/home-video.mp4"
          muted
          loop
          playsInline
          onMouseEnter={handleVideoEnter}
          onMouseLeave={handleVideoLeave}
          onClick={handleVideoClick}
        />
        <main
          className={`main-area ${workActive ? 'is-visible' : ''}`}
          onMouseEnter={onWorkAreaEnter}
          onMouseLeave={onWorkAreaLeave}
        >
          <WorkList />
        </main>
      </div>

    </div>
  )
}
