import nodemailer from 'nodemailer';

function buildVerificationUrl(token: string) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}/verify-email/${token}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = buildVerificationUrl(token);

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[email] Verification email to ${email}`);
    console.log(`[email] Verification link: ${verificationUrl}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Verify your account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your account</h2>
        <p>Thanks for registering. Please verify your email address by clicking the button below.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify email</a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
      </div>
    `,
  });

  return true;
}
