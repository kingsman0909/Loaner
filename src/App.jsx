import { Routes, Route } from 'react-router-dom';

import './App.css';

import Landing from './components/LandingPage';
import Homepage from './components/pages/Homepage';
import Protect from './ProtectedRoutes';
import Sign from './components/Signup';
import MemberHome from './components/Members/homepage/MemberHome';

function App() {
    return (
        <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Landing />} />

            <Route path="/signup" element={<Sign />} />


            {/* MEMBER */}
            <Route
                path="/member/homepage"
                element={
                    <Protect
                        allowedRole="member"
                        storageKey="member"
                    >
                        <MemberHome />
                    </Protect>
                }
            />


            {/* ADMIN / LOANER */}
            <Route
                path="/homepage"
                element={
                    <Protect
                        allowedRole="admin"
                        storageKey="loaner"
                    >
                        <Homepage />
                    </Protect>
                }
            />

        </Routes>
    );
}

export default App;