import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink, Link } from "react-router-dom"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .hr-sidebar-inner {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #ffffff;
    border-right: 1px solid rgba(0,0,0,0.06);
  }

  .hr-sidebar-header {
    padding: 20px 16px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    flex-shrink: 0;
  }
  .hr-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .hr-sidebar-logo-mark {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    font-family: 'DM Serif Display', serif;
  }

  .hr-sidebar-scroll {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 16px;
  }

  .hr-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 10px;
    text-decoration: none;
    margin: 1px 6px;
  }

  .hr-nav-link.active {
    background: rgba(99,102,241,0.1);
  }

  .hr-nav-label {
    font-size: 13px;
  }
`

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `hr-nav-link${isActive ? ' active' : ''}`}
  >
    <img src={icon} width={18} />
    <span className="hr-nav-label">{label}</span>
  </NavLink>
)

export function HRdashboardSidebar() {
  return (
    <>
      <style>{styles}</style>
      <Sidebar>
        <SidebarContent>
          <div className="hr-sidebar-inner">

            <div className="hr-sidebar-header">
              <Link to="/" className="hr-sidebar-logo">
                <div className="hr-sidebar-logo-mark">EW</div>
              </Link>
            </div>

            <div className="hr-sidebar-scroll">
              <NavItem to="/hr/dashboard/dashboard-data" icon="/../../src/assets/HR-Dashboard/dashboard.png" label="Dashboard" />
              <NavItem to="/hr/dashboard/employees" icon="/../../src/assets/HR-Dashboard/employee-2.png" label="Employees" />
            </div>

          </div>
        </SidebarContent>
      </Sidebar>
    </>
  )
}