/**
 * Match Simulator - Ball-by-ball cricket match simulation engine
 * 
 * This module handles the core match simulation logic, including:
 * - Ball-by-ball outcomes (runs, wickets, extras)
 * - Over management
 * - Innings transitions
 * - Match result determination
 * 
 * Approach:
 * - Uses probabilistic model based on player stats and match conditions
 * - Simulates realistic cricket scenarios including edges, lbws, run-outs
 * - Tracks detailed match statistics for both teams
 * 
 * Realism Principles:
 * 1. Probability-based outcomes using weighted player stats
 * 2. Dynamic confidence and momentum tracking
 * 3. Fatigue modeling for bowlers and batsmen
 * 4. Situational awareness (required run rate, match pressure)
 * 5. Player matchups (pace vs technique, spin vs footwork)
 */

import { ProbabilityEngine } from './probabilityEngine.js';
import { Player, PLAYER_ROLES } from './playerStats.js';
import { MatchConditions } from './matchConditions.js';
import { generateOverSummary, generateInningsSummary, generateMatchResult, generateMilestone } from './commentaryGenerator.js';
import { formatScore, ballsToOvers, isMatchComplete, getMatchWinner, checkMilestone } from './matchUtils.js';
import { BALL_OUTCOMES, WICKET_TYPES } from './matchConstants.js';

// Re-export constants for backward compatibility
export { BALL_OUTCOMES, WICKET_TYPES };

/**
 * Match state structure
 */
export class MatchState {
  constructor(team1, team2, overs = 20, conditions = null) {
    this.team1 = team1
    this.team2 = team2
    this.totalOvers = overs
    this.currentInning = 1
    this.battingTeam = team1
    this.bowlingTeam = team2
    this.score = 0
    this.wickets = 0
    this.balls = 0
    this.striker = null
    this.nonStriker = null
    this.bowler = null
    this.commentary = []
    this.fallOfWickets = [] // Track when wickets fell
    this.partnerships = [] // Track partnerships
    this.currentPartnership = { runs: 0, balls: 0, batsman1: null, batsman2: null }
    this.batsmen = [] // Track batsman order
    this.bowlers = [] // Track bowler statistics
    this.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
    this.innings = {
      first: { runs: 0, wickets: 0, overs: 0, extras: 0, fallOfWickets: [], commentary: [] },
      second: { runs: 0, wickets: 0, overs: 0, extras: 0, fallOfWickets: [], commentary: [] }
    }
    this.conditions = conditions || MatchConditions.generateRandom('T20')
    this.batsmanStats = new Map() // Track individual batsman stats
    this.bowlerStats = new Map() // Track individual bowler stats
  }

  /**
   * Get current over number (e.g., 3.2 means 3 overs and 2 balls)
   */
  getCurrentOver() {
    return ballsToOvers(this.balls)
  }

  /**
   * Check if innings is complete
   */
  isInningsComplete() {
    return this.wickets >= 10 || this.balls >= this.totalOvers * 6
  }

  /**
   * Initialize batsmen for new innings
   */
  initializeBatsmen(players) {
    this.batsmen = [...players]
    this.striker = this.batsmen[0]
    this.nonStriker = this.batsmen[1]
    this.currentPartnership = {
      runs: 0,
      balls: 0,
      batsman1: this.striker,
      batsman2: this.nonStriker
    }
    
    // Initialize stats for batsmen
    this.batsmanStats.set(this.striker.id, { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false })
    this.batsmanStats.set(this.nonStriker.id, { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false })
  }

  /**
   * Get next batsman
   */
  getNextBatsman() {
    const nextBatsmanIndex = this.batsmen.findIndex(b => !this.batsmanStats.has(b.id))
    if (nextBatsmanIndex !== -1) {
      const nextBatsman = this.batsmen[nextBatsmanIndex]
      this.batsmanStats.set(nextBatsman.id, { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false })
      return nextBatsman
    }
    return null
  }

