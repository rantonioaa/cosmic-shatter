# Cosmic Shatter — Development Plan

## Master Save File

A test save file with all features unlocked is included: `cosmicshatter_master_file.sav`
- Import via profile select screen (press I)
- All 6 modifiers unlocked
- All upgrades maxed (5/5)
- 9999 Star Bits
- High scores for all modifiers
- **Keep updated when adding new features**

---

## Phase 1: Core Roguelite Mechanics ✅

### 1A. Random Power-ups ✅
- [x] 9 power-up types (Shield, Multi-Shot, Speed Boost, Explosive, Slow-Time, Score x2, Magnet Boost, Star Magnet, Back Shot)
- [x] 15% drop chance from destroyed asteroids
- [x] Diamond-shaped glowing pickups with labels
- [x] 30-second lifetime on screen, fade when expiring
- [x] Bottom HUD with active power-up timers
- [x] Power-up pickup particles

### 1B. Run Modifiers ✅
- [x] 6 modifier types (None, Tiny Ship, Speed Demon, Dark Mode, Bullet Storm, Glass Cannon)
- [x] Arrow key navigation with visual selection indicator
- [x] Score multiplier system per modifier
- [x] Modifier persists for entire run
- [x] Modifier displayed in high score entries
- [x] Sequential unlock system (beat level requirements to unlock next modifier)
- [x] Locked modifiers show unlock condition
- [x] Unlock notification on game over

### 1C. Shield Stack System ✅
- [x] Shield counter (0-5 charges)
- [x] Each pickup adds +1 charge
- [x] Each hit consumes 1 charge
- [x] Multiple concentric rings visual
- [x] HUD displays shield count (e.g., "Shield x3")

### 1D. Colored Asteroids ✅
- [x] 6 asteroid colors (Gray, Red, Blue, Purple, Green, Gold)
- [x] Each color has unique properties (health, speed, behavior)
- [x] Weighted spawn system (Gray 40%, Red 20%, Blue 15%, Purple 10%, Green 10%, Gold 5%)
- [x] Visual health indicator for tough asteroids
- [x] Purple asteroids have erratic movement

### 1E. Magnet System ✅
- [x] Always-on magnet with 70px base radius
- [x] Items within radius drift toward ship
- [x] Pull strength increases as items get closer
- [x] Magnet Boost powerup (doubles radius for 10s)
- [x] Star Magnet powerup (full screen pull for 5s, rare)
- [x] Back Shot powerup (fires bullets forward and backward for 10s)
- [x] Resets to base radius on death

### 1F. Star Bits Currency ✅
- [x] Drop from small asteroids (size 1) only
- [x] Amount varies by asteroid color (1-5 star bits)
- [x] Spinning gold 4-pointed star visual
- [x] 30-second lifetime on screen
- [x] Collected within magnet radius
- [x] Persist in profile as currency
- [x] Displayed in HUD during gameplay

---

## Phase 2: Meta-progression + Ability Shop ✅

