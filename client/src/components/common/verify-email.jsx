import { Link } from 'react-router-dom'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .auth-root { min-height: 100vh; background-color: #ffffff; background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px); background-size: 60px 60px; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; overflow: hidden; position: relative; }
  .auth-root::before { content: ''; position: absolute; top: -20%; left: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%); pointer-events: none; }
  .auth-root::after  { content: ''; position: absolute; bottom: -20%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%); pointer-events: none; }
  .auth-topbar { display: flex; align-items: center; justify-content: space-between; padding: 24px 40px; position: relative; z-index: 10; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .auth-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .auth-logo-mark { width: 34px; height: 34px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; font-family: 'DM Serif Display', serif; }
  .auth-logo-text { font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.4); letter-spacing: 0.05em; text-transform: uppercase; }
  .auth-badge { font-size: 11px; font-weight: 500; color: rgba(99,102,241,0.9); background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); padding: 4px 12px; border-radius: 100px; letter-spacing: 0.04em; }
  .auth-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; position: relative; z-index: 10; }
  .auth-card { width: 100%; max-width: 440px; background: rgba(0,0,0,0.015); border: 1px solid rgba(0,0,0,0.07); border-radius: 24px; padding: 40px 36px; display: flex; flex-direction: column; gap: 28px; align-items: center; text-align: center; animation: fadeUp 0.6s ease both; }
  .auth-icon-wrap { width: 52px; height: 52px; border-radius: 14px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .auth-eyebrow { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(99,102,241,0.8); font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .auth-eyebrow::before { content: ''; height: 1px; width: 24px; background: rgba(99,102,241,0.4); }
  .auth-eyebrow::after  { content: ''; height: 1px; width: 24px; background: rgba(99,102,241,0.4); }
  .auth-title { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: #0f172a; line-height: 1.15; letter-spacing: -0.02em; margin: 0; }
  .auth-subtitle { font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.7; font-weight: 300; max-width: 300px; }
  .auth-otp-wrap { display: flex; justify-content: center; }
  .auth-otp-slot { width: 48px !important; height: 56px !important; border: 2px solid rgba(99,102,241,0.3) !important; border-radius: 12px !important; font-size: 1.4rem !important; font-weight: 700 !important; font-family: 'DM Serif Display', serif !important; color: #0f172a !important; background: rgba(255,255,255,0.9) !important; transition: border-color 0.2s, box-shadow 0.2s !important; }
  .auth-otp-slot[data-active] { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
  .auth-submit-btn { width: 100%; padding: 11px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border: none; border-radius: 10px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.02em; }
  .auth-submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .auth-divider { height: 1px; background: rgba(0,0,0,0.06); width: 100%; }
  .auth-footer-note { font-size: 11px; color: rgba(0,0,0,0.25); letter-spacing: 0.04em; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 480px) { .auth-topbar { padding: 18px 20px; } .auth-card { padding: 28px 20px; border-radius: 18px; } .auth-otp-slot { width: 40px !important; height: 48px !important; font-size: 1.2rem !important; } }
`

export const Verify_Email_Component = ({ value, handleCodeValue, handleOTPsubmit }) => {
    return (
        <>
            <style>{styles}</style>
            <div className="auth-root">
                <div className="auth-topbar">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-mark">EW</div>
                        <span className="auth-logo-text">Employee Management</span>
                    </Link>
                    <span className="auth-badge">Secure Portal</span>
                </div>
                <div className="auth-body">
                    <div className="auth-card">
                        <div className="auth-icon-wrap">✉️</div>
                        <div className="auth-eyebrow">Email Verification</div>
                        <h1 className="auth-title">Enter your code</h1>
                        <p className="auth-subtitle">
                            We sent a 6-digit verification code to your email address. Enter it below to verify your account.
                        </p>
                        <div className="auth-divider" />
                        <div className="auth-otp-wrap">
                            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} value={value} onChange={handleCodeValue}>
                                <InputOTPGroup style={{ gap: '8px' }}>
                                    {[0,1,2,3,4,5].map(i => (
                                        <InputOTPSlot key={i} index={i} className="auth-otp-slot" />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <button className="auth-submit-btn" onClick={handleOTPsubmit}>
                            Verify email →
                        </button>
                        <p className="auth-footer-note">Code expires in 5 minutes</p>
                    </div>
                </div>
            </div>
        </>
    )
}
