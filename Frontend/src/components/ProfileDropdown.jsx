import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/ProfileDropdown.css';

const ProfileDropdown = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/auth/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleMenuClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser?.username) {
      return currentUser.username.charAt(0).toUpperCase();
    } else if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="profile-avatar">
          {currentUser?.profilePictureUrl ? (
            <img 
              src={currentUser.profilePictureUrl} 
              alt="Profile" 
              className="avatar-image"
            />
          ) : (
            <span className="avatar-initials">
              {getUserInitials()}
            </span>
          )}
        </div>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-info">
            <div className="profile-avatar-large">
              {currentUser?.profilePictureUrl ? (
                <img 
                  src={currentUser.profilePictureUrl} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initials">
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div className="profile-details">
              <h4>{currentUser?.username || 'User'}</h4>
              <p>{currentUser?.email}</p>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-menu-items">
            <button 
              className="dropdown-item"
              onClick={() => handleMenuClick('/profile')}
            >
              <span className="item-icon">👤</span>
              <span>View Profile</span>
            </button>
            
            <button 
              className="dropdown-item"
              onClick={() => handleMenuClick('/my-trips')}
            >
              <span className="item-icon">🧳</span>
              <span>My Trips</span>
            </button>
            
            <button 
              className="dropdown-item"
              onClick={() => handleMenuClick('/my-blogs')}
            >
              <span className="item-icon">📝</span>
              <span>My Blog Posts</span>
            </button>
            
            <button 
              className="dropdown-item"
              onClick={() => handleMenuClick('/group-trips')}
            >
              <span className="item-icon">👥</span>
              <span>Group Trips</span>
            </button>
            
            {currentUser?.role === 'ADMIN' && (
              <button 
                className="dropdown-item"
                onClick={() => handleMenuClick('/admin')}
              >
                <span className="item-icon">⚙️</span>
                <span>Admin Dashboard</span>
              </button>
            )}
            
            <div className="dropdown-divider"></div>
            
            <button 
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <span className="item-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;