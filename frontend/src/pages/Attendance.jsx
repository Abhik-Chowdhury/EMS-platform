import React from 'react'
import AttendancePage from '../components/AttendancePage'
import { useOutletContext } from 'react-router-dom'

const Attendance = () => {
    const { notify, records, setRecords, fetchRecords, joiningDate } = useOutletContext();
    return (
        <AttendancePage
            records={records}
            setRecords={setRecords}
            notify={notify}
            joiningDate={joiningDate}
        />
    )
}

export default Attendance;