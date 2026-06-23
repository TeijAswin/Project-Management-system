import CountdownBadge from './CountdownBadge'

const PRIORITY_STYLES = {
  Low:    'bg-gray-100 text-gray-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  High:   'bg-red-100 text-red-700',
}

const STATUS_STYLES = {
  Pending:       'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed:     'bg-primary-100 text-primary-700',
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-snug">{task.task_name}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`badge ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
          <span className={`badge ${STATUS_STYLES[task.status]}`}>{task.status}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>

      {/* Countdown */}
      <div className="mb-3">
        <CountdownBadge date={task.due_date} completedStatus={task.status} />
      </div>

      {/* Due date */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Due {formatDate(task.due_date)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete task "${task.task_name}"?`)) onDelete(task.id)
            }}
            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
