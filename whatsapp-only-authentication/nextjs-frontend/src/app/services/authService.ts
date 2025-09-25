// // authService.ts
// import {
//   CognitoIdentityProviderClient,
//   SignUpCommand,
//   InitiateAuthCommand,
//   RespondToAuthChallengeCommand,
//   GlobalSignOutCommand,
//   GetUserCommand,
// } from "@aws-sdk/client-cognito-identity-provider";

// const REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
// const USER_POOL_ID = process.env.NEXT_PUBLIC_USER_POOL_ID!;
// const SIGNUP_CLIENT_ID = process.env.NEXT_PUBLIC_SIGNUP_CLIENT_ID!;
// const LOGIN_CLIENT_ID  = process.env.NEXT_PUBLIC_LOGIN_CLIENT_ID!;

// const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

// function clientFor(flow: "SIGNUP" | "LOGIN") {
//   return flow === "SIGNUP" ? SIGNUP_CLIENT_ID : LOGIN_CLIENT_ID;
// }

// export interface SignupData { password: string; phoneNumber: string; }
// export interface LoginData { phoneNumber: string; }
// export interface AuthTokens { accessToken: string; refreshToken: string; idToken: string; expiresIn: number; }

// class AuthService {
//   private authSession: string | null = null;
//   private currentFlow: "SIGNUP" | "LOGIN" | null = null;

//   async signUp(data: SignupData) {
//     this.currentFlow = "SIGNUP";
    
//     // Create account first
//     const signUpCmd = new SignUpCommand({
//       ClientId: clientFor("SIGNUP"),
//       Username: data.phoneNumber,
//       Password: data.password,
//       UserAttributes: [
//         { Name: "phone_number", Value: data.phoneNumber }
//       ],
//     });
//     const signUpRes = await cognitoClient.send(signUpCmd);
//     if (!signUpRes.UserSub) throw new Error("Failed to create account");
    
//     // Immediately trigger OTP challenge
//     const authCmd = new InitiateAuthCommand({
//       ClientId: clientFor("SIGNUP"),
//       AuthFlow: "CUSTOM_AUTH",
//       AuthParameters: { USERNAME: data.phoneNumber }
//     });
//     const authRes = await cognitoClient.send(authCmd);
//     if (authRes.ChallengeName === "CUSTOM_CHALLENGE") {
//       this.authSession = authRes.Session || null;
//       return { success: true, message: "Account created. Check WhatsApp for OTP." };
//     }
//     throw new Error("Failed to trigger OTP challenge");
//   }


//   async initiateLogin(data: LoginData) {
//     this.currentFlow = "LOGIN";
//     const cmd = new InitiateAuthCommand({
//       ClientId: clientFor("LOGIN"),
//       AuthFlow: "CUSTOM_AUTH",
//       AuthParameters: { USERNAME: data.phoneNumber }
//     });
//     try {
//       const res = await cognitoClient.send(cmd);
//       if (res.ChallengeName === "CUSTOM_CHALLENGE") {
//         this.authSession = res.Session || null;
//         return { success: true, message: "OTP sent to WhatsApp" };
//       }
//       throw new Error("Unexpected auth flow");
//     } catch (err: any) {
//       if (err.name === "NotAuthorizedException") {
//         // This happens when Define blocked login because signup is incomplete
//         throw new Error("Please complete signup verification first.");
//       }
//       if (err.name === "UserNotFoundException") {
//         throw new Error("No account found with this phone number");
//       }
//       throw new Error(err.message || "Failed to initiate login");
//     }
//   }

//   async verifyOTP(phoneNumber: string, otp: string) {
//     if (!this.authSession) throw new Error("No active session. Restart the flow.");
//     if (!this.currentFlow) throw new Error("No active flow. Restart the process.");
    
//     const cmd = new RespondToAuthChallengeCommand({
//       ClientId: clientFor(this.currentFlow),
//       Session: this.authSession,
//       ChallengeName: "CUSTOM_CHALLENGE",
//       ChallengeResponses: {
//         USERNAME: phoneNumber,
//         ANSWER: otp
//       }
//     });
//     const res = await cognitoClient.send(cmd);
//     if (!res.AuthenticationResult) throw new Error("Authentication failed");
//     const tokens: AuthTokens = {
//       accessToken: res.AuthenticationResult.AccessToken || "",
//       refreshToken: res.AuthenticationResult.RefreshToken || "",
//       idToken: res.AuthenticationResult.IdToken || "",
//       expiresIn: res.AuthenticationResult.ExpiresIn || 3600
//     };
//     localStorage.setItem("authTokens", JSON.stringify(tokens));
//     localStorage.setItem("userPhone", phoneNumber);
//     this.authSession = null;
//     this.currentFlow = null;
//     return tokens;
//   }

//   async getCurrentUser(accessToken: string) {
//     const res = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
//     return {
//       userId: res.Username || "",
//       phoneNumber: res.UserAttributes?.find(a => a.Name === "phone_number")?.Value || ""
//     };
//   }

