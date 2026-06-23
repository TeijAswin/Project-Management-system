import { useState, useEffect } from 'react'

/**
 * Returns a live countdown string for a given target date.
 * e.g. "3d 14h 22m" or "Overdue by 2d 5h" or "Due today"
 */
export default function useCountdown(targetDate) {
  const [display, setDisplay] = useState('')
  const [status, setStatus] = useState('upcoming') // 'upcoming' | 'today' | 'overdue'

  useEffect(() => {
    if (!targetDate) return

    const compute = () => {
      const now = new Date()
      const target = new Date(targetDate)
      // Set target to end of that day
      target.setHours(23, 59, 59, 999)
      const diff = target - now

      if (diff < 0) {
        // Overdue
        const abs = Math.abs(diff)
        const days = Math.floor(abs / 86400000)
        const hours = Math.floor((abs % 86400000) / 3600000)
        setStatus('overdue')
        setDisplay(days > 0 ? `Overdue ${days}d ${hours}h` : `Overdue ${hours}h`)
      } else if (diff < 86400000) {
        // Due today (< 24h)
        const hours = Math.floor(diff / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)
        setStatus('today')
        setDisplay(hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`)
      } else {
        // Upcoming
        const days = Math.floor(diff / 86400000)
        const hours = Math.floor((diff % 86400000) / 3600000)
        setStatus('upcoming')
        setDisplay(days > 1 ? `${days}d ${hours}h left` : `${days}d ${hours}h left`)
      }
    }

    compute()
    const interval = setInterval(compute, 60000) // update every minute
    return () => clearInterval(interval)
  }, [targetDate])

  return { display, status }
}
