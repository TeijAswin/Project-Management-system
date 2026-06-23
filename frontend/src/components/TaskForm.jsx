import { useState, useEffect } from 'react'

const EMPTY = {
  task_name: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  due_date: '',
}

export default function TaskForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      setForm({
        task_name: initial.task_name || '',
        description: initial.description || '',
        priority: initial.priority || 'Medium',
        status: initial.status || 'Pending',
        due_date: initial.due_date?.slice(0, 10) || '',
      })
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [initial])

  const validate = () => {
    const e = {}
    if (!form.task_name.trim()) e.task_name = 'Task name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.due_date) e.due_date = 'Due date is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit(form)
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Task Name</label>
        <input
          className={`input-field ${errors.task_name ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={form.task_name}
          onChange={set('task_name')}
          placeholder="e.g. Design mockups"
          maxLength={200}
        />
        {errors.task_name && <p className="text-red-500 text-xs mt-1">{errors.task_name}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className={`input-field resize-none h-20 ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={form.description}
          onChange={set('description')}
          placeholder="Describe the task..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Priority</label>
          <select className="input-field" value={form.priority} onChange={set('priority')}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input-field" value={form.status} onChange={set('status')}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Due Date</label>
        <input
          type="date"
          className={`input-field ${errors.due_date ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={form.due_date}
          onChange={set('due_date')}
        />
        {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Create Task'}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
