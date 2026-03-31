import {
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar"
import { NavLink, Link } from "react-router-dom"

const styles = `
  .em-sidebar-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #ffffff;
  }

  .em-nav-link {
    padding: 8px 12px;
    border-radius: 10px;
  }

  .em-nav-link.active {
    background: rgba(139,92,246,0.1);
  }
`

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `em-nav-link${isActive ? ' active' : ''}`}
    >
        <img src={icon} width={18} />
        {label}
    </NavLink>
)

export function EmployeeSidebar() {
    return (
        <>
            <style>{styles}</style>
            <Sidebar>
                <SidebarContent>
                    <div className="em-sidebar-inner">

                        <Link to="/">EW</Link>

                        <NavItem to="/auth/employee/employee-dashboard/overview" icon="/../../src/assets/HR-Dashboard/dashboard.png" label="Overview" />

                    </div>
                </SidebarContent>
            </Sidebar>
        </>
    )
}