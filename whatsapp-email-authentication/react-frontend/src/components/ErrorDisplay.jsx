import React, { useState } from 'react'
import { useError, ERROR_TYPES, ERROR_SEVERITY } from '../contexts/ErrorContext'

// Individual Error Item Component
const ErrorItem = ({ error, onRemove, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case ERROR_SEVERITY.LOW: return '#f59e0b'
      case ERROR_SEVERITY.MEDIUM: return '#3b82f6'
      case ERROR_SEVERITY.HIGH: return '#ef4444'
      case ERROR_SEVERITY.CRITICAL: return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case ERROR_TYPES.NETWORK:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        )
      case ERROR_TYPES.AUTHENTICATION:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )
      case ERROR_TYPES.VALIDATION:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
        )
      case ERROR_TYPES.API:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        )
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <div className="error-item" style={{ borderLeftColor: getSeverityColor(error.severity) }}>
      <div className="error-item-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="error-item-icon">
          {getTypeIcon(error.type)}
        </div>
        <div className="error-item-content">
          <div className="error-item-title">{error.title}</div>
          <div className="error-item-message">{error.message}</div>
          <div className="error-item-meta">
            <span className="error-severity" style={{ color: getSeverityColor(error.severity) }}>
              {error.severity.toUpperCase()}
            </span>
            <span className="error-timestamp">{formatTimestamp(error.timestamp)}</span>
          </div>
        </div>
        <div className="error-item-actions">
          <button 
            className="error-expand-btn"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button 
            className="error-remove-btn"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(error.id)
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="error-item-details">
          {error.details && (
            <div className="error-details-section">
              <h4>Details:</h4>
              <pre>{JSON.stringify(error.details, null, 2)}</pre>
            </div>
          )}
          {error.stack && (
            <div className="error-stack-section">
              <h4>Stack Trace:</h4>
              <pre>{error.stack}</pre>
            </div>
          )}
          {error.context && (
            <div className="error-context-section">
              <h4>Context:</h4>
              <pre>{JSON.stringify(error.context, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Error Log Component
export const ErrorLog = () => {
  const { errors, removeError, clearErrors, errorCount } = useError()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('timestamp')

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true
    return error.type === filter
  })

  const sortedErrors = [...filteredErrors].sort((a, b) => {
    switch (sortBy) {
      case 'timestamp':
        return new Date(b.timestamp) - new Date(a.timestamp)
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  if (errorCount === 0) {
    return (
      <div className="error-log-empty">
        <div className="error-log-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
          </svg>
        </div>
        <h3>No Errors</h3>
        <p>Great! No errors have been logged yet.</p>
      </div>
    )
  }

  return (
    <div className="error-log">
      <div className="error-log-header">
        <h3>Error Log ({errorCount})</h3>
        <div className="error-log-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="error-filter-select"
          >
            <option value="all">All Types</option>
            <option value={ERROR_TYPES.NETWORK}>Network</option>
            <option value={ERROR_TYPES.AUTHENTICATION}>Authentication</option>
            <option value={ERROR_TYPES.VALIDATION}>Validation</option>
            <option value={ERROR_TYPES.API}>API</option>
            <option value={ERROR_TYPES.UNKNOWN}>Unknown</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="error-sort-select"
          >
            <option value="timestamp">Sort by Time</option>
            <option value="severity">Sort by Severity</option>
            <option value="type">Sort by Type</option>
          </select>
          <button 
            onClick={clearErrors}
            className="btn btn-secondary btn-sm"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="error-log-list">
        {sortedErrors.map(error => (
          <ErrorItem
            key={error.id}
            error={error}
            onRemove={removeError}
          />
        ))}
      </div>
    </div>
  )
}

// Error Display Component (for showing current/latest errors)
export const ErrorDisplay = () => {
  const { lastError, removeError, errorCount, toggleErrorPanel } = useError()
  const [isVisible, setIsVisible] = useState(false)

  React.useEffect(() => {
    if (lastError) {
      setIsVisible(true)
      // Auto-hide after 5 seconds for non-critical errors
      if (lastError.severity !== ERROR_SEVERITY.CRITICAL) {
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [lastError])

  if (!lastError || !isVisible) return null

  const getSeverityColor = (severity) => {
    switch (severity) {
      case ERROR_SEVERITY.LOW: return '#f59e0b'
      case ERROR_SEVERITY.MEDIUM: return '#3b82f6'
      case ERROR_SEVERITY.HIGH: return '#ef4444'
      case ERROR_SEVERITY.CRITICAL: return '#dc2626'
      default: return '#6b7280'
    }
  }

  return (
    <div 
      className="error-display"
      style={{ borderLeftColor: getSeverityColor(lastError.severity) }}
    >
      <div className="error-display-content">
        <div className="error-display-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div className="error-display-text">
          <div className="error-display-title">{lastError.title}</div>
          <div className="error-display-message">{lastError.message}</div>
        </div>
        <div className="error-display-actions">
          <button 
            onClick={() => toggleErrorPanel()}
            className="btn btn-sm btn-secondary"
          >
            View All ({errorCount})
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="error-close-btn"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorDisplay
