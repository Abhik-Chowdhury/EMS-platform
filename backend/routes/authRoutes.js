import express from "express";
import { forgotPassword, login, resendOtp, resetPassword, signupAdmin, verifyOtp } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup-admin", signupAdmin);

authRouter.post("/login", login);


authRouter.post("/verify-otp", verifyOtp);

authRouter.post("/resend-otp", resendOtp);


authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password", resetPassword);

export default authRouter;