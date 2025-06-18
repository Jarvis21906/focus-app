import { Volume2 } from 'lucide-react';
import { useBinauralBeats } from '../hooks/useBinauralBeats';

export const BinauralBeats = () => {
  const {
    isPlaying,
    baseFreq,
    beatFreq,
    volume,
    setBaseFreq,
    setBeatFreq,
    setVolume,
    toggleAudio
  } = useBinauralBeats();

  return (
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
  );
};