  /**
   * Handle wicket - bring in new batsman
   */
  handleWicket(batsmanOut, runs, wicketType = null, bowler = null, fielder = null) {
    // Record fall of wicket
    this.fallOfWickets.push({
      batsman: batsmanOut.name,
      runs: this.score,
      wicket: this.wickets,
      over: this.getCurrentOver()
    })
    
    // Mark batsman as out and record dismissal
    const stats = this.batsmanStats.get(batsmanOut.id)
    if (stats) {
      stats.isOut = true
      
      // Format dismissal text
      if (wicketType && bowler) {
        switch (wicketType) {
          case 'bowled':
            stats.howOut = `b ${bowler.name}`
            break
          case 'caught':
            stats.howOut = fielder ? `c ${fielder} b ${bowler.name}` : `c & b ${bowler.name}`
            break
          case 'lbw':
            stats.howOut = `lbw b ${bowler.name}`
            break
          case 'stumped':
            stats.howOut = fielder ? `st ${fielder} b ${bowler.name}` : `stumped`
            break
          case 'runOut':
            stats.howOut = fielder ? `run out (${fielder})` : 'run out'
            break
          case 'hitWicket':
            stats.howOut = `hit wicket b ${bowler.name}`
            break
          default:
            stats.howOut = bowler ? `b ${bowler.name}` : 'out'
        }
      } else {
        stats.howOut = 'out'
      }
    }
    
    // Save partnership
    if (this.currentPartnership.runs > 0) {
      this.partnerships.push({ ...this.currentPartnership })
    }
    
    // Get next batsman
    const nextBatsman = this.getNextBatsman()
    if (nextBatsman) {
      if (batsmanOut === this.striker) {
        this.striker = nextBatsman
      } else {
        this.nonStriker = nextBatsman
      }
      
      // Start new partnership
      this.currentPartnership = {
        runs: 0,
        balls: 0,
        batsman1: this.striker,
        batsman2: this.nonStriker
      }
    }
  }

  /**
   * Rotate strike
   */
  rotateStrike() {
    const temp = this.striker
    this.striker = this.nonStriker
    this.nonStriker = temp
  }

  /**
   * Update batsman stats
   */
  updateBatsmanStats(batsman, runs, isBoundary = false) {
    const stats = this.batsmanStats.get(batsman.id)
    if (stats) {
      stats.runs += runs
      stats.balls += 1
      if (runs === 4) stats.fours += 1
      if (runs === 6) stats.sixes += 1
    }
    
    // Update partnership
    this.currentPartnership.runs += runs
    this.currentPartnership.balls += 1
  }

  /**
   * Get or initialize bowler stats
   */
  getBowlerStats(bowler) {
    if (!this.bowlerStats.has(bowler.id)) {
      this.bowlerStats.set(bowler.id, {
        overs: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
        maidens: 0,
        wides: 0,
        noBalls: 0,
        currentOverRuns: 0,
        currentOverBalls: 0
      })
    }
    return this.bowlerStats.get(bowler.id)
  }

  /**
   * Update bowler stats
   */
  updateBowlerStats(bowler, runs, isWicket, isLegalDelivery) {
    const stats = this.getBowlerStats(bowler)
    
    stats.runs += runs
    if (isWicket) stats.wickets += 1
    
    if (isLegalDelivery) {
      stats.balls += 1
      stats.currentOverBalls += 1
      stats.currentOverRuns += runs
      
      // Check if over is complete
      if (stats.currentOverBalls === 6) {
        stats.overs += 1
        if (stats.currentOverRuns === 0) stats.maidens += 1
        stats.currentOverRuns = 0
        stats.currentOverBalls = 0
      }
    } else {
      // Track extras
      if (runs === 1) {
        // Could be wide or no ball
        stats.wides += 1
      }
    }
  }

  /**
   * Switch innings
   */
  switchInnings() {
    // Save first innings data
    this.innings.first = {
      runs: this.score,
      wickets: this.wickets,
      overs: this.getCurrentOver(),
      extras: this.extras.wides + this.extras.noBalls + this.extras.byes + this.extras.legByes,
      fallOfWickets: [...this.fallOfWickets],
      commentary: [...this.commentary]
    }
    
    this.currentInning = 2
    
    // Swap teams
    const temp = this.battingTeam
    this.battingTeam = this.bowlingTeam
    this.bowlingTeam = temp
    
    // Reset innings stats
    this.score = 0
    this.wickets = 0
    this.balls = 0
    this.commentary = []
    this.fallOfWickets = []
    this.partnerships = []
    this.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 }
    this.batsmanStats.clear()
    this.bowlerStats.clear()
    
    // Update pitch conditions (wear)
    this.conditions.updatePitchWear(this.totalOvers)
  }
}

/**
 * Simulate a single ball
 * @param {MatchState} matchState - Current match state
 * @param {ProbabilityEngine} probabilityEngine - Probability calculation engine
 * @returns {Object} Ball result with outcome, runs, wicket info, commentary
 */
