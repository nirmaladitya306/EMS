import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const DataTable = ({ noticedata }) => {
    const Notices = [];

    // ✅ SAFE guard
    if (
        noticedata?.notices &&
        Array.isArray(noticedata.notices)
    ) {
        for (let index = 0; index < noticedata.notices.length; index++) {
            const notice = noticedata.notices[index];

            Notices.push({
                noticeID: index + 1,
                noticeTitle: notice?.title || "N/A",
                noticeAudience: notice?.audience || "N/A",
                noticeCreatedBy: notice?.createdby
                    ? `${notice.createdby.firstname || ""} ${notice.createdby.lastname || ""}`
                    : "N/A",
            });
        }
    }

    return (
        <div className="overflow-auto h-full">
            <div className="notices-heading mx-3 my-2">
                <p className="min-[250px]:text-xl xl:text-3xl font-bold min-[250px]:text-center sm:text-start">
                    Recent Notices
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">
                            Notice ID
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Audience</TableHead>
                        <TableHead className="text-right">
                            Created By
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {Notices.length > 0 ? (
                        Notices.map((Notice) => (
                            <TableRow key={Notice.noticeID}>
                                <TableCell className="font-medium">
                                    {Notice.noticeID}
                                </TableCell>
                                <TableCell>
                                    {Notice.noticeTitle}
                                </TableCell>
                                <TableCell>
                                    {Notice.noticeAudience}
                                </TableCell>
                                <TableCell className="text-right">
                                    {Notice.noticeCreatedBy}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                No notices available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};