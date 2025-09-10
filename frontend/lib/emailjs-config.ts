// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Create an email service (Gmail, Outlook, etc.)
// 4. Create an email template
// 5. Get your service ID, template ID, and public key
// 6. Replace the values below

export const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_oka7q6o',
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_y1vqdyt',
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'akMIURRODsejwTXZf',
};

// Debug configuration loading
if (typeof window !== 'undefined') {
  console.log('EmailJS Config loaded:', {
    serviceId: EMAILJS_CONFIG.SERVICE_ID,
    templateId: EMAILJS_CONFIG.TEMPLATE_ID,
    publicKeyStart: EMAILJS_CONFIG.PUBLIC_KEY?.substring(0, 10) + '...',
    envVarsFound: {
      serviceId: !!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      templateId: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      publicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    }
  });
}

// Email template variables that will be used:
// - to_email: Recipient email address
// - to_name: Recipient name
// - otp_code: 6-digit OTP code
// - expiry_time: OTP expiration time
// - company_name: Company name (OLLA LMS)
// - support_email: Support email address

export const OTP_CONFIG = {
  EXPIRY_TIME_MINUTES: 2,
  CODE_LENGTH: 6,
  RESEND_COOLDOWN_SECONDS: 120,
};
