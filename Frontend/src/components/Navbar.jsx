import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import ProfileDropdown from './ProfileDropdown';
import '../styles/Navbar.css';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Get user from localStorage if not in context
  const effectiveUser = currentUser || 
    (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null);

  const handleLogin = () => {
    navigate('/auth/login');
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        WanderWise
      </div>
      
      {effectiveUser ? (
        <div className="nav-actions">
          <NotificationCenter />
          <ProfileDropdown />
        </div>
      ) : (
        <div className="nav-buttons">
          <button onClick={handleLogin} className="btn-outline">Login</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;