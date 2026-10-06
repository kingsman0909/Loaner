import React from 'react'
import '../styles/landingpage.css';
import {useNavigate } from 'react-router-dom';
import {useState} from 'react';
import {API_BASE_URL} from '../config';
import '../styles/signup.css';
const Signup = () => {

    const role = "admin";
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [age, setAge] = useState(0);
    const [sourceOfIncome, setSourceOfIncome] = useState("");
    const [contact, setContact] = useState("");

    const [address, setAddress] = useState({
        province: "",
        city: "",
        brgy: "",
        subd: ""
    })

    const navigate = useNavigate();

    const onSignup = async (e) => {
      e.preventDefault();
        
        if(!username || !password){
          return alert("Invalid username or password")
        }

        if(password.length < 8){
          alert('Passwor must be 8 or more characters')
        }
        try{
            
          const result = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              role,
              username,
              password,
              firstname,
              lastname,
              sourceOfIncome,
              age: Number(age) || 0,
              contact,
              province: address.province,
              city: address.city,
              brgy: address.brgy,
              subd: address.subd
            })
          })

          const response = await result.json();

          if(result.ok){
            alert('Sign Up Successfully!')
            navigate('/');
          }
          else{
            alert(response.message);
          }

        }
        catch(err){
          alert(err.message || 'error in signup')
        }
    }

  return (
    <section className='signup'>
      <div className='s-left'>

      </div>

      <div className='s-right'>
        <h2>Loaner</h2>
        <form onSubmit={onSignup}>
            <label>Username</label>
            <input type='text' placeholder='username' value={username}
              onChange={(e)=>setUsername(e.target.value)}
            required />
            <label>Password</label>
            <input type='password' placeholder='password' value={password}
              onChange={(e)=>setPassword(e.target.value)} required />
            <label>Firstname</label>
            <input type='text' placeholder='username' value={firstname}
              onChange={(e)=>setFirstname(e.target.value)}
            required />
            <label>Lastname</label>
            <input type='password' placeholder='password' value={lastname}
              onChange={(e)=>setLastname(e.target.value)} required />
            <label>age</label>
            <input type='text' placeholder='username' value={age}
              onChange={(e)=>setAge(e.target.value)}
            required />
            <label>Contact</label>
            <input type='password' placeholder='password' value={contact}
              onChange={(e)=>setContact(e.target.value)} required />
            <label>Province</label>
            <input type='text' placeholder='username' value={address.province}
              onChange={(e)=>setAddress({...address, province: e.target.value})}
            required />
            <label>City</label>
            <input type='password' placeholder='password' value={address.city}
              onChange={(e)=>setAddress({...address, city: e.target.value})} required />
            <label>Barangay</label>
            <input type='text' placeholder='username' value={address.brgy}
              onChange={(e)=>setAddress({...address, brgy: e.target.value})}
            required />
            <label>Subdivision</label>
            <input type='password' placeholder='password' value={address.subd}
              onChange={(e)=>setAddress({...address, subd: e.target.value})} required />
            <label>Source Of income</label>
            <input type='password' placeholder='password' value={sourceOfIncome}
              onChange={(e)=>setSourceOfIncome(e.target.value)} required />

            
            <small>Already have an account? <span><a onClick={()=>navigate('/')}>click here</a></span></small>
            <div className='l-actions'>
                <button className='l-sign' type='submit'>Sign Up</button>
            </div>
        </form>
      </div>
    </section>
  )
}

export default Signup
