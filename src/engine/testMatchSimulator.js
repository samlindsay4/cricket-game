/**
 * Test Match Simulator - Multi-day, multi-innings Test cricket simulation
 * 
 * Handles:
 * - 5 days with 3 sessions per day (90 overs per day)
 * - 2 innings per team (4 innings total)
 * - Unlimited overs per innings (until 10 wickets fall)
 * - Session breaks (Lunch, Tea, Stumps)
 * - Declaration option
 * - Follow-on rule
 * - Draw result
 */

import { MatchState } from './matchSimulator.js';
import { TestProbabilityEngine } from './testProbabilityEngine.js';
import { MatchConditions } from './matchConditions.js';
import { generateOverSummary, generateInningsSummary, generateMatchResult, generateMilestone } from './commentaryGenerator.js';
import { formatScore, ballsToOvers, checkMilestone } from './matchUtils.js';
import { BALL_OUTCOMES, WICKET_TYPES } from './matchConstants.js';
import { Player, PLAYER_ROLES } from './playerStats.js';

/**
 * Test Match State - extends MatchState for Test cricket
 */
export class TestMatchState extends MatchState {
  constructor(team1, team2, conditions = null) {
    super(team1, team2, 90, conditions); // 90 overs per day
    
    // Test match specific properties
    this.day = 1; // Current day (1-5)
    this.session = 1; // Current session (1-3: morning, afternoon, evening)
    this.oversInSession = 0; // Overs bowled in current session
    this.totalOversToday = 0; // Total overs today
    this.inningsNumber = 1; // 1-4 for Test cricket
    this.sessionBreak = false; // Flag for session breaks
    this.matchDays = 5; // Standard Test match
    this.oversPerSession = 30; // Standard 30 overs per session
    this.oversPerDay = 90; // Standard 90 overs per day
    
    // Innings tracking (4 innings for Test cricket)
    this.allInnings = {
      first: null,
      second: null,
      third: null,
      fourth: null
    };
    
    // Session summaries
    this.sessionSummaries = [];
    
    // Day summaries
    this.daySummaries = [];
    
    // Bowling spell tracking
    this.currentBowlerOvers = 0;
    this.bowlerSpells = new Map(); // Track bowler spells and rest periods
    
    // Follow-on tracking
    this.followOnEnforced = false;
    
    // Declaration tracking
    this.declared = false;
    
    // Match result
    this.matchResult = null;
  }

  /**
   * Check if session is complete
   */
  isSessionComplete() {
    return this.oversInSession >= this.oversPerSession || this.isInningsComplete();
  }

  /**
   * Check if day is complete
   */
  isDayComplete() {
    return this.totalOversToday >= this.oversPerDay || (this.session === 3 && this.isSessionComplete());
  }

  /**
   * Check if match is complete
   */
  isMatchComplete() {
    // All 4 innings completed
    if (this.inningsNumber > 4) return true;
    
    // Team bowled out twice
    if (this.inningsNumber === 4 && this.wickets >= 10) return true;
    
    // Team successfully chased target
    if (this.inningsNumber === 4) {
      const target = this.allInnings.first.runs + this.allInnings.third.runs + 1;
      const currentTotal = this.allInnings.second.runs + this.score;
      if (currentTotal >= target) return true;
    }
    
    // 5 days complete - Draw
    if (this.day > this.matchDays) return true;
    
    return false;
  }

  /**
   * Check if innings is complete
   */
  isInningsComplete() {
    // All out
    if (this.wickets >= 10) return true;
    
    // Declared
    if (this.declared) return true;
    
    // For 4th innings, check if target achieved
    if (this.inningsNumber === 4) {
      const target = this.allInnings.first.runs + this.allInnings.third.runs + 1;
      const currentTotal = this.allInnings.second.runs + this.score;
      if (currentTotal >= target) return true;
    }
    
    return false;
  }

