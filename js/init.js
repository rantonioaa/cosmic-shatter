        // SECTION 15: INIT & BOOTSTRAP — Event listeners, initial setup
        // ============================================================================

        // Start
        // Migrate old high scores if needed
        migrateOldHighScores();

        // Load active profile
        const savedName = getActiveProfileName();
        if (savedName) {
            activeProfile = loadProfile(savedName);
            if (activeProfile) {
                // Apply saved orientation and resolution
                if (activeProfile.orientation) {
                    currentOrientation = activeProfile.orientation;
                    RESOLUTIONS = getResolutions();
                }
                // Always auto-detect resolution (ignore stored resolution field)
                applyScale();
        applyCanvasStyle();
            } else {
                setActiveProfileName(null);
            }
        } else {
            // Auto-detect orientation on mobile for first-time users
            const isMobileInit = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (isMobileInit && window.innerHeight > window.innerWidth) {
                currentOrientation = 'portrait';
                RESOLUTIONS = getResolutions();
                currentResolution = RESOLUTIONS[1]; // 720x1280
                canvas.width = currentResolution.width;
                canvas.height = currentResolution.height;
                SCALE = Math.min(canvas.width, canvas.height) / 720;
                applyScale();
        applyCanvasStyle();
            }
        }

        // If no profiles exist, go to profile select
        if (!activeProfile && getProfileList().length === 0) {
            gameState = 'profile_select';
        }

        updateUI();
        gameLoop();

        // === FULLSCREEN ===
        updateFullscreenBtn();
        const onFullscreenChange = () => {
            updateFullscreenBtn();
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
            if (!isFullscreen && gameState === 'playing') {
                pauseMenuIndex = 0;
                gameState = 'paused';
                updateUI();
            }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        document.getElementById('fullscreenBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullscreen();
        });

        // ============================================================================
