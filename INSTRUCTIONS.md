# Cosmic Shatter — Agent Instructions

## Project Overview
HTML5 Asteroids roguelite game. Multi-file architecture: HTML entry point + CSS stylesheets + JS modules. Canvas-based rendering with wireframe neon aesthetic. Fully playable on desktop and mobile.

## Repository
- GitHub: `rantonioaa/cosmic-shatter`
- GitHub Pages: `https://rantonioaa.github.io/cosmic-shatter/`
- Branch: `main`
- Push: SSH key `~/.ssh/cosmic-shatter` (user must run `git push` manually — SSH agent can't prompt in this environment)

## File Structure
| File | Purpose |
|------|---------|
| `asteroids.html` | HTML entry point (loads CSS + JS) |
| `css/styles.css` | All CSS styles (1,861 lines) |
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
| `PLAN.md` | Development roadmap and completed features |
| `INSTRUCTIONS.md` | This file — agent instructions |
| `.gitignore` | Ignores `.sav` files |
| `cosmicshatter_master_file.sav` | Test save with everything unlocked |
| `cosmicshatter_BODE.sav` | Another test save |

## CRITICAL RULES
1. **ALWAYS update FEATURES.md and PLAN.md** when making changes to the game
2. **ALWAYS update cosmicshatter_master_file.sav** when adding new features — keep it with everything unlocked for testing
3. **Commit after each logical change** — don't batch unrelated changes
4. **Never assume a library is available** — this is vanilla JS, no frameworks
5. **All keyboard code stays untouched** — mobile/touch is additive only
6. **Test mental model**: every menu state, every game state, both orientations, both desktop and mobile

## Architecture

### Game States
```
menu → constellation_map → modifier_select → playing → gameover → shop → ↑
  ↓    ↓         ↑              ↑                        ↑
  saves_menu  profile_select  paused → save_quit → settings
  highscores_menu    ↓         ↓
  profile_create  victory     (activeRun saved)
  settings          ↓         ↓
  resume_run → menu      restart_confirm → modifier_select
```

### Key Variables
- `gameState` — current state string
- `activeProfile` — loaded profile object (or null for guest)
- `currentOrientation` — `'landscape'` or `'portrait'`
- `RESOLUTIONS` — points to `LANDSCAPE_RESOLUTIONS` or `PORTRAIT_RESOLUTIONS`
- `currentResolution` — active resolution object `{ width, height }`
- `SCALE` — `Math.min(canvas.width, canvas.height) / 720`
- `sc(v)` — multiply value by SCALE
- `dt` — delta time, normalized to 60fps, capped at 3
- `activeRun` — serialized mid-run save state (or `null`)
- `graphicsReturnState` — tracks which state to return to from settings (menu or paused)
- `getActiveLoadout()` — returns current loadout stats from `SD_LOADOUTS` based on `activeProfile.selectedLoadout`
- `runAsteroidsDestroyed` — counter for asteroid kills in current run (for stats tracking)
- `destroyAsteroid(a, index)` — shared destroy logic for bullets, chain lightning, missile AoE, burn DOT

### Resolution System
- Landscape: `LANDSCAPE_RESOLUTIONS` (640x360, 1280x720, 1920x1080)
- Portrait: `PORTRAIT_RESOLUTIONS` (360x640, 720x1280, 1080x1920)
- Resolution is always auto-detected based on device screen and DPR via `getAutoResolution()`
- `SCALE = Math.min(width, height) / 720` — same scale at 1280x720 and 720x1280
- Profile stores `orientation` and `fullscreen` preference (resolution is always auto-detected)

### CSS Layout
- `#ui` — absolutely positioned, `pointer-events: none`, scaled by `--s` CSS var
- `[data-tap-action]` — `pointer-events: auto` for mobile taps
- Canvas: `max-width: 100vw; max-height: calc(100vh - 180px)`
- Canvas in fullscreen: `:fullscreen` pseudo-class sets `max-height: 100vh`
- Mobile media query: `@media (max-width: 600px)` — hide keyboard hints, show touch hints
- `#menuActions` must NOT be hidden on mobile (was a bug, fixed)

### Mobile Touch Controls
- `#touchControls` — fixed bottom bar with rotate/thrust/shoot buttons; visibility toggled by `updateTouchPause()` based on `gameState` (only shown during `playing` state)
- `#touchPause` — fixed top-right pause button (only during `playing` state)
- Buttons map to same `keys[]` object as keyboard
- `data-tap-action` + `data-tap-index` attributes on all tappable elements
- Touch handler dispatches based on `gameState` and `action`
- Global click handler (`document.addEventListener('click', ...)`) mirrors touch behavior for desktop mouse
- Back button (`data-tap-action="back"`) on shop, modifier_select, graphics_menu, profile_create, saves_menu, highscores_menu — visible on all platforms, routes to previous state based on `gameState`

### Delta Time
- `dt = Math.min((timestamp - lastFrameTime) / (1000/60), 3)`
- All `update*()` functions take `dt` parameter
- Movement: `position += velocity * dt`
- Timers: `timer -= dt`
- Friction: `velocity *= Math.pow(friction, dt)`
- Blink/erratic: use `Math.floor(timer) % N` crossing detection

### Profile System
- localStorage keys: `cosmicshatter_profiles`, `cosmicshatter_active`
- Export: JSON → minify → XOR encrypt → Base64 → checksum
- `migrateProfile()` adds missing fields for old profiles
- `createDefaultProfile()` defines all fields

## Gotchas

### Resolution Index
- Resolution is always auto-detected — no manual selection or profile storage
- `getAutoResolution()` picks best match based on device screen and DPR
- Profile only stores `orientation` and `fullscreen` preference

### Gameover Menu
- Menu options injected into `highscoresEl` AFTER `renderHighScores()` to prevent overwrite

### Profile Loading
- `loadProfile()` can return `null` if data is corrupted — always null-check before accessing `.name`, `.orientation`, or `.resolution`
- Must null-check in both keyboard AND touch profile select handlers
- Resolution is always auto-detected — ignore stored `resolution` field

### Blink/Erratic Timers
- Use crossing detection: `Math.floor(timer) % N === 0 && Math.floor(timer - dt) % N !== 0`
- Simple modulo won't work with dt > 1

### Settings Menu
- Options: Orientation, Fullscreen (conditional), Audio sliders
- Accessible from main menu (G key) and pause menu (Settings option)
- Orientation toggle applies immediately (canvas resizes on toggle, auto-detects new resolution)
- Fullscreen toggle: hidden if Fullscreen API not supported; also toggleable via F key
- Resolution is always auto-detected based on device screen and DPR

### Fullscreen Mode
- Fullscreen button (⛶/✖) in top-left corner; hidden via CSS if Fullscreen API not supported
- Uses Fullscreen API with webkit prefix fallback (`requestFullscreen`/`webkitRequestFullscreen`)
- Dedicated click handler with `stopPropagation()` to prevent double-fire with global click handler
- Canvas sizing: normal `max-height: calc(100vh - 180px)`, fullscreen `max-height: 100vh` via `:fullscreen` CSS
- PowerupHud bottom position adjusts in fullscreen
- Profile stores fullscreen preference; restored on profile load
- F key toggles fullscreen in menus and gameplay
- ESC key pauses the game (does NOT exit fullscreen) — exiting fullscreen auto-pauses via `fullscreenchange` listener
- `webkitfullscreenchange` event also listened for mobile browser compatibility

### Incomplete / Future Features

### Magnet Radius
- `MAGNET_BASE_RADIUS` is NOT a const — it calls `sc(70)` dynamically in `getMagnetRadius()`
- Must recompute after resolution changes; a stale cached value breaks magnet range at different resolutions

### Nullish Coalescing vs Logical OR
- Use `??` not `||` for numeric defaults that can be 0 (e.g., `coolingSystem ?? 0`)
- `|| 0` treats `0` as falsy and replaces it; `?? 0` only replaces `null`/`undefined`

### Mid-Run Save/Resume
- `activeRun` stores serialized run state in `activeProfile.activeRun` (localStorage)
- Resolution scaling on resume: positions/velocities are multiplied by `newScale / oldScale` if resolution changed between save and resume
- Asteroid shapes are regenerated on load (not saved) — cosmetic only
- Particles are not saved — they recreate naturally
- `activeRun` is cleared on: gameover, starting a new game, or completing a resume
- Profile migration ensures `activeRun` field exists (set to `null` for old profiles)
- Estimated save size: ~8–12 KB per run

### Save & Quit Button
- Pause menu has 3 options: Resume (index 0), Quit to Menu (index 1), Save & Quit (index 2)
- Resume on main menu: R key, Space key, or tap the Resume button
- Resume button only shown when `activeProfile.activeRun` is not null

### Touch Controls Visibility
- `#touchControls` is hidden by default and only shown during `playing` state
- `updateTouchPause()` toggles both `#touchControls` and `#touchPause` visibility based on `gameState`
- Prevents virtual buttons from appearing over menus, pause screen, or any non-gameplay state

### Mobile Back Button
- `data-tap-action="back"` on 4 menus: shop, modifier_select, graphics_menu, profile_create
- Touch/click handler maps `back` action to: `shop → shopReturnState`, `modifier_select → menu`, `graphics_menu → graphicsReturnState`, `profile_create → profile_select`
- Visible on all platforms (desktop and mobile)

## Git Workflow

**The AI handles commits. The user handles pushes.**

The AI has no SSH permissions, so it cannot push. After committing, the AI tells the user to push. The user runs `git push` in their own terminal.

```bash
# AI runs:
cd /mnt/c/Users/cazbo/Proyectos/Test
git add -A
git commit -m "description"

# User runs in their terminal:
cd /mnt/c/Users/cazbo/Proyectos/Test
git push
```

### If git push fails (SSH key not loaded)

When the user says "git push is not working", give them these lines to run:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/cosmic-shatter
```

Then they can run `git push` again.

## Agents

Configured in `opencode.json`. All subagents, only run when explicitly invoked via the Task tool.

| Agent | Model | Purpose | Monthly budget |
|-------|-------|---------|----------------|
| `code-reviewer` | opencode-go/qwen3.7-plus | Reviews code for bugs, undefined refs, null derefs, CSS mismatches, performance, browser compat, UI/UX | 21,600 req |
| `qa-tester` | opencode-go/deepseek-v4-flash | QA: logic bugs, collision, timing, mobile compat, memory leaks, test case generation, regression testing | 158,150 req |
| `docs-maintainer` | opencode-go/mimo-v2.5 | Maintains FEATURES.md, PLAN.md, INSTRUCTIONS.md, master save file, and changelog | 150,400 req |
| `game-designer` | opencode-go/kimi-k2.7-code | Game design: mechanics, progression, balance, player retention, competitive analysis for roguelite games | 9,250 req |

### Usage
- `code-reviewer`: invoke before commits to catch bugs, performance issues, and UI/UX problems
- `qa-tester`: invoke after non-trivial changes for comprehensive testing with formal test cases
- `docs-maintainer`: invoke when user says "update docs" or after feature additions
- `game-designer`: invoke when planning new features, balancing existing ones, or analyzing player retention

Agent files live in `.opencode/agents/` — each has a focused prompt with project-specific context.

## Testing Checklist
- [ ] Desktop: all menus work with keyboard
- [ ] Desktop: all menus work with mouse clicks
- [ ] Mobile portrait: all menus work with taps
- [ ] Mobile landscape: all menus work with taps
- [ ] Orientation toggle works in graphics menu
- [ ] Game speed feels same on mobile and desktop
- [ ] Pause button works during gameplay
- [ ] Profile create GO button works on mobile
- [ ] Shop card grid works with touch
- [ ] Export/Import work on mobile (file picker)
- [ ] Save & Quit preserves run state correctly
- [ ] Resume button appears on main menu when saved run exists
- [ ] Resume works after changing resolution between save and resume
- [ ] Fullscreen button works on mobile (webkit prefix)
- [ ] ESC pauses game (doesn't exit fullscreen) during gameplay
- [ ] Back buttons work on all platforms
- [ ] Touch controls hidden during pause
