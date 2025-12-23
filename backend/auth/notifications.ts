import { sendEmail } from "../notifications/email_service";
import { secret } from "encore.dev/config";

const appUrl = secret("AppURL");

export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

function getAppUrl(): string {
  return appUrl();
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  console.log(`[EMAIL] sendVerificationEmail called for ${email}`);
  
  const appUrlValue = getAppUrl();
  console.log(`[EMAIL] AppURL value: ${appUrlValue}`);
  
  const verificationUrl = `${appUrlValue}/auth/verify?token=${encodeURIComponent(token)}`;
  console.log(`[EMAIL] Verification URL: ${verificationUrl}`);
  
  console.log(`[EMAIL] About to call sendEmail`);
  
  await sendEmail({
    to: email,
    subject: "Verify Your Email - Braida Beauty Marketplace",
    html: getVerificationEmailTemplate(verificationUrl, email),
  });
  
  console.log(`[EMAIL] sendEmail completed successfully`);
}

export async function sendVerificationSMS(phone: string, code: string): Promise<void> {
  // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
  console.log(`[SMS] Verification code for ${phone}: ${code}`);
  // For now, log the code. In production, send via SMS API.
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const appUrlValue = getAppUrl();
  const resetUrl = `${appUrlValue}/auth/reset-password?token=${encodeURIComponent(token)}`;
  
  console.log(`[EMAIL] Sending password reset email to ${email}`);
  console.log(`[EMAIL] Token: ${token}`);
  console.log(`[EMAIL] Reset URL: ${resetUrl}`);
  
  await sendEmail({
    to: email,
    subject: "Reset Your Password - Braida Beauty Marketplace",
    html: getPasswordResetEmailTemplate(resetUrl, email),
  });
}

function getVerificationEmailTemplate(verificationUrl: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email - Braida</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Braida</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">The UK's Premier Afro & Caribbean Beauty Marketplace</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                Thank you for joining Braida! You're just one step away from discovering amazing beauty professionals or growing your styling business.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333;">
                Please verify your email address to complete your registration:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #666666;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; font-size: 12px; color: #666666; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <div style="padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Note:</strong> This verification link will expire in ${VERIFICATION_TOKEN_EXPIRY_HOURS} hours. If expired, you can request a new one from the login page.
                </p>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #666666;">
                If you didn't create an account with Braida, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                Questions? Contact us at <a href="mailto:support@braida.uk" style="color: #ea580c; text-decoration: none;">support@braida.uk</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Braida Beauty Marketplace. All rights reserved.<br>
                London, United Kingdom
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #9ca3af;">
                This email was sent to ${email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getPasswordResetEmailTemplate(resetUrl: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - Braida</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Braida Beauty Marketplace</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">
                We received a request to reset the password for your Braida account.
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333;">
                Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px auto;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%);">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #666666;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; font-size: 12px; color: #666666; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div style="padding: 16px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                  <strong>Important:</strong> This password reset link will expire in ${PASSWORD_RESET_TOKEN_EXPIRY_HOURS} hour for security purposes. If you need more time, please request a new link.
                </p>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #666666;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                Questions? Contact us at <a href="mailto:support@braida.uk" style="color: #ea580c; text-decoration: none;">support@braida.uk</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Braida Beauty Marketplace. All rights reserved.<br>
                London, United Kingdom
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #9ca3af;">
                This email was sent to ${email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
