import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import logo from '../assets/images/logo.png'; // Adjust the path to your logo
import '../assets/styles/pages/SignUp.css';
import { useAuth } from '../context/AuthContext';
import { handleGoogleLoginSuccess } from '../utils/auth.js';
import { API_BASE_URL } from '../constant.js';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const {login} = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = `${API_BASE_URL}/users.json`;

    const payload = {
      user: {
        name,
        email,
        password,
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Reset form fields
      setName('');
      setEmail('');
      setPassword('');

      navigate('/login');
    } catch (error) {
      console.error('There was a problem with the sign-up request:', error);
      alert('Sign up failed. Please try again.');
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google login failed:', error);
    alert('Google sign-in failed. Please try again.');
  };

  const handleLogin = (response) => {
    handleGoogleLoginSuccess(response, login, navigate);
  };

  return (
    <div className="signup-container">
      <div className="signup-logo">
        <img src={logo} alt="Logo" id='logo' />
      </div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Introduce Yourself</h2>
        <label>
          Hi there! My name is
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=""
            required
          />
        </label>
        <div className={`transition-container ${name ? 'visible' : ''}`}>
          <label>
            Here's my email address:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
            />
          </label>
          <label>
            And here's my password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />
          </label>
        </div>
        <button type="submit" className="signup-button">Sign me up!</button>
        <div className="social-signup">
          <span>or</span>
          <GoogleOAuthProvider clientId="995878884828-7dqhulnm74vng0d8ckfo73u331o6g9i3.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleLogin}
              onFailure={handleGoogleLoginFailure}
            />
          </GoogleOAuthProvider>
        </div>
        <p className="terms">
          By signing up, you accept the <a href="/">Splitwise Terms of Service</a>.
        </p>
        <p className="currency-warning">
          Don't use USD for currency? <a href="/">Click here</a>.
        </p>
      </form>
    </div>
  );
};

export default SignUp;
