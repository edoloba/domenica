import WorkList from './WorkList'
import './WorkOverlay.css'

export default function WorkOverlay({ closing, onMouseEnter, onMouseLeave, onSelect }) {
  return (
    <div className={`work-overlay${closing ? ' is-closing' : ''}`}>
      <div
        className="work-overlay-list"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <WorkList onSelect={onSelect} />
      </div>
    </div>
  )
}
