import { useState } from 'react';

interface TrackResult {
  spotify_track_id: string;
  song: string;
  artist: string;
  album: string;
  albumUrl: string;
}

const DiscoverPage = () => {
  // Need state
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<TrackResult[]>([]);
  const [error, setError] = useState('');

  // handler for on change for artist
  const handleArtistInputChange = (e) => {
    setArtist(e.target.value);
  };

  const handleSongInputChange = (e) => {
    setSong(e.target.value);
  };

  // handler for submit
  const handleSubmit = (e) => {
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
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artist,
          song,
        }),
      });

      const data = await res.json();
      setSearchResult(data);
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
      <h1>Discover</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Artist:
          <input
            type='text'
            value={artist}
            onChange={handleArtistInputChange}
            placeholder='Artist name...'
            // onChange={(e) => setArtist(e.target.value)}
          />
        </label>

        <label>
          Song:
          <input
            type='text'
            value={song}
            onChange={handleSongInputChange}
            placeholder='Song name...'
            // onChange={(e) => setSong(e.target.value)}
          />
        </label>

        <button type='submit'>Search</button>
      </form>

      {error && <p>{error}</p>}

      {loading && <p>Loading...</p>}

      {hasSearched && searchResult.length === 0 && (
        <p>No results found. Try another search.</p>
      )}

      {!loading &&
        searchResult.map((track) => (
          <div key={track.spotify_track_id}>
            <img src={track.albumUrl} alt={track.album} width={150} />
            <h3>Song: {track.song} </h3>
            <p>Artist: {track.artist} </p>
            <p>Album: {track.album} </p>
          </div>
        ))}
    </div>
  );
};

export default DiscoverPage;
