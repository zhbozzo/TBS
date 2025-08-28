import React, { useRef, useEffect } from 'react';
import type { UnitType } from '../types';
import type { RoulettePrize } from '../App';
import { GoldIcon } from './Icons';

interface RouletteResultModalProps {
  result: RoulettePrize | null;
  onClose: () => void;
  allUnits: UnitType[];
}

const RouletteResultModal: React.FC<RouletteResultModalProps> = ({ result, onClose, allUnits }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  if (!result) return null;

  const isUnit = result.type === 'unit';
  const unitInfo = isUnit ? allUnits.find(u => u.id === result.id) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl border-2 border-purple-500 text-center flex flex-col items-center animate-scale-in"
      >
        <h2 className="text-3xl font-extrabold text-yellow-300 mb-4">
            {isUnit ? "New Unit Unlocked!" : "You Won Gold!"}
        </h2>
        
        <div className="my-6 w-48 h-48 bg-gray-900/50 rounded-full flex items-center justify-center border-4 border-purple-400/50 shadow-lg">
            {isUnit && unitInfo ? 
                React.createElement(unitInfo.icon, { className: 'w-32 h-32 text-purple-300 animate-pulse-slow' }) :
                <GoldIcon className="w-32 h-32 animate-pulse-slow" />
            }
        </div>
        {isUnit && (
             <p className="text-4xl font-bold text-white">{result.name}</p>
        )}
        {result.type === 'gold' && (
             <p className="text-4xl font-bold text-yellow-300">{result.amount} Gold</p>
        )}
        
        <button
          onClick={onClose}
          className="mt-8 px-10 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-purple-600 hover:bg-purple-500 text-white"
        >
         Awesome!
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
          from { opacity: 0; transform: scale(0.9) rotate(-5deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-scale-in {
            animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
         @keyframes pulse-slow-key {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow-key 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default RouletteResultModal;