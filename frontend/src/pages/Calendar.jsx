//Calendar.jsx
// src/pages/Calendar.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTasks } from '../context/TaskContext';
import { Link } from 'react-router-dom'; // <-- Add this import

//Displays a month view calendar with days marked when tasks are due
// Clicking on a day shows a modal with tasks due on that day
export default function CalendarPage() {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Find tasks due on selectedDate
  const tasksForDate = tasks.filter(t => {
    if (!t.dueDate) return false;
    // Use local date string for comparison to avoid timezone issues
    const taskDate = new Date(t.dueDate);
    const selected = selectedDate;
    return (
      taskDate.getFullYear() === selected.getFullYear() &&
      taskDate.getMonth() === selected.getMonth() &&
      taskDate.getDate() === selected.getDate()
    );
  });

  const handleDayClick = date => {
    setSelectedDate(date);
    // Use local date comparison
    const hasTask = tasks.some(t => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
    if (hasTask) setShowModal(true);
  };

  // --- Upcoming tasks logic ---
  const today = new Date().toISOString().slice(0, 10);
  const upcomingTasks = tasks
    .filter(t =>
      t.dueDate &&
      t.dueDate.slice(0, 10) >= today &&
      !t.done
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // Soonest first

  // --- All-in-one drawer grouping ---
  const todayStr = today;
  const todayTasks = tasks
    .filter(t => t.dueDate && t.dueDate.slice(0, 10) === todayStr && !t.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcomingTasksDrawer = tasks
    .filter(t => t.dueDate && t.dueDate.slice(0, 10) > todayStr && !t.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const completedTasks = tasks
    .filter(t => t.done)
    .sort((a, b) => (a.dueDate?.localeCompare?.(b.dueDate) ?? 0));

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Force calendar numbers/dates to black */}
      <style>
        {`
          .react-calendar__tile,
          .react-calendar__month-view__days__day,
          .react-calendar__month-view__weekdays__weekday,
          .react-calendar__navigation button {
            color: #111 !important;
          }
        `}
      </style>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-900 dark:text-blue-200 tracking-tight">
        📅 Calendar
      </h1>
      {/* Toggle Button for Drawer */}
      <button
        onClick={() => setShowAllTasks(true)}
        className="fixed right-8 top-24 z-50 px-6 py-2 rounded-full bg-blue-600 text-white shadow-lg font-semibold hover:bg-blue-700 transition border border-blue-700/10 focus:outline-none focus:ring-2 focus:ring-blue-300"
        style={{ fontSize: '1rem', letterSpacing: '0.01em' }}
      >
        Show All Tasks
      </button>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Calendar + daily tasks */}
        <div className="md:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col items-center">
                <Calendar
                  onClickDay={handleDayClick}
                  value={selectedDate}
                  tileContent={({ date, view }) => {
                    if (view === 'month') {
                      const hasTask = tasks.some(t => {
                        if (!t.dueDate) return false;
                        const taskDate = new Date(t.dueDate);
                        return (
                          taskDate.getFullYear() === date.getFullYear() &&
                          taskDate.getMonth() === date.getMonth() &&
                          taskDate.getDate() === date.getDate()
                        );
                      });
                      return hasTask ? (
                        <div className="flex justify-center">
                          <span className="w-2 h-2 mt-1 rounded-full bg-blue-500 block"></span>
                        </div>
                      ) : null;
                    }
                    return null;
                  }}
                />
              </div>
              <Link
                to="/dashboard"
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white shadow-md font-semibold hover:bg-green-700 transition border border-green-700/10 focus:outline-none focus:ring-2 focus:ring-green-300"
                style={{ fontSize: '1rem', letterSpacing: '0.01em' }}
              >
                <span>🏠</span> Dashboard
              </Link>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col">
              <h2 className="text-2xl font-bold mb-2 text-blue-800 dark:text-blue-200">Tasks for {selectedDate.toLocaleDateString()}</h2>
              <div className="mb-2 text-gray-500 dark:text-gray-400 text-sm">
                {tasksForDate.length === 0 ? "No tasks due on this date." : `${tasksForDate.length} task${tasksForDate.length > 1 ? 's' : ''}`}
              </div>
              <ul className="space-y-2">
                {tasksForDate.map(task => (
                  <li
                    key={task._id}
                    className="flex justify-between items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <span className="truncate">{task.title}</span>
                    <span className={`ml-2 text-xs font-medium rounded-full px-3 py-1 ${task.done
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"}`}
                      style={{ minWidth: 60, textAlign: 'center' }}
                    >
                      {task.done ? "Done" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Upcoming tasks panel */}
        <aside className="md:col-span-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200 tracking-tight">
            Upcoming Tasks
          </h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming tasks.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.map(task => (
                <li
                  key={task._id}
                  className="flex justify-between items-center px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold truncate">{task.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <span className={`ml-2 text-xs font-medium rounded-full px-3 py-1 ${task.done
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"}`}
                    style={{ minWidth: 60, textAlign: 'center' }}
                  >
                    {task.done ? "Done" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
      {/* Drawer Panel for All Tasks */}
      {showAllTasks && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowAllTasks(false)}
          ></div>
          {/* Drawer */}
          <aside className="relative w-full sm:w-[400px] bg-white dark:bg-gray-900 h-full p-8 overflow-y-auto shadow-2xl border-l border-gray-200 dark:border-gray-800 rounded-l-2xl flex flex-col">
            <button
              className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500"
              onClick={() => setShowAllTasks(false)}
            >&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">All Tasks</h2>
            {/* TODAY */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Today</h3>
              {todayTasks.length === 0 ? (
                <p className="text-gray-400 text-sm">No tasks for today.</p>
              ) : (
                <ul className="space-y-2">
                  {todayTasks.map(task => (
                    <li key={task._id} className="flex justify-between items-center px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900/40 shadow-sm">
                      <span className="truncate">{task.title}</span>
                      <span className="text-xs bg-green-100 text-green-700 font-medium rounded-full px-3 py-1 ml-2">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* UPCOMING */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-200 mb-3">Upcoming</h3>
              {upcomingTasksDrawer.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming tasks.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasksDrawer.map(task => (
                    <li key={task._id} className="flex justify-between items-center px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                      <span className="truncate">{task.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 font-medium rounded-full px-3 py-1 ml-2">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* COMPLETED */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Completed</h3>
              {completedTasks.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed tasks yet.</p>
              ) : (
                <ul className="space-y-2">
                  {completedTasks.map(task => (
                    <li key={task._id} className="flex justify-between items-center px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <span className="line-through truncate">{task.title}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 font-medium rounded-full px-3 py-1 ml-2">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full relative border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-red-500"
            >&times;</button>
            <h2 className="text-xl font-bold mb-3 text-blue-800 dark:text-blue-200">
              Tasks for {selectedDate.toLocaleDateString()}
            </h2>
            <ul className="space-y-2">
              {tasks
                .filter(t => {
                  if (!t.dueDate) return false;
                  const taskDate = new Date(t.dueDate);
                  const selected = selectedDate;
                  return (
                    taskDate.getFullYear() === selected.getFullYear() &&
                    taskDate.getMonth() === selected.getMonth() &&
                    taskDate.getDate() === selected.getDate()
                  );
                })
                .map(task => (
                  <li
                    key={task._id}
                    className="flex justify-between items-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <span className="truncate">{task.title}</span>
                    <span className={`ml-2 text-xs font-medium rounded-full px-3 py-1 ${task.done
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"}`}
                      style={{ minWidth: 60, textAlign: 'center' }}
                    >
                      {task.done ? "Done" : "Pending"}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}