import { useNavigate } from 'react-router-dom'
import CountdownBadge from './CountdownBadge'

const STATUS_STYLES = {
  'Not Started': 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed':   'bg-primary-100 text-primary-700',
}

/** Suggest an approximate start date if not started: today or tomorrow */
const getApproxStart = (project) => {
  if (project.status !== 'Not Started') return null
  const now = new Date()
  const scheduled = new Date(project.start_date)
  if (scheduled > now) return null // hasn't reached scheduled start yet
  // Suggest today
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate()

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${project.project_name}"? All tasks will also be deleted.`)) {
      onDelete(project.id)
    }
  }

  const approxStart = getApproxStart(project)

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="card p-5 hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-primary-700 transition-colors line-clamp-2">
          {project.project_name}
        </h3>
        <span className={`badge shrink-0 ${STATUS_STYLES[project.status]}`}>
          {project.status}
        </span>
      </div>

      {/* Approx start hint */}
      {approxStart && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>Suggested start: <strong>{approxStart}</strong> — project not yet begun</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>

      {/* Countdown */}
      <div className="mb-3">
        <CountdownBadge date={project.end_date} completedStatus={project.status} />
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{formatDate(project.start_date)}</span>
        <span>→</span>
        <span>{formatDate(project.end_date)}</span>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Created {formatDate(project.created_at)}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`) }}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
