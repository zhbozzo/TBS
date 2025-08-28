
import React, { useState } from 'react';
import { initAudio, playSound } from '../services/audioService';
import type { Team as TeamEnum } from '../types';
import { Team } from '../types';
import { PlayCircleIcon, GoldIcon } from './Icons';

interface GameOverModalProps {
  winner: TeamEnum | null;
  onTryAgain: () => void;
  onTryAgainWithBoost?: () => void;
  onExit: () => void;
  onNextLevel?: () => void;
  onClaimBonusReward?: () => void;
  reward?: number;
  nextLevelUnlocked?: boolean;
  isLocal?: boolean;
  levelId?: number;
  levelName?: string;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onTryAgain, onTryAgainWithBoost, onExit, onNextLevel, onClaimBonusReward, reward, nextLevelUnlocked, isLocal = false, levelId, levelName }) => {
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(reward || 0);

  if (winner === null && !isLocal) return null; // In local, a draw (null winner) is a valid end state

  const isVictory = winner === Team.Blue;
  let winnerText = '';
  let winnerColor = '';
  let descriptionText = '';

  if (isLocal) {
    winnerText = winner === null ? 'Draw!' : `${isVictory ? 'Blue' : 'Red'} Team Wins!`;
    winnerColor = winner === null ? 'text-yellow-400' : isVictory ? 'text-blue-400' : 'text-red-400';
    descriptionText = 'A hard-fought battle! Ready for another round?';
  } else {
    winnerText = isVictory ? 'Victory!' : 'Defeat!';
    winnerColor = isVictory ? 'text-blue-400' : 'text-red-400';
    descriptionText = isVictory
      ? `You gained ${reward || 0} Gold for your triumph!`
      : 'The enemy forces overwhelmed your army. Adjust your strategy and try again!';
  }
  
  const handleClaimBonus = () => {
    onClaimBonusReward?.();
    setBonusClaimed(true);
    if (reward) {
        setDisplayAmount(reward * 3);
    }
  };

  const primaryButtonClasses = "px-6 py-3 rounded-lg text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
  const exitButtonClasses = `bg-gray-600 hover:bg-gray-500 text-white ${primaryButtonClasses}`;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center flex flex-col items-center animate-fade-in-up">
        <h2 className={`text-6xl font-extrabold mb-2 ${winnerColor}`}>{winnerText}</h2>
        {isVictory && !isLocal && (
          <p className="text-xl text-gray-200 mb-4">
            Level {levelId ?? ''}{levelName ? `: ${levelName}` : ''} completed
          </p>
        )}
        
        {isVictory && !isLocal ? (
             <p className="text-lg text-gray-300 mb-8 max-w-md flex items-center justify-center flex-wrap gap-x-1.5">
                <span>You gained</span>
                <span className="inline-flex items-center gap-1 font-bold text-yellow-300">
                    <GoldIcon className="w-6 h-6" />
                    <span>{displayAmount}</span>
                </span>
                <span>Gold for your triumph!</span>
            </p>
        ) : (
            <p className="text-lg text-gray-300 mb-8 max-w-md">{descriptionText}</p>
        )}

        <div className="flex flex-col items-center space-y-4 w-full">
            {isVictory && !isLocal && onClaimBonusReward && !bonusClaimed && (
                 <button onClick={handleClaimBonus} className={`w-full max-w-sm bg-yellow-400 hover:bg-yellow-300 text-gray-900 ${primaryButtonClasses} animate-pulse-slow flex items-center justify-center gap-3`}>
                    Claim x3 Reward!
                    <PlayCircleIcon className="w-7 h-7" />
                </button>
            )}
            <div className="flex items-center space-x-4">
                {isLocal ? (
                     <>
                        <button onClick={onTryAgain} className={`bg-blue-600 hover:bg-blue-500 text-white ${primaryButtonClasses}`}>
                            Rematch
                        </button>
                        <button onClick={onExit} className={exitButtonClasses}>
                            Exit
                        </button>
                    </>
                ) : isVictory ? (
                    <div className="flex items-center space-x-4">
                        <button onClick={() => { if(nextLevelUnlocked){ initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); onNextLevel?.(); } }} disabled={!nextLevelUnlocked} className={`bg-green-600 hover:bg-green-500 text-white ${primaryButtonClasses}`}>
                            Next Level
                        </button>
                        <button onClick={onTryAgain} className={`bg-blue-600 hover:bg-blue-500 text-white ${primaryButtonClasses}`}>
                            Retry Level
                        </button>
                        <button onClick={onExit} className={exitButtonClasses} data-tutorial-id="exit-button-victory">
                            Exit
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex items-center gap-4">
                          <button onClick={onTryAgain} className={`bg-blue-600 hover:bg-blue-500 text-white ${primaryButtonClasses}`}>
                              Try Again
                          </button>
                          <button onClick={onExit} className={exitButtonClasses}>
                              Exit
                          </button>
                        </div>
                        {onTryAgainWithBoost && (
                          <button onClick={onTryAgainWithBoost} className={`w-full max-w-sm bg-cyan-400 hover:bg-cyan-300 text-gray-900 ${primaryButtonClasses} flex items-center justify-center gap-3`}>
                              Watch Ad to Retry +40 Energy
                              <PlayCircleIcon className="w-7 h-7" />
                          </button>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes pulse-slow-key {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow-key 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GameOverModal;
