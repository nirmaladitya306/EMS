import { HumanResources } from "../models/HR.model.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { GenerateJwtTokenAndSetCookiesHR } from "../utils/generatejwttokenandsetcookies.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation } from "../mailtrap/emails.js"
import { GenerateVerificationToken } from "../utils/generateverificationtoken.js"
import { Organization } from "../models/Organization.model.js"
import { createLog } from "../utils/activityLogger.js"
import { seedDefaultRoles } from "../controllers/RBAC.controller.js"

export const HandleHRLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const HR = await HumanResources.findOne({ email });

        if (!HR) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
                type: "HRLogin"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            HR.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
                type: "HRLogin"
            });
        }

        // ✅ set auth cookie
        GenerateJwtTokenAndSetCookiesHR(
            res,
            HR._id,
            HR.role,
            HR.organizationID
        );

        // ✅ update login time
        HR.lastlogin = new Date();

        await HR.save();

        // ✅ create activity log
        await createLog({
            actorID: HR._id,
            actorName: `${HR.firstname} ${HR.lastname}`,
            action: "LOGIN",
            description: `HR ${HR.firstname} ${HR.lastname} logged in`,
            organizationID: HR.organizationID,
            req
        });

        return res.status(200).json({
            success: true,
            message: "HR Login Successful"
        });

    } catch (error) {
        console.error("HR Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const HandleHRCheck = async (req, res) => {
    try {
        const HR = await HumanResources.findOne({ 
            _id: req.HRid, 
            organizationID: req.ORGID 
        }).populate("rbacRole"); 

        if (!HR) return res.status(404).json({ success: false, message: "HR not found", type: "checkHR" })
        
        return res.status(200).json({ 
            success: true, 
            message: "HR Already Logged In", 
            type: "checkHR",
            data: HR // ✅ CHANGED from hrData to data!
        })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal error", type: "checkHR" })
    }
}

export const HandleHRVerifyEmail = async (req, res) => {
    const { verificationcode } = req.body;

    try {
        // ✅ Find currently logged-in HR directly
        const HR = await HumanResources.findById(req.HRid);

        if (!HR) {
            return res.status(401).json({
                success: false,
                message: "HR not found",
                type: "HRverifyemail"
            });
        }

        // ✅ Check token manually
        if (
            HR.verificationtoken !== verificationcode ||
            HR.verificationtokenexpires < Date.now()
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or Expired Verification Code",
                type: "HRverifyemail"
            });
        }

        // ✅ Mark verified
        HR.isverified = true;
        HR.verificationtoken = undefined;
        HR.verificationtokenexpires = undefined;

        await HR.save();

        const SendWelcomeEmailStatus =
            await SendWelcomeEmail(
                HR.email,
                HR.firstname,
                HR.lastname,
                HR.role
            );

        return res.status(200).json({
            success: true,
            message: "Email Verified successfully",
            SendWelcomeEmailStatus,
            type: "HRverifyemail"
        });

    } catch (error) {
        console.error("Verify email error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
            type: "HRverifyemail"
        });
    }
};

export const HandleHRcheckVerifyEmail = async (req, res) => {
    try {
        const HR = await HumanResources.findOne({
            _id: req.HRid,
            organizationID: req.ORGID
        });

        // ✅ TEMP DEBUG LOG
        console.log("CURRENT OTP:", HR?.verificationtoken);
        console.log(
            "OTP EXPIRES:",
            HR?.verificationtokenexpires
        );

        if (HR.isverified) {
            return res.status(200).json({
                sucess: true,
                message: "HR Already Verified",
                type: "HRcodeavailable",
                alreadyverified: true
            });
        }

        if (
            HR.verificationtoken &&
            HR.verificationtokenexpires > Date.now()
        ) {
            return res.status(200).json({
                success: true,
                message: "Verification Code is Still Valid",
                type: "HRcodeavailable"
            });
        }

        return res.status(404).json({
            success: false,
            message: "Invalid or Expired Verification Code",
            type: "HRcodeavailable"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error,
            type: "HRcodeavailable"
        });
    }
};

