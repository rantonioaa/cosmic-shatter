        // SECTION 14: GAME LOOP — Frame update, state machine, rendering pipeline
        // ============================================================================

        function gameLoop(timestamp) {
            // Delta time (normalized to 60fps, capped to prevent spiral of death)
            const dt = timestamp ? Math.min((timestamp - lastFrameTime) / (1000 / 60), 3) : 1;
            lastFrameTime = timestamp || performance.now();
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw biome background (gradient + static + glow)
            if (gameState === 'playing' || gameState === 'paused' || gameState === 'gameover' || gameState === 'victory' || gameState === 'level_transition') {
                drawBiomeBackground(dt);
            }

            // Draw stars background
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 100; i++) {
                const x = (i * 137.508 + i * i * 0.1) % canvas.width;
                const y = (i * 97.3 + i * 0.3) % canvas.height;
                ctx.fillRect(x, y, sc(1), sc(1));
            }

            if (gameState === 'playing') {
                // Hit-stop: freeze updates for a few frames on player damage
                if (hitStopTimer > 0) {
                    hitStopTimer -= dt;
                    drawShip();
                    drawAsteroids();
                    drawEnemies();
                    drawGravityWells();
                    drawVoidCaches();
                    drawBullets();
                    drawParticles();
                    drawPowerups();
                    drawStarBits();
                    drawVisualEffects();
                    renderPowerupHud();
                    // Brief white flash during hit-stop
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    requestAnimationFrame(gameLoop);
                    return;
                }
                updateShip(dt);
                updateBullets(dt);
                updateHeat(dt);
                updateAsteroids(dt);
                updateEnemies(dt);
                updateGravityWells(dt);
                updateVoidCaches(dt);
                updateParticles(dt);
                updatePowerups(dt);
                updateStarBits(dt);
                updateActivePowerups(dt);
                updateMagnet(dt);
                checkCollisions();
                updateVisualEffects(dt);
                updateBiomeParticles(dt);
                updateMusic(dt);

                // Combo decay (runs every frame regardless of heat state)
                if (comboTimer > 0) {
                    comboTimer -= dt;
                    if (comboTimer <= 0) {
                        combo = 0;
                        comboTimer = 0;
                    }
                }

                // Low health warning sound
                if (lives <= 1) {
                    lowHealthTimer -= dt;
                    if (lowHealthTimer <= 0) {
                        playSfx('lowhealth');
                        lowHealthTimer = LOW_HEALTH_INTERVAL;
                    }
                } else {
                    lowHealthTimer = 0;
                }

                // Update score display with live combo (every frame)
                const comboText = combo > 0 ? ` | Combo x${(1 + combo * 0.5).toFixed(1)}` : '';
                scoreEl.textContent = `Score: ${score}${comboText} | Lives: ${lives}`;

                // Combo timer bar
                if (combo > 0 && comboTimer > 0) {
                    comboBarEl.style.display = 'block';
                    const pct = (comboTimer / COMBO_TIMEOUT) * 100;
                    comboFillEl.style.width = pct + '%';
                    // Color: green > 60%, yellow 30-60%, red < 30%
                    if (pct > 60) comboFillEl.style.background = '#00ff00';
                    else if (pct > 30) comboFillEl.style.background = '#ffcc00';
                    else comboFillEl.style.background = '#ff4444';
                } else {
                    comboBarEl.style.display = 'none';
                }

                // Screen shake wraps all game object draws
                if (screenShakeTimer > 0) {
                    ctx.save();
                    ctx.translate(
                        (Math.random() - 0.5) * screenShakeIntensity * 2,
                        (Math.random() - 0.5) * screenShakeIntensity * 2
                    );
                }

                drawShip();
                drawHeatBar();
                drawAsteroids();
                drawEnemies();
                drawGravityWells();
                drawVoidCaches();
                drawBullets();
                drawParticles();
                drawPowerups();
                drawStarBits();

                if (screenShakeTimer > 0) ctx.restore();

                drawVisualEffects();
                drawBiomeParticles();

                // Dark mode overlay
                if (currentModifier.id === 'dark_mode') {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(0, 0, canvas.width, canvas.height);
                    ctx.arc(ship.x, ship.y, sc(200), 0, Math.PI * 2, true);
                    ctx.fillStyle = '#000';
                    ctx.fill();
                    ctx.restore();
                }

                renderPowerupHud();
            } else if (gameState === 'level_transition') {
                // Level transition: countdown and spawn new level
                levelTransitionTimer -= dt;
                if (levelTransitionTimer <= 0) {
                    // Victory: Level 20 cleared
                    if (level >= 20) {
                        lastScore = score;
                        lastLevel = level;
                        playSfx('levelup');
                        stopMusic();
                        submitScore();
                    } else {
                        level++;
                        playSfx('levelup');
                        gravityWells = [];
                        biomeParticles = [];
                        spawnAsteroids();
                        gameState = 'playing';
                        updateUI();
                    }
                }
                // Draw frozen ship
                drawShip();
                powerupHudEl.style.display = 'none';
            } else if (gameState === 'menu') {
                // Draw title screen asteroids
                if (asteroids.length === 0) {
                    for (let i = 0; i < 5; i++) {
                        asteroids.push(createAsteroid(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            Math.floor(Math.random() * 3) + 1
                        ));
                    }
                }
                updateAsteroids(dt);
                drawAsteroids();
                powerupHudEl.style.display = 'none';
            } else if (gameState === 'modifier_select') {
                updateAsteroids(dt);
                drawAsteroids();
                powerupHudEl.style.display = 'none';
            } else if (gameState === 'constellation_map') {
                updateAsteroids(dt);
                drawAsteroids();
                powerupHudEl.style.display = 'none';
            } else if (gameState === 'gameover') {
                updateParticles(dt);
                drawParticles();
                drawAsteroids();
                powerupHudEl.style.display = 'none';
            } else if (gameState === 'victory') {
                updateParticles(dt);
                drawParticles();
                powerupHudEl.style.display = 'none';
            } else if (gameState === 'paused') {
                // Draw frozen game state (no updates)
                drawShip();
                drawAsteroids();
                drawEnemies();
                drawGravityWells();
                drawVoidCaches();
                drawBullets();
                drawParticles();
                drawPowerups();
                drawStarBits();
                renderPowerupHud();
                // Dim overlay
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (gameState === 'profile_select' || gameState === 'profile_create') {
                if (asteroids.length === 0) {
                    for (let i = 0; i < 5; i++) {
                        asteroids.push(createAsteroid(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height,
                            Math.floor(Math.random() * 3) + 1
                        ));
                    }
                }
                updateAsteroids(dt);
                drawAsteroids();
                powerupHudEl.style.display = 'none';
            }

            requestAnimationFrame(gameLoop);
        }

        // ============================================================================
