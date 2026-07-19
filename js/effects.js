        // SECTION 3: VISUAL EFFECTS SYSTEM — Shake, flash, rings, bolts, popups
        // ============================================================================

        // Visual effects system
        let screenShakeTimer = 0;
        let screenShakeIntensity = 0;
        let muzzleFlashTimer = 0;
        let hitFlashTargets = []; // [{obj, timer}]
        let deathShockwave = null; // {x, y, radius, maxRadius, timer}
        let comboPopups = []; // [{x, y, text, color, timer, vy}]
        let explosiveRings = []; // [{x, y, radius, maxRadius, timer, maxTimer}]
        let chainBolts = []; // [{x1, y1, x2, y2, timer, maxTimer, points, forks}]
        let hitStopTimer = 0;
        let biomeParticles = [];

        function triggerScreenShake(duration, intensity) {
            screenShakeTimer = duration;
            screenShakeIntensity = intensity;
        }

        function triggerMuzzleFlash() {
            muzzleFlashTimer = 3; // 3 frames
        }

        function triggerHitFlash(obj) {
            hitFlashTargets.push({ obj, timer: 3 });
        }

        function triggerDeathShockwave(x, y) {
            deathShockwave = { x, y, radius: 0, maxRadius: sc(100), timer: 30 };
        }

        function triggerExplosiveRing(x, y) {
            explosiveRings.push({ x, y, radius: 0, maxRadius: sc(60), timer: 20, maxTimer: 20 });
        }

        function triggerChainBolt(x1, y1, x2, y2, delay) {
            const dx = x2 - x1, dy = y2 - y1;
            const len = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);
            // Generate jagged points along the bolt
            const numSegs = Math.max(3, Math.floor(len / sc(20)));
            const points = [{ x: x1, y: y1 }];
            for (let i = 1; i < numSegs; i++) {
                const t = i / numSegs;
                const px = x1 + dx * t;
                const py = y1 + dy * t;
                const offset = (Math.random() - 0.5) * sc(15);
                const perpX = -Math.sin(angle) * offset;
                const perpY = Math.cos(angle) * offset;
                points.push({ x: px + perpX, y: py + perpY });
            }
            points.push({ x: x2, y: y2 });
            // Generate forks (2-3 small side branches)
            const forks = [];
            const numForks = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numForks; i++) {
                const t = 0.2 + (i / numForks) * 0.6;
                const ptIdx = Math.min(Math.floor(t * points.length), points.length - 1);
                const base = points[ptIdx];
                const forkAngle = angle + (Math.random() - 0.5) * 1.5;
                const forkLen = sc(8) + Math.random() * sc(8);
                forks.push({ x: base.x, y: base.y, angle: forkAngle, length: forkLen });
            }
            const maxTimer = 5;
            const startDelay = delay || 0;
            chainBolts.push({ x1, y1, x2, y2, timer: maxTimer + startDelay, maxTimer, points, forks, delay: startDelay });
        }

        function triggerComboPopup(x, y, text, r, g, b) {
            comboPopups.push({ x, y, text, r, g, b, timer: 60, vy: -1.5 });
        }

        // Biome background particles
        function updateBiomeParticles(dt) {
            const biome = getActiveBiome();
            if (!biome.palette.particles) { biomeParticles = []; return; }
            // Spawn new particles
            if (Math.random() > 0.85) {
                const px = Math.random() * canvas.width;
                const py = biome.palette.particles === 'embers' ? canvas.height + 10 : Math.random() * canvas.height;
                biomeParticles.push({ x: px, y: py, life: 1, color: biome.palette.accent, size: sc(1 + Math.random() * 2) });
            }
            // Cap particles
            if (biomeParticles.length > 50) biomeParticles = biomeParticles.slice(-50);
            // Update
            biomeParticles = biomeParticles.filter(p => {
                p.life -= 0.008 * dt;
                if (biome.palette.particles === 'streaks') { p.y += 1.5 * dt; p.x += 0.3 * dt; }
                else if (biome.palette.particles === 'embers') { p.y -= 0.8 * dt; p.x += (Math.random() - 0.5) * 0.3 * dt; }
                else if (biome.palette.particles === 'spores') { p.y += 0.3 * dt; p.x += (Math.random() - 0.5) * 0.5 * dt; }
                else if (biome.palette.particles === 'sparks') { p.y += 0.2 * dt; p.x += (Math.random() - 0.5) * 0.8 * dt; }
                return p.life > 0;
            });
        }
        function drawBiomeParticles() {
            biomeParticles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life * 0.5;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            ctx.globalAlpha = 1;
        }

        function updateVisualEffects(dt) {
            // Screen shake
            if (screenShakeTimer > 0) {
                screenShakeTimer -= dt;
            }
            
            // Muzzle flash
            if (muzzleFlashTimer > 0) {
                muzzleFlashTimer -= dt;
            }
            
            // Hit flash
            hitFlashTargets = hitFlashTargets.filter(h => {
                h.timer -= dt;
                return h.timer > 0;
            });
            
            // Death shockwave
            if (deathShockwave) {
                deathShockwave.timer -= dt;
                deathShockwave.radius += (deathShockwave.maxRadius / 30) * dt;
                if (deathShockwave.timer <= 0) deathShockwave = null;
            }
            
            // Explosive rings
            explosiveRings = explosiveRings.filter(r => {
                r.timer -= dt;
                r.radius = (1 - r.timer / r.maxTimer) * r.maxRadius;
                return r.timer > 0;
            });

            // Chain bolts
            chainBolts = chainBolts.filter(b => {
                b.timer -= dt;
                return b.timer > 0;
            });
            
            // Combo popups
            comboPopups = comboPopups.filter(p => {
                p.timer -= dt;
                p.y += p.vy * dt;
                return p.timer > 0;
            });
        }

        function drawVisualEffects() {
            // Muzzle flash
            if (muzzleFlashTimer > 0 && typeof ship.x === 'number') {
                ctx.save();
                ctx.translate(ship.x, ship.y);
                ctx.rotate(ship.angle);
                ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
                ctx.beginPath();
                ctx.moveTo(sc(18), 0);
                ctx.lineTo(sc(28), -sc(4));
                ctx.lineTo(sc(28), sc(4));
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            // Hit flash
            hitFlashTargets.forEach(h => {
                if (h.obj && h.obj.flash !== undefined) {
                    h.obj.flash = true;
                }
            });
            
            // Death shockwave
            if (deathShockwave) {
                const alpha = deathShockwave.timer / 30;
                ctx.strokeStyle = `rgba(255, 100, 100, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(deathShockwave.x, deathShockwave.y, deathShockwave.radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Explosive rings
            for (const r of explosiveRings) {
                const alpha = r.timer / r.maxTimer;
                // Orange outer ring
                ctx.strokeStyle = `rgba(255, 136, 0, ${alpha * 0.8})`;
                ctx.lineWidth = sc(2);
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();
                // Yellow inner glow
                ctx.strokeStyle = `rgba(255, 200, 0, ${alpha * 0.4})`;
                ctx.lineWidth = sc(4);
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Chain lightning bolts
            for (const b of chainBolts) {
                if (b.timer < b.maxTimer - b.delay) {
                    const alpha = b.timer / b.maxTimer;
                    // Draw main jagged bolt (white-yellow core)
                    ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
                    ctx.lineWidth = sc(1.5);
                    ctx.beginPath();
                    ctx.moveTo(b.points[0].x, b.points[0].y);
                    for (let i = 1; i < b.points.length; i++) {
                        ctx.lineTo(b.points[i].x, b.points[i].y);
                    }
                    ctx.stroke();
                    // Cyan glow
                    ctx.strokeStyle = `rgba(68, 238, 255, ${alpha * 0.5})`;
                    ctx.lineWidth = sc(3.5);
                    ctx.beginPath();
                    ctx.moveTo(b.points[0].x, b.points[0].y);
                    for (let i = 1; i < b.points.length; i++) {
                        ctx.lineTo(b.points[i].x, b.points[i].y);
                    }
                    ctx.stroke();
                    // Draw forks
                    for (const fork of b.forks) {
                        const fx = fork.x + Math.cos(fork.angle) * fork.length;
                        const fy = fork.y + Math.sin(fork.angle) * fork.length;
                        ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.7})`;
                        ctx.lineWidth = sc(1);
                        ctx.beginPath();
                        ctx.moveTo(fork.x, fork.y);
                        ctx.lineTo(fx, fy);
                        ctx.stroke();
                    }
                }
            }
            
            // Combo popups
            comboPopups.forEach(p => {
                const alpha = p.timer / 60;
                ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
                ctx.font = `bold ${sc(14)}px Courier New`;
                ctx.textAlign = 'center';
                ctx.fillText(p.text, p.x, p.y);
            });
        }

        // ============================================================================
