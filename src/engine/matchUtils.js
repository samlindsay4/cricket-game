/**
 * Match Utilities
 * 
 * Helper functions for match-related calculations and formatting.
 * These utilities are used throughout the match simulation engine.
 */

/**
 * Format score in standard cricket notation
 * @param {number} runs - Total runs
 * @param {number} wickets - Wickets fallen
 * @param {number} balls - Total balls bowled
 * @returns {string} Formatted score (e.g., "245/6 (45.2)")
 */
export function formatScore(runs, wickets, balls) {
  const overs = ballsToOvers(balls);
  return `${runs}/${wickets} (${overs})`;
}

/**
 * Convert balls to overs notation
 * @param {number} balls - Number of balls
 * @returns {string} Overs in format "X.Y"
 */
export function ballsToOvers(balls) {
  const completedOvers = Math.floor(balls / 6);
  const ballsInOver = balls % 6;
  return `${completedOvers}.${ballsInOver}`;
}

/**
 * Convert overs notation to balls
 * @param {string} overs - Overs in format "X.Y"
 * @returns {number} Total balls
 */
export function oversToBalls(overs) {
  const parts = overs.toString().split('.');
  const completeOvers = parseInt(parts[0], 10);
  const balls = parts[1] ? parseInt(parts[1], 10) : 0;
  return completeOvers * 6 + balls;
}

/**
 * Calculate current run rate
 * @param {number} runs - Runs scored
 * @param {number} balls - Balls faced
 * @returns {number} Run rate per over
 */
export function calculateRunRate(runs, balls) {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 6).toFixed(2));
}

/**
 * Calculate required run rate
 * @param {number} target - Target runs needed
 * @param {number} ballsRemaining - Balls remaining
 * @returns {number} Required run rate
 */
export function calculateRequiredRate(target, ballsRemaining) {
  if (ballsRemaining === 0) return Infinity;
  if (target <= 0) return 0;
  return parseFloat(((target / ballsRemaining) * 6).toFixed(2));
}

/**
 * Check if match is complete
 * @param {Object} matchState - Current match state
 * @returns {boolean} True if match is over
 */
export function isMatchComplete(matchState) {
  // First innings not complete yet
  if (matchState.currentInning === 1) {
    return false;
  }
  
  // Second innings checks
  const target = matchState.innings.first.runs + 1;
  const currentScore = matchState.score;
  const wickets = matchState.wickets;
  const balls = matchState.balls;
  const totalBalls = matchState.totalOvers * 6;
  
  // Chasing team won
  if (currentScore >= target) {
    return true;
  }
  
  // All wickets fallen
  if (wickets >= 10) {
    return true;
  }
  
  // All overs completed
  if (balls >= totalBalls) {
    return true;
  }
  
  return false;
}

/**
 * Determine match winner
 * @param {Object} matchState - Final match state
 * @returns {Object} Winner and margin
 */
