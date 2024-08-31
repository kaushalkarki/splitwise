import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL, getHeaders } from '../constant';
import { useAuth } from './AuthContext';

const UserContext = createContext();
export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userMap, setUserMap] = useState({});
  const { token } = useAuth()
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/users_with_name`, {headers: getHeaders(token)});
        const users = await response.json();

        const userMap = users.user.reduce((map, user) => {
          map[user.id] = user.name;
          return map;
        }, {});

        setUserMap(userMap);
        // console.log(userMap[1]);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={userMap}>
      {children}
    </UserContext.Provider>
  );
};