  /**
   * Move to next session
   */
  nextSession() {
    this.session++;
    this.oversInSession = 0;
    
    // Create session summary
    const summary = {
      day: this.day,
      session: this.session - 1,
      runs: this.score,
      wickets: this.wickets,
      overs: this.getCurrentOver(),
      commentary: [...this.commentary].slice(-10) // Last 10 items
    };
    this.sessionSummaries.push(summary);
    
    if (this.session > 3) {
      this.nextDay();
    }
  }

  /**
   * Move to next day
   */
  nextDay() {
    this.day++;
    this.session = 1;
    this.totalOversToday = 0;
    this.oversInSession = 0;
    
    // Create day summary
    const summary = {
      day: this.day - 1,
      runs: this.score,
      wickets: this.wickets,
      overs: this.getCurrentOver(),
      sessions: this.sessionSummaries.filter(s => s.day === this.day - 1)
    };
    this.daySummaries.push(summary);
    
    // Recover bowler fitness overnight
    this.recoverBowlerFitness();
    
    // Update pitch conditions for new day
    if (this.conditions) {
      this.conditions.updatePitchWear(this.day * 30); // Simulate day's wear
    }
  }

  /**
   * Recover bowler fitness overnight
   */
  recoverBowlerFitness() {
    // All bowlers recover some fitness overnight
    for (const player of this.bowlingTeam.players) {
      if (player.fitness < 100) {
        player.fitness = Math.min(100, player.fitness + 15);
      }
    }
  }

