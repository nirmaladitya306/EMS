import { KeyDetailBoxContentWrapper } from "../../../components/common/Dashboard/contentwrappers.jsx";
import { SalaryChart } from "../../../components/common/Dashboard/salarychart.jsx";
import { DataTable } from "../../../components/common/Dashboard/datatable.jsx";
import { useEffect } from "react";
import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js";
import { useDispatch, useSelector } from "react-redux";
import { Loading } from "../../../components/common/loading.jsx";

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
            dataname: "employees",
            path: "/hr/dashboard/employees"
        },
        {
            image: departmentImg,
            dataname: "departments",
            path: "/hr/dashboard/departments"
        },
        {
            image: leaveImg,
            dataname: "leaves",
            path: "/hr/dashboard/leaves"
        },
        {
            image: requestImg,
            dataname: "requests",
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

    // ✅ keep showing loading until real data exists
    if (
        DashboardState?.isLoading ||
        !DashboardState?.success ||
        !DashboardState?.data
    ) {
        return <Loading />;
    }

    const safeData = DashboardState.data ?? {};

    return (
        <div className="w-full h-full">
            <KeyDetailBoxContentWrapper
                imagedataarray={DataArray}
                data={safeData}
            />

            <div className="salary-notices-container h-3/4 grid min-[250px]:grid-cols-1 lg:grid-cols-2 min-[250px]:gap-3 xl:gap-3">
                <SalaryChart
                    balancedata={safeData}
                />

                <DataTable
                    noticedata={safeData}
                />
            </div>
        </div>
    );
};