export const KeyDetailsBox = ({ image, dataname, data }) => {
  return (
    <div className="kd-box">
      <div className="kd-text">
        <p className="kd-value">
          {data !== undefined && data !== null ? data : 0}
        </p>
        <p className="kd-name">{dataname}</p>
      </div>

      <div className="kd-icon-wrap">
        <img src={image} className="kd-icon" alt={dataname} />
      </div>

      <style>{`
        .kd-box {
          background: rgba(0,0,0,0.012);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .kd-box:hover {
          border-color: rgba(99,102,241,0.25);
          background: rgba(99,102,241,0.025);
        }

        .kd-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .kd-value {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          color: #0f172a;
          line-height: 1;
        }

        .kd-name {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(0,0,0,0.4);
        }

        .kd-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kd-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};