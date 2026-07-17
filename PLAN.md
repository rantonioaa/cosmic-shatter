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
- [x] **Set Bonuses** (visual only): Crimson Dawn, Abyss Walker, Solar Flare, Void Touched, Prismatic Sync
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

## Phase 6: Juice, Audio & Onboarding ⬜

### 6A. Audio System
- [ ] Web Audio API AudioContext with lazy init on first interaction
- [ ] `AUDIO` namespace with `play(name, opts?)` dispatcher
- [ ] Master gain limiter (DynamicsCompressorNode) to prevent clipping
- [ ] Audio toggle in profile (`audioEnabled`)
- [ ] Mobile unlock: resume on every tap, silent oscillator primed

### 6B. Sound Effects (8 essential)
- [ ] Shoot — sawtooth 880→220Hz pitch slide, 100ms
- [ ] Asteroid break — square + noise burst, 200-350ms (scales by size)
- [ ] Powerup pickup — sine arpeggio 523→784→1047Hz, 250ms
- [ ] Player hit — square 300→100Hz dive, 250ms
- [ ] Wave clear — triangle major triad ascent, 700ms
- [ ] Shop buy — sine coin chime 988→1319Hz, 150ms
- [ ] Low health — sine 220Hz beep, 100ms repeating every 600ms
- [ ] Game over — sawtooth descending drone + filtered noise, 1.5s

### 6C. Visual Effects
- [ ] Screen shake — canvas translate offset on death + big breaks
- [ ] Muzzle flash — bright particle burst at ship nose on shoot
- [ ] Asteroid hit-flash — white tint for 2-3 frames on damage
- [ ] Hit-stop — 3-6 frame update pause on player damage
- [ ] Combo popups — floating score text from kill position
- [ ] Death shockwave — expanding ring + particle burst on player death

### 6D. Procedural Ambient Music
- [ ] Low sine/triangle drone (40-80Hz) with LFO filtering
- [ ] Sparse pentatonic arpeggios every 2-4 seconds
- [ ] Intensity layers: calm menu → active waves → low rumble at low health
- [ ] Unobtrusive — space atmosphere through silence + punctuated sound

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

## Phase 8: Ship Loadouts ⬜

- [ ] Choose starting weapon type after modifier select
- [ ] 5 loadouts: Standard, Spread Shot, Rapid Fire, Piercing Bolt, Missiles
- [ ] Each modifies bullet creation, damage, and behavior
- [ ] Unlock new loadouts via progression
- [ ] Different bullet colors/shapes per loadout

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

## Full Game Flow (After All Phases)

```
profile_select → menu → challenge_select → modifier_select → playing → gameover → shop → ↑
                  ↓
              stardust_shop (unlock modifiers, loadouts, cosmetics)
```

---

## Completed Features

### Menu System ✅
- [x] "Cosmic Shatter" title screen
- [x] Profile select screen
- [x] Profile create screen
- [x] Modifier select with arrow navigation
- [x] Pause menu with arrow navigation
- [x] High scores display (per-profile)
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
- [x] Per-profile stats tracking
- [x] Export profile as encrypted .sav file
- [x] Import profile from .sav file
- [x] Migration from old high score format
- [x] Per-profile orientation and resolution settings
- [x] Mid-run save/resume (Save & Quit, Resume on main menu)

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
