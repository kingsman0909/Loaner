import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/landingpage.css';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      return alert('Please enter your username and password.');
    }

    try {
      setLoading(true);

      const result = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const response = await result.json();

      if (result.ok) {
        localStorage.setItem(
          'loaner',
          JSON.stringify(response.userData)
        );

        localStorage.setItem(
          'loaner_token',
          response.token
        );

        navigate('/homepage');
      } else {
        alert(response.message || 'Error in logging in.');
      }

    } catch (err) {
      alert(err.message || 'Error in logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='landing-wrapper'>
      <section className="landing">

      {/* =====================================================
          LEFT BRANDING
          ===================================================== */}

      <div className="l-left">

        <div className="landing-brand">

          <span className="landing-tag">
            LOAN MANAGEMENT SYSTEM
          </span>

          <h1>
            LOANER
          </h1>

          <p>
            A simple and powerful platform for managing
            borrowers, loans, payments and your lending
            operations.
          </p>

          <div className="landing-line"></div>

          <span className="landing-caption">
            SMART • SIMPLE • SECURE
          </span>

        </div>

      </div>


      {/* =====================================================
          RIGHT LOGIN
          ===================================================== */}

      <div className="l-right">

        <div className="login-container">

          <div className="login-header">

            <span className="login-label">
              WELCOME BACK
            </span>

            <h2>
              Sign in
            </h2>

            <p>
              Enter your credentials to access your account.
            </p>

          </div>


          <form onSubmit={onLogin}>

            {/* USERNAME */}

            <div className="login-input">

              <label>
                Username
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-input">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  •
                </span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>


            {/* ACTIONS */}

            <div className="l-actions">

              <button
                className="l-login"
                type="submit"
                disabled={loading}
              >
                {loading ? 'SIGNING IN...' : 'SIGN IN'}

                {!loading && (
                  <span>
                    →
                  </span>
                )}

              </button>

              <div className="signup-divider">
                <span>OR</span>
              </div>

              <button
                className="l-sign"
                type="button"
                onClick={() => navigate('/signup')}
              >
                CREATE ACCOUNT
              </button>

            </div>


            {/* FOOTER */}

            <div className="login-footer">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() => navigate('/signup')}
              >
                Sign up
              </button>

            </div>

          </form>

        </div>

      </div>

    </section>
    </div>
  );
};

export default LandingPage;

