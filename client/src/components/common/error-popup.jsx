const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
  .err-popup {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-left: 3px solid rgba(220, 38, 38, 0.7);
    border-radius: 12px;
    padding: 12px 18px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.09);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(0,0,0,0.7);
    font-weight: 400;
    white-space: nowrap;
    max-width: 90vw;
    animation: errIn 0.3s ease both;
  }
  .err-dot {
    width: 8px; height: 8px;
    background: rgba(220,38,38,0.7);
    border-radius: 50%;
    flex-shrink: 0;
  }
  @keyframes errIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`

export const ErrorPopup = ({ error }) => {
    return (
        <>
            <style>{styles}</style>
            <div className="err-popup">
                <span className="err-dot" />
                {error}
            </div>
        </>
    )
}
