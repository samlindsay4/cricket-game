/**
 * Ashes Teams Helper
 * Loads England and Australia teams with player data for The Ashes 2025
 */

import teamsData from '../data/teams.json';
import playersData from '../data/ashesPlayers.json';
import { Player } from '../engine/playerStats.js';

/**
 * Load a team with its players
 * @param {string} teamId - 'england' or 'australia'
 * @returns {Object} Team with Player objects
 */
export function loadAshesTeam(teamId) {
  const teamInfo = teamsData.find(t => t.id === teamId);
  if (!teamInfo) {
    throw new Error(`Team ${teamId} not found`);
  }

  // Load players and convert to Player objects
  const players = teamInfo.players.map(playerId => {
    const playerData = playersData.find(p => p.id === playerId);
    if (!playerData) {
      console.warn(`Player ${playerId} not found`);
      return null;
    }
    return new Player(playerData);
  }).filter(p => p !== null);

  return {
    id: teamInfo.id,
    name: teamInfo.name,
    shortName: teamInfo.shortName,
    color: teamInfo.color,
    homeGround: teamInfo.homeGround,
    captain: teamInfo.captain,
    players: players
  };
}

/**
 * Get England squad for The Ashes
 */
export function getEnglandSquad() {
  return loadAshesTeam('england');
}

/**
 * Get Australia squad for The Ashes
 */
export function getAustraliaSquad() {
  return loadAshesTeam('australia');
}

/**
 * Select playing XI from squad (best 11 players)
 * @param {Object} team - Team object with players
 * @returns {Array} Best 11 players for Test cricket
 */
export function selectTestXI(team) {
  const players = team.players;
  
  // Separate players by role
  const batsmen = players.filter(p => p.role === 'batsman');
  const allRounders = players.filter(p => p.role === 'all_rounder');
  const wicketKeepers = players.filter(p => p.role === 'wicket_keeper');
  const bowlers = players.filter(p => p.role === 'bowler');
  
  const xi = [];
  
  // Select top 5-6 batsmen (sorted by batting rating)
  const topBatsmen = batsmen
    .sort((a, b) => b.getBattingRating() - a.getBattingRating())
    .slice(0, 5);
  xi.push(...topBatsmen);
  
  // Select all-rounders (max 2)
  const topAllRounders = allRounders
    .sort((a, b) => (b.getBattingRating() + b.getBowlingRating()) - (a.getBattingRating() + a.getBowlingRating()))
    .slice(0, Math.min(2, allRounders.length));
  xi.push(...topAllRounders);
  
  // Select wicket keeper (best one)
  if (wicketKeepers.length > 0) {
    const keeper = wicketKeepers
      .sort((a, b) => b.getBattingRating() - a.getBattingRating())[0];
    xi.push(keeper);
  }
  
  // Select bowlers to make up to 11
  // Need balance: pace and spin
  const paceBowlers = bowlers.filter(p => 
    p.bowling.style === 'fast' || 
    p.bowling.style === 'fast_medium'
  ).sort((a, b) => b.getBowlingRating() - a.getBowlingRating());
  
  const spinners = bowlers.filter(p => 
    p.bowling.style && p.bowling.style.includes('spin')
  ).sort((a, b) => b.getBowlingRating() - a.getBowlingRating());
  
  // Add 3 pace bowlers
  xi.push(...paceBowlers.slice(0, 3));
  
  // Add 1 spinner if we have room
  if (xi.length < 11 && spinners.length > 0) {
    xi.push(spinners[0]);
  }
  
  // Fill remaining spots with best bowlers
  if (xi.length < 11) {
    const remainingBowlers = bowlers
      .filter(b => !xi.includes(b))
      .sort((a, b) => b.getBowlingRating() - a.getBowlingRating());
    xi.push(...remainingBowlers.slice(0, 11 - xi.length));
  }
  
  return xi.slice(0, 11);
}

/**
 * Get bowlers from a team
 */
export function getBowlers(players) {
  return players.filter(p => 
    p.role === 'bowler' || p.role === 'all_rounder'
  ).sort((a, b) => b.getBowlingRating() - a.getBowlingRating());
}

/**
 * Perform toss
 */
export function performToss() {
  const winner = Math.random() < 0.5 ? 1 : 2;
  const decision = Math.random() < 0.5 ? 'bat' : 'bowl';
  
  return {
    winner,
    decision
  };
}

export default {
  loadAshesTeam,
  getEnglandSquad,
  getAustraliaSquad,
  selectTestXI,
  getBowlers,
  performToss
};
