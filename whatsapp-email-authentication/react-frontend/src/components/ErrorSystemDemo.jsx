import React from "react";
import {
  useError,
  ERROR_TYPES,
  ERROR_SEVERITY,
} from "../contexts/ErrorContext";
import { useErrorHandler } from "../hooks/useErrorHandler";

// Demo component to showcase the error system
export const ErrorSystemDemo = ({ onBack }) => {
  const {
    addError,
    addNetworkError,
    addAuthError,
    addValidationError,
    addApiError,
  } = useError();
  const { handleAsync, handleNetworkRequest } = useErrorHandler();

  const triggerNetworkError = () => {
    addNetworkError("Failed to connect to server", {
      url: "https://api.example.com/data",
      status: 500,
      retryAttempts: 3,
    });
  };

  const triggerAuthError = () => {
    addAuthError("Invalid credentials provided", {
      username: "test@example.com",
      attemptCount: 2,
      maxAttempts: 3,
    });
  };

  const triggerValidationError = () => {
    addValidationError("Email format is invalid", {
      field: "email",
      value: "invalid-email",
      expectedFormat: "user@domain.com",
    });
  };

  const triggerApiError = () => {
    addApiError("API request failed", {
      endpoint: "/api/users",
      method: "POST",
      statusCode: 400,
      response: { error: "Bad Request" },
    });
  };

  const triggerUnknownError = () => {
    addError({
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.HIGH,
      title: "Unexpected Error",
      message: "Something unexpected happened",
      details: {
        component: "ErrorSystemDemo",
        action: "triggerUnknownError",
        timestamp: Date.now(),
      },
      stack:
        "Error: Something unexpected happened\n    at ErrorSystemDemo.triggerUnknownError",
    });
  };

  const triggerCriticalError = () => {
    addError({
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.CRITICAL,
      title: "Critical System Error",
      message:
        "A critical error has occurred that requires immediate attention",
      details: {
        component: "ErrorSystemDemo",
        action: "triggerCriticalError",
        systemState: "unstable",
        timestamp: Date.now(),
      },
    });
  };

  const simulateAsyncError = async () => {
    await handleAsync(
      async () => {
        throw new Error("Simulated async operation failure");
      },
      {
        type: ERROR_TYPES.API,
        title: "Async Operation Failed",
        severity: ERROR_SEVERITY.MEDIUM,
      }
    ).catch(() => {
      // Error is already handled by handleAsync
    });
  };

  const simulateNetworkRequestError = async () => {
    await handleNetworkRequest(
      async () => {
        // Simulate a failed network request
        const response = await fetch("https://httpstat.us/500");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      { operation: "simulateNetworkRequestError" }
    ).catch(() => {
      // Error is already handled by handleNetworkRequest
    });
  };

  return (
    <div className="form-container">
      <h2>Error System Demo</h2>
      <p>
        Click the buttons below to trigger different types of errors and see how
        they're handled:
      </p>

      <div
        className="button-group"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <button onClick={triggerNetworkError} className="btn btn-secondary">
          Trigger Network Error
        </button>

        <button onClick={triggerAuthError} className="btn btn-secondary">
          Trigger Auth Error
        </button>

        <button onClick={triggerValidationError} className="btn btn-secondary">
          Trigger Validation Error
        </button>

        <button onClick={triggerApiError} className="btn btn-secondary">
          Trigger API Error
        </button>

        <button onClick={triggerUnknownError} className="btn btn-secondary">
          Trigger Unknown Error
        </button>

        <button onClick={triggerCriticalError} className="btn btn-secondary">
          Trigger Critical Error
        </button>

        <button onClick={simulateAsyncError} className="btn btn-secondary">
          Simulate Async Error
        </button>

        <button
          onClick={simulateNetworkRequestError}
          className="btn btn-secondary"
        >
          Simulate Network Request Error
        </button>
      </div>

      {onBack && (
        <div className="button-group" style={{ marginTop: '1rem' }}>
          <button 
            onClick={onBack}
            className="btn btn-secondary"
          >
            Back to Main Menu
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(11, 18, 32, 0.5)",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "#f1f5f9", margin: "0 0 0.5rem 0" }}>
          Error System Features:
        </h4>
        <ul style={{ color: "#cbd5e1", margin: 0, paddingLeft: "1.5rem" }}>
          <li>Real-time error notifications</li>
          <li>Error log with filtering and sorting</li>
          <li>Error panel for detailed error management</li>
          <li>Automatic error categorization</li>
          <li>Error severity levels</li>
          <li>Error recovery mechanisms</li>
          <li>Development error logging</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorSystemDemo;
