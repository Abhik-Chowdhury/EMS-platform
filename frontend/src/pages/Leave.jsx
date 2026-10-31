import React from 'react'
import LeavePage from '../components/LeavePage'
import { useOutletContext } from 'react-router-dom'

const Leave = () => {
    const { records } = useOutletContext();
  return (
    <div>
        <LeavePage records={records}/>
    </div>
  )
}

export default Leave;