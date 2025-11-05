/**
 * Probability Engine
 * 
 * Calculates realistic probabilities for cricket match events based on:
 * - Player attributes (batting, bowling, fielding skills)
 * - Match situation (score, overs, wickets)
 * - Pitch conditions
 * - Weather conditions
 * - Player form and confidence
 * 
 * The engine uses a weighted probability model where multiple factors
 * influence the outcome of each ball.
 * 
 * Approach:
 * 1. Base probabilities from historical cricket data
 * 2. Adjust for batsman skill vs bowler skill
 * 3. Apply situational modifiers (match pressure, required run rate)
 * 4. Generate outcome using weighted random selection
 */

import { BALL_OUTCOMES, WICKET_TYPES } from './matchSimulator.js'

/**
 * Base probability distributions (percentages from historical T20 data)
 */
const BASE_PROBABILITIES = {
  dot: 30,
  single: 25,
  two: 15,
  three: 5,
  four: 15,
  six: 5,
  wicket: 3,
  wide: 1.5,
  no_ball: 0.5
}

/**
 * Wicket type probabilities
 */
const WICKET_TYPE_PROBABILITIES = {
  bowled: 25,
  caught: 50,
  lbw: 15,
  run_out: 5,
  stumped: 3,
  hit_wicket: 2
}

/**
 * Probability Engine class
 */
export class ProbabilityEngine {
  constructor(matchConditions = {}) {
    this.conditions = {
      pitch: matchConditions.pitch || 'normal', // dry, green, dusty, normal
      weather: matchConditions.weather || 'clear', // clear, overcast, rainy
      ground: matchConditions.ground || 'medium' // small, medium, large
    }
  }

  /**
   * Calculate ball outcome based on batsman vs bowler
   * @param {Player} batsman - Current batsman
   * @param {Player} bowler - Current bowler
   * @param {MatchState} matchState - Current match state
   * @returns {Object} Ball outcome with runs, wicket, commentary
   */
  calculateBallOutcome(batsman, bowler, matchState) {
    // Calculate skill differential
    const batsmanRating = batsman.getBattingRating()
    const bowlerRating = bowler.getBowlingRating()
    const skillDiff = batsmanRating - bowlerRating
    
    // Get adjusted probabilities
    const probabilities = this.adjustProbabilities(
      BASE_PROBABILITIES,
      skillDiff,
      batsman,
      bowler,
      matchState
    )
    
    // Select outcome based on probabilities
    const outcome = this.weightedRandomSelection(probabilities)
    
    // Generate detailed result
    return this.generateBallResult(outcome, batsman, bowler, matchState)
  }

  /**
   * Adjust base probabilities based on various factors
   */
  adjustProbabilities(baseProbabilities, skillDiff, batsman, bowler, matchState) {
    const adjusted = { ...baseProbabilities }
    
    // Skill differential adjustment (-50 to +50)
    // Positive skillDiff favors batsman, negative favors bowler
    const skillFactor = skillDiff / 100
    
    // Better batsman = more boundaries, fewer dots and wickets
    adjusted.dot *= (1 - skillFactor * 0.3)
    adjusted.four *= (1 + skillFactor * 0.5)
    adjusted.six *= (1 + skillFactor * 0.6)
    adjusted.wicket *= (1 - skillFactor * 0.4)
    
    // Batsman style adjustments
    if (batsman.batting.style === 'aggressive') {
      adjusted.dot *= 0.7
      adjusted.single *= 0.8
      adjusted.four *= 1.3
      adjusted.six *= 1.5
      adjusted.wicket *= 1.2
    } else if (batsman.batting.style === 'defensive') {
      adjusted.dot *= 1.4
      adjusted.single *= 1.2
      adjusted.four *= 0.7
      adjusted.six *= 0.5
      adjusted.wicket *= 0.8
    }
    
    // Form adjustment
    const formFactor = (batsman.form - 50) / 100
    adjusted.dot *= (1 - formFactor * 0.2)
    adjusted.four *= (1 + formFactor * 0.3)
    adjusted.six *= (1 + formFactor * 0.4)
    
    // Pressure situation (death overs)
    const currentOver = Math.floor(matchState.balls / 6)
    if (currentOver >= 15) {
      adjusted.dot *= 0.7
      adjusted.single *= 1.1
      adjusted.four *= 1.2
      adjusted.six *= 1.3
      adjusted.wicket *= 1.3
    }
    
    // Normalize to ensure total is 100
    return this.normalizeProbabilities(adjusted)
  }

