        // SECTION 16: INPUT HANDLING — Keyboard, touch, mouse dispatch
        // ============================================================================

        // === MOBILE TOUCH CONTROLS ===
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const touchControlsEl = document.getElementById('touchControls');

        if (isMobile) {
            touchControlsEl.classList.add('active');
            const touchPauseEl = document.getElementById('touchPause');

            // Show/hide touch controls and pause button based on game state
            function updateTouchPause() {
                touchPauseEl.style.display = (gameState === 'playing') ? 'block' : 'none';
                if (gameState === 'playing') {
                    touchControlsEl.classList.add('active');
                } else {
                    touchControlsEl.classList.remove('active');
                }
            }

            // Pause button handler
            const btnPause = document.getElementById('btnPause');
            btnPause.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (gameState === 'playing') {
                    gameState = 'paused';
                    pauseMenuIndex = 0;
                    updateUI();
                }
                btnPause.classList.add('pressed');
            }, { passive: false });
            btnPause.addEventListener('touchend', (e) => {
                e.preventDefault();
                btnPause.classList.remove('pressed');
            }, { passive: false });
            btnPause.addEventListener('touchcancel', () => {
                btnPause.classList.remove('pressed');
            });

            // Map touch buttons to keys object (same as keyboard)
            const touchMap = {
                btnRotateLeft: 'ArrowLeft',
                btnRotateRight: 'ArrowRight',
                btnThrust: 'ArrowUp',
                btnShoot: 'Space'
            };

            Object.keys(touchMap).forEach(btnId => {
                const btn = document.getElementById(btnId);
                const key = touchMap[btnId];

                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    keys[key] = true;
                    btn.classList.add('pressed');
                }, { passive: false });

                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    keys[key] = false;
                    btn.classList.remove('pressed');
                }, { passive: false });

                btn.addEventListener('touchcancel', (e) => {
                    keys[key] = false;
                    btn.classList.remove('pressed');
                });
            });

            // Prevent pull-to-refresh and bounce
            document.addEventListener('touchmove', (e) => {
                if (gameState === 'playing') e.preventDefault();
            }, { passive: false });

            // Menu tap-to-select: delegate taps on menu items
            document.addEventListener('touchstart', (e) => {
                // Skip range inputs (audio sliders)
                if (e.target.tagName === 'INPUT') return;
                const target = e.target.closest('[data-tap-action]');
                if (!target) return;
                e.preventDefault();
                const action = target.getAttribute('data-tap-action');
                const idx = target.getAttribute('data-tap-index');

                // Global actions (work in any state)
                if (action === 'fullscreen') {
                    toggleFullscreen();
                    return;
                } else if (action === 'back') {
                    if (gameState === 'shop') {
                        gameState = shopReturnState;
                    } else if (gameState === 'stardust_shop') {
                        gameState = 'menu';
                    } else if (gameState === 'modifier_select') {
                        gameState = 'menu';
                    } else if (gameState === 'constellation_map') {
                        gameState = 'menu';
                    } else if (gameState === 'graphics_menu') {
                        gameState = graphicsReturnState;
                    } else if (gameState === 'profile_create') {
                        gameState = 'profile_select';
                    } else if (gameState === 'saves_menu' || gameState === 'highscores_menu') {
                        gameState = 'menu';
                    } else if (gameState === 'restart_confirm') {
                        if (activeProfile && activeProfile.activeRun) {
                            gameState = 'paused';
                        } else {
                            gameState = 'menu';
                        }
                    }
                    updateUI();
                    return;
                }

                // Saves menu export/import
                if (gameState === 'saves_menu') {
                    if (action === 'export') {
                        if (activeProfile) exportProfile(activeProfile);
                    } else if (action === 'import') {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.sav';
                        fileInput.onchange = (ev) => {
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
                        fileInput.click();
                    }
                    return;
                }

                if (gameState === 'menu') {
                    if (action === 'start') {
                        if (activeProfile && activeProfile.activeRun) {
                            deserializeRun(activeProfile.activeRun);
                            activeProfile.activeRun = null;
                            saveProfile(activeProfile);
                        } else {
                            gameState = 'constellation_map';
                        constMapBriefing = false;
                            constMapIndex = 0;
                            updateUI();
                        }
                    } else if (action === 'resume') {
                        if (activeProfile && activeProfile.activeRun) {
                            deserializeRun(activeProfile.activeRun);
                            activeProfile.activeRun = null;
                            saveProfile(activeProfile);
                        }
                    } else if (action === 'restart') {
                        gameState = 'restart_confirm';
                        restartMenuIndex = 0;
                        updateUI();
                    } else if (action === 'shop') {
                        gameState = 'shop';
                        shopReturnState = 'menu';
                        shopMenuIndex = 0;
                        updateUI();
                    } else if (action === 'stardust_shop') {
                    gameState = 'stardust_shop';
                    sdShopTab = 0;
                    sdShopSlot = 0;
                    sdShopItem = 0;
                    updateUI();
                    } else if (action === 'profile') {
                        gameState = 'profile_select';
                        profileSelectIndex = 0;
                        updateUI();
                    } else if (action === 'settings') {
                        graphicsReturnState = 'menu';
                        gameState = 'graphics_menu';
                        currentOrientation = activeProfile ? (activeProfile.orientation || 'landscape') : 'landscape';
                        RESOLUTIONS = getResolutions();
                        graphicsMenuIndex = 0;
                        updateUI();
                    } else if (action === 'saves') {
                        gameState = 'saves_menu';
                        updateUI();
                    } else if (action === 'highscores_menu') {
                        gameState = 'highscores_menu';
                        updateUI();
                    }
                } else if (gameState === 'constellation_map' && action === 'const_node' && idx !== null) {
                    constMapIndex = parseInt(idx);
                    const biome = BIOMES[constMapIndex];
                    const unlocked = activeProfile ? activeProfile.unlockedBiomes : ['classic_void'];
                    if (unlocked.includes(biome.id)) {
                        constMapBriefing = true;
                    }
                    updateUI();
                } else if (gameState === 'constellation_map' && action === 'const_start') {
                    const biome = BIOMES[constMapIndex];
                    const unlocked = activeProfile ? activeProfile.unlockedBiomes : ['classic_void'];
                    if (unlocked.includes(biome.id) && activeProfile) {
                        activeProfile.selectedBiome = biome.id;
                        saveProfile(activeProfile);
                        gameState = 'modifier_select';
                        modifierSelectIndex = 0;
                        currentModifier = MODIFIERS[0];
                        constMapBriefing = false;
                        stopBiomePreview();
                    }
                    updateUI();
                } else if (gameState === 'constellation_map' && action === 'const_back') {
                    constMapBriefing = false;
                    updateUI();
                } else if (gameState === 'modifier_select' && idx !== null) {
                    modifierSelectIndex = parseInt(idx);
                    const mod = MODIFIERS[modifierSelectIndex];
                    const unlocked = activeProfile ? activeProfile.unlockedModifiers : ['none'];
                    if (unlocked.includes(mod.id)) {
                        currentModifier = mod;
                        startGame();
                    }
                    updateUI();
                } else if (gameState === 'graphics_menu' && action === 'settings' && idx !== null) {
                    const tapIdx = parseInt(idx);
                    if (tapIdx === 0) {
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
                        graphicsMenuIndex = 0;
                        renderGraphicsList();
                    } else if (tapIdx === 1 && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
                        toggleFullscreen();
                        graphicsMenuIndex = 1;
                        renderGraphicsList();
                    }
                } else if (gameState === 'gameover' && idx !== null) {
                    gameoverMenuIndex = parseInt(idx);
                    const options = ['Restart', 'Shop', 'Quit to Menu'];
                    const choice = options[gameoverMenuIndex];
                    if (choice === 'Restart') {
                        gameState = 'constellation_map';
                        constMapBriefing = false;
                        constMapIndex = 0;
                        updateUI();
                    } else if (choice === 'Shop') {
                        gameState = 'shop';
                        shopReturnState = 'gameover';
                        shopMenuIndex = 0;
                        updateUI();
                    } else {
                        gameState = 'menu';
                        updateUI();
                    }
                } else if (gameState === 'victory' && action === 'victory') {
                    gameState = 'menu';
                    updateUI();
                } else if (gameState === 'shop' && idx !== null) {
                    shopMenuIndex = parseInt(idx);
                    const upg = UPGRADES[shopMenuIndex];
                    buyUpgrade(upg.id);
                    renderShopList();
                } else if (gameState === 'stardust_shop') {
                    if (action === 'sd_tab' && idx !== null) {
                        sdShopTab = parseInt(idx);
                        sdShopSlot = 0;
                        sdShopItem = 0;
                        renderStardustShop();
                    } else if (action === 'sd_slot' && idx !== null) {
                        sdShopSlot = parseInt(idx);
                        sdShopItem = 0;
                        renderStardustShop();
                    } else if (action === 'sd_item' && idx !== null) {
                        sdShopItem = parseInt(idx);
                        renderStardustShop();
                    } else if (action === 'sd_cosmetic' && idx !== null) {
                        const slot = target.getAttribute('data-tap-slot');
                        sdShopItem = parseInt(idx);
                        renderStardustShop();
                    } else if (action === 'sd_buy') {
                        confirmStardustPurchase();
                    }
                } else if (gameState === 'paused' && idx !== null) {
                    pauseMenuIndex = parseInt(idx);
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
                        savedPauseMenuIndex = pauseMenuIndex;
                        gameState = 'restart_confirm';
                        restartMenuIndex = 0;
                        updateUI();
                        return;
                    } else {
                        stopMusic();
                        gameState = 'menu';
                    }
                    updateUI();
                } else if (gameState === 'restart_confirm' && action === 'restart_confirm' && idx !== null) {
                    const restartIdx = parseInt(idx);
                    if (restartIdx === 0) {
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
                            gameState = 'paused';
                        } else {
                            gameState = 'menu';
                        }
                        updateUI();
                    }
                } else if (gameState === 'profile_select' && action === 'profile_select' && idx !== null) {
                    if (idx === 'new') {
                        gameState = 'profile_create';
                        updateUI();
                        document.getElementById('profileNameInput').focus();
                    } else if (idx === 'guest') {
                        activeProfile = null;
                        gameState = 'menu';
                        updateUI();
                    } else {
                        const pi = parseInt(idx);
                        const list = getProfileList();
                        if (pi >= 0 && pi < list.length) {
                            const loaded = loadProfile(list[pi].name);
                            if (loaded) {
                                activeProfile = loaded;
                                setActiveProfileName(list[pi].name);
                                gameState = 'menu';
                                updateUI();
                            }
                        }
                    }
                }
            }, { passive: false });
        }

        // === MOUSE CLICK SUPPORT (desktop) ===
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-tap-action]');
            if (!target) return;
            const action = target.getAttribute('data-tap-action');
            const idx = target.getAttribute('data-tap-index');

            // Global actions (work in any state)
            if (action === 'fullscreen') {
                toggleFullscreen();
                return;
            } else if (action === 'back') {
                if (gameState === 'shop') {
                    gameState = shopReturnState;
                } else if (gameState === 'stardust_shop') {
                    gameState = 'menu';
                } else if (gameState === 'modifier_select') {
                    gameState = 'menu';
                } else if (gameState === 'constellation_map') {
                    gameState = 'menu';
                } else if (gameState === 'graphics_menu') {
                    gameState = graphicsReturnState;
                } else if (gameState === 'profile_create') {
                    gameState = 'profile_select';
                } else if (gameState === 'saves_menu' || gameState === 'highscores_menu') {
                    gameState = 'menu';
                } else if (gameState === 'restart_confirm') {
                    if (activeProfile && activeProfile.activeRun) {
                        gameState = 'paused';
                    } else {
                        gameState = 'menu';
                    }
                }
                updateUI();
                return;
            }

            // Saves menu export/import
            if (gameState === 'saves_menu') {
                if (action === 'export') {
                    if (activeProfile) exportProfile(activeProfile);
                } else if (action === 'import') {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.sav';
                    fileInput.onchange = (ev) => {
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
                    fileInput.click();
                }
                return;
            }

            if (gameState === 'menu') {
                if (action === 'start') {
                    if (activeProfile && activeProfile.activeRun) {
                        deserializeRun(activeProfile.activeRun);
                        activeProfile.activeRun = null;
                        saveProfile(activeProfile);
                    } else {
                        gameState = 'constellation_map';
                        constMapBriefing = false;
                        constMapIndex = 0;
                        updateUI();
                    }
                } else if (action === 'resume') {
                    if (activeProfile && activeProfile.activeRun) {
                        deserializeRun(activeProfile.activeRun);
                        activeProfile.activeRun = null;
                        saveProfile(activeProfile);
                    }
                } else if (action === 'restart') {
                    gameState = 'restart_confirm';
                    restartMenuIndex = 0;
                    updateUI();
                } else if (action === 'shop') {
                    gameState = 'shop';
                    shopReturnState = 'menu';
                    shopMenuIndex = 0;
                    updateUI();
                } else if (action === 'stardust_shop') {
                    gameState = 'stardust_shop';
                    sdShopTab = 0;
                    sdShopSlot = 0;
                    sdShopItem = 0;
                    updateUI();
                } else if (action === 'profile') {
                    gameState = 'profile_select';
                    profileSelectIndex = 0;
                    updateUI();
                } else if (action === 'settings') {
                    graphicsReturnState = 'menu';
                    gameState = 'graphics_menu';
                    currentOrientation = activeProfile ? (activeProfile.orientation || 'landscape') : 'landscape';
                    RESOLUTIONS = getResolutions();
                    graphicsMenuIndex = 0;
                    updateUI();
                } else if (action === 'saves') {
                    gameState = 'saves_menu';
                    updateUI();
                } else if (action === 'highscores_menu') {
                    gameState = 'highscores_menu';
                    updateUI();
                }
            } else if (gameState === 'constellation_map' && action === 'const_node' && idx !== null) {
                constMapIndex = parseInt(idx);
                const biome = BIOMES[constMapIndex];
                const unlocked = activeProfile ? activeProfile.unlockedBiomes : ['classic_void'];
                if (unlocked.includes(biome.id)) {
                    constMapBriefing = true;
                }
                updateUI();
            } else if (gameState === 'constellation_map' && action === 'const_start') {
                const biome = BIOMES[constMapIndex];
                const unlocked = activeProfile ? activeProfile.unlockedBiomes : ['classic_void'];
                if (unlocked.includes(biome.id) && activeProfile) {
                    activeProfile.selectedBiome = biome.id;
                    saveProfile(activeProfile);
                    gameState = 'modifier_select';
                    modifierSelectIndex = 0;
                    currentModifier = MODIFIERS[0];
                    constMapBriefing = false;
                    stopBiomePreview();
                }
                updateUI();
            } else if (gameState === 'constellation_map' && action === 'const_back') {
                constMapBriefing = false;
                updateUI();
            } else if (gameState === 'modifier_select' && idx !== null) {
                modifierSelectIndex = parseInt(idx);
                const mod = MODIFIERS[modifierSelectIndex];
                const unlocked = activeProfile ? activeProfile.unlockedModifiers : ['none'];
                if (unlocked.includes(mod.id)) {
                    currentModifier = mod;
                    startGame();
                }
                updateUI();
            } else if (gameState === 'graphics_menu' && action === 'settings' && idx !== null) {
                const tapIdx = parseInt(idx);
                if (tapIdx === 0) {
                    // Toggle orientation
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
                    graphicsMenuIndex = 0;
                    renderGraphicsList();
                } else if (tapIdx === 1 && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
                    toggleFullscreen();
                    graphicsMenuIndex = 1;
                    renderGraphicsList();
                }
            } else if (gameState === 'gameover' && idx !== null) {
                gameoverMenuIndex = parseInt(idx);
                const options = ['Restart', 'Shop', 'Quit to Menu'];
                const choice = options[gameoverMenuIndex];
                if (choice === 'Restart') {
                    gameState = 'constellation_map';
                        constMapBriefing = false;
                    constMapIndex = 0;
                    updateUI();
                } else if (choice === 'Shop') {
                    gameState = 'shop';
                    shopReturnState = 'gameover';
                    shopMenuIndex = 0;
                    updateUI();
                } else {
                    gameState = 'menu';
                    updateUI();
                }
            } else if (gameState === 'victory' && action === 'victory') {
                gameState = 'menu';
                updateUI();
            } else if (gameState === 'shop' && idx !== null) {
                shopMenuIndex = parseInt(idx);
                const upg = UPGRADES[shopMenuIndex];
                buyUpgrade(upg.id);
                renderShopList();
            } else if (gameState === 'stardust_shop') {
                if (action === 'sd_tab' && idx !== null) {
                    sdShopTab = parseInt(idx);
                    sdShopSlot = 0;
                    sdShopItem = 0;
                    renderStardustShop();
                } else if (action === 'sd_slot' && idx !== null) {
                    sdShopSlot = parseInt(idx);
                    sdShopItem = 0;
                    renderStardustShop();
                } else if (action === 'sd_item' && idx !== null) {
                    sdShopItem = parseInt(idx);
                    renderStardustShop();
                } else if (action === 'sd_cosmetic' && idx !== null) {
                    const slot = target.getAttribute('data-tap-slot');
                    sdShopItem = parseInt(idx);
                    renderStardustShop();
                } else if (action === 'sd_buy') {
                    confirmStardustPurchase();
                }
            } else if (gameState === 'paused' && idx !== null) {
                pauseMenuIndex = parseInt(idx);
                if (pauseMenuIndex === 0) {
                    gameState = 'playing';
                } else if (pauseMenuIndex === 2) {
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
                        savedPauseMenuIndex = pauseMenuIndex;
                        gameState = 'restart_confirm';
                        restartMenuIndex = 0;
                        updateUI();
                        return;
                    } else {
                        stopMusic();
                    gameState = 'menu';
                }
                updateUI();
            } else if (gameState === 'restart_confirm' && action === 'restart_confirm' && idx !== null) {
                const restartIdx = parseInt(idx);
                if (restartIdx === 0) {
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
            } else if (gameState === 'profile_select' && action === 'profile_select' && idx !== null) {
                if (idx === 'new') {
                    gameState = 'profile_create';
                    updateUI();
                    document.getElementById('profileNameInput').focus();
                } else if (idx === 'guest') {
                    activeProfile = null;
                    gameState = 'menu';
                    updateUI();
                } else {
                    const pi = parseInt(idx);
                    const list = getProfileList();
                    if (pi >= 0 && pi < list.length) {
                        const loaded = loadProfile(list[pi].name);
                        if (loaded) {
                            activeProfile = loaded;
                            setActiveProfileName(list[pi].name);
                            gameState = 'menu';
                            updateUI();
                        }
                    }
                }
            }
        });

        // Stardust shop wheel/touchpad scrolling fallback
        if (sdScrollAreaEl) {
            sdScrollAreaEl.addEventListener('wheel', (e) => {
                if (gameState !== 'stardust_shop') return;
                e.preventDefault();
                sdScrollAreaEl.scrollTop += e.deltaY;
            }, { passive: false });
        }
