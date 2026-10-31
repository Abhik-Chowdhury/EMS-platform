import { Announcement } from "../model/Announcement.js";
import User from "../model/User.js";
import Employee from "../model/Employee.js";

// to create an announcement
export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, sendTo, recipient, fromDate, toDate } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
            return res.status(400).json({
                success: false,
                message: "From Date cannot be after to Date"
            });


        }

        const announcement = await Announcement.create({
            title,
            message,
            sendTo: sendTo || "All",
            recipient: sendTo == "Employee" ? recipient : null,
            createdBy: req.user.id,
            fromDate: fromDate || null,
            toDate: toDate || null,
        });

        return res.status(201).json({
            success: true,
            message: "Announcement created successfully",
            announcement
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// to fetch the announcements 
export const getAnnouncements = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        });
        let query = {};
        if (user.role !== "admin") {
            const employee = await Employee.findOne({ workEmail: user.email });
            const employeeId = employee ? employee._id : null;
            query = {
                $or: [{ sendTo: "All" }, {
                    sendTo: "Employee", recipient: employeeId
                }]
            };
        }

        const announcements = await Announcement.find(query).populate("recipient", "name employeeId department designation").sort({ createdAt: -1 });
        let filtered = announcements;
        if (user.role !== "admin") {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            const todayStr = `${year}-${month}-${day}`;

            filtered = announcements.filter((item) => {
                const rawEndDate = item.toDate || item.fromDate || item.createdAt;
                if (!rawEndDate) return true;
                const endObj = new Date(rawEndDate);
                if (Number.isNaN(endObj.getTime())) return true;

                const endYear = endObj.getFullYear();
                const endMonth = String(endObj.getMonth() + 1).padStart(2, "0");
                const endDay = String(endObj.getDate()).padStart(2, "0");
                const endDateStr = `${endYear}-${endMonth}-${endDay}`;
                if (endDateStr < todayStr) return false;

                return true;
            }); // if announcement date is before today it is passed
        }

        return res.status(200).json({
            success: true,
            announcements: filtered
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// to delete an announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found."
            });
        }


        await Announcement.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Announcement deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}