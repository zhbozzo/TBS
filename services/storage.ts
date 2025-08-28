import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const SECURE_NAMESPACE = 'tbs_secure';
const MIGRATION_FLAG = 'migration_done_v1';

export const Keys = {
  playerGold: 'playerGold',
  unlockedUnitIds: 'unlockedUnitIds',
  highestLevelUnlocked: 'highestLevelUnlocked',
  highestWorldUnlocked: 'highestWorldUnlocked',
  tutorialStep: 'tutorialStep',
  gameSettings: 'gameSettings',
  dailyRewardState: 'dailyRewardState',
  adsWatchedState: 'adsWatchedState',
  adsForSpinsWatchedState: 'adsForSpinsWatchedState',
  isAdFree: 'isAdFree',
  unlockedSpellIds: 'unlockedSpellIds',
  // Secure
  purchases: 'purchases',
  consentDecision: 'consentDecision',
} as const;

export async function get(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key });
  return value ?? null;
}

export async function set(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

export async function getNum(key: string, def = 0): Promise<number> {
  const v = await get(key);
  const n = v !== null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : def;
}

export async function getBool(key: string, def = false): Promise<boolean> {
  const v = await get(key);
  if (v === null) return def;
  return v === 'true';
}

export async function getJSON<T>(key: string, def: T): Promise<T> {
  const v = await get(key);
  if (!v) return def;
  try { return JSON.parse(v) as T; } catch { return def; }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await set(key, JSON.stringify(value));
}

export async function setSecure(key: string, value: string): Promise<void> {
  try {
    await SecureStoragePlugin.set({
      key: `${SECURE_NAMESPACE}_${key}`,
      value,
    });
  } catch {}
}

export async function getSecure(key: string): Promise<string | null> {
  try {
    const result = await SecureStoragePlugin.get({ key: `${SECURE_NAMESPACE}_${key}` });
    return result?.value ?? null;
  } catch {
    return null;
  }
}

export async function migrateFromLocalStorageOnce(): Promise<void> {
  const already = await get(MIGRATION_FLAG);
  if (already === 'true') return;

  try {
    const entries: Array<[string, (v: string) => Promise<void>]> = [
      [Keys.playerGold, (v) => set(Keys.playerGold, v)],
      [Keys.unlockedUnitIds, (v) => set(Keys.unlockedUnitIds, v)],
      [Keys.unlockedSpellIds, (v) => set(Keys.unlockedSpellIds, v)],
      [Keys.highestLevelUnlocked, (v) => set(Keys.highestLevelUnlocked, v)],
      [Keys.highestWorldUnlocked, (v) => set(Keys.highestWorldUnlocked, v)],
      [Keys.tutorialStep, (v) => set(Keys.tutorialStep, v)],
      [Keys.gameSettings, (v) => set(Keys.gameSettings, v)],
      [Keys.dailyRewardState, (v) => set(Keys.dailyRewardState, v)],
      [Keys.adsWatchedState, (v) => set(Keys.adsWatchedState, v)],
      [Keys.adsForSpinsWatchedState, (v) => set(Keys.adsForSpinsWatchedState, v)],
      [Keys.isAdFree, (v) => set(Keys.isAdFree, v)],
    ];

    for (const [k, writer] of entries) {
      const v = localStorage.getItem(k);
      if (v !== null) await writer(v);
    }

    await set(MIGRATION_FLAG, 'true');
  } catch {
    // ignore
  }
}


