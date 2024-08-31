import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/components/Sidebar.css';
import { API_BASE_URL } from '../constant';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';

const Sidebar = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [message, setMessage] = useState('')
  const [state, setState] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });
  const { vertical, horizontal, open } = state;
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/get_users_group`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setGroups(data.groups);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  const handleClick = (newState) => {
    setState({ ...newState, open: true });
  };

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sendEmail = async () => {
    const email = inviteEmail;
    try {
      const response = await fetch(`${API_BASE_URL}/users/send_email?email=${email}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();  // Assuming you need to use the data later
      setMessage(data.message)
      handleClick({ vertical: 'top', horizontal: 'center' });
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        <ul>
          <li><Link to="/dashboard" className="menu-item">Dashboard</Link></li>
          <li><Link to="" disabled className="menu-item">Expenses</Link></li>
          <li>
            <div className="menu-item">Groups</div>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            <ul>
              {groups.map((group) => (
                <li key={group.id}>
                  <Link to={`/groups/${group.id}`} className="submenu-item">{group.name}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li><Link to="/settings" className="menu-item">Settings</Link></li>
        </ul>
      </div>
      <div className='invite'>
        <div className='heading'>Invite friends</div> 
        <div className='email-div'>
          <TextField
            id="outlined-email"
            type='email'
            label="Email"
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </div>
        <button onClick={sendEmail} disabled={!isValidEmail(inviteEmail)}>Send Invite</button>
      </div>
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message={message}
        key={vertical + horizontal}
        autoHideDuration={2000}
      />
    </div>
  );
};

export default Sidebar;
