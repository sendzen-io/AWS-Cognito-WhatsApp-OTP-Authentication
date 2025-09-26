// import {
//   AdminGetUserCommand,
//   AdminUpdateUserAttributesCommand,
// } from '@aws-sdk/client-cognito-identity-provider';
// import { DefineAuthChallengeEvent, DefineAuthChallengeHandler } from './types';
// import { logReturn } from './utils';
// import { cognitoClient } from './cognitoClient';

// // Define auth challenge - supports signup WhatsApp verify and login
// export const handler: DefineAuthChallengeHandler = async (event: DefineAuthChallengeEvent) => {
//   try {
//     console.log('defineAuthChallenge:', JSON.stringify(event));
//     const { request, response, userName, userPoolId } = event;

//     // Always start with a valid default shape
//     response.issueTokens = false;
//     response.failAuthentication = true;

//     // user not found - generic fail
//     if (request.userNotFound) {
//       return logReturn('define_user_not_found', event);
//     }

//     if (!userPoolId) {
//       return logReturn('define_missing_pool', event);
//     }

//     // Read current state
//     let isConfirmed = false;
//     let whatsappVerified = false;
//     let phoneNumberVerified = false;
//     let authPurpose = '';
//     try {
//       const getUserRes = await cognitoClient.send(
//         new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
//       );
//       isConfirmed = getUserRes.UserStatus === 'CONFIRMED';
//       const attrMap = Object.fromEntries(
//         (getUserRes.UserAttributes || []).map((a) => [a.Name, a.Value])
//       );
//       whatsappVerified = attrMap['custom:whatsapp_verified'] === 'true';
//       phoneNumberVerified = attrMap['phone_number_verified'] === 'true';
//       authPurpose = attrMap['custom:auth_purpose'] || '';
//       console.log(
//         `State - confirmed:${isConfirmed} whatsapp_verified:${whatsappVerified} phone_verified:${phoneNumberVerified} auth_purpose:${authPurpose}`
//       );
//     } catch (e) {
//       console.error('AdminGetUser failed:', e);
//       return logReturn('define_lookup_failed', event, { error: String(e) });
//     }

//     // First call in this auth attempt
//     if ((request.session?.length ?? 0) === 0) {
//       // Signup verify flow
//       if (authPurpose === 'signup_whatsapp_verify') {
//         if (!isConfirmed) {
//           return logReturn('define_signup_email_not_confirmed', event);
//         }

//         if (whatsappVerified) {
//           // Already verified - issue tokens immediately
//           response.issueTokens = true;
//           response.failAuthentication = false;
//           return logReturn('define_signup_already_verified', event);
//         }

//         // Start custom challenge so Create can send OTP for signup verification
//         response.challengeName = 'CUSTOM_CHALLENGE';
//         response.issueTokens = false;
//         response.failAuthentication = false;
//         return logReturn('define_signup_send_otp', event);
//       }

//       // Login path - must be fully verified already
//       if (!isConfirmed) {
//         return logReturn('define_login_email_not_confirmed', event);
//       }
//       if (!phoneNumberVerified) {
//         // Hard fail - do not start challenge
//         response.issueTokens = false;
//         response.failAuthentication = true;
//         return logReturn('define_login_phone_number_not_verified', event);
//       }
//       if (!whatsappVerified) {
//         // Hard fail - do not start challenge
//         response.issueTokens = false;
//         response.failAuthentication = true;
//         return logReturn('define_login_whatsapp_not_verified', event);
//       }

//       // Fully verified - proceed with login OTP
//       response.challengeName = 'CUSTOM_CHALLENGE';
//       response.issueTokens = false;
//       response.failAuthentication = false;
//       return logReturn('define_login_send_otp', event);
//     }

//     // Subsequent calls
//     const last = request.session?.[request.session.length - 1];
//     console.log('Last challenge:', last);

//     const wasSignup = last?.challengeMetadata === 'OTP_SIGNUP';

//     if (last?.challengeName === 'CUSTOM_CHALLENGE' && last?.challengeResult === true) {
//       if (wasSignup) {
//         // Flip attributes only for successful signup verification
//         try {
//           await cognitoClient.send(
//             new AdminUpdateUserAttributesCommand({
//               UserPoolId: userPoolId,
//               Username: userName,
//               UserAttributes: [
//                 { Name: 'custom:whatsapp_verified', Value: 'true' },
//                 { Name: 'phone_number_verified', Value: 'true' },
//                 { Name: 'custom:auth_purpose', Value: '' },
//               ],
//             })
//           );
//           console.log('whatsapp_verified=true, phone_number_verified=true, auth_purpose cleared');
//         } catch (e: any) {
//           console.error('Update after signup OTP failed:', e);
//           return logReturn('define_update_failed_after_signup', event, { error: String(e) });
//         }
//       }
//       // In both signup and login, correct code issues tokens
//       response.issueTokens = true;
//       response.failAuthentication = false;
//       return logReturn('define_issue_tokens', event);
//     }

