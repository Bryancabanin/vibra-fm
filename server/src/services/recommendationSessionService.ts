import { pool } from '../config/db.ts';
import { TrackResult } from '../services/spotifySearchService';

export const saveSessionInfo = async (
  user: Express.User,
  artist: string,
  song: string,
  finalTracks: TrackResult[],
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // query to store info into recommendation_sessions
    const sessionQuery = `INSERT INTO recommendation_sessions (user_id, seed_song, seed_artist) VALUES ($1, $2, $3) RETURNING id;`;
    const recommendationSessionResult = await client.query(sessionQuery, [
      user.id,
      artist,
      song,
    ]);

    // Grabbing id from recommendationSessionResult
    const sessionId = recommendationSessionResult.rows[0].id;

    // query to store info into recommendation_track

    // need to iterate over finalTracks and make params and valuedClauses
    const valueClauses = [];
    const params = [];

    let firstPlaceholder = 1;
    let secondPlaceholder = 2;
    let thirdPlaceholder = 3;
    let fourthPlaceholder = 4;
    let fifthPlaceholder = 5;
    let sixthPlaceholder = 6;

    for (const value of finalTracks) {
      valueClauses.push(
        `($${firstPlaceholder}, $${secondPlaceholder}, $${thirdPlaceholder}, $${fourthPlaceholder}, $${fifthPlaceholder}, $${sixthPlaceholder})`,
      );
      params.push(
        sessionId,
        value.spotify_track_id,
        value.song,
        value.artist,
        value.album,
        value.albumUrl,
      );

      firstPlaceholder += 6;
      secondPlaceholder += 6;
      thirdPlaceholder += 6;
      fourthPlaceholder += 6;
      fifthPlaceholder += 6;
      sixthPlaceholder += 6;
    }

    // turning valueClauses array into a string
    const placeholderString = valueClauses.join(', ');

    const trackQuery = `INSERT INTO recommendation_tracks (session_id, spotify_track_id, song, artist, album, album_url) VALUES ${placeholderString}`;
    await client.query(trackQuery, params);
    await client.query('COMMIT');
    return sessionId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
