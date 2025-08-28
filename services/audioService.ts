
let audioContext: AudioContext | null = null;
const audioBuffers = new Map<string, AudioBuffer>();
let musicAudioElement: HTMLAudioElement | null = null;
const DEFAULT_MUSIC_TRACK = 'paradiddles.mp3';

let masterVolume = {
    music: 0.25,
    sfx: 0.5,
};

/**
 * Initializes/resumes the audio context. Must be called after a user interaction.
 * This is safe to call multiple times.
 */
export function initAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser.');
      return;
    }
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

export function setMasterVolume(type: 'music' | 'sfx', volume: number) {
    masterVolume[type] = volume;
    if (type === 'music' && musicAudioElement) {
        musicAudioElement.volume = volume;
    }
}

// --- Event-based SFX helpers ---
export type SoundEvent =
  | 'ui_click'
  | 'place_unit'
  | 'throw_projectile' // mapped to throw.wav
  | 'impact_projectile' // mapped to hit.wav
  | 'sword'
  | 'fist'
  | 'victory'
  | 'defeat';

const EVENT_CANDIDATES: Record<SoundEvent, string[]> = {
  ui_click: ['click.wav', 'ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav'],
  place_unit: ['pop.wav', 'ES_Popping Sounds With Mouth - Epidemic Sound - 4811-5085.wav'],
  throw_projectile: ['throw.wav', 'thow.wav', 'ES_Short, Stove, Dry 01 - Epidemic Sound - 0000-0765.wav'],
  impact_projectile: ['hit.wav', 'ES_Hit, Boat - Epidemic Sound - 0000-1561.wav'],
  sword: ['sword.wav', 'ES_Sword Attack Heavy, Stab, Weapon - Epidemic Sound - 3039-4101.wav'],
  fist: ['fist.wav', 'ES_Hands, Fist Bumps, Fist to Palm Slaps 01 - Epidemic Sound - 6998-7193.wav'],
  victory: ['victory_trumpet.wav', 'ES_Orchestral, Trumpet, Vintage, Triumph, Victory - Epidemic Sound - 0000-2459.wav'],
  defeat: ['defeat.wav', 'ES_Hit, Boat - Epidemic Sound - 0000-1561.wav'],
};

const EVENT_BASE_VOLUME: Partial<Record<SoundEvent, number>> = {
  ui_click: 0.5,
  place_unit: 0.7,
  throw_projectile: 0.5,
  impact_projectile: 0.6,
  hit: 0.8,
  victory: 0.6,
  defeat: 0.5,
};

async function playFirstAvailable(candidates: string[], volume: number) {
  if (!audioContext) return;
  for (const file of candidates) {
    const buffer = await getAudioBuffer(file);
    if (buffer && audioContext) {
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(volume * masterVolume.sfx, audioContext.currentTime);
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(audioContext.destination);
      source.start();
      break;
    }
  }
}

export function playEvent(event: SoundEvent, volumeScale = 1) {
  const base = EVENT_BASE_VOLUME[event] ?? 0.6;
  const candidates = EVENT_CANDIDATES[event] || [];
  playFirstAvailable(candidates, base * volumeScale);
}

async function getAudioBuffer(soundFile: string): Promise<AudioBuffer | null> {
    if (!audioContext) return null;

    if (audioBuffers.has(soundFile)) {
        return audioBuffers.get(soundFile)!;
    }

    async function tryGet(url: string): Promise<AudioBuffer | null> {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext!.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch {
            return null;
        }
    }

    const urlOrder = [
        `/Assets/sound/${soundFile}`,
        `/sounds/${soundFile}`,
    ];

    for (const url of urlOrder) {
        const buffer = await tryGet(url);
        if (buffer) {
            audioBuffers.set(soundFile, buffer);
            return buffer;
        }
    }
    return null;
}

export const playSound = (soundFile: string | undefined, volume: number = 0.6) => {
    if (!soundFile || !audioContext) {
        return;
    }
    
    getAudioBuffer(soundFile).then(buffer => {
        if (!buffer || !audioContext) return;

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(volume * masterVolume.sfx, audioContext.currentTime);

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start();
    }).catch(() => {
        // Error is logged in getAudioBuffer
    });
};

export const playMusic = (track?: string, loop: boolean = true, volumeScale: number = 1) => {
    const trackToPlay = track || DEFAULT_MUSIC_TRACK;
    if (!trackToPlay) return;

    let trackSrc = `/Assets/sound/${trackToPlay}`;

    // If the correct music is already playing, do nothing.
    if (musicAudioElement && musicAudioElement.src.endsWith(trackSrc) && !musicAudioElement.paused) {
        return;
    }

    if (musicAudioElement) {
        musicAudioElement.pause();
        musicAudioElement.onerror = null;
        musicAudioElement = null;
    }

    let audio = new Audio(trackSrc);
    musicAudioElement = audio;
    audio.volume = masterVolume.music * volumeScale;
    audio.loop = loop;

    // Handle error gracefully without logging to the console.
    // This makes music an optional feature that doesn't produce errors if files are missing.
    audio.onerror = () => {
        // Try /sounds/ fallback first
        const fallbackSrc = `/sounds/${trackToPlay}`;
        const fb = new Audio(fallbackSrc);
        fb.volume = masterVolume.music * volumeScale;
        fb.loop = loop;
        fb.onerror = () => {
            if (trackToPlay !== DEFAULT_MUSIC_TRACK) {
                playMusic(DEFAULT_MUSIC_TRACK, loop);
            } else {
                if (musicAudioElement === audio) {
                    musicAudioElement = null;
                }
            }
        };
        musicAudioElement = fb;
        fb.play().catch(() => { musicAudioElement = null; });
    };

    // Also silence the play() promise rejection.
    audio.play().catch(() => {
        if (musicAudioElement === audio) {
            musicAudioElement = null;
        }
    });
};


export const pauseMusic = () => {
    if (musicAudioElement) {
        musicAudioElement.pause();
    }
};

export const resumeMusic = () => {
    if (musicAudioElement && musicAudioElement.paused) {
        musicAudioElement.play().catch(() => {});
    }
};

export const stopMusic = () => {
    if (musicAudioElement) {
        musicAudioElement.pause();
        musicAudioElement.currentTime = 0;
        // Detach listener and release resource to prevent memory leaks
        musicAudioElement.onerror = null;
        musicAudioElement.src = '';
        musicAudioElement = null;
    }
};
