import React, { createContext, useContext, useReducer, useCallback } from 'react'

// Error types
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  API: 'api',
  UNKNOWN: 'unknown'
}

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Initial state
const initialState = {
  errors: [],
  isErrorPanelOpen: false,
  errorCount: 0,
  lastError: null
}

// Action types
const ERROR_ACTIONS = {
  ADD_ERROR: 'ADD_ERROR',
  REMOVE_ERROR: 'REMOVE_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  TOGGLE_ERROR_PANEL: 'TOGGLE_ERROR_PANEL',
  SET_ERROR_PANEL_OPEN: 'SET_ERROR_PANEL_OPEN'
}

// Error reducer
const errorReducer = (state, action) => {
  switch (action.type) {
    case ERROR_ACTIONS.ADD_ERROR:
      const newError = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload
      }
      return {
        ...state,
        errors: [newError, ...state.errors].slice(0, 50), // Keep last 50 errors
        errorCount: state.errorCount + 1,
        lastError: newError
      }
    
    case ERROR_ACTIONS.REMOVE_ERROR:
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
        errorCount: Math.max(0, state.errorCount - 1)
      }
    
    case ERROR_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: [],
        errorCount: 0,
        lastError: null
      }
    
    case ERROR_ACTIONS.TOGGLE_ERROR_PANEL:
      return {
        ...state,
        isErrorPanelOpen: !state.isErrorPanelOpen
      }
    
    case ERROR_ACTIONS.SET_ERROR_PANEL_OPEN:
      return {
        ...state,
        isErrorPanelOpen: action.payload
      }
    
    default:
      return state
  }
}

// Create context
const ErrorContext = createContext()

// Error provider component
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState)

  // Add error function
  const addError = useCallback((errorData) => {
    const error = {
      type: ERROR_TYPES.UNKNOWN,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'An error occurred',
      message: 'Something went wrong',
      details: null,
      stack: null,
      context: null,
      ...errorData
    }
    
    dispatch({
      type: ERROR_ACTIONS.ADD_ERROR,
      payload: error
    })
    
    // Auto-open error panel for high/critical errors
    if (error.severity === ERROR_SEVERITY.HIGH || error.severity === ERROR_SEVERITY.CRITICAL) {
      dispatch({
        type: ERROR_ACTIONS.SET_ERROR_PANEL_OPEN,
        payload: true
      })
    }
  }, [])

  // Remove error function
  const removeError = useCallback((errorId) => {
    dispatch({
      type: ERROR_ACTIONS.REMOVE_ERROR,
      payload: errorId
    })
  }, [])

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({
      type: ERROR_ACTIONS.CLEAR_ERRORS
    })
  }, [])

  // Toggle error panel
  const toggleErrorPanel = useCallback(() => {
    dispatch({
      type: ERROR_ACTIONS.TOGGLE_ERROR_PANEL
    })
  }, [])

  // Set error panel open state
  const setErrorPanelOpen = useCallback((isOpen) => {
    dispatch({
      type: ERROR_ACTIONS.SET_ERROR_PANEL_OPEN,
      payload: isOpen
    })
  }, [])

  // Helper function to create standardized errors
  const createError = useCallback((type, title, message, details = null, severity = ERROR_SEVERITY.MEDIUM) => {
    return {
      type,
      title,
      message,
      details,
      severity,
      timestamp: new Date().toISOString()
    }
  }, [])

  // Helper function for network errors
  const addNetworkError = useCallback((message, details = null) => {
    addError(createError(ERROR_TYPES.NETWORK, 'Network Error', message, details, ERROR_SEVERITY.HIGH))
  }, [addError, createError])

  // Helper function for authentication errors
  const addAuthError = useCallback((message, details = null) => {
    addError(createError(ERROR_TYPES.AUTHENTICATION, 'Authentication Error', message, details, ERROR_SEVERITY.HIGH))
  }, [addError, createError])

  // Helper function for validation errors
  const addValidationError = useCallback((message, details = null) => {
    addError(createError(ERROR_TYPES.VALIDATION, 'Validation Error', message, details, ERROR_SEVERITY.LOW))
  }, [addError, createError])

  // Helper function for API errors
  const addApiError = useCallback((message, details = null) => {
    addError(createError(ERROR_TYPES.API, 'API Error', message, details, ERROR_SEVERITY.MEDIUM))
  }, [addError, createError])

  const value = {
    // State
    errors: state.errors,
    isErrorPanelOpen: state.isErrorPanelOpen,
    errorCount: state.errorCount,
    lastError: state.lastError,
    
    // Actions
    addError,
    removeError,
    clearErrors,
    toggleErrorPanel,
    setErrorPanelOpen,
    
    // Helper functions
    createError,
    addNetworkError,
    addAuthError,
    addValidationError,
    addApiError
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  )
}

// Custom hook to use error context
export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

export default ErrorContext
