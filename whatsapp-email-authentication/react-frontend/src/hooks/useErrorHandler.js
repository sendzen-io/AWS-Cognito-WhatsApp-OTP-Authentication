import { useCallback, useEffect, useRef, useState } from 'react'
import { useError, ERROR_TYPES, ERROR_SEVERITY } from '../contexts/ErrorContext'

// Hook for handling async operations with error catching
export const useErrorHandler = () => {
  const { addError, addNetworkError, addAuthError, addValidationError, addApiError } = useError()

  const handleAsync = useCallback(async (asyncFn, errorConfig = {}) => {
    try {
      return await asyncFn()
    } catch (error) {
      const {
        type = ERROR_TYPES.UNKNOWN,
        title = 'Operation Failed',
        severity = ERROR_SEVERITY.MEDIUM,
        context = null
      } = errorConfig

      addError({
        type,
        severity,
        title,
        message: error.message || 'An unexpected error occurred',
        details: {
          originalError: error,
          context,
          timestamp: new Date().toISOString()
        },
        stack: error.stack
      })

      throw error // Re-throw to allow calling code to handle if needed
    }
  }, [addError])

  const handleNetworkRequest = useCallback(async (requestFn, context = null) => {
    try {
      return await requestFn()
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        addNetworkError('Network request failed. Please check your internet connection.', {
          originalError: error,
          context
        })
      } else if (error.status || error.response) {
        addApiError(`API request failed: ${error.message}`, {
          status: error.status,
          response: error.response,
          originalError: error,
          context
        })
      } else {
        addError({
          type: ERROR_TYPES.NETWORK,
          severity: ERROR_SEVERITY.HIGH,
          title: 'Request Failed',
          message: error.message || 'Network request failed',
          details: { originalError: error, context }
        })
      }
      throw error
    }
  }, [addNetworkError, addApiError, addError])

  const handleAuthOperation = useCallback(async (authFn, context = null) => {
    try {
      return await authFn()
    } catch (error) {
      addAuthError(`Authentication failed: ${error.message}`, {
        originalError: error,
        context
      })
      throw error
    }
  }, [addAuthError])

  const handleValidation = useCallback((validationFn, context = null) => {
    try {
      return validationFn()
    } catch (error) {
      addValidationError(`Validation failed: ${error.message}`, {
        originalError: error,
        context
      })
      throw error
    }
  }, [addValidationError])

  return {
    handleAsync,
    handleNetworkRequest,
    handleAuthOperation,
    handleValidation
  }
}

// Hook for logging errors with additional context
export const useErrorLogger = () => {
  const { addError } = useError()
  const logRef = useRef([])

  const logError = useCallback((error, context = {}) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message || error,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Add to ref for debugging
    logRef.current.push(errorLog)
    
    // Keep only last 100 logs
    if (logRef.current.length > 100) {
      logRef.current = logRef.current.slice(-100)
    }

    // Add to error context
    addError({
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Logged Error',
      message: error.message || 'An error was logged',
      details: errorLog,
      stack: error.stack
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog)
    }
  }, [addError])

  const logInfo = useCallback((message, context = {}) => {
    const infoLog = {
      timestamp: new Date().toISOString(),
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'info'
    }

    logRef.current.push(infoLog)
    
    if (logRef.current.length > 100) {
      logRef.current = logRef.current.slice(-100)
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', infoLog)
    }
  }, [])

  const getLogs = useCallback(() => {
    return [...logRef.current]
  }, [])

  const clearLogs = useCallback(() => {
    logRef.current = []
  }, [])

  return {
    logError,
    logInfo,
    getLogs,
    clearLogs
  }
}