export function simulateBall(matchState, probabilityEngine) {
  if (!matchState.striker || !matchState.bowler) {
    throw new Error('Striker and bowler must be set before simulating a ball')
  }
  
  // Calculate outcome using probability engine
  const outcome = probabilityEngine.calculateBallOutcome(
    matchState.striker,
    matchState.bowler,
    matchState
  )
  
  // Store previous runs for milestone check
  const strikerStats = matchState.batsmanStats.get(matchState.striker.id)
  const previousRuns = strikerStats ? strikerStats.runs : 0
  
  // Update match state based on outcome
  if (outcome.isWicket) {
    matchState.wickets++
    matchState.handleWicket(matchState.striker, matchState.score)
    
    // Update player confidence after getting out
    matchState.striker.confidence = Math.max(20, matchState.striker.confidence - 10)
    
    // Update bowler confidence after taking wicket
    matchState.bowler.confidence = Math.min(100, matchState.bowler.confidence + 15)
  } else {
    // Update batsman stats if legal delivery
    if (outcome.isLegalDelivery) {
      matchState.updateBatsmanStats(matchState.striker, outcome.runs, outcome.runs >= 4)
      
      // Check for batting milestone
      if (strikerStats) {
        const milestone = checkMilestone(previousRuns, strikerStats.runs)
        if (milestone) {
          const milestoneCommentary = generateMilestone(matchState.striker, milestone, 'runs')
          matchState.commentary.push(milestoneCommentary)
          
          // Boost batsman confidence on milestone
          matchState.striker.confidence = Math.min(100, matchState.striker.confidence + 10)
        }
      }
      
      // Rotate strike on odd runs
      if (outcome.runs % 2 === 1) {
        matchState.rotateStrike()
      }
      
      // Update confidence based on outcome
      if (outcome.runs >= 4) {
        matchState.striker.confidence = Math.min(100, matchState.striker.confidence + 5)
      }
    }
  }
  
  // Update bowler stats
  matchState.updateBowlerStats(matchState.bowler, outcome.runs, outcome.isWicket, outcome.isLegalDelivery)
  
  // Track balls and score
  if (outcome.isLegalDelivery) {
    matchState.balls++
  }
  
  matchState.score += outcome.runs
  
  // Track extras
  if (!outcome.isLegalDelivery) {
    if (outcome.outcome === 'wide') {
      matchState.extras.wides++
    } else if (outcome.outcome === 'no_ball') {
      matchState.extras.noBalls++
    }
  }
  
  matchState.commentary.push(outcome.commentary)
  
  // Apply fatigue to bowler
  if (outcome.isLegalDelivery && matchState.bowler.fitness > 50) {
    const bowlerStats = matchState.getBowlerStats(matchState.bowler)
    if (bowlerStats.balls % 12 === 0) { // Every 2 overs
      matchState.bowler.fitness = Math.max(50, matchState.bowler.fitness - 2)
    }
  }
  
  return outcome
}

/**
 * Simulate an entire over
 * @param {MatchState} matchState
 * @param {ProbabilityEngine} probabilityEngine
 * @returns {Array} Array of ball results
 */
export function simulateOver(matchState, probabilityEngine) {
  const overResults = []
  const overNumber = Math.floor(matchState.balls / 6) + 1
  let ballsInOver = 0
  
  while (ballsInOver < 6 && !matchState.isInningsComplete()) {
    const result = simulateBall(matchState, probabilityEngine)
    overResults.push(result)
    
    // Extras don't count towards the over
    if (result.isLegalDelivery) {
      ballsInOver++
    }
    
    // Check for wicket - stop if all out
    if (result.isWicket && matchState.isInningsComplete()) {
      break
    }
  }
  
  // Generate over summary
  if (overResults.length > 0) {
    const overSummary = generateOverSummary(overResults, matchState.bowler, overNumber)
    matchState.commentary.push(overSummary)
  }
  
  // Rotate strike at end of over
  if (ballsInOver === 6 && !matchState.isInningsComplete()) {
    matchState.rotateStrike()
  }
  
  return overResults
}

/**
 * Simulate an entire innings
 * @param {MatchState} matchState
 * @param {ProbabilityEngine} probabilityEngine
 * @param {Array} bowlers - Array of bowlers to rotate
 * @returns {Object} Innings summary
 */
