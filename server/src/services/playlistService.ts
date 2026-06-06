import { refreshIfNeeded } from './tokenRefresh.ts';

export const createPlaylist = async (
  user: Express.User,
  playlistName: string,
) => {
  const access_token = await refreshIfNeeded(user);
  const url = 'https://api.spotify.com/v1/me/playlists';
  const body = JSON.stringify({
    name: `${playlistName}`,
    public: false,
  });

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    const playlistResult = await result.json();
    return {
      playlistId: playlistResult.id,
      external_urls: playlistResult.external_urls.spotify,
    };
  } catch (error) {
    console.error('Error creating playlist', error);
    throw error;
  }
};

export const addTracksToPlaylist = async (
  access_token: string,
  playlistId: string,
  trackIds: string[],
) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/items`;
  const uris = trackIds.map((id) => `spotify:track:${id}`);
  const body = JSON.stringify({
    uris: uris,
  });

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });
    if (!result.ok) {
      console.error('Failed adding song to playlist.');
      throw new Error('Failed adding song to playlist.');
    }
  } catch (error) {
    console.error('Error adding songs to playlist', error);
    throw error;
  }
};
