import React from 'react';
import '../assets/styles/pages/Header.css';
import logo from '../assets/images/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomizedMenus from '../components/CustomizedMenus';
import { API_BASE_URL } from '../constant';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const apiUrl = `${API_BASE_URL}/logout`;

    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      logout();
      navigate('/login'); // Ensure user is redirected to login page after logout
    } catch (error) {
      console.error('There was a problem with the logout request:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const dashboardPage = () => {
    navigate('/dashboard');
  };

  return (
    <div className="header">
      <div className="left-side">
        <img src={logo} alt="Logo" className="logo" />
        <p>Splits</p>
        <h4>by KK INC</h4>
      </div>
      <div className="right-side">
        {location.pathname !== '/dashboard' && (
          <div className="home-div" onClick={dashboardPage}>
            <HomeRoundedIcon/></div>
        )}
        <CustomizedMenus handleLogout={handleLogout} navigate={navigate} user={user} />
      </div>
    </div>
  );
};

export default Header;
