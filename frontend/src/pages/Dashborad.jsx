import React from 'react'
import DashboardPage from '../components/DashboardPage'
import { useOutletContext } from 'react-router-dom'

const Dashborad = () => {
    const { records, joiningDate } = useOutletContext();
  return <DashboardPage records={records} joiningDate={joiningDate}/>;
}

export default Dashborad