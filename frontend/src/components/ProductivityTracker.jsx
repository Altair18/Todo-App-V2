// ProductivityTracker.jsx
// Displays a line chart of completed tasks over the last 7 days, with summary stats.
// Uses react-chartjs-2 and Chart.js for visualization.

import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ProductivityTracker() {
  // Get tasks from context
  const { tasks } = useTasks();

  // Helper: Get local date string (no time)
  function getLocalDateString(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return d.toLocaleDateString();
  }

  // Prepare labels for the last 7 days (including today)
  const today = new Date();
  today.setHours(0,0,0,0);
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return getLocalDateString(d);
  });

  // Count completed tasks for each day in the last 7 days
  const completedData = labels.map(labelDate =>
    tasks.filter(t =>
      t.done &&
      t.dueDate &&
      getLocalDateString(new Date(t.dueDate)) === labelDate
    ).length
  );

  // Chart.js data object
  const data = {
    labels,
    datasets: [
      {
        label: 'Completed Tasks',
        data: completedData,
        fill: false,
        borderColor: '#3b82f6', // Tailwind blue-500
        backgroundColor: '#3b82f6',
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#22c55e', // Tailwind green-500
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  // Chart.js options for appearance and axes
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Completed: ${ctx.parsed.y}`
        }
      }
    },
    layout: {
      padding: { left: 0, right: 0, top: 0, bottom: 0 }
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 13, weight: 'bold' },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false
        },
        grid: { display: false },
      },
      y: { beginAtZero: true, ticks: { color: '#64748b' } }
    }
  };

  // Summary statistics
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;

  // Render chart and stats
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-6 border border-gray-200 dark:border-gray-700 w-full h-full">
      <h2 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-200">
        Productivity Tracker
      </h2>
      {/* Line chart for completed tasks */}
      <div className="w-full flex-1" style={{ height: '220px', minWidth: 0 }}>
        <Line data={data} options={options} />
      </div>
      {/* Summary stats below the chart */}
      <div className="flex flex-col gap-1 w-full mt-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-200">Total Tasks</span>
          <span className="font-bold text-gray-900 dark:text-white">{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-green-700 dark:text-green-400">Completed</span>
          <span className="font-bold text-green-600 dark:text-green-300">{completed}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-yellow-700 dark:text-yellow-400">Pending</span>
          <span className="font-bold text-yellow-600 dark:text-yellow-300">{pending}</span>
        </div>
      </div>
    </div>
  );
}
