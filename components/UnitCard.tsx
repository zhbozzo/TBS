import React from 'react';
import { initAudio, playSound } from '../services/audioService';
import type { UnitType } from '../types';

interface UnitCardProps {
  unitType: UnitType;
  onSelect: () => void;
  isSelected: boolean;
  canAfford: boolean;
  tutorialId?: string;
}

const UnitCard: React.FC<UnitCardProps> = ({ unitType, onSelect, isSelected, canAfford, tutorialId }) => {
  const baseClasses = 'flex-shrink-0 w-24 p-2 rounded-lg shadow-md cursor-pointer transition-all duration-200 border-2 bg-gray-800/80';
  const selectedClasses = 'border-yellow-400 scale-105 bg-blue-900/90 shadow-lg';
  const notSelectedClasses = 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/80';
  const unaffordableClasses = 'opacity-50 cursor-not-allowed grayscale';

  return (
    <div
      onClick={canAfford ? onSelect : undefined}
      onMouseDown={() => { if (canAfford) { initAudio(); playSound('ui-click.wav', 0.5); } }}
      className={`${baseClasses} ${isSelected ? selectedClasses : notSelectedClasses} ${!canAfford ? unaffordableClasses : ''} flex flex-col items-center text-center`}
      aria-label={`${unitType.name} - Cost: ${unitType.cost}`}
      role="button"
      data-tutorial-id={tutorialId}
    >
      <div className={`text-blue-300 ${!canAfford && 'text-gray-400'} h-7 w-7 flex items-center justify-center`}>
        {React.createElement(unitType.icon, {className: "w-6 h-6"})}
      </div>
      <h3 className="mt-1 font-bold text-xs leading-tight">{unitType.name}</h3>
      <p className="text-yellow-400 font-semibold text-xs mt-0.5">${unitType.cost}</p>
    </div>
  );
};

export default UnitCard;
