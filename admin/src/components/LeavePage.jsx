import React, { useEffect, useMemo, useRef, useState } from 'react'
import { leavesPageStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../auth/useAuth';
import { useData } from '../context/DataContext';
import EmployeeToast from '../components/EmployeePage/EmployeeToast'
import { AlertCircle, CalendarCheck, CalendarDays, CalendarX, Clock, Pill, Search, Undo2, Check,X } from 'lucide-react';
// date formate
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
const LeavePage = () => {
  const { user } = useAuth();
  const { leaves, fetchLeaves } = useData();
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [decidingAction, setDecidingAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState();
  const [statusFilter, setStatusFilter] = useState("All");
  // for toast
  const [toast, setToast] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastProgress, setToastProgess] = useState(false);

  const toastTimer = useRef(null);
  const toastFrame = useRef(null);
  const toastExitTimer = useRef(null);

  // to clear toast timer
  const clearToastTimers = () => {
    window.clearTimeout(toastTimer.current);
    window.clearTimeout(toastFrame.current);
    window.clearTimeout(toastExitTimer.current);

  }
  // to close the toast
  const closeToast = () => {
    clearToastTimers();
    setToastOpen(false);
    toastExitTimer.current = window.setTimeout(() => setToast(null), 220);
  }

  // to show toast
  const showToast = ({ title, message, tone = 'success' }) => {
    clearToastTimers();
    setToast({ title, message, tone });
    setToastOpen(false);
    setToastProgess(false);

    toastFrame.current = window.setTimeout(() => {
      setToastOpen(true);
      window.setTimeout(() => setToastProgess(true), 60);
    }, 20);
    toastTimer.current = window.setTimeout(closeToast, 3600);
  }

  // fetch the leaves
  const fetchLeavesData = async (force = false, silent = false) => {
    if (!user?.token) return;
    if (!silent) setLoading(true);

    try {
      await fetchLeaves(force, silent);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeavesData();

    const interval = setInterval(() => {
      fetchLeavesData(true, true);
    }, 5000);

    const handleFocus = () => {
      fetchLeavesData(true, true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearToastTimers();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };

  }, [user?.token]);

  const handleDecideLeave = async (leaveId, employeeName, nextStatus) => {
    setDecidingId(leaveId);
    setDecidingAction(nextStatus);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/attendance/leave/${leaveId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        showToast({
          title:
            nextStatus === "Approved" ? "Leave Approved" : "Leave Rejected",
          message: `${employeeName}'s leave request was ${nextStatus.toLowerCase()} successfully.`,
          tone: nextStatus === "Approved" ? "success" : "danger",
        });
        fetchLeavesData(true);
      } else {
        showToast({
          title: "Action failed",
          message: data.message || "Could not update leave request.",
          tone: "danger",
        });
      }
    } catch (err) {
      console.error("Error updating leave:", err);
      showToast({
        title: "Connection error",
        message: "Failed to update leave status.",
        tone: "danger",
      });
    } finally {
      setDecidingId(null);
      setDecidingAction(null);
    }
  };

  const stats = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    leaves.forEach((leave) => {
      if (leave.status === "Pending") counts.pending++;
      else if (leave.status === "Approved") counts.approved++;
      else if (leave.status === "Rejected") counts.rejected++;
    });
    return counts;
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (filterDate) {
        const fromStr = new Date(leave.fromDate).toISOString().split("T")[0];
        const toStr = new Date(leave.toDate).toISOString().split("T")[0];
        if (filterDate < fromStr || filterDate > toStr) return false;
      }
      if (statusFilter !== "All" && leave.status !== statusFilter) return false;
      if (searchTerm?.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const empName = leave.employee?.name?.toLowerCase() || "";
        const empId = leave.employee?.employeeId?.toLowerCase() || "";
        const reason = leave.reason?.toLowerCase() || "";
        if (!empName.includes(query) && !empId.includes(query) && !reason.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [leaves, filterDate, searchTerm, statusFilter]);
  return (
    <main className={s.mainContainer}
    >
      <EmployeeToast toast={toast} open={toastOpen} progress={toastProgress} onclose={closeToast}
        onConfirmDelete={() => { }}
      />
      <section className={s.sectionWrapper}>
        <div className={s.headerCard}>
          <div>
            <p className={s.headerBadge}>Leaves</p>
            <h1 className={s.headerTitle}>Employee Leave Management</h1>
            <p className={s.headerDescription}>Review and act on employee leave application. Filter by status or specific date</p>
          </div>
        </div>

        <div className={s.statsGrid}>

          {/* pending leave requests */}
          <article className={s.statCard}>
            <div className={s.statCardTop}>
              <span className={s.getStatIconClass("pending")}>
                <Clock className={s.statIconSvg} />
              </span>
              <span className={s.getStatBadgeClass("pending")}>
                Pending Action
              </span>
            </div>
            <p className={s.statLabel}>Pending Requests</p>
            <p className={s.statValue}>{stats.pending}</p>
            <p className={s.statHelper}>Awaiting administrator review</p>
          </article>

          {/* approved leave request */}
          <article className={s.statCard} style={{ animationDelay: "120ms" }}>
            <div className={s.statCardTop}>
              <span className={s.getStatIconClass("approved")}>
                <CalendarCheck className={s.statIconSvg} />
              </span>
              <span className={s.getStatBadgeClass("approved")}>
                Approved
              </span>
            </div>
            <p className={s.statLabel}>Active / Approved</p>
            <p className={s.statValue}>{stats.approved}</p>
            <p className={s.statHelper}>Granted employee leave periods</p>
          </article>

          {/* Rejected leaves request  */}
          <article className={s.statCard} style={{ animationDelay: "240ms" }}>
            <div className={s.statCardTop}>
              <span className={s.getStatIconClass("rejected")}>
                <CalendarX className={s.statIconSvg} />
              </span>
              <span className={s.getStatBadgeClass("rejected")}>
                Rejected
              </span>
            </div>
            <p className={s.statLabel}>Rejected Request</p>
            <p className={s.statValue}>{stats.rejected}</p>
            <p className={s.statHelper}>Declined or expired requests</p>
          </article>
        </div>

        {/* leave request list */}
        <div className={s.filterPanel}>
          <div>
            <h2 className={s.filterTitle}>Application List</h2>
            <p className={s.filterSubtitle}>{filteredLeaves.length} request matching filters</p>
          </div>

          {/* filter search box section */}
          <div className={s.filterControls}>
            {/* search box */}
            <label className={s.searchLabel}>
              <Search className={s.filterIcon} />
              <input type="text" placeholder='Searcn name, ID, reason...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={s.searchInput}
              />
            </label>

            {/* date filter input */}
            <label className={s.searchLabel}>
              <CalendarDays className={s.filterIcon} />
              <input type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={s.filterInput}
              />
            </label>

            {/*Status filter section  */}
            <label className={s.searchLabel}>
              <Clock className={s.filterIcon} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>

            {/* check */}
            {(filterDate || searchTerm || statusFilter !== "All") && (
              <button onClick={() => {
                setFilterDate("");
                setSearchTerm("");
                setStatusFilter("All")
              }} className={s.resetButton}>
                <Undo2 className={s.resetIcon} />
                <span>reset</span>
              </button>
            )}
          </div>
        </div>

        {/* leave table */}
        <section className={s.tableSection}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead className={s.tableHead}>
                <tr>
                  <th className={s.tableHeader}>Employee</th>
                  <th className={s.tableHeader}>Applied Date</th>
                  <th className={s.tableHeader}>Leave Duration</th>
                  <th className={s.tableHeader}>Reason</th>
                  <th className={`${s.tableHeader} ${s.tableHeaderCenter}`}>
                    Status
                  </th>
                  <th className={`${s.tableHeader} ${s.tableHeaderRight}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={s.tableBody}>
                {loading ? (
                  <tr>
                    <td colSpan="6" className={s.loadingCell}>
                      <div className={s.loadingSpinner} />
                      <p className={s.loadingText}>Loading leave requests...</p>
                    </td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={s.emptyCell}>
                      <AlertCircle className={s.emptyIcon} />
                      <p className={s.emptyTitle}>No leave applications found</p>
                      <p className={s.emptySubtitle}>
                        Try adjusting your filters or dates.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => {
                    const employeeName = leave.employee?.name || "Unknown";
                    const employeeId = leave.employee?.employeeId || "N/A";
                    const isPending = leave.status === "Pending";

                    return (
                      <tr key={leave._id} className={s.tableRow}>
                        <td className={s.cell}>
                          <div>
                            <p className={s.employeeName}>{employeeName}</p>
                            <p className={s.employeeId}>ID: {employeeId}</p>
                          </div>
                        </td>

                        <td className={`${s.cell} ${s.appliedDate}`}>
                          {formatDate(leave.createdAt)}
                        </td>

                        <td className={s.cell}>
                          <p className={s.durationFrom}>
                            {formatDate(leave.fromDate)}
                          </p>
                          <p className={s.durationTo}>
                            to {formatDate(leave.toDate)}
                          </p>
                        </td>

                        <td
                          className={s.reasonCell}
                          title={leave.reason}
                        >
                          {leave.reason}
                        </td>

                        <td className={`${s.cell} ${s.statusCell}`}>
                          <Pill
                            label={
                              leave.status === "Pending"
                                ? "Leave Applied"
                                : leave.status === "Approved"
                                  ? "Leave Approved"
                                  : leave.status === "Rejected"
                                    ? "Leave Rejected"
                                    : leave.status
                            }
                          />
                        </td>

                        <td className={`${s.cell} ${s.actionsCell}`}>
                          {isPending ? (
                            <div className={s.actionButtonsWrapper}>
                              <button
                                type="button"
                                disabled={decidingId !== null}
                                onClick={() =>
                                  handleDecideLeave(
                                    leave._id,
                                    employeeName,
                                    "Approved",
                                  )
                                }
                                className={s.approveButton}
                                title="Approve Leave"
                              >
                                {decidingId === leave._id &&
                                  decidingAction === "Approved" ? (
                                  <svg className={s.actionSpinner} fill="none" viewBox="0 0 24 24">
                                    <circle
                                      className={s.spinnerCircle}
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className={s.spinnerPath}
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <Check className={s.actionIconSvg} />
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={decidingId !== null}
                                onClick={() =>
                                  handleDecideLeave(
                                    leave._id,
                                    employeeName,
                                    "Rejected",
                                  )
                                }
                                className={s.rejectButton}
                                title="Reject Leave"
                              >
                                {decidingId === leave._id &&
                                  decidingAction === "Rejected" ? (
                                  <svg className={s.actionSpinner} fill="none" viewBox="0 0 24 24">
                                    <circle
                                      className={s.spinnerCircle}
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className={s.spinnerPath}
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <X className={s.actionIconSvg} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className={s.decidedText}>
                              Decided on {formatDate(leave.updatedAt)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}

export default LeavePage