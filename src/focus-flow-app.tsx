import { PomodoroTimer } from './components/PomodoroTimer';
import { BinauralBeats } from './components/BinauralBeats';
import { TaskManager } from './components/TaskManager';

const FocusFlowApp = () => {
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
            Free online Pomodoro timer with task management and binaural beats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <PomodoroTimer />
            <BinauralBeats />
          </div>

          {/* Right Column */}
          <TaskManager />
        </div>
      </div>
    </div>
  );
};

export default FocusFlowApp;