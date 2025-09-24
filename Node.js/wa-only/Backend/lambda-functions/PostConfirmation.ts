import { cognito, AdminGetUserCommand, AdminUpdateUserAttributesCommand } from "../cognito";
import { logReturn } from "../utils";


const postConfirmation = async (event: any) => {
  console.log("postConfirmation:", JSON.stringify(event));

  const { userName } = event;
  const PoolId = event.userPoolId;

  try {
    const getRes = await cognito.send(
      new AdminGetUserCommand({ UserPoolId: PoolId, Username: userName })
    );
    console.log(
      `PostConfirmation - User ${userName} status: ${getRes.UserStatus}`
    );

    if (getRes.UserStatus !== "CONFIRMED") {
      console.warn(
        `WARNING: User ${userName} is not confirmed in PostConfirmation trigger`
      );
      return logReturn("post_not_confirmed", event);
    } else {
      console.log(
        `User ${userName} confirmed successfully - setting auth purpose for WhatsApp verification`
      );
      try {
        await cognito.send(
          new AdminUpdateUserAttributesCommand({
            UserPoolId: PoolId,
            Username: userName,
            UserAttributes: [
              { Name: "custom:auth_purpose", Value: "signup_whatsapp_verify" },
            ],
          })
        );
        console.log(
          `Auth purpose set to 'signup_whatsapp_verify' for user ${userName}`
        );
      } catch (updateError) {
        console.error("Failed to set auth purpose:", updateError);
        // do not throw
      }
      return logReturn("post_set_purpose", event);
    }
  } catch (e: any) {
    console.error("Error in PostConfirmation:", e.message);
    return logReturn("post_error", event, { error: String(e) });
  }
};

export const handler = postConfirmation;
