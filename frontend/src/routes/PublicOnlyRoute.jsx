import { Navigate, Outlet } from "react-router-dom"
import { isEmployeeLoggedIn } from "../auth/employeeAuth"

const PublicOnlyRoute = () => 
    isEmployeeLoggedIn() ? <Navigate to="/" replace/> : <Outlet/>;

export default PublicOnlyRoute;