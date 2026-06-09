import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface HistoryPageResult {
  id: string;
  seed_song: string;
  seed_artist: string;
  created_at: Date;
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
    <div>
      <h1> History Page</h1>

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading &&
        sessions.map((element) => (
          <div
            key={element.id}
            onClick={() => navigate(`/history/${element.id}`)}
          >
            <h3>Song: {element.seed_song}</h3>
            <p>Artist: {element.seed_artist}</p>
            <p>Created at: {new Date(element.created_at).toLocaleString()}</p>
          </div>
        ))}
    </div>
  );
};

export default HistoryPage;
