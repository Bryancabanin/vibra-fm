import { useState } from 'react';
import SaveToPlayListModal from '../components/SaveToPlaylistModal';
import TrackCard from '../components/TrackCard';
import styles from './DiscoverPage.module.css';
import { API_URL } from '../config.ts';

interface TrackResult {
  spotifyTrackId: string;
  song: string;
  artist: string;
  album: string;
  albumUrl: string;
}

interface RecommendationsResponse {
  finalTracks: TrackResult[];
  sessionId: string;
}

const DiscoverPage = () => {
  // Need state
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState<TrackResult[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // handler for on change for artist
  const handleArtistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArtist(e.target.value);
  };

  const handleSongInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSong(e.target.value);
  };

  // handler for submit
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!artist.trim() || !song.trim()) {
      setError('Please enter both an artist and a song.');
      return;
    }

    getTracks();
  };

  const getTracks = async () => {
    setLoading(true);
    setSearchResult([]);
    setHasSearched(false);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/recommendations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist,
          song,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setError(
            "You've used all your searches for today. Come back tomorrow!",
          );
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }

      const data = (await res.json()) as RecommendationsResponse;
      setSearchResult(data.finalTracks);
      setSessionId(data.sessionId);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching song', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.discoverContainer}>
        <h1>Discover</h1>
        <p>Enter an Artist and song to find music you've never head before</p>
        <form onSubmit={handleSubmit}>
          <label>
            Artist
            <input
              type='text'
              value={artist}
              onChange={handleArtistInputChange}
              placeholder='e.g. Toto'
            />
          </label>

          <label>
            Song
            <input
              type='text'
              value={song}
              onChange={handleSongInputChange}
              placeholder='e.g. Africa'
            />
          </label>

          <button type='submit'>Search</button>
        </form>
      </div>

      {error && <p className={styles.statusMessage}>{error}</p>}

      {loading && <p className={styles.statusMessage}>Loading...</p>}

      {hasSearched && searchResult.length === 0 && (
        <p className={styles.statusMessage}>
          No results found. Try another search.
        </p>
      )}

      {hasSearched && !loading && searchResult.length > 0 && (
        <div className={styles.recommendationsContainer}>
          <div className={styles.recommendationsHeader}>
            <div className={styles.recommendationsTitle}>
              <h2>Recommendations</h2>
              <p>
                {searchResult.length} songs · filtered to music you haven't
                heard
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.saveButton}
            >
              ≡ Save to Playlist
            </button>
          </div>

          <div className={styles.trackGrid}>
            {searchResult.map((track) => (
              <TrackCard key={track.spotifyTrackId} {...track} />
            ))}
          </div>
        </div>
      )}

      <SaveToPlayListModal
        sessionId={sessionId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trackCount={searchResult.length}
      />
    </div>
  );
};

export default DiscoverPage;
