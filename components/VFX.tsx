
import React from 'react';
import { spriteUrl } from '@/src/assetsLoader';
import type { VisualEffect } from '../types';

interface VFXProps {
  vfx: VisualEffect;
}

const VFXComponent: React.FC<VFXProps> = ({ vfx }) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: vfx.position.x,
    top: vfx.position.y,
    pointerEvents: 'none',
    zIndex: 20,
    transform: 'translate(-50%, -50%)',
  };

  switch (vfx.type) {
    case 'lightning':
      return (
        <div style={baseStyle}>
          <img
            src={spriteUrl('spells/light.png')}
            alt="Lightning"
            className="lightning-effect"
            style={{
              '--duration': `${vfx.duration}ms`,
              width: vfx.radius * 2.4,
              height: vfx.radius * 2.4,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              filter: 'drop-shadow(0 0 20px rgba(147,197,253,0.9))',
            } as React.CSSProperties}
          />
          <div className="lightning-stem" style={{ '--duration': `${vfx.duration}ms` } as React.CSSProperties}/>
          <div
            className="lightning-glow"
            style={{ '--radius': `${vfx.radius * 1.2}px`, '--duration': `${Math.max(300, vfx.duration - 100)}ms` } as React.CSSProperties}
          />
          <style>{`
            @keyframes lightning-fade {
              0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); filter: brightness(1.5); }
              10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); filter: brightness(2); }
              50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
            .lightning-effect {
              animation: lightning-fade var(--duration) ease-out forwards;
            }
            @keyframes stem {
              0% { opacity: 0.8; height: 0px; }
              40% { opacity: 1; height: 220px; }
              100% { opacity: 0; height: 220px; }
            }
            .lightning-stem {
              position: absolute; top: -220px; left: 50%; transform: translateX(-50%);
              width: 4px; background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(147,197,253,0.7));
              box-shadow: 0 0 10px rgba(147,197,253,0.9), 0 0 20px rgba(255,255,255,0.7);
              animation: stem var(--duration) ease-out forwards;
            }
            @keyframes glow {
              0% { opacity: 0.8; transform: scale(0.8); }
              100% { opacity: 0; transform: scale(1.2); }
            }
            .lightning-glow {
              position: absolute;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              width: var(--radius);
              height: var(--radius);
              border-radius: 50%;
              background: radial-gradient(circle, rgba(147,197,253,0.6) 0%, rgba(147,197,253,0.2) 60%, transparent 70%);
              animation: glow var(--duration) ease-out forwards;
              pointer-events: none;
            }
          `}</style>
        </div>
      );
    case 'explosion':
      return (
        <div style={baseStyle}>
          <div
            className="explosion-shockwave"
            style={{
              '--radius': `${vfx.radius * 2}px`,
              '--duration': `${vfx.duration}ms`,
              '--color': vfx.color,
            } as React.CSSProperties}
          />
          <style>{`
            @keyframes shockwave {
              0% {
                width: 0;
                height: 0;
                opacity: 1;
                border-width: 4px;
              }
              100% {
                width: var(--radius);
                height: var(--radius);
                opacity: 0;
                border-width: 1px;
              }
            }
            .explosion-shockwave {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border-radius: 50%;
              border-style: solid;
              border-color: var(--color);
              animation: shockwave var(--duration) ease-out forwards;
            }
          `}</style>
        </div>
      );
    case 'muzzle_flash':
      return (
        <div style={baseStyle}>
          <div
            className="muzzle-flash-effect"
            style={{
              '--radius': `${vfx.radius}px`,
              '--duration': `${vfx.duration}ms`,
              '--color': vfx.color,
            } as React.CSSProperties}
          />
          <style>{`
            @keyframes muzzle-flash-anim {
              0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
              }
              50% {
                transform: scale(1.2) rotate(180deg);
              }
              100% {
                transform: scale(0) rotate(360deg);
                opacity: 0;
              }
            }
            .muzzle-flash-effect {
              width: var(--radius);
              height: var(--radius);
              background: 
                radial-gradient(circle, white 0%, var(--color) 40%, transparent 70%);
              clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
              animation: muzzle-flash-anim var(--duration) ease-out forwards;
            }
          `}</style>
        </div>
      );
    case 'hit_flash':
      return (
        <div style={baseStyle}>
          <div
            className="hit-flash"
            style={{ '--duration': `${vfx.duration}ms`, '--color': vfx.color } as React.CSSProperties}
          />
          <style>{`
            @keyframes hitFlash {
              0% { opacity: 0.9; transform: scale(1); }
              100% { opacity: 0; transform: scale(1.5); }
            }
            .hit-flash {
              width: 28px; height: 28px; border-radius: 50%;
              background: radial-gradient(circle, var(--color) 0%, transparent 70%);
              box-shadow: 0 0 14px var(--color);
              animation: hitFlash var(--duration) ease-out forwards;
            }
          `}</style>
        </div>
      );
    default:
      return null;
  }
};

export default React.memo(VFXComponent);