export function getMatchWinner(matchState) {
  const team1Score = matchState.innings.first.runs;
  const team2Score = matchState.score;
  const team2Wickets = matchState.wickets;
  
  if (team2Score > team1Score) {
    const wicketsRemaining = 10 - team2Wickets;
    return {
      winner: matchState.battingTeam.name,
      margin: `by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
      team: matchState.battingTeam
    };
  } else if (team1Score > team2Score) {
    const runsDifference = team1Score - team2Score;
    return {
      winner: matchState.bowlingTeam.name,
      margin: `by ${runsDifference} run${runsDifference !== 1 ? 's' : ''}`,
      team: matchState.bowlingTeam
    };
  } else {
    return {
      winner: null,
      margin: 'Match tied',
      team: null
    };
  }
}

/**
 * Calculate projected score
 * @param {number} currentRuns - Current runs
 * @param {number} ballsFaced - Balls faced so far
 * @param {number} totalBalls - Total balls in innings
 * @returns {number} Projected final score
 */
export function calculateProjectedScore(currentRuns, ballsFaced, totalBalls) {
  if (ballsFaced === 0) return 0;
  const runRate = calculateRunRate(currentRuns, ballsFaced);
  const oversRemaining = (totalBalls - ballsFaced) / 6;
  return Math.round(currentRuns + (runRate * oversRemaining));
}

/**
 * Calculate batting strike rate
 * @param {number} runs - Runs scored
 * @param {number} balls - Balls faced
 * @returns {number} Strike rate
 */
export function calculateStrikeRate(runs, balls) {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 100).toFixed(2));
}

/**
 * Calculate bowling economy
 * @param {number} runsConceded - Runs conceded
 * @param {number} ballsBowled - Balls bowled
 * @returns {number} Economy rate
 */
export function calculateEconomy(runsConceded, ballsBowled) {
  if (ballsBowled === 0) return 0;
  const oversBowled = ballsBowled / 6;
  return parseFloat((runsConceded / oversBowled).toFixed(2));
}

/**
 * Calculate bowling average
 * @param {number} runsConceded - Total runs conceded
 * @param {number} wicketsTaken - Total wickets taken
 * @returns {number} Bowling average
 */
export function calculateBowlingAverage(runsConceded, wicketsTaken) {
  if (wicketsTaken === 0) return Infinity;
  return parseFloat((runsConceded / wicketsTaken).toFixed(2));
}

/**
 * Calculate batting average
 * @param {number} totalRuns - Total runs scored
 * @param {number} dismissals - Number of times dismissed
 * @returns {number} Batting average
 */
export function calculateBattingAverage(totalRuns, dismissals) {
  if (dismissals === 0) return totalRuns;
  return parseFloat((totalRuns / dismissals).toFixed(2));
}

/**
 * Get match status description
 * @param {Object} matchState - Current match state
 * @returns {string} Human-readable match status
 */
export function getMatchStatus(matchState) {
  if (matchState.currentInning === 1) {
    return `${matchState.battingTeam.name} batting: ${formatScore(matchState.score, matchState.wickets, matchState.balls)}`;
  } else {
    const target = matchState.innings.first.runs + 1;
    const required = target - matchState.score;
    const ballsLeft = (matchState.totalOvers * 6) - matchState.balls;
    
    if (required <= 0) {
      return `${matchState.battingTeam.name} won!`;
    } else if (matchState.wickets >= 10) {
      return `${matchState.bowlingTeam.name} won by ${required - 1} runs!`;
    } else if (ballsLeft === 0) {
      return `${matchState.bowlingTeam.name} won by ${required} runs!`;
    } else {
      const reqRate = calculateRequiredRate(required, ballsLeft);
      return `${matchState.battingTeam.name} need ${required} from ${ballsLeft} balls (RRR: ${reqRate})`;
    }
  }
}

/**
 * Get partnership details
 * @param {number} runs - Partnership runs
 * @param {number} balls - Partnership balls
 * @param {Object} batsman1 - First batsman
 * @param {Object} batsman2 - Second batsman
 * @returns {Object} Partnership details
 */
export function getPartnershipDetails(runs, balls, batsman1, batsman2) {
  const runRate = calculateRunRate(runs, balls);
  const overs = ballsToOvers(balls);
  
  return {
    runs,
    balls,
    overs,
    runRate,
    batsmen: [batsman1.name, batsman2.name]
  };
}

/**
 * Calculate win probability (simplified)
 * @param {Object} matchState - Current match state
 * @returns {number} Win probability for batting team (0-100)
 */
export function calculateWinProbability(matchState) {
  if (matchState.currentInning === 1) {
    return 50; // Equal before second innings
  }
  
  const target = matchState.innings.first.runs + 1;
  const current = matchState.score;
  const ballsRemaining = (matchState.totalOvers * 6) - matchState.balls;
  const wicketsRemaining = 10 - matchState.wickets;
  
  // Already won
  if (current >= target) {
    return 100;
  }
  
  // All out or overs finished
  if (wicketsRemaining === 0 || ballsRemaining === 0) {
    return 0;
  }
  
  const required = target - current;
  const requiredRate = calculateRequiredRate(required, ballsRemaining);
  const currentRate = calculateRunRate(current, matchState.balls);
  
  // Base probability on required rate
  let probability = 50;
  
  if (requiredRate <= 4) {
    probability = 85;
  } else if (requiredRate <= 6) {
    probability = 70;
  } else if (requiredRate <= 8) {
    probability = 55;
  } else if (requiredRate <= 10) {
    probability = 35;
  } else if (requiredRate <= 12) {
    probability = 20;
  } else {
    probability = 10;
  }
  
  // Adjust for wickets in hand
  const wicketFactor = wicketsRemaining / 10;
  probability = probability * (0.5 + wicketFactor * 0.5);
  
  // Adjust for momentum (current rate vs required rate)
  if (currentRate > requiredRate) {
    probability += 10;
  } else if (currentRate < requiredRate * 0.7) {
    probability -= 10;
  }
  
  return Math.max(5, Math.min(95, Math.round(probability)));
}

/**
 * Check if player has reached a milestone
 * @param {number} previousRuns - Runs before this ball
 * @param {number} currentRuns - Runs after this ball
 * @returns {number|null} Milestone reached (50, 100, etc.) or null
 */
export function checkMilestone(previousRuns, currentRuns) {
  const milestones = [50, 100, 150, 200];
  
  for (const milestone of milestones) {
    if (previousRuns < milestone && currentRuns >= milestone) {
      return milestone;
    }
  }
  
  return null;
}

/**
 * Format overs remaining
 * @param {number} ballsRemaining - Balls remaining
 * @returns {string} Formatted overs remaining
 */
export function formatOversRemaining(ballsRemaining) {
  const overs = Math.floor(ballsRemaining / 6);
  const balls = ballsRemaining % 6;
  
  if (balls === 0) {
    return `${overs} over${overs !== 1 ? 's' : ''}`;
  } else {
    return `${overs}.${balls} overs`;
  }
}

/**
 * Get phase of innings
 * @param {number} currentOver - Current over number
 * @param {number} totalOvers - Total overs in innings
 * @returns {string} Phase name
 */
export function getInningsPhase(currentOver, totalOvers) {
  const percentage = (currentOver / totalOvers) * 100;
  
  if (percentage < 30) {
    return 'powerplay';
  } else if (percentage < 75) {
    return 'middle_overs';
  } else {
    return 'death_overs';
  }
}

export default {
  formatScore,
  ballsToOvers,
  oversToBalls,
  calculateRunRate,
  calculateRequiredRate,
  isMatchComplete,
  getMatchWinner,
  calculateProjectedScore,
  calculateStrikeRate,
  calculateEconomy,
  calculateBowlingAverage,
  calculateBattingAverage,
  getMatchStatus,
  getPartnershipDetails,
  calculateWinProbability,
  checkMilestone,
  formatOversRemaining,
  getInningsPhase
};
