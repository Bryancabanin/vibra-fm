import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import SaveToPlayListModal from '../components/SaveToPlaylistModal';
import TrackCard from '../components/TrackCard';
import styles from './HistorySessionPage.module.css';

interface SessionInfo {
  id: string;
  seedSong: string;
  seedArtist: string;
  createdAt: Date;
}

interface HistorySessionPageResult {
  spotifyTrackId: string;
  song: string;
  artist: string;
  album: string;
  albumUrl: string;
}

const HistorySessionPage = () => {
  const { sessionId } = useParams();
  const [tracks, setTracks] = useState<HistorySessionPageResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError('');
      // make API to get all tracks for specific session
      try {
        const [tracksRes, infoRes] = await Promise.all([
          fetch(`/api/history/${sessionId}`, { credentials: 'include' }),
          fetch(`/api/history/${sessionId}/info`, { credentials: 'include' }),
        ]);

        const sessionTracks = await tracksRes.json();
        const info = await infoRes.json();

        setTracks(sessionTracks);
        setSessionInfo(info);
      } catch (error) {
        console.error('Failed fetching songs for session', error);
        setError('Failed fetching songs for session');
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [sessionId]);

  if (!sessionId) return <p>Session not found.</p>;

  return (
    <div>
      <button
        onClick={() => navigate('/history')}
        className={styles.backButton}
      >
        ← Back to history
      </button>

      {!loading && (
        <div className={styles.sessionContainer}>
          {sessionInfo && (
            <div>
              <h3>
                {sessionInfo.seedSong} — {sessionInfo.seedArtist}{' '}
              </h3>
              <p>
                {new Date(sessionInfo.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                · {tracks.length} songs
              </p>
            </div>
          )}

          {tracks.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.saveButton}
            >
              ≡ Save to Playlist
            </button>
          )}
        </div>
      )}

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <div className={styles.recommendedTracksContainer}>
            <h3>Recommended Tracks </h3>
            <p>{tracks.length} songs</p>
          </div>

          <div className={styles.recommendationsContainer}>
            <div className={styles.trackGrid}>
              {tracks.map((track) => (
                <TrackCard key={track.spotifyTrackId} {...track} />
              ))}
            </div>
          </div>
        </>
      )}

      <SaveToPlayListModal
        sessionId={sessionId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default HistorySessionPage;
