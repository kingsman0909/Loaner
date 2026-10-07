import React from 'react'
import Header from './Header';
import Sidebar from './Sidebar';
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Overview from '../contents/Dashboard/Overview';
import Member from '../contents/Borrowers/Member';
import Active from '../contents/Loans/Active';
import Overdue from '../contents/Loans/Overdue';
import Closed from '../contents/Loans/Closed';
import Applicants from '../contents/Loans/Applicants';
import Collections from '../contents/Transactions/Collections';
import '../../styles/homepage.css';
import { API_BASE_URL } from '../../config';

const Homepage = () => {
    const [openChange, setOpenChange] = useState(false);
    const token = localStorage.getItem('loaner');
    const loaner_token = localStorage.getItem('loaner_token');
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const [active, setActive] = useState('Overview');
    const [loaner, setLoaner] = useState(null);
    const [newPass, setNewPass] = useState({
        new: "",
        repeat: "",
        current: ""
    });
    const actions = (type) => {
        if(type === 'menu'){
            setOpenMenu(!openMenu);
        }
        if(type === 'profile'){
            setOpenProfile(!openProfile);
        }
    }
    

    const logout = () => {
        localStorage.removeItem('loaner');
        navigate('/');
    }

    const changePass = async () => {
        try{
            console.log(token);
            const result = await fetch(`${API_BASE_URL}/changePassword`, {
                method: 'POST',
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${loaner_token}`
                },
                body: JSON.stringify({
                    username: loaner.username,
                    newPassword: newPass.new,
                    current: newPass.current
                })
            })

            const data = await result.json();
            if(result.ok){
                alert("password changed. Dont share to anyone")
                setOpenChange(false);
            }
            else{
                alert(data.message);
            }
        }
        catch(err){
            alert(err.message || 'error in changing password frontend')
        }
    }
    useEffect(()=>{
        
        if(!token){
            alert('no token found');
        }
        console.log(JSON.parse(token), "jajhaj");
        setLoaner(JSON.parse(token));
    }, [])

  return (
    <div className='homepage'>
        
      <Header actions={actions} name={loaner?.firstname}></Header>

      <section className='h-body'>
        <Sidebar openMenu={openMenu} setOpenMenu={setOpenMenu} setActive={setActive} active={active}/>

        <div className='h-content-wrapper'>
            <div className={openProfile? 'profile-box':'profile-box hidden'}>
                <label>{loaner?.firstname}</label>
                <div className='p-info'>
                    <p>Loan {loaner?.role}</p>
                    <small>{loaner?.contact}</small>
                </div>

                <button onClick={()=>setOpenChange(!openChange)}>Change Password</button>
                <button onClick={logout}>Logout</button>
            </div>

            <div className='h-content'>
                {active === 'Overview' && <Overview />}
                {active === 'Applications' && <Applicants />}
                {active === 'Overdue' && <Overdue />}
                {active === 'Closed' && <Closed />}
                {active === 'Members' && <Member />}
                {active === 'Collections' && <Collections />}
            </div>
        </div>
      </section>


      {openChange && 
        <div className='changepass-modal'>
            <h3 onClick={()=> setOpenChange(!openChange)}>x</h3>
            <h2>Change your password</h2>
            <input type='password' placeholder='current' value={newPass.current} 
            onChange={(e)=>setNewPass({...newPass, current: e.target.value})}
            required></input>
            <input type='password' placeholder='new password' value={newPass.new}
            onChange={(e)=>setNewPass({...newPass, new: e.target.value})}
            required></input>
            <input type='password' placeholder='repeat new password' value={newPass.repeat} 
            onChange={(e)=>setNewPass({...newPass, repeat: e.target.value})}
            required></input>

            {newPass.new !== newPass.repeat && <p>new pass dont match</p>}
            <button onClick={changePass}>Change Password</button>
        </div>
      }
    </div>
  )
}

export default Homepage
