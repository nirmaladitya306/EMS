import { Link } from 'react-router-dom'
import { ErrorPopup } from './error-popup'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .auth-root {
    min-height: 100vh;
    background-color: var(--ems-bg, #ffffff);
    background-image:
      linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }
  .auth-root::before {
    content: '';
    position: absolute;
    top: -20%; left: -10%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-root::after {
    content: '';
    position: absolute;
    bottom: -20%; right: -10%;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .auth-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 40px;
    position: relative;
    z-index: 10;
    border-bottom: 1px solid var(--ems-border, rgba(0,0,0,0.06));
  }
  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .auth-logo-mark {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
    font-family: 'DM Serif Display', serif;
  }
  .auth-logo-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--ems-text-faint, rgba(0,0,0,0.4));
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .auth-badge {
    font-size: 11px;
    font-weight: 500;
    color: rgba(99,102,241,0.9);
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    padding: 4px 12px;
    border-radius: 100px;
    letter-spacing: 0.04em;
  }
  .auth-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    position: relative;
    z-index: 10;
  }
  .auth-card {
    width: 100%;
    max-width: 420px;
    background: var(--ems-bg-secondary, rgba(0,0,0,0.015));
    border: 1px solid var(--ems-border, rgba(0,0,0,0.07));
    border-radius: 24px;
    padding: 40px 36px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    animation: fadeUp 0.6s ease both;
  }
  .auth-eyebrow {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(99,102,241,0.8);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .auth-eyebrow::before {
    content: '';
    height: 1px;
    width: 24px;
    background: rgba(99,102,241,0.4);
  }
  .auth-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.85rem;
    color: var(--ems-text-primary, #0f172a);
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }
  .auth-subtitle {
    font-size: 13px;
    color: var(--ems-text-muted, rgba(0,0,0,0.4));
    line-height: 1.6;
    font-weight: 300;
    margin: 0;
  }
  .auth-divider { height: 1px; background: var(--ems-border, rgba(0,0,0,0.06)); }
  .auth-form { display: flex; flex-direction: column; gap: 18px; }
  .auth-field { display: flex; flex-direction: column; gap: 6px; }
  .auth-field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .auth-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ems-text-muted, rgba(0,0,0,0.55));
    letter-spacing: 0.02em;
  }
  .auth-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid var(--ems-input-border, rgba(0,0,0,0.12));
    background: var(--ems-input-bg, rgba(255,255,255,0.8));
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: var(--ems-text-primary, #0f172a);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .auth-input:focus {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .auth-forgot {
    font-size: 12px;
    color: rgba(99,102,241,0.85);
    font-weight: 500;
    text-decoration: none;
  }
  .auth-forgot:hover { color: #6366f1; }
  .auth-submit-btn {
    width: 100%;
    padding: 11px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: 0.02em;
    margin-top: 4px;
  }
  .auth-submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .auth-footer-note {
    text-align: center;
    font-size: 11px;
    color: var(--ems-text-faint, rgba(0,0,0,0.25));
    letter-spacing: 0.04em;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 480px) {
    .auth-topbar { padding: 18px 20px; }
    .auth-card   { padding: 28px 20px; border-radius: 18px; }
  }
`

export const SignIn = ({ handlesigninform, handlesigninsubmit, targetedstate, statevalue, redirectpath, role = 'Employee' }) => {
    const isHR = role === 'HR'
    return (
        <>
            <style>{styles}</style>
            {targetedstate.error.status && <ErrorPopup error={targetedstate.error.message} />}
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
                        <div>
                            <div className="auth-eyebrow">{isHR ? 'HR Admin Portal' : 'Employee Portal'}</div>
                            <h1 className="auth-title">Welcome back</h1>
                            <p className="auth-subtitle">Sign in to your {isHR ? 'HR admin' : 'employee'} account to continue.</p>
                        </div>
                        <div className="auth-divider" />
                        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handlesigninsubmit(e); }}>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="email">Email address</label>
                                <input className="auth-input" id="email" name="email" type="email" required
                                    autoComplete="email" value={statevalue.email} onChange={handlesigninform}
                                    placeholder="you@company.com" />
                            </div>
                            <div className="auth-field">
                                <div className="auth-field-row">
                                    <label className="auth-label" htmlFor="password">Password</label>
                                    <Link to={redirectpath} className="auth-forgot">Forgot password?</Link>
                                </div>
                                <input className="auth-input" id="password" name="password" type="password" required
                                    autoComplete="current-password" value={statevalue.password} onChange={handlesigninform}
                                    placeholder="••••••••" />
                            </div>
                            <button type="submit" className="auth-submit-btn">Sign in →</button>
                        </form>
                        <p className="auth-footer-note">Protected by end-to-end encryption</p>
                    </div>
                </div>
            </div>
        </>
    )
}