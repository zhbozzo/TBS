import React, { useState, useEffect, useCallback } from 'react';
import type { UnitType, Level, AdminFlags, GameSettings, SpellType, SpellId } from './types';
import { ALL_UNIT_TYPES } from './constants';
import { LEVELS } from './levels';
import LevelSelectScreen from './screens/LevelSelectScreen';
import StoreScreen from './screens/StoreScreen';
import BattleScreen from './screens/BattleScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import LocalBattleSetupScreen from './screens/LocalBattleSetupScreen';
import LocalBattleScreen from './screens/LocalBattleScreen';
import GetGoldScreen from './screens/GetGoldScreen';
import ConfigurationModal from './components/ConfigurationModal';
import Toast from './components/Toast';
import RouletteResultModal from './components/RouletteResultModal';
import UpdateModal from './components/UpdateModal';
import { setMasterVolume, playSound, initAudio } from './services/audioService';
import PrivacyScreen from './screens/PrivacyScreen';
import { migrateFromLocalStorageOnce, Keys, getNum, getJSON, getBool, get, set, setJSON, getSecure, setSecure } from './services/storage';
import { ALL_SPELL_TYPES } from './constants';
import { requestATTIfNeeded, ensureConsent } from './services/consent';
import { initAds, showBanner, hideBanner, showRewarded, showInterstitial } from './services/ads';
import { FULL_TUTORIAL_STEPS } from './tutorial';

type Screen = 'main_menu' | 'level_select' | 'store' | 'battle' | 'local_battle_setup' | 'local_battle' | 'get_gold' | 'privacy';

const DEFAULT_SETTINGS: GameSettings = { musicVolume: 0.08, sfxVolume: 0.6 };

interface DailyRewardState {
  lastClaimed: number | null;
}

export interface AdsWatchedState {
  count: number;
  date: string | null;
}

export type RoulettePrize = {
    type: 'unit' | 'gold';
    id?: string;
    name?: string;
    amount?: number;
    fromBrainrot?: boolean;
    originalUnitId?: string;
};


const GameContainer: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('main_menu');
  const [playerGold, setPlayerGold] = useState<number>(() => {
    const savedGold = localStorage.getItem('playerGold');
    return savedGold ? parseInt(savedGold, 10) : 150;
  });
  const [unlockedUnitIds, setUnlockedUnitIds] = useState<string[]>(() => {
    const savedUnlocked = localStorage.getItem('unlockedUnitIds');
    const initialUnlocked = ALL_UNIT_TYPES.filter(u => u.purchaseCost === 0).map(u => u.id);
    if (savedUnlocked) {
      return [...new Set([...initialUnlocked, ...JSON.parse(savedUnlocked)])];
    }
    return initialUnlocked;
  });
  const [highestLevelUnlocked, setHighestLevelUnlocked] = useState<number>(() => {
     const savedLevel = localStorage.getItem('highestLevelUnlocked');
     return savedLevel ? parseInt(savedLevel, 10) : 0;
  });

  // Spells
  const [unlockedSpellIds, setUnlockedSpellIds] = useState<SpellId[]>(() => {
    try {
      const saved = localStorage.getItem('unlockedSpellIds');
      const base: SpellId[] = ['lightning'];
      const parsed = saved ? JSON.parse(saved) : [];
      return [...new Set([...base, ...parsed])];
    } catch { return ['lightning']; }
  });
   const [highestWorldUnlocked, setHighestWorldUnlocked] = useState<number>(() => {
     const savedWorld = localStorage.getItem('highestWorldUnlocked');
     return savedWorld ? parseInt(savedWorld, 10) : 1;
  });
  
  const [tutorialStep, setTutorialStep] = useState<number>(() => {
      const savedStep = localStorage.getItem('tutorialStep');
      // If user has already unlocked levels, assume tutorial is complete.
      const highestLevel = localStorage.getItem('highestLevelUnlocked');
      if (highestLevel && parseInt(highestLevel, 10) > 0) {
          return FULL_TUTORIAL_STEPS.length;
      }
      return savedStep ? parseInt(savedStep, 10) : 0;
  });

  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [adminFlags, setAdminFlags] = useState<AdminFlags>({ godMode: false, instaKill: false });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inputBuffer, setInputBuffer] = useState('');

  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [battleKey, setBattleKey] = useState(0);
  
  // Gold Reward State
  const [dailyRewardState, setDailyRewardState] = useState<DailyRewardState>(() => {
    const saved = localStorage.getItem('dailyRewardState');
    return saved ? JSON.parse(saved) : { lastClaimed: null };
  });

  const [adsWatchedState, setAdsWatchedState] = useState<AdsWatchedState>(() => {
      const saved = localStorage.getItem('adsWatchedState');
      const data = saved ? JSON.parse(saved) : { count: 0, date: null };
      const today = new Date().toDateString();
      if (data.date !== today) {
        return { count: 0, date: today };
      }
      return data;
  });
  
  const [rouletteResult, setRouletteResult] = useState<RoulettePrize | null>(null);

  const [isAdFree, setIsAdFree] = useState<boolean>(() => localStorage.getItem('isAdFree') === 'true');

  const [adsForSpinsWatchedState, setAdsForSpinsWatchedState] = useState<AdsWatchedState>(() => {
    const saved = localStorage.getItem('adsForSpinsWatchedState');
    const data = saved ? JSON.parse(saved) : { count: 0, date: null };
    const today = new Date().toDateString();
    if (data.date !== today) {
      return { count: 0, date: today };
    }
    return data;
  });
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [localBattleMode, setLocalBattleMode] = useState<'open' | 'private'>('open');

  useEffect(() => {
    (async () => {
      try {
        await migrateFromLocalStorageOnce();
        await requestATTIfNeeded();
        await ensureConsent();
        await initAds({
          appId: (import.meta as any).env.VITE_IOS_ADMOB_APP_ID,
          banner: (import.meta as any).env.VITE_ADMOB_BANNER_ID,
          interstitial: (import.meta as any).env.VITE_ADMOB_INTERSTITIAL_ID,
          rewarded: (import.meta as any).env.VITE_ADMOB_REWARDED_ID,
        });
        // Cargar estado desde Preferences
        const defaultUnitIds = ALL_UNIT_TYPES.filter(u => u.purchaseCost === 0).map(u => u.id);
        const pg = await getNum(Keys.playerGold, 150);
        setPlayerGold(pg);
        const unlocked = await getJSON<string[]>(Keys.unlockedUnitIds, []);
        setUnlockedUnitIds([...new Set([...defaultUnitIds, ...unlocked])]);
        const unlockedSpells = await getJSON<SpellId[]>(Keys.unlockedSpellIds, ['lightning']);
        setUnlockedSpellIds([...new Set(unlockedSpells.concat(['lightning']))]);
        const hlu = await getNum(Keys.highestLevelUnlocked, 0);
        setHighestLevelUnlocked(hlu);
        const hwu = await getNum(Keys.highestWorldUnlocked, 1);
        setHighestWorldUnlocked(hwu);
        const tut = await getNum(Keys.tutorialStep, 0);
        if (hlu > 0) {
          setTutorialStep(FULL_TUTORIAL_STEPS.length);
        } else {
          setTutorialStep(tut);
        }
        const settings = await getJSON<GameSettings>(Keys.gameSettings, DEFAULT_SETTINGS);
        setGameSettings(settings);
        const drs = await getJSON<{ lastClaimed: number | null }>(Keys.dailyRewardState, { lastClaimed: null });
        setDailyRewardState(drs);
        const adsState = await getJSON<AdsWatchedState>(Keys.adsWatchedState, { count: 0, date: null });
        const today = new Date().toDateString();
        setAdsWatchedState(adsState.date === today ? adsState : { count: 0, date: today });
        const spinsState = await getJSON<AdsWatchedState>(Keys.adsForSpinsWatchedState, { count: 0, date: null });
        setAdsForSpinsWatchedState(spinsState.date === today ? spinsState : { count: 0, date: today });
        const adFreeSecure = await getSecure(Keys.isAdFree);
        const adFreePref = await get(Keys.isAdFree);
        setIsAdFree(adFreeSecure === 'true' || adFreePref === 'true');
      } catch {}
    })();
    const hasSeenUpdate = sessionStorage.getItem('hasSeenUpdateNotes_v2');
    if (!hasSeenUpdate) {
        setShowUpdateModal(true);
    }
  }, []);

  // Mostrar banner en menús, ocultarlo en batalla
  useEffect(() => {
    const menuScreens: Screen[] = ['main_menu','level_select','store','get_gold','local_battle_setup','privacy'];
    if (isAdFree) {
      try { hideBanner(); } catch {}
      return;
    }
    if (menuScreens.includes(screen)) {
      try { showBanner(); } catch {}
    } else {
      try { hideBanner(); } catch {}
    }
  }, [screen, isAdFree]);

  useEffect(() => {
    (async () => { try { await set(Keys.playerGold, String(playerGold)); } catch {} })();
  }, [playerGold]);

  useEffect(() => {
    // Save only units that are not unlocked by default (i.e., have a purchase cost)
    const defaultUnitIds = ALL_UNIT_TYPES.filter(u => u.purchaseCost === 0).map(u => u.id);
    const unitsToSave = unlockedUnitIds.filter(id => !defaultUnitIds.includes(id));
    (async () => { try { await setJSON(Keys.unlockedUnitIds, unitsToSave); } catch {} })();
  }, [unlockedUnitIds]);

  useEffect(() => {
    (async () => { try { await setJSON(Keys.unlockedSpellIds, unlockedSpellIds); } catch {} })();
  }, [unlockedSpellIds]);
  
  useEffect(() => {
    (async () => { try { await set(Keys.highestLevelUnlocked, String(highestLevelUnlocked)); } catch {} })();
  }, [highestLevelUnlocked]);
  
  useEffect(() => {
    (async () => { try { await set(Keys.highestWorldUnlocked, String(highestWorldUnlocked)); } catch {} })();
  }, [highestWorldUnlocked]);

  useEffect(() => {
    (async () => { try { await set(Keys.tutorialStep, String(tutorialStep)); } catch {} })();
  }, [tutorialStep]);

  useEffect(() => {
    (async () => { try { await setJSON(Keys.gameSettings, gameSettings); } catch {} })();
    setMasterVolume('music', gameSettings.musicVolume);
    setMasterVolume('sfx', gameSettings.sfxVolume);
  }, [gameSettings]);
  
  useEffect(() => {
    (async () => { try { await setJSON(Keys.dailyRewardState, dailyRewardState); } catch {} })();
  }, [dailyRewardState]);

  useEffect(() => {
    (async () => { try { await setJSON(Keys.adsWatchedState, adsWatchedState); } catch {} })();
  }, [adsWatchedState]);
  
  useEffect(() => {
    (async () => { try { await set(Keys.isAdFree, String(isAdFree)); await setSecure(Keys.isAdFree, String(isAdFree)); } catch {} })();
  }, [isAdFree]);

  useEffect(() => {
      (async () => { try { await setJSON(Keys.adsForSpinsWatchedState, adsForSpinsWatchedState); } catch {} })();
  }, [adsForSpinsWatchedState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || isConfigOpen) {
            return;
        }

        let newBuffer = inputBuffer + e.key.toLowerCase();
        if (newBuffer.length > 50) {
            newBuffer = newBuffer.slice(newBuffer.length - 50);
        }
        
        const commandPrefix = 'command.';
        const prefixIndex = newBuffer.lastIndexOf(commandPrefix);

        if (prefixIndex !== -1) {
            const potentialCommand = newBuffer.substring(prefixIndex + commandPrefix.length);
            
            const commands: { [key: string]: () => void } = {
                'addgold': () => {
                    setPlayerGold(prev => prev + 10000);
                    setToastMessage('Gold added!');
                },
                'unlockall': () => {
                    setUnlockedUnitIds(ALL_UNIT_TYPES.map(u => u.id));
                    const maxWorld = Math.max(...LEVELS.map(l => l.world));
                    setHighestWorldUnlocked(maxWorld);
                    setHighestLevelUnlocked(Math.max(...LEVELS.map(l => l.id)));
                    setToastMessage('All units & levels unlocked!');
                },
                'unlocklevels': () => {
                    const maxWorld = Math.max(...LEVELS.map(l => l.world));
                    setHighestWorldUnlocked(maxWorld);
                    setHighestLevelUnlocked(Math.max(...LEVELS.map(l => l.id)));
                    setToastMessage('All levels unlocked!');
                },
                'godmode': () => {
                    setAdminFlags(prev => {
                        const newGodMode = !prev.godMode;
                        setToastMessage(`God Mode ${newGodMode ? 'Activated' : 'Deactivated'}`);
                        return { ...prev, godMode: newGodMode };
                    });
                },
                'instakill': () => {
                    setAdminFlags(prev => {
                        const newInstaKill = !prev.instaKill;
                        setToastMessage(`Insta-Kill ${newInstaKill ? 'Activated' : 'Deactivated'}`);
                        return { ...prev, instaKill: newInstaKill };
                    });
                },
                'reset': () => {
                    // Reset to first-run state
                    const defaultUnits = ALL_UNIT_TYPES.filter(u => u.purchaseCost === 0).map(u => u.id);
                    setPlayerGold(150);
                    setUnlockedUnitIds(defaultUnits);
                    setHighestLevelUnlocked(0);
                    setHighestWorldUnlocked(1);
                    setTutorialStep(0);
                    setGameSettings({ musicVolume: 0.25, sfxVolume: 0.5 });
                    setAdminFlags({ godMode: false, instaKill: false });
                    setCurrentLevel(null);
                    setScreen('main_menu');
                    setToastMessage('Progress reset. Tutorial enabled.');
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                    } catch {}
                }
            };
            
            for (const cmd in commands) {
                if (potentialCommand === cmd) {
                    commands[cmd]();
                    newBuffer = ''; 
                    break;
                }
            }
        }
        
        setInputBuffer(newBuffer);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, [inputBuffer, isConfigOpen]);


  const handleSelectLevel = (level: Level) => {
    const isTutorialActive = tutorialStep < FULL_TUTORIAL_STEPS.length;
    if (level.id <= highestLevelUnlocked + 1 || (isTutorialActive && level.id === 1)) {
        if (isTutorialActive && tutorialStep === 3 && level.id === 1) {
            setTutorialStep(4);
        }
      setCurrentLevel(level);
      setScreen('battle');
      setBattleKey(k => k + 1);
    }
  };
  
  const handleGoToLevelSelect = () => {
      const isTutorialActive = tutorialStep < FULL_TUTORIAL_STEPS.length;
      if (isTutorialActive && tutorialStep === 1) {
          setTutorialStep(2);
      }
      setScreen('level_select');
      if (!isAdFree) { try { hideBanner(); } catch {} }
  };

  const handleGoToStore = () => setScreen('store');
  const handleGoToGetGold = () => setScreen('get_gold');
  const handleExitStore = () => {
      setScreen('main_menu');
  };

  const handleBuyUnit = (unitType: UnitType) => {
    if (unitType.purchaseCost && playerGold >= unitType.purchaseCost && !unlockedUnitIds.includes(unitType.id)) {
      setPlayerGold(prev => prev - unitType.purchaseCost!);
      setUnlockedUnitIds(prev => [...prev, unitType.id]);
       if (tutorialStep === 16 && unitType.id === 'tank') {
        setTutorialStep(FULL_TUTORIAL_STEPS.length);
        setToastMessage("Tutorial Complete! Happy battling!");
      }
    }
  };

  const handleBuySpell = (spell: SpellType) => {
    if (playerGold >= spell.purchaseCost && !unlockedSpellIds.includes(spell.id)) {
      setPlayerGold(prev => prev - spell.purchaseCost);
      setUnlockedSpellIds(prev => [...prev, spell.id]);
    }
  };
  
  const handleStartSpin = () => {
      if (playerGold < 300) {
          setToastMessage("Not enough gold to spin!");
          return;
      }
      setPlayerGold(p => p - 300);
  };

  const handlePrizeWon = (prize: RoulettePrize) => {
      if (prize.type === 'unit' && prize.id) {
          setUnlockedUnitIds(prev => [...new Set([...prev, prize.id!])]);
      } else if (prize.type === 'gold' && prize.amount) {
          setPlayerGold(p => p + prize.amount!);
      }
      
      if (prize.fromBrainrot) {
          // The BrainrotSelector is its own modal, so don't show another one.
          return;
      }

      setRouletteResult(prize);
      playSound('victory.wav', 0.7);
  };

  const handleClaimDailyReward = () => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (!dailyRewardState.lastClaimed || now - dailyRewardState.lastClaimed > twentyFourHours) {
        setPlayerGold(p => p + 300);
        setDailyRewardState({ lastClaimed: now });
        setToastMessage('+300 Gold claimed!');
    }
  };

  const handleWatchAd = async () => {
      const today = new Date().toDateString();
      const currentCount = adsWatchedState.date === today ? adsWatchedState.count : 0;
      if (currentCount >= 3) {
          setToastMessage(`No more ${isAdFree ? 'bonuses' : 'ads'} available today.`);
          return;
      }
      await showRewarded(() => {
        setPlayerGold(p => p + 150);
        setAdsWatchedState({ count: currentCount + 1, date: today });
        if(isAdFree) {
          setToastMessage(`+150 Gold! (${2 - currentCount} bonuses remaining today)`);
        } else {
          setToastMessage(`+150 Gold! (${2 - currentCount} ads remaining today)`);
        }
      });
  };

  const onAttemptAdSpin = (): boolean => {
    const limit = 5;
    if (isAdFree) {
        const today = new Date().toDateString();
        const currentCount = adsForSpinsWatchedState.date === today ? adsForSpinsWatchedState.count : 0;
        
        if (currentCount < limit) {
            setAdsForSpinsWatchedState({ count: currentCount + 1, date: today });
            setToastMessage(`Free spin claimed! (${limit - 1 - currentCount} left today)`);
            return true;
        } else {
            setToastMessage('No more free spins available today.');
            return false;
        }
    }

    const today = new Date().toDateString();
    const currentCount = adsForSpinsWatchedState.date === today ? adsForSpinsWatchedState.count : 0;
    
    if (currentCount < limit) {
        setAdsForSpinsWatchedState({ count: currentCount + 1, date: today });
        setToastMessage(`Ad watched! Spinning...`);
        return true;
    } else {
        setToastMessage('No more ad spins available today.');
        return false;
    }
  };

  const handlePurchaseAdFree = () => {
      setIsAdFree(true);
      setToastMessage("Purchase successful! Enjoy an ad-free experience.");
  };

  const handlePurchaseGold = (amount: number) => {
    setPlayerGold(p => p + amount);
    setToastMessage(`+${amount} Gold purchased!`);
  };

  const onWin = (level: Level) => {
      // Check if reward has already been given for this instance of the level
      if(level.id > highestLevelUnlocked) {
        setPlayerGold(prev => prev + level.reward);
        setHighestLevelUnlocked(level.id);
      }
      
      // Check for world unlock
      const levelsInCurrentWorld = LEVELS.filter(l => l.world === level.world);
      const lastLevelOfWorld = Math.max(...levelsInCurrentWorld.map(l => l.id));
      
      if(level.id === lastLevelOfWorld && level.world === highestWorldUnlocked) {
         const maxWorld = Math.max(...LEVELS.map(l => l.world));
         if (level.world < maxWorld) {
            setHighestWorldUnlocked(prev => prev + 1);
            setToastMessage(`World ${prev => prev + 1} Unlocked!`);
         }
      }

      // Interstitial tras la partida (si no es ad-free)
      if (!isAdFree) {
        try { showInterstitial(); } catch {}
      }
  }

  const onClaimBonusReward = () => {
    if (currentLevel) {
        setPlayerGold(prev => prev + currentLevel.reward * 2);
        setToastMessage(`+${currentLevel.reward * 2} bonus Gold!`);
    }
  };
  
  const onExitToMenu = () => {
    // Interstitial si se sale de la partida (derrota o abandono)
    if (!isAdFree && currentLevel) {
      try { showInterstitial(); } catch {}
    }
    setCurrentLevel(null);
    setScreen('main_menu');
  };
  
  const onTutorialExitToStore = () => {
    setCurrentLevel(null);
    setTutorialStep(16);
    setScreen('store');
  }

  const handleTryAgain = () => {
    if (!isAdFree) {
      try { showInterstitial(); } catch {}
    }
    setBattleKey(k => k + 1); // This remounts the BattleScreen, effectively restarting it
  };

  const handleNextLevel = () => {
    if (currentLevel) {
        const currentLevelIndex = LEVELS.findIndex(l => l.id === currentLevel.id);
        const nextLevel = LEVELS[currentLevelIndex + 1];
        if (nextLevel && nextLevel.id <= highestLevelUnlocked + 1) {
            handleSelectLevel(nextLevel);
        } else {
            setScreen('level_select');
        }
    }
  }
  
  const handleSkipTutorial = () => {
      setTutorialStep(FULL_TUTORIAL_STEPS.length);
      setToastMessage("Tutorial Skipped!");
  };

  const handleCloseUpdateModal = () => {
    sessionStorage.setItem('hasSeenUpdateNotes_v2', 'true');
    setShowUpdateModal(false);
  };

  const unlockedUnits = ALL_UNIT_TYPES.filter(u => {
    // A unit is usable if it is NOT a boss/summon, AND it IS acquired, 
    // AND (it IS a special unit OR its world IS unlocked)

    // 1. Exclude non-selectable units
    if (u.role === 'Boss' || u.summonedUnitId) {
        return false;
    }

    // 2. Must be acquired
    const isAcquired = unlockedUnitIds.includes(u.id);
    if (!isAcquired) {
        return false;
    }

    // 3. Check usability criteria
    const isSpecialUnit = (u.unlockWorld || 0) >= 99;
    if (isSpecialUnit) {
        return true; // Special units are always usable once acquired.
    }

    const isWorldUnlocked = highestWorldUnlocked >= (u.unlockWorld || 1); // Default to world 1
    return isWorldUnlocked;
  });

  const renderScreen = () => {
    switch (screen) {
      case 'main_menu':
        return <MainMenuScreen 
            onSelectLevels={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); handleGoToLevelSelect(); }}
            onSelectLocalBattle={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setScreen('local_battle_setup'); }}
            onGoToStore={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); handleGoToStore(); }}
            onGoToGetGold={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); handleGoToGetGold(); }}
            playerGold={playerGold}
            onOpenConfig={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setIsConfigOpen(true); }}
            tutorialStep={tutorialStep}
            setTutorialStep={setTutorialStep}
            onSkipTutorial={handleSkipTutorial}
        />;
      case 'level_select':
        return (
          <LevelSelectScreen
            levels={LEVELS}
            highestLevelUnlocked={highestLevelUnlocked}
            highestWorldUnlocked={highestWorldUnlocked}
            onSelectLevel={(level) => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setTimeout(() => handleSelectLevel(level), 0); }}
            onBack={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setScreen('main_menu'); }}
            tutorialStep={tutorialStep}
            setTutorialStep={setTutorialStep}
          />
        );
      case 'store':
        return (
            <StoreScreen
                allUnits={ALL_UNIT_TYPES}
                unlockedUnitIds={unlockedUnitIds}
                playerGold={playerGold}
                onBuyUnit={handleBuyUnit}
                onExit={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); handleExitStore(); }}
                onGoToGetGold={handleGoToGetGold}
                highestWorldUnlocked={highestWorldUnlocked}
                onStartSpin={handleStartSpin}
                onPrizeWon={handlePrizeWon}
                isAdFree={isAdFree}
                adsForSpinsWatchedState={adsForSpinsWatchedState}
                onAttemptAdSpin={onAttemptAdSpin}
                tutorialStep={tutorialStep}
                allSpells={ALL_SPELL_TYPES}
                unlockedSpellIds={unlockedSpellIds}
                onBuySpell={handleBuySpell}
            />
        );
      case 'get_gold':
        return (
            <GetGoldScreen
                onBack={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setScreen('main_menu'); }}
                dailyRewardState={dailyRewardState}
                adsWatchedState={adsWatchedState}
                onClaimDailyReward={handleClaimDailyReward}
                onWatchAd={handleWatchAd}
                onPurchaseGold={handlePurchaseGold}
                isAdFree={isAdFree}
                onPurchaseAdFree={handlePurchaseAdFree}
            />
        );
      case 'privacy':
        return <PrivacyScreen onBack={() => setScreen('main_menu')} />;
      case 'battle':
        return currentLevel ? (
          <BattleScreen
            key={battleKey}
            level={currentLevel}
            unlockedUnits={unlockedUnits}
            onWin={onWin}
            onClaimBonusReward={onClaimBonusReward}
            onExit={onExitToMenu}
            onTryAgain={handleTryAgain}
            onNextLevel={handleNextLevel}
            highestLevelUnlocked={highestLevelUnlocked}
            adminFlags={adminFlags}
            gameSettings={gameSettings}
            onOpenConfig={() => setIsConfigOpen(true)}
            onExitToMenu={tutorialStep === 15 ? onTutorialExitToStore : onExitToMenu}
            tutorialStep={tutorialStep}
            setTutorialStep={setTutorialStep}
            onTutorialComplete={() => {
                setTutorialStep(FULL_TUTORIAL_STEPS.length);
                setToastMessage("Tutorial Complete! New units unlocked.");
            }}
            unlockedSpellIds={unlockedSpellIds}
          />
        ) : null;
      case 'local_battle_setup':
        return <LocalBattleSetupScreen 
            onBack={() => setScreen('main_menu')}
            onSelectMode={(mode) => {
                setLocalBattleMode(mode);
                setScreen('local_battle');
            }}
        />;
      case 'local_battle':
        return <LocalBattleScreen 
            mode={localBattleMode}
            unlockedUnits={ALL_UNIT_TYPES.filter(u => u.purchaseCost === 0 || unlockedUnitIds.includes(u.id))}
            gameSettings={gameSettings}
            onOpenConfig={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setIsConfigOpen(true); }}
            onExit={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); setScreen('main_menu'); }}
        />;
       default:
        return <MainMenuScreen 
            onSelectLevels={handleGoToLevelSelect}
            onSelectLocalBattle={() => setScreen('local_battle_setup')}
            onGoToStore={handleGoToStore}
            onGoToGetGold={handleGoToGetGold}
            playerGold={playerGold}
            onOpenConfig={() => setIsConfigOpen(true)}
            tutorialStep={tutorialStep}
            setTutorialStep={setTutorialStep}
            onSkipTutorial={handleSkipTutorial}
        />;
    }
  };

  return (
    <div className="safe-wrap">
      <main className="stage">
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        {showUpdateModal && <UpdateModal onClose={handleCloseUpdateModal} />}
        {!showUpdateModal && renderScreen()}
        {rouletteResult && (
          <RouletteResultModal
              result={rouletteResult}
              onClose={() => setRouletteResult(null)}
              allUnits={ALL_UNIT_TYPES}
          />
        )}
        {isConfigOpen && (
          <ConfigurationModal
              settings={gameSettings}
              onSettingsChange={setGameSettings}
              onClose={() => setIsConfigOpen(false)}
              onOpenPrivacy={screen === 'main_menu' ? (() => { setIsConfigOpen(false); setScreen('privacy'); }) : undefined}
          />
        )}
      </main>
    </div>
  );
};

export default GameContainer;