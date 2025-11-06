/**
 * Bowling Manager - Handles realistic bowling rotation and spell management for Test cricket
 * 
 * Implements:
 * - Opening bowlers bowl first 10-15 overs
 * - First change bowlers after 10-15 overs
 * - Spinners introduced after 20+ overs
 * - Spell management with rest periods
 * - Bowler fitness and fatigue tracking
 */

/**
 * BowlingManager class - manages bowling rotation and spells
 */
export class BowlingManager {
  constructor(bowlers) {
    this.allBowlers = bowlers
    this.openingBowlers = []     // 2 best pace bowlers
    this.firstChange = []         // Next 2-3 bowlers
    this.spinners = []            // Spin bowlers
    this.currentSpells = new Map() // Track current spell for each bowler
    this.restingSince = new Map()  // Track when bowler was rested (over number)
    this.totalOversBowled = new Map() // Total overs per day
    
    this.categorizeBowlers()
  }
  
  /**
   * Categorize bowlers by type and skill
   */
  categorizeBowlers() {
    const paceBowlers = []
    const spinBowlers = []
    
    for (const bowler of this.allBowlers) {
      const style = bowler.bowling?.style || ''
      
      if (style.includes('spin')) {
        spinBowlers.push(bowler)
      } else {
        paceBowlers.push(bowler)
      }
    }
    
    // Sort pace bowlers by bowling rating (best first)
    paceBowlers.sort((a, b) => b.getBowlingRating() - a.getBowlingRating())
    
    // Opening bowlers are the 2 best pace bowlers
    this.openingBowlers = paceBowlers.slice(0, 2)
    
    // First change are the next 2-3 pace bowlers
    this.firstChange = paceBowlers.slice(2, 5)
    
    // Spinners sorted by rating
    this.spinners = spinBowlers.sort((a, b) => b.getBowlingRating() - a.getBowlingRating())
    
    // Initialize tracking maps
    for (const bowler of this.allBowlers) {
      this.currentSpells.set(bowler.id, 0)
      this.restingSince.set(bowler.id, null)
      this.totalOversBowled.set(bowler.id, 0)
    }
  }
  
  /**
   * Select the next bowler based on current match situation
   * @param {number} currentOver - Current over number
   * @param {Object} matchState - Current match state
   * @param {Object} currentBowler - Current bowler (to avoid selecting same bowler)
   * @returns {Object} Next bowler to bowl
   */
  selectNextBowler(currentOver, matchState, currentBowler = null) {
    // Opening spell (overs 1-10): Opening bowlers alternate ends
    if (currentOver < 10) {
      return this.selectOpeningBowler(currentOver, currentBowler)
    }
    
    // First change period (overs 10-25)
    if (currentOver < 25) {
      return this.selectFirstChangeBowler(currentOver, currentBowler)
    }
    
    // Middle overs (25+): Rotate based on situation
    return this.selectMiddleOversBowler(currentOver, matchState, currentBowler)
  }
  
  /**
   * Select opening bowler (overs 1-10)
   */
  selectOpeningBowler(currentOver, currentBowler) {
    if (this.openingBowlers.length === 0) {
      return this.allBowlers[0]
    }
    
    // Alternate between the two opening bowlers
    if (!currentBowler) {
      return this.openingBowlers[0]
    }
    
    // Find the other opening bowler
    const currentIsOpener = this.openingBowlers.findIndex(b => b.id === currentBowler.id)
    if (currentIsOpener >= 0) {
      const nextIndex = (currentIsOpener + 1) % this.openingBowlers.length
      return this.openingBowlers[nextIndex]
    }
    
    return this.openingBowlers[0]
  }
  
  /**
   * Select first change bowler (overs 10-25)
   */
  selectFirstChangeBowler(currentOver, currentBowler) {
    // Bring on first change bowlers
    const availableFirstChange = this.firstChange.filter(b => 
      this.canBowlAgain(b, currentOver)
    )
    
    if (availableFirstChange.length > 0) {
      // Select bowler who has bowled least
      availableFirstChange.sort((a, b) => 
        this.currentSpells.get(a.id) - this.currentSpells.get(b.id)
      )
      return availableFirstChange[0]
    }
    
    // Fall back to opening bowlers if rested
    const availableOpeners = this.openingBowlers.filter(b =>
      this.canBowlAgain(b, currentOver) && b.id !== currentBowler?.id
    )
    
    if (availableOpeners.length > 0) {
      return availableOpeners[0]
    }
    
    // Last resort: any bowler who can bowl
    return this.findAnyAvailableBowler(currentOver, currentBowler)
  }
  
