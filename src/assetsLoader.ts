// =================================================================================================
// Sprites & Images
// =================================================================================================

// We use import.meta.glob to get all the assets, and we use the 'import' query to get the default export,
// which is the URL of the image. This is a Vite-specific feature.
const SPRITE_FILES = import.meta.glob('/Assets/**/*.{png,jpg,webp,svg}', {
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * A cache for loaded sprite images.
 * This is a simple optimization to avoid creating new Image() objects every time.
 */
const SPRITE_CACHE: Record<string, HTMLImageElement> = {};

/**
 * Returns the URL for a given sprite.
 * @param name - The name of the sprite file (e.g., 'troops/knight.png').
 * @returns The resolved URL of the sprite.
 */
export function spriteUrl(name: string): string {
  const path = `/Assets/${name}`;
  const url = SPRITE_FILES[path];
  if (!url) {
    console.error(`Sprite not found: ${name}`);
    // Return a placeholder or a default "not found" image URL if you have one
    return '';
  }
  return url;
}

/**
 * Preloads a sprite and returns the HTMLImageElement.
 * This is useful for ensuring an image is loaded before it's needed, e.g., for drawing on a canvas.
 * @param name - The name of the sprite file.
 * @returns A promise that resolves with the loaded image element.
 */
export function preloadSprite(name: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = spriteUrl(name);
    if (!url) {
      return reject(`Sprite not found: ${name}`);
    }

    if (SPRITE_CACHE[url]) {
      return resolve(SPRITE_CACHE[url]);
    }

    const img = new Image();
    img.onload = () => {
      SPRITE_CACHE[url] = img;
      resolve(img);
    };
    img.onerror = () => reject(`Failed to load sprite: ${name}`);
    img.src = url;
  });
}


// =================================================================================================
// Sounds & Audio
// =================================================================================================

const SOUND_FILES = import.meta.glob('/Assets/sound/*.{mp3,m4a,ogg,wav}', {
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Returns the URL for a given sound file.
 * @param name - The name of the sound file (e.g., 'sword.wav').
 * @returns The resolved URL of the sound.
 */
export function soundUrl(name: string): string {
  const path = `/Assets/sound/${name}`;
  const url = SOUND_FILES[path];
  if (!url) {
    console.error(`Sound not found: ${name}`);
    return '';
  }
  return url;
}


// =================================================================================================
// Levels & Maps (JSON data)
// =================================================================================================

// The original request mentioned JSON files for maps. This project uses a levels.ts file instead.
// We don't need import.meta.glob for this, as standard ES module imports are sufficient and better.
// If maps were in JSON files, the code would look like this:
/*
const MAP_FILES = import.meta.glob('/Assets/maps/*.json', {
  as: 'json',
  eager: true,
}) as Record<string, any>;

export function getMap(name: string): any {
  const path = `/Assets/maps/${name}.json`;
  const mapData = MAP_FILES[path];
  if (!mapData) {
    console.error(`Map not found: ${name}`);
    return null;
  }
  return mapData;
}
*/
// Since this project uses levels.ts, no function is needed here. We will import directly from `../levels`
// where needed. I'm leaving this comment here for clarity on the decision.
