/**
 * Test Cricket Probability Engine
 * 
 * Calculates realistic probabilities for Test cricket match events
 * Different from T20 - more defensive, patient batting
 * 
 * Test cricket characteristics:
 * - More dot balls (~60% vs 30% in T20)
 * - More singles and rotating strike (~28% vs 25% in T20)
 * - Fewer boundaries (~7% vs 15% in T20)
 * - Rare sixes (~1% vs 5% in T20)
 * - Lower wicket probability (~4% vs 3% in T20, but over more balls)
 */

import { BALL_OUTCOMES, WICKET_TYPES } from './matchConstants.js';
import { generateCommentary } from './commentaryGenerator.js';

/**
 * Base probability distributions for Test cricket
 * More conservative than T20
 */
const TEST_BASE_PROBABILITIES = {
  dot: 60,
  single: 20,
  two: 8,
  three: 2,
  four: 7,
  six: 1,
  wicket: 4,
  wide: 1.5,
  no_ball: 0.5
}

/**
 * Wicket type probabilities for Test cricket
 * More caught, bowled, and LBW than T20
 */
const TEST_WICKET_TYPE_PROBABILITIES = {
  bowled: 28,
  caught: 55,
  lbw: 12,
  run_out: 2,
  stumped: 2,
  hit_wicket: 1
}

/**
 * Test Cricket Probability Engine class
 */
export class TestProbabilityEngine {
  constructor(matchConditions = null) {
    this.matchConditions = matchConditions;
  }

