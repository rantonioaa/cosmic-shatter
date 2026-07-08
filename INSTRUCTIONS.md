# Cosmic Shatter — Agent Instructions

## Project Overview
Single-file HTML5 Asteroids roguelite game (`asteroids.html`, ~2830 lines). Canvas-based rendering with wireframe neon aesthetic. Fully playable on desktop and mobile.

## Repository
- GitHub: `rantonioaa/cosmic-shatter`
- GitHub Pages: `https://rantonioaa.github.io/cosmic-shatter/`
- Branch: `main`
- Push: SSH key `~/.ssh/cosmic-shatter` (user must run `git push` manually — SSH agent can't prompt in this environment)

## File Structure
| File | Purpose |
|------|---------|
| `asteroids.html` | Game source (HTML + CSS + JS, all in one file) |
| `FEATURES.md` | Complete feature documentation |
| `PLAN.md` | Development roadmap and completed features |
| `AGENTS.md` | This file — agent instructions |
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
menu → modifier_select → playing → gameover → shop → ↑
  ↓                        ↑
  profile_select        paused
  profile_create
  graphics_menu
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

### Resolution System
- Landscape: `LANDSCAPE_RESOLUTIONS` (640x360, 1280x720, 1920x1080)
- Portrait: `PORTRAIT_RESOLUTIONS` (360x640, 720x1280, 1080x1920)
- `SCALE = Math.min(width, height) / 720` — same scale at 1280x720 and 720x1280
- Profile stores `orientation` and `resolution` index

### CSS Layout
- `#ui` — absolutely positioned, `pointer-events: none`, scaled by `--s` CSS var
- `[data-tap-action]` — `pointer-events: auto` for mobile taps
- Canvas: `max-width: 100vw; max-height: calc(100vh - 180px)`
- Mobile media query: `@media (max-width: 600px)` — hide keyboard hints, show touch hints
- `#menuActions` must NOT be hidden on mobile (was a bug, fixed)

### Mobile Touch Controls
- `#touchControls` — fixed bottom bar with rotate/thrust/shoot buttons
- `#touchPause` — fixed top-right pause button (only during `playing` state)
- Buttons map to same `keys[]` object as keyboard
- `data-tap-action` + `data-tap-index` attributes on all tappable elements
- Touch handler at ~line 2550 dispatches based on `gameState` and `action`

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
- Use `?? 1` not `|| 1` for resolution index (index 0 is valid, `||` treats it as falsy)

### Gameover Menu
- Menu options injected into `highscoresEl` AFTER `renderHighScores()` to prevent overwrite

### Profile Loading
- `loadProfile()` can return `null` if data is corrupted — always null-check before accessing `.orientation` or `.resolution`

### Blink/Erratic Timers
- Use crossing detection: `Math.floor(timer) % N === 0 && Math.floor(timer - dt) % N !== 0`
- Simple modulo won't work with dt > 1

### Graphics Menu
- Index 0 = orientation toggle, indices 1+ = resolutions
- `graphicsMenuIndex = savedRes + 1` when entering menu

## Git Workflow
```bash
cd /mnt/c/Users/cazbo/Proyectos/Test
git add -A
git commit -m "description"
git push  # user must run manually (SSH agent issue)
```

## Testing Checklist
- [ ] Desktop: all menus work with keyboard
- [ ] Mobile portrait: all menus work with taps
- [ ] Mobile landscape: all menus work with taps
- [ ] Orientation toggle works in graphics menu
- [ ] Game speed feels same on mobile and desktop
- [ ] Pause button works during gameplay
- [ ] Profile create GO button works on mobile
- [ ] Shop card grid works with touch
- [ ] Export/Import work on mobile (file picker)
