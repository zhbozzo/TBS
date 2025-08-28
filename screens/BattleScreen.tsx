

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { spriteUrl, soundUrl } from '@/src/assetsLoader';
import type { Unit, UnitType, GameState as GameStateEnum, Team as TeamEnum, Level, Projectile, AdminFlags, GameSettings, VisualEffect, SpellId } from '../types';
import { Team, GameState } from '../types';
import { runSimulationTick } from '../services/gameLogic';
import { initAudio, playSound, playMusic, stopMusic, pauseMusic, resumeMusic, setMasterVolume, playEvent } from '../services/audioService';
import Battlefield from '../components/Battlefield';
import UnitSelectionBar from '../components/UnitSelectionBar';
import GameOverModal from '../components/GameOverModal';
import { showRewarded } from '../services/ads';
import PauseModal from '../components/PauseModal';
import TutorialOverlay, { type HighlightCoordinates } from '../components/TutorialOverlay';
import { GAME_CONFIG, ALL_SPELL_TYPES } from '../constants';
import { LEVELS } from '../levels';
import { BackArrowIcon, PauseIcon, SpeedCycleIcon, GearIcon, PlayIcon, TrashIcon, FireballIcon, HealIcon, SwordIcon, ShieldIcon } from '../components/Icons';
import LowPolyBackground from '../components/LowPolyBackground';
import { FULL_TUTORIAL_STEPS } from '../tutorial';


interface BattleScreenProps {
  level: Level;
  unlockedUnits: UnitType[];
  onWin: (level: Level) => void;
  onClaimBonusReward: () => void;
  onExit: () => void;
  onTryAgain: () => void;
  onNextLevel: () => void;
  highestLevelUnlocked: number;
  adminFlags: AdminFlags;
  gameSettings: GameSettings;
  onOpenConfig: () => void;
  onExitToMenu: () => void;
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
  onTutorialComplete: () => void;
  unlockedSpellIds: SpellId[];
}

const MAX_TICKS_PER_FRAME = 10; 

const battleTutorialSteps = FULL_TUTORIAL_STEPS.filter(s => s.screen === 'battle');
const firstBattleStepId = battleTutorialSteps[0]?.id || -1;


const generateInitialEnemyUnits = (level: Level): Unit[] => {
  return level.enemyUnits.map((unitConfig, i) => ({
    ...unitConfig,
    uid: `enemy_${i}_${Date.now()}`,
    team: Team.Red,
    rotation: -90,
    currentHp: unitConfig.hp,
    targetId: null,
    lastAttackTime: 0,
    attackCooldown: unitConfig.attackCooldown || (1000 + Math.random() * 500),
    effects: [],
    waypoint: null,
  }));
};

