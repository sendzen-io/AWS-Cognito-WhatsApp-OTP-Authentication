// import {
//   AdminGetUserCommand,
//   AdminUpdateUserAttributesCommand,
// } from '@aws-sdk/client-cognito-identity-provider';
// import { PostConfirmationEvent, PostConfirmationHandler } from './types';
// import { logReturn } from './utils';
// import { cognitoClient } from './cognitoClient';

// // PostConfirmation trigger - set auth purpose for WhatsApp verification
// export const handler: PostConfirmationHandler = async (event: PostConfirmationEvent) => {
//   console.log('postConfirmation:', JSON.stringify(event));

//   const { userName, userPoolId } = event;

//   try {
//     const getRes = await cognitoClient.send(
//       new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
//     );
//     console.log(`PostConfirmation - User ${userName} status: ${getRes.UserStatus}`);

//     if (getRes.UserStatus !== 'CONFIRMED') {
//       console.warn(`WARNING: User ${userName} is not confirmed in PostConfirmation trigger`);
//       return logReturn('post_not_confirmed', event);
//     }

//     // Initialize signup flow only - do not flip verifications here
//     try {
//       await cognitoClient.send(
//         new AdminUpdateUserAttributesCommand({
//           UserPoolId: userPoolId,
//           Username: userName,
//           UserAttributes: [{ Name: 'custom:auth_purpose', Value: 'signup_whatsapp_verify' }],
//         })
//       );
//       console.log(`Auth purpose set to 'signup_whatsapp_verify' for user ${userName}`);
//     } catch (updateError) {
//       console.error('Failed to set auth purpose:', updateError);
//       // swallow - do not block the confirmation
//     }
//     return logReturn('post_set_purpose', event);
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

export const handler: PostConfirmationHandler = async (event: PostConfirmationEvent) => {
  console.log('postConfirmation:', JSON.stringify(event));

  const { userName, userPoolId } = event;

  try {
    // Fetch fresh user to confirm status and attributes
    const getRes = await cognitoClient.send(
      new AdminGetUserCommand({ UserPoolId: userPoolId, Username: userName })
    );

    if (getRes.UserStatus !== 'CONFIRMED') {
      console.warn(`User ${userName} not CONFIRMED in PostConfirmation`);
      return logReturn('post_not_confirmed', event);
    }

    const attrMap = Object.fromEntries(
      (getRes.UserAttributes || []).map(a => [a.Name, a.Value])
    );

    // Ensure whatsapp_verified is present and defaults to "false"
    const hasWaAttr = Object.prototype.hasOwnProperty.call(attrMap, 'custom:whatsapp_verified');
    if (!hasWaAttr) {
      try {
        await cognitoClient.send(
          new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: userName,
            UserAttributes: [{ Name: 'custom:whatsapp_verified', Value: 'false' }],
          })
        );
        console.log(`Initialized custom:whatsapp_verified=false for ${userName}`);
      } catch (e) {
        console.warn('Failed to initialize whatsapp_verified attr, continuing:', e);
      }
    }

    // Nothing else to do here. Signup WhatsApp verification will be triggered
    // when the client starts CUSTOM_AUTH using the Signup client id.
    return logReturn('post_ok', event);
  } catch (e: any) {
    console.error('Error in PostConfirmation:', e?.message || e);
    // Never block sign up on this trigger
    return logReturn('post_error_non_blocking', event, { error: String(e) });
  }
};