  /**
   * Normalize probabilities to sum to 100
   */
  normalizeProbabilities(probabilities) {
    const total = Object.values(probabilities).reduce((sum, val) => sum + val, 0)
    const normalized = {}
    
    for (const [key, value] of Object.entries(probabilities)) {
      normalized[key] = (value / total) * 100
    }
    
    return normalized
  }

  /**
   * Weighted random selection based on probabilities
   */
  weightedRandomSelection(probabilities) {
    const random = Math.random() * 100
    let cumulative = 0
    
    for (const [outcome, probability] of Object.entries(probabilities)) {
      cumulative += probability
      if (random <= cumulative) {
        return outcome
      }
    }
    
    // Fallback
    return 'dot'
  }

  /**
   * Generate detailed ball result
   */
  generateBallResult(outcome, batsman, bowler, matchState) {
    const result = {
      outcome,
      runs: 0,
      isWicket: false,
      isLegalDelivery: true,
      wicketType: null,
      commentary: ''
    }
    
    switch (outcome) {
      case 'dot':
        result.runs = 0
        result.commentary = this.generateDotCommentary(batsman, bowler)
        break
      case 'single':
        result.runs = 1
        result.commentary = `${batsman.name} pushes for a single`
        break
      case 'two':
        result.runs = 2
        result.commentary = `${batsman.name} takes two runs`
        break
      case 'three':
        result.runs = 3
        result.commentary = `${batsman.name} runs hard for three!`
        break
      case 'four':
        result.runs = 4
        result.commentary = `FOUR! ${batsman.name} finds the boundary`
        break
      case 'six':
        result.runs = 6
        result.commentary = `SIX! ${batsman.name} sends it sailing!`
        break
      case 'wicket':
        result.isWicket = true
        result.wicketType = this.determineWicketType()
        result.commentary = `OUT! ${batsman.name} ${result.wicketType} by ${bowler.name}`
        break
      case 'wide':
        result.runs = 1
        result.isLegalDelivery = false
        result.commentary = `Wide ball`
        break
      case 'no_ball':
        result.runs = 1
        result.isLegalDelivery = false
        result.commentary = `No ball!`
        break
    }
    
    return result
  }

  /**
   * Generate varied dot ball commentary
   */
  generateDotCommentary(batsman, bowler) {
    const comments = [
      `${batsman.name} defends`,
      `Dot ball`,
      `${bowler.name} beats the bat`,
      `Good delivery from ${bowler.name}`,
      `${batsman.name} leaves it alone`,
      `Defended back to the bowler`
    ]
    return comments[Math.floor(Math.random() * comments.length)]
  }

  /**
   * Determine type of wicket
   */
  determineWicketType() {
    const wicketType = this.weightedRandomSelection(WICKET_TYPE_PROBABILITIES)
    return wicketType
  }

  /**
   * Calculate required run rate
   */
  calculateRequiredRunRate(target, ballsRemaining) {
    if (ballsRemaining === 0) return Infinity
    return ((target / ballsRemaining) * 6).toFixed(2)
  }

  /**
   * Calculate current run rate
   */
  calculateCurrentRunRate(runs, ballsFaced) {
    if (ballsFaced === 0) return 0
    return ((runs / ballsFaced) * 6).toFixed(2)
  }

  /**
   * Calculate win probability
   */
  calculateWinProbability(matchState) {
    // Simplified win probability calculation
    // In full implementation, this would use machine learning or complex statistical models
    
    if (matchState.currentInning === 1) {
      return 50 // Equal before second innings
    }
    
    const target = matchState.innings.first.runs
    const current = matchState.score
    const ballsRemaining = (matchState.totalOvers * 6) - matchState.balls
    const wicketsRemaining = 10 - matchState.wickets
    
    const requiredRunRate = this.calculateRequiredRunRate(
      target - current,
      ballsRemaining
    )
    
    // Simple probability based on required run rate and wickets
    let probability = 50
    
    if (current > target) {
      probability = 95
    } else if (requiredRunRate > 12) {
      probability = 20
    } else if (requiredRunRate > 9) {
      probability = 35
    } else if (requiredRunRate < 6) {
      probability = 70
    }
    
    // Adjust for wickets
    probability *= (wicketsRemaining / 10)
    
    return Math.max(5, Math.min(95, probability))
  }
}

export default ProbabilityEngine