//   async logout(accessToken: string) {
//     try { await cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken })); }
//     catch {}
//     localStorage.removeItem("authTokens");
//     localStorage.removeItem("userPhone");
//     this.authSession = null;
//     this.currentFlow = null;
//   }

//   isAuthenticated() { return !!localStorage.getItem("authTokens"); }
//   getStoredTokens() { const t = localStorage.getItem("authTokens"); return t ? JSON.parse(t) : null; }
//   getStoredUserPhone() { return localStorage.getItem("userPhone"); }
// }

// export const authService = new AuthService();

// authService.ts
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
const USER_POOL_ID = process.env.NEXT_PUBLIC_USER_POOL_ID!; // optional
const SIGNUP_CLIENT_ID = process.env.NEXT_PUBLIC_SIGNUP_CLIENT_ID!;
const LOGIN_CLIENT_ID  = process.env.NEXT_PUBLIC_LOGIN_CLIENT_ID!;

type Flow = "SIGNUP" | "LOGIN";

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

// sessionStorage keys (survive refresh)
const SESS_KEY  = "cog_custom_auth_session";
const FLOW_KEY  = "cog_custom_auth_flow";
const PHONE_KEY = "cog_custom_auth_phone";

function clientFor(flow: Flow) {
  return flow === "SIGNUP" ? SIGNUP_CLIENT_ID : LOGIN_CLIENT_ID;
}
function setFlowState(session: string | null, flow: Flow | null, phone?: string) {
  if (typeof window === "undefined") return;
  if (session) sessionStorage.setItem(SESS_KEY, session);
  else sessionStorage.removeItem(SESS_KEY);
  if (flow) sessionStorage.setItem(FLOW_KEY, flow);
  else sessionStorage.removeItem(FLOW_KEY);
  if (phone) sessionStorage.setItem(PHONE_KEY, phone);
}
function getFlowState() {
  if (typeof window === "undefined") return { session: null as string | null, flow: null as Flow | null, phone: null as string | null };
  return {
    session: sessionStorage.getItem(SESS_KEY),
    flow: (sessionStorage.getItem(FLOW_KEY) as Flow | null) ?? null,
    phone: sessionStorage.getItem(PHONE_KEY),
  };
}

export interface SignupData { password: string; phoneNumber: string; }
export interface LoginData  { phoneNumber: string; }
export interface AuthTokens { accessToken: string; refreshToken: string; idToken: string; expiresIn: number; }
export interface SignupCompleteResult { signupComplete: true; message: string; }
export type VerifyOTPResult = AuthTokens | SignupCompleteResult;

class AuthService {
  private authSession: string | null = null;
  private currentFlow: Flow | null = null;

  private syncFromStorage() {
    const { session, flow } = getFlowState();
    this.authSession = session;
    this.currentFlow = flow;
  }

  async signUp(data: SignupData) {
    this.currentFlow = "SIGNUP";

    // 1) Create user
    const signUpCmd = new SignUpCommand({
      ClientId: clientFor("SIGNUP"),
      Username: data.phoneNumber,
      Password: data.password,
      UserAttributes: [{ Name: "phone_number", Value: data.phoneNumber }],
    });
    const signUpRes = await cognitoClient.send(signUpCmd);
    if (!signUpRes.UserSub) throw new Error("Failed to create account");

    // 2) Start custom auth (signup OTP)
    const authCmd = new InitiateAuthCommand({
      ClientId: clientFor("SIGNUP"),
      AuthFlow: "CUSTOM_AUTH",
      AuthParameters: { USERNAME: data.phoneNumber },
    });
    const authRes = await cognitoClient.send(authCmd);
    if (authRes.ChallengeName !== "CUSTOM_CHALLENGE") throw new Error("Failed to trigger OTP challenge");

    this.authSession = authRes.Session || null;
    setFlowState(this.authSession, "SIGNUP", data.phoneNumber);
    return { success: true, message: "Account created. Check WhatsApp for OTP." };
  }

  async initiateLogin(data: LoginData) {
    this.currentFlow = "LOGIN";
    const cmd = new InitiateAuthCommand({
      ClientId: clientFor("LOGIN"),
      AuthFlow: "CUSTOM_AUTH",
      AuthParameters: { USERNAME: data.phoneNumber },
    });
    try {
      const res = await cognitoClient.send(cmd);
      if (res.ChallengeName !== "CUSTOM_CHALLENGE") throw new Error("Unexpected auth flow");
      this.authSession = res.Session || null;
      setFlowState(this.authSession, "LOGIN", data.phoneNumber);
      return { success: true, message: "OTP sent to WhatsApp" };
    } catch (err: any) {
      if (err.name === "NotAuthorizedException") {
        // Define blocked login because signup is incomplete
        throw new Error("Please complete signup verification first.");
      }
      if (err.name === "UserNotFoundException") {
        throw new Error("No account found with this phone number");
      }
      throw new Error(err.message || "Failed to initiate login");
    }
  }

