import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllRecruitments, HandleCreateRecruitment, HandleDeleteRecruitment } from '../../../redux/Thunks/RecruitmentThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (title) =>
    title?.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'

// ─── Job icon tile ────────────────────────────────────────────────────────────
// Gives each posting a coloured monogram tile — same idea as the Avatar on other pages
const JobIcon = ({ title, size = 36 }) => {
    // Cycle through a small palette based on first char code
    const PALETTES = [
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'linear-gradient(135deg, #0ea5e9, #6366f1)',
        'linear-gradient(135deg, #14b8a6, #0ea5e9)',
        'linear-gradient(135deg, #f59e0b, #ef4444)',
        'linear-gradient(135deg, #8b5cf6, #ec4899)',
    ]
    const bg = PALETTES[(title?.charCodeAt(0) ?? 0) % PALETTES.length]
    return (
        <div style={{
            width: size, height: size, borderRadius: 10, flexShrink: 0,
            background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: size * 0.33,
            fontFamily: "'DM Serif Display', serif", letterSpacing: '0.03em',
        }}>
            {initials(title)}
        </div>
    )
}

// ─── Applicant count chip ─────────────────────────────────────────────────────
const ApplicantChip = ({ count }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: count > 0 ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.04)',
        color:      count > 0 ? '#4f46e5'               : 'rgba(0,0,0,0.35)',
        border:     count > 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(0,0,0,0.08)',
        whiteSpace: 'nowrap',
    }}>
        <span style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: count > 0 ? '#6366f1' : 'rgba(0,0,0,0.25)',
        }} />
        {count} {count === 1 ? 'applicant' : 'applicants'}
    </span>
)

