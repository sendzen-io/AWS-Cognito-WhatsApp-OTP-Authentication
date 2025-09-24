import { getUserPhoneNumber, generateOTP, isE164, sendOTPViaWhatsApp, logReturn } from "../utils";


const createAuthChallenge = async (event: any) => {
    try {
      console.log("createAuthChallenge:", JSON.stringify(event));
  
      const { request, response } = event;
  
      if (request.userNotFound) {
        response.failAuthentication = true;
        response.challengeMetadata = "ERROR_USER_NOT_FOUND";
        return logReturn("create_user_not_found", event);
      }
  
      const attrs = request.userAttributes || {};
      const phone = getUserPhoneNumber(attrs);
  
      if (!phone) {
        response.failAuthentication = true;
        response.challengeMetadata = "ERROR_NO_PHONE_NUMBER";
        return logReturn("create_no_phone", event);
      }
  
      if (!isE164(phone)) {
        response.failAuthentication = true;
        response.challengeMetadata = "ERROR_INVALID_PHONE_FORMAT";
        return logReturn("create_bad_phone_format", event, { phone });
      }
  
      // generate a new code on every challenge
      const otp = generateOTP();
      const issuedAt = Date.now().toString();
  
      // store only in private parameters - Cognito passes these to verify handler
      response.privateChallengeParameters = { answer: otp, issuedAt };
  
      // label this round for Define to know how to finish
      const attrMap = Object.fromEntries(Object.entries(attrs));
      const isSignupRound =
        attrMap["custom:auth_purpose"] === "signup_whatsapp_verify" &&
        attrMap["custom:whatsapp_verified"] !== "true";
      response.challengeMetadata = isSignupRound ? "OTP_SIGNUP" : "OTP_LOGIN";
  
      try {
        await sendOTPViaWhatsApp(phone, otp);
        console.log(`otp sent to ${phone} mode: ${response.challengeMetadata}`);
      } catch (err: any) {
        console.error("send otp failed:", err.message);
        console.error("WhatsApp error details:", JSON.stringify(err, null, 2));
        response.failAuthentication = true;
        response.challengeMetadata = "ERROR_WHATSAPP_SEND_FAILED";
        return logReturn("create_whatsapp_send_failed", event, {
          whatsappError: err.whatsappError,
        });
      }
  
      return logReturn("create_ok", event);
    } catch (error: any) {
      console.error("Unexpected error in createAuthChallenge:", error);
      event.response.failAuthentication = true;
      event.response.challengeMetadata = "ERROR_UNEXPECTED";
      return logReturn("create_unexpected", event, { error: String(error) });
    }
  };

  export const handler = createAuthChallenge;