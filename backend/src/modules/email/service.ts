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
    subject: 'Confirm your signup',
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #1677FF; height: 12px; width: 100%;"></div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 24px; letter-spacing: -1px;">
              <span style="color: #000000;">Event</span><span style="color: #1677FF;">Planner</span>
            </div>
            <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0 0 16px 0;">Confirm your signup</h1>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
              Welcome, ${name}! Please verify your email to get started with the EventPlanner platform.
            </p>
            <a href="${verificationUrl}"
               style="background-color: #1677FF; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold;
                      text-decoration: none; border-radius: 9999px; display: inline-block;">
              Confirm Email
            </a>
          </div>
        </div>
        <div style="max-width: 600px; margin: 24px auto 0; text-align: center;">
          <p style="color: #9CA3AF; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
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
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #1677FF; height: 12px; width: 100%;"></div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 24px; letter-spacing: -1px;">
              <span style="color: #000000;">Event</span><span style="color: #1677FF;">Planner</span>
            </div>
            <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0 0 16px 0;">Reset Your Password</h1>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
              Hello, ${name}! We received a request to reset your password. Click the button below to create a new password.
            </p>
            <a href="${resetUrl}"
               style="background-color: #1677FF; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: bold;
                      text-decoration: none; border-radius: 9999px; display: inline-block;">
              Reset Password
            </a>
          </div>
        </div>
        <div style="max-width: 600px; margin: 24px auto 0; text-align: center;">
          <p style="color: #9CA3AF; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
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
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #1677FF; height: 12px; width: 100%;"></div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 24px; letter-spacing: -1px;">
              <span style="color: #000000;">Event</span><span style="color: #1677FF;">Planner</span>
            </div>
            <h1 style="color: #111827; font-size: 28px; font-weight: bold; margin: 0 0 16px 0;">Login Verification Code</h1>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
              Hello, ${name}! Your verification code for logging in is:
            </p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1677FF; margin: 0 0 32px 0; background-color: #f3f4f6; padding: 16px; border-radius: 12px; display: inline-block;">
              ${otp}
            </div>
          </div>
        </div>
        <div style="max-width: 600px; margin: 24px auto 0; text-align: center;">
          <p style="color: #9CA3AF; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't attempt to log in, please secure your account immediately.
          </p>
        </div>
      </div>
    `,
  });
}