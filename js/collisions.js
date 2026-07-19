        // SECTION 12: COLLISION DETECTION — Bullets, ship, enemies, powerups, star bits
        // ============================================================================

        function checkCollisions() {
            const explosiveRadius = sc(60);
            const scoreMultActive = activePowerups.scoremult > 0;
            const overdriveDamageBonus = overdrive ? 1.5 : 1;
            const baseBulletDamage = currentModifier.id === 'tiny_ship' ? 0.5 : 1;
            const bulletDamage = baseBulletDamage * overdriveDamageBonus;
            const biome = getActiveBiome();

            const lo = getActiveLoadout();

            // Bullets vs asteroids
            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    const b = bullets[i];
                    const a = asteroids[j];
                    if (!b || !a) continue;
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    if (Math.sqrt(dx * dx + dy * dy) < a.radius) {

                        // Explosive bullet: damage nearby asteroids
                        if (b.explosive) {
                            // Visual explosion ring
                            triggerExplosiveRing(b.x, b.y);
                            for (let p = 0; p < 15; p++) {
                                particles.push(createParticle(b.x, b.y, '#ff8800', 4));
                            }
                            for (let k = asteroids.length - 1; k >= 0; k--) {
                                if (k === j) continue;
                                const ea = asteroids[k];
                                const edx = b.x - ea.x;
                                const edy = b.y - ea.y;
                                if (Math.sqrt(edx * edx + edy * edy) < explosiveRadius) {
                                    ea.hp -= bulletDamage;
                                    if (ea.hp <= 0) {
                                        destroyAsteroid(ea, k);
                                        if (k < j) j--;
                                    } else {
                                        for (let p = 0; p < 3; p++) {
                                            particles.push(createParticle(ea.x, ea.y, '#fff', 2));
                                        }
                                        triggerHitFlash(ea);
                                    }
                                }
                            }
                        }

                        // Missile AoE: 40px splash + burn
                        if (b.aoeRadius > 0) {
                            for (let k = asteroids.length - 1; k >= 0; k--) {
                                if (k === j) continue;
                                const ea = asteroids[k];
                                const edx = b.x - ea.x;
                                const edy = b.y - ea.y;
                                if (Math.sqrt(edx * edx + edy * edy) < b.aoeRadius) {
                                    const splashDmg = bulletDamage * 0.5;
                                    ea.hp -= splashDmg;
                                    ea.burnTimer = 180; // 3s burn
                                    if (ea.hp <= 0) {
                                        destroyAsteroid(ea, k);
                                        if (k < j) j--;
                                    } else {
                                        for (let p = 0; p < 3; p++) {
                                            particles.push(createParticle(ea.x, ea.y, '#ff6600', 2));
                                        }
                                        triggerHitFlash(ea);
                                    }
                                }
                            }
                            // Apply burn to direct hit asteroid too
                            a.burnTimer = 180;
                        }

                        // Damage main asteroid
                        a.hp -= bulletDamage;
                        if (a.hp <= 0) {
                            destroyAsteroid(a, j);
                        } else {
                            for (let k = 0; k < 3; k++) {
                                particles.push(createParticle(a.x, a.y, '#fff', 2));
                            }
                            triggerHitFlash(a);
                        }

                        // Chain Lightning: chain to 2 nearest asteroids (sequential animation)
                        if (activePowerups.chainlightning > 0) {
                            const chainRange = sc(200);
                            const chainCount = 2;
                            let chainTargets = [];
                            for (let k = 0; k < asteroids.length; k++) {
                                if (k === j) continue;
                                const ca = asteroids[k];
                                if (ca.hp <= 0) continue;
                                const cdx = b.x - ca.x;
                                const cdy = b.y - ca.y;
                                const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                                if (cdist < chainRange) {
                                    chainTargets.push({ asteroid: ca, index: k, dist: cdist });
                                }
                            }
                            chainTargets.sort((a, b) => a.dist - b.dist);
                            const hitCount = Math.min(chainCount, chainTargets.length);
                            // Chain from hit point to target 1, then target 1 to target 2
                            let lastX = b.x, lastY = b.y;
                            for (let c = 0; c < hitCount; c++) {
                                const ct = chainTargets[c];
                                ct.asteroid.hp -= 1;
                                // Sequential bolt with delay between each
                                triggerChainBolt(lastX, lastY, ct.asteroid.x, ct.asteroid.y, c * 3);
                                lastX = ct.asteroid.x;
                                lastY = ct.asteroid.y;
                                triggerHitFlash(ct.asteroid);
                                if (ct.asteroid.hp <= 0) {
                                    destroyAsteroid(ct.asteroid, ct.index);
                                    // Fix indices for remaining targets
                                    for (let d = c + 1; d < hitCount; d++) {
                                        if (chainTargets[d].index > ct.index) chainTargets[d].index--;
                                    }
                                }
                            }
                        }

                        // Handle piercing
                        if (b.pierceRemaining > 0) {
                            b.pierceRemaining--;
                            // Don't splice this bullet — it continues
                        } else {
                            bullets.splice(i, 1);
                        }
                        updateUI();
                        break;
                    }
                }
            }

            // Ship vs asteroids
            if (!ship.invulnerable) {
                for (let i = asteroids.length - 1; i >= 0; i--) {
                    const a = asteroids[i];
                    const dx = ship.x - a.x;
                    const dy = ship.y - a.y;
                    if (Math.sqrt(dx * dx + dy * dy) < a.radius + ship.radius) {
                        // Shield absorbs hit
                        if (activePowerups.shield > 0) {
                            activePowerups.shield--;
                            shieldTimer = SHIELD_DECAY_TIME;
                            combo = 0;
                            comboTimer = 0;
                            for (let k = 0; k < 15; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#00ffff', 3));
                            }
                            // Destroy the asteroid
                            for (let k = 0; k < 10; k++) {
                                particles.push(createParticle(a.x, a.y, a.color ? a.color.hex : '#fff', 3));
                            }
                            if (a.size === 1 && a.color) spawnStarBits(a.x, a.y, a.color);
                            if (a.size > 1) {
                                for (let k = 0; k < 2; k++) {
                                    asteroids.push(createAsteroid(a.x, a.y, a.size - 1));
                                }
                            }
                            asteroids.splice(i, 1);
                            break;
                        }

                        // Ship hit — death effect based on cosmetic
                        const deathId = getCosmeticDeathId();
                        if (deathId === 'death_annihilation') {
                            // All effects combined: shockwave + flash + particles
                            for (let k = 0; k < 35; k++) {
                                particles.push(createParticle(ship.x, ship.y, getCosmeticColor('hull', '#ff0000'), 5));
                            }
                            for (let k = 0; k < 15; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#ffffff', 3));
                            }
                        } else if (deathId === 'death_shockwave') {
                            // Shockwave ring
                            for (let k = 0; k < 30; k++) {
                                particles.push(createParticle(ship.x, ship.y, getCosmeticColor('hull', '#ff0000'), 5));
                            }
                        } else if (deathId === 'death_supernova') {
                            // Flash + particles
                            for (let k = 0; k < 25; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#ffffff', 4));
                            }
                        } else if (deathId === 'death_implosion') {
                            // Implosion: particles pull inward then burst
                            for (let k = 0; k < 15; k++) {
                                const angle = Math.random() * Math.PI * 2;
                                particles.push(createParticle(ship.x + Math.cos(angle) * 60, ship.y + Math.sin(angle) * 60, getCosmeticColor('hull', '#ff4444'), 3));
                            }
                            for (let k = 0; k < 20; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#ff6600', 4));
                            }
                        } else if (deathId === 'death_shatter') {
                            // Screen shatter: angular particles
                            for (let k = 0; k < 25; k++) {
                                const angle = (k / 25) * Math.PI * 2;
                                particles.push(createParticle(ship.x + Math.cos(angle) * 10, ship.y + Math.sin(angle) * 10, '#ffffff', 4));
                            }
                        } else if (deathId === 'death_blackhole') {
                            // Black hole: dark particles + bright burst
                            for (let k = 0; k < 20; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#220044', 2));
                            }
                            for (let k = 0; k < 15; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#cc66ff', 5));
                            }
                        } else if (deathId === 'death_glitch') {
                            // Glitch: scattered colored particles
                            const glitchColors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff'];
                            for (let k = 0; k < 30; k++) {
                                particles.push(createParticle(ship.x + (Math.random() - 0.5) * 40, ship.y + (Math.random() - 0.5) * 40, glitchColors[k % 5], 3));
                            }
                        } else {
                            // Standard burst
                            for (let k = 0; k < 20; k++) {
                                particles.push(createParticle(ship.x, ship.y, '#ff0000', 4));
                            }
                        }
                        combo = 0;
                        comboTimer = 0;
                        
                        // Audio & VFX on player hit
                        playSfx('hit');
                        triggerScreenShake(10, sc(5));
                        triggerDeathShockwave(ship.x, ship.y);
                        triggerHitFlash(ship);
                        hitStopTimer = 4;
                        
                        lives--;
                        // Reset magnet powerup on death
                        activePowerups.magnetboost = 0;
                        activePowerups.starmagnet = 0;
                        updateUI();

                        if (lives <= 0) {
                            lastScore = score;
                            lastLevel = level;
                            gameState = 'gameover';
                            playSfx('gameover');
                            stopMusic();
                            submitScore();
                        } else {
                            ship.x = canvas.width / 2;
                            ship.y = canvas.height / 2;
                            ship.velocity = { x: 0, y: 0 };
                            ship.invulnerable = true;
                            ship.invulnerableTimer = 120;
                            ship.blinkTimer = 0;
                            ship.blinkOn = true;
                        }
                        break;
                    }
                }
            }

            // Ship vs powerups
            for (let i = powerups.length - 1; i >= 0; i--) {
                const p = powerups[i];
                const dx = ship.x - p.x;
                const dy = ship.y - p.y;
                if (Math.sqrt(dx * dx + dy * dy) < p.radius + ship.radius) {
                    // Activate powerup
                    playSfx('powerup');
                    if (p.type.id === 'shield') {
                        if (activePowerups.shield < 3) {
                            activePowerups.shield++;
                            shieldTimer = SHIELD_DECAY_TIME;
                        }
                    } else {
                        activePowerups[p.type.id] = p.type.duration;
                    }
                    // Pickup particles
                    for (let k = 0; k < 8; k++) {
                        particles.push(createParticle(p.x, p.y, p.type.color, 2));
                    }
                    powerups.splice(i, 1);
                    // Track stats
                    if (activeProfile) {
                        activeProfile.stats.totalPowerupsCollected = (activeProfile.stats.totalPowerupsCollected ?? 0) + 1;
                    }
                }
            }

            // Ship vs star bits
            for (let i = starBits.length - 1; i >= 0; i--) {
                const sb = starBits[i];
                const dx = ship.x - sb.x;
                const dy = ship.y - sb.y;
                if (Math.sqrt(dx * dx + dy * dy) < sb.radius + ship.radius) {
                    // Collect star bit
                    runStarBits += sb.amount;
                    if (activeProfile) {
                        activeProfile.starBits += sb.amount;
                        activeProfile.totalStarBitsEarned += sb.amount;
                        saveProfile(activeProfile);
                    }
                    for (let k = 0; k < 5; k++) {
                        particles.push(createParticle(sb.x, sb.y, '#ffd700', 2));
                    }
                    starBits.splice(i, 1);
                }
            }

            // Bullets vs enemies
            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const b = bullets[i];
                    const e = enemies[j];
                    if (!b || !e) continue;
                    const dx = b.x - e.x;
                    const dy = b.y - e.y;
                    if (Math.sqrt(dx * dx + dy * dy) < e.radius) {
                        e.hp -= bulletDamage;
                        if (e.hp <= 0) {
                            // Destroy enemy
                            for (let k = 0; k < 8; k++) particles.push(createParticle(e.x, e.y, e.color, 3));
                            const basePts = e.basePoints || 50;
                            const pts = Math.floor(basePts * (e.scoreMult || 1));
                            const comboMult = 1 + combo * 0.5;
                            score += Math.floor(pts * comboMult * (scoreMultActive ? 2 : 1) * (biome.scoreMult || 1));
                            playSfx('explosion', { size: 'small' });
                            combo = Math.min(5, combo + 1);
                            comboTimer = COMBO_TIMEOUT;
                            runAsteroidsDestroyed++;
                            if (e.starBits) spawnStarBits(e.x, e.y, { starBits: e.starBits });
                            rollPowerup(e.x, e.y, 1);
                            enemies.splice(j, 1);
                        } else {
                            for (let k = 0; k < 3; k++) particles.push(createParticle(e.x, e.y, '#fff', 2));
                            triggerHitFlash(e);
                        }
                        if (e.type !== 'turret') {
                            bullets.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            // Enemy bullets vs ship
            if (!ship.invulnerable) {
                for (let i = enemyBullets.length - 1; i >= 0; i--) {
                    const b = enemyBullets[i];
                    const dx = ship.x - b.x;
                    const dy = ship.y - b.y;
                    if (Math.sqrt(dx * dx + dy * dy) < ship.radius + b.radius) {
                        enemyBullets.splice(i, 1);
                        // Shield absorbs
                        if (activePowerups.shield > 0) {
                            activePowerups.shield--;
                            shieldTimer = SHIELD_DECAY_TIME;
                            for (let k = 0; k < 10; k++) particles.push(createParticle(ship.x, ship.y, '#00ffff', 3));
                        } else {
                            combo = 0; comboTimer = 0;
                            playSfx('hit');
                            triggerScreenShake(10, sc(5));
                            triggerDeathShockwave(ship.x, ship.y);
                            triggerHitFlash(ship);
                            hitStopTimer = 4;
                            lives--;
                            activePowerups.magnetboost = 0;
                            activePowerups.starmagnet = 0;
                            updateUI();
                            if (lives <= 0) {
                                lastScore = score; lastLevel = level;
                                gameState = 'gameover'; playSfx('gameover'); stopMusic(); submitScore();
                            } else {
                                ship.x = canvas.width / 2; ship.y = canvas.height / 2;
                                ship.velocity = { x: 0, y: 0 };
                                ship.invulnerable = true; ship.invulnerableTimer = 120;
                                ship.blinkTimer = 0; ship.blinkOn = true;
                            }
                        }
                        break;
                    }
                }
            }

            // Ship vs enemies
            if (!ship.invulnerable) {
                for (let i = enemies.length - 1; i >= 0; i--) {
                    const e = enemies[i];
                    const dx = ship.x - e.x;
                    const dy = ship.y - e.y;
                    if (Math.sqrt(dx * dx + dy * dy) < e.radius + ship.radius) {
                        // Shield absorbs
                        if (activePowerups.shield > 0) {
                            activePowerups.shield--;
                            shieldTimer = SHIELD_DECAY_TIME;
                            for (let k = 0; k < 10; k++) particles.push(createParticle(ship.x, ship.y, '#00ffff', 3));
                            // Destroy enemy
                            for (let k = 0; k < 8; k++) particles.push(createParticle(e.x, e.y, e.color, 3));
                            enemies.splice(i, 1);
                        } else {
                            combo = 0; comboTimer = 0;
                            playSfx('hit');
                            triggerScreenShake(10, sc(5));
                            triggerDeathShockwave(ship.x, ship.y);
                            triggerHitFlash(ship);
                            hitStopTimer = 4;
                            lives--;
                            activePowerups.magnetboost = 0;
                            activePowerups.starmagnet = 0;
                            updateUI();
                            if (lives <= 0) {
                                lastScore = score; lastLevel = level;
                                gameState = 'gameover'; playSfx('gameover'); stopMusic(); submitScore();
                            } else {
                                ship.x = canvas.width / 2; ship.y = canvas.height / 2;
                                ship.velocity = { x: 0, y: 0 };
                                ship.invulnerable = true; ship.invulnerableTimer = 120;
                                ship.blinkTimer = 0; ship.blinkOn = true;
                            }
                        }
                        break;
                    }
                }
            }

            // Check level complete
            if (asteroids.length === 0 && enemies.length === 0 && gameState === 'playing') {
                gameState = 'level_transition';
                levelTransitionTimer = 120; // 2 seconds
                updateUI();
            }
        }

        // Biome background rendering
        function drawBiomeBackground(dt) {
            const biome = getActiveBiome();
            drawBiomeGradient(biome);
            drawBiomeStatic(biome);
            drawBiomeGlow(biome, dt);
        }
        function drawBiomeGradient(biome) {
            ctx.save();
            const w = canvas.width, h = canvas.height;
            if (biome.id === 'classic_void') {
                // Deep space blue glow from center
                const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.7);
                grd.addColorStop(0, 'rgba(40, 80, 200, 0.5)');
                grd.addColorStop(0.4, 'rgba(20, 50, 150, 0.25)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            } else if (biome.id === 'rubble_field') {
                // Warm orange/red horizon — Petrova line feel
                const grd = ctx.createLinearGradient(0, h, 0, 0);
                grd.addColorStop(0, 'rgba(180, 60, 0, 0.5)');
                grd.addColorStop(0.3, 'rgba(120, 40, 0, 0.3)');
                grd.addColorStop(0.7, 'rgba(60, 20, 0, 0.15)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            } else if (biome.id === 'drift_expanse') {
                // Icy blue gradient — Adrian feel
                const grd = ctx.createLinearGradient(0, 0, w * 0.3, h);
                grd.addColorStop(0, 'rgba(0, 40, 120, 0.5)');
                grd.addColorStop(0.5, 'rgba(0, 20, 80, 0.35)');
                grd.addColorStop(1, 'rgba(0, 10, 40, 0.2)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            } else if (biome.id === 'dense_belt') {
                // Amber/orange radial glow — Erid feel
                const grd = ctx.createRadialGradient(w * 0.6, h * 0.4, 0, w * 0.6, h * 0.4, Math.max(w, h) * 0.6);
                grd.addColorStop(0, 'rgba(200, 100, 0, 0.4)');
                grd.addColorStop(0.4, 'rgba(120, 60, 0, 0.25)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            } else if (biome.id === 'mire_wastes') {
                // Green/purple bioluminescent feel
                const grd = ctx.createRadialGradient(w * 0.4, h * 0.5, 0, w * 0.4, h * 0.5, Math.max(w, h) * 0.6);
                grd.addColorStop(0, 'rgba(0, 100, 50, 0.4)');
                grd.addColorStop(0.5, 'rgba(30, 0, 60, 0.25)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            }
            ctx.restore();
        }
        function drawBiomeStatic(biome) {
            ctx.save();
            const w = canvas.width, h = canvas.height;
            const time = Date.now() / 1000;
            if (biome.id === 'rubble_field') {
                // Petrova line bands
                ctx.globalAlpha = 0.25 + Math.sin(time * 0.3) * 0.1;
                ctx.strokeStyle = '#ff6622';
                ctx.lineWidth = sc(4);
                for (let i = 0; i < 3; i++) {
                    const y = h * (0.2 + i * 0.3) + Math.sin(time * 0.2 + i) * sc(20);
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    for (let x = 0; x < w; x += sc(40)) {
                        ctx.lineTo(x, y + Math.sin(x * 0.01 + time * 0.5 + i * 2) * sc(8));
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            } else if (biome.id === 'drift_expanse') {
                // Ice crystal patterns (static, slight parallax)
                ctx.strokeStyle = 'rgba(120, 200, 255, 0.18)';
                ctx.lineWidth = sc(1);
                for (let i = 0; i < 8; i++) {
                    const cx = (i * 137.508 + i * i * 0.3) % w;
                    const cy = (i * 97.3 + i * 0.7) % h;
                    const size = sc(15 + i * 3);
                    ctx.beginPath();
                    for (let j = 0; j < 6; j++) {
                        const a = (j / 6) * Math.PI * 2 + time * 0.05;
                        const px = cx + Math.cos(a) * size;
                        const py = cy + Math.sin(a) * size;
                        if (j === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
                // Aurora bands
                ctx.globalAlpha = 0.18 + Math.sin(time * 0.4) * 0.08;
                ctx.strokeStyle = '#88ccff';
                ctx.lineWidth = sc(2);
                for (let i = 0; i < 2; i++) {
                    const y = h * (0.3 + i * 0.4) + Math.sin(time * 0.3 + i * 3) * sc(30);
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    for (let x = 0; x < w; x += sc(30)) {
                        ctx.lineTo(x, y + Math.sin(x * 0.008 + time * 0.6 + i) * sc(12));
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            } else if (biome.id === 'dense_belt') {
                // Large asteroid silhouettes (parallax)
                ctx.fillStyle = 'rgba(50, 25, 0, 0.25)';
                for (let i = 0; i < 5; i++) {
                    const sx = (i * 200 + 50) % (w + 100) - 50;
                    const sy = (i * 150 + 30) % (h + 100) - 50;
                    const size = sc(30 + i * 10);
                    ctx.beginPath();
                    ctx.arc(sx, sy, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Solar flare flashes
                if (Math.sin(time * 0.7 + 1.2) > 0.95) {
                    ctx.fillStyle = 'rgba(255, 100, 0, 0.10)';
                    ctx.fillRect(0, 0, w, h);
                }
            }
            ctx.restore();
        }
        function drawBiomeGlow(biome, dt) {
            ctx.save();
            const w = canvas.width, h = canvas.height;
            const time = Date.now() / 1000;
            if (biome.id === 'mire_wastes') {
                // Bioluminescent pulsing glow
                const pulse = 0.5 + Math.sin(time * 0.8) * 0.3;
                ctx.globalAlpha = 0.15 * pulse;
                ctx.fillStyle = '#00ff66';
                ctx.beginPath();
                ctx.arc(w * 0.3, h * 0.4, sc(90), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.10 * pulse;
                ctx.fillStyle = '#6600cc';
                ctx.beginPath();
                ctx.arc(w * 0.7, h * 0.6, sc(70), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.12 * (0.5 + Math.sin(time * 1.2 + 2) * 0.3);
                ctx.fillStyle = '#00ff66';
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.2, sc(80), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else if (biome.id === 'drift_expanse') {
                // Blue ambient glow
                const pulse = 0.5 + Math.sin(time * 0.5) * 0.3;
                ctx.globalAlpha = 0.12 * pulse;
                ctx.fillStyle = '#4488ff';
                ctx.beginPath();
                ctx.arc(w * 0.4, h * 0.5, sc(140), 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else if (biome.id === 'rubble_field') {
                // Orange ambient flash
                if (Math.sin(time * 1.5 + 0.8) > 0.92) {
                    ctx.fillStyle = 'rgba(255, 100, 0, 0.12)';
                    ctx.fillRect(0, 0, w, h);
                }
            } else if (biome.id === 'dense_belt') {
                // Amber flare
                if (Math.sin(time * 1.2 + 0.5) > 0.93) {
                    ctx.fillStyle = 'rgba(255, 150, 0, 0.08)';
                    ctx.fillRect(0, 0, w, h);
                }
            }
            ctx.restore();
        }

        // ============================================================================
