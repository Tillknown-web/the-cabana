# The Cabana

**poolside, after dark**

A private dining event web app built with Next.js + Supabase.

---

## Stack

- **Frontend/API:** Next.js 14 App Router on Vercel
- **Database:** Supabase Postgres
- **Realtime:** Supabase Realtime (WebSocket push — no polling)
- **Photo Storage:** Supabase Storage
- **Auth (kitchen):** Cookie-based password auth
- **Music:** Spotify Web API (read-only, now-playing bar)

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then run `supabase-schema.sql` in the SQL editor.

In the Storage section, create a bucket named **`cabana-photos`** (private).

### 2. Create a session row

In Supabase Studio → Table Editor → `sessions`, insert a row:
- `id`: any UUID (copy it — you'll need it)
- `current_card`: `checkin`
- `released_cards`: `{}`

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KITCHEN_PASSWORD=your-secret-kitchen-password
NEXT_PUBLIC_ACTIVE_SESSION_ID=your-session-uuid-from-step-2

# Optional — Spotify now-playing bar
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...
```

### 4. Run locally

```bash
npm install
npm run dev
```

---

## Pages

| URL | Purpose |
|-----|---------|
| `/` | Static landing — hero, menu, chefs, CTA |
| `/experience` | Guest app — check-in → cards → gallery |
| `/kitchen` | Chef admin panel (password protected) |
| `/gallery/{sessionId}` | Public read-only photo gallery |

---

## Event Night Flow

1. Open `/kitchen` on the chef's phone — log in with `KITCHEN_PASSWORD`
2. Guests open `/experience` on their phones — enter their name to check in
3. Chef releases cards from the kitchen panel as each course is served
4. Guests see each card pop up with a chime, take their photo, react to the other guest's photo
5. At the end, chef releases the gallery — everyone gets their keepsake receipt

---

## Spotify Setup (optional)

1. Create an app at [developer.spotify.com](https://developer.spotify.com)
2. Set redirect URI to `http://localhost:3000/callback`
3. Run the OAuth flow to get a refresh token (scope: `user-read-currently-playing`)
4. Store `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REFRESH_TOKEN` in `.env.local`

---

## Deploy to Vercel

```bash
npx vercel --prod
```

Add all env vars in the Vercel dashboard under Settings → Environment Variables.
