# Cosmic Shatter — Feature List

## Core Gameplay

### Ship
- Arrow keys / WASD for rotation and thrust
- Space to shoot
- Screen wrapping (all edges)
- Invulnerability blink on spawn (3 seconds)
- Friction-based movement (0.99)
- Base thrust: 0.06

### Asteroids
- 3 sizes: Large (45px), Medium (30px), Small (15px)
- Split on destroy: Large → 2 Medium → 2 Small
- Random polygon shapes (7-12 vertices)
- Random rotation and velocity
- Spawn 150px away from ship

### Colored Asteroids (6 variants)

| Color | Spawn % | Health | Speed | Behavior | Star Bits |
|---|---|---|---|---|---|
| Gray | 40% | 1 | Normal | Standard | 1 |
| Red | 20% | 1 | Fast | Aggressive | 1 |
| Blue | 15% | 3 | Medium | Tanky | 2 |
| Purple | 10% | 1 | Normal | Erratic | 2 |
| Green | 10% | 4 | Medium | Heavy | 3 |
| Gold | 5% | 1 | Fast | Rare, high value | 5 |

- Multi-hit asteroids show remaining HP
- Purple asteroids change direction every 2 seconds
- Gold asteroids are rare and valuable

### Bullets
- Speed: 5px/frame + 50% ship velocity
- Lifetime: 60 frames
- Cooldown: 15 frames between shots
- Screen wrapping

