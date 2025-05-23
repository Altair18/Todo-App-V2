// src/components/TaskForm.jsx

// TaskForm is a controlled form component for creating new tasks.
// It collects title, description, due date, labels, and priority, then calls onCreate with the new task object.
import { useState } from 'react';

export default function TaskForm({ onCreate }) {
  // State for each form field
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labelsStr, setLabelsStr] = useState('');
  const [priority, setPriority] = useState('medium');

  // Handle form submission
  const handleSubmit = e => {
    e.preventDefault();

    // dueDate is already in "YYYY-MM-DD" format from the input
    const labels = labelsStr
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    if (!title) {
      alert("Task title is required!");
      return;
    }

    // Build the new task object
    const task = {
      title,
      description,
      dueDate: dueDate || undefined, // "YYYY-MM-DD" string or undefined
      labels,
      priority,
      done: false, // ensure new tasks are not done by default
    };

    onCreate(task);

    // Reset form fields after submit
    setTitle('');
    setDescription('');
    setDueDate('');
    setLabelsStr('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded space-y-4 dark:text-white">
      <h2 className="text-lg font-medium">New Task</h2>

      {/* Title input (required) */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-2 border rounded dark:text-black"
        required
      />

      {/* Description input */}
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full p-2 border rounded dark:text-black"
      />

      {/* Due Date input */}
      <input
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        className="w-full p-2 border rounded dark:text-black"
      />

      {/* Labels input (comma-separated) */}
      <input
        type="text"
        value={labelsStr}
        onChange={e => setLabelsStr(e.target.value)}
        placeholder="Labels (comma-separated)"
        className="w-full p-2 border rounded dark:text-black"
      />

      {/* Priority select */}
      <div>
        <label className="block mb-1 text-sm font-medium">Priority</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="w-full p-2 border rounded dark:text-black"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Task
      </button>
    </form>
  );
}
