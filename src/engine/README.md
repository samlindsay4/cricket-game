# Cricket Match Simulation Engine

A comprehensive, realistic ball-by-ball cricket match simulation engine built with JavaScript.

## Overview

This engine simulates cricket matches using a sophisticated probability-based model that takes into account player statistics, match conditions, fatigue, form, and situational pressures to generate realistic match outcomes.

## Key Features

### 1. **Realistic Probability Model**
- Base probabilities derived from historical T20 cricket statistics
- Dynamic adjustments based on player skill differentials
- Situational modifiers (powerplay, death overs, required run rate)
- Match condition effects (pitch, weather, ground size)

### 2. **Comprehensive Player Attributes**
- Batting: timing, power, technique, temperament, style
- Bowling: pace, accuracy, variation, stamina, style
- Fielding: catching, throwing, agility
- Mental: concentration, pressure handling, adaptability
- Dynamic form, fitness, and confidence

### 3. **Match Conditions**
- **Pitch types**: batting-friendly, bowling-friendly, balanced, turning, slow, bouncy
- **Weather**: sunny, overcast, humid, rainy, windy
- **Ground size**: small, medium, large
- **Dynamic factors**: pitch wear, dew factor
- All conditions affect ball outcomes differently

### 4. **Detailed Statistics Tracking**
- Individual batsman stats (runs, balls, boundaries, strike rate)
- Individual bowler stats (overs, runs, wickets, economy)
- Partnerships and fall of wickets
- Ball-by-ball commentary
- Match summaries and scorecards

### 5. **Momentum & Psychology**
- Confidence changes based on performance
- Form updates after each innings
- Fatigue modeling for bowlers
- Pressure situations affect decision-making

## Architecture

### Core Modules

#### `matchSimulator.js`
Main simulation engine that coordinates the match flow.

**Key Functions:**
- `simulateBall()` - Simulates a single delivery
- `simulateOver()` - Simulates 6 legal deliveries
- `simulateInnings()` - Simulates complete innings
- `simulateMatch()` - Runs full match simulation
- `startMatch()` - Initialize match state
- `getMatchSummary()` - Get current match status

**Classes:**
- `MatchState` - Tracks all match data including scores, wickets, partnerships, commentary

#### `playerStats.js`
Player attribute system and ratings.

**Classes:**
- `Player` - Complete player model with all attributes
- Methods for rating calculations, form updates, aging effects

**Constants:**
- `PLAYER_ROLES` - batsman, bowler, all_rounder, wicket_keeper
- `BATTING_STYLES` - aggressive, balanced, defensive, anchor
- `BOWLING_STYLES` - fast, fast_medium, medium, off_spin, leg_spin, left_arm_spin

#### `probabilityEngine.js`
Probability calculations for ball outcomes.

**Key Features:**
- Base probability distributions from real cricket data
- Player skill differential calculations
- Style-based adjustments (aggressive vs defensive)
- Form and confidence modifiers
- Match situation awareness
- Condition-based modifiers

**Base Probabilities (T20):**
- Dot balls: ~30%
- Singles/Doubles: ~40%
- Boundaries (4s): ~15%
- Sixes: ~5%
- Wickets: ~3%
- Extras: ~2%

#### `commentaryGenerator.js`
Generates varied, realistic ball-by-ball commentary.

**Features:**
- Different commentary for each outcome type
- Variety to avoid repetition (10+ templates per outcome)
- Context-aware (includes player names, scores)
- Over summaries and innings summaries
- Milestone celebrations (50s, 100s, 5-fors)

#### `matchConditions.js`
Models environmental factors affecting play.

**Classes:**
- `MatchConditions` - Manages all condition effects

**Effects:**
- Batting-friendly pitch: +30% boundaries, -30% wickets
- Bowling-friendly pitch: +40% wickets, -30% boundaries
- Turning pitch: +50% spin effectiveness
- Overcast weather: +50% swing, +20% pace effectiveness
- Small ground: +50% sixes, +30% fours
- Pitch wear: Increases spin effectiveness, decreases pace effectiveness

#### `matchUtils.js`
Helper utilities for calculations and formatting.

**Functions:**
- `formatScore()` - "245/6 (45.2)"
- `calculateRunRate()` - Current run rate
- `calculateRequiredRate()` - Target run rate
- `isMatchComplete()` - Check if match over
- `getMatchWinner()` - Determine winner and margin
- `calculateWinProbability()` - Live win probability
- And many more...

### Data Files

