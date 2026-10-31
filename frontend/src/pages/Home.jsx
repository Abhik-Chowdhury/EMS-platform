import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearEmployeeLogin, getEmployeeUser } from '../auth/employeeAuth';
import { homePageStyles as s } from '../assets/dummyStyles';
import { Toast } from '../components/DashboardPage';
const pageTitles = {
    "/": "Dashboard",
    "/attendance": "Attendance",
    "/payslip": "Payslip",
    "/leave": "Leave",
};

const Home = () => {
    const [records, setRecords] = useState([]);
    const [joiningDate, setJoiningDate] = useState();
    const [toast, setToast] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const notify = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2200);
    };

    const logout = () => {
        clearEmployeeLogin();
        navigate("/login", { replace: true });
    }

    // to fetch the records comming from the server side
    const fetchRecords = async () => {
        const user = getEmployeeUser();
        if (!user || !user.token) return;
        try {
            const attRes = await fetch(`http://localhost:5000/api/attendance`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const attData = await attRes.json();
            // leaves data from server side
            const leavesRes = await fetch(`http://localhost:5000/api/leave/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const leaveData = await leavesRes.json();

            if (attData.success && attData.joiningDate) {
                setJoiningDate(attData.joiningDate)
            }
            const attendanceList =
                attData.success && Array.isArray(attData.attendance)
                    ? attData.attendance
                    : [];
            const leaveList =
                leaveData.success && Array.isArray(leaveData.leaves)
                    ? leaveData.leaves
                    : [];

            const mappedAttendance = attendanceList.map((att) => ({
                id: att._id,
                type: "Present",
                name: att.employee?.name || user.name || "Employee",
                empId: att.employee?.employeeId || user.employeeId || "",
                from: att.date.split("T")[0],
                to: att.date.split("T")[0],
                reason: "-",
                status: att.status || "Present",
            }));

            const mappedLeaves = leaveList.map((leave) => ({
                id: leave._id,
                type: "Leave",
                name: leave.employee?.name || user.name || "Employee",
                empId: leave.employee?.employeeId || user.employeeId || "",
                from: leave.fromDate.split("T")[0],
                to: leave.toDate.split("T")[0],
                reason: leave.reason,
                status:
                    leave.status === "Pending"
                        ? "Leave Applied"
                        : leave.status === "Approved"
                            ? "Approved"
                            : "Rejected",
            }));
            setRecords([...mappedAttendance, ...mappedLeaves]);
        } catch (error) {
            console.error("Failed to fetch attendance or leave records: ", error);
        }
    }
    useEffect(() => {
    fetchRecords();

    const interval = setInterval(() => {
      fetchRecords();
    }, 5000);

    const handleFocus = () => {
      fetchRecords();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
    return (
        <div>
            <Toast text={toast}/>
            <Navbar onLogout={logout} />
            <main className={s.main}>
                <div className={s.container}>
                    <h1 className={s.heading}>
                        {pageTitles[location.pathname] || "Dashboard"}
                    </h1>
                    <Outlet context={{
                        notify,
                        records,
                        setRecords,
                        fetchRecords,
                        joiningDate,
                    }}
                    />
                </div>

            </main>
        </div>
    )
}

export default Home