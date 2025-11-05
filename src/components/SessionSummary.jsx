import React from 'react'
import TeletextButton from './TeletextButton'

/**
 * SessionSummary Component
 * Display summary at end of each session (Lunch, Tea, Stumps)
 */
const SessionSummary = ({ 
  day, 
  session, 
  teamName,
  sessionRuns,
  sessionWickets,
  totalRuns,
  totalWickets,
  overs,
  wicketsFallen,
  onContinue
}) => {
  const getSessionLabel = (sess) => {
    switch (sess) {
      case 1:
        return 'SESSION 1 - MORNING';
      case 2:
        return 'SESSION 2 - AFTERNOON';
      case 3:
        return 'SESSION 3 - EVENING';
      default:
        return 'SESSION';
    }
  }

  const getBreakLabel = (sess) => {
    switch (sess) {
      case 1:
        return 'LUNCH';
      case 2:
        return 'TEA';
      case 3:
        return 'STUMPS';
      default:
        return 'BREAK';
    }
  }

  return (
    <div className="teletext-block">
      <div className="teletext-block teletext-block--yellow" style={{ marginBottom: '1rem' }}>
        <h2 className="teletext-subtitle" style={{ color: '#000000' }}>
          {getSessionLabel(session)} SUMMARY
        </h2>
        <div style={{ color: '#000000', fontSize: '1.1rem', marginTop: '0.3rem' }}>
          DAY {day}
        </div>
      </div>

      <div className="teletext-block teletext-block--blue" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.2rem', color: '#FFFF00', textAlign: 'center' }}>
          {teamName}: {totalRuns}/{totalWickets} ({overs} OVERS)
        </div>
        <div style={{ color: '#00FF00', textAlign: 'center', marginTop: '0.5rem' }}>
          SESSION: {sessionRuns} RUNS, {sessionWickets} WICKETS
        </div>
        {sessionWickets > 0 && (
          <div style={{ color: '#FFFFFF', textAlign: 'center', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            RUN RATE: {(sessionRuns / (overs.split('.')[0] || 1)).toFixed(2)}
          </div>
        )}
      </div>

      {/* Wickets fallen in this session */}
      {wicketsFallen && wicketsFallen.length > 0 && (
        <div className="teletext-block" style={{ marginBottom: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#FF0000' }}>WICKETS FALLEN:</h3>
          {wicketsFallen.map((wicket, idx) => (
            <div key={idx} style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: '#FFFFFF' }}>
              {wicket.batsman} {wicket.runs} {wicket.dismissal}
            </div>
          ))}
        </div>
      )}

      <div className="teletext-block teletext-block--cyan" style={{ marginBottom: '1rem' }}>
        <div style={{ color: '#000000', textAlign: 'center', fontSize: '1.1rem' }}>
          ═══ {getBreakLabel(session)} ═══
        </div>
        {session === 3 && (
          <div style={{ color: '#000000', textAlign: 'center', marginTop: '0.3rem' }}>
            PLAY RESUMES DAY {day + 1}
          </div>
        )}
        {session < 3 && (
          <div style={{ color: '#000000', textAlign: 'center', marginTop: '0.3rem' }}>
            PLAY RESUMES SHORTLY
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <TeletextButton color="green" onClick={onContinue}>
          {session === 3 ? '[CONTINUE TO DAY ' + (day + 1) + ']' : '[CONTINUE TO ' + getBreakLabel(session) + ']'}
        </TeletextButton>
      </div>
    </div>
  )
}

export default SessionSummary
