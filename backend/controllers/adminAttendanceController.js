import Employee from "../model/Employee.js";
import Attendance from "../model/Attendance.js";
import Leave from "../model/Leave.js";
import User from "../model/User.js";
import { autoRejectExpiredLeaves } from "./leaveController.js";

// base url
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
// Helper functions

const formatDateToString = (date) => {
    if(!date) return "";
    return new Date(date).toISOString().split('T')[0];
}; // output will be YYYY-MM-DD

// to get Attendance Dashborad

export const getAttendanceDashboard = async (req, res) => {
    try {
        await autoRejectExpiredLeaves();
        const { date } = { ...req.query, ...res.body};

        let today;
        if(date) {
            const [year, month, day] = date.split("-").map(Number);
            today = new Date(Date.UTC(year, month - 1, day));

        } else{
            const now = new Date();
            today = new Date(
                Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
            );
        }

        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);

        // total employee

        const totalEmployees = await Employee.countDocuments();

        //present
        const present = await Attendance.countDocuments({
            date: {
                $gte: today,
                $lt: tomorrow
            },
            status: "Present",
        })

        // leave applied(pending)
        const leaveApplied = await Leave.countDocuments({
            status: "Pending",
            fromDate: {
                $lte: tomorrow
            },
            toDate: {
                $gte: today
            },

        });

        // leave approved
        const leaveApproved = await Leave.countDocuments({
            status: "Approved",
            fromDate: {
                $lte: tomorrow
            },
            toDate: {
                $gte: today
            },
        });

        const absent = totalEmployees - present - leaveApproved;

        const notMarked = totalEmployees - present;

        return res.status(200).json({
            success: true,
            message: "Attendance dashboard fetched successfully!",
            data: {
                totalEmployees,
                present,
                absent,
                leaveApplied,
                leaveApproved,
                notMarked
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// to get full attendance list
export const getAttendanceList = async (req, res) => {
    try {
        await autoRejectExpiredLeaves();
        const { search = "", department, designation, date } = { ...req.query, ...req.body };
        const employeeQuery = {};

        if (search) {
            employeeQuery.name = { $regex: search, $options: "i" };
        }

        if (department && department !== "All") {
            employeeQuery.department = department;
        }

        if (designation && designation !== "All") {
            employeeQuery.designation = designation;
        }

        const employees = await Employee.find(employeeQuery).sort({ createdAt: -1 });

        let selectedDate;
        if (date) {
            const [year, month, day] = date.split("-").map(Number);
            selectedDate = new Date(Date.UTC(year, month - 1, day));
        } else {
            const now = new Date();
            selectedDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        }

        const nextDate = new Date(selectedDate);
        nextDate.setUTCDate(selectedDate.getUTCDate() + 1);

        const formattedDateStr = formatDateToString(selectedDate);

        // to get user ID

        const data = await Promise.all(
            employees.map(async (employee) => {
                const userDoc = await User.findOne({ email: employee.workEmail });
                const userObjectId = userDoc ? userDoc._id : null;
                const employeeIds = [employee._id, userObjectId].filter(Boolean);

                const attendance = await Attendance.findOne({
                    employee: { $in: employeeIds },
                    date: {
                        $gte: selectedDate,
                        $lt: nextDate,
                    },
                });

                // fetch all the leave request for this employee
                const leaves = await Leave.find({ employee: { $in: employeeIds } }).sort({ createdAt: -1 });

                const leaveRequests = leaves.map(leave => ({
                    id: leave._id.toString(),
                    startDate: formatDateToString(leave.fromDate),
                    endDate: formatDateToString(leave.toDate),
                    reason: leave.reason,
                    status: leave.status === "Pending" ? "Applied" : leave.status,
                    createdAt: leave.createdAt ? leave.createdAt.toISOString() : new Date().toISOString(),
                    decidedAt: leave.status !== "Pending" ? (leave.updatedAt ? leave.updatedAt.toISOString() : new Date().toISOString()) : null
                }));

                const approvedLeaveForDate = leaves.find(leave =>
                    leave.status === "Approved" &&
                    new Date(leave.fromDate) <= selectedDate &&
                    new Date(leave.toDate) >= selectedDate
                );

                const attendanceRecords = [];
                if (attendance) {
                    attendanceRecords.push({
                        date: formattedDateStr,
                        status: attendance.status,
                        reason: ""
                    });
                } else if (approvedLeaveForDate) {
                    attendanceRecords.push({
                        date: formattedDateStr,
                        status: "Leave",
                        reason: approvedLeaveForDate.reason,
                        leaveRequestId: approvedLeaveForDate._id.toString()
                    });
                } else {
                    attendanceRecords.push({
                        date: formattedDateStr,
                        status: "Not Marked",
                        reason: ""
                    });
                }

                const profileImage = employee.profileImage
                    ? (employee.profileImage.startsWith('http') || employee.profileImage.startsWith('data:'))
                        ? employee.profileImage
                        : `${baseUrl}/${employee.profileImage.replace(/\\/g, '/')}`
                    : '';

                return {
                    _id: employee._id,
                    id: employee.employeeId,
                    name: employee.name,
                    department: employee.department,
                    designation: employee.designation,
                    profileImage,
                    attendanceRecords,
                    leaveRequests
                };
            })
        );

        res.status(200).json({
            success: true,
            total: data.length,
            employees: data,
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

// to decide leave
export const decideLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Aprroved or Rejecteed

        if(!status || ! ["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const leave = await Leave.findById(id);
        if(!leave) {
            return res.status(400).json({
                success: false,
                message: "Leave request not found."
            });
        }

        leave.status = status;
        await leave.save();

        return res.status(200).json({
            success: true,
            message: `Leave request has been ${status.toLowerCase()}`,
            leave
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// to get all the leaves
export const getAllLeaves = async (req, res) => {
    try {
        await autoRejectExpiredLeaves();
        const leaves = await Leave.find({}).populate("employee", "employeeId name").sort({createdAt: -1});

        return res.status(200).json({
            success: true,
            leaves
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// now to get attendance details for employee
export const getEmployeeAttendanceDetails = async ( req, res) =>{
    try {
        const {id} = req.params;
        const employee = await Employee.findById(id);

        if(!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const userDoc = await User.findOne({ email: employee.workEmail });
        const userObjectId = userDoc ? userDoc._id : null;
        const employeeIds = [employee._id, userObjectId].filter(Boolean);

        const attendanceList = await Attendance.find({
            employee: { $in: employeeIds }
        }).sort({ date: -1 });

        const leaves = await Leave.find({ employee: { $in: employeeIds}}).sort({
            createdAt: -1
        })

        const attendanceRecords = attendanceList.map((a) => ({
            date: formatDateToString(a.date),
            status: a.status,
            reason: ""
        }));

        const leaveRequests = leaves.map((leave) => ({
            id: leave._id.toString(),
            startDate: formatDateToString(leave.fromDate),
            endDate: formatDateToString(leave.toDate),
            reason: leave.reason,
            status: leave.status === "Pending" ? "Applied" : leave.status,
            createdAt: leave.createdAt ? leave.createdAt.toISOString() : new Date().toISOString()
        }));

        return res.status(200).json({
            success: true,
            employee: {
                _id: employee._id,
                id: employee.employeeId,
                name: employee.name,
                joiningDate: formatDateToString(employee.joiningDate),
                attendanceRecords,
                leaveRequests
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}