## Capacitor iOS, AdMob y Privacidad

### Instalación

1. Dependencias:

```
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/ios
npm i @capacitor/preferences
npm i @capacitor-community/admob
npm i capacitor-plugin-app-tracking-transparency capacitor-secure-storage-plugin
```

2. Configuración:

- `capacitor.config.ts` creado con `appId`, `appName` y `webDir: 'dist'`
- `vite.config.ts` con `base: './'`
- `package.json` scripts: `cap:sync` e `ios`

3. Build iOS:

```
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

4. Xcode → Info.plist:

- `GADApplicationIdentifier` = `VITE_IOS_ADMOB_APP_ID`
- `NSUserTrackingUsageDescription` texto ATT

5. Privacy Manifest:

- Añadir `PrivacyInfo.xcprivacy` describiendo uso de datos para anuncios/analytics

6. Variables de entorno (.env.production):

```
VITE_IOS_ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
VITE_ADMOB_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa
VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb
VITE_ADMOB_REWARDED_ID=ca-app-pub-xxxxxxxxxxxxxxxx/cccccccccc
```

### Integración en App

- Inicio: migración de storage, ATT, consentimiento, `initAds` y `showBanner` (solo release)
- `GetGoldScreen` usa rewarded a través de `showRewarded`
- Menú enlaza a `PrivacyScreen` para ATT, consentimiento, borrar datos y restaurar compras (stub)

# Tiny Battle Simulator

A minimalist battle simulator game where you place units and watch the chaos unfold. Strategize your formation, manage your budget, and dominate the battlefield on your mobile device.

## Asset Customization Guide

This guide details how to replace the game's default assets with your own custom files. For all asset types, you must create the specified folders in the project's root directory (the same directory that contains `index.html`).

The game is designed to gracefully handle missing custom assets by using built-in defaults, so you can replace as few or as many assets as you wish.

### 1. Battlefield Backgrounds

Customize the visual theme of each world. The game will automatically look for a PNG file corresponding to the world number and use it as the background for all levels within that world.

-   **Purpose:** Provide a unique background image for each world in the campaign.
-   **Folder Location:** Create a `/backgrounds/` folder in the project root.
-   **File Naming Convention:** `world_{N}.png`, where `{N}` is the world number.
    -   Example: `world_1.png` for World 1, `world_2.png` for World 2, etc.
-   **File Format:** PNG (`.png`). A 16:9 aspect ratio is recommended for best results.
-   **Fallback:** If a custom image for a world (e.g., `backgrounds/world_1.png`) is not found, the game will use the built-in, procedurally generated low-poly background for that world.

### 2. Unit Icons

Replace the default geometric icons with your own character art.

-   **Purpose:** Set a custom visual representation for each battle unit.
-   **Folder Location:** Create a `/units/` folder in the project root.
-   **File Naming Convention:** `{unit_id}.png`, where `{unit_id}` corresponds to the `id` field of a unit.
    -   Example: `melee.png` for the Knight, `dragon_boss.png` for the Ancient Dragon.
-   **Finding Unit IDs:** All `unit_id` values can be found in the `ALL_UNIT_TYPES` array within the `constants.ts` file.
-   **Image Orientation:** **Crucial:** For correct in-game rotation, all custom unit images **must be created facing upwards** (i.e., pointing towards the top of the image file).
-   **File Format:** PNG (`.png`), preferably with a transparent background.
-   **Fallback:** If a custom icon for a unit (e.g., `units/melee.png`) is not found, the game will use the default vector-based icon for that unit.

### 3. Sound Effects (SFX)

Change the sounds for unit actions like attacks and impacts.

-   **Purpose:** Provide custom audio feedback for in-game events.
-   **Folder Location:** Create a `/sounds/` folder in the project root.
-   **File Naming Convention:** Files should be named to match the `launchSound` and `impactSound` properties defined for each unit in `constants.ts`. The game also uses a few hardcoded sounds for UI and events.
-   **Finding Sound Files:**
    -   **Unit Sounds:** Refer to the `launchSound` and `impactSound` properties for each unit object within the `ALL_UNIT_TYPES` array in `constants.ts`. For example, to change the Knight's attack sound, you would replace `/sounds/sword-swing.wav`.
    -   **UI/Event Sounds:** Other sounds include `placement-pop.wav`, `victory.wav`, `defeat.wav`, and `roulette-spin.wav`.
-   **File Format:** WAV (`.wav`) or MP3 (`.mp3`) are recommended.
-   **Fallback:** If a specified sound file is not found, no sound will play for that action (silent failure).

### 4. Music Tracks

Set the background music for battles.

-   **Purpose:** Provide ambient music during gameplay.
-   **Folder Location:** All music files should be placed in the `/sounds/` folder in the project root.
-   **File Naming Convention:** You can use any filename for your music tracks.
-   **Assigning Music to Levels:** To set a specific track for a level, add a `musicTrack` property to that level's definition in the `levels.ts` file.
    ```typescript
    // Example in levels.ts
    {
      id: 50,
      world: 5,
      name: "Dragon's Peak",
      // ...other properties
      musicTrack: 'boss_dragon.mp3' // This will play /sounds/boss_dragon.mp3
    }
    ```
-   **File Format:** MP3 (`.mp3`) is recommended for best performance and compatibility.
-   **Fallback Behavior:**
    1.  If a level definition does not include a `musicTrack` property, the game will attempt to play the default track: `/sounds/paradiddles.mp3`.
    2.  If a specified `musicTrack` (e.g., `boss_dragon.mp3`) is not found, the game will also attempt to play the default track `/sounds/paradiddles.mp3` as a fallback.
    3.  If `/sounds/paradiddles.mp3` is also missing, no music will play.