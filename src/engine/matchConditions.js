/**
 * Match Conditions Module
 * 
 * Defines and manages various match conditions that affect ball outcomes:
 * - Pitch conditions (batting-friendly, bowling-friendly, etc.)
 * - Weather conditions (sunny, overcast, humid)
 * - Time of day (affects visibility, dew)
 * - Pitch wear (increases as match progresses)
 * 
 * These conditions modify the base probabilities in the probability engine.
 */

import { BOWLING_STYLES } from './playerStats.js';

/**
 * Pitch type definitions
 */
export const PITCH_TYPES = {
  BATTING: 'batting',      // Flat, hard pitch - favors batsmen
  BOWLING: 'bowling',      // Green, seaming pitch - favors fast bowlers
  BALANCED: 'balanced',    // Equal conditions for both
  TURNING: 'turning',      // Dry, dusty pitch - favors spinners
  SLOW: 'slow',           // Slow, low bounce - harder to score
  BOUNCY: 'bouncy'        // Extra bounce - helps fast bowlers
};

/**
 * Weather conditions
 */
export const WEATHER_CONDITIONS = {
  SUNNY: 'sunny',         // Clear, bright conditions
  OVERCAST: 'overcast',   // Cloudy, helps swing bowling
  HUMID: 'humid',         // Hot and humid, tiring for bowlers
  RAIN: 'rain',           // Wet conditions, slippery ball
  WINDY: 'windy'          // Windy, affects flight of ball
};

/**
 * Match Conditions class
 */
export class MatchConditions {
  constructor(config = {}) {
    this.pitchType = config.pitchType || PITCH_TYPES.BALANCED;
    this.weather = config.weather || WEATHER_CONDITIONS.SUNNY;
    this.pitchWear = config.pitchWear || 0; // 0-100, increases over time
    this.dewFactor = config.dewFactor || 0; // 0-100, evening matches
    this.groundSize = config.groundSize || 'medium'; // small, medium, large
    this.altitude = config.altitude || 'sea_level'; // sea_level, high
  }

  /**
   * Get pitch modifiers for probability calculations
   * @returns {Object} Modifiers for different outcomes
   */
  getPitchModifiers() {
    const modifiers = {
      dot: 1.0,
      single: 1.0,
      boundaries: 1.0,
      wickets: 1.0,
      pace_effectiveness: 1.0,
      spin_effectiveness: 1.0
    };

    switch (this.pitchType) {
      case PITCH_TYPES.BATTING:
        modifiers.boundaries = 1.3;
        modifiers.dot = 0.8;
        modifiers.wickets = 0.7;
        modifiers.pace_effectiveness = 0.8;
        modifiers.spin_effectiveness = 0.8;
        break;
        
      case PITCH_TYPES.BOWLING:
        modifiers.boundaries = 0.7;
        modifiers.dot = 1.2;
        modifiers.wickets = 1.4;
        modifiers.pace_effectiveness = 1.4;
        modifiers.spin_effectiveness = 0.9;
        break;
        
      case PITCH_TYPES.TURNING:
        modifiers.boundaries = 0.9;
        modifiers.dot = 1.1;
        modifiers.wickets = 1.2;
        modifiers.pace_effectiveness = 0.8;
        modifiers.spin_effectiveness = 1.5;
        break;
        
      case PITCH_TYPES.SLOW:
        modifiers.boundaries = 0.8;
        modifiers.single = 1.2;
        modifiers.dot = 1.1;
        modifiers.wickets = 0.9;
        modifiers.pace_effectiveness = 0.7;
        break;
        
      case PITCH_TYPES.BOUNCY:
        modifiers.boundaries = 1.1;
        modifiers.wickets = 1.1;
        modifiers.pace_effectiveness = 1.3;
        modifiers.spin_effectiveness = 0.9;
        break;
        
      default: // BALANCED
        // No modifications needed
        break;
    }

    // Apply pitch wear effects
    const wearFactor = this.pitchWear / 100;
    modifiers.spin_effectiveness *= (1 + wearFactor * 0.5);
    modifiers.pace_effectiveness *= (1 - wearFactor * 0.3);
    modifiers.boundaries *= (1 - wearFactor * 0.2);

    return modifiers;
  }

  /**
   * Get weather modifiers
   * @returns {Object} Weather-based modifiers
   */
  getWeatherModifiers() {
    const modifiers = {
      swing: 1.0,
      pace_effectiveness: 1.0,
      spin_effectiveness: 1.0,
      visibility: 1.0,
      stamina_drain: 1.0
    };

    switch (this.weather) {
      case WEATHER_CONDITIONS.OVERCAST:
        modifiers.swing = 1.5;
        modifiers.pace_effectiveness = 1.2;
        modifiers.visibility = 0.9;
        break;
        
      case WEATHER_CONDITIONS.HUMID:
        modifiers.stamina_drain = 1.4;
        modifiers.swing = 1.2;
        break;
        
      case WEATHER_CONDITIONS.RAIN:
        modifiers.swing = 1.3;
        modifiers.pace_effectiveness = 0.8;
        modifiers.spin_effectiveness = 0.7;
        break;
        
      case WEATHER_CONDITIONS.WINDY:
        modifiers.swing = 0.8;
        modifiers.spin_effectiveness = 0.9;
        break;
        
      default: // SUNNY
        modifiers.spin_effectiveness = 1.1;
        break;
    }

    // Dew factor (mainly affects evening matches)
    if (this.dewFactor > 0) {
      const dewImpact = this.dewFactor / 100;
      modifiers.swing *= (1 - dewImpact * 0.3);
      modifiers.spin_effectiveness *= (1 - dewImpact * 0.4);
      modifiers.pace_effectiveness *= (1 + dewImpact * 0.2);
    }

    return modifiers;
  }

