// import { cognito, AdminGetUserCommand, AdminUpdateUserAttributesCommand, AdminConfirmSignUpCommand } from "../cognito";
// import { logReturn } from "../utils";


// const defineAuthChallenge = async (event: any) => {
//     try {
//       console.log("defineAuthChallenge:", JSON.stringify(event));
//       const { request, response, userName } = event;
//       const PoolId = event.userPoolId;
  
//       // always start with a valid default shape
//       response.issueTokens = false;
//       response.failAuthentication = true;
//       response.challengeName = undefined;
  
//       // 0) user not found
//       if (request.userNotFound) {
//         response.challengeMetadata = "ERROR_USER_NOT_FOUND";
//         return logReturn("define_user_not_found", event);
//       }
  
//       if (!PoolId) {
//         response.challengeMetadata = "ERROR_MISSING_USER_POOL_ID";
//         return logReturn("define_missing_pool", event);
//       }
  
//       // 1) read state from AdminGetUser
//       let isConfirmed = false;
//       let whatsappVerified = false;
//       let phoneNumberVerified = false;
//       let authPurpose = "";
//       try {
//         const getUserRes = await cognito.send(
//           new AdminGetUserCommand({ UserPoolId: PoolId, Username: userName })
//         );
//         isConfirmed = getUserRes.UserStatus === "CONFIRMED";
//         const attrMap = Object.fromEntries(
//           (getUserRes.UserAttributes || []).map((a: any) => [a.Name, a.Value])
//         );
//         whatsappVerified = attrMap["custom:whatsapp_verified"] === "true";
//         phoneNumberVerified = attrMap["phone_number_verified"] === "true";
//         authPurpose = attrMap["custom:auth_purpose"] || "";
//         console.log(
//           `State - confirmed:${isConfirmed} whatsapp_verified:${whatsappVerified} auth_purpose:${authPurpose}`
//         );
//       } catch (e) {
//         console.error("AdminGetUser failed:", e);
//         response.challengeMetadata = "ERROR_USER_LOOKUP_FAILED";
//         return logReturn("define_lookup_failed", event, { error: String(e) });
//       }
  
//       // 2) first call in this auth attempt
//       if (request.session.length === 0) {
//         if (authPurpose === "signup_whatsapp_verify") {
//           // Allow custom auth for unconfirmed users during signup
//           if (whatsappVerified && phoneNumberVerified) {
//             response.issueTokens = true;
//             response.failAuthentication = false;
//             return logReturn("define_signup_already_verified", event);
//           }
//           response.challengeName = "CUSTOM_CHALLENGE";
//           response.issueTokens = false;
//           response.failAuthentication = false;
//           return logReturn("define_signup_send_otp", event);
//         }
  
//         // login
//         if (!isConfirmed) {
//           response.challengeMetadata = "ERROR_USER_NOT_CONFIRMED";
//           return logReturn("define_login_email_not_confirmed", event);
//         }
//         if (!phoneNumberVerified) {
//           response.challengeMetadata = "ERROR_PHONE_NUMBER_NOT_VERIFIED";
//           return logReturn("define_login_phone_number_not_verified", event);
//         }
//         if (!whatsappVerified) {
//           response.challengeMetadata = "ERROR_WHATSAPP_NOT_VERIFIED";
//           return logReturn("define_login_whatsapp_not_verified", event);
//         }
//         response.challengeName = "CUSTOM_CHALLENGE";
//         response.issueTokens = false;
//         response.failAuthentication = false;
//         return logReturn("define_login_send_otp", event);
//       }
  
//       // 3) subsequent calls
//       const last = request.session[request.session.length - 1];
//       console.log("Last challenge:", last);
  
//       const wasSignup = last.challengeMetadata === "OTP_SIGNUP";
  
//       if (last.challengeName === "CUSTOM_CHALLENGE" && last.challengeResult === true) {
//         if (wasSignup) {
//           // Confirm user and set verification attributes on signup verification
//           try {
//             await cognito.send(
//               new AdminUpdateUserAttributesCommand({
//                 UserPoolId: PoolId,
//                 Username: userName,
//                 UserAttributes: [
//                   { Name: "custom:whatsapp_verified", Value: "true" },
//                   { Name: "phone_number_verified", Value: "true" },
//                   { Name: "custom:auth_purpose", Value: "" },
//                 ],
//               })
//             );
//             console.log("whatsapp_verified=true, phone_number_verified=true and auth_purpose cleared");
            
//             // Confirm the user after successful WhatsApp verification
//             await cognito.send(
//               new AdminConfirmSignUpCommand({
//                 UserPoolId: PoolId,
//                 Username: userName,
//               })
//             );
//             console.log("User confirmed after successful WhatsApp verification");
//           } catch (e: any) {
//             console.error("Update user attributes or confirmation failed:", e);
//             response.challengeMetadata =
//               e.name === "InvalidParameterException"
//                 ? "ERROR_ATTR_IMMUTABLE"
//                 : "ERROR_POST_OTP_UPDATE_FAILED";
//             return logReturn("define_update_failed_after_signup", event, {
//               error: String(e),
//             });
//           }
//         }
//         response.issueTokens = true;
//         response.failAuthentication = false;
//         return logReturn("define_issue_tokens", event);
//       }
  
//       // wrong code - retry up to 3 total attempts
//       if (request.session.length < 3) {
//         response.challengeName = "CUSTOM_CHALLENGE";
//         response.issueTokens = false;
//         response.failAuthentication = false;
//         return logReturn("define_retry_custom_challenge", event);
//       }
  
