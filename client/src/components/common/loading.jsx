const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  .loading-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .loading-ring {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(99,102,241,0.15);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  .loading-text {
    font-size: 13px;
    font-weight: 400;
    color: rgba(0,0,0,0.35);
    letter-spacing: 0.04em;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`

export const Loading = ({ height }) => {
    return (
        <>
            <style>{styles}</style>
            <div className={`loading-root ${height ? height : 'h-screen'} w-full`}>
                <div className="loading-ring" />
                <p className="loading-text">Loading</p>
            </div>
        </>
    )
}