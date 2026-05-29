import { pool } from '../config/db.ts';

// Queries our fingerprints table to find if we have the spotify_track_id.
export const filterTracks = async (
  spotifyTrackId: string[],
  user: Express.User,
) => {
  const sqlQuery = `
    SELECT unnest as spotify_track_id
    FROM UNNEST($1::text[]) AS unnest
    WHERE unnest NOT IN (
      SELECT spotify_track_id 
      FROM fingerprints 
      WHERE user_id = $2
    )
  `;
  try {
    const result = await pool.query(sqlQuery, [spotifyTrackId, user.id]);
    return result.rows;
  } catch (error) {
    console.error('Error filtering already listened spotify track ids', error);
    throw error;
  }
};