// Hook for error reporting and analytics
export const useErrorReporter = () => {
  const { errors } = useError()

  const reportError = useCallback(async (error, additionalData = {}) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message || error,
        stack: error.stack,
        name: error.name
      },
      additionalData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorCount: errors.length
    }

    // In a real app, you would send this to your error reporting service
    // For now, we'll just log it
    console.log('Error report:', errorReport)

    // Example: Send to external service
    // try {
    //   await fetch('/api/errors', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(errorReport)
    //   })
    // } catch (reportError) {
    //   console.error('Failed to report error:', reportError)
    // }
  }, [errors])

  const reportCriticalError = useCallback(async (error, context = {}) => {
    await reportError(error, {
      ...context,
      severity: 'critical',
      reportedAt: new Date().toISOString()
    })
  }, [reportError])

  return {
    reportError,
    reportCriticalError
  }
}

// Hook for error monitoring and metrics
export const useErrorMonitor = () => {
  const { errors, errorCount } = useError()
  const [metrics, setMetrics] = useState({
    totalErrors: 0,
    errorsByType: {},
    errorsBySeverity: {},
    lastErrorTime: null,
    errorRate: 0
  })

  useEffect(() => {
    const newMetrics = {
      totalErrors: errorCount,
      errorsByType: {},
      errorsBySeverity: {},
      lastErrorTime: errors.length > 0 ? errors[0].timestamp : null,
      errorRate: errors.length > 0 ? errors.length / 60 : 0 // errors per minute
    }

    // Count errors by type and severity
    errors.forEach(error => {
      newMetrics.errorsByType[error.type] = (newMetrics.errorsByType[error.type] || 0) + 1
      newMetrics.errorsBySeverity[error.severity] = (newMetrics.errorsBySeverity[error.severity] || 0) + 1
    })

    setMetrics(newMetrics)
  }, [errors, errorCount])

  const getErrorTrend = useCallback(() => {
    if (errors.length < 2) return 'stable'
    
    const recent = errors.slice(0, 5)
    const older = errors.slice(5, 10)
    
    if (recent.length > older.length) return 'increasing'
    if (recent.length < older.length) return 'decreasing'
    return 'stable'
  }, [errors])

  const getMostCommonError = useCallback(() => {
    const typeCounts = {}
    errors.forEach(error => {
      typeCounts[error.type] = (typeCounts[error.type] || 0) + 1
    })
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0] || [null, 0]
  }, [errors])

  return {
    metrics,
    getErrorTrend,
    getMostCommonError
  }
}

// Hook for error recovery strategies
export const useErrorRecovery = () => {
  const { addError } = useError()

  const retryOperation = useCallback(async (operation, maxRetries = 3, delay = 1000) => {
    let lastError = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt < maxRetries) {
          addError({
            type: ERROR_TYPES.UNKNOWN,
            severity: ERROR_SEVERITY.LOW,
            title: `Retry Attempt ${attempt}`,
            message: `Operation failed, retrying in ${delay}ms...`,
            details: { originalError: error, attempt, maxRetries }
          })
          
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2 // Exponential backoff
        }
      }
    }
    
    addError({
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.HIGH,
      title: 'Operation Failed After Retries',
      message: `Operation failed after ${maxRetries} attempts`,
      details: { originalError: lastError, attempts: maxRetries }
    })
    
    throw lastError
  }, [addError])

  const fallbackOperation = useCallback(async (primaryOperation, fallbackOperation, context = null) => {
    try {
      return await primaryOperation()
    } catch (error) {
      addError({
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM,
        title: 'Primary Operation Failed',
        message: 'Attempting fallback operation...',
        details: { originalError: error, context }
      })
      
      try {
        return await fallbackOperation()
      } catch (fallbackError) {
        addError({
          type: ERROR_TYPES.UNKNOWN,
          severity: ERROR_SEVERITY.CRITICAL,
          title: 'Both Operations Failed',
          message: 'Primary and fallback operations both failed',
          details: { 
            primaryError: error, 
            fallbackError, 
            context 
          }
        })
        throw fallbackError
      }
    }
  }, [addError])

  return {
    retryOperation,
    fallbackOperation
  }
}

export default useErrorHandler
