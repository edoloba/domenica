import { useParams, Link } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { GET_EDITIONS } from '../graphql/queries'
import VideoEmbed from '../components/VideoEmbed'
import Gallery from '../components/Gallery'
import DomenicaLink from '../components/DomenicaLink'
import './ProjectDetail.css'

function extractGalleryOrder(content) {
  if (!content) return []
  const ids = []
  const re = /class="[^"]*wp-image-(\d+)[^"]*"/g
  let m
  while ((m = re.exec(content)) !== null) {
    ids.push(Number(m[1]))
  }
  return ids
}

const GET_EDITION = gql`
  query GetEdition($slug: ID!) {
    edition(id: $slug, idType: SLUG) {
      title
      slug
      databaseId
      content
      editionFields {
        editionNumber
        parentProject {
          nodes {
            ... on Project {
              title
              slug
              projectFields {
                year
                description
                hasEdition
                video {
                  node {
                    sourceUrl
                    mimeType
                  }
                }
                layout
                logo { node { sourceUrl } }
              }
              projectTags {
                nodes { name }
              }
            }
          }
        }
      }
    }
  }
`

const GET_EDITION_IMAGES = gql`
  query GetEditionImages($parentId: ID!) {
    mediaItems(where: { parentIn: [$parentId] }) {
      nodes {
        databaseId
        sourceUrl
        altText
      }
    }
  }
`

export default function EditionDetail() {
  const { slug } = useParams()

  const { data, loading, error } = useQuery(GET_EDITION, {
    variables: { slug },
  })

  if (error) console.error('EditionDetail query error:', error)

  const databaseId = data?.edition?.databaseId

  // Second query: media items attached to this edition post, runs after databaseId is known
  const { data: imagesData } = useQuery(GET_EDITION_IMAGES, {
    variables: { parentId: String(databaseId) },
    skip: !databaseId,
  })

  const { data: allEditionsData } = useQuery(GET_EDITIONS)
  

  if (loading) return null
  if (!data?.edition) return null

  const edition = data.edition
  const rawImages = imagesData?.mediaItems?.nodes ?? []
  const galleryOrder = extractGalleryOrder(edition.content)
  const images = galleryOrder.length
    ? [...rawImages].sort((a, b) => galleryOrder.indexOf(a.databaseId) - galleryOrder.indexOf(b.databaseId))
    : rawImages
  const editionNumber = edition.editionFields?.editionNumber
  const parentProject = edition.editionFields?.parentProject?.nodes?.[0]

  if (!parentProject) return null

  const { projectFields, projectTags } = parentProject
  const layout = projectFields?.layout || 'Default'
  const tags = projectTags?.nodes ?? []
  const hasVideo = Boolean(projectFields?.video?.node?.sourceUrl)

  // All editions for this parent project, sorted by editionNumber
  const siblingEditions = (allEditionsData?.editions?.nodes ?? [])
    .filter((e) =>
      e.editionFields?.parentProject?.nodes?.some(
        (p) => p.slug === parentProject.slug
      )
    )
    .sort(
      (a, b) =>
        (a.editionFields?.editionNumber ?? 0) -
        (b.editionFields?.editionNumber ?? 0)
    )

  const currentIdx = siblingEditions.findIndex((e) => e.slug === slug)
  const nextEdition =
    currentIdx >= 0 && currentIdx < siblingEditions.length - 1
      ? siblingEditions[currentIdx + 1]
      : null

  return (
    <div className="detail-page">

      {/* ── LEFT COLUMN ── */}
      <aside className="detail-left">

        <DomenicaLink className="detail-nav-label" />

        {projectFields?.description && (
          <p className="detail-description">{projectFields.description}</p>
        )}

        <div className={hasVideo ? 'detail-spacer-sm' : 'detail-spacer'} />

        {/* Meta: year + services + edition number */}
        <div className="detail-meta">
          {projectFields?.year && <span>{projectFields.year}</span>}
          {tags.map((t) => <span key={t.name}>{t.name}</span>)}
          {editionNumber && (
            <span className="detail-meta-edition">EDITION NR.{editionNumber}</span>
          )}
        </div>

        <hr className="detail-separator" />

        {/* Next edition or back to project */}
        {nextEdition ? (
          <Link to={`/editions/${nextEdition.slug}`} className="detail-next">
            NEXT EDITION : {nextEdition.title}
          </Link>
        ) : (
          <Link to={`/projects/${parentProject.slug}`} className="detail-next">
            BACK TO : {parentProject.title}
          </Link>
        )}

        {hasVideo && (
          <div className="detail-video">
            <video
              src={projectFields.video.node.sourceUrl}
              controls
              style={{ width: '100%' }}
            />
          </div>
        )}

      </aside>

      {/* ── RIGHT COLUMN ── */}
      <div className="detail-right">
        <Gallery images={images} layout={layout} />
      </div>

    </div>
  )
}
