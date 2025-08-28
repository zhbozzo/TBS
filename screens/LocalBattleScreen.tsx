import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { spriteUrl } from '@/src/assetsLoader';
import type { Unit, UnitType, GameState as GameStateEnum, Team as TeamEnum, Projectile, GameSettings, VisualEffect, LevelTheme } from '../types';
import { Team, GameState } from '../types';
import { runSimulationTick } from '../services/gameLogic';
import { initAudio, playSound, playMusic, stopMusic, pauseMusic, resumeMusic, setMasterVolume, playEvent } from '../services/audioService';
import Battlefield from '../components/Battlefield';
import UnitSelectionBar from '../components/UnitSelectionBar';
import GameOverModal from '../components/GameOverModal';
import PauseModal from '../components/PauseModal';
import { GAME_CONFIG } from '../constants';
import { BackArrowIcon, PauseIcon, SpeedCycleIcon, GearIcon, PlayIcon, TrashIcon } from '../components/Icons';
import LowPolyBackground from '../components/LowPolyBackground';

interface LocalBattleScreenProps {
  mode: 'open' | 'private';
  unlockedUnits: UnitType[];
  gameSettings: GameSettings;
  onOpenConfig: () => void;
  onExit: () => void;
}

const MAX_TICKS_PER_FRAME = 10; // Prevents browser freeze on high speed
const localBattleTheme: LevelTheme = { accents: 'border-blue-400', baseColors: ['#1e3a8a', '#1e40af', '#1d4ed8'] };


