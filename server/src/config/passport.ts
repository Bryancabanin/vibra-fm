import passport from 'passport';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import 'dotenv/config';
import { pool } from './db.ts';

// serializeUser: called after login suceeds. Takes the full user object and decides what small piece
// of data to store in the session. Since I have a db I just store the user's id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializeUser: called on every subrequest. Takes that stored id, looks up the full user in the database
// and attaches it to the req.user
passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await pool.query(`SELECT * FROM users where id = $1`, [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// Config
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      callbackURL: process.env.REDIRECT_URI!,
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      // Get current current date and time
      const now = new Date();

      // We want to convert the seconds that expires_in has into milliseconds
      // 1 seconds has 1000 milliseconds
      const expiresInMilliseconds = expires_in * 1000;
      const token_expires = new Date(now.getTime() + expiresInMilliseconds);

      // Create sql to insert information into our database.
      // If it already exists then we need to use on conflict with spotify_id
      const query = `INSERT INTO users (spotify_id, access_token, refresh_token, token_expires) VALUES ($1, $2, $3, $4) ON CONFLICT (spotify_id) DO UPDATE SET access_token = EXCLUDED.access_token , refresh_token =EXCLUDED.refresh_token , token_expires = EXCLUDED.token_expires RETURNING *`;

      // Need to upsert the user into our database
      try {
        const result = await pool.query(query, [
          profile.id,
          accessToken,
          refreshToken,
          token_expires,
        ]);

        return done(null, result.rows[0]);
      } catch (err) {
        console.error('Error upserting user to database', err);
        done(err as Error);
      }
    },
  ),
);

export default passport;
