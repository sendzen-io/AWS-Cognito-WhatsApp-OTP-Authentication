// lambda-functions/PreSignup.ts
import { getUserPhoneNumber, logReturn } from "../utils";

const preSignUp = async (event: any) => {
  console.log("preSignUp:", JSON.stringify(event));

  const attrs = event.request.userAttributes || {};
  const phone = getUserPhoneNumber(attrs);
  if (!phone) {
    throw new Error("phone_number is required for WhatsApp OTP");
  }

  // user remains UNCONFIRMED until WhatsApp OTP passes
  event.response.autoConfirmUser = false;
  event.response.autoVerifyEmail = false;
  event.response.autoVerifyPhone = false;

  // do not add any other fields to event.response

  return logReturn("preSignUp_ok", event); // ensure logReturn does not mutate event.response
};

export const handler = preSignUp;
