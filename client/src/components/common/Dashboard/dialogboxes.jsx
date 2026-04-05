import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { CommonStateHandler } from "../../../utils/commonhandler.js"
import { useDispatch, useSelector } from "react-redux"
import { Loading } from "../loading.jsx"
import { HandlePostHREmployees, HandleDeleteHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { HandlePostHRDepartments, HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk.js"
import { fetchEmployeesIDs } from "../../../redux/Thunks/EmployeesIDsThunk.js"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .dlg-inner {
    font-family: 'DM Sans', sans-serif;
    display: flex; flex-direction: column; gap: 18px;
  }
  .dlg-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem; color: #0f172a;
    letter-spacing: -0.02em; margin: 0;
  }
  .dlg-divider { height: 1px; background: rgba(0,0,0,0.06); }
  .dlg-field  { display: flex; flex-direction: column; gap: 5px; }
  .dlg-label  {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.09em; color: rgba(0,0,0,0.4);
  }
  .dlg-input, .dlg-textarea {
    width: 100%; padding: 9px 13px; border: 1px solid rgba(0,0,0,0.12);
    background: #fff; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .dlg-textarea { resize: vertical; min-height: 80px; }
  .dlg-input:focus, .dlg-textarea:focus {
    border-color: rgba(99,102,241,0.45); box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .dlg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dlg-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.06); }

  /* ── Employee detail ── */
  .dlg-emp-avatar {
    width: 52px; height: 52px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px; font-weight: 700; flex-shrink: 0;
    font-family: 'DM Serif Display', serif;
  }
  .dlg-emp-name   { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #0f172a; letter-spacing: -0.01em; }
  .dlg-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .dlg-detail-row  { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; background: rgba(0,0,0,0.012); border: 1px solid rgba(0,0,0,0.07); border-radius: 10px; }
  .dlg-detail-key  { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: rgba(0,0,0,0.35); }
  .dlg-detail-val  { font-size: 13px; font-weight: 500; color: #0f172a; }

  .dlg-skill-chip {
    display: inline-flex; padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 500;
    background: rgba(99,102,241,0.07); color: #4f46e5;
    border: 1px solid rgba(99,102,241,0.18);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Confirm dialog ── */
  .dlg-confirm-icon { font-size: 2.5rem; text-align: center; }
  .dlg-confirm-text { font-size: 14px; color: rgba(0,0,0,0.55); text-align: center; line-height: 1.6; }
  .dlg-confirm-text strong { color: #0f172a; }

  /* ── Employee checkbox list ── */
  .dlg-emp-search {
    width: 100%; padding: 9px 13px; border: 1px solid rgba(0,0,0,0.12);
    background: #fff; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .dlg-emp-search:focus { border-color: rgba(99,102,241,0.45); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .dlg-emp-search::placeholder { color: rgba(0,0,0,0.3); }
  .dlg-emp-list {
    display: flex; flex-direction: column; gap: 4px;
    max-height: 260px; overflow-y: auto; padding: 2px;
  }
  .dlg-emp-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 10px; cursor: pointer;
    border: 1px solid transparent; transition: background 0.12s, border-color 0.12s;
    font-family: 'DM Sans', sans-serif;
  }
  .dlg-emp-item:hover:not(.dlg-emp-item--disabled) { background: rgba(99,102,241,0.04); border-color: rgba(99,102,241,0.12); }
  .dlg-emp-item--selected { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.2); }
  .dlg-emp-item--disabled { opacity: 0.45; cursor: not-allowed; }
  .dlg-emp-item input[type="checkbox"] { accent-color: #6366f1; width: 15px; height: 15px; flex-shrink: 0; cursor: pointer; }
  .dlg-emp-item-name  { font-size: 13px; font-weight: 500; color: #0f172a; }
  .dlg-emp-item-dept  { font-size: 11px; color: rgba(0,0,0,0.35); margin-top: 1px; }

  /* Buttons reused from pg-* system */
  .dlg-btn-primary {
    padding: 9px 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; border: none;
    border-radius: 10px; cursor: pointer;
    transition: opacity 0.2s; white-space: nowrap;
  }
  .dlg-btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .dlg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .dlg-btn-ghost {
    padding: 9px 16px; background: transparent; color: rgba(0,0,0,0.5);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; cursor: pointer;
    transition: background 0.15s;
  }
  .dlg-btn-ghost:hover { background: rgba(0,0,0,0.04); }

  .dlg-btn-danger {
    padding: 9px 18px; background: rgba(239,68,68,0.08); color: #dc2626;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(220,38,38,0.2); border-radius: 10px; cursor: pointer;
    transition: background 0.15s;
  }
  .dlg-btn-danger:hover { background: rgba(239,68,68,0.14); }
`

// ─── Add Employees ────────────────────────────────────────────────────────────
export const AddEmployeesDialogBox = () => {
    const dispatch = useDispatch()
    const [formdata, setformdata] = useState({
        firstname: '', lastname: '', email: '',
        contactnumber: '', textpassword: '', password: '',
    })
    const [open, setOpen] = useState(false)

    const handle = (e) => CommonStateHandler(formdata, setformdata, e)

    const submit = () => {
        if (!formdata.firstname || !formdata.email || !formdata.textpassword || !formdata.password) return
        dispatch(HandlePostHREmployees({ apiroute: 'ADDEMPLOYEE', data: formdata }))
        setformdata({ firstname: '', lastname: '', email: '', contactnumber: '', textpassword: '', password: '' })
        setOpen(false)
    }

    return (
        <>
            <style>{styles}</style>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className="dlg-btn-primary">Add Employee</DialogTrigger>
                <DialogContent className="max-w-[340px] sm:max-w-[520px]">
                    <div className="dlg-inner">
                        <h2 className="dlg-title">Add Employee</h2>
                        <div className="dlg-divider" />
                        <div className="dlg-grid-2">
                            <div className="dlg-field">
                                <label className="dlg-label">First Name</label>
                                <input name="firstname" value={formdata.firstname} onChange={handle} placeholder="e.g. Aisha" className="dlg-input" />
                            </div>
                            <div className="dlg-field">
                                <label className="dlg-label">Last Name</label>
                                <input name="lastname" value={formdata.lastname} onChange={handle} placeholder="e.g. Khan" className="dlg-input" />
                            </div>
                        </div>
                        <div className="dlg-field">
                            <label className="dlg-label">Email</label>
                            <input name="email" type="email" value={formdata.email} onChange={handle} placeholder="e.g. aisha@company.com" className="dlg-input" />
                        </div>
                        <div className="dlg-field">
                            <label className="dlg-label">Contact Number</label>
                            <input name="contactnumber" type="number" value={formdata.contactnumber} onChange={handle} placeholder="e.g. 9876543210" className="dlg-input" />
                        </div>
                        <div className="dlg-grid-2">
                            <div className="dlg-field">
                                <label className="dlg-label">Password</label>
                                <input name="textpassword" type="password" value={formdata.textpassword} onChange={handle} className="dlg-input" />
                            </div>
                            <div className="dlg-field">
                                <label className="dlg-label">Confirm Password</label>
                                <input name="password" type="password" value={formdata.password} onChange={handle} className="dlg-input" />
                            </div>
                        </div>
                        <div className="dlg-actions">
                            <DialogClose className="dlg-btn-ghost">Cancel</DialogClose>
                            <button className="dlg-btn-primary" onClick={submit}>Add Employee</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── View Employee ────────────────────────────────────────────────────────────
export const EmployeeDetailsDialogBox = ({ EmployeeID }) => {
    const HREmployeesState = useSelector(s => s.HREmployeesPageReducer)
    const emp = HREmployeesState.data?.find(e => e._id === EmployeeID)
    if (!emp) return null

    const initials = `${emp.firstname?.[0] || ''}${emp.lastname?.[0] || ''}`.toUpperCase()

    const details1 = [
        { key: 'First Name',     val: emp.firstname },
        { key: 'Last Name',      val: emp.lastname  },
        { key: 'Email',          val: emp.email     },
        { key: 'Contact',        val: emp.contactnumber },
        { key: 'Department',     val: emp.department?.name || 'Not Specified' },
        { key: 'Email Verified', val: emp.isverified ? 'Verified' : 'Not Verified' },
    ]
    const details2 = [
        { key: 'Notices',        val: emp.notice?.length        || 0 },
        { key: 'Salary Records', val: emp.salary?.length        || 0 },
        { key: 'Leave Requests', val: emp.leaverequest?.length  || 0 },
        { key: 'Requests',       val: emp.generaterequest?.length || 0 },
    ]

    return (
        <>
            <style>{styles}</style>
            <Dialog>
                <DialogTrigger className="pg-action-btn indigo">View</DialogTrigger>
                <DialogContent className="max-w-[340px] sm:max-w-[560px]">
                    <div className="dlg-inner">
                        {/* Avatar + name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div className="dlg-emp-avatar">{initials}</div>
                            <div>
                                <p className="dlg-emp-name">{emp.firstname} {emp.lastname}</p>
                                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.38)', marginTop: '2px' }}>{emp.email}</p>
                            </div>
                        </div>
                        <div className="dlg-divider" />

                        {/* Details grid */}
                        <div className="dlg-detail-grid">
                            {[...details1, ...details2].map(d => (
                                <div key={d.key} className="dlg-detail-row">
                                    <span className="dlg-detail-key">{d.key}</span>
                                    <span className="dlg-detail-val">{d.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div>
                            <p className="dlg-label" style={{ marginBottom: '8px' }}>Skills</p>
                            {emp.skills?.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {emp.skills.map((s, i) => <span key={i} className="dlg-skill-chip">{s}</span>)}
                                </div>
                            ) : (
                                <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>No skills added yet.</p>
                            )}
                        </div>

                        <div className="dlg-actions">
                            <DialogClose className="dlg-btn-ghost">Close</DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Delete Employee ──────────────────────────────────────────────────────────
export const DeleteEmployeeDialogBox = ({ EmployeeID }) => {
    const dispatch = useDispatch()

    return (
        <>
            <style>{styles}</style>
            <Dialog>
                <DialogTrigger className="pg-action-btn red">Delete</DialogTrigger>
                <DialogContent className="max-w-[340px] sm:max-w-[400px]">
                    <div className="dlg-inner" style={{ textAlign: 'center', alignItems: 'center' }}>
                        <div className="dlg-confirm-icon">🗑️</div>
                        <h2 className="dlg-title">Delete Employee</h2>
                        <p className="dlg-confirm-text">
                            Are you sure you want to <strong>permanently delete</strong> this employee? This action cannot be undone.
                        </p>
                        <div className="dlg-divider" style={{ width: '100%' }} />
                        <div className="dlg-actions" style={{ width: '100%' }}>
                            <DialogClose className="dlg-btn-ghost">Cancel</DialogClose>
                            <DialogClose
                                className="dlg-btn-danger"
                                onClick={() => dispatch(HandleDeleteHREmployees({ apiroute: `DELETE.${EmployeeID}` }))}
                            >
                                Delete
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Create Department ────────────────────────────────────────────────────────
export const CreateDepartmentDialogBox = () => {
    const dispatch = useDispatch()
    const [formdata, setformdata] = useState({ name: '', description: '' })
    const [open, setOpen] = useState(false)
    const [error, setError] = useState('')

    const handle = (e) => CommonStateHandler(formdata, setformdata, e)

    const create = () => {
        if (!formdata.name.trim() || !formdata.description.trim()) {
            setError('Both fields are required.')
            return
        }
        dispatch(HandlePostHRDepartments({ apiroute: 'CREATE', data: formdata }))
        setformdata({ name: '', description: '' })
        setError('')
        setOpen(false)
    }

    return (
        <>
            <style>{styles}</style>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError('') }}>
                <DialogTrigger className="dlg-btn-primary">Create Department</DialogTrigger>
                <DialogContent className="max-w-[340px] sm:max-w-[460px]">
                    <div className="dlg-inner">
                        <h2 className="dlg-title">Create Department</h2>
                        <div className="dlg-divider" />
                        <div className="dlg-field">
                            <label className="dlg-label">Department Name</label>
                            <input
                                name="name"
                                value={formdata.name}
                                onChange={handle}
                                placeholder="e.g. Engineering"
                                className="dlg-input"
                            />
                        </div>
                        <div className="dlg-field">
                            <label className="dlg-label">Description</label>
                            <textarea
                                name="description"
                                value={formdata.description}
                                onChange={handle}
                                placeholder="Describe this department's function…"
                                className="dlg-textarea"
                            />
                        </div>
                        {error && (
                            <p style={{ fontSize: '12px', color: '#dc2626' }}>{error}</p>
                        )}
                        <div className="dlg-actions">
                            <DialogClose className="dlg-btn-ghost">Cancel</DialogClose>
                            <button className="dlg-btn-primary" onClick={create}>Create</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Add Employees to Department ──────────────────────────────────────────────
export const EmployeesIDSDialogBox = ({ DepartmentID }) => {
    const dispatch        = useDispatch()
    const EmployeesIDState = useSelector(s => s.EMployeesIDReducer)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({ departmentID: DepartmentID, employeeIDArray: [] })

    useEffect(() => {
        setSelected({ departmentID: DepartmentID, employeeIDArray: [] })
    }, [DepartmentID])

    const toggle = (id) => {
        setSelected(prev => ({
            ...prev,
            employeeIDArray: prev.employeeIDArray.includes(id)
                ? prev.employeeIDArray.filter(e => e !== id)
                : [...prev.employeeIDArray, id],
        }))
    }

    const add = () => {
        dispatch(HandlePatchHRDepartments({ apiroute: 'UPDATE', data: selected }))
        setSelected({ departmentID: DepartmentID, employeeIDArray: [] })
    }

    const filtered = (EmployeesIDState.data || []).filter(e =>
        `${e.firstname} ${e.lastname}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <style>{styles}</style>
            <Dialog onOpenChange={() => setSelected({ departmentID: DepartmentID, employeeIDArray: [] })}>
                <DialogTrigger
                    className="dlg-btn-primary"
                    onClick={() => dispatch(fetchEmployeesIDs({ apiroute: 'GETALL' }))}
                >
                    Add Employees
                </DialogTrigger>
                <DialogContent className="max-w-[340px] sm:max-w-[460px]">
                    {EmployeesIDState.isLoading ? <Loading height="h-auto" /> : (
                        <div className="dlg-inner">
                            <h2 className="dlg-title">Add Employees</h2>
                            <div className="dlg-divider" />
                            <input
                                className="dlg-emp-search"
                                placeholder="Search by name…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div className="dlg-emp-list">
                                {filtered.length === 0 && (
                                    <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.3)', padding: '12px', textAlign: 'center' }}>No employees found.</p>
                                )}
                                {filtered.map((emp, i) => {
                                    const isDisabled = !!emp.department
                                    const isSelected = selected.employeeIDArray.includes(emp._id)
                                    return (
                                        <label
                                            key={emp._id}
                                            className={`dlg-emp-item ${isSelected ? 'dlg-emp-item--selected' : ''} ${isDisabled ? 'dlg-emp-item--disabled' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={() => !isDisabled && toggle(emp._id)}
                                            />
                                            <div>
                                                <p className="dlg-emp-item-name">{emp.firstname} {emp.lastname}</p>
                                                {emp.department && (
                                                    <p className="dlg-emp-item-dept">Already in {emp.department.name}</p>
                                                )}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                            <div className="dlg-actions">
                                <DialogClose
                                    className="dlg-btn-ghost"
                                    onClick={() => setSelected({ departmentID: DepartmentID, employeeIDArray: [] })}
                                >
                                    Cancel
                                </DialogClose>
                                <DialogClose
                                    className="dlg-btn-primary"
                                    onClick={add}
                                    disabled={selected.employeeIDArray.length === 0}
                                >
                                    Add {selected.employeeIDArray.length > 0 ? `(${selected.employeeIDArray.length})` : ''}
                                </DialogClose>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Remove Employee from Department ─────────────────────────────────────────
export const RemoveEmployeeFromDepartmentDialogBox = ({ DepartmentName, DepartmentID, EmployeeID }) => {
    const dispatch = useDispatch()

    return (
        <>
            <style>{styles}</style>
            <Dialog>
                <DialogTrigger className="pg-action-btn red">Remove</DialogTrigger>
                <DialogContent className="max-w-[340px] sm:max-w-[400px]">
                    <div className="dlg-inner" style={{ textAlign: 'center', alignItems: 'center' }}>
                        <div className="dlg-confirm-icon">👤</div>
                        <h2 className="dlg-title">Remove Employee</h2>
                        <p className="dlg-confirm-text">
                            Are you sure you want to remove this employee from the <strong>{DepartmentName}</strong> department?
                        </p>
                        <div className="dlg-divider" style={{ width: '100%' }} />
                        <div className="dlg-actions" style={{ width: '100%' }}>
                            <DialogClose className="dlg-btn-ghost">Cancel</DialogClose>
                            <DialogClose
                                className="dlg-btn-danger"
                                onClick={() => dispatch(HandleDeleteHRDepartments({
                                    apiroute: 'DELETE',
                                    data: { departmentID: DepartmentID, employeeIDArray: [EmployeeID], action: 'delete-employee' }
                                }))}
                            >
                                Remove
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
