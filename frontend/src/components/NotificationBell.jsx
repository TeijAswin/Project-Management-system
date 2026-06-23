import { useState, useEffect, useRef } from 'react'
import { getProjects, getTasks } from '../services/api'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  const buildNotifications = (projects, tasks) => {
    const now = new Date()
    const items = []

    projects.forEach((p) => {
      if (p.status === 'Completed') return
      const end = new Date(p.end_date)
      end.setHours(23, 59, 59)
      const daysLeft = Math.ceil((end - now) / 86400000)

      if (daysLeft < 0) {
        items.push({ id: `p-${p.id}`, type: 'project', level: 'error', link: `/projects/${p.id}`,
          title: `Project overdue: ${p.project_name}`,
          body: `Was due ${Math.abs(daysLeft)} day(s) ago.` })
      } else if (daysLeft === 0) {
        items.push({ id: `p-${p.id}`, type: 'project', level: 'warning', link: `/projects/${p.id}`,
          title: `Project due today: ${p.project_name}`,
          body: 'Deadline is today!' })
      } else if (daysLeft <= 3) {
        items.push({ id: `p-${p.id}`, type: 'project', level: 'info', link: `/projects/${p.id}`,
          title: `Project due soon: ${p.project_name}`,
          body: `${daysLeft} day(s) remaining.` })
      }

      if (p.status === 'Not Started' && new Date(p.start_date) <= now) {
        items.push({ id: `ps-${p.id}`, type: 'warning', level: 'warning', link: `/projects/${p.id}`,
          title: `Not started: ${p.project_name}`,
          body: `Scheduled to start on ${new Date(p.start_date).toLocaleDateString()}` })
      }
    })

    tasks.forEach((t) => {
      if (t.status === 'Completed') return
      const due = new Date(t.due_date)
      due.setHours(23, 59, 59)
      const daysLeft = Math.ceil((due - now) / 86400000)

      if (daysLeft < 0) {
        items.push({ id: `t-${t.id}`, type: 'task', level: 'error', link: `/projects/${t.Project?.id}`,
          title: `Task overdue: ${t.task_name}`,
          body: `Was due ${Math.abs(daysLeft)} day(s) ago. Priority: ${t.priority}` })
      } else if (daysLeft === 0) {
        items.push({ id: `t-${t.id}`, type: 'task', level: 'warning', link: `/projects/${t.Project?.id}`,
          title: `Task due today: ${t.task_name}`,
          body: `Priority: ${t.priority}` })
      } else if (daysLeft <= 2) {
        items.push({ id: `t-${t.id}`, type: 'task', level: 'info', link: `/projects/${t.Project?.id}`,
          title: `Task due soon: ${t.task_name}`,
          body: `${daysLeft} day(s) left. Priority: ${t.priority}` })
      }
    })

    return items
  }

  const load = async () => {
    try {
      const [pRes, tRes] = await Promise.all([getProjects(), getTasks()])
      setNotifications(buildNotifications(pRes.data, tRes.data))
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5 * 60 * 1000) // refresh every 5 min
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const levelStyle = {
    error:   { bg: 'bg-red-50 border-red-200',   dot: 'bg-red-500',    icon: 'text-red-500' },
    warning: { bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-400', icon: 'text-orange-500' },
    info:    { bg: 'bg-primary-50 border-primary-200', dot: 'bg-primary-400', icon: 'text-primary-600' },
  }

  const unread = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-50 border-b border-primary-100">
            <span className="text-sm font-semibold text-primary-800">Notifications</span>
            {unread > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {unread} alert{unread !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-primary-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400">No pending alerts</p>
              </div>
            ) : (
              notifications.map((n) => {
                const s = levelStyle[n.level]
                return (
                  <Link
                    key={n.id}
                    to={n.link || '/projects'}
                    onClick={() => setOpen(false)}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${n.level === 'error' ? 'border-red-400' : n.level === 'warning' ? 'border-orange-400' : 'border-primary-400'}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <button onClick={() => { load(); setOpen(false) }}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
