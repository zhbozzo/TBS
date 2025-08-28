import React, { useState, useEffect } from 'react';
import { initAudio, playSound } from '../services/audioService';
import { DragonIcon, VsIcon, GearIcon, StoreIcon, GoldIcon, PlusIcon } from '../components/Icons';
import TutorialOverlay, { type HighlightCoordinates } from '../components/TutorialOverlay';
import { FULL_TUTORIAL_STEPS } from '../tutorial';

interface MainMenuScreenProps {
  onSelectLevels: () => void;
  onSelectLocalBattle: () => void;
  onGoToStore: () => void;
  onGoToGetGold: () => void;
  playerGold: number;
  onOpenConfig: () => void;
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
  onSkipTutorial: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onSelectLevels, onSelectLocalBattle, onGoToStore, onGoToGetGold, playerGold, onOpenConfig, tutorialStep, setTutorialStep, onSkipTutorial }) => {
  const [highlightCoords, setHighlightCoords] = useState<HighlightCoordinates>(null);
  
  const currentTutorialStep = FULL_TUTORIAL_STEPS[tutorialStep];
  const showTutorial = currentTutorialStep?.screen === 'main_menu';

  useEffect(() => {
    if (showTutorial && currentTutorialStep.highlightTarget) {
      // Use a timeout to ensure the element is rendered and positioned
      setTimeout(() => {
        const element = document.querySelector(`[data-tutorial-id="${currentTutorialStep.highlightTarget}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, shape: 'rect' });
        }
      }, 50);
    } else {
      setHighlightCoords(null);
    }
  }, [showTutorial, currentTutorialStep]);

  const handleTutorialNext = () => {
    if (showTutorial && currentTutorialStep.nextButton) {
      setTutorialStep(tutorialStep + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-yellow-400 tracking-wider" style={{textShadow: '0 0 15px rgba(250, 204, 21, 0.4)'}}>
            Tiny Battle Simulator
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Strategize. Deploy. Dominate.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <MenuButton
          title="Campaign"
          description="Test your might across challenging levels."
          icon={<DragonIcon className="w-16 h-16 text-red-500" />}
          onClick={onSelectLevels}
          data-tutorial-id="campaign-button"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        />
        <MenuButton
          title="Local Battle"
          description="Challenge a friend on the same device."
          icon={<VsIcon className="w-16 h-16 text-blue-400" />}
          onClick={onSelectLocalBattle}
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        />
        <MenuButton
          title="Unit Store"
          description="Unlock powerful new troops for your army."
          icon={<StoreIcon className="w-16 h-16 text-purple-400" />}
          onClick={onGoToStore}
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        />
      </div>

      <div className="absolute top-6 left-6 flex items-center gap-2">
         <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
             <GoldIcon className="w-8 h-8" />
             <span className="text-3xl font-bold text-yellow-300 ml-3">{playerGold}</span>
         </div>
         <button onClick={onGoToGetGold} className="bg-green-500 hover:bg-green-400 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-400">
             <PlusIcon className="w-6 h-6" />
         </button>
      </div>

      <button
        onClick={onOpenConfig}
        className="absolute top-6 right-6 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-transform duration-300 hover:rotate-45 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        aria-label="Settings"
        onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
      >
        <GearIcon className="w-8 h-8 text-gray-400" />
      </button>

      {showTutorial && (
        <TutorialOverlay
            step={tutorialStep}
            content={{ ...currentTutorialStep, highlight: highlightCoords }}
            onNext={handleTutorialNext}
            onSkip={onSkipTutorial}
        />
      )}
    </div>
  );
};

interface MenuButtonProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    'data-tutorial-id'?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, description, icon, onClick, 'data-tutorial-id': dataTutorialId }) => (
    <button
        onClick={onClick}
        className="bg-gray-800/50 border-2 border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center w-72
                   hover:border-yellow-500 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 group"
        data-tutorial-id={dataTutorialId}
    >
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
            {icon}
        </div>
        <h2 className="text-3xl font-bold text-blue-300 mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
    </button>
);


export default MainMenuScreen;