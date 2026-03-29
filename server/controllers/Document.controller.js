import { Document } from '../models/Document.model.js'
import { Employee } from '../models/Employee.model.js'
import { transporter } from '../mailtrap/mailtrap.config.js'
import { DOCUMENT_EXPIRY_ALERT_TEMPLATE } from '../mailtrap/documentexpirytemplates.js'
import dayjs from 'dayjs'
import { createLog } from '../utils/activityLogger.js'

// ─── Helper: build and send an expiry alert email ────────────────────────────
const sendExpiryEmail = async (employeeEmail, employeeName, doc, daysLeft) => {
    let headerTitle, headerColor1, headerColor2, badgeColor, alertMessage, actionMessage

    if (daysLeft <= 0) {
        headerTitle    = 'Document Expired'
        headerColor1   = '#c0392b'
        headerColor2   = '#e74c3c'
        badgeColor     = '#c0392b'
        alertMessage   = `This is to inform you that the following document has <strong>expired</strong>.`
        actionMessage  = 'Please renew this document as soon as possible and upload the updated version to HR.'
    } else if (daysLeft <= 7) {
        headerTitle    = 'Urgent: Document Expiring in 7 Days'
        headerColor1   = '#e67e22'
        headerColor2   = '#f39c12'
        badgeColor     = '#e67e22'
        alertMessage   = `Your document is expiring in <strong>${daysLeft} day(s)</strong>. Immediate action is required.`
        actionMessage  = 'Please renew this document immediately and notify HR once done.'
    } else if (daysLeft <= 30) {
        headerTitle    = 'Document Expiring in 30 Days'
        headerColor1   = '#f39c12'
        headerColor2   = '#f1c40f'
        badgeColor     = '#d68910'
        alertMessage   = `Your document is expiring in <strong>${daysLeft} day(s)</strong>. Please begin the renewal process.`
        actionMessage  = 'Initiate renewal early to avoid any compliance issues.'
    } else {
        headerTitle    = 'Document Expiry Reminder — 90 Days'
        headerColor1   = '#2980b9'
        headerColor2   = '#3498db'
        badgeColor     = '#2980b9'
        alertMessage   = `This is an early reminder that your document will expire in <strong>${daysLeft} day(s)</strong>.`
        actionMessage  = 'No immediate action needed, but please plan for renewal.'
    }

    const html = DOCUMENT_EXPIRY_ALERT_TEMPLATE
        .replace('{headerTitle}',    headerTitle)
        .replace('{headerColor1}',   headerColor1)
        .replace('{headerColor2}',   headerColor2)
        .replace('{badgeColor}',     badgeColor)
        .replace('{employeeName}',   employeeName)
        .replace('{alertMessage}',   alertMessage)
        .replace('{documentName}',   doc.documentname)
        .replace('{documentType}',   doc.documenttype)
        .replace('{expiryDate}',     dayjs(doc.expirydate).format('DD MMM YYYY'))
        .replace('{actionMessage}',  actionMessage)

    try {
        await transporter.sendMail({
            from: '"EMS" <no-reply@ems.com>',
            to: employeeEmail,
            subject: headerTitle,
            html
        });
        return true
    } catch (err) {
        console.error('Document expiry email error:', err.message)
        return false
    }
}

