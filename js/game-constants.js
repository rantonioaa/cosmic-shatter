        // SECTION 4: GAME CONSTANTS — Heat, combo, powerups, asteroids, biomes, upgrades
        // ============================================================================

        // Heat system
        let heat = 0;
        let overheating = false;
        let overheatTimer = 0;
        let overdrive = false;
        const HEAT_PER_SHOT = 5;
        const HEAT_DECAY = 0.5;
        const OVERHEAT_COOLDOWN = 120;
        const BASE_HEAT_LIMIT = 20;

        // Combo system
        let combo = 0;
        let comboTimer = 0;
        const COMBO_TIMEOUT = 180; // 3 seconds at 60fps

        // Powerup types
        const POWERUP_TYPES = [
            { id: 'shield',       label: 'Shield',          color: '#00ffff', duration: 0,    desc: 'Absorbs one hit' },
            { id: 'chainlightning', label: 'Chain Lightning', color: '#ffee44', duration: 600,  desc: 'Bullets chain to 2 nearby asteroids' },
            { id: 'speed',        label: 'Speed Boost',     color: '#00ff00', duration: 480,  desc: '+50% thrust' },
            { id: 'explosive',    label: 'Explosive',       color: '#ff8800', duration: 600,  desc: 'Area damage bullets' },
            { id: 'slowtime',     label: 'Slow-Time',       color: '#cc00ff', duration: 360,  desc: 'Asteroids 50% speed' },
            { id: 'scoremult',    label: 'Score x2',        color: '#ffd700', duration: 480,  desc: 'Double score' },
            { id: 'magnetboost',  label: 'Magnet Boost',    color: '#ff88ff', duration: 600,  desc: 'Doubles magnet radius' },
            { id: 'starmagnet',   label: 'Star Magnet',     color: '#ffff88', duration: 300,  desc: 'Pulls all items (rare!)' },
            { id: 'backshot',     label: 'Back Shot',       color: '#88ffff', duration: 600,  desc: 'Shoot front and back' }
        ];
        const POWERUP_DROP_CHANCE = 0.15;
        const POWERUP_LIFETIME = 1800; // 30 seconds at 60fps

        // Colored asteroids
        const ASTEROID_COLORS = [
            { id: 'gray',   hex: '#888888', weight: 40, health: 1, speedMult: 1,   starBits: 1, behavior: 'normal' },
            { id: 'red',    hex: '#ff4444', weight: 20, health: 1, speedMult: 1.8, starBits: 1, behavior: 'fast' },
            { id: 'blue',   hex: '#4488ff', weight: 15, health: 3, speedMult: 0.8, starBits: 2, behavior: 'tanky' },
            { id: 'purple', hex: '#bb44ff', weight: 10, health: 1, speedMult: 1,   starBits: 2, behavior: 'erratic' },
            { id: 'green',  hex: '#44cc44', weight: 10, health: 4, speedMult: 0.8, starBits: 3, behavior: 'heavy' },
            { id: 'gold',   hex: '#ffcc00', weight: 5,  health: 1, speedMult: 1.5, starBits: 5, behavior: 'rare' }
        ];
        const ASTEROID_WEIGHT_TOTAL = ASTEROID_COLORS.reduce((s, c) => s + c.weight, 0);

        // Golden Lure asteroid (distinct from regular Gold)
        const GOLDEN_LURE = {
            id: 'golden_lure',
            hex: '#fffacd',
            coreHex: '#ffffff',
            trailHex: '#ffd700',
            health: 2,
            speedMult: 2.2,
            starBits: 8,
            scoreMult: 3,
            basePoints: 100,
            radiusMult: 1.8,
            behavior: 'lure'
        };

        // Difficulty scaling (capped at level 20)
        function getLevelCap() { return Math.min(level, 20); }
        function getLevelSpeedMult() { const biome = getActiveBiome(); return (1 + (getLevelCap() - 1) * 0.03) * (biome.speedMult || 1); }
        function getLevelHealthBonus() { const biome = getActiveBiome(); return Math.floor((getLevelCap() - 1) / 5) + (biome.hpBonus || 0); }
        function getLevelSafeZone() { const biome = getActiveBiome(); return Math.max(sc(90), (sc(150) - (level - 1) * sc(3)) * (biome.safeZoneMult || 1)); }
        function getLevelAsteroidCount() {
            const biome = getActiveBiome();
            const capped = getLevelCap();
            let count;
            if (capped <= 5) count = capped + 3;
            else if (capped <= 10) count = capped + 5;
            else count = capped + 8;
            return Math.round(count * (biome.countMult || 1));
        }
        function getLevelColorWeights() {
            const t = getLevelCap() / 20;
            return ASTEROID_COLORS.map(c => {
                let w = c.weight;
                if (c.id === 'gray') w = 40 - t * 15;
                if (c.id === 'red') w = 20 + t * 8;
                if (c.id === 'purple') w = 10 + t * 3;
                if (c.id === 'gold') w = 5 + t * 7;
                return { ...c, weight: Math.round(w) };
            });
        }
        function getLevelWeightTotal() {
            return getLevelColorWeights().reduce((s, c) => s + c.weight, 0);
        }

        // Magnet constants
        const MAGNET_PULL_STRENGTH = 2;

        // Modifier types (ordered by unlock progression)
        const MODIFIERS = [
            { id: 'none',          label: 'None',          mult: 1,    desc: 'Standard gameplay' },
            { id: 'tiny_ship',     label: 'Tiny Ship',     mult: 1.5,  desc: 'Half size, less thrust, 2x bullet damage needed' },
            { id: 'speed_demon',   label: 'Speed Demon',   mult: 1.5,  desc: 'Asteroids 1.5x faster' },
            { id: 'dark_mode',     label: 'Dark Mode',     mult: 1.75, desc: 'Limited vision radius' },
            { id: 'bullet_storm',  label: 'Bullet Storm',  mult: 2,    desc: '2x asteroid count' },
            { id: 'glass_cannon',  label: 'Glass Cannon',  mult: 2.5,  desc: 'Instant split, 1 hit = death' }
        ];

        // Unlock requirements: prev = prerequisite modifier id, level = required level
        const MODIFIER_UNLOCK = {
            none:          null,
            tiny_ship:     { prev: 'none',         level: 7 },
            speed_demon:   { prev: 'tiny_ship',    level: 5 },
            dark_mode:     { prev: 'speed_demon',  level: 6 },
            bullet_storm:  { prev: 'dark_mode',    level: 8 },
            glass_cannon:  { prev: 'bullet_storm', level: 10 }
        };

        // Biome definitions
        const BIOMES = [
            { id: 'classic_void', name: 'Classic Void', scoreMult: 1.0, friction: 0.99,
              countMult: 1, speedMult: 1, safeZoneMult: 1, hpBonus: 0, powerupLuckBonus: 0,
              starBitMult: 1, rotMult: 1, magnetMult: 1, enemyType: null, specialObject: 'void_cache', specialChance: 0.05,
              desc: 'The baseline. Standard space with no special hazards. Perfect for learning the ropes.',
              enemyDesc: 'None', specialDesc: 'Void Cache — rare reward portal',
              threat: 'low', threatColor: '#44cc44',
              stats: { speed: 1.0, count: 1.0, friction: 1.0, magnet: 1.0, rotation: 1.0 },
              palette: { accent: '#4fc3f7', bg: '#000000', particles: null } },
            { id: 'rubble_field', name: 'Rubble Field', scoreMult: 1.30, friction: 0.99,
              countMult: 1.5, speedMult: 1, safeZoneMult: 1, hpBonus: 0, powerupLuckBonus: 0,
              starBitMult: 1.2, rotMult: 1, magnetMult: 1, enemyType: 'drift_mine', specialObject: 'gravity_well', specialChance: 0.05,
              desc: 'Dense debris fields with drift mines hidden among the rocks. Mines chain-react on destruction.',
              enemyDesc: 'Drift Mines — pulsing mines that explode on proximity, chain-reacting with asteroids',
              specialDesc: 'Gravity Well — pulls ship, bullets, and asteroids inward',
              threat: 'high', threatColor: '#ff4444',
              stats: { speed: 1.0, count: 1.5, friction: 1.0, magnet: 1.0, rotation: 1.0 },
              palette: { accent: '#ff6644', bg: '#0a0000', particles: 'sparks' } },
            { id: 'drift_expanse', name: 'Drift Expanse', scoreMult: 1.40, friction: 0.995,
              momentumBoost: 0.30, momentumThreshold: 0.30,
              countMult: 1, speedMult: 1.10, safeZoneMult: 1, hpBonus: 0, powerupLuckBonus: 0,
              starBitMult: 1.5, rotMult: 1.10, magnetMult: 1, enemyType: 'comet', specialObject: 'void_cache', specialChance: 0.05,
              desc: 'Slippery ice fields where comets streak through the void. Master the drift for momentum boosts.',
              enemyDesc: 'Comets — fast screen-crossers that drop 2× bonus star bits',
              specialDesc: 'Void Cache — rare reward portal',
              threat: 'medium', threatColor: '#ffaa00',
              stats: { speed: 1.10, count: 1.0, friction: 0.995, magnet: 1.0, rotation: 1.10 },
              palette: { accent: '#88ddff', bg: '#000810', particles: 'streaks' } },
            { id: 'dense_belt', name: 'Dense Belt', scoreMult: 1.5, friction: 0.99,
              countMult: 1, speedMult: 1.35, safeZoneMult: 0.50, hpBonus: 1, powerupLuckBonus: 0.1,
              starBitMult: 1, rotMult: 1, magnetMult: 1, enemyType: 'turret', specialObject: 'gravity_well', specialChance: 0.08,
              desc: 'Fast and tight. Turrets guard the belt while gravity wells warp the field.',
              enemyDesc: 'Turrets — stationary hexagons (2 HP) that fire slow projectiles at the ship',
              specialDesc: 'Gravity Well — pulls ship, bullets, and asteroids inward',
              threat: 'high', threatColor: '#ff4444',
              stats: { speed: 1.35, count: 1.0, friction: 1.0, magnet: 1.0, rotation: 1.0 },
              palette: { accent: '#ffaa00', bg: '#080400', particles: 'embers' } },
            { id: 'mire_wastes', name: 'Mire Wastes', scoreMult: 1.40, friction: 0.985,
              countMult: 1, speedMult: 0.95, safeZoneMult: 1, hpBonus: 0, powerupLuckBonus: 0,
              starBitMult: 1, rotMult: 0.55, magnetMult: 0.55, enemyType: 'swarmer', specialObject: 'gravity_well', specialChance: 0.08,
              desc: 'Thick and sluggish. Swarms lurk in the mire while gravity wells warp the field.',
              enemyDesc: 'Swarmers — tiny triangles that clump together and chase the ship',
              specialDesc: 'Gravity Well — pulls ship, bullets, and asteroids inward',
              threat: 'medium', threatColor: '#ffaa00',
              stats: { speed: 0.95, count: 1.0, friction: 0.985, magnet: 0.55, rotation: 0.55 },
              palette: { accent: '#66cc66', bg: '#000a00', particles: 'spores' } }
        ];
        const BIOME_UNLOCK_CHAIN = {
            classic_void: null,
            rubble_field: 'classic_void',
            drift_expanse: 'classic_void',
            dense_belt: 'rubble_field',
            mire_wastes: 'drift_expanse'
        };
        function getActiveBiome() {
            const id = activeProfile?.selectedBiome || 'classic_void';
            return BIOMES.find(b => b.id === id) || BIOMES[0];
        }

        // Upgrade definitions (shop)
        const UPGRADES = [
            {
                id: 'extraLife', label: 'EXTRA LIFE', desc: '+1 starting life',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#ff4444',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 28 C6 20 2 14 2 9 C2 5 5 2 9 2 C12 2 14 4 16 7 C18 4 20 2 23 2 C27 2 30 5 30 9 C30 14 26 20 16 28Z" fill="none" stroke="#ff4444" stroke-width="1.5" stroke-linejoin="round"/></svg>'
            },
            {
                id: 'thrustPower', label: 'THRUST POWER', desc: '+0.02 thrust',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#00ffff',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 22,14 16,11 10,14" fill="none" stroke="#00ffff" stroke-width="1.5" stroke-linejoin="round"/><line x1="16" y1="14" x2="16" y2="20" stroke="#00ffff" stroke-width="1.5"/><polygon points="12,20 16,28 20,20" fill="none" stroke="#00ffff" stroke-width="1.2" stroke-linejoin="round"/></svg>'
            },
            {
                id: 'fireRate', label: 'FIRE RATE', desc: '-1 frame cooldown',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#ffcc00',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><polyline points="18,2 10,16 17,16 12,30" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>'
            },
            {
                id: 'startShield', label: 'START SHIELD', desc: 'Begin with shield',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#4488ff',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><path d="M16 3 L28 9 L28 16 C28 23 22 29 16 30 C10 29 4 23 4 16 L4 9 Z" fill="none" stroke="#4488ff" stroke-width="1.5" stroke-linejoin="round"/><line x1="16" y1="10" x2="16" y2="22" stroke="#4488ff" stroke-width="1.2"/><line x1="10" y1="16" x2="22" y2="16" stroke="#4488ff" stroke-width="1.2"/></svg>'
            },
            {
                id: 'powerupLuck', label: 'POWERUP LUCK', desc: '+5% drop chance',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#44cc44',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 19,12 30,12 21,18 24,28 16,22 8,28 11,18 2,12 13,12" fill="none" stroke="#44cc44" stroke-width="1.5" stroke-linejoin="round"/></svg>'
            },
            {
                id: 'bulletSpeed', label: 'BULLET SPEED', desc: '+20% bullet speed',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#ffffff',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><polyline points="6,16 20,16" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><polyline points="16,10 24,16 16,22" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/><line x1="24" y1="16" x2="30" y2="16" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="2,2"/></svg>'
            },
            {
                id: 'magnetRange', label: 'MAGNET RANGE', desc: '+20px base radius',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#ff88ff',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><path d="M8 4 L8 18 C8 24 12 28 16 28 C20 28 24 24 24 18 L24 4" fill="none" stroke="#ff88ff" stroke-width="1.5" stroke-linecap="round"/><rect x="5" y="2" width="6" height="5" rx="1" fill="none" stroke="#ff88ff" stroke-width="1.2"/><rect x="21" y="2" width="6" height="5" rx="1" fill="none" stroke="#ff88ff" stroke-width="1.2"/></svg>'
            },
            {
                id: 'coolingSystem', label: 'COOLING SYS', desc: '+10 shots before overheat',
                maxLevel: 5, baseCost: 1000, costMult: 1.5, color: '#88ddff',
                svg: '<svg width="32" height="32" viewBox="0 0 32 32"><line x1="16" y1="4" x2="16" y2="28" stroke="#88ddff" stroke-width="1.5"/><line x1="4" y1="16" x2="28" y2="16" stroke="#88ddff" stroke-width="1.5"/><line x1="7" y1="7" x2="25" y2="25" stroke="#88ddff" stroke-width="1.2"/><line x1="25" y1="7" x2="7" y2="25" stroke="#88ddff" stroke-width="1.2"/><circle cx="16" cy="16" r="3" fill="none" stroke="#88ddff" stroke-width="1.2"/></svg>'
            }
        ];

        function getUpgradeCost(upgradeId) {
            const upg = UPGRADES.find(u => u.id === upgradeId);
            const level = activeProfile ? activeProfile.upgrades[upgradeId] : 0;
            return Math.floor(upg.baseCost * Math.pow(upg.costMult, level));
        }

        // Stardust shop data
        const SD_TAB_NAMES = ['loadouts', 'cosmetics'];
        const SD_LOADOUTS = [
            { id: 'standard', name: 'Standard', desc: 'Default loadout', cost: 0,
              type: 'standard', cooldown: 15, damage: 1.0, bulletSpeed: 5.0, heatMult: 1.0, pierce: 0 },
            { id: 'spread_shot', name: 'Spread Shot', desc: '3-way spread fire (±15°)', cost: 800,
              type: 'spread', cooldown: 18, damage: 1.0, bulletSpeed: 5.0, heatMult: 1.6, pierce: 0, spread: 0.26 },
            { id: 'rapid_fire', name: 'Rapid Fire', desc: '+150% fire rate, half damage', cost: 1200,
              type: 'standard', cooldown: 6, damage: 0.5, bulletSpeed: 6.0, heatMult: 0.6, pierce: 0 },
            { id: 'piercing_bolt', name: 'Piercing Bolt', desc: 'Bullets pierce 2 asteroids', cost: 2000,
              type: 'pierce', cooldown: 20, damage: 1.0, bulletSpeed: 4.0, heatMult: 1.2, pierce: 2 },
            { id: 'missiles', name: 'Missiles', desc: 'Homing missiles w/ AoE + burn', cost: 3500,
              type: 'missile', cooldown: 25, damage: 2.0, bulletSpeed: 3.5, heatMult: 2.4, pierce: 0, aoeRadius: 40 }
        ];
        function getActiveLoadout() {
            const id = activeProfile?.selectedLoadout || 'standard';
            return SD_LOADOUTS.find(l => l.id === id) || SD_LOADOUTS[0];
        }
        const SD_COSMETIC_SLOTS = [
            { slot: 'hull', label: 'Ship Hull', items: [
                { id: 'hull_spectre', name: 'Spectre White', desc: 'Default white wireframe', cost: 0, color: '#ffffff' },
                { id: 'hull_void', name: 'Void Black', desc: 'Near-black with white outline', cost: 80, color: '#222222' },
                { id: 'hull_crimson', name: 'Crimson Star', desc: 'Blood-red wireframe', cost: 160, color: '#ff3333' },
                { id: 'hull_abyss', name: 'Abyss Blue', desc: 'Deep blue wireframe', cost: 260, color: '#3366ff' },
                { id: 'hull_verdant', name: 'Verdant Core', desc: 'Neon green wireframe', cost: 400, color: '#33ff66' },
                { id: 'hull_solar', name: 'Solar Gold', desc: 'Golden yellow wireframe', cost: 600, color: '#ffcc00' },
                { id: 'hull_plasma', name: 'Plasma Purple', desc: 'Violet wireframe', cost: 800, color: '#cc33ff' },
                { id: 'hull_rose', name: 'Rose Nebula', desc: 'Pink/magenta wireframe', cost: 1150, color: '#ff66cc' },
                { id: 'hull_prismatic', name: 'Prismatic', desc: 'Rainbow hue cycling', cost: 1400, color: 'prismatic' }
            ]},
            { slot: 'bullets', label: 'Bullet Skins', items: [
                { id: 'bullet_standard', name: 'Standard Bolt', desc: 'Default circle', cost: 0, color: '#ffffff', shape: 'circle' },
                { id: 'bullet_crimson', name: 'Crimson Dart', desc: 'Red diamond + glow', cost: 80, color: '#ff3333', shape: 'diamond' },
                { id: 'bullet_azure', name: 'Azure Sphere', desc: 'Blue circle + glow', cost: 160, color: '#3388ff', shape: 'circle' },
                { id: 'bullet_verdant', name: 'Verdant Shard', desc: 'Green triangle + spark', cost: 260, color: '#33ff66', shape: 'triangle' },
                { id: 'bullet_solar', name: 'Solar Piercer', desc: 'Gold square + glow', cost: 420, color: '#ffcc00', shape: 'square' },
                { id: 'bullet_violet', name: 'Violet Star', desc: 'Purple star + long glow', cost: 640, color: '#cc33ff', shape: 'star' },
                { id: 'bullet_comet', name: 'Comet Tail', desc: 'Circle with particle trail', cost: 920, color: '#ffffff', shape: 'circle' },
                { id: 'bullet_void', name: 'Void Needle', desc: 'Dark diamond + spark', cost: 1250, color: '#8844cc', shape: 'diamond' }
            ]},
            { slot: 'thruster', label: 'Thruster Trail', items: [
                { id: 'thruster_standard', name: 'Standard Jets', desc: 'Default white stream', cost: 0, color: '#ffffff' },
                { id: 'thruster_blue', name: 'Blue Afterburner', desc: 'Blue jet stream', cost: 80, color: '#3388ff' },
                { id: 'thruster_purple', name: 'Purple Ion', desc: 'Purple jet stream', cost: 160, color: '#cc33ff' },
                { id: 'thruster_gold', name: 'Gold Flame', desc: 'Orange/gold stream', cost: 260, color: '#ff8800' },
                { id: 'thruster_green', name: 'Green Plasma', desc: 'Green stream', cost: 420, color: '#33ff66' },
                { id: 'thruster_cryo', name: 'Cryo Mist', desc: 'Wider cyan mist', cost: 640, color: '#88ffff' },
                { id: 'thruster_rainbow', name: 'Rainbow Boost', desc: 'Cycling rainbow stream', cost: 920, color: 'prismatic' },
                { id: 'thruster_twin', name: 'Twin Thrusters', desc: 'Two offset streams', cost: 1250, color: '#ffffff' }
            ]},
            { slot: 'death', label: 'Death Effects', items: [
                { id: 'death_standard', name: 'Standard Burst', desc: 'Default particle burst', cost: 0 },
                { id: 'death_implosion', name: 'Implosion Nova', desc: 'Pull in, then explode', cost: 100 },
                { id: 'death_shockwave', name: 'Shockwave Ring', desc: 'Expanding neon ring', cost: 210 },
                { id: 'death_shatter', name: 'Screen Shatter', desc: 'Cracks from death point', cost: 360 },
                { id: 'death_blackhole', name: 'Mini Black Hole', desc: 'Brief suction vortex', cost: 570 },
                { id: 'death_supernova', name: 'Supernova', desc: 'Flash + particle ring', cost: 850 },
                { id: 'death_glitch', name: 'Glitch Out', desc: 'Wireframe fragments', cost: 1100 },
                { id: 'death_annihilation', name: 'Total Annihilation', desc: 'All effects combined', cost: 1200 }
            ]},
            { slot: 'starbits', label: 'Star Bit Skins', items: [
                { id: 'starbit_gold', name: 'Golden Star', desc: 'Default 4-pointed star', cost: 0, shape: 'star' },
                { id: 'starbit_crystal', name: 'Blue Crystal', desc: 'Crystal shard', cost: 70, shape: 'crystal' },
                { id: 'starbit_moon', name: 'Silver Moon', desc: 'Crescent moon', cost: 140, shape: 'moon' },
                { id: 'starbit_heart', name: 'Red Heart', desc: 'Heart shape', cost: 250, shape: 'heart' },
                { id: 'starbit_diamond', name: 'Green Diamond', desc: 'Diamond outline', cost: 400, shape: 'diamond' },
                { id: 'starbit_cube', name: 'Spinning Cube', desc: '3D wireframe cube', cost: 620, shape: 'cube' },
                { id: 'starbit_comet', name: 'Comet Fragment', desc: 'Glowing bit with tail', cost: 900, shape: 'comet' },
                { id: 'starbit_prismatic', name: 'Prismatic Bit', desc: 'Color-changing star', cost: 1200, shape: 'prismatic' }
            ]},
            { slot: 'powerups', label: 'Powerup Visuals', items: [
                { id: 'powerup_diamond', name: 'Standard Diamond', desc: 'Default diamond with label', cost: 0, shape: 'diamond' },
                { id: 'powerup_orb', name: 'Glowing Orb', desc: 'Filled orb with glow', cost: 70, shape: 'orb' },
                { id: 'powerup_polygon', name: 'Spinning Polygon', desc: 'Rotating hexagon', cost: 150, shape: 'polygon' },
                { id: 'powerup_ring', name: 'Pulsing Ring', desc: 'Pulsing ring', cost: 270, shape: 'ring' },
                { id: 'powerup_runestone', name: 'Floating Runestone', desc: 'Rune-etched slab', cost: 430, shape: 'runestone' },
                { id: 'powerup_card', name: 'Holographic Card', desc: 'Rectangular card tilt', cost: 640, shape: 'card' },
                { id: 'powerup_core', name: 'Energy Core', desc: 'Pulsing energy sphere', cost: 900, shape: 'core' },
                { id: 'powerup_egg', name: 'Cosmic Egg', desc: 'Egg-shaped orb', cost: 1000, shape: 'egg' },
                { id: 'powerup_relic', name: 'Ancient Relic', desc: 'Ornate relic frame', cost: 1200, shape: 'relic' }
            ]}
        ];
        let sdShopTab = 0;
        let sdShopSlot = 0;
        let sdShopItem = 0;

        function getStardustUnlocksOwned() {
            if (!activeProfile) return { loadouts: [], cosmetics: {} };
            return activeProfile.stardustUnlocks || { loadouts: [], cosmetics: {} };
        }

        // Cosmetic helpers
        function getCosmeticColor(slot, fallback) {
            if (!activeProfile || !activeProfile.stardustUnlocks?.cosmetics) return fallback || '#ffffff';
            const equipped = activeProfile.stardustUnlocks.cosmetics[slot];
            if (!equipped) return fallback || '#ffffff';
            for (const slotDef of SD_COSMETIC_SLOTS) {
                if (slotDef.slot === slot) {
                    const item = slotDef.items.find(i => i.id === equipped);
                    if (item && item.color) {
                        if (item.color === 'prismatic') {
                            const hue = (Date.now() / 20) % 360;
                            return `hsl(${hue}, 100%, 60%)`;
                        }
                        return item.color;
                    }
                }
            }
            return fallback || '#ffffff';
        }

        function getCosmeticId(slot) {
            if (!activeProfile || !activeProfile.stardustUnlocks?.cosmetics) return null;
            return activeProfile.stardustUnlocks.cosmetics[slot] || null;
        }

        function getCosmeticShape(slot) {
            if (!activeProfile || !activeProfile.stardustUnlocks?.cosmetics) return null;
            const equipped = activeProfile.stardustUnlocks.cosmetics[slot];
            if (!equipped) return null;
            for (const slotDef of SD_COSMETIC_SLOTS) {
                if (slotDef.slot === slot) {
                    const item = slotDef.items.find(i => i.id === equipped);
                    if (item) return item.shape || null;
                }
            }
            return null;
        }

        function getCosmeticDeathId() {
            if (!activeProfile || !activeProfile.stardustUnlocks?.cosmetics) return 'death_standard';
            return activeProfile.stardustUnlocks.cosmetics.death || 'death_standard';
        }

        // Preview drawing helpers
        // ============================================================================
