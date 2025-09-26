import React from 'react';

const SuccessDisplay = ({ type, data, onLogout }) => {
  const isLogin = type === 'login';
  const isSignup = type === 'signup';

  return (
    <div className="success-container">
      <div className="success-content-wrapper">
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h2>{isLogin ? 'Login Successful!' : 'Signup Successful!'}</h2>
          <p>{isLogin ? 'Welcome back!' : 'Welcome to our platform!'}</p>
        </div>

        <div className="success-content">
          {/* User Information */}
          <div className="user-info-section">
            <h3>👤 User Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{data.user?.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{data.user?.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">User ID:</span>
                <span className="value">{data.user?.sub}</span>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="verification-section">
            <h3>🔐 Verification Status</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Email Verified:</span>
                <span className={`status ${data.user?.emailVerified ? 'verified' : 'not-verified'}`}>
                  {data.user?.emailVerified ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Phone Verified:</span>
                <span className={`status ${data.user?.phoneVerified ? 'verified' : 'not-verified'}`}>
                  {data.user?.phoneVerified ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">WhatsApp Verified:</span>
                <span className={`status ${data.user?.whatsappVerified ? 'verified' : 'not-verified'}`}>
                  {data.user?.whatsappVerified ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>

          {/* Token Information (Login only) */}
          {isLogin && data.tokens && (
            <div className="token-section">
              <h3>🎫 Authentication Tokens</h3>
              <div className="token-info">
                <div className="token-item">
                  <span className="label">Access Token:</span>
                  <span className="token-value">
                    {data.AccessToken ? `${data.AccessToken.substring(0, 20)}...` : 'N/A'}
                  </span>
                </div>
                <div className="token-item">
                  <span className="label">ID Token:</span>
                  <span className="token-value">
                    {data.IdToken ? `${data.IdToken.substring(0, 20)}...` : 'N/A'}
                  </span>
                </div>
                <div className="token-item">
                  <span className="label">Refresh Token:</span>
                  <span className="token-value">
                    {data.RefreshToken ? `${data.RefreshToken.substring(0, 20)}...` : 'N/A'}
                  </span>
                </div>
                <div className="token-item">
                  <span className="label">Token Expires In:</span>
                  <span className="value">{data.ExpiresIn} seconds</span>
                </div>
                <div className="token-item">
                  <span className="label">Auth Time:</span>
                  <span className="value">{data.user?.authTime}</span>
                </div>
                <div className="token-item">
                  <span className="label">Token Expiry:</span>
                  <span className="value">{data.user?.tokenExpiry}</span>
                </div>
              </div>
            </div>
          )}

          {/* Raw Data (for debugging) */}
          <details className="raw-data-section">
            <summary>🔍 Raw Response Data (Debug)</summary>
            <pre className="raw-data">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                alert('Data copied to clipboard!');
              }}
            >
              📋 Copy Data
            </button>
            {onLogout && (
              <button 
                className="logout-btn"
                onClick={onLogout}
              >
                🚪 Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessDisplay;