import { describe, it, expect } from "vitest";

const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());

describe.skipIf(!hasResendKey)("Resend API", () => {
  it("should validate Resend API key by sending a test email", async () => {
    const apiKey = process.env.RESEND_API_KEY!;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: "delivered@resend.dev",
          subject: "Links Golf - OTP Test",
          html: "<p>Test OTP: 123456</p>",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Resend API error: ${data.message || response.statusText}`);
      }

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("id");
      console.log("✓ Resend API key is valid");
    } catch (error) {
      console.error("✗ Resend API validation failed:", error);
      throw error;
    }
  });
});
