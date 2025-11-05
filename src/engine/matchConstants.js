/**
 * Match Constants
 * 
 * Shared constants used across the match simulation engine.
 * Extracted to avoid circular dependencies.
 */

/**
 * Possible ball outcomes
 */
export const BALL_OUTCOMES = {
  DOT: 'dot',
  ONE: '1',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  SIX: '6',
  WICKET: 'wicket',
  WIDE: 'wide',
  NO_BALL: 'no_ball',
  BYE: 'bye',
  LEG_BYE: 'leg_bye'
};

/**
 * Wicket types
 */
export const WICKET_TYPES = {
  BOWLED: 'bowled',
  CAUGHT: 'caught',
  LBW: 'lbw',
  RUN_OUT: 'run_out',
  STUMPED: 'stumped',
  HIT_WICKET: 'hit_wicket'
};

export default {
  BALL_OUTCOMES,
  WICKET_TYPES
};
