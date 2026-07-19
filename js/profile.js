        // SECTION 6: PROFILE SYSTEM — Persistence, save/load, export/import
        // ============================================================================

        // Profile system
        const PROFILES_KEY = 'cosmicshatter_profiles';
        const ACTIVE_KEY = 'cosmicshatter_active';
        const OLD_HS_KEY = 'asteroids_highscores';
        const MAX_HS = 10;
        const XOR_KEY = 'CsmcShtt2026!xK9#pL';

        let activeProfile = null;
        let profileSelectIndex = 0;
        let profileList = [];
        let pauseMenuIndex = 0;

        function createDefaultProfile(name) {
            return {
                name: name,
                createdAt: new Date().toISOString(),
                starBits: 0,
                totalStarBitsEarned: 0,
                stardust: 0,
                totalStardustEarned: 0,
                upgrades: { extraLife: 0, thrustPower: 0, fireRate: 0, startShield: 0, powerupLuck: 0, bulletSpeed: 0, magnetRange: 0, coolingSystem: 0 },
                stats: { gamesPlayed: 0, totalScore: 0, highestLevel: 0, bestPerModifier: {}, totalAsteroidsDestroyed: 0, totalPowerupsCollected: 0, victories: 0 },
                highScores: [],
                lastModifier: 'none',
                unlockedModifiers: ['none'],
                stardustUnlocks: { loadouts: ['standard'], cosmetics: { hull: 'hull_spectre', bullets: 'bullet_standard', thruster: 'thruster_standard', death: 'death_standard', starbits: 'starbit_gold', powerups: 'powerup_diamond' }, ownedCosmetics: [] },
                selectedLoadout: 'standard',
                unlockedBiomes: ['classic_void'],
                selectedBiome: 'classic_void',
                biomeBestScores: {},
                resolution: 'auto',
                orientation: 'landscape',
                audioMaster: 80,
                audioSfx: 80,
                audioMusic: 15,
                activeRun: null
            };
        }

        function getAllProfiles() {
            try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || {}; } catch { return {}; }
        }

        function saveAllProfiles(profiles) {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        }

        function getActiveProfileName() {
            return localStorage.getItem(ACTIVE_KEY);
        }

        function setActiveProfileName(name) {
            localStorage.setItem(ACTIVE_KEY, name);
        }

        function loadProfile(name) {
            const profiles = getAllProfiles();
            const profile = profiles[name] || null;
            return profile ? migrateProfile(profile) : null;
        }

        function saveProfile(profile) {
            const profiles = getAllProfiles();
            profiles[profile.name] = profile;
            saveAllProfiles(profiles);
        }

        function deleteProfile(name) {
            const profiles = getAllProfiles();
            delete profiles[name];
            saveAllProfiles(profiles);
            if (getActiveProfileName() === name) setActiveProfileName(null);
        }

        // Migrate profile: add unlockedModifiers if missing
        function migrateProfile(profile) {
            let changed = false;
            if (!profile.unlockedModifiers) {
                profile.unlockedModifiers = ['none'];
                changed = true;
            }
            if (profile.resolution === undefined) {
                profile.resolution = 1; // default 720p
                changed = true;
            }
            if (profile.orientation === undefined) {
                profile.orientation = 'landscape';
                changed = true;
            }
            // Ensure all upgrade fields exist
            if (profile.upgrades) {
                const defaultUpgrades = { extraLife: 0, thrustPower: 0, fireRate: 0, startShield: 0, powerupLuck: 0, bulletSpeed: 0, magnetRange: 0, coolingSystem: 0 };
                for (const key in defaultUpgrades) {
                    if (profile.upgrades[key] === undefined) {
                        profile.upgrades[key] = 0;
                        changed = true;
                    }
                }
            }
            if (!profile.stats) {
                profile.stats = { gamesPlayed: 0, totalScore: 0, highestLevel: 0, bestPerModifier: {}, totalAsteroidsDestroyed: 0, totalPowerupsCollected: 0, victories: 0 };
                changed = true;
            }
            if (profile.stats.victories === undefined) {
                profile.stats.victories = 0;
                changed = true;
            }
            if (profile.totalStarBitsEarned === undefined) {
                profile.totalStarBitsEarned = 0;
                changed = true;
            }
            if (profile.activeRun === undefined) {
                profile.activeRun = null;
                changed = true;
            }
            if (profile.stardust === undefined) {
                profile.stardust = 0;
                changed = true;
            }
            if (profile.totalStardustEarned === undefined) {
                profile.totalStardustEarned = 0;
                changed = true;
            }
            if (!profile.stardustUnlocks) {
                profile.stardustUnlocks = { loadouts: ['standard'], cosmetics: { hull: 'hull_spectre', bullets: 'bullet_standard', thruster: 'thruster_standard', death: 'death_standard', starbits: 'starbit_gold', powerups: 'powerup_diamond' }, ownedCosmetics: [] };
                changed = true;
            }
            if (!profile.stardustUnlocks.ownedCosmetics) {
                profile.stardustUnlocks.ownedCosmetics = [];
                changed = true;
            }
            if (!profile.selectedLoadout) {
                profile.selectedLoadout = 'standard';
                changed = true;
            }
            if (!profile.unlockedBiomes) {
                profile.unlockedBiomes = ['classic_void'];
                changed = true;
            }
            if (!profile.selectedBiome) {
                profile.selectedBiome = 'classic_void';
                changed = true;
            }
            if (!profile.biomeBestScores) {
                profile.biomeBestScores = {};
                changed = true;
            }
            if (!profile.highScores) {
                profile.highScores = [];
                changed = true;
            }
            // Audio fields (Phase 6)
            if (profile.audioMaster === undefined) {
                profile.audioMaster = 80;
                changed = true;
            }
            if (profile.audioSfx === undefined) {
                profile.audioSfx = 80;
                changed = true;
            }
            if (profile.audioMusic === undefined) {
                profile.audioMusic = 15;
                changed = true;
            }
            if (changed) saveProfile(profile);
            return profile;
        }

        function getProfileList() {
            const profiles = getAllProfiles();
            return Object.values(profiles).sort((a, b) => b.starBits - a.starBits);
        }

        function getHighScores() {
            if (activeProfile && activeProfile.highScores) return activeProfile.highScores;
            return [];
        }

        function saveHighScore(newScore, newLevel, modifierId) {
            if (!activeProfile) return -1;
            const entry = {
                score: newScore,
                level: newLevel,
                modifier: modifierId,
                date: new Date().toLocaleDateString()
            };
            activeProfile.highScores.push(entry);
            activeProfile.highScores.sort((a, b) => b.score - a.score);
            if (activeProfile.highScores.length > MAX_HS) activeProfile.highScores.length = MAX_HS;
            saveProfile(activeProfile);
            return activeProfile.highScores.findIndex(e => e === entry);
        }

        // Checksum (djb2)
        function djb2Hash(str) {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
            }
            return hash.toString(16).padStart(8, '0');
        }

        // XOR encrypt/decrypt
        function xorCrypt(data, key) {
            let result = '';
            for (let i = 0; i < data.length; i++) {
                result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        }

        // Export profile
        function exportProfile(profile) {
            const json = JSON.stringify(profile);
            const minified = json.replace(/\s+/g, '');
            const encrypted = xorCrypt(minified, XOR_KEY);
            const checksum = djb2Hash(encrypted);
            const payload = btoa(encrypted) + checksum;
            const blob = new Blob([payload], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `cosmicshatter_${profile.name}.sav`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }

        // Import profile
        function importProfile(payload) {
            try {
                if (payload.length < 9) return null;
                const checksum = payload.slice(-8);
                const encoded = payload.slice(0, -8);
                const encrypted = atob(encoded);
                const expectedChecksum = djb2Hash(encrypted);
                if (checksum !== expectedChecksum) return null;
                const minified = xorCrypt(encrypted, XOR_KEY);
                const profile = JSON.parse(minified);
                if (!profile.name || !profile.upgrades) return null;
                return migrateProfile(profile);
            } catch {
                return null;
            }
        }

        // Migrate old high scores
        function migrateOldHighScores() {
            try {
                const old = JSON.parse(localStorage.getItem(OLD_HS_KEY));
                if (Array.isArray(old) && old.length > 0) {
                    const profile = createDefaultProfile('Default');
                    profile.highScores = old.map(e => ({
                        score: e.score,
                        level: e.level,
                        modifier: 'none',
                        date: e.date
                    }));
                    saveProfile(profile);
                    setActiveProfileName('Default');
                    localStorage.removeItem(OLD_HS_KEY);
                    return profile;
                }
            } catch {}
            return null;
        }

        // Input
        const keys = {};
        let lastUnlockedModifier = null;

        function checkModifierUnlocks() {
            if (!activeProfile) return null;
            let newUnlock = null;
            for (const [id, req] of Object.entries(MODIFIER_UNLOCK)) {
                if (!req) continue;
                if (activeProfile.unlockedModifiers.includes(id)) continue;
                if (activeProfile.unlockedModifiers.includes(req.prev) && lastLevel >= req.level) {
                    activeProfile.unlockedModifiers.push(id);
                    newUnlock = id;
                }
            }
            if (newUnlock) saveProfile(activeProfile);
            return newUnlock;
        }

        function checkBiomeUnlocks() {
            if (!activeProfile) return;
            if (!activeProfile.unlockedBiomes) activeProfile.unlockedBiomes = ['classic_void'];
            for (const [biomeId, req] of Object.entries(BIOME_UNLOCK_CHAIN)) {
                if (!req) continue;
                if (activeProfile.unlockedBiomes.includes(biomeId)) continue;
                if (activeProfile.unlockedBiomes.includes(req)) {
                    activeProfile.unlockedBiomes.push(biomeId);
                }
            }
        }

        // Stardust conversion: piecewise diminishing rate
        function convertScoreToStardust(score) {
            if (score <= 0) return 0;
            let dust = 0;
            if (score <= 10000) {
                dust = Math.floor(score * 0.01);
            } else if (score <= 50000) {
                dust = Math.floor(10000 * 0.01 + (score - 10000) * 0.005);
            } else {
                dust = Math.floor(10000 * 0.01 + 40000 * 0.005 + (score - 50000) * 0.002);
            }
            return dust;
        }

        function submitScore() {
            lastHighScoreRank = saveHighScore(lastScore, lastLevel, currentModifier.id);
            lastUnlockedModifier = checkModifierUnlocks();
            if (activeProfile) {
                // Earn Stardust from score
                const baseDust = convertScoreToStardust(lastScore);
                const earnedDust = Math.floor(baseDust * currentModifier.mult);
                lastStardustEarned = earnedDust;
                activeProfile.stardust = (activeProfile.stardust ?? 0) + earnedDust;
                activeProfile.totalStardustEarned = (activeProfile.totalStardustEarned ?? 0) + earnedDust;
                activeProfile.activeRun = null;
                // Update stats
                activeProfile.stats.gamesPlayed = (activeProfile.stats.gamesPlayed ?? 0) + 1;
                activeProfile.stats.totalScore = (activeProfile.stats.totalScore ?? 0) + lastScore;
                activeProfile.stats.highestLevel = Math.max(activeProfile.stats.highestLevel ?? 0, lastLevel);
                activeProfile.stats.totalAsteroidsDestroyed = (activeProfile.stats.totalAsteroidsDestroyed ?? 0) + runAsteroidsDestroyed;
                if (!activeProfile.stats.bestPerModifier) activeProfile.stats.bestPerModifier = {};
                const prevBest = activeProfile.stats.bestPerModifier[currentModifier.id] ?? 0;
                activeProfile.stats.bestPerModifier[currentModifier.id] = Math.max(prevBest, lastScore);
                if (lastLevel >= 20) {
                    activeProfile.stats.victories = (activeProfile.stats.victories ?? 0) + 1;
                    // Unlock biomes on victory
                    checkBiomeUnlocks();
                }
                // Update biome best score
                const biomeId = getActiveBiome().id;
                if (!activeProfile.biomeBestScores) activeProfile.biomeBestScores = {};
                activeProfile.biomeBestScores[biomeId] = Math.max(activeProfile.biomeBestScores[biomeId] ?? 0, lastScore);
                saveProfile(activeProfile);
            } else {
                lastStardustEarned = 0;
            }
            gameoverMenuIndex = 0;
            gameState = (lastLevel >= 20) ? 'victory' : 'gameover';
            updateUI();
        }

        // ============================================================================
