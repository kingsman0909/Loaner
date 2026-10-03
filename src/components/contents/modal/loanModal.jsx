import React from 'react'
import './loanModal.css';
import { useEffect, useState } from 'react';

const loanModal = ({setShowModal, loan}) => {

    const [data, setData] = useState(null);
    const getOverdue = (dueDate) => {
        const today = new Date();
        today.setHours(0,0,0,0);

        const dateOnly = dueDate.split('T')[0];
        const due = new Date(dateOnly);

        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    }
    useEffect(()=>{
        const cleanData = Object.entries(loan).filter(([key, val])=>{
            return !key.toLowerCase().includes('id');
        })
        .map(([k, v])=>{
            if(k.toLowerCase().includes('date')){
                return[k, v.split('T')[0]];
            }
            return [k, v];
        })
        ;
        
        
        setData(cleanData)
    
    }, [loan])
  return (
    <div className='loanModal-wrapper'>
      <div className='loanModal'>
        <h2 className='modal-close' onClick={()=>setShowModal(false)}>X</h2>
        <h2>{loan.member_name}</h2>
        {loan.status === 'active' && <h3 style={{color: 'green'}}>Active</h3>}
        {loan.status === 'closed' && <h3 style={{color: 'gray'}}>Closed</h3>}
        <div className='loanDetails'>
            {data?.map(([key, val], index)=>(
                <div className='loan-info-card' key={index}>
                    <label>{key}</label>
                    <p>{val}</p>
                </div>
            ))}
        </div>
        <div className='loan-modal-actions'>
            {loan.status === 'pending' && (
                <>
                <button>Approved</button>
                <button>Reject</button>
                </>
            )}
            {loan.status === 'overdue' && <button>Remind</button>}
        </div>
      </div>
    </div>
  )
}

export default loanModal
