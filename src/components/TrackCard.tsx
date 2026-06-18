import styles from './TrackCard.module.css';

interface TrackCardProps {
  spotifyTrackId: string;
  song: string;
  artist: string;
  album: string;
  albumUrl: string;
}

const TrackCard = ({ song, artist, album, albumUrl }: TrackCardProps) => {
  return (
    <div className={styles.trackCard}>
      <img src={albumUrl} alt={album} className={styles.trackImage} />
      <div className={styles.trackInfo}>
        <h3>{song}</h3>
        <p>{artist}</p>
        <p className={styles.trackAlbum}>{album}</p>
      </div>
    </div>
  );
};

export default TrackCard;
