import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { HeadingBar, ListContainer, ListItems, ListWrapper } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetHREmployees, HandleSearchEmployeesBySkills } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { AddEmployeesDialogBox } from "../../../components/common/Dashboard/dialogboxes.jsx"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --emp-bg: #18181b; /* Zinc-900 */
    --emp-border: #27272a; /* Zinc-800 */
    --emp-text-main: #fafafa;
    --emp-text-muted: #a1a1aa;
    --emp-text-faint: #71717a;
    --emp-bg-hover: rgba(255, 255, 255, 0.04);
    --emp-kbd-bg: #27272a;
    --emp-kbd-border: #3f3f46;
  }

  /* ── Skill search bar ── */
  .skill-bar {
    border: 1px solid var(--emp-border, rgba(0,0,0,0.11)); border-radius: 12px;
    padding: 8px 12px; background: var(--emp-bg, #fff); display: flex;
    flex-wrap: wrap; align-items: center; gap: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .skill-bar.has-chips {
    border-color: rgba(99,102,241,0.35);
    background: var(--emp-bg-hover, rgba(99,102,241,0.02));
    box-shadow: 0 0 0 3px rgba(99,102,241,0.06);
  }
  .skill-bar-input {
    flex: 1; min-width: 160px; font-size: 13px; background: transparent;
    outline: none; border: none; color: var(--emp-text-main, #0f172a); font-family: 'DM Sans', sans-serif;
  }
  .skill-bar-input::placeholder { color: var(--emp-text-muted, rgba(0,0,0,0.3)); }
  
  .skill-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
    color: #6366f1; border-radius: 100px; padding: 3px 10px;
    font-size: 12px; font-weight: 500; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  [data-theme='dark'] .skill-chip {
    background: rgba(99,102,241,0.15); color: #818cf8; border-color: rgba(99,102,241,0.3);
  }
  
  .skill-chip-remove {
    background: none; border: none; cursor: pointer;
    color: rgba(99,102,241,0.5); font-size: 14px; line-height: 1;
    padding: 0; transition: color 0.15s;
  }
  .skill-chip-remove:hover { color: #6366f1; }
  [data-theme='dark'] .skill-chip-remove:hover { color: #c7d2fe; }

  .skill-hint {
    font-size: 11px; color: var(--emp-text-muted, rgba(0,0,0,0.3));
    margin-top: 6px; padding-left: 2px; font-family: 'DM Sans', sans-serif;
  }
  .skill-hint kbd {
    background: var(--emp-kbd-bg, rgba(0,0,0,0.05)); border: 1px solid var(--emp-kbd-border, rgba(0,0,0,0.1));
    border-radius: 4px; padding: 1px 5px; font-family: inherit; font-size: 10px;
  }

  /* ── Skill results section ── */
  .skill-results-label {
    font-size: 12px; font-weight: 600; color: var(--emp-text-muted, rgba(0,0,0,0.5));
    letter-spacing: 0.04em; display: flex; align-items: center; gap: 8px;
    font-family: 'DM Sans', sans-serif;
  }
  .skill-results-count {
    font-size: 11px; font-weight: 400; color: var(--emp-text-faint, rgba(0,0,0,0.3));
  }
  .skill-result-row {
    display: grid; grid-template-columns: repeat(5, 1fr);
    padding: 10px 16px; border-bottom: 1px solid var(--emp-border, rgba(0,0,0,0.05));
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    transition: background 0.12s;
  }
  .skill-result-row:last-child { border-bottom: none; }
  .skill-result-row:hover { background: var(--emp-bg-hover, rgba(99,102,241,0.03)); }
  
  .skill-tag {
    display: inline-flex; background: rgba(99,102,241,0.06);
    border: 1px solid rgba(99,102,241,0.14); color: rgba(99,102,241,0.8);
    border-radius: 100px; padding: 2px 8px; font-size: 11px; font-weight: 500;
    font-family: 'DM Sans', sans-serif;
  }
  [data-theme='dark'] .skill-tag {
    background: rgba(99,102,241,0.1); color: #818cf8; border-color: rgba(99,102,241,0.25);
  }

  .skill-divider {
    height: 1px; background: var(--emp-border, rgba(0,0,0,0.06)); margin: 4px 0;
  }
  .all-employees-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--emp-text-muted, rgba(0,0,0,0.3));
    padding: 4px 0; font-family: 'DM Sans', sans-serif;
  }
`

const SkillChip = ({ skill, onRemove }) => (
    <span className="skill-chip">
        {skill}
        <button className="skill-chip-remove" onClick={() => onRemove(skill)}>×</button>
    </span>
)

const SkillResultRow = ({ emp }) => (
    <div className="skill-result-row">
        <div style={{ fontWeight: 500, color: 'var(--emp-text-main, #0f172a)' }}>{emp.firstname} {emp.lastname}</div>
        <div style={{ color: 'var(--emp-text-muted, rgba(0,0,0,0.45))', fontSize: '12px' }} className="min-[250px]:hidden sm:block truncate">{emp.email}</div>
        <div style={{ color: 'var(--emp-text-muted, rgba(0,0,0,0.45))', fontSize: '12px' }} className="min-[250px]:hidden sm:block text-center">{emp.department?.name || 'N/A'}</div>
        <div style={{ color: 'var(--emp-text-muted, rgba(0,0,0,0.45))', fontSize: '12px' }} className="min-[250px]:hidden sm:block text-center">{emp.contactnumber}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {emp.skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
        </div>
    </div>
)

export const HREmployeesPage = () => {
    const dispatch         = useDispatch()
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const table_headings   = ["Full Name", "Email", "Department", "Contact Number", "Actions"]

    const [searchInput,  setSearchInput]  = useState('')
    const [activeSkills, setActiveSkills] = useState([])
    const [searchMode,   setSearchMode]   = useState(false)
    const inputRef = useRef(null)

    const addSkillChip = () => {
        const trimmed = searchInput.trim()
        if (!trimmed) return
        if (activeSkills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
            setSearchInput(''); return
        }
        const newSkills = [...activeSkills, trimmed]
        setActiveSkills(newSkills)
        setSearchInput('')
        dispatch(HandleSearchEmployeesBySkills(newSkills.join(',')))
        setSearchMode(true)
    }

    const removeSkillChip = (skill) => {
        const newSkills = activeSkills.filter(s => s !== skill)
        setActiveSkills(newSkills)
        if (newSkills.length === 0) setSearchMode(false)
        else dispatch(HandleSearchEmployeesBySkills(newSkills.join(',')))
    }

    const clearSearch = () => { setActiveSkills([]); setSearchInput(''); setSearchMode(false) }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkillChip() }
        if (e.key === 'Backspace' && !searchInput && activeSkills.length > 0)
            removeSkillChip(activeSkills[activeSkills.length - 1])
    }

    // ─── INITIAL LOAD ───
    useEffect(() => { 
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" })) 
    }, [dispatch])

    // ─── THE FIX: SYNCHRONIZATION ───
    // This listens for any successful creation/deletion flag from your Thunk
    useEffect(() => {
        if (HREmployeesState.fetchData) {
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
        }
    }, [HREmployeesState.fetchData, dispatch])

    if (HREmployeesState.isLoading && !HREmployeesState.data) return <Loading />

    const searchResults = HREmployeesState.skillSearchResults || []
    const searchLoading = HREmployeesState.skillSearchLoading

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader eyebrow="People" title="Employees" subtitle="Search, add, and manage your workforce">
                    <AddEmployeesDialogBox />
                </PageHeader>

                {/* ── Skill search bar ── */}
                <div style={{ marginBottom: '12px' }}>
                    <div className={`skill-bar ${activeSkills.length > 0 ? 'has-chips' : ''}`}>
                        {activeSkills.map(skill => (
                            <SkillChip key={skill} skill={skill} onRemove={removeSkillChip} />
                        ))}
                        <input
                            ref={inputRef}
                            type="text"
                            className="skill-bar-input"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={activeSkills.length === 0 ? "Search by skill — e.g. React, Python…" : "Add another skill…"}
                        />
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            {searchInput.trim() && (
                                <button className="pg-btn-primary" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={addSkillChip}>
                                    Add
                                </button>
                            )}
                            {searchMode && (
                                <button className="pg-btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={clearSearch}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="skill-hint">
                        Press <kbd>Enter</kbd> or <kbd>,</kbd> to add a skill filter
                    </p>
                </div>

                {/* ── Skill search results ── */}
                {searchMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <div className="skill-results-label">
                            Skill Search Results
                            {!searchLoading && (
                                <span className="skill-results-count">
                                    {searchResults.length} employee{searchResults.length !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </div>

                        {searchLoading ? <Loading /> : searchResults.length === 0 ? (
                            <div style={{ border: '1px dashed var(--emp-border, rgba(0,0,0,0.1))', borderRadius: '12px', padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--emp-text-muted, rgba(0,0,0,0.3))' }}>
                                No employees found with {activeSkills.length === 1 ? 'this skill' : 'these skills'}.
                            </div>
                        ) : (
                            <div className="pg-table-wrap" style={{ flex: 'none', background: 'var(--emp-bg)', borderColor: 'var(--emp-border)' }}>
                                <div className="pg-table-head grid grid-cols-5" style={{ background: 'var(--emp-bg-hover)', borderBottom: '1px solid var(--emp-border)' }}>
                                    {['Name', 'Email', 'Department', 'Contact', 'Matching Skills'].map(h => (
                                        <span key={h} className={`pg-th ${h === 'Email' || h === 'Department' || h === 'Contact' ? 'min-[250px]:hidden sm:block' : ''}`}>{h}</span>
                                    ))}
                                </div>
                                {searchResults.map(emp => <SkillResultRow key={emp._id} emp={emp} />)}
                            </div>
                        )}

                        <div className="skill-divider" />
                        <p className="all-employees-label">All Employees</p>
                    </div>
                )}

                {/* ── All employees table ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '3rem' }}>
                    <ListWrapper>
                        <HeadingBar table_layout="grid-cols-5" table_headings={table_headings} />
                    </ListWrapper>
                    <ListContainer>
                        <ListItems TargetedState={HREmployeesState} />
                    </ListContainer>
                </div>
            </PageShell>
        </>
    )
}