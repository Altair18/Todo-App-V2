// TaskList.jsx
// Renders a paginated, animated list of tasks with create, edit, delete, and toggle-done functionality for both guest and logged-in users.
// Integrates with TaskForm and Modal, and supports framer-motion animations.
import React, { useState, useContext } from 'react'
import TaskForm from './TaskForm'
import Modal from './Modal'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'
import api from '../api'

export default function TaskList({
  tasks,
  loading,
  error,
  onCreate,
  onDelete,
  onToggleDone,
  onSaveEdit,
  onSelect,
  selectedTask,
  showForm,
  setShowForm
}) {
  const { user } = useContext(AuthContext)
  // State for editing a task
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    dueDate: '',
    labelsStr: ''
  })
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const tasksPerPage = 3
  const totalPages = Math.ceil(tasks.length / tasksPerPage)
  const paginatedTasks = tasks.slice(
    currentPage * tasksPerPage,
    currentPage * tasksPerPage + tasksPerPage
  )

  // Handle create task for both guest and logged-in users
  const handleCreate = async (task) => {
    if (!task.title) {
      alert('Task title is required');
      return;
    }
    if (!user) {
      // Guest: save to local state and localStorage
      const guestTask = { ...task, _id: crypto.randomUUID(), done: false }
      onCreate(guestTask)
      const guestTasks = JSON.parse(localStorage.getItem('tasks') || "[]")
      localStorage.setItem('tasks', JSON.stringify([guestTask, ...guestTasks]))
      return;
    }
    // Logged in: use backend
    try {
      const { data } = await api.post('/tasks', task);
      onCreate(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  // Handle delete for guest and logged-in
  const handleDelete = (id) => {
    if (!user) {
      const updated = tasks.filter(t => t._id !== id);
      onDelete(id);
      localStorage.setItem('tasks', JSON.stringify(updated));
      // Clear detail panel if deleted task was selected:
      if (selectedTask && selectedTask._id === id) onSelect(null);
      return;
    }
    onDelete(id);
    // Clear detail panel if deleted task was selected (for logged-in, after API):
    if (selectedTask && selectedTask._id === id) onSelect(null);
  }

  // Handle toggle done for guest and logged-in
  const handleToggleDone = (id, done) => {
    if (!user) {
      const updated = tasks.map(t => t._id === id ? { ...t, done } : t);
      onToggleDone(id, done);
      localStorage.setItem('tasks', JSON.stringify(updated));
      return;
    }
    onToggleDone(id, done);
  }

  // Show loading or error states
  if (loading) return <p>Loading…</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      {/* Task Create Modal (opens TaskForm in a modal) */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <TaskForm onCreate={t => {
            handleCreate(t);
            setShowForm(false)
          }} />
        </Modal>
      )}

      {/* Edit Task Modal (opens edit form in a modal) */}
      {editingId && (
        <Modal onClose={() => setEditingId(null)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSaveEdit(editingId, {
                title: editData.title,
                description: editData.description,
                dueDate: editData.dueDate,
                labels: editData.labelsStr.split(',').map(l => l.trim()).filter(Boolean)
              });
              setEditingId(null);
            }}
            className="space-y-4 p-2"
          >
            {/* Edit Task Fields */}
            <h2 className="text-lg font-bold mb-2">Edit Task</h2>
            <input
              type="text"
              className="w-full p-2 border rounded dark:text-black"
              placeholder="Title"
              value={editData.title}
              onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
              required
            />
            <textarea
              className="w-full p-2 border rounded dark:text-black"
              placeholder="Description"
              value={editData.description}
              onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
            />
            <input
              type="date"
              className="w-full p-2 border rounded dark:text-black"
              value={editData.dueDate}
              onChange={e => setEditData(d => ({ ...d, dueDate: e.target.value }))}
            />
            <input
              type="text"
              className="w-full p-2 border rounded dark:text-black"
              placeholder="Labels (comma separated)"
              value={editData.labelsStr}
              onChange={e => setEditData(d => ({ ...d, labelsStr: e.target.value }))}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task List (paginated, animated) */}
      <AnimatePresence>
        {tasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No tasks yet.</p>
        ) : (
          <ul className="space-y-3">
            {paginatedTasks.map(task => (
              <motion.li
                key={task._id}
                className="relative p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                onClick={() => onSelect?.(task)}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Task Content: title, description, due date, labels */}
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1 overflow-hidden">
                        {task.description}
                      </p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                        Due: <span className="font-medium">{task.dueDate}</span>
                      </p>
                    )}
                    {/* Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.labels?.map(label => (
                        <span
                          key={label}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Priority badge */}
                  {task.priority && (
                    <span
                      className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium
      ${task.priority === 'high' ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'}`}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                  )}
                  {/* Actions: checkbox, edit, delete */}
                  <div className="flex flex-col items-end justify-between gap-2 min-w-[60px]">
                    {/* Toggle done checkbox */}
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleToggleDone(task._id, !task.done)
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 cursor-pointer"
                    />

                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingId(task._id)
                        setEditData({
                          title: task.title,
                          description: task.description || '',
                          dueDate: task.dueDate?.slice(0, 10) || '',
                          labelsStr: (task.labels || []).join(', ')
                        })
                      }}
                      className="text-xs text-blue-500 hover:text-blue-600 transition"
                    >
                      ✎ Edit
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(task._id)
                      }}
                      className="text-xs text-red-400 hover:text-red-500 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </AnimatePresence>
    </div>
  )
}
