import React from 'react'
import { useError, ERROR_TYPES, ERROR_SEVERITY } from '../contexts/ErrorContext'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Add error to context if available
    if (this.props.onError) {
      this.props.onError({
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.CRITICAL,
        title: 'React Error Boundary Caught Error',
        message: error.message || 'An unexpected error occurred',
        details: {
          componentStack: errorInfo.componentStack,
          errorBoundary: this.props.fallback ? 'Custom Error Boundary' : 'Default Error Boundary'
        },
        stack: error.stack
      })
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry)
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred. Please try refreshing the page.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="btn btn-primary">
                Try Again
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-secondary">
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component wrapper for easier usage
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    const { addError } = useError()
    
    return (
      <ErrorBoundary fallback={fallback} onError={addError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for error boundary functionality
export const useErrorBoundary = () => {
  const { addError } = useError()
  
  const captureError = React.useCallback((error, errorInfo = null) => {
    addError({
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.CRITICAL,
      title: 'Manual Error Capture',
      message: error.message || 'An error was manually captured',
      details: errorInfo,
      stack: error.stack
    })
  }, [addError])

  return { captureError }
}

export default ErrorBoundary
