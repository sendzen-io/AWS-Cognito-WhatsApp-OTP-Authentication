import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import ErrorBoundary from "./components/ErrorBoundary";
import SuccessDisplay from "./components/SuccessDisplay";
import { ErrorProvider, useError } from "./contexts/ErrorContext";
import {
  handleSignup,
  handleConfirmSignUp,
  handleLogin,
  handleVerifyOtp,
  handleResendOtp,
} from "./cognitoCustomAuth";
import "./App.css";

// Configure Amplify (you'll need to add your actual config)
const amplifyConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION || "eu-west-1",
      userPoolId: import.meta.env.VITE_USER_POOL_ID || "eu-west-1_NhDQ2Z6ed",
      userPoolClientId:
        import.meta.env.VITE_LOGIN_CLIENT_ID ||
        "your_login_client_id_here",
    },
  },
};

try {
  Amplify.configure(amplifyConfig);
  console.log("Amplify configured successfully");
} catch (error) {
  console.error("Error configuring Amplify:", error);
}

// Authentication States
const AUTH_STATES = {
  SIGNUP: "signup",
  LOGIN: "login",
  EMAIL_CONFIRMATION: "email_confirmation",
  WHATSAPP_OTP_VERIFICATION: "whatsapp_otp_verification",
  AUTHENTICATED: "authenticated",
  SIGNUP_SUCCESS: "signup_success",
  LOGIN_SUCCESS: "login_success",
};