  /**
   * Switch to next innings
   */
  switchInnings() {
    // Save current innings data
    const inningsData = {
      runs: this.score,
      wickets: this.wickets,
      overs: this.getCurrentOver(),
      extras: this.extras.wides + this.extras.noBalls + this.extras.byes + this.extras.legByes,
      fallOfWickets: [...this.fallOfWickets],
      commentary: [...this.commentary],
      declared: this.declared
    };
    
    // Store innings data
    switch (this.inningsNumber) {
      case 1:
        this.allInnings.first = inningsData;
        break;
      case 2:
        this.allInnings.second = inningsData;
        break;
      case 3:
        this.allInnings.third = inningsData;
        break;
      case 4:
        this.allInnings.fourth = inningsData;
        break;
    }
    
    this.inningsNumber++;
    
    // Determine next batting team
    if (this.inningsNumber === 2 || this.inningsNumber === 4) {
      // Same teams, switch roles
      const temp = this.battingTeam;
      this.battingTeam = this.bowlingTeam;
      this.bowlingTeam = temp;
    }
    // For innings 3, teams switch back (team1 bats again)
    
    // Reset innings stats
    this.score = 0;
    this.wickets = 0;
    this.balls = 0;
    this.commentary = [];
    this.fallOfWickets = [];
    this.partnerships = [];
    this.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0 };
    this.batsmanStats.clear();
    this.bowlerStats.clear();
    this.declared = false;
  }

  /**
   * Declare innings (captain closes innings early)
   */
  declareInnings() {
    this.declared = true;
  }

  /**
   * Check if can declare (need significant lead)
   */
  canDeclare() {
    // Can only declare in 1st or 3rd innings
    if (this.inningsNumber !== 1 && this.inningsNumber !== 3) return false;
    
    // Need to have batted at least 60 overs
    if (this.balls < 360) return false;
    
    // Simple logic: declare when 300+ ahead
    if (this.inningsNumber === 1) {
      // First innings - just need good score (350+)
      return this.score >= 350;
    } else if (this.inningsNumber === 3) {
      // Third innings - need lead of 300+
      const firstInningsLead = this.allInnings.first.runs - this.allInnings.second.runs;
      const currentLead = firstInningsLead + this.score;
      return currentLead >= 300;
    }
    
    return false;
  }

  /**
   * Check for follow-on
   */
  checkFollowOn() {
    // Follow-on only after 2nd innings
    if (this.inningsNumber !== 2) return false;
    
    // Team batting second is 200+ runs behind
    const deficit = this.allInnings.first.runs - this.score;
    return deficit >= 200;
  }

  /**
   * Get match status description
   */
  getMatchStatus() {
    let status = '';
    
    if (this.inningsNumber === 1) {
      status = `${this.battingTeam.name} 1ST INNINGS`;
    } else if (this.inningsNumber === 2) {
      const lead = this.score - this.allInnings.first.runs;
      if (lead > 0) {
        status = `${this.battingTeam.name} LEAD BY ${lead} RUNS`;
      } else {
        status = `${this.battingTeam.name} TRAIL BY ${Math.abs(lead)} RUNS`;
      }
    } else if (this.inningsNumber === 3) {
      const firstInningsLead = this.allInnings.first.runs - this.allInnings.second.runs;
      const currentLead = firstInningsLead + this.score;
      status = `${this.battingTeam.name} LEAD BY ${currentLead} RUNS`;
    } else if (this.inningsNumber === 4) {
      const target = this.allInnings.first.runs + this.allInnings.third.runs + 1;
      const needed = target - (this.allInnings.second.runs + this.score);
      status = `${this.battingTeam.name} NEED ${needed} RUNS TO WIN`;
    }
    
    return status;
  }

  /**
   * Get session name
   */
  getSessionName() {
    switch (this.session) {
      case 1:
        return 'MORNING SESSION';
      case 2:
        return 'AFTERNOON SESSION';
      case 3:
        return 'EVENING SESSION';
      default:
        return 'SESSION';
    }
  }

  /**
   * Determine match result
   */
  determineMatchResult() {
    // Not complete yet
    if (!this.isMatchComplete()) return null;
    
    // Drawn match (time ran out)
    if (this.day > this.matchDays) {
      return {
        result: 'draw',
        winner: null,
        margin: null,
        description: 'MATCH DRAWN'
      };
    }
    
    // If only 2 innings completed, it's a draw
    if (!this.allInnings.third) {
      return {
        result: 'draw',
        winner: null,
        margin: null,
        description: 'MATCH DRAWN'
      };
    }
    
    // Calculate totals
    const team1Total = this.allInnings.first.runs + (this.allInnings.third?.runs || 0);
    const team2Total = this.allInnings.second.runs + (this.allInnings.fourth?.runs || 0);
    
    if (team1Total > team2Total) {
      const margin = team1Total - team2Total;
      return {
        result: 'win',
        winner: this.team1,
        margin: `${margin} runs`,
        description: `${this.team1.name} WON BY ${margin} RUNS`
      };
    } else if (team2Total > team1Total) {
      const wicketsRemaining = 10 - this.wickets;
      return {
        result: 'win',
        winner: this.team2,
        margin: `${wicketsRemaining} wickets`,
        description: `${this.team2.name} WON BY ${wicketsRemaining} WICKETS`
      };
    } else {
      // Extremely rare - tied Test match
      return {
        result: 'tie',
        winner: null,
        margin: null,
        description: 'MATCH TIED'
      };
    }
  }
}

/**
 * Simulate a single ball in Test cricket
 */
export function simulateTestBall(matchState, probabilityEngine) {
  if (!matchState.striker || !matchState.bowler) {
    throw new Error('Striker and bowler must be set before simulating a ball')
  }
  
  // Calculate outcome using Test probability engine
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
    matchState.oversInSession = Math.floor(matchState.balls / 6) - Math.floor((matchState.balls - 1) / 6) + matchState.oversInSession
    matchState.totalOversToday = Math.floor(matchState.balls / 6)
    matchState.currentBowlerOvers++
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
  
  // Apply fatigue to bowler (more in Test cricket)
  if (outcome.isLegalDelivery && matchState.bowler.fitness > 50) {
    const bowlerStats = matchState.getBowlerStats(matchState.bowler)
    if (bowlerStats.balls % 18 === 0) { // Every 3 overs
      matchState.bowler.fitness = Math.max(50, matchState.bowler.fitness - 3)
    }
  }
  
  return outcome
}

export default {
  TestMatchState,
  simulateTestBall
}
