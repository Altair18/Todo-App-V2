import { useState } from 'react';

// Just an array to help with day-of-week selection
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function LearningSchedule({ onAddToCalendar }) {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({
    title: '',
    targetDate: '',
    subtopics: '',
    daysOfWeek: [], // e.g. ['Mon', 'Wed', 'Fri']
  });

  // Handler: Add a new main "topic" (with optional subtopics).
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopic.title.trim()) return;

    // Convert subtopics from comma-separated into array objects
    const subtopicArray = newTopic.subtopics
      ? newTopic.subtopics.split(',').map((s, i) => ({
          id: i + 1,
          title: s.trim(),
          done: false,
        }))
      : [];

    // For day-of-week (time blocks)
    const scheduleDays = newTopic.daysOfWeek || [];

    const newItem = {
      id: Date.now(), // simple unique ID
      title: newTopic.title.trim(),
      targetDate: newTopic.targetDate, // optional date
      daysOfWeek: scheduleDays,        // array like ['Mon','Wed','Fri']
      subtopics: subtopicArray,
    };

    setTopics((prev) => [...prev, newItem]);
    setNewTopic({ title: '', targetDate: '', subtopics: '', daysOfWeek: [] });

    // (3) Example "calendar integration":
    // If you want to push an event for the overall topic to a global calendar,
    // call onAddToCalendar with appropriate data, if provided:
    if (onAddToCalendar && newItem.targetDate) {
      onAddToCalendar({
        title: `Study: ${newItem.title}`,
        date: newItem.targetDate,
      });
    }
  };

  // Toggle a subtopic's completion
  const toggleSubtopic = (topicId, subId) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic;
        return {
          ...topic,
          subtopics: topic.subtopics.map((st) =>
            st.id === subId ? { ...st, done: !st.done } : st
          ),
        };
      })
    );
  };

  // Remove a topic entirely
  const removeTopic = (topicId) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  // Compute progress percentage for each topic
  const getProgress = (topic) => {
    const total = topic.subtopics.length;
    const done = topic.subtopics.filter((st) => st.done).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  // Toggle or set day-of-week for the new topic form
  const handleDayToggle = (day) => {
    setNewTopic((prev) => {
      const hasDay = prev.daysOfWeek.includes(day);
      if (hasDay) {
        return {
          ...prev,
          daysOfWeek: prev.daysOfWeek.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          daysOfWeek: [...prev.daysOfWeek, day],
        };
      }
    });
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Learning Schedule
      </h3>

      {/* ADD NEW TOPIC FORM */}
      <form onSubmit={handleAddTopic} className="space-y-3 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Topic Title
          </label>
          <input
            type="text"
            placeholder="e.g. Learn React Hooks"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            className="border p-2 rounded w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Completion Date (optional)
          </label>
          <input
            type="date"
            value={newTopic.targetDate}
            onChange={(e) => setNewTopic({ ...newTopic, targetDate: e.target.value })}
            className="border p-2 rounded w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Subtopics (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Intro to Hooks, useState, useEffect"
            value={newTopic.subtopics}
            onChange={(e) => setNewTopic({ ...newTopic, subtopics: e.target.value })}
            className="border p-2 rounded w-full dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Recurring Days (Time Blocks)
          </label>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((day) => {
              const active = newTopic.daysOfWeek.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={
                    'px-3 py-1 rounded border text-sm ' +
                    (active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100')
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Add Topic
        </button>
      </form>

      {/* TOPICS LIST */}
      {topics.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No learning topics scheduled yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {topics.map((topic) => {
            const progress = getProgress(topic);
            return (
              <li
                key={topic.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg dark:text-gray-100">
                      {topic.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Target Date:{' '}
                      {topic.targetDate
                        ? new Date(topic.targetDate).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTopic(topic.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>

                {/* TIME BLOCKS DISPLAY */}
                {topic.daysOfWeek && topic.daysOfWeek.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium uppercase text-gray-600 dark:text-gray-300">
                      Recurring:
                    </span>{' '}
                    {topic.daysOfWeek.join(', ')}
                  </div>
                )}

                {/* PROGRESS BAR */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded mb-3">
                  <div
                    className="bg-green-500 h-full rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  {progress}% complete
                </p>

                {/* SUBTOPICS */}
                <ul className="space-y-2 text-sm">
                  {topic.subtopics.map((st) => (
                    <li
                      key={st.id}
                      className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => toggleSubtopic(topic.id, st.id)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <span
                        className={st.done ? 'line-through text-gray-400' : ''}
                      >
                        {st.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      {/* OVERALL STATS (optional) */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
        <p>
          Total Topics: <b>{topics.length}</b>
        </p>
        <p>
          Overall Subtopics: <b>
            {topics.reduce((acc, t) => acc + t.subtopics.length, 0)}
          </b>
        </p>
        <p>
          Overall Completed:{' '}
          <b>
            {topics.reduce(
              (acc, t) => acc + t.subtopics.filter((st) => st.done).length,
              0
            )}
          </b>
        </p>
      </div>
    </div>
  );
}