  /**
   * Calculate ball outcome based on batsman vs bowler in Test cricket
   * @param {Player} batsman - Current batsman
   * @param {Player} bowler - Current bowler
   * @param {TestMatchState} matchState - Current match state
   * @returns {Object} Ball outcome with runs, wicket, commentary
   */
  calculateBallOutcome(batsman, bowler, matchState) {
    // Calculate skill differential
    const batsmanRating = batsman.getBattingRating()
    const bowlerRating = bowler.getBowlingRating()
    const skillDiff = batsmanRating - bowlerRating
    
    // Get adjusted probabilities
    const probabilities = this.adjustProbabilities(
      TEST_BASE_PROBABILITIES,
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
    const skillFactor = skillDiff / 100
    
    // Better batsman = slightly more boundaries, fewer dots and wickets
    // Test cricket is less extreme than T20
    adjusted.dot *= (1 - skillFactor * 0.2)
    adjusted.four *= (1 + skillFactor * 0.3)
    adjusted.six *= (1 + skillFactor * 0.4)
    adjusted.wicket *= (1 - skillFactor * 0.3)
    
    // Batsman style adjustments (less pronounced in Tests)
    if (batsman.batting.style === 'aggressive') {
      adjusted.dot *= 0.85
      adjusted.single *= 0.95
      adjusted.four *= 1.2
      adjusted.six *= 1.4
      adjusted.wicket *= 1.15
    } else if (batsman.batting.style === 'defensive') {
      adjusted.dot *= 1.2
      adjusted.single *= 1.15
      adjusted.four *= 0.8
      adjusted.six *= 0.6
      adjusted.wicket *= 0.85
    }
    
    // Test-specific: Patience and concentration matter more
    const patienceFactor = (batsman.patience || 70) / 100
    adjusted.dot *= (0.9 + patienceFactor * 0.2)
    adjusted.wicket *= (1.1 - patienceFactor * 0.2)
    
    // Concentration affects likelihood of getting out
    const concentrationFactor = (batsman.concentration || 70) / 100
    adjusted.wicket *= (1.15 - concentrationFactor * 0.3)
    
    // Form adjustment (less pronounced than T20)
    const formFactor = (batsman.form - 50) / 100
    adjusted.dot *= (1 - formFactor * 0.1)
    adjusted.four *= (1 + formFactor * 0.2)
    adjusted.six *= (1 + formFactor * 0.25)
    
    // Confidence adjustment
    const confidenceFactor = (batsman.confidence - 50) / 100
    adjusted.wicket *= (1 - confidenceFactor * 0.2)
    adjusted.four *= (1 + confidenceFactor * 0.15)
    
    // Match conditions adjustments
    if (this.matchConditions) {
      const conditionMods = this.matchConditions.getAllModifiers()
      const pitchMods = conditionMods.pitch
      const groundMods = conditionMods.ground
      
      // Apply pitch modifiers
      adjusted.dot *= pitchMods.dot
      adjusted.single *= pitchMods.single
      adjusted.four *= pitchMods.boundaries * groundMods.four_probability
      adjusted.six *= pitchMods.boundaries * groundMods.six_probability
      adjusted.wicket *= pitchMods.wickets
      adjusted.two *= groundMods.two_runs
      adjusted.three *= groundMods.three_runs
      
      // Apply bowling effectiveness
      const bowlingEff = this.matchConditions.getBowlingEffectiveness(bowler.bowling.style)
      adjusted.wicket *= bowlingEff
      adjusted.dot *= bowlingEff
      adjusted.four *= (2 - bowlingEff)
      adjusted.six *= (2 - bowlingEff)
    }
    
    // Day and session effects (Test cricket specific)
    if (matchState.day && matchState.session) {
      // Morning session (new ball, fresh bowlers)
      if (matchState.session === 1) {
        adjusted.wicket *= 1.15
        adjusted.dot *= 1.1
        adjusted.four *= 0.95
      }
      
      // Evening session (tired bowlers, wearing ball)
      if (matchState.session === 3) {
        adjusted.wicket *= 0.95
        adjusted.dot *= 0.95
        adjusted.four *= 1.05
      }
      
      // Day 4-5: Pitch deterioration helps spinners
      if (matchState.day >= 4) {
        if (bowler.bowling.style && bowler.bowling.style.includes('spin')) {
          adjusted.wicket *= 1.2
          adjusted.dot *= 1.1
        }
      }
    }
    
    // Innings effects
    if (matchState.inningsNumber >= 3) {
      // Later innings, pitch more worn
      adjusted.wicket *= 1.05
    }
    
    // New ball effects (first 10 overs or after 80 overs)
    const currentOver = Math.floor(matchState.balls / 6)
    const ballAge = currentOver % 80
    if (ballAge < 10) {
      // New ball helps pace bowlers
      if (bowler.bowling.style === 'fast' || bowler.bowling.style === 'fast_medium') {
        adjusted.wicket *= 1.2
        adjusted.dot *= 1.1
        adjusted.four *= 0.95
      }
    } else if (ballAge > 50) {
      // Old ball helps spinners, harder for pace
      if (bowler.bowling.style && bowler.bowling.style.includes('spin')) {
        adjusted.wicket *= 1.1
      } else {
        adjusted.wicket *= 0.9
        adjusted.four *= 1.05
      }
    }
    
    // Fatigue effects (bowler stamina)
    if (bowler.fitness < 70) {
      const fatigueFactor = (100 - bowler.fitness) / 100
      adjusted.four *= (1 + fatigueFactor * 0.2)
      adjusted.six *= (1 + fatigueFactor * 0.2)
      adjusted.wicket *= (1 - fatigueFactor * 0.15)
    }
    
    // Batsman fatigue (Test cricket specific - after long innings)
    const batsmanStats = matchState.batsmanStats.get(batsman.id)
    if (batsmanStats && batsmanStats.balls > 150) {
      const fatigueLevel = Math.min((batsmanStats.balls - 150) / 150, 0.5)
      adjusted.wicket *= (1 + fatigueLevel * 0.3)
      adjusted.dot *= (1 + fatigueLevel * 0.1)
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
    
    const players = {
      batsman: batsman.name,
      bowler: bowler.name,
      fielder: 'the fielder'
    };
    
    const matchContext = {
      balls: matchState.balls,
      score: matchState.score,
      wickets: matchState.wickets
    };
    
    switch (outcome) {
      case 'dot':
        result.runs = 0
        result.commentary = generateCommentary('dot', players, matchContext)
        break
      case 'single':
        result.runs = 1
        result.commentary = generateCommentary('single', players, matchContext)
        break
      case 'two':
        result.runs = 2
        result.commentary = generateCommentary('two', players, matchContext)
        break
      case 'three':
        result.runs = 3
        result.commentary = generateCommentary('three', players, matchContext)
        break
      case 'four':
        result.runs = 4
        result.commentary = generateCommentary('four', players, matchContext)
        break
      case 'six':
        result.runs = 6
        result.commentary = generateCommentary('six', players, matchContext)
        break
      case 'wicket':
        result.isWicket = true
        result.wicketType = this.determineWicketType(bowler.bowling.style)
        result.commentary = generateCommentary('wicket', players, matchContext, result.wicketType)
        break
      case 'wide':
        result.runs = 1
        result.isLegalDelivery = false
        result.commentary = generateCommentary('wide', players, matchContext)
        break
      case 'no_ball':
        result.runs = 1
        result.isLegalDelivery = false
        result.commentary = generateCommentary('noBall', players, matchContext)
        break
    }
    
    return result
  }

  /**
   * Determine type of wicket based on bowler style
   */
  determineWicketType(bowlingStyle) {
    let adjustedProbs = { ...TEST_WICKET_TYPE_PROBABILITIES };
    
    // Adjust wicket probabilities based on bowling style
    if (bowlingStyle === 'fast' || bowlingStyle === 'fast_medium') {
      adjustedProbs.bowled *= 1.2;
      adjustedProbs.caught *= 1.1;
      adjustedProbs.lbw *= 1.2;
      adjustedProbs.stumped *= 0.3;
    } else if (bowlingStyle && bowlingStyle.includes('spin')) {
      adjustedProbs.stumped *= 2.5;
      adjustedProbs.caught *= 1.2;
      adjustedProbs.bowled *= 0.9;
      adjustedProbs.lbw *= 1.4;
    }
    
    const wicketType = this.weightedRandomSelection(adjustedProbs);
    return wicketType;
  }

  /**
   * Calculate required run rate (Test cricket - runs per over)
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
}

export default TestProbabilityEngine
