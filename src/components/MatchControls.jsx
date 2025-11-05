import React from 'react'
import TeletextButton from './TeletextButton'

/**
 * MatchControls Component
 * Control buttons for match simulation
 */
const MatchControls = ({
  onNextBall,
  onNextOver,
  onFastForward,
  onRestartMatch,
  onBackToMenu,
  isMatchComplete = false,
  isSimulating = false
}) => {
  return (
    <div className="match-controls">
      <div className="match-controls__row">
        <TeletextButton 
          color="blue" 
          onClick={onNextBall}
          disabled={isMatchComplete || isSimulating}
        >
          NEXT BALL
        </TeletextButton>
        <TeletextButton 
          color="green" 
          onClick={onNextOver}
          disabled={isMatchComplete || isSimulating}
        >
          NEXT OVER
        </TeletextButton>
        <TeletextButton 
          color="yellow" 
          onClick={onFastForward}
          disabled={isMatchComplete || isSimulating}
        >
          FAST FORWARD
        </TeletextButton>
      </div>
      
      <div className="match-controls__row">
        <TeletextButton 
          color="magenta" 
          onClick={onRestartMatch}
        >
          RESTART MATCH
        </TeletextButton>
        <TeletextButton 
          color="red" 
          onClick={onBackToMenu}
        >
          ◄ BACK TO MENU
        </TeletextButton>
      </div>
    </div>
  )
}

export default MatchControls
