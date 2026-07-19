        // SECTION 11: UPDATE FUNCTIONS — Ship, bullets, heat, asteroids, enemies, particles
        // ============================================================================

        // Update ship
        function updateShip(dt) {
            const thrustMult = activePowerups.speed > 0 ? 1.5 : 1;
            // Direct rotation (snappy, no angular velocity)
            if (keys['ArrowLeft'] || keys['KeyA']) {
                ship.angle -= ship.rotSpeed * dt;
            }
            if (keys['ArrowRight'] || keys['KeyD']) {
                ship.angle += ship.rotSpeed * dt;
            }

            // Thrust with momentum boost
            if (keys['ArrowUp'] || keys['KeyW']) {
                const speed = Math.hypot(ship.velocity.x, ship.velocity.y);
                const maxSpeed = ship.thrust * 30;
                const threshold = getActiveBiome().momentumThreshold ?? 0.5;
                const boost = (speed > maxSpeed * threshold && ship.momentumBoost > 0) ? 1 + ship.momentumBoost : 1;
                ship.velocity.x += Math.cos(ship.angle) * ship.thrust * thrustMult * boost * dt;
                ship.velocity.y += Math.sin(ship.angle) * ship.thrust * thrustMult * boost * dt;
                // Thrust particles
                if (Math.random() > 0.5) {
                    const thrusterColor = getCosmeticColor('thruster', '#ff6600');
                    const thrusterId = getCosmeticId('thruster');
                    const baseX = ship.x - Math.cos(ship.angle) * sc(15);
                    const baseY = ship.y - Math.sin(ship.angle) * sc(15);
                    if (thrusterId === 'thruster_twin') {
                        // Two offset streams (perpendicular to ship)
                        const perpX = -Math.sin(ship.angle) * sc(4);
                        const perpY = Math.cos(ship.angle) * sc(4);
                        particles.push(createParticle(baseX + perpX, baseY + perpY, thrusterColor, 2));
                        particles.push(createParticle(baseX - perpX, baseY - perpY, thrusterColor, 2));
                    } else if (thrusterId === 'thruster_cryo') {
                        // Wider cyan mist
                        const p = createParticle(baseX, baseY, thrusterColor, 2.5);
                        p.size = sc(Math.random() * 3 + 2);
                        particles.push(p);
                    } else {
                        particles.push(createParticle(baseX, baseY, thrusterColor, 2));
                    }
                }
            }

            const frictionPower = ship.invulnerable ? 0.99 : ship.friction;
            ship.velocity.x *= Math.pow(frictionPower, dt);
            ship.velocity.y *= Math.pow(frictionPower, dt);
            ship.x += ship.velocity.x * dt;
            ship.y += ship.velocity.y * dt;

            // Wrap around screen
            if (ship.x < 0) ship.x = canvas.width;
            if (ship.x > canvas.width) ship.x = 0;
            if (ship.y < 0) ship.y = canvas.height;
            if (ship.y > canvas.height) ship.y = 0;

            // Invulnerability
            if (ship.invulnerable) {
                ship.invulnerableTimer -= dt;
                ship.blinkTimer += dt;
                if (Math.floor(ship.blinkTimer) % 10 === 0 && Math.floor(ship.blinkTimer - dt) % 10 !== 0) {
                    ship.blinkOn = !ship.blinkOn;
                }
                if (ship.invulnerableTimer <= 0) {
                    ship.invulnerable = false;
                    ship.blinkOn = true;
                }
            }
        }

        // Shoot
        function shoot() {
            playSfx('shoot');
            triggerMuzzleFlash();
            const lo = getActiveLoadout();
            const bx = ship.x + Math.cos(ship.angle) * sc(20);
            const by = ship.y + Math.sin(ship.angle) * sc(20);
            const bulletSpeedMult = activeProfile ? 1 + activeProfile.upgrades.bulletSpeed * 0.2 : 1;
            const speed = lo.bulletSpeed * bulletSpeedMult;
            const bvx = Math.cos(ship.angle) * sc(speed) + ship.velocity.x * 0.5;
            const bvy = Math.sin(ship.angle) * sc(speed) + ship.velocity.y * 0.5;
            const explosive = activePowerups.explosive > 0;
            const overdriveSpeedMult = overdrive ? 1.2 : 1;
            const isMissile = lo.type === 'missile';

            function spawnBullet(vx, vy, extra) {
                bullets.push({
                    x: bx, y: by,
                    velocity: { x: vx * overdriveSpeedMult, y: vy * overdriveSpeedMult },
                    life: 60, explosive,
                    pierceRemaining: lo.pierce,
                    isMissile,
                    aoeRadius: isMissile ? sc(40) : 0
                });
            }

            if (lo.type === 'spread') {
                // Spread Shot: 3 bullets at ±15°
                for (const angOff of [0, -lo.spread, +lo.spread]) {
                    const avx = Math.cos(ship.angle + angOff) * sc(speed) + ship.velocity.x * 0.5;
                    const avy = Math.sin(ship.angle + angOff) * sc(speed) + ship.velocity.y * 0.5;
                    spawnBullet(avx, avy);
                }
            } else {
                // Standard, Pierce, Missile
                spawnBullet(bvx, bvy);
            }

            // Back Shot powerup: fire a bullet backwards too
            if (activePowerups.backshot > 0) {
                if (lo.type === 'spread') {
                    for (const angOff of [0, -lo.spread, +lo.spread]) {
                        const avx = Math.cos(ship.angle + angOff + Math.PI) * sc(speed) + ship.velocity.x * 0.5;
                        const avy = Math.sin(ship.angle + angOff + Math.PI) * sc(speed) + ship.velocity.y * 0.5;
                        spawnBullet(avx, avy);
                    }
                } else {
                    spawnBullet(-bvx, -bvy);
                }
            }

            // Add heat
            const heatPerShot = 100 / getHeatLimit();
            heat = Math.min(100, heat + heatPerShot * lo.heatMult);
        }

        let shootCooldown = 0;
        function updateBullets(dt) {
            const lo = getActiveLoadout();
            if (keys['Space'] && shootCooldown <= 0 && gameState === 'playing' && !overheating) {
                shoot();
                const fireRateBonus = activeProfile ? activeProfile.upgrades.fireRate : 0;
                const overdriveFireBonus = overdrive ? 0.7 : 1;
                shootCooldown = Math.max(3, (lo.cooldown - fireRateBonus) * overdriveFireBonus);
            }
            shootCooldown -= dt;

            bullets = bullets.filter(b => {
                // Homing missiles: turn toward nearest asteroid in forward cone
                if (b.isMissile && asteroids.length > 0) {
                    const speed = Math.hypot(b.velocity.x, b.velocity.y);
                    let bestDot = -1;
                    let bestA = null;
                    const bAngle = Math.atan2(b.velocity.y, b.velocity.x);
                    const cosHalf = Math.cos(Math.PI / 6); // 60° forward cone
                    for (const a of asteroids) {
                        const dx = a.x - b.x;
                        const dy = a.y - b.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist < sc(400)) {
                            const aAngle = Math.atan2(dy, dx);
                            const dot = Math.cos(aAngle - bAngle);
                            if (dot > cosHalf && dot > bestDot) {
                                bestDot = dot;
                                bestA = a;
                            }
                        }
                    }
                    if (bestA) {
                        const turnRate = sc(0.06);
                        const targetAngle = Math.atan2(bestA.y - b.y, bestA.x - b.x);
                        let diff = targetAngle - bAngle;
                        while (diff > Math.PI) diff -= 2 * Math.PI;
                        while (diff < -Math.PI) diff += 2 * Math.PI;
                        const clamped = Math.max(-turnRate, Math.min(turnRate, diff));
                        const newAngle = bAngle + clamped;
                        b.velocity.x = Math.cos(newAngle) * speed;
                        b.velocity.y = Math.sin(newAngle) * speed;
                    }
                    // Missile smoke trail
                    if (Math.floor(Math.random() * 8) === 0) {
                        particles.push(createParticle(b.x, b.y, '#ffaa00', 0.5));
                    }
                }

                b.x += b.velocity.x * dt;
                b.y += b.velocity.y * dt;
                // Bullet comet trail
                if (!b.isMissile && getCosmeticId('bullets') === 'bullet_comet') {
                    if (Math.random() > 0.5) {
                        const trailColor = getCosmeticColor('bullets', '#ffffff');
                        particles.push(createParticle(b.x, b.y, trailColor, 0.3));
                    }
                }
                b.life -= dt;
                if (b.x < 0) b.x = canvas.width;
                if (b.x > canvas.width) b.x = 0;
                if (b.y < 0) b.y = canvas.height;
                if (b.y > canvas.height) b.y = 0;
                return b.life > 0;
            });
        }

        function getHeatLimit() {
            const coolingLevel = activeProfile ? (activeProfile.upgrades.coolingSystem ?? 0) : 0;
            return BASE_HEAT_LIMIT + coolingLevel * 10;
        }

        function updateHeat(dt) {
            if (overheating) {
                overheatTimer -= dt;
                heat = Math.max(0, heat - 2 * dt);
                overdrive = false;
                if (overheatTimer <= 0) {
                    overheating = false;
                }
                return;
            }

            // Decay heat when not shooting
            if (!keys['Space']) {
                heat = Math.max(0, heat - HEAT_DECAY * dt);
            }

            // Overdrive: heat >= 50% = bonus damage and fire rate
            overdrive = heat >= 50;

            // Check overheat
            if (heat >= 100) {
                heat = 100;
                overheating = true;
                overheatTimer = OVERHEAT_COOLDOWN;
                overdrive = false;
                shootCooldown = Math.max(shootCooldown, OVERHEAT_COOLDOWN);
            }
        }

        // Update enemies
        function updateEnemies(dt) {
            const speedMult = activePowerups.slowtime > 0 ? 0.5 : (currentModifier.id === 'speed_demon' ? 1.5 : 1);
            enemies = enemies.filter((e, i) => {
                if (e.type === 'drift_mine') {
                    e.pulse += 0.1 * dt;
                    if (e.armTimer > 0) e.armTimer -= dt;
                    e.x += e.velocity.x * speedMult * dt;
                    e.y += e.velocity.y * speedMult * dt;
                    // Explode if ship gets too close and mine is armed
                    if (e.armTimer <= 0) {
                        const dist = Math.hypot(ship.x - e.x, ship.y - e.y);
                        if (dist < sc(50)) {
                            // Explosion: damage nearby asteroids AND mines (chain reaction)
                            for (let k = enemies.length - 1; k >= 0; k--) {
                                if (k === i) continue;
                                const other = enemies[k];
                                if (other.type === 'drift_mine' && other.armTimer <= 0) {
                                    const mdist = Math.hypot(other.x - e.x, other.y - e.y);
                                    if (mdist < sc(80)) {
                                        // Chain react: trigger mine explosion
                                        other.hp = 0;
                                    }
                                }
                            }
                            for (let k = asteroids.length - 1; k >= 0; k--) {
                                const ea = asteroids[k];
                                if (Math.hypot(ea.x - e.x, ea.y - e.y) < sc(80)) {
                                    ea.hp -= 2;
                                    if (ea.hp <= 0) destroyAsteroid(ea, k);
                                }
                            }
                            // Explosion VFX
                            for (let p = 0; p < 15; p++) particles.push(createParticle(e.x, e.y, '#ff4444', 4));
                            triggerExplosiveRing(e.x, e.y);
                            playSfx('explosion', { size: 'large' });
                            return false;
                        }
                    }
                    // Screen wrap
                    if (e.x < -sc(30)) e.x = canvas.width + sc(30);
                    if (e.x > canvas.width + sc(30)) e.x = -sc(30);
                    if (e.y < -sc(30)) e.y = canvas.height + sc(30);
                    if (e.y > canvas.height + sc(30)) e.y = -sc(30);
                } else if (e.type === 'comet') {
                    e.x += e.velocity.x * speedMult * dt;
                    e.y += e.velocity.y * speedMult * dt;
                    // Remove if off screen
                    if (e.x < -sc(100) || e.x > canvas.width + sc(100) ||
                        e.y < -sc(100) || e.y > canvas.height + sc(100)) return false;
                } else if (e.type === 'turret') {
                    e.rotation += 0.02 * dt;
                    e.fireTimer -= dt;
                    if (e.fireTimer <= 0 && asteroids.length > 0) {
                        // Fire at ship
                        const dx = ship.x - e.x;
                        const dy = ship.y - e.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist < sc(300)) {
                            const angle = Math.atan2(dy, dx);
                            enemyBullets.push(createEnemyBullet(e.x, e.y, Math.cos(angle) * 2, Math.sin(angle) * 2));
                        }
                        e.fireTimer = 180;
                    }
                } else if (e.type === 'swarmer') {
                    // Chase ship slowly
                    const dx = ship.x - e.x;
                    const dy = ship.y - e.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 1) {
                        e.velocity.x += (dx / dist) * 0.05 * dt;
                        e.velocity.y += (dy / dist) * 0.05 * dt;
                    }
                    // Clump behavior: attract to nearby swarmers
                    for (let k = 0; k < enemies.length; k++) {
                        if (k === i) continue;
                        const other = enemies[k];
                        if (other.type === 'swarmer') {
                            const sdx = other.x - e.x;
                            const sdy = other.y - e.y;
                            const sdist = Math.hypot(sdx, sdy);
                            if (sdist < sc(100) && sdist > 1) {
                                e.velocity.x += (sdx / sdist) * 0.02 * dt;
                                e.velocity.y += (sdy / sdist) * 0.02 * dt;
                            }
                        }
                    }
                    const maxSpeed = 1.5;
                    const spd = Math.hypot(e.velocity.x, e.velocity.y);
                    if (spd > maxSpeed) {
                        e.velocity.x *= maxSpeed / spd;
                        e.velocity.y *= maxSpeed / spd;
                    }
                    e.x += e.velocity.x * speedMult * dt;
                    e.y += e.velocity.y * speedMult * dt;
                    // Screen wrap
                    if (e.x < -sc(20)) e.x = canvas.width + sc(20);
                    if (e.x > canvas.width + sc(20)) e.x = -sc(20);
                    if (e.y < -sc(20)) e.y = canvas.height + sc(20);
                    if (e.y > canvas.height + sc(20)) e.y = -sc(20);
                }
                return e.hp > 0;
            });
            // Update enemy bullets
            enemyBullets = enemyBullets.filter(b => {
                b.x += b.velocity.x * dt;
                b.y += b.velocity.y * dt;
                b.life -= dt;
                return b.life > 0;
            });
        }

        // Draw enemies
        function drawEnemies() {
            enemies.forEach(e => {
                ctx.save();
                ctx.translate(e.x, e.y);
                if (e.type === 'drift_mine') {
                    const pulseScale = 1 + Math.sin(e.pulse) * 0.2;
                    ctx.strokeStyle = e.armTimer > 0 ? '#884444' : '#ff4444';
                    ctx.lineWidth = sc(2);
                    ctx.beginPath();
                    ctx.arc(0, 0, e.radius * pulseScale, 0, Math.PI * 2);
                    ctx.stroke();
                    if (e.armTimer <= 0) {
                        ctx.shadowColor = '#ff4444';
                        ctx.shadowBlur = sc(8);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                    // Cross
                    ctx.beginPath();
                    ctx.moveTo(-sc(4), 0); ctx.lineTo(sc(4), 0);
                    ctx.moveTo(0, -sc(4)); ctx.lineTo(0, sc(4));
                    ctx.stroke();
                } else if (e.type === 'comet') {
                    const angle = Math.atan2(e.velocity.y, e.velocity.x);
                    ctx.rotate(angle);
                    ctx.strokeStyle = '#88ddff';
                    ctx.lineWidth = sc(2);
                    ctx.beginPath();
                    ctx.moveTo(-sc(12), 0);
                    ctx.lineTo(sc(8), -sc(4));
                    ctx.lineTo(sc(8), sc(4));
                    ctx.closePath();
                    ctx.stroke();
                    // Tail
                    ctx.strokeStyle = 'rgba(136, 221, 255, 0.4)';
                    ctx.lineWidth = sc(3);
                    ctx.beginPath();
                    ctx.moveTo(-sc(12), 0);
                    ctx.lineTo(-sc(25), 0);
                    ctx.stroke();
                } else if (e.type === 'turret') {
                    ctx.rotate(e.rotation);
                    ctx.strokeStyle = e.flash ? '#ffffff' : '#ffaa00';
                    ctx.lineWidth = sc(2);
                    // Hexagon body
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const a = (i / 6) * Math.PI * 2;
                        const px = Math.cos(a) * e.radius;
                        const py = Math.sin(a) * e.radius;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    // Barrel
                    ctx.strokeStyle = '#ff6600';
                    ctx.lineWidth = sc(3);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(e.radius + sc(6), 0);
                    ctx.stroke();
                    if (e.flash) e.flash = false;
                } else if (e.type === 'swarmer') {
                    ctx.strokeStyle = e.flash ? '#ffffff' : '#66cc66';
                    ctx.lineWidth = sc(1.5);
                    ctx.beginPath();
                    ctx.moveTo(0, -e.radius);
                    ctx.lineTo(e.radius, e.radius);
                    ctx.lineTo(-e.radius, e.radius);
                    ctx.closePath();
                    ctx.stroke();
                    if (e.flash) e.flash = false;
                }
                ctx.restore();
            });
            // Draw enemy bullets
            ctx.fillStyle = '#ff6600';
            enemyBullets.forEach(b => {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Update asteroids
        function updateAsteroids(dt) {
            const speedMult = activePowerups.slowtime > 0 ? 0.5 : (currentModifier.id === 'speed_demon' ? 1.5 : 1);
            asteroids.forEach(a => {
                // Erratic behavior for purple asteroids
                if (a.color && a.color.behavior === 'erratic') {
                    a.erraticTimer += dt;
                    if (Math.floor(a.erraticTimer) % 60 === 0 && Math.floor(a.erraticTimer - dt) % 60 !== 0) {
                        a.velocity.x = (Math.random() - 0.5) * 3;
                        a.velocity.y = (Math.random() - 0.5) * 3;
                    }
                }
                // Golden Lure particle trail
                if (a.isGoldenLure) {
                    a.trailTimer = (a.trailTimer || 0) - dt;
                    if (a.trailTimer <= 0) {
                        particles.push({
                            x: a.x,
                            y: a.y,
                            velocity: { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 },
                            life: 0.6 + Math.random() * 0.3,
                            decay: 0.02 + Math.random() * 0.01,
                            color: GOLDEN_LURE.trailHex,
                            size: sc(Math.random() * 2 + 1)
                        });
                        a.trailTimer = 6;
                    }
                }
                a.x += a.velocity.x * speedMult * dt;
                a.y += a.velocity.y * speedMult * dt;
                a.rotation += a.rotSpeed * dt;
                if (a.x < -sc(50)) a.x = canvas.width + sc(50);
                if (a.x > canvas.width + sc(50)) a.x = -sc(50);
                if (a.y < -sc(50)) a.y = canvas.height + sc(50);
                if (a.y > canvas.height + sc(50)) a.y = -sc(50);

                // Burn DOT: deal 1 damage every 30 frames while burning
                if (a.burnTimer > 0) {
                    a.burnTimer -= dt;
                    if (Math.floor(a.burnTimer) % 30 === 0 && Math.floor(a.burnTimer + dt) % 30 !== 0) {
                        a.hp -= 1;
                        // Burn particle
                        particles.push(createParticle(
                            a.x + (Math.random() - 0.5) * a.radius,
                            a.y + (Math.random() - 0.5) * a.radius,
                            '#ff6600', 1
                        ));
                    }
                }
            });

            // Process asteroids destroyed by burn DOT
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i];
                if (a.hp <= 0) {
                    destroyAsteroid(a, i);
                }
            }
        }

        // Update particles
        function updateParticles(dt) {
            particles = particles.filter(p => {
                p.x += p.velocity.x * dt;
                p.y += p.velocity.y * dt;
                p.life -= p.decay * dt;
                return p.life > 0;
            });
            // Enforce particle cap
            if (particles.length > MAX_PARTICLES) {
                particles = particles.slice(particles.length - MAX_PARTICLES);
            }
        }

        // Destroy asteroid helper — used by bullets, chain lightning, missile AoE, burn DOT
        function destroyAsteroid(a, index) {
            const scoreMultActive = activePowerups.scoremult > 0;
            for (let k = 0; k < 10; k++) {
                particles.push(createParticle(a.x, a.y, a.color ? a.color.hex : '#fff', 3));
            }
            const basePoints = a.basePoints || (a.size === 3 ? 20 : a.size === 2 ? 50 : 100);
            const points = Math.floor(basePoints * (a.scoreMult || 1));
            const comboMult = 1 + combo * 0.5;
            score += Math.floor(points * comboMult * (scoreMultActive ? 2 : 1));
            playSfx('explosion', { size: a.size >= 2 ? 'large' : 'small' });
            if (a.size >= 2) triggerScreenShake(5, sc(3));
            if (combo >= 2) triggerComboPopup(a.x, a.y - sc(20), `x${(1 + combo * 0.5).toFixed(1)}`, 255, 204, 0);
            combo = Math.min(5, combo + 1);
            comboTimer = COMBO_TIMEOUT;
            runAsteroidsDestroyed++;
            if (a.size === 1 && a.color) spawnStarBits(a.x, a.y, a.color);
            if (currentModifier.id !== 'glass_cannon') {
                if (a.size > 1) {
                    for (let s = 0; s < 2; s++) {
                        asteroids.push(createAsteroid(a.x, a.y, a.size - 1));
                    }
                }
            }
            rollPowerup(a.x, a.y, a.size);
            asteroids.splice(index, 1);
        }

        // Check collisions
        // ============================================================================
