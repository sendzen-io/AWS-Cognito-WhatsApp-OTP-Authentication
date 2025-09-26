
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

//   // Let the pool settings send email verification
//   event.response.autoConfirmUser = false;
//   event.response.autoVerifyEmail = false;
//   event.response.autoVerifyPhone = false;

//   return logReturn('preSignUp_ok', event);
// };


import { PreSignUpHandler, PreSignUpEvent } from './types';
import { logReturn } from './utils';

export const handler: PreSignUpHandler = async (event: PreSignUpEvent) => {
  console.log('PreSignUp event:', JSON.stringify(event));

  const attrs = event.request.userAttributes || {};
  const phone = attrs.phone_number;

  if (!phone) {
    console.error('phone_number is required for WhatsApp OTP signup');
    throw new Error('phone_number is required for WhatsApp OTP signup');
  }

  // Do NOT auto confirm, let Cognito send email verification
  event.response.autoConfirmUser = false;
  event.response.autoVerifyEmail = false;
  event.response.autoVerifyPhone = false;

  return logReturn('preSignUp_ok', event);
};
