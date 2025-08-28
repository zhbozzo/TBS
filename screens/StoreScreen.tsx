
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { UnitType, SpellType, SpellId } from '../types';
import type { RoulettePrize, AdsWatchedState } from '../App';
import InfoTooltip from '../components/InfoTooltip';
import { GoldIcon, PlusIcon, QuestionMarkIcon, PlayCircleIcon } from '../components/Icons';
import { playSound, initAudio } from '../services/audioService';
import TutorialOverlay, { type HighlightCoordinates } from '../components/TutorialOverlay';
import { FULL_TUTORIAL_STEPS } from '../tutorial';

interface StoreScreenProps {
  allUnits: UnitType[];
  unlockedUnitIds: string[];
  playerGold: number;
  onBuyUnit: (unitType: UnitType) => void;
  onExit: () => void;
  onGoToGetGold: () => void;
  highestWorldUnlocked: number;
  onStartSpin: () => void;
  onPrizeWon: (prize: RoulettePrize) => void;
  isAdFree: boolean;
  adsForSpinsWatchedState: AdsWatchedState;
  onAttemptAdSpin: () => boolean;
  tutorialStep?: number;
  allSpells: SpellType[];
  unlockedSpellIds: SpellId[];
  onBuySpell: (spell: SpellType) => void;
}

const MAX_STATS = {
  hp: 600,
  damage: 50,
  attackRange: 280,
  speed: 3,
};

