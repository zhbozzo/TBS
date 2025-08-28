import React, { useRef } from 'react';
import type { Unit, UnitType, GameState as GameStateEnum, Projectile, Level, VisualEffect } from '../types';
import { GameState, Team } from '../types';
import { GAME_CONFIG } from '../constants';
import UnitComponent from './Unit';
import ProjectileComponent from './Projectile';
import ObstacleComponent from './Obstacle';
import VFXComponent from './VFX';

interface BattlefieldProps {
  units: Unit[];
  projectiles: Projectile[];
  visualEffects: VisualEffect[];
  onDeleteUnit: (unitId: string) => void;
  selectedUnitType: UnitType | null;
  gameState: GameStateEnum;
  level: Level | null; // Nullable for local battle
  showRedZone?: boolean;
  previewInfo: { x: number; y: number; isColliding: boolean, team: Team } | null;
}

const Battlefield = React.forwardRef<HTMLDivElement, BattlefieldProps>(({ units, projectiles, visualEffects, onDeleteUnit, selectedUnitType, gameState, level, showRedZone = false, previewInfo }, ref) => {
  const theme = level?.theme || { accents: 'border-blue-400' };

  const handleUnitClick = (unit: Unit) => {
    if (gameState === GameState.Deployment) {
      onDeleteUnit(unit.uid);
    }
  };

  const accentColorMap: { [key: string]: string } = {
      'border-blue-400': 'rgba(96, 165, 250, 0.5)',
      'border-green-400': 'rgba(74, 222, 128, 0.5)',
      'border-yellow-600': 'rgba(202, 138, 4, 0.5)',
      'border-indigo-400': 'rgba(129, 140, 248, 0.5)',
      'border-red-500': 'rgba(239, 68, 68, 0.5)',
      'border-cyan-300': 'rgba(103, 232, 249, 0.5)',
      'border-red-400': 'rgba(248, 113, 113, 0.5)'
  };
  
  const blueAccentColor = accentColorMap[theme.accents] || accentColorMap['border-blue-400'];
  const redAccentColor = accentColorMap['border-red-400'];
  
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden`}
      style={{
        width: GAME_CONFIG.BATTLEFIELD_WIDTH,
        height: GAME_CONFIG.BATTLEFIELD_HEIGHT,
      }}
    >
      {gameState === GameState.Deployment && (
        <>
            <div
              className={`absolute top-0 left-0 h-full bg-blue-500 bg-opacity-10`}
              style={{ width: GAME_CONFIG.PLACEMENT_ZONE_WIDTH }}
            />
            <div 
              className="absolute top-0 h-full w-0.5 pointer-events-none"
              style={{ 
                  left: GAME_CONFIG.PLACEMENT_ZONE_WIDTH,
                  boxShadow: `0 0 8px 2px ${blueAccentColor}, 0 0 1px 1px ${blueAccentColor}`
              }}
            />
        </>
      )}

      {gameState === GameState.Deployment && showRedZone && (
        <>
            <div
              className={`absolute top-0 right-0 h-full bg-red-500 bg-opacity-10`}
              style={{ width: GAME_CONFIG.PLACEMENT_ZONE_WIDTH }}
            />
            <div 
              className="absolute top-0 h-full w-0.5 pointer-events-none"
              style={{ 
                  right: GAME_CONFIG.PLACEMENT_ZONE_WIDTH,
                  boxShadow: `0 0 8px 2px ${redAccentColor}, 0 0 1px 1px ${redAccentColor}`
              }}
            />
        </>
      )}

      {level?.obstacles?.map((obs, index) => (
        <ObstacleComponent key={index} obstacle={obs} />
      ))}
      
      {units.map((unit) => (
        <UnitComponent key={unit.uid} unit={unit} gameState={gameState} onClick={() => handleUnitClick(unit)}/>
      ))}

      {projectiles.map((projectile) => (
          <ProjectileComponent key={projectile.id} projectile={projectile} />
      ))}
      
      {visualEffects.map((vfx) => (
          <VFXComponent key={vfx.id} vfx={vfx} />
      ))}

      {previewInfo && selectedUnitType && (
         <div
            className="absolute pointer-events-none"
            style={{
                // This wrapper should not do positioning, only styling.
                // The UnitComponent will position itself.
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                // The styles below will apply to the UnitComponent inside
                opacity: 0.7,
                transition: 'filter 200ms ease',
                filter: previewInfo.isColliding ? 'hue-rotate(120deg) saturate(2)' : 'none',
            }}
        >
          <UnitComponent
            unit={{
                ...selectedUnitType,
                uid: 'preview',
                team: previewInfo.team,
                position: { x: previewInfo.x, y: previewInfo.y },
                rotation: previewInfo.team === Team.Blue ? 90 : -90,
                currentHp: selectedUnitType.hp,
                targetId: null,
                lastAttackTime: 0,
                attackCooldown: 0,
                effects: [],
                waypoint: null,
            }}
            gameState={gameState}
            onClick={() => {}}
          />
        </div>
      )}
    </div>
  );
});

export default Battlefield;