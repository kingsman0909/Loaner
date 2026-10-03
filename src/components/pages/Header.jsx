import React from 'react'
import '../../styles/header.css';
import { HiMenu } from "react-icons/hi";

const Header = (props) => {
  return (
    <div className='header'>
      <div className='h=left'>
        <h2>{props?.name}</h2>
      </div>

      <div className='h-right'>
        <HiMenu className='menu' onClick={()=>props.actions('menu')}/>
        <div className='profile' onClick={()=>props.actions('profile')}>
            <div className='p-circle'><h2>C</h2></div>
            <p>^</p>
        </div>
      </div>
    </div>
  )
}

export default Header
