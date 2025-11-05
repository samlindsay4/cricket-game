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
 */

/**
 * Possible ball outcomes
 */
export const BALL_OUTCOMES = {
  DOT: 'dot',
  ONE: '1',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  SIX: '6',
  WICKET: 'wicket',
  WIDE: 'wide',
  NO_BALL: 'no_ball',
  BYE: 'bye',
  LEG_BYE: 'leg_bye'
}

/**
 * Wicket types
 */
export const WICKET_TYPES = {
  BOWLED: 'bowled',
  CAUGHT: 'caught',
  LBW: 'lbw',
  RUN_OUT: 'run_out',
  STUMPED: 'stumped',
  HIT_WICKET: 'hit_wicket'
}

/**
 * Match state structure
 */
export class MatchState {
  constructor(team1, team2, overs = 20) {
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
    this.innings = {
      first: { runs: 0, wickets: 0, overs: 0 },
      second: { runs: 0, wickets: 0, overs: 0 }
    }
  }

  /**
   * Get current over number (e.g., 3.2 means 3 overs and 2 balls)
   */
  getCurrentOver() {
    const completedOvers = Math.floor(this.balls / 6)
    const ballsInOver = this.balls % 6
    return `${completedOvers}.${ballsInOver}`
  }

  /**
   * Check if innings is complete
   */
  isInningsComplete() {
    return this.wickets >= 10 || this.balls >= this.totalOvers * 6
  }

  /**
   * Switch innings
   */
  switchInnings() {
    this.currentInning = 2
    this.innings.first.runs = this.score
    this.innings.first.wickets = this.wickets
    this.innings.first.overs = this.getCurrentOver()
    
    // Swap teams
    const temp = this.battingTeam
    this.battingTeam = this.bowlingTeam
    this.bowlingTeam = temp
    
    // Reset innings stats
    this.score = 0
    this.wickets = 0
    this.balls = 0
  }
}

/**
 * Simulate a single ball
 * @param {MatchState} matchState - Current match state
 * @param {Object} probabilityEngine - Probability calculation engine
 * @returns {Object} Ball result with outcome, runs, wicket info, commentary
 */
export function simulateBall(matchState, probabilityEngine) {
  // This is a placeholder - actual implementation would use probabilityEngine
  // to calculate realistic outcomes based on player stats
  
  const outcome = probabilityEngine.calculateBallOutcome(
    matchState.striker,
    matchState.bowler,
    matchState
  )
  
  // Update match state based on outcome
  if (outcome.isWicket) {
    matchState.wickets++
  }
  
  if (outcome.isLegalDelivery) {
    matchState.balls++
  }
  
  matchState.score += outcome.runs
  matchState.commentary.push(outcome.commentary)
  
  return outcome
}

/**
 * Simulate an entire over
 * @param {MatchState} matchState
 * @param {Object} probabilityEngine
 * @returns {Array} Array of ball results
 */
export function simulateOver(matchState, probabilityEngine) {
  const overResults = []
  let ballsInOver = 0
  
  while (ballsInOver < 6 && !matchState.isInningsComplete()) {
    const result = simulateBall(matchState, probabilityEngine)
    overResults.push(result)
    
    // Extras don't count towards the over
    if (result.isLegalDelivery) {
      ballsInOver++
    }
    
    // Check for wicket
    if (result.isWicket && matchState.isInningsComplete()) {
      break
    }
  }
  
  return overResults
}

/**
 * Simulate an entire innings
 * @param {MatchState} matchState
 * @param {Object} probabilityEngine
 * @returns {Object} Innings summary
 */
export function simulateInnings(matchState, probabilityEngine) {
  while (!matchState.isInningsComplete()) {
    simulateOver(matchState, probabilityEngine)
  }
  
  return {
    runs: matchState.score,
    wickets: matchState.wickets,
    overs: matchState.getCurrentOver(),
    commentary: matchState.commentary
  }
}

/**
 * Simulate entire match
 * @param {Object} team1
 * @param {Object} team2
 * @param {Object} options - Match options (overs, conditions, etc.)
 * @returns {Object} Complete match result
 */
export function simulateMatch(team1, team2, options = {}) {
  const overs = options.overs || 20
  const matchState = new MatchState(team1, team2, overs)
  
  // Placeholder for probability engine
  // In full implementation, this would be imported from probabilityEngine.js
  const probabilityEngine = {
    calculateBallOutcome: () => ({
      outcome: BALL_OUTCOMES.DOT,
      runs: 0,
      isWicket: false,
      isLegalDelivery: true,
      commentary: 'Dot ball'
    })
  }
  
  // Simulate first innings
  const firstInnings = simulateInnings(matchState, probabilityEngine)
  matchState.switchInnings()
  
  // Simulate second innings
  const secondInnings = simulateInnings(matchState, probabilityEngine)
  
  // Determine result
  const result = determineMatchResult(matchState)
  
  return {
    team1: team1.name,
    team2: team2.name,
    innings: {
      first: firstInnings,
      second: secondInnings
    },
    result
  }
}

/**
 * Determine match result
 */
function determineMatchResult(matchState) {
  const team1Score = matchState.innings.first.runs
  const team2Score = matchState.innings.second.runs
  
  if (team2Score > team1Score) {
    return {
      winner: matchState.battingTeam.name,
      margin: `by ${10 - matchState.wickets} wickets`
    }
  } else if (team1Score > team2Score) {
    return {
      winner: matchState.bowlingTeam.name,
      margin: `by ${team1Score - team2Score} runs`
    }
  } else {
    return {
      winner: null,
      margin: 'Match tied'
    }
  }
}

export default {
  simulateBall,
  simulateOver,
  simulateInnings,
  simulateMatch,
  MatchState,
  BALL_OUTCOMES,
  WICKET_TYPES
}
