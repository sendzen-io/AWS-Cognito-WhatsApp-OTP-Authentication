// // lambda-functions/CreateAuthChallenge.ts
// import { getUserPhoneNumber, generateOTP, isE164, sendOTPViaWhatsApp, logReturn } from "../utils";

// const createAuthChallenge = async (event: any) => {
//   try {
//     console.log("createAuthChallenge:", JSON.stringify(event));
//     const { request, response } = event;

//     if (request.userNotFound) return logReturn("create_user_not_found", event);

//     const attrs = request.userAttributes || {};
//     const phone = getUserPhoneNumber(attrs);
//     if (!phone) return logReturn("create_no_phone", event);
//     if (!isE164(phone)) return logReturn("create_bad_phone_format", event, { phone });

//     // decide round type from attributes present in the trigger event
//     const attrMap = Object.fromEntries(Object.entries(attrs));
//     const phoneVerified = attrMap["phone_number_verified"] === "true";
//     const whatsappVerified = attrMap["custom:whatsapp_verified"] === "true";
//     const isSignupRound = !(phoneVerified && whatsappVerified);

//     const otp = generateOTP();
//     const issuedAt = Date.now().toString();

//     response.privateChallengeParameters = { answer: otp, issuedAt };
//     response.publicChallengeParameters = { mode: isSignupRound ? "SIGNUP" : "LOGIN" };
//     response.challengeMetadata = isSignupRound ? "OTP_SIGNUP" : "OTP_LOGIN";

//     try {
//       await sendOTPViaWhatsApp(phone, otp);
//       console.log(`OTP sent to ${phone} mode:${response.challengeMetadata}`);
//     } catch (err: any) {
//       console.error("send otp failed:", err?.message);
//       console.error("WhatsApp error details:", JSON.stringify(err, null, 2));
//       return logReturn("create_whatsapp_send_failed", event, { whatsappError: err?.whatsappError });
//     }

//     return logReturn("create_ok", event);
//   } catch (error: any) {
//     console.error("Unexpected error in createAuthChallenge:", error);
//     return logReturn("create_unexpected", event, { error: String(error) });
//   }
// };

// export const handler = createAuthChallenge;


// lambda-functions/CreateAuthChallenge.ts
import { getUserPhoneNumber, generateOTP, isE164, sendOTPViaWhatsApp, logReturn } from "../utils";

const createAuthChallenge = async (event: any) => {
  try {
    console.log("createAuthChallenge:", JSON.stringify(event));
    const { request, response } = event;

    if (request.userNotFound) return logReturn("create_user_not_found", event);

    const attrs = request.userAttributes || {};
    const phone = getUserPhoneNumber(attrs);
    if (!phone) return logReturn("create_no_phone", event);
    if (!isE164(phone)) return logReturn("create_bad_phone_format", event, { phone });

    // decide round type from attributes present in the trigger event
    const phoneVerified = attrs["phone_number_verified"] === "true";
    const whatsappVerified = attrs["custom:whatsapp_verified"] === "true";
    const userStatus = (attrs["cognito:user_status"] || "").toUpperCase();
    const isUnconfirmed = userStatus === "UNCONFIRMED";

    const isSignupRound = isUnconfirmed || !phoneVerified || !whatsappVerified;

    const otp = generateOTP();
    const issuedAt = Date.now().toString();

    // private for Verify only
    response.privateChallengeParameters = { answer: otp, issuedAt };
    // optional hint for client UI
    response.publicChallengeParameters = { mode: isSignupRound ? "SIGNUP" : "LOGIN" };
    // label this round for Define to read from session on next hop
    response.challengeMetadata = isSignupRound ? "OTP_SIGNUP" : "OTP_LOGIN";

    console.log("Create round tag:", {
      isUnconfirmed,
      phoneVerified,
      whatsappVerified,
      tag: response.challengeMetadata
    });

    try {
      await sendOTPViaWhatsApp(phone, otp);
      console.log(`OTP sent to ${phone} mode:${response.challengeMetadata}`);
    } catch (err: any) {
      console.error("send otp failed:", err?.message);
      console.error("WhatsApp error details:", JSON.stringify(err, null, 2));
      return logReturn("create_whatsapp_send_failed", event, { whatsappError: err?.whatsappError });
    }

    return logReturn("create_ok", event);
  } catch (error: any) {
    console.error("Unexpected error in createAuthChallenge:", error);
    return logReturn("create_unexpected", event, { error: String(error) });
  }
};

export const handler = createAuthChallenge;
