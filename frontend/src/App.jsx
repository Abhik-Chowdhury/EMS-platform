import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Dashborad from './pages/Dashborad'
import Attendance from './pages/Attendance'
import Login from './pages/Login'
import PublicOnlyRoute from './routes/PublicOnlyRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import PaySlip from './pages/PaySlip';
import Leave from './pages/Leave'


// for ScrollToTop
const ScrollToTop = () => {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto"});
  }, [pathname]);
  return null;

}
const App = () => {
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if(response.status === 401) {
        localStorage.removeItem("employee_panel_auth");
        window.localStorage.href = "/login";
      }
      return response;
    }
    return () => {
      window.fetch = originalFetch;
    }
  }, []);
  return (
    <div>
      <ScrollToTop/>
      <Routes element={<PublicOnlyRoute />}>
        <Route>
          <Route path='/login' element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute/>}>
          <Route path='/' element={<Home />}>
            <Route index element={<Dashborad />} />
            <Route path='attendance' element={<Attendance />} />
            <Route path='payslip' element={<PaySlip />} />
            <Route path='leave' element={<Leave/>} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App