const LocalBattleScreen: React.FC<LocalBattleScreenProps> = ({ mode, unlockedUnits, gameSettings, onOpenConfig, onExit }) => {
  const [gameState, setGameState] = useState<GameStateEnum>(GameState.Deployment);
  const [deploymentTurn, setDeploymentTurn] = useState<Team>(Team.Blue);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([]);
  const [budgetBlue, setBudgetBlue] = useState<number>(0);
  const [budgetRed, setBudgetRed] = useState<number>(0);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [winner, setWinner] = useState<TeamEnum | null>(null);

  const [battleKey, setBattleKey] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  
  const [previewInfo, setPreviewInfo] = useState<{ x: number; y: number; isColliding: boolean, team: Team } | null>(null);
  const isPointerDownRef = useRef(false);
  const lastPlacementTimeRef = useRef(0);
  const battlefieldRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);

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

  const resetBattle = () => {
    setGameState(GameState.Deployment);
    setDeploymentTurn(Team.Blue);
    setIsTransitioning(false);
    setUnits([]);
    setProjectiles([]);
    setVisualEffects([]);
    setBudgetBlue(0);
    setBudgetRed(0);
    setSelectedUnitType(null);
    setSimulationSpeed(1);
    setWinner(null);
    stopMusic();
    setBattleKey(k => k + 1);
  };

  useEffect(() => {
    setMasterVolume('music', gameSettings.musicVolume);
    setMasterVolume('sfx', gameSettings.sfxVolume);
  }, [gameSettings]);

  useEffect(() => {
    // This effect now only handles cleanup for music on unmount/re-key
    return () => stopMusic();
  }, [battleKey]);

  const handleSelectUnit = (unitType: UnitType) => {
    setSelectedUnitType(prev => (prev?.id === unitType.id ? null : unitType));
  };

  const handlePlaceUnit = (position: { x: number; y: number }, team: Team) => {
    if (gameState !== GameState.Deployment || !selectedUnitType) return;
    
    initAudio();
    playEvent('place_unit');

    const newUnit: Unit = {
      ...selectedUnitType,
      uid: `unit_${team}_${units.length}_${Date.now()}`,
      team,
      position,
      rotation: team === Team.Blue ? 90 : -90,
      currentHp: selectedUnitType.hp,
      targetId: null,
      lastAttackTime: 0,
      attackCooldown: selectedUnitType.attackCooldown || (1000 + Math.random() * 500),
      effects: [],
      waypoint: null,
    };

    setUnits(prevUnits => [...prevUnits, newUnit]);
    if (team === Team.Blue) {
        setBudgetBlue(prev => prev + selectedUnitType.cost);
    } else {
        setBudgetRed(prev => prev + selectedUnitType.cost);
    }
  };
  
  const handleDeleteUnit = (unitId: string) => {
    const unitToDelete = units.find(u => u.uid === unitId);
    if (unitToDelete) {
        if(unitToDelete.team === Team.Blue) setBudgetBlue(prev => prev - unitToDelete.cost);
        else setBudgetRed(prev => prev - unitToDelete.cost);
        setUnits(prev => prev.filter(u => u.uid !== unitId));
    }
  };

   const handleClearAll = () => {
    if (gameState !== GameState.Deployment) return;
     if (mode === 'private') {
        setUnits(prev => prev.filter(u => u.team !== deploymentTurn));
        if (deploymentTurn === Team.Blue) setBudgetBlue(0);
        else setBudgetRed(0);
    } else {
        setUnits([]);
        setBudgetBlue(0);
        setBudgetRed(0);
    }
  };
  
  const getGameCoordsFromEvent = (e: React.PointerEvent<HTMLDivElement>): { x: number; y: number } | null => {
      const rect = battlefieldRef.current?.getBoundingClientRect();
      if (!rect) return null;
      
      const scaleValue = rect.width / GAME_CONFIG.BATTLEFIELD_WIDTH;
      const x = (e.clientX - rect.left) / scaleValue;
      const y = (e.clientY - rect.top) / scaleValue;
      
      return { x, y };
  };

  const attemptPlacement = useCallback((x: number, y: number, isColliding: boolean, team: Team) => {
    const PLACEMENT_COOLDOWN = 150; // ms
    const now = Date.now();
    if (now - lastPlacementTimeRef.current < PLACEMENT_COOLDOWN) return;

    if (gameState !== GameState.Deployment || !selectedUnitType || isColliding) return;
    handlePlaceUnit({ x, y }, team);
    lastPlacementTimeRef.current = now;
  }, [gameState, selectedUnitType]);
  
  const updatePreviewInfo = (x: number, y: number) => {
      if (!selectedUnitType) {
          setPreviewInfo(null);
          return { isColliding: true, team: Team.Blue };
      }

      const getUnitSize = (unit: UnitType | Unit) => unit.role === 'Boss' ? 80 : 40;
      const unitRadius = getUnitSize(selectedUnitType) / 2;

      const clampedX = Math.max(unitRadius, Math.min(x, GAME_CONFIG.BATTLEFIELD_WIDTH - unitRadius));
      const clampedY = Math.max(unitRadius, Math.min(y, GAME_CONFIG.BATTLEFIELD_HEIGHT - unitRadius));

      let team = Team.Blue;
      let isPlaceableX = false;
      
      if(mode === 'open') {
        if (x >= unitRadius && x <= GAME_CONFIG.PLACEMENT_ZONE_WIDTH - unitRadius) {
            isPlaceableX = true;
            team = Team.Blue;
        } else if (x >= GAME_CONFIG.BATTLEFIELD_WIDTH - GAME_CONFIG.PLACEMENT_ZONE_WIDTH + unitRadius && x <= GAME_CONFIG.BATTLEFIELD_WIDTH - unitRadius) {
            isPlaceableX = true;
            team = Team.Red;
        }
      } else { // Private mode
        team = deploymentTurn;
        if (team === Team.Blue) {
            isPlaceableX = x >= unitRadius && x <= GAME_CONFIG.PLACEMENT_ZONE_WIDTH - unitRadius;
        } else { // Red's turn
            isPlaceableX = x >= GAME_CONFIG.BATTLEFIELD_WIDTH - GAME_CONFIG.PLACEMENT_ZONE_WIDTH + unitRadius && x <= GAME_CONFIG.BATTLEFIELD_WIDTH - unitRadius;
        }
      }
      
      const isPlaceableY = y >= unitRadius && y <= GAME_CONFIG.BATTLEFIELD_HEIGHT - unitRadius;
      
      const isCollidingWithUnit = units.some(unit => {
          const existingUnitRadius = getUnitSize(unit) / 2;
          const combinedRadius = unitRadius + existingUnitRadius;
          const distance = Math.sqrt(Math.pow(x - unit.position.x, 2) + Math.pow(y - unit.position.y, 2));
          return distance < combinedRadius;
      });

      const isColliding = !isPlaceableX || !isPlaceableY || isCollidingWithUnit;
      
      setPreviewInfo({ x: clampedX, y: clampedY, isColliding, team });
      return { isColliding, team };
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== GameState.Deployment || !selectedUnitType) return;
    const gameCoords = getGameCoordsFromEvent(e);
    if (!gameCoords) return;

    const { x, y } = gameCoords;
    const { isColliding, team } = updatePreviewInfo(x, y);

    if (isPointerDownRef.current) {
      attemptPlacement(x, y, isColliding, team);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-interactive-ui]')) return;
    if (gameState !== GameState.Deployment || !selectedUnitType) return;
    isPointerDownRef.current = true;
    
    const gameCoords = getGameCoordsFromEvent(e);
    if (!gameCoords) return;

    const { x, y } = gameCoords;
    const { isColliding, team } = updatePreviewInfo(x, y);

    attemptPlacement(x, y, isColliding, team);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handlePointerLeave = () => {
    isPointerDownRef.current = false;
    setPreviewInfo(null);
  };

  const handleReadyForNextPlayer = () => {
    setIsTransitioning(true);
    setTimeout(() => {
        setDeploymentTurn(Team.Red);
        setSelectedUnitType(null);
        setIsTransitioning(false);
    }, 2500);
  };

  const handleStartSimulation = () => {
    if (gameState === GameState.Deployment) {
      initAudio();
      // Música genérica para batallas locales
      // Música de batalla local, volumen 3x menor
      playMusic('ES_Conquer The Battle 3 - Fredrik Ekström (Version becf635b) - fullmix_preview.mp3', true, 1/3);
      setGameState(GameState.Simulation);
      setSelectedUnitType(null);
    }
  };
  
  const handleSpeedChange = () => {
    setSimulationSpeed(currentSpeed => {
        if (currentSpeed === 1) return 2;
        if (currentSpeed === 2) return 4;
        return 1; // Cycle back to 1
    });
  };

  const handlePause = () => gameState === GameState.Simulation && setGameState(GameState.Paused);
  const handleResume = () => gameState === GameState.Paused && setGameState(GameState.Simulation);
  
  const unitsRef = useRef(units);
  useEffect(() => { unitsRef.current = units; }, [units]);
  const projectilesRef = useRef(projectiles);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);

  const runTick = useCallback(() => {
    const { nextUnitsState, nextProjectilesState, newVisualEffects } = runSimulationTick(
      unitsRef.current,
      projectilesRef.current,
      [],
      { godMode: false, instaKill: false }
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
  }, []);
  
  const savedTick = useRef(runTick);
  useEffect(() => { savedTick.current = runTick; }, [runTick]);

  useEffect(() => {
    if (gameState === GameState.Simulation) resumeMusic();
    else pauseMusic();
    
    if (gameState !== GameState.Simulation) {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const loop = (timestamp: number) => {
      animationFrameId.current = requestAnimationFrame(loop);
      
      const effectiveSpeed = simulationSpeed === 4 ? 6 : simulationSpeed;
      const tickDuration = GAME_CONFIG.SIMULATION_TICK_MS / effectiveSpeed;
      let ticksThisFrame = 0;
      
      while (timestamp - lastTickTimeRef.current >= tickDuration && ticksThisFrame < MAX_TICKS_PER_FRAME) {
        savedTick.current();
        lastTickTimeRef.current += tickDuration;
        ticksThisFrame++;
      }
    };

    lastTickTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(loop);
    return () => { if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current); };
  }, [gameState, simulationSpeed]);

  useEffect(() => {
    if (gameState !== GameState.Simulation) return;

    const livingUnits = units.filter(u => !u.dyingAt);
    const blueUnitsExist = livingUnits.some(u => u.team === Team.Blue);
    const redUnitsExist = livingUnits.some(u => u.team === Team.Red);

    if (blueUnitsExist && redUnitsExist) return;
    
    if (projectiles.length > 0) return;

    setTimeout(() => {
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
    }, 1000);
  }, [units, projectiles, gameState]);
  
  const blueUnitsCount = units.filter(u => u.team === Team.Blue).length;
  const redUnitsCount = units.filter(u => u.team === Team.Red).length;
  
  const unitsToDisplay = gameState === GameState.Deployment && mode === 'private'
    ? units.filter(u => u.team === deploymentTurn)
    : units;
    
  const showBlueTeamInfo = mode === 'open' || (mode === 'private' && deploymentTurn === Team.Blue);
  const showRedTeamInfo = mode === 'open' || (mode === 'private' && deploymentTurn === Team.Red);


  return (
    <div 
        ref={viewportRef}
        className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gray-900 touch-none"
        key={battleKey}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
    >
      {/* Fondo solicitado para local battle */}
      <img src={spriteUrl('Terrain/battlefield.png')} className="absolute w-full h-full object-cover" alt="Battlefield Background" />
      
      {isTransitioning && (
        <div className="absolute top-[env(safe-area-inset-top)] right-[env(safe-area-inset-right)] bottom-[env(safe-area-inset-bottom)] left-[env(safe-area-inset-left)] bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
            <h2 className="text-5xl font-bold text-red-400">Player 2's Turn</h2>
            <p className="text-xl text-gray-300 mt-4">Red team, prepare for deployment!</p>
        </div>
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
        <Battlefield
            units={unitsToDisplay}
            projectiles={projectiles}
            visualEffects={visualEffects}
            onDeleteUnit={handleDeleteUnit}
            selectedUnitType={selectedUnitType}
            gameState={gameState}
            level={null}
            showRedZone={mode === 'open' || (mode === 'private' && deploymentTurn === Team.Red)}
            previewInfo={previewInfo}
        />
      </div>

      <header 
          data-interactive-ui
          className="absolute top-0 left-0 w-full flex justify-between items-center text-white pointer-events-auto z-20"
          style={{ background: 'linear-gradient(to bottom, rgba(10, 15, 25, 0.8) 0%, rgba(10, 15, 25, 0.6) 50%, transparent 100%)', padding: '1rem 1.5rem' }}
      >
          {/* Left Side */}
          <div className="flex items-center gap-4 w-1/3">
              <button onClick={onExit} className="p-2 rounded-full hover:bg-gray-700/80 transition-colors" aria-label="Back to Menu">
                  <BackArrowIcon className="w-6 h-6"/>
              </button>
              {gameState === GameState.Deployment && units.length > 0 && (
                <button
                    onClick={handleClearAll}
                    className="p-2 rounded-full bg-red-900 text-red-400 hover:bg-red-700 hover:text-red-300 transition-colors"
                    aria-label="Clear all placed units"
                    title={mode === 'private' ? `Clear ${deploymentTurn === Team.Blue ? 'Blue' : 'Red'} Units` : 'Clear All Units'}
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
              )}
              {showBlueTeamInfo && (
                <>
                  <div className="w-1.5 h-10 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.7)]"></div>
                  <div>
                      <p className="text-sm font-semibold text-blue-400">BLUE TEAM</p>
                      <p className="text-2xl font-bold">${budgetBlue}</p>
                      <p className="text-xs text-gray-400">{blueUnitsCount} Units</p>
                  </div>
                </>
              )}
          </div>
          
          {/* Center */}
          <div className="flex-1 flex justify-center items-center">
             {(gameState === GameState.Simulation || gameState === GameState.Paused) && (
                   <div className="flex items-center gap-2 bg-gray-900/60 backdrop-blur-sm p-2 rounded-full shadow-lg">
                      <button onClick={handleSpeedChange} className="w-10 h-10 rounded-full font-bold transition-colors bg-blue-600/80 hover:bg-blue-500/80 shadow-md flex justify-center items-center" aria-label={`Change speed, current: ${simulationSpeed}x`}>
                         <SpeedCycleIcon speed={simulationSpeed} className="w-6 h-6" />
                      </button>
                      <button onClick={gameState === GameState.Paused ? handleResume : handlePause} className="w-10 h-10 rounded-full font-bold transition-colors hover:bg-gray-700 flex justify-center items-center" aria-label="Pause Game">
                           {gameState === GameState.Paused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6 text-white"/>}
                      </button>
                  </div>
              )}
              {gameState === GameState.Deployment && mode === 'private' && deploymentTurn === Team.Blue && (
                    <button onClick={handleReadyForNextPlayer} disabled={blueUnitsCount === 0} className="bg-blue-600 hover:bg-blue-500 font-bold px-6 py-3 rounded-lg text-lg shadow-lg transition-transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                      Player 1 Ready
                  </button>
              )}
              {gameState === GameState.Deployment && (mode === 'open' || (mode === 'private' && deploymentTurn === Team.Red)) && (
                   <button onClick={handleStartSimulation} disabled={blueUnitsCount === 0 || redUnitsCount === 0} className="bg-green-600 hover:bg-green-500 font-bold p-4 rounded-full text-lg shadow-lg transition-transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 animate-pulse-if-ready">
                      <PlayIcon className="w-8 h-8 text-white"/>
                  </button>
              )}
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-4 w-1/3">
              {showRedTeamInfo && (
                <>
                  <div className="text-right">
                      <p className="text-sm font-semibold text-red-400">RED TEAM</p>
                      <p className="text-2xl font-bold">${budgetRed}</p>
                      <p className="text-xs text-gray-400">{redUnitsCount} Units</p>
                  </div>
                  <div className="w-1.5 h-10 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.7)]"></div>
                </>
              )}
          </div>
      </header>

      {gameState === GameState.Deployment && (
          <div data-interactive-ui className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <UnitSelectionBar
                unitTypes={unlockedUnits}
                onSelectUnit={handleSelectUnit}
                selectedUnitTypeId={selectedUnitType?.id || null}
                budget={null}
              />
          </div>
      )}
      
      {gameState === GameState.GameOver && (
        <GameOverModal 
          winner={winner} 
          onTryAgain={resetBattle} 
          onExit={onExit}
          isLocal={true}
        />
      )}
      {gameState === GameState.Paused && (
          <PauseModal 
              onResume={handleResume}
              onTryAgain={resetBattle}
              onOpenConfig={onOpenConfig}
              onExit={onExit}
          />
      )}

      <style>{`
        .touch-none {
            touch-action: none;
            -ms-touch-action: none;
        }
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
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LocalBattleScreen;