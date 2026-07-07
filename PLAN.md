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
- [x] Shop UI with upgrade cards
- [x] 8 upgrades (Extra Life, Thrust Power, Fire Rate, Start Shield, Powerup Luck, Bullet Speed, Magnet Range, Cooling System)
- [x] 5 levels per upgrade with increasing costs
- [x] Star Bits balance display
- [x] Buy with ENTER on selected upgrade

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

## Phase 3: Challenge Modes ⬜

### 3A. Challenge Types
- [ ] Classic — Standard rules
- [ ] Dodge Only — Cannot shoot, survive as long as possible (3x score)
- [ ] One Hit — 1 life, no respawn (3x score)
- [ ] Speed Clear — Timer bonus for fast clears (2x score)
- [ ] Horde — 3x asteroids, endless spawning (2.5x score)
- [ ] Pacific — Asteroids on timer, dodge only (2x score)

### 3B. Challenge UI
- [ ] `challenge_select` state before modifier select
- [ ] Challenge-specific rules display
- [ ] Per-challenge high scores

---

## Full Game Flow (After All Phases)

```
profile_select → menu → challenge_select → modifier_select → playing → gameover → shop → ↑
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
- [x] Graphics menu with resolution options (360p, 720p, 1080p)

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

### Scoring ✅
- [x] Large asteroid: 20 pts
- [x] Medium asteroid: 50 pts
- [x] Small asteroid: 100 pts
- [x] Score multiplier from modifiers
- [x] Score x2 power-up

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
- [x] Cooling System upgrade planned for shop

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

### UI/UX ✅
- [x] Clean menu screens with selective element visibility
- [x] Arrow key navigation with visual indicators
- [x] Pause menu (ESC during gameplay)
- [x] Dim overlay when paused
- [x] Power-up HUD during gameplay
- [x] Shield rings visual indicator
- [x] Star bits counter in HUD

### Anti-Tamper ✅
- [x] XOR encryption for exports
- [x] Base64 encoding
- [x] Checksum verification on import
