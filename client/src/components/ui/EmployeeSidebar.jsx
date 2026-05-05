import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { NavLink, Link } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext.jsx"
import { ChatWidget } from "../common/Chat/ChatWidget.jsx"

import dashboardImg from "../../assets/HR-Dashboard/dashboard.png";
import leaveImg from "../../assets/HR-Dashboard/leave.png";
import salary4Img from "../../assets/HR-Dashboard/salary4.png";
import noticeImg from "../../assets/HR-Dashboard/notice.png";
import attendanceImg from "../../assets/HR-Dashboard/attendance.png";
import requestImg from "../../assets/HR-Dashboard/request.png";
import docAlertImg from "../../assets/HR-Dashboard/docalert.png";
import activityLogImg from "../../assets/HR-Dashboard/activitylog.png";
import leaveRecImg from "../../assets/HR-Dashboard/leaverec.png";
import analyticsImg from "../../assets/HR-Dashboard/analytics.png";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --side-bg: #09090b; /* Zinc 950 */
    --side-border: #18181b; /* Zinc 900 */
    --side-text-main: #fafafa;
    --side-text-muted: #a1a1aa;
    --side-text-faint: #52525b;
    --side-hover: rgba(255, 255, 255, 0.04);
    --side-active-bg: rgba(139, 92, 246, 0.15);
    --side-active-text: #a78bfa;
    --side-toggle-bg: #18181b;
  }

  /* ═══════════════════════════════════════════════════════
     SIDEBAR TRIGGER ADJUSTMENT (Moves button to top)
  ═══════════════════════════════════════════════════════ */
  .sidebar-container {
    align-items: flex-start !important;
    padding-top: 14px !important;
    /* Ensure it stays at the top if the shell is absolute */
    top: 0;
  }

  .em-sidebar-inner { 
    font-family: 'DM Sans', sans-serif; 
    display: flex; 
    flex-direction: column; 
    height: 100%; 
    background: var(--side-bg, #ffffff); 
    border-right: 1px solid var(--side-border, rgba(0,0,0,0.06)); 
    transition: background 0.2s, border-color 0.2s; 
  }
  
  .em-sidebar-header { 
    padding: 18px 14px 14px; 
    border-bottom: 1px solid var(--side-border, rgba(0,0,0,0.06)); 
    flex-shrink: 0; 
  }
  
  .em-sidebar-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  
  .em-sidebar-logo-mark { 
    width: 30px; height: 30px; 
    background: linear-gradient(135deg, #8b5cf6, #6366f1); 
    border-radius: 7px; display: flex; align-items: center; 
    justify-content: center; font-size: 12px; font-weight: 700; 
    color: white; font-family: 'DM Serif Display', serif; flex-shrink: 0; 
  }
  
  .em-sidebar-logo-text { 
    font-size: 11px; font-weight: 600; 
    color: var(--side-text-muted, rgba(0,0,0,0.35)); 
    letter-spacing: 0.06em; text-transform: uppercase; transition: color 0.2s; 
  }
  
  .em-sidebar-scroll { flex: 1; overflow-y: auto; padding: 8px 6px 16px; }
  .em-sidebar-scroll::-webkit-scrollbar { width: 3px; }
  .em-sidebar-scroll::-webkit-scrollbar-thumb { background: var(--side-border, rgba(0,0,0,0.08)); border-radius: 99px; }
  
  .em-nav-section-label { 
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; 
    color: var(--side-text-faint, rgba(0,0,0,0.25)); 
    font-weight: 700; padding: 12px 10px 6px; transition: color 0.2s; 
  }
  
  .em-nav-link { 
    display: flex; align-items: center; gap: 9px; padding: 8px 12px; 
    border-radius: 8px; text-decoration: none; margin-bottom: 2px; 
    transition: all 0.2s ease; 
  }
  
  .em-nav-link:hover { background: var(--side-hover, rgba(0,0,0,0.04)); }
  
  .em-nav-link.active { 
    background: var(--side-active-bg, rgba(139,92,246,0.09)); 
  }
  
  .em-nav-link.active .em-nav-label { 
    color: var(--side-active-text, #8b5cf6); 
    font-weight: 600; 
  }
  
  .em-nav-link.active .em-nav-icon { 
    opacity: 1; 
    filter: brightness(1.2); 
  }

  [data-theme='dark'] .em-nav-icon {
    filter: brightness(0.8) contrast(1.2);
  }
  
  .em-nav-icon { width: 16px; height: 16px; object-fit: contain; opacity: 0.7; flex-shrink: 0; transition: opacity 0.2s; }
  
  .em-nav-label { 
    font-size: 13px; 
    color: var(--side-text-muted, rgba(0,0,0,0.6)); 
    white-space: nowrap; transition: color 0.2s; 
  }
  
  .em-sidebar-footer { 
    padding: 12px 14px 16px; 
    border-top: 1px solid var(--side-border, rgba(0,0,0,0.05)); 
    flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; 
  }
  
  .em-footer-badge { font-size: 10px; color: var(--side-text-faint, rgba(0,0,0,0.25)); letter-spacing: 0.04em; }
  
  .em-theme-toggle {
    display: flex; align-items: center; gap: 10px; padding: 8px 12px;
    border-radius: 8px; cursor: pointer; border: none;
    background: var(--side-toggle-bg, rgba(0,0,0,0.03)); 
    width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: var(--side-text-muted, rgba(0,0,0,0.5)); transition: all 0.2s;
  }
  
  .em-theme-toggle:hover { background: var(--side-hover, rgba(0,0,0,0.06)); color: var(--side-text-main); }
  .em-theme-icon { font-size: 14px; }
`

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `em-nav-link${isActive ? ' active' : ''}`}>
    <img src={icon} className="em-nav-icon" alt="" />
    <span className="em-nav-label">{label}</span>
  </NavLink>
)

const I = (name) => `/../../src/assets/HR-Dashboard/${name}`

export function EmployeeSidebar() {
  const { dark, toggle } = useTheme()

  return (
    <>
      <style>{styles}</style>
      <Sidebar>
        <SidebarContent>
          <div className="em-sidebar-inner">
            <div className="em-sidebar-header">
              <Link to="/" className="em-sidebar-logo">
                <div className="em-sidebar-logo-mark">EW</div>
                <span className="em-sidebar-logo-text">My Portal</span>
              </Link>
            </div>
            <div className="em-sidebar-scroll">
              <p className="em-nav-section-label">Overview</p>
              <NavItem to="/auth/employee/employee-dashboard/overview" icon={dashboardImg} label="Overview" />

              <p className="em-nav-section-label">My Records</p>
              <NavItem to="/auth/employee/employee-dashboard/my-leaves" icon={leaveImg} label="My Leaves" />
              <NavItem to="/auth/employee/employee-dashboard/my-salary" icon={salary4Img} label="My Salary" />
              <NavItem to="/auth/employee/employee-dashboard/my-notices" icon={noticeImg} label="My Notices" />
              <NavItem to="/auth/employee/employee-dashboard/my-attendance" icon={attendanceImg} label="My Attendance" />
              <NavItem to="/auth/employee/employee-dashboard/my-requests" icon={requestImg} label="My Requests" />

              <p className="em-nav-section-label">Documents & Activity</p>
              <NavItem to="/auth/employee/employee-dashboard/my-documents" icon={docAlertImg} label="My Documents" />
              <NavItem to="/auth/employee/employee-dashboard/my-activity" icon={activityLogImg} label="My Activity" />
              <NavItem to="/auth/employee/employee-dashboard/my-timeline" icon={activityLogImg} label="My Timeline" />

              <p className="em-nav-section-label">Intelligence</p>
              <NavItem to="/auth/employee/employee-dashboard/leave-recommendation" icon={leaveRecImg} label="Leave Recommendation" />
              <NavItem to="/auth/employee/employee-dashboard/my-analytics" icon={analyticsImg} label="My Analytics" />

              <p className="em-nav-section-label">Security</p>
              <NavItem to="/auth/employee/employee-dashboard/my-access-drift" icon={activityLogImg} label="My Access Drift" />
            </div>
            <div className="em-sidebar-footer">
              <button className="em-theme-toggle" onClick={toggle}>
                <span className="em-theme-icon">{dark ? '☀️' : '🌙'}</span>
                <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <span className="em-footer-badge">Enterprise Workforce · Employee</span>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <ChatWidget role="employee" />
    </>
  )
}