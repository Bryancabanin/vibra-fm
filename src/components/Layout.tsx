import type { ReactNode } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Navbar />
      {/* Render the page that we pass in */}
      {children}
    </div>
  );
};

export default Layout;
