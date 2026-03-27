import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllHRProfiles, HandleDeleteHRProfile } from '../../../redux/Thunks/HRProfileThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const Badge = ({ verified }) => verified
    ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300">Verified</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-red-100   text-red-800   border-red-300">Unverified</span>

const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

const DetailDialog = ({ open, hr, onClose }) => {
    if (!open || !hr) return null
    const row = (label, value) => (
        <div className="flex justify-between text-sm py-1 border-b last:border-0">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="text-gray-800">{value}</span>
        </div>
    )
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-1">{hr.firstname} {hr.lastname}</h2>
                <p className="text-sm text-gray-400 mb-4">{hr.role}</p>
                <div className="flex flex-col gap-1 mb-5">
                    {row('Email',          hr.email)}
                    {row('Contact',        hr.contactnumber)}
                    {row('Department',     hr.department?.name || '—')}
                    {row('Last Login',     fmtDate(hr.lastlogin))}
                    {row('Verified',       hr.isverified ? 'Yes' : 'No')}
                    {row('Member Since',   fmtDate(hr.createdAt))}
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    )
}

export const HRProfilePage = () => {
    const dispatch   = useDispatch()
    const state      = useSelector(s => s.HRProfileReducer)
    const currentHR  = useSelector(s => s.HRReducer)
    const currentID  = currentHR?.data?.HRid || currentHR?.data?.data?._id || ''

    const [detail, setDetail] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => { dispatch(HandleGetAllHRProfiles()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllHRProfiles()) }, [state.fetchData])

    const handleDelete = (HRID) => {
        if (HRID === currentID) return alert('You cannot delete your own profile.')
        if (window.confirm('Delete this HR profile?')) dispatch(HandleDeleteHRProfile({ HRID }))
    }

    const filtered = (state.data || []).filter(h =>
        `${h.firstname} ${h.lastname} ${h.email}`.toLowerCase().includes(search.toLowerCase())
    )

    const total    = state.data?.length || 0
    const verified = state.data?.filter(h => h.isverified).length  || 0
    const admins   = state.data?.filter(h => h.role === 'HR-Admin').length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <div className="hrprofile-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div>
                <h1 className="text-3xl font-bold">HR Profiles</h1>
                <p className="text-sm text-gray-500 mt-1">View and manage all HR members in your organisation</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <SummaryCard label="Total HR Members" value={total}    color="border-blue-200   bg-blue-50"   />
                <SummaryCard label="Verified"          value={verified} color="border-green-200  bg-green-50"  />
                <SummaryCard label="Admins"            value={admins}   color="border-purple-200 bg-purple-50" />
            </div>

            <input type="text" placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300" />

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Name</span>
                    <span className="col-span-2">Email</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0
                    ? <div className="text-center text-gray-400 py-16">No HR profiles found.</div>
                    : filtered.map(h => (
                        <div key={h._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{h.firstname} {h.lastname}
                                    {h._id === currentID && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                                </p>
                                <p className="text-xs text-gray-400">{h.role}</p>
                            </div>
                            <p className="col-span-2 text-gray-600 text-xs">{h.email}</p>
                            <Badge verified={h.isverified} />
                            <div className="flex gap-2">
                                <button onClick={() => setDetail(h)}
                                    className="px-3 py-1 rounded-md text-xs border border-blue-400 text-blue-600 hover:bg-blue-50">View</button>
                                <button
                                    disabled={h._id === currentID}
                                    onClick={() => handleDelete(h._id)}
                                    className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <DetailDialog open={!!detail} hr={detail} onClose={() => setDetail(null)} />
        </div>
    )
}