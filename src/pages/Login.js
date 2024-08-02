import React, { useState } from 'react';
import '../assets/styles/pages/Login.css'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { handleGoogleLoginSuccess } from '../utils/auth';
import { API_BASE_URL } from '../constant';

// import logo from '../assets/images/logo.svg'; // Adjust the path to your logo

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRobot, setIsRobot] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = `${API_BASE_URL}/login`;
    
    const payload = {
      user: {
        email,
        password,
      }
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const res = await response.json();
      login(res.data.token, res.data.user);

      navigate('/dashboard');
    } catch (error) {
      console.error('There was a problem with the login request:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogin = (response) => {
    handleGoogleLoginSuccess(response, login, navigate);
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google login failed:', error);
    alert('Google sign-in failed. Please try again.');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Log in</h2>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            required
            autoComplete="off"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            required
            autoComplete="off"
          />
        </label>
        <label className="robot-check">
          <input
            type="checkbox"
            checked={isRobot}
            onChange={() => setIsRobot(!isRobot)}
          />
          I'm not a robot
        </label>
        <button type="submit" className="login-button">Log in</button>
        
        <p className="forgot-password"><a href="/">Forgot your password?</a></p>
        <button type="submit" className="signup-button" onClick={()=>{navigate('/signup')}}>Sign up</button>
        <div className="social-login">
          {/* <span>or</span> */}
          <GoogleOAuthProvider clientId="995878884828-7dqhulnm74vng0d8ckfo73u331o6g9i3.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleLogin}
              onFailure={handleGoogleLoginFailure}
            />
          </GoogleOAuthProvider>
        </div>
      </form>
    </div>
  );
};

export default Login;
