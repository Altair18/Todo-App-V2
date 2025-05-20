import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTasks } from '../context/TaskContext'
import { format, subDays } from 'date-fns'

export default function ProductivityTracker() {
  const { tasks } = useTasks()

  // Collect 7 days worth of "YYYY-MM-DD" dates (today last)
  const today = new Date()
  const days = [...Array(7)].map((_, i) => format(subDays(today, 6 - i), 'yyyy-MM-dd'))

  // Completed tasks by date
  const completedByDay = tasks
    .filter(t => t.done && t.updatedAt)
    .reduce((acc, t) => {
      const d = new Date(t.updatedAt).toISOString().slice(0, 10)
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})

  const data = days.map(date => ({
    date,
    count: completedByDay[date] || 0
  }))

  // Extra stats
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="p-8 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-100">Productivity Tracker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your last 7 days at a glance
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{percent}%</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">complete</span>
        </div>
      </div>
      {data.every(d => d.count === 0) ? (
        <div className="text-center text-gray-400 py-12">No completed tasks yet.<br />Complete some tasks to see your streak!</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#64748b" }} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#f1f5f9", borderRadius: 8, border: "none", color: "#1e293b" }}
              labelStyle={{ color: "#3b82f6" }}
              itemStyle={{ color: "#3b82f6" }}
              formatter={(value) => [value, "Tasks completed"]}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-600 dark:text-gray-300">Completed: <b>{done}</b></span>
        <span className="text-sm text-gray-600 dark:text-gray-300">Pending: <b>{total - done}</b></span>
        <span className="text-sm text-gray-600 dark:text-gray-300">Total: <b>{total}</b></span>
      </div>
    </div>
  )
}
