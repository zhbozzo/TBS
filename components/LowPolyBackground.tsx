
import React, { useMemo } from 'react';
import { GAME_CONFIG } from '../constants';
import type { LevelTheme, ThemeArea } from '../types';

interface LowPolyBackgroundProps {
  theme: LevelTheme;
}

const seededRandom = (seed: number) => {
    let s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
};

const isPointInArea = (point: {x: number, y: number}, area: ThemeArea) => {
    const { shape } = area;
    if (shape.type === 'rect') {
        return (
            point.x >= shape.x &&
            point.x <= shape.x + shape.width &&
            point.y >= shape.y &&
            point.y <= shape.y + shape.height
        );
    }
    // Could add circle or polygon logic here later
    return false;
}

const LowPolyBackground: React.FC<LowPolyBackgroundProps> = ({ theme }) => {
  const width = GAME_CONFIG.BATTLEFIELD_WIDTH;
  const height = GAME_CONFIG.BATTLEFIELD_HEIGHT;
  const cellSize = 120; // Slightly larger cells for a cleaner look
  const { baseColors = ['#2d3748', '#4a5568'], areas = [] } = theme;

  const triangles = useMemo(() => {
    const points: { x: number, y: number }[][] = [];
    const seed = baseColors.join('').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let y = -cellSize; y <= height + cellSize; y += cellSize) {
      const row: { x: number, y: number }[] = [];
      for (let x = -cellSize; x <= width + cellSize; x += cellSize) {
        row.push({
          x: x + (seededRandom(seed + x * y) - 0.5) * cellSize * 0.7,
          y: y + (seededRandom(seed + y * x * 2) - 0.5) * cellSize * 0.7,
        });
      }
      points.push(row);
    }

    const trianglePaths = [];
    for (let y = 0; y < points.length - 1; y++) {
      for (let x = 0; x < points[y].length - 1; x++) {
        const p1 = points[y][x];
        const p2 = points[y][x + 1];
        const p3 = points[y + 1][x];
        const p4 = points[y + 1][x + 1];

        const center1 = { x: (p1.x + p2.x + p3.x) / 3, y: (p1.y + p2.y + p3.y) / 3 };
        const center2 = { x: (p2.x + p4.x + p3.x) / 3, y: (p2.y + p4.y + p3.y) / 3 };
        
        let colors1 = baseColors;
        let colors2 = baseColors;

        areas?.forEach(area => {
            if (isPointInArea(center1, area)) {
                colors1 = area.colors;
            }
            if (isPointInArea(center2, area)) {
                colors2 = area.colors;
            }
        });

        const color1 = colors1[Math.floor(seededRandom(seed + x * y * 3) * colors1.length)];
        const color2 = colors2[Math.floor(seededRandom(seed + x * y * 4) * colors2.length)];
        
        trianglePaths.push(
          <path key={`tri-${y}-${x}-1`} d={`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} Z`} fill={color1} />
        );
        trianglePaths.push(
          <path key={`tri-${y}-${x}-2`} d={`M${p2.x},${p2.y} L${p4.x},${p4.y} L${p3.x},${p3.y} Z`} fill={color2} />
        );
      }
    }
    return trianglePaths;
  }, [width, height, cellSize, baseColors, areas]);

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gray-900" aria-hidden="true">
        <svg 
            width={width} 
            height={height} 
            className="w-full h-full"
        >
            <title>Low-poly background</title>
             {triangles}
        </svg>
    </div>
  );
};

export default React.memo(LowPolyBackground);
