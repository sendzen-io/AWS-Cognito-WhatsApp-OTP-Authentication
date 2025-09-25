// Constants for the Cognito authentication system

export const USER_POOL_ID = process.env.USER_POOL_ID || "";

// OTP Configuration
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "5");
export const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "3");

// WhatsApp Configuration
export const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "";
export const WHATSAPP_LANG_CODE = process.env.WHATSAPP_LANG_CODE || "en";

// AWS Configuration
export const AWS_REGION = process.env.AWS_REGION || "eu-west-1";

// Application Configuration
export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
