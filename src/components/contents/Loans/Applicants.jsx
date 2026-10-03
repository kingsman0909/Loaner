import React from 'react'
import '../styles/applicant.css';

const Applicants = () => {
  return (
    <div className='applicant'>
      <div className='a-top'>
        <h2>Loan Applicants</h2>
        <div className='a-card'>
            <p>Total Applicants</p>
            <small>10,020</small>
        </div>
      </div>

    <input type='text' placeholder='search applicant' />
      <div className='a-table-wrapper'>
        <table className='a-table'>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Source of Income</th>
                    <th>age</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>Cyrus Ken</td>
                    <td>09096068957</td>
                    <td>Work</td>
                    <td>22</td>
                    <td><button>View</button></td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  )
}

export default Applicants
