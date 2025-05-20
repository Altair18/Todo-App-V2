// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useContext, useState } from 'react'
import { ThemeContext } from './context/ThemeContext'
import { TaskContext } from './context/TaskContext'

import Dashboard from './pages/Dashboard'
import Login from './components/Login';      // Make sure it's the right path
import Register from './components/Register';
import ProjectPage from './pages/ProjectPage'
import CalendarPage from './pages/Calendar';
import StatsPage from './pages/StatsPage';

export default function App() {
  const { user, loading } = useContext(AuthContext)
  const { dark, setDark } = useContext(ThemeContext)
  const [tasks, setTasks] = useState([]) // Only one source of truth

  if (loading) return <div className="p-4">Loading…</div>

  return (
    <main className={`
      min-h-screen bg-white text-gray-900 
      dark:bg-gray-900 dark:text-gray-100
      transition-colors
    `}>
      <TaskContext.Provider value={{ tasks, setTasks }}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={user ? '/dashboard' : '/login'} />}
          />


          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/calendar"
            element={<CalendarPage />}
          />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </TaskContext.Provider>
    </main>
  );
}
