# Cosmic Shatter

A HTML5 Asteroids roguelite with a wireframe neon aesthetic. Fully playable on desktop and mobile.

**Play it live:** [rantonioaa.github.io/cosmic-shatter](https://rantonioaa.github.io/cosmic-shatter/)

![Cosmic Shatter](https://img.shields.io/badge/platform-HTML5-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

### Core Gameplay
- Classic Asteroids mechanics with screen wrapping, splitting asteroids, and lives
- 6 colored asteroid types (Gray, Red, Blue, Purple, Green, Gold) with unique health, speed, and behavior
- Heat system — manage fire rate to avoid overheating
- Delta-time normalization for consistent speed across 30fps mobile and 60fps PC

### Roguelite Progression
- **9 power-ups**: Shield, Multi-Shot, Speed Boost, Explosive, Slow-Time, Score x2, Magnet Boost, Star Magnet, Back Shot
- **6 run modifiers**: None, Tiny Ship, Speed Demon, Dark Mode, Bullet Storm, Glass Cannon — each with score multipliers and sequential unlocks
- **8 permanent upgrades** (5 levels each): Extra Life, Thrust Power, Fire Rate, Start Shield, Powerup Luck, Bullet Speed, Magnet Range, Cooling System
- Star Bits currency earned during runs, spent in the upgrade shop

### Save & Resume
- Pause and **Save & Quit** — preserves your entire run state
- Resume later from the main menu where you left off
- Resolution-aware: works even if you change settings between save and resume

### Profile System
- Named profiles with per-profile stats, upgrades, high scores, and preferences
- Export/Import as encrypted `.sav` files
- Guest mode for quick play without saving

### Mobile Support
- Touch controls: rotate, thrust, shoot, and pause buttons
- Portrait and landscape orientations
- Multiple resolution options (360p to 1080p)
- Back buttons on all sub-menus
- Gamepad controls only visible during gameplay

---

## How to Play

### Desktop
| Key | Action |
|-----|--------|
| Arrow keys / WASD | Rotate & thrust |
| Space | Shoot |
| Escape | Pause |
| E | Export profile |
| I | Import profile |
| P | Profile select |
| G | Graphics settings |
| S | Shop |
| R | Resume saved run |

### Mobile
Tap the on-screen buttons to rotate, thrust, and shoot. Use the pause button (top-right) to access Save & Quit.

---

## Upgrades

| Upgrade | Effect | Max | Base Cost |
|---------|--------|-----|-----------|
| Extra Life | +1 starting life | 5 | 1,000 |
| Thrust Power | +0.02 thrust | 5 | 1,000 |
| Fire Rate | -1 frame cooldown | 5 | 1,000 |
| Start Shield | +1 shield charge | 5 | 1,000 |
| Powerup Luck | +5% drop chance | 5 | 1,000 |
| Bullet Speed | +20% bullet speed | 5 | 1,000 |
| Magnet Range | +20px base radius | 5 | 1,000 |
| Cooling System | +10 shots before overheat | 5 | 1,000 |

---

## Run Modifiers

| Modifier | Effect | Score | Unlock |
|----------|--------|-------|--------|
| None | Standard gameplay | 1x | Always |
| Tiny Ship | Half size, less thrust, 2x bullet damage needed | 1.25x | Beat Lv.7 with None |
| Speed Demon | Asteroids 1.5x faster | 1.5x | Beat Lv.5 with Tiny Ship |
| Dark Mode | 200px vision radius | 1.5x | Beat Lv.6 with Speed Demon |
| Bullet Storm | 2x asteroid count | 2x | Beat Lv.8 with Dark Mode |
| Glass Cannon | Instant destroy, 1 life | 2x | Beat Lv.10 with Bullet Storm |

---

## Technical Details

- **Multi-file architecture**: HTML entry point + CSS stylesheets + JS modules
- **No dependencies**: Pure vanilla JS, no frameworks or libraries
- **Canvas-based rendering**: Wireframe neon aesthetic
- **localStorage**: Profile data and save states stored client-side
- **Delta time**: All game logic normalized to 60fps

---

## Development

Open `asteroids.html` in any modern browser to play. The game loads CSS and JS from separate files.

### Project Files

| File | Purpose |
|------|---------|
| `asteroids.html` | HTML entry point (loads CSS + JS) |
| `css/styles.css` | All CSS styles |
| `js/constants.js` | DOM references, canvas setup |
| `js/audio.js` | Audio system, SFX, music |
| `js/effects.js` | Visual effects (shake, flash, rings) |
| `js/game-constants.js` | Game constants, biomes, upgrades |
| `js/cosmetics.js` | SVG rendering helpers |
| `js/profile.js` | Profile system, save/load |
| `js/menus.js` | Menu rendering |
| `js/entities.js` | Entity factory (asteroids, enemies, particles) |
| `js/logic.js` | Game logic (start, serialize, destroy) |
| `js/ui.js` | UI update, high scores |
| `js/update.js` | Update functions (ship, bullets, asteroids) |
| `js/collisions.js` | Collision detection |
| `js/draw.js` | Draw functions |
| `js/loop.js` | Game loop |
| `js/init.js` | Bootstrap, event listeners |
| `js/input.js` | Keyboard, touch, click handlers |
| `FEATURES.md` | Complete feature documentation |
| `PLAN.md` | Development roadmap |
| `INSTRUCTIONS.md` | Agent instructions for AI contributors |

---

## License

MIT
