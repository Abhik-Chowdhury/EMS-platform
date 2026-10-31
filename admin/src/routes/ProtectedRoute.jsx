import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Navbar from "../components/Navbar";


const ProtectedRoute = () => {
    const location = useLocation();
    const {isAuthenticated} = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    return (
        <div className=" min-h-screen bg-zinc-50">
            <Navbar/>
            <Outlet/>
        </div>
    )
};

export default ProtectedRoute;