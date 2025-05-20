import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useContext, useState } from 'react'
import { ThemeContext } from './context/ThemeContext'
import { TaskContext } from './context/TaskContext'

import Dashboard from './pages/Dashboard'
import Login from './components/Login';
import Register from './components/Register';
import ProjectPage from './pages/ProjectPage'
import CalendarPage from './pages/Calendar';
import StatsPage from './pages/StatsPage';

export default function App() {
  const { user, loading } = useContext(AuthContext)
  const { dark, setDark } = useContext(ThemeContext)
  const [tasks, setTasks] = useState([]) // Only one source of truth
  const [showSettings, setShowSettings] = useState(false)

  console.log("Auth user:", user); // Debug: see what user is

  if (loading) return <div className="p-4">Loading…</div>

  return (
    <main className={`
      min-h-screen bg-white text-gray-900 
      dark:bg-gray-900 dark:text-gray-100
      transition-colors
    `}>
      <TaskContext.Provider value={{ tasks, setTasks }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/project/:id" element={user ? <ProjectPage /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
          <Route path="/stats" element={user ? <StatsPage /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </TaskContext.Provider>
      {/* Settings Cog Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        onClick={() => setShowSettings(true)}
        aria-label="Open settings"
      >
        <span role="img" aria-label="settings">⚙️</span>
      </button>
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-xs w-full p-8 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl"
              onClick={() => setShowSettings(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Settings</h2>
            <div className="flex flex-col gap-4 w-full">
              <button
                className="w-full px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => {
                  setDark(!dark)
                }}
              >
                Toggle {dark ? 'Light' : 'Dark'} Mode
              </button>
              {/* Add more settings here if needed */}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
