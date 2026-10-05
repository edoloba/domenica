export default function VideoEmbed({ url }) {
  let embedUrl = url

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch && !url.includes('player.vimeo.com')) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?background=0`
  }

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  const isEmbed =
    embedUrl.includes('player.vimeo.com') ||
    embedUrl.includes('youtube.com/embed')

  if (isEmbed) {
    return (
      <iframe
        className="video-iframe"
        src={embedUrl}
        allow="autoplay; fullscreen"
        allowFullScreen
        title="Project video"
      />
    )
  }

  return <video className="video-iframe" src={url} controls />
}
