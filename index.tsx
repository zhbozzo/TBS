import React from 'react';
import ReactDOM from 'react-dom/client';
import GameContainer from './App';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { migrateStateOnce } from './src/migrateState';
import './index.css';

async function setupNativeUI() {
  if (!Capacitor.isNativePlatform()) return;

  // First, migrate state if needed.
  await migrateStateOnce();

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch {}
  try {
    await StatusBar.setBackgroundColor({ color: '#000000' });
  } catch {}
  try {
    await Keyboard.setResizeMode({ mode: 'none' });
  } catch {}
}

setupNativeUI().catch((e) => console.error('[BOOT setupNativeUI error]', e));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  console.log('[BOOT] React mounting...');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GameContainer />
    </React.StrictMode>
  );
  console.log('[BOOT] React mounted');
} catch (e) {
  console.error('[BOOT React error]', e);
}