//     // Wrong code - allow up to 3 total attempts
//     const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS || "3");
//     if ((request.session?.length ?? 0) < maxAttempts) {
//       response.challengeName = 'CUSTOM_CHALLENGE';
//       response.issueTokens = false;
//       response.failAuthentication = false;
//       return logReturn('define_retry_custom_challenge', event);
//     }

//     // Too many attempts - fail
//     response.issueTokens = false;
//     response.failAuthentication = true;
//     return logReturn('define_too_many_attempts', event);
//   } catch (error) {
//     console.error('Unexpected error in defineAuthChallenge:', error);
//     try {
//       event.response.issueTokens = false;
//       event.response.failAuthentication = true;
//     } catch {}
//     return logReturn('define_unexpected', event, { error: String(error) });
//   }
// };

import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DefineAuthChallengeEvent, DefineAuthChallengeHandler } from "./types";
import { logReturn } from "./utils";
import { cognitoClient } from "./cognitoClient";
import { getClientRole } from "./clientRole";

function isTrue(v?: string) {
  return String(v).toLowerCase() === "true";
}

export const handler: DefineAuthChallengeHandler = async (event: DefineAuthChallengeEvent) => {
  try {
    console.log("defineAuthChallenge:", JSON.stringify(event));
    const { request, response, userName, userPoolId, callerContext } = event;

    // default deny
    response.issueTokens = false;
    response.failAuthentication = true;

    if (!userPoolId || request.userNotFound) {
      return logReturn("define_no_user_or_pool", event);
    }

    const role = await getClientRole(userPoolId, callerContext?.clientId);

    // fetch flags
    let userStatus = "UNCONFIRMED";
    let emailVerified = false;
    let waVerified = false;
    let phoneVerified = false;

    try {
      const res = await cognitoClient.send(
        new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
      );
      userStatus = res.UserStatus || "UNCONFIRMED";
      const map = Object.fromEntries((res.UserAttributes || []).map(a => [a.Name, a.Value]));
      emailVerified = isTrue(map["email_verified"]);
      waVerified = isTrue(map["custom:whatsapp_verified"]);
      phoneVerified = isTrue(map["phone_number_verified"]);
      console.log(`flags email:${emailVerified} wa:${waVerified} phone:${phoneVerified} status:${userStatus} role:${role}`);
    } catch (e) {
      console.error("AdminGetUser failed:", e);
      return logReturn("define_lookup_failed", event, { error: String(e) });
    }

    const attempts = request.session?.length ?? 0;

    if (attempts === 0) {
      // strict separation by role
      if (role === "SIGNUP") {
        // for signup whatsapp verification round
        if (userStatus !== "CONFIRMED") return logReturn("define_signup_not_confirmed", event);
        if (!emailVerified) return logReturn("define_signup_email_not_verified", event);
        if (waVerified) return logReturn("define_signup_already_verified", event);

        response.challengeName = "CUSTOM_CHALLENGE";
        response.issueTokens = false;
        response.failAuthentication = false;
        return logReturn("define_signup_send_otp", event);
      }

      if (role === "LOGIN") {
        // must be fully verified before sending login otp
        if (userStatus !== "CONFIRMED") return logReturn("define_login_not_confirmed", event);
        if (!emailVerified) return logReturn("define_login_email_not_verified", event);
        if (!phoneVerified) return logReturn("define_login_phone_not_verified", event);
        if (!waVerified) return logReturn("define_login_wa_not_verified", event);

        response.challengeName = "CUSTOM_CHALLENGE";
        response.issueTokens = false;
        response.failAuthentication = false;
        return logReturn("define_login_send_otp", event);
      }

      return logReturn("define_unknown_client_role", event);
    }

    // subsequent hops
    const last = request.session[attempts - 1];
    if (last?.challengeName === "CUSTOM_CHALLENGE" && last?.challengeResult === true) {
      response.issueTokens = true;
      response.failAuthentication = false;
      return logReturn("define_issue_tokens", event);
    }

    const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS || "3");
    if (attempts < maxAttempts) {
      response.challengeName = "CUSTOM_CHALLENGE";
      response.issueTokens = false;
      response.failAuthentication = false;
      return logReturn("define_retry_custom_challenge", event);
    }

    // too many attempts
    response.issueTokens = false;
    response.failAuthentication = true;
    return logReturn("define_too_many_attempts", event);
  } catch (error) {
    console.error("defineAuthChallenge unexpected:", error);
    try {
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    } catch {}
    return logReturn("define_unexpected", event, { error: String(error) });
  }
};
