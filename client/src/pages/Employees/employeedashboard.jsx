import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeSidebar } from "../../components/ui/EmployeeSidebar.jsx"
import { Outlet, useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  .dash-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    height: 48px;
    border-bottom: 1px solid var(--dash-border, rgba(0,0,0,0.06));
    background: var(--dash-topbar-bg, #ffffff);
    flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .dash-breadcrumb {
    font-size: 12px;
    color: var(--dash-text-muted, rgba(0,0,0,0.35));
    letter-spacing: 0.03em;
    text-transform: capitalize;
  }
  .dash-breadcrumb strong { color: var(--dash-text-main, rgba(0,0,0,0.65)); font-weight: 500; }
  .dash-spacer { flex: 1; }
  .dash-role-badge {
    font-size: 10px;
    font-weight: 500;
    color: rgba(139,92,241,0.9);
    background: rgba(139,92,241,0.08);
    border: 1px solid rgba(139,92,241,0.18);
    padding: 3px 10px;
    border-radius: 100px;
    letter-spacing: 0.04em;
  }

  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --dash-bg: #09090b;
    --dash-topbar-bg: #09090b;
    --dash-border: #27272a;
    --dash-text-main: #fafafa;
    --dash-text-muted: #a1a1aa;
  }

  [data-theme='dark'] .employee-dashboard-container {
    background-color: var(--dash-bg);
  }

  /* Ensure Sidebar Trigger is visible */
  [data-theme='dark'] button[data-sidebar="trigger"] {
    color: #fafafa !important;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--dash-border);
  }
`

export const EmployeeDashboard = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (
            location.pathname === "/auth/employee/employee-dashboard" ||
            location.pathname === "/auth/employee/employee-dashboard/"
        ) {
            navigate("/auth/employee/employee-dashboard/overview", { replace: true })
        }
    }, [location.pathname, navigate])

    const segment = location.pathname.split('/').filter(Boolean).pop() || 'overview'
    const label   = segment.replace(/-/g, ' ')

    return (
        <>
            <style>{styles}</style>
            <div className="employee-dashboard-container flex" style={{ height: '100vh', overflow: 'hidden' }}>
                <div className="EmployeeDashboard-sidebar" style={{ flexShrink: 0 }}>
                    <SidebarProvider>
                        <EmployeeSidebar />
                        {/* Container for the trigger button */}
                        <div className="sidebar-container min-[250px]:absolute md:relative z-50" style={{ display: 'flex', alignItems: 'center' }}>
                            <SidebarTrigger />
                        </div>
                    </SidebarProvider>
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {/* Topbar */}
                    <div className="dash-topbar">
                        <span className="dash-breadcrumb">My Portal &rsaquo; <strong>{label}</strong></span>
                        <div className="dash-spacer" />
                        <span className="dash-role-badge">Employee</span>
                    </div>

                    {/* Content area where pages load */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}