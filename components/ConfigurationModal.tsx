
import React, { useRef, useEffect } from 'react';
import { initAudio, playSound, setMasterVolume } from '../services/audioService';
import type { GameSettings } from '../types';
import { GearIcon } from './Icons';

interface ConfigurationModalProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ settings, onSettingsChange, onClose, onOpenPrivacy }) => {
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

  const handleVolumeChange = (type: keyof GameSettings, value: number) => {
    onSettingsChange({ ...settings, [type]: value });
    // Aplicar inmediatamente al motor de audio
    setMasterVolume(type === 'musicVolume' ? 'music' : 'sfx', value);
  };

  return (
    <div className="fixed top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] bottom-[env(safe-area-inset-bottom)] left-[env(safe-area-inset-left)] bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-gray-800 w-[min(100dvw-32px,56rem)] max-w-none p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-700 text-center flex flex-col items-center animate-scale-in mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
            <GearIcon className="w-10 h-10 text-yellow-400" />
            <h2 className="text-4xl font-extrabold text-white">Settings</h2>
        </div>

        <div className="w-full space-y-6">
            <VolumeSlider
                label="Music Volume"
                value={settings.musicVolume}
                onChange={(value) => handleVolumeChange('musicVolume', value)}
            />
            <VolumeSlider
                label="Sound Effects Volume"
                value={settings.sfxVolume}
                onChange={(value) => handleVolumeChange('sfxVolume', value)}
            />
            {onOpenPrivacy && (
              <button
                onClick={onOpenPrivacy}
                onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
                className="w-full mt-2 px-4 py-2 rounded-lg text-base font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Privacidad
              </button>
            )}
        </div>
        
        <button
          onClick={onClose}
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
          className="mt-8 px-8 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-yellow-600 hover:bg-yellow-500 text-white"
        >
         Done
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

interface VolumeSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ label, value, onChange }) => {
    const percentage = value * 100;
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <label className="text-lg text-gray-300">{label}</label>
                <span className="text-lg font-bold text-yellow-300 bg-gray-700 px-3 py-1 rounded-md">{Math.round(percentage)}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                style={{
                    background: `linear-gradient(to right, #a78bfa ${percentage}%, #4b5563 ${percentage}%)`
                }}
            />
        </div>
    );
}

export default ConfigurationModal;
