import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/components/Sidebar.css';
import { API_BASE_URL } from '../constant';

const Sidebar = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line
  }, []);

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
    </div>
  );
};

export default Sidebar;
