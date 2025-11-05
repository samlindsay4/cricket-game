import React, { useState, useEffect } from 'react'

/**
 * TeletextPage Component
 * Main wrapper for teletext-style pages with header, footer, and page number
 */
const TeletextPage = ({ pageNumber, title, children, showClock = true }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).toUpperCase()
  }

  return (
    <div className="teletext-page">
      {/* Page Header */}
      <div className="teletext-page-header">
        <div className="teletext-page-header__left">
          <span className="teletext-page-number-inline">{pageNumber}</span>
          <span className="teletext-page-title">{title}</span>
        </div>
        {showClock && (
          <div className="teletext-page-header__right">
            <span className="teletext-page-date">{formatDate()}</span>
            <span className="teletext-page-time">{formatTime()}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="teletext-page-content">
        {children}
      </div>

      {/* Page Footer */}
      <div className="teletext-page-footer">
        <div className="teletext-page-footer__nav">
          <span className="teletext-text--cyan">◄ PREV</span>
          <span className="teletext-text--yellow">MENU</span>
          <span className="teletext-text--cyan">NEXT ►</span>
        </div>
      </div>
    </div>
  )
}

export default TeletextPage
