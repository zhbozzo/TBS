import { Capacitor } from '@capacitor/core';
import { AppTrackingTransparency } from 'capacitor-plugin-app-tracking-transparency';
import { Keys, get, set } from './storage';

export async function requestATTIfNeeded(): Promise<void> {
  if (Capacitor.getPlatform() !== 'ios') return;
  try {
    const status = await AppTrackingTransparency.getStatus();
    if (status.status === 'notDetermined') {
      await AppTrackingTransparency.requestPermission({ ios14AppTrackingTransparencyText: 'Usamos tu IDFA solo para anuncios relevantes y medición. No vendemos tus datos.' });
    }
  } catch {}
}

export type ConsentDecision = 'granted' | 'denied' | 'unknown';

export async function ensureConsent(): Promise<void> {
  // En producción integrar UMP SDK. Aquí persistimos una decisión mínima.
  const existing = await get(Keys.consentDecision);
  if (!existing) {
    await set(Keys.consentDecision, 'granted');
  }
}


