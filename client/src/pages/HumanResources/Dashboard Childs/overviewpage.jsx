import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetEmployeeProfile } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const InfoCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        <span className="text-lg font-bold text-gray-800">{value || '—'}</span>
    </div>
)

const StatCard = ({ label, count, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

export const EmployeeOverviewPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.EmployeeDashboardReducer)
    const profile  = state.profile

    useEffect(() => { dispatch(HandleGetEmployeeProfile()) }, [])

    if (state.isLoading && !profile) return <Loading />

    return (
        <div className="overview-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {profile?.firstname?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome, {profile?.firstname} {profile?.lastname}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
                </div>
            </div>

            {/* Profile details */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Profile Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoCard label="First Name"     value={profile?.firstname}             color="border-gray-200 bg-gray-50" />
                    <InfoCard label="Last Name"      value={profile?.lastname}              color="border-gray-200 bg-gray-50" />
                    <InfoCard label="Email"          value={profile?.email}                 color="border-gray-200 bg-gray-50" />
                    <InfoCard label="Contact"        value={profile?.contactnumber}         color="border-gray-200 bg-gray-50" />
                    <InfoCard label="Department"     value={profile?.department?.name}      color="border-purple-100 bg-purple-50" />
                    <InfoCard label="Role"           value={profile?.role}                  color="border-purple-100 bg-purple-50" />
                </div>
            </div>

            {/* Quick stats */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Quick Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Salary Records"   count={profile?.salary?.length        || 0} color="border-blue-200   bg-blue-50"   />
                    <StatCard label="Leave Requests"   count={profile?.leaverequest?.length  || 0} color="border-yellow-200 bg-yellow-50" />
                    <StatCard label="Notices"          count={profile?.notice?.length        || 0} color="border-orange-200 bg-orange-50" />
                    <StatCard label="Requests"         count={profile?.generaterequest?.length || 0} color="border-green-200  bg-green-50"  />
                </div>
            </div>

            {/* Account status */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Account Status</h2>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 w-fit">
                    <div className={`w-3 h-3 rounded-full ${profile?.isverified ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className="text-sm font-medium text-gray-700">
                        {profile?.isverified ? 'Email Verified' : 'Email Not Verified'}
                    </span>
                </div>
            </div>

        </div>
    )
}