//ProductivityPanel.jsx
// src/components/ProductivityPanel.jsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTasks } from '../context/TaskContext';
import { Bar } from 'react-chartjs-2';
import Modal from './Modal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    return <Bar ref={chartRef} {...props} />;
});

export default function ProductivityPanel() {
    const { tasks } = useTasks();
    const [showModal, setShowModal] = useState(false);
    // Chart data for the last 7 days
    const today = new Date();
    const labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d.toLocaleDateString();
    });
    const data = {
        labels,
        datasets: [{
            label: 'Tasks Completed',
            data: labels.map(labelDate => {
                return tasks.filter(t =>
                    t.done &&
                    new Date(t.updatedAt || t.completedAt || t.dueDate || t.createdAt).toLocaleDateString() === labelDate
                ).length;
            }),
            backgroundColor: 'rgba(59,130,246,0.5)', // Tailwind blue-500/50
        }]
    };
    const options = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: '#64748b' } }
        }
    };
    // Unique id for modal chart
    const [modalChartId, setModalChartId] = useState(null);
    const openModal = () => {
        setModalChartId('panel-chart-modal-' + Date.now());
        setShowModal(true);
    };
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center h-full gap-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-200">
                Productivity Overview
            </h2>
            <div className="w-full">
                <ChartErrorBoundary>
                    <ChartWithCleanup
                        data={data}
                        options={options}
                    />
                </ChartErrorBoundary>
            </div>
            <button
                onClick={openModal}
                className="mt-6 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
            >
                Show Detailed Progress
            </button>
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <div className="p-4">
                        <h3 className="text-xl font-bold mb-2">Your Progress</h3>
                        <ChartErrorBoundary>
                            <ChartWithCleanup
                                data={data}
                                options={options}
                            />
                        </ChartErrorBoundary>
                        <ul className="mb-4 mt-4">
                            <li>Total Tasks: <b>{tasks.length}</b></li>
                            <li>Completed: <b>{tasks.filter(t => t.done).length}</b></li>
                            <li>Pending: <b>{tasks.filter(t => !t.done).length}</b></li>
                        </ul>
                        <button
                            className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