// ─── Create posting modal ─────────────────────────────────────────────────────
const CreateModal = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({ jobtitle: '', description: '' })
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => {
        e.preventDefault()
        onSubmit(form)
        setForm({ jobtitle: '', description: '' })
    }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">

                {/* Title */}
                <div>
                    <div style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.25rem', color: '#0f172a',
                        letterSpacing: '-0.02em', marginBottom: 4,
                    }}>
                        New Job Posting
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: 0 }}>
                        Create a new opening. Applicants can be tracked once the posting is live.
                    </p>
                </div>

                <div className="pg-divider" />

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="pg-field">
                        <label className="pg-label">Job Title</label>
                        <input
                            name="jobtitle"
                            value={form.jobtitle}
                            onChange={handle}
                            required
                            placeholder="e.g. Senior Frontend Engineer"
                            className="pg-input"
                        />
                    </div>
                    <div className="pg-field">
                        <label className="pg-label">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handle}
                            required
                            rows={5}
                            placeholder="Describe responsibilities, requirements, and any other relevant details…"
                            className="pg-textarea"
                        />
                    </div>

                    <div className="pg-modal-actions">
                        <button type="button" className="pg-btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="pg-btn-primary">
                            Create Posting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ record, onClose }) => {
    if (!record) return null

    const appCount = record.application?.length || 0

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">

                {/* Header with job icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <JobIcon title={record.jobtitle} size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.2rem', color: '#0f172a',
                            letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6,
                        }}>
                            {record.jobtitle}
                        </div>
                        <ApplicantChip count={appCount} />
                    </div>
                </div>

                <div className="pg-divider" />

                {/* Description */}
                <div>
                    <div style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.09em',
                        textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
                        marginBottom: 8,
                    }}>
                        Description
                    </div>
                    <p style={{
                        fontSize: 13, color: 'rgba(0,0,0,0.65)',
                        lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap',
                    }}>
                        {record.description}
                    </p>
                </div>

                {/* Applicants list — if any */}
                {appCount > 0 && (
                    <>
                        <div className="pg-divider" />
                        <div>
                            <div style={{
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.09em',
                                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
                                marginBottom: 10,
                            }}>
                                Applicants ({appCount})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {record.application.map((app, i) => (
                                    <div key={app._id || i} style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', gap: 12,
                                        padding: '9px 0',
                                        borderBottom: i < record.application.length - 1
                                            ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>
                                                {app.firstname} {app.lastname}
                                            </div>
                                            {app.email && (
                                                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 1 }}>
                                                    {app.email}
                                                </div>
                                            )}
                                        </div>
                                        {app.status && (
                                            <span style={{
                                                fontSize: 11, fontWeight: 600,
                                                padding: '2px 9px', borderRadius: 100,
                                                background: 'rgba(99,102,241,0.07)',
                                                color: '#4f46e5',
                                                border: '1px solid rgba(99,102,241,0.18)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {app.status}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="pg-modal-actions">
                    <button className="pg-btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const RecruitmentPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.RecruitmentReducer)

    const [createOpen, setCreateOpen] = useState(false)
    const [detailRec,  setDetailRec]  = useState(null)
    const [search,     setSearch]     = useState('')

    useEffect(() => { dispatch(HandleGetAllRecruitments()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllRecruitments()) }, [state.fetchData])

    const handleCreate = (form) => {
        dispatch(HandleCreateRecruitment(form))
        setCreateOpen(false)
    }

    const handleDelete = (recruitmentID) => {
        if (window.confirm('Delete this job posting? This cannot be undone.'))
            dispatch(HandleDeleteRecruitment({ recruitmentID }))
    }

    const filtered = (state.data || []).filter(r =>
        r.jobtitle?.toLowerCase().includes(search.toLowerCase())
    )

    const total     = state.data?.length || 0
    const totalApps = state.data?.reduce((sum, r) => sum + (r.application?.length || 0), 0) || 0
    const withApps  = state.data?.filter(r => (r.application?.length || 0) > 0).length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="Recruitment"
                title="Job Postings"
                subtitle="Create openings, track applicants and manage your hiring pipeline"
            >
                <button className="pg-btn-primary" onClick={() => setCreateOpen(true)}>
                    + New Posting
                </button>
            </PageHeader>

            {/* ── Stats strip ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { label: 'Active Postings',    value: total     },
                    { label: 'With Applicants',    value: withApps  },
                    { label: 'Total Applicants',   value: totalApps },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value">{s.value}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Search ── */}
            <div className="pg-filters">
                <input
                    className="pg-search"
                    type="text"
                    placeholder="Search by job title…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 260 }}
                />
                {search && (
                    <button
                        className="pg-btn-ghost"
                        style={{ padding: '8px 14px', fontSize: 12 }}
                        onClick={() => setSearch('')}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* ── Table ── */}
            <div className="pg-table-wrap">

                {/* Header */}
                <div
                    className="pg-table-head"
                    style={{ gridTemplateColumns: '2.5fr 3fr 130px 110px' }}
                >
                    <span className="pg-th">Job Title</span>
                    <span className="pg-th">Description</span>
                    <span className="pg-th">Applicants</span>
                    <span className="pg-th">Actions</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">📋</span>
                        <p className="pg-empty-title">
                            {search ? 'No postings match your search' : 'No job postings yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search
                                ? 'Try a different job title.'
                                : 'Create your first job posting to start tracking applicants.'}
                        </p>
                    </div>
                )}

                {/* Rows */}
                {filtered.map(r => (
                    <div
                        key={r._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2.5fr 3fr 130px 110px' }}
                    >
                        {/* Job title + icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <JobIcon title={r.jobtitle} size={34} />
                            <div>
                                <div className="pg-td-name">{r.jobtitle}</div>
                            </div>
                        </div>

                        {/* Description — truncated */}
                        <div
                            className="pg-td-muted"
                            style={{
                                overflow: 'hidden', textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap', paddingRight: 16,
                            }}
                        >
                            {r.description}
                        </div>

                        {/* Applicant chip */}
                        <span>
                            <ApplicantChip count={r.application?.length || 0} />
                        </span>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="pg-action-btn indigo"
                                onClick={() => setDetailRec(r)}
                            >
                                View
                            </button>
                            <button
                                className="pg-action-btn red"
                                onClick={() => handleDelete(r._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Modals ── */}
            {createOpen && (
                <CreateModal
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
            {detailRec && (
                <DetailModal
                    record={detailRec}
                    onClose={() => setDetailRec(null)}
                />
            )}

        </PageShell>
    )
}