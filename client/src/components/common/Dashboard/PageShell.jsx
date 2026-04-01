const shellStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pg-root {
    font-family: 'DM Sans', sans-serif;
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    padding: 24px 20px;
    background: #ffffff;
    box-sizing: border-box;
    overflow: hidden;
  }
  .pg-content {
    flex: 1; overflow-y: auto;
    display: flex; flex-direction: column;
    gap: 18px; padding-right: 4px;
  }

  /* ── Header ── */
  .pg-header {
    display: flex; justify-content: space-between;
    align-items: flex-start; flex-wrap: wrap;
    gap: 12px; flex-shrink: 0;
  }
  .pg-eyebrow {
    font-size: 10px; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(99,102,241,0.75);
    font-weight: 600; display: flex; align-items: center;
    gap: 7px; margin-bottom: 5px;
  }
  .pg-eyebrow::before { content:''; height:1px; width:18px; background:rgba(99,102,241,0.4); }
  .pg-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.75rem; color: #0f172a;
    line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 4px;
  }
  .pg-subtitle { font-size: 12px; color: rgba(0,0,0,0.38); font-weight: 300; margin: 0; }

  /* ── Buttons ── */
  .pg-btn-primary {
    padding: 9px 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; border: none;
    border-radius: 10px; cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: 0.02em; white-space: nowrap;
  }
  .pg-btn-primary:hover  { opacity: 0.9; transform: translateY(-1px); }
  .pg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .pg-btn-ghost {
    padding: 9px 16px; background: transparent; color: rgba(0,0,0,0.5);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s; white-space: nowrap;
  }
  .pg-btn-ghost:hover { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.18); }
  .pg-btn-danger {
    padding: 9px 18px; background: rgba(239,68,68,0.08); color: #dc2626;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(220,38,38,0.2); border-radius: 10px; cursor: pointer;
    transition: background 0.15s; white-space: nowrap;
  }
  .pg-btn-danger:hover { background: rgba(239,68,68,0.14); }

  /* ── Stats strip ── */
  .pg-stats { display: grid; gap: 10px; flex-shrink: 0; }
  .pg-stat-card {
    background: rgba(0,0,0,0.012); border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 4px;
    transition: border-color 0.2s, background 0.2s;
  }
  .pg-stat-card:hover { border-color: rgba(99,102,241,0.2); background: rgba(99,102,241,0.025); }
  .pg-stat-value {
    font-family: 'DM Serif Display', serif;
    font-size: 1.7rem; color: #0f172a; line-height: 1; letter-spacing: -0.02em;
  }
  .pg-stat-label {
    font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.38);
    letter-spacing: 0.05em; text-transform: uppercase;
  }

  /* ── Filters ── */
  .pg-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; flex-shrink: 0; }
  .pg-search {
    padding: 8px 14px; border: 1px solid rgba(0,0,0,0.11);
    background: #fff; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; min-width: 200px;
  }
  .pg-search:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
  .pg-search::placeholder { color: rgba(0,0,0,0.3); }
  .pg-select {
    padding: 8px 12px; border: 1px solid rgba(0,0,0,0.11); background: #fff;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #0f172a; outline: none; cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .pg-select:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
  .pg-date {
    padding: 8px 12px; border: 1px solid rgba(0,0,0,0.11); background: #fff;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: #0f172a; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .pg-date:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
  .pg-pill {
    padding: 6px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 100px;
    font-size: 12px; font-weight: 500; color: rgba(0,0,0,0.5);
    background: transparent; cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .pg-pill:hover { border-color: rgba(99,102,241,0.35); color: #6366f1; }
  .pg-pill.active { background: linear-gradient(135deg,#6366f1,#8b5cf6); border-color: transparent; color: white; }

  /* ── Filter panel ── */
  .pg-filter-panel {
    background: rgba(0,0,0,0.012); border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px; padding: 14px 16px;
    display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; flex-shrink: 0;
  }
  .pg-filter-group { display: flex; flex-direction: column; gap: 4px; }
  .pg-filter-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(0,0,0,0.3);
  }

  /* ── Table ── */
  .pg-table-wrap {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    border-radius: 14px; border: 1px solid rgba(0,0,0,0.07);
    display: flex; flex-direction: column; min-height: 0;
  }
  .pg-table-head {
    display: grid; padding: 9px 16px;
    background: rgba(0,0,0,0.025); border-bottom: 1px solid rgba(0,0,0,0.06);
    position: sticky; top: 0; z-index: 2; flex-shrink: 0;
  }
  .pg-th { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,0,0,0.3); }
  .pg-table-row {
    display: grid; padding: 11px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    align-items: center; transition: background 0.12s;
    font-size: 13px; color: rgba(0,0,0,0.7);
  }
  .pg-table-row:last-child { border-bottom: none; }
  .pg-table-row:hover { background: rgba(99,102,241,0.03); }
  .pg-td-name  { font-weight: 500; color: #0f172a; }
  .pg-td-sub   { font-size: 11px; color: rgba(0,0,0,0.35); margin-top: 1px; }
  .pg-td-muted { color: rgba(0,0,0,0.4); font-size: 12px; }

  /* ── Action buttons ── */
  .pg-action-btn {
    padding: 4px 10px; font-size: 11px; font-weight: 500;
    border-radius: 7px; border: 1px solid rgba(0,0,0,0.12);
    background: transparent; color: rgba(0,0,0,0.55);
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .pg-action-btn:hover    { background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.2); }
  .pg-action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .pg-action-btn.indigo   { border-color: rgba(99,102,241,0.25); color: #6366f1; }
  .pg-action-btn.indigo:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.4); }
  .pg-action-btn.red      { border-color: rgba(220,38,38,0.25); color: #dc2626; }
  .pg-action-btn.red:hover    { background: rgba(220,38,38,0.06); border-color: rgba(220,38,38,0.4); }
  .pg-action-btn.green    { border-color: rgba(22,163,74,0.25); color: #16a34a; }
  .pg-action-btn.green:hover  { background: rgba(22,163,74,0.06); border-color: rgba(22,163,74,0.4); }

  /* ── Empty state ── */
  .pg-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; padding: 60px 20px;
    color: rgba(0,0,0,0.3); text-align: center; flex: 1;
  }
  .pg-empty-icon  { font-size: 3rem; }
  .pg-empty-title { font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.45); }
  .pg-empty-sub   { font-size: 12px; color: rgba(0,0,0,0.28); max-width: 280px; line-height: 1.6; }

  /* ── Pagination ── */
  .pg-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06);
    flex-shrink: 0; flex-wrap: wrap; gap: 10px;
  }
  .pg-pagination-info { font-size: 12px; color: rgba(0,0,0,0.38); }
  .pg-page-btn {
    padding: 5px 11px; font-size: 12px; border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px; background: transparent; color: rgba(0,0,0,0.55);
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
  }
  .pg-page-btn:hover:not(:disabled) { background: rgba(0,0,0,0.05); }
  .pg-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .pg-page-btn.active { background: linear-gradient(135deg,#6366f1,#8b5cf6); border-color: transparent; color: white; }

  /* ── Section card ── */
  .pg-section {
    background: rgba(0,0,0,0.012); border: 1px solid rgba(0,0,0,0.07);
    border-radius: 16px; padding: 18px 20px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .pg-section-title {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(0,0,0,0.35);
    border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 10px;
  }

  /* ── Info strip ── */
  .pg-info-strip {
    background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px; padding: 14px 18px;
    display: flex; flex-wrap: wrap; gap: 14px; align-items: center; flex-shrink: 0;
  }
  .pg-info-chip {
    font-size: 11px; background: white; border: 1px solid rgba(99,102,241,0.15);
    color: rgba(99,102,241,0.8); border-radius: 100px; padding: 3px 10px;
  }

  /* ── Tabs ── */
  .pg-tabs { display: flex; border-bottom: 1px solid rgba(0,0,0,0.07); flex-shrink: 0; }
  .pg-tab {
    padding: 9px 18px; font-size: 13px; font-weight: 500;
    color: rgba(0,0,0,0.4); border-bottom: 2px solid transparent;
    cursor: pointer; transition: color 0.15s, border-color 0.15s;
    background: transparent; border-top: none; border-left: none; border-right: none;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .pg-tab:hover  { color: rgba(0,0,0,0.6); }
  .pg-tab.active { color: #6366f1; border-bottom-color: #6366f1; }

  /* ── Modal ── */
  .pg-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
  }
  .pg-modal {
    background: #ffffff; border-radius: 20px; padding: 28px 32px;
    width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; gap: 20px;
  }
  .pg-modal-title { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: #0f172a; letter-spacing: -0.02em; margin: 0; }
  .pg-modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.06); }

  /* ── Form ── */
  .pg-field { display: flex; flex-direction: column; gap: 5px; }
  .pg-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; color: rgba(0,0,0,0.4); }
  .pg-input, .pg-textarea {
    width: 100%; padding: 9px 13px; border: 1px solid rgba(0,0,0,0.12);
    background: #fff; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .pg-textarea { resize: vertical; min-height: 80px; }
  .pg-input:focus, .pg-textarea:focus { border-color: rgba(99,102,241,0.45); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
  .pg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pg-divider { height: 1px; background: rgba(0,0,0,0.06); flex-shrink: 0; }
`

export const PageShell = ({ children }) => (
  <>
    <style>{shellStyles}</style>
    <div className="pg-root">
      <div className="pg-content">
        {children}
      </div>
    </div>
  </>
)

export const PageHeader = ({ eyebrow, title, subtitle, children }) => (
  <div className="pg-header">
    <div>
      <div className="pg-eyebrow">{eyebrow}</div>
      <h1 className="pg-title">{title}</h1>
      {subtitle && <p className="pg-subtitle">{subtitle}</p>}
    </div>
    {children && (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    )}
  </div>
)
