// preSignUp.ts
import { getUserPhoneNumber, logReturn } from "../utils";

const preSignUp = async (event: any) => {
  // Avoid logging secrets in prod, but fine for now
  console.log("preSignUp:", JSON.stringify(event));

  const attrs = event.request.userAttributes || {};
  const phone = getUserPhoneNumber(attrs);

  if (!phone) {
    console.error("phone_number is required for WhatsApp OTP");
    throw new Error("phone_number is required for WhatsApp OTP");
  }

  // Key change: allow custom auth to run post-signup
  event.response.autoConfirmUser = true;

  // Let Cognito handle phone verification normally or use your own flag
  event.response.autoVerifyEmail = false;
  event.response.autoVerifyPhone = false;

  return logReturn("preSignUp_ok", event);
};

export const handler = preSignUp;
