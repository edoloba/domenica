import { useState } from 'react'
import WorkList from '../components/WorkList'
import '../App.css'

export default function Home() {
  const [hovered, setHovered] = useState(null)

  const domActive = hovered === 'domenica'
  const workActive = hovered === 'work'

  // Touch devices can fire a "ghost" mouseenter on tap (to support :hover CSS),
  // which would open a zone right before the click handler's toggle closes it again.
  // Hover-driven open/close is desktop-only; tap always goes through onClick.
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  return (
    <div className="page">

      {/* DOMENICA hover/tap zone */}
      <header
        className="top-bar"
        onMouseEnter={() => hasHover && setHovered('domenica')}
        onMouseLeave={() => hasHover && setHovered(null)}
        onClick={() => setHovered(h => h === 'domenica' ? null : 'domenica')}
      >
        <div className="domenica-wrap">
          <span className="nav-label">DOMENICA</span>
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
          <a href="#">CV</a>
          <a href="https://www.instagram.com/__svtl/" target="_blank">INSTA</a>
          <a href="mailto:domenicaarts@gmail.com" target="_blank">MAIL</a>
        </nav>
      </header>

      {/* WORK hover/tap zone */}
      <div
        className="work-zone"
        onMouseEnter={() => hasHover && setHovered('work')}
        onMouseLeave={() => hasHover && setHovered(null)}
        onClick={() => setHovered(h => h === 'work' ? null : 'work')}
      >
        <main className={`main-area ${workActive ? 'is-visible' : ''}`}>
          <WorkList />
        </main>
      </div>


    </div>
  )
}
