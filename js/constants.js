        // ============================================================================
        // SECTION 1: DOM REFERENCES & CANVAS SETUP
        // ============================================================================

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gameTitleEl = document.getElementById('gameTitle');
        const levelTransitionEl = document.getElementById('levelTransition');
        const scoreEl = document.getElementById('score');
        const messageEl = document.getElementById('message');
        const highscoresEl = document.getElementById('highscores');
        const modifierSelectEl = document.getElementById('modifierSelect');
        const powerupHudEl = document.getElementById('powerupHud');
        const profileSelectEl = document.getElementById('profileSelect');
        const profileListEl = document.getElementById('profileList');
        const profileNameInputEl = document.getElementById('profileNameInput');
        const profileNameGoEl = document.getElementById('profileNameGo');
        const profileBackBtnEl = document.getElementById('profileBackBtn');
        const menuActionsEl = document.getElementById('menuActions');
        const btnResumeEl = document.getElementById('btnResume');
        const btnRestartEl = document.getElementById('btnRestart');
        const btnStartEl = document.getElementById('btnStart');
        const savesMenuEl = document.getElementById('savesMenu');
        const highscoresMenuEl = document.getElementById('highscoresMenu');
        const highscoresListEl = document.getElementById('highscoresList');
        const hsLegendEl = document.getElementById('hsLegend');
        const hsProfileEl = document.getElementById('hsProfile');
        const pauseMenuEl = document.getElementById('pauseMenu');
        const modListEl = document.getElementById('modList');
        const restartConfirmEl = document.getElementById('restartConfirm');
        const constellationMapEl = document.getElementById('constellationMap');
        const constNodesEl = document.getElementById('constNodes');
        const constInfoEl = document.getElementById('constInfo');
        const constBriefingEl = document.getElementById('constBriefing');
        const briefingNameEl = document.getElementById('briefingName');
        const briefingThreatEl = document.getElementById('briefingThreat');
        const briefingDescEl = document.getElementById('briefingDesc');
        const briefingStatsEl = document.getElementById('briefingStats');
        const briefingBestEl = document.getElementById('briefingBest');
        const briefingCanvasEl = document.getElementById('briefingCanvas');
        const briefingCanvasCtx = briefingCanvasEl ? briefingCanvasEl.getContext('2d') : null;
        const graphicsMenuEl = document.getElementById('graphicsMenu');
        const gfxListEl = document.getElementById('gfxList');
        const shopMenuEl = document.getElementById('shopMenu');
        const shopGridEl = document.getElementById('shopGrid');
        const shopBalanceEl = document.getElementById('shopBalance');
        const comboBarEl = document.getElementById('comboBar');
        const comboFillEl = document.getElementById('comboFill');
        const btnStardustShopEl = document.getElementById('btnStardustShop');
        const stardustShopMenuEl = document.getElementById('stardustShopMenu');
        const stardustBalanceEl = document.getElementById('stardustBalance');
        const stardustListEl = document.getElementById('stardustList');
        const stardustTabsEl = document.getElementById('stardustTabs');
        const stardustSlotTabsEl = document.getElementById('stardustSlotTabs');
        const sdPreviewSvg = document.getElementById('sdPreviewSvg');
        const sdPreviewLabelEl = document.getElementById('sdPreviewLabel');
        const sdPreviewActionEl = document.getElementById('sdPreviewAction');
        const sdBuyBtnEl = document.getElementById('sdBuyBtn');
        const sdHintEl = document.getElementById('sdHint');

        // Resolution options
        const LANDSCAPE_RESOLUTIONS = [
            { label: '640x360',   width: 640,  height: 360 },
            { label: '1280x720',  width: 1280, height: 720 },
            { label: '1920x1080', width: 1920, height: 1080 }
        ];
        const PORTRAIT_RESOLUTIONS = [
            { label: '360x640',   width: 360,  height: 640 },
            { label: '720x1280',  width: 720,  height: 1280 },
            { label: '1080x1920', width: 1080, height: 1920 }
        ];
        let currentOrientation = 'landscape';
        let RESOLUTIONS = LANDSCAPE_RESOLUTIONS;
        let graphicsMenuIndex = 1;
        let currentResolution = RESOLUTIONS[1];

        function getResolutions() {
            return currentOrientation === 'portrait' ? PORTRAIT_RESOLUTIONS : LANDSCAPE_RESOLUTIONS;
        }

        function getAutoResolution() {
            const resList = getResolutions();
            const dpr = window.devicePixelRatio || 1;
            // Normalize screen dimensions (iOS doesn't swap on rotation)
            const sw = Math.max(window.screen.width, window.screen.height);
            const sh = Math.min(window.screen.width, window.screen.height);
            // Orient based on current orientation
            const effectiveW = currentOrientation === 'portrait' ? sh : sw;
            const effectiveH = currentOrientation === 'portrait' ? sw : sh;
            const pixW = effectiveW * dpr;
            const pixH = effectiveH * dpr;
            let best = resList[0];
            let bestDiff = Infinity;
            for (const res of resList) {
                const diff = Math.abs(res.width - pixW) + Math.abs(res.height - pixH);
                if (diff < bestDiff) { bestDiff = diff; best = res; }
            }
            return best;
        }

        function toggleFullscreen() {
            const doc = document;
            const supported = doc.fullscreenEnabled || doc.webkitFullscreenEnabled;
            if (!supported) return;
            const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement;
            if (!isFullscreen) {
                const el = doc.documentElement;
                const req = el.requestFullscreen || el.webkitRequestFullscreen;
                if (req) req.call(el).catch(() => {});
            } else {
                const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
                if (exit) exit.call(doc).catch(() => {});
            }
        }

        function updateFullscreenBtn() {
            const btn = document.getElementById('fullscreenBtn');
            if (!btn) return;
            const supported = document.fullscreenEnabled || document.webkitFullscreenEnabled;
            if (!supported) {
                btn.style.display = 'none';
                return;
            }
            btn.style.display = 'flex';
            const active = document.fullscreenElement || document.webkitFullscreenElement;
            btn.innerHTML = active ? '&#x2716;' : '&#x26F6;';
            btn.title = active ? 'Exit Fullscreen' : 'Fullscreen';
        }

        // Shop state
        let shopMenuIndex = 0;
        let shopReturnState = 'menu';
        let graphicsReturnState = 'menu';
        let gameoverMenuIndex = 0;
        let restartMenuIndex = 0;
        let savedPauseMenuIndex = 0;
        let constMapIndex = 0;
        let constMapBriefing = false;

        canvas.width = currentResolution.width;
        canvas.height = currentResolution.height;

        // Resolution scaling (reference: 720px min dimension)
        let SCALE = Math.min(canvas.width, canvas.height) / 720;
        function sc(v) { return v * SCALE; }
        function applyScale() {
            // Always auto-detect resolution based on device screen
            const autoRes = getAutoResolution();
            canvas.width = autoRes.width;
            canvas.height = autoRes.height;
            currentResolution = autoRes;
            SCALE = Math.min(canvas.width, canvas.height) / 720;
            const UI_SCALE = Math.min(Math.max(SCALE, 0.9), 1.2);
            document.documentElement.style.setProperty('--s', SCALE);
            document.documentElement.style.setProperty('--u', UI_SCALE);
            comboBarEl.style.width = (200 * SCALE / UI_SCALE) + 'px';
        }
        applyScale();
        applyCanvasStyle();

        // Apply canvas CSS dimensions on mobile so resolution changes are visible
        function applyCanvasStyle() {
            const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            if (!isMobile) {
                canvas.style.width = '';
                canvas.style.height = '';
                return;
            }
            const vw = window.innerWidth;
            const vh = window.innerHeight - 60;
            const aspect = canvas.width / canvas.height;
            let displayW, displayH;
            if (vw / vh > aspect) {
                displayH = vh;
                displayW = vh * aspect;
            } else {
                displayW = vw;
                displayH = vw / aspect;
            }
            canvas.style.width = Math.floor(displayW) + 'px';
            canvas.style.height = Math.floor(displayH) + 'px';
        }
        applyCanvasStyle();
        window.addEventListener('resize', () => {
            applyCanvasStyle();
            applyScale();
            updateStardustShopSize();
        });

        // Stardust shop dynamic sizing
        const sdScrollAreaEl = document.getElementById('sdScrollArea');
        function updateStardustShopSize() {
            if (!sdPreviewSvg) return;
            sdPreviewSvg.setAttribute('width', sc(80));
            sdPreviewSvg.setAttribute('height', sc(50));
            document.documentElement.style.setProperty('--sd-item-h', sc(38) + 'px');
            document.documentElement.style.setProperty('--sd-item-pad', sc(5) + 'px');
            document.documentElement.style.setProperty('--sd-item-gap', sc(5) + 'px');
            document.documentElement.style.setProperty('--sd-thumb', sc(24) + 'px');
        }
        updateStardustShopSize();

        // Stardust shop buy button
        function updateBuyButton(slot, item, balance) {
            if (!item) {
                sdBuyBtnEl.textContent = 'SELECT AN ITEM';
                sdBuyBtnEl.className = 'sd-buy-btn';
                sdBuyBtnEl.dataset.locked = 'true';
                return;
            }

            let owned = false;
            let equipped = false;

            if (slot === 'loadout') {
                owned = item.cost === 0 || activeProfile?.stardustUnlocks?.loadouts?.includes(item.id);
                equipped = activeProfile?.selectedLoadout === item.id;
            } else {
                owned = item.cost === 0 || activeProfile?.stardustUnlocks?.ownedCosmetics?.includes(item.id);
                equipped = activeProfile?.stardustUnlocks?.cosmetics?.[slot] === item.id;
            }

            sdBuyBtnEl.className = 'sd-buy-btn';
            sdBuyBtnEl.dataset.locked = 'false';

            if (equipped) {
                sdBuyBtnEl.textContent = 'EQUIPPED';
                sdBuyBtnEl.classList.add('owned');
                sdBuyBtnEl.dataset.locked = 'true';
            } else if (owned) {
                sdBuyBtnEl.textContent = 'EQUIP';
                sdBuyBtnEl.classList.add('equip');
            } else if (balance >= item.cost) {
                sdBuyBtnEl.textContent = `BUY — ${item.cost} ✦`;
                sdBuyBtnEl.classList.add('active');
            } else {
                sdBuyBtnEl.textContent = `NEED ${item.cost - balance} MORE`;
                sdBuyBtnEl.classList.add('disabled');
                sdBuyBtnEl.dataset.locked = 'true';
            }
        }

        function confirmStardustPurchase() {
            if (!activeProfile) return;
            if (sdBuyBtnEl.dataset.locked === 'true') return;

            if (sdShopTab === 0) {
                const item = SD_LOADOUTS[sdShopItem];
                if (item) buyStardustUnlock('loadouts', item.id);
            } else {
                const slotDef = SD_COSMETIC_SLOTS[sdShopSlot];
                const item = slotDef.items[sdShopItem];
                if (item) buyOrEquipCosmetic(slotDef.slot, item.id);
            }

            renderStardustShop();
        }

        // Game state
        let gameState = 'menu'; // menu, profile_select, profile_create, modifier_select, playing, level_transition, gameover, stardust_shop, victory, restart_confirm, constellation_map
        let score = 0;
        let lives = 3;
        let level = 1;
        let lastHighScoreRank = -1;
        let lastScore = 0;
        let lastLevel = 1;
        let lastStardustEarned = 0;
        let levelTransitionTimer = 0;
        let runAsteroidsDestroyed = 0;

        // ============================================================================
