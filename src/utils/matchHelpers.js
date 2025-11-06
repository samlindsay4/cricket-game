/**
 * Match Helper Utilities
 * 
 * Helper functions for formatting and managing match data for display
 */

import teamsData from '../data/teams.json'
import playersData from '../data/players.json'
import { Player } from '../engine/playerStats.js'

/**
 * Load a team with full player data
 * @param {string} teamId - Team ID to load
 * @returns {Object} Team object with Player instances
 */
export function loadTeam(teamId) {
  const teamData = teamsData.find(t => t.id === teamId)
  if (!teamData) {
    throw new Error(`Team ${teamId} not found`)
  }
  
  // Load players for this team
  const players = teamData.players.map(playerId => {
    const playerData = playersData.find(p => p.id === playerId)
    if (!playerData) {
      console.warn(`Player ${playerId} not found`)
      return null
    }
    return new Player(playerData)
  }).filter(p => p !== null)
  
  return {
    id: teamData.id,
    name: teamData.name,
    shortName: teamData.shortName,
    color: teamData.color,
    players
  }
}

/**
 * Get batsman stats for display
 * @param {Player} batsman - Batsman player instance
 * @param {Map} batsmanStats - Stats map from match state
 * @returns {Object} Formatted batsman stats
 */
export function formatBatsmanStats(batsman, batsmanStats) {
  const stats = batsmanStats.get(batsman.id) || { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }
  return {
    name: batsman.name,
    runs: stats.runs,
    balls: stats.balls,
    fours: stats.fours,
    sixes: stats.sixes,
    strikeRate: stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0',
    isOut: stats.isOut
  }
}

/**
 * Get bowler stats for display
 * @param {Player} bowler - Bowler player instance
 * @param {Map} bowlerStats - Stats map from match state
 * @returns {Object} Formatted bowler stats
 */
export function formatBowlerStats(bowler, bowlerStats) {
  const stats = bowlerStats.get(bowler.id) || { 
    overs: 0, 
    balls: 0, 
    runs: 0, 
    wickets: 0, 
    maidens: 0,
    currentOverBalls: 0
  }
  
  // Calculate overs as string (e.g., "3.2")
  const completedOvers = stats.overs
  const ballsInCurrentOver = stats.currentOverBalls
  const oversStr = ballsInCurrentOver > 0 ? `${completedOvers}.${ballsInCurrentOver}` : `${completedOvers}.0`
  
  return {
    name: bowler.name,
    overs: oversStr,
    maidens: stats.maidens,
    runs: stats.runs,
    wickets: stats.wickets,
    economy: stats.balls > 0 ? ((stats.runs / stats.balls) * 6).toFixed(2) : '0.00'
  }
}

/**
 * Get current partnership info
 * @param {Object} matchState - Current match state
 * @returns {Object} Partnership details
 */
export function getCurrentPartnership(matchState) {
  return {
    runs: matchState.currentPartnership.runs,
    balls: matchState.currentPartnership.balls,
    batsman1: matchState.currentPartnership.batsman1?.name || '',
    batsman2: matchState.currentPartnership.batsman2?.name || ''
  }
}

/**
 * Get fall of wickets formatted
 * @param {Array} fallOfWickets - Fall of wickets array
 * @returns {Array} Formatted fall of wickets
 */
export function formatFallOfWickets(fallOfWickets) {
  return fallOfWickets.map(fow => ({
    batsman: fow.batsman,
    score: `${fow.runs}-${fow.wicket}`,
    over: fow.over
  }))
}

/**
 * Perform toss and decide batting order
 * @returns {Object} Toss result
 */
export function performToss() {
  const tossWinner = Math.random() < 0.5 ? 1 : 2
  const decision = Math.random() < 0.5 ? 'bat' : 'bowl'
  
  return {
    winner: tossWinner,
    decision
  }
}

/**
 * Get match phase description
 * @param {Object} matchState - Current match state
 * @returns {string} Phase description
 */
export function getMatchPhase(matchState) {
  if (!matchState) return 'TOSS'
  
  if (matchState.currentInning === 1) {
    return 'FIRST INNINGS'
  } else if (matchState.currentInning === 2) {
    const target = matchState.innings.first.runs + 1
    const needed = target - matchState.score
    const ballsLeft = (matchState.totalOvers * 6) - matchState.balls
    
    if (needed <= 0) {
      return 'MATCH WON'
    } else if (matchState.wickets >= 10) {
      return 'ALL OUT'
    } else if (ballsLeft <= 0) {
      return 'INNINGS COMPLETE'
    }
    
    return 'SECOND INNINGS - CHASING'
  }
  
  return 'IN PROGRESS'
}

/**
 * Calculate projected score
 * @param {Object} matchState - Current match state
 * @returns {number} Projected final score
 */
export function calculateProjectedScore(matchState) {
  if (matchState.balls === 0) return 0
  
  const currentRunRate = (matchState.score / matchState.balls) * 6
  const totalBalls = matchState.totalOvers * 6
  return Math.round(currentRunRate * (totalBalls / 6))
}

/**
 * Get top batsmen sorted by runs scored
 * @param {Map} batsmanStats - Map of batsman stats
 * @param {Array} players - Array of player objects
 * @param {number} limit - Number of batsmen to return (default 5)
 * @returns {Array} Top batsmen with stats
 */
export function getTopBatsmen(batsmanStats, players, limit = 5) {
  const batsmenWithStats = []
  
  for (const [playerId, stats] of batsmanStats.entries()) {
    const player = players.find(p => p.id === playerId)
    if (player && stats.balls > 0) {
      batsmenWithStats.push({
        name: player.name,
        runs: stats.runs,
        balls: stats.balls,
        fours: stats.fours || 0,
        sixes: stats.sixes || 0,
        isOut: stats.isOut || false
      })
    }
  }
  
  // Sort by runs (descending)
  batsmenWithStats.sort((a, b) => b.runs - a.runs)
  
  return batsmenWithStats.slice(0, limit)
}

/**
 * Get top bowlers sorted by wickets then economy
 * @param {Map} bowlerStats - Map of bowler stats
 * @param {Array} players - Array of player objects
 * @param {number} limit - Number of bowlers to return (default 5)
 * @returns {Array} Top bowlers with stats
 */
export function getTopBowlers(bowlerStats, players, limit = 5) {
  const bowlersWithStats = []
  
  for (const [playerId, stats] of bowlerStats.entries()) {
    const player = players.find(p => p.id === playerId)
    if (player && stats.balls > 0) {
      const overs = Math.floor(stats.balls / 6)
      const ballsInOver = stats.balls % 6
      const oversStr = ballsInOver > 0 ? `${overs}.${ballsInOver}` : `${overs}`
      const economy = ((stats.runs / stats.balls) * 6).toFixed(2)
      
      bowlersWithStats.push({
        name: player.name,
        wickets: stats.wickets || 0,
        runs: stats.runs,
        overs: oversStr,
        economy: parseFloat(economy),
        maidens: stats.maidens || 0
      })
    }
  }
  
  // Sort by wickets (descending), then by economy (ascending)
  bowlersWithStats.sort((a, b) => {
    if (b.wickets !== a.wickets) {
      return b.wickets - a.wickets
    }
    return a.economy - b.economy
  })
  
  return bowlersWithStats.slice(0, limit)
}
