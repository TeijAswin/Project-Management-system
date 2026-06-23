import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import CountdownBadge from '../components/CountdownBadge'
import { getDashboard, getProjects, getTasks } from '../services/api'

const StatCard = ({ label, value, icon, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [urgentProjects, setUrgentProjects] = useState([])
  const [urgentTasks, setUrgentTasks] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, projRes, taskRes] = await Promise.all([
          getDashboard(),
          getProjects(),
          getTasks(),
        ])
        setStats(statsRes.data)

        const now = new Date()
        // Urgent: not completed and due within 7 days
        const urgent = (items, dateKey) =>
          items.filter((i) => {
            if (i.status === 'Completed') return false
            const d = new Date(i[dateKey])
            const diff = (d - now) / 86400000
            return diff <= 7
          }).sort((a, b) => new Date(a[dateKey]) - new Date(b[dateKey])).slice(0, 5)

        setUrgentProjects(urgent(projRes.data, 'end_date'))
        setUrgentTasks(urgent(taskRes.data, 'due_date'))
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome + date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.fullname?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">{today}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/projects" className="btn-primary text-sm">+ New Project</Link>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard label="Total Projects" value={stats.total_projects} color="bg-primary-50"
                icon={<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
              />
              <StatCard label="Total Tasks" value={stats.total_tasks} color="bg-blue-50"
                icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>}
              />
              <StatCard label="Completed" value={stats.completed_tasks} color="bg-primary-50"
                icon={<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard label="Pending Tasks" value={stats.pending_tasks} color="bg-orange-50"
                icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard label="In Progress" value={stats.projects_in_progress} color="bg-purple-50"
                icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              />
            </div>

            {/* Progress bar */}
            {stats.total_tasks > 0 && (
              <div className="card p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Task Completion</span>
                  <span className="text-sm font-bold text-primary-600">
                    {Math.round((stats.completed_tasks / stats.total_tasks) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((stats.completed_tasks / stats.total_tasks) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {stats.completed_tasks} of {stats.total_tasks} tasks completed
                </p>
              </div>
            )}
          </>
        )}

        {/* Daily Update Panel */}
        {(urgentProjects.length > 0 || urgentTasks.length > 0) && (
          <div className="mb-6">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-primary-500 rounded-full" />
              <h2 className="text-base font-semibold text-gray-900">Daily Update</h2>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                Due within 7 days
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Urgent Projects */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Projects
                </h3>
                {urgentProjects.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No urgent projects</p>
                ) : (
                  <div className="space-y-2">
                    {urgentProjects.map((p) => (
                      <Link key={p.id} to={`/projects/${p.id}`}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.project_name}</p>
                          <p className="text-xs text-gray-400">{p.status}</p>
                        </div>
                        <CountdownBadge date={p.end_date} completedStatus={p.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Urgent Tasks */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                  Tasks
                </h3>
                {urgentTasks.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No urgent tasks</p>
                ) : (
                  <div className="space-y-2">
                    {urgentTasks.map((t) => (
                      <Link key={t.id} to={`/projects/${t.Project?.id}`}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{t.task_name}</p>
                          <p className="text-xs text-gray-400">{t.priority} · {t.status}</p>
                        </div>
                        <CountdownBadge date={t.due_date} completedStatus={t.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/projects" className="btn-primary text-sm">View All Projects</Link>
            <Link to="/projects" className="btn-secondary text-sm">+ New Project</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
