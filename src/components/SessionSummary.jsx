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
          {/* CRITICAL FIX: Use same table styling as live scorecard */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '0.5rem',
            borderBottom: '1px solid #666',
            paddingBottom: '0.3rem',
            marginBottom: '0.5rem',
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: '#00FFFF'
          }}>
            <div>BATSMAN</div>
            <div style={{ textAlign: 'right' }}>R</div>
            <div style={{ textAlign: 'right' }}>B</div>
            <div style={{ textAlign: 'right' }}>4s</div>
            <div style={{ textAlign: 'right' }}>6s</div>
          </div>
          {topBatsmen.map((batsman, idx) => (
            <div 
              key={idx}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: '0.5rem',
                paddingBottom: '0.3rem',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ 
                color: batsman.isOut ? '#FFFFFF' : '#FFFF00'
              }}>
                {batsman.name}{batsman.isOut ? '' : '*'}
              </div>
              <div style={{ textAlign: 'right', color: '#00FF00' }}>
                {batsman.runs}
              </div>
              <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                {batsman.balls}
              </div>
              <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                {batsman.fours || 0}
              </div>
              <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                {batsman.sixes || 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Bowlers */}
      {topBowlers && topBowlers.length > 0 && (
        <div className="teletext-block" style={{ marginBottom: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#FF00FF' }}>TOP BOWLERS:</h3>
          {/* CRITICAL FIX: Use same table styling as live scorecard */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '0.5rem',
            borderBottom: '1px solid #666',
            paddingBottom: '0.3rem',
            marginBottom: '0.5rem',
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: '#00FFFF'
          }}>
            <div>BOWLING</div>
            <div style={{ textAlign: 'right' }}>O</div>
            <div style={{ textAlign: 'right' }}>M</div>
            <div style={{ textAlign: 'right' }}>R</div>
            <div style={{ textAlign: 'right' }}>W</div>
          </div>
          {topBowlers.map((bowler, idx) => (
            <div 
              key={idx}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: '0.5rem',
                paddingBottom: '0.3rem',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ color: '#FFFFFF' }}>
                {bowler.name}
              </div>
              <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                {bowler.overs}
              </div>
              <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                {bowler.maidens || 0}
              </div>
              <div style={{ textAlign: 'right', color: '#FF0000' }}>
                {bowler.runs}
              </div>
              <div style={{ textAlign: 'right', color: '#00FF00' }}>
                {bowler.wickets}
              </div>
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
          {session === 3 ? '[CONTINUE TO DAY ' + (day + 1) + ']' : '[CONTINUE]'}
        </TeletextButton>
      </div>
    </div>
  )
}

export default SessionSummary
