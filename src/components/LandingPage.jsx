import React from 'react'
import '../styles/landingpage.css';
import {useNavigate } from 'react-router-dom';
import {useState} from 'react';
import {API_BASE_URL} from '../../src/config';
const LandingPage = (e) => {


    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const onLogin = async (e) => {
      e.preventDefault();
        if(!username || !password){
          return alert("Invalid username or password")
        }

        try{
          const result = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              username,
              password
            })
          })

          const response = await result.json();

          if(result.ok){
            //Set localStorage
            localStorage.setItem('loaner', JSON.stringify(response.userData));
            localStorage.setItem('loaner_token', response.token);
            navigate('/homepage');
          }
          else{
            alert(response.message || 'error in logging in')
          }

        }
        catch(err){
          alert(err.message || 'error in logging in')
        }
    }

  return (
    <section className='landing'>
      <div className='l-left'>

      </div>

      <div className='l-right'>
        <h2>Saver</h2>
        <form onSubmit={onLogin}>
            <label>Username</label>
            <input type='text' placeholder='username' value={username}
              onChange={(e)=>setUsername(e.target.value)}
            required />
            <label>Password</label>
            <input type='password' placeholder='password' value={password}
              onChange={(e)=>setPassword(e.target.value)} required />
            <div className='l-actions'>
                <button className='l-login' type='submit'>Login</button>
                <button className='l-sign' type='button' onClick={()=>navigate('/signup')}>Sign Up</button>
            </div>
            <small>Are you a member? <span><a href=''>click here</a></span></small>
        </form>
      </div>
    </section>
  )
}

export default LandingPage
