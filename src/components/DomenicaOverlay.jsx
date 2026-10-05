import './DomenicaOverlay.css'

export default function DomenicaOverlay({ closing, onMouseEnter, onMouseLeave }) {
  return (
    <div className={`domenica-overlay${closing ? ' is-closing' : ''}`}>
      <div
        className="domenica-overlay-content"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="domenica-overlay-bio">
          <span>
            {/* DOMENICA  */}
            <br />
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
        <nav className="domenica-overlay-nav">
          <a href="#">CV</a>
          <a href="https://www.instagram.com/__svtl/" target="_blank" rel="noreferrer">INSTA</a>
          <a href="mailto:domenicaarts@gmail.com">MAIL</a>
        </nav>
      </div>
    </div>
  )
}
