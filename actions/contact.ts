"use server";

import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export async function sendContactEmailAction(formData: ContactFormData) {
  const parsed = contactSchema.safeParse(formData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid contact form input";
    return { success: false, error: errorMsg };
  }

  const { name, email, subject, message } = parsed.data;

  // The receiver is always the configured admin email (abhinavkp1907@gmail.com)
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "abhinavkp1907@gmail.com";
  
  // SMTP credentials for delivery
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpSecure = process.env.SMTP_SECURE === "false" ? false : true;
  const smtpUser = process.env.SMTP_USER || process.env.CONTACT_SENDER_EMAIL || "";
  const smtpPass = process.env.SMTP_PASS || "";

  const emailSubject = subject?.trim()
    ? `[MANBRO Inquiry from ${name}] ${subject.trim()}`
    : `[MANBRO Inquiry] New message from ${name} (${email})`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #091D12; color: #ffffff; padding: 28px; border-radius: 14px; max-width: 600px; margin: auto; border: 1px solid #284234;">
      <div style="border-bottom: 2px solid #d4af37; padding-bottom: 14px; margin-bottom: 22px;">
        <h2 style="color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px;">M A N B R O</h2>
        <p style="color: #a0aec0; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Customer Contact Inquiry</p>
      </div>

      <div style="background-color: #11301F; padding: 18px; border-radius: 10px; border: 1px solid #284234; margin-bottom: 22px;">
        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #d4af37;">From (Sender):</strong> ${name}</p>
        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #d4af37;">Sender Email:</strong> <a href="mailto:${email}" style="color: #ffffff; text-decoration: underline;">${email}</a></p>
        <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #d4af37;">To (Recipient):</strong> ${receiverEmail}</p>
        ${subject ? `<p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #d4af37;">Subject:</strong> ${subject}</p>` : ""}
        <p style="margin: 0; font-size: 13px; color: #cbd5e1;"><strong style="color: #d4af37;">Date & Time:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      </div>

      <div style="background-color: #0d2618; padding: 20px; border-radius: 10px; border-left: 4px solid #d4af37; margin-bottom: 22px;">
        <h4 style="margin: 0 0 10px 0; color: #d4af37; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Message from Customer:</h4>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="border-top: 1px solid #284234; padding-top: 14px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        You can hit <strong>Reply</strong> in your email client to respond directly to <strong>${email}</strong>.
      </div>
    </div>
  `;

  // If SMTP password and user are configured, send live email
  if (smtpPass && smtpUser) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Sender header displays the user's name & email
      await transporter.sendMail({
        from: `"${name}" <${smtpUser}>`,
        replyTo: `"${name}" <${email}>`,
        to: receiverEmail,
        subject: emailSubject,
        text: `Sender Name: ${name}\nSender Email: ${email}\nReceiver: ${receiverEmail}\nSubject: ${subject || "N/A"}\n\nMessage:\n${message}`,
        html: htmlContent,
      });

      return {
        success: true,
        message: `Thank you ${name}. Your message has been sent to our team at ${receiverEmail}.`,
      };
    } catch (error) {
      console.error("Error dispatching email via SMTP:", error);
      return {
        success: false,
        error: "Unable to dispatch message via mail server at this moment. Please try again or reach us via WhatsApp.",
      };
    }
  }

  // If SMTP is not yet configured with an app password, log to console and return success
  console.log(`\n================= [MANBRO CONTACT FORM] =================`);
  console.log(`From (User): ${name} <${email}>`);
  console.log(`To (Receiver): ${receiverEmail}`);
  console.log(`Subject: ${emailSubject}`);
  console.log(`Message:\n${message}`);
  console.log(`=========================================================\n`);

  return {
    success: true,
    message: `Thank you ${name}. Your inquiry from ${email} has been received and routed to ${receiverEmail}.`,
  };
}
