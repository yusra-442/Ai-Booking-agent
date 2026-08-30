// Email Templates for Booking Notifications

export interface AppointmentEmailData {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  date: string
  time: string
  serviceName: string
  businessName: string
  reason?: string
}

export function newAppointmentOwnerEmail(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .detail { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; color: #111827; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Appointment Booked!</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>A new appointment has been booked at <strong>${data.businessName}</strong>.</p>
      <div class="detail">
        <div class="detail-row">
          <span class="label">Customer</span>
          <span class="value">${data.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Contact</span>
          <span class="value">${data.customerEmail || data.customerPhone || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date</span>
          <span class="value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time</span>
          <span class="value">${data.time}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service</span>
          <span class="value">${data.serviceName}</span>
        </div>
      </div>
      <p>Please review and confirm the appointment in your dashboard.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from your Booking Agent</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function newAppointmentCustomerEmail(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .detail { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; color: #111827; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello ${data.customerName},</p>
      <p>Your appointment with <strong>${data.businessName}</strong> has been confirmed.</p>
      <div class="detail">
        <div class="detail-row">
          <span class="label">Date</span>
          <span class="value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time</span>
          <span class="value">${data.time}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service</span>
          <span class="value">${data.serviceName}</span>
        </div>
      </div>
      <p>If you need to reschedule or cancel, please contact us.</p>
    </div>
    <div class="footer">
      <p>Thank you for choosing ${data.businessName}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function cancellationOwnerEmail(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .detail { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; color: #111827; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Cancelled</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>An appointment has been cancelled at <strong>${data.businessName}</strong>.</p>
      <div class="detail">
        <div class="detail-row">
          <span class="label">Customer</span>
          <span class="value">${data.customerName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Original Date</span>
          <span class="value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="label">Original Time</span>
          <span class="value">${data.time}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service</span>
          <span class="value">${data.serviceName}</span>
        </div>
        ${data.reason ? `<div class="detail-row"><span class="label">Reason</span><span class="value">${data.reason}</span></div>` : ''}
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from your Booking Agent</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function cancellationCustomerEmail(data: AppointmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .detail { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 14px; }
    .value { font-weight: 600; color: #111827; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Cancelled</h1>
    </div>
    <div class="content">
      <p>Hello ${data.customerName},</p>
      <p>Your appointment with <strong>${data.businessName}</strong> has been cancelled.</p>
      <div class="detail">
        <div class="detail-row">
          <span class="label">Date</span>
          <span class="value">${data.date}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time</span>
          <span class="value">${data.time}</span>
        </div>
        <div class="detail-row">
          <span class="label">Service</span>
          <span class="value">${data.serviceName}</span>
        </div>
      </div>
      <p>If you would like to reschedule, please visit our booking page or contact us.</p>
    </div>
    <div class="footer">
      <p>Thank you for choosing ${data.businessName}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
