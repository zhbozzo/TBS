
import type { Unit, Projectile, UnitEffect, Level, AdminFlags, VisualEffect, Obstacle } from '../types';
import { Team } from '../types';
import { GAME_CONFIG, ALL_UNIT_TYPES } from '../constants';
import { playSound, playEvent } from './audioService';

const getUnitType = (id: string) => ALL_UNIT_TYPES.find(u => u.id === id);

// Desactiva cualquier heurística que use esquinas para muros
const AVOID_CORNERS = true;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
const hashString = (s: string) => { let h=0; for (let i=0;i<s.length;i++) h=((h<<5)-h + s.charCodeAt(i))|0; return h; };
const unitRadius = (u: Unit) => (u.role === 'Boss' ? 40 : 20);

const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
  if (!pos1 || !pos2) return Infinity; // Safeguard
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Checks if a line segment intersects with an axis-aligned rectangle.
 * Uses the Liang-Barsky algorithm.
 */
function lineSegmentIntersectsRect(p1: {x:number, y:number}, p2: {x:number, y:number}, rect: {left: number, right: number, top: number, bottom: number}): boolean {
    if (!p1 || !p2) return false; // Safeguard
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let t0 = 0.0;
    let t1 = 1.0;

    const p = [-dx, dx, -dy, dy];
    const q = [p1.x - rect.left, rect.right - p1.x, p1.y - rect.top, rect.bottom - p1.y];

    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) { // Parallel line
            if (q[i] < 0) return false; // outside
        } else {
            const t = q[i] / p[i];
            if (p[i] < 0) { // line proceeds from outside to inside
                if (t > t1) return false;
                if (t > t0) t0 = t;
            } else { // line proceeds from inside to outside
                if (t < t0) return false;
                if (t < t1) t1 = t;
            }
        }
    }
    return t0 < t1;
}

// Distance from point to line segment
function distancePointToSegment(p: {x:number;y:number}, a: {x:number;y:number}, b: {x:number;y:number}): number {
  const abx = b.x - a.x; const aby = b.y - a.y;
  const apx = p.x - a.x; const apy = p.y - a.y;
  const abLen2 = abx*abx + aby*aby || 1;
  let t = (apx*abx + apy*aby) / abLen2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t*abx; const cy = a.y + t*aby;
  const dx = p.x - cx; const dy = p.y - cy;
  return Math.sqrt(dx*dx + dy*dy);
}

// Expand a wall rectangle by margin (for unit clearance)
function expandRect(rect: {left:number; right:number; top:number; bottom:number}, margin: number){
  return { left: rect.left - margin, right: rect.right + margin, top: rect.top - margin, bottom: rect.bottom + margin };
}

// Check if a segment intersects ANY of the given rects
function segmentIntersectsAnyRect(p1: {x:number;y:number}, p2: {x:number;y:number}, rects: {left:number;right:number;top:number;bottom:number}[]): boolean {
  for(const r of rects){ if(lineSegmentIntersectsRect(p1,p2,r)) return true; }
  return false;
}

// Very small visibility-graph path via rectangle corners
function computeVisibilityPath(
  start: {x:number;y:number},
  goal: {x:number;y:number},
  walls: {left:number;right:number;top:number;bottom:number}[],
  clearance: number
): { x:number; y:number }[] | null {
  const expanded = walls.map(w => expandRect(w, clearance));
  // If direct LOS, no path needed
  if(!segmentIntersectsAnyRect(start, goal, expanded)) return [goal];
  // Build nodes: start, goal, and 4 outer corners per wall
  type Node = { x:number;y:number };
  const nodes: Node[] = [start, goal];
  for(const r of expanded){
    nodes.push({ x: r.left,  y: r.top });
    nodes.push({ x: r.right, y: r.top });
    nodes.push({ x: r.left,  y: r.bottom });
    nodes.push({ x: r.right, y: r.bottom });
  }
  // Filter nodes that are inside any expanded rect (shouldn't happen, but safe)
  const valid = nodes.filter(n => !expanded.some(r => n.x > r.left && n.x < r.right && n.y > r.top && n.y < r.bottom));
  // Build adjacency (visibility)
  const N = valid.length;
  const adj: Array<Array<{to:number; cost:number}>> = Array.from({length:N},()=>[]);
  const dist = (a:Node,b:Node)=> Math.hypot(a.x-b.x,a.y-b.y);
  for(let i=0;i<N;i++){
    for(let j=i+1;j<N;j++){
      const a = valid[i], b = valid[j];
      if(!segmentIntersectsAnyRect(a,b,expanded)){
        const c = dist(a,b);
        adj[i].push({to:j,cost:c});
        adj[j].push({to:i,cost:c});
      }
    }
  }
  // Dijkstra from start(0) to goal(1)
  const src = 0, dst = 1;
  const d:Array<number> = Array(N).fill(Infinity); d[src]=0;
  const prev:Array<number|null> = Array(N).fill(null);
  const used:Array<boolean> = Array(N).fill(false);
  for(let it=0;it<N;it++){
    let u=-1, best=Infinity; for(let i=0;i<N;i++){ if(!used[i] && d[i]<best){best=d[i]; u=i;} }
    if(u===-1) break; used[u]=true; if(u===dst) break;
    for(const e of adj[u]){ if(d[u]+e.cost<d[e.to]){ d[e.to]=d[u]+e.cost; prev[e.to]=u; } }
  }
  if(!isFinite(d[dst])) return null;
  const path:number[] = []; let cur: number | null = dst; while(cur!==null){ path.push(cur); cur = prev[cur]; } path.reverse();
  // Convert to waypoints after start: drop the first node (start), return remaining as waypoints
  return path.slice(1).map(idx => ({ x: valid[idx].x, y: valid[idx].y }));
}

// Compute path cost (shortest) using visibility graph; returns {cost, path}
function computePathCost(
  start: {x:number;y:number},
  goal: {x:number;y:number},
  rects: {left:number;right:number;top:number;bottom:number}[],
  clearance: number
): { cost: number; path: {x:number;y:number}[] | null } {
  const expanded = rects.map(r => expandRect(r, clearance));
  // Direct LOS
  if (!segmentIntersectsAnyRect(start, goal, expanded)) {
    return { cost: Math.hypot(goal.x - start.x, goal.y - start.y), path: [goal] };
  }
  const path = computeVisibilityPath(start, goal, rects, clearance);
  if (!path || path.length === 0) return { cost: Number.POSITIVE_INFINITY, path: null };
  let cost = 0;
  let prev = start;
  for (const p of path) { cost += Math.hypot(p.x - prev.x, p.y - prev.y); prev = p; }
  return { cost, path };
}

// ===== NAVGRID + A* PATHFINDING =====
const NAV_CELL = 28; // tamaño de celda
const SQRT2 = Math.SQRT2;

const inBounds = (x:number,y:number) =>
  x >= 0 && y >= 0 &&
  x < GAME_CONFIG.BATTLEFIELD_WIDTH &&
  y < GAME_CONFIG.BATTLEFIELD_HEIGHT;

const cellOf = (x:number,y:number) => ({
  cx: Math.floor(x / NAV_CELL),
  cy: Math.floor(y / NAV_CELL)
});
const posOfCell = (cx:number,cy:number) => ({
  x: cx * NAV_CELL + NAV_CELL/2,
  y: cy * NAV_CELL + NAV_CELL/2
});

function isWalkableCell(cx:number, cy:number, clearance:number, obstacles: Level['obstacles']): boolean {
  const { x, y } = posOfCell(cx, cy);
  if (!inBounds(x, y)) return false;

  // margen contra bordes para no “rozar” y oscilar
  const margin = clearance + 6;
  if (x < margin || x > GAME_CONFIG.BATTLEFIELD_WIDTH - margin ||
      y < margin || y > GAME_CONFIG.BATTLEFIELD_HEIGHT - margin) return false;

  for (const obs of obstacles || []) {
    if (obs.type === 'wall' && typeof obs.size === 'object') {
      const r = {
        left:  obs.position.x - (obs.size as any).width  / 2 - margin,
        right: obs.position.x + (obs.size as any).width  / 2 + margin,
        top:   obs.position.y - (obs.size as any).height / 2 - margin,
        bottom:obs.position.y + (obs.size as any).height / 2 + margin,
      };
      if (x > r.left && x < r.right && y > r.top && y < r.bottom) return false;
    } else if (typeof obs.size === 'number') {
      const rr = (obs.size/2) + margin;
      const dx = x - obs.position.x, dy = y - obs.position.y;
      if (dx*dx + dy*dy < rr*rr) return false;
    }
  }
  return true;
}

function losFree(
  a:{x:number;y:number},
  b:{x:number;y:number},
  clearance:number,
  obstacles: Level['obstacles']
): boolean {
  const rects:any[] = [];
  const circles:{c:{x:number;y:number}, r:number}[] = [];

  for (const obs of obstacles || []) {
    if (obs.type === 'wall' && typeof obs.size === 'object') {
      rects.push(expandRect({
        left:  obs.position.x - (obs.size as any).width  / 2,
        right: obs.position.x + (obs.size as any).width  / 2,
        top:   obs.position.y - (obs.size as any).height / 2,
        bottom:obs.position.y + (obs.size as any).height / 2,
      }, clearance + 6));
    } else if (typeof obs.size === 'number') {
      circles.push({ c: obs.position, r: obs.size/2 + clearance + 6 });
    }
  }

  if (segmentIntersectsAnyRect(a, b, rects)) return false;
  for (const {c, r} of circles) {
    if (distancePointToSegment(c, a, b) <= r) return false;
  }
  return true;
}

