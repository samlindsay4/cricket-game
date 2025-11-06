import React, { useState } from 'react'
import TeletextButton from './TeletextButton'

/**
 * MatchScorecards Component
 * Display full tabbed scorecards for all innings at match end
 */
const MatchScorecards = ({ matchState, team1Data, team2Data, onBack }) => {
  const [activeTab, setActiveTab] = useState(1)
  
  // Build innings list with team information
  const getInningsTeam = (inningsNum) => {
    // Innings 1: Team1, Innings 2: Team2, Innings 3: Team1, Innings 4: Team2
    if (inningsNum === 1 || inningsNum === 3) {
      return team1Data.name
    } else {
      return team2Data.name
    }
  }
  
  const getInningsLabel = (inningsNum) => {
    // Innings 1 and 2 are each team's 1st innings
    // Innings 3 and 4 are each team's 2nd innings
    if (inningsNum === 1 || inningsNum === 2) {
      return '1ST INNINGS'
    } else {
      return '2ND INNINGS'
    }
  }
  
  const innings = [
    { num: 1, data: matchState.allInnings.first, team: getInningsTeam(1), label: getInningsLabel(1) },
    { num: 2, data: matchState.allInnings.second, team: getInningsTeam(2), label: getInningsLabel(2) },
    { num: 3, data: matchState.allInnings.third, team: getInningsTeam(3), label: getInningsLabel(3) },
    { num: 4, data: matchState.allInnings.fourth, team: getInningsTeam(4), label: getInningsLabel(4) }
  ].filter(inn => inn.data && inn.data.runs !== undefined)
  
  // Format fall of wickets for display
  const formatFallOfWickets = (fallOfWickets) => {
    if (!fallOfWickets || fallOfWickets.length === 0) return 'None'
    
    return fallOfWickets.map(fow => 
      `${fow.wicket}-${fow.runs} (${fow.batsman}, ${fow.over})`
    ).join(', ')
  }
  
  return (
    <div className="teletext-page">
      <div className="teletext-block teletext-block--cyan" style={{ marginBottom: '1rem' }}>
        <h2 className="teletext-subtitle" style={{ color: '#000000' }}>
          FULL SCORECARDS
        </h2>
      </div>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {innings.map(inn => (
          <button
            key={inn.num}
            className={`teletext-button ${activeTab === inn.num ? 'teletext-button--cyan' : 'teletext-button--blue'}`}
            onClick={() => setActiveTab(inn.num)}
            style={{
              flex: '1 1 auto',
              minWidth: '120px'
            }}
          >
            {inn.team} - {inn.label}
          </button>
        ))}
      </div>
      
      {/* Active innings scorecard */}
      {innings.map(inn => (
        activeTab === inn.num && (
          <div key={inn.num} className="innings-scorecard">
            <div className="teletext-block teletext-block--yellow" style={{ marginBottom: '0.5rem' }}>
              <h3 className="teletext-subtitle" style={{ color: '#000000' }}>
                {inn.team} - {inn.label}
              </h3>
            </div>
            
            {/* Score Summary */}
            <div className="teletext-block teletext-block--blue" style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.2rem', color: '#FFFF00', textAlign: 'center' }}>
                {inn.data.runs}/{inn.data.wickets} ({inn.data.overs} overs)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#00FFFF', textAlign: 'center', marginTop: '0.3rem' }}>
                EXTRAS: {inn.data.extras}
              </div>
            </div>
            
            {/* Batting Card */}
            {inn.data.battingCard && inn.data.battingCard.length > 0 && (
              <div className="teletext-block" style={{ marginBottom: '1rem' }}>
                <h3 className="teletext-subtitle" style={{ color: '#00FF00', marginBottom: '0.5rem' }}>
                  BATTING
                </h3>
                
                {/* Table Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr 1fr',
                  gap: '0.5rem',
                  borderBottom: '1px solid #666',
                  paddingBottom: '0.3rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#00FFFF'
                }}>
                  <div>BATSMAN</div>
                  <div>HOW OUT</div>
                  <div style={{ textAlign: 'right' }}>R</div>
                  <div style={{ textAlign: 'right' }}>B</div>
                  <div style={{ textAlign: 'right' }}>4s</div>
                  <div style={{ textAlign: 'right' }}>6s</div>
                </div>
                
                {/* Batting Rows */}
                {inn.data.battingCard.map((batsman, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr 1fr',
                      gap: '0.5rem',
                      paddingBottom: '0.3rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ 
                      color: batsman.notOut ? '#FFFF00' : '#FFFFFF',
                      fontWeight: batsman.notOut ? 'bold' : 'normal'
                    }}>
                      {batsman.name}{batsman.notOut ? '*' : ''}
                    </div>
                    <div style={{ color: '#FFFFFF', fontSize: '0.75rem' }}>
                      {batsman.howOut || 'not out'}
                    </div>
                    <div style={{ textAlign: 'right', color: '#00FF00' }}>
                      {batsman.runs}
                    </div>
                    <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                      {batsman.balls}
                    </div>
                    <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                      {batsman.fours}
                    </div>
                    <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                      {batsman.sixes}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bowling Figures */}
            {inn.data.bowlingCard && inn.data.bowlingCard.length > 0 && (
              <div className="teletext-block" style={{ marginBottom: '1rem' }}>
                <h3 className="teletext-subtitle" style={{ color: '#FF00FF', marginBottom: '0.5rem' }}>
                  BOWLING
                </h3>
                
                {/* Table Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr',
                  gap: '0.5rem',
                  borderBottom: '1px solid #666',
                  paddingBottom: '0.3rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#00FFFF'
                }}>
                  <div>BOWLER</div>
                  <div style={{ textAlign: 'right' }}>O</div>
                  <div style={{ textAlign: 'right' }}>M</div>
                  <div style={{ textAlign: 'right' }}>R</div>
                  <div style={{ textAlign: 'right' }}>W</div>
                </div>
                
                {/* Bowling Rows */}
                {inn.data.bowlingCard.map((bowler, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr',
                      gap: '0.5rem',
                      paddingBottom: '0.3rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ color: '#FFFFFF' }}>
                      {bowler.name}
                    </div>
                    <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                      {bowler.overs}
                    </div>
                    <div style={{ textAlign: 'right', color: '#FFFFFF' }}>
                      {bowler.maidens}
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
            
            {/* Fall of Wickets */}
            {inn.data.fallOfWickets && inn.data.fallOfWickets.length > 0 && (
              <div className="teletext-block" style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#00FFFF', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                  <strong>FALL OF WICKETS:</strong>
                </p>
                <p style={{ color: '#FFFFFF', fontSize: '0.75rem', lineHeight: '1.4' }}>
                  {formatFallOfWickets(inn.data.fallOfWickets)}
                </p>
              </div>
            )}
          </div>
        )
      ))}
      
      <div style={{ marginTop: '1rem' }}>
        <TeletextButton color="red" onClick={onBack}>
          ◄ BACK TO RESULT
        </TeletextButton>
      </div>
    </div>
  )
}

export default MatchScorecards