export const HandleHRForgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email, organizationID: req.ORGID, _id: req.HRid })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Email Does Not Exist Please Enter Correct One", type: "HRforgotpassword" })
        }

        const resetToken = crypto.randomBytes(25).toString('hex')
        const resetTokenExpires = Date.now() + 1000 * 60 * 60 // 1 hour 

        HR.resetpasswordtoken = resetToken;
        HR.resetpasswordexpires = resetTokenExpires;
        await HR.save()

        const URL = `${process.env.CLIENT_URL}/auth/HR/resetpassword/${resetToken}`
        const SendResetPasswordEmailStatus = await SendForgotPasswordEmail(email, URL)
        return res.status(200).json({ success: true, message: "Reset Password Email Sent Successfully", SendResetPasswordEmailStatus: SendResetPasswordEmailStatus, type: "HRforgotpassword" })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, type: "HRforgotpassword" })
    }
}

export const HandleHRResetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    try {
        if (req.cookies.HRtoken) {
            res.clearCookie("HRtoken")
        }

        const HR = await HumanResources.findOne({ resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() } })

        if (!HR) {
            return res.status(401).json({ success: false, message: "Invalid or Expired Reset Password Token", resetpassword: false })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        HR.password = hashedPassword
        HR.resetpasswordtoken = undefined;
        HR.resetpasswordexpires = undefined;
        await HR.save()

        const SendPasswordResetEmailStatus = await SendResetPasswordConfimation(HR.email)
        return res.status(200).json({ success: true, message: "Password Reset Successfully", SendPasswordResetEmailStatus: SendPasswordResetEmailStatus, resetpassword: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, resetpassword: false })
    }
}

export const HandleHRResetverifyEmail = async (req, res) => {
    const { email } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email, _id: req.HRid, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Email Does Not Exist, Please Enter Correct Email", type: "HRResendVerifyEmail" })
        }

        if (HR.isverified) {
            return res.status(400).json({ success: false, message: "HR Email is already Verified", type: "HRResendVerifyEmail" })
        }

        const verificationcode = GenerateVerificationToken(6)
        HR.verificationtoken = verificationcode
        HR.verificationtokenexpires = Date.now() + 5 * 60 * 1000

        await HR.save()

        const SendVerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
        return res.status(200).json({ success: true, message: "Verification Email Sent Successfully", SendVerificationEmailStatus: SendVerificationEmailStatus, type: "HRResendVerifyEmail" })

    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleHRSignup = async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            password,
            contactnumber,
            name,
            description,
            OrganizationURL,
            OrganizationMail
        } = req.body;

        // 🔹 Validation
        if (!name || !description || !OrganizationURL || !OrganizationMail) {
            throw new Error("All Organization fields are required");
        }

        if (!firstname || !lastname || !email || !password || !contactnumber) {
            throw new Error("All HR fields are required");
        }

        const organization = await Organization.findOne({
            name,
            OrganizationURL,
            OrganizationMail
        });

        const HR = await HumanResources.findOne({ email });

        if (HR) {
            return res.status(400).json({
                success: false,
                message: "HR already exists, please login or use a different email",
                type: "signup"
            });
        }

        // 🔹 Create Organization + HR
        if (!organization) {
            const newOrganization = await Organization.create({
                name,
                description,
                OrganizationURL,
                OrganizationMail
            });

            const hashedpassword = await bcrypt.hash(password, 10);
            const verificationcode = GenerateVerificationToken(6);

            const newHR = await HumanResources.create({
                firstname,
                lastname,
                email,
                password: hashedpassword,
                contactnumber,
                role: "HR-Admin",
                organizationID: newOrganization._id,
                verificationtoken: verificationcode,
                verificationtokenexpires: Date.now() + 5 * 60 * 1000
            });

            newOrganization.HRs.push(newHR._id);
            await newOrganization.save();

            // ─── Seed the default HR_ADMIN role for this new organisation ─────
            await seedDefaultRoles(newOrganization._id)

            // ✅ RESTORED: Generate cookie so the verify email endpoint knows who this is
            GenerateJwtTokenAndSetCookiesHR(res, newHR._id, newHR.role, newOrganization._id);

            const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode);

            return res.status(201).json({
                success: true,
                message: "Organization Created & HR Registered Successfully. Please verify your email.",
                VerificationEmailStatus,
                type: "signup",
                HRid: newHR._id
            });
        }

        // 🔹 Create HR under existing Organization
        const hashedpassword = await bcrypt.hash(password, 10);
        const verificationcode = GenerateVerificationToken(6);

        const newHR = await HumanResources.create({
            firstname,
            lastname,
            email,
            password: hashedpassword,
            contactnumber,
            role: "HR-Admin",
            organizationID: organization._id,
            verificationtoken: verificationcode,
            verificationtokenexpires: Date.now() + 5 * 60 * 1000
        });

        organization.HRs.push(newHR._id);
        await organization.save();

        // ✅ RESTORED: Generate cookie so the verify email endpoint knows who this is
        GenerateJwtTokenAndSetCookiesHR(res, newHR._id, newHR.role, organization._id);

        const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode);

        return res.status(201).json({
            success: true,
            message: "HR Registered Successfully. Please verify your email.",
            type: "signup",
            VerificationEmailStatus,
            HRid: newHR._id
        });

    } catch (error) {
        console.error("Signup Error:", error);

        // ─── Catch MongoDB Duplicate Key Errors (Error 11000) ───
        if (error.code === 11000) {
            
            // 1. Duplicate Organization Name
            if (error.keyPattern && error.keyPattern.name) {
                return res.status(409).json({ 
                    success: false, 
                    message: "An organisation with this name already exists. If you belong to this company, please ask your administrator for an invite." 
                });
            }
            
            // 2. Duplicate Email Address
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(409).json({ 
                    success: false, 
                    message: "An account with this email already exists. Please sign in." 
                });
            }
        }
        
        // ─── Standard Fallback Error ───
        return res.status(500).json({ 
            success: false, 
            message: "Failed to create account. Please try again later." 
        });
    }
};

