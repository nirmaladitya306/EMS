export const DataTable = ({ noticedata }) => {
    let Notices = [];

    // ✅ Safe data parsing
    if (
        noticedata?.notices &&
        Array.isArray(noticedata.notices)
    ) {
        Notices = noticedata.notices.map((notice, index) => ({
            noticeID: index + 1,
            noticeTitle: notice?.title || "N/A",
            noticeAudience: notice?.audience || "N/A",
            noticeCreatedBy: notice?.createdby
                ? `${notice.createdby.firstname || ""} ${notice.createdby.lastname || ""}`
                : "N/A",
        }));
    }

    return (
        <div className="dt-root">
            <div className="dt-header">
                <p className="dt-title">Recent Notices</p>
            </div>

            <div className="dt-table-wrap">
                <div className="dt-table-head">
                    <div>Notice ID</div>
                    <div>Title</div>
                    <div>Audience</div>
                    <div style={{ textAlign: "right" }}>Created By</div>
                </div>

                <div className="dt-table-body">
                    {Notices.length > 0 ? (
                        Notices.map((notice) => (
                            <div className="dt-row" key={notice.noticeID}>
                                <div className="dt-id">
                                    {notice.noticeID}
                                </div>

                                <div className="dt-title-cell">
                                    {notice.noticeTitle}
                                </div>

                                <div className="dt-muted">
                                    {notice.noticeAudience}
                                </div>

                                <div
                                    className="dt-muted"
                                    style={{ textAlign: "right" }}
                                >
                                    {notice.noticeCreatedBy}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="dt-empty">
                            No notices available
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .dt-root {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .dt-header {
                    margin-bottom: 8px;
                }

                .dt-title {
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: rgba(0,0,0,0.35);
                }

                .dt-table-wrap {
                    flex: 1;
                    border: 1px solid rgba(0,0,0,0.07);
                    border-radius: 14px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .dt-table-head {
                    display: grid;
                    grid-template-columns: 80px 1fr 1fr 1fr;
                    padding: 10px 14px;
                    background: rgba(0,0,0,0.025);
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: rgba(0,0,0,0.3);
                }

                .dt-table-body {
                    flex: 1;
                    overflow-y: auto;
                }

                .dt-row {
                    display: grid;
                    grid-template-columns: 80px 1fr 1fr 1fr;
                    padding: 12px 14px;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    font-size: 13px;
                    color: rgba(0,0,0,0.7);
                    align-items: center;
                    transition: background 0.15s ease;
                }

                .dt-row:hover {
                    background: rgba(99,102,241,0.04);
                }

                .dt-id {
                    font-weight: 500;
                    color: #0f172a;
                }

                .dt-title-cell {
                    font-weight: 500;
                    color: #0f172a;
                }

                .dt-muted {
                    color: rgba(0,0,0,0.45);
                    font-size: 12px;
                }

                .dt-empty {
                    padding: 40px;
                    text-align: center;
                    font-size: 13px;
                    color: rgba(0,0,0,0.35);
                }
            `}</style>
        </div>
    );
};