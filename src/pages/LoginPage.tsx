import styles from './LoginPage.module.css';
import { API_URL } from '../config.ts';

const LoginPage = () => {
  // Create handle login
  const handleSpotifyLogin = () => {
    window.location.href = `${API_URL}/api/auth/spotify`;
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h1>Vibra FM</h1>
        <p>
          Discover music you've never heard before — filtered from everything
          you already know.
        </p>
        <hr className={styles.hrLine} />
        <button onClick={handleSpotifyLogin}> Continue with Spotify</button>

        <p className={styles.disclaimer}>
          We use Spotify content account to personalize recommendations and
          create playlists on your behalf.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
