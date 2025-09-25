// cognitoCustomAuth.js
// Small helpers to run CUSTOM_AUTH using AWS SDK v3 directly in the browser.
// For testing only if your app client has a secret.
const REGION = import.meta.env.VITE_AWS_REGION || "eu-west-1";
const CLIENT_ID = import.meta.env.VITE_USER_POOL_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
// WebCrypto HMAC SHA-256 -> base64
export async function generateSecretHash(username) {
  if (!CLIENT_SECRET) throw new Error("Client secret is missing");
  const enc = new TextEncoder();
  const keyData = enc.encode(CLIENT_SECRET);
  const msgData = enc.encode(username + CLIENT_ID);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return b64;
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhoneE164(n) {
  return /^\+[1-9]\d{1,14}$/.test(n || "");
}
function normalizeUsername(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

// Enhanced error message creator with context
function createDetailedErrorMessage(error, operation, context = {}) {
  const baseMessage =
    parseAuthError(error, operation) ||
    parseLambdaError(error) ||
    parseWhatsAppError(error.message) ||
    error.message ||
    "Authentication failed. Please try again.";

  // Add context-specific information
  if (operation === "SignUp" && context.email) {
    if (baseMessage.includes("account") && baseMessage.includes("exists")) {
      return `${baseMessage} Try signing in with ${context.email} instead.`;
    }
  }

  if (operation === "ConfirmSignUp" && context.email) {
    if (baseMessage.includes("code")) {
      return `${baseMessage} Check your email inbox for the verification code sent to ${context.email}.`;
    }
  }

  if (operation === "VerifyOtp" && context.phone) {
    if (baseMessage.includes("WhatsApp")) {
      return `${baseMessage} Make sure ${context.phone} is registered with WhatsApp.`;
    }
  }

  return baseMessage;
}
// pass which call failed so we can decide better
function parseAuthError(error, op /* e.g. "InitiateAuth" */) {
  console.error("Auth error details:", error);

  if (error.__type === "UserNotFoundException") {
    return "No account found with this email address.";
  }
  if (error.__type === "NotAuthorizedException" && op === "InitiateAuth") {
    return "Sign in failed. Make sure your email is confirmed and your phone and WhatsApp are verified.";
  }

  // Some bad Define trigger outputs also bubble up as InvalidLambdaResponseException.
  // During InitiateAuth, treat it as "no account" for UX unless you have evidence it is a true outage.
  if (
    error.__type === "InvalidLambdaResponseException" &&
    op === "InitiateAuth"
  ) {
    return "No account found with this email address.";
  }

  if (error.__type === "TooManyRequestsException") {
    return "Too many login attempts. Please wait a few minutes and try again.";
  }
  if (error.__type === "InvalidParameterException") {
    return "Invalid request. Please check your information and try again.";
  }
  if (error.__type === "LimitExceededException") {
    return "Rate limit exceeded. Please try again later.";
  }

  if (error.__type === "CodeMismatchException") {
    return "Invalid verification code. Please check the code and try again.";
  }
  if (error.__type === "ExpiredCodeException") {
    return "Verification code has expired. Please request a new code.";
  }
  if (error.__type === "NotAuthorizedException") {
    return "Invalid credentials. Please check your information and try again.";
  }
  if (error.__type === "InvalidPasswordException") {
    return "Password does not meet requirements. Please use a stronger password.";
  }
  if (error.__type === "UsernameExistsException") {
    return "An account with this email already exists. Please try signing in instead.";
  }

  // Handle specific error scenarios based on Lambda behavior
  if (error.message && error.message.toLowerCase().includes("phone")) {
    return "Phone number is missing for this account. Please contact support.";
  }
  if (error.message && error.message.includes("WhatsApp")) {
    return "Unable to send verification code. Please try again later.";
  }

  // Handle authentication failures from Lambda
  if (error.message && error.message.includes("failAuthentication")) {
    if (error.message.includes("email_not_confirmed")) {
      return "Please confirm your email to continue. Check your email for the verification code.";
    }
    if (error.message.includes("phone_number_not_verified")) {
      return "Your phone number needs to be verified. Please contact support.";
    }
    if (error.message.includes("whatsapp_not_verified")) {
      return "Please verify your WhatsApp number to continue.";
    }
  }

  // Default
  return error.message || "Authentication failed. Please try again.";
}

// Only return something when you actually extracted a code
function parseLambdaError(error) {
  console.error("Lambda error details:", error);

  // Since challengeMetadata is no longer used, we'll rely on Cognito's built-in error types
  // and generic error message parsing
  const map = {
    ERROR_NO_PHONE_NUMBER:
      "Phone number is required for WhatsApp verification. Please add a phone number to your account.",
    ERROR_INVALID_PHONE_FORMAT:
      "Phone number must be in international format (e.g. +1234567890).",
    ERROR_WHATSAPP_SEND_FAILED:
      "Failed to send WhatsApp message. Please try again.",
    ERROR_USER_NOT_FOUND: "No account found with this email address.",
    ERROR_TOO_MANY_ATTEMPTS:
      "Too many authentication attempts. Please wait and try again.",
    ERROR_EMAIL_NOT_CONFIRMED:
      "Please confirm your email to continue. We can resend the code.",
    ERROR_WHATSAPP_NOT_VERIFIED:
      "Please verify your WhatsApp number to continue.",
    ERROR_MISSING_USER_POOL_ID:
      "Server configuration error. Please contact support.",
    ERROR_ACCESS_DENIED: "Access denied. Please contact support.",
    ERROR_CONFIRM_FAILED: "Failed to confirm your account. Please try again.",
    ERROR_PHONE_NUMBER_NOT_VERIFIED:
      "Your phone number needs to be verified. Please contact support.",
    ERROR_USER_LOOKUP_FAILED:
      "Unable to verify your account. Please try again or contact support.",
    ERROR_ATTR_IMMUTABLE:
      "Account verification failed. Please contact support.",
    ERROR_POST_OTP_UPDATE_FAILED:
      "Account verification completed but failed to update status. Please contact support.",
    ERROR_UNEXPECTED:
      "An unexpected error occurred. Please try again or contact support.",
  };

  let errorMessage = null;

  if (error?.message) {
    try {
      // Try to parse JSON error from message
      const m = error.message.match(/\{[\s\S]*\}/);
      if (m) {
        const data = JSON.parse(m[0]);
        if (data.reason && map[data.reason]) return map[data.reason];
        if (data.error) errorMessage = data.error;
      }

      // Check for specific error patterns in the message
      if (error.message.includes("ERROR_")) {
        const errorMatch = error.message.match(/ERROR_[A-Z_]+/);
        if (errorMatch && map[errorMatch[0]]) {
          return map[errorMatch[0]];
        }
      }
    } catch (e) {
      console.error("Failed to parse error JSON:", e);
    }
  }

  return errorMessage || null;
}

// WhatsApp specific error parser (legacy - keeping for backward compatibility)
function parseWhatsAppError(errorMessage) {
  console.error("WhatsApp error details:", errorMessage);
  // Parse WhatsApp error from Lambda response

  try {
    const errorData = JSON.parse(errorMessage);
    if (errorData.statuscode === 401) {
      return `WhatsApp API Error: Unauthorized - Please check your API credentials. Contact support if this continues.`;
    } else if (errorData.statuscode === 400) {
      return `WhatsApp API Error: Invalid request - Please check your phone number format and try again.`;
    } else if (errorData.statuscode === 429) {
      return `WhatsApp API Error: Rate limited - Too many requests. Please wait 5-10 minutes before trying again.`;
    } else if (errorData.response === "NETWORK_ERROR") {
      return `WhatsApp API Error: Network issue - Please check your internet connection and try again.`;
    } else if (errorData.statuscode === 404) {
      return `WhatsApp API Error: Phone number not found - Please ensure your phone number is registered with WhatsApp.`;
    } else if (errorData.statuscode === 403) {
      return `WhatsApp API Error: Access forbidden - Your WhatsApp number may be restricted. Please contact support.`;
    } else if (errorData.statuscode) {
      return `WhatsApp API Error: Status ${errorData.statuscode} - ${
        errorData.data ||
        errorData.response ||
        "Please try again or contact support."
      }`;
    }
  } catch (parseError) {
    console.error("Failed to parse WhatsApp error:", parseError);
  }
  return "WhatsApp service error. Please try again later or contact support if the issue persists.";
}

async function sdk() {
  const {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
    GetUserCommand,
  } = await import("@aws-sdk/client-cognito-identity-provider");
  const client = new CognitoIdentityProviderClient({ region: REGION });
  return {
    client,
    SignUpCommand,
    ConfirmSignUpCommand,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
    GetUserCommand,
  };
}
/** * handleSignup * - Creates the user in Cognito.
 * - Cognito automatically sends email verification.
 * - Returns { userSub, codeDeliveryDetails } for email verification.
 */
export async function handleSignup({ email, password, phone }) {
  if (!validateEmail(email)) throw new Error("Enter a valid email");
  if (!validatePhoneE164(phone))
    throw new Error("Phone must be E.164 like +1234567890");
  if (!password || password.length < 8)
    throw new Error("Password must be at least 8 characters");
  email = normalizeUsername(email);
  const secretHash = await generateSecretHash(email);
  const { client, SignUpCommand } = await sdk();
  try {
    // Sign up - Cognito will automatically send email verification
    const result = await client.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "phone_number", Value: phone },
          { Name: "custom:whatsapp_verified", Value: "false" },
        ],
      })
    );
    console.log("SignUp result:", result);
    return {
      session: result.Session,
      userSub: result.UserSub,
      UserSub: result.UserSub, // Also include capitalized version for Lambda compatibility
      UserConfirmed: result.UserConfirmed || false, // Include UserConfirmed field
      codeDeliveryDetails: result.CodeDeliveryDetails,
      email: email,
      phone: phone,
      user: {
        sub: result.UserSub,
        email: email,
        phone: phone,
        whatsappVerified: false,
        emailVerified: false,
        phoneVerified: false,
        signupTime: new Date().toLocaleString(),
      },
    };
  } catch (error) {
    console.error("Signup error details:", error);
    const errorMessage = createDetailedErrorMessage(error, "SignUp", { email });
    throw new Error(errorMessage);
  }
}

