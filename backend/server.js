import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {connectDB} from './config/db.js';
import authRouter from './routes/authRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import payrollRouter from './routes/payrollRoutes.js';
import leaveRouter from './routes/leaveRoutes.js';
import attendanceRouter from './routes/attendanceRoutes.js';
import adminRouter from './routes/adminAttendanceRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import announcementRouter from './routes/announcementRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// DB
connectDB()

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/admin/attendance", adminRouter);
app.use("/api/admin/dashboard", dashboardRouter);

app.use("/api/announcements", announcementRouter);

app.get('/', (req,res) => {
    res.send("API Working");
})



app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
})