

import React, { useState, useEffect, useRef } from 'react';
import type { Unit, GameState as GameStateEnum } from '../types';
import { Team, GameState } from '../types';

interface UnitProps {
  unit: Unit;
  gameState: GameStateEnum;
  onClick: () => void;
}

const UnitComponent: React.FC<UnitProps> = ({ unit, gameState, onClick }) => {
  const healthPercentage = (unit.currentHp / unit.hp) * 100;
  const isBoss = unit.role === 'Boss' || unit.id === 'dragon_boss';
  const isGiantLike = unit.id === 'ice_giant' || unit.id === 'golem';
  const baseSmallSize = 52; // "imperial" baseline
  const sizeById: Record<string, number> = {
    farmer: baseSmallSize,
    imp: baseSmallSize,
    skeleton: baseSmallSize,
    ranged: baseSmallSize,
    melee: baseSmallSize,
    crossbowman: baseSmallSize,
    musqueteer: baseSmallSize,
    mage: baseSmallSize,
    lancer: baseSmallSize,
    assassin: baseSmallSize,
  };
  // Cleric un poco más pequeño
  const clericSize = 46;
  const size = isBoss ? 120 : isGiantLike ? 70 : (unit.id === 'cleric' ? clericSize : (sizeById[unit.id] ?? baseSmallSize));
  const iconSize = isBoss ? 'w-20 h-20' : isGiantLike ? 'w-10 h-10' : 'w-7 h-7';

  // Glows por equipo (aura). Elimina el fondo circular.
  const teamGlow = unit.team === Team.Blue
    ? 'drop-shadow(0 0 10px rgba(59,130,246,0.9)) drop-shadow(0 0 22px rgba(59,130,246,0.55))'
    : 'drop-shadow(0 0 10px rgba(239,68,68,0.55)) drop-shadow(0 0 22px rgba(239,68,68,0.25))';
  const canDelete = gameState === GameState.Deployment;
  const isDying = !!unit.dyingAt;

  const slowEffect = unit.effects?.find(e => e.type === 'slow');
  const rageEffect = unit.effects?.find(e => e.type === 'rage');
  const empowerEffect = unit.effects?.find(e => e.type === 'empower');
  
  const [isAttacking, setIsAttacking] = useState(false);
  const lastAttackTimeRef = useRef(unit.lastAttackTime);

  const [hasCustomIcon, setHasCustomIcon] = useState<boolean>(false);
  
  const customIconUrl = `/Assets/troops/${
    unit.id === 'melee' ? 'knight' :
    unit.id === 'ranged' ? 'archer' :
    unit.id === 'tank' ? 'guardian' :
    unit.id === 'mage' ? 'mage' :
    unit.id === 'cleric' ? 'cleric' :
    unit.id === 'crossbowman' ? 'crossbow' :
    unit.id === 'assassin' ? 'assasin' :
    unit.id === 'lancer' ? 'lancer' :
    unit.id === 'farmer' ? 'farmer' :
    unit.id === 'berserker' ? 'berserker' :
    unit.id === 'frost_mage' ? 'frost-mage' :
    unit.id === 'paladin' ? 'paladin' :
    unit.id === 'sandworm' ? 'sandworm' :
    unit.id === 'golem' ? 'golem' :
    unit.id === 'necromancer' ? 'necromancer' :
    unit.id === 'enchantress' ? 'enchantress' :
    unit.id === 'prism_guard' ? 'prism-guard' :
    unit.id === 'imp' ? 'imperial' :
    unit.id === 'magma_elemental' ? 'magma-elemental' :
    unit.id === 'valkyrie' ? 'valkyrie' :
    unit.id === 'ice_giant' ? 'IceGiant' :
    unit.id === 'dragon_boss' ? 'BossDragon' :
    unit.id === 'boss_grove_guardian' ? 'BossVerdant' :
    unit.id === 'boss_dune_horror' ? 'BossArena' :
    unit.id === 'boss_crystal_monstrosity' ? 'BossCristal' :
    unit.id === 'boss_magma_colossus' ? 'BossFuego' :
    unit.id === 'skeleton' ? 'esqueleton' :
    unit.id === 'bomber' ? 'bomber' :
    unit.id === 'sapling' ? 'Sapling' :
    unit.id === 'tuc_tuc_tuc_sahur' ? 'TuctuctucSahur' :
    unit.id === 'tralalero_tralala' ? 'TralaleroTralala' :
    unit.id === 'bombardino_crocodilo' ? 'BombardinoCrocodilo' :
    unit.id === 'musqueteer' ? 'musqueteer' :
    'knight'
  }.png`;

  useEffect(() => {
    // Check for custom icon
    const img = new Image();
    img.onload = () => setHasCustomIcon(true);
    img.onerror = () => setHasCustomIcon(false);
    img.src = customIconUrl;
  }, [customIconUrl]);

  useEffect(() => {
    if (unit.lastAttackTime !== lastAttackTimeRef.current && unit.lastAttackTime > 0) {
      const isMeleeAttacker =
        unit.role === 'Boss' ||
        unit.role === 'Tank' ||
        (unit.role || '').includes('Melee') ||
        unit.role === 'Swarm' ||
        unit.id === 'tralalero_tralala';
      if (isMeleeAttacker) {
        setIsAttacking(true);
        const timer = setTimeout(() => setIsAttacking(false), 200); // Más rápido
        lastAttackTimeRef.current = unit.lastAttackTime;
        return () => clearTimeout(timer);
      }
      lastAttackTimeRef.current = unit.lastAttackTime;
    }
  }, [unit.lastAttackTime, unit.attackRange, unit.ability]);

  const attackRotationRef = useRef(unit.rotation);
  if(isAttacking || unit.targetId){
      attackRotationRef.current = unit.rotation;
  }
  
  const getAttackTransform = () => {
    if (!isAttacking || isDying) return 'translate(0px, 0px)';
    
    const isMeleeAttacker =
      unit.role === 'Boss' ||
      unit.role === 'Tank' ||
      (unit.role || '').includes('Melee') ||
      unit.role === 'Swarm' ||
      unit.id === 'tralalero_tralala';
    if (!isMeleeAttacker) return 'translate(0px, 0px)';
    const distance = unit.role === 'Boss' ? 22 : 20; // más marcado
    const angleRad = attackRotationRef.current * (Math.PI / 180);

    const x = Math.cos(angleRad) * distance;
    const y = Math.sin(angleRad) * distance;
    
    return `translate(${x}px, ${y}px)`;
  };

  const spriteTransform = hasCustomIcon
    ? `scaleX(${unit.team === Team.Blue ? -1 : 1})`
    : `rotate(${unit.rotation + 90}deg)`;

  return (
    <div
      className={`absolute flex flex-col items-center ${canDelete && !isDying ? 'cursor-pointer' : ''}`}
      style={{
        left: unit.position.x,
        top: unit.position.y,
        width: 0,
        height: 0,
        zIndex: isDying ? 1 : 2,
      }}
      onClick={canDelete && !isDying ? onClick : undefined}
      aria-label={`${unit.name} (${unit.team === Team.Blue ? 'Blue' : 'Red'} Team)`}
    >
      <div
        className={`relative flex flex-col items-center transition-transform ${canDelete ? 'hover:scale-110' : ''} ${isDying ? 'unit-dying-animation' : ''}`}
        style={{
            width: size,
            height: 'auto',
            transform: `translate(-50%, -50%) ${getAttackTransform()}`,
            transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.3, 1)', // avance más veloz
        }}
      >
        <div
            className="absolute w-4/5 h-2/5 rounded-full bg-black opacity-20"
            style={{
                bottom: isBoss ? '4px' : '0px',
                left: '10%',
                filter: 'blur(8px)',
                transform: 'translateY(5px)'
            }}
        />
        
        <div 
          className="relative"
          style={{ width: size, height: size }}
        >
          <div className="w-full h-full flex items-center justify-center overflow-visible">
            <div className="transition-transform duration-100 h-full w-full flex items-center justify-center"
                 style={{ transform: spriteTransform }}>
              {hasCustomIcon ? (
                <img src={customIconUrl} alt={unit.name} className={`object-contain`} style={{ width: size, height: size, filter: teamGlow }} />
              ) : (
                React.createElement(unit.icon, { className: `${iconSize}`, style: { filter: teamGlow } })
              )}
            </div>
          </div>
          {slowEffect && !isDying && <div className="absolute inset-0 rounded-full bg-cyan-400 bg-opacity-40 animate-pulse border-2 border-cyan-200"></div>}
          {rageEffect && !isDying && <div className="absolute inset-0 rounded-full bg-red-600 bg-opacity-50 animate-ping"></div>}
          {empowerEffect && !isDying && <div className="absolute inset-0 rounded-full bg-purple-500 bg-opacity-40 animate-pulse border-2 border-purple-300"></div>}
        </div>

        {/* Health Bar */}
        {!isDying && (
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1.5" style={{ width: size * 0.9 }}>
                <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${healthPercentage}%` }}
                />
            </div>
        )}
      </div>
       <style>{`
        @keyframes unit-dying {
            from {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            to {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
        }
        .unit-dying-animation {
            animation: unit-dying 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(UnitComponent);