import { NavLink } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div>
        <span className={styles.logo}>Vibra FM</span>
      </div>

      <div className={styles.navRight}>
        {/* right container */}
        <div className={styles.navLinksContainer}>
          <NavLink
            to='/discover'
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Discover
          </NavLink>
          <NavLink
            to='/history'
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            History
          </NavLink>
        </div>

        <div className={styles.userMenu}>
          <button
            className={styles.userButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={styles.avatar}>
              <User size={14} />
            </span>

            <span className={styles.userName}>
              {user?.display_name || user?.spotify_id}
            </span>
            <span>▾</span>
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdownContainer}>
              <button className={styles.dropdownItem} onClick={logout}>
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
