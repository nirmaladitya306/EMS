import express from "express";
import {
    HandleEmployeeSignup,
    HandleEmployeeVerifyEmail,
    HandleResetEmployeeVerifyEmail,
    HandleEmployeeLogin,
    HandleEmployeeCheck,
    HandleEmployeeLogout,
    HandleEmployeeForgotPassword,
    HandleEmployeeSetPassword,
    HandleEmployeeCheckVerifyEmail
} from "../controllers/EmployeeAuth.controller.js";
import { VerifyEmployeeToken } from "../middlewares/Auth.middleware.js";

const router = express.Router();

// Authentication Routes
router.post("/signup", HandleEmployeeSignup);
router.post("/verify-email", HandleEmployeeVerifyEmail);
router.post("/reset-verify-email", HandleResetEmployeeVerifyEmail);
router.post("/login", HandleEmployeeLogin);
router.get("/check-login", VerifyEmployeeToken, HandleEmployeeCheck);
router.post("/logout", HandleEmployeeLogout);
router.post("/forgot-password", HandleEmployeeForgotPassword);
router.post("/reset-password/:token", HandleEmployeeSetPassword);
router.get("/check-verify-email", VerifyEmployeeToken, HandleEmployeeCheckVerifyEmail);

export default router;