import React, { useEffect, useState } from "react";
import { Navigate  } from "react-router-dom";

const ProtectedRoutes = (props) => {
    const token = localStorage.getItem('loaner');
    
    if(!token){
        alert("You cant go to homepage without logging in")
        return <Navigate to='/' />
    }

    return props.children;
    
}

export default ProtectedRoutes