//       response.challengeMetadata = "ERROR_TOO_MANY_ATTEMPTS";
//       return logReturn("define_too_many_attempts", event);
//     } catch (error: any) {
//       console.error("Unexpected error in defineAuthChallenge:", error);
//       try {
//         event.response.issueTokens = false;
//         event.response.failAuthentication = true;
//         event.response.challengeMetadata = "ERROR_UNEXPECTED";
//       } catch {}
//       return logReturn("define_unexpected", event, { error: String(error) });
//     }
//   };

// export const handler = defineAuthChallenge;


// defineAuthChallenge.ts
import { cognito, AdminGetUserCommand, AdminUpdateUserAttributesCommand } from "../cognito";
import { logReturn } from "../utils";

const defineAuthChallenge = async (event: any) => {
  try {
    // Redact sensitive session details from logs
    const safe = { ...event, request: { ...event.request, privateChallengeParameters: undefined, session: undefined } };
    console.log("defineAuthChallenge:", JSON.stringify(safe));

    const { request, response, userName } = event;
    const PoolId = event.userPoolId;

    response.issueTokens = false;
    response.failAuthentication = true;
    response.challengeName = undefined;

    if (request.userNotFound) {
      response.challengeMetadata = "ERROR_USER_NOT_FOUND";
      return logReturn("define_user_not_found", event);
    }
    if (!PoolId) {
      response.challengeMetadata = "ERROR_MISSING_USER_POOL_ID";
      return logReturn("define_missing_pool", event);
    }

    // Read state
    let isConfirmed = false;
    let whatsappVerified = false;
    let phoneNumberVerified = false;
    let authPurpose = "";
    try {
      const getUserRes = await cognito.send(
        new AdminGetUserCommand({ UserPoolId: PoolId, Username: userName })
      );
      isConfirmed = getUserRes.UserStatus === "CONFIRMED";
      const attrMap = Object.fromEntries((getUserRes.UserAttributes || []).map((a: any) => [a.Name, a.Value]));
      whatsappVerified = attrMap["custom:whatsapp_verified"] === "true";
      authPurpose = attrMap["custom:auth_purpose"] || "";
      phoneNumberVerified = attrMap["phone_number_verified"] === "true";
    } catch (e) {
      console.error("AdminGetUser failed:", e);
      response.challengeMetadata = "ERROR_USER_LOOKUP_FAILED";
      return logReturn("define_lookup_failed", event, { error: String(e) });
    }

    // First call in this auth attempt
    if (request.session.length === 0) {
      if (authPurpose === "signup_whatsapp_verify") {
        // We auto-confirmed at signup, so allow the custom challenge
        if (whatsappVerified && phoneNumberVerified) {
          response.issueTokens = true;
          response.failAuthentication = false;
          return logReturn("define_signup_already_verified", event);
        }
        response.challengeName = "CUSTOM_CHALLENGE";
        response.issueTokens = false;
        response.failAuthentication = false;
        return logReturn("define_signup_send_otp", event);
      }

      // Regular login path
      if (!isConfirmed) {
        response.challengeMetadata = "ERROR_USER_NOT_CONFIRMED";
        return logReturn("define_login_user_not_confirmed", event);
      }
      if (!whatsappVerified) {
        response.challengeMetadata = "ERROR_WHATSAPP_NOT_VERIFIED";
        return logReturn("define_login_whatsapp_not_verified", event);
      }
      response.challengeName = "CUSTOM_CHALLENGE";
      response.issueTokens = false;
      response.failAuthentication = false;
      return logReturn("define_login_send_otp", event);
    }

    // Subsequent calls
    const last = request.session[request.session.length - 1];
    const wasSignup = last.challengeMetadata === "OTP_SIGNUP";

    if (last.challengeName === "CUSTOM_CHALLENGE" && last.challengeResult === true) {
      if (wasSignup) {
        try {
          await cognito.send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: PoolId,
              Username: userName,
              UserAttributes: [
                { Name: "custom:whatsapp_verified", Value: "true" },
                { Name: "phone_number_verified", Value: "true" },
                { Name: "custom:auth_purpose", Value: "" },
              ],
            })
          );
          console.log("whatsapp_verified set to true and auth_purpose cleared");
        } catch (e: any) {
          console.error("Post-OTP update failed:", e);
          response.challengeMetadata =
            e.name === "InvalidParameterException" ? "ERROR_ATTR_IMMUTABLE" : "ERROR_POST_OTP_UPDATE_FAILED";
          return logReturn("define_update_failed_after_signup", event, { error: String(e) });
        }
      }
      response.issueTokens = true;
      response.failAuthentication = false;
      return logReturn("define_issue_tokens", event);
    }

    // Retry up to 3 total attempts
    if (request.session.length < 3) {
      response.challengeName = "CUSTOM_CHALLENGE";
      response.issueTokens = false;
      response.failAuthentication = false;
      return logReturn("define_retry_custom_challenge", event);
    }

    response.challengeMetadata = "ERROR_TOO_MANY_ATTEMPTS";
    return logReturn("define_too_many_attempts", event);
  } catch (error: any) {
    console.error("Unexpected error in defineAuthChallenge:", error);
    try {
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
      event.response.challengeMetadata = "ERROR_UNEXPECTED";
    } catch {}
    return logReturn("define_unexpected", event, { error: String(error) });
  }
};

export const handler = defineAuthChallenge;
