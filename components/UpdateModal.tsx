import React from 'react';
import { initAudio, playSound } from '../services/audioService';
import { CloseIcon, BombardinoCrocodiloIcon } from './Icons';

interface UpdateModalProps {
  onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ onClose }) => {
  return (
    <div 
        className="fixed top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] bottom-[env(safe-area-inset-bottom)] left-[env(safe-area-inset-left)] bg-black/70 flex items-center justify-center z-[2000] animate-fade-in"
        onClick={onClose}
    >
      <div
        className="bg-gray-800 w-[min(100dvw-32px,42rem)] max-w-none p-4 md:p-6 rounded-2xl shadow-2xl border-2 border-purple-500/50 relative flex flex-col items-center animate-scale-in mx-auto max-h-[calc(100dvh-32px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors"
          aria-label="Close update notes"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="bg-purple-500/20 p-3 rounded-full mb-3 ring-4 ring-purple-500/30">
            <BombardinoCrocodiloIcon className="w-14 h-14 text-purple-300" />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-yellow-300 mb-2 text-center">¡Evento Brainrot!</h2>
        <p className="text-base md:text-lg text-gray-400 mb-4 text-center">¡Nuevas y extrañas fuerzas llegan al campo de batalla!</p>

        <div className="bg-gray-900/50 w-full p-3 md:p-4 rounded-lg text-left space-y-2">
            <h3 className="text-lg md:text-xl font-bold text-white border-b border-gray-600 pb-2 mb-2">Lista de Cambios:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm md:text-base">
                <li>
                    <span className="font-semibold text-purple-400">¡Nueva Ruleta Brainrot!:</span> ¡Prueba tu suerte en la Tienda para ganar oro o desbloquear unidades exclusivas!
                </li>
                <li>
                    <span className="font-semibold text-purple-400">3 Nuevas Unidades "Brainrot":</span>
                    <ul className="list-disc list-inside ml-4 mt-1 text-gray-400 text-xs md:text-sm">
                        <li>Tuc Tuc Tuc Sahur</li>
                        <li>Tralalero Tralala</li>
                        <li>Bombardino Crocodilo</li>
                    </ul>
                </li>
            </ul>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2.5 rounded-lg text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 bg-purple-600 hover:bg-purple-500 text-white"
          onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
        >
         ¡A Luchar!
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

export default UpdateModal;
