import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuthContext();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <h1>Soundmaster Admin</h1>
      </div>
      
      {isAuthenticated ? (
        <>
          <ul className="nav-links">
            <li>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/media" 
                className={isActive('/media') ? 'active' : ''}
              >
                Media Library
              </Link>
            </li>
            <li>
              <Link 
                to="/tracks" 
                className={isActive('/tracks') ? 'active' : ''}
              >
                Tracks
              </Link>
            </li>
            <li>
              <Link 
                to="/albums" 
                className={isActive('/albums') ? 'active' : ''}
              >
                Albums
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={isActive('/settings') ? 'active' : ''}
              >
                Settings
              </Link>
            </li>
          </ul>
          
          <div className="nav-actions">
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="nav-auth-message">
          Please log in to access the admin dashboard.
        </div>
      )}
    </nav>
  );
};

export default Navigation;