function nearestWalkableCell(startCx:number, startCy:number, clearance:number, obstacles: Level['obstacles']): {cx:number;cy:number} | null {
  // BFS en anillos alrededor del start hasta encontrar una celda válida
  const seen = new Set<string>();
  const q: Array<{cx:number;cy:number}> = [{cx:startCx, cy:startCy}];
  const key = (x:number,y:number)=>`${x},${y}`;
  while(q.length){
    const n = q.shift()!;
    if (seen.has(key(n.cx,n.cy))) continue;
    seen.add(key(n.cx,n.cy));
    if (isWalkableCell(n.cx, n.cy, clearance, obstacles)) return n;
    for (let dy=-1; dy<=1; dy++){
      for (let dx=-1; dx<=1; dx++){
        if (dx===0 && dy===0) continue;
        q.push({cx:n.cx+dx, cy:n.cy+dy});
      }
    }
    if (seen.size > 2000) break; // seguridad
  }
  return null;
}

function astarPath(start:{x:number;y:number}, goal:{x:number;y:number}, clearance:number, obstacles: Level['obstacles']): {x:number;y:number}[] | null {
  const s = cellOf(start.x, start.y);
  const g = cellOf(goal.x, goal.y);

  const sFixed = nearestWalkableCell(s.cx, s.cy, clearance, obstacles);
  const gFixed = nearestWalkableCell(g.cx, g.cy, clearance, obstacles);
  if (!sFixed || !gFixed) return null;

  const startKey = `${sFixed.cx},${sFixed.cy}`;
  const goalKey  = `${gFixed.cx},${gFixed.cy}`;

  type Node = { cx:number; cy:number; g:number; h:number; f:number; parent?:string };
  const open = new Map<string, Node>();
  const openList: string[] = [];
  const closed = new Set<string>();

  const push = (n:Node) => {
    const k = `${n.cx},${n.cy}`;
    open.set(k, n);
    openList.push(k);
  };

  const popLowestF = (): Node | null => {
    if (!openList.length) return null;
    let bestIdx = 0, bestF = Infinity;
    for (let i=0;i<openList.length;i++){
      const n = open.get(openList[i])!;
      if (n.f < bestF){ bestF = n.f; bestIdx = i; }
    }
    const k = openList.splice(bestIdx,1)[0];
    const n = open.get(k)!; open.delete(k);
    return n;
  };

  const h = (cx:number,cy:number)=> {
    const dx = cx - gFixed.cx, dy = cy - gFixed.cy;
    // heurística octile
    const adx = Math.abs(dx), ady = Math.abs(dy);
    return (Math.max(adx, ady) - Math.min(adx, ady)) + Math.min(adx, ady) * SQRT2;
  };

  push({ cx:sFixed.cx, cy:sFixed.cy, g:0, h:h(sFixed.cx,sFixed.cy), f:h(sFixed.cx,sFixed.cy) });

  const neigh = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

  const isDiagCut = (x:number,y:number,dx:number,dy:number) => {
    if (dx===0 || dy===0) return false;
    // no permitir cortar esquina si alguno de los ortogonales está bloqueado
    return !isWalkableCell(x+dx, y, clearance, obstacles) || !isWalkableCell(x, y+dy, clearance, obstacles);
  };

  const cameFrom = new Map<string,string>();
  const gScore = new Map<string,number>(); gScore.set(startKey, 0);

  while(true){
    const cur = popLowestF();
    if (!cur) return null;
    const cKey = `${cur.cx},${cur.cy}`;
    if (cKey === goalKey) {
      // reconstruir
      const pathCells: {cx:number;cy:number}[] = [];
      let k = cKey;
      while (k !== startKey){
        const [cx,cy] = k.split(',').map(Number);
        pathCells.push({cx,cy});
        k = cameFrom.get(k)!;
      }
      pathCells.reverse();
      // convertir a posiciones
      const points = pathCells.map(c => posOfCell(c.cx,c.cy));

      // Suavizado LOS seguro (greedy, sin índices negativos)
      const smoothed: {x:number;y:number}[] = [];
      let anchor = start;
      let i = 0;
      while (i < points.length) {
        let j = i;
        while (j + 1 < points.length && losFree(anchor, points[j + 1], clearance, obstacles)) j++;
        smoothed.push(points[j]);
        anchor = points[j];
        i = j + 1;
      }
      return smoothed;
    }
    closed.add(cKey);

    for (const [dx,dy] of neigh){
      const nx = cur.cx + dx, ny = cur.cy + dy;
      const nKey = `${nx},${ny}`;
      if (closed.has(nKey)) continue;
      if (!isWalkableCell(nx, ny, clearance, obstacles)) continue;
      if (isDiagCut(cur.cx, cur.cy, dx, dy)) continue;

      const step = (dx===0 || dy===0) ? 1 : SQRT2;
      const tentative = (gScore.get(cKey) || 0) + step;

      if (!open.has(nKey) || tentative < (gScore.get(nKey) || Infinity)){
        cameFrom.set(nKey, cKey);
        gScore.set(nKey, tentative);
        const hh = h(nx,ny);
        const node: Node = { cx:nx, cy:ny, g:tentative, h:hh, f:tentative+hh };
        if (!open.has(nKey)) { open.set(nKey,node); openList.push(nKey); }
      }
    }
  }
}
// --- Helpers para cadenas verticales y puertas globales ---
type Rect = { left:number; right:number; top:number; bottom:number; cx?: number };

function wallsAsRects(obstacles: Level['obstacles']): Rect[] {
  const out: Rect[] = [];
  obstacles?.forEach(o => {
    if (o.type === 'wall' && typeof o.size === 'object') {
      const w = o.size as any;
      const r: Rect = {
        left: o.position.x - w.width/2,
        right: o.position.x + w.width/2,
        top: o.position.y - w.height/2,
        bottom: o.position.y + w.height/2,
      };
      r.cx = (r.left + r.right) / 2;
      out.push(r);
    }
  });
  return out;
}

function groupVerticalChains(rects: Rect[], epsX = 32): Rect[][] {
  const sorted = [...rects].sort((a,b)=> (a.cx!-b.cx!));
  const groups: Rect[][] = [];
  let cur: Rect[] = [];
  for (const r of sorted) {
    if (!cur.length || Math.abs((r.cx as number) - (cur[0].cx as number)) <= epsX) cur.push(r);
    else { groups.push(cur); cur = [r]; }
  }
  if (cur.length) groups.push(cur);
  return groups;
}

function rectUnion(chain: Rect[]): Rect {
  return chain.reduce((acc, r) => ({
    left: Math.min(acc.left, r.left),
    right: Math.max(acc.right, r.right),
    top: Math.min(acc.top, r.top),
    bottom: Math.max(acc.bottom, r.bottom),
  }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity } as Rect);
}

function chainGates(chain: Rect[], minGap = 66): number[] {
  const s = [...chain].sort((a,b)=> a.top - b.top);
  const ys: number[] = [];
  for (let i=0;i<s.length-1;i++) {
    const gap = s[i+1].top - s[i].bottom;
    if (gap >= minGap) ys.push((s[i].bottom + s[i+1].top)/2);
  }
  return ys;
}

function slotOffset(uid: string, spread = 6): number {
  let h = 0; for (let i=0;i<uid.length;i++) h=((h<<5)-h + uid.charCodeAt(i))|0;
  const k = (Math.abs(h)%7)-3; // -3..+3
  return k * spread;
}

// ¿Este aliado bloquea mi línea de tiro hacia el target?
function friendlyBlockingOnRay(shooter: Unit, target: Unit, ally: Unit, laneWidth = 14): number {
  if (!shooter.position || !target.position || !ally.position) return 0;
  if (ally.team !== shooter.team || ally.uid === shooter.uid) return 0;

  const ax = shooter.position.x, ay = shooter.position.y;
  const bx = target.position.x,  by = target.position.y;
  const ox = ally.position.x,    oy = ally.position.y;

  const abx = bx - ax, aby = by - ay;
  const abLen2 = abx*abx + aby*aby;
  if (abLen2 < 1e-6) return 0;

  const t = ((ox-ax)*abx + (oy-ay)*aby) / abLen2;
  if (t <= 0 || t >= 1) return 0;

  const projx = ax + t * abx, projy = ay + t * aby;
  const dx = ox - projx, dy = oy - projy;
  const dist = Math.hypot(dx, dy);
  const radius = unitRadius(ally) + laneWidth;

  if (dist <= radius) {
    return Math.max(0, 1 - dist / radius);
  }
  return 0;
}


