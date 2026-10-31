import express from 'express';
import { isAdmin, verifyToken } from '../middlewares/authMiddleware.js';
import { getChartData } from '../controllers/dashboradController.js';

const dashboardRouter = express.Router();

dashboardRouter.get("/charts", verifyToken, isAdmin,getChartData);

export default dashboardRouter;