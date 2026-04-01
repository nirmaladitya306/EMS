import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetEmployeeProfile, HandleUpdateMyProfile } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const InfoCard = ({ label, value }) => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-1">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        <span className="text-base font-semibold text-gray-800">{value || '—'}</span>
    </div>
)

const StatCard = ({ label, count, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

// ─── Skill tag pill ───────────────────────────────────────────────────────────
const SkillTag = ({ skill, onRemove, editable }) => (
    <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full px-3 py-1 text-sm font-medium">
        {skill}
        {editable && (
            <button
                onClick={() => onRemove(skill)}
                className="text-purple-400 hover:text-indigo-700 text-base leading-none ml-0.5 transition-colors"
                title="Remove skill"
            >
                ×
            </button>
        )}
    </span>
)

// ─── Skills editor section ───────────────────────────────────────────────────
const SkillsEditor = ({ profile, employeeId }) => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.EmployeeDashboardReducer)

    const [skills,    setSkills]    = useState(profile?.skills || [])
    const [inputVal,  setInputVal]  = useState('')
    const [editing,   setEditing]   = useState(false)
    const [saving,    setSaving]    = useState(false)
    const [saved,     setSaved]     = useState(false)
    const inputRef = useRef(null)

    // Sync skills when profile reloads
    useEffect(() => {
        setSkills(profile?.skills || [])
    }, [profile])

    const addSkill = () => {
        const trimmed = inputVal.trim()
        if (!trimmed) return
        if (skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
            setInputVal('')
            return
        }
        setSkills(prev => [...prev, trimmed])
        setInputVal('')
    }

    const removeSkill = (skill) => {
        setSkills(prev => prev.filter(s => s !== skill))
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addSkill()
        }
        if (e.key === 'Escape') {
            cancelEdit()
        }
    }

    const saveSkills = async () => {
        // flush any pending input
        const trimmed = inputVal.trim()
        const finalSkills = trimmed && !skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())
            ? [...skills, trimmed]
            : skills

        setSaving(true)
        await dispatch(HandleUpdateMyProfile({
            employeeId,
            updatedEmployee: { skills: finalSkills }
        }))
        setSkills(finalSkills)
        setInputVal('')
        setSaving(false)
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 2000)
        dispatch(HandleGetEmployeeProfile())
    }

    const cancelEdit = () => {
        setSkills(profile?.skills || [])
        setInputVal('')
        setEditing(false)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-700">My Skills</h2>
                <div className="flex items-center gap-2">
                    {saved && (
                        <span className="text-xs text-green-600 font-medium">✓ Saved</span>
                    )}
                    {!editing ? (
                        <button
                            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
                            className="px-3 py-1 text-xs border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            Edit Skills
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={saveSkills}
                                disabled={saving}
                                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                            >
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="px-3 py-1 text-xs border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tag cloud */}
            <div className="flex flex-wrap gap-2 min-h-[40px]">
                {skills.length === 0 && !editing && (
                    <span className="text-sm text-gray-400 italic">No skills added yet. Click Edit Skills to add some.</span>
                )}
                {skills.map(skill => (
                    <SkillTag key={skill} skill={skill} onRemove={removeSkill} editable={editing} />
                ))}

                {/* Inline input appears inside the tag cloud */}
                {editing && (
                    <div className="flex items-center gap-1.5">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type skill + Enter"
                            className="border border-indigo-200 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-40"
                        />
                        <button
                            onClick={addSkill}
                            className="w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center hover:bg-indigo-700 shrink-0"
                            title="Add skill"
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            {editing && (
                <p className="text-xs text-gray-400 mt-2">
                    Press <kbd className="bg-gray-100 border border-gray-300 rounded px-1">Enter</kbd> or <kbd className="bg-gray-100 border border-gray-300 rounded px-1">,</kbd> to add a skill · click × to remove
                </p>
            )}
        </div>
    )
}

export const EmployeeOverviewPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.EmployeeDashboardReducer)
    const profile  = state.profile

    useEffect(() => { dispatch(HandleGetEmployeeProfile()) }, [])

    if (state.isLoading && !profile) return <Loading />

    return (
        <PageShell>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {profile?.firstname?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                    <PageHeader eyebrow="Employee Portal" title="My Overview" subtitle="Your profile, skills, and key statistics" />
                    <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
                </div>
            </div>

            {/* Profile details */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Profile Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoCard label="First Name"  value={profile?.firstname}        />
                    <InfoCard label="Last Name"   value={profile?.lastname}         />
                    <InfoCard label="Email"       value={profile?.email}            />
                    <InfoCard label="Contact"     value={profile?.contactnumber}    />
                    <InfoCard label="Department"  value={profile?.department?.name} />
                    <InfoCard label="Role"        value={profile?.role}             />
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <SkillsEditor profile={profile} employeeId={profile?._id} />
            </div>

            {/* Quick stats */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Quick Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Salary Records"   count={profile?.salary?.length          || 0} color="border-blue-200   bg-blue-50"   />
                    <StatCard label="Leave Requests"   count={profile?.leaverequest?.length    || 0} color="border-yellow-200 bg-yellow-50" />
                    <StatCard label="Notices"          count={profile?.notice?.length          || 0} color="border-orange-200 bg-orange-50" />
                    <StatCard label="My Requests"      count={profile?.generaterequest?.length || 0} color="border-green-200  bg-green-50"  />
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

        </PageShell>
    )
}