import React, { useState } from 'react';
import '../../css/login.css'
import BgImg from '../../components/Image';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../../firebase';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (username && password) {
        const user = await signInWithEmailAndPassword(auth, username, password);
        if (user) {
          setError('');
          localStorage.setItem('auth', JSON.stringify(user));
          navigate('/');
        }
      } else {
        throw new Error('invalid');
      }
    } catch (err) {
      console.log('ERROR: ', err)
      setError('username and/or password are invalid');
    }
  };

  const onUsernameChange = e => {
    const value = e.target.value;
    setUsername(value);
  };

  const onPasswordChange = e => {
    const value = e.target.value;
    setPassword(value);
  };

  return (
    <div className="Login">
      <div>
        <h1>Login</h1>
        <BgImg/>
        <label>Username</label>
        <input onChange={onUsernameChange} className="username-input" type="text" />
        <label>Password</label>
        <input onChange={onPasswordChange} className="username-password" type="password" />
        {error && (
          <div className="error">{error}</div>
        )}
        <button onClick={onSubmit} className="login-submit">submit</button>
      </div>
    </div>
  );
}

export default Login;
