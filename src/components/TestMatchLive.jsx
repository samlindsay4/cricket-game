import React, { useState, useEffect } from 'react'
import TeletextPage from './TeletextPage'
import TestMatchScorecard from './TestMatchScorecard'
import SessionSummary from './SessionSummary'
import InningsSummary from './InningsSummary'
import CommentaryFeed from './CommentaryFeed'
import MatchScorecards from './MatchScorecards'
import TeletextButton from './TeletextButton'
import { TestMatchState, simulateTestBall } from '../engine/testMatchSimulator.js'
import { TestProbabilityEngine } from '../engine/testProbabilityEngine.js'
import { MatchConditions } from '../engine/matchConditions.js'
import { BowlingManager } from '../engine/bowlingManager.js'
import { getEnglandSquad, getAustraliaSquad, selectTestXI, getBowlers, performToss } from '../utils/ashesHelpers.js'
import { ballsToOvers } from '../engine/matchUtils.js'
import { getTopBatsmen, getTopBowlers } from '../utils/matchHelpers.js'

/**
 * TestMatchLive Component
 * Main component for playing The Ashes 2025 Test match
 */
const TestMatchLive = ({ onNavigate }) => {
  const [matchState, setMatchState] = useState(null)
  const [probabilityEngine, setProbabilityEngine] = useState(null)
  const [bowlingManager, setBowlingManager] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)
  const [matchPhase, setMatchPhase] = useState('toss')
  const [tossResult, setTossResult] = useState(null)
  const [team1Data, setTeam1Data] = useState(null)
  const [team2Data, setTeam2Data] = useState(null)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [sessionSummaryData, setSessionSummaryData] = useState(null)
  const [showInningsSummary, setShowInningsSummary] = useState(false)
  const [inningsSummaryData, setInningsSummaryData] = useState(null)
  const [showScorecards, setShowScorecards] = useState(false)
  
  // Initialize match on component mount
  useEffect(() => {
    initializeMatch()
  }, [])
  
  const initializeMatch = async () => {
    setIsLoading(true)
    setMatchPhase('toss')
    
    try {
      // Load teams
      const england = getEnglandSquad()
      const australia = getAustraliaSquad()
      
      // Select playing XIs
      england.players = selectTestXI(england)
      australia.players = selectTestXI(australia)
      
      setTeam1Data(england)
      setTeam2Data(australia)
      
      // Perform toss
      await new Promise(resolve => setTimeout(resolve, 1000))
      const toss = performToss()
      setTossResult(toss)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Determine batting order based on toss
      let battingTeam, bowlingTeam
      if ((toss.winner === 1 && toss.decision === 'bat') || (toss.winner === 2 && toss.decision === 'bowl')) {
        battingTeam = england
        bowlingTeam = australia
      } else {
        battingTeam = australia
        bowlingTeam = england
      }
      
      // Create match conditions for Test cricket
      const conditions = MatchConditions.generateRandom('Test')
      conditions.updatePitchWearByDay(1)
      
      // Start match
      const newMatchState = new TestMatchState(battingTeam, bowlingTeam, conditions)
      const engine = new TestProbabilityEngine(conditions)
      
      // Initialize batsmen
      newMatchState.initializeBatsmen(battingTeam.players)
      
      // Set initial bowler and create bowling manager
      const bowlers = getBowlers(bowlingTeam.players)
      const manager = new BowlingManager(bowlers)
      
      if (bowlers.length > 0) {
        newMatchState.bowler = manager.selectNextBowler(0, newMatchState, null)
        newMatchState.currentBowlerOvers = 0
      }
      
      setMatchState(newMatchState)
      setProbabilityEngine(engine)
      setBowlingManager(manager)
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
      const result = simulateTestBall(matchState, probabilityEngine)
      
      // Check for session/innings completion
      if (matchState.isSessionComplete() && !matchState.isInningsComplete()) {
        handleSessionBreak()
      } else if (matchState.isInningsComplete()) {
        handleInningsComplete()
      }
      
      // Force re-render
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    } catch (error) {
      console.error('Error simulating ball:', error)
    }
  }
  
  // Simulate a full over
  const handleNextOver = async () => {
    if (!matchState || !probabilityEngine || isSimulating) return
    
    setIsSimulating(true)
    
    try {
      // Calculate balls remaining in current over
      const ballsInCurrentOver = matchState.balls % 6
      const ballsToSimulate = ballsInCurrentOver === 0 ? 6 : (6 - ballsInCurrentOver)
      
      let legalBalls = 0
      
      // Simulate remaining balls to complete the over
      while (legalBalls < ballsToSimulate && !matchState.isInningsComplete() && !matchState.isSessionComplete()) {
        const result = simulateTestBall(matchState, probabilityEngine)
        if (result.isLegalDelivery) legalBalls++
        
        await new Promise(resolve => setTimeout(resolve, 50))
        setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
      }
      
      // Rotate strike at end of over
      if (legalBalls === ballsToSimulate && !matchState.isInningsComplete()) {
        matchState.rotateStrike()
        rotateBowler()
      }
      
      // Check for session/innings completion
      if (matchState.isSessionComplete() && !matchState.isInningsComplete()) {
        handleSessionBreak()
      } else if (matchState.isInningsComplete()) {
        handleInningsComplete()
      }
      
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    } catch (error) {
      console.error('Error simulating over:', error)
    } finally {
      setIsSimulating(false)
    }
  }
  
  // Fast forward to end of session
  const handleNextSession = async () => {
    if (!matchState || !probabilityEngine || isSimulating) return
    
    setIsSimulating(true)
    
    try {
      let ballCount = 0
      const maxBalls = 180 // 30 overs max per session
      
      while (!matchState.isSessionComplete() && !matchState.isInningsComplete() && ballCount < maxBalls) {
        simulateTestBall(matchState, probabilityEngine)
        ballCount++
        
        // CRITICAL FIX: Only change bowler at END of over (after 6 legal balls)
        // Check if over is complete (balls % 6 === 0) AND bowler has bowled enough
        const isOverComplete = matchState.balls % 6 === 0
        if (isOverComplete && matchState.currentBowlerOvers >= 6) {
          rotateBowler()
          matchState.rotateStrike() // Rotate strike at end of over
        }
        
        // Update UI periodically
        if (ballCount % 30 === 0) {
          setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      if (matchState.isInningsComplete()) {
        handleInningsComplete()
      } else {
        handleSessionBreak()
      }
      
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    } catch (error) {
      console.error('Error fast forwarding:', error)
    } finally {
      setIsSimulating(false)
    }
  }
  
  // Handle session break
  const handleSessionBreak = () => {
    // Check if this is end of day (session 3 complete)
    if (matchState.session === 3) {
      // End of day - reset spell tracking completely
      if (bowlingManager) {
        bowlingManager.resetSpellsForEndOfDay()
      }
    } else {
      // Lunch or Tea - partial reset (allow bowlers to bowl again but track cumulative)
      if (bowlingManager) {
        bowlingManager.resetSpellsForSessionBreak()
      }
    }
    
    // Get top batsmen and bowlers
    const topBatsmen = getTopBatsmen(matchState.batsmanStats, matchState.battingTeam.players, 3)
    const topBowlers = getTopBowlers(matchState.bowlerStats, matchState.bowlingTeam.players, 3)
    
    const summary = {
      day: matchState.day,
      session: matchState.session,
      teamName: matchState.battingTeam.name,
      sessionRuns: matchState.score, // Simplified
      sessionWickets: matchState.wickets,
      totalRuns: matchState.score,
      totalWickets: matchState.wickets,
      overs: ballsToOvers(matchState.balls),
      topBatsmen,
      topBowlers
    }
    
    setSessionSummaryData(summary)
    setShowSessionSummary(true)
  }
  
  // Continue from session break
  const handleContinueFromBreak = () => {
    setShowSessionSummary(false)
    matchState.nextSession()
    setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
  }
  
  // Continue from innings break
  const handleContinueFromInnings = () => {
    setShowInningsSummary(false)
    setMatchPhase('playing')
  }
  
  // Handle innings completion
  const handleInningsComplete = () => {
    // Get top batsmen and bowlers for innings summary
    const topBatsmen = getTopBatsmen(matchState.batsmanStats, matchState.battingTeam.players, 5)
    const topBowlers = getTopBowlers(matchState.bowlerStats, matchState.bowlingTeam.players, 5)
    
    const summary = {
      inningsNumber: matchState.inningsNumber,
      teamName: matchState.battingTeam.name,
      totalRuns: matchState.score,
      totalWickets: matchState.wickets,
      overs: ballsToOvers(matchState.balls),
      topBatsmen,
      topBowlers
    }
    
    setInningsSummaryData(summary)
    setShowInningsSummary(true)
    
    // Switch innings in background
    setTimeout(() => {
      // Add innings summary commentary
      const inningsSummary = `END OF INNINGS: ${matchState.battingTeam.name} ${matchState.score}/${matchState.wickets}`
      matchState.commentary.push(inningsSummary)
      
      // Switch to next innings
      matchState.switchInnings()
      
      // Check if match is now complete (after switching)
      // This will catch innings victories detected in isMatchComplete()
      if (matchState.isMatchComplete()) {
        setShowInningsSummary(false)
        setMatchPhase('complete')
        return
      }
      
      // Clear waiting message
      matchState.commentary = matchState.commentary.filter(c => 
        !c.toLowerCase().includes('waiting for match')
      )
      
      // Add innings start commentary
      if (matchState.inningsNumber === 2) {
        const trail = matchState.allInnings.first.runs
        matchState.commentary.push(`${matchState.battingTeam.name} begin their reply...`)
        matchState.commentary.push(`They need ${trail + 1} runs to avoid follow-on`)
      } else if (matchState.inningsNumber === 3) {
        if (matchState.followOnEnforced) {
          matchState.commentary.push(`FOLLOW-ON ENFORCED!`)
          matchState.commentary.push(`${matchState.battingTeam.name} bat again...`)
        } else {
          matchState.commentary.push(`3rd innings begins...`)
          matchState.commentary.push(`${matchState.battingTeam.name} bat again`)
        }
      } else if (matchState.inningsNumber === 4) {
        const team1Total = matchState.allInnings.first.runs + matchState.allInnings.third.runs
        const team2Total = matchState.allInnings.second.runs
        const target = team1Total - team2Total + 1
        matchState.commentary.push(`FINAL INNINGS`)
        matchState.commentary.push(`${matchState.battingTeam.name} need ${target} runs to win`)
      }
      
      // Initialize new innings
      matchState.initializeBatsmen(matchState.battingTeam.players)
      
      // Set initial bowler
      const bowlers = getBowlers(matchState.bowlingTeam.players)
      const manager = new BowlingManager(bowlers)
      
      if (bowlers.length > 0) {
        matchState.bowler = manager.selectNextBowler(0, matchState, null)
        matchState.currentBowlerOvers = 0
      }
      
      setBowlingManager(manager)
      setMatchState(Object.assign(Object.create(Object.getPrototypeOf(matchState)), matchState))
    }, 1000)
  }
  
  // Rotate bowler using BowlingManager
  const rotateBowler = () => {
    if (!bowlingManager) return
    
    const currentOver = Math.floor(matchState.balls / 6)
    const previousBowler = matchState.bowler
    
    // CRITICAL FIX: Always update spell tracking (every over)
    bowlingManager.updateSpell(previousBowler, currentOver)
    
    // ALWAYS select next bowler (can't bowl consecutive overs)
    // Pass previousBowler to ensure they are excluded from selection
    const nextBowler = bowlingManager.selectNextBowler(currentOver, matchState, previousBowler)
    matchState.bowler = nextBowler
    matchState.currentBowlerOvers = 0
  }
  
  // Restart match
  const handleRestartMatch = () => {
    setMatchState(null)
    setProbabilityEngine(null)
    setBowlingManager(null)
    setTossResult(null)
    setShowSessionSummary(false)
    setShowInningsSummary(false)
    initializeMatch()
  }
  
  // Format batsman stats
  const formatBatsman = (batsman, isStriker = false) => {
    const stats = matchState.batsmanStats.get(batsman.id)
    if (!stats) return null
    
    return {
      name: batsman.name,
      runs: stats.runs,
      balls: stats.balls,
      fours: stats.fours,
      sixes: stats.sixes,
      status: isStriker ? '*' : ''
    }
  }
  
  // Format bowler stats
  const formatBowler = (bowler, isCurrent = false) => {
    const stats = matchState.getBowlerStats(bowler)
    return {
      name: bowler.name,
      overs: ballsToOvers(stats.balls),
      maidens: stats.maidens,
      runs: stats.runs,
      wickets: stats.wickets,
      isCurrent
    }
  }
  
  // Loading screen
  if (isLoading) {
    return (
      <TeletextPage pageNumber="P300" title="THE ASHES 2025">
        <div className="teletext-block teletext-block--yellow">
          <h2 className="teletext-subtitle" style={{ color: '#000000' }}>MATCH PREPARATION</h2>
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
                ENGLAND vs AUSTRALIA
              </p>
              <p className="teletext-text teletext-text--green">
                TOSS: {tossResult.winner === 1 ? 'ENGLAND' : 'AUSTRALIA'}
              </p>
              <p className="teletext-text teletext-text--yellow">
                ELECTED TO: {tossResult.decision === 'bat' ? 'BAT FIRST' : 'BOWL FIRST'}
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
      <TeletextPage pageNumber="P300" title="THE ASHES 2025">
        <div className="teletext-block teletext-block--red">
          <h2 className="teletext-subtitle">ERROR</h2>
          <p className="teletext-text teletext-text--white">
            Unable to load match. Please try again.
          </p>
        </div>
        <TeletextButton color="red" onClick={() => onNavigate('P100')}>
          ◄ BACK TO MAIN MENU
        </TeletextButton>
      </TeletextPage>
    )
  }
  
  if (!matchState) return null
  
  // Session summary screen
  if (showSessionSummary && sessionSummaryData) {
    return (
      <TeletextPage pageNumber="P300" title="THE ASHES 2025">
        <SessionSummary
          {...sessionSummaryData}
          onContinue={handleContinueFromBreak}
        />
      </TeletextPage>
    )
  }
  
  // Innings summary screen
  if (showInningsSummary && inningsSummaryData) {
    return (
      <TeletextPage pageNumber="P300" title="THE ASHES 2025">
        <InningsSummary
          {...inningsSummaryData}
          onContinue={handleContinueFromInnings}
        />
      </TeletextPage>
    )
  }
  
  // Full scorecards screen
  if (showScorecards && matchPhase === 'complete') {
    return (
      <TeletextPage pageNumber="P300" title="THE ASHES 2025 - SCORECARDS">
        <MatchScorecards
          matchState={matchState}
          team1Data={team1Data}
          team2Data={team2Data}
          onBack={() => setShowScorecards(false)}
        />
      </TeletextPage>
    )
  }
  
  // Match complete screen
  if (matchPhase === 'complete') {
    const result = matchState.determineMatchResult()
    
    return (
      <TeletextPage pageNumber="P300" title="THE ASHES 2025 - RESULT">
        <div className="teletext-block teletext-block--green">
          <h2 className="teletext-subtitle">MATCH COMPLETE</h2>
        </div>
        
        {/* Match Result in teletext table format */}
        <div className="teletext-block" style={{ marginTop: '1rem' }}>
          <h3 className="teletext-subtitle" style={{ color: '#00FFFF', marginBottom: '0.5rem' }}>FINAL SCORES</h3>
          
          {/* Display all innings scores in table format */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr',
            gap: '0.3rem',
            fontSize: '0.9rem',
            fontFamily: 'monospace'
          }}>
            {matchState.allInnings.first && (
              <>
                <div style={{ color: '#FFFFFF' }}>
                  {team1Data.name} 1ST INNINGS
                </div>
                <div style={{ color: '#00FF00', textAlign: 'right' }}>
                  {matchState.allInnings.first.runs}/{matchState.allInnings.first.wickets}
                </div>
              </>
            )}
            
            {matchState.allInnings.second && (
              <>
                <div style={{ color: '#FFFFFF' }}>
                  {team2Data.name} 1ST INNINGS
                </div>
                <div style={{ color: '#00FF00', textAlign: 'right' }}>
                  {matchState.allInnings.second.runs}/{matchState.allInnings.second.wickets}
                </div>
              </>
            )}
            
            {matchState.allInnings.third && (
              <>
                <div style={{ color: '#FFFFFF' }}>
                  {team1Data.name} 2ND INNINGS
                </div>
                <div style={{ color: '#00FF00', textAlign: 'right' }}>
                  {matchState.allInnings.third.runs}/{matchState.allInnings.third.wickets}
                </div>
              </>
            )}
            
            {/* CRITICAL FIX: Only show 4th innings if it exists and has runs/wickets */}
            {matchState.allInnings.fourth && matchState.allInnings.fourth.runs + matchState.allInnings.fourth.wickets > 0 && (
              <>
                <div style={{ color: '#FFFFFF' }}>
                  {team2Data.name} 2ND INNINGS
                </div>
                <div style={{ color: '#00FF00', textAlign: 'right' }}>
                  {matchState.allInnings.fourth.runs}/{matchState.allInnings.fourth.wickets}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Result text in colored block */}
        <div className="teletext-block teletext-block--yellow" style={{ marginTop: '1rem' }}>
          <p className="teletext-text teletext-text--black" style={{ fontSize: '1.2rem', textAlign: 'center' }}>
            {result.description}
          </p>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <TeletextButton color="cyan" onClick={() => setShowScorecards(true)}>
            📊 VIEW FULL SCORECARDS
          </TeletextButton>
          <TeletextButton color="green" onClick={handleRestartMatch}>
            NEW MATCH
          </TeletextButton>
          <TeletextButton color="red" onClick={() => onNavigate('P100')}>
            ◄ MAIN MENU
          </TeletextButton>
        </div>
      </TeletextPage>
    )
  }
  
  // Main match screen
  const striker = matchState.striker ? formatBatsman(matchState.striker, true) : null
  const nonStriker = matchState.nonStriker ? formatBatsman(matchState.nonStriker, false) : null
  const currentBowler = matchState.bowler ? formatBowler(matchState.bowler, true) : null
  
  // Get all bowlers who have bowled
  const allBowlers = Array.from(matchState.bowlerStats.keys())
    .map(id => matchState.bowlingTeam.players.find(p => p.id === id))
    .filter(p => p)
    .map(p => formatBowler(p, p.id === matchState.bowler.id))
  
  return (
    <TeletextPage pageNumber="P300" title="THE ASHES 2025 - LIVE">
      <div className="teletext-block teletext-block--yellow">
        <h2 className="teletext-subtitle" style={{ color: '#000000' }}>
          DAY {matchState.day} - {matchState.getSessionName()}
        </h2>
        <div style={{ color: '#000000', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          {matchState.getMatchStatus()}
        </div>
      </div>
      
      {/* Current Score */}
      <div className="teletext-block teletext-block--blue" style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '1.4rem', textAlign: 'center', color: '#FFFF00' }}>
          {matchState.battingTeam.name}: {matchState.score}/{matchState.wickets}
        </div>
        <div style={{ textAlign: 'center', color: '#00FF00', fontSize: '0.9rem' }}>
          ({ballsToOvers(matchState.balls)} OVERS)
        </div>
      </div>
      
      {/* Scorecard */}
      {striker && nonStriker && (
        <TestMatchScorecard
          teamName={matchState.battingTeam.name}
          inningsNumber={matchState.inningsNumber}
          score={matchState.score}
          wickets={matchState.wickets}
          overs={ballsToOvers(matchState.balls)}
          batsmen={[striker, nonStriker]}
          bowlers={allBowlers.slice(0, 5)}
          fallOfWickets={matchState.fallOfWickets.slice(-3)}
        />
      )}
      
      {/* Commentary */}
      <CommentaryFeed commentary={matchState.commentary} maxItems={4} />
      
      {/* Controls */}
      <div className="teletext-block" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <TeletextButton 
            color="green" 
            onClick={handleNextBall}
            disabled={isSimulating}
          >
            NEXT BALL
          </TeletextButton>
          <TeletextButton 
            color="cyan" 
            onClick={handleNextOver}
            disabled={isSimulating}
          >
            NEXT OVER
          </TeletextButton>
          <TeletextButton 
            color="yellow" 
            onClick={handleNextSession}
            disabled={isSimulating}
          >
            NEXT SESSION
          </TeletextButton>
          <TeletextButton 
            color="blue" 
            onClick={handleRestartMatch}
            disabled={isSimulating}
          >
            NEW MATCH
          </TeletextButton>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <TeletextButton color="red" onClick={() => onNavigate('P100')}>
            ◄ BACK TO MAIN MENU
          </TeletextButton>
        </div>
      </div>
    </TeletextPage>
  )
}

export default TestMatchLive