  /**
   * Select bowler for middle overs (25+)
   */
  selectMiddleOversBowler(currentOver, matchState, currentBowler) {
    const availableBowlers = []
    
    // Consider spinners (higher priority after 20 overs)
    if (currentOver >= 20 && this.spinners.length > 0) {
      for (const spinner of this.spinners) {
        if (this.canBowlAgain(spinner, currentOver) && spinner.id !== currentBowler?.id) {
          availableBowlers.push({ bowler: spinner, priority: 3 })
        }
      }
    }
    
    // Consider opening bowlers (rested)
    for (const opener of this.openingBowlers) {
      if (this.canBowlAgain(opener, currentOver) && opener.id !== currentBowler?.id) {
        availableBowlers.push({ bowler: opener, priority: 2 })
      }
    }
    
    // Consider first change
    for (const bowler of this.firstChange) {
      if (this.canBowlAgain(bowler, currentOver) && bowler.id !== currentBowler?.id) {
        availableBowlers.push({ bowler: bowler, priority: 1 })
      }
    }
    
    if (availableBowlers.length === 0) {
      return this.findAnyAvailableBowler(currentOver, currentBowler)
    }
    
    // Sort by priority (highest first), then by overs bowled (least first)
    availableBowlers.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      return this.totalOversBowled.get(a.bowler.id) - this.totalOversBowled.get(b.bowler.id)
    })
    
    return availableBowlers[0].bowler
  }
  
  /**
   * Find any available bowler (emergency fallback)
   */
  findAnyAvailableBowler(currentOver, currentBowler) {
    for (const bowler of this.allBowlers) {
      if (bowler.id !== currentBowler?.id && this.canBowlAgain(bowler, currentOver)) {
        return bowler
      }
    }
    
    // Absolute last resort: return current bowler or first bowler
    return currentBowler || this.allBowlers[0]
  }
  
  /**
   * Check if bowler should be changed
   * @param {Object} bowler - Current bowler
   * @param {number} currentSpell - Current spell length (overs)
   * @param {Object} matchState - Current match state
   * @returns {boolean} True if bowler should be changed
   */
  shouldChangeBowler(bowler, currentSpell, matchState) {
    const bowlerId = bowler.id
    const style = bowler.bowling?.style || ''
    const isPace = !style.includes('spin')
    const isSpin = style.includes('spin')
    
    // Check spell length
    if (isPace && currentSpell >= 8) {
      return true // Pace bowlers need rest after 8 overs
    }
    
    if (isSpin && currentSpell >= 15) {
      return true // Spinners can bowl longer spells
    }
    
    // Check fitness (if available)
    if (bowler.fitness !== undefined && bowler.fitness < 60) {
      return true
    }
    
    // Check if bowler is very expensive (economy > 5 in Tests)
    const bowlerStats = matchState.getBowlerStats(bowler)
    if (bowlerStats && bowlerStats.balls >= 36) { // At least 6 overs
      const economy = bowlerStats.balls > 0 ? (bowlerStats.runs / bowlerStats.balls) * 6 : 0
      if (economy > 5.5) {
        return true
      }
    }
    
    return false
  }
  
  /**
   * Check if bowler has rested enough to bowl again
   * @param {Object} bowler - Bowler to check
   * @param {number} currentOver - Current over number
   * @returns {boolean} True if bowler can bowl again
   */
  canBowlAgain(bowler, currentOver) {
    const lastBowled = this.restingSince.get(bowler.id)
    
    // Never bowled yet
    if (lastBowled === null) {
      return true
    }
    
    const restOvers = currentOver - lastBowled
    const style = bowler.bowling?.style || ''
    const isPace = !style.includes('spin')
    
    // Pace bowlers need more rest
    if (isPace) {
      return restOvers >= 10
    } else {
      // Spinners need less rest
      return restOvers >= 5
    }
  }
  
  /**
   * Update spell tracking when bowler completes an over
   * @param {Object} bowler - Bowler who just bowled
   * @param {number} currentOver - Current over number
   */
  updateSpell(bowler, currentOver) {
    const currentSpell = this.currentSpells.get(bowler.id) || 0
    this.currentSpells.set(bowler.id, currentSpell + 1)
    
    const totalOvers = this.totalOversBowled.get(bowler.id) || 0
    this.totalOversBowled.set(bowler.id, totalOvers + 1)
  }
  
  /**
   * Mark bowler as resting
   * @param {Object} bowler - Bowler being rested
   * @param {number} currentOver - Current over number
   */
  restBowler(bowler, currentOver) {
    this.currentSpells.set(bowler.id, 0)
    this.restingSince.set(bowler.id, currentOver)
  }
  
  /**
   * Reset all tracking (for new day)
   */
  resetDay() {
    this.totalOversBowled.clear()
    for (const bowler of this.allBowlers) {
      this.totalOversBowled.set(bowler.id, 0)
    }
  }
  
  /**
   * Reset all tracking (for new innings)
   */
  resetInnings() {
    this.currentSpells.clear()
    this.restingSince.clear()
    this.totalOversBowled.clear()
    
    for (const bowler of this.allBowlers) {
      this.currentSpells.set(bowler.id, 0)
      this.restingSince.set(bowler.id, null)
      this.totalOversBowled.set(bowler.id, 0)
    }
  }
}

export default BowlingManager
