import { useTasks } from '../context/TaskContext';

export default function StatsPage() {
  const { tasks } = useTasks();
  const completed = tasks.filter(t => t.done).length;
  const pending = tasks.filter(t => !t.done).length;
  const percent = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8 flex flex-col items-center">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 border border-green-300 dark:border-green-700 mt-16">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-700 dark:text-green-300">📊 Your Task Stats</h1>
        <ul className="mb-8 space-y-4 text-xl">
          <li>
            <span className="font-semibold">Total Tasks:</span>
            <span className="float-right text-blue-600 dark:text-blue-300">{tasks.length}</span>
          </li>
          <li>
            <span className="font-semibold">Completed:</span>
            <span className="float-right text-green-600 dark:text-green-300">{completed}</span>
          </li>
          <li>
            <span className="font-semibold">Pending:</span>
            <span className="float-right text-yellow-500 dark:text-yellow-200">{pending}</span>
          </li>
          <li>
            <span className="font-semibold">Completion %:</span>
            <span className="float-right text-indigo-700 dark:text-indigo-300">{percent}%</span>
          </li>
        </ul>
        {/* Progress Bar */}
        <div className="w-full mb-6">
          <div className="w-full h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
              style={{
                width: `${percent}%`
              }}
            ></div>
          </div>
        </div>
        {/* You can add more charts or details here */}
        <div className="flex justify-center mt-8">
          <a href="/" className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold shadow hover:bg-green-700 transition">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
