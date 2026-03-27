import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMySalaries } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmt = (amount, currency) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount)

const StatusBadge = ({ status }) => {
    const map = {
        Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        Paid:    'bg-green-100  text-green-800  border-green-300',
        Delayed: 'bg-red-100    text-red-800    border-red-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
}

export const MySalaryPage = () => {
    const dispatch  = useDispatch()
    const state     = useSelector(s => s.EmployeeDashboardReducer)
    const salaries  = state.salaries || []

    useEffect(() => { dispatch(HandleGetMySalaries()) }, [])
    useEffect(() => { if (state.fetchSalaries) dispatch(HandleGetMySalaries()) }, [state.fetchSalaries])

    const totalNet  = salaries.reduce((sum, s) => sum + (s.netpay || 0), 0)
    const paid      = salaries.filter(s => s.status === 'Paid').length
    const pending   = salaries.filter(s => s.status === 'Pending').length
    const delayed   = salaries.filter(s => s.status === 'Delayed').length

    if (state.isLoading && !salaries.length) return <Loading />

    return (
        <div className="my-salary-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div>
                <h1 className="text-3xl font-bold">My Salary</h1>
                <p className="text-sm text-gray-500 mt-1">View your salary records and payment history</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Records', value: salaries.length, color: 'border-gray-200   bg-gray-50'    },
                    { label: 'Paid',          value: paid,            color: 'border-green-200  bg-green-50'   },
                    { label: 'Pending',       value: pending,         color: 'border-yellow-200 bg-yellow-50'  },
                    { label: 'Delayed',       value: delayed,         color: 'border-red-200    bg-red-50'     },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl border p-4 flex flex-col gap-1 ${c.color}`}>
                        <span className="text-2xl font-bold">{c.value}</span>
                        <span className="text-sm text-gray-500">{c.label}</span>
                    </div>
                ))}
            </div>

            {salaries.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4">
                    <p className="text-sm text-gray-500">Total Net Pay (all time)</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">
                        {fmt(totalNet, salaries[0]?.currency)}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span>Basic Pay</span>
                    <span>Bonuses</span>
                    <span>Deductions</span>
                    <span>Net Pay</span>
                    <span>Due Date</span>
                    <span>Status</span>
                </div>

                {salaries.length === 0
                    ? <div className="text-center text-gray-400 py-16">No salary records found.</div>
                    : salaries.map(s => (
                        <div key={s._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <span className="font-medium">{fmt(s.basicpay, s.currency)}</span>
                            <span className="text-green-600">+{fmt(s.bonuses, s.currency)}</span>
                            <span className="text-red-500">-{fmt(s.deductions, s.currency)}</span>
                            <span className="font-bold text-purple-700">{fmt(s.netpay, s.currency)}</span>
                            <span className="text-gray-500 text-xs">{fmtDate(s.duedate)}</span>
                            <StatusBadge status={s.status} />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}