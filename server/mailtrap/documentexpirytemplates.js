export const DOCUMENT_EXPIRY_ALERT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Expiry Alert</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, {headerColor1}, {headerColor2}); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">{headerTitle}</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {employeeName},</p>
    <p>{alertMessage}</p>
    <div style="background-color: {badgeColor}; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
      <p style="color: white; font-size: 14px; margin: 0 0 6px 0;">Document</p>
      <p style="color: white; font-size: 20px; font-weight: bold; margin: 0 0 6px 0;">{documentName}</p>
      <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 0;">Type: {documentType} &nbsp;|&nbsp; Expires: {expiryDate}</p>
    </div>
    <p>{actionMessage}</p>
    <p>Best regards,<br>HR Team — Employee Management System</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`