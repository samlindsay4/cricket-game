import React from 'react'

/**
 * TeletextButton Component
 * Blocky teletext-style button with color inversions on hover
 */
const TeletextButton = ({ 
  children, 
  onClick, 
  color = 'blue', 
  textColor = 'white',
  disabled = false 
}) => {
  const className = `teletext-button teletext-button--${color} teletext-button-text--${textColor} ${disabled ? 'teletext-button--disabled' : ''}`
  
  return (
    <button 
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default TeletextButton
