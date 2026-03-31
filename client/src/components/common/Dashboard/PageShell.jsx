const shellStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pg-root {
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px 20px;
    background: #ffffff;
  }

  .pg-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-right: 4px;
  }

  .pg-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .pg-eyebrow {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(99,102,241,0.7);
    font-weight: 600;
    margin-bottom: 6px;
  }

  .pg-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.7rem;
    color: #0f172a;
    margin: 0;
  }

  .pg-subtitle {
    font-size: 12px;
    color: rgba(0,0,0,0.4);
  }

  .pg-section {
    background: rgba(0,0,0,0.012);
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 16px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

export const PageShell = ({ children }) => (
  <>
    <style>{shellStyles}</style>
    <div className="pg-root">
      <div className="pg-content">
        {children}
      </div>
    </div>
  </>
);

export const PageHeader = ({ eyebrow, title, subtitle }) => (
  <div className="pg-header">
    <div>
      <div className="pg-eyebrow">{eyebrow}</div>
      <h1 className="pg-title">{title}</h1>
      {subtitle && <p className="pg-subtitle">{subtitle}</p>}
    </div>
  </div>
);