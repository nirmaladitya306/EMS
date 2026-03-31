import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk.js'
import { HandleGetEmployeeTimelineByHR } from '../../../redux/Thunks/HREmployeesThunk.js'
import { Loading } from '../../../components/common/loading'

// ─── Event style map ──────────────────────────────────────────────────────────
const EVENT_STYLES = {
    HIRED:              { bg: 'bg-green-100',  border: 'border-green-400',  dot: 'bg-green-500',  text: 'text-green-800',  icon: '🎉' },
    PROMOTED:           { bg: 'bg-blue-100',   border: 'border-blue-400',   dot: 'bg-blue-500',   text: 'text-blue-800',   icon: '🚀' },
    DEPARTMENT_CHANGE:  { bg: 'bg-yellow-100', border: 'border-yellow-400', dot: 'bg-yellow-500', text: 'text-yellow-800', icon: '🏢' },
    SALARY_UPDATED:     { bg: 'bg-emerald-100',border: 'border-emerald-400',dot: 'bg-emerald-500',text: 'text-emerald-800',icon: '💰' },
    ROLE_CHANGED:       { bg: 'bg-purple-100', border: 'border-purple-400', dot: 'bg-purple-500', text: 'text-purple-800', icon: '🔄' },
    LEAVE_APPROVED:     { bg: 'bg-teal-100',   border: 'border-teal-400',   dot: 'bg-teal-500',   text: 'text-teal-800',   icon: '✅' },
    DOCUMENT_ADDED:     { bg: 'bg-orange-100', border: 'border-orange-400', dot: 'bg-orange-500', text: 'text-orange-800', icon: '📄' },
    NOTICE_ISSUED:      { bg: 'bg-red-100',    border: 'border-red-400',    dot: 'bg-red-500',    text: 'text-red-800',    icon: '📢' },
    PROFILE_UPDATED:    { bg: 'bg-indigo-100', border: 'border-indigo-400', dot: 'bg-indigo-500', text: 'text-indigo-800', icon: '✏️' },
    TERMINATED:         { bg: 'bg-gray-100',   border: 'border-gray-400',   dot: 'bg-gray-500',   text: 'text-gray-800',   icon: '🔒' },
}

const getStyle = (type) =>
    EVENT_STYLES[type] || { bg: 'bg-blue-100', border: 'border-blue-400', dot: 'bg-blue-500', text: 'text-blue-800', icon: '📌' }

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Timeline event card ──────────────────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
    const s = getStyle(event.type)
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 ${s.border} ${s.bg} shrink-0`}>
                    {s.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
            </div>

            <div className={`mb-6 flex-1 rounded-xl border ${s.border} ${s.bg} px-4 py-3 shadow-sm`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${s.text}`}>
                        {event.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(event.date || event.createdAt)}
                    </span>
                </div>
                {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}
                {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(event.details).map(([k, v]) => (
                            <span key={k} className="text-xs bg-white/70 border border-gray-200 rounded-md px-2 py-0.5 text-gray-600">
                                <span className="font-medium capitalize">{k.replace(/_/g, ' ')}: </span>{String(v)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Placeholder when no employee is selected ─────────────────────────────────
const SelectPrompt = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 gap-3">
        <span className="text-5xl">👤</span>
        <p className="text-lg font-semibold text-gray-500">Select an employee</p>
        <p className="text-sm max-w-xs">
            Choose an employee from the dropdown above to view their career timeline.
        </p>
    </div>
)

// ─── Empty timeline for selected employee ─────────────────────────────────────
const EmptyTimeline = ({ name }) => (
    <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 gap-3">
        <span className="text-5xl">🗓️</span>
        <p className="text-lg font-semibold text-gray-500">No events recorded</p>
        <p className="text-sm max-w-xs">
            {name ? `${name} has` : 'This employee has'} no timeline events yet.
        </p>
    </div>
)

// ─── Main HR timeline page ────────────────────────────────────────────────────
export const EmployeeTimelinePage = () => {
    const dispatch       = useDispatch()
    const employeesState = useSelector(s => s.HREmployeesPageReducer)
    const employees      = employeesState.data || []
    const timeline       = employeesState.employeeTimeline
    const timelineLoading = employeesState.timelineLoading

    const [selectedId,   setSelectedId]   = useState('')
    const [searchFilter, setSearchFilter] = useState('')

    // Load all employees for the picker
    useEffect(() => { dispatch(HandleGetHREmployees({ apiroute: 'GETALL' })) }, [])

    const handleEmployeeChange = (e) => {
        const id = e.target.value
        setSelectedId(id)
        if (id) dispatch(HandleGetEmployeeTimelineByHR(id))
    }

    // Filter employees list in the dropdown
    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase()
        return fullName.includes(searchFilter.toLowerCase()) || emp.email?.toLowerCase().includes(searchFilter.toLowerCase())
    })

    const selectedEmployee = employees.find(e => e._id === selectedId)
    const selectedName     = selectedEmployee
        ? `${selectedEmployee.firstname} ${selectedEmployee.lastname}`
        : null

    const events = timeline?.events || []

    return (
        <div className="employee-timeline-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Employee Timeline</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View the full career journey of any employee
                    </p>
                </div>
                {selectedId && !timelineLoading && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-center">
                        <span className="text-2xl font-bold text-indigo-600">{events.length}</span>
                        <p className="text-xs text-gray-500">Total Events</p>
                    </div>
                )}
            </div>

            {/* Employee picker */}
            <div className="flex flex-wrap gap-3 items-end">

                {/* Search filter for the select */}
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Filter employees
                    </label>
                    <input
                        type="text"
                        placeholder="Type a name or email..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {/* Select dropdown */}
                <div className="flex flex-col gap-1 flex-1 min-w-[240px]">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Select employee
                    </label>
                    <select
                        value={selectedId}
                        onChange={handleEmployeeChange}
                        className="border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    >
                        <option value="">— Choose an employee —</option>
                        {filteredEmployees.map(emp => (
                            <option key={emp._id} value={emp._id}>
                                {emp.firstname} {emp.lastname} · {emp.email}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear button */}
                {selectedId && (
                    <button
                        onClick={() => { setSelectedId(''); setSearchFilter('') }}
                        className="text-sm text-gray-400 hover:text-gray-600 underline mb-1"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Selected employee summary strip */}
            {selectedEmployee && !timelineLoading && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 flex flex-wrap gap-4 items-center">
                    <div>
                        <p className="font-semibold text-blue-800 text-sm">{selectedName}</p>
                        <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
                    </div>
                    {selectedEmployee.department?.name && (
                        <span className="text-xs bg-white border border-blue-200 text-indigo-600 rounded-full px-3 py-1">
                            🏢 {selectedEmployee.department.name}
                        </span>
                    )}
                    {selectedEmployee.role && (
                        <span className="text-xs bg-white border border-blue-200 text-indigo-600 rounded-full px-3 py-1">
                            👤 {selectedEmployee.role}
                        </span>
                    )}
                </div>
            )}

            {/* Timeline content */}
            <div className="flex-1 overflow-auto">
                {!selectedId && <SelectPrompt />}

                {selectedId && timelineLoading && <Loading />}

                {selectedId && !timelineLoading && events.length === 0 && (
                    <EmptyTimeline name={selectedName} />
                )}

                {selectedId && !timelineLoading && events.length > 0 && (
                    <div className="pt-2">
                        {events.map((event, i) => (
                            <TimelineEvent
                                key={event._id || i}
                                event={event}
                                isLast={i === events.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}