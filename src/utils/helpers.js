/**
 * Utility helper functions
 */

/**
 * Format a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Calculate batting average
 * @param {number} runs - Total runs scored
 * @param {number} dismissals - Number of times dismissed
 * @returns {number} Average
 */
export function calculateAverage(runs, dismissals) {
  if (dismissals === 0) return runs
  return parseFloat((runs / dismissals).toFixed(2))
}

/**
 * Calculate strike rate
 * @param {number} runs - Runs scored
 * @param {number} balls - Balls faced
 * @returns {number} Strike rate
 */
export function calculateStrikeRate(runs, balls) {
  if (balls === 0) return 0
  return parseFloat(((runs / balls) * 100).toFixed(2))
}

/**
 * Calculate economy rate
 * @param {number} runs - Runs conceded
 * @param {number} overs - Overs bowled
 * @returns {number} Economy rate
 */
export function calculateEconomy(runs, overs) {
  if (overs === 0) return 0
  return parseFloat((runs / overs).toFixed(2))
}

/**
 * Convert balls to overs (e.g., 13 balls = 2.1 overs)
 * @param {number} balls - Number of balls
 * @returns {string} Overs in format "X.Y"
 */
export function ballsToOvers(balls) {
  const completedOvers = Math.floor(balls / 6)
  const remainingBalls = balls % 6
  return `${completedOvers}.${remainingBalls}`
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export default {
  formatNumber,
  calculateAverage,
  calculateStrikeRate,
  calculateEconomy,
  ballsToOvers,
  randomInt,
  clamp
}
