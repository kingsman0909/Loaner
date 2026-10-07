import React from 'react'
import '../../styles/sidebar.css'
import {useState, useEffect} from 'react';

const Sidebar = (props) => {

    const [openItem, setOpenItem] = useState(null);


    const pages = {
        'Dashboard': 'Overview',
        'Loans': ['Applications'],
        'Borrowers': ['Members'],
        'Transactions': ['Collections'],
    }

    useEffect(()=>{
        openSubItem(findKey(props?.active), props?.active);
    }, [])

    const findKey = (value) => {
        for(const [key, val] of Object.entries(pages)){
            if(Array.isArray(val)){
                if(val.includes(props?.active)){
                    
                    return key;
                }
            }
            else{
                if(value === val) return key;
            }
        }
    }

    const setContent = (content) => {
        props.setActive(content);   
        console.log(props?.active," active", content)     
    }
    
    const openSubItem = (key, value) => {
        if(openItem && openItem === key){
            setOpenItem(null);
            return
        }
        setOpenItem(key);
        if(Array.isArray(value)){
            props.setActive(value[0]);
        }
        else{
            props.setActive(value);
        }
    }

  return (
    <div className={props?.openMenu ? 'sidebar active':'sidebar'}>
      <div className='sidebar-wrapper'>
        <h3>Manage your assets</h3>

        {Object.entries(pages).map(([key, value])=>(
            <div key={key} className='s-item'>
                <h2 className={openItem === key ? 'active-item':'key-item'} onClick={()=>openSubItem(key, value)}>{key}</h2>
                {Array.isArray(value) ? (
                    value.map((object)=>(
                        <div className='s-subitem' key={object}>
                            <p className={openItem === key ? 'active':'none'} onClick={()=>setContent(object)}>- {object}</p>
                        </div>
                    ))
                )
                :
                <p className={openItem === key ? 'active':'none'} onClick={()=>setContent(value)}>- {value}</p>}
            </div>
        ))}
      </div>

    </div>
  )
}

export default Sidebar
