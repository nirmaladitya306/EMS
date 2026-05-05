import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import morgan from "morgan";

import { ConnectDB } from './config/connectDB.js';

// routes
import AccessDriftRouter from './routes/AccessDrift.route.js';
import EmployeeAuthRouter from './routes/EmployeeAuth.route.js';
import HRAuthrouter from './routes/HRAuth.route.js';
import DashboardRouter from './routes/Dashboard.route.js';
import EmployeeRouter from './routes/Employee.route.js';
import HRRouter from './routes/HR.route.js';
import DepartmentRouter from './routes/Department.route.js';
import SalaryRouter from './routes/Salary.route.js';
import NoticeRouter from "./routes/Notice.route.js";
import LeaveRouter from './routes/Leave.route.js';
import AttendanceRouter from './routes/Attendance.route.js';
import RecruitmentRouter from './routes/Recruitment.route.js';
import ApplicantRouter from './routes/Applicant.route.js';
import InterviewInsightRouter from './routes/InterviewInsights.route.js';
import GenerateRequestRouter from './routes/GenerateRequest.route.js';
import CorporateCalendarRouter from './routes/CorporateCalendar.route.js';
import BalanceRouter from './routes/Balance.route.js';
import DocumentRouter from './routes/Document.route.js';
import LeaveRecommendationRouter from './routes/LeaveRecommendation.route.js';
import ActivityLogRouter from './routes/ActivityLog.route.js';
import PayrollComplianceRouter from './routes/PayrollCompliance.route.js';
import ExitClearanceRouter from './routes/ExitClearance.route.js';
import AnalyticsRouter from './routes/Analytics.routes.js';
import RBACRouter from './routes/RBAC.route.js';
import PermissionRouter from './routes/Permission.route.js';
import OrgStructureRouter from './routes/OrgStructure.route.js';
import ChatRouter from "./routes/Chat.route.js";

dotenv.config();

const app = express();

// 👇 REQUIRED FOR VERCEL & DEV TUNNELS COOKIES TO WORK
app.set("trust proxy", 1); 

// middleware
app.use(helmet());
app.use(morgan("combined"));

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, "");

    const normalizedAllowed = allowedOrigins.map(o =>
      o.replace(/\/$/, "")
    );

    // allow localhost + env
    if (normalizedAllowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // ✅ allow Codespaces / DevTunnels / Vercel
    if (
      normalizedOrigin.includes(".app.github.dev") ||
      normalizedOrigin.includes(".devtunnels.ms") ||
      normalizedOrigin.includes(".vercel.app")
    ) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error("CORS not allowed"));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// health check route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// API routes
app.use('/v1/permissions',          PermissionRouter);
app.use('/v1/access-drift',         AccessDriftRouter);
app.use("/auth/employee",           EmployeeAuthRouter);
app.use("/auth/hr",                 HRAuthrouter);
app.use("/v1/dashboard",            DashboardRouter);
app.use("/v1/employee",             EmployeeRouter);
app.use("/v1/hr",                   HRRouter);
app.use("/v1/department",           DepartmentRouter);
app.use("/v1/salary",               SalaryRouter);
app.use('/v1/payroll-compliance',   PayrollComplianceRouter);
app.use("/v1/notice",               NoticeRouter);
app.use("/v1/leave",                LeaveRouter);
app.use("/v1/attendance",           AttendanceRouter);
app.use("/v1/recruitment",          RecruitmentRouter);
app.use("/v1/applicant",            ApplicantRouter);
app.use("/v1/interview-insights",   InterviewInsightRouter);
app.use("/v1/generate-request",     GenerateRequestRouter);
app.use("/v1/corporate-calendar",   CorporateCalendarRouter);
app.use("/v1/balance",              BalanceRouter);
app.use("/v1/document",             DocumentRouter);
app.use("/v1/leave-recommendation", LeaveRecommendationRouter);
app.use("/v1/activity-log",         ActivityLogRouter);
app.use("/v1/exit-clearance",       ExitClearanceRouter);
app.use('/v1/analytics',            AnalyticsRouter);
app.use('/v1/rbac',                 RBACRouter);
app.use('/v1/org-structure',        OrgStructureRouter);
app.use("/v1/chat",                 ChatRouter);

// ─── Environment-Aware Global Error Handler ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  
  // Hide actual error messages from clients in production for 500 errors
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? "An unexpected internal server error occurred."
    : err.message || "Internal Server Error";

  res.status(statusCode).json({ message });
});

// start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ConnectDB();
    
    // Only listen on a port if we are NOT in Vercel's production environment
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }
  } catch (err) {
    console.error("DB connection failed:", err);
    // Don't kill the process on Vercel, just log it
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1); 
    }
  }
};

startServer();

// 👇 THIS IS THE MAGIC LINE VERCEL NEEDS 👇
export default app;