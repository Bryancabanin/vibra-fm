import type { ReactNode } from 'react';
import Navbar from './Navbar';
import styles from './Layout.module.css';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Navbar />
      {/* Render the page that we pass in */}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Layout;
