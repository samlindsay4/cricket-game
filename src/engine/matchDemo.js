/**
 * Match Demo Script
 * 
 * Quick demonstration script to simulate a full cricket match
 * and display ball-by-ball commentary and final scorecard.
 * 
 * Usage: node matchDemo.js (in a browser environment or with proper imports)
 */

import { simulateMatch } from './matchSimulator.js';
import { Player } from './playerStats.js';
import { MatchConditions } from './matchConditions.js';
import playersData from '../data/players.json';
import teamsData from '../data/teams.json';

/**
 * Load players from JSON data
 */
function loadPlayers() {
  const players = {};
  
  playersData.forEach(playerData => {
    players[playerData.id] = new Player(playerData);
  });
  
  return players;
}

/**
 * Load teams from JSON data
 */
function loadTeams(players) {
  const teams = teamsData.map(teamData => {
    return {
      id: teamData.id,
      name: teamData.name,
      shortName: teamData.shortName,
      color: teamData.color,
      homeGround: teamData.homeGround,
      captain: teamData.captain,
      players: teamData.players.map(playerId => players[playerId]).filter(p => p !== undefined)
    };
  });
  
  return teams;
}

/**
 * Format scorecard for display
 */
function formatScorecard(innings, teamName) {
  let scorecard = `\n${'='.repeat(80)}\n`;
  scorecard += `${teamName} INNINGS - ${innings.runs}/${innings.wickets} (${innings.overs} overs)\n`;
  scorecard += `${'='.repeat(80)}\n`;
  
  // Batting card
  scorecard += `\nBATTING:\n`;
  scorecard += `-`.repeat(80) + '\n';
  scorecard += `Player${' '.repeat(20)}Runs   Balls  4s  6s  SR\n`;
  scorecard += `-`.repeat(80) + '\n';
  
  innings.batsmanStats.forEach(stat => {
    const strikeRate = stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(2) : '0.00';
    const name = stat.id; // In real app, would look up player name
    scorecard += `${name.padEnd(25)}${String(stat.runs).padEnd(6)} ${String(stat.balls).padEnd(6)} ${String(stat.fours).padEnd(3)} ${String(stat.sixes).padEnd(3)} ${strikeRate}\n`;
  });
  
  scorecard += `-`.repeat(80) + '\n';
  scorecard += `Extras: ${innings.extras.wides} wd, ${innings.extras.noBalls} nb, ${innings.extras.byes} b, ${innings.extras.legByes} lb\n`;
  scorecard += `Total: ${innings.runs}/${innings.wickets} (${innings.overs} overs)\n`;
  
  // Bowling card
  scorecard += `\n\nBOWLING:\n`;
  scorecard += `-`.repeat(80) + '\n';
  scorecard += `Bowler${' '.repeat(20)}O    M    R    W    Econ\n`;
  scorecard += `-`.repeat(80) + '\n';
  
  innings.bowlerStats.forEach(stat => {
    const economy = stat.balls > 0 ? ((stat.runs / (stat.balls / 6)).toFixed(2)) : '0.00';
    const overs = `${stat.overs}.${stat.balls % 6}`;
    const name = stat.id; // In real app, would look up player name
    scorecard += `${name.padEnd(25)}${overs.padEnd(4)} ${String(stat.maidens).padEnd(4)} ${String(stat.runs).padEnd(4)} ${String(stat.wickets).padEnd(4)} ${economy}\n`;
  });
  
  scorecard += `-`.repeat(80) + '\n';
  
  // Fall of wickets
  if (innings.fallOfWickets && innings.fallOfWickets.length > 0) {
    scorecard += `\nFall of Wickets:\n`;
    innings.fallOfWickets.forEach((fow, idx) => {
      scorecard += `${idx + 1}-${fow.runs} (${fow.batsman}, ${fow.over} ov)  `;
      if ((idx + 1) % 3 === 0) scorecard += '\n';
    });
    scorecard += '\n';
  }
  
  return scorecard;
}

/**
 * Run a demonstration match
 */
export function runMatchDemo(showCommentary = false) {
  console.log('\n' + '='.repeat(80));
  console.log('CRICKET MATCH SIMULATION - DEMONSTRATION');
  console.log('='.repeat(80) + '\n');
  
  // Load data
  const players = loadPlayers();
  const teams = loadTeams(players);
  
  // Select two teams
  const team1 = teams[0];
  const team2 = teams[1];
  
  console.log(`Match: ${team1.name} vs ${team2.name}`);
  console.log(`Venue: ${team1.homeGround}`);
  
  // Generate match conditions
  const conditions = MatchConditions.generateRandom('T20');
  console.log(`Conditions: ${conditions.getDescription()}\n`);
  
  // Simulate match
  console.log('Simulating match...\n');
  
  const startTime = Date.now();
  const result = simulateMatch(team1, team2, { overs: 20, conditions });
  const endTime = Date.now();
  
  console.log(`Simulation completed in ${endTime - startTime}ms\n`);
  
  // Display scorecards
  console.log(formatScorecard(result.innings.first, team1.name));
  console.log(formatScorecard(result.innings.second, team2.name));
  
  // Display result
  console.log('\n' + '='.repeat(80));
  console.log('MATCH RESULT');
  console.log('='.repeat(80));
  console.log(`\n${result.resultCommentary}\n`);
  console.log(`Winner: ${result.result.winner || 'MATCH TIED'}`);
  if (result.result.winner) {
    console.log(`Margin: ${result.result.margin}`);
  }
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Display commentary if requested
  if (showCommentary) {
    console.log('\n' + '='.repeat(80));
    console.log('BALL-BY-BALL COMMENTARY');
    console.log('='.repeat(80) + '\n');
    
    console.log('FIRST INNINGS:');
    result.innings.first.commentary.slice(0, 50).forEach(comment => {
      console.log(comment);
    });
    if (result.innings.first.commentary.length > 50) {
      console.log(`... (${result.innings.first.commentary.length - 50} more lines)`);
    }
    
    console.log('\nSECOND INNINGS:');
    result.innings.second.commentary.slice(0, 50).forEach(comment => {
      console.log(comment);
    });
    if (result.innings.second.commentary.length > 50) {
      console.log(`... (${result.innings.second.commentary.length - 50} more lines)`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  return result;
}

/**
 * Run quick match between specific teams
 */
export function quickMatch(team1Index = 0, team2Index = 1, overs = 20) {
  const players = loadPlayers();
  const teams = loadTeams(players);
  
  const team1 = teams[team1Index];
  const team2 = teams[team2Index];
  
  const conditions = MatchConditions.generateRandom('T20');
  return simulateMatch(team1, team2, { overs, conditions });
}

export default {
  runMatchDemo,
  quickMatch,
  loadPlayers,
  loadTeams
};
