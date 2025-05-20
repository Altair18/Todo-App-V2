import { createContext, useContext } from 'react';

export const TaskContext = createContext();

export function useTasks() {
  return useContext(TaskContext);
}
