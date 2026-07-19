        // SECTION 8: ENTITY FACTORY — Create asteroids, enemies, gravity wells, particles
        // ============================================================================

        function createAsteroid(x, y, size, colorObj) {
            const vertices = Math.floor(Math.random() * 5) + 7;
            const shape = [];
            for (let i = 0; i < vertices; i++) {
                const angle = (i / vertices) * Math.PI * 2;
                const radius = 0.8 + Math.random() * 0.4;
                shape.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
            }
            // Pick color if not provided (using level-based weights)
            if (!colorObj) {
                const weights = getLevelColorWeights();
                const total = getLevelWeightTotal();
                let roll = Math.random() * total;
                for (const c of weights) {
                    roll -= c.weight;
                    if (roll <= 0) { colorObj = c; break; }
                }
                if (!colorObj) colorObj = ASTEROID_COLORS[0];
            }
            const levelSpeed = getLevelSpeedMult();
            return {
                x, y,
                velocity: {
                    x: (Math.random() - 0.5) * 2 * colorObj.speedMult * levelSpeed,
                    y: (Math.random() - 0.5) * 2 * colorObj.speedMult * levelSpeed
                },
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.02,
                size,
                radius: sc(size * 15),
                shape,
                color: colorObj,
                hp: colorObj.health + getLevelHealthBonus(),
                maxHp: colorObj.health + getLevelHealthBonus(),
                erraticTimer: 0,
                burnTimer: 0
            };
        }

        // Create Golden Lure asteroid (spawns at screen edges)
        function createGoldenLure() {
            const edge = Math.floor(Math.random() * 4);
            const margin = sc(60);
            let x, y;
            if (edge === 0) { x = Math.random() * canvas.width; y = -margin; }
            else if (edge === 1) { x = canvas.width + margin; y = Math.random() * canvas.height; }
            else if (edge === 2) { x = Math.random() * canvas.width; y = canvas.height + margin; }
            else { x = -margin; y = Math.random() * canvas.height; }
            const levelSpeed = getLevelSpeedMult();
            const speed = 2 * GOLDEN_LURE.speedMult * levelSpeed;
            const dx = ship.x - x;
            const dy = ship.y - y;
            const angleToShip = Math.atan2(dy, dx);
            const tangential = (Math.random() - 0.5) * 1.5;
            const vx = Math.cos(angleToShip) * speed * 0.6 + Math.cos(angleToShip + Math.PI / 2) * tangential;
            const vy = Math.sin(angleToShip) * speed * 0.6 + Math.sin(angleToShip + Math.PI / 2) * tangential;
            const vertices = Math.floor(Math.random() * 5) + 7;
            const shape = [];
            for (let i = 0; i < vertices; i++) {
                const angle = (i / vertices) * Math.PI * 2;
                const r = 0.8 + Math.random() * 0.4;
                shape.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
            }
            return {
                x, y,
                velocity: { x: vx, y: vy },
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.04,
                size: 1,
                radius: sc(15 * GOLDEN_LURE.radiusMult),
                shape,
                color: GOLDEN_LURE,
                hp: GOLDEN_LURE.health + getLevelHealthBonus(),
                maxHp: GOLDEN_LURE.health + getLevelHealthBonus(),
                erraticTimer: 0,
                scoreMult: GOLDEN_LURE.scoreMult,
                basePoints: GOLDEN_LURE.basePoints,
                isGoldenLure: true,
                trailTimer: 0,
                lurePulse: 0,
                burnTimer: 0
            };
        }

        // Create enemy functions
        function createDriftMine(x, y) {
            return {
                type: 'drift_mine', x, y,
                velocity: { x: (Math.random() - 0.5) * 0.8, y: (Math.random() - 0.5) * 0.8 },
                radius: sc(12), hp: 1, maxHp: 1,
                pulse: 0, active: true, armTimer: 60,
                color: '#ff4444', basePoints: 50, scoreMult: 1, starBits: 2
            };
        }
        function createComet(x, y, vx, vy) {
            return {
                type: 'comet', x, y,
                velocity: { x: vx, y: vy },
                radius: sc(10), hp: 1, maxHp: 1,
                color: '#88ddff', basePoints: 30, scoreMult: 1, starBits: 6
            };
        }
        function createTurret(x, y) {
            return {
                type: 'turret', x, y,
                velocity: { x: 0, y: 0 },
                radius: sc(18), hp: 3, maxHp: 3,
                rotation: 0, fireTimer: 180,
                color: '#ffaa00', basePoints: 100, scoreMult: 1, starBits: 4
            };
        }
        function createSwarmer(x, y) {
            return {
                type: 'swarmer', x, y,
                velocity: { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 },
                radius: sc(8), hp: 1, maxHp: 1,
                color: '#66cc66', basePoints: 20, scoreMult: 1, starBits: 1
            };
        }
        function createEnemyBullet(x, y, vx, vy) {
            return { x, y, velocity: { x: vx, y: vy }, life: 120, radius: sc(4) };
        }
        function spawnEnemies() {
            const biome = getActiveBiome();
            if (!biome.enemyType) return;
            // Grace period: first 2 levels have weaker enemies
            const count = level <= 2 ? 1 : (biome.enemyType === 'swarmer' ? 4 : 3);
            for (let i = 0; i < count; i++) {
                let x, y;
                do {
                    x = Math.random() * canvas.width;
                    y = Math.random() * canvas.height;
                } while (Math.hypot(x - ship.x, y - ship.y) < getLevelSafeZone() * 1.5);
                if (biome.enemyType === 'drift_mine') enemies.push(createDriftMine(x, y));
                else if (biome.enemyType === 'comet') {
                    const edge = Math.floor(Math.random() * 4);
                    if (edge === 0) { x = -sc(20); y = Math.random() * canvas.height; }
                    else if (edge === 1) { x = canvas.width + sc(20); y = Math.random() * canvas.height; }
                    else if (edge === 2) { x = Math.random() * canvas.width; y = -sc(20); }
                    else { x = Math.random() * canvas.width; y = canvas.height + sc(20); }
                    const angle = Math.random() * Math.PI * 2;
                    const speed = (3 + Math.random() * 2) * 1.2;
                    enemies.push(createComet(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed));
                }
                else if (biome.enemyType === 'turret') enemies.push(createTurret(x, y));
                else if (biome.enemyType === 'swarmer') enemies.push(createSwarmer(x, y));
            }
        }

        // Gravity Well
        function createGravityWell() {
            let x, y;
            do {
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
            } while (Math.hypot(x - ship.x, y - ship.y) < sc(120));
            return {
                x, y, radiusInner: sc(40), radiusOuter: sc(200),
                mass: 0.08, active: false, telegraphTimer: 120, pulse: 0
            };
        }
        function updateGravityWells(dt) {
            gravityWells.forEach(w => {
                if (!w.active) {
                    w.telegraphTimer -= dt;
                    if (w.telegraphTimer <= 0) w.active = true;
                    return;
                }
                w.pulse += 0.05 * dt;
                // Pull ship
                const sdx = w.x - ship.x;
                const sdy = w.y - ship.y;
                const sdist = Math.hypot(sdx, sdy);
                if (sdist < w.radiusOuter && sdist > 1) {
                    const force = w.mass / (sdist * sdist) * 50;
                    ship.velocity.x += (sdx / sdist) * force * dt;
                    ship.velocity.y += (sdy / sdist) * force * dt;
                }
                // Pull asteroids
                asteroids.forEach(a => {
                    const dx = w.x - a.x;
                    const dy = w.y - a.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < w.radiusOuter && dist > 1) {
                        const force = w.mass / (dist * dist) * 30;
                        a.velocity.x += (dx / dist) * force * dt;
                        a.velocity.y += (dy / dist) * force * dt;
                    }
                    // Destroy asteroids in event horizon
                    if (dist < w.radiusInner) {
                        a.hp = 0;
                    }
                });
                // Destroy enemies in event horizon
                enemies.forEach(e => {
                    const dx = w.x - e.x;
                    const dy = w.y - e.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < w.radiusInner) e.hp = 0;
                });
            });
            // Process destroyed asteroids (only once, not per gravity well)
            for (let j = asteroids.length - 1; j >= 0; j--) {
                if (asteroids[j].hp <= 0) {
                    spawnStarBits(asteroids[j].x, asteroids[j].y, asteroids[j].color || { starBits: 1 });
                    destroyAsteroid(asteroids[j], j);
                }
            }
            // Process destroyed enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (enemies[j].hp <= 0) {
                    spawnStarBits(enemies[j].x, enemies[j].y, { starBits: 2 });
                    enemies.splice(j, 1);
                }
            }
        }
        function drawGravityWells() {
            gravityWells.forEach(w => {
                const alpha = w.active ? 0.3 + Math.sin(w.pulse) * 0.1 : (1 - w.telegraphTimer / 120) * 0.3;
                // Outer field
                ctx.strokeStyle = `rgba(120, 0, 255, ${alpha})`;
                ctx.lineWidth = sc(1);
                ctx.beginPath();
                ctx.arc(w.x, w.y, w.radiusOuter, 0, Math.PI * 2);
                ctx.stroke();
                // Inner horizon
                ctx.strokeStyle = `rgba(200, 0, 255, ${alpha * 1.5})`;
                ctx.lineWidth = sc(2);
                ctx.beginPath();
                ctx.arc(w.x, w.y, w.radiusInner, 0, Math.PI * 2);
                ctx.stroke();
                if (w.active) {
                    ctx.fillStyle = `rgba(150, 0, 255, ${alpha * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(w.x, w.y, w.radiusInner, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }

        // Void Cache
        function createVoidCache() {
            let x, y;
            do {
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
            } while (Math.hypot(x - ship.x, y - ship.y) < sc(100));
            return { x, y, radius: sc(20), pulse: 0, active: false, telegraphTimer: 120 };
        }
        function updateVoidCaches(dt) {
            gravityWells.forEach(w => {
                if (w.type !== 'void_cache') return;
                if (!w.active) {
                    w.telegraphTimer -= dt;
                    if (w.telegraphTimer <= 0) w.active = true;
                }
            });
            // Check if ship enters void cache portal
            for (let i = gravityWells.length - 1; i >= 0; i--) {
                const w = gravityWells[i];
                if (w.active && w.type === 'void_cache') {
                    const dist = Math.hypot(ship.x - w.x, ship.y - w.y);
                    if (dist < w.radius + ship.radius && !voidCacheActive) {
                        // Enter void cache
                        voidCacheActive = true;
                        voidCacheTimer = 900; // 15 seconds
                        voidCacheReturnState = { ...ship, velocity: { x: ship.velocity.x, y: ship.velocity.y }, score, level, asteroids: [...asteroids], enemies: [...enemies] };
                        // Clear arena and spawn rewards
                        asteroids = [];
                        enemies = [];
                        for (let k = 0; k < 15; k++) {
                            starBits.push(createStarBit(
                                Math.random() * canvas.width,
                                Math.random() * canvas.height,
                                3
                            ));
                        }
                        rollPowerup(Math.random() * canvas.width, Math.random() * canvas.height, 2);
                        gravityWells.splice(i, 1);
                        break;
                    }
                }
            }
            // Update void cache timer
            if (voidCacheActive) {
                voidCacheTimer -= dt;
                if (voidCacheTimer <= 0) {
                    // Exit void cache
                    voidCacheActive = false;
                    if (voidCacheReturnState) {
                        ship.x = voidCacheReturnState.x;
                        ship.y = voidCacheReturnState.y;
                        ship.velocity = { x: voidCacheReturnState.velocity.x, y: voidCacheReturnState.velocity.y };
                        ship.angle = voidCacheReturnState.angle;
                        score = voidCacheReturnState.score;
                        level = voidCacheReturnState.level;
                        asteroids = voidCacheReturnState.asteroids;
                        enemies = voidCacheReturnState.enemies;
                        voidCacheReturnState = null;
                    }
                }
            }
        }
        function drawVoidCaches() {
            gravityWells.forEach(w => {
                if (w.type !== 'void_cache') return;
                const alpha = w.active ? 0.5 + Math.sin(w.pulse) * 0.2 : (1 - w.telegraphTimer / 120) * 0.5;
                ctx.save();
                ctx.translate(w.x, w.y);
                ctx.rotate(w.pulse * 0.5);
                // Portal ring
                ctx.strokeStyle = `rgba(180, 0, 255, ${alpha})`;
                ctx.lineWidth = sc(3);
                ctx.beginPath();
                ctx.arc(0, 0, w.radius, 0, Math.PI * 2);
                ctx.stroke();
                // Inner swirl
                ctx.strokeStyle = `rgba(220, 100, 255, ${alpha * 0.6})`;
                ctx.lineWidth = sc(1.5);
                for (let i = 0; i < 3; i++) {
                    const a = (i / 3) * Math.PI * 2 + w.pulse;
                    ctx.beginPath();
                    ctx.arc(0, 0, w.radius * 0.6, a, a + Math.PI * 0.8);
                    ctx.stroke();
                }
                ctx.restore();
            });
        }

        // Create particle
        function createParticle(x, y, color, speed) {
            return {
                x, y,
                velocity: {
                    x: (Math.random() - 0.5) * speed,
                    y: (Math.random() - 0.5) * speed
                },
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                color,
                size: sc(Math.random() * 2 + 1)
            };
        }
        const MAX_PARTICLES = 300;

        // Create powerup
        function createPowerup(x, y, type) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.3 + Math.random() * 0.3;
            return {
                x, y,
                velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                type: type,
                radius: sc(12),
                pulse: 0,
                life: POWERUP_LIFETIME
            };
        }

        // Roll for powerup drop
        function rollPowerup(x, y, asteroidSize) {
            const biome = getActiveBiome();
            const luckBonus = (activeProfile ? activeProfile.upgrades.powerupLuck * 0.05 : 0) + (biome.powerupLuckBonus || 0);
            if (Math.random() > POWERUP_DROP_CHANCE + luckBonus) return;
            const typeIndex = Math.floor(Math.random() * POWERUP_TYPES.length);
            powerups.push(createPowerup(x, y, POWERUP_TYPES[typeIndex]));
        }

        // Create star bit
        function createStarBit(x, y, amount) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.3;
            return {
                x, y,
                velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
                amount: amount,
                radius: sc(6),
                pulse: Math.random() * Math.PI * 2,
                life: 1800 // 30 seconds
            };
        }

        // Spawn star bits from small asteroid
        function spawnStarBits(x, y, colorObj) {
            const count = colorObj.starBits;
            for (let i = 0; i < count; i++) {
                starBits.push(createStarBit(
                    x + (Math.random() - 0.5) * sc(20),
                    y + (Math.random() - 0.5) * sc(20),
                    1
                ));
            }
        }

        // Update star bits
        function updateStarBits(dt) {
            starBits = starBits.filter(sb => {
                sb.x += sb.velocity.x * dt;
                sb.y += sb.velocity.y * dt;
                // Star bit comet trail
                if (getCosmeticId('starbits') === 'starbit_comet') {
                    if (Math.random() > 0.7) {
                        particles.push(createParticle(sb.x, sb.y, '#ffd700', 0.2));
                    }
                }
                sb.pulse += 0.1 * dt;
                sb.life -= dt;
                if (sb.x < -sc(10)) sb.x = canvas.width + sc(10);
                if (sb.x > canvas.width + sc(10)) sb.x = -sc(10);
                if (sb.y < -sc(10)) sb.y = canvas.height + sc(10);
                if (sb.y > canvas.height + sc(10)) sb.y = -sc(10);
                return sb.life > 0;
            });
        }

        // Draw star bits
        function drawStarBits() {
            const starbitShape = getCosmeticShape('starbits');
            starBits.forEach(sb => {
                const alpha = sb.life < 120 ? sb.life / 120 : 1;
                const pulseScale = 1 + Math.sin(sb.pulse) * 0.2;
                const r = sb.radius * pulseScale;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(sb.x, sb.y);
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = sc(8);
                ctx.beginPath();
                if (starbitShape === 'heart') {
                    ctx.moveTo(0, r * 0.3);
                    ctx.bezierCurveTo(-r, -r * 0.3, -r * 0.5, -r, 0, -r * 0.5);
                    ctx.bezierCurveTo(r * 0.5, -r, r, -r * 0.3, 0, r * 0.3);
                } else if (starbitShape === 'diamond') {
                    ctx.moveTo(0, -r);
                    ctx.lineTo(r * 0.6, 0);
                    ctx.lineTo(0, r);
                    ctx.lineTo(-r * 0.6, 0);
                    ctx.closePath();
                } else if (starbitShape === 'moon') {
                    ctx.arc(0, 0, r, -Math.PI * 0.8, Math.PI * 0.8);
                    ctx.arc(r * 0.3, 0, r * 0.6, Math.PI * 0.8, -Math.PI * 0.8, true);
                } else if (starbitShape === 'crystal') {
                    ctx.moveTo(0, -r);
                    ctx.lineTo(r * 0.4, -r * 0.2);
                    ctx.lineTo(r * 0.3, r * 0.6);
                    ctx.lineTo(-r * 0.3, r * 0.6);
                    ctx.lineTo(-r * 0.4, -r * 0.2);
                    ctx.closePath();
                } else if (starbitShape === 'cube') {
                    const t = Date.now() / 500;
                    const cos = Math.cos(t), sin = Math.sin(t);
                    ctx.moveTo(r * cos, -r * 0.5);
                    ctx.lineTo(r * 0.5 * cos + r * 0.3 * sin, -r * 0.5 + r * 0.3);
                    ctx.lineTo(r * 0.5 * cos + r * 0.3 * sin, r * 0.3);
                    ctx.lineTo(r * cos, r * 0.5 + r * 0.3);
                    ctx.lineTo(-r * 0.3 * cos + r * 0.3 * sin, r * 0.5 + r * 0.3);
                    ctx.lineTo(-r * 0.3 * cos + r * 0.3 * sin, -r * 0.5 + r * 0.3);
                    ctx.closePath();
                } else if (starbitShape === 'comet') {
                    // Glowing bit with tail
                    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
                    ctx.moveTo(r * 0.6, 0);
                    ctx.lineTo(r * 1.5, -r * 0.2);
                    ctx.lineTo(r * 1.5, r * 0.2);
                    ctx.closePath();
                } else if (starbitShape === 'prismatic') {
                    // Color-changing star
                    const hue = (Date.now() / 10 + sb.x * 10 + sb.y * 10) % 360;
                    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
                    ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                        const rad = i % 2 === 0 ? r : r * 0.4;
                        ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
                    }
                    ctx.closePath();
                } else {
                    // Default: 4-pointed star
                    for (let i = 0; i < 8; i++) {
                        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                        const rad = i % 2 === 0 ? r : r * 0.4;
                        const px = Math.cos(angle) * rad;
                        const py = Math.sin(angle) * rad;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            });
        }

        // Get magnet radius
        function getMagnetRadius() {
            let radius = sc(70) * (getActiveBiome().magnetMult || 1);
            if (activeProfile && activeProfile.upgrades.magnetRange) {
                radius += activeProfile.upgrades.magnetRange * sc(20);
            }
            if (activePowerups.magnetboost > 0) radius *= 2;
            if (activePowerups.starmagnet > 0) radius = 9999;
            return radius;
        }

        // Update magnet pull
        function updateMagnet(dt) {
            const radius = getMagnetRadius();
            const items = [...powerups, ...starBits];
            items.forEach(item => {
                const dx = ship.x - item.x;
                const dy = ship.y - item.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius && dist > 5) {
                    const pull = (1 - dist / radius) * MAGNET_PULL_STRENGTH * dt;
                    item.velocity.x += (dx / dist) * pull;
                    item.velocity.y += (dy / dist) * pull;
                }
            });
        }

        // Update powerups
        function updatePowerups(dt) {
            powerups = powerups.filter(p => {
                p.x += p.velocity.x * dt;
                p.y += p.velocity.y * dt;
                p.pulse += 0.08 * dt;
                p.life -= dt;
                // Wrap
                if (p.x < -sc(20)) p.x = canvas.width + sc(20);
                if (p.x > canvas.width + sc(20)) p.x = -sc(20);
                if (p.y < -sc(20)) p.y = canvas.height + sc(20);
                if (p.y > canvas.height + sc(20)) p.y = -sc(20);
                return p.life > 0;
            });
        }

        // Draw powerups
        function drawPowerups() {
            const powerupShape = getCosmeticShape('powerups');
            powerups.forEach(p => {
                const alpha = p.life < 120 ? p.life / 120 : 1;
                const pulseScale = 1 + Math.sin(p.pulse) * 0.15;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(p.x, p.y);
                ctx.shadowColor = p.type.color;
                ctx.shadowBlur = sc(12);
                const r = p.radius * pulseScale;
                ctx.beginPath();
                if (powerupShape === 'orb' || powerupShape === 'core') {
                    ctx.arc(0, 0, r, 0, Math.PI * 2);
                } else if (powerupShape === 'polygon') {
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    }
                    ctx.closePath();
                } else if (powerupShape === 'ring') {
                    ctx.arc(0, 0, r, 0, Math.PI * 2);
                    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2, true);
                } else if (powerupShape === 'runestone') {
                    // Rune-etched slab
                    ctx.rect(-r * 0.5, -r * 0.7, r, r * 1.4);
                    ctx.moveTo(-r * 0.3, -r * 0.4);
                    ctx.lineTo(r * 0.3, -r * 0.4);
                    ctx.moveTo(0, -r * 0.4);
                    ctx.lineTo(0, r * 0.4);
                } else if (powerupShape === 'card') {
                    // Rectangular card
                    ctx.rect(-r * 0.6, -r * 0.8, r * 1.2, r * 1.6);
                } else if (powerupShape === 'egg') {
                    // Egg shape
                    ctx.ellipse(0, 0, r * 0.6, r, 0, 0, Math.PI * 2);
                } else if (powerupShape === 'relic') {
                    // Ornate frame
                    ctx.rect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
                    ctx.rect(-r * 0.5, -r * 0.5, r, r);
                } else {
                    // Default: diamond
                    ctx.moveTo(0, -r);
                    ctx.lineTo(r * 0.7, 0);
                    ctx.lineTo(0, r);
                    ctx.lineTo(-r * 0.7, 0);
                    ctx.closePath();
                }
                ctx.fillStyle = p.type.color;
                ctx.fill();
                ctx.shadowBlur = 0;
                // Inner label
                ctx.fillStyle = '#000';
                ctx.font = `bold ${sc(9)}px Courier New`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const labels = { shield: 'S', chainlightning: '⚡', speed: '>', explosive: '!', slowtime: 'T', scoremult: '2x', magnetboost: 'U', starmagnet: '\u2605', backshot: '\u2194' };
                ctx.fillText(labels[p.type.id], 0, 0);
                ctx.restore();
            });
        }

        // Update active powerup timers
        // Shield system
        let shieldTimer = 0;
        const SHIELD_DECAY_TIME = 1200; // 20 seconds at 60fps

        function updateActivePowerups(dt) {
            for (const id in activePowerups) {
                if (id === 'shield') continue; // shield handled separately
                if (activePowerups[id] > 0) {
                    activePowerups[id] -= dt;
                    if (activePowerups[id] <= 0) {
                        activePowerups[id] = 0;
                    }
                }
            }
            // Shield decay
            if (activePowerups.shield > 0) {
                shieldTimer -= dt;
                if (shieldTimer <= 0) {
                    activePowerups.shield--;
                    shieldTimer = SHIELD_DECAY_TIME;
                }
            }
        }

        // Render powerup HUD
        function renderPowerupHud() {
            let html = '';
            // Star bits display
            html += `<span class="pu-item" style="border-color:#ffd700;color:#ffd700">\u2605 ${runStarBits}</span>`;
            POWERUP_TYPES.forEach(p => {
                if (activePowerups[p.id] > 0) {
                    if (p.id === 'shield') {
                        html += `<span class="pu-item" style="border-color:${p.color};color:${p.color}">${p.label} x${activePowerups.shield}</span>`;
                    } else if (p.id === 'starmagnet') {
                        html += `<span class="pu-item" style="border-color:${p.color};color:${p.color}">${p.label}</span>`;
                    } else {
                        const secs = Math.ceil(activePowerups[p.id] / 60);
                        html += `<span class="pu-item" style="border-color:${p.color};color:${p.color}">${p.label} ${secs}s</span>`;
                    }
                }
            });
            powerupHudEl.innerHTML = html;
            powerupHudEl.style.display = html ? 'block' : 'none';
        }

        // Start game
        // ============================================================================
