import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavLink } from "react-router-dom";

export function HRdashboardSidebar() {
  const linkClass = ({ isActive }) =>
    isActive ? "bg-blue-200 rounded-lg" : "";

  const itemClass = "flex gap-4 hover:bg-blue-200 rounded-lg";

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3 p-2">

              {/* Dashboard */}
              <NavLink to="/hr/dashboard/dashboard-data" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/dashboard.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Dashboard</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Employees */}
              <NavLink to="/hr/dashboard/employees" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/employee-2.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Employees</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Departments */}
              <NavLink to="/hr/dashboard/departments" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/department.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Departments</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Document Alerts */}
              <NavLink to="/hr/dashboard/documents" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/docalert.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Document Alerts</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Leave Engine */}
              <NavLink to="/hr/dashboard/leave-recommendation" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/leaverec.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Leave Engine</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Activity Log */}
              <NavLink to="/hr/dashboard/activity-log" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/activitylog.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Activity Log</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Salary */}
              <NavLink to="/hr/dashboard/salary" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/salary4.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Salary</button>
                </SidebarMenuItem>
              </NavLink>

<NavLink to="/hr/dashboard/payroll-compliance" className={linkClass}>
  <SidebarMenuItem className={itemClass}>
    <img src="/../../src/assets/HR-Dashboard/Salary.png" className="w-7 ms-2 my-1" />
    <button className="text-[16px]">Payroll Compliance</button>
  </SidebarMenuItem>
</NavLink>

              {/* Access Drift */}
<NavLink to="/hr/dashboard/access-drift" className={linkClass}>
  <SidebarMenuItem className={itemClass}>
    <img src="/../../src/assets/HR-Dashboard/accessdrift.png" className="w-7 ms-2 my-1" />
    <button className="text-[16px]">Access Drift</button>
  </SidebarMenuItem>
</NavLink>

              {/* Issue Notices */}
              <NavLink to="/hr/dashboard/notices" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/notice.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Issue Notices</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Leaves */}
              <NavLink to="/hr/dashboard/leaves" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/leave.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Leaves</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Attendance */}
              <NavLink to="/hr/dashboard/attendance" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/attendance.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Attendances</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Recruitment */}
              <NavLink to="/hr/dashboard/recruitment" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/recruitment.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Recruitment</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Interview Insights */}
              <NavLink to="/hr/dashboard/interview-insights" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/interview-insights.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Interview Insights</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Requests */}
              <NavLink to="/hr/dashboard/requests" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/request.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Requests</button>
                </SidebarMenuItem>
              </NavLink>

              {/* HR Profiles */}
              <NavLink to="/hr/dashboard/hr-profiles" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/HR-profiles.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">HR Profiles</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Employee Timeline */}
              <NavLink to="/hr/dashboard/employee-timeline" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/timeline.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Employee Timeline</button>
                </SidebarMenuItem>
              </NavLink>

              <NavLink to="/hr/dashboard/exit-clearance" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/exit-clearance.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Exit Clearance</button>
                </SidebarMenuItem>
              </NavLink>

              {/* Analytics */}
              <NavLink to="/hr/dashboard/analytics" className={linkClass}>
                <SidebarMenuItem className={itemClass}>
                  <img src="/../../src/assets/HR-Dashboard/analytics.png" className="w-7 ms-2 my-1" />
                  <button className="text-[16px]">Analytics</button>
                </SidebarMenuItem>
              </NavLink>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}