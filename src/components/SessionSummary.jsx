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
  topBatsmen,
  topBowlers,
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
          {getSessionLabel(session)} SUMMARY - DAY {day}
        </h2>
      </div>

      <div className="teletext-block teletext-block--blue" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.2rem', color: '#FFFF00', textAlign: 'center' }}>
          {teamName}: {totalRuns}/{totalWickets} ({overs} OVERS)
        </div>
      </div>

      {/* Top Batsmen */}
      {topBatsmen && topBatsmen.length > 0 && (
        <div className="teletext-block" style={{ marginBottom: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#00FF00' }}>TOP BATSMEN:</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {topBatsmen.map((batsman, idx) => (
              <React.Fragment key={idx}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: batsman.isOut ? '#FFFFFF' : '#FFFF00',
                  fontFamily: 'monospace' 
                }}>
                  {batsman.name}{batsman.isOut ? '' : '*'}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#00FF00', 
                  textAlign: 'right',
                  fontFamily: 'monospace' 
                }}>
                  {batsman.runs}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#FFFFFF', 
                  textAlign: 'right',
                  fontFamily: 'monospace' 
                }}>
                  ({batsman.balls})
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Top Bowlers */}
      {topBowlers && topBowlers.length > 0 && (
        <div className="teletext-block" style={{ marginBottom: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#FF00FF' }}>TOP BOWLERS:</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            {topBowlers.map((bowler, idx) => (
              <React.Fragment key={idx}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#FFFFFF',
                  fontFamily: 'monospace' 
                }}>
                  {bowler.name}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#00FF00', 
                  textAlign: 'right',
                  fontFamily: 'monospace' 
                }}>
                  {bowler.wickets}/{bowler.runs}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#FFFFFF', 
                  textAlign: 'right',
                  fontFamily: 'monospace' 
                }}>
                  ({bowler.overs} ov)
                </div>
              </React.Fragment>
            ))}
          </div>
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
          {session === 3 ? '[CONTINUE TO DAY ' + (day + 1) + ']' : '[CONTINUE]'}
        </TeletextButton>
      </div>
    </div>
  )
}

export default SessionSummary
