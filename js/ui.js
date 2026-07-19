        // SECTION 10: UI UPDATE — DOM manipulation, state-based display toggling
        // ============================================================================

        function updateUI() {
            modifierSelectEl.style.display = 'none';
            gameTitleEl.style.display = 'none';
            levelTransitionEl.style.display = 'none';
            scoreEl.style.display = 'none';
            messageEl.style.display = 'none';
            highscoresEl.style.display = 'none';
            profileSelectEl.style.display = 'none';
            profileNameInputEl.style.display = 'none';
            profileNameGoEl.style.display = 'none';
            menuActionsEl.style.display = 'none';
            pauseMenuEl.style.display = 'none';
            restartConfirmEl.style.display = 'none';
            constellationMapEl.style.display = 'none';
            graphicsMenuEl.style.display = 'none';
            shopMenuEl.style.display = 'none';
            stardustShopMenuEl.style.display = 'none';
            comboBarEl.style.display = 'none';
            btnStardustShopEl.style.display = 'none';
            profileBackBtnEl.style.display = 'none';
            savesMenuEl.style.display = 'none';
            highscoresMenuEl.style.display = 'none';
            powerupHudEl.style.display = 'none';

            if (gameState === 'menu') {
                gameTitleEl.style.display = 'block';
                messageEl.style.display = 'none';
                highscoresEl.style.display = 'none';
                if (activeProfile) {
                    scoreEl.textContent = `${activeProfile.name} · ${activeProfile.starBits} ◆ · ${activeProfile.stardust ?? 0} ✦`;
                    scoreEl.style.display = 'block';
                    menuActionsEl.style.display = 'flex';
                    const hasRun = activeProfile.activeRun != null;
                    btnStartEl.style.display = hasRun ? 'none' : 'block';
                    btnResumeEl.style.display = hasRun ? 'block' : 'none';
                    btnRestartEl.style.display = hasRun ? 'block' : 'none';
                    btnStardustShopEl.style.display = 'block';
                    if (hasRun) {
                        const runMod = activeProfile.activeRun.modifierId !== 'none' ? ` [${activeProfile.activeRun.modifierId}]` : '';
                        btnResumeEl.textContent = `Resume Run — Lv.${activeProfile.activeRun.level}${runMod}`;
                    } else {
                        btnResumeEl.textContent = 'Resume Run';
                    }
                } else {
                    btnStardustShopEl.style.display = 'none';
                    btnStartEl.style.display = 'block';
                    btnResumeEl.style.display = 'none';
                    btnRestartEl.style.display = 'none';
                }
            } else if (gameState === 'profile_select') {
                scoreEl.textContent = 'SELECT PROFILE';
                scoreEl.style.display = 'block';
                profileSelectEl.style.display = 'block';
                renderProfileList();
            } else if (gameState === 'saves_menu') {
                scoreEl.textContent = 'SAVES';
                scoreEl.style.display = 'block';
                savesMenuEl.style.display = 'flex';
            } else if (gameState === 'highscores_menu') {
                lastHighScoreRank = -1;
                scoreEl.style.display = 'none';
                highscoresMenuEl.style.display = 'flex';
                renderHighscoresMenu();
            } else if (gameState === 'profile_create') {
                scoreEl.textContent = 'NEW PROFILE';
                scoreEl.style.display = 'block';
                profileNameInputEl.style.display = 'inline-block';
                profileNameGoEl.style.display = 'inline-block';
                profileBackBtnEl.style.display = 'flex';
                profileNameInputEl.focus();
            } else if (gameState === 'constellation_map') {
                scoreEl.textContent = 'SELECT BIOME';
                scoreEl.style.display = 'block';
                constellationMapEl.style.display = 'block';
                renderConstellationMap();
            } else if (gameState === 'modifier_select') {
                scoreEl.textContent = 'SELECT MODIFIER';
                scoreEl.style.display = 'block';
                modifierSelectEl.style.display = 'block';
                renderModifierList();
            } else if (gameState === 'graphics_menu') {
                scoreEl.textContent = 'SETTINGS';
                scoreEl.style.display = 'block';
                graphicsMenuEl.style.display = 'block';
                renderGraphicsList();
            } else if (gameState === 'shop') {
                scoreEl.textContent = 'UPGRADE SHOP';
                scoreEl.style.display = 'block';
                shopMenuEl.style.display = 'block';
                renderShopList();
            } else if (gameState === 'stardust_shop') {
                scoreEl.textContent = 'STARDUST UNLOCKS';
                scoreEl.style.display = 'block';
                stardustShopMenuEl.style.display = 'block';
                renderStardustShop();
            } else if (gameState === 'playing') {
                scoreEl.style.display = 'block';
            } else if (gameState === 'level_transition') {
                levelTransitionEl.textContent = level >= 20 ? 'SYSTEM SHATTERED' : `LEVEL ${level + 1}`;
                levelTransitionEl.style.display = 'block';
                scoreEl.textContent = `Score: ${score} | Lives: ${lives}`;
                scoreEl.style.display = 'block';
            } else if (gameState === 'gameover') {
                const modLabel = currentModifier.id !== 'none' ? ` [${currentModifier.label}]` : '';
                scoreEl.textContent = `Score: ${lastScore}${modLabel}`;
                scoreEl.style.display = 'block';
                let msg = '';
                if (lastUnlockedModifier) {
                    const unlockedMod = MODIFIERS.find(m => m.id === lastUnlockedModifier);
                    msg += `Unlocked: ${unlockedMod.label}! `;
                }
                if (lastStardustEarned > 0) {
                    msg += `+${lastStardustEarned} ✦ Stardust`;
                }
                messageEl.textContent = msg.trim();
                messageEl.style.display = 'block';
                highscoresEl.style.display = 'block';
            } else if (gameState === 'victory') {
                const modLabel = currentModifier.id !== 'none' ? ` [${currentModifier.label}]` : '';
                scoreEl.textContent = `SYSTEM SHATTERED`;
                scoreEl.style.display = 'block';
                let msg = `Score: ${formatScore(lastScore)}${modLabel}`;
                if (lastStardustEarned > 0) {
                    msg += ` · +${lastStardustEarned} ✦ Stardust`;
                }
                messageEl.textContent = msg;
                messageEl.style.display = 'block';
                highscoresEl.style.display = 'block';
            } else if (gameState === 'paused') {
                scoreEl.textContent = `Score: ${score} | Lives: ${lives}`;
                scoreEl.style.display = 'block';
                pauseMenuEl.style.display = 'block';
                const pauseOptions = pauseMenuEl.querySelectorAll('.pause-option');
                pauseOptions.forEach((opt, i) => {
                    opt.classList.toggle('selected', i === pauseMenuIndex);
                });
            } else if (gameState === 'restart_confirm') {
                scoreEl.style.display = 'none';
                restartConfirmEl.style.display = 'block';
                const restartOptions = restartConfirmEl.querySelectorAll('.restart-option');
                restartOptions.forEach((opt, i) => {
                    opt.classList.toggle('selected', i === restartMenuIndex);
                });
            }
            renderHighScores();
            // Inject gameover menu AFTER renderHighScores so it doesn't get overwritten
            if (gameState === 'gameover') {
                const gameoverOptions = ['Restart', 'Shop', 'Quit to Menu'];
                let goHtml = '';
                gameoverOptions.forEach((opt, i) => {
                    const sel = i === gameoverMenuIndex ? ' selected' : '';
                    goHtml += `<div class="pause-option${sel}" data-tap-action="gameover" data-tap-index="${i}"><span class="pause-arrow">&#9654;</span>${opt}</div>`;
                });
                highscoresEl.innerHTML = goHtml + highscoresEl.innerHTML;
            }
            if (gameState === 'victory') {
                const victoryOptions = ['Quit to Menu'];
                let vicHtml = '';
                victoryOptions.forEach((opt, i) => {
                    const sel = i === gameoverMenuIndex ? ' selected' : '';
                    vicHtml += `<div class="pause-option${sel}" data-tap-action="victory" data-tap-index="${i}"><span class="pause-arrow">&#9654;</span>${opt}</div>`;
                });
                highscoresEl.innerHTML = vicHtml + highscoresEl.innerHTML;
            }
            if (typeof updateTouchPause === 'function') updateTouchPause();
        }

        function formatScore(n) {
            return n.toLocaleString();
        }

        const MOD_ICON_SVGS = {
            tiny_ship: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#4fc3f7" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"><polygon points="8,2 12,12 8,9 4,12"/></svg>',
            speed_demon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ff4444" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"><polyline points="10,1 5,8 9,8 6,15"/></svg>',
            dark_mode: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#aa66ff" stroke-width="1.2"><path d="M10,2 A6,6 0 1,0 10,14 A4,4 0 1,1 10,2"/></svg>',
            bullet_storm: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ffcc00" stroke-width="1.2" stroke-linecap="round"><line x1="4" y1="3" x2="4" y2="13"/><line x1="8" y1="1" x2="8" y2="15"/><line x1="12" y1="3" x2="12" y2="13"/></svg>',
            glass_cannon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"><polygon points="8,1 14,8 8,15 2,8"/><line x1="8" y1="5" x2="8" y2="11"/><line x1="5" y1="8" x2="11" y2="8"/></svg>'
        };

        function getModIconHtml(modId) {
            if (!modId || modId === 'none' || !MOD_ICON_SVGS[modId]) return '';
            return `<span class="hs-mod-icon">${MOD_ICON_SVGS[modId]}</span>`;
        }

        function getMedalHtml(rank) {
            if (rank === 1) return '<span class="hs-medal"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#ffcc00" stroke-width="1.2" stroke-linejoin="round"><polygon points="2,10 2,5 5,8 7,3 9,8 12,5 12,10"/></svg></span>';
            if (rank === 2) return '<span class="hs-medal"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#81d4fa" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"><polyline points="3,9 7,4 11,9"/></svg></span>';
            if (rank === 3) return '<span class="hs-medal"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#81d4fa" stroke-width="1.2" stroke-linejoin="round"><rect x="4.4" y="4.4" width="5.2" height="5.2" transform="rotate(45 7 7)"/></svg></span>';
            return '';
        }

        function renderHighScores() {
            const scores = getHighScores();
            if (scores.length === 0 || highscoresEl.style.display === 'none') {
                highscoresEl.innerHTML = '';
                return;
            }
            let html = '<div class="hs-title">HIGH SCORES</div>';
            scores.slice(0, 8).forEach((entry, i) => {
                const isNew = i === lastHighScoreRank;
                const medal = getMedalHtml(i + 1);
                const modIcon = getModIconHtml(entry.modifier);
                const rankDisplay = medal || `<span class="hs-rank">${i + 1}.</span>`;
                html += `<div class="hs-entry${isNew ? ' hs-new' : ''}">`
                    + `<span class="hs-left">${rankDisplay}${modIcon}<span class="hs-score">${formatScore(entry.score)}</span></span>`
                    + `<span class="hs-right"><span>Lv.${entry.level}</span></span>`
                    + `</div>`;
            });
            highscoresEl.innerHTML = html;
        }

        function renderHighscoresMenu() {
            const scores = getHighScores();
            if (!scores || scores.length === 0) {
                highscoresListEl.innerHTML = '<div class="hs-empty">No scores yet</div>';
                hsLegendEl.innerHTML = '';
                hsProfileEl.textContent = '';
                return;
            }
            hsProfileEl.textContent = activeProfile ? activeProfile.name : 'GUEST';
            const usedMods = new Set();
            let html = '';
            scores.slice(0, 10).forEach((entry, i) => {
                const isNew = i === lastHighScoreRank;
                const rank = i + 1;
                const rankClass = rank === 1 ? ' hs-rank-1' : rank === 2 ? ' hs-rank-2' : rank === 3 ? ' hs-rank-3' : '';
                const rowClass = rank === 1 ? ' hs-rank-1-row' : '';
                const medal = getMedalHtml(rank);
                const rankDisplay = medal || `<span class="hs-rank${rankClass}">${String(rank).padStart(2, '0')}</span>`;
                const modId = entry.modifier || 'none';
                let modIcon = '<span class="hs-mod-icon"></span>';
                if (modId !== 'none' && MOD_ICON_SVGS[modId]) {
                    modIcon = getModIconHtml(modId);
                    usedMods.add(modId);
                }
                html += `<div class="hs-entry${isNew ? ' hs-new' : ''}${rowClass}">`
                    + rankDisplay
                    + modIcon
                    + `<span class="hs-score">${formatScore(entry.score)}</span>`
                    + `<span class="hs-level">Lv.${entry.level}</span>`
                    + `<span class="hs-date">${entry.date || ''}</span>`
                    + `</div>`;
            });
            highscoresListEl.innerHTML = html;
            if (usedMods.size > 0) {
                let legHtml = '';
                usedMods.forEach(modId => {
                    const mod = MODIFIERS.find(m => m.id === modId);
                    const label = mod ? mod.label : modId;
                    legHtml += `<span class="hs-leg-item">${MOD_ICON_SVGS[modId]}<span>${label}</span></span>`;
                });
                hsLegendEl.innerHTML = legHtml;
            } else {
                hsLegendEl.innerHTML = '';
            }
        }

        // ============================================================================
