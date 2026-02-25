import { Resend } from "resend";
import twilio from 'twilio';
import { prisma } from './prisma';

export async function sendLeadNotifications(params: {
  clientId: string;
  leadId: string;
  message: string;
  dashboardUrl: string;
  sendEmail: boolean;
  sendSms: boolean;
  recipientEmail: string;
  recipientSms?: string;
}) {
  const { clientId, leadId, message, dashboardUrl, sendEmail, sendSms, recipientEmail, recipientSms } = params;

  if (sendEmail && process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: recipientEmail.split(',').map((v) => v.trim()),
        subject: 'New Lead Captured',
        text: `${message}\n\nDashboard: ${dashboardUrl}`
      });
      await prisma.notificationLog.create({ data: { clientId, leadId, channel: 'email', success: true } });
    } catch (error) {
      await prisma.notificationLog.create({ data: { clientId, leadId, channel: 'email', success: false, error: `${error}` } });
    }
  }

  if (sendSms && recipientSms && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        from: process.env.TWILIO_FROM_NUMBER,
        to: recipientSms,
        body: `${message}\n${dashboardUrl}`.slice(0, 1500)
      });
      await prisma.notificationLog.create({ data: { clientId, leadId, channel: 'sms', success: true } });
    } catch (error) {
      await prisma.notificationLog.create({ data: { clientId, leadId, channel: 'sms', success: false, error: `${error}` } });
    }
  }
}
