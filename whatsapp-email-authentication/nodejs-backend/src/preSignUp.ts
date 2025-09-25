// import { PreSignUpHandler, PreSignUpEvent } from './types';
// import { getUserPhoneNumber, logReturn } from './utils';

// // Pre sign up trigger - minimal function to satisfy Cognito trigger
// export const handler: PreSignUpHandler = async (event: PreSignUpEvent) => {
//   console.log('preSignUp:', JSON.stringify(event));

//   const attrs = event.request.userAttributes || {};
//   const phone = getUserPhoneNumber(attrs);

//   if (!phone) {
//     console.error('phone_number is required for WhatsApp OTP');
//     throw new Error('phone_number is required for WhatsApp OTP');
//   }

//   // Allow Cognito to handle email verification automatically
//   event.response.autoConfirmUser = false;
//   event.response.autoVerifyEmail = false; // Let Cognito send email verification
//   event.response.autoVerifyPhone = false;

//   return logReturn('preSignUp_ok', event);
// };


import { PreSignUpHandler, PreSignUpEvent } from './types';
import { getUserPhoneNumber, logReturn } from './utils';

// Pre sign up trigger - minimal function to satisfy Cognito trigger
export const handler: PreSignUpHandler = async (event: PreSignUpEvent) => {
  console.log('preSignUp:', JSON.stringify(event));

  const attrs = event.request.userAttributes || {};
  const phone = getUserPhoneNumber(attrs);

  if (!phone) {
    console.error('phone_number is required for WhatsApp OTP');
    throw new Error('phone_number is required for WhatsApp OTP');
  }

  // Let the pool settings send email verification
  event.response.autoConfirmUser = false;
  event.response.autoVerifyEmail = false;
  event.response.autoVerifyPhone = false;

  return logReturn('preSignUp_ok', event);
};