  /**
   * Get ground size modifiers
   * @returns {Object} Ground-based modifiers
   */
  getGroundModifiers() {
    const modifiers = {
      six_probability: 1.0,
      four_probability: 1.0,
      two_runs: 1.0,
      three_runs: 1.0
    };

    switch (this.groundSize) {
      case 'small':
        modifiers.six_probability = 1.5;
        modifiers.four_probability = 1.3;
        modifiers.two_runs = 0.8;
        modifiers.three_runs = 0.7;
        break;
        
      case 'large':
        modifiers.six_probability = 0.6;
        modifiers.four_probability = 0.8;
        modifiers.two_runs = 1.3;
        modifiers.three_runs = 1.5;
        break;
        
      default: // medium
        // No modifications needed
        break;
    }

    // Altitude effect (thin air at high altitude)
    if (this.altitude === 'high') {
      modifiers.six_probability *= 1.2;
      modifiers.four_probability *= 1.1;
    }

    return modifiers;
  }

  /**
   * Get all combined modifiers
   * @returns {Object} All condition modifiers combined
   */
  getAllModifiers() {
    return {
      pitch: this.getPitchModifiers(),
      weather: this.getWeatherModifiers(),
      ground: this.getGroundModifiers()
    };
  }

  /**
   * Update pitch wear as match progresses
   * @param {number} oversPlayed - Number of overs played
   */
  updatePitchWear(oversPlayed) {
    // Pitch deteriorates as match progresses
    // In T20: minimal wear (max ~30)
    // In ODI: moderate wear (max ~60)
    // In Test: significant wear (max ~100)
    const wearRate = 0.5; // Adjust based on match format
    this.pitchWear = Math.min(100, this.pitchWear + wearRate);
  }

  /**
   * Update dew factor (increases in evening)
   * @param {number} oversPlayed - Number of overs played in current innings
   */
  updateDewFactor(oversPlayed) {
    // Dew typically sets in during evening matches
    // Increases gradually after first 10 overs of second innings
    if (oversPlayed > 10) {
      const dewIncrease = (oversPlayed - 10) * 2;
      this.dewFactor = Math.min(100, this.dewFactor + dewIncrease);
    }
  }

  /**
   * Get bowling type effectiveness
   * @param {string} bowlingStyle - Type of bowling (fast, spin, etc.)
   * @returns {number} Effectiveness multiplier
   */
  getBowlingEffectiveness(bowlingStyle) {
    const pitchMods = this.getPitchModifiers();
    const weatherMods = this.getWeatherModifiers();
    
    if (bowlingStyle === BOWLING_STYLES.FAST || bowlingStyle === BOWLING_STYLES.FAST_MEDIUM) {
      return pitchMods.pace_effectiveness * weatherMods.pace_effectiveness;
    } else if (
      bowlingStyle === BOWLING_STYLES.SPIN_OFF ||
      bowlingStyle === BOWLING_STYLES.SPIN_LEG ||
      bowlingStyle === BOWLING_STYLES.SPIN_LEFT_ARM
    ) {
      return pitchMods.spin_effectiveness * weatherMods.spin_effectiveness;
    }
    
    return 1.0;
  }

  /**
   * Generate a random match condition setup
   * @param {string} matchType - Type of match (T20, ODI, Test)
   * @returns {MatchConditions} Random conditions
   */
  static generateRandom(matchType = 'T20') {
    const pitchTypes = Object.values(PITCH_TYPES);
    const weatherTypes = Object.values(WEATHER_CONDITIONS);
    const groundSizes = ['small', 'medium', 'large'];
    
    return new MatchConditions({
      pitchType: pitchTypes[Math.floor(Math.random() * pitchTypes.length)],
      weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
      pitchWear: 0,
      dewFactor: Math.random() < 0.3 ? Math.floor(Math.random() * 30) : 0,
      groundSize: groundSizes[Math.floor(Math.random() * groundSizes.length)],
      altitude: Math.random() < 0.1 ? 'high' : 'sea_level'
    });
  }

  /**
   * Get description of current conditions
   * @returns {string} Human-readable description
   */
  getDescription() {
    let desc = `Pitch: ${this.pitchType}, Weather: ${this.weather}`;
    
    if (this.pitchWear > 50) {
      desc += ', Pitch showing signs of wear';
    }
    
    if (this.dewFactor > 30) {
      desc += ', Dew settling in';
    }
    
    desc += `, Ground: ${this.groundSize}`;
    
    if (this.altitude === 'high') {
      desc += ', High altitude';
    }
    
    return desc;
  }
}

export default {
  MatchConditions,
  PITCH_TYPES,
  WEATHER_CONDITIONS
};
