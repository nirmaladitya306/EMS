import { Link } from 'react-router-dom'

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
  .auth-success-icon { width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12)); border: 1px solid rgba(99,102,241,0.2); display: flex; align-items: center; justify-content: center; font-size: 32px; }
  .auth-title { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: #0f172a; line-height: 1.15; letter-spacing: -0.02em; margin: 0; }
  .auth-subtitle { font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.7; font-weight: 300; max-width: 320px; }
  .auth-warning { font-size: 12px; color: rgba(220,38,38,0.75); font-weight: 500; background: rgba(220,38,38,0.05); border: 1px solid rgba(220,38,38,0.15); border-radius: 8px; padding: 10px 16px; width: 100%; }
  .auth-submit-btn { width: 100%; padding: 11px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border: none; border-radius: 10px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; text-decoration: none; display: block; letter-spacing: 0.02em; }
  .auth-submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .auth-divider { height: 1px; background: rgba(0,0,0,0.06); width: 100%; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 480px) { .auth-topbar { padding: 18px 20px; } .auth-card { padding: 28px 20px; border-radius: 18px; } }
`

export const ResetEmailConfirmaction = ({ redirectpath }) => {
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
                        <div className="auth-success-icon">📬</div>
                        <h1 className="auth-title">Check your inbox</h1>
                        <p className="auth-subtitle">
                            We've sent a password reset link to your email address. Click the link in the email to set a new password.
                        </p>
                        <div className="auth-divider" />
                        <p className="auth-warning">⚠ Do not forward this email — the reset link is single-use and expires in 1 hour.</p>
                        <Link to={redirectpath} className="auth-submit-btn">← Back to Login</Link>
                    </div>
                </div>
            </div>
        </>
    )
}
