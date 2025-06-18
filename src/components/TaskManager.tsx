import { X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTaskManager } from '../hooks/useTaskManager';
import type { TaskCategory } from '../hooks/useTaskManager';

const Column = ({ category, tasks, removeTask }: { category: {id: TaskCategory, title: string}, tasks: any[], removeTask: (id: number, cat: TaskCategory) => void }) => (
  <Droppable droppableId={category.id}>
    {(provided) => (
      <div
        {...provided.droppableProps}
        ref={provided.innerRef}
        className={`${
          category.id === 'todo' 
            ? 'bg-purple-100' 
            : category.id === 'inProgress' 
              ? 'bg-blue-50' 
              : 'bg-green-50'
        } rounded-2xl p-6 min-h-[200px]`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-4 h-4 rounded-full ${
            category.id === 'todo' 
              ? 'bg-red-400' 
              : category.id === 'inProgress' 
                ? 'bg-yellow-400' 
                : 'bg-green-400'
          }`}></div>
          <h3 className="text-gray-800 font-semibold">{category.title}</h3>
        </div>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-gray-800 text-sm font-medium ${category.id === 'completed' ? 'line-through opacity-60' : ''}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => removeTask(task.id, category.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      </div>
    )}
  </Droppable>
);

export const TaskManager = () => {
  const { tasks, newTask, setNewTask, addTask, removeTask, clearAllTasks, onDragEnd } = useTaskManager();
  
  const categories: {id: TaskCategory, title: string}[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
  ];

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h2 className="text-gray-800 font-semibold text-lg">Task Manager</h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <input
            type="text"
            placeholder="Add new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="px-4 py-2 bg-gray-50 text-gray-800 placeholder-gray-500 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 w-full sm:w-auto"
          />
          <button
            onClick={addTask}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-md"
          >
            Add
          </button>
          <button
            onClick={clearAllTasks}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-md"
          >
            Clear All
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <Column key={cat.id} category={cat} tasks={tasks[cat.id]} removeTask={removeTask} />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};