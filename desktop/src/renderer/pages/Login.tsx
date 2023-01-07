import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { login } from '../api';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    login(username, password)
      .then(() => {
        toast.success('Successfully logged in');
        navigate('/profiles');
      })
      .catch((e) => {
        console.error(e);
        toast.error(e.response?.data?.message || e.message);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  return (
    <div>
      <h1 className="title">Login</h1>

      <p className="note">
        If you don't have an account, create on on
        <a href="https://browser-sandbox.com/auth/sign-up">our website</a>
      </p>

      <form onSubmit={onSubmit}>
        <div className="group">
          <label htmlFor="username" className="username">Username</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="group">
          <label htmlFor="password" className="label">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button disabled={loading} type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
