import { gql } from '@apollo/client'

// Used by WorkList (homepage) + ProjectDetail (next-project navigation).
// Keeping the same query document ensures Apollo serves the second call from cache.
// Used by ProjectDetail + EditionDetail for next-edition navigation.
export const GET_EDITIONS = gql`
  query GetEditions {
    editions {
      nodes {
        title
        slug
        databaseId
        editionFields {
          editionNumber
          parentProject {
            nodes {
              ... on Project { slug }
            }
          }
        }
      }
    }
  }
`

// Single items (used mainly for video — one Archive Item post per file)
export const GET_ARCHIVE_ITEMS = gql`
  query GetArchiveItems {
    archiveItems(first: 200) {
      nodes {
        archiveFields {
          media {
            node {
              sourceUrl
              mediaItemUrl
              mimeType
              altText
            }
          }
        }
      }
    }
  }
`

// Bulk images — the "Archive" page's Gutenberg Gallery block. Images can be
// picked from the existing media library (not just freshly uploaded), so their
// post_parent may not point at this page — fetch by explicit ID instead of parentIn.
export const GET_ARCHIVE_PAGE = gql`
  query GetArchivePage {
    page(id: "archive", idType: URI) {
      content
    }
  }
`

export const GET_ARCHIVE_PAGE_MEDIA = gql`
  query GetArchivePageMedia($ids: [ID]!) {
    mediaItems(first: 200, where: { in: $ids }) {
      nodes {
        databaseId
        sourceUrl
        mediaItemUrl
        mimeType
        altText
      }
    }
  }
`

export const GET_PROJECTS = gql`
  query GetProjects {
    projects(first: 100, where: { orderby: { field: DATE, order: ASC } }) {
      nodes {
        title
        slug
        projectFields {
          year
        }
        projectTags {
          nodes {
            name
          }
        }
      }
    }
  }
`
