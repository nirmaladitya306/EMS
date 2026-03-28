import { HumanResources } from "../models/HR.model.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { GenerateJwtTokenAndSetCookiesHR } from "../utils/generatejwttokenandsetcookies.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation } from "../mailtrap/emails.js"
import { GenerateVerificationToken } from "../utils/generateverificationtoken.js"
import { Organization } from "../models/Organization.model.js"
import { createLog } from "../utils/activityLogger.js"



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

        const isMatch = await bcrypt.compare(password, HR.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
                type: "HRLogin"
            });
        }

        // ✅ Set login cookie
        GenerateJwtTokenAndSetCookiesHR(
            res,
            HR._id,
            HR.role,
            HR.organizationID
        );

        // ✅ TEMP DEV FIX:
        // If no OTP exists for old HR accounts, create one
        if (!HR.verificationtoken) {
            HR.verificationtoken = "123456";
            HR.verificationtokenexpires =
                Date.now() + 10 * 60 * 1000; // 10 mins

            console.log("TEMP OTP:", HR.verificationtoken);
        }

        // ✅ Update login time
        HR.lastlogin = new Date();

        // ✅ Save DB changes
        await HR.save();

        // ✅ Create activity log
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
        const HR = await HumanResources.findOne({ _id: req.HRid, organizationID: req.ORGID })
        if (!HR) {
            return res.status(404).json({ success: false, message: "HR not found", type: "checkHR" })
        }
        return res.status(200).json({ success: true, message: "HR Already Logged In", type: "checkHR" })
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

            // ❌ REMOVED: GenerateJwtTokenAndSetCookiesHR

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

        // ❌ REMOVED: GenerateJwtTokenAndSetCookiesHR

        const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode);

        return res.status(201).json({
            success: true,
            message: "HR Registered Successfully. Please verify your email.",
            type: "signup",
            VerificationEmailStatus,
            HRid: newHR._id
        });



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            type: "signup"
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