### 2A. Ability Shop ✅
- [x] 2x4 card grid layout with SVG wireframe icons
- [x] 8 upgrades (Extra Life, Thrust Power, Fire Rate, Start Shield, Powerup Luck, Bullet Speed, Magnet Range, Cooling System)
- [x] 5 levels per upgrade with increasing costs
- [x] Star Bits balance display with star icon
- [x] Buy with ENTER on selected upgrade
- [x] Visual progress bars for upgrade levels
- [x] Color-coded cards (gold selected, green maxed, dimmed can't-afford)

### 2B. Upgrade Effects ✅
- [x] Extra Life: +1 starting life per level
- [x] Thrust Power: +0.02 thrust per level
- [x] Fire Rate: -1 frame cooldown per level
- [x] Start Shield: Begin run with shield per level
- [x] Powerup Luck: +5% drop chance per level
- [x] Bullet Speed: +20% bullet speed per level
- [x] Magnet Range: +20px base radius per level
- [x] Cooling System: +10 shots before overheat per level

### 2C. New Game States ✅
- [x] `shop` state accessible from menu and gameover
- [x] Gameover arrow menu (Restart, Shop, Quit)

### 2D. Mid-Run Save & Resume ✅
- [x] Pause menu: Resume, Quit to Menu, Save & Quit
- [x] Save & Quit serializes run state to `activeProfile.activeRun`
- [x] Resume option on main menu with level/score preview (R key, Space, or tap)
- [x] Resolution scaling on resume (uniform position adjustment)
- [x] Asteroid shapes regenerated on load (cosmetic only)
- [x] `activeRun` cleared on gameover, new game, or resume
- [x] Profile migration ensures `activeRun` field exists
- [x] Estimated save size ~8–12 KB

---

## Difficulty Scaling ✅ (Capped at Level 20)

### Speed Scaling
- [x] +3% speed per level (Level 1 = 1.0x, Level 20 = 1.58x)
- [x] Applied to asteroid velocity at spawn time

### Health Scaling
- [x] +1 HP every 5 levels (Level 1-4 = base, Level 5-9 = +1, Level 10-14 = +2, Level 15-20 = +3)
- [x] Health indicator shows current/max HP

### Color Weight Shift
- [x] Rare colors become more common at higher levels
- [x] Gray: 40% → 25%, Red: 20% → 28%, Gold: 5% → 12%

### Asteroid Count Formula
- [x] Level 1-5: `level + 3` (4-8 asteroids)
- [x] Level 6-10: `level + 5` (11-15 asteroids)
- [x] Level 11-20: `level + 8` (19-28 asteroids)

### Safe Zone Reduction
- [x] 150px at level 1, -3px per level, minimum 90px

### Level Transition
- [x] 2-second pause between levels
- [x] "LEVEL X" display with score/lives
- [x] Ship visible during transition

---

## Phase 3: Balance & Polish ✅ (Quick Wins)

### 3A. Heat Overdrive System ✅
- [x] Heat above 50% = bonus damage (1.5x) and faster fire rate (30% reduction)
- [x] Orange glow visual when in overdrive
- [x] "OVERDRIVE" HUD text when active
- [x] Risk/reward: overheat still triggers at 100%

### 3B. Shield Rework ✅
- [x] Cap shield at 3 charges (from 5)
- [x] Add decay: each charge expires after 20 seconds
- [x] Shield visual pulses faster as it decays
- [x] Start Shield upgrade still works (1-3 charges at start)

### 3C. Modifier Rebalance ✅
- [x] Tiny Ship: 1.25x → 1.5x (triple penalty deserves higher reward)
- [x] Dark Mode: 1.5x → 1.75x (score-farming potential)
- [x] Glass Cannon: 2x → 2.5x (1 life + no splits is brutal)

### 3D. Combo Scoring ✅
- [x] Combo meter: destroys within 3s build combo (1x → 1.5x → 2x → 2.5x → 3x)
- [x] Combo decays after 3 seconds of no kills
- [x] Getting hit resets combo to 0
- [x] Star bit drops increase by 20% per combo level
- [x] HUD combo counter next to score
- [x] Screen flash on high combos (4-5x)
- [x] Color-coded combo timer bar (green/yellow/red)
- [x] Explosive chain kills build combo

---

## Phase 4: Economy Overhaul ✅

### 4A. Stardust Currency ✅
- [x] New currency: Stardust — earned by converting run score at gameover
- [x] Stardust persists across runs (never resets)
- [x] Spent on: loadout unlocks, ship cosmetics
- [x] Separate from Star Bits (which remain stat upgrade currency)
- [x] Conversion: piecewise diminishing rate (1% first 10k, 0.5% next 40k, 0.2% beyond)
- [x] Modifier multiplier applies (Glass Cannon earns 2.5x Stardust)
- [x] Show "+X ✦ Stardust" on gameover screen
- [x] Stardust NOT awarded on Save & Quit (prevents save-scumming)

### 4B. Stardust Unlock Shop ✅
- [x] New `stardust_shop` game state
- [x] Two tabs: Loadouts, Cosmetics
- [x] Each item shows Stardust cost and owned/equipped state
- [x] Auto-equip on purchase, re-equip any owned item from shop
- [x] Default items always free (equipping default = "off")
- [x] Accessible from main menu via [U] key or tap
- [x] Select-to-preview UX: click/tap item to preview (no purchase)
- [x] Buy button: explicit "BUY — X ✦" button for confirmation
- [x] SVG previews for all loadouts and cosmetics
- [x] Scrollable list with yellow scrollbar (touchpad/mouse wheel supported)
- [x] Dynamic scaling via `sc()` function (scales with resolution)

### 4C. Loadout Unlocks (Phase 8 prep) ✅
- [x] Standard: Free (default)
- [x] Spread Shot: 800 ✦
- [x] Rapid Fire: 1,200 ✦
- [x] Piercing Bolt: 2,000 ✦
- [x] Missiles: 3,500 ✦

### 4D. Full Cosmetic System (50 items, 6 slots) ✅
- [x] **Ship Hull** (9 items, 4,850 ✦): Spectre White, Void Black, Crimson Star, Abyss Blue, Verdant Core, Solar Gold, Plasma Purple, Rose Nebula, Prismatic
- [x] **Bullet Skins** (8 items, 3,730 ✦): Standard Bolt, Crimson Dart, Azure Sphere, Verdant Shard, Solar Piercer, Violet Star, Comet Tail, Void Needle
- [x] **Thruster Trail** (8 items, 3,730 ✦): Standard Jets, Blue Afterburner, Purple Ion, Gold Flame, Green Plasma, Cryo Mist, Rainbow Boost, Twin Thrusters
- [x] **Death Effect** (8 items, 4,390 ✦): Standard Burst, Implosion Nova, Shockwave Ring, Screen Shatter, Mini Black Hole, Supernova, Glitch Out, Total Annihilation
- [x] **Star Bit Skin** (8 items, 3,580 ✦): Golden Star, Blue Crystal, Silver Moon, Red Heart, Green Diamond, Spinning Cube, Comet Fragment, Prismatic Bit
- [x] **Powerup Visual** (9 items, 4,660 ✦): Standard Diamond, Glowing Orb, Spinning Polygon, Pulsing Ring, Floating Runestone, Holographic Card, Energy Core, Cosmic Egg, Ancient Relic
- [ ] **Set Bonuses** (Future — not yet implemented): Crimson Dawn, Abyss Walker, Solar Flare, Void Touched, Prismatic Sync
- [x] Total cost: ~24,940 ✦ (~50-100 runs to unlock everything)

### 4E. Golden Lure Asteroids (NEW variant) ✅
- [x] New asteroid type: Golden Lure (distinct from existing Gold)
- [x] Visual: bright golden shimmer + white core + gold particle trail
- [x] Spawn: screen edges only (outside canvas), 3-5% per wave
- [x] Health: 2 HP (+ level bonus), Speed: 2.2x normal
- [x] Score: 3x base (300 pts), Star Bits: 8
- [x] Movement: 60% toward ship + 40% tangential (aggressive)
- [x] Risk/reward: always far from safe zone, forces player to venture out

### 4F. Profile Migration ✅
- [x] Add stardust, totalStardustEarned, cosmetics, selectedLoadout fields
- [x] Existing profiles get defaults (0 Stardust, all defaults equipped)
- [x] Existing unlockedModifiers preserved (level-based system unchanged)

---

## Phase 4.5: Honesty Pass + Victory Screen ✅

### 4.5A. Golden Lure Save Fix
- [x] Serialize `isGoldenLure`, `scoreMult`, `basePoints`, `trailTimer` in `serializeRun()`
- [x] Restore these fields in `deserializeRun()` to prevent lure→gray asteroid fallback

### 4.5B. Profile Stats Tracking
- [x] Increment `stats.gamesPlayed` on `submitScore()`
- [x] Increment `stats.totalScore` on `submitScore()`
- [x] Update `stats.highestLevel` on `submitScore()`
- [x] Update `stats.bestPerModifier` on `submitScore()`
- [x] Increment `stats.totalAsteroidsDestroyed` in `checkCollisions()` (add run counter cleared in `startGame`)
- [x] Increment `stats.totalPowerupsCollected` in powerup pickup code
- [x] Show real game count in profile select list
- [x] Add `stats.victories` field, increment on Level 20 clear

### 4.5C. Level-20 Victory Screen
- [x] Hard-cap asteroid count past Level 20 (apply `getLevelCap()` to `getLevelAsteroidCount`)
- [x] On Level 20 clear: transition to new `gameState = 'victory'` instead of continuing
- [x] Victory screen: "SYSTEM SHATTERED" title, score + modifier + Stardust earned
- [x] Two options: "Quit to Menu" (force-end run), no endless mode
- [x] Call `submitScore()` on victory (awards high score + Stardust + modifier unlock)

### 4.5D. Doc Sync
- [x] FEATURES.md: mark Set Bonuses as "Future" (not implemented)
- [x] FEATURES.md: note Loadouts are "unlock preview only" (Phase 8)
- [x] FEATURES.md: update difficulty scaling to mention Victory at Level 20
- [x] PLAN.md: convert Set Bonuses `[x]` to `[ ]` and move to Deferred section
- [x] PLAN.md: remove "faster spawn" from Bullet Storm modifier description
- [x] INSTRUCTIONS.md: update game states diagram with `victory` state

### 4.5E. Cleanup
- [x] Remove dead `#message` element (never shown in menu state) — text hidden by updateUI
- [x] Add particle cap (max 300) to prevent unbounded array growth
- [x] Fix `bullet_storm` description to "2x asteroid count"
- [x] Add `victories` field to profile stats with migration

---

## Phase 5: Challenge Modes ⬜

### 5A. Challenge Types
- [ ] Classic — Standard rules (1x score)
- [ ] One Hit — 1 life, no respawn (3x score)
- [ ] Horde — 2x asteroid count, faster level progression (2.5x score)
- [ ] Speed Clear — Timer bonus for fast level clears (2x score)

### 5B. Challenge UI
- [ ] `challenge_select` state before modifier select
- [ ] Challenge-specific rules display
- [ ] Per-challenge high scores (4 leaderboards)

---

## Phase 6: Juice, Audio & Onboarding 🔶

### 6A. Audio System ✅
- [x] Web Audio API AudioContext with lazy init on first interaction
- [x] `playSfx(name, opts)` dispatcher with 8 procedural sounds
- [x] Master gain limiter (DynamicsCompressorNode) to prevent clipping
- [x] Audio controls in Graphics menu (Master, SFX, Music sliders)
- [x] Mobile unlock: resume on every tap

### 6B. Sound Effects (8 essential) ✅
- [x] Shoot — sawtooth 880→220Hz pitch slide, 100ms
- [x] Asteroid break — square + noise burst, 200-350ms (scales by size)
- [x] Powerup pickup — sine arpeggio 523→784→1047Hz, 250ms
- [x] Player hit — square 300→100Hz dive, 250ms
- [x] Wave clear — triangle major triad ascent, 700ms
- [x] Shop buy — sine coin chime 988→1319Hz, 150ms
- [x] Low health — sine 220Hz beep, 100ms repeating every 600ms
- [x] Game over — sawtooth descending drone + filtered noise, 1.5s

### 6C. Visual Effects ✅
- [x] Screen shake — canvas translate offset on death + big breaks
- [x] Muzzle flash — brief white cone at ship nose on shoot (2-3 frames)
- [x] Asteroid hit-flash — white tint for 2-3 frames on damage
- [ ] Hit-stop — 3-6 frame update pause on player damage
- [x] Combo popups — floating score text from kill position
- [x] Death shockwave — expanding ring on player death

### 6D. Procedural Ambient Music ✅
- [x] 10 chord progressions (Am Dark, Dm Mellow, Em Cold, Am Andalusian, Dm Deep, Gm Heavy, Em Circle, Cm Vast, Fm Ethereal, Am Tension)
- [x] Randomly selected per new run, saved with mid-run saves
- [x] Pad voices: 3 triangle oscillators with ±2Hz detuning
- [x] Sub-bass: sine following chord root
- [x] Lowpass filter with slow LFO sweep (0.05Hz, 200-600Hz)
- [x] Arpeggios: progression-specific patterns through delay feedback
- [x] Each progression has unique tempo, delay time, and feedback
- [x] Intensity: combo opens filter, low health detunes pad

### 6E. Onboarding
- [ ] First-run tutorial overlay (rotate, thrust, shoot, collect)
- [ ] Dismissable, stored in profile

---

## Phase 7: In-Run Modules + Mini-Bosses ⬜

### 7A. Module Pods
- [ ] Every 3 levels, present choice of 3 temporary modules
- [ ] 12 modules total:
  - Offensive: Piercing Rounds, Ricochet, Chain Lightning, Heavy Caliber, Bigger Boom
  - Defensive: Vampire Plating, Auto-Shield, Ablative Armor
  - Utility: Magnet Field, Overclock, Haste, Lucky Star
- [ ] Active modules persist for rest of run
- [ ] Modules saved in `activeRun` for mid-run resume
- [ ] Active modules shown in HUD bar

### 7B. Mini-Bosses
- [ ] Every 5 levels, spawn a mini-boss asteroid
- [ ] 3 boss types: Splitter Tyrant, Armored Behemoth, Berserker
- [ ] Boss health bar displayed above
- [ ] Defeat rewards: guaranteed power-up + 500 star bits + bonus score

---

## Phase 8: Ship Loadouts ✅

- [x] Choose starting weapon type after modifier select (between runs via Stardust Shop)
- [x] 5 loadouts: Standard, Spread Shot, Rapid Fire, Piercing Bolt, Missiles
- [x] Each modifies bullet creation, damage, cooldown, speed, heat, and behavior
- [x] Unlock new loadouts via Stardust purchases
- [x] Different bullet colors/shapes per loadout (piercing = cyan, missile = gold)
- [x] Spread Shot: 3 bullets ±15° spread
- [x] Rapid Fire: 0.5× damage, 6f cooldown
- [x] Piercing Bolt: bullets pierce 2 asteroids
- [x] Missiles: homing (60° forward cone), 40px AoE, 3s burn DOT
- [x] All multipliers stack: loadout × modifier × powerups
- [x] Removed Multi-Shot powerup → replaced with Chain Lightning (2 chains at sc(200))

---

## Phase 9: Endgame (Lite) ⬜

### 9A. Achievements
- [ ] 10–12 achievements across categories (Combat, Progression, Challenge)
- [ ] Achievement popup on unlock
- [ ] Achievement gallery in profile

### 9B. Prestige
- [ ] Available when all 8 upgrades are maxed
- [ ] Resets upgrades and star bits
- [ ] Grants +5% permanent score bonus per prestige
- [ ] Prestige badge displayed on profile

---

## Phase 10: Biome Progression — Phase 1 (Data-only) ⬜

### 10A. Biome Data Table
- [ ] `BIOMES` constant: 5 entries (Classic Void, Rubble Field, Drift Expanse, Dense Belt, Mire Wastes)
- [ ] Each biome: `{ id, name, scoreMult, friction, countMult, speedMult, safeZoneMult, hpBonus, powerupLuckBonus, starBitMult, rotMult, magnetMult, palette }`
- [ ] `getActiveBiome()` helper (null-safe, defaults to Classic Void)

### 10B. Engine Integration
- [ ] `getLevelSpeedMult` reads `biome.speedMult`
- [ ] `getLevelAsteroidCount` reads `biome.countMult`
- [ ] `getLevelSafeZone` reads `biome.safeZoneMult`
- [ ] `getLevelHealthBonus` adds `biome.hpBonus`
- [ ] `rollPowerup` adds `biome.powerupLuckBonus`
- [ ] `spawnStarBits` applies `biome.starBitMult`
- [ ] `updateShip` uses `biome.friction`
- [ ] `updateAsteroids` applies `biome.rotMult` to rotation
- [ ] `getMagnetRadius` applies `biome.magnetMult`

### 10C. Constellation Map
- [ ] New `constellation_map` game state
- [ ] Canvas-rendered starfield with 5 nodes connected by unlock lines
- [ ] Each node: biome name, score mult, best score, lock/equip status
- [ ] Keyboard + touch navigation
- [ ] Main menu entry: `[C] Constellation` (replaces direct Start Game → modifier flow)
- [ ] Flow: `menu → constellation_map → modifier_select → playing`

### 10D. Profile + Unlock Logic
- [ ] New profile fields: `unlockedBiomes`, `selectedBiome`, `biomeBestScores`
- [ ] Default: only `classic_void` unlocked
- [ ] Unlock chain: clearing Level 20 in biome N unlocks biome N+1
- [ ] Per-biome best score tracked in profile

### 10E. Palette System
- [ ] CSS variables: `--biome-accent`, `--biome-bg-tint`
- [ ] Applied to HUD accent color + background star tint
- [ ] No gameplay effect, just visual identity

---

## Phase 11: Biome Progression — Phase 2 (Heavy Physics) ⬜

- [ ] Pulsar Field: gravity-point system, pulsar shockwave pulse
- [ ] Solar Forge: directional flare sweep every 6–8s
- [ ] Frozen Expanse: ice patches freeze ship controls
- [ ] Mirror Realm: inverted horizontal controls + bullet bounce
- [ ] Quantum Shroud: asteroid phase in/out + bullets split on hit
- [ ] Singularity Core: central black hole with inverse-square gravity

---

## Phase 12: Galaxy Layer ⬜

- [ ] 1 Galaxy = full Phase 1 + Phase 2 constellation
- [ ] Beat all biomes → unlock next galaxy
- [ ] 3 galaxies planned (24 biomes total)
- [ ] Galaxy selection screen with visual theming per galaxy

---

## Full Game Flow (After All Phases)

```
profile_select → menu → constellation_map → modifier_select → playing → gameover → shop → ↑
                     |                        ↑                      |
                     |                        |                      +--→ victory → menu
                     ↓
               stardust_shop
                     ↓
               challenge_select (optional modifier)
```

---

## Completed Features

### Menu System ✅
- [x] "Cosmic Shatter" title screen
- [x] Profile select screen
- [x] Profile create screen
- [x] Modifier select with arrow navigation
- [x] Pause menu with arrow navigation
- [x] High scores display (per-profile) — arcade table with medals, SVG mod icons, decorative frame
- [x] Export/Import profiles
- [x] Graphics menu with Orientation and Fullscreen (simplified from Resolution/Orientation/Fullscreen)
- [x] Portrait/Landscape orientation toggle in graphics menu (applies immediately)
- [x] Auto resolution — always auto-detects device screen size, no manual selection needed
- [x] Dynamic UI scaling — Stardust shop scales with resolution
- [x] Fullscreen toggle — Fullscreen API support, F key, ⛶/✖ button, `:fullscreen` CSS

### Gameplay ✅
- [x] Ship movement (arrows/WASD)
- [x] Shooting with cooldown
- [x] Asteroid splitting (large → medium → small)
- [x] Screen wrapping
- [x] Lives system (start with 3)
- [x] Level progression (level + 3 asteroids)
- [x] Colored asteroids with unique properties
- [x] Multi-hit asteroids (Blue: 2, Green: 3)
- [x] Erratic asteroid movement (Purple)
- [x] Delta time normalization (consistent speed at any frame rate)
- [x] Level-20 Victory screen — "SYSTEM SHATTERED" + force-end run
- [x] Asteroid count capped at Level 20 (no endless)

### Scoring ✅
- [x] Large asteroid: 20 pts
- [x] Medium asteroid: 50 pts
- [x] Small asteroid: 100 pts
- [x] Score multiplier from modifiers
- [x] Score x2 power-up
- [x] Combo multiplier (1x → 3x) with timer bar

### Power-ups ✅
- [x] Shield (absorbs hits, stackable up to 5)
- [x] Multi-Shot (3-way spread fire)
- [x] Speed Boost (+50% thrust)
- [x] Explosive (area damage bullets)
- [x] Slow-Time (asteroids 50% speed)
- [x] Score x2 (double points)
- [x] Magnet Boost (doubles magnet radius)
- [x] Star Magnet (full screen pull, rare)
- [x] Back Shot (fires bullets forward and backward)

### Heat System ✅
- [x] Small heat indicator on the ship
- [x] +5% heat per shot (20 shots to overheat at base)
- [x] Heat decays at 0.5%/frame when not shooting
- [x] Burst fire barely builds heat, cools quickly
- [x] Overheat penalty: 2 seconds cooldown
- [x] Color-coded feedback (green → yellow → red → flashing)
- [x] Cooling System upgrade in shop

### Magnet System ✅
- [x] Always-on 100px base radius
- [x] Items drift toward ship within radius
- [x] Powerups for temporary boosts
- [x] Resets on death

### Star Bits ✅
- [x] Drop from small asteroids (1-5 based on color)
- [x] Gold 4-pointed star visual
- [x] 30-second lifetime
- [x] Collected within magnet radius
- [x] Persist in profile
- [x] HUD display during gameplay

### Profile System ✅
- [x] Create/select profiles
- [x] Guest mode (no saving)
- [x] Per-profile high scores
- [x] Per-profile stats tracking (gamesPlayed, totalScore, highestLevel, bestPerModifier, asteroidsDestroyed, powerupsCollected, victories)
- [x] Export profile as encrypted .sav file
- [x] Import profile from .sav file
- [x] Migration from old high score format
- [x] Per-profile orientation and resolution settings
- [x] Mid-run save/resume (Save & Quit, Resume on main menu)
- [x] Golden Lure mid-run save state preserved (isGoldenLure, scoreMult, basePoints, trailTimer)

### UI/UX ✅
- [x] Clean menu screens with selective element visibility
- [x] Arrow key navigation with visual indicators
- [x] Pause menu (ESC during gameplay)
- [x] Dim overlay when paused
- [x] Power-up HUD during gameplay
- [x] Shield rings visual indicator
- [x] Star bits counter in HUD
- [x] SVG wireframe icons in upgrade shop
- [x] Save & Quit option in pause menu
- [x] Resume Run button on main menu with level/score preview

### Mobile Support ✅
- [x] Touch controls (rotate left/right, thrust, shoot, pause)
- [x] Touch controls only visible during playing state (hidden during pause and menus)
- [x] Tap-to-select on all menus
- [x] Click-to-select on all menus (desktop mouse)
- [x] Virtual keyboard GO button for profile creation
- [x] Touch-friendly hints (hide keyboard hints on mobile)
- [x] Pause button (top-right) during gameplay
- [x] Back button on shop, modifier select, graphics menu, profile create (all platforms)
- [x] Portrait/Landscape orientation support
- [x] Auto-detect portrait on mobile first load
- [x] Viewport meta tag (user-scalable=no)
- [x] Prevent pull-to-refresh and bounce
- [x] Mobile UI/UX standards (44px+ touch targets, active states, legible font sizes)
- [x] Hover effects on menu items for desktop

### Ship Loadouts ✅
- [x] 5 loadout types with distinct gameplay behavior
- [x] Standard: baseline (15f cooldown, 1.0× dmg, 5.0 speed)
- [x] Spread Shot: 3 bullets ±15° (18f cooldown, 1.0× dmg)
- [x] Rapid Fire: machine gun (6f cooldown, 0.5× dmg)
- [x] Piercing Bolt: bullets pierce 2 asteroids (20f cooldown)
- [x] Missiles: homing + 40px AoE + burn DOT (25f cooldown, 2.0× dmg)
- [x] All multipliers stack: loadout × modifier × powerups
- [x] Loadout chosen between runs via Stardust Shop
- [x] `getActiveLoadout()` helper for loadout stats lookup
- [x] `destroyAsteroid()` helper for shared destroy logic

### Power-ups ✅ (Updated)
- [x] Chain Lightning — bullets chain to 2 nearest asteroids (replaced Multi-Shot)
- [x] Shield, Speed Boost, Explosive, Slow-Time, Score x2, Magnet Boost, Star Magnet, Back Shot

### Anti-Tamper ✅
- [x] XOR encryption for exports
- [x] Base64 encoding
- [x] Checksum verification on import

---

## Bug Fixes ✅

- [x] Null dereference after `loadProfile()` in keyboard profile select
- [x] Null dereference after `loadProfile()` in touch profile select
- [x] Magnet base radius stale after resolution change — now dynamic via `sc(70)`
- [x] Missing `stats`/`totalStarBitsEarned` field migration in `migrateProfile()`
- [x] `gameoverMenuIndex` not reset between games
- [x] `ship.blinkTimer`/`blinkOn` not reset on respawn
- [x] `URL.revokeObjectURL()` called too early in export — delayed 1000ms
- [x] `coolingSystem || 0` replaced with `?? 0` for correctness
- [x] Redundant `renderShopList()` calls removed from keyboard handler
- [x] Combo bar leaked into pause/gameover screens — now hidden on all non-playing states
- [x] Explosive chain kills didn't build combo — now increment combo counter
- [x] Combo timer stopped ticking during overheat — moved decay to game loop
- [x] Combo bar DOM lookups every frame — cached at init
- [x] Combo bar width not resolution-scaled — now uses `sc(200)`
- [x] Golden Lure mid-run save state lost on resume — serialized/restored isGoldenLure, scoreMult, basePoints, trailTimer
- [x] Asteroid count uncapped past Level 20 — now uses `getLevelCap()` in `getLevelAsteroidCount()`
- [x] Particle array unbounded — capped at 300 particles
