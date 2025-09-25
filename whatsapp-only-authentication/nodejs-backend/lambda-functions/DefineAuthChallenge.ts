// // lambda-functions/DefineAuthChallenge.ts
// import {
//   cognito,
//   AdminGetUserCommand,
//   AdminUpdateUserAttributesCommand,
//   AdminConfirmSignUpCommand,
//   DescribeUserPoolClientCommand,
// } from "../cognito";
// import { logReturn } from "../utils";

// // simple cache for id -> role
// const clientRoleCache = new Map<string, "SIGNUP" | "LOGIN" | "UNKNOWN">();

// async function getClientRole(userPoolId: string, clientId: string): Promise<"SIGNUP"|"LOGIN"|"UNKNOWN"> {
//   if (!clientId) return "UNKNOWN";
//   const cached = clientRoleCache.get(clientId);
//   if (cached) return cached;

//   try {
//     const res = await cognito.send(
//       new DescribeUserPoolClientCommand({ UserPoolId: userPoolId, ClientId: clientId })
//     );
//     const name = res.UserPoolClient?.ClientName || "";
//     const role = name.includes("signup") ? "SIGNUP" : name.includes("login") ? "LOGIN" : "UNKNOWN";
//     clientRoleCache.set(clientId, role);
//     return role;
//   } catch (e) {
//     console.error("DescribeUserPoolClient failed:", e);
//     return "UNKNOWN";
//   }
// }

// const defineAuthChallenge = async (event: any) => {
//   try {
//     const safe = { ...event, request: { ...event.request, privateChallengeParameters: undefined, session: undefined } };
//     console.log("defineAuthChallenge:", JSON.stringify(safe));

//     const { request, response, userName, callerContext } = event;
//     const PoolId = event.userPoolId;

//     response.issueTokens = false;
//     response.failAuthentication = true;
//     response.challengeName = undefined;

//     if (request.userNotFound) return logReturn("define_user_not_found", event);
//     if (!PoolId) return logReturn("define_missing_pool", event);

//     // read current state
//     let isConfirmed = false;
//     let phoneVerified = false;
//     let whatsappVerified = false;

//     try {
//       const getUserRes = await cognito.send(new AdminGetUserCommand({ UserPoolId: PoolId, Username: userName }));
//       isConfirmed = getUserRes.UserStatus === "CONFIRMED";
//       const attrMap = Object.fromEntries((getUserRes.UserAttributes || []).map((a: any) => [a.Name, a.Value]));
//       phoneVerified = attrMap["phone_number_verified"] === "true";
//       whatsappVerified = attrMap["custom:whatsapp_verified"] === "true";
//       console.log(`State confirmed:${isConfirmed} phone_verified:${phoneVerified} whatsapp_verified:${whatsappVerified}`);
//     } catch (e) {
//       console.error("AdminGetUser failed:", e);
//       return logReturn("define_lookup_failed", event, { error: String(e) });
//     }

//     const signupIncomplete = !isConfirmed || !phoneVerified || !whatsappVerified;

//     // first hop
//     if (request.session.length === 0) {
//       const clientId = callerContext?.clientId || "";
//       const role = await getClientRole(PoolId, clientId);

//       if (signupIncomplete) {
//         if (role === "SIGNUP") {
//           response.challengeName = "CUSTOM_CHALLENGE";
//           response.failAuthentication = false;
//           return logReturn("define_signup_send_otp", event);
//         }
//         if (role === "LOGIN") {
//           response.failAuthentication = true;
//           return logReturn("define_login_blocked_signup_incomplete", event);
//         }
//         // unknown client id - safest is block
//         response.failAuthentication = true;
//         return logReturn("define_unknown_client_blocked", event);
//       }

//       // fully ready for login
//       response.challengeName = "CUSTOM_CHALLENGE";
//       response.failAuthentication = false;
//       return logReturn("define_login_send_otp", event);
//     }

