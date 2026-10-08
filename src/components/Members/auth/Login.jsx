import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../../../styles/landingpage.css';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();

    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    try {
      setLoading(true);

      console.log('logging in: ', username, password);
      const result = await fetch(`${API_BASE_URL}/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });


      const response = await result.json();

      if (!result.ok) {
        setError(
          response.error ||
          response.message ||
          'Invalid username or password.'
        );
        return;
      }

      /*
       * Store MEMBER session separately
       * so it does not conflict with Loaner login.
       */
      localStorage.setItem(
        'member',
        JSON.stringify({
          id: response.userData.id,
          username: response.userData.username,
          role: response.userData.role,
          allData: response.userData
        })
      );

      localStorage.setItem(
        'member_token',
        response.token
      );

      navigate('/member/homepage');

    } catch (err) {
      console.error('MEMBER LOGIN ERROR:', err);

      setError(
        err.message ||
        'Unable to connect to the server.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">

      <section className="landing">

        {/* =====================================================
            LEFT BRANDING
        ===================================================== */}

        <div className="l-left">

          <div className="landing-brand">

            <span className="landing-tag">
              TRACK YOUR LOANS
            </span>

            <h1>
              MEMBER
            </h1>

            <p>
              View your loans, monitor payments,
              and keep track of your loan status
              in one place.
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
                Enter the credentials provided by your loaner.
              </p>

            </div>


            <form onSubmit={onLogin}>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}


              {/* =================================================
                  USERNAME
              ================================================= */}

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
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    autoComplete="username"
                    disabled={loading}
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  PASSWORD
              ================================================= */}

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
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

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

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="login-footer">

                <span>
                  Don't have your credentials?
                </span>

                <span>
                  Contact your loaner.
                </span>

              </div>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
};

export default LandingPage;