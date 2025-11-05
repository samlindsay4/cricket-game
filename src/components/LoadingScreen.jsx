import React, { useState, useEffect } from 'react'

/**
 * LoadingScreen Component
 * Ceefax-style startup/loading sequence
 */
const LoadingScreen = ({ onComplete }) => {
  const [dots, setDots] = useState('')
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    // Progress through stages
    const stageTimeout = setTimeout(() => {
      if (stage < 3) {
        setStage(stage + 1)
      } else {
        onComplete && onComplete()
      }
    }, 1000)

    return () => {
      clearInterval(dotsInterval)
      clearTimeout(stageTimeout)
    }
  }, [stage, onComplete])

  const messages = [
    'INITIALIZING CEEFAX',
    'LOADING PAGE DATA',
    'CONNECTING TO TELETEXT',
    'READY'
  ]

  return (
    <div className="teletext-loading">
      <div className="teletext-loading-content">
        <div className="teletext-loading-title">
          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
        </div>
        <div className="teletext-loading-title">
          █ CRICKET CAPTAINCY MANAGER █
        </div>
        <div className="teletext-loading-title">
          ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
        </div>
        
        <div className="teletext-loading-message">
          {messages[stage]}{dots}
        </div>

        <div className="teletext-loading-bar">
          <div 
            className="teletext-loading-bar-fill"
            style={{ width: `${(stage + 1) * 25}%` }}
          />
        </div>

        <div className="teletext-loading-footer">
          <span className="teletext-text--cyan">BBC</span>
          <span className="teletext-text--white"> CEEFAX </span>
          <span className="teletext-text--yellow">1985</span>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
