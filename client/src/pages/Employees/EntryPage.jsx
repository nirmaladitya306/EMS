import { Link } from "react-router-dom"
import { useState } from "react"

// ─── Inline styles — no extra dependencies needed ────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .entry-root {
    min-height: 100vh;
    background-color: #ffffff;
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

  /* Ambient glow blobs */
  .entry-root::before {
    content: '';
    position: absolute;
    top: -20%;
    left: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .entry-root::after {
    content: '';
    position: absolute;
    bottom: -20%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Top bar */
  .entry-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 40px;
    position: relative;
    z-index: 10;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }
  .entry-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .entry-logo-mark {
    width: 34px;
    height: 34px;
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
  .entry-logo-text {
    font-size: 13px;
    font-weight: 500;
    color: rgba(0,0,0,0.4);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .entry-badge {
    font-size: 11px;
    font-weight: 500;
    color: rgba(99,102,241,0.9);
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    padding: 4px 12px;
    border-radius: 100px;
    letter-spacing: 0.04em;
  }

  /* Main content */
  .entry-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px 60px;
    position: relative;
    z-index: 10;
    gap: 56px;
  }

  /* Headline block */
  .entry-headline {
    text-align: center;
    max-width: 640px;
    animation: fadeUp 0.7s ease both;
  }
  .entry-eyebrow {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(99,102,241,0.8);
    font-weight: 500;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .entry-eyebrow::before,
  .entry-eyebrow::after {
    content: '';
    height: 1px;
    width: 40px;
    background: rgba(99,102,241,0.4);
  }
  .entry-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    color: #0f172a;
    line-height: 1.1;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }
  .entry-title em {
    font-style: italic;
    background: linear-gradient(90deg, #818cf8, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .entry-subtitle {
    font-size: 15px;
    color: rgba(0,0,0,0.45);
    line-height: 1.7;
    font-weight: 300;
    max-width: 480px;
    margin: 0 auto;
  }

  /* Role cards */
  .entry-cards {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    animation: fadeUp 0.7s 0.15s ease both;
  }

  .role-card {
    position: relative;
    width: 280px;
    background: rgba(0,0,0,0.02);
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 20px;
    padding: 32px 28px;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: border-color 0.25s, background 0.25s, transform 0.25s;
    overflow: hidden;
  }
  .role-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .role-card.employee::before {
    background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.15), transparent 70%);
  }
  .role-card.hradmin::before {
    background: radial-gradient(circle at 30% 30%, rgba(139,92,246,0.15), transparent 70%);
  }
  .role-card:hover {
    transform: translateY(-4px);
    border-color: rgba(0,0,0,0.12);
    background: rgba(0,0,0,0.06);
  }
  .role-card:hover::before { opacity: 1; }

  .role-card.employee:hover { border-color: rgba(99,102,241,0.4); }
  .role-card.hradmin:hover  { border-color: rgba(139,92,246,0.4); }

  .role-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  .role-card.employee .role-icon {
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.25);
  }
  .role-card.hradmin .role-icon {
    background: rgba(139,92,246,0.15);
    border: 1px solid rgba(139,92,246,0.25);
  }

  .role-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .role-card.employee .role-label { color: rgba(129,140,248,0.8); }
  .role-card.hradmin .role-label  { color: rgba(167,139,250,0.8); }

  .role-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: #0f172a;
    line-height: 1.2;
    margin: 0;
  }
  .role-desc {
    font-size: 13px;
    color: rgba(0,0,0,0.4);
    line-height: 1.6;
    font-weight: 300;
    flex: 1;
  }

  .role-features {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .role-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(0,0,0,0.45);
  }
  .role-feature-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .role-card.employee .role-feature-dot { background: rgba(99,102,241,0.7); }
  .role-card.hradmin .role-feature-dot  { background: rgba(139,92,246,0.7); }

  .role-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid rgba(0,0,0,0.07);
  }
  .role-cta-text {
    font-size: 13px;
    font-weight: 500;
  }
  .role-card.employee .role-cta-text { color: rgba(129,140,248,0.9); }
  .role-card.hradmin .role-cta-text  { color: rgba(167,139,250,0.9); }

  .role-arrow {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: transform 0.2s;
  }
  .role-card.employee .role-arrow {
    background: rgba(99,102,241,0.15);
    color: rgba(129,140,248,0.9);
  }
  .role-card.hradmin .role-arrow {
    background: rgba(139,92,246,0.15);
    color: rgba(167,139,250,0.9);
  }
  .role-card:hover .role-arrow { transform: translateX(3px); }

  /* Bottom footer line */
  .entry-footer {
    text-align: center;
    padding: 20px;
    font-size: 11px;
    color: rgba(0,0,0,0.2);
    letter-spacing: 0.05em;
    position: relative;
    z-index: 10;
  }

  /* Stats strip */
  .entry-stats {
    display: flex;
    gap: 40px;
    justify-content: center;
    flex-wrap: wrap;
    animation: fadeUp 0.7s 0.28s ease both;
  }
  .stat-item {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .stat-value {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem;
    color: rgba(0,0,0,0.85);
    line-height: 1;
  }
  .stat-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.3);
    font-weight: 500;
  }
  .stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(0,0,0,0.06);
    align-self: center;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 640px) {
    .entry-topbar { padding: 18px 20px; }
    .entry-main { gap: 40px; padding: 24px 16px 48px; }
    .role-card { width: 100%; max-width: 320px; }
    .entry-stats { gap: 24px; }
    .stat-divider { display: none; }
  }
`

export const EntryPage = () => {
    const [hovered, setHovered] = useState(null)

    return (
        <>
            <style>{styles}</style>
            <div className="entry-root">

                {/* Top bar */}
                <div className="entry-topbar">
                    <div className="entry-logo">
                        <div className="entry-logo-mark">EW</div>
                        <span className="entry-logo-text">Employee Management</span>
                    </div>
                    <span className="entry-badge">v2.0 · Secure Portal</span>
                </div>

                {/* Main content */}
                <main className="entry-main">

                    {/* Headline */}
                    <div className="entry-headline">
                        <div className="entry-eyebrow">Employee Management System</div>
                        <h1 className="entry-title">
                            One platform for your <em>entire </em> workforce
                        </h1>
                        <p className="entry-subtitle">
                            Streamline HR operations, track employee lifecycle, and surface intelligent insights — all in one place.
                        </p>
                    </div>

                    {/* Role cards */}
                    <div className="entry-cards">

                        {/* Employee card */}
                        <Link
                            to="/auth/employee/login"
                            className="role-card employee"
                            onMouseEnter={() => setHovered('employee')}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="role-icon">👤</div>
                            <div>
                                <p className="role-label">Sign in as</p>
                                <h2 className="role-title">Employee</h2>
                            </div>
                            <p className="role-desc">
                                Access your personal portal — leaves, salary, notices, attendance, and more.
                            </p>
                            
                            <div className="role-cta">
                                <span className="role-cta-text">Go to Employee Login</span>
                                <span className="role-arrow">→</span>
                            </div>
                        </Link>

                        {/* HR Admin card */}
                        <Link
                            to="/auth/hr/signup"
                            className="role-card hradmin"
                            onMouseEnter={() => setHovered('hr')}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="role-icon">🏢</div>
                            <div>
                                <p className="role-label">Sign in as</p>
                                <h2 className="role-title">HR Admin</h2>
                            </div>
                            <p className="role-desc">
                                Manage the full employee lifecycle, payroll, recruitment, and compliance.
                            </p>
                            
                            <div className="role-cta">
                                <span className="role-cta-text">Go to HR Portal</span>
                                <span className="role-arrow">→</span>
                            </div>
                        </Link>

                    </div>

                    {/* Stats strip */}
                    <div className="entry-stats">
                        {[
                            { value: '25+', label: 'Features' },
                            null,
                            { value: '2', label: 'User Roles' },
                            null,
                            { value: '100%', label: 'Secure' },
                            null,
                            { value: 'Real-time', label: 'Analytics' },
                        ].map((item, i) =>
                            item === null
                                ? <div key={i} className="stat-divider" />
                                : (
                                    <div key={i} className="stat-item">
                                        <span className="stat-value">{item.value}</span>
                                        <span className="stat-label">{item.label}</span>
                                    </div>
                                )
                        )}
                    </div>

                </main>

                {/* Footer */}
                <footer className="entry-footer">
                    Enterprise Workforce Management System.
                </footer>

            </div>
        </>
    )
}