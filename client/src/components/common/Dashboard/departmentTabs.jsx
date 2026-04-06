import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { HandleGetHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk"
import { Loading } from "../loading.jsx"
import { HeadingBar } from "./ListDesigns.jsx"
import { DepartmentListItems } from "./ListDesigns.jsx"
import { useToast } from "../../../hooks/use-toast.js"
import { EmployeesIDSDialogBox, ModifyDepartmentDialogBox } from "./dialogboxes.jsx"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .dept-root { font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; gap: 16px; height: 100%; overflow: hidden; }

  /* ── Department selector bar ── */
  .dept-selector-bar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; flex-shrink: 0;
  }
  .dept-selector-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: rgba(0,0,0,0.35);
  }
  .dept-select-wrap { display: flex; align-items: center; gap: 10px; }
  .dept-native-select {
    padding: 8px 32px 8px 12px; border: 1px solid rgba(0,0,0,0.11);
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 10px center;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #0f172a; outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
    transition: border-color 0.2s, box-shadow 0.2s; min-width: 180px;
  }
  .dept-native-select:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }

  .dept-settings-btn {
    padding: 8px 14px; background: transparent; color: rgba(0,0,0,0.5);
    border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.15s, border-color 0.15s;
  }
  .dept-settings-btn:hover { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.18); }

  /* ── All departments grid ── */
  .dept-grid { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1; }
  .dept-card {
    background: rgba(0,0,0,0.012); border: 1px solid rgba(0,0,0,0.07);
    border-radius: 16px; padding: 18px 20px;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    transition: border-color 0.2s, background 0.2s;
  }
  .dept-card:hover { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.02); }
  .dept-card-name {
    font-family: 'DM Serif Display', serif;
    font-size: 1.2rem; color: #0f172a; letter-spacing: -0.01em; margin: 0 0 5px;
  }
  .dept-card-desc { font-size: 13px; color: rgba(0,0,0,0.4); font-weight: 300; line-height: 1.5; }
  .dept-card-meta { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  .dept-card-chip {
    font-size: 11px; background: rgba(99,102,241,0.06);
    border: 1px solid rgba(99,102,241,0.14);
    color: rgba(99,102,241,0.8); border-radius: 100px; padding: 2px 9px;
  }
  .dept-view-btn {
    padding: 7px 16px; background: transparent; color: #6366f1;
    border: 1px solid rgba(99,102,241,0.3); border-radius: 9px;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500; white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .dept-view-btn:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.5); }

  /* ── Department detail ── */
  .dept-detail { display: flex; flex-direction: column; gap: 14px; overflow: hidden; flex: 1; }
  .dept-detail-header {
    background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px; padding: 16px 18px;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;
    flex-shrink: 0;
  }
  .dept-detail-name {
    font-family: 'DM Serif Display', serif;
    font-size: 1.4rem; color: #0f172a; letter-spacing: -0.02em; margin: 0 0 4px;
  }
  .dept-detail-desc { font-size: 13px; color: rgba(0,0,0,0.4); font-weight: 300; line-height: 1.5; max-width: 480px; }

  /* ── Tab bar ── */
  .dept-tabs-bar {
    display: flex; border-bottom: 1px solid rgba(0,0,0,0.07); flex-shrink: 0;
  }
  .dept-tab {
    padding: 9px 18px; font-size: 13px; font-weight: 500;
    color: rgba(0,0,0,0.4); border-bottom: 2px solid transparent;
    cursor: pointer; transition: color 0.15s, border-color 0.15s;
    background: transparent; border-top: none; border-left: none; border-right: none;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .dept-tab:hover  { color: rgba(0,0,0,0.6); }
  .dept-tab.active { color: #6366f1; border-bottom-color: #6366f1; }

  .dept-tab-content { flex: 1; overflow-y: auto; }
  .dept-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 8px; padding: 48px 20px;
    color: rgba(0,0,0,0.3); text-align: center;
  }
`

export const HRDepartmentTabs = () => {
    const { toast } = useToast()
    const HRDepartmentState = useSelector((state) => state.HRDepartmentPageReducer)
    const dispatch = useDispatch()
   const [department, setDepartment] = useState("ALL")

    useEffect(() => {
        if (HRDepartmentState.fetchData) {
            dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
        }
        if (HRDepartmentState?.error?.status) {
            toast({ variant: "destructive", title: "Something went wrong.", description: HRDepartmentState.error.message })
        }
        if (HRDepartmentState?.success?.status) {
            toast({ title: "Success!", description: HRDepartmentState.success.message })
        }
    }, [HRDepartmentState.fetchData, HRDepartmentState.error, HRDepartmentState.success])

    useEffect(() => {
        dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }))
    }, [])

    if (HRDepartmentState.isLoading) return <Loading />

    const rawData = HRDepartmentState.data;

const departments = Array.isArray(rawData)
  ? rawData
      .map(d => d?.data || d)
      .filter(d => d && d.name)
      .map(d => ({
          ...d,
          employees: Array.isArray(d.employees) ? d.employees : [],
          notice: Array.isArray(d.notice) ? d.notice : []
      }))
  : [];
    const currentDept = department !== "ALL"
  ? departments.find(d => d._id === department)
  : null

    return (
        <>
            <style>{styles}</style>
            <div className="dept-root">

                {/* ── Selector bar ── */}
                <div className="dept-selector-bar">
                    <div className="dept-select-wrap">
                        <span className="dept-selector-label">Department</span>
                        <select
                            className="dept-native-select"
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map(d => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    {department !== "All Departments" && (
                        <button className="dept-settings-btn" onClick={() => setDepartment("ALL")}>
                            ← Back to all
                        </button>
                    )}
                </div>

                {/* ── All departments view ── */}
                {department === "ALL" && (
                    <div className="dept-grid">
                        {departments.length === 0 ? (
                            <div className="dept-empty">
                                <span style={{ fontSize: '2.5rem' }}>🏢</span>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(0,0,0,0.45)' }}>No departments yet</p>
                                <p style={{ fontSize: '12px' }}>Create your first department to get started.</p>
                            </div>
                        ) : departments.map(dept => (
                            <div key={dept._id} className="dept-card">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h2 className="dept-card-name">{dept.name}</h2>
                                    <p className="dept-card-desc">{dept.description}</p>
                                    <div className="dept-card-meta">
                                        <span className="dept-card-chip">👥 {dept.employees?.length || 0} employees</span>
                                        <span className="dept-card-chip">📋 {dept.notice?.length || 0} notices</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                                    <ModifyDepartmentDialogBox dept={dept} />
                                    <button className="dept-view-btn" onClick={() => setDepartment(dept._id)}>View →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Single department detail ── */}
                {department !== "ALL" && currentDept && (
                    <DepartmentDetail dept={currentDept} />
                )}
            </div>
        </>
    )
}

const DepartmentDetail = ({ dept }) => {
    const [activeTab, setActiveTab] = useState('employees')
    const table_headings_employees = ["Full Name", "Email", "Contact Number", "Remove"]
    const table_headings_notices   = ["Title", "Audience", "Created By", ""]

    return (
        <div className="dept-detail">
            {/* Info strip */}
            <div className="dept-detail-header">
                <div>
                    <h2 className="dept-detail-name">{dept.name}</h2>
                    <p className="dept-detail-desc">{dept.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ModifyDepartmentDialogBox dept={dept} />
                    <EmployeesIDSDialogBox DepartmentID={dept._id} />
                </div>
            </div>

            {/* Tabs */}
            <div className="dept-tabs-bar">
                <button
                    className={`dept-tab ${activeTab === 'employees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    Employees ({dept.employees?.length || 0})
                </button>
                <button
                    className={`dept-tab ${activeTab === 'notices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notices')}
                >
                    Notices ({dept.notice?.length || 0})
                </button>
            </div>

            {/* Tab content */}
            <div className="dept-tab-content">
                {activeTab === 'employees' && (
                    <div className="pg-table-wrap" style={{ flex: 'none', maxHeight: '100%' }}>
                        <div className={`pg-table-head grid min-[250px]:grid-cols-2 sm:grid-cols-4`}>
                            {table_headings_employees.map(h => (
                                <span key={h} className={`pg-th ${h === 'Email' || h === 'Contact Number' ? 'min-[250px]:hidden sm:block' : ''}`}>{h}</span>
                            ))}
                        </div>
                        {dept.employees?.length === 0 ? (
                            <div className="dept-empty">
                                <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)' }}>No employees in this department yet.</p>
                            </div>
                        ) : (
                            <DepartmentListItems TargetedState={dept} />
                        )}
                    </div>
                )}
                {activeTab === 'notices' && (
                    <div className="pg-table-wrap" style={{ flex: 'none', maxHeight: '100%' }}>
                        <div className={`pg-table-head grid grid-cols-3`}>
                            {['Title', 'Audience', 'Created By'].map(h => (
                                <span key={h} className="pg-th">{h}</span>
                            ))}
                        </div>
                        {dept.notice?.length === 0 ? (
                            <div className="dept-empty">
                                <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.35)' }}>No notices issued to this department.</p>
                            </div>
                        ) : dept.notice?.map((n, i) => (
                            <div key={i} className="pg-table-row grid grid-cols-3">
                                <span className="pg-td-name truncate">{n.title || '—'}</span>
                                <span className="pg-td-muted">{n.audience || '—'}</span>
                                <span className="pg-td-muted">{n.createdby?.firstname} {n.createdby?.lastname}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}