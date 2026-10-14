# ScreenNest

A cinematic, responsive movie and TV discovery site with Screenscape’s **documented public embed player**, built with Next.js App Router, TypeScript, and React. Ready for Vercel; no database is required.

## Vercel-এ deploy করুন

1. এই repository-এর changes GitHub-এ push করুন।
2. Vercel → **Add New → Project** → repository import করুন। যে branch-এ এই code আছে সেটি select করুন।
3. Framework **Next.js**, Node.js **22.x** রাখুন। Default build/output settings ব্যবহার করুন।
4. Live catalog-এর জন্য Environment Variables-এ `TMDB_READ_ACCESS_TOKEN` দিন। নিজের **API Read Access Token** পাবেন [TMDB API settings](https://www.themoviedb.org/settings/api)-এ। এটি server-only; `NEXT_PUBLIC_` prefix দেবেন না।
5. **Deploy** করুন। পরে environment variable যোগ/পরিবর্তন করলে redeploy করুন।

**Token ছাড়া** site deploy হবে, কিন্তু শুধু 16টি curated demo title-এ search/filter চলবে। Token দিলে live movie/TV discovery, search, pagination, title details, available trailers এবং season/episode lists চালু হবে। TMDB token এখানে chat-এ পাঠানোর দরকার নেই।

## What is integrated — and what is not

The provider’s published documentation was inspected at [screenscape.me/embed](https://screenscape.me/embed). Its public API is an **iframe player**, not a documented catalog/listing API:

```text
Movie: https://nxsha.screenscape.me/embed?tmdb=693134&type=movie&lan=eng
TV:    https://nxsha.screenscape.me/embed?tmdb=1396&type=tv&s=1&e=1&lan=eng
```

- Playback uses these documented URLs, with validated TMDB IDs and episode numbers.
- Browsing metadata comes from TMDB through the same-origin `/api/catalog` route. **This is not a mirror of Screenscape’s entire catalog** and does not verify its streaming inventory.
- No undocumented endpoint, copied credential, stream extraction, DRM bypass, or video proxy is used.
- The iframe is loaded only after the viewer selects **Launch player**. The provider may display advertisements or have missing streams. Its uptime and playback behavior are outside this app’s control.
- Popups and top-level navigation are intentionally blocked by the iframe sandbox. A clearly labeled **Open on provider** link is available if provider functionality needs a separate tab. Review the provider and its terms before public deployment.
- Use only media you have the rights or permission to access/distribute. Metadata availability is not a streaming license. Review TMDB’s terms and any commercial licensing requirements.
- Full-catalog coverage cannot be promised without a documented, authorized provider catalog feed.

## Features

- Cinematic spotlight with three selectable featured titles
- Movie, TV and animation discovery; debounced search, genre filters, sorting, and pagination
- Responsive desktop sidebar and mobile navigation
- Details dialog, TMDB rating, synopsis, and available YouTube trailers
- Screenscape movie/TV player; season/episode selection; preferred audio language
- Watchlist and recently launched titles in local storage
- Reload-persistent local profile preferences; clear-history/watchlist controls
- Skeletons, empty states, explicit API errors and retry actions
- Keyboard search shortcut (`/`), Escape-to-close, focus-trapped dialogs, reduced-motion support
- Bundled fonts and selected promotional posters; graceful artwork fallbacks
- Server-only TMDB credentials, fixed upstream paths, input validation, fetch timeouts and cached metadata

**Local profile, not authentication:** libraries are device/browser-specific and do not sync between devices. History tracks player launches and selected episodes, not confirmed playback time. The app intentionally does not claim cross-origin playback progress that it cannot verify. In demo mode, TV episode numbers can be entered manually; episode availability is not verified.

## Local development

Node.js 22.x recommended.

```bash
npm ci
cp .env.example .env.local
# Optional: put your TMDB read access token in .env.local
npm run dev
```

Open `http://localhost:3000`. The server binds to `0.0.0.0`; browser requests use relative URLs, so proxied previews work as well.

```bash
npm run lint
npm test
npm run build
npm start
```

### Browser tests

```bash
npx playwright install --with-deps chromium
npm run build
npm run test:e2e
```

Playwright starts the production server if one is not already running. For an already hosted test app, set `TEST_BASE_URL`. For an installed custom Chromium, set `CHROMIUM_PATH`.

Coverage includes search, persistent watchlist, modal keyboard dismissal, click-to-load, movie/episode iframe URLs, launch history, mobile navigation and overflow. **The provider iframe is stubbed in browser tests**: actual remote streams are not asserted. Unit tests mock TMDB to check URL construction, normalization, validation, filtering, pagination, and failure handling.

## Project map

```text
src/app/page.tsx               App entry
src/components/ScreenNest.tsx  Discovery UI, local library, dialogs and player
src/app/globals.css            Responsive visual system
src/app/api/catalog/route.ts   Server-only, validated TMDB adapter
src/lib/catalog.ts            Types, demo catalog, image helpers, embed URL builder
public/images/                Optimized promotional artwork
```

The API accepts fixed modes (`trending`, `popular`, `top_rated`, `discover`, `search`, `detail`, `season`), a `movie`/`tv` type, and validated numeric parameters. It cannot fetch arbitrary URLs. Without a token it returns a clearly identified demo source; with an invalid token or an upstream outage it returns an explicit `502`, not fake live data. Use Vercel Firewall/rate-limit rules for `/api/catalog` on a public high-traffic deployment to protect your TMDB quota.

## Production checklist

- Configure and test a valid TMDB token in Vercel.
- Confirm rights and terms for video playback and promotional artwork in your region.
- Review third-party player ads, privacy practices, and mobile playback yourself.
- Configure your domain and appropriate rate limits in Vercel.
- Review your privacy/legal information and replace demo artwork if required.
- Run `npm audit` and keep dependencies updated. The PostCSS override selects a patched release compatible with Next’s PostCSS 8 dependency.

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB. Metadata and live artwork: [The Movie Database](https://www.themoviedb.org). Player documentation: [Screenscape](https://screenscape.me/embed). Fonts: DM Sans and Manrope through Fontsource; icons: Lucide. Promotional artwork remains the property of its respective owners; repository code licensing does not grant rights to that artwork. See [ASSETS.md](ASSETS.md) for bundled artwork sources.

### Verification in the build environment

Production compilation/type-checking, ESLint, unit/API tests and browser UI tests were run. This environment restricts outbound access to TMDB and the actual Screenscape player; no claim is made that every remote title plays successfully. Test live catalog and playback from your deployed site.
