
import React, { useMemo } from 'react';
import { spriteUrl } from '@/src/assetsLoader';
import type { Obstacle } from '../types';

interface ObstacleProps {
    obstacle: Obstacle;
}

const seededRandom = (seed: number) => {
    let s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
};

const renderRock = (s: number, seed: number) => {
    const numPoints = 8 + Math.floor(seededRandom(seed) * 5);
    const points: [number, number][] = [];
    const jaggedness = 0.25;

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const baseRadius = s / 2 * (1 - jaggedness / 2);
        const randomOffset = s / 2 * jaggedness * seededRandom(seed + i);
        const radius = baseRadius + randomOffset;
        const x = s / 2 + Math.cos(angle) * radius;
        const y = s / 2 + Math.sin(angle) * radius;
        points.push([x, y]);
    }

    const pathData = "M" + points.map(p => p.join(',')).join(' L') + " Z";
    
    return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
            <defs>
                <linearGradient id={`rockGrad${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#9ca3af'}} />
                    <stop offset="100%" style={{stopColor: '#6b7280'}} />
                </linearGradient>
            </defs>
            <path d={pathData} fill={`url(#rockGrad${seed})`} stroke="#4a5568" strokeWidth="3" strokeLinejoin="round" />
        </svg>
    );
};

const renderTree = (s: number, seed: number) => {
    const trunkWidth = s * (0.15 + seededRandom(seed) * 0.05);
    const trunkHeight = s * 0.6;
    const trunkBottomY = s;
    const trunkTopY = s - trunkHeight;
    const trunkPath = `M${s/2 - trunkWidth/2},${trunkBottomY} C${s/2 - trunkWidth*0.8},${s*0.8} ${s/2 + trunkWidth*0.8},${s*0.7} ${s/2},${trunkTopY}`;

    // Adjusted canopy radius and position to fit within the SVG viewBox
    const canopyRadius = s * 0.4;
    const canopyCenterY = s * 0.4;
    
    return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.3))'}}>
            <g>
                <path d={trunkPath} fill="#6B4F3A" stroke="#422d1c" strokeWidth="1.5" />
                {/* Remade canopy with slightly different composition to ensure visibility */}
                <circle cx={s/2} cy={canopyCenterY} r={canopyRadius} fill="#4a7c4a" />
                <circle cx={s/2 + s * 0.1} cy={canopyCenterY + s * 0.1} r={canopyRadius * 0.8} fill="#5a945a" />
                <circle cx={s/2 - s * 0.15} cy={canopyCenterY + s * 0.05} r={canopyRadius * 0.7} fill="#6a9f6a" />
                <circle cx={s/2 - s * 0.05} cy={canopyCenterY - s * 0.1} r={canopyRadius * 0.5} fill="#7DBA7D" opacity="0.8" />
            </g>
        </svg>
    );
};

