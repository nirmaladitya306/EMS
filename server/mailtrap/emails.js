import { transporter } from "./mailtrap.config.js";
import { 
  VERIFICATION_EMAIL_TEMPLATE, 
  PASSWORD_RESET_REQUEST_TEMPLATE, 
  PASSWORD_RESET_SUCCESS_TEMPLATE 
} from "./emailtemplates.js";

// ✅ Send verification email (OTP)
export const SendVerificationEmail = async (email, verificationcode) => {
  try {
    await transporter.sendMail({
      from: '"EMS" <no-reply@ems.com>',
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationcode),
    });

    return true;
  } catch (error) {
    console.log("Verification email error:", error.message);
    return false;
  }
};

// ✅ Welcome email
export const SendWelcomeEmail = async (email, firstname, lastname, role) => {
  try {
    await transporter.sendMail({
      from: '"EMS" <no-reply@ems.com>',
      to: email,
      subject: "Welcome to EMS",
      html: `<h2>Welcome ${firstname} ${lastname}</h2><p>Your role: ${role}</p>`,
    });

    return true;
  } catch (error) {
    console.log("Welcome email error:", error.message);
    return false;
  }
};

// ✅ Forgot password email
export const SendForgotPasswordEmail = async (email, resetURL) => {
  try {
    await transporter.sendMail({
      from: '"EMS" <no-reply@ems.com>',
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    return true;
  } catch (error) {
    console.log("Forgot password email error:", error.message);
    return false;
  }
};

// ✅ Password reset confirmation
export const SendResetPasswordConfimation = async (email) => {
  try {
    await transporter.sendMail({
      from: '"EMS" <no-reply@ems.com>',
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    return true;
  } catch (error) {
    console.log("Reset confirmation error:", error.message);
    return false;
  }
};