import React from 'react';
import { requestATTIfNeeded, ensureConsent } from '../services/consent';
import { Keys, set } from '../services/storage';

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  const handleRequestATT = async () => {
    await requestATTIfNeeded();
  };

  const handleEnsureConsent = async () => {
    await ensureConsent();
  };

  const handleDeleteData = async () => {
    // Limpieza básica de claves no seguras; en producción, ampliar a todas las que apliquen
    await set(Keys.playerGold, '150');
    await set(Keys.unlockedUnitIds, '[]');
  };

  const handleRestorePurchases = async () => {
    // Stub para StoreKit
    alert('Restaurar compras pendiente de implementación.');
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-900 text-white">
      <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(1000px 500px at 50% -100px, rgba(59,130,246,0.12), transparent 60%)'}}/>
      <div className="w-full max-w-3xl mx-auto p-6">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.7)]"/>
              <div>
                <h1 className="text-3xl font-bold">Privacidad</h1>
                <p className="text-gray-400 text-sm">Gestiona consentimiento y datos</p>
              </div>
            </div>
            <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">Volver</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow" onClick={handleRequestATT}>Solicitar ATT</button>
            <button className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow" onClick={handleEnsureConsent}>Gestionar consentimiento</button>
            <button className="px-5 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold shadow" onClick={handleRestorePurchases}>Restaurar compras</button>
            <button className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow" onClick={handleDeleteData}>Borrar datos</button>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <a className="underline text-gray-300 hover:text-gray-100" href="/privacy.html" target="_blank" rel="noreferrer">Política de Privacidad</a>
            <a className="underline text-gray-300 hover:text-gray-100" href="/terms.html" target="_blank" rel="noreferrer">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;


