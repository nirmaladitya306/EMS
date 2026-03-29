import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import morgan from "morgan";
import AccessDriftRouter from './routes/AccessDrift.route.js'

import { ConnectDB } from './config/connectDB.js';

// routes
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
import AnalyticsRouter from './routes/Analytics.route.js';

dotenv.config();

const app = express();

// middleware
app.use(helmet());
app.use(morgan("combined"));

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/v1/access-drift', AccessDriftRouter)
app.use("/auth/employee", EmployeeAuthRouter);
app.use("/auth/hr", HRAuthrouter);
app.use("/v1/dashboard", DashboardRouter);
app.use("/v1/employee", EmployeeRouter);
app.use("/v1/hr", HRRouter);
app.use("/v1/department", DepartmentRouter);
app.use("/v1/salary", SalaryRouter);
app.use('/v1/payroll-compliance', PayrollComplianceRouter);
app.use("/v1/notice", NoticeRouter);
app.use("/v1/leave", LeaveRouter);
app.use("/v1/attendance", AttendanceRouter);
app.use("/v1/recruitment", RecruitmentRouter);
app.use("/v1/applicant", ApplicantRouter);
app.use("/v1/interview-insights", InterviewInsightRouter);
app.use("/v1/generate-request", GenerateRequestRouter);
app.use("/v1/corporate-calendar", CorporateCalendarRouter);
app.use("/v1/balance", BalanceRouter);
app.use("/v1/document", DocumentRouter);
app.use("/v1/leave-recommendation", LeaveRecommendationRouter);
app.use("/v1/activity-log", ActivityLogRouter);
app.use("/v1/exit-clearance", ExitClearanceRouter);
app.use('/v1/analytics',     AnalyticsRouter);

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
});

// start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await ConnectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
};

startServer();