const BattleScreen: React.FC<BattleScreenProps> = ({ level, unlockedUnits, onWin, onClaimBonusReward, onExit, onTryAgain, onNextLevel, highestLevelUnlocked, adminFlags, gameSettings, onOpenConfig, onExitToMenu, tutorialStep, setTutorialStep, onTutorialComplete, unlockedSpellIds }) => {
  const [gameState, setGameState] = useState<GameStateEnum>(GameState.Deployment);
  const [units, setUnits] = useState<Unit[]>(() => generateInitialEnemyUnits(level));
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);
  const [budget, setBudget] = useState<number>(level.budget);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [winner, setWinner] = useState<TeamEnum | null>(null);
  
  const [previewInfo, setPreviewInfo] = useState<{ x: number; y: number; isColliding: boolean, team: Team } | null>(null);
  const isPointerDownRef = useRef(false);
  const lastPlacementTimeRef = useRef(0);
  const lastBrushPosRef = useRef<{ x: number; y: number } | null>(null);
  const battlefieldRef = useRef<HTMLDivElement>(null);

  const unitsRef = useRef(units);
  const projectilesRef = useRef(projectiles);
  const tutorialEnergyTimerRef = useRef<number | null>(null);

  // Estado vivo del motor (no dispara renders)
  const worldRef = useRef({ units, projectiles });
  const obstaclesRef = useRef(level.obstacles);
  const adminFlagsRef = useRef(adminFlags);
  const runningRef = useRef(false);
  const speedRef = useRef(simulationSpeed);
  // refs de tiempo para loop estable
  const lastRef = useRef(performance.now());
  const accRef = useRef(0);
  
  const [highlightCoords, setHighlightCoords] = useState<HighlightCoordinates | null>(null);
  const [isTutorialPaused, setIsTutorialPaused] = useState(false);
  
  const isTutorialMode = tutorialStep < FULL_TUTORIAL_STEPS.length && level.id === 1;

  const [useCustomBackground, setUseCustomBackground] = useState(false);
  const terrainByWorld: Record<number, string> = {
    1: spriteUrl('Terrain/grass.png'),
    2: spriteUrl('Terrain/desert.png'),
    3: spriteUrl('Terrain/crystal.png'),
    4: spriteUrl('Terrain/magma.png'),
    5: spriteUrl('Terrain/glacial.png'),
  };
  const battlefieldFallback = spriteUrl('Terrain/battlefieldbackground.png');
  const customBgUrl = terrainByWorld[level.world] || battlefieldFallback;
  
  const [scale, setScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Spells state
  const [selectedSpellId, setSelectedSpellId] = useState<SpellId | null>(null);
  const [spellEnergy, setSpellEnergy] = useState<number>(() => {
    try {
      const boost = sessionStorage.getItem('battle_next_start_energy');
      if (boost) {
        sessionStorage.removeItem('battle_next_start_energy');
        const val = Number(boost);
        if (Number.isFinite(val)) {
          return Math.max(0, Math.min(100, val));
        }
      }
    } catch {}
    return 60;
  });
  const [spellPreview, setSpellPreview] = useState<{ x: number; y: number } | null>(null);
  const MAX_SPELL_ENERGY = 100;
  const availableSpells = ALL_SPELL_TYPES.filter(s => unlockedSpellIds.includes(s.id));
  const [hasCastLightningOnce, setHasCastLightningOnce] = useState(false);
  const [hintTarget, setHintTarget] = useState<{ x: number; y: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  useLayoutEffect(() => {
    const updateScale = () => {
        if (viewportRef.current) {
            const { clientWidth, clientHeight } = viewportRef.current;
            const newScale = Math.min(
                clientWidth / GAME_CONFIG.BATTLEFIELD_WIDTH,
                clientHeight / GAME_CONFIG.BATTLEFIELD_HEIGHT
            );
            setScale(newScale);
        }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
        window.removeEventListener('resize', updateScale);
        window.removeEventListener('orientationchange', updateScale);
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setUseCustomBackground(true);
    img.onerror = () => setUseCustomBackground(true); // Forzar uso de PNG aunque falte, evitamos low-poly
    img.src = customBgUrl;
  }, [customBgUrl]);


  useEffect(() => { unitsRef.current = units; worldRef.current.units = units; }, [units]);
  useEffect(() => { projectilesRef.current = projectiles; worldRef.current.projectiles = projectiles; }, [projectiles]);
  useEffect(() => { obstaclesRef.current = level.obstacles; }, [level.obstacles]);
  useEffect(() => { adminFlagsRef.current = adminFlags; }, [adminFlags]);
  useEffect(() => { speedRef.current = simulationSpeed; }, [simulationSpeed]);

  useEffect(() => {
    setMasterVolume('music', gameSettings.musicVolume);
    setMasterVolume('sfx', gameSettings.sfxVolume);
  }, [gameSettings]);

  useEffect(() => {
    return () => {
        stopMusic();
    };
  }, []);

  // Auto-select Lightning during tutorial aim step
  useEffect(() => {
    if (isTutorialMode && tutorialStep === 14) {
      setSelectedSpellId('lightning');
    }
  }, [isTutorialMode, tutorialStep]);

  // Regenerate spell energy during simulation
  useEffect(() => {
    if (gameState !== GameState.Simulation) return;
    const interval = setInterval(() => {
      setSpellEnergy(prev => Math.min(MAX_SPELL_ENERGY, prev + 2));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Compute visual hint for Lightning during tutorial step 13
  useEffect(() => {
    if (!isTutorialMode || tutorialStep !== 14 || selectedSpellId !== 'lightning') {
      setHintTarget(null);
      return;
    }
    const lightning = ALL_SPELL_TYPES.find(s => s.id === 'lightning');
    const radius = lightning?.radius || 60;
    const enemies = units.filter(u => u.team === Team.Red && !u.dyingAt);
    if (enemies.length === 0) { setHintTarget(null); return; }
    // Choose a spot at the average position of enemies to ensure the ring is centered where they are
    const avg = enemies.reduce((acc, u) => ({ x: acc.x + u.position.x, y: acc.y + u.position.y }), { x: 0, y: 0 });
    avg.x /= enemies.length; avg.y /= enemies.length;
    setHintTarget({ x: avg.x, y: avg.y });
  }, [units, isTutorialMode, tutorialStep, selectedSpellId]);
  
  // Tutorial Logic
  useEffect(() => {
    if (!isTutorialMode) return;
    
    const currentStepConfig = FULL_TUTORIAL_STEPS[tutorialStep];
    if (!currentStepConfig || currentStepConfig.screen !== 'battle') return;
    
    // No auto pausa aquí; se programa tras presionar Start

    const placedKnights = units.filter(u => u.team === Team.Blue && u.id === 'melee').length;
    const placedArchers = units.filter(u => u.team === Team.Blue && u.id === 'ranged').length;
    
    // Logic to wait for user action before proceeding
    if (currentStepConfig.highlightTarget && !currentStepConfig.nextButton) {
        switch(tutorialStep) {
            case 6: // Select a Knight
                if (selectedUnitType?.id === 'melee') setTutorialStep(7);
                break;
            case 7: // Place first Knight
                if (placedKnights >= 1) setTutorialStep(8);
                break;
            case 8: // Place second Knight
                if (placedKnights >= 2) setTutorialStep(9);
                break;
            case 9: // Select an Archer
                if (selectedUnitType?.id === 'ranged') setTutorialStep(10);
                break;
            case 10: // Place the Archer
                if (placedKnights >= 2 && placedArchers >= 1) setTutorialStep(11);
                break;
            case 11: // Start the battle
                if (gameState === GameState.Simulation) setTutorialStep(12);
                break;
            case 14: // Lanzar rayo una vez
                if (hasCastLightningOnce) {
                    // Reanudar y continuar normalmente con la batalla
                    setIsTutorialPaused(false);
                    setGameState(GameState.Simulation);
                    setTutorialStep(15);
                }
                break;
        }
    }

    // Update highlight coordinates
    const targetId = currentStepConfig.highlightTarget;
    if (targetId) {
        // A small delay to ensure the UI is ready, especially for dynamic elements
        const delay = tutorialStep === 15 ? 600 : 50; // Wait for modal animation
        setTimeout(() => {
            if (targetId === 'deployment-zone') {
                const rect = battlefieldRef.current?.getBoundingClientRect();
                if(rect) {
                    const placementWidth = GAME_CONFIG.PLACEMENT_ZONE_WIDTH * scale;
                    setHighlightCoords({ top: rect.top, left: rect.left, width: placementWidth, height: rect.height, shape: 'rect', padding: 0 });
                }
            } else {
                const element = document.querySelector(`[data-tutorial-id="${targetId}"]`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const extraPadding = targetId === 'start-button' ? 8 : 0;
                    setHighlightCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, shape: 'rect', padding: extraPadding });
                }
            }
        }, delay);
    } else {
        setHighlightCoords(null);
    }

  }, [isTutorialMode, tutorialStep, selectedUnitType, units, gameState, setTutorialStep, scale]);

  const handleTutorialNext = () => {
      const currentStepConfig = FULL_TUTORIAL_STEPS[tutorialStep];
      
      if (currentStepConfig?.nextButton === "Let's Win!") {
          setIsTutorialPaused(false);
          setGameState(GameState.Simulation);
          setHighlightCoords(null);
          // Advance step to 15 to hide this overlay.
          // The Victory overlay (step 15) is prevented from showing until game over.
          setTutorialStep(15);
          return;
      }
      
      const nextStep = tutorialStep + 1;
      setTutorialStep(nextStep);
  };


  const handleSelectUnit = (unitType: UnitType) => {
    if (budget >= unitType.cost) {
      setSelectedUnitType(prev => (prev?.id === unitType.id ? null : unitType));
    }
  };

  const handlePlaceUnit = (position: { x: number; y: number }) => {
    if (!selectedUnitType || budget < selectedUnitType.cost) return;
    initAudio();
    playEvent('place_unit');

    const newUnit: Unit = {
      ...selectedUnitType,
      uid: `player_${units.length}_${Date.now()}`,
      team: Team.Blue,
      position,
      rotation: 90,
      currentHp: selectedUnitType.hp,
      targetId: null,
      lastAttackTime: 0,
      attackCooldown: selectedUnitType.attackCooldown || (1000 + Math.random() * 500),
      effects: [],
      waypoint: null,
    };

    setUnits(prevUnits => [...prevUnits, newUnit]);
    setBudget(prevBudget => prevBudget - selectedUnitType.cost);
  };
  
  const handleDeleteUnit = (unitId: string) => {
    // Disable deleting units during tutorial to avoid confusion
    if (isTutorialMode) return;
    
    const unitToDelete = units.find(u => u.uid === unitId);
    if (unitToDelete && unitToDelete.team === Team.Blue) {
        setBudget(prev => prev + unitToDelete.cost);
        setUnits(prev => prev.filter(u => u.uid !== unitId));
    }
  };

  const handleClearAll = () => {
    if (gameState !== GameState.Deployment) return;
    setUnits(prevUnits => prevUnits.filter(u => u.team === Team.Red));
    setBudget(level.budget);
  };
  
  const getGameCoordsFromEvent = (e: React.PointerEvent<HTMLDivElement>): { x: number; y: number } | null => {
      const rect = battlefieldRef.current?.getBoundingClientRect();
      if (!rect) return null;
      
      const scaleValue = rect.width / GAME_CONFIG.BATTLEFIELD_WIDTH;
      const x = (e.clientX - rect.left) / scaleValue;
      const y = (e.clientY - rect.top) / scaleValue;
      
      return { x, y };
  };
    
  const attemptPlacement = useCallback((x: number, y: number, isColliding: boolean) => {
    const PLACEMENT_COOLDOWN = 60; // ms
    const now = Date.now();
    if (now - lastPlacementTimeRef.current < PLACEMENT_COOLDOWN) return;

    if (gameState !== GameState.Deployment || !selectedUnitType || isColliding) return;
    handlePlaceUnit({ x, y });
    lastPlacementTimeRef.current = now;
  }, [gameState, selectedUnitType, budget]);

  const updatePreviewInfo = (x: number, y: number) => {
        if (!selectedUnitType) {
            setPreviewInfo(null);
            return { isColliding: true };
        }
        
        const getUnitSize = (unit: UnitType | Unit) => unit.role === 'Boss' ? 80 : 40;
        const unitRadius = getUnitSize(selectedUnitType) / 2;
        
        // Clamp position to be within battlefield for preview
        const clampedX = Math.max(unitRadius, Math.min(x, GAME_CONFIG.BATTLEFIELD_WIDTH - unitRadius));
        const clampedY = Math.max(unitRadius, Math.min(y, GAME_CONFIG.BATTLEFIELD_HEIGHT - unitRadius));

        // Placement boundary checks
        const isOutsideBounds = x < unitRadius || x > GAME_CONFIG.BATTLEFIELD_WIDTH - unitRadius || y < unitRadius || y > GAME_CONFIG.BATTLEFIELD_HEIGHT - unitRadius;
        const isOutsidePlacementZone = x > GAME_CONFIG.PLACEMENT_ZONE_WIDTH - unitRadius;
        
        const isCollidingWithObstacle = level?.obstacles?.some(obs => {
          if (typeof obs.size === 'object' && obs.type === 'wall') {
              const rect = { left: obs.position.x - obs.size.width / 2, right: obs.position.x + obs.size.width / 2, top: obs.position.y - obs.size.height / 2, bottom: obs.position.y + obs.size.height / 2 };
              const closestX = Math.max(rect.left, Math.min(x, rect.right));
              const closestY = Math.max(rect.top, Math.min(y, rect.bottom));
              const distance = Math.sqrt(Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2));
              return distance < unitRadius;
          } else if (typeof obs.size === 'number') { // Circular obstacles
              const distance = Math.sqrt(Math.pow(x - obs.position.x, 2) + Math.pow(y - obs.position.y, 2));
              return distance < unitRadius + (obs.size / 2);
          }
          return false;
        });

        const isCollidingWithUnit = units.some(unit => {
            const existingUnitRadius = getUnitSize(unit) / 2;
            const combinedRadius = unitRadius + existingUnitRadius;
            const distance = Math.sqrt(Math.pow(x - unit.position.x, 2) + Math.pow(y - unit.position.y, 2));
            return distance < combinedRadius;
        });
        
        const isColliding = isOutsideBounds || isOutsidePlacementZone || !!isCollidingWithObstacle || !!isCollidingWithUnit;
        
        setPreviewInfo({ x: clampedX, y: clampedY, isColliding, team: Team.Blue });
        return { isColliding, x: clampedX, y: clampedY };
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const gameCoords = getGameCoordsFromEvent(e);
    if (!gameCoords) return;

    if (gameState === GameState.Deployment && selectedUnitType) {
      const { x, y } = gameCoords;
      const info = updatePreviewInfo(x, y);
      if (isPointerDownRef.current) {
        const BRUSH_SPACING = 48;
        const last = lastBrushPosRef.current;
        if (!last) {
          attemptPlacement(info.x, info.y, info.isColliding);
          lastBrushPosRef.current = { x: info.x, y: info.y };
        } else {
          const dx = info.x - last.x;
          const dy = info.y - last.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= BRUSH_SPACING) {
            const steps = Math.floor(dist / BRUSH_SPACING);
            for (let i = 1; i <= steps; i++) {
              const px = last.x + (dx * i) / (steps + 0.00001);
              const py = last.y + (dy * i) / (steps + 0.00001);
              const chk = updatePreviewInfo(px, py);
              attemptPlacement(chk.x, chk.y, chk.isColliding);
              lastBrushPosRef.current = { x: chk.x, y: chk.y };
            }
          }
        }
      }
      return;
    }

    if ((gameState === GameState.Simulation || gameState === GameState.Paused) && selectedSpellId) {
      setSpellPreview({ x: gameCoords.x, y: gameCoords.y });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-interactive-ui]')) return;
    if (isTutorialMode && ![7, 8, 10].includes(tutorialStep) && gameState === GameState.Deployment) return;

    const gameCoords = getGameCoordsFromEvent(e);
    if (!gameCoords) return;

    if (gameState === GameState.Deployment && selectedUnitType) {
      isPointerDownRef.current = true;
      const { x, y } = gameCoords;
      const res = updatePreviewInfo(x, y);
      attemptPlacement(res.x, res.y, res.isColliding);
      lastBrushPosRef.current = { x: res.x, y: res.y };
      return;
    }

    if ((gameState === GameState.Simulation || gameState === GameState.Paused) && selectedSpellId) {
      applySpellAt(selectedSpellId, gameCoords.x, gameCoords.y);
      setSelectedSpellId(null);
      setSpellPreview(null);
      if (isTutorialMode && tutorialStep === 14) {
        setHasCastLightningOnce(true);
      }
      return;
    }
  };
  
  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    lastBrushPosRef.current = null;
  };

  const handlePointerLeave = () => {
    isPointerDownRef.current = false;
    setPreviewInfo(null);
    lastBrushPosRef.current = null;
  };

  const handleStartSimulation = () => {
    if (gameState === GameState.Deployment) {
      initAudio();
      // Usa la pista subida por el usuario, volumen 3x menor
      playMusic('ES_Conquer The Battle 3 - Fredrik Ekström (Version becf635b) - fullmix_preview.mp3', true, 1/3);
      setGameState(GameState.Simulation);
      setSelectedUnitType(null);
      setSelectedSpellId(null);
      setSpellPreview(null);
      // Tutorial: programa el paso de energía/rayo tras 5 segundos de juego
      if (isTutorialMode && tutorialStep === 11) {
        if (tutorialEnergyTimerRef.current) {
          clearTimeout(tutorialEnergyTimerRef.current);
          tutorialEnergyTimerRef.current = null;
        }
        tutorialEnergyTimerRef.current = window.setTimeout(() => {
          // Avanza a energía solo si no terminó la batalla
          const anyWinner = unitsRef.current.filter(u => !u.dyingAt).some(u => u.team === Team.Red) && unitsRef.current.filter(u => !u.dyingAt).some(u => u.team === Team.Blue);
          if (anyWinner && gameState === GameState.Simulation) {
            setIsTutorialPaused(true);
            setGameState(GameState.Paused);
            setTutorialStep(12);
          }
        }, 5000);
      }
    }
  };
  
  const handleSpeedChange = () => {
    setSimulationSpeed(currentSpeed => {
        if (currentSpeed === 1) return 2;
        if (currentSpeed === 2) return 4;
        return 1; // Cycle back to 1
    });
  };

  const handlePause = () => {
    if (gameState === GameState.Simulation) {
        setGameState(GameState.Paused);
        setIsTutorialPaused(false);
    }
  };

  const handleResume = () => {
    if (gameState === GameState.Paused && !isTutorialPaused) {
        setGameState(GameState.Simulation);
    }
  };

  const runTick = useCallback(() => {
    const { nextUnitsState, nextProjectilesState, newVisualEffects } = runSimulationTick(
        unitsRef.current, 
        projectilesRef.current, 
        level.obstacles, 
        adminFlags
    );
    setUnits(nextUnitsState);
    setProjectiles(nextProjectilesState);
    if (newVisualEffects.length > 0) {
        setVisualEffects(prev => [...prev, ...newVisualEffects]);
        newVisualEffects.forEach(vfx => {
            setTimeout(() => {
                setVisualEffects(currentVfx => currentVfx.filter(effect => effect.id !== vfx.id));
            }, vfx.duration);
        });
    }
  }, [level.obstacles, adminFlags]);

  // Loop estable sin saltos (no turbo al reanudar)
  useEffect(() => {
    let raf = 0;
    const baseStep = GAME_CONFIG.SIMULATION_TICK_MS;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);

      // calcular dt siempre
      const dt = t - lastRef.current;
      lastRef.current = t;

      if (!runningRef.current) {
        // en pausa no acumulamos
        accRef.current = 0;
        return;
      }

      const speed = speedRef.current || 1; // 1,2,4
      const tickMs = baseStep / speed;

      accRef.current += dt;

      let guard = 0;
      while (accRef.current >= tickMs && guard < MAX_TICKS_PER_FRAME) {
        const { units: u, projectiles: p } = worldRef.current;
        const { nextUnitsState, nextProjectilesState, newVisualEffects } =
          runSimulationTick(u, p, obstaclesRef.current, adminFlagsRef.current);

        worldRef.current = { units: nextUnitsState, projectiles: nextProjectilesState };
        setUnits(nextUnitsState);
        setProjectiles(nextProjectilesState);
        if (newVisualEffects.length) setVisualEffects(v => [...v, ...newVisualEffects]);

        accRef.current -= tickMs;
        guard++;
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Control play/pause música y correr loop
  useEffect(() => {
    runningRef.current = (gameState === GameState.Simulation);
    if (runningRef.current) resumeMusic(); else pauseMusic();
  }, [gameState]);

  // Resetear acumulador al pausar/reanudar o cambiar velocidad
  useEffect(() => {
    lastRef.current = performance.now();
    accRef.current = 0;
  }, [gameState, simulationSpeed]);

  useEffect(() => {
    if (gameState !== GameState.Simulation) return;

    const livingUnits = units.filter(u => !u.dyingAt);
    const blueUnitsExist = livingUnits.some(u => u.team === Team.Blue);
    const redUnitsExist = livingUnits.some(u => u.team === Team.Red);

    // If both teams still have units, the battle is ongoing.
    if (blueUnitsExist && redUnitsExist) {
      return;
    }
    
    // If one team is eliminated, but there are still projectiles that could affect the outcome, wait.
    if (projectiles.length > 0) {
        return;
    }

    // No units on one side, and no projectiles in the air. The battle is over.
    // A brief delay to allow death animations to play out.
    setTimeout(() => {
        // We re-evaluate inside the timeout to get the final state after any last-second hits.
        const finalLivingUnits = unitsRef.current.filter(u => !u.dyingAt);
        const finalBlueUnits = finalLivingUnits.some(u => u.team === Team.Blue);
        const finalRedUnits = finalLivingUnits.some(u => u.team === Team.Red);

        if (!finalBlueUnits && finalRedUnits) {
          setWinner(Team.Red);
        } else if (finalBlueUnits && !finalRedUnits) {
          setWinner(Team.Blue);
        } else {
          setWinner(null); // Draw
        }
        setGameState(GameState.GameOver);
        stopMusic();

    }, 1000); // Wait for death animation
  }, [units, projectiles, gameState, isTutorialMode]);
  
  useEffect(() => {
      if (winner === Team.Blue) {
          onWin(level);
          // Victory 1.5x más bajo
          playEvent('victory', 1/1.5);
          if (isTutorialMode && tutorialStep < 15) {
            setTutorialStep(15);
          }
      } else if (winner === Team.Red) {
          playEvent('defeat');
      }
  }, [winner]);
  
  const onExitToMenuOrTutorial = () => {
    if (isTutorialMode && tutorialStep === 15) {
      onExitToMenu(); // This special handler is passed from App.tsx
    } else {
      onExit();
    }
  }

  const blueTeamUnits = units.filter(u => u.team === Team.Blue).length;

  const applySpellAt = (spellId: SpellId, x: number, y: number) => {
    const def = ALL_SPELL_TYPES.find(s => s.id === spellId);
    if (!def) return;
    if (spellEnergy < def.battleCost) {
      initAudio();
      playSound('ES_Hit, Boat - Epidemic Sound - 0000-1561.wav', 0.4);
      return;
    }
    initAudio();
    setSpellEnergy(prev => prev - def.battleCost);

    const radius = def.radius;
    const now = Date.now();
    const newVfx: VisualEffect = spellId === 'lightning'
      ? {
          id: `spell_${spellId}_${now}_${Math.random()}`,
          type: 'lightning',
          position: { x, y },
          radius,
          duration: 450,
          startTime: now,
          color: 'rgba(147, 197, 253, 1)'
        }
      : {
          id: `spell_${spellId}_${now}_${Math.random()}`,
          type: 'explosion',
          position: { x, y },
          radius,
          duration: 500,
          startTime: now,
          color: spellId === 'heal' ? 'rgba(74, 222, 128, 0.6)' : spellId === 'rage' ? 'rgba(248, 113, 113, 0.6)' : spellId === 'shield' ? 'rgba(34,211,238,0.5)' : 'rgba(147, 197, 253, 0.8)'
        };
    setVisualEffects(prev => [...prev, newVfx]);
    setTimeout(() => setVisualEffects(prev => prev.filter(v => v.id !== newVfx.id)), newVfx.duration);

    const unitsCopy = unitsRef.current.map(u => ({ ...u }));
    const applyTo = (predicate: (u: Unit) => boolean, fn: (u: Unit) => void) => {
      unitsCopy.forEach(u => { if (predicate(u)) fn(u); });
    };

    if (spellId === 'lightning') {
      playSound('thunder.wav', 0.7);
      // Camera shake
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 220);
      // Lightning damage scaled to 2/5 of an archer's HP
      const archer = ALL_SPELL_TYPES ? null : null; // placeholder to keep diff context
      const archerHp = 80; // from constants
      const damage = Math.round((2/5) * archerHp);
      applyTo(
        (u) => u.team === Team.Red && !u.dyingAt && Math.hypot(u.position.x - x, u.position.y - y) <= radius,
        (u) => {
          u.currentHp -= damage;
          if (u.currentHp <= 0 && !u.dyingAt) {
            u.dyingAt = now;
          }
          // Per-target hit flash
          setVisualEffects(prev => [...prev, {
            id: `vfx_hit_${u.uid}_${now}_${Math.random()}`,
            type: 'hit_flash',
            position: { x: u.position.x, y: u.position.y - 10 },
            radius: 20,
            duration: 250,
            startTime: now,
            color: 'rgba(255,255,255,0.9)'
          }]);
        }
      );
      if (isTutorialMode && tutorialStep === 13) setHasCastLightningOnce(true);
    } else if (spellId === 'heal') {
      playSound('heal-impact.wav', 0.6);
      const heal = 80;
      applyTo(
        (u) => u.team === Team.Blue && !u.dyingAt && Math.hypot(u.position.x - x, u.position.y - y) <= radius,
        (u) => {
          u.currentHp = Math.min(u.hp, u.currentHp + heal);
        }
      );
    } else if (spellId === 'rage') {
      playSound('aura-pulse.wav', 0.5);
      applyTo(
        (u) => u.team === Team.Blue && !u.dyingAt && Math.hypot(u.position.x - x, u.position.y - y) <= radius,
        (u) => {
          u.effects = u.effects.filter(e => e.type !== 'rage');
          u.effects.push({ type: 'rage', duration: 4000, power: 1.5, sourceId: `spell_${now}` });
        }
      );
    } else if (spellId === 'shield') {
      playSound('ice-impact.wav', 0.5);
      applyTo(
        (u) => u.team === Team.Blue && !u.dyingAt && Math.hypot(u.position.x - x, u.position.y - y) <= radius,
        (u) => {
          u.effects = u.effects.filter(e => e.type !== 'shield');
          u.effects.push({ type: 'shield', duration: 4000, power: 0.5, sourceId: `spell_${now}` });
        }
      );
    }
    setUnits(unitsCopy);
  };

  return (
    <div 
        ref={viewportRef}
        className={`w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-900 touch-none ${isShaking ? 'battlefield-shake' : ''}`}
        key={level.id}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
    >
      {useCustomBackground ? (
         <img src={customBgUrl} className="absolute w-full h-full object-cover" alt="Battlefield Background" />
      ) : (
         <LowPolyBackground theme={level.theme || { accents: 'border-blue-400' }} />
      )}
      
      <div
        ref={battlefieldRef}
        className="relative pointer-events-auto"
        style={{
            width: GAME_CONFIG.BATTLEFIELD_WIDTH,
            height: GAME_CONFIG.BATTLEFIELD_HEIGHT,
            transform: `scale(${scale})`,
            transition: 'transform 0.2s ease-out'
        }}
      >
        {/* Camera shake overlay */}
        {isTutorialMode && tutorialStep === 14 && selectedSpellId === 'lightning' && null}
        <Battlefield
            units={units}
            projectiles={projectiles}
            visualEffects={visualEffects}
            onDeleteUnit={handleDeleteUnit}
            selectedUnitType={selectedUnitType}
            gameState={gameState}
            level={level}
            previewInfo={previewInfo}
        />
        {/* Spell target preview */}
        {gameState === GameState.Simulation && selectedSpellId && spellPreview && (
          <div
            className="absolute rounded-full border-2 border-cyan-400/80 pointer-events-none"
            style={{
              left: spellPreview.x - (ALL_SPELL_TYPES.find(s => s.id === selectedSpellId)?.radius || 0),
              top: spellPreview.y - (ALL_SPELL_TYPES.find(s => s.id === selectedSpellId)?.radius || 0),
              width: (ALL_SPELL_TYPES.find(s => s.id === selectedSpellId)?.radius || 0) * 2,
              height: (ALL_SPELL_TYPES.find(s => s.id === selectedSpellId)?.radius || 0) * 2,
              boxShadow: '0 0 12px rgba(34,211,238,0.7) inset, 0 0 12px rgba(34,211,238,0.5)'
            }}
          />
        )}
        {/* Tutorial hint ring for Lightning */}
        {isTutorialMode && tutorialStep === 14 && selectedSpellId === 'lightning' && hintTarget && (
          <div
            className="absolute rounded-full border-2 border-yellow-200 pointer-events-none animate-pulse"
            style={{
              left: hintTarget.x - (ALL_SPELL_TYPES.find(s => s.id === 'lightning')?.radius || 60),
              top: hintTarget.y - (ALL_SPELL_TYPES.find(s => s.id === 'lightning')?.radius || 60),
              width: (ALL_SPELL_TYPES.find(s => s.id === 'lightning')?.radius || 60) * 2,
              height: (ALL_SPELL_TYPES.find(s => s.id === 'lightning')?.radius || 60) * 2,
              zIndex: 1100,
              boxShadow: '0 0 18px rgba(250,250,210,0.9), inset 0 0 10px rgba(250,250,210,0.6)'
            }}
          />
        )}
      </div>

      <header 
          data-interactive-ui
          className="absolute top-0 left-0 w-full flex justify-between items-center text-white pointer-events-auto z-20"
          style={{ background: 'linear-gradient(to bottom, rgba(10, 15, 25, 0.8) 0%, rgba(10, 15, 25, 0.6) 50%, transparent 100%)', padding: '1rem 1.5rem' }}
      >
          {/* Left Info */}
          <div className="flex items-center gap-4 w-1/3">
              <button onClick={onExitToMenuOrTutorial} className="p-2 rounded-full hover:bg-gray-700/80 transition-colors" aria-label="Back to Levels">
                  <BackArrowIcon className="w-6 h-6"/>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.7)]"></div>
                <div>
                    <p className="text-sm font-semibold text-blue-400">BUDGET</p>
                    <p className="text-2xl font-bold">${budget}</p>
                </div>
                {gameState === GameState.Deployment && blueTeamUnits > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="self-center p-2 rounded-full bg-red-900 text-red-400 hover:bg-red-700 hover:text-red-300 transition-colors"
                        aria-label="Clear all placed units"
                        title="Clear All Units"
                    >
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>
          </div>
          
          {/* Central Controls */}
          <div className="flex-1 flex flex-col justify-center items-center">
              <h1 className="text-2xl font-bold">{level.name}</h1>
              <p className="text-sm text-gray-400">World {level.world}</p>
          </div>

          {/* Right Info */}
          <div className="flex items-center justify-end gap-4 w-1/3">
              {gameState === GameState.Deployment && (
                   <button onClick={handleStartSimulation} disabled={blueTeamUnits === 0} className="bg-green-600 hover:bg-green-500 font-bold p-4 rounded-full text-lg shadow-lg transition-transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 animate-pulse-if-ready" data-tutorial-id="start-button">
                      <PlayIcon className="w-8 h-8 text-white"/>
                  </button>
              )}
              {(gameState === GameState.Simulation || gameState === GameState.Paused) && (
                   <div className="flex items-center gap-2 bg-gray-900/60 backdrop-blur-sm p-2 rounded-full shadow-lg" data-tutorial-id="speed-controls">
                      <button onClick={handleSpeedChange} className="w-10 h-10 rounded-full font-bold transition-colors bg-blue-600/80 hover:bg-blue-500/80 shadow-md flex justify-center items-center" aria-label={`Change speed, current: ${simulationSpeed}x`} data-tutorial-id="speed-button">
                         <SpeedCycleIcon speed={simulationSpeed} className="w-6 h-6" />
                      </button>
                      <button onClick={gameState === GameState.Paused ? handleResume : handlePause} className="w-10 h-10 rounded-full font-bold transition-colors hover:bg-gray-700 flex justify-center items-center" aria-label="Pause Game" data-tutorial-id="pause-button">
                           {gameState === GameState.Paused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6 text-white"/>}
                      </button>
                  </div>
              )}
              {/* Settings button removed from here, only available in PauseModal now */}
          </div>
      </header>

      {gameState === GameState.Deployment && (
          <div data-interactive-ui className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <UnitSelectionBar
                unitTypes={unlockedUnits}
                onSelectUnit={handleSelectUnit}
                selectedUnitTypeId={selectedUnitType?.id || null}
                budget={budget}
                isTutorialMode={isTutorialMode}
              />
          </div>
      )}
      {(gameState === GameState.Simulation || gameState === GameState.Paused) && (
        <div data-interactive-ui className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-3 bg-gray-900/70 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 pr-3 mr-2 border-r border-gray-700" data-tutorial-id="spell-energy">
            <span className="text-sm text-gray-300">Energy</span>
            <div className="w-40 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${(spellEnergy/100)*100}%` }}></div>
            </div>
            <span className="text-sm text-cyan-300 font-bold">{spellEnergy}</span>
          </div>
          {availableSpells.map(spell => {
            const isSelected = selectedSpellId === spell.id;
            const canAfford = spellEnergy >= spell.battleCost;
            const assetName = spell.id === 'lightning' ? 'light' : spell.id;
            return (
              <button
                 key={spell.id}
                 onClick={() => {
                   initAudio();
                   playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5);
                   const targeting = spell.targeting || 'manual';
                   if (targeting === 'auto_enemies') {
                     // Cast instantly at the densest enemy cluster
                     const enemies = unitsRef.current.filter(u => u.team === Team.Red && !u.dyingAt);
                     if (enemies.length > 0) {
                       const best = enemies.reduce((best, u) => {
                         const count = enemies.filter(e => Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y) <= spell.radius).length;
                         return count > best.count ? { unit: u, count } : best;
                       }, { unit: enemies[0], count: 1 } as { unit: any, count: number });
                       applySpellAt(spell.id, best.unit.position.x, best.unit.position.y);
                       setSelectedSpellId(null);
                       setSpellPreview(null);
                     } else {
                       // Fallback to manual if no enemies
                       setSelectedSpellId(prev => prev === spell.id ? null : spell.id);
                     }
                   } else {
                     setSelectedSpellId(prev => prev === spell.id ? null : spell.id);
                   }
                 }}
                 disabled={!canAfford}
                 title={`${spell.name} - ${spell.battleCost} energy`}
                 className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'ring-2 ring-cyan-400' : ''} ${canAfford ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 cursor-not-allowed text-gray-400'}`}
                 data-tutorial-id={spell.id === 'lightning' ? 'spell-button-lightning' : undefined}
              >
                 <img 
                   src={spriteUrl(`spells/${assetName}.png`)}
                   alt={spell.name}
                   className={`w-8 h-8 ${!canAfford ? 'opacity-50' : ''}`}
                   style={{ filter: canAfford ? 'drop-shadow(0 0 4px rgba(34,211,238,0.5))' : 'none' }}
                 />
              </button>
            );
          })}
        </div>
      )}
      
      {gameState === GameState.GameOver && winner !== null && (
        <GameOverModal 
            winner={winner} 
            onTryAgain={onTryAgain} 
            onTryAgainWithBoost={async () => {
               await showRewarded(() => {
                 try { sessionStorage.setItem('battle_next_start_energy', '100'); } catch {}
                 onTryAgain();
               });
            }}
            onExit={onExitToMenuOrTutorial} 
            onNextLevel={onNextLevel}
            onClaimBonusReward={onClaimBonusReward}
            reward={level.reward}
            nextLevelUnlocked={level.id < highestLevelUnlocked || level.id < Math.max(...LEVELS.map(l => l.id))}
            levelId={level.id}
            levelName={level.name}
        />
      )}
      {gameState === GameState.Paused && !isTutorialPaused && (
          <PauseModal 
              onResume={handleResume}
              onTryAgain={onTryAgain}
              onOpenConfig={onOpenConfig}
              onExit={onExit}
          />
      )}
      
      {isTutorialMode &&
        FULL_TUTORIAL_STEPS[tutorialStep] &&
        FULL_TUTORIAL_STEPS[tutorialStep].screen === 'battle' &&
        (tutorialStep !== 15 || (gameState === GameState.GameOver && winner === Team.Blue)) && (
          <TutorialOverlay
            step={tutorialStep}
            content={{ ...FULL_TUTORIAL_STEPS[tutorialStep], highlight: highlightCoords }}
            onNext={handleTutorialNext}
          />
        )}


      <style>{`
        .touch-none {
            touch-action: none;
            -ms-touch-action: none;
        }
        @keyframes battlefield-shake {
          0% { transform: translate(0,0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, 2px); }
          80% { transform: translate(2px, -1px); }
          100% { transform: translate(0,0); }
        }
        .battlefield-shake { animation: battlefield-shake 220ms ease-out; }
        @keyframes pulse-ready {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(22, 163, 74, 0);
          }
        }
        .animate-pulse-if-ready:not(:disabled) {
          animation: pulse-ready 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default BattleScreen;