function App() {
  const [authState, setAuthState] = useState(AUTH_STATES.SIGNUP);
  const [loading, setLoading] = useState(false);
  // const [user, setUser] = useState(null)
  const [isSignupFlow, setIsSignupFlow] = useState(true); // Track if we're in signup or login flow
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmationCode: "",
    whatsappOtp: "",
    session: null,
    usernameForChallenge: null,
    clientId: null, // Track which client ID was used for the challenge
  });
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const { addError } = useError();

  // Check if user is already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // setUser(currentUser)
        setAuthState(AUTH_STATES.AUTHENTICATED);
      }
    } catch (err) {
      // User not authenticated
      console.log("User not authenticated");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\+[1-9]\d{1,14}$/.test(phone);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address");
      }
      if (!validatePhone(formData.phone)) {
        throw new Error(
          "Please enter a valid phone number in E.164 format (e.g., +1234567890)"
        );
      }
      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const result = await handleSignup({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      console.log("Sign up result:", result);

      // Set signup flow flag and move to email confirmation step
      // Check for successful signup - either with session (normal flow) or with UserConfirmed: false (Lambda response)
      if ((result.userSub && result.session) || (result.UserSub && result.UserConfirmed === false)) {
        console.log("Signup successful, proceeding to email confirmation");
        setIsSignupFlow(true);
        setAuthState(AUTH_STATES.EMAIL_CONFIRMATION);
      } else {
        console.error("Signup failed - unexpected response structure:", result);
        throw new Error("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed. Please try again.");
      addError({
        type: "AUTHENTICATION",
        severity: "HIGH",
        title: "Signup Failed",
        message: err.message || "Signup failed. Please try again.",
        details: { step: "signup", email: formData.email },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      const result = await handleLogin({
        email: formData.email,
      });

      console.log("Sign in result:", result);

      // Set login flow flag and store session for WhatsApp OTP verification
      setIsSignupFlow(false);
      setFormData((prev) => ({
        ...prev,
        session: result.session,
        usernameForChallenge: result.usernameForChallenge,
        clientId: import.meta.env.VITE_LOGIN_CLIENT_ID, // Store login client ID
      }));

      // Stay in LOGIN state but show OTP field (no need to change auth state)
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      addError({
        type: "AUTHENTICATION",
        severity: "HIGH",
        title: "Login Failed",
        message: err.message || "Login failed. Please try again.",
        details: { step: "login", email: formData.email },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailConfirmation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (
        !formData.confirmationCode ||
        formData.confirmationCode.length !== 6
      ) {
        throw new Error("Please enter a valid 6-digit confirmation code");
      }

      console.log("Starting email confirmation with:", {
        email: formData.email,
        confirmationCode: formData.confirmationCode,
      });

      const result = await handleConfirmSignUp({
        email: formData.email,
        confirmationCode: formData.confirmationCode,
      });

      console.log("Email confirmation result:", result);

      // Email confirmed successfully and WhatsApp OTP automatically sent
      setError("");

      // Store the session from the automatic WhatsApp OTP that was sent
      setFormData((prev) => ({
        ...prev,
        session: result.session,
        usernameForChallenge: result.usernameForChallenge,
        clientId: import.meta.env.VITE_SIGNUP_CLIENT_ID, // Store signup client ID
      }));

      // Move directly to WhatsApp OTP verification with the session already available
      setAuthState(AUTH_STATES.WHATSAPP_OTP_VERIFICATION);
    } catch (err) {
      console.error("Email confirmation error:", err);
      setError(err.message || "Invalid confirmation code. Please try again.");
      addError({
        type: "AUTHENTICATION",
        severity: "HIGH",
        title: "Email Confirmation Failed",
        message: err.message || "Invalid confirmation code. Please try again.",
        details: {
          step: "email_confirmation",
          code: formData.confirmationCode,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.whatsappOtp || formData.whatsappOtp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      console.log("Starting WhatsApp OTP verification with:", {
        email: formData.email,
        otp: formData.whatsappOtp,
        session: formData.session,
      });

      const result = await handleVerifyOtp({
        email: formData.email,
        otp: formData.whatsappOtp,
        session: formData.session,
        usernameForChallenge: formData.usernameForChallenge || formData.email,
        clientId: formData.clientId,
      });

      console.log("WhatsApp OTP verification result:", result);

      // Show success data based on flow type
      setSuccessData(result);
      // setUser(result.tokens)

      if (isSignupFlow) {
        setAuthState(AUTH_STATES.SIGNUP_SUCCESS);
      } else {
        setAuthState(AUTH_STATES.LOGIN_SUCCESS);
      }
    } catch (err) {
      console.error("WhatsApp OTP verification error:", err);
      setError(err.message || "Invalid OTP. Please try again.");
      addError({
        type: "AUTHENTICATION",
        severity: "HIGH",
        title: "WhatsApp OTP Verification Failed",
        message: err.message || "Invalid OTP. Please try again.",
        details: {
          step: "whatsapp_otp_verification",
          otp: formData.whatsappOtp,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await handleResendOtp({
        email: formData.email,
        isSignupFlow: isSignupFlow,
      });

      console.log("Resend OTP result:", result);

      // Update session for OTP verification
      setFormData((prev) => ({ 
        ...prev, 
        session: result.session,
        usernameForChallenge: result.usernameForChallenge,
        clientId: isSignupFlow ? import.meta.env.VITE_SIGNUP_CLIENT_ID : import.meta.env.VITE_LOGIN_CLIENT_ID,
      }));

      setError("");
      alert("OTP has been resent to your WhatsApp number");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // setUser(null)
      setAuthState(AUTH_STATES.LOGIN);
      setFormData({
        email: "",
        phone: "",
        password: "",
        confirmationCode: "",
        whatsappOtp: "",
        session: null,
        usernameForChallenge: null,
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const switchAuthMode = () => {
    const newState =
      authState === AUTH_STATES.SIGNUP ? AUTH_STATES.LOGIN : AUTH_STATES.SIGNUP;
    setAuthState(newState);
    setIsSignupFlow(newState === AUTH_STATES.SIGNUP);
    setError("");
    setFormData({
      email: "",
      phone: "",
      password: "",
      confirmationCode: "",
      whatsappOtp: "",
      session: null,
      usernameForChallenge: null,
    });
  };

  const goBack = () => {
    if (authState === AUTH_STATES.EMAIL_CONFIRMATION) {
      setAuthState(AUTH_STATES.SIGNUP);
      setIsSignupFlow(true);
      setFormData((prev) => ({
        ...prev,
        confirmationCode: "",
        session: null,
        usernameForChallenge: null,
      }));
    } else if (authState === AUTH_STATES.WHATSAPP_OTP_VERIFICATION) {
      // For signup flow, go back to email confirmation
      if (isSignupFlow) {
        setAuthState(AUTH_STATES.EMAIL_CONFIRMATION);
      } else {
        setAuthState(AUTH_STATES.LOGIN);
      }
      setFormData((prev) => ({ ...prev, whatsappOtp: "" }));
    }
    setError("");
  };

  // Success displays
  if (authState === AUTH_STATES.SIGNUP_SUCCESS) {
    return (
      <SuccessDisplay
        type="signup"
        data={successData}
        onContinue={() => setAuthState(AUTH_STATES.AUTHENTICATED)}
        onLogout={handleLogout}
      />
    );
  }

  if (authState === AUTH_STATES.LOGIN_SUCCESS) {
    return (
      <SuccessDisplay
        type="login"
        data={successData}
        onContinue={() => setAuthState(AUTH_STATES.AUTHENTICATED)}
        onLogout={handleLogout}
      />
    );
  }

  // Authenticated user view
  if (authState === AUTH_STATES.AUTHENTICATED) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <h2>Welcome!</h2>
          <p>You have successfully authenticated with WhatsApp OTP.</p>
          <div className="user-info">
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
            <p>
              <strong>Phone:</strong> {formData.phone}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>WhatsApp OTP Authentication</h1>
          <p>
            {authState === AUTH_STATES.SIGNUP
              ? "Create your account with email and WhatsApp verification"
              : authState === AUTH_STATES.LOGIN
              ? "Sign in with WhatsApp verification"
              : authState === AUTH_STATES.EMAIL_CONFIRMATION
              ? "Enter the confirmation code sent to your email"
              : authState === AUTH_STATES.WHATSAPP_OTP_VERIFICATION
              ? "Enter the OTP sent to your WhatsApp"
              : "Complete verification"}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="error-content">
              <div className="error-text">{error}</div>
              {error.includes("phone number") && (
                <div className="error-help">
                  <strong>Need help?</strong> Make sure your phone number is in
                  international format (e.g., +1234567890) and is registered
                  with WhatsApp.
                </div>
              )}
              {error.includes("WhatsApp") && (
                <div className="error-help">
                  <strong>WhatsApp issue?</strong> Please ensure your phone
                  number is registered with WhatsApp and try again in a few
                  minutes.
                </div>
              )}
              {error.includes("rate limit") && (
                <div className="error-help">
                  <strong>Rate limited?</strong> Please wait 5-10 minutes before
                  trying again to avoid hitting rate limits.
                </div>
              )}
              {error.includes("verification code") && (
                <div className="error-help">
                  <strong>Code issue?</strong> Check your email/WhatsApp for the 6-digit code. 
                  Make sure you're entering it correctly and it hasn't expired.
                </div>
              )}
              {error.includes("email") && error.includes("confirm") && (
                <div className="error-help">
                  <strong>Email verification?</strong> Check your email inbox (including spam folder) 
                  for the verification code. You can request a new code if needed.
                </div>
              )}
              {error.includes("account") && error.includes("exists") && (
                <div className="error-help">
                  <strong>Account exists?</strong> Try signing in instead of creating a new account. 
                  If you forgot your password, contact support.
                </div>
              )}
              {error.includes("No account found") && (
                <div className="error-help">
                  <strong>No account found?</strong> Please complete your signup process first. 
                  Check your email for the verification code, or try signing up again.
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setAuthState(AUTH_STATES.SIGNUP);
                        setIsSignupFlow(true);
                        setError("");
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                      Go to Signup
                    </button>
                  </div>
                </div>
              )}
              {error.includes("API") && (
                <div className="error-help">
                  <strong>Service issue?</strong> There's a temporary problem with our messaging service. 
                  Please try again in a few minutes or contact support if it continues.
                </div>
              )}
              {error.includes("phone number needs to be verified") && (
                <div className="error-help">
                  <strong>Phone verification required?</strong> Your phone number needs to be verified before you can log in. 
                  Please complete your signup process first or contact support.
                </div>
              )}
              {error.includes("verify your WhatsApp number") && (
                <div className="error-help">
                  <strong>WhatsApp verification required?</strong> You need to verify your WhatsApp number to complete your account setup. 
                  Please complete your signup process first.
                </div>
              )}
            </div>
          </div>
        )}

        {authState === AUTH_STATES.SIGNUP && (
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                required
              />
              <small>
                Enter phone number in E.164 format (e.g., +1234567890)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <small>Minimum 8 characters</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="auth-switch">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchAuthMode}
                  className="link-btn"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {authState === AUTH_STATES.LOGIN && (
          <div className="auth-form">
            <div className="otp-info">
              <div className="whatsapp-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <h3>Sign In with WhatsApp</h3>
              <p>
                Enter your email and we'll send a verification code to your
                WhatsApp.
              </p>
            </div>

            {!formData.session ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send WhatsApp OTP"}
                </button>

                <div className="auth-switch">
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={switchAuthMode}
                      className="link-btn"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOTPVerification} className="auth-form">
                <div className="form-group">
                  <label htmlFor="whatsappOtp">
                    WhatsApp Verification Code
                  </label>
                  <input
                    type="text"
                    id="whatsappOtp"
                    name="whatsappOtp"
                    value={formData.whatsappOtp}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Verifying WhatsApp..." : "Verify WhatsApp OTP"}
                </button>

                <div className="otp-actions">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Resend WhatsApp OTP
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        session: null,
                        whatsappOtp: "",
                      }))
                    }
                    className="btn btn-secondary"
                  >
                    Back to Email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Email Confirmation */}
        {authState === AUTH_STATES.EMAIL_CONFIRMATION && (
          <form onSubmit={handleEmailConfirmation} className="auth-form">
            <div className="otp-info">
              <div className="progress-indicator">
                <div className="step current">
                  <div className="step-number">1</div>
                  <div className="step-label">Email</div>
                </div>
                <div className="step-line"></div>
                <div className="step pending">
                  <div className="step-number">2</div>
                  <div className="step-label">WhatsApp</div>
                </div>
              </div>
              <div className="email-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <h3>Check Your Email</h3>
              <p>
                We've sent a 6-digit confirmation code to your email address.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmationCode">Email Confirmation Code</label>
              <input
                type="text"
                id="confirmationCode"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Confirming Email..." : "Confirm Email"}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                onClick={goBack}
                className="btn btn-secondary"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* WhatsApp OTP Verification */}
        {authState === AUTH_STATES.WHATSAPP_OTP_VERIFICATION && (
          <div className="auth-form">
            <div className="otp-info">
              <div className="progress-indicator">
                <div className="step completed">
                  <div className="step-number">✓</div>
                  <div className="step-label">Email</div>
                </div>
                <div className="step-line completed"></div>
                <div className="step current">
                  <div className="step-number">2</div>
                  <div className="step-label">WhatsApp</div>
                </div>
              </div>
              <div className="whatsapp-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </div>
              <h3>WhatsApp Verification</h3>
              <p>
                We've automatically sent a verification code to your WhatsApp
                number. Please enter the code below.
              </p>
            </div>

            <form onSubmit={handleOTPVerification} className="auth-form">
              <div className="form-group">
                <label htmlFor="whatsappOtp">WhatsApp Verification Code</label>
                <input
                  type="text"
                  id="whatsappOtp"
                  name="whatsappOtp"
                  value={formData.whatsappOtp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Verifying WhatsApp..." : "Verify WhatsApp OTP"}
              </button>

              <div className="otp-actions">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Resend WhatsApp OTP
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  className="btn btn-secondary"
                >
                  Back to Email
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ErrorProvider>
  );
}
