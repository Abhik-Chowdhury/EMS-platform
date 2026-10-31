import React, { useEffect } from 'react'
import DashboardPage from '../components/DashboardPage'
import { useData } from '../context/DataContext'
import ChartsPage from '../components/ChartsPage';

const Home = () => {

  const { employees, employeesLoading, fetchEmployees, payrolls, payrollsLaoding, fetchPayrolls, announcements, announcementsLoading, fetchAnnouncements } = useData();

  // get the all data
  useEffect(() => {
    fetchEmployees();
    fetchAnnouncements();
    fetchPayrolls();

    const interval = setInterval(() => {
      fetchEmployees(true, true);
      fetchAnnouncements(true, true);
      fetchPayrolls(true, true);
    }, 8000);

    const handleFocus = () => {
      fetchEmployees(true, true);
      fetchAnnouncements(true, true);
      fetchPayrolls(true, true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchEmployees, fetchAnnouncements, fetchPayrolls]);
  const loading = employeesLoading || announcementsLoading || payrollsLaoding;


  return (
    <div>
      <DashboardPage employees={employees} announcements={announcements} payrolls={payrolls} loading={false} />
      <ChartsPage loading={false}/>
    </div>
  )
}

export default Home