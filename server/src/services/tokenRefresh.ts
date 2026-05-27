import 'dotenv/config';
import { pool } from '../config/db';

// Before making any API call check if the token is close to expiring.
// Need to set up a conditional when its close to expire we use refresh_token
// to get a new one from Spotify

// Then update refresh token in our datbase

export const refreshIfNeeded = async (user: Express.User): Promise<string> => {
  const tokenURL = 'https://accounts.spotify.com/api/token';
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: user.refresh_token,
  });

  // check if the token is close to expiring
  // we have token_expires from user

  // Get current current date and time
  const now = new Date();

  const timeRemaining = user.token_expires.getTime() - now.getTime();

  const fiveMinutes = 300000;

  // we need to check if the time remaining is <= 5 minutes
  if (timeRemaining <= fiveMinutes) {
    // get new access token
    try {
      const response = await fetch(tokenURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            `Basic ` +
            btoa(
              process.env.SPOTIFY_CLIENT_ID +
                ':' +
                process.env.SPOTIFY_CLIENT_SECRET,
            ),
        },
        body: body,
      });

      if (!response.ok) {
        throw Error('Failed to fetch access token');
      }

      const data = await response.json();

      const timeAfterFetch = new Date();
      const expiresInMilliseconds = data.expires_in * 1000;
      const token_expires = new Date(
        timeAfterFetch.getTime() + expiresInMilliseconds,
      );

      // update our database with data.acess_token and token_expires
      const query = `UPDATE users SET access_token = $1, token_expires = $2 WHERE id = $3`;

      try {
        await pool.query(query, [data.access_token, token_expires, user.id]);
      } catch (error) {
        console.error('Error updating access token and token expires', error);
        throw new Error('Error updating access token and token expires');
      }

      return data.access_token;
    } catch (error) {
      console.error('Error getting access token', error);
      throw new Error('Error getting access token');
    }
  }
  // we are over the 5 minute buffer then we just return the access_token
  return user.access_token;
};
