/**
 * Commentary Generator
 * 
 * Generates realistic ball-by-ball commentary for match simulation.
 * Provides variety in commentary to avoid repetition and includes
 * contextual information like player names, scores, and match situation.
 */

/**
 * Commentary templates for different outcomes
 */
const COMMENTARY_TEMPLATES = {
  dot: [
    '{batsman} defends solidly back to the bowler.',
    'Dot ball. Well bowled by {bowler}.',
    '{batsman} lets it go through to the keeper.',
    'Good length delivery, {batsman} leaves it alone.',
    '{batsman} blocks it defensively.',
    '{bowler} beats the bat! Close call.',
    'Defended watchfully by {batsman}.',
    'Good tight bowling from {bowler}.',
    '{batsman} plays and misses! Lucky to survive that one.',
    'Left alone outside off stump by {batsman}.'
  ],
  single: [
    '{batsman} pushes it for a single.',
    'Quick single taken!',
    '{batsman} nudges it into the gap for one.',
    'Worked away for a single.',
    'Easy single to {batsman}.',
    '{batsman} taps it towards {fielder} for a quick single.',
    'Smart cricket, rotating the strike for a single.',
    '{batsman} glides it to third man for one.',
    'Pushed into the off-side for a single.',
    '{batsman} flicks it off his pads for one.'
  ],
  two: [
    '{batsman} takes two runs!',
    'Good running between the wickets, they take two.',
    '{batsman} drives it into the gap for a couple.',
    'Excellent running! Two runs added.',
    'They scramble back for the second run.',
    '{batsman} places it perfectly for two.',
    'Good shot, they run hard for two!',
    'Clipped away for a couple of runs.',
    '{batsman} finds the gap, comes back for two.',
    'Two runs as {batsman} times it well.'
  ],
  three: [
    '{batsman} runs hard and they take three!',
    'Brilliant running! Three runs!',
    '{batsman} pushes it into the deep, they run three.',
    'Excellent placement, three runs to {batsman}.',
    'They sprint back for the third!',
    'Great running between the wickets, three runs.',
    '{batsman} finds the gap perfectly for three.',
    'Misfield in the deep! Three runs.',
    'Outstanding running, they complete three runs!',
    '{batsman} times it well, three runs added.'
  ],
  four: [
    'FOUR! {batsman} finds the boundary!',
    'Shot! Magnificent four by {batsman}!',
    'FOUR! That races away to the fence!',
    'Beautiful shot! Four runs!',
    '{batsman} cracks it through the covers for FOUR!',
    'BOUNDARY! {batsman} punches it brilliantly!',
    'FOUR! Sweetly timed by {batsman}!',
    'Glorious shot! That\'s four all the way!',
    '{batsman} drives it superbly for FOUR!',
    'FOUR! {batsman} threads the gap perfectly!'
  ],
  six: [
    'SIX! {batsman} sends it sailing over the boundary!',
    'MAXIMUM! What a hit by {batsman}!',
    'OUT OF THE PARK! Six runs!',
    'SIX! Massive shot from {batsman}!',
    '{batsman} launches it for SIX!',
    'HUGE! That\'s gone all the way for six!',
    'SIX! {batsman} clears the ropes with ease!',
    'Incredible power! SIX runs!',
    '{batsman} sends it into the stands! SIX!',
    'MONSTER HIT! Six runs to {batsman}!'
  ],
  wide: [
    'Wide ball! {bowler} sprays it down the leg side.',
    'Wide! Poor delivery from {bowler}.',
    'That\'s called wide, pressure showing on {bowler}.',
    'Wide! {bowler} loses his line.',
    'Down the leg side, wide signaled.',
    'Wide ball, {bowler} needs to find his accuracy.',
    'That\'s too wide outside off, extra run conceded.',
    'Wide! {bowler} strays off the line.',
    'Poor ball, wide called.',
    'Wide delivery, {batsman} had no chance to reach that.'
  ],
  noBall: [
    'No ball! {bowler} oversteps.',
    'NO BALL! Front foot gone over the line.',
    'That\'s a no ball, free hit coming up!',
    'No ball called! {bowler} oversteps the crease.',
    'Front foot no ball from {bowler}.',
    'NO BALL! {bowler} needs to watch his run-up.',
    'No ball, extra run and a free hit!',
    'Overstepping, that\'s a no ball.',
    'NO BALL! {bowler} crosses the line.',
    'No ball called by the umpire, free hit next ball!'
  ],
  wicket: {
    bowled: [
      'BOWLED! {batsman} is cleaned up by {bowler}!',
      'TIMBER! {bowler} crashes through the defenses!',
      'OUT! {batsman} bowled! What a delivery from {bowler}!',
      'KNOCKED HIM OVER! {batsman} departs, bowled by {bowler}!',
      '{bowler} sends the stumps flying! {batsman} is gone!',
      'BOWLED! Perfect delivery from {bowler}!',
      'THROUGH THE GATE! {batsman} is bowled!',
      'OUT! The stumps are shattered! {bowler} strikes!',
      'CLEANED UP! {batsman} can\'t believe it!',
      'BOWLED! {bowler} gets his man!'
    ],
    caught: [
      'OUT! Caught! {batsman} departs!',
      'CAUGHT! {bowler} gets the breakthrough!',
      'Excellent catch! {batsman} is gone!',
      'OUT! {batsman} caught by {fielder}! Brilliant bowling from {bowler}!',
      'IN THE AIR... AND TAKEN! {batsman} is out!',
      'CAUGHT! Superb catch to dismiss {batsman}!',
      'OUT! {fielder} takes a brilliant catch!',
      'GONE! {batsman} finds the fielder!',
      'CAUGHT! {bowler} strikes! {batsman} departs!',
      'Excellent bowling! {batsman} caught out!'
    ],
    lbw: [
      'OUT! LBW! {batsman} has to go!',
      'That\'s plumb! LBW! {batsman} is out!',
      'OUT! Given LBW! {bowler} gets his man!',
      'LBW! {batsman} trapped in front!',
      'THAT\'S OUT! LBW to {bowler}!',
      'Trapped! LBW! {batsman} is gone!',
      'OUT! Hitting middle and leg! LBW!',
      'Dead in front! LBW! {batsman} departs!',
      'LBW! Perfect delivery from {bowler}!',
      'OUT! {batsman} given out LBW!'
    ],
    runOut: [
      'RUN OUT! {batsman} is short of the crease!',
      'OUT! Direct hit! {batsman} is run out!',
      'RUN OUT! Brilliant fielding!',
      'OUT! {batsman} is run out! Miscommunication!',
      'RUN OUT! {batsman} sacrifices his wicket!',
      'Direct hit! {batsman} is well short!',
      'RUN OUT! Poor running costs {batsman} his wicket!',
      'Brilliant throw! {batsman} is run out!',
      'OUT! {batsman} run out by {fielder}!',
      'RUN OUT! {batsman} caught short!'
    ],
    stumped: [
      'STUMPED! {batsman} is out!',
      'OUT! Stumped! Lightning fast work from the keeper!',
      'STUMPED! {batsman} beaten by the turn!',
      'OUT! {batsman} stumped! Brilliant bowling from {bowler}!',
      'STUMPED! {batsman} ventures out and misses!',
      'OUT! Quick hands from the keeper! {batsman} stumped!',
      'STUMPED! {bowler} deceives {batsman}!',
      'OUT! {batsman} out of his crease and stumped!',
      'Brilliant keeping! {batsman} stumped!',
      'STUMPED! {batsman} beaten all ends up!'
    ],
    hitWicket: [
      'OUT! Hit wicket! {batsman} knocks over his own stumps!',
      'HIT WICKET! Unfortunate dismissal for {batsman}!',
      'OUT! {batsman} dislodges the bails! Hit wicket!',
      'WHAT A WAY TO GO! {batsman} hit wicket!',
      'Hit wicket! {batsman} steps on his stumps!',
      'OUT! Unlucky! {batsman} hit wicket!',
      'Hit wicket! Clumsy work from {batsman}!',
      'OUT! {batsman} treads on his wicket!',
      'HIT WICKET! {batsman} has to go!',
      'Out hit wicket! Bizarre dismissal!'
    ]
  }
};

