

import type { FC } from 'react';

export enum Team {
  Blue,
  Red,
}

export enum GameState {
  Deployment,
  Simulation,
  GameOver,
  Paused,
}

export type UnitAbility = 'AOE_DAMAGE' | 'HEAL' | 'SLOW' | 'RAGE' | 'SELF_HEAL' | 'SUMMON' | 'DAMAGE_AURA' | 'REFLECT' | 'FIRST_STRIKE' | 'DEATH_BOMB' | 'BITE';

export type UnitRole = 'Tank' | 'MeleeDPS' | 'RangedDPS' | 'Support' | 'Swarm' | 'Boss';

export type UnitEffect = {
    type: 'slow' | 'rage' | 'burn' | 'empower' | 'shield' | 'stun';
    duration: number; // in milliseconds
    power: number; // e.g., 0.5 for 50% slow, 1.5 for 50% damage boost
    sourceId: string; // To prevent stacking from the same source
    tickInterval?: number;
    lastTick?: number;
};


export interface UnitType {
  id: string;
  name: string;
  cost: number;
  hp: number;
  damage: number;
  attackRange: number;
  speed: number;
  icon: FC<{ className?: string }>;
  role: UnitRole;
  attackCooldown?: number;
  ability?: UnitAbility;
  abilityRadius?: number; // For AOE or heal range
  purchaseCost?: number; // For the store
  unlockWorld?: number; // World that needs to be completed to unlock
  description?: string; // For the store tooltip
  launchSound?: string;
  impactSound?: string;
  isFlying?: boolean;
  summonedUnitId?: string; // For SUMMON ability
}

export interface Unit extends UnitType {
  uid: string;
  team: Team;
  position: { x: number; y: number };
  rotation: number;
  currentHp: number;
  targetId: string | null;
  lastAttackTime: number;
  attackCooldown: number;
  effects: UnitEffect[];
  waypoint: { x: number; y: number } | null;
  dyingAt?: number;
  // Pathfinding bookkeeping
  waypointSetAt?: number;
  lastProgressDist?: number;
  // Ability timers independent of attacks (e.g., paladin self-heal)
  lastAbilityTime?: number;
  // Temporary flags for movement/engagement smoothing
  noCollisionUntil?: number;
  engagedUntil?: number;
}

export interface Projectile {
  id:string;
  type: 'arrow' | 'fireball' | 'heal_orb' | 'frost_bolt' | 'crossbow_bolt' | 'bomb' | 'bullet';
  team: Team;
  position: { x: number; y: number };
  targetId: string;
  speed: number;
  damage: number;
  rotation: number;
  impactSound: string;
  ability?: UnitAbility;
  abilityRadius?: number;
}

export interface VisualEffect {
    id: string;
    type: 'explosion' | 'muzzle_flash' | 'lightning' | 'hit_flash';
    position: { x: number; y: number };
    radius: number;
    duration: number; // in milliseconds
    startTime: number;
    color: string;
}

export interface ThemeArea {
    shape: { type: 'rect'; x: number; y: number; width: number; height: number };
    colors: string[];
}

export interface LevelTheme {
    accents: string;
    baseColors?: string[];
    areas?: ThemeArea[];
}

export type Obstacle = {
    type: 'rock' | 'tree' | 'rock_cluster' | 'wall' | 'lake';
    position: { x: number; y: number };
    size: number | { width: number; height: number }; // Allow size to be an object for non-square obstacles
    variant?: number; // Seed for procedural generation
};

export interface Level {
    id: number;
    world: number;
    name: string;
    budget: number;
    reward: number;
    enemyUnits: (Omit<Unit, 'uid' | 'team' | 'currentHp' | 'targetId' | 'lastAttackTime' | 'attackCooldown' | 'rotation' | 'effects' | 'waypoint' | 'dyingAt'> & { attackCooldown?: number })[];
    obstacles?: Obstacle[];
    theme?: LevelTheme;
    musicTrack?: string;
}

export interface AdminFlags {
    godMode: boolean;
    instaKill: boolean;
}

export interface GameSettings {
    musicVolume: number;
    sfxVolume: number;
}

// --- Battle Spells ---
export type SpellId = 'lightning' | 'heal' | 'rage' | 'shield';

export interface SpellType {
    id: SpellId;
    name: string;
    description: string;
    purchaseCost: number; // permanent gold cost in store
    battleCost: number; // energy cost during battle
    radius: number; // target radius on battlefield (px)
    unlockWorld?: number; // world requirement to unlock
    targeting?: 'manual' | 'auto_enemies';
}