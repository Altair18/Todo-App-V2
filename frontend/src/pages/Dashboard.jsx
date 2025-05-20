// src/pages/Dashboard.jsx

import { useState, useEffect, useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import TaskList from '../components/TaskList'
import TaskDetail from '../components/TaskDetail'
import LearningSchedule from '../components/LearningSchedule'
import ProductivityChart from '../components/ProductivityChart'
import Login from '../components/Login'
import Register from '../components/Register'
import api from '../api'
import { AuthContext } from '../context/AuthContext'
import { useTasks } from '../context/TaskContext'
import { Link } from 'react-router-dom'
import ProductivityPanel from '../components/ProductivityPanel'
import ProductivityTracker from '../components/ProductivityTracker'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const { dark, setDark } = useContext(ThemeContext)

  // --- Auth State
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  // --- App State
  const { tasks, setTasks } = useTasks()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskFilter, setTaskFilter] = useState('all')
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({ name: '', due: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editProjectData, setEditProjectData] = useState({ name: '', due: '' })
  const [showSettings, setShowSettings] = useState(false)

  // Add state to control showing the welcome modal
  const [showGuestWelcome, setShowGuestWelcome] = useState(
    () => !user && tasks.length === 0
  )
  // Add state to control a general welcome modal
  const [showWelcome, setShowWelcome] = useState(false)

  // --- Guest/Logged-in Data Handling
  useEffect(() => {
    if (user) {
      // Logged in: load from backend
      setLoading(true)
      api
        .get('/tasks', { headers: { Authorization: `Bearer ${user.token}` } })
        .then((r) => {
          setTasks(r.data)
          setError(null)
          if (r.data.length > 0) setSelectedTask(r.data[0])
        })
        .catch(() => setError('Failed to load tasks'))
        .finally(() => setLoading(false))

      api
        .get('/projects', { headers: { Authorization: `Bearer ${user.token}` } })
        .then((r) => setProjects(r.data))
        .catch(() => console.error('Failed to load projects'))
    } else {
      // Guest mode: load from localStorage
      const updateGuestTasks = () => {
        const savedTasks = localStorage.getItem('tasks')
        setTasks(savedTasks ? JSON.parse(savedTasks) : [])
        const savedProjects = localStorage.getItem('projects')
        setProjects(savedProjects ? JSON.parse(savedProjects) : [])
        setLoading(false)
      }
      updateGuestTasks()
      window.addEventListener('storage', updateGuestTasks)
      return () => window.removeEventListener('storage', updateGuestTasks)
    }
  }, [user, setTasks])

  useEffect(() => {
    if (user) setShowWelcome(true)
  }, [user])

  useEffect(() => {
    if (!user) {
      // Save tasks in guest mode
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks, user])

  useEffect(() => {
    if (!user) {
      // Save projects in guest mode
      localStorage.setItem('projects', JSON.stringify(projects))
    }
  }, [projects, user])

  // --- Auth Handlers
  const handleLogout = () => {
    localStorage.removeItem('user')
  }

  const addTask = (newT) => setTasks((ts) => [newT, ...ts])

  const toggleDone = async (id, done) => {
    if (!user) {
      setTasks((ts) => ts.map((t) => (t._id === id ? { ...t, done } : t)))
      return
    }
    const { data } = await api.put(`/tasks/${id}`, { done })
    setTasks((ts) => ts.map((t) => (t._id === id ? data : t)))
  }

  const deleteTask = async (id) => {
    if (!user) {
      setTasks((ts) => {
        const updated = ts.filter((t) => t._id !== id)
        if (selectedTask && selectedTask._id === id) setSelectedTask(null)
        return updated
      })
      return
    }
    await api.delete(`/tasks/${id}`)
    setTasks((ts) => {
      const updated = ts.filter((t) => t._id !== id)
      if (selectedTask && selectedTask._id === id) setSelectedTask(null)
      return updated
    })
  }

  const saveEdit = async (id, updates) => {
    if (!user) {
      setTasks((ts) => ts.map((t) => (t._id === id ? { ...t, ...updates } : t)))
      return
    }
    const { data } = await api.put(`/tasks/${id}`, updates)
    setTasks((ts) => ts.map((t) => (t._id === id ? data : t)))
    setSelectedTask(data)
  }

  // --- Projects logic
  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      alert('Project name is required')
      return
    }
    const newEntry = {
      _id: crypto.randomUUID(),
      name: newProject.name,
      due: newProject.due,
      tasks: [],
    }
    setProjects((prev) => [...prev, newEntry])
    setNewProject({ name: '', due: '' })
  }

  // --- Filtering
  const formatDate = (dateStr) => new Date(dateStr).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const upcomingTasks = tasks.filter(
    (t) => t.dueDate && formatDate(t.dueDate) > today && !t.done
  )
  const todayTasks = tasks.filter(
    (t) => t.dueDate && formatDate(t.dueDate) === today && !t.done
  )
  const filteredTasks =
    taskFilter === 'completed'
      ? tasks.filter((t) => t.done)
      : taskFilter === 'today'
      ? todayTasks
      : taskFilter === 'upcoming'
      ? upcomingTasks
      : tasks.filter((t) => !t.done)

  return (
    <>
      {/* Logged-In Welcome Modal */}
      {showWelcome && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center text-center border border-green-300 dark:border-green-700">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => setShowWelcome(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <span className="text-5xl mb-3 animate-bounce">🚀</span>
            <h3 className="font-bold text-2xl text-green-900 dark:text-green-200 mb-4">
              Welcome back, {user.email?.split('@')[0] || 'User'}!
            </h3>
            <ul className="list-inside list-disc text-gray-800 dark:text-gray-200 space-y-2 mb-2">
              <li>Your tasks sync and are saved securely.</li>
              <li>Start a new project or keep up your streak!</li>
              <li className="text-sm text-gray-500 dark:text-gray-400">
                Try using tags and priorities to organize your work!
              </li>
            </ul>
            <div className="mt-2 text-gray-500 dark:text-gray-300 text-sm">
              Tip: Use the settings panel to customize your experience.
            </div>
            <button
              className="mt-6 px-5 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition"
              onClick={() => setShowWelcome(false)}
            >
              Thanks!
            </button>
          </div>
        </div>
      )}

      {/* Guest Welcome Modal */}
      {showGuestWelcome && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center text-center border border-blue-200 dark:border-gray-700">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => setShowGuestWelcome(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <span className="text-5xl mb-3 animate-bounce">👋</span>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white mb-2">
              Welcome, Guest!
            </h2>
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              You're using <b>Guest Mode</b>.
              <br />
              Tasks are saved only on this device.
            </p>
            <div className="flex gap-3 justify-center mt-2 mb-2">
              <button
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
                onClick={() => {
                  setShowLogin(true)
                  setShowRegister(false)
                  setShowGuestWelcome(false)
                }}
              >
                Login
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-green-500 text-white font-medium shadow hover:bg-green-600 transition"
                onClick={() => {
                  setShowRegister(true)
                  setShowLogin(false)
                  setShowGuestWelcome(false)
                }}
              >
                Register
              </button>
            </div>
            <button
              className="mt-4 text-xs text-gray-500 underline hover:text-blue-700"
              onClick={() => setShowGuestWelcome(false)}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}

      {/* Top-right user info */}
      <div className="absolute top-5 right-8 z-50 flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow border border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-700">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col mr-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {user.email || user.username}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Logged in
              </span>
            </div>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 text-xs"
              onClick={logout} // or handleLogout() if you prefer
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded shadow border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-700">
                G
              </div>
              <div className="flex flex-col mr-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Guest
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Guest mode
                </span>
              </div>
            </div>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded shadow hover:bg-blue-700 ml-4"
              onClick={() => {
                setShowLogin(true)
                setShowRegister(false)
              }}
            >
              <span>Login</span>
            </button>
            <button
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded shadow hover:bg-green-700"
              onClick={() => {
                setShowRegister(true)
                setShowLogin(false)
              }}
            >
              <span>Register</span>
            </button>
          </>
        )}
      </div>

      {/* Auth Modals */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <Login
              onSuccess={() => setShowLogin(false)}
              onCancel={() => setShowLogin(false)}
              onSwitch={() => {
                setShowLogin(false)
                setShowRegister(true)
              }}
            />
          </div>
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => setShowRegister(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <Register
              onSuccess={() => setShowRegister(false)}
              onCancel={() => setShowRegister(false)}
              onSwitch={() => {
                setShowRegister(false)
                setShowLogin(true)
              }}
            />
          </div>
        </div>
      )}

      {/* Main flex layout for dashboard */}
      <div className="w-full px-2 sm:px-6 lg:px-12 py-8 flex flex-col gap-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              My Dashboard
            </h1>
            <p className="text-lg opacity-75 text-gray-700 dark:text-gray-400">
              One task at a time.
            </p>
          </div>
        </header>

        {/* GUEST MODE: Minimal UI */}
        {!user ? (
          <>
            {/* Guest Info Section */}
            <div className="mt-8 mb-8 w-full bg-blue-900/10 dark:bg-gray-700/40 rounded-xl shadow p-5 flex flex-col items-center text-center border border-blue-200 dark:border-gray-700">
              <h3 className="font-bold text-xl text-blue-800 dark:text-blue-200 mb-4">
                What can you do in Guest Mode?
              </h3>
              <ul className="list-inside list-disc text-gray-700 dark:text-gray-200 space-y-2 mb-2">
                <li>Create and complete tasks (locally)</li>
                <li>Try out light/dark mode from Settings (bottom left)</li>
                <li>Preview the project dashboard after you log in!</li>
                <li className="text-sm text-gray-400 mt-2">
                  Tasks won't sync to your other devices until you register.
                </li>
              </ul>
            </div>

            <main className="grid grid-cols-12 gap-6 w-full">
              {/* Left Menu (3) */}
              <aside className="col-span-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
                  Menu
                </h2>
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-full p-2 mb-6 border rounded text-gray-900"
                />
                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Tasks
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <li>
                      <button
                        onClick={() => setTaskFilter('upcoming')}
                        className="hover:underline flex justify-between w-full text-left"
                      >
                        <span>Upcoming</span>
                        <span className="text-gray-500">{upcomingTasks.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setTaskFilter('today')}
                        className="hover:underline flex justify-between w-full text-left"
                      >
                        <span>Today</span>
                        <span className="text-gray-500">{todayTasks.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setTaskFilter('completed')}
                        className="hover:underline flex justify-between w-full text-left"
                      >
                        <span>Completed</span>
                        <span className="text-gray-500">
                          {tasks.filter((t) => t.done).length}
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setTaskFilter('all')}
                        className="text-blue-500 hover:underline text-left"
                      >
                        Show All
                      </button>
                    </li>
                  </ul>
                </div>
              </aside>

              {/* Task List (5) */}
              <section className="col-span-9 p-4 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Your Tasks
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {taskFilter === 'today'
                        ? "Today's Tasks"
                        : taskFilter === 'upcoming'
                        ? 'Upcoming Tasks'
                        : taskFilter === 'completed'
                        ? 'Completed Tasks'
                        : 'All Tasks'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                  >
                    + New Task
                  </button>
                </div>
                {tasks.length > 0 && (
                  <button
                    className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Clear all guest tasks? This cannot be undone.'
                        )
                      ) {
                        localStorage.removeItem('tasks')
                        setTasks([])
                      }
                    }}
                  >
                    Clear All Guest Tasks
                  </button>
                )}
                <TaskList
                  compact
                  tasks={filteredTasks}
                  loading={loading}
                  error={error}
                  onCreate={addTask}
                  onToggleDone={toggleDone}
                  onDelete={deleteTask}
                  onSaveEdit={saveEdit}
                  onSelect={setSelectedTask}
                  selectedTask={selectedTask}
                  showForm={showForm}
                  setShowForm={setShowForm}
                />
              </section>
            </main>
          </>
        ) : (
          // LOGGED-IN: Full dashboard UI
          <>
            {/* Top Dashboard Actions/Quick Links Bar */}
            <div className="w-full flex flex-row gap-6 mb-8 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow px-8 py-4">
              <Link
                to="/calendar"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow hover:from-blue-600 hover:to-blue-800 transition text-lg"
              >
                <span role="img" aria-label="calendar">📅</span> Calendar
              </Link>
              <Link
                to="/stats"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow hover:from-green-600 hover:to-green-800 transition text-lg"
              >
                <span role="img" aria-label="stats">📈</span> Stats
              </Link>
              <button
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold shadow hover:from-yellow-500 hover:to-yellow-700 transition text-lg"
                onClick={() => alert('More features coming soon!')}
              >
                <span role="img" aria-label="star">⭐</span> More
              </button>
            </div>

            <main className="grid grid-cols-12 gap-6 w-full">
              {/* Left Menu (3) */}
              <aside className="col-span-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
                  Menu
                </h2>
                {/* Removed Calendar Link from sidebar */}
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-full p-2 mb-6 border rounded text-gray-900"
                />
                <div className="mb-6">
                  <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Tasks
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <li>
                      <button
                        onClick={() => setTaskFilter('upcoming')}
                        className="hover:underline flex justify-between w-full text-left"
                      >
                        <span>Upcoming</span>
                        <span className="text-gray-500">{upcomingTasks.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setTaskFilter('today')}
                        className="hover:underline flex justify-between w-full text-left"
                      >
                        <span>Today</span>
                        <span className="text-gray-500">{todayTasks.length}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setTaskFilter('completed')}
                        className="hover:underline flex justify-between w-full text-left"
                      >
                        <span>Completed</span>
                        <span className="text-gray-500">
                          {tasks.filter((t) => t.done).length}
                        </span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setTaskFilter('all')}
                        className="text-blue-500 hover:underline text-left"
                      >
                        Show All
                      </button>
                    </li>
                  </ul>
                </div>
              </aside>

              {/* Task List (5) */}
              <section className="col-span-5 p-4 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Your Tasks
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {taskFilter === 'today'
                        ? "Today's Tasks"
                        : taskFilter === 'upcoming'
                        ? 'Upcoming Tasks'
                        : taskFilter === 'completed'
                        ? 'Completed Tasks'
                        : 'All Tasks'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                  >
                    + New Task
                  </button>
                </div>
                {!user && tasks.length > 0 && (
                  <button
                    className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Clear all guest tasks? This cannot be undone.'
                        )
                      ) {
                        localStorage.removeItem('tasks')
                        setTasks([])
                      }
                    }}
                  >
                    Clear All Guest Tasks
                  </button>
                )}
                <TaskList
                  compact
                  tasks={filteredTasks}
                  loading={loading}
                  error={error}
                  onCreate={addTask}
                  onToggleDone={toggleDone}
                  onDelete={deleteTask}
                  onSaveEdit={saveEdit}
                  onSelect={setSelectedTask}
                  selectedTask={selectedTask}
                  showForm={showForm}
                  setShowForm={setShowForm}
                />
              </section>

              {/* Only show the following panels for logged-in users */}
              {user && (
                <>
                  {/* Task Details Panel (2) */}
                  <aside className="col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
                    {selectedTask ? (
                      <TaskDetail task={selectedTask} />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        Select a task to see details
                      </p>
                    )}
                  </aside>

                  {/* Stats Panel (2) */}
                  <aside className="col-span-2 p-4 bg-blue-900/80 dark:bg-blue-900/60 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-6 border border-blue-300 dark:border-blue-800">
                    <h3 className="text-2xl font-bold text-white tracking-wider mb-6">
                      Your Stats
                    </h3>
                    <div className="flex flex-row justify-center gap-8 w-full">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-white">
                          {tasks.length}
                        </span>
                        <span className="text-sm text-blue-100">Total</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-green-300">
                          {tasks.filter((t) => t.done).length}
                        </span>
                        <span className="text-sm text-green-100">Completed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-yellow-300">
                          {tasks.filter((t) => !t.done).length}
                        </span>
                        <span className="text-sm text-yellow-100">Pending</span>
                      </div>
                    </div>
                  </aside>

                  {/* Quick Actions (3) -- optionally hidden on small screens */}
                  <aside className="hidden lg:flex col-span-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex-col gap-6 items-center justify-center">
                    <h2 className="text-lg font-bold text-blue-700 dark:text-blue-200 mb-4">
                      Quick Actions
                    </h2>
                    <button
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow font-semibold mb-2 hover:from-blue-600 hover:to-blue-800 transition"
                      onClick={() => (window.location.href = '/stats')}
                    >
                      📊 View All Stats
                    </button>
                    <button
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white shadow font-semibold mb-2 hover:from-green-500 hover:to-green-700 transition"
                      onClick={() => (window.location.href = '/calendar')}
                    >
                      🗓️ Go to Calendar
                    </button>
                    <button
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow font-semibold mb-2 hover:from-yellow-500 hover:to-yellow-700 transition"
                      onClick={() => alert('More features coming soon!')}
                    >
                      ⭐ Surprise Feature
                    </button>
                  </aside>
                </>
              )}
            </main>

            {/* Projects + Calendar Card Row (only for logged-in users) */}
            {user && (
              <div className="flex flex-col lg:flex-row w-full gap-6 mt-8">
                {/* Left: Projects Card */}
                <div className="flex-1 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Your Projects
                  </h2>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Add New Project
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                      <input
                        type="text"
                        placeholder="Project name"
                        className="w-full sm:w-1/3 p-2 border rounded bg-white dark:bg-gray-900"
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                      <input
                        type="date"
                        className="w-full sm:w-1/4 p-2 border rounded bg-white dark:bg-gray-900"
                        value={newProject.due}
                        onChange={(e) =>
                          setNewProject((p) => ({ ...p, due: e.target.value }))
                        }
                      />
                      <button
                        onClick={handleAddProject}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {projects.map((project) => {
                      const total = project.tasks.length
                      const done = project.tasks.filter((t) => t.done).length
                      const percent =
                        total === 0 ? 0 : Math.round((done / total) * 100)

                      return (
                        <div
                          key={project._id}
                          className="p-5 bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 space-y-3"
                        >
                          {/* Edit/Delete logic */}
                          {editingProjectId === project._id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                setProjects((prev) =>
                                  prev.map((p) =>
                                    p._id === project._id
                                      ? {
                                          ...p,
                                          name: editProjectData.name,
                                          due: editProjectData.due,
                                        }
                                      : p
                                  )
                                )
                                setEditingProjectId(null)
                              }}
                              className="space-y-2"
                            >
                              <input
                                type="text"
                                value={editProjectData.name}
                                onChange={(e) =>
                                  setEditProjectData((data) => ({
                                    ...data,
                                    name: e.target.value,
                                  }))
                                }
                                className="w-full p-2 border rounded"
                                placeholder="Project name"
                                autoFocus
                              />
                              <input
                                type="date"
                                value={editProjectData.due}
                                onChange={(e) =>
                                  setEditProjectData((data) => ({
                                    ...data,
                                    due: e.target.value,
                                  }))
                                }
                                className="w-full p-2 border rounded"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="px-3 py-1 bg-gray-300 rounded"
                                  onClick={() => setEditingProjectId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                    {project.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Due: {project.due}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {done}/{total} tasks
                                </span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    setEditingProjectId(project._id)
                                    setEditProjectData({
                                      name: project.name,
                                      due: project.due,
                                    })
                                  }}
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Delete this project?')) {
                                      setProjects((prev) =>
                                        prev.filter((p) => p._id !== project._id)
                                      )
                                    }
                                  }}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}

                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div
                              style={{ width: `${percent}%` }}
                              className="h-full bg-green-500 rounded-full"
                            />
                          </div>

                          {/* Add task to project */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault()
                              const form = e.target
                              const value = form.elements[
                                `task-${project._id}`
                              ].value.trim()
                              if (!value) return
                              const updated = projects.map((p) => {
                                if (p._id === project._id) {
                                  return {
                                    ...p,
                                    tasks: [...p.tasks, { title: value, done: false }],
                                  }
                                }
                                return p
                              })
                              setProjects(updated)
                              form.reset()
                            }}
                            className="space-y-2"
                          >
                            <input
                              type="text"
                              name={`task-${project._id}`}
                              placeholder="Add task..."
                              className="w-full p-2 rounded border bg-white dark:bg-gray-800"
                            />
                            <button
                              type="submit"
                              className="w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              + Add Task
                            </button>
                          </form>

                          <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                            {project.tasks.map((task, idx) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded"
                              >
                                <span
                                  className={
                                    task.done ? 'line-through text-gray-400' : ''
                                  }
                                >
                                  {task.title}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={task.done}
                                  onChange={() => {
                                    const updated = projects.map((p) => {
                                      if (p._id === project._id) {
                                        const newTasks = [...p.tasks]
                                        newTasks[idx].done = !newTasks[idx].done
                                        return { ...p, tasks: newTasks }
                                      }
                                      return p
                                    })
                                    setProjects(updated)
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                  {/* Productivity Chart & Learning Schedule below Projects */}
                  <ProductivityChart tasks={tasks} />
                  <LearningSchedule />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
