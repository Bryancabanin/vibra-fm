import { pool } from '../config/db.ts';

export const getSessions = async (user: Express.User) => {
  // First function get all sessions for a user. Queries recommendation_sessions where
  // user_id matches the logged in user and returns a list of sessions with id, seed_song,
  // artist_seed , created_at

  const sessionsQuery = `SELECT id, seed_song, seed_artist, created_at FROM recommendation_sessions WHERE user_id = $1`;

  try {
    const allSessionsResult = await pool.query(sessionsQuery, [user.id]);

    return allSessionsResult.rows;
  } catch (error) {
    console.error('Failed fetching session', error);
  }
};

export const getSessionTracks = async (
  user: Express.User,
  session_id: string,
) => {
  // get all tracks Ids for a specific session which queries
  // recommendation_tracks where session_id mathces the requested session
  // also need to verify that the session belongs to the logged in user.

  const sessionTracksQuery = `
  SELECT rt.spotify_track_id, rt.song, rt.artist, rt.album, rt.album_url FROM recommendation_tracks rt
  JOIN recommendation_sessions rs ON rt.session_id = rs.id
  WHERE rt.session_id = $1
  AND 
  rs.user_id = $2
  `;

  try {
    const allSessionTracksResults = await pool.query(sessionTracksQuery, [
      session_id,
      user.id,
    ]);

    return allSessionTracksResults.rows;
  } catch (error) {
    console.error('Failed fetching tracks in specific session', error);
  }
};
