import { refreshIfNeeded } from './tokenRefresh.ts';

export interface TrackResult {
  spotifyTrackId: string;
  song: string;
  artist: string;
  album: string;
  albumUrl: string;
}

export const searchTrackId = async (
  artist: string,
  song: string,
  user: Express.User,
): Promise<TrackResult | null> => {
  const access_token = await refreshIfNeeded(user);
  const q = encodeURIComponent(`track:${song} artist:${artist}`);
  const url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`;

  try {
    const result = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (result.status === 429) {
      const retryAfter = result.headers.get('Retry-After');
      console.error(
        `Spotify rate limit hit. Retry after ${retryAfter} seconds`,
      );
      return null;
    }

    const spotifySong = await result.json();

    if (!spotifySong.tracks?.items?.length) {
      return null;
    }

    // Changing since we are missing artist, song, album name and album image
    // return spotifySong.tracks.items[0].id;
    return {
      spotifyTrackId: spotifySong.tracks.items[0].id,
      song: spotifySong.tracks.items[0].name,
      artist: spotifySong.tracks.items[0].artists[0].name,
      album: spotifySong.tracks.items[0].album.name,
      albumUrl: spotifySong.tracks.items[0].album.images[0].url,
    };
  } catch (error) {
    console.error('Error fetching spotify track id', error);
    throw error;
  }
};
