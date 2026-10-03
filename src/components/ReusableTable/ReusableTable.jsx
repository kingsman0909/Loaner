import React from 'react'
import './reusable.css';
import { useState, useEffect} from 'react';

const ReusableTable = ({data}) => {

  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  

  useEffect(()=>{
    
  }, [data])
  return (
    <div className='reuse-wrapper'>
      <table className='reuse-table'>
        <thead>
          <tr>
            {headers.map((head, i)=>(
              <th key={i}>{head}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
            {data.map((info, i)=>(
              <tr key={i}>
                {
                  headers.map((head)=>(
                    <td key={head}>{String(info[head])}</td>
                  ))
                }
                <td><button>View</button></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReusableTable
