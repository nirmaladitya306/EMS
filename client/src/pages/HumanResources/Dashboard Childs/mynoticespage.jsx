import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyNotices } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .mn-count-card {
    background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.18);
    border-radius: 14px; padding: 12px 18px; text-align: center;
    font-family: 'DM Sans', sans-serif;
  }
  .mn-count-value { font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: #6366f1; line-height: 1; }
  .mn-count-label { font-size: 11px; color: var(--ems-text-faint, rgba(0,0,0,0.38)); margin-top: 3px; }

  .mn-notice-card {
    background: var(--ems-surface, #ffffff);
    border: 1px solid var(--ems-surface-border, rgba(0,0,0,0.07));
    border-radius: 14px; padding: 16px 18px;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .mn-notice-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.04); }
  .mn-notice-title { font-size: 14px; font-weight: 600; color: var(--ems-text-primary, #0f172a); margin: 0 0 3px; }
  .mn-notice-sub   { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.4)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mn-notice-date  { font-size: 11px; color: var(--ems-text-faint, rgba(0,0,0,0.35)); }
  .mn-notice-by    { font-size: 12px; color: #6366f1; margin-top: 2px; }

  .mn-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
  }
  .mn-modal {
    background: var(--ems-modal-bg, #ffffff); border-radius: 20px;
    padding: 28px 30px; width: 100%; max-width: 520px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; gap: 14px;
    font-family: 'DM Sans', sans-serif;
  }
  .mn-modal-title { font-family: 'DM Serif Display', serif; font-size: 1.25rem; color: var(--ems-text-primary, #0f172a); letter-spacing: -0.02em; margin: 0; }
  .mn-modal-meta  { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.38)); margin: 0; }
  .mn-modal-divider { height: 1px; background: var(--ems-border, rgba(0,0,0,0.06)); }
  .mn-modal-body  { font-size: 13px; color: var(--ems-text-muted, rgba(0,0,0,0.65)); line-height: 1.7; white-space: pre-wrap; margin: 0; }
  .mn-modal-footer { display: flex; justify-content: flex-end; padding-top: 4px; border-top: 1px solid var(--ems-border, rgba(0,0,0,0.06)); }
`

const NoticeDetail = ({ open, notice, onClose }) => {
    if (!open || !notice) return null
    return (
        <div className="mn-modal-overlay">
            <div className="mn-modal">
                <h2 className="mn-modal-title">{notice.title}</h2>
                <p className="mn-modal-meta">
                    Issued by {notice.createdby?.firstname} {notice.createdby?.lastname} · {fmtDate(notice.createdAt)}
                </p>
                <div className="mn-modal-divider" />
                <p className="mn-modal-body">{notice.content}</p>
                <div className="mn-modal-footer">
                    <button className="pg-btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export const MyNoticesPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.EmployeeDashboardReducer)
    const notices  = state.notices || []

    const [detail, setDetail] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => { dispatch(HandleGetMyNotices()) }, [])
    useEffect(() => { if (state.fetchNotices) dispatch(HandleGetMyNotices()) }, [state.fetchNotices])

    const filtered = notices.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    )

    if (state.isLoading && !notices.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                <PageHeader eyebrow="Communications" title="My Notices" subtitle="Notices issued to you or your department">
                    <div className="mn-count-card">
                        <div className="mn-count-value">{notices.length}</div>
                        <div className="mn-count-label">Total Notices</div>
                    </div>
                </PageHeader>

                <input
                    type="text"
                    placeholder="Search notices..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pg-search"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
                    {filtered.length === 0 ? (
                        <div className="pg-empty">
                            <span className="pg-empty-icon">📋</span>
                            <p className="pg-empty-title">No notices found</p>
                            <p className="pg-empty-sub">Notices sent to you or your department will appear here.</p>
                        </div>
                    ) : filtered.map(n => (
                        <div key={n._id} className="mn-notice-card" onClick={() => setDetail(n)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="mn-notice-title">{n.title}</p>
                                    <p className="mn-notice-sub">{n.content}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p className="mn-notice-date">{fmtDate(n.createdAt)}</p>
                                    <p className="mn-notice-by">{n.createdby?.firstname} {n.createdby?.lastname}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <NoticeDetail open={!!detail} notice={detail} onClose={() => setDetail(null)} />

            </PageShell>
        </>
    )
}
