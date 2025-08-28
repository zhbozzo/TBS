import React from 'react';
import ReactDOM from 'react-dom/client';
import GameContainer from './App';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

async function setupNativeUI() {
  if (!Capacitor.isNativePlatform()) return;
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

setupNativeUI();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GameContainer />
  </React.StrictMode>
);