//     // subsequent hops
//     const last = request.session[request.session.length - 1];
//     const lastWasCustom = last.challengeName === "CUSTOM_CHALLENGE";
//     const wasSignup = last.challengeMetadata === "OTP_SIGNUP";

//     if (lastWasCustom && last.challengeResult === true) {
//       if (wasSignup) {
//         try {
//           console.log(`Confirming user ${userName} after successful OTP verification`);
          
//           // Update user attributes first
//           await cognito.send(new AdminUpdateUserAttributesCommand({
//             UserPoolId: PoolId,
//             Username: userName,
//             UserAttributes: [
//               { Name: "phone_number_verified", Value: "true" },
//               { Name: "custom:whatsapp_verified", Value: "true" }
//             ]
//           }));
//           console.log(`Updated attributes for user ${userName}`);
          
//           // Confirm the user
//           await cognito.send(new AdminConfirmSignUpCommand({ 
//             UserPoolId: PoolId, 
//             Username: userName 
//           }));
//           console.log(`Successfully confirmed user ${userName}`);
          
//           // Verify the user is now confirmed
//           const verifyRes = await cognito.send(new AdminGetUserCommand({ 
//             UserPoolId: PoolId, 
//             Username: userName 
//           }));
//           console.log(`User ${userName} status after confirmation: ${verifyRes.UserStatus}`);
          
//         } catch (e: any) {
//           console.error(`Failed to confirm user ${userName}:`, e);
//           response.failAuthentication = true;
//           return logReturn("define_update_failed_after_signup", event, { error: String(e) });
//         }
//       }
//       response.issueTokens = true;
//       response.failAuthentication = false;
//       return logReturn("define_issue_tokens", event);
//     }

//     if (request.session.length < 3) {
//       response.challengeName = "CUSTOM_CHALLENGE";
//       response.failAuthentication = false;
//       return logReturn("define_retry_custom_challenge", event);
//     }

//     response.failAuthentication = true;
//     return logReturn("define_too_many_attempts", event);
//   } catch (error: any) {
//     console.error("Unexpected error in defineAuthChallenge:", error);
//     try {
//       event.response.issueTokens = false;
//       event.response.failAuthentication = true;
//     } catch {}
//     return logReturn("define_unexpected", event, { error: String(error) });
//   }
// };

// export const handler = defineAuthChallenge;


// lambda-functions/DefineAuthChallenge.ts
import {
  cognito,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminConfirmSignUpCommand,
  DescribeUserPoolClientCommand,
} from "../cognito";
import { logReturn } from "../utils";

// simple cache for id -> role
const clientRoleCache = new Map<string, "SIGNUP" | "LOGIN" | "UNKNOWN">();

async function getClientRole(userPoolId: string, clientId: string): Promise<"SIGNUP"|"LOGIN"|"UNKNOWN"> {
  if (!clientId) return "UNKNOWN";
  const cached = clientRoleCache.get(clientId);
  if (cached) return cached;

  try {
    const res = await cognito.send(
      new DescribeUserPoolClientCommand({ UserPoolId: userPoolId, ClientId: clientId })
    );
    const name = res.UserPoolClient?.ClientName || "";
    const role = name.includes("signup") ? "SIGNUP" : name.includes("login") ? "LOGIN" : "UNKNOWN";
    clientRoleCache.set(clientId, role);
    return role;
  } catch (e) {
    console.error("DescribeUserPoolClient failed:", e);
    return "UNKNOWN";
  }
}

