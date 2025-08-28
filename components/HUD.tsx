
import React from 'react';
import type { GameState as GameStateEnum } from '../types';
import { GameState } from '../types';

interface HUDProps {
  budget: number;
  unitCount: number;
  levelName: string;
  onStart: () => void;
  onSpeedChange: (speed: number) => void;
  speed: number;
  gameState: GameStateEnum;
  onBack: () => void;
  onPause: () => void;
  // For local battle
  isLocal?: boolean;
  budgetRed?: number;
  unitCountRed?: number;
}

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
    </svg>
)

const HUD: React.FC<HUDProps> = ({ budget, unitCount, levelName, onStart, onSpeedChange, speed, gameState, onBack, onPause, isLocal = false, budgetRed, unitCountRed }) => {
  const buttonBaseClasses = "px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const primaryButtonClasses = `bg-green-600 hover:bg-green-500 text-white ${buttonBaseClasses}`;
  const secondaryButtonClasses = `bg-yellow-600 hover:bg-yellow-500 text-white ${buttonBaseClasses}`;
  const disabledButtonClasses = `bg-gray-600 text-gray-400 cursor-not-allowed ${buttonBaseClasses}`;

  return (
    <div className="fixed top-[env(safe-area-inset-top)] left-[env(safe-area-inset-left)] right-[env(safe-area-inset-right)] p-4 flex justify-between items-center bg-gray-800/80 rounded-b-xl shadow-lg z-10">
      <div className="flex items-center space-x-6">
         <button onClick={onBack} className={secondaryButtonClasses + " px-4 py-1 text-base"}>
          &larr; {isLocal ? 'Menu' : 'Levels'}
        </button>
        <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-gray-400">LEVEL</span>
            <span className="text-xl font-bold">{levelName}</span>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-blue-400">BLUE TEAM</span>
              <span className="text-2xl font-bold">{isLocal ? `$${budget}` : budget}</span>
              <span className="text-xs text-gray-400">{unitCount} Units</span>
            </div>
            {isLocal && (
                <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-red-400">RED TEAM</span>
                    <span className="text-2xl font-bold">${budgetRed}</span>
                    <span className="text-xs text-gray-400">{unitCountRed} Units</span>
                </div>
            )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {gameState === GameState.Simulation && (
            <>
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => onSpeedChange(s)}
                    className={`px-3 py-1 rounded ${speed === s ? 'bg-blue-600' : 'bg-transparent hover:bg-gray-600'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <button onClick={onPause} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
                <PauseIcon />
              </button>
            </>
        )}
        <button
          onClick={onStart}
          disabled={gameState !== GameState.Deployment}
          className={gameState === GameState.Deployment ? primaryButtonClasses : disabledButtonClasses}
        >
          Simulate
        </button>
      </div>
    </div>
  );
};

export default HUD;
