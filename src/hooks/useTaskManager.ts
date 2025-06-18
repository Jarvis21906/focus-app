import { useState, useEffect } from 'react';
import { type DropResult } from '@hello-pangea/dnd';

// Define types for tasks and categories
export type TaskCategory = 'todo' | 'inProgress' | 'completed';
export interface Task {
  id: number;
  text: string;
}

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<{ [key in TaskCategory]: Task[] }>(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : { todo: [], inProgress: [], completed: [] };
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
      return { todo: [], inProgress: [], completed: [] };
    }
  });

  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj: Task = { id: Date.now(), text: newTask.trim() };
      setTasks((prev) => ({ ...prev, todo: [newTaskObj, ...prev.todo] }));
      setNewTask('');
    }
  };

  const removeTask = (taskId: number, category: TaskCategory) => {
    setTasks((prev) => ({
      ...prev,
      [category]: prev[category].filter((task) => task.id !== taskId),
    }));
  };

  const clearAllTasks = () => {
    if (window.confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
      setTasks({ todo: [], inProgress: [], completed: [] });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColId = source.droppableId as TaskCategory;
    const destColId = destination.droppableId as TaskCategory;
    const startCol = [...tasks[sourceColId]];
    const [movedItem] = startCol.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      startCol.splice(destination.index, 0, movedItem);
      setTasks((prev) => ({ ...prev, [sourceColId]: startCol }));
    } else {
      const finishCol = [...tasks[destColId]];
      finishCol.splice(destination.index, 0, movedItem);
      setTasks((prev) => ({
        ...prev,
        [sourceColId]: startCol,
        [destColId]: finishCol,
      }));
    }
  };

  return {
    tasks,
    newTask,
    setNewTask,
    addTask,
    removeTask,
    clearAllTasks,
    onDragEnd,
  };
};