import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { HRdashboardSidebar } from "../../components/ui/HRsidebar.jsx"
import { Outlet } from "react-router-dom"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

const styles = `
  /* ═══════════════════════════════════════════════════════
     DASHBOARD LAYOUT DARK MODE
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] .HR-dashboard-container {
    background-color: #09090b; /* Zinc-950 */
    color: #fafafa;
  }

  [data-theme='dark'] .sidebar-container {
    background-color: transparent;
  }

  /* Ensure the Sidebar Trigger (the hamburger icon) is visible */
  [data-theme='dark'] button[data-sidebar="trigger"] {
    color: #fafafa !important;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid #27272a;
  }

  [data-theme='dark'] button[data-sidebar="trigger"]:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`

export const HRDashbaord = () => {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (location.pathname === "/hr/dashboard" || location.pathname === "/hr/dashboard/") {
            navigate("/hr/dashboard/dashboard-data", { replace: true })
        }
    }, [location.pathname, navigate])

    return (
        <>
            <style>{styles}</style>
            <div className="HR-dashboard-container flex min-h-screen">
                <div className="HRDashboard-sidebar">
                    <SidebarProvider>
                        <HRdashboardSidebar />
                        <div className="sidebar-container min-[250px]:absolute md:relative z-50">
                            <SidebarTrigger />
                        </div>
                    </SidebarProvider>
                </div>
                
                {/* Main content area */}
                <div className="HRdashboard-container h-screen w-full min-[250px]:mx-1 md:mx-2 flex flex-col overflow-hidden">
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', paddingBottom: '20px' }}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}