import { pool } from '../config/db.ts';
import { refreshIfNeeded } from './tokenRefresh.ts';

// collection of every track ID associated with a user, pulled from 4 sources.
// Liked songs GET /me/tracks
// Recently played GET /me/player/recently-played
// Top tracks (3 calls: short, medium, long)  GET /me/top/tracks
// Users playlist GET /me/playlists then => GET /playlists/{id}/items

export const buildFingerprint = async (user: Express.User) => {
  const access_token = await refreshIfNeeded(user);
  const trackIds = new Set<string>();

  let apiCallCount = 0;

  // Liked songs GET /me/tracks
  try {
    let url = 'https://api.spotify.com/v1/me/tracks?limit=50';

    while (url) {
      apiCallCount++;
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const likedSongs = await result.json();
      // debugging
      // console.log(likedSongs);

      for (const songs of likedSongs.items) {
        if (!songs.track || !songs.track.id) continue;

        trackIds.add(songs.track.id);
      }

      // need to set url to our next so we can fetch the next track.ids
      url = likedSongs.next;
    }
  } catch (error) {
    console.error('Error getting Liked Songs', error);
  }

  // Recently played has a hard cap of 50 tracks total — no pagination needed
  // Recently played
  try {
    apiCallCount++;
    const result = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=50`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const recentlyPlayed = await result.json();

    for (const songs of recentlyPlayed.items) {
      if (!songs.track || !songs.track.id) continue;

      trackIds.add(songs.track.id);
    }
  } catch (error) {
    console.error('Error getting Recently Played', error);
  }

  // Top 3 short, medium, long GET /me/top/tracks
  // https://api.spotify.com/v1/me/top/{type}
  // long_term = 1 year, medium_term = 6 months, short_term = 4 weeks
  try {
    const timeRanges = ['short_term', 'medium_term', 'long_term'];
    let numberOfTracks = 0;

    for (const timeRange of timeRanges) {
      let url = `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`;

      while (url && numberOfTracks < 200) {
        apiCallCount++;
        // fetch, extract song id, increment counter, update url
        const result = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const topSongs = await result.json();

        // iterate through the topSongs
        for (const songs of topSongs.items) {
          if (!songs.id) continue;

          if (!trackIds.has(songs.id)) {
            trackIds.add(songs.id);
            numberOfTracks++;
          }
        }
        // update url
        url = topSongs.next;
      } //end of while loop
    }
  } catch (error) {
    console.error('Error getting Top Played', error);
  }

  // Use song.item.id not song.track.id — track field is deprecated in this endpoint
  // get users playlist 'https://api.spotify.com/v1/me/playlists?limit=50'
  try {
    let url = `https://api.spotify.com/v1/me/playlists?limit=50`;

    while (url) {
      apiCallCount++;
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userPlaylist = await result.json();

      // iterate through userPlaylist and we need to find owner.id and make sure it equals the spotify_id

      for (const playlist of userPlaylist.items) {
        if (playlist.owner.id === user.spotify_id) {
          // get specific playlist items
          // https://api.spotify.com/v1/playlists/{playlist_id}/items

          let playlistUrl = `https://api.spotify.com/v1/playlists/${playlist.id}/items`;

          while (playlistUrl) {
            apiCallCount++;
            const result = await fetch(playlistUrl, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            });

            const userSpecificPlaylist = await result.json();

            for (const songs of userSpecificPlaylist.items) {
              if (!songs.item || !songs.item.id) continue;

              trackIds.add(songs.item.id);
            }
            playlistUrl = userSpecificPlaylist.next;
          }
        }
      }
      url = userPlaylist.next;
    } // end of while
  } catch (error) {
    console.error('Error fetching User Playlist', error);
  }
  // logging API calls right before the early return check
  console.log(
    `[METRIC] Total Spotify API calls for fingerprint build: ${apiCallCount}`,
  );
  console.log(`[METRIC] Total unique tracks fingerprinted: ${trackIds.size}`);

  if (trackIds.size === 0) {
    console.log('Track id Set is empty');
    return;
  }

  // create empty array for placeholders
  // create empty array for values
  // loop through trackIds
  //   push the placeholder group into placeholders
  //   push user_id and trackId into values
  // join placeholders with commas
  // build the full query string

  const valueClauses = [];

  const params = [];

  let firstPlaceholder = 1;
  let secondPlaceholder = 2;

  // iterate throguh set
  for (const value of trackIds) {
    // push
    valueClauses.push(
      `($` + firstPlaceholder + ', $' + secondPlaceholder + ')',
    );
    params.push(user.id, value);

    //then after increase placeholders
    firstPlaceholder += 2;
    secondPlaceholder += 2;
  }

  // turn valueClauses array into a string
  const placeholderString = valueClauses.join(', ');

  // insert into our database in the fingerprint table
  const sqlQuery = `INSERT INTO fingerprints (user_id, spotify_track_id) VALUES ${placeholderString} ON CONFLICT DO NOTHING`;

  await pool.query(sqlQuery, params);
};
