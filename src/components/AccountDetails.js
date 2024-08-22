import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DefaultAvatar from "../assets/images/default-avatar.jpeg";
import '../assets/styles/components/AccountDetails.css';
import { API_BASE_URL } from '../constant';

const AccountDetails = () => {
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    image: false
  });
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    image: {
      preview: DefaultAvatar,
      file: null
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`);
      const res = await response.json();
      const data = res.user;
      const url = API_BASE_URL;

      setUserDetails({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: '**********',
        image: {
          preview: data.image?.url ? url + data.image.url : DefaultAvatar, // Set preview URL or default avatar
          file: null // Ensure file is null on initial load
        }
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleSaveClick = async () => {
    const userDetailsToUpdate = { ...userDetails };

    // Do not include password if it hasn't been changed
    if (userDetails.password === '**********') {
      delete userDetailsToUpdate.password;
    }

    const formData = new FormData();

    Object.keys(userDetailsToUpdate).forEach(key => {
      if (key === 'image' && userDetailsToUpdate.image.file) {
        formData.append(`user[${key}]`, userDetailsToUpdate.image.file);
      } else if (key !== 'image') {
        formData.append(`user[${key}]`, userDetailsToUpdate[key]);
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (response.ok) {
        setIsEditing({ name: false, email: false, phone: false, password: false, image: false });
        fetchUserDetails(); // Fetch the updated user details
      } else {
        alert('Failed to save user details');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUserDetails(prevDetails => ({
        ...prevDetails,
        image: {
          file, // Store the file itself
          preview: fileUrl // Store the preview URL
        }
      }));

      // Clean up the URL object
      return () => URL.revokeObjectURL(fileUrl);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="account-details">
      <h1>Your account</h1>
      <div className="account-info">
        <img
          src={userDetails.image.preview}
          alt="Avatar"
          className="avatar"
        />
        <div className="avatar-upload">
          <label>Change your avatar</label>
          <input type="file" onChange={handleAvatarChange} />
        </div>
        <div className="details">
          <div className="detail-item">
            <label>Your name</label>
            {isEditing.name ? (
              <input
                type="text"
                name="name"
                value={userDetails.name}
                onChange={handleInputChange}
              />
            ) : (
              <span>{userDetails.name}</span>
            )}
            <button onClick={() => handleEditClick('name')}>Edit</button>
          </div>
          <div className="detail-item">
            <label>Your email address</label>
            {isEditing.email ? (
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
              />
            ) : (
              <span>{userDetails.email}</span>
            )}
            <button onClick={() => handleEditClick('email')}>Edit</button>
          </div>
          <div className="detail-item">
            <label>Your phone number</label>
            {isEditing.phone ? (
              <input
                type="tel"
                name="phone"
                value={userDetails.phone}
                onChange={handleInputChange}
              />
            ) : (
              <span>{userDetails.phone}</span>
            )}
            <button onClick={() => handleEditClick('phone')}>Edit</button>
          </div>
          <div className="detail-item">
            <label>Your password</label>
            {isEditing.password ? (
              <input
                type="password"
                name="password"
                value={userDetails.password}
                onChange={handleInputChange}
              />
            ) : (
              <span>{userDetails.password}</span>
            )}
            <button onClick={() => handleEditClick('password')}>Edit</button>
          </div>
        </div>
      </div>
      
      <button className="save-button" onClick={handleSaveClick}>
        Save
      </button>
    </div>
  );
};

export default AccountDetails;
