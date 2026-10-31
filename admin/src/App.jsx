import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { AuthProvider } from './auth/AuthContext'
import { DataProvider } from './context/DataContext'
import Login from './pages/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import Employee from './pages/Employee'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Leaves from './pages/Leaves'
import Announcements from './pages/Announcements'
import { useEffect } from 'react'
import { AUTH_STORAGE_KEY } from './auth/authStore'

const ScrollToTop = () => {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: "auto"})
  }, [pathname]);

  return null;
}

const App = () => {
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if(response.status === 401) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    }
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <ScrollToTop/>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/' element={<Home />} />
            <Route path='/employees' element={<Employee/>}/>
            <Route path='/attendance' element={<Attendance/>}/>
            <Route path='/payroll' element={<Payroll/>}/>
            <Route path='/leaves' element={<Leaves/>}/>
            <Route path='/announcements' element={<Announcements/>}/>
          </Route>
        </Routes>
      </DataProvider>

    </AuthProvider>
  )
}

export default App