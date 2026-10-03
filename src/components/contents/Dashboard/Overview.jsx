import React from 'react'
import '../styles/overview.css';
import {useState} from 'react';
import { DiAppstore } from 'react-icons/di';
import { Navigate, useNavigate } from 'react-router-dom';
import ReuseTable from '../../ReusableTable/ReusableTable';

const Overview = () => {
  const defaultLimit = 5;
  const navigate = useNavigate();
  const [member, setMember] = useState([
    {name: 'cyrus ken', loan: '5,000', overdue: false},
    {name: 'cyron', loan: '10,000', overdue: true},
    {name: 'john rafael', loan: '15,000', overdue: true},
    {name: 'crystller', loan: '20,000', overdue: false},
    {name: 'cyrus ken', loan: '5,000', overdue: false},
    {name: 'cyron', loan: '10,000', overdue: true},
    {name: 'john rafael', loan: '15,000', overdue: true},
    {name: 'crystller', loan: '20,000', overdue: false},
    {name: 'princess', loan: '50,000', overdue: true}
  ]);

  const [application, setApplication] = useState([
    {name: 'cyrus ken', type: 'medical', number: '09096068957'},
    {name: 'cyron', type: 'insurance', number: '09096068957'},
    {name: 'john rafael', type: 'personal', number: '09096068957'},
    {name: 'crystller', type: 'education', number: '09096068957'},
    {name: 'princess', type: 'living', number: '09096068957'},
  ])
  return (
    <div className='overview'>
      <div className='o-top'>
        <div className='o-card'><p>Total Loan</p><span>1,042,500</span></div>
        <div className='o-card'><p>Borrowers</p><span>42 Borrowers</span></div>
        <div className='o-card'><p>Overdue</p><span>8</span></div>
        <div className='o-card'><p>Your Capital</p><span>20, 000, 000</span></div>
      </div>

      <div className='o-mid'>
        <h1>Overdue List</h1>
        <ReuseTable data={member}/>
        
              <p>View All</p>
        
      </div>

      <div className='0-bot'>
        <h1>Applicants</h1>
          <ReuseTable data={application}/>
              <p >View All</p>
      </div>
    </div>
  )
}

export default Overview
