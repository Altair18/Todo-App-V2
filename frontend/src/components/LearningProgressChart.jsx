import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// COLORS for chart slices
const COLORS = [
  '#34d399', // green
  '#60a5fa', // blue
  '#fbbf24', // yellow
  '#f87171', // red
  '#a78bfa', // purple
  '#f472b6', // pink
  '#38bdf8', // sky
];

// Receives topics array [{title, subtopics: [{done}], ...}]
export default function LearningProgressChart({ topics }) {
  // Prepare data: each topic is a slice, value = % complete
  const data = topics.map((topic) => {
    const total = topic.subtopics.length;
    const done = topic.subtopics.filter((st) => st.done).length;
    return {
      name: topic.title,
      value: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  if (!topics.length) return null;

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <h4 className="font-semibold text-center mb-2 text-blue-700 dark:text-blue-200">Learning Progress</h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            fill="#34d399"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v}% complete`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