const renderWall = (width: number, height: number, seed: number) => {
    const topHeight = 12;
    const brickHeight = 15;
    const brickWidth = 30;
    
    const brickPaths = [];
    for (let y = 0; y < height; y += brickHeight) {
        for (let x = 0; x < width; x += brickWidth) {
            const offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            brickPaths.push(`M${x - offsetX},${y} H${x + brickWidth - offsetX}`);
        }
    }
    for (let x = 0; x < width; x += brickWidth) {
        for (let y = 0; y < height; y += brickHeight) {
             const offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
             if (x - offsetX > 0 && x - offsetX < width) {
                brickPaths.push(`M${x - offsetX},${y} V${y + brickHeight}`);
             }
        }
    }

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <defs>
                <linearGradient id={`wallFaceGrad${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a8a29e" />
                    <stop offset="100%" stopColor="#78716c" />
                </linearGradient>
                <linearGradient id={`wallTopGrad${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d6d3d1" />
                    <stop offset="100%" stopColor="#a8a29e" />
                </linearGradient>
                <clipPath id={`wallClip${seed}`}>
                    <rect x="0" y={topHeight} width={width} height={height - topHeight} />
                </clipPath>
            </defs>
            <g clipPath={`url(#wallClip${seed})`}>
                {/* Wall Face */}
                <rect x="0" y={topHeight} width={width} height={height - topHeight} fill={`url(#wallFaceGrad${seed})`} />
                <path d={brickPaths.join(' ')} transform={`translate(0, ${topHeight})`} stroke="#57534e" strokeWidth="0.5" />
            </g>
            {/* Wall Top */}
            <path d={`M 0,${topHeight} L ${topHeight},0 H ${width - topHeight} L ${width},${topHeight} H 0 Z`} fill={`url(#wallTopGrad${seed})`} />
            <line x1={topHeight} y1="0" x2={width-topHeight} y2="0" stroke="#57534e" strokeWidth="1" />
            <line x1="0" y1={topHeight} x2={width} y2={topHeight} stroke="#57534e" strokeWidth="1.5" />
        </svg>
    )
}

const renderLake = (s: number, seed: number) => {
    return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
            <defs>
                <linearGradient id={`lakeGrad${seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
            </defs>
            <ellipse cx={s/2} cy={s/2} rx={s/2 * 0.95} ry={s/2 * 0.9} fill={`url(#lakeGrad${seed})`} />
            <path d={`M ${s*0.1},${s*0.4} Q ${s*0.3},${s*0.3} ${s*0.5},${s*0.4} T ${s*0.9},${s*0.4}`} stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
            <path d={`M ${s*0.2},${s*0.6} Q ${s*0.4},${s*0.7} ${s*0.6},${s*0.6} T ${s*0.95},${s*0.55}`} stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
        </svg>
    )
}


const ObstacleComponent: React.FC<ObstacleProps> = ({ obstacle }) => {
    const { type, position, size, variant = 1 } = obstacle;
    
    const obsWidth = typeof size === 'object' ? size.width : size;
    const obsHeight = typeof size === 'object' ? size.height : size;

    const style: React.CSSProperties = {
        position: 'absolute',
        left: position.x - obsWidth / 2,
        top: position.y - obsHeight / 2,
        width: obsWidth,
        height: obsHeight,
        pointerEvents: 'none',
    };
    
    const baseSeed = position.x * position.y + variant;

    const content = useMemo(() => {
        const scaleRockTree = 1.3; // increase size of rocks/trees
        switch(type) {
            case 'rock':
                return (
                    <img src={spriteUrl('obstacles/rock.png')} alt="rock" style={{ width: obsWidth * scaleRockTree, height: obsHeight * scaleRockTree, objectFit: 'contain', transform: `translate(${-obsWidth * (scaleRockTree-1)/2}px, ${-obsHeight * (scaleRockTree-1)/2}px)` }} />
                );

            case 'rock_cluster': {
                const items = [] as JSX.Element[];
                const num = 3;
                for (let i = 0; i < num; i++) {
                    const r = 0.35 + (i === 0 ? 0.2 : 0.1);
                    const w = obsWidth * r * scaleRockTree;
                    const h = obsHeight * r * scaleRockTree;
                    const angle = (i / num) * Math.PI * 2;
                    const radius = obsWidth * 0.25;
                    const x = obsWidth / 2 + Math.cos(angle) * radius - w / 2;
                    const y = obsHeight / 2 + Math.sin(angle) * radius - h / 2;
                    items.push(
                        <img key={i} src={spriteUrl('obstacles/rock.png')} alt="rock" style={{ position: 'absolute', left: x, top: y, width: w, height: h, objectFit: 'contain' }} />
                    );
                }
                return <div className="relative w-full h-full">{items}</div>;
            }

            case 'tree': {
                return (
                    <img src={spriteUrl('obstacles/tree.png')} alt="tree" style={{ width: obsWidth * scaleRockTree, height: obsHeight * scaleRockTree, objectFit: 'contain', transform: `translate(${-obsWidth * (scaleRockTree-1)/2}px, ${-obsHeight * (scaleRockTree-1)/2}px)` }} />
                );
            }
            case 'wall': {
                // Use background tiling to ensure a continuous texture along the wall height
                return (
                    <div style={{ width: obsWidth, height: obsHeight, backgroundImage: `url('${spriteUrl('obstacles/wall.png')}')`, backgroundRepeat: 'repeat-y', backgroundSize: '100% auto' }} />
                );
            }
            case 'lake': {
                return (
                    <img src={spriteUrl('obstacles/river.png')} alt="lake" style={{ width: obsWidth * 1.2, height: obsHeight * 1.2, objectFit: 'contain', transform: `translate(${-obsWidth * 0.1}px, ${-obsHeight * 0.1}px)` }} />
                );
            }
            // rock_cluster handled above using PNGs
            default: return null;
        }
    }, [type, obsWidth, obsHeight, baseSeed]);

    return <div style={style}>{content}</div>;
};

export default React.memo(ObstacleComponent);
