// collection of every track ID associated with a user, pulled from 4 sources.
// Liked songs GET /me/tracks
// Recently played GET /me/player/recently-played
// Top tracks (3 calls: short, medium, long)  GET /me/top/tracks
// Users playlist GET /me/playlists then => GET /playlists/{id}/items

export async function buildFingerprint(
  user_id: string,
  spotify_id: string,
  access_token: string,
) {
  const trackIds = new Set<string>();

  // Liked songs GET /me/tracks
  try {
    let url = 'https://api.spotify.com/v1/me/tracks?limit=50';

    while (url) {
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const likedSongs = await result.json();

      for (const songs of likedSongs.items) {
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
    let url = `https://api.spotify.com/v1/me/player/recently-played?limit=50`;

    while (url) {
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const recentlyPlayed = await result.json();

      for (const songs of recentlyPlayed.items) {
        trackIds.add(songs.track.id);
      }

      url = recentlyPlayed.next;
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

    // TODO: fetch tracks for this playlist using GET /playlists/{playlist.id}/items
    // then paginate with next, use song.item.id for the track id
    while (url) {
      const result = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userPlaylist = await result.json();

      // iterate through userPlaylist and we need to find owner.id and make sure it equals the spotify_id

      for (const playlist of userPlaylist.items) {
        if (playlist.owner.id === spotify_id) {
          // get specific playlist items
          // https://api.spotify.com/v1/playlists/{playlist_id}/items
        }
      }
    } // end of while
  } catch (error) {
    console.error('Error fetching User Playlist', error);
  }
}
