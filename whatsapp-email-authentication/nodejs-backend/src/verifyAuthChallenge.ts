// import { VerifyAuthChallengeEvent, VerifyAuthChallengeHandler } from './types';
// import { logReturn } from './utils';

// // Verify auth challenge - check code and expiry
// export const handler: VerifyAuthChallengeHandler = async (event: VerifyAuthChallengeEvent) => {
//   console.log('verifyAuthChallenge:', JSON.stringify(event));

//   const { request, response } = event;

//   const userAnswer = (request.challengeAnswer || '').trim();
//   const correct = request.privateChallengeParameters?.answer || '';
//   const issuedAt = Number(request.privateChallengeParameters?.issuedAt || '0');

//   // 5 minute expiry
//   const ttlMs = 5 * 60 * 1000;
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


import { VerifyAuthChallengeEvent, VerifyAuthChallengeHandler } from './types';
import { logReturn } from './utils';

// Verify auth challenge - check code and expiry
export const handler: VerifyAuthChallengeHandler = async (event: VerifyAuthChallengeEvent) => {
  console.log('verifyAuthChallenge:', JSON.stringify(event));

  const { request, response } = event;

  // If Create instructed to fail, end it here without checking any code
  const shouldFail = request.privateChallengeParameters?.shouldFail === 'true';
  if (shouldFail) {
    response.answerCorrect = false;
    return logReturn('verify_forced_fail', event);
  }

  const userAnswer = (request.challengeAnswer || '').trim();
  const correct = request.privateChallengeParameters?.answer || '';
  const issuedAt = Number(request.privateChallengeParameters?.issuedAt || '0');

  // 5 minute expiry
  const ttlMin = Number(process.env.OTP_EXPIRY_MINUTES || "5");
  const ttlMs = ttlMin * 60 * 1000;
  const now = Date.now();


  if (!issuedAt || now - issuedAt > ttlMs) {
    console.log('otp expired');
    response.answerCorrect = false;
    return logReturn('verify_expired', event);
  }

  if (userAnswer === correct) {
    console.log('otp accepted');
    response.answerCorrect = true;
    return logReturn('verify_ok', event);
  } else {
    console.log('otp rejected');
    response.answerCorrect = false;
    return logReturn('verify_wrong_code', event);
  }
};
