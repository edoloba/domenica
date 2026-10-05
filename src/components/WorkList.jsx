import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { GET_PROJECTS } from '../graphql/queries'
import './WorkList.css'

// "2025-26" → 2026, "2026" → 2026, "2025" → 2025
function parseYear(yearStr) {
  if (!yearStr) return 0
  const range = yearStr.match(/(\d{4})-(\d{2})/)
  if (range) return parseInt(range[1].slice(0, 2) + range[2])
  const full = yearStr.match(/\d{4}/)
  return full ? parseInt(full[0]) : 0
}

export default function WorkList({ onSelect }) {
  const { data, loading, error } = useQuery(GET_PROJECTS)
  console.log(data)

  if (loading || error || !data?.projects?.nodes?.length) return null

  const projects = [...data.projects.nodes].sort(
    (a, b) => parseYear(b.projectFields?.year) - parseYear(a.projectFields?.year)
  )

  return (
    <div className="work-list">
      {projects.map((project, i) => {
        const tags = project.projectTags?.nodes ?? []

        return (
          <Link
            key={project.slug ?? i}
            to={`/projects/${project.slug}`}
            className="work-row"
            onClick={onSelect}
          >
            <span className="work-year">{project.projectFields?.year}</span>
            <span className="work-title">{project.title}</span>
            <span className="work-tags">
              {tags.map((tag) => (
                <span key={tag.name}>{tag.name}</span>
              ))}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
