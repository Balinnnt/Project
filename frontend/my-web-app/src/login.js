import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const defaultUsername = 'Admin';
  const defaultPassword = 'Admin123';
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState(defaultPassword);

  const handleLogin = () => {
    if (username === defaultUsername && password === defaultPassword) {
      setIsAuthenticated(true);
      navigate('/');
      console.log("Sikeres bejelentkezés");
    } else {
      console.error('Sikertelen bejelentkezés');
    }
  };

  return (
    <div className="login-container">
      <h1>Bejelentkezés:</h1>
      <form>
        <label className="login-label">
          Felhasználónév:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <br />
        <label className="login-label">
          Jelszó:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="button" onClick={handleLogin} className="login-button">
          Bejelentkezés
        </button>
      </form>
    </div>
  );
};

export default Login;
