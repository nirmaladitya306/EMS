import { KeyDetailBoxContentWrapper } from "../../../components/common/Dashboard/contentwrappers.jsx"
import { SalaryChart } from "../../../components/common/Dashboard/salarychart.jsx"
import { DataTable } from "../../../components/common/Dashboard/datatable.jsx"
import { useEffect } from "react"
import { HandleGetDashboard } from "../../../redux/Thunks/DashboardThunk.js"
import { useDispatch, useSelector } from "react-redux"
import { Loading } from "../../../components/common/loading.jsx"
import employeeImg from "../../../assets/HR-Dashboard/employee-2.png"
import departmentImg from "../../../assets/HR-Dashboard/department.png"
import leaveImg from "../../../assets/HR-Dashboard/leave.png"
import requestImg from "../../../assets/HR-Dashboard/request.png"

export const HRDashboardPage = () => {
    const DashboardState = useSelector((state) => state.dashboardreducer)
    const dispatch = useDispatch()
    const DataArray = [
        {
            image: employeeImg,
            dataname: "employees",
            path: "/HR/dashboard/employees"
        },
        {
            image: departmentImg,
            dataname: "departments",
            path: "/HR/dashboard/departments",
        },
        {
            image: leaveImg,
            dataname: "leaves",
            path: "/HR/dashboard/leaves"
        },
        {
            image: requestImg,
            dataname: "requestes",
            path: "/HR/dashboard/requestes"
        }
    ]

    useEffect(() => {
        dispatch(HandleGetDashboard({ apiroute: "GETDATA" }))
    },[])

    if (DashboardState.isLoading) { 
        return (
            <Loading />
        )
    }


    return (
        <>
            <KeyDetailBoxContentWrapper imagedataarray={DataArray} data={DashboardState.data} />
            <div className="salary-notices-container h-3/4 grid min-[250px]:grid-cols-1 lg:grid-cols-2 min-[250px]:gap-3 xl:gap-3">
                <SalaryChart balancedata={DashboardState.data} />
                <DataTable noticedata={DashboardState.data} />
            </div>
        </>
    )
}