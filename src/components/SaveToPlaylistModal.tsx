import { useState } from 'react';

interface SaveToPlayListModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}
const SaveToPlayListModal = ({
  sessionId,
  isOpen,
  onClose,
}: SaveToPlayListModalProps) => {
  const [playlistName, setPlaylistName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaylistNameInputChange = (e) => {
    setPlaylistName(e.target.value);
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!playlistName) {
      setError('Please enter playlist name');
      return;
    }
    createPlaylist();
  };

  // hanlder to create playlist
  const createPlaylist = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          playlistName,
        }),
      });

      const data = await res.json();
      setSpotifyUrl(data);
    } catch (error) {
      console.error('Error creating playlist', error);
      setError('Error creating playlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <h2>Save to Playlist</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Playlist Name:
          <input
            type='text'
            value={playlistName}
            onChange={handlePlaylistNameInputChange}
            placeholder='Playlist Name...'
          />
        </label>
        <button type='submit'>Create Playlist</button>
      </form>
      <button onClick={onClose}>Cancel</button>
      {error && <p>{error}</p>}

      {loading && <p>Loading...</p>}

      {spotifyUrl && <a href={spotifyUrl}>Open in Spotify</a>}
    </div>
  );
};

export default SaveToPlayListModal;
