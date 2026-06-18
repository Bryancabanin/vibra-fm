import { pool } from '../config/db.ts';

export const getSessions = async (user: Express.User) => {
  // First function get all sessions for a user. Queries recommendation_sessions where
  // user_id matches the logged in user and returns a list of sessions with id, seed_song,
  // artist_seed , created_at

  const sessionsQuery = `SELECT id, seed_song AS "seedSong", seed_artist AS "seedArtist", created_at AS "createdAt" FROM recommendation_sessions WHERE user_id = $1`;

  try {
    const allSessionsResult = await pool.query(sessionsQuery, [user.id]);

    return allSessionsResult.rows;
  } catch (error) {
    console.error('Failed fetching session', error);
  }
};

export const getSessionInfo = async (user: Express.User, sessionId: string) => {
  const sessionInfoQuery = `SELECT id, seed_song AS "seedSong", seed_artist AS "seedArtist", created_at AS "createdAt" FROM recommendation_sessions WHERE id = $1 AND user_id = $2`;

  try {
    const sessionInfoResult = await pool.query(sessionInfoQuery, [
      sessionId,
      user.id,
    ]);
    return sessionInfoResult.rows[0];
  } catch (error) {
    console.error('Failed fetching session info', error);
  }
};

export const getSessionTracks = async (
  user: Express.User,
  sessionId: string,
) => {
  // get all tracks Ids for a specific session which queries
  // recommendation_tracks where session_id mathces the requested session
  // also need to verify that the session belongs to the logged in user.

  const sessionTracksQuery = `
  SELECT rt.spotify_track_id AS "spotifyTrackId", rt.song, rt.artist, rt.album, rt.album_url AS "albumUrl" FROM recommendation_tracks rt
  JOIN recommendation_sessions rs ON rt.session_id = rs.id
  WHERE rt.session_id = $1
  AND 
  rs.user_id = $2
  `;

  try {
    const allSessionTracksResults = await pool.query(sessionTracksQuery, [
      sessionId,
      user.id,
    ]);

    return allSessionTracksResults.rows;
  } catch (error) {
    console.error('Failed fetching tracks in specific session', error);
  }
};
