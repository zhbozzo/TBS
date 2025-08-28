

import React from 'react';
import type { Projectile } from '../types';

interface ProjectileProps {
  projectile: Projectile;
}

const ProjectileComponent: React.FC<ProjectileProps> = ({ projectile }) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: projectile.position.x,
    top: projectile.position.y,
    pointerEvents: 'none',
    zIndex: 10,
  };

  switch (projectile.type) {
    case 'arrow':
      return (
        <div
          style={{
            ...baseStyle,
            width: 20,
            height: 6,
            transform: `translate(-50%, -50%) rotate(${projectile.rotation}deg)`,
          }}
        >
          <svg width="20" height="6" viewBox="0 0 20 6" className="text-white drop-shadow-lg">
             <path d="M0 3 L18 3 M15 0 L18 3 L15 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'crossbow_bolt':
       return (
        <div
          style={{
            ...baseStyle,
            width: 24,
            height: 8,
            transform: `translate(-50%, -50%) rotate(${projectile.rotation}deg)`,
          }}
        >
          <svg width="24" height="8" viewBox="0 0 24 8" className="text-gray-300 drop-shadow-lg">
             <path d="M0 4 L22 4 M18 0 L22 4 L18 8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'bullet':
      return (
        <div
          style={{
            ...baseStyle,
            width: 20,
            height: 3,
            transform: `translate(-50%, -50%) rotate(${projectile.rotation}deg)`,
            background: 'linear-gradient(to right, rgba(255,255,255,0), #FBBF24, white)',
            borderRadius: '2px',
            boxShadow: '0 0 5px #FBBF24',
          }}
        />
      );
    case 'fireball':
      const isBossFireball = projectile.damage > 50;
      const size = isBossFireball ? 32 : 16;
      return (
        <div
          style={{
            ...baseStyle,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#f97316', // orange-500
            boxShadow: `0 0 ${size}px ${size/2}px #ea580c, 0 0 1px 1px #fff inset`, // orange-600 glow + white core
            transform: `translate(-50%, -50%)`,
          }}
        />
      );
    case 'bomb':
      const bombSize = 14;
      return (
        <div
          style={{
            ...baseStyle,
            width: bombSize,
            height: bombSize,
            borderRadius: '50%',
            backgroundColor: '#333',
            border: '2px solid #111',
            boxShadow: 'inset 2px -2px 2px rgba(0,0,0,0.5)',
            transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
          }}
        />
      );
    case 'frost_bolt':
      const frostSize = 16;
      return (
        <div
          style={{
            ...baseStyle,
            width: frostSize,
            height: frostSize,
            borderRadius: '50%',
            backgroundColor: '#3b82f6', // blue-500
            boxShadow: `0 0 ${frostSize}px ${frostSize/2}px #2563eb, 0 0 1px 1px #dbeafe inset`, // blue-600 glow + blue-100 core
            transform: `translate(-50%, -50%)`,
          }}
        />
      );
    case 'heal_orb':
      return (
        <div
          style={{
            ...baseStyle,
            width: 40,
            height: 6,
            transform: `translate(-50%, -50%) rotate(${projectile.rotation}deg)`,
            background: 'linear-gradient(90deg, rgba(134, 239, 172, 0.2), rgba(74, 222, 128, 1))',
            borderRadius: '3px',
            boxShadow: '0 0 10px 3px rgba(74, 222, 128, 0.6)',
          }}
        />
      );
    default:
      return null;
  }
};

export default React.memo(ProjectileComponent);