export async function handleConfirmSignUp({ email, confirmationCode }) {
  if (!validateEmail(email)) throw new Error("Enter a valid email");
  if (!confirmationCode || confirmationCode.length !== 6)
    throw new Error("Enter a valid 6-digit confirmation code");
  email = normalizeUsername(email);
  const secretHash = await generateSecretHash(email);
  const { client, ConfirmSignUpCommand, InitiateAuthCommand } = await sdk();
  try {
    // Confirm email verification
    await client.send(
      new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
        SecretHash: secretHash,
      })
    );
    return await initiateAuthHelperForSignup({ email, secretHash });
  } catch (error) {
    console.error("Confirm signup error details:", error);
    const errorMessage = createDetailedErrorMessage(error, "ConfirmSignUp", {
      email,
    });
    throw new Error(errorMessage);
  }
}

const initiateAuthHelperForSignup = async ({ email, secretHash }) => {
  const { client, InitiateAuthCommand } = await sdk();
  try {
    const authParams = {
      AuthFlow: "CUSTOM_AUTH",
      ClientId: CLIENT_ID,
      ClientMetadata: { flow: "signup" },
      AuthParameters: { USERNAME: email, SECRET_HASH: secretHash },
    };
    console.log(
      "InitiateAuthCommand params:",
      JSON.stringify(authParams, null, 2)
    );
    const start = await client.send(new InitiateAuthCommand(authParams));
    const cp = start.ChallengeParameters || {};

    if (cp.error || cp.message) {
      throw new Error(cp.message || cp.error || "Authentication failed");
    }
    return {
      session: start.Session,
      challengeName: start.ChallengeName,
      usernameForChallenge:
        start.ChallengeParameters?.USERNAME ||
        start.ChallengeParameters?.USER_ID_FOR_SRP ||
        email,
    };
  } catch (error) {
    console.error("Initiate auth error details:", error);
    const errorMessage =
      parseAuthError(error, "InitiateAuth") ||
      parseLambdaError(error) ||
      "Authentication failed. Please try again.";
    throw new Error(errorMessage);
  }
};

