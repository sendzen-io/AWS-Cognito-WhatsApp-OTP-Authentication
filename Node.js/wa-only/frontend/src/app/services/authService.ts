import { 
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  ResendConfirmationCodeCommand
} from '@aws-sdk/client-cognito-identity-provider';

// Configuration
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'eu-west-1';
const USER_POOL_ID = process.env.NEXT_PUBLIC_USER_POOL_ID || '';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '';
const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET || '';

const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

// Generate secret hash for Cognito operations
export async function generateSecretHash(username: string): Promise<string> {
  if (!CLIENT_SECRET) {
    throw new Error("Client secret is missing");
  }
  
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

export interface SignupData {
  password: string;
  phoneNumber: string;
}

export interface LoginData {
  phoneNumber: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface UserInfo {
  phoneNumber: string;
  userId: string;
}

class AuthService {
  private authSession: string | null = null;

  // Sign up a new user
  async signUp(data: SignupData): Promise<{ success: boolean; message: string }> {
    try {
      const secretHash = await generateSecretHash(data.phoneNumber);
      
      const signUpCommand = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: data.phoneNumber,
        Password: data.password,
        SecretHash: secretHash,
        UserAttributes: [
          { Name: 'phone_number', Value: data.phoneNumber },
          { Name: 'custom:auth_purpose', Value: 'signup_whatsapp_verify' }
        ]
      });

      const signUpResponse = await cognitoClient.send(signUpCommand);
      
      if (signUpResponse.UserSub) {
        return {
          success: true,
          message: 'Account created successfully. Please verify your WhatsApp OTP.'
        };
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.name === 'UsernameExistsException') {
        throw new Error('An account with this phone number already exists');
      } else if (error.name === 'InvalidPasswordException') {
        throw new Error('Password does not meet requirements');
      } else if (error.name === 'InvalidParameterException') {
        throw new Error('Invalid phone number format');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid client secret or configuration');
      } else {
        throw new Error(error.message || 'Failed to create account');
      }
    }
  }

  // Initiate login with phone number
  async initiateLogin(data: LoginData): Promise<{ success: boolean; message: string }> {
    try {
      const secretHash = await generateSecretHash(data.phoneNumber);
      
      const command = new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: {
          USERNAME: data.phoneNumber,
          SECRET_HASH: secretHash
        }
      });

      const response = await cognitoClient.send(command);
      
      if (response.ChallengeName === 'CUSTOM_CHALLENGE') {
        // Store the session for later use
        this.authSession = response.Session || null;
        return {
          success: true,
          message: 'OTP sent to your WhatsApp'
        };
      } else {
        throw new Error('Unexpected authentication flow');
      }
    } catch (error: any) {
      console.error('Login initiation error:', error);
      
      if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this phone number');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Account is not confirmed or disabled');
      } else if (error.name === 'InvalidParameterException') {
        throw new Error('Invalid client secret or configuration');
      } else {
        throw new Error(error.message || 'Failed to initiate login');
      }
    }
  }

  // Trigger custom auth challenge for signup OTP
  async triggerSignupOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Triggering signup OTP for:', phoneNumber);
      const secretHash = await generateSecretHash(phoneNumber);
      
      const command = new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: {
          USERNAME: phoneNumber,
          SECRET_HASH: secretHash
        }
      });

      console.log('Sending InitiateAuthCommand...');
      const response = await cognitoClient.send(command);
      console.log('InitiateAuth response:', response);
      
      if (response.ChallengeName === 'CUSTOM_CHALLENGE') {
        // Store the session for later use
        this.authSession = response.Session || null;
        console.log('Custom challenge triggered successfully, session stored');
        return {
          success: true,
          message: 'OTP sent to your WhatsApp'
        };
      } else {
        console.error('Unexpected challenge name:', response.ChallengeName);
        throw new Error('Failed to trigger OTP challenge');
      }
    } catch (error: any) {
      console.error('Trigger signup OTP error:', error);
      
      if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this phone number');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Account is not confirmed or disabled');
      } else if (error.name === 'InvalidParameterException') {
        throw new Error('Invalid client secret or configuration');
      } else {
        throw new Error(error.message || 'Failed to trigger OTP');
      }
    }
  }

  // Verify OTP and complete authentication
  async verifyOTP(phoneNumber: string, otp: string, isSignup: boolean = false): Promise<AuthTokens> {
    try {
      const secretHash = await generateSecretHash(phoneNumber);
      
      if (!this.authSession) {
        throw new Error('No active authentication session. Please restart the process.');
      }
      
      const command = new RespondToAuthChallengeCommand({
        ClientId: CLIENT_ID,
        ChallengeName: 'CUSTOM_CHALLENGE',
        Session: this.authSession,
        ChallengeResponses: {
          USERNAME: phoneNumber,
          ANSWER: otp,
          SECRET_HASH: secretHash
        }
      });

      const response = await cognitoClient.send(command);
      
      if (response.AuthenticationResult) {
        const tokens: AuthTokens = {
          accessToken: response.AuthenticationResult.AccessToken || '',
          refreshToken: response.AuthenticationResult.RefreshToken || '',
          idToken: response.AuthenticationResult.IdToken || '',
          expiresIn: response.AuthenticationResult.ExpiresIn || 3600
        };
        
        // Store tokens in localStorage
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        localStorage.setItem('userPhone', phoneNumber);
        
        // Clear the session after successful authentication
        this.authSession = null;
        
        return tokens;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid OTP. Please try again.');
      } else if (error.name === 'CodeMismatchException') {
        throw new Error('Invalid OTP code');
      } else if (error.name === 'ExpiredCodeException') {
        throw new Error('OTP has expired. Please request a new one.');
      } else if (error.name === 'LimitExceededException') {
        throw new Error('Too many attempts. Please try again later.');
      } else if (error.name === 'InvalidParameterException') {
        throw new Error('Invalid client secret or configuration');
      } else {
        throw new Error(error.message || 'OTP verification failed');
      }
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const secretHash = await generateSecretHash(phoneNumber);
      
      const command = new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: {
          USERNAME: phoneNumber,
          SECRET_HASH: secretHash
        }
      });

      const response = await cognitoClient.send(command);
      
      if (response.ChallengeName === 'CUSTOM_CHALLENGE') {
        // Update the stored session with the new one
        this.authSession = response.Session || null;
        return {
          success: true,
          message: 'OTP sent successfully'
        };
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      
      if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this phone number');
      } else if (error.name === 'InvalidParameterException') {
        throw new Error('Invalid client secret or configuration');
      } else {
        throw new Error(error.message || 'Failed to resend OTP');
      }
    }
  }

  // Get current user info
  async getCurrentUser(accessToken: string): Promise<UserInfo> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken
      });

      const response = await cognitoClient.send(command);
      
      const userInfo: UserInfo = {
        userId: response.Username || '',
        phoneNumber: ''
      };

      // Extract user attributes
      response.UserAttributes?.forEach(attr => {
        if (attr.Name === 'phone_number') {
          userInfo.phoneNumber = attr.Value || '';
        }
      });

      return userInfo;
    } catch (error: any) {
      console.error('Get user error:', error);
      throw new Error('Failed to get user information');
    }
  }

  // Logout
  async logout(accessToken: string): Promise<void> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken
      });

      await cognitoClient.send(command);
      
      // Clear local storage and session
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userPhone');
      this.authSession = null;
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local storage and session
      localStorage.removeItem('authTokens');
      localStorage.removeItem('userPhone');
      this.authSession = null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = localStorage.getItem('authTokens');
    return !!tokens;
  }

  // Get stored tokens
  getStoredTokens(): AuthTokens | null {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  // Get stored user phone
  getStoredUserPhone(): string | null {
    return localStorage.getItem('userPhone');
  }
}

export const authService = new AuthService();
