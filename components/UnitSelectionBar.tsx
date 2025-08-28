import React, { useState } from 'react';
import { initAudio, playSound } from '../services/audioService';
import type { UnitType } from '../types';
import UnitCard from './UnitCard';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface UnitSelectionBarProps {
  unitTypes: UnitType[];
  onSelectUnit: (unitType: UnitType) => void;
  selectedUnitTypeId: string | null;
  budget: number | null; // Allow null for unlimited budget scenarios
  isTutorialMode?: boolean;
}

const UnitSelectionBar: React.FC<UnitSelectionBarProps> = ({ unitTypes, onSelectUnit, selectedUnitTypeId, budget, isTutorialMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`relative w-full transition-transform duration-300 ease-in-out pointer-events-none ${
        isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'
      }`}
    >
      <div className="w-full flex justify-center pointer-events-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gray-800/80 backdrop-blur-sm px-6 py-1 rounded-t-lg border-t-2 border-x-2 border-gray-600/50 hover:bg-gray-700/80"
          aria-label={isExpanded ? 'Collapse unit selection' : 'Expand unit selection'}
          onMouseDown={() => { initAudio(); playSound('ui-click.wav', 0.5); }}
        >
          {isExpanded ? <ChevronDownIcon className="w-6 h-6 text-yellow-400" /> : <ChevronUpIcon className="w-6 h-6 text-yellow-400" />}
        </button>
      </div>

      <div 
        style={{ background: 'linear-gradient(to top, rgba(10, 15, 25, 0.9) 0%, rgba(10, 15, 25, 0.7) 50%, transparent 100%)' }}
        className="pt-12 pb-6 px-4 pointer-events-none"
      >
        <div className="flex items-center gap-3 overflow-x-auto py-4 pointer-events-auto">
            {unitTypes.map(unitType => (
              <UnitCard
                key={unitType.id}
                unitType={unitType}
                onSelect={() => onSelectUnit(unitType)}
                isSelected={selectedUnitTypeId === unitType.id}
                canAfford={budget === null || budget >= unitType.cost}
                tutorialId={isTutorialMode ? `unit-card-${unitType.id}` : undefined}
              />
            ))}
        </div>
      </div>
       <style>{`
        /* Custom scrollbar for webkit browsers */
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background-color: rgba(250, 204, 21, 0.5); /* yellow-400 with opacity */
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background-color: rgba(250, 204, 21, 0.8);
        }
      `}</style>
    </div>
  );
};

export default UnitSelectionBar;