export const HandleHRLogout = async (req, res) => {
    try {
        const HR = await HumanResources.findById(req.HRid)

        if (HR) {
            await createLog({
                actorID: HR._id,
                actorName: `${HR.firstname} ${HR.lastname}`,
                action: 'LOGOUT',
                description: `HR ${HR.firstname} ${HR.lastname} logged out`,
                organizationID: HR.organizationID,
                req
            })
        }

        res.clearCookie("HRtoken")

        return res.status(200).json({ success: true, message: "HR Logged Out Successfully" })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server Error" })
    }
}


// ─── HR ADMIN: Create a new HR User for the same organization ────────────────
export const HandleCreateHRByAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, contactnumber, roleID } = req.body;

        const admin = await HumanResources.findById(req.HRid);
        if (!admin) return res.status(401).json({ success: false, message: "Unauthorized" });

        const existingHR = await HumanResources.findOne({ email });
        if (existingHR) return res.status(400).json({ success: false, message: "HR user already exists." });

        const tempPassword = Math.random().toString(36).slice(-8) + "A1!"; 
        const hashedpassword = await bcrypt.hash(tempPassword, 10);

        // ✅ FIXED: Using "HR-Admin" instead of "HR" to match your Schema Enum
        const newHR = await HumanResources.create({
            firstname,
            lastname,
            email,
            password: hashedpassword,
            contactnumber: contactnumber || "",
            role: "HR-Admin", 
            rbacRole: roleID || null,
            organizationID: req.ORGID,
            isverified: true 
        });

        await Organization.findByIdAndUpdate(req.ORGID, { 
            $push: { HRs: newHR._id } 
        });

        await createLog({
            actorID: admin._id,
            actorName: `${admin.firstname} ${admin.lastname}`,
            action: 'HR_CREATED',
            description: `Admin added new HR user: ${firstname} ${lastname}`,
            organizationID: req.ORGID,
            req
        });

        return res.status(201).json({
            success: true,
            message: `Successfully added ${firstname} to NovaCore.`,
            tempPassword: tempPassword 
        });

    } catch (error) {
        console.error("Create HR Error Details:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to create HR user.",
            error: error.message 
        });
    }
};