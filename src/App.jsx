import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css' 
import Landing from './components/LandingPage';
import Homepage from './components/pages/Homepage';
import Protect from './ProtectedRoutes';
import Sign from './components/Signup';

function App() {
  return (
    <Routes>
        <Route path='/' element={<Landing />}></Route>
        <Route path='/signup' element={<Sign />} />
        <Route path='/homepage' element={<Protect><Homepage /></Protect>} />
    </Routes>
  )
}

export default App
