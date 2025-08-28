import React from 'react';
import { VsIcon } from '../components/Icons';

interface LocalBattleSetupScreenProps {
  onSelectMode: (mode: 'open' | 'private') => void;
  onBack: () => void;
}

const LocalBattleSetupScreen: React.FC<LocalBattleSetupScreenProps> = ({ onSelectMode, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <header className="absolute top-6 left-6">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all duration-200 bg-gray-600 hover:bg-gray-500 text-white"
        >
          &larr; Main Menu
        </button>
      </header>
      
      <div className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-yellow-400 tracking-wider">Local Battle Setup</h1>
        <p className="text-gray-400 mt-2 text-lg">Choose your battle style.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <MenuButton
          title="Open Mode"
          description="Both players deploy their armies at the same time, with full visibility."
          icon={<VsIcon className="w-16 h-16 text-blue-400" />}
          onClick={() => onSelectMode('open')}
        />
        <MenuButton
          title="Private Mode"
          description="Players deploy their armies in secret, one after the other."
          icon={<VsIcon className="w-16 h-16 text-purple-400" />}
          onClick={() => onSelectMode('private')}
        />
      </div>
    </div>
  );
};

interface MenuButtonProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="bg-gray-800/50 border-2 border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center w-80
                   hover:border-yellow-500 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10 group"
    >
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
            {icon}
        </div>
        <h2 className="text-3xl font-bold text-blue-300 mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
    </button>
);

export default LocalBattleSetupScreen;
