// import { CreateAuthChallengeEvent, CreateAuthChallengeHandler } from './types';
// import { getUserPhoneNumber, isE164, generateOTP, sendOTPViaWhatsApp, logReturn } from './utils';

// // Create auth challenge - generate and send OTP over WhatsApp
// export const handler: CreateAuthChallengeHandler = async (event: CreateAuthChallengeEvent) => {
//   try {
//     console.log('createAuthChallenge:', JSON.stringify(event));

//     const { request, response } = event;

//     if (request.userNotFound) {
//       (response as any).failAuthentication = true;
//       (response as any).challengeMetadata = 'ERROR_USER_NOT_FOUND';
//       return logReturn('create_user_not_found', event);
//     }

//     const attrs = request.userAttributes || {};
//     const phone = getUserPhoneNumber(attrs);

//     if (!phone) {
//       (response as any).failAuthentication = true;
//       (response as any).challengeMetadata = 'ERROR_NO_PHONE_NUMBER';
//       return logReturn('create_no_phone', event);
//     }

//     if (!isE164(phone)) {
//       (response as any).failAuthentication = true;
//       (response as any).challengeMetadata = 'ERROR_INVALID_PHONE_FORMAT';
//       return logReturn('create_bad_phone_format', event, { phone });
//     }

//     // generate a new code on every challenge
//     const otp = generateOTP();
//     const issuedAt = Date.now().toString();

//     // store only in private parameters - Cognito passes these to verify handler
//     response.privateChallengeParameters = { answer: otp, issuedAt };

//     // label this round for Define to know how to finish
//     const attrMap = Object.fromEntries(Object.entries(attrs));
//     const isSignupRound =
//       attrMap['custom:auth_purpose'] === 'signup_whatsapp_verify' &&
//       attrMap['custom:whatsapp_verified'] !== 'true';
//     (response as any).challengeMetadata = isSignupRound ? 'OTP_SIGNUP' : 'OTP_LOGIN';

//     try {
//       await sendOTPViaWhatsApp(phone, otp);
//       console.log(`otp sent to ${phone} mode: ${(response as any).challengeMetadata}`);
//     } catch (err: any) {
//       console.error('send otp failed:', err.message);
//       console.error('WhatsApp error details:', JSON.stringify(err, null, 2));
//       (response as any).failAuthentication = true;
//       (response as any).challengeMetadata = 'ERROR_WHATSAPP_SEND_FAILED';
//       return logReturn('create_whatsapp_send_failed', event, {
//         whatsappError: err.whatsappError,
//       });
//     }

//     return logReturn('create_ok', event);
//   } catch (error) {
//     console.error('Unexpected error in createAuthChallenge:', error);
//     (event.response as any).failAuthentication = true;
//     (event.response as any).challengeMetadata = 'ERROR_UNEXPECTED';
//     return logReturn('create_unexpected', event, { error: String(error) });
//   }
// };


import { CreateAuthChallengeEvent, CreateAuthChallengeHandler } from './types';
import { getUserPhoneNumber, isE164, generateOTP, sendOTPViaWhatsApp, logReturn } from './utils';

// Create auth challenge - generate and send OTP over WhatsApp
export const handler: CreateAuthChallengeHandler = async (event: CreateAuthChallengeEvent) => {
  const { request, response } = event;
  try {
    console.log('createAuthChallenge:', JSON.stringify(event));


    // Do NOT set response.failAuthentication here - not supported for Create
    const attrs = request.userAttributes || {};
    const phone = getUserPhoneNumber(attrs);
    const flow = request.clientMetadata?.flow; // optional hint from your app

    // If Cognito told us user not found, short-circuit with a one-step fail
    if (request.userNotFound) {
      response.publicChallengeParameters = {
        error: 'USER_NOT_FOUND',
        message: 'Account does not exist',
      };
      response.privateChallengeParameters = { shouldFail: 'true' };
      return logReturn('create_user_not_found', event);
    }

    // Block: missing phone
    if (!phone) {
      response.publicChallengeParameters = {
        error: 'NO_PHONE',
        message: 'Phone number is required',
      };
      response.privateChallengeParameters = { shouldFail: 'true' };
      return logReturn('create_no_phone', event);
    }

    // Block: bad phone format
    if (!isE164(phone)) {
      response.publicChallengeParameters = {
        error: 'BAD_PHONE_FORMAT',
        message: 'Phone number format is invalid',
      };
      response.privateChallengeParameters = { shouldFail: 'true' };
      return logReturn('create_bad_phone_format', event, { phone });
    }

    // Decide which flow this is
    const isSignupRound =
      attrs['custom:auth_purpose'] === 'signup_whatsapp_verify' &&
      attrs['custom:whatsapp_verified'] !== 'true';

      if (flow === "login" && isSignupRound) {
        response.publicChallengeParameters = {
          error: "VERIFY_WHATSAPP_FIRST",
          message: "Please complete WhatsApp verification from signup.",
        };
        response.privateChallengeParameters = { shouldFail: "true" };
        return logReturn("create_block_login_during_signup", event);
      }

    // Guard: if not signup and user is not fully verified, do not send OTP
    const phoneVerified = attrs['phone_number_verified'] === 'true';
    const whatsappVerified = attrs['custom:whatsapp_verified'] === 'true';
    const needsVerification = !phoneVerified || !whatsappVerified;

    if (needsVerification && !isSignupRound && flow === "login") {
      response.publicChallengeParameters = {
        error: 'VERIFY_WHATSAPP_FIRST',
        message: 'Please complete WhatsApp and phone verification from signup.',
      };
      response.privateChallengeParameters = { shouldFail: 'true' };
      return logReturn('create_block_unverified_login', event);
    }

    // Generate OTP on every challenge
    const otp = generateOTP();
    const issuedAt = Date.now().toString();

    // Store only in private parameters - passed to Verify
    response.privateChallengeParameters = { answer: otp, issuedAt };

    // Label for Define to know how to finish
    response.challengeMetadata = isSignupRound ? 'OTP_SIGNUP' : 'OTP_LOGIN';

    try {
      await sendOTPViaWhatsApp(phone, otp);
      console.log(`otp sent to ${phone} mode: ${response.challengeMetadata}`);
    } catch (err: any) {
      console.error('send otp failed:', err);
      response.publicChallengeParameters = {
        error: 'WHATSAPP_SEND_FAILED',
        message: 'Could not send code via WhatsApp',
      };
      response.privateChallengeParameters = { shouldFail: 'true' };
      // Do not set challengeMetadata to an error string
      return logReturn('create_whatsapp_send_failed', event, {
        whatsappError: err.whatsappError,
      });
    }

    return logReturn('create_ok', event);
  } catch (error) {
    console.error('Unexpected error in createAuthChallenge:', error);
    response.publicChallengeParameters = {
      error: 'UNEXPECTED',
      message: 'Unexpected error',
    };
    response.privateChallengeParameters = { shouldFail: 'true' };
    return logReturn('create_unexpected', event, { error: String(error) });
  }
};
