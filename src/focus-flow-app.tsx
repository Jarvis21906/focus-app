import { useState, useEffect, useRef } from 'react';
import { Volume2, X } from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

// Define types for tasks and categories
type TaskCategory = 'todo' | 'inProgress' | 'completed';
interface Task {
  id: number;
  text: string;
}

type SessionType = 'work' | 'study' | 'break' | 'exercise' | 'meditation';

const FocusFlowApp = () => {
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const intervalRef = useRef<number | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<{ [key in TaskCategory]: Task[] }>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : { todo: [], inProgress: [], completed: [] };
  });
  const [newTask, setNewTask] = useState('');

  // Binaural Beats State and Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(432);
  const [beatFreq, setBeatFreq] = useState(35);
  const [volume, setVolume] = useState(41);
  const leftOsc = useRef<OscillatorNode | null>(null);
  const rightOsc = useRef<OscillatorNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const unlockAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the unlock audio element
  useEffect(() => {
    // Create a silent audio element to help unlock audio on mobile
    const audio = new Audio();
    audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwPz8/Pz8/TU1NTU1NW1tbW1tbaGhoaGhoaHd3d3d3d4aGhoaGhpSUlJSUlKGhoaGhoa+vr6+vr7+/v7+/v8rKysrKytTU1NTU1N/f39/f3+7u7u7u7v///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAAHjOZTf9C//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTEFN//MUZAYAAAGkAAAAAAAAA0gAAAAARTEFN//MUZAkAAAGkAAAAAAAAA0gAAAAARTEFN//MUZAkAAAGkAAAAAAAAA0gAAAAARTEFN//MUZAkAAAGkAAAAAAAAA0gAAAAARTEFN';
    audio.loop = true;
    unlockAudioRef.current = audio;
    return () => {
      if (unlockAudioRef.current) {
        unlockAudioRef.current.pause();
        unlockAudioRef.current = null;
      }
    };
  }, []);

  // --- useEffects for Live Audio Updates ---
  useEffect(() => {
    if (isPlaying && leftOsc.current && rightOsc.current && audioContextRef.current) {
      const { currentTime } = audioContextRef.current;
      leftOsc.current.frequency.setValueAtTime(baseFreq, currentTime);
      rightOsc.current.frequency.setValueAtTime(baseFreq + beatFreq, currentTime);
    }
  }, [baseFreq, beatFreq, isPlaying]);

  useEffect(() => {
    if (isPlaying && masterGain.current && audioContextRef.current) {
      const { currentTime } = audioContextRef.current;
      const gainValue = (volume / 100) ** 2; // Logarithmic scaling
      masterGain.current.gain.setValueAtTime(gainValue, currentTime);
    }
  }, [volume, isPlaying]);

  // --- Timer Effect ---
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  // --- LocalStorage Effect for Tasks ---
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- All App Functions ---

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

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
      localStorage.setItem('tasks', JSON.stringify({ todo: [], inProgress: [], completed: [] }));
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sourceColId = source.droppableId as TaskCategory;
    const destColId = destination.droppableId as TaskCategory;
    const startCol = tasks[sourceColId];
    const finishCol = tasks[destColId];
    if (startCol === finishCol) {
      const newItems = Array.from(startCol);
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);
      setTasks((prev) => ({ ...prev, [sourceColId]: newItems }));
    } else {
      const startItems = Array.from(startCol);
      const [movedItem] = startItems.splice(source.index, 1);
      const finishItems = Array.from(finishCol);
      finishItems.splice(destination.index, 0, movedItem);
      setTasks((prev) => ({
        ...prev,
        [sourceColId]: startItems,
        [destColId]: finishItems,
      }));
    }
  };

  // A simpler, synchronous function to stop all audio and clean up.
  const stopAudio = () => {
    // Check if oscillators exist and are running, then stop them.
    if (leftOsc.current) {
      leftOsc.current.stop();
      leftOsc.current.disconnect();
      leftOsc.current = null;
    }
    if (rightOsc.current) {
      rightOsc.current.stop();
      rightOsc.current.disconnect();
      rightOsc.current = null;
    }
    // Disconnect the master gain to silence everything.
    if (masterGain.current) {
      masterGain.current.disconnect();
      masterGain.current = null;
    }
    // Set the state to reflect that audio is stopped.
    setIsPlaying(false);
  };

  // An async function specifically for starting the audio.
  const startAudio = async () => {
    // 1. Get or create the AudioContext.
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.error('Browser does not support Web Audio API');
        return;
      }
      audioContextRef.current = new AudioContext();
    }
    
    const ctx = audioContextRef.current;

    // 2. Forcefully resume the context if it's suspended. This is the key.
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // 3. DEFENSIVE CHECK: If the context is *still* not running after resume,
    // it means the browser blocked it. We cannot proceed.
    if (ctx.state !== 'running') {
      console.error('AudioContext could not be resumed. User interaction might be required.');
      return;
    }

    // 4. If we are here, the context is running. Now, build the audio graph.
    // Ensure everything is clean before we start.
    stopAudio();

    const gainValue = (volume / 100) ** 2;

    masterGain.current = ctx.createGain();
    masterGain.current.gain.setValueAtTime(gainValue, ctx.currentTime);
    masterGain.current.connect(ctx.destination);

    const merger = ctx.createChannelMerger(2);
    merger.connect(masterGain.current);

    leftOsc.current = ctx.createOscillator();
    leftOsc.current.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    const leftGain = ctx.createGain();
    leftGain.connect(merger, 0, 0);
    leftOsc.current.connect(leftGain);

    rightOsc.current = ctx.createOscillator();
    rightOsc.current.frequency.setValueAtTime(
      baseFreq + beatFreq,
      ctx.currentTime
    );
    const rightGain = ctx.createGain();
    rightGain.connect(merger, 0, 1);
    rightOsc.current.connect(rightGain);
    
    leftOsc.current.start();
    rightOsc.current.start();
    
    // 5. Finally, update the state.
    setIsPlaying(true);
  };

  // The main toggle function becomes a simple dispatcher.
  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold text-white">PomoMind</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Free online Pomodoro timer with task management and binaural beats. Perfect for deep work, study sessions, and ADHD focus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timer and Beats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <h2 className="text-gray-800 font-semibold text-lg">
                  Pomodoro Timer
                </h2>
              </div>
              <div className="text-center mb-8">
                <div className="w-40 h-40 mx-auto mb-6 relative">
                  <div className="w-full h-full border-8 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-purple-600 mb-1">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center mb-6">
                  <button
                    onClick={isRunning ? pauseTimer : startTimer}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    Reset
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="mb-1">Cycle 1 of 4</div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Work Session</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <label htmlFor="sessionType" className="text-sm text-gray-600 mb-2">
                      Session Type
                    </label>
                    <select
                      id="sessionType"
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value as SessionType)}
                      className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      aria-label="Select session type"
                    >
                      <option value="work">Work</option>
                      <option value="study">Study</option>
                      <option value="break">Break</option>
                      <option value="exercise">Exercise</option>
                      <option value="meditation">Meditation</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Volume2 size={16} className="text-white" />
                </div>
                <h2 className="text-gray-800 font-semibold text-lg">
                  Binaural Beats
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label htmlFor="baseFreq" className="text-sm text-gray-600 font-medium">
                      Base Frequency
                    </label>
                    <span className="text-sm text-gray-800 font-semibold">
                      {baseFreq} Hz
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="baseFreq"
                      type="range"
                      min="200"
                      max="800"
                      value={baseFreq}
                      onChange={(e) => setBaseFreq(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Base frequency in hertz"
                      aria-valuemin={200}
                      aria-valuemax={800}
                      aria-valuenow={baseFreq}
                    />
                    <div
                      className="absolute left-0 top-0 h-2 bg-purple-600 rounded-lg pointer-events-none"
                      style={{ width: `${((baseFreq - 200) / 600) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label htmlFor="beatFreq" className="text-sm text-gray-600 font-medium">
                      Beat Frequency
                    </label>
                    <span className="text-sm text-gray-800 font-semibold">
                      {beatFreq} Hz
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="beatFreq"
                      type="range"
                      min="1"
                      max="40"
                      value={beatFreq}
                      onChange={(e) => setBeatFreq(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Beat frequency in hertz"
                      aria-valuemin={1}
                      aria-valuemax={40}
                      aria-valuenow={beatFreq}
                    />
                    <div
                      className="absolute left-0 top-0 h-2 bg-purple-600 rounded-lg pointer-events-none"
                      style={{ width: `${((beatFreq - 1) / 39) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label htmlFor="volume" className="text-sm text-gray-600 font-medium">
                      Volume
                    </label>
                    <span className="text-sm text-gray-800 font-semibold">
                      {volume}%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="volume"
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                      aria-label="Volume percentage"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={volume}
                    />
                    <div
                      className="absolute left-0 top-0 h-2 bg-purple-600 rounded-lg pointer-events-none"
                      style={{ width: `${volume}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={toggleAudio}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Task Manager */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl h-full">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <h2 className="text-gray-800 font-semibold text-lg">
                    Task Manager
                  </h2>
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
                  <Droppable droppableId="todo">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-purple-100 rounded-2xl p-6 min-h-[200px]"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                          <h3 className="text-gray-800 font-semibold">To Do</h3>
                        </div>
                        <div className="space-y-3">
                          {tasks.todo.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 group transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-purple-500' : 'hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-800 text-sm font-medium">{task.text}</span>
                                    <button onClick={() => removeTask(task.id, 'todo')} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
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
                  <Droppable droppableId="inProgress">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-blue-50 rounded-2xl p-6 min-h-[200px]"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                          <h3 className="text-gray-800 font-semibold">In Progress</h3>
                        </div>
                        <div className="space-y-3">
                          {tasks.inProgress.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 group transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-purple-500' : 'hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-800 text-sm font-medium">{task.text}</span>
                                    <button onClick={() => removeTask(task.id, 'inProgress')} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
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
                  <Droppable droppableId="completed">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-green-50 rounded-2xl p-6 min-h-[200px]"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                          <h3 className="text-gray-800 font-semibold">Completed</h3>
                        </div>
                        <div className="space-y-3">
                          {tasks.completed.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 group transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-purple-500' : 'hover:shadow-md'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-800 text-sm font-medium line-through opacity-60">{task.text}</span>
                                    <button onClick={() => removeTask(task.id, 'completed')} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
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
                </div>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusFlowApp;