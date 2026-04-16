import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { NavLink, Link } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext.jsx"
import { ChatWidget } from "../common/Chat/ChatWidget.jsx"
import { useSelector } from "react-redux"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  [data-theme='dark'] {
    --side-bg: #09090b; 
    --side-border: #18181b; 
    --side-text-main: #fafafa;
    --side-text-muted: #a1a1aa;
    --side-text-faint: #52525b;
    --side-hover: rgba(255, 255, 255, 0.04);
    --side-active-bg: rgba(99, 102, 241, 0.15);
    --side-active-text: #818cf8;
    --side-toggle-bg: #18181b;
  }

  .hr-sidebar-inner { 
    font-family: 'DM Sans', sans-serif; 
    display: flex; 
    flex-direction: column; 
    height: 100%; 
    background: var(--side-bg, #ffffff); 
    border-right: 1px solid var(--side-border, rgba(0,0,0,0.06)); 
    transition: background 0.2s, border-color 0.2s; 
  }
  
  .hr-sidebar-header { 
    padding: 18px 14px 14px; 
    border-bottom: 1px solid var(--side-border, rgba(0,0,0,0.06)); 
    flex-shrink: 0; 
  }
  
  .hr-sidebar-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  
  .hr-sidebar-logo-mark { 
    width: 30px; height: 30px; 
    background: linear-gradient(135deg, #6366f1, #8b5cf6); 
    border-radius: 7px; display: flex; align-items: center; 
    justify-content: center; font-size: 12px; font-weight: 700; 
    color: white; font-family: 'DM Serif Display', serif; flex-shrink: 0; 
  }
  
  .hr-sidebar-logo-text { 
    font-size: 11px; font-weight: 600; 
    color: var(--side-text-muted, rgba(0,0,0,0.35)); 
    letter-spacing: 0.06em; text-transform: uppercase; transition: color 0.2s; 
  }
  
  .hr-sidebar-scroll { flex: 1; overflow-y: auto; padding: 8px 6px 16px; }
  .hr-sidebar-scroll::-webkit-scrollbar { width: 3px; }
  .hr-sidebar-scroll::-webkit-scrollbar-thumb { background: var(--side-border, rgba(0,0,0,0.08)); border-radius: 99px; }
  
  .hr-nav-section-label { 
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; 
    color: var(--side-text-faint, rgba(0,0,0,0.25)); 
    font-weight: 700; padding: 12px 10px 6px; transition: color 0.2s; 
  }
  
  .hr-nav-link { 
    display: flex; align-items: center; gap: 9px; padding: 8px 12px; 
    border-radius: 8px; text-decoration: none; margin-bottom: 2px; transition: all 0.2s ease; 
  }
  .hr-nav-link:hover { background: var(--side-hover, rgba(0,0,0,0.04)); }
  .hr-nav-link.active { background: var(--side-active-bg, rgba(99,102,241,0.09)); }
  .hr-nav-link.active .hr-nav-label { color: var(--side-active-text, #6366f1); font-weight: 600; }
  .hr-nav-link.active .hr-nav-icon { opacity: 1; filter: brightness(1.2); }
  [data-theme='dark'] .hr-nav-icon { filter: brightness(0.8) contrast(1.2); }
  .hr-nav-icon { width: 16px; height: 16px; object-fit: contain; opacity: 0.7; flex-shrink: 0; transition: opacity 0.2s; }
  .hr-nav-label { font-size: 13px; color: var(--side-text-muted, rgba(0,0,0,0.6)); white-space: nowrap; transition: color 0.2s; }
  
  /* ─── NEW: USER PROFILE STYLES ─── */
  .hr-user-profile {
    display: flex; align-items: center; gap: 10px; padding: 12px 14px;
    border-top: 1px solid var(--side-border, rgba(0,0,0,0.05));
    border-bottom: 1px solid var(--side-border, rgba(0,0,0,0.05));
  }
  .hr-user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--side-active-text, #6366f1); color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 14px; flex-shrink: 0;
  }
  .hr-user-info { display: flex; flex-direction: column; overflow: hidden; }
  .hr-user-name {
    font-size: 13px; font-weight: 600; color: var(--side-text-main, #000);
    white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
  }
  .hr-user-role { font-size: 11px; color: var(--side-text-muted, rgba(0,0,0,0.5)); }

  .hr-sidebar-footer { padding: 12px 14px 16px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }
  .hr-footer-badge { font-size: 10px; color: var(--side-text-faint, rgba(0,0,0,0.25)); letter-spacing: 0.04em; }
  .hr-theme-toggle {
    display: flex; align-items: center; gap: 10px; padding: 8px 12px;
    border-radius: 8px; cursor: pointer; border: none;
    background: var(--side-toggle-bg, rgba(0,0,0,0.03)); width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: var(--side-text-muted, rgba(0,0,0,0.5)); transition: all 0.2s;
  }
  .hr-theme-toggle:hover { background: var(--side-hover, rgba(0,0,0,0.06)); color: var(--side-text-main); }
  .hr-theme-icon { font-size: 14px; }
`

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `hr-nav-link${isActive ? ' active' : ''}`}>
    <img src={icon} className="hr-nav-icon" alt="" />
    <span className="hr-nav-label">{label}</span>
  </NavLink>
)

const I = (name) => `/../../src/assets/HR-Dashboard/${name}`

export function HRdashboardSidebar() {
  const { dark, toggle } = useTheme()

  // ✅ Connect directly to HRReducer
  const hrState = useSelector((state) => state.HRReducer || {});
  
  // ✅ Extract the HR user data
  const HR = hrState.data;

  // ✅ Helper to check if user has permission
  const hasAccess = (requiredPermission) => {
    if (!HR) return false;
    if (HR.role === "HR-Admin") return true; 

    const permissions = HR.rbacRole?.permissions || [];
    return permissions.includes(requiredPermission);
  };

  return (
    <>
      <style>{styles}</style>
      <Sidebar>
        <SidebarContent>
          <div className="hr-sidebar-inner">
            <div className="hr-sidebar-header">
              <Link to="/" className="hr-sidebar-logo">
                <div className="hr-sidebar-logo-mark">EW</div>
                <span className="hr-sidebar-logo-text">HR Portal</span>
              </Link>
            </div>
            
            <div className="hr-sidebar-scroll">
              <p className="hr-nav-section-label">Overview</p>
              <NavItem to="/hr/dashboard/dashboard-data" icon={I("dashboard.png")} label="Dashboard" />

              {(hasAccess('employee.view') || hasAccess('department.view') || hasAccess('hr.view')) && (
                  <p className="hr-nav-section-label">People</p>
              )}
              {hasAccess('employee.view') && <NavItem to="/hr/dashboard/employees" icon={I("employee-2.png")} label="Employees" />}
              {hasAccess('department.view') && <NavItem to="/hr/dashboard/departments" icon={I("department.png")} label="Departments" />}
              {hasAccess('hr.view') && <NavItem to="/hr/dashboard/hr-profiles" icon={I("HR-profiles.png")} label="HR Profiles" />}
              {hasAccess('department.view') && <NavItem to="/hr/dashboard/org-structure" icon={I("department.png")} label="Org Structure" />}
              {hasAccess('employee.view') && <NavItem to="/hr/dashboard/employee-timeline" icon={I("activitylog.png")} label="Employee Timeline" />}

              {(hasAccess('leave.view') || hasAccess('attendance.view') || hasAccess('salary.view')) && (
                  <p className="hr-nav-section-label">Operations</p>
              )}
              {hasAccess('leave.view') && <NavItem to="/hr/dashboard/leaves" icon={I("leave.png")} label="Leaves" />}
              {hasAccess('leave.view') && <NavItem to="/hr/dashboard/requests" icon={I("request.png")} label="Requests" />}
              {hasAccess('attendance.view') && <NavItem to="/hr/dashboard/attendance" icon={I("attendance.png")} label="Attendance" />}
              {hasAccess('salary.view') && <NavItem to="/hr/dashboard/salary" icon={I("salary.png")} label="Salary" />}
              {hasAccess('salary.view') && <NavItem to="/hr/dashboard/payroll-compliance" icon={I("salary.png")} label="Payroll Compliance" />}
              {hasAccess('employee.view') && <NavItem to="/hr/dashboard/notices" icon={I("notice.png")} label="Notices" />}
              {hasAccess('employee.view') && <NavItem to="/hr/dashboard/document-expiry" icon={I("docalert.png")} label="Document Expiry" />}
              {hasAccess('employee.view') && <NavItem to="/hr/dashboard/exit-clearance" icon={I("leave.png")} label="Exit Clearance" />}
              {hasAccess('leave.view') && <NavItem to="/hr/dashboard/leave-recommendation" icon={I("leave.png")} label="Leave Recommendation" />}

              {hasAccess('recruitment.view') && (
                  <>
                      <p className="hr-nav-section-label">Recruitment</p>
                      <NavItem to="/hr/dashboard/recruitment" icon={I("request.png")} label="Job Postings" />
                      <NavItem to="/hr/dashboard/interviews" icon={I("request.png")} label="Interviews" />
                  </>
              )}

              {hasAccess('rbac.view') && (
                  <>
                      <p className="hr-nav-section-label">Security</p>
                      <NavItem to="/hr/dashboard/activity-log" icon={I("activitylog.png")} label="Activity Log" />
                      <NavItem to="/hr/dashboard/security-alerts" icon={I("notice.png")} label="Security Alerts" />
                      <NavItem to="/hr/dashboard/access-control" icon={I("HR-profiles.png")} label="Access Control" />
                      <NavItem to="/hr/dashboard/access-drift" icon={I("request.png")} label="Access Drift" />
                  </>
              )}

              {hasAccess('analytics.view') && (
                  <>
                      <p className="hr-nav-section-label">Analytics</p>
                      <NavItem to="/hr/dashboard/analytics" icon={I("dashboard.png")} label="Analytics" />
                  </>
              )}
            </div>

            {/* ─── NEW: USER PROFILE BADGE ─── */}
            <div className="hr-user-profile">
              <div className="hr-user-avatar">
                {HR?.firstname?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="hr-user-info">
                <span className="hr-user-name">
                  {HR ? `${HR.firstname} ${HR.lastname}` : 'Loading...'}
                </span>
                <span className="hr-user-role">
                  {HR?.role === 'HR-Admin' ? 'Super Admin' : (HR?.rbacRole?.name || 'HR Staff')}
                </span>
              </div>
            </div>

            <div className="hr-sidebar-footer">
              <button className="hr-theme-toggle" onClick={toggle}>
                <span className="hr-theme-icon">{dark ? '☀️' : '🌙'}</span>
                <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <span className="hr-footer-badge">EMS · HR Dashboard</span>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <ChatWidget role="hr" />
    </>
  )
}