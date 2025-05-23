import { createContext, useContext } from 'react';

// TaskContext.jsx object itself which canb e used to provide task data and functions to components
export const TaskContext = createContext();

// A custom hooks that allows components to access the TaskContext
export function useTasks() {
  return useContext(TaskContext);
}
