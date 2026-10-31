import Payroll from "../model/Payroll.js";
import User from "../model/User.js";
import Employee from "../model/Employee.js";


// to create a new payroll(admin)
export const createPayroll = async (req, res) => {
    try {
        const {
            employeeId,
            empId,
            name,
            role,
            department,
            payDate,
            salaryPeriod,
            month,
            baseSalary,
            bonus,
            overtime,
            deduction,
            netSalary,
            status
        } = req.body;

        if (!employeeId || !empId || !name || !role || !department || !payDate || !salaryPeriod || !month || baseSalary === undefined || netSalary === undefined) {
            return res.status(400).json({ success: false, message: "All required payroll fields must be provided." });
        }

        // to find employee
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        if (employee.salaryPeriod === "year") {
            const yearPart = salaryPeriod.substring(0, 4);
            const existingYearly = await Payroll.findOne({
                employeeId,
                salaryPeriod: { $regex: `^${yearPart}-` }
            });
            if (existingYearly) {
                return res.status(400).json({ success: false, message: "Payslip already generated for this employee in this calendar year." });
            }
        } else {
            const existing = await Payroll.findOne({ employeeId, salaryPeriod });
            if (existing) {
                return res.status(400).json({ success: false, message: "Payslip already generated for this employee and period." });
            }
        }

        // to generate unique Payroll ID.
        let payrollId = "";
        let unique = false;
        while (!unique) {
            const num = Math.floor(1000 + Math.random() * 9000);
            payrollId = `PAY-${num}`;
            const check = await Payroll.findOne({ payrollId });
            if (!check) {
                unique = true;
            }
        }

        const record = await Payroll.create({
            payrollId,
            employeeId,
            empId,
            name,
            role,
            department,
            payDate,
            salaryPeriod,
            month,
            baseSalary,
            bonus: bonus || 0,
            overtime: overtime || 0,
            deduction: deduction || 0,
            netSalary,
            status: status || "Paid",
            createdBy: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Payslip generated successfully!",
            record
        });
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// to get payroll recodes (as per role base admin can see all and employee can see only their own)

export const getPayrolls = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.."
            });
        }

        let query = {};
        if (user.role !== "admin") {
            const employee = await Employee.findOne({ workEmail: user.email.toLocaleLowerCase() });
            if (!employee) {
                return res.status(200).json({
                    success: true,
                    records: []
                }); // for no matching doc for this employee
            }
            query = { employeeId: employee._id };
        }
        const records = await Payroll.find(query).populate("employeeId").sort({ payDate: -1, createdAt: -1 });
        return res.status(200).json({
            success: true,
            records
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}