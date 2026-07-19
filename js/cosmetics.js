        // SECTION 5: SVG COSMETIC RENDERING — Ship, bullet, thruster, death previews
        // ============================================================================

        function cosmeticColor(item) {
            if (!item || !item.color) return '#ffffff';
            if (item.color === 'prismatic') {
                return `hsl(${(Date.now() / 20) % 360}, 100%, 60%)`;
            }
            return item.color;
        }

        function drawBulletShape(ctx, shape, r) {
            ctx.beginPath();
            if (shape === 'diamond') {
                ctx.moveTo(0, -r); ctx.lineTo(r * 0.6, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.6, 0);
                ctx.closePath();
            } else if (shape === 'triangle') {
                ctx.moveTo(0, -r); ctx.lineTo(r, r * 0.7); ctx.lineTo(-r, r * 0.7);
                ctx.closePath();
            } else if (shape === 'square') {
                ctx.rect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
            } else if (shape === 'star') {
                for (let i = 0; i < 5; i++) {
                    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
            } else {
                ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
            }
        }

        function drawStarbitShape(ctx, shape, r) {
            ctx.beginPath();
            if (shape === 'heart') {
                ctx.moveTo(0, r * 0.3);
                ctx.bezierCurveTo(-r, -r * 0.3, -r * 0.5, -r, 0, -r * 0.5);
                ctx.bezierCurveTo(r * 0.5, -r, r, -r * 0.3, 0, r * 0.3);
            } else if (shape === 'diamond') {
                ctx.moveTo(0, -r); ctx.lineTo(r * 0.6, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.6, 0);
                ctx.closePath();
            } else if (shape === 'moon') {
                ctx.arc(0, 0, r, -Math.PI * 0.8, Math.PI * 0.8);
                ctx.arc(r * 0.3, 0, r * 0.6, Math.PI * 0.8, -Math.PI * 0.8, true);
            } else if (shape === 'crystal') {
                ctx.moveTo(0, -r); ctx.lineTo(r * 0.4, -r * 0.2); ctx.lineTo(r * 0.3, r * 0.6);
                ctx.lineTo(-r * 0.3, r * 0.6); ctx.lineTo(-r * 0.4, -r * 0.2);
                ctx.closePath();
            } else if (shape === 'cube') {
                const t = Date.now() / 500;
                const cos = Math.cos(t), sin = Math.sin(t);
                ctx.moveTo(r * cos, -r * 0.5);
                ctx.lineTo(r * 0.5 * cos + r * 0.3 * sin, -r * 0.5 + r * 0.3);
                ctx.lineTo(r * 0.5 * cos + r * 0.3 * sin, r * 0.3);
                ctx.lineTo(r * cos, r * 0.5 + r * 0.3);
                ctx.lineTo(-r * 0.3 * cos + r * 0.3 * sin, r * 0.5 + r * 0.3);
                ctx.lineTo(-r * 0.3 * cos + r * 0.3 * sin, -r * 0.5 + r * 0.3);
                ctx.closePath();
            } else {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
                    const rad = i % 2 === 0 ? r : r * 0.4;
                    ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
                }
                ctx.closePath();
            }
        }

        function drawPowerupShape(ctx, shape, r) {
            ctx.beginPath();
            if (shape === 'orb' || shape === 'core') {
                ctx.arc(0, 0, r, 0, Math.PI * 2);
            } else if (shape === 'polygon') {
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
                ctx.closePath();
            } else if (shape === 'ring') {
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2, true);
            } else if (shape === 'runestone') {
                ctx.rect(-r * 0.5, -r * 0.7, r, r * 1.4);
            } else if (shape === 'card') {
                ctx.rect(-r * 0.6, -r * 0.8, r * 1.2, r * 1.6);
            } else if (shape === 'egg') {
                ctx.ellipse(0, 0, r * 0.6, r, 0, 0, Math.PI * 2);
            } else if (shape === 'relic') {
                ctx.rect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
                ctx.rect(-r * 0.5, -r * 0.5, r, r);
            } else {
                ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.7, 0);
                ctx.closePath();
            }
        }

        function drawDeathPreview(ctx, id, r) {
            r = r || 12;
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 1.5;
            if (id === 'death_shockwave' || id === 'death_annihilation') {
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
            } else if (id === 'death_supernova') {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#ffcc00';
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    ctx.beginPath(); ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
                }
            } else if (id === 'death_blackhole') {
                ctx.fillStyle = '#220044';
                ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#cc66ff';
                ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
            } else if (id === 'death_glitch') {
                const colors = ['#ff0000', '#00ff00', '#0000ff'];
                for (let i = 0; i < 6; i++) {
                    ctx.fillStyle = colors[i % 3];
                    ctx.fillRect(-r + Math.random() * r * 2, -r + Math.random() * r * 2, 4, 4);
                }
            } else {
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    ctx.beginPath(); ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
                }
            }
        }

        // 36x36 thumbnail on each card
        function drawCosmeticThumb(canvas, slot, itemId) {
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.translate(w / 2, h / 2);
            const slotDef = SD_COSMETIC_SLOTS.find(s => s.slot === slot);
            if (!slotDef) { ctx.restore(); return; }
            const item = slotDef.items.find(i => i.id === itemId);
            if (!item) { ctx.restore(); return; }
            const color = cosmeticColor(item);

            if (slot === 'hull') {
                ctx.strokeStyle = color; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, -6); ctx.lineTo(-5, 0); ctx.lineTo(-8, 6); ctx.closePath(); ctx.stroke();
            } else if (slot === 'bullets') {
                ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 4;
                drawBulletShape(ctx, item.shape, 6); ctx.fill(); ctx.shadowBlur = 0;
            } else if (slot === 'thruster') {
                ctx.strokeStyle = color; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-10, 0); ctx.lineTo(0, 4); ctx.stroke();
            } else if (slot === 'death') {
                drawDeathPreview(ctx, item.id, 10);
            } else if (slot === 'starbits') {
                ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 4;
                drawStarbitShape(ctx, item.shape, 8); ctx.fill(); ctx.shadowBlur = 0;
            } else if (slot === 'powerups') {
                ctx.fillStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 4;
                drawPowerupShape(ctx, item.shape, 10); ctx.fill(); ctx.shadowBlur = 0;
            }
            ctx.restore();
        }

        // 120x80 composite preview
        function updateStardustPreview(slot, itemId, balance) {
            // Clear SVG and rebuild
            sdPreviewSvg.innerHTML = `
                <defs>
                    <filter id="svgGlow">
                        <feGaussianBlur stdDeviation="2" result="blur"/>
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <rect width="120" height="80" fill="#000"/>
            `;

            if (slot === 'loadout' || !itemId) {
                const item = SD_LOADOUTS.find(l => l.id === itemId);
                sdPreviewLabelEl.textContent = item ? item.name : 'Select an item';
                sdPreviewActionEl.textContent = item ? item.desc : '';
                sdPreviewActionEl.style.color = '#aaa';
                updateBuyButton(slot, item, balance);
                if (item) drawLoadoutPreview(item.id);
                return;
            }

            const slotDef = SD_COSMETIC_SLOTS.find(s => s.slot === slot);
            if (!slotDef) return;
            const item = slotDef.items.find(i => i.id === itemId);
            if (!item) return;
            const owned = item.cost === 0 || activeProfile?.stardustUnlocks?.ownedCosmetics?.includes(itemId);
            const equipped = activeProfile?.stardustUnlocks?.cosmetics?.[slot] === itemId;

            sdPreviewLabelEl.textContent = item.name + (equipped ? ' — EQUIPPED' : '');
            if (owned || item.cost === 0) {
                sdPreviewActionEl.textContent = 'ENTER to equip';
                sdPreviewActionEl.style.color = '#44cc44';
            } else if (balance >= item.cost) {
                sdPreviewActionEl.textContent = `${item.cost} ✦ — ENTER to buy`;
                sdPreviewActionEl.style.color = '#ffcc00';
            } else {
                sdPreviewActionEl.textContent = `${item.cost} ✦ (need ${item.cost - balance} more)`;
                sdPreviewActionEl.style.color = '#ff4444';
            }

            updateBuyButton(slot, item, balance);
            drawCosmeticPreview(slot, itemId);
        }

        // Ship polygon points (centered at 60,40, pointing right)
        const SHIP_POINTS = '78,40 46,29 51,40 46,51';

        function drawLoadoutPreview(loadoutId) {
            const ship = `<polygon points="${SHIP_POINTS}" stroke="white" stroke-width="2" fill="none"/>`;
            let bullets = '';

            switch (loadoutId) {
                case 'standard':
                    bullets = `<circle cx="90" cy="40" r="4" fill="white" filter="url(#svgGlow)"/>`;
                    break;
                case 'spread_shot':
                    bullets = `
                        <circle cx="88" cy="32" r="3" fill="#ffcc00" filter="url(#svgGlow)"/>
                        <circle cx="94" cy="40" r="3" fill="#ffcc00" filter="url(#svgGlow)"/>
                        <circle cx="88" cy="48" r="3" fill="#ffcc00" filter="url(#svgGlow)"/>
                    `;
                    break;
                case 'rapid_fire':
                    bullets = `
                        <circle cx="86" cy="40" r="3" fill="#00ffff" filter="url(#svgGlow)"/>
                        <circle cx="94" cy="40" r="3" fill="#00ffff" filter="url(#svgGlow)"/>
                        <circle cx="102" cy="40" r="3" fill="#00ffff" filter="url(#svgGlow)"/>
                    `;
                    break;
                case 'piercing_bolt':
                    bullets = `
                        <line x1="82" y1="40" x2="110" y2="40" stroke="#3366ff" stroke-width="1" opacity="0.5"/>
                        <circle cx="90" cy="40" r="4" fill="#3366ff" filter="url(#svgGlow)"/>
                    `;
                    break;
                case 'missiles':
                    bullets = `
                        <polygon points="94,36 102,40 94,44" fill="#ff6600" filter="url(#svgGlow)"/>
                        <circle cx="88" cy="40" r="5" fill="#ff4400" opacity="0.6"/>
                    `;
                    break;
            }

            sdPreviewSvg.insertAdjacentHTML('beforeend', ship + bullets);
        }

        function drawCosmeticPreview(slot, itemId) {
            const hullId = activeProfile?.stardustUnlocks?.cosmetics?.hull || 'hull_spectre';
            const hullItem = SD_COSMETIC_SLOTS[0].items.find(i => i.id === (slot === 'hull' ? itemId : hullId));
            const hullColor = cosmeticColor(hullItem);

            let ship = `<polygon points="${SHIP_POINTS}" stroke="${hullColor}" stroke-width="2" fill="none"/>`;
            let overlay = '';

            const slotDef = SD_COSMETIC_SLOTS.find(s => s.slot === slot);
            const item = slotDef?.items.find(i => i.id === itemId);
            if (!item) { sdPreviewSvg.insertAdjacentHTML('beforeend', ship); return; }
            const color = cosmeticColor(item);

            if (slot === 'bullets') {
                overlay = drawSvgBulletShape(color, item.shape, 60, 40, 8);
            } else if (slot === 'thruster') {
                overlay = `<line x1="50" y1="35" x2="38" y2="40" stroke="${color}" stroke-width="2"/>
                          <line x1="38" y1="40" x2="50" y2="45" stroke="${color}" stroke-width="2"/>`;
            } else if (slot === 'death') {
                overlay = drawSvgDeathEffect(item.id, 84, 40, 14);
            } else if (slot === 'starbits') {
                overlay = `<g transform="translate(82,22)" filter="url(#svgGlow)">
                    ${drawSvgStarbitShape(color, item.shape, 10)}
                </g>`;
            } else if (slot === 'powerups') {
                overlay = `<g transform="translate(38,58)" filter="url(#svgGlow)">
                    ${drawSvgPowerupShape(color, item.shape, 12)}
                </g>`;
            }

            sdPreviewSvg.insertAdjacentHTML('beforeend', ship + overlay);
        }

        function drawSvgBulletShape(color, shape, cx, cy, r) {
            const filter = 'filter="url(#svgGlow)"';
            switch (shape) {
                case 'diamond':
                    return `<polygon points="${cx},${cy-r} ${cx+r*0.6},${cy} ${cx},${cy+r} ${cx-r*0.6},${cy}" fill="${color}" ${filter}/>`;
                case 'triangle':
                    return `<polygon points="${cx},${cy-r} ${cx+r},${cy+r*0.7} ${cx-r},${cy+r*0.7}" fill="${color}" ${filter}/>`;
                case 'square':
                    return `<rect x="${cx-r*0.6}" y="${cy-r*0.6}" width="${r*1.2}" height="${r*1.2}" fill="${color}" ${filter}/>`;
                case 'star':
                    let points = '';
                    for (let i = 0; i < 5; i++) {
                        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                        points += `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} `;
                    }
                    return `<polygon points="${points.trim()}" fill="${color}" ${filter}/>`;
                default: // circle
                    return `<circle cx="${cx}" cy="${cy}" r="${r*0.6}" fill="${color}" ${filter}/>`;
            }
        }

        function drawSvgDeathEffect(id, cx, cy, r) {
            let svg = '';
            if (id === 'death_shockwave' || id === 'death_annihilation') {
                svg = `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="#ff4444" stroke-width="1.5" fill="none"/>
                       <circle cx="${cx}" cy="${cy}" r="${r*0.6}" stroke="#ff4444" stroke-width="1.5" fill="none"/>`;
            } else if (id === 'death_supernova') {
                svg = `<circle cx="${cx}" cy="${cy}" r="${r*0.3}" fill="white"/>`;
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    const x2 = cx + Math.cos(a) * r;
                    const y2 = cy + Math.sin(a) * r;
                    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#ffcc00" stroke-width="1.5"/>`;
                }
            } else if (id === 'death_blackhole') {
                svg = `<circle cx="${cx}" cy="${cy}" r="${r*0.8}" fill="#220044"/>
                       <circle cx="${cx}" cy="${cy}" r="${r}" stroke="#cc66ff" stroke-width="1.5" fill="none"/>`;
            } else if (id === 'death_glitch') {
                const colors = ['#ff0000', '#00ff00', '#0000ff'];
                for (let i = 0; i < 6; i++) {
                    const x = cx - r + Math.random() * r * 2;
                    const y = cy - r + Math.random() * r * 2;
                    svg += `<rect x="${x}" y="${y}" width="4" height="4" fill="${colors[i % 3]}"/>`;
                }
            } else {
                // Default explosion
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    const x2 = cx + Math.cos(a) * r;
                    const y2 = cy + Math.sin(a) * r;
                    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#ff4444" stroke-width="1.5"/>`;
                }
            }
            return svg;
        }

        function drawSvgStarbitShape(color, shape, r) {
            const filter = 'filter="url(#svgGlow)"';
            if (shape === 'heart') {
                return `<path d="M 0,${r*0.3} C ${-r},${-r*0.3} ${-r*0.5},${-r} 0,${-r*0.5} C ${r*0.5},${-r} ${r},${-r*0.3} 0,${r*0.3}" fill="${color}" ${filter}/>`;
            } else if (shape === 'diamond') {
                return `<polygon points="0,${-r} ${r*0.6},0 0,${r} ${-r*0.6},0" fill="${color}" ${filter}/>`;
            } else if (shape === 'cube') {
                return `<rect x="${-r*0.5}" y="${-r*0.5}" width="${r}" height="${r}" fill="${color}" ${filter}/>`;
            } else if (shape === 'moon') {
                return `<circle cx="0" cy="0" r="${r*0.6}" fill="${color}" ${filter}/>
                        <circle cx="${r*0.3}" cy="0" r="${r*0.5}" fill="#000"/>`;
            } else if (shape === 'diamond_spinning') {
                return `<polygon points="0,${-r} ${r*0.5},0 0,${r} ${-r*0.5},0" fill="${color}" ${filter} transform="rotate(45)"/>`;
            } else if (shape === 'fragment') {
                return `<polygon points="${-r*0.3},${-r} ${r*0.3},${-r*0.6} ${r*0.6},${-r*0.2} ${r*0.4},${r*0.5} ${-r*0.2},${r*0.7} ${-r*0.6},${r*0.2}" fill="${color}" ${filter}/>`;
            } else if (shape === 'prismatic') {
                return `<polygon points="0,${-r} ${r*0.3},${-r*0.3} ${r},0 ${r*0.3},${r*0.3} 0,${r} ${-r*0.3},${r*0.3} ${-r},0 ${-r*0.3},${-r*0.3}" fill="${color}" ${filter}/>`;
            }
            // Default: 4-pointed star
            return `<polygon points="0,${-r} ${r*0.3},${-r*0.3} ${r},0 ${r*0.3},${r*0.3} 0,${r} ${-r*0.3},${r*0.3} ${-r},0 ${-r*0.3},${-r*0.3}" fill="${color}" ${filter}/>`;
        }

        function drawSvgPowerupShape(color, shape, r) {
            const filter = 'filter="url(#svgGlow)"';
            if (shape === 'ring') {
                return `<circle cx="0" cy="0" r="${r*0.7}" stroke="${color}" stroke-width="2" fill="none" ${filter}/>`;
            } else if (shape === 'polygon') {
                let points = '';
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
                    points += `${Math.cos(a) * r},${Math.sin(a) * r} `;
                }
                return `<polygon points="${points.trim()}" fill="${color}" ${filter}/>`;
            } else if (shape === 'rune') {
                return `<circle cx="0" cy="0" r="${r*0.7}" fill="${color}" opacity="0.8" ${filter}/>
                        <polygon points="0,${-r*0.4} ${r*0.35},0 0,${r*0.4} ${-r*0.35},0" fill="#000"/>`;
            } else if (shape === 'card') {
                return `<rect x="${-r*0.6}" y="${-r*0.8}" width="${r*1.2}" height="${r*1.6}" rx="2" fill="${color}" opacity="0.9" ${filter}/>
                        <rect x="${-r*0.35}" y="${-r*0.5}" width="${r*0.7}" height="${r*0.7}" fill="#000" opacity="0.5"/>`;
            } else if (shape === 'core') {
                return `<circle cx="0" cy="0" r="${r*0.8}" fill="${color}" ${filter}/>
                        <circle cx="0" cy="0" r="${r*0.4}" fill="white" opacity="0.8"/>`;
            } else if (shape === 'egg') {
                return `<ellipse cx="0" cy="0" rx="${r*0.6}" ry="${r*0.8}" fill="${color}" ${filter}/>
                        <ellipse cx="0" cy="${-r*0.2}" rx="${r*0.3}" ry="${r*0.4}" fill="white" opacity="0.4"/>`;
            } else if (shape === 'relic') {
                return `<polygon points="0,${-r} ${r*0.5},${-r*0.3} ${r*0.3},${r*0.5} ${-r*0.3},${r*0.5} ${-r*0.5},${-r*0.3}" fill="${color}" ${filter}/>
                        <circle cx="0" cy="0" r="${r*0.2}" fill="white"/>`;
            }
            // Default: diamond
            return `<polygon points="0,${-r} ${r*0.7},0 0,${r} ${-r*0.7},0" fill="${color}" ${filter}/>`;
        }

        let currentModifier = MODIFIERS[0];
        let modifierSelectIndex = 0;

        // Active powerups (timers in frames)
        let activePowerups = {};
        POWERUP_TYPES.forEach(p => activePowerups[p.id] = 0);

        // Player ship
        const ship = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            angle: -Math.PI / 2,
            velocity: { x: 0, y: 0 },
            radius: sc(15),
            thrust: 0.06,
            friction: 0.99,
            rotSpeed: 0.07,
            momentumBoost: 0,
            invulnerable: false,
            invulnerableTimer: 0,
            blinkOn: true,
            blinkTimer: 0
        };

        // Game objects
        let bullets = [];
        let asteroids = [];
        let particles = [];
        let powerups = [];
        let starBits = [];
        let runStarBits = 0;
        let enemies = [];
        let enemyBullets = [];
        let gravityWells = [];
        let voidCacheActive = false;
        let voidCacheTimer = 0;
        let voidCacheReturnState = null;

        // ============================================================================
