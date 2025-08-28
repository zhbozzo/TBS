

import type { Level } from './types';
import { ALL_UNIT_TYPES } from './constants';

const getUnit = (id: string) => ALL_UNIT_TYPES.find(u => u.id === id)!;

// WORLD THEMES with textured backgrounds
const world1Theme = { accents: 'border-green-400', baseColors: ['#2d3748', '#4a5568'] };
const world2Theme = { accents: 'border-yellow-600', baseColors: ['#4b3b2b', '#5b4631'] };
const world3Theme = { accents: 'border-indigo-400', baseColors: ['#2d2f67', '#4f51a1'] };
const world4Theme = { accents: 'border-red-500', baseColors: ['#5b1f1f', '#7a2e2e'] };
const world5Theme = { accents: 'border-cyan-300', baseColors: ['#1f3a5b', '#2e4e7a'] };

/* 
* Level Design Notes:
* - Levels re-balanced for smoother progression and strategic variety.
* - Budgets are rounded to the nearest 10.
* - Bosses are tuned to be challenging but fair.
*/

export const LEVELS: Level[] = [
    // WORLD 1: VERDANT PLAINS - Introduction to core mechanics
    {
        id: 1, world: 1, name: "First Skirmish", budget: 300, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'tree', position: { x: 667, y: 150 }, size: 70 }, { type: 'tree', position: { x: 582, y: 480 }, size: 80 } ],
        enemyUnits: [ { ...getUnit('melee'), position: { x: 849, y: 300 } }, { ...getUnit('melee'), position: { x: 849, y: 400 } } ]
    },
    {
        id: 2, world: 1, name: "Archer's Perch", budget: 450, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'rock', position: { x: 728, y: 375 }, size: 90 } ],
        enemyUnits: [ { ...getUnit('tank'), position: { x: 849, y: 300 } }, { ...getUnit('ranged'), position: { x: 970, y: 250 } }, { ...getUnit('ranged'), position: { x: 970, y: 350 } } ]
    },
    {
        id: 3, world: 1, name: "The Wall", budget: 550, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'wall', position: {x: 667, y: 375}, size: {width: 80, height: 500} } ],
        enemyUnits: [ { ...getUnit('tank'), position: { x: 788, y: 180 } }, { ...getUnit('tank'), position: { x: 788, y: 520 } }, { ...getUnit('crossbowman'), position: { x: 910, y: 350 } } ]
    },
    {
        id: 4, world: 1, name: "Swarm Tactics", budget: 400, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'rock_cluster', position: { x: 667, y: 375 }, size: 120 } ],
        enemyUnits: [ { ...getUnit('farmer'), position: { x: 788, y: 250 } }, { ...getUnit('farmer'), position: { x: 788, y: 300 } }, { ...getUnit('farmer'), position: { x: 788, y: 350 } }, { ...getUnit('farmer'), position: { x: 788, y: 400 } }, { ...getUnit('farmer'), position: { x: 788, y: 450 } }, { ...getUnit('farmer'), position: { x: 788, y: 500 } }, { ...getUnit('tank'), position: { x: 910, y: 375 } } ]
    },
    {
        id: 5, world: 1, name: "Healing Touch", budget: 580, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'lake', position: { x: 606, y: 225 }, size: 200 }, { type: 'lake', position: { x: 606, y: 525 }, size: 200 } ],
        enemyUnits: [ { ...getUnit('tank'), position: { x: 788, y: 375 } }, { ...getUnit('melee'), position: { x: 849, y: 300 } }, { ...getUnit('melee'), position: { x: 849, y: 450 } }, { ...getUnit('cleric'), position: { x: 970, y: 375 } } ]
    },
    {
        id: 6, world: 1, name: "Assassin's Alley", budget: 580, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'wall', position: {x: 606, y: 180}, size: {width: 49, height: 300} }, { type: 'wall', position: {x: 606, y: 570}, size: {width:49, height:300} } ],
        enemyUnits: [ { ...getUnit('assassin'), position: { x: 849, y: 150 } }, { ...getUnit('assassin'), position: { x: 849, y: 600 } }, { ...getUnit('tank'), position: { x: 788, y: 375 } }, { ...getUnit('cleric'), position: { x: 970, y: 375 } }, { ...getUnit('crossbowman'), position: { x: 910, y: 300 } } ]
    },
    {
        id: 7, world: 1, name: "Lancer Charge", budget: 600, reward: 200, theme: world1Theme,
        enemyUnits: [ { ...getUnit('lancer'), position: { x: 788, y: 175 } }, { ...getUnit('lancer'), position: { x: 788, y: 275 } }, { ...getUnit('lancer'), position: { x: 788, y: 375 } }, { ...getUnit('lancer'), position: { x: 788, y: 475 } }, { ...getUnit('lancer'), position: { x: 788, y: 575 } } ]
    },
    {
        id: 8, world: 1, name: "Mage's Folly", budget: 850, reward: 200, theme: world1Theme,
        obstacles: [ { type: 'wall', position: {x: 606, y: 220}, size: {width: 80, height: 460} }, { type: 'wall', position: {x: 788, y: 515}, size: {width:80, height:460} } ],
        enemyUnits: [ { ...getUnit('tank'), position: { x: 849, y: 275 } }, { ...getUnit('tank'), position: { x: 849, y: 475 } }, { ...getUnit('mage'), position: { x: 970, y: 275 } }, { ...getUnit('mage'), position: { x: 970, y: 475 } }, { ...getUnit('cleric'), position: { x: 1031, y: 375 } }, { ...getUnit('crossbowman'), position: { x: 910, y: 375 } } ]
    },
    {
        id: 9, world: 1, name: "Holy Ground", budget: 900, reward: 200, theme: world1Theme,
        musicTrack: 'world1_epic.mp3',
        enemyUnits: [ { ...getUnit('paladin'), position: { x: 788, y: 275 } }, { ...getUnit('paladin'), position: { x: 788, y: 475 } }, { ...getUnit('cleric'), position: { x: 910, y: 275 } }, { ...getUnit('cleric'), position: { x: 910, y: 475 } }, { ...getUnit('tank'), position: { x: 849, y: 375 } }, { ...getUnit('crossbowman'), position: { x: 970, y: 375 } }, { ...getUnit('crossbowman'), position: { x: 910, y: 450 } } ]
    },
    {
        id: 10, world: 1, name: "Forest Heart", budget: 1400, reward: 600, theme: world1Theme,
        musicTrack: 'boss_grove_guardian.mp3',
        obstacles: [
            { type: 'tree', position: { x: 520, y: 200 }, size: 100 },
            { type: 'tree', position: { x: 546, y: 550 }, size: 100 },
            { type: 'rock_cluster', position: { x: 728, y: 375 }, size: 150 }
        ],
        enemyUnits: [
            // Swap: boss <-> bottom guardian (tank at y=435)
            { ...getUnit('tank'), position: { x: 910, y: 375 } },
            { ...getUnit('cleric'), position: { x: 970, y: 275 } },
            { ...getUnit('cleric'), position: { x: 970, y: 475 } },
            { ...getUnit('crossbowman'), position: { x: 1000, y: 300 } },
            { ...getUnit('crossbowman'), position: { x: 1000, y: 450 } },
            { ...getUnit('tank'), position: { x: 860, y: 315 } },
            { ...getUnit('boss_grove_guardian'), position: { x: 860, y: 435 } },
            { ...getUnit('mage'), position: { x: 970, y: 375 } }
        ]
    },

    // WORLD 2: ARID WASTES - Introduce bypassing units and summoners
    {
        id: 11, world: 2, name: "Canyon Ambush", budget: 760, reward: 270, theme: world2Theme,
        obstacles: [ { type: 'wall', position: { x: 606, y: 170 }, size: {width: 80, height: 300} }, { type: 'wall', position: { x: 606, y: 580 }, size: {width: 80, height: 300} }, { type: 'rock', position: {x: 470, y: 375}, size: 90 } ],
        enemyUnits: [ { ...getUnit('sandworm'), position: { x: 849, y: 200 } }, { ...getUnit('sandworm'), position: { x: 849, y: 550 } }, { ...getUnit('crossbowman'), position: { x: 910, y: 375 } }, { ...getUnit('tank'), position: { x: 788, y: 375 } }, { ...getUnit('cleric'), position: { x: 970, y: 375 } } ]
    },
    {
        id: 12, world: 2, name: "The Boneyard", budget: 900, reward: 280, theme: world2Theme,
        obstacles: [ { type: 'rock', position: { x: 546, y: 250 }, size: 100 }, { type: 'rock', position: { x: 667, y: 500 }, size: 110 }, { type: 'tree', position: {x: 450, y: 375}, size: 80 } ],
        enemyUnits: [ { ...getUnit('necromancer'), position: { x: 970, y: 375 } }, { ...getUnit('golem'), position: { x: 849, y: 300 } }, { ...getUnit('golem'), position: { x: 849, y: 450 } }, { ...getUnit('skeleton'), position: {x: 910, y: 375} }, { ...getUnit('crossbowman'), position: { x: 910, y: 300 } } ]
    },
    {
        id: 13, world: 2, name: "Desert Maze", budget: 900, reward: 280, theme: world2Theme, 
        obstacles: [ {type: 'rock', position: {x: 485, y: 375}, size: 220}, {type: 'rock', position: {x: 728, y: 200}, size: 170}, {type: 'rock', position: {x: 728, y: 550}, size: 170} ],
        enemyUnits: [ { ...getUnit('berserker'), position: {x: 910, y: 200}}, { ...getUnit('berserker'), position: {x: 910, y: 550}}, { ...getUnit('sandworm'), position: {x: 849, y: 375}}, { ...getUnit('frost_mage'), position: {x: 970, y: 375}}, { ...getUnit('crossbowman'), position: { x: 970, y: 300 } } ]
    },
    {
        id: 14, world: 2, name: "Mirage", budget: 1080, reward: 300, theme: world2Theme,
        obstacles: [ { type: 'rock_cluster', position: { x: 667, y: 375 }, size: 180 }, { type: 'tree', position: {x: 500, y: 250}, size: 70 } ],
        enemyUnits: [ { ...getUnit('assassin'), position: {x: 910, y: 150}}, { ...getUnit('assassin'), position: {x: 910, y: 600}}, { ...getUnit('sandworm'), position: {x: 788, y: 375}}, { ...getUnit('enchantress'), position: {x: 970, y: 375}}, { ...getUnit('frost_mage'), position: {x: 970, y: 150}}, { ...getUnit('frost_mage'), position: {x: 970, y: 600}}, { ...getUnit('crossbowman'), position: { x: 910, y: 375 } } ]
    },
    {
        id: 15, world: 2, name: "Undead Horde", budget: 1280, reward: 300, theme: world2Theme,
        obstacles: [ {type: 'rock', position: {x: 600, y: 375}, size: 120} ],
        enemyUnits: [ { ...getUnit('necromancer'), position: {x: 970, y: 200}}, { ...getUnit('necromancer'), position: {x: 970, y: 550}}, { ...getUnit('golem'), position: {x: 849, y: 375}}, { ...getUnit('paladin'), position: {x: 788, y: 375}}, { ...getUnit('skeleton'), position: {x: 910, y: 300}}, { ...getUnit('crossbowman'), position: { x: 970, y: 375 } } ]
    },
    {
        id: 16, world: 2, name: "The Great Pit", budget: 1160, reward: 300, theme: world2Theme,
        obstacles: [ {type: 'lake', position: {x: 637, y: 375}, size: 300}, { type: 'rock', position: {x: 500, y: 200}, size: 80 } ],
        enemyUnits: [ { ...getUnit('sandworm'), position: {x: 849, y: 150}}, { ...getUnit('sandworm'), position: {x: 849, y: 600}}, { ...getUnit('frost_mage'), position: {x: 970, y: 300}}, { ...getUnit('frost_mage'), position: {x: 970, y: 450}}, { ...getUnit('necromancer'), position: {x: 970, y: 150}}, { ...getUnit('crossbowman'), position: { x: 910, y: 375 } } ]
    },
    {
        id: 17, world: 2, name: "Berserker's Rage", budget: 1320, reward: 320, theme: world2Theme,
        obstacles: [ {type: 'rock_cluster', position: {x: 650, y: 375}, size: 180} ],
        enemyUnits: [ { ...getUnit('berserker'), position: {x: 728, y: 200}}, { ...getUnit('berserker'), position: {x: 728, y: 550}}, { ...getUnit('berserker'), position: {x: 728, y: 375}}, { ...getUnit('enchantress'), position: {x: 910, y: 200}}, { ...getUnit('enchantress'), position: {x: 910, y: 550}}, { ...getUnit('cleric'), position: {x: 849, y: 375}}, { ...getUnit('crossbowman'), position: { x: 970, y: 375 } } ]
    },
    {
        id: 18, world: 2, name: "The Long March", budget: 1480, reward: 320, theme: world2Theme,
        obstacles: [ {type: 'tree', position: {x: 600, y: 220}, size: 90}, {type: 'tree', position: {x: 600, y: 530}, size: 90} ],
        enemyUnits: [ { ...getUnit('golem'), position: {x: 788, y: 200}}, { ...getUnit('golem'), position: {x: 788, y: 550}}, { ...getUnit('cleric'), position: {x: 910, y: 200}}, { ...getUnit('cleric'), position: {x: 910, y: 550}}, { ...getUnit('mage'), position: {x: 970, y: 300}}, { ...getUnit('mage'), position: {x: 970, y: 450}}, { ...getUnit('crossbowman'), position: { x: 970, y: 375 } } ]
    },
    {
        id: 19, world: 2, name: "Pincer Attack", budget: 1400, reward: 330, theme: world2Theme,
        obstacles: [ { type: 'rock', position: { x: 728, y: 200 }, size: 120 }, { type: 'rock', position: { x: 728, y: 550 }, size: 120 } ],
        enemyUnits: [ { ...getUnit('lancer'), position: {x: 788, y: 100}}, { ...getUnit('lancer'), position: {x: 788, y: 650}}, { ...getUnit('sandworm'), position: {x: 849, y: 375}}, { ...getUnit('necromancer'), position: {x: 970, y: 100}}, { ...getUnit('necromancer'), position: {x: 970, y: 650}}, { ...getUnit('crossbowman'), position: { x: 910, y: 375 } } ]
    },
    {
        id: 20, world: 2, name: "Dune Horror's Lair", budget: 2600, reward: 800, theme: world2Theme,
        musicTrack: 'boss_dune_horror.mp3',
        obstacles: [ { type: 'rock_cluster', position: { x: 606, y: 375 }, size: 220 }, { type: 'rock', position: { x: 788, y: 150 }, size: 110 }, { type: 'rock', position: { x: 788, y: 600 }, size: 110 } ],
        enemyUnits: [ { ...getUnit('boss_dune_horror'), position: {x: 849, y: 375}}, { ...getUnit('sandworm'), position: {x: 788, y: 200}}, { ...getUnit('sandworm'), position: {x: 788, y: 550}}, { ...getUnit('crossbowman'), position: { x: 970, y: 375 } } ]
    },
    
    // WORLD 3: CRYSTAL SPIRES - Introduce reflection and auras
    {
        id: 21, world: 3, name: "Reflection", budget: 1200, reward: 360, theme: world3Theme,
        obstacles: [ { type: 'wall', position: { x: 667, y: 375 }, size: {width: 80, height: 500} }, { type: 'rock', position: {x: 500, y: 350}, size: 110 } ],
        enemyUnits: [ { ...getUnit('prism_guard'), position: {x: 788, y: 200}}, { ...getUnit('prism_guard'), position: {x: 788, y: 550}}, { ...getUnit('ranged'), position: {x: 910, y: 200}}, { ...getUnit('ranged'), position: {x: 910, y: 375}}, { ...getUnit('ranged'), position: {x: 910, y: 550}}, { ...getUnit('crossbowman'), position: { x: 970, y: 375 } } ]
    },
    {
        id: 22, world: 3, name: "Aura of Power", budget: 1080, reward: 360, theme: world3Theme,
        obstacles: [ { type: 'tree', position: {x: 600, y: 260}, size: 90 }, { type: 'tree', position: {x: 600, y: 500}, size: 90 } ],
        enemyUnits: [ { ...getUnit('enchantress'), position: {x: 970, y: 375}}, { ...getUnit('lancer'), position: {x: 849, y: 275}}, { ...getUnit('lancer'), position: {x: 849, y: 475}}, { ...getUnit('tank'), position: {x: 788, y: 375}}, { ...getUnit('tank'), position: {x: 788, y: 225}}, { ...getUnit('tank'), position: {x: 788, y: 525}}, { ...getUnit('cleric'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: { x: 910, y: 300 } } ]
    },
    {
        id: 23, world: 3, name: "Crystalline Army", budget: 1480, reward: 360, theme: world3Theme,
        obstacles: [ { type: 'rock_cluster', position: {x: 650, y: 375}, size: 200 } ],
        enemyUnits: [ { ...getUnit('prism_guard'), position: {x: 788, y: 300}}, { ...getUnit('prism_guard'), position: {x: 788, y: 450}}, { ...getUnit('lancer'), position: {x: 728, y: 250}}, { ...getUnit('lancer'), position: {x: 728, y: 500}}, { ...getUnit('enchantress'), position: {x: 970, y: 375}}, { ...getUnit('cleric'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: {x: 910, y: 300}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}} ]
    },
    {
        id: 24, world: 3, name: "The Gauntlet", budget: 1500, reward: 340, theme: world3Theme,
        obstacles: [ { type: 'wall', position: {x: 667, y: 150}, size: {width: 80, height: 250} }, { type: 'wall', position: {x: 667, y: 600}, size: {width: 80, height: 250} } ],
        enemyUnits: [ { ...getUnit('golem'), position: {x: 788, y: 375}}, { ...getUnit('frost_mage'), position: {x: 910, y: 150}}, { ...getUnit('frost_mage'), position: {x: 910, y: 600}}, { ...getUnit('crossbowman'), position: {x: 910, y: 300}}, { ...getUnit('crossbowman'), position: {x: 910, y: 450}}, { ...getUnit('necromancer'), position: {x: 970, y: 375}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}} ]
    },
    {
        id: 25, world: 3, name: "Prismatic Defense", budget: 1760, reward: 360, theme: world3Theme,
        obstacles: [ { type: 'rock', position: {x: 600, y: 200}, size: 110 }, { type: 'rock', position: {x: 600, y: 560}, size: 110 } ],
        enemyUnits: [ { ...getUnit('prism_guard'), position: {x: 788, y: 200}}, { ...getUnit('prism_guard'), position: {x: 788, y: 375}}, { ...getUnit('prism_guard'), position: {x: 788, y: 550}}, { ...getUnit('paladin'), position: {x: 849, y: 200}}, { ...getUnit('paladin'), position: {x: 849, y: 550}}, { ...getUnit('enchantress'), position: {x: 970, y: 375}}, { ...getUnit('crossbowman'), position: { x: 910, y: 375 } } ]
    },
    {
        id: 26, world: 3, name: "Sorcerer's Sanctum", budget: 1440, reward: 320, theme: world3Theme,
        obstacles: [ {type: 'rock_cluster', position: {x: 788, y: 375}, size: 220} ],
        enemyUnits: [ { ...getUnit('mage'), position: {x: 910, y: 200}}, { ...getUnit('mage'), position: {x: 910, y: 550}}, { ...getUnit('frost_mage'), position: {x: 910, y: 300}}, { ...getUnit('frost_mage'), position: {x: 910, y: 450}}, { ...getUnit('enchantress'), position: {x: 970, y: 200}}, { ...getUnit('enchantress'), position: {x: 970, y: 550}}, { ...getUnit('prism_guard'), position: {x: 849, y: 375}}, { ...getUnit('crossbowman'), position: {x: 910, y: 375}} ]
    },
    {
        id: 27, world: 3, name: "Shattered Path", budget: 1360, reward: 330, theme: world3Theme,
        obstacles: [ {type: 'rock', position: {x: 485, y: 200}, size: 130}, {type: 'rock_cluster', position: {x: 667, y: 375}, size: 200}, {type: 'tree', position: {x: 520, y: 560}, size: 100} ],
        enemyUnits: [ { ...getUnit('prism_guard'), position: {x: 849, y: 375}}, { ...getUnit('assassin'), position: {x: 788, y: 200}}, { ...getUnit('assassin'), position: {x: 788, y: 550}}, { ...getUnit('mage'), position: {x: 970, y: 250}}, { ...getUnit('mage'), position: {x: 970, y: 500}}, { ...getUnit('cleric'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: {x: 910, y: 300}} ]
    },
    {
        id: 28, world: 3, name: "Holy Bastion", budget: 1600, reward: 330, theme: world3Theme,
        obstacles: [ { type: 'tree', position: {x: 620, y: 260}, size: 100 }, { type: 'tree', position: {x: 620, y: 500}, size: 100 } ],
        enemyUnits: [ { ...getUnit('paladin'), position: {x: 788, y: 250}}, { ...getUnit('paladin'), position: {x: 788, y: 500}}, { ...getUnit('prism_guard'), position: {x: 849, y: 375}}, { ...getUnit('cleric'), position: {x: 910, y: 200}}, { ...getUnit('cleric'), position: {x: 910, y: 300}}, { ...getUnit('cleric'), position: {x: 910, y: 450}}, { ...getUnit('cleric'), position: {x: 910, y: 550}}, { ...getUnit('crossbowman'), position: {x: 970, y: 375}} ]
    },
    {
        id: 29, world: 3, name: "The Final Shard", budget: 1760, reward: 350, theme: world3Theme,
        musicTrack: 'world1_epic.mp3',
        obstacles: [ {type: 'rock', position: {x: 728, y: 200}, size: 140}, {type: 'rock', position: {x: 728, y: 550}, size: 140}, { type: 'tree', position: {x: 640, y: 375}, size: 90 } ],
        enemyUnits: [ { ...getUnit('golem'), position: {x: 849, y: 250}}, { ...getUnit('golem'), position: {x: 849, y: 500}}, { ...getUnit('enchantress'), position: {x: 970, y: 250}}, { ...getUnit('enchantress'), position: {x: 970, y: 500}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: {x: 910, y: 300}} ]
    },
    {
        id: 30, world: 3, name: "Crystal Heart", budget: 3600, reward: 950, theme: world3Theme,
        musicTrack: 'boss_crystal_monstrosity.mp3', 
        obstacles: [ {type: 'rock_cluster', position: {x: 546, y: 200}, size: 160}, {type: 'rock_cluster', position: {x: 546, y: 550}, size: 160} ],
        enemyUnits: [ { ...getUnit('boss_crystal_monstrosity'), position: {x: 910, y: 375}}, { ...getUnit('prism_guard'), position: {x: 849, y: 200}}, { ...getUnit('prism_guard'), position: {x: 849, y: 550}}, { ...getUnit('enchantress'), position: {x: 820, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 375}} ]
    },

    // WORLD 4: VOLCANIC HEART - Introduce swarms and damage auras
    {
        id: 31, world: 4, name: "Imp-festation", budget: 560, reward: 350, theme: world4Theme,
        obstacles: [ { type: 'rock', position: { x: 600, y: 280 }, size: 90 }, { type: 'rock', position: { x: 600, y: 470 }, size: 90 } ],
        enemyUnits: [ { ...getUnit('imp'), position: {x: 728, y: 150}}, { ...getUnit('imp'), position: {x: 728, y: 200}}, { ...getUnit('imp'), position: {x: 728, y: 250}}, { ...getUnit('imp'), position: {x: 728, y: 300}}, { ...getUnit('imp'), position: {x: 728, y: 350}}, { ...getUnit('imp'), position: {x: 728, y: 400}}, { ...getUnit('imp'), position: {x: 728, y: 450}}, { ...getUnit('imp'), position: {x: 728, y: 500}}, { ...getUnit('imp'), position: {x: 728, y: 550}}, { ...getUnit('imp'), position: {x: 728, y: 600}}, { ...getUnit('magma_elemental'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 300}}, { ...getUnit('crossbowman'), position: {x: 970, y: 450}} ]
    },
    {
        id: 32, world: 4, name: "Magma Fields", budget: 1120, reward: 350, theme: world4Theme,
        obstacles: [ {type: 'lake', position: {x: 606, y: 225}, size: 180}, {type: 'lake', position: {x: 606, y: 525}, size: 180} ], // Themed as lava
        enemyUnits: [ { ...getUnit('magma_elemental'), position: {x: 788, y: 225}}, { ...getUnit('magma_elemental'), position: {x: 788, y: 525}}, { ...getUnit('magma_elemental'), position: {x: 849, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 150}}, { ...getUnit('crossbowman'), position: {x: 970, y: 600}}, { ...getUnit('cleric'), position: {x: 970, y: 375}}, { ...getUnit('tank'), position: {x: 849, y: 250}}, { ...getUnit('tank'), position: {x: 849, y: 500}} ]
    },
    {
        id: 33, world: 4, name: "The Great Forge", budget: 1200, reward: 350, theme: world4Theme,
        obstacles: [ { type: 'wall', position: { x: 728, y: 375 }, size: {width: 90, height: 420} }, { type: 'rock', position: { x: 560, y: 375 }, size: 100 } ],
        enemyUnits: [ { ...getUnit('golem'), position: {x: 849, y: 375}}, { ...getUnit('enchantress'), position: {x: 970, y: 300}}, { ...getUnit('enchantress'), position: {x: 970, y: 450}}, { ...getUnit('magma_elemental'), position: {x: 910, y: 200}}, { ...getUnit('magma_elemental'), position: {x: 910, y: 550}}, { ...getUnit('bomber'), position: {x: 788, y: 320}}, { ...getUnit('bomber'), position: {x: 788, y: 430}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}} ]
    },
    {
        id: 34, world: 4, name: "Fire and Ash", budget: 1500, reward: 350, theme: world4Theme,
        obstacles: [ { type: 'rock', position: { x: 600, y: 200 }, size: 120 }, { type: 'rock', position: { x: 600, y: 550 }, size: 120 } ],
        enemyUnits: [ { ...getUnit('magma_elemental'), position: {x: 788, y: 250}}, { ...getUnit('magma_elemental'), position: {x: 788, y: 500}}, { ...getUnit('berserker'), position: {x: 728, y: 200}}, { ...getUnit('berserker'), position: {x: 728, y: 550}}, { ...getUnit('mage'), position: {x: 970, y: 375}}, { ...getUnit('necromancer'), position: {x: 970, y: 150}}, { ...getUnit('necromancer'), position: {x: 970, y: 600}}, { ...getUnit('skeleton'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: {x: 910, y: 250}}, { ...getUnit('crossbowman'), position: {x: 910, y: 500}} ]
    },
    {
        id: 35, world: 4, name: "Ring of Fire", budget: 1280, reward: 350, theme: world4Theme,
        obstacles: [ {type: 'lake', position: {x: 728, y: 375}, size: 250} ],
        enemyUnits: [ { ...getUnit('magma_elemental'), position: {x: 910, y: 200}}, { ...getUnit('magma_elemental'), position: {x: 910, y: 550}}, { ...getUnit('mage'), position: {x: 970, y: 250}}, { ...getUnit('mage'), position: {x: 970, y: 500}}, { ...getUnit('assassin'), position: {x: 849, y: 375}}, { ...getUnit('assassin'), position: {x: 849, y: 150}}, { ...getUnit('assassin'), position: {x: 849, y: 600}}, { ...getUnit('bomber'), position: {x: 788, y: 375}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}}, { ...getUnit('cleric'), position: {x: 970, y: 375}} ]
    },
    {
        id: 36, world: 4, name: "Volcanic Fissure", budget: 1500, reward: 350, theme: world4Theme,
        obstacles: [ { type: 'wall', position: {x: 546, y: 375}, size: {width: 90, height: 260} }, { type: 'wall', position: {x: 788, y: 375}, size: {width: 90, height: 260} } ],
        enemyUnits: [ { ...getUnit('paladin'), position: {x: 910, y: 375}}, { ...getUnit('magma_elemental'), position: {x: 667, y: 375}}, { ...getUnit('enchantress'), position: {x: 970, y: 200}}, { ...getUnit('enchantress'), position: {x: 970, y: 550}}, { ...getUnit('berserker'), position: {x: 910, y: 200}}, { ...getUnit('berserker'), position: {x: 910, y: 550}}, { ...getUnit('crossbowman'), position: {x: 970, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 300}} ]
    },
    {
        id: 37, world: 4, name: "Swarm and Scorch", budget: 1320, reward: 350, theme: world4Theme,
        obstacles: [ { type: 'rock_cluster', position: { x: 667, y: 375 }, size: 180 }, { type: 'rock', position: { x: 520, y: 375 }, size: 90 } ],
        enemyUnits: [ { ...getUnit('magma_elemental'), position: {x: 849, y: 375}}, { ...getUnit('imp'), position: {x: 728, y: 250}}, { ...getUnit('imp'), position: {x: 728, y: 300}}, { ...getUnit('imp'), position: {x: 728, y: 350}}, { ...getUnit('imp'), position: {x: 728, y: 400}}, { ...getUnit('imp'), position: {x: 728, y: 450}}, { ...getUnit('necromancer'), position: {x: 970, y: 200}}, { ...getUnit('necromancer'), position: {x: 970, y: 550}}, { ...getUnit('bomber'), position: {x: 788, y: 375}}, { ...getUnit('paladin'), position: {x: 910, y: 375}} ]
    },
    {
        id: 38, world: 4, name: "Fire and Ice", budget: 1560, reward: 350, theme: world4Theme,
        obstacles: [ { type: 'wall', position: { x: 667, y: 375 }, size: { width: 90, height: 350 } } ],
        enemyUnits: [ { ...getUnit('magma_elemental'), position: {x: 788, y: 300}}, { ...getUnit('magma_elemental'), position: {x: 788, y: 450}}, { ...getUnit('frost_mage'), position: {x: 970, y: 200}}, { ...getUnit('frost_mage'), position: {x: 970, y: 550}}, { ...getUnit('golem'), position: {x: 849, y: 375}}, { ...getUnit('cleric'), position: {x: 970, y: 375}}, { ...getUnit('bomber'), position: {x: 728, y: 375}}, { ...getUnit('assassin'), position: {x: 910, y: 150}}, { ...getUnit('assassin'), position: {x: 910, y: 600}} ]
    },
    {
        id: 39, world: 4, name: "Infernal Advance", budget: 2000, reward: 420, theme: world4Theme,
        musicTrack: 'world1_epic.mp3',
        obstacles: [ { type: 'rock', position: { x: 600, y: 220 }, size: 110 }, { type: 'rock', position: { x: 600, y: 530 }, size: 110 } ],
        enemyUnits: [ { ...getUnit('golem'), position: {x: 788, y: 375}}, { ...getUnit('magma_elemental'), position: {x: 812, y: 275}}, { ...getUnit('magma_elemental'), position: {x: 812, y: 475}}, { ...getUnit('berserker'), position: {x: 728, y: 375}}, { ...getUnit('paladin'), position: {x: 885, y: 375}}, { ...getUnit('enchantress'), position: {x: 970, y: 300}}, { ...getUnit('enchantress'), position: {x: 970, y: 450}}, { ...getUnit('bomber'), position: {x: 728, y: 220}}, { ...getUnit('bomber'), position: {x: 728, y: 530}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 375}} ]
    },
    {
        id: 40, world: 4, name: "Heart of the Inferno", budget: 4200, reward: 1200, theme: world4Theme,
        musicTrack: 'boss_magma_colossus.mp3',
        obstacles: [ {type: 'rock_cluster', position: {x: 546, y: 200}, size: 120}, {type: 'rock_cluster', position: {x: 546, y: 550}, size: 120} ],
        enemyUnits: [ { ...getUnit('boss_magma_colossus'), position: {x: 910, y: 375}}, { ...getUnit('magma_elemental'), position: {x: 849, y: 200}}, { ...getUnit('magma_elemental'), position: {x: 849, y: 550}}, { ...getUnit('prism_guard'), position: {x: 970, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 300}}, { ...getUnit('crossbowman'), position: {x: 970, y: 450}} ]
    },

    // WORLD 5: GLACIAL FRONTIER - Introduce flyers and powerful AoE
    {
        id: 41, world: 5, name: "Valkyrie's Pass", budget: 1350, reward: 420, theme: world5Theme,
        obstacles: [ {type: 'wall', position: {x: 606, y: 200}, size: {width:90, height:300}}, {type: 'wall', position: {x: 606, y: 550}, size: {width:90, height:300}}, { type: 'lake', position: { x: 520, y: 375 }, size: 160 } ],
        enemyUnits: [ { ...getUnit('valkyrie'), position: {x: 788, y: 200}}, { ...getUnit('valkyrie'), position: {x: 788, y: 375}}, { ...getUnit('valkyrie'), position: {x: 788, y: 550}}, { ...getUnit('prism_guard'), position: {x: 910, y: 150}}, { ...getUnit('prism_guard'), position: {x: 910, y: 600}}, { ...getUnit('crossbowman'), position: {x: 970, y: 375}} ]
    },
    {
        id: 42, world: 5, name: "Ice Giant's Stomp", budget: 1200, reward: 400, theme: world5Theme,
        obstacles: [ {type: 'rock', position: {x: 667, y: 200}, size: 100}, {type: 'rock', position: {x: 667, y: 550}, size: 100} ],
        enemyUnits: [ { ...getUnit('ice_giant'), position: {x: 849, y: 250}}, { ...getUnit('ice_giant'), position: {x: 849, y: 500}}, { ...getUnit('cleric'), position: {x: 970, y: 250}}, { ...getUnit('cleric'), position: {x: 970, y: 500}}, { ...getUnit('valkyrie'), position: {x: 788, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 375}} ]
    },
    {
        id: 43, world: 5, name: "Avalanche", budget: 1360, reward: 400, theme: world5Theme,
        obstacles: [ { type: 'wall', position: { x: 667, y: 375 }, size: { width: 90, height: 360 } } ],
        enemyUnits: [ { ...getUnit('ice_giant'), position: {x: 788, y: 375}}, { ...getUnit('lancer'), position: {x: 728, y: 150}}, { ...getUnit('lancer'), position: {x: 728, y: 250}}, { ...getUnit('lancer'), position: {x: 728, y: 450}}, { ...getUnit('lancer'), position: {x: 728, y: 550}}, { ...getUnit('frost_mage'), position: {x: 970, y: 300}}, { ...getUnit('frost_mage'), position: {x: 970, y: 450}}, { ...getUnit('crossbowman'), position: {x: 910, y: 375}} ]
    },
    {
        id: 44, world: 5, name: "Frozen Horde", budget: 1680, reward: 400, theme: world5Theme,
        obstacles: [ { type: 'rock_cluster', position: { x: 650, y: 375 }, size: 180 } ],
        enemyUnits: [ { ...getUnit('ice_giant'), position: {x: 788, y: 250}}, { ...getUnit('ice_giant'), position: {x: 788, y: 500}}, { ...getUnit('necromancer'), position: {x: 970, y: 200}}, { ...getUnit('necromancer'), position: {x: 970, y: 550}}, { ...getUnit('valkyrie'), position: {x: 910, y: 375}}, { ...getUnit('skeleton'), position: {x: 910, y: 300}}, { ...getUnit('skeleton'), position: {x: 910, y: 450}}, { ...getUnit('enchantress'), position: {x: 970, y: 375}} ]
    },
    {
        id: 45, world: 5, name: "Glacial Prison", budget: 1560, reward: 400, theme: world5Theme,
        obstacles: [ {type: 'wall', position: {x: 728, y: 250}, size: {width: 90, height: 420}}, {type: 'wall', position: {x: 910, y: 250}, size: {width: 90, height: 420}} ],
        enemyUnits: [ { ...getUnit('paladin'), position: {x: 970, y: 200}}, { ...getUnit('paladin'), position: {x: 970, y: 550}}, { ...getUnit('ice_giant'), position: {x: 818, y: 375}}, { ...getUnit('frost_mage'), position: {x: 970, y: 375}}, { ...getUnit('frost_mage'), position: {x: 970, y: 100}}, { ...getUnit('crossbowman'), position: {x: 910, y: 375}} ]
    },
    {
        id: 46, world: 5, name: "Air and Ground", budget: 1840, reward: 400, theme: world5Theme,
        obstacles: [ { type: 'lake', position: { x: 600, y: 230 }, size: 150 }, { type: 'rock', position: { x: 600, y: 520 }, size: 110 } ],
        enemyUnits: [ { ...getUnit('valkyrie'), position: {x: 788, y: 200}}, { ...getUnit('valkyrie'), position: {x: 788, y: 550}}, { ...getUnit('golem'), position: {x: 849, y: 250}}, { ...getUnit('golem'), position: {x: 849, y: 500}}, { ...getUnit('ice_giant'), position: {x: 910, y: 375}}, { ...getUnit('bomber'), position: {x: 728, y: 375}}, { ...getUnit('cleric'), position: {x: 970, y: 375}} ]
    },
    {
        id: 47, world: 5, name: "The Unbreakables", budget: 1960, reward: 400, theme: world5Theme,
        obstacles: [ { type: 'rock', position: { x: 650, y: 280 }, size: 100 }, { type: 'rock', position: { x: 650, y: 470 }, size: 100 } ],
        enemyUnits: [ { ...getUnit('ice_giant'), position: {x: 788, y: 375}}, { ...getUnit('paladin'), position: {x: 849, y: 250}}, { ...getUnit('paladin'), position: {x: 849, y: 500}}, { ...getUnit('golem'), position: {x: 910, y: 375}}, { ...getUnit('cleric'), position: {x: 970, y: 300}}, { ...getUnit('cleric'), position: {x: 970, y: 450}}, { ...getUnit('skeleton'), position: {x: 910, y: 220}}, { ...getUnit('skeleton'), position: {x: 910, y: 530}}, { ...getUnit('prism_guard'), position: {x: 910, y: 375}} ]
    },
    {
        id: 48, world: 5, name: "Ragnarok's Eve", budget: 2080, reward: 400, theme: world5Theme,
        musicTrack: 'world1_epic.mp3',
        obstacles: [ { type: 'rock_cluster', position: { x: 640, y: 375 }, size: 160 } ],
        enemyUnits: [ { ...getUnit('valkyrie'), position: {x: 728, y: 200}}, { ...getUnit('valkyrie'), position: {x: 728, y: 550}}, { ...getUnit('berserker'), position: {x: 788, y: 250}}, { ...getUnit('berserker'), position: {x: 788, y: 500}}, { ...getUnit('ice_giant'), position: {x: 885, y: 375}}, { ...getUnit('enchantress'), position: {x: 970, y: 375}}, { ...getUnit('prism_guard'), position: {x: 849, y: 375}}, { ...getUnit('bomber'), position: {x: 788, y: 375}}, { ...getUnit('crossbowman'), position: {x: 910, y: 375}} ]
    },
    {
        id: 49, world: 5, name: "The Final Stand", budget: 2200, reward: 400, theme: world5Theme,
        obstacles: [ { type: 'wall', position: { x: 667, y: 200 }, size: { width: 90, height: 300 } }, { type: 'wall', position: { x: 667, y: 550 }, size: { width: 90, height: 300 } } ],
        enemyUnits: [ { ...getUnit('ice_giant'), position: {x: 788, y: 250}}, { ...getUnit('ice_giant'), position: {x: 788, y: 500}}, { ...getUnit('magma_elemental'), position: {x: 849, y: 250}}, { ...getUnit('magma_elemental'), position: {x: 849, y: 500}}, { ...getUnit('valkyrie'), position: {x: 910, y: 375}}, { ...getUnit('enchantress'), position: {x: 970, y: 375}}, { ...getUnit('bomber'), position: {x: 728, y: 375}}, { ...getUnit('prism_guard'), position: {x: 910, y: 300}}, { ...getUnit('prism_guard'), position: {x: 910, y: 450}} ]
    },
    {
        id: 50, world: 5, name: "Dragon's Peak", budget: 4000, reward: 1200, theme: world5Theme,
        musicTrack: 'boss_dragon.mp3',
        obstacles: [ { type: 'rock', position: { x: 606, y: 200 }, size: 100 }, { type: 'rock', position: { x: 606, y: 550 }, size: 100 } ],
        enemyUnits: [ { ...getUnit('dragon_boss'), position: {x: 910, y: 375}}, { ...getUnit('ice_giant'), position: {x: 849, y: 200}}, { ...getUnit('ice_giant'), position: {x: 849, y: 550}}, { ...getUnit('valkyrie'), position: {x: 788, y: 375}}, { ...getUnit('prism_guard'), position: {x: 970, y: 375}}, { ...getUnit('crossbowman'), position: {x: 970, y: 300}}, { ...getUnit('crossbowman'), position: {x: 970, y: 450}} ]
    }
];