const defineAuthChallenge = async (event: any) => {
  try {
    const safe = { ...event, request: { ...event.request, privateChallengeParameters: undefined, session: undefined } };
    console.log("defineAuthChallenge:", JSON.stringify(safe));

    const { request, response, userName, callerContext } = event;
    const PoolId = event.userPoolId;

    // init response
    response.issueTokens = false;
    response.failAuthentication = true;
    response.challengeName = undefined;

    if (request.userNotFound) return logReturn("define_user_not_found", event);
    if (!PoolId) return logReturn("define_missing_pool", event);

    // read current state
    let isConfirmed = false;
    let phoneVerified = false;
    let whatsappVerified = false;

    try {
      const getUserRes = await cognito.send(new AdminGetUserCommand({ UserPoolId: PoolId, Username: userName }));
      isConfirmed = getUserRes.UserStatus === "CONFIRMED";
      const attrMap = Object.fromEntries((getUserRes.UserAttributes || []).map((a: any) => [a.Name, a.Value]));
      phoneVerified = attrMap["phone_number_verified"] === "true";
      whatsappVerified = attrMap["custom:whatsapp_verified"] === "true";
      console.log(`State confirmed:${isConfirmed} phone_verified:${phoneVerified} whatsapp_verified:${whatsappVerified}`);
    } catch (e) {
      console.error("AdminGetUser failed:", e);
      return logReturn("define_lookup_failed", event, { error: String(e) });
    }

    const signupIncomplete = !isConfirmed || !phoneVerified || !whatsappVerified;

    // first hop
    if (request.session.length === 0) {
      const clientId = callerContext?.clientId || "";
      const role = await getClientRole(PoolId, clientId);

      if (signupIncomplete) {
        if (role === "SIGNUP") {
          response.challengeName = "CUSTOM_CHALLENGE";
          response.failAuthentication = false;
          return logReturn("define_signup_send_otp", event);
        }
        if (role === "LOGIN") {
          response.failAuthentication = true;
          return logReturn("define_login_blocked_signup_incomplete", event);
        }
        response.failAuthentication = true;
        return logReturn("define_unknown_client_blocked", event);
      }

      // fully ready for login
      response.challengeName = "CUSTOM_CHALLENGE";
      response.failAuthentication = false;
      return logReturn("define_login_send_otp", event);
    }

    // subsequent hops
    console.log("Session snapshot:", JSON.stringify(request.session, null, 2));
    const last = request.session[request.session.length - 1];
    const lastWasCustom = last.challengeName === "CUSTOM_CHALLENGE";
    const wasSignup = last.challengeMetadata === "OTP_SIGNUP";

    if (lastWasCustom && last.challengeResult === true) {
      // fallback guard: finalize if user is not fully verified or not confirmed
      const needsFinalize = wasSignup || !isConfirmed || !phoneVerified || !whatsappVerified;

      if (needsFinalize) {
        try {
          await cognito.send(new AdminUpdateUserAttributesCommand({
            UserPoolId: PoolId,
            Username: userName,
            UserAttributes: [
              { Name: "phone_number_verified", Value: "true" },
              { Name: "custom:whatsapp_verified", Value: "true" }
            ]
          }));
          if (!isConfirmed) {
            await cognito.send(new AdminConfirmSignUpCommand({ UserPoolId: PoolId, Username: userName }));
          }
          console.log("Finalize signup ok");
        } catch (e: any) {
          console.error("Finalize signup failed:", e);
          response.failAuthentication = true;
          return logReturn("define_finalize_failed", event, { error: String(e) });
        }
      }

      // For signup flow: complete verification but intentionally fail auth
      // This forces the frontend to catch NotAuthorizedException as success
      if (wasSignup) {
        console.log("Signup verification complete - intentionally failing auth to end custom flow");
        response.issueTokens = false;
        response.failAuthentication = true;
        return logReturn("define_signup_complete_fail_auth", event);
      }

      // For login flow: issue tokens normally
      response.issueTokens = true;
      response.failAuthentication = false;
      return logReturn("define_issue_tokens", event);
    }

    // wrong code retry limit
    if (request.session.length < 3) {
      response.challengeName = "CUSTOM_CHALLENGE";
      response.failAuthentication = false;
      return logReturn("define_retry_custom_challenge", event);
    }

    response.failAuthentication = true;
    return logReturn("define_too_many_attempts", event);
  } catch (error: any) {
    console.error("Unexpected error in defineAuthChallenge:", error);
    try {
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    } catch {}
    return logReturn("define_unexpected", event, { error: String(error) });
  }
};

export const handler = defineAuthChallenge;
