import React from 'react'
import { useError } from '../contexts/ErrorContext'
import { ErrorLog } from './ErrorDisplay'

export const ErrorPanel = () => {
  const { isErrorPanelOpen, setErrorPanelOpen, errorCount } = useError()

  if (!isErrorPanelOpen) return null

  return (
    <>
      <div className="error-panel-overlay" onClick={() => setErrorPanelOpen(false)} />
      <div className="error-panel">
        <div className="error-panel-header">
          <h2>Error Log ({errorCount})</h2>
          <button 
            className="error-panel-close"
            onClick={() => setErrorPanelOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="error-panel-content">
          <ErrorLog />
        </div>
      </div>
    </>
  )
}

export const ErrorToggleButton = () => {
  const { toggleErrorPanel, errorCount } = useError()

  if (errorCount === 0) return null

  return (
    <button 
      className={`error-toggle-btn ${errorCount > 0 ? 'has-errors' : ''}`}
      onClick={toggleErrorPanel}
      title={`View ${errorCount} error${errorCount !== 1 ? 's' : ''}`}
    >
      {errorCount > 99 ? '99+' : errorCount}
    </button>
  )
}

export default ErrorPanel
