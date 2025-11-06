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
    
    // TWO-END BOWLING SYSTEM: Track which bowler operates from each end
    this.endA = null  // Bowler operating from end A
    this.endB = null  // Bowler operating from end B
    this.currentEnd = 'A'  // Current bowling end
    
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
   * Implements TWO-END bowling system
   * @param {number} currentOver - Current over number
   * @param {Object} matchState - Current match state
   * @param {Object} previousBowler - Previous bowler (MUST be excluded - can't bowl consecutive overs)
   * @returns {Object} Next bowler to bowl
   */
  selectNextBowler(currentOver, matchState, previousBowler = null) {
    // Initialize ends if first over
    if (currentOver === 0 || (!this.endA && !this.endB)) {
      if (this.openingBowlers.length >= 2) {
        this.endA = this.openingBowlers[0]
        this.endB = this.openingBowlers[1]
        this.currentEnd = 'A'
        return this.endA
      } else if (this.openingBowlers.length === 1) {
        this.endA = this.openingBowlers[0]
        this.endB = this.allBowlers.find(b => b.id !== this.endA.id)
        this.currentEnd = 'A'
        return this.endA
      } else {
        this.endA = this.allBowlers[0]
        this.endB = this.allBowlers[1] || this.allBowlers[0]
        this.currentEnd = 'A'
        return this.endA
      }
    }
    
    // TWO-END SYSTEM: Alternate between ends
    // The bowler from the OTHER end bowls next (they can't bowl consecutive overs)
    this.currentEnd = this.currentEnd === 'A' ? 'B' : 'A'
    const bowlerFromThisEnd = this.currentEnd === 'A' ? this.endA : this.endB
    
    // Check if the bowler from this end should be changed
    const spell = this.currentSpells.get(bowlerFromThisEnd.id) || 0
    const shouldChange = this.shouldChangeBowler(bowlerFromThisEnd, spell, matchState)
    
    if (shouldChange) {
      // Need to change the bowler at THIS end only
      // Select a new bowler (excluding bowler from the OTHER end who just bowled)
      const otherEndBowler = this.currentEnd === 'A' ? this.endB : this.endA
      const newBowler = this.selectReplacementBowler(currentOver, matchState, otherEndBowler)
      
      // Rest the old bowler and assign new bowler to this end
      this.restBowler(bowlerFromThisEnd, currentOver)
      
      if (this.currentEnd === 'A') {
        this.endA = newBowler
      } else {
        this.endB = newBowler
      }
      
      return newBowler
    }
    
    return bowlerFromThisEnd
  }
  
  /**
   * Select a replacement bowler (when changing bowler at one end)
   */
  selectReplacementBowler(currentOver, matchState, excludeBowler) {
    // Opening spell (overs 1-10): Use opening bowlers
    if (currentOver < 10) {
      const available = this.openingBowlers.filter(b => b.id !== excludeBowler.id && this.canBowlAgain(b, currentOver))
      if (available.length > 0) return available[0]
    }
    
    // First change period (overs 10-25)
    if (currentOver < 25) {
      const available = this.firstChange.filter(b => b.id !== excludeBowler.id && this.canBowlAgain(b, currentOver))
      if (available.length > 0) {
        // Select bowler who has bowled least
        available.sort((a, b) => this.currentSpells.get(a.id) - this.currentSpells.get(b.id))
        return available[0]
      }
      
      // Fall back to rested opening bowlers
      const available2 = this.openingBowlers.filter(b => b.id !== excludeBowler.id && this.canBowlAgain(b, currentOver))
      if (available2.length > 0) return available2[0]
    }
    
    // Middle overs (25+): Consider spinners
    if (currentOver >= 20 && this.spinners.length > 0) {
      const available = this.spinners.filter(b => b.id !== excludeBowler.id && this.canBowlAgain(b, currentOver))
      if (available.length > 0) return available[0]
    }
    
    // Fall back to any available bowler
    return this.findAnyAvailableBowler(currentOver, excludeBowler)
  }
  
  /**
   * Select opening bowler (overs 1-10)
   */
  selectOpeningBowler(currentOver, previousBowler) {
    if (this.openingBowlers.length === 0) {
      return this.allBowlers[0]
    }
    
    // Alternate between the two opening bowlers
    if (!previousBowler) {
      return this.openingBowlers[0]
    }
    
    // CRITICAL: Exclude previous bowler (can't bowl consecutive overs)
    const availableOpeners = this.openingBowlers.filter(b => b.id !== previousBowler.id)
    
    if (availableOpeners.length > 0) {
      return availableOpeners[0]
    }
    
    // Fallback: if somehow all openers excluded, use first opener
    return this.openingBowlers[0]
  }
  
  /**
   * Select first change bowler (overs 10-25)
   */
  selectFirstChangeBowler(currentOver, previousBowler) {
    // Bring on first change bowlers (excluding previous bowler)
    const availableFirstChange = this.firstChange.filter(b => 
      this.canBowlAgain(b, currentOver) && b.id !== previousBowler?.id
    )
    
    if (availableFirstChange.length > 0) {
      // Select bowler who has bowled least
      availableFirstChange.sort((a, b) => 
        this.currentSpells.get(a.id) - this.currentSpells.get(b.id)
      )
      return availableFirstChange[0]
    }
    
    // Fall back to opening bowlers if rested (excluding previous bowler)
    const availableOpeners = this.openingBowlers.filter(b =>
      this.canBowlAgain(b, currentOver) && b.id !== previousBowler?.id
    )
    
    if (availableOpeners.length > 0) {
      return availableOpeners[0]
    }
    
    // Last resort: any bowler who can bowl (excluding previous bowler)
    return this.findAnyAvailableBowler(currentOver, previousBowler)
  }
  
  /**
   * Select bowler for middle overs (25+)
   */
  selectMiddleOversBowler(currentOver, matchState, previousBowler) {
    const availableBowlers = []
    
    // Consider spinners (higher priority after 20 overs)
    if (currentOver >= 20 && this.spinners.length > 0) {
      for (const spinner of this.spinners) {
        if (this.canBowlAgain(spinner, currentOver) && spinner.id !== previousBowler?.id) {
          availableBowlers.push({ bowler: spinner, priority: 3 })
        }
      }
    }
    
    // Consider opening bowlers (rested)
    for (const opener of this.openingBowlers) {
      if (this.canBowlAgain(opener, currentOver) && opener.id !== previousBowler?.id) {
        availableBowlers.push({ bowler: opener, priority: 2 })
      }
    }
    
    // Consider first change
    for (const bowler of this.firstChange) {
      if (this.canBowlAgain(bowler, currentOver) && bowler.id !== previousBowler?.id) {
        availableBowlers.push({ bowler: bowler, priority: 1 })
      }
    }
    
    if (availableBowlers.length === 0) {
      return this.findAnyAvailableBowler(currentOver, previousBowler)
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
  findAnyAvailableBowler(currentOver, previousBowler) {
    // CRITICAL: Filter out previous bowler (can't bowl consecutive overs)
    for (const bowler of this.allBowlers) {
      if (bowler.id !== previousBowler?.id && this.canBowlAgain(bowler, currentOver)) {
        return bowler
      }
    }
    
    // If no one has rested enough, pick any bowler except previous
    for (const bowler of this.allBowlers) {
      if (bowler.id !== previousBowler?.id) {
        return bowler
      }
    }
    
    // Absolute last resort: if only one bowler exists, return first bowler
    return this.allBowlers[0]
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
    
    // Get bowler stats
    const bowlerStats = matchState.getBowlerStats(bowler)
    
    // CRITICAL FIX: Enforce maximum spell lengths
    // Pace bowlers: max 10 overs per spell
    // Spinners: max 15 overs per spell
    if (isPace && currentSpell >= 10) {
      return true // Max spell length for pace bowlers
    }
    
    if (isSpin && currentSpell >= 15) {
      return true // Max spell length for spinners
    }
    
    // CRITICAL FIX: Don't remove successful bowlers (unless they've hit max spell)
    if (bowlerStats && bowlerStats.balls >= 36) { // At least 6 overs
      // Check if bowler is taking wickets (2+ in current spell)
      const wicketsInSpell = bowlerStats.wickets
      if (wicketsInSpell >= 2) {
        // Keep them on! They're taking wickets
        // Already checked max spell above, so they can continue
        return false
      }
      
      // Check if bowling economically (under 2.5 runs/over in Tests)
      const economy = bowlerStats.balls > 0 ? (bowlerStats.runs / bowlerStats.balls) * 6 : 0
      if (economy < 2.5) {
        // Keep them on! They're bowling economically
        // Already checked max spell above, so they can continue
        return false
      }
    }
    
    // Check spell length (standard rotation)
    if (isPace && currentSpell >= 8) {
      return true // Pace bowlers need rest after 8 overs (if not successful)
    }
    
    if (isSpin && currentSpell >= 12) {
      return true // Spinners can bowl longer spells
    }
    
    // Check fitness (if available)
    if (bowler.fitness !== undefined && bowler.fitness < 60) {
      return true
    }
    
    // Check if bowler is very expensive (economy > 5 in Tests)
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
    
    // Reset two-end system
    this.endA = null
    this.endB = null
    this.currentEnd = 'A'
    
    for (const bowler of this.allBowlers) {
      this.currentSpells.set(bowler.id, 0)
      this.restingSince.set(bowler.id, null)
      this.totalOversBowled.set(bowler.id, 0)
    }
  }
  
  /**
   * Reset spell tracking for session breaks (lunch, tea, stumps)
   * Bowlers can start fresh spells after breaks
   */
  resetSpellsForSessionBreak() {
    // Reset current spell lengths - bowlers start fresh after break
    for (const bowler of this.allBowlers) {
      this.currentSpells.set(bowler.id, 0)
      this.restingSince.set(bowler.id, null)
    }
    
    // Don't reset two-end system - bowlers can continue from same ends
    // Don't reset total overs bowled - that's for the whole day
  }
}

export default BowlingManager
