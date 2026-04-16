import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetEmployeeProfile, HandleUpdateMyProfile } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --ov-card-bg: rgba(255,255,255,0.03);
    --ov-border: #27272a;
    --ov-text-main: #fafafa;
    --ov-text-muted: #a1a1aa;
    --ov-text-faint: #71717a;
    
    --ov-skill-bg: rgba(99,102,241,0.12);
    --ov-skill-text: #818cf8;
    --ov-skill-border: rgba(99,102,241,0.3);
    
    --ov-input-bg: #18181b;
    --ov-kbd-bg: #27272a;
    --ov-success: #4ade80;
  }

  /* ── Profile header ── */
  .ov-avatar {
    width: 58px; height: 58px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 22px; font-weight: 700; flex-shrink: 0;
    font-family: 'DM Serif Display', serif; letter-spacing: -0.5px;
  }
  .ov-header-text { display: flex; flex-direction: column; gap: 2px; }
  .ov-email { font-size: 12px; color: var(--ov-text-muted, rgba(0,0,0,0.38)); font-weight: 300; font-family: 'DM Sans', sans-serif; }

  /* ── Section title ── */
  .ov-section-title {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--ov-text-faint, rgba(0,0,0,0.35));
    margin: 0 0 12px; font-family: 'DM Sans', sans-serif;
  }

  /* ── Info card ── */
  .ov-info-card {
    background: var(--ov-card-bg, rgba(0,0,0,0.012)); 
    border: 1px solid var(--ov-border, rgba(0,0,0,0.07));
    border-radius: 12px; padding: 12px 14px;
    display: flex; flex-direction: column; gap: 3px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s;
  }
  .ov-info-card:hover { border-color: rgba(99,102,241,0.2); }
  .ov-info-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ov-text-faint, rgba(0,0,0,0.3)); }
  .ov-info-value { font-size: 14px; font-weight: 500; color: var(--ov-text-main, #0f172a); }

  /* ── Skills section ── */
  .ov-skills-panel {
    background: var(--ov-card-bg, rgba(0,0,0,0.012)); 
    border: 1px solid var(--ov-border, rgba(0,0,0,0.07));
    border-radius: 14px; padding: 18px 20px;
    font-family: 'DM Sans', sans-serif;
  }
  .ov-skills-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
  }
  .ov-skills-title { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ov-text-faint, rgba(0,0,0,0.35)); }
  .ov-skills-saved { font-size: 11px; color: var(--ov-success, #059669); font-weight: 500; }

  .ov-skill-tag {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--ov-skill-bg, rgba(99,102,241,0.08)); 
    border: 1px solid var(--ov-skill-border, rgba(99,102,241,0.2));
    color: var(--ov-skill-text, #4f46e5); border-radius: 100px; padding: 4px 12px;
    font-size: 12px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  }
  .ov-skill-remove {
    background: none; border: none; cursor: pointer;
    color: var(--ov-skill-text, rgba(99,102,241,0.4)); font-size: 15px; line-height: 1;
    padding: 0; transition: color 0.15s; opacity: 0.6;
  }
  .ov-skill-remove:hover { color: var(--ov-skill-text, #6366f1); opacity: 1; }

  .ov-skill-input {
    border: 1px solid var(--ov-skill-border, rgba(99,102,241,0.25)); border-radius: 100px;
    padding: 4px 12px; font-size: 12px; font-family: 'DM Sans', sans-serif;
    background: var(--ov-input-bg, #fff);
    color: var(--ov-text-main, #0f172a); outline: none; width: 140px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ov-skill-input:focus { border-color: rgba(99,102,241,0.45); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .ov-skill-input::placeholder { color: var(--ov-text-faint, rgba(0,0,0,0.28)); }

  .ov-skill-add {
    width: 24px; height: 24px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; font-size: 16px; line-height: 1;
    border: none; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: opacity 0.15s;
  }
  .ov-skill-add:hover { opacity: 0.85; }

  .ov-skills-empty { font-size: 13px; color: var(--ov-text-faint, rgba(0,0,0,0.28)); font-style: italic; font-family: 'DM Sans', sans-serif; }
  .ov-skill-hint { font-size: 11px; color: var(--ov-text-faint, rgba(0,0,0,0.28)); margin-top: 10px; font-family: 'DM Sans', sans-serif; }
  .ov-skill-hint kbd {
    background: var(--ov-kbd-bg, rgba(0,0,0,0.05)); border: 1px solid var(--ov-border, rgba(0,0,0,0.1));
    border-radius: 4px; padding: 1px 5px; font-family: inherit; font-size: 10px; color: var(--ov-text-muted);
  }

  /* ── Account status ── */
  .ov-status-pill {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--ov-card-bg, rgba(0,0,0,0.012)); border: 1px solid var(--ov-border, rgba(0,0,0,0.07));
    border-radius: 100px; padding: 8px 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .ov-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ov-status-label { font-size: 13px; font-weight: 500; color: var(--ov-text-main, #0f172a); }
`

const InfoCard = ({ label, value }) => (
    <div className="ov-info-card">
        <span className="ov-info-label">{label}</span>
        <span className="ov-info-value">{value || '—'}</span>
    </div>
)

const SkillTag = ({ skill, onRemove, editable }) => (
    <span className="ov-skill-tag">
        {skill}
        {editable && (
            <button className="ov-skill-remove" onClick={() => onRemove(skill)}>×</button>
        )}
    </span>
)

const SkillsEditor = ({ profile, employeeId }) => {
    const dispatch = useDispatch()

    const [skills,   setSkills]   = useState(profile?.skills || [])
    const [inputVal, setInputVal] = useState('')
    const [editing,  setEditing]  = useState(false)
    const [saving,   setSaving]   = useState(false)
    const [saved,    setSaved]    = useState(false)
    const inputRef = useRef(null)

    useEffect(() => { setSkills(profile?.skills || []) }, [profile])

    const addSkill = () => {
        const trimmed = inputVal.trim()
        if (!trimmed) return
        if (skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) { setInputVal(''); return }
        setSkills(prev => [...prev, trimmed])
        setInputVal('')
    }

    const removeSkill = (skill) => setSkills(prev => prev.filter(s => s !== skill))

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
        if (e.key === 'Escape') cancelEdit()
    }

    const saveSkills = async () => {
        const trimmed = inputVal.trim()
        const finalSkills = trimmed && !skills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())
            ? [...skills, trimmed] : skills
        setSaving(true)
        await dispatch(HandleUpdateMyProfile({ employeeId, updatedEmployee: { skills: finalSkills } }))
        setSkills(finalSkills); setInputVal(''); setSaving(false)
        setSaved(true); setEditing(false)
        setTimeout(() => setSaved(false), 2000)
        dispatch(HandleGetEmployeeProfile())
    }

    const cancelEdit = () => { setSkills(profile?.skills || []); setInputVal(''); setEditing(false) }

    return (
        <div className="ov-skills-panel">
            <div className="ov-skills-header">
                <span className="ov-skills-title">My Skills</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {saved && <span className="ov-skills-saved">✓ Saved</span>}
                    {!editing ? (
                        <button
                            className="pg-action-btn indigo"
                            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }}
                        >
                            Edit Skills
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="pg-btn-primary" style={{ padding: '5px 14px', fontSize: '12px' }} onClick={saveSkills} disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button className="pg-btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={cancelEdit}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '36px', alignItems: 'center' }}>
                {skills.length === 0 && !editing && (
                    <span className="ov-skills-empty">No skills added yet. Click Edit Skills to add some.</span>
                )}
                {skills.map(skill => (
                    <SkillTag key={skill} skill={skill} onRemove={removeSkill} editable={editing} />
                ))}
                {editing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type skill + Enter"
                            className="ov-skill-input"
                        />
                        <button className="ov-skill-add" onClick={addSkill}>+</button>
                    </div>
                )}
            </div>

            {editing && (
                <p className="ov-skill-hint">
                    Press <kbd>Enter</kbd> or <kbd>,</kbd> to add · click × to remove
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

    const initials = `${profile?.firstname?.[0] || ''}${profile?.lastname?.[0] || ''}`.toUpperCase() || '?'

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                {/* ── Header ── */}
                <PageHeader eyebrow="Employee Portal" title="My Overview" subtitle="Your profile, skills, and key statistics">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="ov-avatar">{initials}</div>
                        <div className="ov-header-text">
                            <span className="ov-email">{profile?.email}</span>
                        </div>
                    </div>
                </PageHeader>

                {/* ── Profile details ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p className="ov-section-title">Profile Details</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <InfoCard label="First Name"  value={profile?.firstname}        />
                        <InfoCard label="Last Name"   value={profile?.lastname}         />
                        <InfoCard label="Email"       value={profile?.email}            />
                        <InfoCard label="Contact"     value={profile?.contactnumber}    />
                        <InfoCard label="Department"  value={profile?.department?.name} />
                        <InfoCard label="Role"        value={profile?.role}             />
                    </div>
                </div>

                {/* ── Skills ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <SkillsEditor profile={profile} employeeId={profile?._id} />
                </div>

                {/* ── Quick stats ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <p className="ov-section-title">Quick Stats</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Salary Records', value: profile?.salary?.length          || 0 },
                            { label: 'Leave Requests', value: profile?.leaverequest?.length    || 0 },
                            { label: 'Notices',        value: profile?.notice?.length          || 0 },
                            { label: 'My Requests',    value: profile?.generaterequest?.length || 0 },
                        ].map(c => (
                            <div key={c.label} className="pg-stat-card">
                                <span className="pg-stat-value" style={{ color: 'var(--ov-text-main)' }}>{c.value}</span>
                                <span className="pg-stat-label">{c.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Account status ── */}
                <div>
                    <p className="ov-section-title">Account Status</p>
                    <div className="ov-status-pill" style={{ width: 'fit-content' }}>
                        <div
                            className="ov-status-dot"
                            style={{ background: profile?.isverified ? 'var(--ov-success, #059669)' : '#dc2626' }}
                        />
                        <span className="ov-status-label">
                            {profile?.isverified ? 'Email Verified' : 'Email Not Verified'}
                        </span>
                    </div>
                </div>

            </PageShell>
        </>
    )
}