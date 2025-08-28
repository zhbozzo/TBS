
import React from 'react';
import { initAudio, playSound } from '../services/audioService';

interface PauseModalProps {
  onResume: () => void;
  onTryAgain: () => void;
  onOpenConfig: () => void;
  onExit: () => void;
}

const PauseModal: React.FC<PauseModalProps> = ({ onResume, onTryAgain, onOpenConfig, onExit }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 animate-fade-in">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center flex flex-col items-center space-y-5 animate-scale-in">
        <h2 className="text-5xl font-extrabold text-white mb-4">Paused</h2>
        
        <button
          onClick={onResume}
          className="w-64 px-8 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-green-600 hover:bg-green-500 text-white"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        >
         Resume
        </button>

        <button
          onClick={onTryAgain}
          className="w-64 px-8 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-blue-600 hover:bg-blue-500 text-white"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        >
         Try Again
        </button>

        <button
          onClick={onOpenConfig}
          className="w-64 px-8 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-purple-600 hover:bg-purple-500 text-white"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        >
         Settings
        </button>

         <button
          onClick={onExit}
          className="w-64 px-8 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-gray-600 hover:bg-gray-500 text-white"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        >
         Exit to Menu
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PauseModal;
