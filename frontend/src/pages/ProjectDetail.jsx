import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import TaskCard from '../components/TaskCard'
import Modal from '../components/Modal'
import ProjectForm from '../components/ProjectForm'
import TaskForm from '../components/TaskForm'
import CountdownBadge from '../components/CountdownBadge'
import {
  getProject, updateProject, deleteProject,
  createTask, updateTask, deleteTask, sendDeadlineAlert
} from '../services/api'

const STATUS_STYLES = {
  'Not Started': 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed':   'bg-primary-100 text-primary-700',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [taskSearch, setTaskSearch] = useState('')
  const [taskStatus, setTaskStatus] = useState('')
  const [taskPriority, setTaskPriority] = useState('')

  // Modals
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const fetchProject = useCallback(() => {
    setLoading(true)
    getProject(id)
      .then((r) => {
        setProject(r.data)
        setTasks(r.data.Tasks || [])
      })
      .catch((err) => {
        if (err.response?.status === 403) setError('You do not have access to this project.')
        else if (err.response?.status === 404) setError('Project not found.')
        else setError('Failed to load project.')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])

  // Filter tasks client-side
  const filteredTasks = tasks.filter((t) => {
    const matchSearch = !taskSearch || t.task_name.toLowerCase().includes(taskSearch.toLowerCase())
    const matchStatus = !taskStatus || t.status === taskStatus
    const matchPriority = !taskPriority || t.priority === taskPriority
    return matchSearch && matchStatus && matchPriority
  })

  const handleUpdateProject = async (formData) => {
    setFormError('')
    setSaving(true)
    try {
      await updateProject(id, formData)
      setEditProjectOpen(false)
      fetchProject()
    } catch (err) {
      const msgs = err.response?.data?.errors?.map((e) => e.msg).join(', ')
      setFormError(msgs || 'Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete "${project.project_name}"? All tasks will be removed too.`)) return
    try {
      await deleteProject(id)
      navigate('/projects')
    } catch {
      alert('Failed to delete project.')
    }
  }

  const handleCreateTask = async (formData) => {
    setFormError('')
    setSaving(true)
    try {
      await createTask({ ...formData, project_id: parseInt(id) })
      setTaskModalOpen(false)
      fetchProject()
    } catch (err) {
      const msgs = err.response?.data?.errors?.map((e) => e.msg).join(', ')
      setFormError(msgs || 'Failed to create task.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTask = async (formData) => {
    setFormError('')
    setSaving(true)
    try {
      await updateTask(editingTask.id, formData)
      setEditingTask(null)
      setTaskModalOpen(false)
      fetchProject()
    } catch (err) {
      const msgs = err.response?.data?.errors?.map((e) => e.msg).join(', ')
      setFormError(msgs || 'Failed to update task.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch {
      alert('Failed to delete task.')
    }
  }

  const openEditTask = (task) => {
    setFormError('')
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleSendAlert = async () => {
    try {
      await sendDeadlineAlert(id)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch {
      alert('Failed to send alert email. Check email config in backend/.env')
    }
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><LoadingSpinner /></div>

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/projects" className="btn-secondary text-sm">← Back to Projects</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/projects" className="hover:text-primary-600 transition-colors">Projects</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium truncate max-w-xs">{project.project_name}</span>
        </div>

        {/* Project Header Card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 truncate">{project.project_name}</h1>
                <span className={`badge ${STATUS_STYLES[project.status]}`}>{project.status}</span>
              </div>
              <p className="text-gray-500 text-sm mb-3">{project.description}</p>

              {/* Countdown + dates row */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <CountdownBadge date={project.end_date} completedStatus={project.status} />
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(project.start_date)} — {formatDate(project.end_date)}
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Not started hint */}
              {project.status === 'Not Started' && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Project not started — update status when work begins
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFormError(''); setEditProjectOpen(true) }}
                  className="btn-secondary text-sm"
                >
                  Edit
                </button>
                <button onClick={handleDeleteProject} className="btn-danger text-sm">
                  Delete
                </button>
              </div>
              {/* Send email alert */}
              <button
                onClick={handleSendAlert}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {emailSent ? '✓ Email sent!' : 'Send deadline alert'}
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card p-6">
          {/* Task Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Tasks
              <span className="ml-2 text-sm font-normal text-gray-400">({filteredTasks.length})</span>
            </h2>
            <button
              className="btn-primary text-sm"
              onClick={() => { setFormError(''); setEditingTask(null); setTaskModalOpen(true) }}
            >
              + Add Task
            </button>
          </div>

          {/* Task Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="input-field pl-9 text-sm"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>
            <select
              className="input-field sm:w-40 text-sm"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <select
              className="input-field sm:w-36 text-sm"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No tasks found</p>
              <p className="text-xs text-gray-400">
                {taskSearch || taskStatus || taskPriority ? 'Adjust filters to see more.' : 'Add your first task above.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={openEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Project Modal */}
      <Modal
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        title="Edit Project"
      >
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {formError}
          </div>
        )}
        <ProjectForm
          initial={project}
          onSubmit={handleUpdateProject}
          onCancel={() => setEditProjectOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Task Modal (Create / Edit) */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null) }}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {formError}
          </div>
        )}
        <TaskForm
          initial={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => { setTaskModalOpen(false); setEditingTask(null) }}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
