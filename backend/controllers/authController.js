import User from "../model/User.js";
import Employee from "../model/Employee.js";
import { sendOtpEmail, sendResetOtpEmail } from "../config/brevo.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

// to signup an admin

export const signupAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Admin already exists"
            });
        }

        // to hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // to generate 6 digits OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

        // user create
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            isVerified: false,
            verificationOtp: otp,
            verificationOtpExpires: otpExpires
        });

        // to send email that contains otp
        sendOtpEmail(email, otp, name).catch(err => console.error("Error sending admin verification OTP email: ", err))
        res.status(201).json({
            message: "Admin registered successfully. Please verify your email.",
            email: user.email
        });



    } catch (error) {
        console.log("Signup Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}


// to login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log("Incoming Data -> Email:", email, "| Password:", password)
        const user = await User.findOne({ email })
        if (user) console.log("DB Encrypted Password ->", user.password);
        if (!user) {
            return res.status(400).json({
                message: "Invalid Email"
            })
        }

        if (!user.isVerified) {
            return res.status(400).json({
                message: "Your account is not verified. Please verify your email",
                isVerified: false,
                email: user.email
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // to generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const employee = await Employee.findOne({ workEmail: user.email });
        res.status(200).json({
            message: "Login successful",
            token,
            role: user.role,
            name: user.name,
            employeeId: employee ? employee.employeeId : undefined
        })


    } catch (error) {

        console.log("Login Error", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

// to verify otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        // to check if otp matches or if otp time is expired
        if (user.verificationOtp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP Code"
            });
        }

        if (new Date() > user.verificationOtpExpires) {
            return res.status(400).json({
                message: "OTP code has expired. Please request a new one."
            });
        }
        user.isVerified = true;
        user.verificationOtp = null;
        user.verificationOtpExpires = null;

        await user.save();
        res.status(200).json({
            message: "Email verified successfully! You can now log in."
        })
    } catch (error) {
        console.log("Verify Otp Error", err);
        res.status(500).json({
            message: "Server Error"
        });
    }
}


// to resend the otp
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        // to generate 6 digits OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        user.verificationOtp = otp;
        user.verificationOtpExpires = otpExpires;

        await user.save()
        sendOtpEmail(email, otp, user.name).catch(err => console.error("Error resending the OTP email: ", err))
        res.status(200).json({
            message: "A new OTP code has been sent to your email."
        });

    } catch (error) {
        console.log("Resend Otp Error", err);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

// for forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // to generate 6 digits OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = otpExpires;
        await user.save();

        sendResetOtpEmail(email, otp, user.name).catch(err => console.error("Error sending reset password: ", err))

        res.status(200).json({
            message: "Password reset OTP sent successfully to your email."
        });

    } catch (error) {
        console.log("Forgot Password Error", err);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

// to reset the password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword} = req.body;
        if(!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and new Password are required."
            });
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if(user.resetPasswordOtp !== otp){
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if(new Date() > user.resetPasswordOtpExpires) {
            return res.status(400).json({
                message: "OTP code has expired. Please request a new one."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpires = null;

        await user.save();

        res.status(200).json({
            message: "Password has been reset successfully! You can now login."
        })

    } catch (error) {
        console.log("Reset Password Error", err);
        res.status(500).json({
            message: "Server Error"
        });
    }
}