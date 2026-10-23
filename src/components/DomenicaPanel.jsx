// Rendered once at the App root (position:fixed in CSS) so DOMENICA sits in
// the exact same spot with the exact same bio/social-nav layout on every
// page — Home, ProjectDetail, EditionDetail — instead of each page having
// its own positioning or its own overlay style.
export default function DomenicaPanel({ active, onEnter, onLeave, onLabelClick }) {
  return (
    <>
      {/* Full-screen blur, independent of the hover-zone's own padded box —
          on Home the video dims itself (is-dimmed) when this is open, but
          ProjectDetail/EditionDetail have no single element to dim, so this
          blurred backdrop is what gives the panel contrast there (and layers
          fine on top of the dimmed video on Home too). pointer-events:none
          throughout — it's purely visual, dom-hover-zone handles hit-testing. */}
      <div className={`dom-backdrop${active ? ' is-active' : ''}`} />
      <div
        className={`dom-hover-zone${active ? ' is-active' : ''}`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="domenica-wrap">
          <span
            className="nav-label dom-label"
            onClick={onLabelClick}
            style={{ cursor: 'pointer' }}
          >
            DOMENICA
          </span>
          <div className="flex">
            <span className={`nav-label bio-text ${active ? 'is-visible' : ''}`}>
              I’m a multidisciplinary visual artist & art director based in Porto. My work lives at the intersection of cultural research, narrative, and graphic experimentation. I don't approach design as a simple exercise in problem-solving, but as an ongoing intellectual inquiry.
              <br />
              <br />
              Every project begins with a spark of curiosity: a subject to study, a book to unravel or an idea that demands context. Through reading, theory, and analysis, I build the conceptual foundation before giving it a visual shape. From there, I move fluidly across mediums, translating research into editorial objects, motion graphics, poster design, and identity systems.
              <br />
              <br />
              I view visual practice as a hybrid space where culture, typography, and experimentation meet. The goal is never just to construct an image, but to craft distinct visual languages: layered, intentional, and deeply rooted in story.
            </span>
            <nav className={`social-nav ${active ? 'is-visible' : ''}`}>
              <a href="/Domenica_CV.pdf" download>CV</a>
              <a href="https://www.instagram.com/__svtl/" target="_blank">INSTA</a>
              <a href="mailto:domenicaarts@gmail.com" target="_blank">MAIL</a>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
