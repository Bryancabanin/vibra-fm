import { refreshIfNeeded } from './tokenRefresh.ts';

export const searchTrackId = async (
  artist: string,
  song: string,
  user: Express.User,
) => {
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

    const spotifySong = await result.json();
    if (!spotifySong.tracks?.items?.length) {
      return null;
    }
    return spotifySong.tracks.items[0].id;
  } catch (error) {
    console.error('Error fetching spotify track id', error);
    throw error;
  }
};
