import React from 'react'

/**
 * MatchScorecard Component
 * Displays cricket match scores in authentic teletext table format
 */
const MatchScorecard = ({ 
  team1Name = "ENGLAND",
  team1Score = "185/4",
  team1Overs = "18.3",
  team2Name = "AUSTRALIA", 
  team2Score = "142/8",
  team2Overs = "20.0",
  batsmen = [
    { name: "J. ROOT", runs: 47, balls: 32, fours: 4, sixes: 1, status: "*" },
    { name: "B. STOKES", runs: 23, balls: 18, fours: 2, sixes: 1, status: "" }
  ],
  bowler = { name: "M. STARC", overs: "3.3", maidens: 0, runs: 28, wickets: 2 }
}) => {
  return (
    <div className="teletext-scorecard">
      {/* Team Scores */}
      <div className="teletext-scorecard-header">
        <div className="teletext-scorecard-team teletext-scorecard-team--home">
          <div className="teletext-scorecard-team__name">{team1Name}</div>
          <div className="teletext-scorecard-team__score">{team1Score}</div>
          <div className="teletext-scorecard-team__overs">({team1Overs} OV)</div>
        </div>
        <div className="teletext-scorecard-divider">VS</div>
        <div className="teletext-scorecard-team teletext-scorecard-team--away">
          <div className="teletext-scorecard-team__name">{team2Name}</div>
          <div className="teletext-scorecard-team__score">{team2Score}</div>
          <div className="teletext-scorecard-team__overs">({team2Overs} OV)</div>
        </div>
      </div>

      {/* Batsmen Stats */}
      <div className="teletext-scorecard-section">
        <div className="teletext-scorecard-section__title">BATTING</div>
        <div className="teletext-scorecard-table">
          <div className="teletext-scorecard-table__header">
            <span className="col-name">BATSMAN</span>
            <span className="col-runs">R</span>
            <span className="col-balls">B</span>
            <span className="col-fours">4s</span>
            <span className="col-sixes">6s</span>
          </div>
          {batsmen.map((batsman, idx) => (
            <div key={idx} className="teletext-scorecard-table__row">
              <span className="col-name">{batsman.status}{batsman.name}</span>
              <span className="col-runs">{batsman.runs}</span>
              <span className="col-balls">{batsman.balls}</span>
              <span className="col-fours">{batsman.fours}</span>
              <span className="col-sixes">{batsman.sixes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bowler Stats */}
      <div className="teletext-scorecard-section">
        <div className="teletext-scorecard-section__title">BOWLING</div>
        <div className="teletext-scorecard-table">
          <div className="teletext-scorecard-table__header">
            <span className="col-name">BOWLER</span>
            <span className="col-overs">O</span>
            <span className="col-maidens">M</span>
            <span className="col-runs">R</span>
            <span className="col-wickets">W</span>
          </div>
          <div className="teletext-scorecard-table__row">
            <span className="col-name">{bowler.name}</span>
            <span className="col-overs">{bowler.overs}</span>
            <span className="col-maidens">{bowler.maidens}</span>
            <span className="col-runs">{bowler.runs}</span>
            <span className="col-wickets">{bowler.wickets}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchScorecard
