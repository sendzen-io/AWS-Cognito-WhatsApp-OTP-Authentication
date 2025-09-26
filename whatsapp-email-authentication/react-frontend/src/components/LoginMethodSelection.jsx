import React from 'react';

const LoginMethodSelection = ({ 
  userInfo, 
  onMethodSelected, 
  onBack, 
  loading, 
  error 
}) => {
  const handleMethodSelect = (method) => {
    onMethodSelected(method);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Choose Login Method</h2>
          <p>How would you like to sign in to your account?</p>
        </div>

        {userInfo && (
          <div className="user-info-display">
            <div className="user-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="user-details">
              <h3>{userInfo.email || userInfo.phone}</h3>
              <div className="verification-status">
                <span className={`status-badge ${userInfo.emailVerified === null ? 'unknown' : userInfo.emailVerified ? 'verified' : 'unverified'}`}>
                  {userInfo.emailVerified === null ? '?' : userInfo.emailVerified ? '✓' : '✗'} Email
                </span>
                <span className={`status-badge ${userInfo.phoneVerified === null ? 'unknown' : userInfo.phoneVerified ? 'verified' : 'unverified'}`}>
                  {userInfo.phoneVerified === null ? '?' : userInfo.phoneVerified ? '✓' : '✗'} Phone
                </span>
                <span className={`status-badge ${userInfo.whatsappVerified === null ? 'unknown' : userInfo.whatsappVerified ? 'verified' : 'unverified'}`}>
                  {userInfo.whatsappVerified === null ? '?' : userInfo.whatsappVerified ? '✓' : '✗'} WhatsApp
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="login-methods">
          <button
            type="button"
            onClick={() => handleMethodSelect('password')}
            className="method-button"
            disabled={loading}
          >
            <div className="method-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="method-content">
              <h3>Password</h3>
              <p>Sign in with your password</p>
            </div>
            <div className="method-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodSelect('whatsapp')}
            className="method-button"
            disabled={loading}
          >
            <div className="method-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div className="method-content">
              <h3>WhatsApp OTP</h3>
              <p>Get a verification code via WhatsApp</p>
              {userInfo?.whatsappVerified === false && (
                <small className="method-disabled">WhatsApp not verified</small>
              )}
            </div>
            <div className="method-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        </div>

        <div className="auth-footer">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-link"
            disabled={loading}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginMethodSelection;
