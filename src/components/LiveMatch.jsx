import React, { useState, useEffect } from 'react'
import TeletextPage from './TeletextPage'
import MatchScorecard from './MatchScorecard'
import CommentaryFeed from './CommentaryFeed'
import MatchControls from './MatchControls'
import { startMatch, simulateBall, simulateOver, MatchState } from '../engine/matchSimulator.js'
import { ProbabilityEngine } from '../engine/probabilityEngine.js'
import { 
  loadTeam, 
  formatBatsmanStats, 
  formatBowlerStats,
  performToss,
  getMatchPhase,
  calculateProjectedScore
} from '../utils/matchHelpers.js'
import { calculateRunRate, calculateRequiredRate, ballsToOvers } from '../engine/matchUtils.js'

/**
 * LiveMatch Component
 * Interactive live match viewer with ball-by-ball simulation
 */
const LiveMatch = ({ onNavigate }) => {
  const [matchState, setMatchState] = useState(null)
  const [probabilityEngine, setProbabilityEngine] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)
  const [matchPhase, setMatchPhase] = useState('toss')
  const [tossResult, setTossResult] = useState(null)
  const [team1Data, setTeam1Data] = useState(null)
  const [team2Data, setTeam2Data] = useState(null)
  
  // Initialize match on component mount
  useEffect(() => {
    initializeMatch()
  }, [])
  
  const initializeMatch = async () => {
    setIsLoading(true)
    setMatchPhase('toss')
    
    // Simulate toss delay for authenticity
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Load teams
      const team1 = loadTeam('team_001') // City Strikers
      const team2 = loadTeam('team_002') // Harbor Hawks
      
      setTeam1Data(team1)
      setTeam2Data(team2)
      
      // Perform toss
      const toss = performToss()
      setTossResult(toss)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Determine batting order based on toss
      let battingTeam, bowlingTeam
      if ((toss.winner === 1 && toss.decision === 'bat') || (toss.winner === 2 && toss.decision === 'bowl')) {
        battingTeam = team1
        bowlingTeam = team2
      } else {
        battingTeam = team2
        bowlingTeam = team1
      }
      
      // Start match
      const newMatchState = startMatch(battingTeam, bowlingTeam, { overs: 20 })
      const engine = new ProbabilityEngine(newMatchState.conditions)
      
      // Set initial bowler
      const bowlers = bowlingTeam.players.filter(p => 
        p.role === 'bowler' || p.role === 'all_rounder'
      )
      if (bowlers.length > 0) {
        newMatchState.bowler = bowlers[0]
      } else {
        // Fallback: use any player
        newMatchState.bowler = bowlingTeam.players[0]
      }
      
      setMatchState(newMatchState)
      setProbabilityEngine(engine)
      setMatchPhase('playing')
      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing match:', error)
      setMatchPhase('error')
      setIsLoading(false)
    }
  }
  
  // Simulate a single ball
  const handleNextBall = () => {
    if (!matchState || !probabilityEngine || isSimulating) return
    
    try {
      const result = simulateBall(matchState, probabilityEngine)
      
      // Check if innings is complete
      if (matchState.isInningsComplete()) {
        handleInningsComplete()
      }
      
      // Force re-render by creating a new reference
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    } catch (error) {
      console.error('Error simulating ball:', error)
    }
  }
  
  // Simulate a full over
  const handleNextOver = () => {
    if (!matchState || !probabilityEngine || isSimulating) return
    
    setIsSimulating(true)
    
    try {
      const results = simulateOver(matchState, probabilityEngine)
      
      // Check if innings is complete
      if (matchState.isInningsComplete()) {
        handleInningsComplete()
      } else {
        // Change bowler after over
        rotateBowler()
      }
      
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    } catch (error) {
      console.error('Error simulating over:', error)
    } finally {
      setIsSimulating(false)
    }
  }
  
  // Fast forward to end of innings/match
  const handleFastForward = async () => {
    if (!matchState || !probabilityEngine || isSimulating) return
    
    setIsSimulating(true)
    
    try {
      let ballCount = 0
      const maxBalls = 1000 // Safety limit
      
      // Simulate until innings complete
      while (!matchState.isInningsComplete() && ballCount < maxBalls) {
        simulateBall(matchState, probabilityEngine)
        ballCount++
        
        // Change bowler every over
        if (matchState.balls % 6 === 0 && !matchState.isInningsComplete()) {
          rotateBowler()
        }
        
        // Update UI every 10 balls
        if (ballCount % 10 === 0) {
          setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
      
      handleInningsComplete()
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    } catch (error) {
      console.error('Error fast forwarding:', error)
    } finally {
      setIsSimulating(false)
    }
  }
  
  // Handle innings completion
  const handleInningsComplete = () => {
    if (matchState.currentInning === 1) {
      // Switch to second innings
      setMatchPhase('innings_break')
      
      // Delay before starting second innings
      setTimeout(() => {
        matchState.switchInnings()
        
        // Set initial bowler for second innings
        const bowlers = matchState.bowlingTeam.players.filter(p => 
          p.role === 'bowler' || p.role === 'all_rounder'
        )
        if (bowlers.length > 0) {
          matchState.bowler = bowlers[0]
        } else {
          matchState.bowler = matchState.bowlingTeam.players[0]
        }
        
        setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
        setMatchPhase('playing')
      }, 2000)
    } else {
      // Match complete
      setMatchPhase('complete')
    }
  }
  
  // Rotate bowler (simplified rotation)
  const rotateBowler = () => {
    const bowlers = matchState.bowlingTeam.players.filter(p => 
      p.role === 'bowler' || p.role === 'all_rounder'
    )
    
    if (bowlers.length === 0) return
    
    // Find current bowler index
    const currentIndex = bowlers.findIndex(b => b.id === matchState.bowler.id)
    const nextIndex = (currentIndex + 1) % bowlers.length
    matchState.bowler = bowlers[nextIndex]
  }
  
  // Restart match
  const handleRestartMatch = () => {
    setMatchState(null)
    setProbabilityEngine(null)
    setTossResult(null)
    initializeMatch()
  }
  
  // Get match result
  const getMatchResult = () => {
    if (!matchState || matchState.currentInning === 1) return null
    
    const target = matchState.innings.first.runs
    const chasing = matchState.score
    
    if (chasing > target) {
      const wicketsRemaining = 10 - matchState.wickets
      return `${matchState.battingTeam.name} won by ${wicketsRemaining} wickets`
    } else if (chasing < target) {
      const runsMargin = target - chasing
      return `${matchState.bowlingTeam.name} won by ${runsMargin} runs`
    } else {
      return 'Match tied!'
    }
  }
  
  // Loading screen
  if (isLoading) {
    return (
      <TeletextPage pageNumber="P300" title="MATCH DAY - LIVE">
        <div className="teletext-block teletext-block--yellow">
          <h2 className="teletext-subtitle">MATCH PREPARATION</h2>
        </div>
        
        <div className="teletext-block">
          {matchPhase === 'toss' && (
            <p className="teletext-text teletext-text--cyan">
              🏏 TOSS IN PROGRESS...
            </p>
          )}
          {tossResult && (
            <>
              <p className="teletext-text teletext-text--white">
                {team1Data?.name || 'Team 1'} vs {team2Data?.name || 'Team 2'}
              </p>
              <p className="teletext-text teletext-text--green">
                Toss won by {tossResult.winner === 1 ? team1Data?.name : team2Data?.name}
              </p>
              <p className="teletext-text teletext-text--yellow">
                Decision: {tossResult.decision === 'bat' ? 'BAT FIRST' : 'BOWL FIRST'}
              </p>
              <p className="teletext-text teletext-text--cyan">
                🏏 TEAMS TAKING THE FIELD...
              </p>
            </>
          )}
        </div>
      </TeletextPage>
    )
  }
  
  // Error screen
  if (matchPhase === 'error') {
    return (
      <TeletextPage pageNumber="P300" title="MATCH DAY - ERROR">
        <div className="teletext-block teletext-block--red">
          <h2 className="teletext-subtitle">ERROR</h2>
          <p className="teletext-text teletext-text--white">
            Unable to load match. Please try again.
          </p>
        </div>
        <MatchControls 
          onRestartMatch={handleRestartMatch}
          onBackToMenu={() => onNavigate('P100')}
          isMatchComplete={true}
        />
      </TeletextPage>
    )
  }
  
  if (!matchState) return null
  
  // Get current batsmen stats
  const striker = matchState.striker ? formatBatsmanStats(matchState.striker, matchState.batsmanStats) : null
  const nonStriker = matchState.nonStriker ? formatBatsmanStats(matchState.nonStriker, matchState.batsmanStats) : null
  
  // Get current bowler stats
  const bowler = matchState.bowler ? formatBowlerStats(matchState.bowler, matchState.bowlerStats) : null
  
  // Calculate run rates
  const currentRunRate = calculateRunRate(matchState.score, matchState.balls)
  let requiredRunRate = 0
  let targetInfo = ''
  
  if (matchState.currentInning === 2) {
    const target = matchState.innings.first.runs + 1
    const needed = target - matchState.score
    const ballsLeft = (matchState.totalOvers * 6) - matchState.balls
    requiredRunRate = calculateRequiredRate(needed, ballsLeft)
    targetInfo = `TARGET: ${target} | NEED: ${needed} FROM ${ballsToOvers(ballsLeft)} OV`
  }
  
  // Projected score for first innings
  const projectedScore = matchState.currentInning === 1 ? calculateProjectedScore(matchState) : null
  
  // Innings break screen
  if (matchPhase === 'innings_break') {
    return (
      <TeletextPage pageNumber="P300" title="MATCH DAY - INNINGS BREAK">
        <div className="teletext-block teletext-block--cyan">
          <h2 className="teletext-subtitle">END OF FIRST INNINGS</h2>
        </div>
        
        <div className="teletext-block">
          <p className="teletext-text teletext-text--yellow">
            {matchState.innings.first.runs}/{matchState.innings.first.wickets} ({matchState.innings.first.overs} OV)
          </p>
          <p className="teletext-text teletext-text--white">
            Target: {matchState.innings.first.runs + 1} runs
          </p>
          <p className="teletext-text teletext-text--cyan">
            🏏 SECOND INNINGS STARTING...
          </p>
        </div>
      </TeletextPage>
    )
  }
  
  // Match complete screen
  if (matchPhase === 'complete') {
    const result = getMatchResult()
    
    return (
      <TeletextPage pageNumber="P300" title="MATCH DAY - RESULT">
        <div className="teletext-block teletext-block--green">
          <h2 className="teletext-subtitle">MATCH COMPLETE</h2>
        </div>
        
        <div className="teletext-block teletext-block--yellow">
          <p className="teletext-text teletext-text--black">
            {result}
          </p>
        </div>
        
        <div className="teletext-block">
          <h3 className="teletext-subtitle">FINAL SCORES</h3>
          <p className="teletext-text">
            {matchState.team1.name}: {matchState.innings.first.runs}/{matchState.innings.first.wickets} ({matchState.innings.first.overs} ov)
          </p>
          <p className="teletext-text">
            {matchState.team2.name}: {matchState.score}/{matchState.wickets} ({ballsToOvers(matchState.balls)} ov)
          </p>
        </div>
        
        <CommentaryFeed commentary={matchState.commentary} maxItems={8} />
        
        <MatchControls 
          onRestartMatch={handleRestartMatch}
          onBackToMenu={() => onNavigate('P100')}
          isMatchComplete={true}
        />
      </TeletextPage>
    )
  }
  
  // Main match screen
  return (
    <TeletextPage pageNumber="P300" title="MATCH DAY - LIVE">
      <div className="teletext-block teletext-block--yellow">
        <h2 className="teletext-subtitle">
          {matchState.currentInning === 1 ? 'FIRST INNINGS' : 'SECOND INNINGS - CHASING'}
        </h2>
      </div>
      
      {/* Current Score */}
      <div className="teletext-block teletext-block--blue">
        <div style={{ fontSize: '1.5rem', textAlign: 'center', color: '#FFFF00' }}>
          {matchState.battingTeam.name}: {matchState.score}/{matchState.wickets} ({ballsToOvers(matchState.balls)} OV)
        </div>
        {matchState.currentInning === 2 && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#00FF00' }}>
            {targetInfo}
          </div>
        )}
      </div>
      
      {/* Scorecard */}
      {striker && nonStriker && bowler && (
        <MatchScorecard
          team1Name={matchState.battingTeam.name}
          team1Score={`${matchState.score}/${matchState.wickets}`}
          team1Overs={ballsToOvers(matchState.balls)}
          team2Name={matchState.bowlingTeam.name}
          team2Score={matchState.currentInning === 2 ? `${matchState.innings.first.runs}/${matchState.innings.first.wickets}` : '-'}
          team2Overs={matchState.currentInning === 2 ? matchState.innings.first.overs : '-'}
          batsmen={[
            { 
              name: striker.name, 
              runs: striker.runs, 
              balls: striker.balls, 
              fours: striker.fours, 
              sixes: striker.sixes,
              status: '*'
            },
            { 
              name: nonStriker.name, 
              runs: nonStriker.runs, 
              balls: nonStriker.balls, 
              fours: nonStriker.fours, 
              sixes: nonStriker.sixes,
              status: ''
            }
          ]}
          bowler={{
            name: bowler.name,
            overs: bowler.overs,
            maidens: bowler.maidens,
            runs: bowler.runs,
            wickets: bowler.wickets
          }}
        />
      )}
      
      {/* Match Stats */}
      <div className="teletext-block">
        <div className="teletext-grid">
          <div className="teletext-stat">
            <div className="teletext-stat__label">RUN RATE</div>
            <div className="teletext-stat__value">{currentRunRate.toFixed(2)}</div>
          </div>
          {matchState.currentInning === 2 && (
            <div className="teletext-stat">
              <div className="teletext-stat__label">REQ RATE</div>
              <div className="teletext-stat__value teletext-text--yellow">{requiredRunRate.toFixed(2)}</div>
            </div>
          )}
          {matchState.currentInning === 1 && projectedScore && (
            <div className="teletext-stat">
              <div className="teletext-stat__label">PROJECTED</div>
              <div className="teletext-stat__value">{projectedScore}</div>
            </div>
          )}
          <div className="teletext-stat">
            <div className="teletext-stat__label">PARTNERSHIP</div>
            <div className="teletext-stat__value">{matchState.currentPartnership.runs} ({matchState.currentPartnership.balls})</div>
          </div>
        </div>
      </div>
      
      {/* Commentary */}
      <CommentaryFeed commentary={matchState.commentary} maxItems={6} />
      
      {/* Controls */}
      <MatchControls 
        onNextBall={handleNextBall}
        onNextOver={handleNextOver}
        onFastForward={handleFastForward}
        onRestartMatch={handleRestartMatch}
        onBackToMenu={() => onNavigate('P100')}
        isMatchComplete={false}
        isSimulating={isSimulating}
      />
    </TeletextPage>
  )
}

export default LiveMatch
