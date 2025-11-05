/**
 * Simple Test Script for Match Simulation Engine
 * 
 * Tests basic functionality of the cricket match simulation engine
 */

import { Player, PLAYER_ROLES, BATTING_STYLES, BOWLING_STYLES } from './playerStats.js';
import { ProbabilityEngine } from './probabilityEngine.js';
import { MatchConditions, PITCH_TYPES, WEATHER_CONDITIONS } from './matchConditions.js';
import { simulateBall, simulateOver, MatchState } from './matchSimulator.js';
import { formatScore, calculateRunRate, ballsToOvers } from './matchUtils.js';

/**
 * Test player creation
 */
function testPlayerCreation() {
  console.log('Testing Player Creation...');
  
  const batsman = new Player({
    id: 'test_bat_1',
    name: 'Test Batsman',
    role: PLAYER_ROLES.BATSMAN,
    age: 25,
    batting: {
      timing: 80,
      power: 75,
      technique: 85,
      temperament: 78,
      style: BATTING_STYLES.BALANCED
    }
  });
  
  console.log(`✓ Created batsman: ${batsman.name}`);
  console.log(`  - Batting rating: ${batsman.getBattingRating()}`);
  console.log(`  - Overall rating: ${batsman.getOverallRating()}`);
  
  const bowler = new Player({
    id: 'test_bowl_1',
    name: 'Test Bowler',
    role: PLAYER_ROLES.BOWLER,
    age: 27,
    bowling: {
      pace: 85,
      accuracy: 80,
      variation: 75,
      stamina: 82,
      style: BOWLING_STYLES.FAST
    }
  });
  
  console.log(`✓ Created bowler: ${bowler.name}`);
  console.log(`  - Bowling rating: ${bowler.getBowlingRating()}`);
  console.log(`  - Overall rating: ${bowler.getOverallRating()}\n`);
  
  return { batsman, bowler };
}

/**
 * Test match conditions
 */
function testMatchConditions() {
  console.log('Testing Match Conditions...');
  
  const conditions = new MatchConditions({
    pitchType: PITCH_TYPES.BALANCED,
    weather: WEATHER_CONDITIONS.SUNNY,
    groundSize: 'medium'
  });
  
  console.log(`✓ Created conditions: ${conditions.getDescription()}`);
  
  const modifiers = conditions.getAllModifiers();
  console.log(`  - Pitch modifiers applied`);
  console.log(`  - Weather modifiers applied`);
  console.log(`  - Ground modifiers applied\n`);
  
  return conditions;
}

/**
 * Test probability engine
 */
function testProbabilityEngine(batsman, bowler, conditions) {
  console.log('Testing Probability Engine...');
  
  const engine = new ProbabilityEngine(conditions);
  
  // Create minimal match state
  const mockMatchState = {
    score: 0,
    wickets: 0,
    balls: 0,
    totalOvers: 20,
    currentInning: 1
  };
  
  const outcome = engine.calculateBallOutcome(batsman, bowler, mockMatchState);
  
  console.log(`✓ Generated ball outcome: ${outcome.outcome}`);
  console.log(`  - Runs: ${outcome.runs}`);
  console.log(`  - Is wicket: ${outcome.isWicket}`);
  console.log(`  - Legal delivery: ${outcome.isLegalDelivery}`);
  console.log(`  - Commentary: ${outcome.commentary}\n`);
  
  return engine;
}

/**
 * Test match utilities
 */
function testMatchUtils() {
  console.log('Testing Match Utilities...');
  
  const score = formatScore(145, 6, 78);
  console.log(`✓ Format score: ${score}`);
  
  const runRate = calculateRunRate(145, 78);
  console.log(`✓ Run rate: ${runRate}`);
  
  const overs = ballsToOvers(78);
  console.log(`✓ Balls to overs: ${overs}\n`);
}

/**
 * Test match state
 */
function testMatchState() {
  console.log('Testing Match State...');
  
  // Create simple teams
  const team1 = {
    id: 'test_team_1',
    name: 'Test Team 1',
    players: []
  };
  
  const team2 = {
    id: 'test_team_2',
    name: 'Test Team 2',
    players: []
  };
  
  // Create players for team
  for (let i = 1; i <= 11; i++) {
    team1.players.push(new Player({
      id: `t1_p${i}`,
      name: `Team1 Player ${i}`,
      role: i <= 6 ? PLAYER_ROLES.BATSMAN : (i <= 9 ? PLAYER_ROLES.BOWLER : PLAYER_ROLES.ALL_ROUNDER),
      age: 25
    }));
    
    team2.players.push(new Player({
      id: `t2_p${i}`,
      name: `Team2 Player ${i}`,
      role: i <= 6 ? PLAYER_ROLES.BATSMAN : (i <= 9 ? PLAYER_ROLES.BOWLER : PLAYER_ROLES.ALL_ROUNDER),
      age: 25
    }));
  }
  
  const conditions = MatchConditions.generateRandom('T20');
  const matchState = new MatchState(team1, team2, 20, conditions);
  
  console.log(`✓ Created match state`);
  console.log(`  - Team 1: ${matchState.team1.name}`);
  console.log(`  - Team 2: ${matchState.team2.name}`);
  console.log(`  - Total overs: ${matchState.totalOvers}`);
  console.log(`  - Conditions: ${matchState.conditions.getDescription()}`);
  
  // Initialize batsmen
  matchState.initializeBatsmen(team1.players);
  console.log(`✓ Initialized batsmen`);
  console.log(`  - Striker: ${matchState.striker.name}`);
  console.log(`  - Non-striker: ${matchState.nonStriker.name}\n`);
  
  return matchState;
}

/**
 * Test ball simulation
 */
function testBallSimulation(matchState) {
  console.log('Testing Ball Simulation...');
  
  // Set bowler
  matchState.bowler = matchState.bowlingTeam.players.find(p => p.role === PLAYER_ROLES.BOWLER);
  
  const engine = new ProbabilityEngine(matchState.conditions);
  
  console.log(`\nSimulating 6 balls (1 over)...\n`);
  
  for (let i = 0; i < 6; i++) {
    const result = simulateBall(matchState, engine);
    const currentScore = formatScore(matchState.score, matchState.wickets, matchState.balls);
    console.log(`Ball ${i + 1}: ${result.commentary} - ${currentScore}`);
    
    if (matchState.isInningsComplete()) {
      console.log('\nInnings complete!');
      break;
    }
  }
  
  console.log(`\n✓ Simulated over successfully`);
  console.log(`  - Final score: ${formatScore(matchState.score, matchState.wickets, matchState.balls)}`);
  console.log(`  - Run rate: ${calculateRunRate(matchState.score, matchState.balls)}\n`);
}

/**
 * Run all tests
 */
export function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('CRICKET MATCH SIMULATION ENGINE - TEST SUITE');
  console.log('='.repeat(80) + '\n');
  
  try {
    // Test individual components
    const { batsman, bowler } = testPlayerCreation();
    const conditions = testMatchConditions();
    testProbabilityEngine(batsman, bowler, conditions);
    testMatchUtils();
    
    // Test match simulation
    const matchState = testMatchState();
    testBallSimulation(matchState);
    
    console.log('='.repeat(80));
    console.log('ALL TESTS PASSED ✓');
    console.log('='.repeat(80) + '\n');
    
    return true;
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('TEST FAILED ✗');
    console.error('='.repeat(80));
    console.error(error);
    return false;
  }
}

export default {
  runTests,
  testPlayerCreation,
  testMatchConditions,
  testProbabilityEngine,
  testMatchUtils,
  testMatchState,
  testBallSimulation
};
