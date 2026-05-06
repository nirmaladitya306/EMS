import { KeyDetailBoxContentWrapper } from "../../../components/common/Dashboard/contentwrappers.jsx";
import { SalaryChart } from "../../../components/common/Dashboard/salarychart.jsx";
import { DataTable } from "../../../components/common/Dashboard/datatable.jsx";
import { useEffect } from "react";
import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js";
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../../../components/common/loading.jsx";
import { PageShell, PageHeader } from "../../../components/common/Dashboard/PageShell.jsx";

import employeeImg from "../../../assets/HR-Dashboard/employee-2.png";
import departmentImg from "../../../assets/HR-Dashboard/department.png";
import leaveImg from "../../../assets/HR-Dashboard/leave.png";
import requestImg from "../../../assets/HR-Dashboard/request.png";

// ─── Dashboard-Specific Dark Mode Overrides ───────────────────────────────────
const styles = `
  /* 1. Fix for SVG Charts (Recharts, ApexCharts, etc.) */
  [data-theme='dark'] .recharts-text,
  [data-theme='dark'] text,
  [data-theme='dark'] .apexcharts-text {
      fill: #a1a1aa !important; /* Muted gray for axis labels so they aren't invisible */
  }
  
  /* 2. Chart Grid Lines */
  [data-theme='dark'] .recharts-cartesian-grid line,
  [data-theme='dark'] .apexcharts-gridline {
      stroke: #27272a !important; /* Dark mode grid lines */
  }
  
  /* 3. Chart Hover Tooltips */
  [data-theme='dark'] .recharts-tooltip-wrapper .recharts-default-tooltip,
  [data-theme='dark'] .apexcharts-tooltip,
  [data-theme='dark'] .apexcharts-menu {
      background-color: #18181b !important;
      border: 1px solid #27272a !important;
      color: #fafafa !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.8) !important;
  }
  
  /* 4. Fix inner text of Tooltips */
  [data-theme='dark'] .recharts-tooltip-item,
  [data-theme='dark'] .recharts-tooltip-label,
  [data-theme='dark'] .apexcharts-tooltip-title {
      color: #fafafa !important;
  }

  /* 5. Detail Boxes & Table Container Safeguards */
  [data-theme='dark'] .pg-section > div {
      border-color: #27272a !important;
  }
`;

export const HRDashboardPage = () => {
    const DashboardState = useSelector(
        (state) => state.dashboardreducer
    );

    const dispatch = useDispatch();

    const DataArray = [
        {
            image: employeeImg,
            dataname: "Employees",
            path: "/hr/dashboard/employees"
        },
        {
            image: departmentImg,
            dataname: "Departments",
            path: "/hr/dashboard/departments"
        },
        {
            image: leaveImg,
            dataname: "Leaves",
            path: "/hr/dashboard/leaves"
        },
        {
            image: requestImg,
            dataname: "Requests",
            path: "/hr/dashboard/requests"
        }
    ];

    useEffect(() => {
        dispatch(
            HandleGetDashboard({
                apiroute: "GETDATA"
            })
        );
    }, [dispatch]);

    if (
        DashboardState?.isLoading ||
        !DashboardState?.success ||
        !DashboardState?.data
    ) {
        return <Loading />;
    }

    const safeData = DashboardState.data ?? {};

    return (
        <PageShell>
            <style>{styles}</style>
            
            <PageHeader
                eyebrow="HR Dashboard"
                title="Overview"
                subtitle="Summary of employees, departments, and activity"
            />

            <div className="pg-section" style={{ marginBottom: '24px' }}>
                <KeyDetailBoxContentWrapper
                    imagedataarray={DataArray}
                    data={safeData}
                />
            </div>

            <div className="pg-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SalaryChart balancedata={safeData} />
                    <DataTable noticedata={safeData} />
                </div>
            </div>
        </PageShell>
    );
};