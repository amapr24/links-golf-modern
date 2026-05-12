import { ENV } from "./_core/env";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured");
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Links Golf <noreply@linksgolf.com>",
        to: email,
        subject: "Your Links Golf Membership Login Code",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2d7a4a 0%, #1a4d2e 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Cormorant Garamond', serif;">Links Golf</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Puerto Rico's Premier Golf Membership</p>
            </div>
            <div style="background: #f7f3ec; padding: 40px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; margin: 0 0 24px 0; font-size: 16px;">Welcome back!</p>
              <p style="color: #666; margin: 0 0 32px 0; font-size: 14px; line-height: 1.6;">
                Use this 6-digit code to verify your email and access your membership dashboard. This code expires in 10 minutes.
              </p>
              <div style="background: white; border: 2px solid #2d7a4a; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 32px 0;">
                <p style="color: #999; margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your verification code</p>
                <p style="color: #2d7a4a; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
              </div>
              <p style="color: #999; margin: 0; font-size: 12px; text-align: center;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
            <div style="background: #f7f3ec; padding: 0 40px 40px 40px; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 11px;">
                © 2026 Links Golf Membership. All rights reserved.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Email] Resend API error:", error);
      return false;
    }

    const data = await response.json();
    console.log("[Email] OTP sent successfully to", email, "- ID:", data.id);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send OTP:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  memberNumber: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured");
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Links Golf <noreply@linksgolf.com>",
        to: email,
        subject: "Welcome to Links Golf Membership!",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2d7a4a 0%, #1a4d2e 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-family: 'Cormorant Garamond', serif;">Links Golf</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">Welcome to Your Membership!</p>
            </div>
            <div style="background: #f7f3ec; padding: 40px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; margin: 0 0 24px 0; font-size: 18px; font-weight: 600;">Hi ${firstName},</p>
              <p style="color: #666; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                Your Links Golf Membership is now active! You have instant access to exclusive discounts at 15 premium golf courses across Puerto Rico.
              </p>
              <div style="background: white; border-left: 4px solid #2d7a4a; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #999; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Member Number</p>
                <p style="color: #2d7a4a; margin: 0; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace;">${memberNumber}</p>
              </div>
              <h3 style="color: #333; margin: 24px 0 16px 0; font-size: 16px; font-weight: 600;">What's Next?</h3>
              <ul style="color: #666; margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li>Add your digital pass to Apple Wallet or Google Wallet</li>
                <li>Visit any of our 15 partner courses and present your pass at the pro shop</li>
                <li>Enjoy up to 25% off green fees at resort courses</li>
                <li>Access your dashboard to view all course details and renewal dates</li>
              </ul>
              <p style="color: #999; margin: 0; font-size: 12px; text-align: center;">
                Questions? Contact us at support@linksgolf.com or visit your dashboard.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[Email] Resend API error:", error);
      return false;
    }

    console.log("[Email] Welcome email sent to", email);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    return false;
  }
}
