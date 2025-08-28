import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

// This is the key we'll use to check if the migration has already been performed.
const MIGRATION_FLAG_KEY = 'cap_migrated_v1';

/**
 * A list of keys that we know are used in the application.
 * This serves as documentation and can be used for more targeted migrations in the future.
 * The migration logic itself will sweep ALL keys from localStorage to be safe.
 */
const KNOWN_LOCALSTORAGE_KEYS = [
  'playerGold',
  'unlockedUnitIds',
  'highestLevelUnlocked',
  'unlockedSpellIds',
  'highestWorldUnlocked',
  'tutorialStep',
  'gameSettings',
  'dailyRewardState',
  'adsWatchedState',
  'adsForSpinsWatchedState',
  'isAdFree', // This key is also stored in SecureStorage for anti-tampering.
];

/**
 * Migrates all data from localStorage to Capacitor Preferences and SecureStorage.
 * This function will only run once. It checks for a flag in Preferences,
 * and if the flag is present, it will not run again.
 */
export async function migrateStateOnce() {
  try {
    const { value } = await Preferences.get({ key: MIGRATION_FLAG_KEY });
    if (value === '1') {
      // Migration has already been completed.
      return;
    }

    console.log('Performing one-time state migration from localStorage to Capacitor Preferences...');

    // Iterate over all keys currently in localStorage.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          // For the 'isAdFree' key, we also store it in SecureStorage for added security.
          if (key === 'isAdFree') {
            await SecureStoragePlugin.set({ key, value });
          }
          // Store all keys in the standard Preferences.
          await Preferences.set({ key, value });
          console.log(`Migrated key: "${key}"`);
        }
      }
    }

    // Set the flag to indicate that the migration is complete.
    await Preferences.set({ key: MIGRATION_FLAG_KEY, value: '1' });
    console.log('State migration complete.');

  } catch (error) {
    console.error('Error during state migration:', error);
    // If migration fails, we don't set the flag so it can be re-attempted next time.
  }
}
