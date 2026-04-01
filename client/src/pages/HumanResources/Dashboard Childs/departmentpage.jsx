import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { HRDepartmentTabs } from "../../../components/common/Dashboard/departmentTabs"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { CreateDepartmentDialogBox } from "../../../components/common/Dashboard/dialogboxes"
export const HRDepartmentPage = () => {
    return (
        <PageShell>
            <div className="deaprtment-heading flex justify-between items-center min-[250px]:flex-col min-[250px]:gap-2 min-[400px]:flex-row">
                <PageHeader eyebrow="People" title="Departments" subtitle="Create and manage your organisation's departments" />
                <CreateDepartmentDialogBox />
            </div>
            <HRDepartmentTabs />
        </PageShell>
    )
}