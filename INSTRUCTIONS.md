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
  ↓           ↑              ↑
  profile_select         paused → save_quit
  profile_create              ↓
  graphics_menu          (activeRun saved)
  resume_run → playing
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
- `#touchControls` — fixed bottom bar with rotate/thrust/shoot buttons; visibility toggled by `updateTouchPause()` based on `gameState` (only shown during `playing` and `paused`)
- `#touchPause` — fixed top-right pause button (only during `playing` state)
- Buttons map to same `keys[]` object as keyboard
- `data-tap-action` + `data-tap-index` attributes on all tappable elements
- Touch handler at ~line 2550 dispatches based on `gameState` and `action`
- Back button (`data-tap-action="back"`) on shop, modifier_select, graphics_menu, profile_create — hidden on desktop via CSS, routes to previous state based on `gameState`

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
- `loadProfile()` can return `null` if data is corrupted — always null-check before accessing `.name`, `.orientation`, or `.resolution`
- Must null-check in both keyboard AND touch profile select handlers

### Blink/Erratic Timers
- Use crossing detection: `Math.floor(timer) % N === 0 && Math.floor(timer - dt) % N !== 0`
- Simple modulo won't work with dt > 1

### Graphics Menu
- Index 0 = orientation toggle, indices 1+ = resolutions
- `graphicsMenuIndex = savedRes + 1` when entering menu

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
- `#touchControls` is now hidden by default and only shown during `playing` and `paused` states
- `updateTouchPause()` toggles both `#touchControls` and `#touchPause` visibility based on `gameState`
- Prevents virtual buttons from appearing over menus on mobile

### Mobile Back Button
- `data-tap-action="back"` on 4 menus: shop, modifier_select, graphics_menu, profile_create
- Touch handler maps `back` action to: `shop → menu`, `modifier_select → menu`, `graphics_menu → menu`, `profile_create → profile_select`
- Hidden on desktop via `@media (min-width: 601px)` CSS rule

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

## Agents

Configured in `opencode.json`. All subagents, only run when explicitly invoked via the Task tool.

| Agent | Model | Purpose | Monthly budget |
|-------|-------|---------|----------------|
| `bug-hunter` | opencode-go/qwen3.7-plus | Reviews code for undefined refs, null derefs, CSS mismatches | 21,600 req |
| `qa-tester` | opencode-go/deepseek-v4-flash | QA: logic bugs, edge cases, mobile compat, memory leaks | 158,150 req |
| `doc-keeper` | opencode-go/mimo-v2.5 | Updates FEATURES.md, PLAN.md, INSTRUCTIONS.md, save file | 150,400 req |
| `game-design` | opencode-go/kimi-k2.7-code | Designs mechanics, progression, balance for roguelite systems | 9,250 req |

### Usage
- `bug-hunter`: invoke before commits to catch obvious bugs
- `qa-tester`: invoke after non-trivial changes for comprehensive testing
- `doc-keeper`: invoke when user says "update docs" or after feature additions
- `game-design`: invoke when planning new features or balancing existing ones

Agent files live in `.opencode/agents/` — each has a focused prompt with project-specific context.

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
- [ ] Save & Quit preserves run state correctly
- [ ] Resume button appears on main menu when saved run exists
- [ ] Resume works after changing resolution between save and resume
