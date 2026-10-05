import { useState, useEffect, useCallback } from 'react'
import './Gallery.css'

export default function Gallery({ images, layout }) {
  const [openIndex, setOpenIndex] = useState(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const showPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])
  const showNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (openIndex === null) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openIndex, close, showPrev, showNext])

  if (!images.length) return null

  const raw = Array.isArray(layout) ? layout[0] : layout
  const normalized = (raw ?? '').toLowerCase().trim()
  const isMagazine = normalized === 'magazine'
  const isBook = normalized === 'book'

  const lightbox = openIndex !== null && (
    <div className="lightbox-overlay" onClick={close}>
      <button className="lightbox-close" onClick={close} aria-label="Chiudi">×</button>
      <span className="lightbox-counter">{openIndex + 1} / {images.length}</span>
      {images.length > 1 && (
        <button
          className="lightbox-arrow lightbox-arrow-prev"
          onClick={(e) => { e.stopPropagation(); showPrev() }}
          aria-label="Immagine precedente"
        >
          ←
        </button>
      )}
      <img
        className="lightbox-img"
        src={images[openIndex].sourceUrl}
        alt={images[openIndex].altText || ''}
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <button
          className="lightbox-arrow lightbox-arrow-next"
          onClick={(e) => { e.stopPropagation(); showNext() }}
          aria-label="Immagine successiva"
        >
          →
        </button>
      )}
    </div>
  )

  if (isMagazine) {
    return (
      <>
        <div className="gallery-magazine">
          {images.map((img, i) => (
            <div key={i} className="gallery-slide">
              <img
                className="gallery-img-magazine"
                src={img.sourceUrl}
                alt={img.altText || ''}
                onClick={() => setOpenIndex(i)}
              />
            </div>
          ))}
        </div>
        {lightbox}
      </>
    )
  }

  if (isBook) {
    const [first, second, ...rest] = images
    return (
      <>
        <div className="gallery-book">
          {/* First two side by side */}
          <div className="gallery-book-spread">
            {first && (
              <img
                className="gallery-img-cover"
                src={first.sourceUrl}
                alt={first.altText || ''}
                onClick={() => setOpenIndex(0)}
              />
            )}
            {second && (
              <img
                className="gallery-img-cover"
                src={second.sourceUrl}
                alt={second.altText || ''}
                onClick={() => setOpenIndex(1)}
              />
            )}
          </div>
          {/* Rest stacked full width */}
          {rest.map((img, i) => (
            <img
              key={i}
              className="gallery-book-full"
              src={img.sourceUrl}
              alt={img.altText || ''}
              onClick={() => setOpenIndex(i + 2)}
            />
          ))}
        </div>
        {lightbox}
      </>
    )
  }

  // default: ogni immagine centrata a grandezza naturale nel suo viewport
  return (
    <>
      <div className="gallery-default">
        {images.map((img, i) => (
          <div key={i} className="gallery-slide">
            <img
              className="gallery-img-natural"
              src={img.sourceUrl}
              alt={img.altText || ''}
              onClick={() => setOpenIndex(i)}
            />
          </div>
        ))}
      </div>
      {lightbox}
    </>
  )
}
