import { KeyDetailBoxContentWrapper } from "../../../components/common/Dashboard/contentwrappers.jsx";
import { SalaryChart } from "../../../components/common/Dashboard/salarychart.jsx";
import { DataTable } from "../../../components/common/Dashboard/datatable.jsx";
import { useEffect } from "react";
import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js";
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../../../components/common/loading.jsx";

// ✅ NEW IMPORT
import { PageShell, PageHeader } from "../../../components/common/Dashboard/PageShell.jsx";

import employeeImg from "../../../assets/HR-Dashboard/employee-2.png";
import departmentImg from "../../../assets/HR-Dashboard/department.png";
import leaveImg from "../../../assets/HR-Dashboard/leave.png";
import requestImg from "../../../assets/HR-Dashboard/request.png";

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
            {/* ✅ NEW HEADER */}
            <PageHeader
                eyebrow="HR Dashboard"
                title="Overview"
                subtitle="Summary of employees, departments, and activity"
            />

            {/* ✅ Wrap sections instead of raw div */}
            <div className="pg-section">
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