import React, { useState } from 'react';

const UserDetection = ({ onUserDetected, onBack, loading, error }) => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsSubmitting(true);
    try {
      // Determine if identifier is email or phone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isPhone = /^\+[1-9]\d{1,14}$/.test(identifier);

      if (!isEmail && !isPhone) {
        throw new Error('Please enter a valid email address or phone number');
      }

      await onUserDetected({
        identifier: identifier.trim(),
        type: isEmail ? 'email' : 'phone'
      });
    } catch (err) {
      console.error('User detection error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Enter your email or phone number to continue</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">Email or Phone Number</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone number"
              required
              disabled={isSubmitting || loading}
              className="form-input"
            />
            <small className="form-hint">
              Enter your email address or phone number in international format (e.g., +1234567890)
            </small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || loading || !identifier.trim()}
            >
              {isSubmitting ? 'Checking...' : 'Continue'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-link"
            disabled={isSubmitting || loading}
          >
            ← Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetection;
