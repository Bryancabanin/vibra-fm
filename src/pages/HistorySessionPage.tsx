import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

interface HistorySessionPageResult {
  spotify_track_id: string;
  song: string;
  artist: string;
  album: string;
  album_url: string;
}

const HistorySessionPage = () => {
  const { sessionId } = useParams();
  const [tracks, setTracks] = useState<HistorySessionPageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError('');
      // make API to get all tracks for specific session
      try {
        const res = await fetch(`/api/history/${sessionId}`, {
          credentials: 'include',
        });
        const sessionTracks = await res.json();
        setTracks(sessionTracks);
      } catch (error) {
        console.error('Failed fetching songs for session', error);
        setError('Failed fetching songs for session');
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, [sessionId]);

  return (
    <div>
      <h3>History Session Page</h3>

      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading &&
        tracks.map((track) => (
          <div key={track.spotify_track_id}>
            <img src={track.album_url} alt={track.album} width={150} />
            <h3>Song: {track.song} </h3>
            <p>Artist: {track.artist} </p>
            <p>Album: {track.album} </p>
          </div>
        ))}
    </div>
  );
};

export default HistorySessionPage;
