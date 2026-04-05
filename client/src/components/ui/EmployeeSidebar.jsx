import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { NavLink, Link } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext.jsx"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .em-sidebar-inner { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; height: 100%; background: var(--ems-sidebar-bg, #ffffff); border-right: 1px solid var(--ems-sidebar-border, rgba(0,0,0,0.06)); transition: background 0.2s, border-color 0.2s; }
  .em-sidebar-header { padding: 18px 14px 14px; border-bottom: 1px solid var(--ems-sidebar-border, rgba(0,0,0,0.06)); flex-shrink: 0; }
  .em-sidebar-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .em-sidebar-logo-mark { width: 30px; height: 30px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; font-family: 'DM Serif Display', serif; flex-shrink: 0; }
  .em-sidebar-logo-text { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.35); letter-spacing: 0.06em; text-transform: uppercase; transition: color 0.2s; }
  .em-sidebar-scroll { flex: 1; overflow-y: auto; padding: 8px 6px 16px; }
  .em-sidebar-scroll::-webkit-scrollbar { width: 3px; }
  .em-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }
  .em-nav-section-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.25); font-weight: 600; padding: 10px 10px 4px; transition: color 0.2s; }
  .em-nav-link { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 8px; text-decoration: none; margin-bottom: 1px; transition: background 0.15s; }
  .em-nav-link:hover { background: rgba(0,0,0,0.04); }
  .em-nav-link.active { background: rgba(139,92,246,0.09); }
  .em-nav-link.active .em-nav-label { color: #8b5cf6; font-weight: 500; }
  .em-nav-link.active .em-nav-icon { opacity: 0.9; }
  .em-nav-icon { width: 16px; height: 16px; object-fit: contain; opacity: 0.6; flex-shrink: 0; }
  .em-nav-label { font-size: 12.5px; color: rgba(0,0,0,0.6); white-space: nowrap; transition: color 0.2s; }
  .em-sidebar-footer { padding: 10px 14px 14px; border-top: 1px solid rgba(0,0,0,0.05); flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
  .em-footer-badge { font-size: 10px; color: rgba(0,0,0,0.25); letter-spacing: 0.04em; }
  .em-theme-toggle {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px;
    border-radius: 8px; cursor: pointer; border: none;
    background: rgba(0,0,0,0.03); width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(0,0,0,0.5); transition: background 0.15s;
  }
  .em-theme-toggle:hover { background: rgba(0,0,0,0.06); }
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
              <NavItem to="/auth/employee/employee-dashboard/overview"             icon={I("dashboard.png")}   label="Overview" />

              <p className="em-nav-section-label">My Records</p>
              <NavItem to="/auth/employee/employee-dashboard/my-leaves"            icon={I("leave.png")}       label="My Leaves" />
              <NavItem to="/auth/employee/employee-dashboard/my-salary"            icon={I("salary4.png")}     label="My Salary" />
              <NavItem to="/auth/employee/employee-dashboard/my-notices"           icon={I("notice.png")}      label="My Notices" />
              <NavItem to="/auth/employee/employee-dashboard/my-attendance"        icon={I("attendance.png")}  label="My Attendance" />
              <NavItem to="/auth/employee/employee-dashboard/my-requests"          icon={I("request.png")}     label="My Requests" />

              <p className="em-nav-section-label">Documents & Activity</p>
              <NavItem to="/auth/employee/employee-dashboard/my-documents"         icon={I("docalert.png")}    label="My Documents" />
              <NavItem to="/auth/employee/employee-dashboard/my-activity"          icon={I("activitylog.png")} label="My Activity" />
              <NavItem to="/auth/employee/employee-dashboard/my-timeline"          icon={I("activitylog.png")} label="My Timeline" />

              <p className="em-nav-section-label">Intelligence</p>
              <NavItem to="/auth/employee/employee-dashboard/leave-recommendation" icon={I("leaverec.png")}    label="Leave Recommendation" />
              <NavItem to="/auth/employee/employee-dashboard/my-analytics"         icon={I("analytics.png")}   label="My Analytics" />

              <p className="em-nav-section-label">Security</p>
              <NavItem to="/auth/employee/employee-dashboard/my-access-drift"      icon={I("activitylog.png")} label="My Access Drift" />
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
    </>
  )
}