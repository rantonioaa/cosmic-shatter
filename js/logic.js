        // SECTION 9: GAME LOGIC — Start game, serialize/deserialize, destroy asteroid
        // ============================================================================

        function startGame() {
            initAudio();
            resumeAudio();
            runProgressionIndex = Math.floor(Math.random() * PROGRESSIONS.length);
            startMusic();
            gameState = 'playing';
            score = 0;
            lastStardustEarned = 0;
            if (activeProfile) {
                activeProfile.activeRun = null;
                saveProfile(activeProfile);
            }
            const extraLives = activeProfile ? activeProfile.upgrades.extraLife : 0;
            lives = currentModifier.id === 'glass_cannon' ? 1 : 3 + extraLives;
            level = 1;
            ship.x = canvas.width / 2;
            ship.y = canvas.height / 2;
            ship.velocity = { x: 0, y: 0 };
            ship.angle = -Math.PI / 2;
            ship.invulnerable = true;
            ship.invulnerableTimer = 180;
            const thrustBonus = activeProfile ? activeProfile.upgrades.thrustPower * 0.02 : 0;
            if (currentModifier.id === 'tiny_ship') {
                ship.radius = sc(7);
                ship.thrust = 0.04 + thrustBonus;
            } else {
                ship.radius = sc(15);
                ship.thrust = 0.06 + thrustBonus;
            }
            ship.friction = getActiveBiome().friction || 0.99;
            ship.rotSpeed = 0.07 * (getActiveBiome().rotMult || 1);
            ship.momentumBoost = getActiveBiome().momentumBoost || 0;
            bullets = [];
            particles = [];
            biomeParticles = [];
            powerups = [];
            starBits = [];
            enemies = [];
            enemyBullets = [];
            gravityWells = [];
            voidCacheActive = false;
            voidCacheTimer = 0;
            voidCacheReturnState = null;
            runStarBits = 0;
            runAsteroidsDestroyed = 0;
            heat = 0;
            overheating = false;
            overheatTimer = 0;
            overdrive = false;
            combo = 0;
            comboTimer = 0;
            shieldTimer = 0;
            for (const id in activePowerups) activePowerups[id] = 0;
            // Start shield upgrade
            if (activeProfile && activeProfile.upgrades.startShield > 0) {
                activePowerups.shield = Math.min(3, activeProfile.upgrades.startShield);
                shieldTimer = SHIELD_DECAY_TIME;
            }
            spawnAsteroids();
            updateUI();
        }

        // Serialize current run state for saving
        function serializeRun() {
            return {
                score, lives, level, runStarBits, levelTransitionTimer,
                heat, overheating, overheatTimer, shootCooldown, overdrive,
                combo, comboTimer, shieldTimer, progressionIndex: runProgressionIndex,
                canvasWidth: canvas.width, canvasHeight: canvas.height,
                ship: {
                    x: ship.x, y: ship.y, angle: ship.angle,
                    velocity: { x: ship.velocity.x, y: ship.velocity.y },
                    invulnerable: ship.invulnerable, invulnerableTimer: ship.invulnerableTimer,
                    blinkOn: ship.blinkOn, blinkTimer: ship.blinkTimer
                },
                activePowerups: { ...activePowerups },
                modifierId: currentModifier.id,
                asteroids: asteroids.map(a => ({
                    x: a.x, y: a.y,
                    velocity: { x: a.velocity.x, y: a.velocity.y },
                    rotation: a.rotation, rotSpeed: a.rotSpeed,
                    size: a.size, hp: a.hp, maxHp: a.maxHp,
                    colorId: a.color.id, erraticTimer: a.erraticTimer,
                    isGoldenLure: a.isGoldenLure || false,
                    scoreMult: a.scoreMult, basePoints: a.basePoints,
                    trailTimer: a.trailTimer, lurePulse: a.lurePulse
                })),
                bullets: bullets.map(b => ({
                    x: b.x, y: b.y,
                    velocity: { x: b.velocity.x, y: b.velocity.y },
                    life: b.life, explosive: b.explosive
                })),
                powerups: powerups.map(p => ({
                    x: p.x, y: p.y,
                    velocity: { x: p.velocity.x, y: p.velocity.y },
                    type: p.type.id, pulse: p.pulse, life: p.life
                })),
                starBits: starBits.map(s => ({
                    x: s.x, y: s.y,
                    velocity: { x: s.velocity.x, y: s.velocity.y },
                    amount: s.amount, pulse: s.pulse, life: s.life
                })),
                enemies: enemies.map(e => ({
                    type: e.type, x: e.x, y: e.y,
                    velocity: { x: e.velocity.x, y: e.velocity.y },
                    radius: e.radius, hp: e.hp, maxHp: e.maxHp,
                    rotation: e.rotation || 0, fireTimer: e.fireTimer || 0,
                    pulse: e.pulse || 0, armTimer: e.armTimer || 0,
                    color: e.color, basePoints: e.basePoints, scoreMult: e.scoreMult, starBits: e.starBits
                })),
                enemyBullets: enemyBullets.map(b => ({
                    x: b.x, y: b.y,
                    velocity: { x: b.velocity.x, y: b.velocity.y },
                    life: b.life, radius: b.radius
                })),
                gravityWells: gravityWells.map(w => ({
                    type: w.type || 'gravity_well', x: w.x, y: w.y,
                    radiusInner: w.radiusInner, radiusOuter: w.radiusOuter,
                    mass: w.mass || 0.08, active: w.active,
                    telegraphTimer: w.telegraphTimer, pulse: w.pulse, radius: w.radius
                })),
                voidCacheActive, voidCacheTimer
            };
        }

        // Deserialize saved run state and restore game
        function deserializeRun(data) {
            // Uniform scaling if resolution changed between save and resume
            const savedW = data.canvasWidth || canvas.width;
            const savedH = data.canvasHeight || canvas.height;
            const savedScale = Math.min(savedW, savedH) / 720;
            const newScale = Math.min(canvas.width, canvas.height) / 720;
            const physicsScale = newScale / savedScale;

            score = data.score;
            lives = data.lives;
            level = data.level;
            runProgressionIndex = data.progressionIndex ?? 0;
            runStarBits = data.runStarBits ?? 0;
            levelTransitionTimer = data.levelTransitionTimer ?? 0;
            heat = data.heat;
            overheating = data.overheating;
            overheatTimer = data.overheatTimer;
            shootCooldown = data.shootCooldown ?? 0;
            overdrive = data.overdrive ?? false;
            combo = data.combo ?? 0;
            comboTimer = data.comboTimer ?? 0;
            shieldTimer = data.shieldTimer ?? SHIELD_DECAY_TIME;

            ship.x = data.ship.x * physicsScale;
            ship.y = data.ship.y * physicsScale;
            ship.angle = data.ship.angle;
            ship.velocity = { x: data.ship.velocity.x * physicsScale, y: data.ship.velocity.y * physicsScale };
            ship.invulnerable = data.ship.invulnerable;
            ship.invulnerableTimer = data.ship.invulnerableTimer;
            ship.blinkOn = data.ship.blinkOn ?? true;
            ship.blinkTimer = data.ship.blinkTimer ?? 0;

            // Recompute derived ship properties from modifier + upgrades
            const thrustBonus = activeProfile ? activeProfile.upgrades.thrustPower * 0.02 : 0;
            if (data.modifierId === 'tiny_ship') {
                ship.radius = sc(7);
                ship.thrust = (0.04 + thrustBonus) * physicsScale;
            } else {
                ship.radius = sc(15);
                ship.thrust = (0.06 + thrustBonus) * physicsScale;
            }
            ship.friction = getActiveBiome().friction || 0.99;
            ship.rotSpeed = 0.07 * (getActiveBiome().rotMult || 1);
            ship.momentumBoost = getActiveBiome().momentumBoost || 0;

            // Restore modifier
            currentModifier = MODIFIERS.find(m => m.id === data.modifierId) || MODIFIERS[0];

            // Restore active powerups
            for (const id in activePowerups) activePowerups[id] = 0;
            if (data.activePowerups) {
                for (const id in data.activePowerups) {
                    if (id in activePowerups) activePowerups[id] = data.activePowerups[id];
                }
            }

            // Restore asteroids (regenerate shapes)
            asteroids = (data.asteroids || []).map(a => {
                const colorObj = ASTEROID_COLORS.find(c => c.id === a.colorId) || ASTEROID_COLORS[0];
                const vertices = Math.floor(Math.random() * 5) + 7;
                const shape = [];
                for (let i = 0; i < vertices; i++) {
                    const angle = (i / vertices) * Math.PI * 2;
                    const radius = 0.8 + Math.random() * 0.4;
                    shape.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
                }
                const isLure = a.isGoldenLure === true;
                return {
                    x: a.x * physicsScale, y: a.y * physicsScale,
                    velocity: { x: a.velocity.x * physicsScale, y: a.velocity.y * physicsScale },
                    rotation: a.rotation, rotSpeed: a.rotSpeed,
                    size: a.size, radius: isLure ? sc(15 * GOLDEN_LURE.radiusMult) : sc(a.size * 15),
                    shape, color: isLure ? GOLDEN_LURE : colorObj,
                    hp: a.hp, maxHp: a.maxHp,
                    erraticTimer: a.erraticTimer ?? 0,
                    isGoldenLure: isLure,
                    scoreMult: a.scoreMult, basePoints: a.basePoints,
                    trailTimer: a.trailTimer ?? 0, lurePulse: a.lurePulse ?? 0,
                    burnTimer: 0
                };
            });

            // Restore bullets
            bullets = (data.bullets || []).map(b => ({
                x: b.x * physicsScale, y: b.y * physicsScale,
                velocity: { x: b.velocity.x * physicsScale, y: b.velocity.y * physicsScale },
                life: b.life, explosive: b.explosive
            }));

            // Restore ground powerups
            powerups = (data.powerups || []).map(p => {
                const typeObj = POWERUP_TYPES.find(t => t.id === p.type) || POWERUP_TYPES[0];
                return {
                    x: p.x * physicsScale, y: p.y * physicsScale,
                    velocity: { x: p.velocity.x * physicsScale, y: p.velocity.y * physicsScale },
                    type: typeObj, radius: sc(12),
                    pulse: p.pulse, life: p.life
                };
            });

            // Restore ground star bits
            starBits = (data.starBits || []).map(s => ({
                x: s.x * physicsScale, y: s.y * physicsScale,
                velocity: { x: s.velocity.x * physicsScale, y: s.velocity.y * physicsScale },
                amount: s.amount, radius: sc(6),
                pulse: s.pulse, life: s.life
            }));

            // Restore enemies
            enemies = (data.enemies || []).map(e => ({
                type: e.type, x: e.x * physicsScale, y: e.y * physicsScale,
                velocity: { x: e.velocity.x * physicsScale, y: e.velocity.y * physicsScale },
                radius: e.radius, hp: e.hp, maxHp: e.maxHp,
                rotation: e.rotation || 0, fireTimer: e.fireTimer || 0,
                pulse: e.pulse || 0, armTimer: e.armTimer || 0,
                color: e.color, basePoints: e.basePoints, scoreMult: e.scoreMult, starBits: e.starBits
            }));

            // Restore enemy bullets
            enemyBullets = (data.enemyBullets || []).map(b => ({
                x: b.x * physicsScale, y: b.y * physicsScale,
                velocity: { x: b.velocity.x * physicsScale, y: b.velocity.y * physicsScale },
                life: b.life, radius: b.radius
            }));

            // Restore gravity wells / void caches
            gravityWells = (data.gravityWells || []).map(w => ({
                type: w.type || 'gravity_well', x: w.x * physicsScale, y: w.y * physicsScale,
                radiusInner: w.radiusInner, radiusOuter: w.radiusOuter,
                mass: w.mass || 0.08, active: w.active,
                telegraphTimer: w.telegraphTimer, pulse: w.pulse, radius: w.radius
            }));
            voidCacheActive = data.voidCacheActive || false;
            voidCacheTimer = data.voidCacheTimer || 0;

            particles = [];

            initAudio();
            resumeAudio();
            startMusic();
            gameState = 'playing';
            updateUI();
        }

        // Spawn asteroids
        function spawnAsteroids() {
            let count = getLevelAsteroidCount();
            if (currentModifier.id === 'bullet_storm') count *= 2;
            const safeZone = getLevelSafeZone();
            for (let i = 0; i < count; i++) {
                let x, y;
                do {
                    x = Math.random() * canvas.width;
                    y = Math.random() * canvas.height;
                } while (Math.hypot(x - ship.x, y - ship.y) < safeZone);
                asteroids.push(createAsteroid(x, y, 3));
            }
            // Golden Lure: 3% base, +0.1% per level, capped at 5%
            const lureChance = Math.min(0.05, 0.03 + (getLevelCap() - 1) * 0.001);
            if (Math.random() < lureChance) {
                asteroids.push(createGoldenLure());
            }
            // Spawn biome enemies
            spawnEnemies();
            // Spawn special objects (gravity wells / void caches)
            // Guaranteed 2 out of every 3 levels (starting level 3), plus random chance
            const biome = getActiveBiome();
            if (biome.specialObject) {
                const guaranteed = level >= 3 && (level % 3 === 0 || level % 3 === 1);
                const randomChance = Math.random() < biome.specialChance;
                if (guaranteed || randomChance) {
                    if (biome.specialObject === 'gravity_well') {
                        gravityWells.push(createGravityWell());
                    } else if (biome.specialObject === 'void_cache') {
                        const vc = createVoidCache();
                        vc.type = 'void_cache';
                        gravityWells.push(vc);
                    }
                }
            }
        }

        // Update UI
        // ============================================================================
