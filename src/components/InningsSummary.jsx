import React from 'react'
import TeletextButton from './TeletextButton'

/**
 * InningsSummary Component
 * Display summary at end of each innings
 */
const InningsSummary = ({ 
  inningsNumber,
  teamName,
  totalRuns,
  totalWickets,
  overs,
  topBatsmen,
  topBowlers,
  onContinue
}) => {
  return (
    <div className="teletext-block">
      <div className="teletext-block teletext-block--cyan" style={{ marginBottom: '1rem' }}>
        <h2 className="teletext-subtitle" style={{ color: '#000000' }}>
          END OF INNINGS {inningsNumber}
        </h2>
      </div>

      <div className="teletext-block teletext-block--blue" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.4rem', color: '#FFFF00', textAlign: 'center' }}>
          {teamName}: {totalRuns}/{totalWickets}
        </div>
        <div style={{ fontSize: '1rem', color: '#00FF00', textAlign: 'center', marginTop: '0.3rem' }}>
          ({overs} OVERS)
        </div>
      </div>

      {/* Top Batsmen */}
      {topBatsmen && topBatsmen.length > 0 && (
        <div className="teletext-block" style={{ marginBottom: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#00FF00' }}>TOP BATSMEN:</h3>
          {topBatsmen.map((batsman, idx) => (
            <div key={idx} style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: '#FFFFFF', fontFamily: 'monospace' }}>
              {idx + 1}. {batsman.name.padEnd(20)} {batsman.runs}{batsman.isOut ? '' : '*'} ({batsman.balls})
            </div>
          ))}
        </div>
      )}

      {/* Top Bowlers */}
      {topBowlers && topBowlers.length > 0 && (
        <div className="teletext-block" style={{ marginBottom: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#FF00FF' }}>TOP BOWLERS:</h3>
          {topBowlers.map((bowler, idx) => (
            <div key={idx} style={{ fontSize: '0.9rem', marginTop: '0.3rem', color: '#FFFFFF', fontFamily: 'monospace' }}>
              {idx + 1}. {bowler.name.padEnd(20)} {bowler.wickets}/{bowler.runs} ({bowler.overs} ov)
            </div>
          ))}
        </div>
      )}

      <div className="teletext-block teletext-block--yellow" style={{ marginBottom: '1rem' }}>
        <div style={{ color: '#000000', textAlign: 'center', fontSize: '1.1rem' }}>
          🏏 INNINGS COMPLETE 🏏
        </div>
        <div style={{ color: '#000000', textAlign: 'center', marginTop: '0.3rem' }}>
          NEXT INNINGS STARTING...
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <TeletextButton color="green" onClick={onContinue}>
          [CONTINUE TO INNINGS {inningsNumber + 1}]
        </TeletextButton>
      </div>
    </div>
  )
}

export default InningsSummary
