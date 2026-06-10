import { NavLink } from 'react-router';

const Navbar = () => {
  return (
    <nav>
      <NavLink to='/discover'>Discover</NavLink>
      <NavLink to='/history'>History</NavLink>
    </nav>
  );
};

export default Navbar;
