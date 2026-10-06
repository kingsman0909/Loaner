
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import '../styles/signup.css';

const Signup = () => {
  const role = 'admin';
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [age, setAge] = useState('');
  const [sourceOfIncome, setSourceOfIncome] = useState('');
  const [contact, setContact] = useState('');

  const [address, setAddress] = useState({
    province: '',
    city: '',
    brgy: '',
    subd: ''
  });

  const [loading, setLoading] = useState(false);

  const onSignup = async (e) => {
    e.preventDefault();

    if (
      !username ||
      !password ||
      !firstname ||
      !lastname ||
      !age ||
      !sourceOfIncome ||
      !contact ||
      !address.province ||
      !address.city ||
      !address.brgy ||
      !address.subd
    ) {
      return alert('Please complete all fields.');
    }

    if (password.length < 8) {
      return alert('Password must be 8 or more characters.');
    }

    if (Number(age) < 18) {
      return alert('You must be at least 18 years old.');
    }

    try {
      setLoading(true);

      const result = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role,
          username,
          password,
          firstname,
          lastname,
          sourceOfIncome,
          age: Number(age),
          contact,
          province: address.province,
          city: address.city,
          brgy: address.brgy,
          subd: address.subd
        })
      });

      const response = await result.json();

      if (result.ok) {
        alert('Sign Up Successfully!');
        navigate('/');
      } else {
        alert(response.message || 'Signup failed.');
      }
    } catch (err) {
      alert(err.message || 'Error in signup.');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="signup">

      {/* LEFT SIDE */}
      <div className="s-left">
        <div className="brand-content">

          <h1>LOANER</h1>

          <p>
            Manage your lending business with a simple,
            powerful and modern platform.
          </p>

          <div className="brand-line"></div>

          <span>SMART • SIMPLE • SECURE</span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="s-right">

        <div className="signup-header">
          <span className="signup-tag">CREATE ACCOUNT</span>
          <h2>Get Started</h2>
          <p>Create your Loaner account to continue.</p>
        </div>

        <form onSubmit={onSignup}>

          {/* ACCOUNT */}
          <div className="form-section">
            <div className="section-title">
              <span>01</span>
              Account Information
            </div>

            <div className="form-grid">

              <div className="input-group full">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="input-group full">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

            </div>
          </div>

          {/* PERSONAL */}
          <div className="form-section">
            <div className="section-title">
              <span>02</span>
              Personal Information
            </div>

            <div className="form-grid">

              <div className="input-group">
                <label>Firstname</label>
                <input
                  type="text"
                  placeholder="Firstname"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="input-group">
                <label>Lastname</label>
                <input
                  type="text"
                  placeholder="Lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>

              <div className="input-group">
                <label>Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="100"
                  required
                />
              </div>

              <div className="input-group">
                <label>Contact</label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="input-group full">
                <label>Source of Income</label>
                <input
                  type="text"
                  placeholder="e.g. Employment, Business, Freelance"
                  value={sourceOfIncome}
                  onChange={(e) => setSourceOfIncome(e.target.value)}
                  required
                />
              </div>

            </div>
          </div>

          {/* ADDRESS */}
          <div className="form-section">
            <div className="section-title">
              <span>03</span>
              Address
            </div>

            <div className="form-grid">

              <div className="input-group">
                <label>Province</label>
                <input
                  type="text"
                  placeholder="Province"
                  value={address.province}
                  onChange={(e) =>
                    updateAddress('province', e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>City / Municipality</label>
                <input
                  type="text"
                  placeholder="City / Municipality"
                  value={address.city}
                  onChange={(e) =>
                    updateAddress('city', e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Barangay</label>
                <input
                  type="text"
                  placeholder="Barangay"
                  value={address.brgy}
                  onChange={(e) =>
                    updateAddress('brgy', e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Subdivision</label>
                <input
                  type="text"
                  placeholder="Subdivision / Street"
                  value={address.subd}
                  onChange={(e) =>
                    updateAddress('subd', e.target.value)
                  }
                  required
                />
              </div>

            </div>
          </div>

          {/* ACTIONS */}
          <div className="signup-footer">

            <p className="login-text">
              Already have an account?
              <button
                type="button"
                onClick={() => navigate('/')}
              >
                Login here
              </button>
            </p>

            <button
              className="signup-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              {!loading && <span>→</span>}
            </button>

          </div>

        </form>
      </div>

    </section>
  );
};

export default Signup;
