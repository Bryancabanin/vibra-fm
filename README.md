# Vibra FM

Vibra FM is a music discovery app built for people who actually want to find music they haven't heard before.

Spotify's built-in "Song Radio" feature surfaces songs similar to what you're listening to — but in practice, many of those recommendations are tracks you already know: songs from your playlists, recently played tracks, or liked songs. The discovery aspect is largely missing.

Vibra FM fixes that. It uses AI to generate song recommendations based on a seed song and artist, cross-references those results against your actual listening history, and only shows you songs you haven't encountered before. When you find a batch you like, you can save them directly to a new Spotify playlist with one click.

---

## Features

- **Spotify OAuth login** — sign in with your Spotify account to authorize Vibra FM to search and create playlists on your behalf
- **AI-powered recommendations** — enter any artist and song; GPT-4o analyzes the track across genre, mood, energy level, instrumentation, vocal style, and era, then returns 50–60 sonically similar recommendations
- **Fingerprint filtering** — on login, Vibra FM builds a fingerprint of your Spotify listening history (liked songs, recently played, top tracks, and your own playlists) and uses it to filter out any recommendations you've already heard
- **Discover page** — displays filtered recommendations with song name, artist, album name, and album artwork
- **Save to playlist** — name and create a new Spotify playlist directly from the app; all recommended tracks are added automatically
- **History** — browse all your past discovery sessions, each showing the seed artist and song and when it was run
- **Session detail** — click any past session to see its full list of recommended tracks, with the option to save them to a playlist at any time

---

## Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | React, TypeScript, Vite        |
| Backend    | Node.js, Express, TypeScript   |
| Database   | PostgreSQL via Supabase        |
| Auth       | Passport.js + passport-spotify |
| AI         | OpenAI GPT-4o                  |
| Music data | Spotify Web API                |

---

## How It Works

### 1. Authentication

The user logs in via Spotify OAuth. Passport.js handles the OAuth flow and stores the user's Spotify access token, refresh token, and token expiry in the database. Sessions are managed server-side using `express-session`.

### 2. Fingerprint Building

Immediately after login, Vibra FM builds a fingerprint of the user's Spotify listening history in the background. It pulls from four sources:

- Liked songs
- Recently played (up to 50 tracks)
- Top tracks across three time ranges: short-term (4 weeks), medium-term (6 months), and long-term (1 year)
- The user's own playlists

All collected track IDs are stored in the `fingerprints` table in the database, keyed to the user.

### 3. Recommendation Pipeline

When the user submits a seed artist and song on the Discover page:

1. GPT-4o is prompted to recommend 50–60 songs that are sonically similar, analyzed across genre, mood, energy, instrumentation, vocal style, and era
2. Each recommended song is searched on the Spotify API to retrieve its Spotify track ID, album name, and album artwork
3. The resulting track IDs are checked against the user's fingerprint — any track the user has already heard is removed
4. The filtered results are saved to the database as a recommendation session, and returned to the frontend

### 4. Saving to Playlist

When the user chooses to save a session's recommendations, they enter a playlist name. The backend creates a new private playlist on their Spotify account and adds all the session's tracks to it. A link to open the playlist directly in Spotify is returned.

### 5. Token Refresh

Before every Spotify API call, the server checks whether the user's access token is within 5 minutes of expiring. If it is, it automatically fetches a new token using the stored refresh token and updates the database, so the user never experiences an auth failure mid-session.

---

## Spotify Permissions Required

Vibra FM requests the following Spotify scopes on login:

| Scope                       | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `user-library-read`         | Read liked songs for fingerprinting              |
| `user-read-recently-played` | Read recently played tracks for fingerprinting   |
| `user-top-read`             | Read top tracks for fingerprinting               |
| `playlist-read-private`     | Read user's private playlists for fingerprinting |
| `playlist-modify-public`    | Create and add tracks to public playlists        |
| `playlist-modify-private`   | Create and add tracks to private playlists       |

---

## Getting Started

### Prerequisites

- Node.js
- A Spotify Developer account with a registered app ([Spotify Developer Dashboard](https://developer.spotify.com/dashboard))
- An OpenAI API key
- A PostgreSQL database (the project uses Supabase)

### Environment Variables

Create a `.env` file in the `server/` directory with the following:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=your_spotify_redirect_uri
SESSION_SECRET=your_session_secret
OPENAI_API_KEY=your_openai_api_key
DATABASE_URI=your_postgresql_connection_string
```

### Installation

```bash
# Install frontend dependencies (from root)
npm install

# Install backend dependencies
cd server && npm install
```

### Running the App

```bash
# From the root directory — starts both frontend and backend concurrently
npm run dev
```