// ─── Create a document record ────────────────────────────────────────────────
export const HandleCreateDocument = async (req, res) => {
    try {
        const { employeeID, documentname, documenttype, documentnumber, issuedate, expirydate, notes } = req.body

        if (!employeeID || !documentname || !documenttype || !expirydate) {
            return res.status(400).json({ success: false, message: 'Employee ID, document name, type, and expiry date are required' })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' })
        }

        const today      = dayjs()
        const expiry     = dayjs(expirydate)
        const daysLeft   = expiry.diff(today, 'day')
        let status = 'Valid'
        if (daysLeft < 0)        status = 'Expired'
        else if (daysLeft <= 30) status = 'Expiring Soon'

        const document = await Document.create({
            employee:       employeeID,
            documentname,
            documenttype,
            documentnumber: documentnumber || '',
            issuedate:      issuedate ? new Date(issuedate) : undefined,
            expirydate:     new Date(expirydate),
            status,
            notes:          notes || '',
            organizationID: req.ORGID
        })

        const { HumanResources: HR1 } = await import('../models/HR.model.js')
        const hrDoc = await HR1.findById(req.HRid).select('firstname lastname')
        const hrDocName = hrDoc ? `${hrDoc.firstname} ${hrDoc.lastname}` : 'HR Admin'

        await createLog({
            actorID: req.HRid, actorName: hrDocName,
            actorRole: 'HR-Admin', action: 'DOCUMENT_CREATED',
            description: `${hrDocName} added document "${documentname}" (${documenttype}) for employee`,
            targetID: document._id, targetModel: 'Document',
            organizationID: req.ORGID, req
        })
        return res.status(201).json({ success: true, message: 'Document created successfully', data: document })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
export const HandleGetAllDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ organizationID: req.ORGID })
            .populate('employee', 'firstname lastname email department')
            .sort({ expirydate: 1 })

        // Refresh status on each doc before returning
        const today = dayjs()
        for (const doc of documents) {
            const daysLeft = dayjs(doc.expirydate).diff(today, 'day')
            const newStatus = daysLeft < 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Valid'
            if (doc.status !== newStatus) {
                doc.status = newStatus
                await doc.save()
            }
        }

        return res.status(200).json({ success: true, message: 'Documents fetched successfully', data: documents, type: 'AllDocuments' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get documents for a single employee (employee self-view) ────────────────
export const HandleGetMyDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ employee: req.EMid, organizationID: req.ORGID })
            .sort({ expirydate: 1 })

        // Refresh status on each doc before returning
        const today = new Date()
        for (const doc of documents) {
            const daysLeft = Math.ceil((new Date(doc.expirydate) - today) / (1000 * 60 * 60 * 24))
            const newStatus = daysLeft < 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Valid'
            if (doc.status !== newStatus) {
                doc.status = newStatus
                await doc.save()
            }
        }

        return res.status(200).json({ success: true, data: documents, type: 'MyDocuments' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get documents for a single employee (HR view) ────────────────────────────
export const HandleGetEmployeeDocuments = async (req, res) => {
    try {
        const { employeeID } = req.params
        const documents = await Document.find({ employee: employeeID, organizationID: req.ORGID })
            .sort({ expirydate: 1 })

        return res.status(200).json({ success: true, data: documents, type: 'EmployeeDocuments' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Update a document ───────────────────────────────────────────────────────
export const HandleUpdateDocument = async (req, res) => {
    try {
        const { documentID, documentname, documenttype, documentnumber, issuedate, expirydate, notes } = req.body

        if (!documentID) {
            return res.status(400).json({ success: false, message: 'Document ID is required' })
        }

        const doc = await Document.findOne({ _id: documentID, organizationID: req.ORGID })
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }

        if (documentname)   doc.documentname   = documentname
        if (documenttype)   doc.documenttype   = documenttype
        if (documentnumber !== undefined) doc.documentnumber = documentnumber
        if (issuedate)      doc.issuedate      = new Date(issuedate)
        if (notes !== undefined) doc.notes     = notes

        if (expirydate) {
            doc.expirydate  = new Date(expirydate)
            doc.alertssent  = { day90: false, day30: false, day7: false }
            const daysLeft  = dayjs(expirydate).diff(dayjs(), 'day')
            doc.status = daysLeft < 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Valid'
        }

        await doc.save()
        return res.status(200).json({ success: true, message: 'Document updated successfully', data: doc })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Delete a document ───────────────────────────────────────────────────────
export const HandleDeleteDocument = async (req, res) => {
    try {
        const { documentID } = req.params
        const doc = await Document.findOne({ _id: documentID, organizationID: req.ORGID })
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' })
        }
        await doc.deleteOne()

        const { HumanResources: HR2 } = await import('../models/HR.model.js')
        const hrDel = await HR2.findById(req.HRid).select('firstname lastname')
        const hrDelName = hrDel ? `${hrDel.firstname} ${hrDel.lastname}` : 'HR Admin'

        await createLog({
            actorID: req.HRid, actorName: hrDelName,
            actorRole: 'HR-Admin', action: 'DOCUMENT_DELETED',
            description: `${hrDelName} deleted document "${doc.documentname}"`,
            targetID: documentID, targetModel: 'Document',
            organizationID: req.ORGID, req
        })
        return res.status(200).json({ success: true, message: 'Document deleted successfully', type: 'DocumentDelete' })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Alert engine: run checks and send emails ────────────────────────────────
// Can be called manually (HR triggers it) or via a cron job
export const HandleRunAlertEngine = async (req, res) => {
    try {
        const today     = dayjs()
        const documents = await Document.find({ organizationID: req.ORGID })
            .populate('employee', 'firstname lastname email')

        let alertsSent  = 0
        let statusFixed = 0

        for (const doc of documents) {
            const daysLeft  = dayjs(doc.expirydate).diff(today, 'day')
            const employee  = doc.employee
            if (!employee)  continue

            const name  = `${employee.firstname} ${employee.lastname}`
            const email = employee.email

            // Update status
            const newStatus = daysLeft < 0 ? 'Expired' : daysLeft <= 30 ? 'Expiring Soon' : 'Valid'
            if (doc.status !== newStatus) {
                doc.status = newStatus
                statusFixed++
            }

            // Rule-based alert thresholds: 90, 30, 7 days
            if (daysLeft <= 90 && daysLeft > 30 && !doc.alertssent.day90) {
                const sent = await sendExpiryEmail(email, name, doc, daysLeft)
                if (sent) { doc.alertssent.day90 = true; alertsSent++ }
            }
            if (daysLeft <= 30 && daysLeft > 7 && !doc.alertssent.day30) {
                const sent = await sendExpiryEmail(email, name, doc, daysLeft)
                if (sent) { doc.alertssent.day30 = true; alertsSent++ }
            }
            if (daysLeft <= 7 && !doc.alertssent.day7) {
                const sent = await sendExpiryEmail(email, name, doc, daysLeft)
                if (sent) { doc.alertssent.day7 = true; alertsSent++ }
            }

            await doc.save()
        }

        const { HumanResources: HR3 } = await import('../models/HR.model.js')
        const hrAlert = await HR3.findById(req.HRid).select('firstname lastname')
        const hrAlertName = hrAlert ? `${hrAlert.firstname} ${hrAlert.lastname}` : 'HR Admin'

        await createLog({
            actorID: req.HRid, actorName: hrAlertName,
            actorRole: 'HR-Admin', action: 'DOCUMENT_ALERT_RUN',
            description: `${hrAlertName} ran document alert engine: ${alertsSent} alert(s) sent, ${statusFixed} status(es) updated`,
            meta: { alertsSent, statusFixed },
            organizationID: req.ORGID, req
        })
        return res.status(200).json({
            success: true,
            message: `Alert engine run complete. ${alertsSent} alert(s) sent, ${statusFixed} status(es) updated.`,
            alertsSent,
            statusFixed
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

// ─── Get summary counts for dashboard badge ──────────────────────────────────
export const HandleGetDocumentSummary = async (req, res) => {
    try {
        const today = dayjs()
        const docs  = await Document.find({ organizationID: req.ORGID })

        let valid = 0, expiringSoon = 0, expired = 0
        for (const doc of docs) {
            const daysLeft = dayjs(doc.expirydate).diff(today, 'day')
            if (daysLeft < 0)        expired++
            else if (daysLeft <= 30) expiringSoon++
            else                     valid++
        }

        return res.status(200).json({
            success: true,
            data: { total: docs.length, valid, expiringSoon, expired },
            type: 'DocumentSummary'
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}