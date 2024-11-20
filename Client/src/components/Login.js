import React, { useState } from 'react';
import axios from 'axios';
import { Link,useNavigate  } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
   const deviceToken =  localStorage.getItem('deviceToken');
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
            email,
            password,
            deviceToken
          });
          
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('developer',response.data.name)
      window.location.href = '/details'; // Redirect to the main app
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <p>
      Don't have an account? <Link to="/signup">Register here</Link>
    </p>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
