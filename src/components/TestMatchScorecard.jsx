import React from 'react'

/**
 * TestMatchScorecard Component
 * Traditional Test match scorecard in Ceefax/teletext style
 */
const TestMatchScorecard = ({ 
  teamName, 
  inningsNumber,
  score, 
  wickets, 
  overs, 
  batsmen,
  bowlers,
  extras,
  fallOfWickets
}) => {
  return (
    <div className="teletext-block">
      <div style={{ 
        borderBottom: '2px solid #FFFF00', 
        paddingBottom: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <h3 className="teletext-subtitle" style={{ color: '#FFFF00' }}>
          {teamName} {inningsNumber === 1 || inningsNumber === 3 ? '1ST' : '2ND'} INNINGS
        </h3>
        <div style={{ fontSize: '1.3rem', color: '#00FF00', marginTop: '0.3rem' }}>
          {score}/{wickets} ({overs} OVERS)
        </div>
      </div>

      {/* Batting section */}
      {batsmen && batsmen.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '0.5rem',
            borderBottom: '1px solid #666',
            paddingBottom: '0.3rem',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            color: '#00FFFF'
          }}>
            <div>BATSMAN</div>
            <div style={{ textAlign: 'right' }}>R</div>
            <div style={{ textAlign: 'right' }}>B</div>
            <div style={{ textAlign: 'right' }}>4s</div>
            <div style={{ textAlign: 'right' }}>6s</div>
          </div>
          {batsmen.map((batsman, idx) => (
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
              <div style={{ color: batsman.status === '*' ? '#FFFF00' : '#FFFFFF' }}>
                {batsman.name}{batsman.status}
                {batsman.dismissal && (
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>
                    {batsman.dismissal}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', color: '#00FF00' }}>{batsman.runs}</div>
              <div style={{ textAlign: 'right' }}>{batsman.balls}</div>
              <div style={{ textAlign: 'right' }}>{batsman.fours}</div>
              <div style={{ textAlign: 'right' }}>{batsman.sixes}</div>
            </div>
          ))}
          {extras && (
            <div style={{ 
              marginTop: '0.5rem', 
              paddingTop: '0.5rem', 
              borderTop: '1px solid #444',
              fontSize: '0.85rem',
              color: '#FFFF00'
            }}>
              EXTRAS: {(extras.w || 0) + (extras.nb || 0) + (extras.b || 0) + (extras.lb || 0)} (W {extras.w || 0}, NB {extras.nb || 0}, B {extras.b || 0}, LB {extras.lb || 0})
            </div>
          )}
        </div>
      )}

      {/* Bowling section */}
      {bowlers && bowlers.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '0.5rem',
            borderBottom: '1px solid #666',
            paddingBottom: '0.3rem',
            marginBottom: '0.5rem',
            fontSize: '0.85rem',
            color: '#00FFFF'
          }}>
            <div>BOWLING</div>
            <div style={{ textAlign: 'right' }}>O</div>
            <div style={{ textAlign: 'right' }}>M</div>
            <div style={{ textAlign: 'right' }}>R</div>
            <div style={{ textAlign: 'right' }}>W</div>
          </div>
          {bowlers.map((bowler, idx) => (
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
              <div style={{ color: bowler.isCurrent ? '#FFFF00' : '#FFFFFF' }}>
                {bowler.name}{bowler.isCurrent ? ' *' : ''}
              </div>
              <div style={{ textAlign: 'right' }}>{bowler.overs}</div>
              <div style={{ textAlign: 'right' }}>{bowler.maidens}</div>
              <div style={{ textAlign: 'right', color: '#FF0000' }}>{bowler.runs}</div>
              <div style={{ textAlign: 'right', color: '#00FF00' }}>{bowler.wickets}</div>
            </div>
          ))}
        </div>
      )}

      {/* Fall of wickets */}
      {fallOfWickets && fallOfWickets.length > 0 && (
        <div style={{ 
          marginTop: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #444',
          fontSize: '0.8rem',
          color: '#888'
        }}>
          <div style={{ color: '#00FFFF', marginBottom: '0.3rem' }}>FALL OF WICKETS:</div>
          <div>
            {fallOfWickets.map((fow, idx) => (
              <span key={idx}>
                {idx > 0 && ', '}
                {fow.wicket}-{fow.runs} ({fow.batsman}, {fow.over} ov)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestMatchScorecard
