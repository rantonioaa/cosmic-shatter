        // SECTION 13: DRAW FUNCTIONS — Ship, asteroids, enemies, bullets, particles
        // ============================================================================

        // Draw functions
        function drawShip() {
            if (!ship.blinkOn && ship.invulnerable) return;

            const s = ship.radius / 15;
            ctx.save();
            ctx.translate(ship.x, ship.y);
            ctx.rotate(ship.angle);
            ctx.scale(s, s);

            // Draw ship with cosmetic hull color (white when flashing)
            const hullColor = ship.flash ? '#ffffff' : getCosmeticColor('hull', '#ffffff');
            if (ship.flash) ship.flash = false;
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(-15, -12);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-15, 12);
            ctx.closePath();
            ctx.strokeStyle = hullColor;
            ctx.lineWidth = sc(2);
            ctx.stroke();

            // Draw thruster
            if (keys['ArrowUp'] || keys['KeyW']) {
                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.lineTo(-20, 0);
                ctx.lineTo(-10, 5);
                ctx.strokeStyle = '#ff6600';
                ctx.stroke();
            }

            ctx.restore();

            // Draw shield rings
            if (activePowerups.shield > 0) {
                ctx.save();
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = sc(2);
                const baseAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.2;
                for (let s = 0; s < activePowerups.shield; s++) {
                    ctx.globalAlpha = baseAlpha - s * 0.06;
                    ctx.beginPath();
                    ctx.arc(ship.x, ship.y, ship.radius + sc(8) + s * sc(6), 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        function drawHeatBar() {
            if (heat <= 0 && !overheating) return;

            // Small indicator on the ship
            const indicatorWidth = sc(12);
            const indicatorHeight = sc(2);
            const x = ship.x - indicatorWidth / 2;
            const y = ship.y - ship.radius - sc(6);

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(x, y, indicatorWidth, indicatorHeight);

            // Heat fill (color: green → yellow → red, with overdrive orange)
            let color;
            if (overheating) {
                color = Math.floor(Date.now() / 100) % 2 ? '#ff0000' : '#ff6600';
            } else if (overdrive) {
                color = '#ff8800'; // orange for overdrive
            } else if (heat < 50) {
                color = '#00ff00';
            } else if (heat < 80) {
                color = '#ffff00';
            } else {
                color = '#ff0000';
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, y, indicatorWidth * (heat / 100), indicatorHeight);

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = sc(1);
            ctx.strokeRect(x, y, indicatorWidth, indicatorHeight);
        }

        function drawAsteroids() {
            asteroids.forEach(a => {
                ctx.save();
                ctx.translate(a.x, a.y);
                ctx.rotate(a.rotation);
                if (a.isGoldenLure) {
                    // Golden Lure: shimmer + white core
                    a.lurePulse = (a.lurePulse || 0) + 0.2;
                    const shimmer = 0.7 + Math.sin(a.lurePulse) * 0.3;
                    ctx.shadowColor = GOLDEN_LURE.trailHex;
                    ctx.shadowBlur = sc(14 + shimmer * 6);
                    ctx.strokeStyle = GOLDEN_LURE.hex;
                    ctx.lineWidth = sc(3);
                    ctx.beginPath();
                    ctx.moveTo(a.shape[0].x * a.radius, a.shape[0].y * a.radius);
                    for (let i = 1; i < a.shape.length; i++) {
                        ctx.lineTo(a.shape[i].x * a.radius, a.shape[i].y * a.radius);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    // Inner white core
                    ctx.beginPath();
                    ctx.arc(0, 0, a.radius * 0.35, 0, Math.PI * 2);
                    ctx.fillStyle = GOLDEN_LURE.coreHex;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.beginPath();
                    ctx.moveTo(a.shape[0].x * a.radius, a.shape[0].y * a.radius);
                    for (let i = 1; i < a.shape.length; i++) {
                        ctx.lineTo(a.shape[i].x * a.radius, a.shape[i].y * a.radius);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = a.flash ? '#ffffff' : (a.color ? a.color.hex : '#888');
                    ctx.lineWidth = sc(2);
                    ctx.stroke();
                }
                // Health indicator for tough asteroids
                if (a.color && a.maxHp > 1 && a.hp < a.maxHp && !a.isGoldenLure) {
                    ctx.fillStyle = '#fff';
                    ctx.font = `${sc(10)}px Courier New`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(Math.ceil(a.hp), 0, 0);
                }
                ctx.restore();
            });
        }

        function drawBullets() {
            const bulletColor = getCosmeticColor('bullets', '#ffffff');
            const bulletShape = getCosmeticShape('bullets');
            bullets.forEach(b => {
                const isMissile = b.isMissile;
                const isPierce = b.pierceRemaining > 0;
                const scale = isMissile ? 1.4 : isPierce ? 1.3 : 1;
                const color = isMissile ? '#ffaa00' : isPierce ? '#66eeff' : bulletColor;
                ctx.fillStyle = color;
                ctx.beginPath();
                if (isMissile) {
                    // Missile: larger diamond
                    ctx.moveTo(b.x, b.y - sc(4));
                    ctx.lineTo(b.x + sc(3), b.y);
                    ctx.lineTo(b.x, b.y + sc(4));
                    ctx.lineTo(b.x - sc(3), b.y);
                    ctx.closePath();
                } else if (bulletShape === 'diamond') {
                    ctx.moveTo(b.x, b.y - sc(3) * scale);
                    ctx.lineTo(b.x + sc(2) * scale, b.y);
                    ctx.lineTo(b.x, b.y + sc(3) * scale);
                    ctx.lineTo(b.x - sc(2) * scale, b.y);
                    ctx.closePath();
                } else if (bulletShape === 'triangle') {
                    ctx.moveTo(b.x, b.y - sc(3) * scale);
                    ctx.lineTo(b.x + sc(3) * scale, b.y + sc(2) * scale);
                    ctx.lineTo(b.x - sc(3) * scale, b.y + sc(2) * scale);
                    ctx.closePath();
                } else if (bulletShape === 'square') {
                    const sz = sc(2) * scale;
                    ctx.rect(b.x - sz, b.y - sz, sz * 2, sz * 2);
                } else if (bulletShape === 'star') {
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                        const r = sc(3) * scale;
                        ctx.lineTo(b.x + Math.cos(angle) * r, b.y + Math.sin(angle) * r);
                    }
                    ctx.closePath();
                } else {
                    ctx.arc(b.x, b.y, sc(2) * scale, 0, Math.PI * 2);
                }
                ctx.fill();
            });
        }

        function drawParticles() {
            particles.forEach(p => {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        // Main game loop
        let lastFrameTime = 0;
        // ============================================================================
