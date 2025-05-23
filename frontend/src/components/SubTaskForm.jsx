// SubTaskForm.jsx

// Form component for adding a new sub-task to a parent task. 
// Submits to backend and resets on success.
import { useState } from 'react';
import api from '../api';

export default function SubTaskForm({ parentId, onCreate }) {
  // State for the sub-task title input
  const [title, setTitle] = useState('');

  // Handle form submission: create sub-task via API, call onCreate, and reset input
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/tasks/${parentId}/subtasks`, { title });
      onCreate(data); // Notify parent of new sub-task
      setTitle('');   // Reset input
    } catch (err) {
      console.error('Failed to create subtask', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex space-x-2">
      {/* Sub-task title input */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="New sub-task"
        className="flex-1 p-1 border rounded"
        required
      />
      {/* Submit button */}
      <button type="submit" className="px-3 bg-green-500 text-white rounded">
        +
      </button>
    </form>
  );
}
