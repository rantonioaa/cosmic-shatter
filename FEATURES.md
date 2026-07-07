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

- **Base radius:** 70px (always active)
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
  - Resolution preference

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

### Modifier Select
- 6 modifiers with descriptions
- Arrow key navigation or tap to select
- Score multiplier shown
- Locked modifiers show unlock condition

### Graphics Menu
- Orientation toggle: Landscape / Portrait
- Landscape resolutions:
  - 640x360
  - 1280x720 — default
  - 1920x1080
- Portrait resolutions:
  - 360x640
  - 720x1280
  - 1080x1920
- Arrow key navigation or tap to select
- Shows current resolution
- Saves orientation and resolution per profile

### Pause Menu
- Arrow key navigation or tap to select
- Resume or Quit to Menu
- Dim overlay on frozen game

### Game Over
- Score and modifier displayed
- Arrow-selectable menu or tap:
  - Restart → modifier select
  - Shop → upgrade shop
  - Quit to Menu
- High scores list shown

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
| Space | Shoot / Select / Start |
| Enter | Confirm |
| Escape | Pause / Back / Skip |
| 1-6 | Quick select modifier |
| E | Export profile |
| I | Import profile |
| P | Change profile |
| G | Graphics settings |
| N | New profile |

### Mobile (Touch)
| Button | Action |
|---|---|
| ◀ ▶ | Rotate left / right |
| ▲ | Thrust forward |
| FIRE | Shoot |
| \| \| (top-right) | Pause |
| Tap | Select menu items |

---

## Mobile Support

### Touch Controls
- Virtual buttons at bottom of screen
- Left side: rotate buttons (◀ ▶)
- Right side: thrust (▲) and shoot (FIRE) stacked vertically
- Pause button (top-right) during gameplay only
- Semi-transparent, thumb-friendly sizing (68-74px)

### Menu Navigation
- Tap-to-select on all menu items
- Touch-friendly hints replace keyboard hints
- GO button for profile name input
- All menus fully functional via touch

### Orientation Support
- Portrait mode (default on mobile)
- Landscape mode
- Toggle in graphics menu
- Auto-detect on first load
- Saved per profile

### Performance
- Auto-selects 360p resolution on mobile for performance
- Delta time normalization for consistent speed
- `user-scalable=no` to prevent zoom issues
- Prevents pull-to-refresh and bounce

---

## Persistence

### localStorage Keys
- `cosmicshatter_profiles` — All profiles
- `cosmicshatter_active` — Current profile name

### Export Format
```
JSON → Minify → XOR encrypt → Base64 → + checksum
```
