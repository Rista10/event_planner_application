import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import logger from '../../config/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const isSmtpConfigured = Boolean(env.SMTP_USER && env.SMTP_PASS);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      requireTLS: true,
    })
  : null;

async function sendEmail(options: EmailOptions): Promise<void> {
  if (!transporter) {
    logger.warn({
      message: 'SMTP not configured - skipping email',
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  logger.info({ message: 'Email sent successfully', to: options.to, subject: options.subject });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #1677FF; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello, ${name}</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #1677FF; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendTwoFactorOtpEmail(
  email: string,
  name: string,
  otp: string,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Your Login Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello, ${name}</h2>
        <p>Your verification code for logging in is:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                  color: #1677FF; margin: 30px 0; text-align: center;">
          ${otp}
        </p>
        <p style="color: #9CA3AF; font-size: 14px; margin-top: 30px;">
          This code will expire in 10 minutes. If you didn't attempt to log in, please secure your account immediately.
        </p>
      </div>
    `,
  });
}