/** * handleLogin * - Starts CUSTOM_AUTH for an existing user to send the OTP. * - Returns { session } for OTP verification. */
export async function handleLogin({ email }) {
  if (!validateEmail(email)) throw new Error("Enter a valid email");
  email = normalizeUsername(email);
  const secretHash = await generateSecretHash(email);
  const { client, InitiateAuthCommand } = await sdk();
  try {
    const authParams = {
      AuthFlow: "CUSTOM_AUTH",
      ClientId: CLIENT_ID,
      ClientMetadata: { flow: "login" },
      AuthParameters: { USERNAME: email, SECRET_HASH: secretHash },
    };
    console.log(
      "Login InitiateAuthCommand params:",
      JSON.stringify(authParams, null, 2)
    );
    const start = await client.send(new InitiateAuthCommand(authParams));
    const cp = start.ChallengeParameters || {};
    if (cp.error || cp.message) {
      throw new Error(cp.message || cp.error || "Authentication failed");
    }
    return {
      session: start.Session,
      challengeName: start.ChallengeName,
      usernameForChallenge:
        start.ChallengeParameters?.USERNAME ||
        start.ChallengeParameters?.USER_ID_FOR_SRP ||
        email,
    };
  } catch (error) {
    console.error("Login error details:", error);
    const errorMessage = createDetailedErrorMessage(error, "Login", { email });
    throw new Error(errorMessage);
  }
}
/** * handleVerifyOtp * - Verifies the OTP using RespondToAuthChallenge. * - You must pass the latest session from InitiateAuth. * - Returns { tokens } on success. */
export async function handleVerifyOtp({
  email,
  otp,
  session,
  usernameForChallenge,
}) {
  if (!/^\d{6}$/.test(String(otp))) throw new Error("Enter a 6 digit code");
  if (!session) throw new Error("Missing session");

  email = normalizeUsername(email);
  const username = usernameForChallenge || email;
  const secretHash = await generateSecretHash(username);
  const { client, RespondToAuthChallengeCommand } = await sdk();

  try {
    const res = await client.send(
      new RespondToAuthChallengeCommand({
        ClientId: CLIENT_ID,
        ChallengeName: "CUSTOM_CHALLENGE",
        Session: session,
        ChallengeResponses: {
          USERNAME: username,
          ANSWER: String(otp),
          SECRET_HASH: secretHash,
        },
      })
    );

    console.log("OTP verification response:", res);

    // Check if authentication is complete
    if (res.AuthenticationResult) {
      console.log("Authentication successful - tokens received");

      // Decode JWT token to get basic user info
      const idTokenPayload = JSON.parse(
        atob(res.AuthenticationResult.IdToken.split(".")[1])
      );

      // Get fresh user attributes from Cognito (after Lambda updates)
      let freshUserAttributes = {};
      try {
        const { GetUserCommand } = await sdk();
        const freshUserRes = await client.send(
          new GetUserCommand({
            AccessToken: res.AuthenticationResult.AccessToken,
          })
        );

        // Convert attributes array to object
        freshUserAttributes = Object.fromEntries(
          (freshUserRes.UserAttributes || []).map((attr) => [
            attr.Name,
            attr.Value,
          ])
        );
        console.log("Fresh user attributes:", freshUserAttributes);
      } catch (error) {
        console.warn("Failed to get fresh user attributes:", error);
        // Fallback to JWT token data
        freshUserAttributes = {
          "custom:whatsapp_verified":
            idTokenPayload["custom:whatsapp_verified"],
          phone_number_verified: idTokenPayload.phone_number_verified,
          email_verified: idTokenPayload.email_verified,
        };
      }

      return {
        // tokens: res.AuthenticationResult,
        AccessToken: res.AuthenticationResult.AccessToken,
        IdToken: res.AuthenticationResult.IdToken,
        RefreshToken: res.AuthenticationResult.RefreshToken,
        ExpiresIn: res.AuthenticationResult.ExpiresIn,
        user: {
          sub: idTokenPayload.sub,
          email: idTokenPayload.email,
          phone: idTokenPayload.phone_number,
          whatsappVerified:
            freshUserAttributes["custom:whatsapp_verified"] === "true",
          emailVerified: freshUserAttributes["email_verified"] === "true",
          phoneVerified:
            freshUserAttributes["phone_number_verified"] === "true",
          authTime: new Date(idTokenPayload.auth_time * 1000).toLocaleString(),
          tokenExpiry: new Date(idTokenPayload.exp * 1000).toLocaleString(),
        },
      };
    } else if (res.ChallengeName) {
      // Still in challenge state - this shouldn't happen with correct OTP
      console.log("Still in challenge state:", res.ChallengeName);
      throw new Error("OTP verification failed - still in challenge state");
    } else if (res.Session) {
      // New session returned - might need another challenge
      console.log("New session returned:", res.Session);
      throw new Error("OTP verification failed - new session returned");
    } else {
      // Unexpected response
      console.log("Unexpected response structure:", res);
      throw new Error("OTP verification failed - unexpected response");
    }
  } catch (error) {
    console.error("OTP verification error details:", error);
    const errorMessage = createDetailedErrorMessage(error, "VerifyOtp", {
      email,
      phone: email,
    });
    throw new Error(errorMessage);
  }
}
/** * handleResendOtp * - Starts a new CUSTOM_AUTH round. Updates session. */
export async function handleResendOtp({ email }) {
  try {
    return await handleLogin({ email });
  } catch (error) {
    console.error("Resend OTP error details:", error);
    const errorMessage = createDetailedErrorMessage(error, "ResendOtp", {
      email,
    });
    throw new Error(errorMessage);
  }
}
