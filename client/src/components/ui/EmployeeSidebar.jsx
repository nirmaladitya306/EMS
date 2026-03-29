import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"

export function EmployeeSidebar() {
    const linkClass = ({ isActive }) => isActive ? "bg-purple-200 rounded-lg" : ""
    const itemClass = "flex gap-4 hover:bg-purple-200 rounded-lg"

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3 p-2">

                            <NavLink to="/auth/employee/employee-dashboard/overview" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/dashboard.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">Overview</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-leaves" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/leave.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Leaves</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-salary" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/salary4.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Salary</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-notices" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/notice.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Notices</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-attendance" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/attendance.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Attendance</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-requests" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/request.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Requests</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-documents" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/docalert.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Documents</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-activity" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/activitylog.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Activity</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/leave-recommendation" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/leaverec.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">Leave Recommendation</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-timeline" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/emptimeline.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Timeline</button>
                                </SidebarMenuItem>
                            </NavLink>

                            <NavLink to="/auth/employee/employee-dashboard/my-analytics" className={linkClass}>
                                <SidebarMenuItem className={itemClass}>
                                    <img src="/../../src/assets/HR-Dashboard/activitylog.png" className="w-7 ms-2 my-1" alt="" />
                                    <button className="text-[16px]">My Analytics</button>
                                </SidebarMenuItem>
                            </NavLink>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}