#### `players.json`
30 realistic players with varied attributes:
- Star batsmen (high batting stats, 85-90 ratings)
- Fast bowlers (high pace and accuracy)
- Spinners (high variation and accuracy)
- All-rounders (balanced stats)
- Wicket-keepers (high fielding/catching)
- Tail-enders (low batting, high bowling)

#### `teams.json`
6 balanced teams with 11 players each:
- Proper team compositions
- Mix of batsmen, bowlers, all-rounders
- Designated wicket-keepers

## Usage

### Basic Match Simulation

```javascript
import { simulateMatch } from './engine/matchSimulator.js';
import { Player } from './engine/playerStats.js';
import { MatchConditions } from './engine/matchConditions.js';

// Load teams and players
const team1 = { name: 'Team A', players: [...] };
const team2 = { name: 'Team B', players: [...] };

// Set match options
const options = {
  overs: 20,  // T20 match
  conditions: MatchConditions.generateRandom('T20')
};

// Simulate
const result = simulateMatch(team1, team2, options);

// Access results
console.log(result.result.winner);
console.log(result.innings.first.runs);
console.log(result.innings.second.commentary);
```

### Using the Demo Script

```javascript
import { runMatchDemo } from './engine/matchDemo.js';

// Run a complete demo match with commentary
runMatchDemo(true);

// Quick match between specific teams
import { quickMatch } from './engine/matchDemo.js';
const result = quickMatch(0, 1, 20);  // Team 0 vs Team 1, 20 overs
```

### Ball-by-Ball Simulation

```javascript
import { startMatch, simulateBall } from './engine/matchSimulator.js';
import { ProbabilityEngine } from './engine/probabilityEngine.js';

// Initialize match
const matchState = startMatch(team1, team2);

// Create engine
const engine = new ProbabilityEngine(matchState.conditions);

// Set bowler
matchState.bowler = team2.players[7]; // Select a bowler

// Simulate balls one at a time
const result = simulateBall(matchState, engine);
console.log(result.commentary);  // "FOUR! Batsman finds the boundary!"
```

## Realism Principles

### 1. Probability-Based, Not Random
All outcomes use weighted probabilities based on:
- Historical cricket statistics
- Player skill differentials
- Current match situation
- Environmental conditions

### 2. Momentum Matters
- Wickets reduce batting team confidence
- Boundaries boost batsman confidence
- Consecutive dot balls increase pressure
- Bowler confidence affects effectiveness

### 3. Fatigue Modeling
- Bowlers lose effectiveness after sustained spells
- Fitness drops every 2 overs bowled
- Affects both pace and accuracy

### 4. Situational Awareness
- Required run rate affects risk-taking
- Death overs see more aggressive batting
- Powerplay has field restrictions effect
- Match pressure affects decision-making

### 5. Player Matchups
- Fast bowlers more effective vs tail-enders
- Spinners better on turning pitches
- Aggressive batsmen score faster but get out more
- Defensive batsmen survive longer but score slower

## Statistical Accuracy

The engine generates realistic statistics matching real T20 cricket:

**Typical T20 Scores:** 150-180 runs
**Dot Ball %:** 28-35%
**Boundary %:** 18-22%
**Economy Rates:** 7-9 runs per over
**Strike Rates:** 120-140 for batsmen
**Wickets per Over:** ~0.5

## Performance

- Single ball simulation: < 1ms
- Full over (6 balls): < 5ms
- Complete T20 match (240 balls): < 500ms
- Includes all statistics tracking and commentary generation

## Extension Points

### Custom Match Formats
Easily adapt for ODI (50 overs) or Test cricket by adjusting:
- Total overs
- Probability distributions
- Fatigue rates

### Machine Learning Integration
The probability engine can be enhanced with:
- Historical match data training
- Player form prediction
- Win probability models

### UI Integration
All match state is exportable for:
- Live scoreboards
- Ball-by-ball displays
- Statistics dashboards
- Replay systems

## Testing

Run the test suite:

```javascript
import { runTests } from './engine/testSuite.js';
runTests();
```

This validates:
- Player creation and ratings
- Probability calculations
- Match condition effects
- Ball simulation accuracy
- State management

## Future Enhancements

1. **Advanced Statistics**
   - Wagon wheels and heat maps
   - Player vs player records
   - Venue-specific statistics

2. **Career Mode**
   - Player development over seasons
   - Transfers and team changes
   - Tournament structures

3. **Multiplayer**
   - Human captain decision-making
   - Team selection
   - Tactical changes mid-match

4. **Detailed Fielding**
   - Catching chances
   - Run-out opportunities
   - Fielding positions

## License

MIT License - See LICENSE file for details

## Credits

Developed for Cricket Captaincy Career Manager
Inspired by classic cricket management games and real cricket statistics
