// import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer({ onWorkEnter, onWorkLeave, onWorkClick }) {
  return (
    <div className="site-footer">
      <div className="footer-left">
        <span
          className="footer-label footer-work"
          onMouseEnter={onWorkEnter}
          onMouseLeave={onWorkLeave}
          onClick={onWorkClick}
        >
          WORK
        </span>
        {/* <span className="footer-sep">|</span> */}
        {/* <span className="footer-label">ARCHIVE</span> */}
      </div>
      {/* Archive disabled until there's content to show — re-enable once
          the sister has added media to the Archive page/items.
      <div>
        <Link to="/archive" className="footer-label">ARCHIVE</Link>
      </div>
      */}
      {/* <a
        href="https://www.linkedin.com/in/edoardo-lovino/"
        target="_blank"
        rel="noreferrer"
        className="footer-label footer-credit"
      >
        DEVELOPED BY EDOARDO LOVINO
      </a> */}
    </div>
  )
}
