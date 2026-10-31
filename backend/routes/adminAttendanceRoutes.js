import express from "express";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { decideLeave, getAllLeaves, getAttendanceDashboard, getAttendanceList, getEmployeeAttendanceDetails } from "../controllers/adminAttendanceController.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", verifyToken, isAdmin, getAttendanceDashboard);

adminRouter.get("/list", verifyToken, isAdmin, getAttendanceList);

adminRouter.get("/leaves", verifyToken, isAdmin, getAllLeaves);

adminRouter.get("/employee/:id", verifyToken, isAdmin, getEmployeeAttendanceDetails);

adminRouter.put("/leave/:id", verifyToken, isAdmin, decideLeave);

export default adminRouter;
