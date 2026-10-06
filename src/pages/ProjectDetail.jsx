import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { GET_PROJECTS, GET_EDITIONS } from "../graphql/queries";
import VideoEmbed from "../components/VideoEmbed";
import Gallery from "../components/Gallery";
import DomenicaLink from "../components/DomenicaLink";
import "./ProjectDetail.css";

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_PROJECT = gql`
  query GetProject($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      title
      slug
      databaseId
      projectFields {
        year
        description
        hasEdition
        externalLink
        layout
        logo {
          node {
            sourceUrl
            altText
            mimeType
            mediaDetails { file }
          }
        }
        coverMediaType
        coverImage {
          node {
            sourceUrl
            altText
          }
        }
        coverVideo
      }
      content
      projectTags {
        nodes {
          name
        }
      }
    }
  }
`;

const GET_PROJECT_IMAGES = gql`
  query GetProjectImages($parentId: ID!) {
    mediaItems(first: 100, where: { parentIn: [$parentId] }) {
      nodes {
        databaseId
        sourceUrl
        altText
      }
    }
  }
`;

const GET_EDITION_CONTENT = gql`
  query GetEditionContent($slug: ID!) {
    edition(id: $slug, idType: SLUG) {
      content
    }
  }
`;

// Extracts ordered image IDs from Gutenberg rendered HTML
// Gutenberg adds class="wp-image-{id}" to every gallery image
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { slug } = useParams();
  const [selectedEditionSlug, setSelectedEditionSlug] = useState(null);
  const [selectedEditionDbId, setSelectedEditionDbId] = useState(null);

  const {
    data: projectData,
    loading,
    error,
  } = useQuery(GET_PROJECT, {
    variables: { slug },
  });

  if (error) console.error("ProjectDetail query error:", error);

  const databaseId = projectData?.project?.databaseId;

  const { data: imagesData } = useQuery(GET_PROJECT_IMAGES, {
    variables: { parentId: String(databaseId) },
    skip: !databaseId,
  });

  // All projects — from Apollo cache after WorkList has loaded, otherwise refetch.
  // Used only for "next project" navigation.
  const { data: allData } = useQuery(GET_PROJECTS);

  const project = projectData?.project;
  console.log(project)
  const hasEdition = project?.projectFields?.hasEdition;

  const { data: editionsData } = useQuery(GET_EDITIONS, {
    skip: !hasEdition,
  });

  // Must be called before early returns — Rules of Hooks
  const { data: editionImagesData } = useQuery(GET_PROJECT_IMAGES, {
    variables: { parentId: String(selectedEditionDbId) },
    skip: !selectedEditionDbId,
  });

  const { data: editionContentData } = useQuery(GET_EDITION_CONTENT, {
    variables: { slug: selectedEditionSlug ?? '' },
    skip: !selectedEditionSlug,
  });

  if (loading) return null;
  if (!project) return null;

  const { projectFields, projectTags } = project;
  const tags = projectTags?.nodes ?? [];
  const layout = projectFields?.layout || "Default";
  const rawImages = imagesData?.mediaItems?.nodes ?? [];
  const galleryOrder = extractGalleryOrder(project.content)
  const images = galleryOrder.length
    ? [...rawImages].sort((a, b) => galleryOrder.indexOf(a.databaseId) - galleryOrder.indexOf(b.databaseId))
    : rawImages;
  const coverMediaType = (projectFields?.coverMediaType?.[0] ?? '').toLowerCase();
  const rawCoverImageUrl = projectFields?.coverImage?.node?.sourceUrl;
  const coverImageUrl = coverMediaType === 'gif' && rawCoverImageUrl
    ? rawCoverImageUrl.replace(/-scaled(\.[^.]+)$/, '$1')
    : rawCoverImageUrl;
  const coverImageAlt = projectFields?.coverImage?.node?.altText || "";

  // Next/previous project (wraps around)
  const allProjects = allData?.projects?.nodes ?? [];
  const currentIdx = allProjects.findIndex((p) => p.slug === slug);
  const nextProject =
    currentIdx >= 0 ? allProjects[(currentIdx + 1) % allProjects.length] : null;
  const previousProject =
    currentIdx >= 0
      ? allProjects[(currentIdx - 1 + allProjects.length) % allProjects.length]
      : null;

  // Editions belonging to this project
  const editions = (editionsData?.editions?.nodes ?? [])
    .filter((e) => e.editionFields?.parentProject?.nodes?.some((p) => p.slug === slug))
    .sort((a, b) => (a.editionFields?.editionNumber ?? 0) - (b.editionFields?.editionNumber ?? 0));

  const selectedEdition = editions.find((e) => e.slug === selectedEditionSlug) ?? null;
  const rawEditionImages = editionImagesData?.mediaItems?.nodes ?? [];
  const editionGalleryOrder = extractGalleryOrder(editionContentData?.edition?.content);
  const editionImages = editionGalleryOrder.length
    ? [...rawEditionImages].sort((a, b) => editionGalleryOrder.indexOf(a.databaseId) - editionGalleryOrder.indexOf(b.databaseId))
    : rawEditionImages;

  return (
    <div className="detail-page">
      {/* ── LEFT COLUMN ── */}
      <aside className="detail-left">

        {/* Nav top — always outside the split halves */}
        <DomenicaLink className="detail-nav-label" />

        <div className="detail-left-top">

          {/* Logo — fixed */}
          {projectFields?.logo?.node && (() => {
            const logo = projectFields.logo.node
            const logoSrc = logo.mimeType === 'image/gif'
              ? logo.sourceUrl.replace(/-scaled(\.[^.]+)$/, '$1')
              : logo.sourceUrl
            return (
              <div>
                <br />
                <br />
                <img
                  src={logoSrc}
                  alt={logo.altText || ''}
                  style={{ maxWidth: '30%' }}
                />
              </div>
            )
          })()}

          {/* Description — scrollable area, natural height */}
          <div className="detail-left-scroll">
            {project.title && (
              <p className="detail-title">{project.title}</p>
            )}
            {projectFields?.description && (
              <p className="detail-description">{projectFields.description}</p>
            )}
          </div>

          <div className="external-link" style={!projectFields?.externalLink ? { margin: 0 } : undefined}>
            {projectFields?.externalLink && (
              <a
                className="detail-external-link"
                href={projectFields.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
            )}
          </div>

          {/* Spacer — pushes editions+bottom to bottom */}
          <div className="detail-spacer" />

          {/* Editions — centered between spacers */}
          {hasEdition && editions.length > 0 && (
            <ul className="editions-list">
              {editions.map((e) => (
                <li key={e.slug}>
                  <button
                    className="edition-link"
                    onClick={() => {
                      const isActive = selectedEditionSlug === e.slug
                      setSelectedEditionSlug(isActive ? null : e.slug)
                      setSelectedEditionDbId(isActive ? null : e.databaseId)
                    }}
                    style={{ opacity: selectedEditionSlug === e.slug ? 0.35 : 1 }}
                  >
                    <span className="edition-link-text">{e.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Second spacer — equal space below editions */}
          <div className="detail-spacer" />

          {/* Bottom row: meta+previous + next — fixed, same line */}
          <div className="detail-bottom-row">
            {nextProject && (
              <Link to={`/projects/${nextProject.slug}`} className="detail-next">
                NEXT PROJECT : {nextProject.title}
              </Link>
            )}
            <div className="detail-bottom-left">
              <div className="detail-meta">
                {projectFields?.year && <span>{projectFields.year}</span>}
                {tags.map((t) => (
                  <span key={t.name}>{t.name}</span>
                ))}
              </div>
              {previousProject && (
                <Link to={`/projects/${previousProject.slug}`} className="detail-next">
                  PREVIOUS PROJECT : {previousProject.title}
                </Link>
              )}
            </div>
          </div>

        </div>

      </aside>

      {/* ── RIGHT COLUMN ── */}
      <div className={`detail-right${hasEdition && !selectedEdition ? ' detail-right--edition' : ''}`}>
        {!hasEdition ? (
          <Gallery images={images} layout={layout} />
        ) : selectedEdition ? (
          <Gallery images={editionImages} layout={layout} />
        ) : (
          <>
            {(coverMediaType === "image" || coverMediaType === "gif") &&
              coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt={coverImageAlt}
                  style={{ maxWidth: "100%" }}
                />
              )}
            {coverMediaType === "video" && projectFields?.coverVideo && (
              <VideoEmbed url={projectFields.coverVideo} />
            )}
          </>
        )}
      </div>

    </div>
  );
}
