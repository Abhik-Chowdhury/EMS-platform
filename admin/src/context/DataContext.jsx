import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";

const DataContext = createContext(null);

const BASE = `${import.meta.env.VITE_API_BASE_URL}`;

export const DataProvider = ({ children }) => {
    const { user } = useAuth();

    // for employees
    const [employees, setEmployess] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);

    const [employeesFetched, setEmployeesFetched] = useState(false);

    const employeesFetchingRef = useRef(false);


    const fetchEmployees = useCallback(async (force = false, silent = false) => {
        if (!user?.token) return;
        if (!force && employeesFetched) return;
        if (employeesFetchingRef.current) return;
        employeesFetchingRef.current = true;

        if (!silent) setEmployeesLoading(true);

        try {
            const res = await fetch(`${BASE}/api/employee`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const mapped = data.employee.map((emp) => ({
                    ...emp,
                    id: emp.employeeId,
                    profileImage: emp.profileImage
                        ? emp.profileImage.startsWith("http") ||
                            emp.profileImage.startsWith("data:")
                            ? emp.profileImage
                            : `${BASE}/${emp.profileImage.replace(/\\/g, "/")}`
                        : "",
                    joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
                }));

                setEmployess(mapped);
                setEmployeesFetched(true);
            }
        } catch (error) {

            console.error("Data Context Error: ", error);
        } finally {
            if (!silent) setEmployeesLoading(false);
            employeesFetchingRef.current = false;
        }
    },

        [user?.token, employeesFetched],

    );


    // for payrolls
    const [payrolls, setPayrolls] = useState([]);
    const [payrollsLaoding, setPayrollsLoading] = useState(false);
    const [payrollsFetched, setPayrollsFetched] = useState(false);
    const payrollsFetchingRef = useRef(false);

    const fetchPayrolls = useCallback(async (force = false, silent = false) => {
        if (!user?.token) return;
        if (!force && payrollsFetched) return;
        if (payrollsFetchingRef.current) return;
        payrollsFetchingRef.current = true;
        if (!silent) setPayrollsLoading(true);

        try {
            const res = await fetch(`${BASE}/api/payroll`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const mapped = data.records.map((rec) => ({
                    ...rec,
                    id: rec.payrollId,
                }));
                setPayrolls(mapped);
                setPayrollsFetched(true);
            }
        } catch (error) {
            console.error("Data context: ", error);
        } finally {
            if (!silent) setEmployeesLoading(false);
            payrollsFetchingRef.current = false;
        }
    },
        [user?.token, payrollsFetched],
    );

    // announcements
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [announcementsFetched, setAnnouncementsFetched] = useState(false);
    const announcementsFetchingRef = useRef(false);

    const fetchAnnouncements = useCallback(
        async (force = false, silent = false) => {
            if (!user?.token) return;
            if (!force && announcementsFetched) return;
            if (announcementsFetchingRef.current) return;
            announcementsFetchingRef.current = true;
            if (!silent) setAnnouncementsLoading(true);
            try {
                const res = await fetch(`${BASE}/api/announcements`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setAnnouncements(data.announcements || []);
                    setAnnouncementsFetched(true);
                }
            } catch (err) {
                console.error("DataContext: fetchAnnouncements error", err);
            } finally {
                if (!silent) setAnnouncementsLoading(false);
                announcementsFetchingRef.current = false;
            }
        },
        [user?.token, announcementsFetched],
    );

    // leaves
    const [leaves, setLeaves] = useState([]);
    const [leavesLoading, setLeavesLoading] = useState(false);
    const [leaveFetched, setLeavesFetched] = useState(false);
    const leaveFetchingRef = useRef(false);

    const fetchLeaves = useCallback(async (force = false, silent = false) => {
        if (!user?.token) return;
        if (!force && leaveFetched) return;
        if (leaveFetchingRef.current) return;
        leaveFetchingRef.current = true;
        if (!silent) setLeavesLoading(true);

        try {
            const res = await fetch(`${BASE}/api/admin/attendance/leaves`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setLeaves(data.leaves || []);
                setLeavesFetched(true);
            }
        } catch (error) {
            console.error("DataContext Error:", error);
        } finally {
            if (!silent) setLeavesLoading(false);
            leaveFetchingRef.current = false;
        }

    }, [user?.token, leaveFetched],
    );

    return (
        <DataContext.Provider
            value={{
                // employees
                employees,
                setEmployess,
                employeesLoading,
                employeesFetched,
                fetchEmployees,

                // payrolls

                payrolls,
                setPayrolls,
                payrollsLaoding,
                payrollsFetched,
                fetchPayrolls,

                //announcements
                announcements,
                setAnnouncements,
                announcementsLoading,
                announcementsFetched,
                fetchAnnouncements,

                //leaves
                leaves,
                setLeaves,
                leavesLoading,
                leaveFetched,
                fetchLeaves
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

// for useData
export const useData = () => {
    const ctx = useContext(DataContext);
    if(!ctx) throw new Error("useData must be inside DataProvider");
    return ctx;
    
}