export function simulateInnings(matchState, probabilityEngine, bowlers) {
  let currentBowlerIndex = 0
  let oversBowledByCurrentBowler = 0
  const maxOversPerBowler = Math.floor(matchState.totalOvers / 5) // In T20, max 4 overs per bowler
  
  // Set initial bowler
  matchState.bowler = bowlers[currentBowlerIndex]
  
  while (!matchState.isInningsComplete()) {
    simulateOver(matchState, probabilityEngine)
    oversBowledByCurrentBowler++
    
    // Rotate bowler (can't bowl consecutive overs, max overs per bowler)
    if (oversBowledByCurrentBowler >= maxOversPerBowler || !matchState.isInningsComplete()) {
      currentBowlerIndex = (currentBowlerIndex + 1) % bowlers.length
      matchState.bowler = bowlers[currentBowlerIndex]
      oversBowledByCurrentBowler = 0
    }
    
    // Update conditions as match progresses
    if (matchState.currentInning === 2) {
      const oversPlayed = Math.floor(matchState.balls / 6)
      matchState.conditions.updateDewFactor(oversPlayed)
    }
  }
  
  // Generate innings summary commentary
  const inningsSummary = generateInningsSummary(
    { runs: matchState.score, wickets: matchState.wickets, overs: matchState.getCurrentOver() },
    matchState.battingTeam.name
  )
  matchState.commentary.push(inningsSummary)
  
  return {
    runs: matchState.score,
    wickets: matchState.wickets,
    overs: matchState.getCurrentOver(),
    extras: matchState.extras,
    fallOfWickets: matchState.fallOfWickets,
    partnerships: matchState.partnerships,
    batsmanStats: Array.from(matchState.batsmanStats.entries()).map(([id, stats]) => ({ id, ...stats })),
    bowlerStats: Array.from(matchState.bowlerStats.entries()).map(([id, stats]) => ({ id, ...stats })),
    commentary: matchState.commentary
  }
}

/**
 * Simulate entire match
 * @param {Object} team1 - Team 1 with players array
 * @param {Object} team2 - Team 2 with players array
 * @param {Object} options - Match options (overs, conditions, etc.)
 * @returns {Object} Complete match result
 */
export function simulateMatch(team1, team2, options = {}) {
  const overs = options.overs || 20
  const conditions = options.conditions || MatchConditions.generateRandom('T20')
  const matchState = new MatchState(team1, team2, overs, conditions)
  
  // Create probability engine with match conditions
  const probabilityEngine = new ProbabilityEngine(conditions)
  
  // Initialize first innings batsmen (team1)
  matchState.initializeBatsmen(team1.players)
  
  // Get bowlers from team2
  const team2Bowlers = team2.players.filter(p => 
    p.role === PLAYER_ROLES.BOWLER || p.role === PLAYER_ROLES.ALL_ROUNDER
  ).slice(0, 5) // Take first 5 bowlers
  
  // Simulate first innings
  const firstInnings = simulateInnings(matchState, probabilityEngine, team2Bowlers)
  
  // Switch innings
  matchState.switchInnings()
  
  // Initialize second innings batsmen (team2)
  matchState.initializeBatsmen(team2.players)
  
  // Get bowlers from team1
  const team1Bowlers = team1.players.filter(p => 
    p.role === PLAYER_ROLES.BOWLER || p.role === PLAYER_ROLES.ALL_ROUNDER
  ).slice(0, 5)
  
  // Simulate second innings
  const secondInnings = simulateInnings(matchState, probabilityEngine, team1Bowlers)
  
  // Determine result
  const result = getMatchWinner(matchState)
  
  // Generate match result commentary
  const resultCommentary = generateMatchResult(result)
  
  return {
    team1: team1.name,
    team2: team2.name,
    conditions: conditions.getDescription(),
    innings: {
      first: firstInnings,
      second: secondInnings
    },
    result,
    resultCommentary,
    matchState // Include full state for detailed analysis
  }
}

/**
 * Start a new match and return initial state
 * @param {Object} team1
 * @param {Object} team2
 * @param {Object} options
 * @returns {MatchState} Initial match state
 */
export function startMatch(team1, team2, options = {}) {
  const overs = options.overs || 20
  const conditions = options.conditions || MatchConditions.generateRandom('T20')
  const matchState = new MatchState(team1, team2, overs, conditions)
  
  // Initialize batsmen
  matchState.initializeBatsmen(team1.players)
  
  return matchState
}

/**
 * Get match summary/scorecard
 * @param {MatchState} matchState
 * @returns {Object} Match summary
 */
export function getMatchSummary(matchState) {
  return {
    team1: matchState.team1.name,
    team2: matchState.team2.name,
    currentInning: matchState.currentInning,
    score: formatScore(matchState.score, matchState.wickets, matchState.balls),
    innings: matchState.innings,
    conditions: matchState.conditions.getDescription(),
    isComplete: isMatchComplete(matchState),
    result: isMatchComplete(matchState) ? getMatchWinner(matchState) : null
  }
}

export default {
  simulateBall,
  simulateOver,
  simulateInnings,
  simulateMatch,
  startMatch,
  getMatchSummary,
  MatchState,
  BALL_OUTCOMES,
  WICKET_TYPES
}
