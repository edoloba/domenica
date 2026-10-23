import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import WorkList from '../components/WorkList'
import { GET_HOME_MEDIA } from '../graphql/queries'
import '../App.css'

export default function Home({ hovered, onWorkAreaEnter, onWorkAreaLeave }) {
  // DOMENICA itself is rendered globally (see App.jsx's <DomenicaPanel/>) so
  // it's in the exact same spot on every page — domActive here is only used
  // to dim the hero video while that panel is open.
  const domActive = hovered === 'domenica'
  const workActive = hovered === 'work'
  const videoRef = useRef(null)

  // Same breakpoint used throughout App.css for the mobile layout.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)')
    const handleChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  // Hero media comes from WordPress (single File field, same pattern as
  // Archive Item) so it isn't hardcoded — mimeType tells us whether to
  // render it as a video or a plain image. A separate "mediamobile" field
  // lets a mobile-specific cut replace the desktop one; falls back to the
  // desktop media until a mobile file is uploaded.
  const { data } = useQuery(GET_HOME_MEDIA)
  const desktopMedia = data?.page?.homeFields?.media?.node
  const mobileMedia = data?.page?.homeFields?.mediamobile?.node
  const media = (isMobile && mobileMedia) ? mobileMedia : desktopMedia
  const isVideo = (media?.mimeType || '').startsWith('video/')
  const isGif = media?.mimeType === 'image/gif'
  const imageSrc = media && isGif ? media.sourceUrl.replace(/-scaled(\.[^.]+)$/, '$1') : media?.sourceUrl

  // Touch devices can fire a "ghost" mouseenter on tap (to support :hover CSS),
  // which would open a zone right before the click handler's toggle closes it again.
  // Hover-driven open/close is desktop-only; tap always goes through onClick.
  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

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
          home-stage centers below it exactly as before — DOMENICA itself is
          rendered globally by App.jsx (position:fixed), not here. */}
      <div className="top-bar-spacer" />

      {/* Centered hero video + WORK list, stacked in the same area.
          The WORK trigger itself lives in the footer (shared state via props). */}
      <div className="home-stage">
        {media && (isVideo ? (
          <video
            key={media.mediaItemUrl}
            ref={videoRef}
            className={`home-media${(workActive || domActive) ? ' is-dimmed' : ''}`}
            src={media.mediaItemUrl}
            muted
            loop
            playsInline
            autoPlay={!hasHover}
            onMouseEnter={handleVideoEnter}
            onMouseLeave={handleVideoLeave}
            onClick={handleVideoClick}
          />
        ) : (
          <img
            key={media.mediaItemUrl}
            className={`home-media${(workActive || domActive) ? ' is-dimmed' : ''}`}
            src={imageSrc}
            alt={media.altText || ''}
          />
        ))}
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
