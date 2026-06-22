import { useState } from 'react';
import styles from './SaveToPlaylistModal.module.css';

interface SaveToPlayListModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  trackCount: number;
}
const SaveToPlayListModal = ({
  sessionId,
  isOpen,
  onClose,
  trackCount,
}: SaveToPlayListModalProps) => {
  const [playlistName, setPlaylistName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaylistNameInputChange = (e) => {
    setPlaylistName(e.target.value);
  };

  // Resets local state, then tells the parent to close
  const handleClose = () => {
    setPlaylistName('');
    setSpotifyUrl('');
    setLoading(false);
    setError('');
    onClose();
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
          sessionId,
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.headerRow}>
          <h2>Save to playlist</h2>
          <button
            type='button'
            onClick={handleClose}
            className={styles.closeButton}
          >
            x
          </button>
        </div>

        <hr className={styles.hrLine} />

        <p>
          Give your playlist a name and we'll create in your Spotify account
          wiht all the recommended tracks.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            <span>Playlist name</span>
            <input
              type='text'
              value={playlistName}
              onChange={handlePlaylistNameInputChange}
              placeholder='e.g. Vibra — Let It Happen'
            />
          </label>
          <div className={styles.trackCountRow}>
            <span>♪</span>
            <p>
              <strong>{trackCount} songs</strong> will be added to this playlist
            </p>
          </div>

          <hr className={`${styles.hrLine} ${styles.hrLineFooter}`} />

          <div className={styles.footer}>
            <button
              type='button'
              onClick={handleClose}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={`${styles.button} ${styles.createButton}`}
            >
              Create Playlist
            </button>
          </div>
        </form>

        {error && <p>{error}</p>}

        {loading && <p>Loading...</p>}

        {spotifyUrl && (
          <div className={styles.successRow}>
            <span className={styles.successText}>✓ Playlist created</span>
            <a
              href={spotifyUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.successLink}
            >
              Open in Spotify →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveToPlayListModal;
