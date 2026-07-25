import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', background: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.2rem' }}>LeadManager</Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: 'white', marginRight: '1rem' }}>Dashboard</Link>
            <span style={{ marginRight: '1rem' }}>{user.name} ({user.role})</span>
            <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;