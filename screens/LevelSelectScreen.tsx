

import React, { useState, useMemo, useLayoutEffect, useRef, useEffect } from 'react';
import { initAudio, playSound } from '../services/audioService';
import type { Level } from '../types';
import { GoldIcon, DragonIcon, GolemIcon, SandwormIcon, PrismGuardIcon, IceGiantIcon } from '../components/Icons';
import TutorialOverlay, { type HighlightCoordinates } from '../components/TutorialOverlay';
import { FULL_TUTORIAL_STEPS } from '../tutorial';

interface LevelSelectScreenProps {
  levels: Level[];
  highestLevelUnlocked: number;
  highestWorldUnlocked: number;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
}

const LockIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg className={`${className} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
    </svg>
);

const worldDetails: { [key: number]: { name: string, description: string, theme: string, position: { top: string, left: string }, icon: React.FC<{className?: string}> } } = {
    1: { name: "Verdant Plains", description: "Lush forests and open fields.", theme: "text-green-400 border-green-500", position: { top: '65%', left: '15%' }, icon: GolemIcon },
    2: { name: "Arid Wastes", description: "Scorching deserts and canyons.", theme: "text-yellow-500 border-yellow-600", position: { top: '35%', left: '32.5%' }, icon: SandwormIcon },
    3: { name: "Crystal Spires", description: "A mystical land of illusions.", theme: "text-indigo-400 border-indigo-500", position: { top: '65%', left: '50%' }, icon: PrismGuardIcon },
    4: { name: "Volcanic Heart", description: "Rivers of magma and ash.", theme: "text-red-500 border-red-600", position: { top: '35%', left: '67.5%' }, icon: DragonIcon },
    5: { name: "Glacial Frontier", description: "Frozen peaks and icy dangers.", theme: "text-cyan-300 border-cyan-400", position: { top: '65%', left: '85%' }, icon: IceGiantIcon },
};

const isBossLevel = (level: Level): boolean => {
    return level.enemyUnits.some(unit => unit.role === 'Boss');
};

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ levels, highestLevelUnlocked, highestWorldUnlocked, onSelectLevel, onBack, tutorialStep, setTutorialStep }) => {
  const [viewMode, setViewMode] = useState<'worlds' | 'levels'>('worlds');
  const [selectedWorld, setSelectedWorld] = useState<number | null>(null);
  const [highlightCoords, setHighlightCoords] = useState<HighlightCoordinates>(null);

  const currentTutorialStep = FULL_TUTORIAL_STEPS[tutorialStep];
  const tutorialScreenType = viewMode === 'worlds' ? 'world_select' : 'level_select';
  const showTutorial = currentTutorialStep?.screen === tutorialScreenType;

  useEffect(() => {
    if (showTutorial && currentTutorialStep.highlightTarget) {
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-tutorial-id="${currentTutorialStep.highlightTarget}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, shape: 'rect' });
        }
      }, 100); // Small delay for layout to settle
      return () => clearTimeout(timer);
    } else {
      setHighlightCoords(null);
    }
  }, [showTutorial, currentTutorialStep, viewMode]);

  const worlds = useMemo(() => {
    const worldSet = new Set(levels.map(l => l.world));
    return Array.from(worldSet).sort((a, b) => a - b);
  }, [levels]);

  const levelsForSelectedWorld = useMemo(() => {
    if (!selectedWorld) return [];
    return levels.filter(l => l.world === selectedWorld).sort((a,b) => a.id - b.id);
  }, [levels, selectedWorld]);
  
  const { bossLevel, nonBossLevels } = useMemo(() => {
    const boss = levelsForSelectedWorld.find(isBossLevel);
    const nonBoss = levelsForSelectedWorld.filter(l => !isBossLevel(l));
    return { bossLevel: boss, nonBossLevels: nonBoss };
  }, [levelsForSelectedWorld]);

  // Level layout constants
  const levelsPerColumn = 3;
  const hSpacing = 280;
  const vSpacing = 220;
  const hPadding = 150;
  const vPadding = 120;

  const numNonBossLevels = nonBossLevels.length;
  const numNonBossCols = Math.ceil(numNonBossLevels / levelsPerColumn);
  // if there is a boss, add an extra column for it.
  const numCols = bossLevel ? numNonBossCols + 1 : numNonBossCols;
  const levelsContainerWidth = hPadding * 2 + (numCols - 1) * hSpacing;

  const levelPathPoints = useMemo(() => {
    const points = nonBossLevels.map((level, index) => {
      const col = Math.floor(index / levelsPerColumn);
      let row = index % levelsPerColumn;

      if (col % 2 !== 0) { // Snake pattern for rows
        row = levelsPerColumn - 1 - row;
      }

      const x = hPadding + col * hSpacing;
      const y = vPadding + row * vSpacing;
      return { x, y, row, col, level };
    });
    
    if (bossLevel) {
        const bossCol = numNonBossCols;
        const bossRow = Math.floor(levelsPerColumn / 2); // Middle row
        const x = hPadding + bossCol * hSpacing;
        const y = vPadding + bossRow * vSpacing;
        points.push({ x, y, row: bossRow, col: bossCol, level: bossLevel });
    }
    
    return points;
  }, [nonBossLevels, bossLevel, numNonBossCols, hPadding, vPadding, hSpacing, vSpacing]);

  const totalLevelPathD = useMemo(() => {
    if (levelPathPoints.length < 1) return "";
    let d = `M${levelPathPoints[0].x} ${levelPathPoints[0].y}`;

    for (let i = 1; i < levelPathPoints.length; i++) {
        const p_curr = levelPathPoints[i];
        const p_prev = levelPathPoints[i - 1];
        
        if (p_curr.col > p_prev.col) { // Transitioning to a new column (S-curve)
            const c1x = p_prev.x + hSpacing * 0.6;
            const c1y = p_prev.y;
            const c2x = p_curr.x - hSpacing * 0.6;
            const c2y = p_curr.y;
            d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p_curr.x},${p_curr.y}`;
        } else { // Moving vertically within a column
            d += ` L ${p_curr.x},${p_curr.y}`;
        }
    }
    return d;
  }, [levelPathPoints, hSpacing]);

  const completedLevelPathPoints = useMemo(() => {
    return levelPathPoints.filter(p => p.level.id <= highestLevelUnlocked);
  }, [levelPathPoints, highestLevelUnlocked]);
  
  const completedLevelPathD = useMemo(() => {
    if (completedLevelPathPoints.length < 2) return "";
    let d = `M${completedLevelPathPoints[0].x} ${completedLevelPathPoints[0].y}`;
    for (let i = 1; i < completedLevelPathPoints.length; i++) {
        const p_curr = completedLevelPathPoints[i];
        const p_prev = completedLevelPathPoints[i-1];
        if (p_curr.col > p_prev.col) {
            const c1x = p_prev.x + hSpacing * 0.6;
            const c1y = p_prev.y;
            const c2x = p_curr.x - hSpacing * 0.6;
            const c2y = p_curr.y;
            d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p_curr.x},${p_curr.y}`;
        } else {
            d += ` L ${p_curr.x},${p_curr.y}`;
        }
    }
    return d;
  }, [completedLevelPathPoints, hSpacing]);

  const totalWorldPathD = useMemo(() => {
    if (worlds.length < 2) return "";
    const path = worlds
        .map(wNum => worldDetails[wNum])
        .filter(Boolean)
        .map(details => `${parseInt(details.position.left, 10)} ${parseInt(details.position.top, 10)}`)
        .join(' L ');
    return `M ${path}`;
  }, [worlds]);
  
  const completedWorldPathD = useMemo(() => {
      if (worlds.length < 2 || highestWorldUnlocked <= 1) return "";
      const path = worlds
          .slice(0, highestWorldUnlocked)
          .map(wNum => worldDetails[wNum])
          .filter(Boolean)
          .map(details => `${parseInt(details.position.left, 10)} ${parseInt(details.position.top, 10)}`)
          .join(' L ');
      return `M ${path}`;
  }, [worlds, highestWorldUnlocked]);

  const handleSelectWorld = (worldNum: number) => {
    if (worldNum <= highestWorldUnlocked) {
        if (showTutorial && worldNum === 1) {
            setTutorialStep(tutorialStep + 1);
        }
        setSelectedWorld(worldNum);
        setViewMode('levels');
    }
  };

  const handleBack = () => {
    if (viewMode === 'levels') {
      setViewMode('worlds');
      setSelectedWorld(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col bg-gray-900 text-white overflow-hidden">
      <header className="w-full flex justify-between items-center mb-8 px-4">
        <button 
            onClick={handleBack}
            onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
            className="px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gray-600 hover:bg-gray-500 text-white"
        >
            &larr; {viewMode === 'levels' ? 'Worlds' : 'Main Menu'}
        </button>
        <h1 className="text-4xl font-bold text-yellow-400 tracking-wider text-center">
            {viewMode === 'worlds' ? 'Campaign Map' : `World ${selectedWorld}: ${worldDetails[selectedWorld!].name}`}
        </h1>
        <div className="w-40"></div>
      </header>
      
      <main className="flex-grow w-full relative bg-gray-800/20 rounded-2xl border border-gray-700 overflow-y-hidden px-4"
            style={{ overflowX: viewMode === 'levels' ? 'auto' : 'hidden' }}
      >
        {/* Worlds View */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${viewMode === 'worlds' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            
            <svg width="100%" height="100%" className="absolute inset-0 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="worldPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>
                <path
                    d={totalWorldPathD}
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray="2 1"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d={completedWorldPathD}
                    fill="none"
                    stroke="url(#worldPathGradient)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray="2 1"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            
            {worlds.map(worldNum => {
                const isUnlocked = worldNum <= highestWorldUnlocked;
                const details = worldDetails[worldNum];
                if (!details) return null;
                return (
                    <div 
                        key={worldNum} 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ top: details.position.top, left: details.position.left }}
                    >
                        <button
                            onClick={() => handleSelectWorld(worldNum)}
                            onMouseDown={() => { initAudio(); playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5); }}
                            disabled={!isUnlocked}
                            data-tutorial-id={`world-${worldNum}-button`}
                            className={`flex flex-col items-center justify-center p-4 rounded-full border-4 transition-all duration-300 group
                                ${isUnlocked ? `${details.theme.split(' ')[1]} ${details.theme.split(' ')[0]} bg-gray-800 hover:bg-gray-700 hover:scale-110 shadow-lg hover:shadow-current` : 'border-gray-700 bg-gray-800 text-gray-500'}`}
                        >
                            {isUnlocked ? React.createElement(details.icon, {className: 'w-16 h-16'}) : <LockIcon className="w-16 h-16"/>}
                            <span className={`mt-2 text-lg font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'} group-hover:text-yellow-300`}>{details.name}</span>
                        </button>
                    </div>
                )
            })}
        </div>

        {/* Levels View */}
        <div className={`absolute inset-y-0 left-0 h-full transition-opacity duration-500 ${viewMode === 'levels' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
             style={{ width: `${levelsContainerWidth}px`, minWidth: '100%' }}
        >
            <svg width={levelsContainerWidth} height="100%" className="absolute inset-0">
                <defs>
                    <linearGradient id="levelPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fde047" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>
                <path
                    d={totalLevelPathD}
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="20 10"
                />
                 <path
                    d={completedLevelPathD}
                    fill="none"
                    stroke="url(#levelPathGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="20 10"
                />
            </svg>
            {levelPathPoints.map((p) => {
                const level = p.level;
                const isUnlocked = level.id <= highestLevelUnlocked + 1;
                const isCompleted = level.id <= highestLevelUnlocked;
                const isBoss = isBossLevel(level);
                
                return (
                    <div 
                        key={level.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${p.x}px`, top: `${p.y}px`}}
                    >
                        <button
                            onClick={isUnlocked ? () => onSelectLevel(level) : undefined}
                            onMouseDown={(e) => {
                                if (!isUnlocked) return;
                                // Evitar doble disparo del sonido por bubbling
                                e.stopPropagation();
                                initAudio();
                                playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5);
                            }}
                            data-tutorial-id={`level-${level.id}-button`}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all duration-300 group
                                ${isBoss ? 'w-44 h-44' : 'w-36 h-36'}
                                ${isUnlocked ? `border-gray-500 bg-gray-800/80 backdrop-blur-sm ${isBoss ? 'hover:border-red-400' : 'hover:border-yellow-400'} hover:scale-110 cursor-pointer` : 'border-gray-700 bg-gray-800/50 text-gray-500'}
                                ${isCompleted ? `${isBoss ? '!border-red-500 shadow-lg shadow-red-500/30' : '!border-yellow-400 shadow-lg shadow-yellow-400/20'}` : ''}
                                ${!isCompleted && isBoss ? '!border-red-600' : ''}
                            `}
                        >
                        {isUnlocked ? (
                            <>
                                <div className={`absolute -top-4 bg-gray-700 px-3 py-0.5 rounded-full text-sm font-bold ${isCompleted ? 'text-yellow-300' : 'text-gray-300'} ${isBoss && isCompleted ? '!text-red-300' : ''}`}>
                                    {isBoss ? 'BOSS' : level.id}
                                </div>
                                <div className="text-center">
                                    <h3 className={`font-bold text-white leading-tight ${isBoss ? 'text-xl' : 'text-base'}`}>{level.name}</h3>
                                    <p className="text-gray-400 text-xs mt-1">Budget: ${level.budget}</p>
                                </div>
                                <div className={`mt-2 pt-2 border-t w-full text-center ${isCompleted ? 'border-yellow-400/50' : 'border-gray-600'} ${isBoss && isCompleted ? '!border-red-500/50' : ''}`}>
                                    <div className="flex items-center justify-center text-xs">
                                        <span className={`font-bold ${isCompleted ? 'text-yellow-300' : 'text-yellow-500'}`}>{level.reward}</span>
                                        <GoldIcon className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </>
                        ) : (
                             <LockIcon className="w-10 h-10"/>
                        )}
                        </button>
                    </div>
                );
            })}
        </div>
        
        {showTutorial && (
            <TutorialOverlay
                step={tutorialStep}
                content={{ ...currentTutorialStep, highlight: highlightCoords }}
            />
        )}
      </main>
    </div>
  );
};

export default LevelSelectScreen;
