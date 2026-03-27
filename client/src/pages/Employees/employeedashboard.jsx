import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { EmployeeSidebar } from "../../components/ui/EmployeeSidebar.jsx"
import { Outlet } from "react-router-dom"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

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
    }, [location.pathname])

    return (
        <div className="employee-dashboard-container flex">
            <div className="EmployeeDashboard-sidebar">
                <SidebarProvider>
                    <EmployeeSidebar />
                    <div className="sidebar-container min-[250px]:absolute md:relative">
                        <SidebarTrigger />
                    </div>
                </SidebarProvider>
            </div>
            <div className="employee-dashboard-content h-screen w-full min-[250px]:mx-1 md:mx-2 flex flex-col">
                <Outlet />
            </div>
        </div>
    )
}