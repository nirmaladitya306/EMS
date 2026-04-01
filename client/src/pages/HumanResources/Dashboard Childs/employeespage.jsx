import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { ListWrapper } from "../../../components/common/Dashboard/ListDesigns"
import { HeadingBar } from "../../../components/common/Dashboard/ListDesigns"
import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { HandleGetHREmployees, HandleSearchEmployeesBySkills } from "../../../redux/Thunks/HREmployeesThunk.js"
import { Loading } from "../../../components/common/loading.jsx"
import { ListItems } from "../../../components/common/Dashboard/ListDesigns"
import { ListContainer } from "../../../components/common/Dashboard/ListDesigns"
import { AddEmployeesDialogBox } from "../../../components/common/Dashboard/dialogboxes.jsx"

// ─── Skill tag pill (read-only, removable from search bar) ────────────────────
const SkillChip = ({ skill, onRemove }) => (
    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
        {skill}
        <button onClick={() => onRemove(skill)} className="text-indigo-300 hover:text-indigo-600 text-sm leading-none">×</button>
    </span>
)

// ─── Skill search result row ──────────────────────────────────────────────────
const SkillResultRow = ({ emp }) => (
    <div className="grid grid-cols-5 border-b border-blue-100 py-2 gap-2 items-center">
        <div className="font-bold text-sm p-2 col-span-1">
            {emp.firstname} {emp.lastname}
        </div>
        <div className="text-sm p-2 min-[250px]:hidden sm:block col-span-1 truncate">
            {emp.email}
        </div>
        <div className="text-sm p-2 min-[250px]:hidden sm:block col-span-1 text-center">
            {emp.department?.name || 'N/A'}
        </div>
        <div className="text-sm p-2 min-[250px]:hidden sm:block col-span-1 text-center">
            {emp.contactnumber}
        </div>
        <div className="flex flex-wrap gap-1 p-2 col-span-1">
            {emp.skills?.map((s, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2 py-0.5 text-xs font-medium">
                    {s}
                </span>
            ))}
        </div>
    </div>
)

export const HREmployeesPage = () => {
    const dispatch         = useDispatch()
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const table_headings   = ["Full Name", "Email", "Department", "Contact Number", "Modify Employee"]

    // ── Skill search state ────────────────────────────────────────────────────
    const [searchInput,  setSearchInput]  = useState('')
    const [activeSkills, setActiveSkills] = useState([])   // chips currently searched
    const [searchMode,   setSearchMode]   = useState(false)
    const inputRef = useRef(null)

    const addSkillChip = () => {
        const trimmed = searchInput.trim()
        if (!trimmed) return
        if (activeSkills.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) {
            setSearchInput('')
            return
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
        if (newSkills.length === 0) {
            setSearchMode(false)
        } else {
            dispatch(HandleSearchEmployeesBySkills(newSkills.join(',')))
        }
    }

    const clearSearch = () => {
        setActiveSkills([])
        setSearchInput('')
        setSearchMode(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addSkillChip()
        }
        if (e.key === 'Backspace' && !searchInput && activeSkills.length > 0) {
            removeSkillChip(activeSkills[activeSkills.length - 1])
        }
    }

    // ── Load all employees on mount ───────────────────────────────────────────
    useEffect(() => {
        if (HREmployeesState.fetchData) {
            dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
        }
    }, [HREmployeesState.fetchData])

    useEffect(() => {
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])

    if (HREmployeesState.isLoading && !HREmployeesState.data) {
        return <Loading />
    }

    const searchResults  = HREmployeesState.skillSearchResults || []
    const searchLoading  = HREmployeesState.skillSearchLoading

    return (
        <PageShell>

            {/* ── Header ── */}
            <div className="employees-heading flex justify-between items-center md:pe-5">
                <PageHeader eyebrow="People" title="Employees" subtitle="Search, add, and manage your workforce" />
                <div className="employee-crate-button">
                    <AddEmployeesDialogBox />
                </div>
            </div>

            {/* ── Skill search bar ── */}
            <div className="skill-search-bar md:pe-5">
                <div className={`flex flex-wrap items-center gap-2 border-2 rounded-xl px-3 py-2 transition-colors ${activeSkills.length > 0 ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-white'}`}>
                    {/* Active skill chips */}
                    {activeSkills.map(skill => (
                        <SkillChip key={skill} skill={skill} onRemove={removeSkillChip} />
                    ))}

                    {/* Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={activeSkills.length === 0 ? "🔍 Search employees by skill (e.g. React, Python)…" : "Add another skill…"}
                        className="flex-1 min-w-[160px] text-sm bg-transparent outline-none placeholder-gray-400"
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {searchInput.trim() && (
                            <button
                                onClick={addSkillChip}
                                className="px-2.5 py-1 text-white text-xs rounded-lg hover:opacity-90 transition-colors" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)"
                            >
                                Add
                            </button>
                        )}
                        {searchMode && (
                            <button
                                onClick={clearSearch}
                                className="px-2.5 py-1 border border-gray-300 text-gray-500 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-1">
                    Press <kbd className="bg-gray-100 border border-gray-200 rounded px-1">Enter</kbd> or <kbd className="bg-gray-100 border border-gray-200 rounded px-1">,</kbd> to add a skill filter
                </p>
            </div>

            {/* ── Skill search results ── */}
            {searchMode && (
                <div className="skill-search-results md:pe-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-700">
                            Skill Search Results
                        </h2>
                        {!searchLoading && (
                            <span className="text-xs text-gray-400">
                                {searchResults.length} employee{searchResults.length !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>

                    {searchLoading ? (
                        <Loading />
                    ) : searchResults.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400 text-sm">
                            No employees found with {activeSkills.length === 1 ? 'this skill' : 'these skills'}.
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg px-2 py-1">
                            <div className="grid grid-cols-5 gap-2 rounded-lg px-2 py-1.5 text-white text-xs font-bold mb-1" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                                <span>Name</span>
                                <span className="min-[250px]:hidden sm:block">Email</span>
                                <span className="text-center min-[250px]:hidden sm:block">Department</span>
                                <span className="text-center min-[250px]:hidden sm:block">Contact</span>
                                <span>Matching Skills</span>
                            </div>
                            {searchResults.map(emp => (
                                <SkillResultRow key={emp._id} emp={emp} />
                            ))}
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-2">
                        <h2 className="font-semibold text-gray-700 mb-3">All Employees</h2>
                    </div>
                </div>
            )}

            {/* ── All employees table ── */}
            <div className="employees-data flex flex-col gap-4 md:pe-5 overflow-auto">
                <ListWrapper>
                    <HeadingBar table_layout={"grid-cols-5"} table_headings={table_headings} />
                </ListWrapper>
                <ListContainer>
                    <ListItems TargetedState={HREmployeesState} />
                </ListContainer>
            </div>
        </PageShell>
    )
}