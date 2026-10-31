import { deleteFromImagekit, uploadImageKit } from "../config/imagekit.js";
import Employee from "../model/Employee.js";
import User from "../model/User.js";
import bcrypt from 'bcrypt';
// create const employee
export const createEmployee = async (req, res) => {
    try {
        // 1. Ensure file exists before proceeding
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Profile image is required." });
        }

        // 2. Destructure and support both "id" and "employeeId" from the frontend
        const {
            name,
            email,
            workEmail,
            workPassword,
            phone,
            gender,
            department,
            designation,
            salary,
            salaryPeriod,
            joiningDate,
            bankName,
            accountNumber,
            ifscCode,
            accountStatus
        } = req.body;

        const employeeId = req.body.employeeId || req.body.id;

        // 3. Early validation for mandatory credentials
        if (!employeeId || !workEmail || !workPassword || !name) {
            return res.status(400).json({
                success: false,
                message: "Employee ID, Name, Work Email, and Work Password are required."
            });
        }

        // 4. Check uniqueness against OTHER employees
        // (Allows this employee to have personal email === workEmail without throwing an error)
        const conflictQueries = [
            { employeeId },
            { workEmail }
        ];

        // Only check personal email against other records if an email was provided
        if (email) {
            conflictQueries.push({ email });
        }

        const existingEmployee = await Employee.findOne({ $or: conflictQueries });

        if (existingEmployee) {
            if (existingEmployee.employeeId === employeeId) {
                return res.status(400).json({ success: false, message: "Employee ID already exists" });
            }
            if (existingEmployee.workEmail === workEmail) {
                return res.status(400).json({ success: false, message: "Work email already belongs to another employee" });
            }
            if (email && existingEmployee.email === email) {
                return res.status(400).json({ success: false, message: "Personal email already belongs to another employee" });
            }
            return res.status(400).json({ success: false, message: "An employee with these details already exists" });
        }

        // 5. Check if user account with workEmail already exists
        const existingUser = await User.findOne({ email: workEmail });
        if (existingUser) {
            const correspondingEmployee = await Employee.findOne({ workEmail });
            // Clean up orphaned user record if it's not an admin
            if (!correspondingEmployee && existingUser.role !== 'admin') {
                await User.deleteOne({ _id: existingUser._id });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "User account with this work email already exists"
                });
            }
        }

        // 6. Hash password before uploading image
        const hashedPassword = await bcrypt.hash(workPassword, 10);

        // 7. Upload to ImageKit
        let profileImageUrl = "";
        try {
            const cleanFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
            const fileName = `emp_profile_${employeeId}_${Date.now()}_${cleanFileName}`;
            const uploadResult = await uploadImageKit(req.file.buffer, fileName);
            profileImageUrl = uploadResult.url;
        } catch (uploadErr) {
            return res.status(500).json({ success: false, message: uploadErr.message });
        }

        // --- Continues to Employee.create(...) and User.create(...) ---
        let employee;
        try {
            employee = await Employee.create({
                employeeId,
                name,
                email,
                workEmail,
                workPassword,
                phone,
                gender,
                department,
                designation,
                salary,
                salaryPeriod,
                joiningDate,
                bankName,
                accountNumber,
                ifscCode,
                accountStatus,
                profileImage: profileImageUrl
            });
        } catch (dbErr) {
            if (profileImageUrl) {
                await deleteFromImagekit(profileImageUrl).catch(err => console.error("ImageKit rollback failed:", err));
            }
            return res.status(500).json({ success: false, message: dbErr.message });
        }

        try {
            await User.create({
                name,
                email: workEmail,
                password: hashedPassword,
                role: "user",
                isVerified: true
            });
        } catch (userErr) {
            await Employee.findByIdAndDelete(employee._id);
            if (profileImageUrl) {
                await deleteFromImagekit(profileImageUrl).catch(err => console.error("ImageKit rollback failed:", err));
            }
            return res.status(500).json({ success: false, message: "Failed to create user login credentials: " + userErr.message });
        }

        return res.status(201).json({ success: true, message: "Employee created successfully", employee });
    } catch (error) {
        console.error("Error in create Employee: ", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

// to get all employees
export const getAllEmployee = async (req, res) => {
    try {
        const employee = await Employee.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All employees fetched successfully!",
            employee
        });
    } catch (error) {
        console.error("Error in get Employee: ", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// to get an employee details

export const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee fetched successfully!",
            employee
        });
    } catch (error) {
        console.error("Error in get an Employee: ", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// to update the employee details
export const updateEmployee = async (req, res) => {
    let newProfileImageUrl = "";
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const data = { ...req.body };
        let oldProfileImageUrl = employee.profileImage;

        if (req.file) {
            try {
                const fileName = `emp_profile_${employee.employeeId}_${Date.now()}_${req.file.originalname}`;
                const uploadResult = await uploadImageKit(req.file.buffer, fileName);
                newProfileImageUrl = uploadResult.url;
                data.profileImage = newProfileImageUrl;
            } catch (uploadErr) {
                return res.status(500).json({ success: false, message: uploadErr.message });
            }
        }

        if (data.workEmail && data.workEmail !== employee.workEmail) {
            const emailExistsEmployee = await Employee.findOne({ workEmail: data.workEmail, _id: { $ne: req.params.id } });
            const emailExistsUser = await User.findOne({ email: data.workEmail });
            if (emailExistsEmployee || emailExistsUser) {
                if (newProfileImageUrl) {
                    await deleteFromImagekit(newProfileImageUrl).catch(err => console.error("ImageKit rollback failed:", err));
                }
                return res.status(400).json({ success: false, message: "Work email is already in use by another account" })
            }
        }

        let hashedNewPassword;
        if (data.workPassword) {
            hashedNewPassword = await bcrypt.hash(data.workPassword, 10);
        }

        let user = await User.findOne({ email: employee.workEmail });
        if (user) {
            if (data.name) user.name = data.name;
            if (data.workEmail) user.email = data.workEmail;
            if (hashedNewPassword) user.password = hashedNewPassword;
            await user.save();
        } else {
            const workPassword = data.workPassword || employee.workPassword;
            const workEmail = data.workEmail || employee.workEmail;
            const name = data.name || employee.name;
            const hashedPassword = hashedNewPassword || (workPassword ? await bcrypt.hash(workPassword, 10) : null);

            if (workEmail && hashedPassword) {
                await User.create({
                    name,
                    email: workEmail,
                    password: hashedPassword,
                    role: "user",
                    isVerified: true
                });
            }
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })

        if (req.file && oldProfileImageUrl) {
            await deleteFromImagekit(oldProfileImageUrl).catch(err => console.error("Failed to delete old image from ImageKit:", err));
        }

        return res.status(200).json({ success: true, message: "Employee updated successfully", employee: updatedEmployee })
    } catch (error) {
        if (newProfileImageUrl) {
            await deleteFromImagekit(newProfileImageUrl).catch(err => console.error("ImageKit rollback failed:", err));
        }
        console.error("Error in updateEmployee:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

// to delete an employee
export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        await Employee.findByIdAndDelete(req.params.id);
        if (employee.workEmail) {
            await User.findOneAndDelete({ email: employee.workEmail });

        }
        // to remove image
        if (employee.profileImage) {
            await deleteFromImagekit(employee.profileImage).catch(err => console.error("Failed to delete profile image from ImageKit: ", err));
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            employee
        });

    } catch (error) {
        console.error("Error in Delete Employee:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}