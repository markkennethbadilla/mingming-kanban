# MingMing Kanban - Agent Context

## Architecture
- **Framework**: Next.js 15 (App Router + Pages Router for APIs)
- **Runtime**: Bun (bun.lock, `bun run build`)
- **ORM**: Sequelize with PostgreSQL
- **Styling**: Tailwind CSS v3 with CSS variables in global.css
- **Auth**: JWT in localStorage, session via `/api/session`
- **DnD**: react-dnd with HTML5Backend
- **Theming**: next-themes ThemeProvider, light + dark mode

## Deploy
- **Service**: `mingming-kanban`
- **Port**: 3019
- **Domain**: mingming-kanban.elunari.uk
- **Script**: `deploy.ps1` wraps `E:\shared\scripts\deploy-vps.ps1`
- **Flags**: `-SkipBuild` (if pre-built), `-SkipPush`

## Design - Cozy Cat Theme
Sir says the theme is great — do NOT change colors/fonts/animations.
- **Primary**: Peach/orange #e8805c
- **Background**: Cream #fef6ee (light), Purple #1a1420 (dark)
- **Font**: Nunito (Google Fonts)
- **Cards**: `.card-cozy` — 16px radius, offset shadow
- **Buttons**: `.btn-yarn` — 12px radius, offset shadow
- **Cats**: Pixel art SVG components (PixelCatWave, PixelCatIdle, PixelCatHappy, PixelCatType, PixelCatSleep, FloatingCats)
- **Animations**: cat-wiggle, cat-bounce, pulse-glow keyframes

## Known Issues & Learnings

### Navbar auth state on SPA navigation
- **Problem**: Navbar checks auth in `useEffect([], [])` — only runs on mount. SPA navigation via `<Link>` won't trigger re-check, so Navbar won't update auth state after login/logout.
- **Fix**: Keep `window.location.href` for auth-changing events (login, register) to force full page reload. Use `<Link>` for all other navigation.

### Pages converted to SPA (Link)
- login, register, forgot-password, TaskCard, dashboard — all `<a href>` converted to `<Link>` (6 total)
- Post-auth redirects intentionally kept as `window.location.href`