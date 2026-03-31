import { Link } from 'react-router-dom'
import { ErrorPopup } from './error-popup'
import { useSelector } from 'react-redux'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .auth-root { min-height: 100vh; background-color: #ffffff; background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px); background-size: 60px 60px; display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif; overflow-x: hidden; position: relative; }
  .auth-root::before { content: ''; position: absolute; top: -20%; left: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%); pointer-events: none; }
  .auth-root::after  { content: ''; position: absolute; bottom: -20%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%); pointer-events: none; }
  .auth-topbar { display: flex; align-items: center; justify-content: space-between; padding: 24px 40px; position: relative; z-index: 10; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .auth-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .auth-logo-mark { width: 34px; height: 34px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; font-family: 'DM Serif Display', serif; }
  .auth-logo-text { font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.4); letter-spacing: 0.05em; text-transform: uppercase; }
  .auth-badge { font-size: 11px; font-weight: 500; color: rgba(99,102,241,0.9); background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); padding: 4px 12px; border-radius: 100px; letter-spacing: 0.04em; }
  .signup-body { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 48px 24px 64px; position: relative; z-index: 10; }
  .signup-card { width: 100%; max-width: 820px; background: rgba(0,0,0,0.015); border: 1px solid rgba(0,0,0,0.07); border-radius: 24px; padding: 44px 48px; display: flex; flex-direction: column; gap: 32px; animation: fadeUp 0.6s ease both; }
  .auth-eyebrow { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(99,102,241,0.8); font-weight: 500; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .auth-eyebrow::before { content: ''; height: 1px; width: 24px; background: rgba(99,102,241,0.4); }
  .auth-title { font-family: 'DM Serif Display', serif; font-size: 1.85rem; color: #0f172a; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 6px; }
  .auth-subtitle { font-size: 13px; color: rgba(0,0,0,0.4); line-height: 1.6; font-weight: 300; margin: 0; }
  .auth-divider { height: 1px; background: rgba(0,0,0,0.06); }
  .signup-section-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(0,0,0,0.3); font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .signup-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(0,0,0,0.07); }
  .signup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 28px; }
  .auth-field { display: flex; flex-direction: column; gap: 6px; }
  .auth-label { font-size: 12px; font-weight: 500; color: rgba(0,0,0,0.55); letter-spacing: 0.02em; }
  .auth-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.8); font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f172a; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
  .auth-input:focus { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .signup-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding-top: 4px; }
  .auth-submit-btn { padding: 11px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; border: none; border-radius: 10px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; letter-spacing: 0.02em; }
  .auth-submit-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .signup-signin-note { font-size: 13px; color: rgba(0,0,0,0.4); display: flex; align-items: center; gap: 10px; }
  .auth-link { color: rgba(99,102,241,0.9); font-weight: 500; text-decoration: none; font-size: 13px; }
  .auth-link:hover { color: #6366f1; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 640px) { .auth-topbar { padding: 18px 20px; } .signup-card { padding: 28px 20px; border-radius: 18px; } .signup-grid { grid-template-columns: 1fr; } }
`

export const SignUP = ({ handlesignupform, handlesubmitform, stateformdata, errorpopup }) => {
    const HRState = useSelector(state => state.HRReducer)

    const Field = ({ id, label, type = 'text', placeholder = '' }) => (
        <div className="auth-field">
            <label className="auth-label" htmlFor={id}>{label}</label>
            <input className="auth-input" id={id} name={id} type={type} required
                autoComplete="off" value={stateformdata[id]} onChange={handlesignupform}
                placeholder={placeholder} />
        </div>
    )

    return (
        <>
            <style>{styles}</style>
            {HRState.error?.status && <ErrorPopup error={HRState.error.message} />}
            {errorpopup && <ErrorPopup error="Passwords do not match. Please try again." />}
            <div className="auth-root">
                <div className="auth-topbar">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-mark">EW</div>
                        <span className="auth-logo-text">Employee Management</span>
                    </Link>
                    <span className="auth-badge">HR Portal</span>
                </div>
                <div className="signup-body">
                    <div className="signup-card">
                        <div>
                            <div className="auth-eyebrow">HR Admin Registration</div>
                            <h1 className="auth-title">Create your organisation</h1>
                            <p className="auth-subtitle">Set up your HR admin account and organisation in one step. You can invite employees after signing in.</p>
                        </div>
                        <div className="auth-divider" />
                        <div>
                            <p className="signup-section-label">Personal details</p>
                            <div className="signup-grid">
                                <Field id="firstname"     label="First name"      type="text"     placeholder="Jane" />
                                <Field id="lastname"      label="Last name"       type="text"     placeholder="Smith" />
                                <Field id="email"         label="Email address"   type="email"    placeholder="jane@company.com" />
                                <Field id="contactnumber" label="Contact number"  type="number"   placeholder="+1 555 000 0000" />
                                <Field id="textpassword"  label="Password"        type="password" placeholder="At least 8 characters" />
                                <Field id="password"      label="Confirm password" type="password" placeholder="Repeat your password" />
                            </div>
                        </div>
                        <div className="auth-divider" />
                        <div>
                            <p className="signup-section-label">Organisation details</p>
                            <div className="signup-grid">
                                <Field id="name"              label="Organisation name"   type="text"  placeholder="Acme Corp" />
                                <Field id="description"       label="Description"         type="text"  placeholder="What your organisation does" />
                                <Field id="OrganizationURL"   label="Organisation URL"    type="text"  placeholder="acmecorp.com" />
                                <Field id="OrganizationMail"  label="Organisation email"  type="email" placeholder="hr@acmecorp.com" />
                            </div>
                        </div>
                        <div className="auth-divider" />
                        <div className="signup-actions">
                            <button className="auth-submit-btn" onClick={handlesubmitform}>Create account →</button>
                            <div className="signup-signin-note">
                                Already have an account?
                                <Link to="/auth/hr/login" className="auth-link">Sign in</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}