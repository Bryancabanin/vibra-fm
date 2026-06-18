import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './HistoryPage.module.css';

interface HistoryPageResult {
  id: string;
  seedSong: string;
  seedArtist: string;
  createdAt: Date;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  // create state
  const [sessions, setSessions] = useState<HistoryPageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // fetch all sessions and display them as a clickable list
  // fetch all sessions as soon as we load the page
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError('');

      // API call to fetch all playlists
      try {
        const res = await fetch('/api/history', { credentials: 'include' });
        const playlistData = await res.json();
        setSessions(playlistData);
      } catch (error) {
        console.error('Failed fetching sessions', error);
        setError('Failed fetching sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className={styles.historyContainer}>
      <h1>History</h1>
      <p>All your past discovery sessions</p>

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading &&
        sessions.map((element) => (
          <div
            key={element.id}
            onClick={() => navigate(`/history/${element.id}`)}
            className={styles.sessionCard}
          >
            <div>
              <h3>
                {element.seedSong} — {element.seedArtist}
              </h3>
              <p>
                {new Date(element.createdAt).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
            <span> › </span>
          </div>
        ))}
    </div>
  );
};

export default HistoryPage;
