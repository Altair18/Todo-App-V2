// ProductivityPanel.jsx

// Displays a weekly productivity line chart and summary stats for completed, pending, and total tasks. Handles chart errors 
// gracefully and cleans up Chart.js instances.

// src/components/ProductivityPanel.jsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTasks } from '../context/TaskContext';
import { Line } from 'react-chartjs-2';

import { // Chart.js imports
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend); // Register Chart.js components

// ErrorBoundary for chart errors
function ChartErrorBoundary({ children }) {
    const [error, setError] = useState(null);
    if (error) {
        return <div className="text-red-500">Chart error: {error.message}</div>;
    }
    return (
        <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
    );
}

class ErrorCatcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        if (this.props.onError) this.props.onError(error);
    }
    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

// Chart.js cleanup wrapper for both panel and modal
const ChartWithCleanup = forwardRef((props, ref) => {
    const chartRef = useRef();
    useImperativeHandle(ref, () => ({
        getChart: () => chartRef.current && chartRef.current.getChart && chartRef.current.getChart()
    }));
    useEffect(() => {
        return () => {
            if (chartRef.current && chartRef.current.getChart) {
                const chart = chartRef.current.getChart();
                if (chart) {
                    chart.destroy();
                }
            }
        };
    }, []);
    return <Line ref={chartRef} {...props} />;
});

export default function ProductivityPanel() {
    const { tasks } = useTasks();
    // Chart data for the next 7 days (today + 6 days)
    function getLocalDateString(date) {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return d.toLocaleDateString();
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return getLocalDateString(d);
    });
    // Count completed tasks for each day
    const completedData = labels.map(labelDate =>
        tasks.filter(t =>
            t.done &&
            t.dueDate &&
            getLocalDateString(new Date(t.dueDate)) === labelDate
        ).length
    );
    // Chart.js data and options
    const data = {
        labels,
        datasets: [
            {
                label: 'Completed Tasks',
                data: completedData,
                fill: false,
                borderColor: '#3b82f6', //  blue
                backgroundColor: '#3b82f6',
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#22c55e', // green
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };
    const options = { // Chart.js options
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => `Completed: ${ctx.parsed.y}`
                }
            }
        },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: '#64748b' } }
        }
    };
    // Summary stats
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = tasks.filter(t => !t.done).length;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center h-full gap-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-200">
                Productivity This Week
            </h2>
            <div className="w-full">
                {/* Chart with error boundary */}
                <ChartErrorBoundary>
                    <Line data={data} options={options} />
                </ChartErrorBoundary>
            </div>
            {/* Summary stats: total, completed, pending */}
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
