        // SECTION 7: MENU RENDERING — Profile list, modifier select, shop, stardust shop
        // ============================================================================

        function renderProfileList() {
            profileList = getProfileList();
            let html = '';
            profileList.forEach((p, i) => {
                const best = p.highScores.length > 0 ? p.highScores[0].score : 0;
                const isSelected = i === profileSelectIndex;
                html += `<div class="ps-option${isSelected ? ' selected' : ''}" data-idx="${i}" data-tap-action="profile_select" data-tap-index="${i}">`
                    + `<span class="ps-arrow">&#9654;</span>${p.name}`
                    + `<div class="ps-info">Best: ${best} | ${p.starBits} ◆ | ${p.stats.gamesPlayed} games</div>`
                    + `</div>`;
            });
            html += `<div class="ps-option${profileSelectIndex === profileList.length ? ' selected' : ''}" data-idx="new" data-tap-action="profile_select" data-tap-index="new">`
                + `<span class="ps-arrow">&#9654;</span>[+] New Profile`
                + `<div class="ps-info">Create a new save file</div>`
                + `</div>`;
            html += `<div class="ps-option${profileSelectIndex === profileList.length + 1 ? ' selected' : ''}" data-idx="guest" data-tap-action="profile_select" data-tap-index="guest">`
                + `<span class="ps-arrow">&#9654;</span>[?] Guest Mode`
                + `<div class="ps-info">Play without saving progress</div>`
                + `</div>`;
            profileListEl.innerHTML = html;
        }

        function renderConstellationMap() {
            const unlocked = activeProfile ? activeProfile.unlockedBiomes : ['classic_void'];
            const selected = activeProfile ? activeProfile.selectedBiome : 'classic_void';
            if (constMapBriefing) {
                // Show briefing panel
                constNodesEl.style.display = 'none';
                constInfoEl.style.display = 'none';
                constBriefingEl.style.display = 'block';
                const biome = BIOMES[constMapIndex];
                const best = activeProfile?.biomeBestScores?.[biome.id] || 0;
                briefingNameEl.textContent = biome.name;
                briefingThreatEl.textContent = biome.threat;
                briefingThreatEl.className = 'briefing-threat ' + biome.threat;
                briefingDescEl.textContent = biome.desc;
                // Stats
                const baseline = BIOMES[0].stats;
                const statColors = { speed: '#4fc3f7', count: '#ff6644', friction: '#88ddff', magnet: '#ff88ff', rotation: '#ffcc00' };
                let statsHtml = '';
                for (const [key, val] of Object.entries(biome.stats)) {
                    const baseVal = baseline[key] || 1;
                    const ratio = Math.min(val / (baseVal * 2), 1);
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    const displayVal = key === 'friction' ? (1 - val).toFixed(2) + ' resistance' : val + '×';
                    statsHtml += `<div class="briefing-stat-row">`
                        + `<span class="briefing-stat-label">${label}</span>`
                        + `<div class="briefing-stat-bar"><div class="briefing-stat-fill" style="width:${ratio * 100}%;background:${statColors[key] || '#4fc3f7'}"></div></div>`
                        + `<span class="briefing-stat-val">${displayVal}</span>`
                        + `</div>`;
                }
                statsHtml += `<div class="briefing-enemy">Enemy: <span>${biome.enemyDesc}</span></div>`;
                statsHtml += `<div class="briefing-special">Special: <span>${biome.specialDesc}</span></div>`;
                statsHtml += `<div class="briefing-stat-row"><span class="briefing-stat-label">Score</span><span class="briefing-stat-val">${biome.scoreMult}×</span></div>`;
                statsHtml += `<div class="briefing-stat-row"><span class="briefing-stat-label">Star Bits</span><span class="briefing-stat-val">${biome.starBitMult}×</span></div>`;
                briefingStatsEl.innerHTML = statsHtml;
                briefingBestEl.textContent = best > 0 ? `Best: ${best.toLocaleString()}` : '';
                // Start preview animation
                startBiomePreview(biome);
            } else {
                // Show node grid
                constNodesEl.style.display = 'flex';
                constInfoEl.style.display = 'block';
                constBriefingEl.style.display = 'none';
                stopBiomePreview();
                let html = '';
                BIOMES.forEach((biome, i) => {
                    const isUnlocked = unlocked.includes(biome.id);
                    const isSelected = i === constMapIndex;
                    const isEquipped = biome.id === selected;
                    const lockClass = isUnlocked ? '' : ' locked';
                    const selClass = isSelected ? ' selected' : '';
                    const eqClass = isEquipped ? ' equipped' : '';
                    const best = activeProfile?.biomeBestScores?.[biome.id] || 0;
                    html += `<div class="const-node${selClass}${lockClass}${eqClass}" data-tap-action="const_node" data-tap-index="${i}">`
                        + `<span class="node-name">${biome.name}</span>`
                        + `<span class="node-mult">${biome.scoreMult}×</span>`
                        + (isUnlocked ? (best > 0 ? `<span class="node-mult">${best.toLocaleString()}</span>` : '') : '<span class="node-lock">&#128274;</span>')
                        + `</div>`;
                });
                constNodesEl.innerHTML = html;
                const biome = BIOMES[constMapIndex];
                const isUnlocked = unlocked.includes(biome.id);
                if (isUnlocked) {
                    const best = activeProfile?.biomeBestScores?.[biome.id] || 0;
                    constInfoEl.innerHTML = `<div class="info-name">${biome.name} · ${biome.scoreMult}×</div>`
                        + `<div class="info-desc">${biome.desc}</div>`
                        + (best > 0 ? `<div class="info-desc">Best: ${best.toLocaleString()}</div>` : '');
                } else {
                    const req = BIOME_UNLOCK_CHAIN[biome.id];
                    const reqBiome = BIOMES.find(b => b.id === req);
                    constInfoEl.innerHTML = `<div class="info-name">${biome.name} · ${biome.scoreMult}×</div>`
                        + `<div class="info-desc">Locked — Clear ${reqBiome?.name || req} Level 20</div>`;
                }
            }
        }

        // Biome preview animation
        let previewAsteroids = [];
        let previewParticles = [];
        let previewAnimFrame = null;
        function startBiomePreview(biome) {
            if (!briefingCanvasCtx) return;
            stopBiomePreview();
            previewAsteroids = [];
            previewParticles = [];
            // Handle DPR for sharp rendering
            const dpr = window.devicePixelRatio || 1;
            briefingCanvasEl.width = 160 * dpr;
            briefingCanvasEl.height = 100 * dpr;
            briefingCanvasCtx.scale(dpr, dpr);
            // Spawn 5 asteroids
            for (let i = 0; i < 5; i++) {
                previewAsteroids.push({
                    x: Math.random() * 160, y: Math.random() * 100,
                    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
                    size: 4 + Math.random() * 6, rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.02, color: biome.palette.accent
                });
            }
            function animatePreview() {
                briefingCanvasCtx.fillStyle = biome.palette.bg;
                briefingCanvasCtx.fillRect(0, 0, 160, 100);
                // Draw biome background effects
                drawPreviewBackground(biome, briefingCanvasCtx, 160, 100, Date.now() / 1000);
                // Update and draw asteroids
                previewAsteroids.forEach(a => {
                    a.x += a.vx; a.y += a.vy; a.rotation += a.rotSpeed;
                    if (a.x < -10) a.x = 170; if (a.x > 170) a.x = -10;
                    if (a.y < -10) a.y = 110; if (a.y > 110) a.y = -10;
                    briefingCanvasCtx.save();
                    briefingCanvasCtx.translate(a.x, a.y);
                    briefingCanvasCtx.rotate(a.rotation);
                    briefingCanvasCtx.strokeStyle = a.color;
                    briefingCanvasCtx.lineWidth = 1;
                    briefingCanvasCtx.beginPath();
                    briefingCanvasCtx.arc(0, 0, a.size, 0, Math.PI * 2);
                    briefingCanvasCtx.stroke();
                    briefingCanvasCtx.restore();
                });
                // Spawn biome particles
                if (biome.palette.particles && Math.random() > 0.7) {
                    const px = Math.random() * 160;
                    const py = biome.palette.particles === 'embers' ? 100 : Math.random() * 100;
                    previewParticles.push({ x: px, y: py, life: 1, color: biome.palette.accent });
                }
                // Update and draw particles
                previewParticles = previewParticles.filter(p => {
                    p.life -= 0.02;
                    if (biome.palette.particles === 'streaks') { p.y += 1.5; p.x += 0.3; }
                    else if (biome.palette.particles === 'embers') { p.y -= 0.8; p.x += (Math.random() - 0.5) * 0.3; }
                    else if (biome.palette.particles === 'spores') { p.y += 0.3; p.x += (Math.random() - 0.5) * 0.5; }
                    else if (biome.palette.particles === 'sparks') { p.y += 0.2; p.x += (Math.random() - 0.5) * 0.8; }
                    briefingCanvasCtx.fillStyle = p.color;
                    briefingCanvasCtx.globalAlpha = p.life;
                    briefingCanvasCtx.fillRect(p.x, p.y, 2, 2);
                    briefingCanvasCtx.globalAlpha = 1;
                    return p.life > 0;
                });
                previewAnimFrame = requestAnimationFrame(animatePreview);
            }
            animatePreview();
        }
        function stopBiomePreview() {
            if (previewAnimFrame) { cancelAnimationFrame(previewAnimFrame); previewAnimFrame = null; }
            previewAsteroids = []; previewParticles = [];
        }
        function drawPreviewBackground(biome, ctx, w, h, time) {
            // Classic Void: blue radial glow
            if (biome.id === 'classic_void') {
                const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.6);
                grd.addColorStop(0, 'rgba(40, 80, 200, 0.5)');
                grd.addColorStop(0.5, 'rgba(20, 50, 150, 0.25)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
            }
            // Rubble Field: Petrova line bands + orange gradient
            else if (biome.id === 'rubble_field') {
                const grd = ctx.createLinearGradient(0, h, 0, 0);
                grd.addColorStop(0, 'rgba(180, 60, 0, 0.4)');
                grd.addColorStop(0.5, 'rgba(80, 30, 0, 0.15)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
                // Petrova bands
                ctx.globalAlpha = 0.3 + Math.sin(time * 0.8) * 0.1;
                ctx.strokeStyle = '#ff6622';
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 2; i++) {
                    const y = h * (0.3 + i * 0.35) + Math.sin(time * 0.6 + i) * 4;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    for (let x = 0; x < w; x += 8) {
                        ctx.lineTo(x, y + Math.sin(x * 0.05 + time * 1.5 + i) * 2);
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            }
            // Drift Expanse: blue gradient + crystals + aurora
            else if (biome.id === 'drift_expanse') {
                const grd = ctx.createLinearGradient(0, 0, w * 0.3, h);
                grd.addColorStop(0, 'rgba(0, 40, 120, 0.45)');
                grd.addColorStop(0.5, 'rgba(0, 20, 80, 0.25)');
                grd.addColorStop(1, 'rgba(0, 10, 40, 0.15)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
                // Ice crystals
                ctx.strokeStyle = 'rgba(120, 200, 255, 0.2)';
                ctx.lineWidth = 0.8;
                for (let i = 0; i < 4; i++) {
                    const cx = 20 + i * 35;
                    const cy = 15 + (i % 2) * 25;
                    const size = 6 + i * 2;
                    ctx.beginPath();
                    for (let j = 0; j < 6; j++) {
                        const a = (j / 6) * Math.PI * 2 + time * 0.3;
                        const px = cx + Math.cos(a) * size;
                        const py = cy + Math.sin(a) * size;
                        if (j === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
                // Aurora band
                ctx.globalAlpha = 0.2 + Math.sin(time * 1.2) * 0.1;
                ctx.strokeStyle = '#88ccff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = 0; x < w; x += 4) {
                    const y = h * 0.6 + Math.sin(x * 0.04 + time * 2) * 5;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            // Dense Belt: amber glow + silhouettes
            else if (biome.id === 'dense_belt') {
                const grd = ctx.createRadialGradient(w * 0.6, h * 0.4, 0, w * 0.6, h * 0.4, w * 0.6);
                grd.addColorStop(0, 'rgba(200, 100, 0, 0.35)');
                grd.addColorStop(0.5, 'rgba(100, 50, 0, 0.15)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
                // Asteroid silhouettes
                ctx.fillStyle = 'rgba(50, 25, 0, 0.2)';
                for (let i = 0; i < 3; i++) {
                    const sx = 10 + i * 50;
                    const sy = 20 + (i % 2) * 30;
                    const size = 8 + i * 3;
                    ctx.beginPath();
                    ctx.arc(sx, sy, size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            // Mire Wastes: green/purple glow + bioluminescence
            else if (biome.id === 'mire_wastes') {
                const grd = ctx.createRadialGradient(w * 0.4, h * 0.5, 0, w * 0.4, h * 0.5, w * 0.6);
                grd.addColorStop(0, 'rgba(0, 100, 50, 0.35)');
                grd.addColorStop(0.5, 'rgba(30, 0, 60, 0.2)');
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, w, h);
                // Bioluminescent glow
                const pulse = 0.5 + Math.sin(time * 2) * 0.3;
                ctx.globalAlpha = 0.2 * pulse;
                ctx.fillStyle = '#00ff66';
                ctx.beginPath();
                ctx.arc(w * 0.3, h * 0.4, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 0.15 * pulse;
                ctx.fillStyle = '#6600cc';
                ctx.beginPath();
                ctx.arc(w * 0.7, h * 0.6, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        function renderModifierList() {
            const unlocked = activeProfile ? activeProfile.unlockedModifiers : ['none'];
            let html = '';
            MODIFIERS.forEach((mod, i) => {
                const isLocked = !unlocked.includes(mod.id);
                const isSelected = i === modifierSelectIndex;
                const lockClass = isLocked ? ' locked' : '';
                const selClass = isSelected ? ' selected' : '';
                let desc = mod.desc + ` · ${mod.mult}x score`;
                if (isLocked) {
                    const req = MODIFIER_UNLOCK[mod.id];
                    const prevMod = MODIFIERS.find(m => m.id === req.prev);
                    desc = `Locked — Beat Level ${req.level} with ${prevMod.label}`;
                }
                html += `<div class="mod-option${selClass}${lockClass}" data-tap-action="modifier" data-tap-index="${i}">`
                    + `<span class="mod-arrow">&#9654;</span>`
                    + `<span class="mod-lock">&#128274;</span>`
                    + `<span class="mod-icon">${MOD_ICON_SVGS[mod.id] || ''}</span>`
                    + `${mod.label}`
                    + `<div class="mod-desc">${desc}</div>`
                    + `</div>`;
            });
            modListEl.innerHTML = html;
        }

        function renderGraphicsList() {
            let html = '';

            // Section: Orientation
            html += '<div class="gfx-section">ORIENTATION</div>';
            const oriLabel = currentOrientation === 'landscape' ? 'Landscape' : 'Portrait';
            const oriSel = graphicsMenuIndex === 0 ? ' selected' : '';
            const oriCurrent = activeProfile && activeProfile.orientation === currentOrientation;
            html += `<div class="gfx-option${oriSel}" data-tap-action="settings" data-tap-index="0">`
                + `<span class="gfx-arrow">&#9654;</span>`
                + `Orientation: ${oriLabel}`
                + (oriCurrent ? '<span class="gfx-active">&#10003;</span>' : '')
                + `</div>`;

            // Section: Fullscreen
            if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
                html += '<div class="gfx-section">DISPLAY</div>';
                const fsSel = graphicsMenuIndex === 1 ? ' selected' : '';
                const fsLabel = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
                html += `<div class="gfx-option${fsSel}" data-tap-action="settings" data-tap-index="1">`
                    + `<span class="gfx-arrow">&#9654;</span>`
                    + `${fsLabel} (F)`
                    + `</div>`;
            }

            // Section: Audio
            html += '<div class="gfx-section">AUDIO</div>';
            const masterVol = activeProfile?.audioMaster ?? 80;
            const sfxVol = activeProfile?.audioSfx ?? 80;
            const musicVol = activeProfile?.audioMusic ?? 15;
            
            html += `<div class="gfx-slider" data-tap-action="audio_master">`
                + `Master: <input type="range" min="0" max="100" value="${masterVol}" class="gfx-range" data-audio="master">`
                + `<span class="gfx-vol-val">${masterVol}%</span></div>`;
            
            html += `<div class="gfx-slider" data-tap-action="audio_sfx">`
                + `SFX: <input type="range" min="0" max="100" value="${sfxVol}" class="gfx-range" data-audio="sfx">`
                + `<span class="gfx-vol-val">${sfxVol}%</span></div>`;
            
            html += `<div class="gfx-slider" data-tap-action="audio_music">`
                + `Music: <input type="range" min="0" max="100" value="${musicVol}" class="gfx-range" data-audio="music">`
                + `<span class="gfx-vol-val">${musicVol}%</span></div>`;

            gfxListEl.innerHTML = html;
            
            // Attach range input listeners
            gfxListEl.querySelectorAll('.gfx-range').forEach(range => {
                range.addEventListener('input', (e) => {
                    const type = e.target.dataset.audio;
                    const val = parseInt(e.target.value);
                    e.target.nextElementSibling.textContent = val + '%';
                    applyAudioVolume(type, val);
                });
                range.addEventListener('click', (e) => e.stopPropagation());
            });
        }

        function applyAudioVolume(type, val) {
            const normalized = val / 100;
            if (type === 'master' && masterGain) masterGain.gain.value = normalized;
            if (type === 'sfx' && sfxGain) sfxGain.gain.value = normalized;
            if (type === 'music' && musicGain) musicGain.gain.value = normalized * 0.5; // Music capped at 50%
            if (activeProfile) {
                if (type === 'master') activeProfile.audioMaster = val;
                if (type === 'sfx') activeProfile.audioSfx = val;
                if (type === 'music') activeProfile.audioMusic = val;
                saveProfile(activeProfile);
            }
        }

        function renderShopList() {
            const balance = activeProfile ? activeProfile.starBits : 0;
            shopBalanceEl.textContent = balance;
            let html = '';
            UPGRADES.forEach((upg, i) => {
                const level = activeProfile ? activeProfile.upgrades[upg.id] : 0;
                const maxed = level >= upg.maxLevel;
                const cost = maxed ? 0 : getUpgradeCost(upg.id);
                const canAfford = balance >= cost;
                const isSelected = i === shopMenuIndex;
                const selClass = isSelected ? ' selected' : '';
                const maxClass = maxed ? ' maxed' : '';
                const affordClass = !maxed && !canAfford ? ' cant-afford' : '';
                let costText = maxed ? 'MAX' : `${cost} ` + '<svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,0 6.3,3.7 10,3.7 7,6 8.3,10 5,7.5 1.7,10 3,6 0,3.7 3.7,3.7" fill="currentColor"/></svg>';
                let costClass = maxed ? ' maxed' : (!canAfford ? ' cant-afford' : '');
                let pips = '';
                for (let p = 0; p < upg.maxLevel; p++) {
                    pips += `<div class="shop-pip${p < level ? ' filled' : ''}"></div>`;
                }
                html += `<div class="shop-card${selClass}${maxClass}${affordClass}" data-tap-action="shop" data-tap-index="${i}">`
                    + `<div class="shop-icon" style="color:${upg.color}">${upg.svg}</div>`
                    + `<div class="shop-name">${upg.label}</div>`
                    + `<div class="shop-progress">${pips}</div>`
                    + `<div class="shop-cost${costClass}">${costText}</div>`
                    + `<div class="shop-desc">${upg.desc}</div>`
                    + `</div>`;
            });
            shopGridEl.innerHTML = html;
        }

        function buyUpgrade(upgradeId) {
            if (!activeProfile) return false;
            const level = activeProfile.upgrades[upgradeId];
            if (level >= 5) return false;
            const cost = getUpgradeCost(upgradeId);
            if (activeProfile.starBits < cost) return false;
            activeProfile.starBits -= cost;
            activeProfile.upgrades[upgradeId]++;
            playSfx('shop');
            saveProfile(activeProfile);
            return true;
        }

        // Stardust shop rendering
        function renderStardustShop() {
            const balance = activeProfile ? (activeProfile.stardust ?? 0) : 0;
            stardustBalanceEl.textContent = balance;

            // Top tabs
            const tabs = stardustTabsEl.querySelectorAll('.sd-tab');
            tabs.forEach((t, i) => t.classList.toggle('selected', i === sdShopTab));

            // Slot tabs (cosmetics only)
            if (sdShopTab === 1) {
                stardustSlotTabsEl.style.display = 'flex';
                let slotHtml = '';
                SD_COSMETIC_SLOTS.forEach((def, i) => {
                    const cls = i === sdShopSlot ? ' selected' : '';
                    slotHtml += `<div class="sd-slot-tab${cls}" data-tap-action="sd_slot" data-tap-index="${i}">${def.label}</div>`;
                });
                stardustSlotTabsEl.innerHTML = slotHtml;
            } else {
                stardustSlotTabsEl.style.display = 'none';
                stardustSlotTabsEl.innerHTML = '';
            }

            // Build list
            let html = '';
            let previewSlot = null;
            let previewItemId = null;

            if (sdShopTab === 0) {
                // Loadouts
                stardustListEl.classList.add('loadouts');
                const equipped = activeProfile ? activeProfile.selectedLoadout : 'standard';

                SD_LOADOUTS.forEach((item, i) => {
                    const isOwned = item.cost === 0 || activeProfile?.stardustUnlocks?.loadouts?.includes(item.id);
                    const isEquipped = equipped === item.id;
                    const isSelected = i === sdShopItem;
                    const canAfford = balance >= item.cost;

                    let statusHtml = '';
                    if (isEquipped) statusHtml = '<span class="sd-equipped">EQUIPPED</span>';
                    else if (isOwned) statusHtml = '<span class="sd-owned">OWNED — ENTER to equip</span>';
                    else statusHtml = `<span class="sd-cost">${item.cost} ✦</span>`;

                    html += `<div class="sd-item${isSelected ? ' selected' : ''}${isEquipped ? ' equipped' : ''}${!isOwned && !canAfford ? ' cant-afford' : ''}" data-tap-action="sd_item" data-tap-index="${i}">`
                        + `<div class="sd-meta"><div class="sd-name">${item.name}</div><div class="sd-desc">${item.desc}</div>${statusHtml}</div></div>`;
                });

                previewSlot = 'loadout';
                previewItemId = SD_LOADOUTS[sdShopItem]?.id;
            } else {
                // Cosmetics
                stardustListEl.classList.remove('loadouts');
                const slotDef = SD_COSMETIC_SLOTS[sdShopSlot];
                const equipped = activeProfile?.stardustUnlocks?.cosmetics?.[slotDef.slot] || slotDef.items[0].id;

                slotDef.items.forEach((item, i) => {
                    const isOwned = item.cost === 0 || activeProfile?.stardustUnlocks?.ownedCosmetics?.includes(item.id);
                    const isEquipped = equipped === item.id;
                    const isSelected = i === sdShopItem;
                    const canAfford = balance >= item.cost;

                    let statusHtml = '';
                    if (isEquipped) statusHtml = '<span class="sd-equipped">EQUIPPED</span>';
                    else if (isOwned) statusHtml = '<span class="sd-owned">OWNED</span>';
                    else statusHtml = `<span class="sd-cost">${item.cost} ✦</span>`;

                    html += `<div class="sd-item${isSelected ? ' selected' : ''}${isEquipped ? ' equipped' : ''}${!isOwned && !canAfford ? ' cant-afford' : ''}" data-tap-action="sd_cosmetic" data-tap-slot="${slotDef.slot}" data-tap-index="${i}">`
                        + `<canvas class="sd-thumb" width="36" height="36" data-slot="${slotDef.slot}" data-item="${item.id}"></canvas>`
                        + `<div class="sd-meta"><div class="sd-name">${item.name}</div>${statusHtml}</div></div>`;
                });

                previewSlot = slotDef.slot;
                previewItemId = slotDef.items[sdShopItem]?.id;
            }

            stardustListEl.innerHTML = html;

            // Draw cosmetic thumbnails
            if (sdShopTab === 1) {
                stardustListEl.querySelectorAll('.sd-thumb').forEach(cvs => {
                    drawCosmeticThumb(cvs, cvs.dataset.slot, cvs.dataset.item);
                });
            }

            // Update preview + hint
            updateStardustPreview(previewSlot, previewItemId, balance);
            sdHintEl.textContent = sdShopTab === 0
                ? 'W/S loadout · Q/E tab · ENTER equip · ESC back'
                : 'A/D slot · W/S item · Q/E tab · ENTER buy/equip · ESC back';

            // Keep selected item visible
            const selectedEl = stardustListEl.querySelector('.sd-item.selected');
            if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        function buyStardustUnlock(category, id) {
            if (!activeProfile) return false;
            if (category === 'loadouts') {
                const item = SD_LOADOUTS.find(x => x.id === id);
                if (!item) return false;
                const owned = activeProfile.stardustUnlocks?.loadouts || [];
                if (owned.includes(id) || item.cost === 0) {
                    // Already owned or free — equip it
                    activeProfile.selectedLoadout = id;
                    saveProfile(activeProfile);
                    return true;
                }
                if (activeProfile.stardust < item.cost) return false;
                activeProfile.stardust -= item.cost;
                if (!activeProfile.stardustUnlocks) activeProfile.stardustUnlocks = { loadouts: [], cosmetics: {}, ownedCosmetics: [] };
                if (!activeProfile.stardustUnlocks.loadouts) activeProfile.stardustUnlocks.loadouts = [];
                activeProfile.stardustUnlocks.loadouts.push(id);
                activeProfile.selectedLoadout = id;
                saveProfile(activeProfile);
                return true;
            }
            return false;
        }

        function buyOrEquipCosmetic(slotId, itemId) {
            if (!activeProfile) return false;
            const slotDef = SD_COSMETIC_SLOTS.find(s => s.slot === slotId);
            if (!slotDef) return false;
            const item = slotDef.items.find(i => i.id === itemId);
            if (!item) return false;
            if (!activeProfile.stardustUnlocks) activeProfile.stardustUnlocks = { loadouts: [], cosmetics: {}, ownedCosmetics: [] };
            if (!activeProfile.stardustUnlocks.cosmetics) activeProfile.stardustUnlocks.cosmetics = {};
            if (!activeProfile.stardustUnlocks.ownedCosmetics) activeProfile.stardustUnlocks.ownedCosmetics = [];
            const isOwned = item.cost === 0 || activeProfile.stardustUnlocks.ownedCosmetics.includes(itemId);
            if (isOwned) {
                // Equip it
                activeProfile.stardustUnlocks.cosmetics[slotId] = itemId;
                saveProfile(activeProfile);
                return true;
            }
            // Try to buy
            if (activeProfile.stardust < item.cost) return false;
            activeProfile.stardust -= item.cost;
            activeProfile.stardustUnlocks.ownedCosmetics.push(itemId);
            activeProfile.stardustUnlocks.cosmetics[slotId] = itemId;
            saveProfile(activeProfile);
            return true;
        }

        // GO button for profile creation
        profileNameGoEl.addEventListener('click', (e) => {
            e.preventDefault();
            if (gameState === 'profile_create') {
                const name = profileNameInputEl.value.trim();
                if (name.length > 0 && name.length <= 12) {
                    const profiles = getAllProfiles();
                    if (!profiles[name]) {
                        activeProfile = createDefaultProfile(name);
                        saveProfile(activeProfile);
                        setActiveProfileName(name);
                        gameState = 'menu';
                        updateUI();
                    }
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;

            // --- Profile Select ---
            if (gameState === 'profile_select') {
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    profileSelectIndex = (profileSelectIndex - 1 + profileList.length + 2) % (profileList.length + 2);
                    renderProfileList();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    profileSelectIndex = (profileSelectIndex + 1) % (profileList.length + 2);
                    renderProfileList();
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    if (profileSelectIndex < profileList.length) {
                        activeProfile = loadProfile(profileList[profileSelectIndex].name);
                        if (activeProfile) {
                            setActiveProfileName(activeProfile.name);
                            gameState = 'menu';
                            updateUI();
                        }
                    } else if (profileSelectIndex === profileList.length) {
                        gameState = 'profile_create';
                        profileNameInputEl.value = '';
                        updateUI();
                    } else {
                        activeProfile = null;
                        gameState = 'menu';
                        updateUI();
                    }
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    activeProfile = null;
                    gameState = 'menu';
                    updateUI();
                } else if (e.key === 'n' || e.key === 'N') {
                    e.preventDefault();
                    gameState = 'profile_create';
                    profileNameInputEl.value = '';
                    updateUI();
                }
                return;
            }

            // Profile create
            if (gameState === 'profile_create') {
                if (e.code === 'Enter' || e.key === 'Enter') {
                    e.preventDefault();
                    const name = profileNameInputEl.value.trim();
                    if (name.length > 0 && name.length <= 12) {
                        const profiles = getAllProfiles();
                        if (!profiles[name]) {
                            activeProfile = createDefaultProfile(name);
                            saveProfile(activeProfile);
                            setActiveProfileName(name);
                            gameState = 'menu';
                            updateUI();
                        }
                    }
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    gameState = 'profile_select';
                    updateUI();
                }
                return;
            }

            // Menu
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameState === 'menu') {
                    if (activeProfile && activeProfile.activeRun) {
                        // Resume saved run
                        deserializeRun(activeProfile.activeRun);
                        activeProfile.activeRun = null;
                        saveProfile(activeProfile);
                    } else {
                        gameState = 'constellation_map';
                        constMapBriefing = false;
                        constMapIndex = 0;
                        updateUI();
                    }
                    return;
                }
            }

            // Menu - R to resume saved run
            if (e.code === 'KeyR') {
                e.preventDefault();
                if (gameState === 'menu' && activeProfile && activeProfile.activeRun) {
                    deserializeRun(activeProfile.activeRun);
                    activeProfile.activeRun = null;
                    saveProfile(activeProfile);
                    return;
                }
            }

            // Menu - U to open Stardust shop
            if (e.code === 'KeyU') {
                e.preventDefault();
                if (gameState === 'menu' && activeProfile) {
                    gameState = 'stardust_shop';
                    sdShopTab = 0;
                    sdShopSlot = 0;
                    sdShopItem = 0;
                    updateUI();
                    return;
                }
            }

            // Menu - S to open Star Bits shop
            if (e.code === 'KeyS') {
                e.preventDefault();
                if (gameState === 'menu' && activeProfile) {
                    gameState = 'shop';
                    shopReturnState = 'menu';
                    shopMenuIndex = 0;
                    updateUI();
                    return;
                }
            }

            // --- Gameover menu ---
            if (gameState === 'gameover') {
                const gameoverOptions = ['Restart', 'Shop', 'Quit to Menu'];
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    gameoverMenuIndex = (gameoverMenuIndex - 1 + gameoverOptions.length) % gameoverOptions.length;
                    updateUI();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    gameoverMenuIndex = (gameoverMenuIndex + 1) % gameoverOptions.length;
                    updateUI();
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    if (gameoverMenuIndex === 0) {
                        // Restart
                        gameState = 'constellation_map';
                        constMapBriefing = false;
                        constMapIndex = 0;
                        updateUI();
                    } else if (gameoverMenuIndex === 1) {
                        // Shop
                        gameState = 'shop';
                        shopReturnState = 'gameover';
                        shopMenuIndex = 0;
                        updateUI();
                    } else if (gameoverMenuIndex === 2) {
                        // Quit to menu
                        gameState = 'menu';
                        updateUI();
                    }
                }
                return;
            }

            // Victory menu
            if (gameState === 'victory') {
                if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    gameState = 'menu';
                    updateUI();
                }
                return;
            }

            // Menu actions
            if (gameState === 'menu') {
                if (e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                    if (activeProfile) exportProfile(activeProfile);
                } else if (e.key === 'i' || e.key === 'I') {
                    e.preventDefault();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.sav';
                    input.onchange = (ev) => {
                        const file = ev.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (re) => {
                            const imported = importProfile(re.target.result);
                            if (imported) {
                                saveProfile(imported);
                                activeProfile = imported;
                                setActiveProfileName(imported.name);
                                updateUI();
                            }
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                } else if (e.key === 'p' || e.key === 'P') {
                    e.preventDefault();
                    gameState = 'profile_select';
                    profileSelectIndex = 0;
                    renderProfileList();
                    updateUI();
                    return;
                } else if (e.key === 'g' || e.key === 'G') {
                    e.preventDefault();
                    graphicsReturnState = 'menu';
                    gameState = 'graphics_menu';
                    currentOrientation = activeProfile ? (activeProfile.orientation || 'landscape') : 'landscape';
                    RESOLUTIONS = getResolutions();
                    graphicsMenuIndex = 0;
                    renderGraphicsList();
                    updateUI();
                    return;
                } else if (e.key === 's' || e.key === 'S') {
                    e.preventDefault();
                    gameState = 'shop';
                    shopReturnState = 'menu';
                    shopMenuIndex = 0;
                    updateUI();
                    return;
                } else if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    toggleFullscreen();
                }
            }

            // --- Constellation map ---
            if (gameState === 'constellation_map') {
                const unlocked = activeProfile ? activeProfile.unlockedBiomes : ['classic_void'];
                if (!constMapBriefing) {
                    // Node grid mode
                    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                        e.preventDefault();
                        constMapIndex = (constMapIndex - 1 + BIOMES.length) % BIOMES.length;
                        updateUI();
                    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                        e.preventDefault();
                        constMapIndex = (constMapIndex + 1) % BIOMES.length;
                        updateUI();
                    } else if (e.code === 'Enter' || e.code === 'Space') {
                        e.preventDefault();
                        const biome = BIOMES[constMapIndex];
                        if (unlocked.includes(biome.id)) {
                            constMapBriefing = true;
                            updateUI();
                        }
                    } else if (e.code === 'Escape') {
                        e.preventDefault();
                        gameState = 'menu';
                        updateUI();
                    }
                } else {
                    // Briefing mode
                    if (e.code === 'Enter' || e.code === 'Space') {
                        e.preventDefault();
                        const biome = BIOMES[constMapIndex];
                        if (unlocked.includes(biome.id) && activeProfile) {
                            activeProfile.selectedBiome = biome.id;
                            saveProfile(activeProfile);
                            gameState = 'modifier_select';
                            modifierSelectIndex = 0;
                            currentModifier = MODIFIERS[0];
                            constMapBriefing = false;
                            updateUI();
                        }
                    } else if (e.code === 'Escape') {
                        e.preventDefault();
                        constMapBriefing = false;
                        updateUI();
                    }
                }
            }

            // --- Modifier select ---
            if (gameState === 'modifier_select') {
                const unlocked = activeProfile ? activeProfile.unlockedModifiers : ['none'];
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    modifierSelectIndex = (modifierSelectIndex - 1 + MODIFIERS.length) % MODIFIERS.length;
                    currentModifier = MODIFIERS[modifierSelectIndex];
                    updateUI();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    modifierSelectIndex = (modifierSelectIndex + 1) % MODIFIERS.length;
                    currentModifier = MODIFIERS[modifierSelectIndex];
                    updateUI();
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    if (unlocked.includes(currentModifier.id)) {
                        startGame();
                    }
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    gameState = 'menu';
                    updateUI();
                } else {
                    const num = parseInt(e.key);
                    if (num >= 1 && num <= MODIFIERS.length) {
                        const mod = MODIFIERS[num - 1];
                        if (unlocked.includes(mod.id)) {
                            modifierSelectIndex = num - 1;
                            currentModifier = mod;
                            startGame();
                        }
                    }
                }
            }

            // --- Graphics menu ---
            if (gameState === 'graphics_menu') {
                const totalItems = (document.fullscreenEnabled || document.webkitFullscreenEnabled) ? 2 : 1;
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    graphicsMenuIndex = (graphicsMenuIndex - 1 + totalItems) % totalItems;
                    renderGraphicsList();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    graphicsMenuIndex = (graphicsMenuIndex + 1) % totalItems;
                    renderGraphicsList();
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    if (graphicsMenuIndex === 0) {
                        // Toggle orientation and apply immediately
                        currentOrientation = currentOrientation === 'landscape' ? 'portrait' : 'landscape';
                        RESOLUTIONS = getResolutions();
                        // Auto-detect resolution for new orientation
                        const autoRes = getAutoResolution();
                        canvas.width = autoRes.width;
                        canvas.height = autoRes.height;
                        currentResolution = autoRes;
                        SCALE = Math.min(canvas.width, canvas.height) / 720;
                        applyScale();
        applyCanvasStyle();
                        if (activeProfile) {
                            activeProfile.orientation = currentOrientation;
                            saveProfile(activeProfile);
                        }
                        renderGraphicsList();
                    } else if (graphicsMenuIndex === 1 && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
                        toggleFullscreen();
                        renderGraphicsList();
                    }
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    gameState = graphicsReturnState;
                    updateUI();
                } else if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
            if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
                        toggleFullscreen();
                        renderGraphicsList();
                    }
                }
            }

            // Saves / High Scores menu
            if (gameState === 'saves_menu' || gameState === 'highscores_menu') {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    gameState = 'menu';
                    updateUI();
                    return;
                }
            }

            // Shop
            if (gameState === 'shop') {
                const cols = 2;
                const total = UPGRADES.length;
                const col = shopMenuIndex % cols;
                const row = Math.floor(shopMenuIndex / cols);
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    if (row > 0) shopMenuIndex -= cols;
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    if (shopMenuIndex + cols < total) shopMenuIndex += cols;
                } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    e.preventDefault();
                    if (col > 0) shopMenuIndex--;
                } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                    e.preventDefault();
                    if (col < cols - 1 && shopMenuIndex + 1 < total) shopMenuIndex++;
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    const upg = UPGRADES[shopMenuIndex];
                    if (buyUpgrade(upg.id)) {
                        renderShopList();
                    }
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    gameState = shopReturnState;
                    updateUI();
                }
                renderShopList();
            }

            // Stardust Shop
            if (gameState === 'stardust_shop') {
                if (e.code === 'KeyQ' || e.code === 'ArrowLeft') {
                    e.preventDefault();
                    sdShopTab = (sdShopTab - 1 + 2) % 2;
                    sdShopSlot = 0;
                    sdShopItem = 0;
                } else if (e.code === 'KeyE' || e.code === 'ArrowRight') {
                    e.preventDefault();
                    sdShopTab = (sdShopTab + 1) % 2;
                    sdShopSlot = 0;
                    sdShopItem = 0;
                } else if (sdShopTab === 1 && (e.code === 'KeyA' || e.code === 'KeyZ')) {
                    e.preventDefault();
                    sdShopSlot = (sdShopSlot - 1 + SD_COSMETIC_SLOTS.length) % SD_COSMETIC_SLOTS.length;
                    sdShopItem = 0;
                } else if (sdShopTab === 1 && (e.code === 'KeyD' || e.code === 'KeyX')) {
                    e.preventDefault();
                    sdShopSlot = (sdShopSlot + 1) % SD_COSMETIC_SLOTS.length;
                    sdShopItem = 0;
                } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    const items = sdShopTab === 0 ? SD_LOADOUTS : SD_COSMETIC_SLOTS[sdShopSlot].items;
                    sdShopItem = (sdShopItem - 1 + items.length) % items.length;
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    const items = sdShopTab === 0 ? SD_LOADOUTS : SD_COSMETIC_SLOTS[sdShopSlot].items;
                    sdShopItem = (sdShopItem + 1) % items.length;
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    confirmStardustPurchase();
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    gameState = 'menu';
                    updateUI();
                    return;
                }
                renderStardustShop();
            }

            // --- Playing: ESC to pause / F for fullscreen ---
            if (gameState === 'playing' && e.code === 'Escape') {
                e.preventDefault();
                pauseMenuIndex = 0;
                gameState = 'paused';
                updateUI();
                return;
            }

            // Playing - F to toggle fullscreen
            if (gameState === 'playing' && (e.key === 'f' || e.key === 'F')) {
                e.preventDefault();
                toggleFullscreen();
            }

            // --- Paused menu ---
            if (gameState === 'paused') {
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    pauseMenuIndex = (pauseMenuIndex - 1 + 5) % 5;
                    updateUI();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    pauseMenuIndex = (pauseMenuIndex + 1) % 5;
                    updateUI();
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    if (pauseMenuIndex === 0) {
                        gameState = 'playing';
                    } else if (pauseMenuIndex === 2) {
                        // Save & Quit
                        if (activeProfile) {
                            activeProfile.activeRun = serializeRun();
                            saveProfile(activeProfile);
                        }
                        stopMusic();
                        gameState = 'menu';
                    } else if (pauseMenuIndex === 3) {
                        // Settings
                        graphicsReturnState = 'paused';
                        gameState = 'graphics_menu';
                        currentOrientation = activeProfile ? (activeProfile.orientation || 'landscape') : 'landscape';
                        RESOLUTIONS = getResolutions();
                        graphicsMenuIndex = 0;
                        updateUI();
                        return;
                    } else if (pauseMenuIndex === 4) {
                        // Restart
                        gameState = 'restart_confirm';
                        restartMenuIndex = 0;
                        updateUI();
                        return;
                    } else {
                        stopMusic();
                        gameState = 'menu';
                    }
                    updateUI();
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    stopMusic();
                    gameState = 'menu';
                    updateUI();
                }
            }

            // --- Restart confirm ---
            if (gameState === 'restart_confirm') {
                if (e.code === 'ArrowUp' || e.code === 'KeyW') {
                    e.preventDefault();
                    restartMenuIndex = 0;
                    updateUI();
                } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    e.preventDefault();
                    restartMenuIndex = 1;
                    updateUI();
                } else if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    if (restartMenuIndex === 0) {
                        // Confirm restart
                        if (activeProfile) {
                            activeProfile.activeRun = null;
                            saveProfile(activeProfile);
                        }
                        stopMusic();
                        gameState = 'constellation_map';
                        constMapBriefing = false;
                        constMapIndex = 0;
                        updateUI();
                    } else {
                        // Cancel
                        if (activeProfile && activeProfile.activeRun) {
                            pauseMenuIndex = savedPauseMenuIndex;
                            gameState = 'paused';
                        } else {
                            gameState = 'menu';
                        }
                        updateUI();
                    }
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    // Cancel
                    if (activeProfile && activeProfile.activeRun) {
                        pauseMenuIndex = savedPauseMenuIndex;
                        gameState = 'paused';
                    } else {
                        gameState = 'menu';
                    }
                    updateUI();
                }
            }
        });
        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        // Create asteroid
        // ============================================================================
