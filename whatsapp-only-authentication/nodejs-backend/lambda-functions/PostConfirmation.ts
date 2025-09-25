// lambda-functions/PostConfirmation.ts
import { logReturn } from "../utils";

const postConfirmation = async (event: any) => {
  console.log("postConfirmation:", JSON.stringify(event));
  return logReturn("post_ok", event);
};

export const handler = postConfirmation;