const findTarget = (attacker: Unit, allUnits: Unit[]): Unit | null => {
    const livingUnits = allUnits.filter(u => !u.dyingAt);

    if (attacker.ability === 'HEAL') {
        let mostDamagedAlly: Unit | null = null;
        let lowestHpPercentage = 100;

        // First, find the most damaged ally
        livingUnits.forEach(potentialAlly => {
            if (potentialAlly.team === attacker.team && potentialAlly.uid !== attacker.uid && potentialAlly.currentHp < potentialAlly.hp) {
                const hpPercentage = (potentialAlly.currentHp / potentialAlly.hp) * 100;
                if (hpPercentage < lowestHpPercentage) {
                    lowestHpPercentage = hpPercentage;
                    mostDamagedAlly = potentialAlly;
                }
            }
        });

        if (mostDamagedAlly) return mostDamagedAlly;

        // If all allies are healthy, find the tankiest NON-CLERIC ally to follow
        let tankiestAlly: Unit | null = null;
        let maxHp = -1;
        livingUnits.forEach(potentialAlly => {
             // Only follow non-cleric allies to stay near the action
             if (potentialAlly.team === attacker.team && potentialAlly.uid !== attacker.uid && potentialAlly.id !== 'cleric') {
                if (potentialAlly.hp > maxHp) {
                    maxHp = potentialAlly.hp;
                    tankiestAlly = potentialAlly;
                }
            }
        });
        
        // If no non-cleric ally is found, find the closest ally of any type to prevent standing still.
        if (!tankiestAlly) {
            let closestAlly: Unit | null = null;
            let minDistance = Infinity;
            livingUnits.forEach(potentialAlly => {
                if (potentialAlly.team === attacker.team && potentialAlly.uid !== attacker.uid) {
                    const distance = calculateDistance(attacker.position, potentialAlly.position);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestAlly = potentialAlly;
                    }
                }
            });
            return closestAlly; // Return closest ally (can be another cleric)
        }
    
        return tankiestAlly;
    } 
    
    if (attacker.id === 'enchantress') {
        // Enchantress should follow the 'center of mass' of the army, by following the tankiest ally.
        let tankiestAlly: Unit | null = null;
        let maxHp = -1;
        livingUnits.forEach(potentialAlly => {
             if (potentialAlly.team === attacker.team && potentialAlly.uid !== attacker.uid && potentialAlly.id !== 'enchantress') {
                if (potentialAlly.hp > maxHp) {
                    maxHp = potentialAlly.hp;
                    tankiestAlly = potentialAlly;
                }
            }
        });
        
        // Fallback to closest ally if no other non-enchantress is available
        if (!tankiestAlly) {
            let closestAlly: Unit | null = null;
            let minDistance = Infinity;
            livingUnits.forEach(potentialAlly => {
                if (potentialAlly.team === attacker.team && potentialAlly.uid !== attacker.uid) {
                    const distance = calculateDistance(attacker.position, potentialAlly.position);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestAlly = potentialAlly;
                    }
                }
            });
            return closestAlly;
        }
    
        return tankiestAlly;
    }

    // Assassin/Sandworm logic: prioritize non-tanks
    if (attacker.id === 'assassin' || attacker.id === 'sandworm' || attacker.id === 'valkyrie') {
        let bestTarget: Unit | null = null;
        let minDistance = Infinity;
        livingUnits.forEach(potentialTarget => {
            if (potentialTarget.team !== attacker.team) {
                // Prioritize Support/RangedDPS > MeleeDPS > Swarm > Tank
                const isPriority = potentialTarget.role === 'Support' || potentialTarget.role === 'RangedDPS';
                if (!bestTarget || (isPriority && bestTarget.role === 'Tank')) {
                    bestTarget = potentialTarget;
                    minDistance = calculateDistance(attacker.position, potentialTarget.position);
                } else if ((bestTarget.role !== 'Support' && bestTarget.role !== 'RangedDPS') || !isPriority) {
                     const distance = calculateDistance(attacker.position, potentialTarget.position);
                     if (distance < minDistance) {
                        minDistance = distance;
                        bestTarget = potentialTarget;
                    }
                }
            }
        });
        return bestTarget;
    }

    // Default targeting: closest enemy
    let closestTarget: Unit | null = null;
    let minDistance = Infinity;
    livingUnits.forEach(potentialTarget => {
        if (potentialTarget.team !== attacker.team) {
            const distance = calculateDistance(attacker.position, potentialTarget.position);
            if (distance < minDistance) {
                minDistance = distance;
                closestTarget = potentialTarget;
            }
        }
    });
    return closestTarget;
};

