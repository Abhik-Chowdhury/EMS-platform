import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isEmployeeLoggedIn } from "../auth/employeeAuth";

const ProtectedRoute = () => {
    const location = useLocation();
    if(!isEmployeeLoggedIn()) {
        return <Navigate to="/login" replace state={{from: location}}/>;
    }

    return <Outlet/>;
}

export default ProtectedRoute;