const StatBar: React.FC<{label: string, value: number, maxValue: number, colorClass: string}> = ({ label, value, maxValue, colorClass }) => {
    const percentage = Math.min(100, (value / maxValue) * 100);
    return (
        <div className="grid grid-cols-6 gap-2 items-center">
            <span className="col-span-2 text-gray-400 text-sm">{label}</span>
            <div className="col-span-3 bg-gray-900 rounded-full h-3.5 border border-gray-600">
                <div 
                    className={`${colorClass} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="font-semibold text-white text-right text-sm">{value}</span>
        </div>
    );
};

// --- Brainrot Selector Component ---
const BrainrotSelector: React.FC<{
    spinId: string;
    winnerId: string;
    allUnits: UnitType[];
    unlockedUnitIds: string[];
    onClose: (spinId: string, winnerId: string) => void;
}> = ({ spinId, winnerId, allUnits, unlockedUnitIds, onClose }) => {
    const reelRef = useRef<HTMLDivElement>(null);
    const [isSpinning, setIsSpinning] = useState(true);
    const [showResultText, setShowResultText] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const brainrotUnitIds = ['tuc_tuc_tuc_sahur', 'tralalero_tralala', 'bombardino_crocodilo'];
    const brainrotUnits = useMemo(() => allUnits
        .filter(u => 
            brainrotUnitIds.includes(u.id) &&
            !unlockedUnitIds.includes(u.id)
        )
        .sort((a,b) => brainrotUnitIds.indexOf(a.id) - brainrotUnitIds.indexOf(b.id)),
    [allUnits, unlockedUnitIds]);

    const winningUnit = useMemo(() => allUnits.find(u => u.id === winnerId)!, [allUnits, winnerId]);

    const reelItems = useMemo(() => {
        if (brainrotUnits.length === 0) {
           if(winningUnit) return [winningUnit, winningUnit, winningUnit, winningUnit, winningUnit];
           return [];
        }
        const base = brainrotUnits;
        const repeated = [];
        for (let i = 0; i < 30; i++) {
            repeated.push(...base);
        }
        return repeated;
    }, [brainrotUnits, winningUnit]);

    useEffect(() => {
        if (!reelRef.current || reelItems.length === 0 || !winningUnit) return;

        const reel = reelRef.current;
        const firstChild = reel.firstElementChild as HTMLElement | null;
        const itemHeight = firstChild?.getBoundingClientRect().height ?? 224;

        const winningUnitIndexInBase = brainrotUnits.findIndex(u => u.id === winningUnit.id);

        if (winningUnitIndexInBase === -1) {
            console.error("Winner not found in brainrot units list. This shouldn't happen.");
            onClose(spinId, winnerId);
            return;
        }

        const startRepetition = 2;
        const targetRepetition = 25; 
        const startIndex = (startRepetition * brainrotUnits.length) + winningUnitIndexInBase;
        const targetIndex = (targetRepetition * brainrotUnits.length) + winningUnitIndexInBase;
        const finalTranslateY = Math.round(targetIndex * itemHeight);
        
        setHighlightedIndex(targetIndex);

        // Pre-position the reel without transition for an instant start
        reel.style.transition = 'none';
        reel.style.transform = `translate3d(0, -${Math.round(startIndex * itemHeight)}px, 0)`;
        reel.getBoundingClientRect(); // Force browser to apply the transform immediately

        // Start the spin animation
        const spinDuration = 5000;
        reel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
        reel.style.transform = `translate3d(0, -${finalTranslateY}px, 0)`;
        
        const onEnd = () => {
          reel.removeEventListener('transitionend', onEnd);
          // Ensure an exact final snap, as browsers can sometimes be off by a sub-pixel
          reel.style.transition = 'none';
          reel.style.transform = `translate3d(0, -${finalTranslateY}px, 0)`;

          setIsSpinning(false);
          playSound('victory.wav', 0.5);
          
          // Use a timeout to reveal the "claim" button and text after the spin stops
          setTimeout(() => {
              setShowResultText(true);
          }, 300);
        };

        reel.addEventListener('transitionend', onEnd);
        
        return () => {
            reel.removeEventListener('transitionend', onEnd);
        };

    }, [spinId, winnerId, brainrotUnits, reelItems, winningUnit, onClose]);

    const handleClaim = () => {
        if (!showResultText || isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose(spinId, winnerId);
        }, 300);
    };

    return (
        <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`bg-gray-800 rounded-2xl border-2 border-purple-500 shadow-2xl p-8 flex flex-col items-center transition-all duration-300 ${isClosing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
                <h2 className="text-3xl font-bold text-yellow-300 mb-2">Brainrot Unit Incoming!</h2>
                <p className="text-gray-400 mb-6 h-6">{isSpinning ? "Get ready!" : "Congratulations!"}</p>
                
                <div className="w-80 h-56 rounded-lg bg-gray-900/50 overflow-hidden relative border-2 border-gray-600 shadow-inner flex items-center justify-center">
                    <div 
                        ref={reelRef}
                        className="absolute top-0 left-0 w-full"
                        style={{ willChange: 'transform' }}
                    >
                        {reelItems.map((unit, index) => {
                            const isWinner = !isSpinning && index === highlightedIndex;
                            const isFaded = !isSpinning && !isWinner;
                             return (
                                <div 
                                    key={index} 
                                    className={`h-56 flex flex-col items-center justify-center text-center transition-all duration-500
                                                ${isWinner ? 'scale-110' : ''}
                                                ${isFaded ? 'opacity-20 scale-90' : ''}`}
                                >
                                     <div className={`relative p-2 rounded-full transition-all duration-500 ${isWinner ? 'bg-yellow-400/20' : ''}`}>
                                        <unit.icon className="w-24 h-24 text-purple-300" />
                                        {isWinner && <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-pulse"></div>}
                                    </div>
                                    <p className={`mt-2 text-2xl font-bold px-4 transition-colors duration-500 ${isWinner ? 'text-yellow-300' : 'text-white'}`}>{unit.name}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-36 border-y-4 border-yellow-400/50 pointer-events-none box-border"></div>
                </div>
                 
                <div className={`text-center mt-4 h-16 flex flex-col justify-center items-center transition-opacity duration-500 ${!showResultText ? 'opacity-0' : 'opacity-100'}`}>
                   {!isSpinning && winningUnit && (
                       <p className="text-lg text-green-400 animate-fade-in-up">Added to your collection!</p>
                   )}
                </div>

                <button
                    onClick={handleClaim}
                    disabled={!showResultText}
                    className={`mt-2 px-10 py-3 rounded-lg text-xl font-bold shadow-md transition-all duration-300 bg-purple-600 hover:bg-purple-500 text-white ${!showResultText ? 'opacity-0 scale-90' : 'opacity-100 scale-100 animate-pulse'}`}
                >
                    Awesome!
                </button>
            </div>
            <style>{`
                @keyframes fade-in-up {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                  animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

type RouletteSegment = { type: 'gold'; amount: number } | { type: 'brainrot'; label: string };

const StoreScreen: React.FC<StoreScreenProps> = ({ allUnits, unlockedUnitIds, playerGold, onBuyUnit, onExit, onGoToGetGold, highestWorldUnlocked, onStartSpin, onPrizeWon, isAdFree, adsForSpinsWatchedState, onAttemptAdSpin, tutorialStep, allSpells, unlockedSpellIds, onBuySpell }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isSelectingBrainrot, setIsSelectingBrainrot] = useState(false);
  const [brainrotSpin, setBrainrotSpin] = useState<{ spinId: string; winnerId: string } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const [highlightCoords, setHighlightCoords] = useState<HighlightCoordinates>(null);

  const currentTutorialStep = tutorialStep !== undefined ? FULL_TUTORIAL_STEPS[tutorialStep] : null;
  const showTutorial = !!currentTutorialStep && currentTutorialStep.screen === 'store';

  useEffect(() => {
      if (showTutorial && currentTutorialStep.highlightTarget) {
          const timer = setTimeout(() => {
              const element = document.querySelector(`[data-tutorial-id="${currentTutorialStep.highlightTarget}"]`);
              if (element) {
                  const rect = element.getBoundingClientRect();
                  setHighlightCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, shape: 'rect' });
              }
          }, 100);
          return () => clearTimeout(timer);
      } else {
          setHighlightCoords(null);
      }
  }, [showTutorial, currentTutorialStep]);

  const brainrotUnitIds = ['tuc_tuc_tuc_sahur', 'tralalero_tralala', 'bombardino_crocodilo'];
  
  const purchasableUnits = allUnits
    .filter(u => u.purchaseCost && u.purchaseCost > 0)
    .sort((a,b) => {
        const aIsBrainrot = brainrotUnitIds.includes(a.id);
        const bIsBrainrot = brainrotUnitIds.includes(b.id);
        if (aIsBrainrot && !bIsBrainrot) return 1;
        if (!aIsBrainrot && bIsBrainrot) return -1;
        return (a.unlockWorld || 0) - (b.unlockWorld || 0) || a.purchaseCost! - b.purchaseCost!;
    });
    
  const roulettePrizes: RouletteSegment[] = useMemo(() => {
    const prizeTemplate: ({ type: 'gold' } | { type: 'brainrot'; label: string })[] = [
        { type: 'gold' }, { type: 'brainrot', label: 'BRAINROT' },
        { type: 'gold' }, { type: 'gold' },
        { type: 'gold' }, { type: 'gold' },
        { type: 'gold' }, { type: 'brainrot', label: 'BRAINROT' },
        { type: 'gold' }, { type: 'gold' },
        { type: 'gold' }, { type: 'gold' },
    ];
    const goldAmounts = [100, 50, 250, 50, 150, 50, 200, 50, 100, 50];
    let goldIndex = 0;
    return prizeTemplate.map(p => p.type === 'gold' ? { ...p, amount: goldAmounts[goldIndex++] } : p) as RouletteSegment[];
  }, []);

  const numSegments = roulettePrizes.length;

  const availableBrainrotUnits = useMemo(() => {
    return allUnits.filter(u => 
        brainrotUnitIds.includes(u.id) && !unlockedUnitIds.includes(u.id)
    );
  }, [allUnits, unlockedUnitIds]);

  const startSpin = (isFreeSpin: boolean) => {
    if (isSpinning || isSelectingBrainrot) return;
    if (!isFreeSpin && playerGold < 300) {
        playSound('error.wav', 0.5);
        return;
    }

    initAudio();
    if (!isFreeSpin) {
        onStartSpin();
    }
    setIsSpinning(true); // LOCK UI HERE
    playSound('WheelSpin.wav', 0.7);
    
    const winningIndex = Math.floor(Math.random() * numSegments);
    
    const segmentAngle = 360 / numSegments;
    const fullSpins = 4;
    const randomOffsetInDegrees = (Math.random() - 0.5) * (segmentAngle * 0.8);
    const prizeTargetAngle = (winningIndex * segmentAngle) + randomOffsetInDegrees;
    const currentRotation = rotation;
    const newRotation = (Math.ceil(currentRotation / 360) * 360) + (fullSpins * 360) + (360 - prizeTargetAngle);

    if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 4000ms cubic-bezier(0.23, 1, 0.32, 1)';
    }
    setRotation(newRotation);

    const animationDuration = 4100;
    setTimeout(() => {
        const winningPrizeSegment = roulettePrizes[winningIndex];

        if (winningPrizeSegment.type === 'brainrot' && availableBrainrotUnits.length > 0) {
            const winner = availableBrainrotUnits[Math.floor(Math.random() * availableBrainrotUnits.length)];
            const spinId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            console.log('[BRAINROT:START]', { spinId, winnerId: winner.id });
            setBrainrotSpin({ spinId, winnerId: winner.id });
            setIsSelectingBrainrot(true);
            playSound('SlotMachine.wav', 0.7);
            console.log('[BRAINROT:SHOW]', { spinId, winnerIdShown: winner.id });
        } else {
            let finalPrize: RoulettePrize;
            if (winningPrizeSegment.type === 'brainrot') {
                finalPrize = { type: 'gold', amount: 500, name: 'All specials unlocked!' };
            } else {
                finalPrize = { type: 'gold', amount: winningPrizeSegment.amount };
            }
            onPrizeWon(finalPrize);
            setIsSpinning(false); // Can unlock here for non-brainrot prizes
        }
    }, animationDuration);
  };

  const handleSpin = () => startSpin(false);

  const handleAdSpin = () => {
      if (onAttemptAdSpin()) {
          startSpin(true);
      }
  };
  
  const handleBrainrotClose = (spinId: string, winnerId: string) => {
    if (!brainrotSpin || spinId !== brainrotSpin.spinId) return; // Ignore old/stale events
    
    console.log('[BRAINROT:CLAIM]', { spinId, winnerIdAwarded: winnerId });

    const unitWon = allUnits.find(u => u.id === winnerId);
    if (unitWon) {
        onPrizeWon({ type: 'unit', id: unitWon.id, name: unitWon.name, fromBrainrot: true });
    }
    
    setIsSelectingBrainrot(false);
    setBrainrotSpin(null);
    setIsSpinning(false); // UNLOCK UI HERE
  };

  const segmentAngle = 360 / numSegments;
  const color1 = '#4f46e5'; // indigo-600
  const color2 = '#312e81'; // indigo-800
  const brainrotColor = '#7e22ce'; // A distinct purple, like purple-700
  
  let nonBrainrotIndex = 0;
  const gradientParts = Array.from({ length: numSegments }, (_, i) => {
      const prize = roulettePrizes[i];
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      let color;
      if (prize.type === 'brainrot') {
          color = brainrotColor;
      } else {
          color = nonBrainrotIndex % 2 === 0 ? color1 : color2;
          nonBrainrotIndex++;
      }
      return `${color} ${startAngle}deg ${endAngle}deg`;
  });
  
  const conicGradient = `conic-gradient(from -${segmentAngle/2}deg, ${gradientParts.join(', ')})`;
  
  const adsForSpinsToday = adsForSpinsWatchedState.date === new Date().toDateString() ? adsForSpinsWatchedState.count : 0;
  const spinsRemaining = 5 - adsForSpinsToday;

  return (
    <div className="w-full h-full flex bg-gray-900 text-white overflow-hidden">
      {isSelectingBrainrot && brainrotSpin && (
        <BrainrotSelector 
            spinId={brainrotSpin.spinId}
            winnerId={brainrotSpin.winnerId}
            allUnits={allUnits}
            unlockedUnitIds={unlockedUnitIds}
            onClose={handleBrainrotClose}
        />
      )}
      {/* Left side: Unit Store */}
      <div className="w-3/5 h-full p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onExit} className="px-6 py-2 rounded-lg text-lg font-bold shadow-md transition-all duration-200 bg-gray-600 hover:bg-gray-500 text-white" data-tutorial-id="exit-store-button">
                &larr; Main Menu
            </button>
            <h1 className="text-4xl font-bold text-yellow-400">Store</h1>
            <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                <GoldIcon className="w-8 h-8" />
                <span className="text-3xl font-bold text-yellow-300 ml-3">{playerGold}</span>
                <button onClick={onGoToGetGold} className="ml-3 bg-green-500 hover:bg-green-400 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {purchasableUnits.map(unit => {
                const isUnlocked = unlockedUnitIds.includes(unit.id);
                const canAfford = playerGold >= unit.purchaseCost!;
                const isSpecialUnit = (unit.unlockWorld || 0) >= 99;
                const isLockedByWorld = !isSpecialUnit && (unit.unlockWorld || 0) > highestWorldUnlocked;
                let buttonToRender;

                if (isUnlocked) {
                    buttonToRender = (
                        <button disabled className="w-full mt-4 py-2 rounded-lg bg-green-600 text-white font-bold opacity-70">
                            Unlocked
                        </button>
                    );
                } else if (isSpecialUnit) {
                    buttonToRender = (
                        <button disabled className="w-full mt-4 py-2 rounded-lg bg-purple-800 text-purple-300 font-bold cursor-default border border-purple-600">
                            Unlock in Roulette
                        </button>
                    );
                } else if (isLockedByWorld) {
                    buttonToRender = (
                        <button disabled className="w-full mt-4 py-2 rounded-lg bg-gray-700 text-gray-400 font-bold">
                            {`Unlock by reaching World ${unit.unlockWorld}`}
                        </button>
                    );
                } else { // Can be purchased
                    buttonToRender = (
                        <button 
                            onClick={() => {
                              initAudio();
                              playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5);
                              onBuyUnit(unit);
                            }}
                            disabled={!canAfford || isSpinning}
                            className="w-full mt-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
                        >
                            <GoldIcon className="w-5 h-5" />
                            {unit.purchaseCost}
                        </button>
                    );
                }

                return (
                    <div key={`${unit.id}-${isUnlocked}`} 
                         className={`bg-gray-800 p-4 rounded-xl border-2 transition-all duration-300 ${isUnlocked ? 'border-green-500/50' : isSpecialUnit ? 'border-purple-600' : isLockedByWorld ? 'border-gray-700' : 'border-gray-600'}`}
                         data-tutorial-id={`unit-card-${unit.id}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-bold">{unit.name}</h2>
                            <div className={`p-2 rounded-full ${isUnlocked ? 'bg-green-500/20' : isSpecialUnit ? 'bg-purple-600/20' : 'bg-gray-700'}`}>
                                <unit.icon className={`w-6 h-6 ${isUnlocked ? 'text-green-400' : isSpecialUnit ? 'text-purple-300' : 'text-gray-400'}`} />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-4 h-10">{unit.description}</p>
                        
                        <div className="space-y-2 mb-4">
                            <StatBar label="HP" value={unit.hp} maxValue={MAX_STATS.hp} colorClass="bg-red-500" />
                            <StatBar label="Damage" value={unit.damage} maxValue={MAX_STATS.damage} colorClass="bg-yellow-500" />
                            <StatBar label="Range" value={unit.attackRange} maxValue={MAX_STATS.attackRange} colorClass="bg-blue-500" />
                            <StatBar label="Speed" value={unit.speed} maxValue={MAX_STATS.speed} colorClass="bg-purple-500" />
                        </div>

                        {buttonToRender}
                    </div>
                );
            })}
        </div>

        {/* Spell Store */}
        <div className="mt-10">
            <h2 className="text-3xl font-bold text-cyan-300 mb-4">Spells</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {allSpells.map(spell => {
                    const isUnlocked = unlockedSpellIds.includes(spell.id);
                    const canAfford = playerGold >= spell.purchaseCost;
                    const lockedByWorld = !!spell.unlockWorld && spell.unlockWorld > highestWorldUnlocked;
                    return (
                        <div key={spell.id} className={`bg-gray-800 p-4 rounded-xl border-2 ${isUnlocked ? 'border-cyan-500/50' : lockedByWorld ? 'border-gray-700' : 'border-gray-600'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold">{spell.name}</h3>
                                <span className="text-xs text-gray-400">Radius: {spell.radius}</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">{spell.description}</p>
                            {isUnlocked ? (
                                <button disabled className="w-full py-2 rounded-lg bg-green-600 text-white font-bold opacity-70">Unlocked</button>
                            ) : lockedByWorld ? (
                                <button disabled className="w-full py-2 rounded-lg bg-gray-700 text-gray-400 font-bold">Unlock by reaching World {spell.unlockWorld}</button>
                            ) : (
                                <button
                                   onClick={() => {
                                     initAudio();
                                     playSound('ES_Button Click, Input Response, Tap, Short - Epidemic Sound - 0000-0119.wav', 0.5);
                                     onBuySpell(spell);
                                   }}
                                   disabled={!canAfford}
                                   className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold"
                                >
                                   <GoldIcon className="w-5 h-5"/> {spell.purchaseCost}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Right side: Roulette */}
      <div className="w-2/5 h-full bg-gray-900/50 p-6 flex flex-col items-center justify-center border-l-2 border-gray-700">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-purple-400">Brainrot Roulette</h2>
          <p className="text-gray-400 mt-1">Spin for a chance to win a special unit!</p>
          <InfoTooltip text="Land on BRAINROT for a chance at a unique unit. If you win a unit you already own, you get gold compensation."/>
        </div>

        <div className="flex-grow flex items-center justify-center">
            <div className="relative w-96 h-96">
                
                <div 
                    className="absolute w-12 h-16 z-30 -top-8 left-1/2 -translate-x-1/2"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
                >
                    <svg width="100%" height="100%" viewBox="0 0 48 64">
                        <defs>
                            <linearGradient id="markerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fde047" />
                                <stop offset="100%" stopColor="#facc15" />
                            </linearGradient>
                        </defs>
                        <path d="M24,64 L0,25.6 L48,25.6 Z" fill="url(#markerGrad)" stroke="#1c1917" strokeWidth="2.5" strokeLinejoin="round" />
                    </svg>
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-amber-800 shadow-inner"></div>
                </div>

                <div 
                    ref={wheelRef}
                    className="absolute w-full h-full"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                    }}
                >
                    <div className="absolute w-full h-full rounded-full" style={{ background: conicGradient, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}></div>
                    <div className="absolute w-full h-full z-10 pointer-events-none">
                        {Array.from({ length: numSegments }).map((_, i) => (
                            <div key={i} className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-black/75"
                                style={{ transform: `translateX(-50%) rotate(${i * segmentAngle + segmentAngle / 2}deg)`, transformOrigin: 'bottom center' }}
                            />
                        ))}
                    </div>
                    
                    <div className="absolute w-full h-full z-20">
                        {roulettePrizes.map((prize, i) => {
                            const angle = i * segmentAngle;
                            const textRotation = (angle > 90 && angle < 270) ? -angle + 180 : -angle;
                            const isBrainrot = prize.type === 'brainrot';

                            return (
                                <div key={i} className="absolute w-full h-full" style={{transform: `rotate(${angle}deg)`}}>
                                    <div className="absolute w-full h-1/2 top-0 left-0 origin-bottom-center flex justify-center items-start">
                                        {isBrainrot ? (
                                             <span className="mt-7 text-sm font-black tracking-wider text-purple-300 animate-pulse"
                                                style={{transform: `rotate(${textRotation}deg)`, textShadow: '0 0 10px #a855f7' }}
                                            >
                                                {prize.label}
                                            </span>
                                        ) : (
                                            <div className="relative mt-3" style={{ transform: `rotate(${textRotation}deg)` }}>
                                                <GoldIcon className="w-10 h-10"/>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-amber-900" style={{textShadow: '0 0 3px white, 0 0 3px white'}}>
                                                        {prize.amount}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="absolute inset-16 bg-gray-900 rounded-full z-10 border-4 border-gray-700 shadow-inner"></div>
            </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
            <button 
              onClick={handleSpin}
              disabled={isSpinning || playerGold < 300 || isSelectingBrainrot}
              className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg shadow-lg transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Spin for 300 <GoldIcon className="w-6 h-6"/>
            </button>
            <button
              onClick={handleAdSpin}
              disabled={isSpinning || spinsRemaining <= 0 || isSelectingBrainrot}
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-lg shadow-lg transition-all duration-200 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <PlayCircleIcon className="w-6 h-6" />
                {isAdFree ? `Claim Free Spin (${spinsRemaining} left)` : `Watch Ad for Spin (${spinsRemaining} left)`}
            </button>
        </div>
      </div>
      {showTutorial && currentTutorialStep && (
        <TutorialOverlay
            step={tutorialStep!}
            content={{ ...currentTutorialStep, highlight: highlightCoords }}
        />
       )}
    </div>
  );
};

export default StoreScreen;