/**
 * Generate commentary for a ball outcome
 * @param {string} outcome - Type of outcome (dot, single, four, six, wicket, etc.)
 * @param {Object} players - Object containing batsman, bowler, fielder names
 * @param {Object} matchContext - Current match context (score, overs, etc.)
 * @param {string} wicketType - Type of wicket if outcome is wicket
 * @returns {string} Generated commentary
 */
export function generateCommentary(outcome, players, matchContext = {}, wicketType = null) {
  const { batsman = 'Batsman', bowler = 'Bowler', fielder = 'the fielder' } = players;
  
  let templates;
  
  // Handle wicket commentary specially
  if (outcome === 'wicket' && wicketType) {
    templates = COMMENTARY_TEMPLATES.wicket[wicketType] || COMMENTARY_TEMPLATES.wicket.caught;
  } else {
    templates = COMMENTARY_TEMPLATES[outcome] || COMMENTARY_TEMPLATES.dot;
  }
  
  // Select random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders
  let commentary = template
    .replace(/{batsman}/g, batsman)
    .replace(/{bowler}/g, bowler)
    .replace(/{fielder}/g, fielder);
  
  // Add context if available
  if (matchContext.addScore) {
    commentary += ` Score: ${matchContext.score}/${matchContext.wickets}`;
  }
  
  return commentary;
}