export const runSimulationTick = (
    currentUnits: Unit[], 
    currentProjectiles: Projectile[], 
    obstacles: Level['obstacles'],
    adminFlags: AdminFlags
): { nextUnitsState: Unit[], nextProjectilesState: Projectile[], newVisualEffects: VisualEffect[] } => {
  const timestamp = Date.now();
  const tickDuration = GAME_CONFIG.SIMULATION_TICK_MS;
  const DEATH_ANIM_DURATION = 500;
  type AttackMotion = { phase:'windup'|'strike'|'recover'; until:number; dir:number; lunge:number };
  const ATTACK_MOTION = {
    troop: { windup: 90,  strike: 70,  recover: 140, lunge: 18 },
    boss:  { windup: 220, strike: 180, recover: 280, lunge: 10 },
  } as const;
  
  let newVisualEffects: VisualEffect[] = [];

  // Filter out units whose death animation has finished
  let nextUnitsState: Unit[] = currentUnits
    .filter(u => !u.dyingAt || timestamp - u.dyingAt < DEATH_ANIM_DURATION)
    .map(unit => ({
      ...unit,
      position: unit.position ? { ...unit.position } : { x: 0, y: 0}, // Safeguard
      effects: unit.effects.map(effect => ({ ...effect })),
    }));

  // Precompute team flow centers for wall maps to guide units along a shared lane
  const hasWalls = (obstacles || []).some(o => o.type === 'wall');
  const teamCenterY: Record<number, number> = { 0: 0, 1: 0 };
  if (hasWalls) {
    const blue = nextUnitsState.filter(u => u.team === Team.Blue && !u.dyingAt);
    const red = nextUnitsState.filter(u => u.team === Team.Red && !u.dyingAt);
    const avgY = (arr: Unit[]) => arr.length ? arr.reduce((s,u)=>s+u.position.y,0)/arr.length : GAME_CONFIG.BATTLEFIELD_HEIGHT/2;
    teamCenterY[Team.Blue] = avgY(blue);
    teamCenterY[Team.Red] = avgY(red);
  }
  // Centro Y del equipo enemigo (sirve como "carril" natural)
  const enemyCenterY: Record<number, number> = {
    [Team.Blue]: teamCenterY[Team.Red] || GAME_CONFIG.BATTLEFIELD_HEIGHT / 2,
    [Team.Red]:  teamCenterY[Team.Blue] || GAME_CONFIG.BATTLEFIELD_HEIGHT / 2,
  };
  // Elegimos una Y de carril dentro del tramo de la muralla, lejos de extremos
  const pickLaneY = (unit: Unit, rect: {top:number; bottom:number}) => {
    const bandTop = rect.top + 56;
    const bandBottom = rect.bottom - 56;
    return clamp(enemyCenterY[unit.team], bandTop, bandBottom);
  };

  // --- PLAN GLOBAL DE RUTA: detectar cadena vertical principal y puerta por equipo ---
  const wallRectsAll = wallsAsRects(obstacles);
  const chains = groupVerticalChains(wallRectsAll, 32);
  let mainChain: Rect[] | null = null;
  let mainChainRect: Rect | null = null;
  let mainCx = 0;
  if (chains.length) {
    mainChain = chains.reduce((best, c) => {
      const hBest = rectUnion(best).bottom - rectUnion(best).top;
      const hCur = rectUnion(c).bottom - rectUnion(c).top;
      return hCur > hBest ? c : best;
    }, chains[0]);
    mainChainRect = rectUnion(mainChain);
    mainCx = (mainChainRect.left + mainChainRect.right) / 2;
  }

  const teamGate: Record<number, {x:number;y:number} | null> = { [Team.Blue]: null, [Team.Red]: null };
  if (mainChain && mainChainRect) {
    const gates = chainGates(mainChain, 66);
    const pickLaneYTeam = (team: number) => {
      const bandTop = mainChainRect!.top + 56;
      const bandBottom = mainChainRect!.bottom - 56;
      const anchor = enemyCenterY[team];
      return clamp(anchor, bandTop, bandBottom);
    };

    [Team.Blue, Team.Red].forEach(team => {
      const unitsTeam = nextUnitsState.filter(u => u.team === team && !u.dyingAt);
      const avgX = unitsTeam.length ? unitsTeam.reduce((s,u)=>s+u.position.x,0)/unitsTeam.length
                                    : (team===Team.Blue ? 0 : GAME_CONFIG.BATTLEFIELD_WIDTH);
      const leftSide = avgX <= mainCx;
      const buffer = 60;
      const approachX = leftSide ? mainChainRect!.left - buffer : mainChainRect!.right + buffer;
      let gateY = gates.length ? gates.reduce((best,y)=>{
        const anchor = enemyCenterY[team];
        return Math.abs(y - anchor) < Math.abs(best - anchor) ? y : best;
      }, gates[0]) : pickLaneYTeam(team);
      teamGate[team] = {
        x: Math.max(10, Math.min(approachX, GAME_CONFIG.BATTLEFIELD_WIDTH - 10)),
        y: Math.max(mainChainRect.top + 40, Math.min(gateY, mainChainRect.bottom - 40))
      };
    });
  }
  
  let nextProjectilesState: Projectile[] = [...currentProjectiles];

  const handleDeath = (dyingUnit: Unit) => {
    if (dyingUnit.ability === 'DEATH_BOMB' && dyingUnit.abilityRadius && dyingUnit.position) {
        playSound(dyingUnit.impactSound, 0.8);
        newVisualEffects.push({
            id: `vfx_death_bomb_${dyingUnit.uid}_${Date.now()}`,
            type: 'explosion',
            position: dyingUnit.position,
            radius: dyingUnit.abilityRadius,
            duration: 600,
            startTime: timestamp,
            color: 'rgba(251, 146, 60, 0.8)'
        });
        
        nextUnitsState.forEach(enemy => {
            if (enemy.uid !== dyingUnit.uid && enemy.team !== dyingUnit.team && !enemy.dyingAt && enemy.position) {
                if (calculateDistance(dyingUnit.position, enemy.position) <= dyingUnit.abilityRadius!) {
                    if (adminFlags.godMode && enemy.team === Team.Blue) { /* no damage */ }
                    else if (adminFlags.instaKill && enemy.team === Team.Red) {
                        enemy.currentHp = 0;
                    } else {
                        enemy.currentHp -= dyingUnit.damage; // Use bomber's damage for explosion
                    }

                    if (enemy.currentHp <= 0 && !enemy.dyingAt) {
                        enemy.dyingAt = timestamp;
                        handleDeath(enemy); // Recursive call for chain reactions
                    }
                }
            }
        });
    }
  };

  // --- AURA & PASSIVE ABILITIES ---
  const enchantresses = nextUnitsState.filter(u => u.id === 'enchantress' && u.ability === 'DAMAGE_AURA' && !u.dyingAt);
  nextUnitsState.forEach(unit => {
      // Clear previous tick's temporary effects
      unit.effects = unit.effects
          .map(effect => ({ ...effect, duration: effect.duration - tickDuration }))
          .filter(effect => effect.duration > 0 && effect.type !== 'empower'); // Remove empower, it's recalculated
  });

  // Apply Enchantress aura
  enchantresses.forEach(enchantress => {
      const AURA_PULSE_INTERVAL = 1500;
      if(timestamp - enchantress.lastAttackTime > AURA_PULSE_INTERVAL) {
          enchantress.lastAttackTime = timestamp;
          playSound(enchantress.impactSound || 'aura-pulse.wav', 0.2);
          newVisualEffects.push({
              id: `vfx_enchant_${enchantress.uid}_${Date.now()}`,
              type: 'explosion',
              position: enchantress.position,
              radius: enchantress.attackRange,
              duration: 600,
              startTime: timestamp,
              color: 'rgba(192, 132, 252, 0.4)'
          });
      }

      nextUnitsState.forEach(ally => {
          if (ally.team === enchantress.team && ally.uid !== enchantress.uid && !ally.dyingAt) {
              if (calculateDistance(enchantress.position, ally.position) <= enchantress.attackRange) {
                  if (!ally.effects.some(e => e.type === 'empower')) {
                       ally.effects.push({
                          type: 'empower',
                          duration: tickDuration + 10,
                          power: enchantress.damage,
                          sourceId: enchantress.uid
                      });
                  }
              }
          }
      });
  });

  // Process other effects and passive abilities
  nextUnitsState.forEach(unit => {
      if (unit.dyingAt) return; // Skip logic for dying units

      if (unit.ability === 'SELF_HEAL'){
         const lastAbility = (unit as any).lastAbilityTime || 0;
         if (timestamp - lastAbility > 2000){
         unit.currentHp = Math.min(unit.hp, unit.currentHp + unit.damage);
           (unit as any).lastAbilityTime = timestamp;
         playSound(unit.impactSound || 'heal-impact.wav');
         }
      }
      if ((unit.id === 'magma_elemental' || unit.id === 'boss_magma_colossus') && unit.ability === 'DAMAGE_AURA') {
          const burnTickInterval = 1000;
          const lastBurnTick = (unit as any).lastBurnTick || 0;
          if (timestamp - lastBurnTick >= burnTickInterval) {
              (unit as any).lastBurnTick = timestamp;
              let didBurn = false;
              nextUnitsState.forEach(enemy => {
                  if (enemy.team !== unit.team && !enemy.dyingAt && calculateDistance(unit.position, enemy.position) <= unit.attackRange) {
                      if (adminFlags.instaKill && enemy.team === Team.Red) enemy.currentHp = 0;
                      else if (adminFlags.godMode && enemy.team === Team.Blue) { /* no damage */ }
                      else enemy.currentHp -= unit.damage;
                      
                      if (enemy.currentHp <= 0 && !enemy.dyingAt) {
                        enemy.dyingAt = timestamp;
                        handleDeath(enemy);
                      }
                      didBurn = true;
                  }
              });
              if (didBurn) playSound(unit.impactSound, 0.3);
          }
      }
  });

  // Main logic loop for each unit
  nextUnitsState.forEach(unit => {
    if (unit.dyingAt || !unit.position) return;

    // Cleric and Enchantress always re-evaluate target to find someone to follow/heal
    if (unit.ability === 'HEAL' || unit.id === 'enchantress') {
        unit.targetId = findTarget(unit, nextUnitsState)?.uid ?? null;
    } else if (!unit.targetId || !nextUnitsState.find(u => u.uid === unit.targetId && !u.dyingAt)) {
        unit.targetId = findTarget(unit, nextUnitsState)?.uid ?? null;
    }
    // Tralalero Tralala: BITE - latch onto nearest enemy, apply DPS and stun
    if (unit.id === 'tralalero_tralala' && unit.ability === 'BITE') {
      const latchRange = unit.abilityRadius || 50;
      // Acquire/maintain target
      let biteTarget: Unit | null = null;
      if ((unit as any).biteTargetId) {
        biteTarget = nextUnitsState.find(u => u.uid === (unit as any).biteTargetId && !u.dyingAt) || null;
        if (biteTarget && calculateDistance(unit.position, biteTarget.position) > latchRange * 2) {
          biteTarget = null;
          (unit as any).biteTargetId = null;
        }
      }
      if (!biteTarget && unit.targetId) {
        // Intenta morder al target actual si está en rango
        const currentTarget = nextUnitsState.find(u => u.uid === unit.targetId && !u.dyingAt);
        if (currentTarget && currentTarget.team !== unit.team) {
          const d = calculateDistance(unit.position, currentTarget.position);
          if (d <= latchRange) {
            (unit as any).biteTargetId = currentTarget.uid;
            biteTarget = currentTarget;
          }
        }
      }
      if (biteTarget) {
        // Move to target and stick to it
        const ang = Math.atan2(biteTarget.position.y - unit.position.y, biteTarget.position.x - unit.position.x);
        const dist = calculateDistance(unit.position, biteTarget.position);
        if (dist > 30) { // Acercarse si está lejos
          const moveSpeed = unit.speed * (tickDuration / 1000);
          unit.position.x += Math.cos(ang) * Math.min(dist - 25, moveSpeed);
          unit.position.y += Math.sin(ang) * Math.min(dist - 25, moveSpeed);
        }
        
        // Marcar que está mordiendo para animación
        unit.lastAttackTime = timestamp;
        
        // Apply stun effect continuously (no actions)
        biteTarget.effects = biteTarget.effects.filter(e => !(e.type === 'stun' && e.sourceId === unit.uid));
        biteTarget.effects.push({ type: 'stun', duration: 500, power: 1, sourceId: unit.uid });
        
        // Apply small continuous damage
        const tickEvery = 200; // ms
        const lastTick = (unit as any).biteLastTick || 0;
        if (timestamp - lastTick >= tickEvery) {
          (unit as any).biteLastTick = timestamp;
          const dps = 8; // daño constante pero bajo
          if (adminFlags.instaKill && biteTarget.team === Team.Red) biteTarget.currentHp = 0;
          else if (!(adminFlags.godMode && biteTarget.team === Team.Blue)) biteTarget.currentHp -= dps;
          
          // Efecto visual de mordida
          newVisualEffects.push({
            id: `vfx_bite_${unit.uid}_${timestamp}`,
            type: 'hit_flash',
            position: { x: biteTarget.position.x, y: biteTarget.position.y - 10 },
            radius: 20,
            duration: 150,
            startTime: timestamp,
            color: 'rgba(255, 100, 100, 0.9)'
          });
          
          if (biteTarget.currentHp <= 0 && !biteTarget.dyingAt) {
            biteTarget.dyingAt = timestamp;
            handleDeath(biteTarget);
            (unit as any).biteTargetId = null;
          }
        }
      }
      // Si está mordiendo, skip el resto de la lógica de movimiento
      if (biteTarget) return;
    }

    // Retarget con alcance real: rango + radios (para melee grandes)
    if (unit.ability !== 'HEAL' && unit.id !== 'enchantress') {
      let nearestEnemy: Unit | null = null;
      let nearestDist = Infinity;
      for (const u of nextUnitsState) {
        if (u.team === unit.team || u.dyingAt) continue;
        const d = calculateDistance(unit.position, u.position);
        if (d < nearestDist) { nearestDist = d; nearestEnemy = u; }
      }
      if (nearestEnemy) {
        const isMelee =
          unit.role === 'Boss' || unit.role === 'Tank' ||
          (unit.role || '').includes('Melee') || unit.role === 'Swarm';

        const reach = isMelee
          ? (unit.attackRange + unitRadius(unit) + unitRadius(nearestEnemy) - 6)
          : (unit.attackRange + 6);

        if (nearestDist <= reach) unit.targetId = nearestEnemy.uid;

        // Failsafe: si está físicamente tocando a alguien, targetéalo sí o sí
        if (nearestDist <= unitRadius(unit) + unitRadius(nearestEnemy) + 2) {
          unit.targetId = nearestEnemy.uid;
        }
      }
    }
    
    const target = unit.targetId ? nextUnitsState.find(u => u.uid === unit.targetId) : null;

    if (!target || !target.position) return;

    // Lock/impulso de ataque por rol
    const prof = unit.role === 'Boss' ? ATTACK_MOTION.boss : ATTACK_MOTION.troop;
    let motion = (unit as any)._attackMotion as AttackMotion | undefined;
    if (motion && timestamp >= motion.until) {
      if (motion.phase === 'windup') { motion.phase = 'strike';  motion.until = timestamp + prof.strike; }
      else if (motion.phase === 'strike') { motion.phase = 'recover'; motion.until = timestamp + prof.recover; }
      else { motion = undefined; }
      (unit as any)._attackMotion = motion;
    }
    let speedAttackFactor = 1;
    let addImpulseX = 0, addImpulseY = 0;
    const TICK_S = GAME_CONFIG.SIMULATION_TICK_MS / 1000;
    if (motion) {
      unit.rotation = motion.dir * 180/Math.PI;
      if (motion.phase === 'windup') {
        speedAttackFactor = 0;
      } else if (motion.phase === 'strike') {
        const step = motion.lunge * TICK_S;
        addImpulseX += Math.cos(motion.dir) * step;
        addImpulseY += Math.sin(motion.dir) * step;
        speedAttackFactor = 0.15;
      } else if (motion.phase === 'recover') {
        speedAttackFactor = unit.role === 'Boss' ? 0.45 : 0.75;
      }
    }
    
    // Si la unidad está stunned, no puede moverse (excepto Tralalero)
    const stunEffect = unit.effects.find(e => e.type === 'stun');
    if (stunEffect && unit.id !== 'tralalero_tralala') return;

    const distance = calculateDistance(unit.position, target.position);
    const clearanceNav = unit.isFlying ? 0 : (unit.role === 'Boss' ? 40 : 20);
    const hasLOS = unit.isFlying || losFree(unit.position, target.position, clearanceNav, obstacles);
    // LOS de disparo (trayectoria de proyectil, sin inflar)
    const hasShotLOS = unit.isFlying || losFree(unit.position, target.position, -6, obstacles);
    // Para casos como sandworm: obligar a salir del "hueco" detrás del obstáculo.
    const clearanceNavTarget = target.isFlying ? 0 : (target.role === 'Boss' ? 40 : 20);
    const targetSeesMe = target.isFlying || losFree(target.position, unit.position, clearanceNavTarget, obstacles);
    
    const rageEffect = unit.effects.find(e => e.type === 'rage');
    const slowEffect = unit.effects.find(e => e.type === 'slow');
    const speedMultiplier = (rageEffect?.power || 1) * (slowEffect ? (1 - slowEffect.power) : 1);
    
    const isSupportFollow = (unit.ability === 'HEAL' || unit.id === 'enchantress') && target.team === unit.team;
    const isEnemyTarget = target.team !== unit.team;
    const isMeleeUnit = unit.role === 'Tank' || (unit.role || '').includes('Melee') || unit.role === 'Boss' || unit.role === 'Swarm';
    const rSelf   = unitRadius(unit);
    const rTarget = unitRadius(target);
    const desiredReach = isMeleeUnit ? (unit.attackRange + rSelf + rTarget - 6) : unit.attackRange;
    // si ya estoy para pegar, me anclo (cortar fuerzas laterales/nav)
    const meleeAnchor = isEnemyTarget && isMeleeUnit && distance <= desiredReach * 1.10;

    // --- Política de distancia para RANGED ---
    const isRanged = isEnemyTarget && !isMeleeUnit;
    // Reemplazo por trigger con histéresis
    const ADVANCE_EXTRA = 10;
    const ENTER_HOLD_DIST = unit.attackRange;
    const LEAVE_HOLD_DIST = unit.attackRange + ADVANCE_EXTRA;
    let holding = (unit as any)._holding || false;
    if (isRanged && hasShotLOS) {
      if (!holding && distance <= ENTER_HOLD_DIST) holding = true;
      if (holding && distance > LEAVE_HOLD_DIST) holding = false;
    } else {
      holding = false;
    }
    (unit as any)._holding = holding;
    const KITE_RATIO = 0.55;
    const wantsToKite = isRanged && hasShotLOS && distance <  (unit.attackRange * KITE_RATIO);

    const wantsToMove =
      (isRanged ? !hasShotLOS : (!meleeAnchor && !hasLOS)) ||
      (isSupportFollow && distance > unit.attackRange / 2) ||
      (isMeleeUnit ? (distance > desiredReach) : (!holding)) ||
      (unit.id === 'sandworm' && !targetSeesMe);

    if (wantsToMove) {
        let moveTargetPosition = { ...target.position };

        // RANGED demasiado cerca → dar un pasito hacia atrás
        if (wantsToKite) {
          const away = Math.atan2(unit.position.y - target.position.y, unit.position.x - target.position.x);
          const step = 18;
          moveTargetPosition = {
            x: unit.position.x + Math.cos(away) * step,
            y: unit.position.y + Math.sin(away) * step,
          };
        }

        // RANGED sin LOS: micro-flanqueo determinista antes de A*
        if (isRanged && !hasShotLOS && isEnemyTarget) {
          const vx = target.position.x - unit.position.x;
          const vy = target.position.y - unit.position.y;
          const vlen = Math.hypot(vx, vy) || 1;
          const nx = -vy / vlen, ny = vx / vlen;
          const probe = 36;
          const left  = { x: unit.position.x + nx*probe, y: unit.position.y + ny*probe };
          const right = { x: unit.position.x - nx*probe, y: unit.position.y - ny*probe };
          const losL = losFree(left,  target.position, -6, obstacles);
          const losR = losFree(right, target.position, -6, obstacles);
          if (losL !== losR) moveTargetPosition = losL ? left : right;
          else moveTargetPosition = (hashString(unit.uid) & 1) ? left : right;
        }

        // --- NAV: A* PATHFINDING (reliable gaps/puertas) ---
        if (!unit.isFlying) {
          const clearance = (unit.role === 'Boss' ? 40 : 20);
          if (losFree(unit.position, target.position, clearance, obstacles)) {
                    unit.waypoint = null; 
                } else {
            type PathState = { path: {x:number;y:number}[]; idx: number; toKey: string; nextReplanAt: number };
            const ps: PathState | undefined = (unit as any).pathState;
            const toCell = cellOf(target.position.x, target.position.y);
            const toKey = `${toCell.cx},${toCell.cy}`;
            const now = timestamp;

            const needReplan =
              !ps ||
              ps.toKey !== toKey ||
              now >= ps.nextReplanAt ||
              ps.idx >= (ps.path.length - 1);

            if (needReplan) {
              const newPath = astarPath(unit.position, target.position, clearance, obstacles);
              if (newPath && newPath.length) {
                (unit as any).pathState = { path: newPath, idx: 0, toKey, nextReplanAt: now + 600 };
              } else {
                // Fallback caminable: paso al vecino walkable más cercano al objetivo
                const here = cellOf(unit.position.x, unit.position.y);
                let best: {cx:number;cy:number} | null = null;
                let bestF = Infinity;
                const neigh = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
                for (const [dx,dy] of neigh) {
                  const nx = here.cx + dx, ny = here.cy + dy;
                  if (!isWalkableCell(nx, ny, clearance, obstacles)) continue;
                  const p = posOfCell(nx, ny);
                  const f = Math.hypot(p.x - target.position.x, p.y - target.position.y);
                  if (f < bestF) { bestF = f; best = {cx:nx, cy:ny}; }
                }
                const step = best ? [posOfCell(best.cx, best.cy)] : [target.position];
                (unit as any).pathState = { path: step, idx: 0, toKey, nextReplanAt: now + 400 };
              }
            }

            const state: PathState = (unit as any).pathState;
            const wp = state.path[Math.min(state.idx, state.path.length - 1)];
            const reachDist = 24;
            if (calculateDistance(unit.position, wp) <= reachDist) state.idx++;
            const nextWp = state.path[Math.min(state.idx+1, state.path.length - 1)];
            if (nextWp && losFree(unit.position, nextWp, clearance, obstacles)) state.idx++;

            // --- AIRBAG: waypoint inválido → fallback seguro ---
            if (!wp || !Number.isFinite(wp.x) || !Number.isFinite(wp.y)) {
              (unit as any).pathState = undefined;
              unit.waypoint = null;
              moveTargetPosition = { ...target.position };
            } else {
              unit.waypoint = wp;
              moveTargetPosition = { ...wp };
            }
          }
        }
        // --- END NAV: A* PATHFINDING ---

        // --- Anti-stuck meta por unidad ---
        const navMeta = (unit as any);
        const lp = navMeta._lastPos || unit.position;
        const moved = Math.hypot(unit.position.x - lp.x, unit.position.y - lp.y);
        navMeta._lastPos = { x: unit.position.x, y: unit.position.y };
        navMeta._stillTicks = (moved < 0.25) ? (navMeta._stillTicks || 0) + 1 : 0;

        if ((unit as any).pathState) {
          const idxNow = ((unit as any).pathState as any).idx;
          const idxLast = navMeta._lastIdx ?? -1;
          navMeta._idxStall = (idxNow === idxLast) ? (navMeta._idxStall || 0) + 1 : 0;
          navMeta._lastIdx = idxNow;
        } else {
          navMeta._idxStall = 0;
        }

        if ((navMeta._stillTicks > 18 || navMeta._idxStall > 18) && !losFree(unit.position, target.position, (unit.role === 'Boss' ? 40 : 20), obstacles)) {
          (unit as any).pathState = undefined;
          const ang = Math.atan2(target.position.y - unit.position.y, target.position.x - unit.position.x);
          moveTargetPosition.x += -Math.sin(ang) * 12;
          moveTargetPosition.y +=  Math.cos(ang) * 12;
        }

        if (!Number.isFinite(moveTargetPosition.x) || !Number.isFinite(moveTargetPosition.y)) {
          moveTargetPosition = { ...target.position };
        }
        const dx = moveTargetPosition.x - unit.position.x;
        const dy = moveTargetPosition.y - unit.position.y;
        const angleToTarget = Math.atan2(dy, dx);
        
        let moveX = Math.cos(angleToTarget) * unit.speed * speedMultiplier * speedAttackFactor;
        let moveY = Math.sin(angleToTarget) * unit.speed * speedMultiplier * speedAttackFactor;
        // Mantenerse lejos del techo/piso
        const EDGE_KEEP = 56;
        if (unit.position.y < EDGE_KEEP) {
          moveY += (EDGE_KEEP - unit.position.y) * 0.002 * unit.speed;
        } else if (unit.position.y > GAME_CONFIG.BATTLEFIELD_HEIGHT - EDGE_KEEP) {
          moveY -= (unit.position.y - (GAME_CONFIG.BATTLEFIELD_HEIGHT - EDGE_KEEP)) * 0.002 * unit.speed;
        }

        // Impulso de ataque (lunge)
        moveX += addImpulseX;
        moveY += addImpulseY;

        // --- START UNIT-UNIT SEPARATION (avoid overlapping) ---
        const desiredSeparation = (unit.role === 'Boss' ? 120 : (unit.role === 'Tank' ? 60 : 40)) * 0.75; // Boss/Tank más grandes
        let sepX = 0;
        let sepY = 0;
        let neighbors = 0;
        for (const other of nextUnitsState) {
          if (other.uid === unit.uid || other.dyingAt) continue;
          const dx = unit.position.x - other.position.x;
          const dy = unit.position.y - other.position.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (!meleeAnchor && dist > 0 && dist < desiredSeparation) {
            // Vector de repulsión proporcional a la cercanía
            const inv = 1 / dist;
            let pairScale = 1;
            if (other.team === unit.team) {
              if (unit.role !== 'Boss' && other.role === 'Boss') pairScale = 2.0; // apártate del Boss
              else if (unit.role === 'Boss' && other.role !== 'Boss') pairScale = 0.4; // Boss empuja más
            }
            sepX += dx * inv * pairScale;
            sepY += dy * inv * pairScale;
            neighbors++;
          }

          // Sesgo tangencial: abrir carril de tiro si un aliado está en mi línea
          if (isRanged && isEnemyTarget && other.team === unit.team) {
            const blockScore = friendlyBlockingOnRay(unit, target, other, 12);
            if (blockScore > 0) {
              const vx0 = target.position.x - unit.position.x;
              const vy0 = target.position.y - unit.position.y;
              const vlen0 = Math.hypot(vx0, vy0) || 1;
              const cross0 = (vx0) * (other.position.y - unit.position.y) - (vy0) * (other.position.x - unit.position.x);
              const side0 = Math.sign(cross0) || (((hashString(unit.uid) & 1) ? 1 : -1));
              const tx0 = (-vy0 / vlen0) * side0;
              const ty0 = ( vx0 / vlen0) * side0;
              moveX += tx0 * unit.speed * 0.6 * blockScore;
              moveY += ty0 * unit.speed * 0.6 * blockScore;
            }
          }
        }
        if (neighbors > 0) {
          sepX /= neighbors;
          sepY /= neighbors;
          const sepLen = Math.sqrt(sepX*sepX + sepY*sepY) || 1;
          sepX = (sepX / sepLen) * unit.speed * 1.2;
          sepY = (sepY / sepLen) * unit.speed * 1.2;
          moveX += sepX;
          moveY += sepY;
        }
        // Evitar quedarnos atrapados en esquinas: pequeño jitter si no avanzamos
        if (!meleeAnchor && Math.abs(moveX) + Math.abs(moveY) < 0.001) {
          moveX += (Math.random() - 0.5) * 0.2;
          moveY += (Math.random() - 0.5) * 0.2;
        }
        // --- END UNIT-UNIT SEPARATION ---

        // === FIRE-LANE CLEARANCE (abrirse lateralmente para conseguir LOS de disparo) ===
        if (!meleeAnchor && isRanged && !hasShotLOS && isEnemyTarget) {
          let bestScore = 0;
          let sideAccumulator = 0;
          let holdingAhead = false;

          for (const ally of nextUnitsState) {
            if (ally.dyingAt || ally.uid === unit.uid || ally.team !== unit.team) continue;
            if (calculateDistance(ally.position, target.position) >= distance) continue;

            const score = friendlyBlockingOnRay(unit, target, ally, 14);
            if (score <= 0) continue;
            holdingAhead = holdingAhead || !!((ally as any)._holding);
            const cross = (target.position.x - unit.position.x) * (ally.position.y - unit.position.y)
                        - (target.position.y - unit.position.y) * (ally.position.x - unit.position.x);
            sideAccumulator += Math.sign(cross) * score;
            if (score > bestScore) bestScore = score;
          }

          if (bestScore > 0) {
            const vx1 = target.position.x - unit.position.x;
            const vy1 = target.position.y - unit.position.y;
            const vlen1 = Math.hypot(vx1, vy1) || 1;
            let dirSide = sideAccumulator < 0 ? +1 : (sideAccumulator > 0 ? -1 : ((hashString(unit.uid) & 1) ? 1 : -1));
            const tx1 = (-vy1 / vlen1) * dirSide;
            const ty1 = ( vx1 / vlen1) * dirSide;
            let force = unit.speed * (0.8 + 0.6 * bestScore);
            if (holdingAhead) force *= 1.35;
            moveX += tx1 * force;
            moveY += ty1 * force;
            moveX -= (vx1 / vlen1) * unit.speed * 0.15;
            moveY -= (vy1 / vlen1) * unit.speed * 0.15;
          }
        }
        // === END FIRE-LANE CLEARANCE ===

        // --- EXISTING OBSTACLE AVOIDANCE (for non-walls) ---
        if (!meleeAnchor && !unit.isFlying) {
            const unitSize = unit.role === 'Boss' ? 80 : 40;
            obstacles?.forEach(obs => {
                let collisionNormal: { x: number, y: number } | null = null;
                let proximityFactor = 0; 

                // Add soft repulsion around walls too (so units slide along instead of oscillating)
                if (obs.type === 'wall' && typeof obs.size === 'object') {
                    const wallRect = {
                        left: obs.position.x - (obs.size as any).width / 2,
                        right: obs.position.x + (obs.size as any).width / 2,
                        top: obs.position.y - (obs.size as any).height / 2,
                        bottom: obs.position.y + (obs.size as any).height / 2,
                    };
                    const nearestX = Math.max(wallRect.left, Math.min(unit.position.x, wallRect.right));
                    const nearestY = Math.max(wallRect.top, Math.min(unit.position.y, wallRect.bottom));
                    const dx = unit.position.x - nearestX;
                    const dy = unit.position.y - nearestY;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const avoidDist = (unitSize / 2) + 14; // small halo around wall
                    if (dist < avoidDist && dist > 0.01) {
                        collisionNormal = { x: dx / dist, y: dy / dist };
                        proximityFactor = 1 - (dist / avoidDist);
                    }
                    // Continue to allow circular obstacle logic as well
                }

                if (typeof obs.size === 'number') { // Handles all circular obstacles
                    const distToObstacle = calculateDistance(unit.position, obs.position);
                    const combinedRadius = (unitSize / 2) + (obs.size / 2);
                    const avoidanceBuffer = 10;
                    const effectiveRadius = combinedRadius + avoidanceBuffer;

                    if (distToObstacle < effectiveRadius) {
                         const angle = Math.atan2(unit.position.y - obs.position.y, unit.position.x - obs.position.x);
                         collisionNormal = { x: Math.cos(angle), y: Math.sin(angle) };
                         proximityFactor = 1 - (distToObstacle / effectiveRadius);
                    }
                }

                if (collisionNormal) {
                    const engagedRecently = (unit as any).engagedUntil && timestamp < (unit as any).engagedUntil;
                    const readyToAttack = hasLOS && target && calculateDistance(unit.position, target.position) <= (unit.attackRange * 1.15);
                    const dotProduct = moveX * collisionNormal.x + moveY * collisionNormal.y;
        
                    if (dotProduct < 0) {
                        moveX -= dotProduct * collisionNormal.x;
                        moveY -= dotProduct * collisionNormal.y;
                    }
        
                    let repulsionForce = proximityFactor * unit.speed * ((engagedRecently || readyToAttack) ? 0.35 : 1.5);
                    // Para melee con LOS y casi en alcance, reduce aún más para entrar a pegar
                    if ((unit.role === 'Boss' || (unit.role||'').includes('Melee') || unit.role === 'Tank') && hasLOS && distance <= desiredReach * 1.1) {
                      repulsionForce *= 0.3;
                    }
                    // For bosses near circular rocks: tangent bias, but very low if already in melee
                    if (unit.role === 'Boss' && typeof (obs as any).size === 'number') {
                        if (meleeAnchor) {
                          repulsionForce *= 0.3;
                        } else {
                          const tangentX = -collisionNormal.y;
                          const tangentY = collisionNormal.x;
                          const toTargetX = target.position.x - unit.position.x;
                          const toTargetY = target.position.y - unit.position.y;
                          const sign = (tangentX * toTargetX + tangentY * toTargetY) >= 0 ? 1 : -1;
                          moveX += tangentX * sign * proximityFactor * unit.speed * 0.8;
                          moveY += tangentY * sign * proximityFactor * unit.speed * 0.8;
                          repulsionForce *= 0.6;
                        }
                    }
                    moveX += collisionNormal.x * repulsionForce;
                    moveY += collisionNormal.y * repulsionForce;
                }
            });
        }
        // --- END OBSTACLE AVOIDANCE ---

        // Yield para que el Boss pase primero
        let localSpeedFactor = 1;
        const allyBoss = nextUnitsState.find(u => u.team === unit.team && u.role === 'Boss' && !u.dyingAt);
        if (allyBoss) {
          if (unit.role !== 'Boss') {
            const front = unit.team === Team.Blue ? (unit.position.x > allyBoss.position.x + 6)
                                                  : (unit.position.x < allyBoss.position.x - 6);
            const near = Math.hypot(unit.position.x - allyBoss.position.x, unit.position.y - allyBoss.position.y) < 200;
            if (front && near) localSpeedFactor = 0.6; // cede paso al Boss
          } else {
            localSpeedFactor = Math.max(localSpeedFactor, 1.08); // pequeño bonus al Boss
          }
        }

        // Smoothing to reduce jitter
        const prevVX = (unit as any).lvx || 0;
        const prevVY = (unit as any).lvy || 0;
        const smooth = 0.25; // blend factor
        const targetVX = Math.cos(Math.atan2(moveY, moveX)) * unit.speed * speedMultiplier * localSpeedFactor;
        const targetVY = Math.sin(Math.atan2(moveY, moveX)) * unit.speed * speedMultiplier * localSpeedFactor;
        const vx = prevVX * (1 - smooth) + targetVX * smooth;
        const vy = prevVY * (1 - smooth) + targetVY * smooth;
        (unit as any).lvx = vx;
        (unit as any).lvy = vy;
        const finalMoveAngle = Math.atan2(vy, vx);
        unit.position.x += vx;
        unit.position.y += vy;
        unit.rotation = finalMoveAngle * (180 / Math.PI);
        if (!Number.isFinite(unit.position.x) || !Number.isFinite(unit.position.y)) {
          unit.position.x = clamp(target.position.x, 0, GAME_CONFIG.BATTLEFIELD_WIDTH);
          unit.position.y = clamp(target.position.y, 0, GAME_CONFIG.BATTLEFIELD_HEIGHT);
          (unit as any).lvx = 0; (unit as any).lvy = 0;
        }
        
        // --- COLLISION FAILSAFE & BOUNDS CHECK ---
        const unitSize = unit.role === 'Boss' ? 80 : 40;
        // Allow a small off-screen margin so units can rodear extremos de murallas pegadas al borde superior/inferior
        const borderAllowance = 18;
        unit.position.x = Math.max(unitSize / 2 - borderAllowance, Math.min(unit.position.x, GAME_CONFIG.BATTLEFIELD_WIDTH - unitSize / 2 + borderAllowance));
        unit.position.y = Math.max(unitSize / 2 - borderAllowance, Math.min(unit.position.y, GAME_CONFIG.BATTLEFIELD_HEIGHT - unitSize / 2 + borderAllowance));
        
        if (!unit.isFlying) {
             for (const obs of obstacles || []) {
                if (obs.type === 'wall' && typeof obs.size === 'object') {
                    const wallSize = obs.size;
                    const unitRadius = unitSize / 2;
                    const wallRect = {
                        left: obs.position.x - wallSize.width / 2, right: obs.position.x + wallSize.width / 2,
                        top: obs.position.y - wallSize.height / 2, bottom: obs.position.y + wallSize.height / 2,
                    };
                    
                    if (unit.position.x + unitRadius > wallRect.left && unit.position.x - unitRadius < wallRect.right &&
                        unit.position.y + unitRadius > wallRect.top && unit.position.y - unitRadius < wallRect.bottom) {
                        
                        const dxLeft = (unit.position.x + unitRadius) - wallRect.left;
                        const dxRight = wallRect.right - (unit.position.x - unitRadius);
                        const dyTop = (unit.position.y + unitRadius) - wallRect.top;
                        const dyBottom = wallRect.bottom - (unit.position.y - unitRadius);

                        const minOverlap = Math.min(dxLeft, dxRight, dyTop, dyBottom);
                        
                        if (minOverlap === dxLeft) unit.position.x = wallRect.left - unitRadius;
                        else if (minOverlap === dxRight) unit.position.x = wallRect.right + unitRadius;
                        else if (minOverlap === dyTop) unit.position.y = wallRect.top - unitRadius;
                        else unit.position.y = wallRect.bottom + unitRadius;
                    }
                }
            }
        }
    } else {
       // --- no mover: quedate y apuntá ---
       const dxAim = target.position.x - unit.position.x;
       const dyAim = target.position.y - unit.position.y;
       unit.rotation = Math.atan2(dyAim, dxAim) * (180 / Math.PI);
       const engageWindow = 400; // evita micro-deslizamientos
       (unit as any).engagedUntil = timestamp + engageWindow;
       (unit as any).lvx = 0; (unit as any).lvy = 0;
       (unit as any).pathState = undefined;
       unit.waypoint = null;
    }
  });

  const newProjectiles: Projectile[] = [];
  const newUnits: Unit[] = [];
  nextUnitsState.forEach(attacker => {
    if (attacker.dyingAt) return;
    if (attacker.id === 'enchantress') return;
    
    // Si la unidad está stunned, no puede atacar
    const stunEffect = attacker.effects.find(e => e.type === 'stun');
    if (stunEffect) return;

    const slowEffect = attacker.effects.find(e => e.type === 'slow');
    const cooldownMultiplier = slowEffect ? (1 + slowEffect.power) : 1; // Slow aumenta el cooldown
    if (timestamp - attacker.lastAttackTime < attacker.attackCooldown * cooldownMultiplier) return;

    const target = attacker.targetId ? nextUnitsState.find(u => u.uid === attacker.targetId && !u.dyingAt) : null;
    if (!target) return;

    const distance = calculateDistance(attacker.position, target.position);
    
    if (attacker.ability === 'HEAL' && target.team !== attacker.team) return;

    if (attacker.ability === 'SUMMON' && attacker.summonedUnitId) {
        // Alcance real para jefes (rango + radios)
        const summonReach = attacker.role === 'Boss'
          ? (attacker.attackRange + unitRadius(attacker) + unitRadius(target) - 6)
          : (attacker.attackRange);

        if (distance <= summonReach) {
          attacker.lastAttackTime = timestamp;
          playSound(attacker.launchSound || 'attack.wav');

          const unitToSummonType = getUnitType(attacker.summonedUnitId);
          if (unitToSummonType) {
              const angle = Math.random() * 2 * Math.PI;
              const spawnDist = 40;
              newUnits.push({
                ...unitToSummonType,
                uid: `summon_${attacker.uid}_${Date.now()}_${Math.random()}`,
                team: attacker.team,
                position: {
                  x: attacker.position.x + Math.cos(angle) * spawnDist,
                  y: attacker.position.y + Math.sin(angle) * spawnDist,
                },
                rotation: attacker.rotation,
                currentHp: unitToSummonType.hp,
                targetId: null,
                lastAttackTime: 0,
                attackCooldown: unitToSummonType.attackCooldown || (1000 + Math.random() * 500),
                effects: [],
                waypoint: null,
              });
          }

          // Los no‑jefes sólo invocan; el boss puede seguir atacando en ticks siguientes
          if (attacker.role !== 'Boss') return;
        }
    }

    const isMeleeAttacker =
      attacker.role === 'Tank' || (attacker.role || '').includes('Melee') ||
      attacker.role === 'Swarm' || attacker.role === 'Boss';
    const rA = unitRadius(attacker);
    const rT = unitRadius(target);
    // LOS ataque (proyectil), sin inflar
    const hasShotLOS_attacker = attacker.isFlying || losFree(attacker.position, target.position, -6, obstacles);
    const inRange = isMeleeAttacker
      ? (distance <= attacker.attackRange + rA + rT - 6)
      : (distance <= attacker.attackRange) && hasShotLOS_attacker;

    if (inRange) {
      // If target is stunned, skip its offensive actions (it can still be damaged)
      const isTargetStunned = target.effects.some(e => e.type === 'stun');
      if (isTargetStunned && attacker.team !== target.team) {
        // attacker proceeds, but target's own tick will suppress its actions
      }
      let didAction = false;

      // Evitar ataques melee a través de muros (salvo si están tocándose)
      const clearanceAtk = attacker.isFlying ? 0 : (attacker.role === 'Boss' ? 40 : 20);
      const hasLOSAtk = attacker.isFlying || losFree(attacker.position, target.position, clearanceAtk, obstacles);
      const clearanceAtkTarget = target.isFlying ? 0 : (target.role === 'Boss' ? 40 : 20);
      const targetSeesAttacker = target.isFlying || losFree(target.position, attacker.position, clearanceAtkTarget, obstacles);
      const touching = distance <= (rA + rT + 1);
      if (isMeleeAttacker && !hasLOSAtk && !touching) return;
      // Sandworm no puede atacar si el objetivo no tiene LOS hacia él (debe salir del "shadow")}.
      if (attacker.id === 'sandworm' && !targetSeesAttacker) return;

      if (attacker.id === 'musqueteer') {
          const attackerRadius = 30;
          const angleToTarget = Math.atan2(target.position.y - attacker.position.y, target.position.x - attacker.position.x);
          const flashPosition = {
              x: attacker.position.x + Math.cos(angleToTarget) * attackerRadius,
              y: attacker.position.y + Math.sin(angleToTarget) * attackerRadius,
          };
          newVisualEffects.push({
              id: `vfx_flash_${attacker.uid}_${Date.now()}`,
              type: 'muzzle_flash',
              position: flashPosition,
              radius: 40,
              duration: 100,
              startTime: timestamp,
              color: 'rgba(255, 220, 100, 0.9)',
          });
          // Custom SFX for musqueteer shot
          playSound('shoot.wav', 0.6);
      }
      
      const rageEffect = attacker.effects.find(e => e.type === 'rage');
      const empowerEffect = attacker.effects.find(e => e.type === 'empower');
      const damageMultiplier = (rageEffect?.power || 1) * (empowerEffect?.power || 1);
      const finalDamage = attacker.damage * damageMultiplier;

      let projectileType: Projectile['type'] | null = null;
      if (attacker.id === 'mage' || attacker.id === 'dragon_boss') {
        projectileType = 'fireball';
      } else if (attacker.id === 'bombardino_crocodilo') {
        projectileType = 'bomb';
      } else if (attacker.id === 'frost_mage') {
        projectileType = 'frost_bolt';
      } else if (attacker.id === 'crossbowman') {
        projectileType = 'crossbow_bolt';
      } else if (attacker.id === 'musqueteer') {
        projectileType = 'bullet';
      } else if (attacker.id === 'ranged') {
        projectileType = 'arrow';
      } else if (attacker.ability === 'HEAL' && target.currentHp < target.hp) {
        projectileType = 'heal_orb';
      }
      
      if (projectileType && attacker.position && target.position) {
        // Evento: lanzar proyectil
        if (projectileType === 'arrow' || projectileType === 'crossbow_bolt') {
          playSound('arrow.wav', 0.5);
        } else if (attacker.id !== 'musqueteer') {
        playEvent('throw_projectile');
        }
        const attackerRadius = attacker.id === 'dragon_boss' ? 40 : 20;
        const angleToTarget = Math.atan2(target.position.y - attacker.position.y, target.position.x - attacker.position.x);
        
        const startPosition = {
            x: attacker.position.x + Math.cos(angleToTarget) * attackerRadius,
            y: attacker.position.y + Math.sin(angleToTarget) * attackerRadius,
        };

        const newProjectile: Projectile = {
          id: `proj_${Date.now()}_${Math.random()}`,
          type: projectileType,
          team: attacker.team,
          position: startPosition,
          targetId: target.uid,
          speed: 8,
          damage: finalDamage,
          rotation: attacker.rotation,
          impactSound: attacker.impactSound || 'ES_Hit, Boat - Epidemic Sound - 0000-1561.wav',
          ability: attacker.ability,
          abilityRadius: attacker.abilityRadius
        };
        if(attacker.id === 'dragon_boss') newProjectile.speed = 6;
        if(attacker.id === 'bombardino_crocodilo') newProjectile.speed = 4;
        if(newProjectile.type === 'bullet') newProjectile.speed = 12;
        if(attacker.ability === 'HEAL') newProjectile.speed = 6;
        newProjectiles.push(newProjectile);
        attacker.lastAttackTime = timestamp;
        (attacker as any).engagedUntil = timestamp + 300;
        didAction = true;
      } else if (attacker.role.includes('Melee') || attacker.role === 'Tank' || attacker.role === 'Swarm' || attacker.role === 'Boss') { // Melee attack
        const isSwordUser = ['melee','lancer','paladin','prism_guard','valkyrie','knight'].includes(attacker.id) || (attacker.launchSound && attacker.launchSound.includes('sword'));
        const meleeSwing = isSwordUser ? 'ES_Sword Attack Heavy, Stab, Weapon - Epidemic Sound - 3039-4101.wav' : 'ES_Hands, Fist Bumps, Fist to Palm Slaps 01 - Epidemic Sound - 6998-7193.wav';
        playSound(attacker.launchSound || meleeSwing);
        // Evento de animación (para Boss usa 'sword' para garantizar animación perceptible)
        playEvent(attacker.role === 'Boss' ? 'sword' : (isSwordUser ? 'sword' : 'fist'));
        // Arrancar motion de ataque con perfiles separados
        const dir = Math.atan2(target.position.y - attacker.position.y, target.position.x - attacker.position.x);
        const prof = attacker.role === 'Boss' ? ATTACK_MOTION.boss : ATTACK_MOTION.troop;
        (attacker as any)._attackMotion = { phase:'windup', until: timestamp + prof.windup, dir, lunge: prof.lunge } as any;
        attacker.lastAttackTime = timestamp;
        (attacker as any).engagedUntil = timestamp + 300;
        didAction = true;
        if (adminFlags.instaKill && target.team === Team.Red) {
            target.currentHp = 0;
        } else if (adminFlags.godMode && target.team === Team.Blue) {
            // No damage
        } else {
            const shieldEffect = target.effects.find(e => e.type === 'shield');
            const mitigated = shieldEffect ? finalDamage * (1 - shieldEffect.power) : finalDamage;
            target.currentHp -= mitigated;
        }
        // Small hit flash VFX on melee impact at contact point along the attack direction
        const contactAngle = Math.atan2(target.position.y - attacker.position.y, target.position.x - attacker.position.x);
        const contactOffset = attacker.id === 'dragon_boss' ? 30 : 16;
        const contactPos = {
          x: (attacker.position.x + target.position.x) / 2 + Math.cos(contactAngle) * contactOffset,
          y: (attacker.position.y + target.position.y) / 2 + Math.sin(contactAngle) * contactOffset,
        };
        newVisualEffects.push({
            id: `vfx_hit_${attacker.uid}_${target.uid}_${timestamp}_${Math.random()}`,
            type: 'hit_flash',
            position: contactPos,
            radius: 20,
            duration: 140,
            startTime: timestamp,
            color: 'rgba(255,255,255,0.9)'
        });
        // Target is engaged as well (prevents it from being pushed away mid‑trade)
        (target as any).engagedUntil = timestamp + 300;
        if (target.currentHp <= 0 && !target.dyingAt) {
            target.dyingAt = timestamp;
            handleDeath(target);
        }
        // Special melee abilities
        if (attacker.ability === 'SLOW' && attacker.abilityRadius) {
            nextUnitsState.forEach(u => {
                if(u.team !== attacker.team && !u.dyingAt && calculateDistance(u.position, attacker.position) <= attacker.abilityRadius!) {
                    u.effects.push({type: 'slow', duration: 2000, power: 0.5, sourceId: attacker.uid });
                }
            });
        }
      }
      if(navigator.vibrate) navigator.vibrate(10);
      // For supports that had nothing to do this tick, don't consume cooldown
      if (!didAction && attacker.ability === 'HEAL') {
        attacker.lastAttackTime = Math.min(attacker.lastAttackTime, timestamp - attacker.attackCooldown);
      }
    }
  });
  nextProjectilesState.push(...newProjectiles);
  nextUnitsState.push(...newUnits);

  const stillFlyingProjectiles: Projectile[] = [];
  nextProjectilesState.forEach(p => {
    const targetUnit = nextUnitsState.find(u => u.uid === p.targetId && !u.dyingAt);
    if (!targetUnit || !targetUnit.position) return; 

    const targetPosition = targetUnit.position;
    const distanceToTarget = calculateDistance(p.position, targetPosition);
    
    const targetHitboxRadius = (targetUnit.id === 'dragon_boss' ? 80 : 40) / 2;
    
    if (distanceToTarget < targetHitboxRadius) { 
      // Evento: impacto de proyectil
      playEvent('impact_projectile');
      playSound(p.impactSound || 'ES_Hit, Boat - Epidemic Sound - 0000-1561.wav');

      if (p.type === 'heal_orb') {
          if (targetUnit) {
            targetUnit.currentHp = Math.min(targetUnit.hp, targetUnit.currentHp + p.damage);
          }
      } else if (p.ability === 'AOE_DAMAGE' || p.ability === 'SLOW') {
         newVisualEffects.push({
             id: `vfx_${Date.now()}_${Math.random()}`,
             type: 'explosion',
             position: targetPosition,
             radius: p.abilityRadius!,
             duration: 500,
             startTime: timestamp,
             color: p.ability === 'SLOW' ? 'rgba(96, 165, 250, 0.7)' : 'rgba(251, 146, 60, 0.7)'
         });
         nextUnitsState.forEach(u => {
             if(u.team !== p.team && !u.dyingAt && calculateDistance(u.position, targetPosition) <= p.abilityRadius!) {
                 if(p.ability === 'SLOW') {
                     const existingSlow = u.effects.find(e => e.type === 'slow' && e.sourceId === p.id);
                     if(!existingSlow){
                         u.effects.push({type: 'slow', duration: 2000, power: 0.5, sourceId: p.id });
                     }
                 }
                if (adminFlags.instaKill && u.team === Team.Red) {
                    u.currentHp = 0;
                } else if (adminFlags.godMode && u.team === Team.Blue) {
                    // No damage
                } else {
                    const shieldEffect = u.effects.find(e => e.type === 'shield');
                    const mitigated = shieldEffect ? p.damage * (1 - shieldEffect.power) : p.damage;
                    u.currentHp -= mitigated;
                }
                if (u.currentHp <= 0 && !u.dyingAt) {
                    u.dyingAt = timestamp;
                    handleDeath(u);
                }
             }
         });
      } else {
        if (adminFlags.instaKill && targetUnit.team === Team.Red) {
            targetUnit.currentHp = 0;
        } else if (adminFlags.godMode && targetUnit.team === Team.Blue) {
            // No damage
        } else {
            const shieldEffect = targetUnit.effects.find(e => e.type === 'shield');
            const mitigated = shieldEffect ? p.damage * (1 - shieldEffect.power) : p.damage;
            targetUnit.currentHp -= mitigated;
        }
        if (targetUnit.currentHp <= 0 && !targetUnit.dyingAt) {
            targetUnit.dyingAt = timestamp;
            handleDeath(targetUnit);
        }
      }
    } else {
      const angle = Math.atan2(targetPosition.y - p.position.y, targetPosition.x - p.position.x);
      const newPosition = {
        x: p.position.x + Math.cos(angle) * p.speed,
        y: p.position.y + Math.sin(angle) * p.speed,
      };

      stillFlyingProjectiles.push({
        ...p,
        position: newPosition,
        rotation: angle * (180 / Math.PI),
      });
    }
  });
  nextProjectilesState = stillFlyingProjectiles;

  return { 
      nextUnitsState, 
      nextProjectilesState,
      newVisualEffects
  };
};
