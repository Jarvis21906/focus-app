import { Bell } from 'lucide-react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import type { SessionType } from '../hooks/usePomodoroTimer';

export const PomodoroTimer = () => {
  const {
    timeLeft,
    isRunning,
    sessionType,
    setSessionType,
    notificationPermission,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime,
    requestNotificationPermission,
  } = usePomodoroTimer();

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
        <h2 className="text-gray-800 font-semibold text-lg">Pomodoro Timer</h2>
      </div>
      <div className="text-center mb-8">
        <div className="w-40 h-40 mx-auto mb-6 relative">
          <div className="w-full h-full border-8 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">{formatTime(timeLeft)}</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center mb-6">
          <button onClick={isRunning ? pauseTimer : startTimer} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md">
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors shadow-md">
            Reset
          </button>
        </div>
        <div className="text-sm text-gray-600">
          <div className="mb-1">Cycle 1 of 4</div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Work Session</span>
          </div>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as SessionType)}
            className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          >
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="break">Break</option>
            <option value="exercise">Exercise</option>
            <option value="meditation">Meditation</option>
          </select>
        </div>
      </div>
      {notificationPermission === 'default' && (
        <div className="text-center -mt-4">
          <button onClick={requestNotificationPermission} className="text-xs text-purple-500 hover:text-purple-700 underline flex items-center justify-center gap-1 mx-auto">
            <Bell size={12} />
            Enable notifications for timer alerts
          </button>
        </div>
      )}
    </div>
  );
};