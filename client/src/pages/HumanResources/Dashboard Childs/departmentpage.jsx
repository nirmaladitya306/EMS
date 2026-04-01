import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { HRDepartmentTabs } from "../../../components/common/Dashboard/departmentTabs"
import { CreateDepartmentDialogBox } from "../../../components/common/Dashboard/dialogboxes"

export const HRDepartmentPage = () => {
    return (
        <PageShell>
            <PageHeader
                eyebrow="People"
                title="Departments"
                subtitle="Create and manage your organisation's departments"
            >
                <CreateDepartmentDialogBox />
            </PageHeader>
            <HRDepartmentTabs />
        </PageShell>
    )
}