  // Optional: keep flow consistent and refresh Session
  async resendOTP(phoneNumber: string) {
    this.syncFromStorage();
    const flow = this.currentFlow || "SIGNUP";
    const cmd = new InitiateAuthCommand({
      ClientId: clientFor(flow),
      AuthFlow: "CUSTOM_AUTH",
      AuthParameters: { USERNAME: phoneNumber },
    });
    const res = await cognitoClient.send(cmd);
    if (res.ChallengeName !== "CUSTOM_CHALLENGE") throw new Error("Unexpected auth flow");
    this.authSession = res.Session || null;
    setFlowState(this.authSession, flow, phoneNumber);
    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOTP(phoneNumber: string, otp: string, isSignup?: boolean): Promise<VerifyOTPResult> {
    // Reload in case of refresh/navigation
    this.syncFromStorage();
    if (!this.authSession || !this.currentFlow) throw new Error("No active session. Restart the flow.");

    // Optional guard: ensure same phone as started
    const { phone } = getFlowState();
    if (phone && phone !== phoneNumber) {
      throw new Error("Phone number mismatch. Use the same number you started with.");
    }

    // Ensure we're using the correct flow based on the isSignup parameter
    const expectedFlow = isSignup ? "SIGNUP" : "LOGIN";
    if (this.currentFlow !== expectedFlow) {
      console.warn(`Flow mismatch: expected ${expectedFlow}, got ${this.currentFlow}. Using current flow.`);
    }

    const cmd = new RespondToAuthChallengeCommand({
      ClientId: clientFor(this.currentFlow),
      Session: this.authSession,
      ChallengeName: "CUSTOM_CHALLENGE",
      ChallengeResponses: {
        USERNAME: phoneNumber,
        ANSWER: otp,
      },
    });
    
    try {
      const res = await cognitoClient.send(cmd);
      if (!res.AuthenticationResult) throw new Error("Authentication failed");

      const tokens: AuthTokens = {
        accessToken: res.AuthenticationResult.AccessToken || "",
        refreshToken: res.AuthenticationResult.RefreshToken || "",
        idToken: res.AuthenticationResult.IdToken || "",
        expiresIn: res.AuthenticationResult.ExpiresIn || 3600,
      };

      localStorage.setItem("authTokens", JSON.stringify(tokens));
      localStorage.setItem("userPhone", phoneNumber);

      // clear
      this.clearFlowState();
      return tokens;
    } catch (error: any) {
      console.error("OTP verification error:", error);
    
      if (error.name === "UserNotConfirmedException") {
        throw new Error("User account is not confirmed. Please complete the signup process.");
      }
    
      if (error.name === "NotAuthorizedException") {
        // Only in SIGNUP flow do we treat some NotAuthorizedException as success.
        // Confirm by attempting to start a LOGIN flow. If login flow can start,
        // the user was finalized and we can safely say signup complete.
        this.syncFromStorage();
        if (isSignup) {
          try {
            const { phone } = getFlowState();
            const probePhone = phone ?? phoneNumber;
    
            const probe = new InitiateAuthCommand({
              ClientId: clientFor("LOGIN"),
              AuthFlow: "CUSTOM_AUTH",
              AuthParameters: { USERNAME: probePhone },
            });
            const probeRes = await cognitoClient.send(probe);
    
            // If we get a challenge, user is confirmed and verified.
            if (probeRes.ChallengeName === "CUSTOM_CHALLENGE") {
              // do not keep this probe session, we just wanted to check status
              this.clearFlowState();
              return { signupComplete: true, message: "Signup verification complete. Please log in." };
            }
    
            // Unexpected, but treat as not complete
            throw new Error("Verification not complete. Please try again.");
    
          } catch (probeErr: any) {
            // If login flow is blocked, the user is still not confirmed or OTP was wrong.
            // Surface a proper error to the UI rather than falsely claiming success.
            throw new Error("Invalid or expired code. Please request a new OTP and try again.");
          }
        }
    
        // For login flow, NotAuthorizedException means wrong code or bad session.
        throw new Error("Invalid OTP or session expired. Please try again.");
      }
    
      if (error.name === "CodeMismatchException") {
        throw new Error("Invalid OTP code. Please check and try again.");
      }
      if (error.name === "ExpiredCodeException") {
        throw new Error("OTP expired. Please request a new one.");
      }
      if (error.name === "LimitExceededException") {
        throw new Error("Too many attempts. Please try again later.");
      }
    
      throw new Error(error.message || "OTP verification failed");
    }
    
  }

  private clearFlowState() {
    console.log("Clearing flow state - session and flow reset");
    this.authSession = null;
    this.currentFlow = null;
    setFlowState(null, null);
  }

  async getCurrentUser(accessToken: string) {
    const res = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
    return {
      userId: res.Username || "",
      phoneNumber: res.UserAttributes?.find(a => a.Name === "phone_number")?.Value || "",
    };
  }

  async logout(accessToken: string) {
    try { await cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken })); } catch {}
    localStorage.removeItem("authTokens");
    localStorage.removeItem("userPhone");
    this.clearFlowState();
  }

  isAuthenticated() { return !!localStorage.getItem("authTokens"); }
  getStoredTokens()  { const t = localStorage.getItem("authTokens"); return t ? JSON.parse(t) : null; }
  getStoredUserPhone() { return localStorage.getItem("userPhone"); }
}

export const authService = new AuthService();
