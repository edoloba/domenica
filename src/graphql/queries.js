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

export const GET_ARCHIVE = gql`
  query GetArchive {
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
