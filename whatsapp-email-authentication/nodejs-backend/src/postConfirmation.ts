// import {
//   AdminGetUserCommand,
//   AdminUpdateUserAttributesCommand,
// } from '@aws-sdk/client-cognito-identity-provider';
// import { PostConfirmationEvent, PostConfirmationHandler } from './types';
// import { logReturn } from './utils';
// import { cognitoClient } from './cognitoClient';

// // PostConfirmation trigger - set auth purpose and log confirmation event
// export const handler: PostConfirmationHandler = async (event: PostConfirmationEvent) => {
//   console.log('postConfirmation:', JSON.stringify(event));

//   const { userName, userPoolId } = event;

//   try {
//     const getRes = await cognitoClient.send(
//       new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
//     );
//     console.log(
//       `PostConfirmation - User ${userName} status: ${getRes.UserStatus}`
//     );

//     if (getRes.UserStatus !== 'CONFIRMED') {
//       console.warn(
//         `WARNING: User ${userName} is not confirmed in PostConfirmation trigger`
//       );
//       return logReturn('post_not_confirmed', event);
//     } else {
//       console.log(
//         `User ${userName} confirmed successfully - setting auth purpose for WhatsApp verification`
//       );
//       try {
//         await cognitoClient.send(
//           new AdminUpdateUserAttributesCommand({
//             UserPoolId: userPoolId,
//             Username: userName,
//             UserAttributes: [
//               { Name: 'custom:auth_purpose', Value: 'signup_whatsapp_verify' },
//             ],
//           })
//         );
//         console.log(
//           `Auth purpose set to 'signup_whatsapp_verify' for user ${userName}`
//         );
//       } catch (updateError) {
//         console.error('Failed to set auth purpose:', updateError);
//         // do not throw
//       }
//       return logReturn('post_set_purpose', event);
//     }
//   } catch (e: any) {
//     console.error('Error in PostConfirmation:', e.message);
//     return logReturn('post_error', event, { error: String(e) });
//   }
// };



import {
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { PostConfirmationEvent, PostConfirmationHandler } from './types';
import { logReturn } from './utils';
import { cognitoClient } from './cognitoClient';

// PostConfirmation trigger - set auth purpose for WhatsApp verification
export const handler: PostConfirmationHandler = async (event: PostConfirmationEvent) => {
  console.log('postConfirmation:', JSON.stringify(event));

  const { userName, userPoolId } = event;

  try {
    const getRes = await cognitoClient.send(
      new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
    );
    console.log(`PostConfirmation - User ${userName} status: ${getRes.UserStatus}`);

    if (getRes.UserStatus !== 'CONFIRMED') {
      console.warn(`WARNING: User ${userName} is not confirmed in PostConfirmation trigger`);
      return logReturn('post_not_confirmed', event);
    }

    // Initialize signup flow only - do not flip verifications here
    try {
      await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: userName,
          UserAttributes: [{ Name: 'custom:auth_purpose', Value: 'signup_whatsapp_verify' }],
        })
      );
      console.log(`Auth purpose set to 'signup_whatsapp_verify' for user ${userName}`);
    } catch (updateError) {
      console.error('Failed to set auth purpose:', updateError);
      // swallow - do not block the confirmation
    }
    return logReturn('post_set_purpose', event);
  } catch (e: any) {
    console.error('Error in PostConfirmation:', e.message);
    return logReturn('post_error', event, { error: String(e) });
  }
};
