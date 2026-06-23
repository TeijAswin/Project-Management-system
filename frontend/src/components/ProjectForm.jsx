import { useState, useEffect } from 'react'

const EMPTY = {
  project_name: '',
  description: '',
  status: 'Not Started',
  start_date: '',
  end_date: '',
}

/** Returns a suggested start date = today formatted as YYYY-MM-DD */
const todayISO = () => new Date().toISOString().slice(0, 10)

/** Returns approximate end date = today + 30 days */
const approxEndISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export default function ProjectForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        project_name: initial.project_name || '',
        description: initial.description || '',
        status: initial.status || 'Not Started',
        start_date: initial.start_date?.slice(0, 10) || '',
        end_date: initial.end_date?.slice(0, 10) || '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [initial])

  const validate = () => {
    const e = {}
    if (!form.project_name.trim()) e.project_name = 'Project name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.start_date) e.start_date = 'Start date is required'
    if (!form.end_date) e.end_date = 'End date is required'
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      e.end_date = 'End date must be after start date'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit(form)
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  /** Fill in approximate dates when user picks "Not Started" */
  const handleStatusChange = (e) => {
    const newStatus = e.target.value
    const updates = { status: newStatus }
    if (newStatus === 'Not Started' && !form.start_date) {
      updates.start_date = todayISO()
      updates.end_date = approxEndISO()
    }
    setForm((f) => ({ ...f, ...updates }))
  }

  const isNotStarted = form.status === 'Not Started'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Project Name</label>
        <input
          className={`input-field ${errors.project_name ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={form.project_name}
          onChange={set('project_name')}
          placeholder="e.g. Website Redesign"
          maxLength={200}
        />
        {errors.project_name && <p className="text-red-500 text-xs mt-1">{errors.project_name}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className={`input-field resize-none h-24 ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={form.description}
          onChange={set('description')}
          placeholder="Describe the project..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="label">Status</label>
        <select className="input-field" value={form.status} onChange={handleStatusChange}>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        {/* Approx date hint for Not Started */}
        {isNotStarted && (
          <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700">
              <strong>Not Started</strong> — approximate dates pre-filled (today + 30 days). You can adjust them. A reminder email will be sent once the start date passes.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">
            {isNotStarted ? 'Approx. Start Date' : 'Start Date'}
          </label>
          <input
            type="date"
            className={`input-field ${errors.start_date ? 'border-red-400 focus:ring-red-400' : isNotStarted ? 'border-amber-300 bg-amber-50' : ''}`}
            value={form.start_date}
            onChange={set('start_date')}
          />
          {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
          {isNotStarted && !errors.start_date && (
            <p className="text-amber-600 text-xs mt-1">Approximate — update when project begins</p>
          )}
        </div>
        <div>
          <label className="label">
            {isNotStarted ? 'Approx. End Date' : 'End Date'}
          </label>
          <input
            type="date"
            className={`input-field ${errors.end_date ? 'border-red-400 focus:ring-red-400' : isNotStarted ? 'border-amber-300 bg-amber-50' : ''}`}
            value={form.end_date}
            onChange={set('end_date')}
          />
          {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
          {isNotStarted && !errors.end_date && (
            <p className="text-amber-600 text-xs mt-1">Approximate — adjust as needed</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Create Project'}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
