import { API_BASE_URL } from "../constant";

export const handleGoogleLoginSuccess = async (response, login, navigate) => {
  const apiUrl = `${API_BASE_URL}/auth/google`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: response.credential })
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await res.json();
    console.log(data);
    login(data.token, data.user);
    navigate('/dashboard');
  } catch (error) {
    console.error('There was a problem with the Google sign-in:', error);
    alert('Google sign-in failed. Please try again.');
  }
};