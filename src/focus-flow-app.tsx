import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

const FocusFlowApp = () => {
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(23 * 60 + 56); // 23:56 to match screenshot
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);

  // Tasks State
  const [tasks, setTasks] = useState({
    todo: [{ id: 1, text: 'Review morning emails' }],
    inProgress: [{ id: 2, text: 'Prepare presentation' }],
    completed: [{ id: 3, text: 'Call with team' }],
  });
  const [newTask, setNewTask] = useState('');

  // Binaural Beats State
  const [audioContext, setAudioContext] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseFreq, setBaseFreq] = useState(526);
  const [beatFreq, setBeatFreq] = useState(9);
  const [volume, setVolume] = useState(41);
  const oscillators = useRef([]);
  const gainNode = useRef(null);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Timer Controls
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  // Task Management
  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj = {
        id: Date.now(),
        text: newTask.trim(),
      };
      setTasks((prev) => ({
        ...prev,
        todo: [...prev.todo, newTaskObj],
      }));
      setNewTask('');
    }
  };

  const removeTask = (taskId, category) => {
    setTasks((prev) => ({
      ...prev,
      [category]: prev[category].filter((task) => task.id !== taskId),
    }));
  };

  // Binaural Beats Audio
  const initAudio = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);

      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();
      const merger = ctx.createChannelMerger(2);
      const masterGain = ctx.createGain();

      leftOsc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      rightOsc.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(masterGain);
      masterGain.connect(ctx.destination);

      leftGain.gain.setValueAtTime((volume / 100) * 0.1, ctx.currentTime);
      rightGain.gain.setValueAtTime((volume / 100) * 0.1, ctx.currentTime);
      masterGain.gain.setValueAtTime(0.5, ctx.currentTime);

      oscillators.current = [leftOsc, rightOsc];
      gainNode.current = masterGain;

      leftOsc.start(ctx.currentTime);
      rightOsc.start(ctx.currentTime);

      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioContext && oscillators.current.length > 0) {
      oscillators.current.forEach((osc) => osc.stop());
      oscillators.current = [];
      setAudioContext(null);
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      initAudio();
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
            <h1 className="text-4xl font-bold text-white">Focus Flow</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Boost your productivity with Pomodoro and Binaural Beats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Timer and Beats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pomodoro Timer */}
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
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-1">
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center mb-6">
                  <button
                    onClick={isRunning ? pauseTimer : startTimer}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    Continue
                  </button>
                  <button
                    onClick={pauseTimer}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors shadow-md"
                  >
                    Pause
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
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Work Session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Binaural Beats */}
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
                    <label className="text-sm text-gray-600 font-medium">
                      Base Frequency
                    </label>
                    <span className="text-sm text-gray-800 font-semibold">
                      {baseFreq} Hz
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="200"
                      max="800"
                      value={baseFreq}
                      onChange={(e) => setBaseFreq(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div
                      className="absolute left-0 top-0 h-2 bg-purple-600 rounded-lg pointer-events-none"
                      style={{ width: `${((baseFreq - 200) / 600) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-gray-600 font-medium">
                      Beat Frequency
                    </label>
                    <span className="text-sm text-gray-800 font-semibold">
                      {beatFreq} Hz
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={beatFreq}
                      onChange={(e) => setBeatFreq(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div
                      className="absolute left-0 top-0 h-2 bg-purple-600 rounded-lg pointer-events-none"
                      style={{ width: `${((beatFreq - 1) / 39) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm text-gray-600 font-medium">
                      Volume
                    </label>
                    <span className="text-sm text-gray-800 font-semibold">
                      {volume}%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
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
                  <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors shadow-md">
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Task Manager */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <h2 className="text-gray-800 font-semibold text-lg">
                    Task Manager
                  </h2>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Add new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="px-4 py-2 bg-gray-50 text-gray-800 placeholder-gray-500 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                  <button
                    onClick={addTask}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-md"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-96">
                {/* To Do */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <h3 className="text-gray-800 font-semibold">To Do</h3>
                  </div>
                  <div className="space-y-3">
                    {tasks.todo.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 text-sm font-medium">
                            {task.text}
                          </span>
                          <button
                            onClick={() => removeTask(task.id, 'todo')}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <h3 className="text-gray-800 font-semibold">In Progress</h3>
                  </div>
                  <div className="space-y-3">
                    {tasks.inProgress.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 text-sm font-medium">
                            {task.text}
                          </span>
                          <button
                            onClick={() => removeTask(task.id, 'inProgress')}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed */}
                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    <h3 className="text-gray-800 font-semibold">Completed</h3>
                  </div>
                  <div className="space-y-3">
                    {tasks.completed.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 text-sm font-medium line-through opacity-60">
                            {task.text}
                          </span>
                          <button
                            onClick={() => removeTask(task.id, 'completed')}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusFlowApp;
