/**
 * Player Statistics Module
 * 
 * Defines player attributes and statistics used for match simulation
 * and career progression.
 * 
 * Player attributes affect probability calculations in the match engine:
 * - Batting: timing, power, technique, temperament
 * - Bowling: pace/spin, accuracy, variation, stamina
 * - Fielding: catching, throwing, agility
 * - Mental: concentration, pressure handling, adaptability
 * 
 * Stats are rated 1-100 where:
 * - 1-30: Poor
 * - 31-50: Average
 * - 51-70: Good
 * - 71-90: Excellent
 * - 91-100: World Class
 */

/**
 * Player roles
 */
export const PLAYER_ROLES = {
  BATSMAN: 'batsman',
  BOWLER: 'bowler',
  ALL_ROUNDER: 'all_rounder',
  WICKET_KEEPER: 'wicket_keeper'
}

/**
 * Bowling styles
 */
export const BOWLING_STYLES = {
  FAST: 'fast',
  FAST_MEDIUM: 'fast_medium',
  MEDIUM: 'medium',
  SPIN_OFF: 'off_spin',
  SPIN_LEG: 'leg_spin',
  SPIN_LEFT_ARM: 'left_arm_spin'
}

/**
 * Batting styles
 */
export const BATTING_STYLES = {
  AGGRESSIVE: 'aggressive',
  BALANCED: 'balanced',
  DEFENSIVE: 'defensive',
  ANCHOR: 'anchor'
}

/**
 * Player class representing a cricket player with all attributes
 */
export class Player {
  constructor(config) {
    this.id = config.id
    this.name = config.name
    this.role = config.role
    this.age = config.age || 20
    
    // Batting attributes
    this.batting = {
      timing: config.batting?.timing || 50,
      power: config.batting?.power || 50,
      technique: config.batting?.technique || 50,
      temperament: config.batting?.temperament || 50,
      style: config.batting?.style || BATTING_STYLES.BALANCED
    }
    
    // Bowling attributes
    this.bowling = {
      pace: config.bowling?.pace || 50,
      accuracy: config.bowling?.accuracy || 50,
      variation: config.bowling?.variation || 50,
      stamina: config.bowling?.stamina || 50,
      style: config.bowling?.style || BOWLING_STYLES.MEDIUM
    }
    
    // Fielding attributes
    this.fielding = {
      catching: config.fielding?.catching || 50,
      throwing: config.fielding?.throwing || 50,
      agility: config.fielding?.agility || 50
    }
    
    // Mental attributes
    this.mental = {
      concentration: config.mental?.concentration || 50,
      pressure: config.mental?.pressure || 50,
      adaptability: config.mental?.adaptability || 50
    }
    
    // Career statistics
    this.careerStats = {
      matches: 0,
      runs: 0,
      wickets: 0,
      catches: 0,
      highScore: 0,
      bestBowling: { wickets: 0, runs: 0 },
      average: 0,
      strikeRate: 0,
      economy: 0
    }
    
    // Current form (affects performance)
    this.form = 50
    this.fitness = 100
    this.confidence = 50
  }

  /**
   * Get overall rating for batting
   */
  getBattingRating() {
    const { timing, power, technique, temperament } = this.batting
    return Math.round((timing + power + technique + temperament) / 4)
  }

  /**
   * Get overall rating for bowling
   */
  getBowlingRating() {
    const { pace, accuracy, variation, stamina } = this.bowling
    return Math.round((pace + accuracy + variation + stamina) / 4)
  }

  /**
   * Get overall rating for fielding
   */
  getFieldingRating() {
    const { catching, throwing, agility } = this.fielding
    return Math.round((catching + throwing + agility) / 3)
  }

  /**
   * Get overall player rating
   */
  getOverallRating() {
    switch (this.role) {
      case PLAYER_ROLES.BATSMAN:
        return Math.round(this.getBattingRating() * 0.7 + this.getFieldingRating() * 0.3)
      case PLAYER_ROLES.BOWLER:
        return Math.round(this.getBowlingRating() * 0.7 + this.getFieldingRating() * 0.3)
      case PLAYER_ROLES.ALL_ROUNDER:
        return Math.round(
          this.getBattingRating() * 0.4 +
          this.getBowlingRating() * 0.4 +
          this.getFieldingRating() * 0.2
        )
      case PLAYER_ROLES.WICKET_KEEPER:
        return Math.round(this.getBattingRating() * 0.5 + this.getFieldingRating() * 0.5)
      default:
        return 50
    }
  }

  /**
   * Update player form based on recent performance
   */
  updateForm(performance) {
    // Form gradually moves towards recent performance
    const formChange = (performance - this.form) * 0.3
    this.form = Math.max(0, Math.min(100, this.form + formChange))
  }

  /**
   * Update player stats after a match
   */
  updateStats(matchStats) {
    this.careerStats.matches++
    this.careerStats.runs += matchStats.runs || 0
    this.careerStats.wickets += matchStats.wickets || 0
    this.careerStats.catches += matchStats.catches || 0
    
    if (matchStats.runs > this.careerStats.highScore) {
      this.careerStats.highScore = matchStats.runs
    }
    
    // Recalculate averages
    this.careerStats.average = this.careerStats.runs / Math.max(1, this.careerStats.matches)
    this.careerStats.strikeRate = matchStats.strikeRate || this.careerStats.strikeRate
  }

  /**
   * Age player (affects attributes)
   */
  ageOneYear() {
    this.age++
    
    // Peak years are 25-32
    if (this.age < 25) {
      // Young player improving
      this.improveRandomAttribute(2)
    } else if (this.age > 32) {
      // Declining player
      this.degradeRandomAttribute(1)
    }
  }

  /**
   * Improve a random attribute
   */
  improveRandomAttribute(amount) {
    // Implementation would randomly improve attributes
    // This is a placeholder
  }

  /**
   * Degrade a random attribute due to age
   */
  degradeRandomAttribute(amount) {
    // Implementation would randomly decrease attributes
    // This is a placeholder
  }
}

/**
 * Create a random player with given role
 */
export function generateRandomPlayer(role, name) {
  const randomStat = () => Math.floor(Math.random() * 40) + 30 // 30-70 range
  
  return new Player({
    id: `player_${Date.now()}_${Math.random()}`,
    name: name || `Player ${Math.floor(Math.random() * 1000)}`,
    role,
    age: Math.floor(Math.random() * 15) + 20, // 20-35 years
    batting: {
      timing: randomStat(),
      power: randomStat(),
      technique: randomStat(),
      temperament: randomStat()
    },
    bowling: {
      pace: randomStat(),
      accuracy: randomStat(),
      variation: randomStat(),
      stamina: randomStat()
    },
    fielding: {
      catching: randomStat(),
      throwing: randomStat(),
      agility: randomStat()
    },
    mental: {
      concentration: randomStat(),
      pressure: randomStat(),
      adaptability: randomStat()
    }
  })
}

export default {
  Player,
  generateRandomPlayer,
  PLAYER_ROLES,
  BOWLING_STYLES,
  BATTING_STYLES
}
