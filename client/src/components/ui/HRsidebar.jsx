import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { NavLink, Link } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext.jsx"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .hr-sidebar-inner { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; height: 100%; background: var(--ems-sidebar-bg, #ffffff); border-right: 1px solid var(--ems-sidebar-border, rgba(0,0,0,0.06)); transition: background 0.2s, border-color 0.2s; }
  .hr-sidebar-header { padding: 18px 14px 14px; border-bottom: 1px solid var(--ems-sidebar-border, rgba(0,0,0,0.06)); flex-shrink: 0; }
  .hr-sidebar-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
  .hr-sidebar-logo-mark { width: 30px; height: 30px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; font-family: 'DM Serif Display', serif; flex-shrink: 0; }
  .hr-sidebar-logo-text { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.35); letter-spacing: 0.06em; text-transform: uppercase; transition: color 0.2s; }
  .hr-sidebar-scroll { flex: 1; overflow-y: auto; padding: 8px 6px 16px; }
  .hr-sidebar-scroll::-webkit-scrollbar { width: 3px; }
  .hr-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }
  .hr-nav-section-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(0,0,0,0.25); font-weight: 600; padding: 10px 10px 4px; transition: color 0.2s; }
  .hr-nav-link { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 8px; text-decoration: none; margin-bottom: 1px; transition: background 0.15s; }
  .hr-nav-link:hover { background: rgba(0,0,0,0.04); }
  .hr-nav-link.active { background: rgba(99,102,241,0.09); }
  .hr-nav-link.active .hr-nav-label { color: #6366f1; font-weight: 500; }
  .hr-nav-link.active .hr-nav-icon { opacity: 0.9; }
  .hr-nav-icon { width: 16px; height: 16px; object-fit: contain; opacity: 0.6; flex-shrink: 0; }
  .hr-nav-label { font-size: 12.5px; color: rgba(0,0,0,0.6); white-space: nowrap; transition: color 0.2s; }
  .hr-sidebar-footer { padding: 10px 14px 14px; border-top: 1px solid rgba(0,0,0,0.05); flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
  .hr-footer-badge { font-size: 10px; color: rgba(0,0,0,0.25); letter-spacing: 0.04em; }
  .hr-theme-toggle {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px;
    border-radius: 8px; cursor: pointer; border: none;
    background: rgba(0,0,0,0.03); width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(0,0,0,0.5); transition: background 0.15s;
  }
  .hr-theme-toggle:hover { background: rgba(0,0,0,0.06); }
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
              <NavItem to="/hr/dashboard/dashboard-data"        icon={I("dashboard.png")}          label="Dashboard" />

              <p className="hr-nav-section-label">People</p>
              <NavItem to="/hr/dashboard/employees"             icon={I("employee-2.png")}          label="Employees" />
              <NavItem to="/hr/dashboard/departments"           icon={I("department.png")}          label="Departments" />
              <NavItem to="/hr/dashboard/hr-profiles"           icon={I("HR-profiles.png")}         label="HR Profiles" />
              <NavItem to="/hr/dashboard/org-structure"         icon={I("department.png")}          label="Org Structure" />
              <NavItem to="/hr/dashboard/employee-timeline"     icon={I("activitylog.png")}         label="Employee Timeline" />

              <p className="hr-nav-section-label">Operations</p>
              <NavItem to="/hr/dashboard/leaves"                icon={I("leave.png")}               label="Leaves" />
              <NavItem to="/hr/dashboard/requests"              icon={I("request.png")}             label="Requests" />
              <NavItem to="/hr/dashboard/attendance"            icon={I("attendance.png")}          label="Attendance" />
              <NavItem to="/hr/dashboard/salary"                icon={I("salary.png")}              label="Salary" />
              <NavItem to="/hr/dashboard/notices"               icon={I("notice.png")}              label="Notices" />
              <NavItem to="/hr/dashboard/document-expiry"       icon={I("docalert.png")}            label="Document Expiry" />
              <NavItem to="/hr/dashboard/exit-clearance"        icon={I("leave.png")}               label="Exit Clearance" />
              <NavItem to="/hr/dashboard/leave-recommendation"  icon={I("leave.png")}               label="Leave Recommendation" />
              <NavItem to="/hr/dashboard/payroll-compliance"    icon={I("salary.png")}              label="Payroll Compliance" />

              <p className="hr-nav-section-label">Recruitment</p>
              <NavItem to="/hr/dashboard/recruitment"           icon={I("request.png")}             label="Job Postings" />
              <NavItem to="/hr/dashboard/interviews"            icon={I("request.png")}             label="Interviews" />

              <p className="hr-nav-section-label">Security</p>
              <NavItem to="/hr/dashboard/activity-log"          icon={I("activitylog.png")}         label="Activity Log" />
              <NavItem to="/hr/dashboard/access-control"        icon={I("HR-profiles.png")}         label="Access Control" />
              <NavItem to="/hr/dashboard/access-drift"          icon={I("HR-profiles.png")}         label="Access Drift" />

              <p className="hr-nav-section-label">Analytics</p>
              <NavItem to="/hr/dashboard/analytics"             icon={I("dashboard.png")}           label="Analytics" />
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
    </>
  )
}