### Heat System
- Small heat indicator on the ship (above ship nose)
- +5% heat per shot (20 shots to overheat at base)
- Heat decays at 0.5%/frame when not shooting
- Burst fire barely builds heat, cools quickly
- Full auto (5s) triggers overheat
- Overheat penalty: 2 seconds cooldown (can't shoot)
- Color: green (0-49%) → yellow (50-79%) → red (80-99%) → flashing (overheat)
- Upgrade: Cooling System (+10 shots before overheat per level)

### Levels
- Start with `level + 3` large asteroids
- New level when all asteroids destroyed
- Level counter increments
- 2-second pause between levels with "LEVEL X" display

### Difficulty Scaling (Capped at Level 20)

| Mechanic | Scaling | Cap |
|---|---|---|
| Asteroid speed | +3% per level | 1.58x at level 20 |
| Asteroid health | +1 HP every 5 levels | +3 HP at level 15+ |
| Asteroid count | Formula varies by level range | 28 asteroids at level 20 |
| Safe zone | -3px per level | 90px minimum |
| Rare color spawn | Gray decreases, Gold/Red increase | Shifted at level 20 |

**Level Transitions:**
- 2-second pause between levels
- "LEVEL X" displayed prominently
- Ship visible during transition

### Delta Time Normalization
- All game logic runs at consistent speed regardless of frame rate
- Delta time (dt) calculated per frame, normalized to 60fps
- Capped at 3x to prevent spiral of death
- Movement, timers, and animations scaled by dt
- Same game speed on 30fps mobile and 60fps PC

---

## Power-ups

| Power-up | Color | Duration | Effect |
|---|---|---|---|
| Shield | Cyan | Until hit | Absorbs 1 hit per charge (max 5) |
| Multi-Shot | Yellow | 10s | 3-way spread fire |
| Speed Boost | Green | 8s | +50% thrust |
| Explosive | Orange | 10s | 60px area damage on hit |
| Slow-Time | Purple | 6s | Asteroids 50% speed |
| Score x2 | Gold | 8s | Double points |
| Magnet Boost | Pink | 10s | Doubles magnet radius |
| Star Magnet | Light Yellow | 5s | Pulls all items on screen (rare) |
| Back Shot | Cyan | 10s | Shoot front and back |

- 15% drop chance from destroyed asteroids
- Diamond-shaped glowing pickups
- 30-second lifetime on screen
- Bottom HUD with countdown timers

---

## Magnet System

- **Base radius:** 70px (dynamically scaled via `sc(70)` — updates with resolution changes)
- Items within radius drift toward ship
- Pull strength increases as items get closer
- **Magnet Boost:** Doubles radius to 140px for 10 seconds
- **Star Magnet:** Full screen pull for 5 seconds (5% drop chance)
- **Back Shot:** Fires bullets both forward and backward for 10 seconds
- Resets to base radius on death
- **Shop upgrade:** +20px per level

---

## Star Bits Currency

- Drop from small asteroids (size 1) only
- Amount varies by asteroid color (1-5 star bits)
- Visual: Spinning gold 4-pointed star with glow
- 30-second lifetime on screen
- Collected within magnet radius
- Persist in profile as currency
- Displayed in HUD during gameplay

---

## Run Modifiers

| Modifier | Effect | Score Mult | Unlocked By |
|---|---|---|---|
| None | Standard gameplay | 1x | Always |
| Tiny Ship | Half radius, less thrust, 2x bullet damage needed | 1.25x | Beat Level 7 with None |
| Speed Demon | Asteroids 1.5x faster | 1.5x | Beat Level 5 with Tiny Ship |
| Dark Mode | 200px vision radius | 1.5x | Beat Level 6 with Speed Demon |
| Bullet Storm | 2x asteroid count | 2x | Beat Level 8 with Dark Mode |
| Glass Cannon | Instant asteroid destroy, 1 life | 2x | Beat Level 10 with Bullet Storm |

- Arrow key navigation with `▶` indicator
- Description and score multiplier shown
- Locked modifiers show lock icon and unlock condition
- Can select locked modifiers to view requirements

---

## Mid-Run Save & Resume

- Pause menu offers **Save & Quit** option
- Serializes entire run state to `activeProfile.activeRun` in localStorage:
  - Ship position, velocity, angle, lives, shield, invulnerability
  - All asteroids (position, velocity, size, color, health)
  - All bullets and powerup projectiles
  - Active powerups and timers
  - Star bits on screen, score, level, heat, modifier
- Saved run appears on main menu as **"[R] Resume Run"** with level/score preview
- Resume via R key, Space key, or tapping the Resume button
- Resolution scaling: positions and physics uniformly adjusted if resolution changed between save and resume
- Asteroid shapes regenerated on load (cosmetic only, not saved)
- Particles not saved — recreate naturally
- `activeRun` cleared on: gameover, starting a new game, or resuming
- Estimated save size: ~8–12 KB per run

---

## Profile System

### Profiles
- Create named profiles (max 12 chars)
- Guest mode (no saving)
- Per-profile data:
  - Star Bits currency
  - Upgrades (8 types, 5 levels each)
  - Stats (games played, total score, etc.)
  - High scores (top 8)
  - Last modifier preference
  - Unlocked modifiers (sequential progression)
  - Orientation preference (portrait/landscape)
  - Resolution preference (numeric index or `'auto'` string; default `'auto'`)
  - Fullscreen preference
  - Active run state (mid-run save)

### Export/Import
- Export as encrypted `.sav` file
- XOR encryption with key
- Base64 encoding
- Checksum verification
- Import validates and loads profile

### Migration
- Auto-detect old `asteroids_highscores` key
- Create "Default" profile from old scores
- Remove old key after migration
- Ensures `profile.stats` and `profile.totalStarBitsEarned` exist for old profiles
- Ensures `profile.activeRun` exists for old profiles (set to `null`)

---

## Menu System

### Profile Select
- List all profiles with stats
- Arrow key navigation (keyboard) or tap to select (mobile)
- Create new profile option
- Guest mode option

### Main Menu
- Game title "COSMIC SHATTER"
- Profile name and Star Bits display
- High scores list (top 8)
- Actions: Export (E), Import (I), Profile (P), Graphics (G), Shop (S)
- Resume Run option (R) when a saved run exists — shows level and score preview

### Modifier Select
- 6 modifiers with descriptions
- Arrow key navigation or tap to select
- Score multiplier shown
- Locked modifiers show unlock condition

### Graphics Menu
- Simplified menu with 2 options:
  - **Orientation** — Landscape / Portrait (applies immediately, resizes canvas on toggle)
  - **Fullscreen** — Toggle fullscreen mode (⛶/✖ button in top-left corner; also via F key)
- Arrow key navigation or tap to select
- Resolution is always auto-detected based on device screen and DPR
- Saves orientation and fullscreen preference per profile

### Fullscreen Mode
- Fullscreen button (⛶/✖) in top-left corner during menus; hidden if Fullscreen API not supported
- Also toggleable via F key in menus and gameplay
- Uses Fullscreen API (`requestFullscreen`/`exitFullscreen`)
- Canvas sizing:
  - Normal: `max-height: calc(100vh - 180px)` (preserves touch control spacing)
  - Fullscreen: `max-height: 100vh` via `:fullscreen` CSS selector
- PowerupHud bottom position adjusts in fullscreen

### Pause Menu
- Arrow key navigation or tap to select
- 4 options: Resume, Quit to Menu, Save & Quit, Settings
- Settings opens Settings menu (returns to pause on exit)
- Dim overlay on frozen game

### Game Over
- Score and modifier displayed
- Arrow-selectable menu or tap:
  - Restart → modifier select
  - Shop → upgrade shop
  - Quit to Menu
- High scores list shown
- Clears any active saved run (`activeRun`)

### Upgrade Shop (Card Grid)
- 2x4 card grid layout
- SVG wireframe icons per upgrade:
  - Extra Life: red heart
  - Thrust Power: cyan flame
  - Fire Rate: yellow lightning
  - Start Shield: blue shield
  - Powerup Luck: green star
  - Bullet Speed: white arrow
  - Magnet Range: pink magnet
  - Cooling System: ice blue snowflake
- 5-segment progress bars for upgrade levels
- Star bit diamond icon on cost badges
- Color-coded: gold selected, green maxed
- Arrow keys/WASD for grid navigation (desktop)
- Tap to select (mobile)
- Accessible from main menu (S) and gameover screen

---

## Upgrades (Shop)

| Upgrade | Effect per Level | Max Level | Base Cost |
|---|---|---|---|
| Extra Life | +1 starting life | 5 | 1,000 |
| Thrust Power | +0.02 thrust | 5 | 1,000 |
| Fire Rate | -1 frame cooldown | 5 | 1,000 |
| Start Shield | +1 shield charge at start | 5 | 1,000 |
| Powerup Luck | +5% drop chance | 5 | 1,000 |
| Bullet Speed | +20% bullet speed | 5 | 1,000 |
| Magnet Range | +20px base radius | 5 | 1,000 |
| Cooling System | +10 shots before overheat | 5 | 1,000 |

- Cost scales: 1,000 → 1,500 → 2,250 → 3,375 → 5,063
- Total to max one upgrade: ~13,188 Star Bits
- Total to max all upgrades: ~105,500 Star Bits

---

## Scoring

| Asteroid Size | Points |
|---|---|
| Large (3) | 20 |
| Medium (2) | 50 |
| Small (1) | 100 |

- Score multiplied by modifier
- Score multiplied by Score x2 power-up

### Combo System
- Consecutive kills within 3s build combo (1x → 1.5x → 2x → 2.5x → 3x)
- Explosive chain kills also build combo
- Getting hit (or shield hit) resets combo to 0
- Live combo multiplier shown next to score during gameplay
- Color-coded timer bar below score: green (>60%), yellow (30-60%), red (<30%)
- Combo bar hidden during pause, gameover, and level transitions

### Stardust Currency
- Earned by converting run score at gameover (piecewise diminishing rate)
- 1% of first 10,000 score, 0.5% of next 40,000, 0.2% beyond 50,000
- Modifier multiplier applies (Glass Cannon earns 2.5x Stardust)
- NOT awarded on Save & Quit (prevents save-scumming)
- Spent in Stardust Unlock Shop on loadouts and cosmetics

### Stardust Unlock Shop
- Accessible from main menu via [U] key
- Two tabs: Loadouts, Cosmetics
- **Select-to-preview UX**: Click/tap an item to preview it (no purchase)
- **Buy button**: Explicit "BUY — X ✦" button in preview area for confirmation
- Button states: SELECT AN ITEM (default), BUY — X ✦ (affordable), EQUIP (owned), EQUIPPED (disabled), NEED X MORE (disabled)
- Keyboard: W/S to browse, ENTER to buy/equip
- Touch: Tap item to preview, tap BUY button to purchase
- **SVG previews**: Crisp vector previews for all loadouts and cosmetics
- **Scrollable list**: Yellow scrollbar, touchpad/mouse wheel supported
- **Dynamic scaling**: All elements scale with device resolution via `sc()` function
- Loadouts: Standard (free), Spread Shot (800✦), Rapid Fire (1200✦), Piercing Bolt (2000✦), Missiles (3500✦)
- Cosmetics: 50 items across 6 slots (hull, bullets, thruster, death, starbits, powerups)
- Total cost to unlock everything: ~24,940 ✦

---

## Asteroid Types

### Golden Lure (NEW)
- Spawns at screen edges only (outside canvas)
- Visual: bright golden shimmer + white core + gold particle trail
- Health: 2 HP (+ level bonus), Speed: 2.2x normal
- Score: 3x base (300 pts), Star Bits: 8
- Movement: 60% toward ship + 40% tangential (aggressive)
- Risk/reward: always far from safe zone, forces player to venture out

---

## Visuals

- Black background with 100 deterministic stars
- **Colored wireframe asteroids** (Gray, Red, Blue, Purple, Green, Gold)
- White wireframe ship with orange thruster
- White bullet circles
- Colored particle effects on:
  - Asteroid destruction (asteroid color)
  - Ship hit (red)
  - Shield hit (cyan)
  - Power-up pickup (colored)
  - Star bit pickup (gold)
- Power-up diamond shapes with glow
- **Star bit spinning 4-pointed stars** with gold glow
- Shield concentric rings (up to 5)
- Dark mode vision radius overlay
- Pause dim overlay

---

## Controls

### Desktop (Keyboard)
| Key | Action |
|---|---|
| Arrow keys / WASD | Rotate / Thrust |
| R | Resume saved run |
| Space | Shoot / Select / Start |
| Enter | Confirm |
| Escape | Pause / Back / Skip |
| 1-6 | Quick select modifier |
| E | Export profile |
| I | Import profile |
| P | Change profile |
| G | Graphics settings |
| F | Toggle fullscreen |
| N | New profile |

### Mobile (Touch)
| Button | Action |
|---|---|
| ◀ ▶ | Rotate left / right |
| ▲ | Thrust forward |
| FIRE | Shoot |
| \| \| (top-right) | Pause |
| ← Back | Return to previous menu |
| Tap | Select menu items |

---

## Mobile Support

### Touch Controls
- Virtual buttons at bottom of screen — only visible during `playing` state
- Left side: rotate buttons (◀ ▶)
- Right side: thrust (▲) and shoot (FIRE) stacked vertically
- Pause button (top-right) during gameplay only
- Semi-transparent, thumb-friendly sizing (68-74px)
- Toggle visibility via `updateTouchPause()` based on `gameState`
- Hidden during pause and all menu states

### Back Button
- "← Back" button on shop, modifier select, graphics menu, and profile create screens
- Visible on all platforms (desktop and mobile)
- Single touch/click handler routes back action based on current `gameState`

### Menu Navigation
- Tap-to-select on all menu items (mobile)
- Click-to-select on all menu items (desktop mouse)
- Global `document.addEventListener('click', ...)` handler mirrors touch behavior
- Touch-friendly hints replace keyboard hints (mention "Tap Back to exit")
- GO button for profile name input
- All menus fully functional via touch and mouse

### Orientation Support
- Portrait mode (default on mobile)
- Landscape mode
- Toggle in graphics menu
- Auto-detect on first load
- Saved per profile

### Performance
- Resolution always auto-detected based on device screen and DPR (no manual selection)
- Delta time normalization for consistent speed
- Dynamic UI scaling via `sc()` function (Stardust shop scales with resolution)
- `user-scalable=no` to prevent zoom issues
- Prevents pull-to-refresh and bounce

### Audio System (Pink Floyd-inspired)
- Web Audio API with lazy initialization on first user gesture
- 3 gain nodes: Master, SFX, Music (separate volume controls)
- DynamicsCompressorNode to prevent clipping
- **8 procedural sound effects:**
  - Shoot — sawtooth 880→220Hz pitch slide, 100ms
  - Explosion — square + noise burst, 200-350ms (scales by asteroid size)
  - Powerup pickup — sine arpeggio 523→784→1047Hz, 250ms
  - Player hit — square 300→100Hz dive, 250ms
  - Wave clear — triangle major triad ascent, 700ms
  - Shop buy — sine coin chime 988→1319Hz, 150ms
  - Low health — sine 220Hz beep, 100ms repeating every 600ms
  - Game over — sawtooth descending drone + filtered noise, 1.5s
- **Procedural ambient music:**
  - 10 chord progressions (Am Dark, Dm Mellow, Em Cold, Am Andalusian, Dm Deep, Gm Heavy, Em Circle, Cm Vast, Fm Ethereal, Am Tension)
  - Randomly selected per new run, saved with mid-run saves
  - Pad voices: 3 triangle oscillators (root, 3rd, 5th) with ±2Hz detuning for warmth
  - Sub-bass: sine wave following chord root
  - Lowpass filter with slow LFO sweep (0.05Hz, 200-600Hz range)
  - Arpeggios: progression-specific patterns through delay feedback for echo tails
  - Each progression has unique tempo, delay time, and feedback character
  - Intensity: combo opens filter (+50Hz/combo), low health detunes pad (+4Hz)
- **Audio controls in Settings menu:**
  - Master volume slider (0-100%)
  - SFX volume slider (0-100%)
  - Music volume slider (0-100%, capped at 50% to stay subtle)
  - Settings saved to profile

### Visual Effects
- **Screen shake** — canvas translate offset on player death and big asteroid breaks
- **Muzzle flash** — brief white cone at ship nose on every shot (2-3 frames)
- **Hit-flash** — asteroids flash white briefly on bullet hit (2-3 frames)
- **Death shockwave** — expanding ring on player death
- **Combo popups** — floating score text from kill position on combo milestones

### Mobile UI/UX Standards
- Touch targets meet Apple HIG (44px) and Material Design (48dp) minimums:
  - Menu items: 48px min-height, 12px 16px padding on mobile
  - Back buttons: 44px min-height, 12px 16px padding
  - Fullscreen button: 44x44px
  - Menu actions (E/I/P/G/S/R): 44px min-height, 8px 12px padding
  - Shop cards: 48px min-height, 10px 8px 8px padding
- Font sizes above legibility threshold on mobile:
  - Shop name: 11px, Shop description: 10px
  - Graphics section headers: 12px/opacity 0.6
  - Profile info: 12px/opacity 0.7
  - Modifier descriptions: 12px/opacity 0.7
- Touch feedback: `:active` states with subtle background on all interactive elements
- Hover effects on menu items for desktop users
- Locked modifiers at opacity 0.5 (was 0.35)
- Cant-afford shop cards dimmed to 0.5 opacity

---

## Bug Fixes

- Null dereference after `loadProfile()` in keyboard profile select — null-checks before accessing `.name`
- Null dereference after `loadProfile()` in touch profile select — null-checks before setting active profile
- Magnet base radius (`MAGNET_BASE_RADIUS`) was stale after resolution change — now dynamically calculated via `sc(70)` in `getMagnetRadius()`
- Missing `stats` field migration in `migrateProfile()` — now ensures `profile.stats` and `profile.totalStarBitsEarned` exist
- `gameoverMenuIndex` not reset between games — now set to 0 in `submitScore()`
- `ship.blinkTimer`/`blinkOn` not reset on respawn — now reset when ship becomes invulnerable
- `URL.revokeObjectURL()` called too early in export — now delayed by 1000ms
- `coolingSystem || 0` used `||` instead of `??` — now uses `??` for correctness
- Redundant `renderShopList()` calls in keyboard handler — removed, `updateUI()` handles it
- No audio on Resume Run — `deserializeRun()` now calls `initAudio()`, `resumeAudio()`, `startMusic()`

---

## Persistence

### localStorage Keys
- `cosmicshatter_profiles` — All profiles
- `cosmicshatter_active` — Current profile name

### Export Format
```
JSON → Minify → XOR encrypt → Base64 → + checksum
```