/**
 * Generate over summary commentary
 * @param {Array} overResults - Array of ball results from the over
 * @param {Object} bowler - Bowler object
 * @param {number} overNumber - Over number
 * @returns {string} Over summary
 */
export function generateOverSummary(overResults, bowler, overNumber) {
  const runs = overResults.reduce((sum, ball) => sum + (ball.runs || 0), 0);
  const wickets = overResults.filter(ball => ball.isWicket).length;
  const dots = overResults.filter(ball => ball.outcome === 'dot').length;
  
  let summary = `End of over ${overNumber}: ${runs} run${runs !== 1 ? 's' : ''}`;
  
  if (wickets > 0) {
    summary += `, ${wickets} wicket${wickets !== 1 ? 's' : ''}`;
  }
  
  if (dots >= 4) {
    summary += ` - Tight over from ${bowler.name}!`;
  } else if (runs >= 15) {
    summary += ` - Expensive over from ${bowler.name}!`;
  }
  
  return summary;
}

/**
 * Generate innings summary commentary
 * @param {Object} inningsData - Innings statistics
 * @param {string} teamName - Name of batting team
 * @returns {string} Innings summary
 */
export function generateInningsSummary(inningsData, teamName) {
  const { runs, wickets, overs } = inningsData;
  
  let summary = `${teamName} finished their innings at ${runs}/${wickets} in ${overs} overs.`;
  
  if (runs >= 200) {
    summary += ' A massive total!';
  } else if (runs <= 120) {
    summary += ' The bowlers dominated!';
  }
  
  return summary;
}

/**
 * Generate match result commentary
 * @param {Object} result - Match result object
 * @returns {string} Result commentary
 */
export function generateMatchResult(result) {
  if (!result.winner) {
    return 'MATCH TIED! What an incredible finish!';
  }
  
  return `${result.winner} wins ${result.margin}! Congratulations to the team!`;
}

/**
 * Generate milestone commentary (50, 100 runs, etc.)
 * @param {Object} player - Player who reached milestone
 * @param {number} milestone - Milestone reached
 * @param {string} type - Type of milestone (runs, wickets)
 * @returns {string} Milestone commentary
 */
export function generateMilestone(player, milestone, type = 'runs') {
  if (type === 'runs') {
    const messages = {
      50: `FIFTY for ${player.name}! Brilliant innings!`,
      100: `CENTURY! ${player.name} reaches 100! What a knock!`,
      150: `150 runs for ${player.name}! Phenomenal batting!`
    };
    return messages[milestone] || `${player.name} reaches ${milestone} ${type}!`;
  } else if (type === 'wickets') {
    const messages = {
      3: `Hat-trick opportunity for ${player.name}!`,
      5: `FIVE-FOR! ${player.name} takes his 5th wicket! Outstanding bowling!`
    };
    return messages[milestone] || `${player.name} takes wicket number ${milestone}!`;
  }
  
  return `Milestone reached: ${milestone} ${type}!`;
}

export default {
  generateCommentary,
  generateOverSummary,
  generateInningsSummary,
  generateMatchResult,
  generateMilestone
};
