import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ children, allowedRole, storageKey }) => {
    const userData = localStorage.getItem(storageKey);

    // Not logged in
    if (!userData) {
        return <Navigate to="/" replace />;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem(storageKey);
        return <Navigate to="/" replace />;
    }

    // Check role
    if (user.role !== allowedRole) {

        // User is logged in but doesn't have permission
        if (user.role === 'member') {
            return <Navigate to="/member/homepage" replace />;
        }

        if (user.role === 'admin') {
            return <Navigate to="/homepage" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoutes;