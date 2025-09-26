// import { VerifyAuthChallengeEvent, VerifyAuthChallengeHandler } from './types';
// import { logReturn } from './utils';

// // Verify auth challenge - check code and expiry
// export const handler: VerifyAuthChallengeHandler = async (event: VerifyAuthChallengeEvent) => {
//   console.log('verifyAuthChallenge:', JSON.stringify(event));

//   const { request, response } = event;

//   // If Create instructed to fail, end it here without checking any code
//   const shouldFail = request.privateChallengeParameters?.shouldFail === 'true';
//   if (shouldFail) {
//     response.answerCorrect = false;
//     return logReturn('verify_forced_fail', event);
//   }

//   const userAnswer = (request.challengeAnswer || '').trim();
//   const correct = request.privateChallengeParameters?.answer || '';
//   const issuedAt = Number(request.privateChallengeParameters?.issuedAt || '0');

//   // 5 minute expiry
//   const ttlMin = Number(process.env.OTP_EXPIRY_MINUTES || "5");
//   const ttlMs = ttlMin * 60 * 1000;
//   const now = Date.now();


//   if (!issuedAt || now - issuedAt > ttlMs) {
//     console.log('otp expired');
//     response.answerCorrect = false;
//     return logReturn('verify_expired', event);
//   }

//   if (userAnswer === correct) {
//     console.log('otp accepted');
//     response.answerCorrect = true;
//     return logReturn('verify_ok', event);
//   } else {
//     console.log('otp rejected');
//     response.answerCorrect = false;
//     return logReturn('verify_wrong_code', event);
//   }
// };


import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { VerifyAuthChallengeEvent, VerifyAuthChallengeHandler } from "./types";
import { logReturn } from "./utils";
import { cognitoClient } from "./cognitoClient";
import { getClientRole } from "./clientRole";

function isTrue(v?: string) {
  return String(v).toLowerCase() === "true";
}

export const handler: VerifyAuthChallengeHandler = async (event: VerifyAuthChallengeEvent) => {
  console.log("verifyAuthChallenge:", JSON.stringify(event));

  const { request, response, userPoolId, userName, callerContext } = event;

  if (request.privateChallengeParameters?.shouldFail === "true") {
    response.answerCorrect = false;
    return logReturn("verify_forced_fail", event);
  }

  // validate otp and ttl
  const userAnswer = String(request.challengeAnswer || "").trim();
  const correct = String(request.privateChallengeParameters?.answer || "");
  const issuedAt = Number(request.privateChallengeParameters?.issuedAt || "0");
  const ttlMinutes = Number(process.env.OTP_EXPIRY_MINUTES || "5");
  const ttlMs = ttlMinutes * 60 * 1000;

  if (!issuedAt || Date.now() - issuedAt > ttlMs) {
    response.answerCorrect = false;
    return logReturn("verify_expired", event);
  }
  if (userAnswer !== correct) {
    response.answerCorrect = false;
    return logReturn("verify_wrong_code", event);
  }

  // correct code
  response.answerCorrect = true;

  // flip attributes only for signup role and only if still not verified
  try {
    const role = await getClientRole(userPoolId, callerContext?.clientId);
    if (role === "SIGNUP") {
      const getRes = await cognitoClient.send(
        new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
      );
      const map = Object.fromEntries((getRes.UserAttributes || []).map(a => [a.Name, a.Value]));
      const waVerified = isTrue(map["custom:whatsapp_verified"]);
      const phoneVerified = isTrue(map["phone_number_verified"]);

      if (!waVerified || !phoneVerified) {
        await cognitoClient.send(
          new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: userName,
            UserAttributes: [
              { Name: "custom:whatsapp_verified", Value: "true" },
              { Name: "phone_number_verified", Value: "true" },
            ],
          })
        );
        console.log("signup flags set: whatsapp_verified=true, phone_number_verified=true");
      }
    } else {
      // login role does not mutate attributes
    }
  } catch (e) {
    console.warn("post verify attribute update error (non fatal):", e);
  }

  return logReturn("verify_ok", event);
};
