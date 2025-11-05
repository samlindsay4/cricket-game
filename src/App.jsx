import React, { useState } from 'react'
import './styles/teletext.css'
import TeletextPage from './components/TeletextPage'
import MainMenu from './components/MainMenu'
import MatchScorecard from './components/MatchScorecard'
import TeletextButton from './components/TeletextButton'
import LoadingScreen from './components/LoadingScreen'
import LiveMatch from './components/LiveMatch'
import TestMatchLive from './components/TestMatchLive'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('P100')

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <>
      {/* P100 - Main Menu */}
      {currentPage === 'P100' && (
        <TeletextPage pageNumber="P100" title="CRICKET MANAGER - MAIN MENU">
          <div className="teletext-title">
            ═══════════════════════════════════
            <br />
            CRICKET CAPTAINCY CAREER MANAGER
            <br />
            ═══════════════════════════════════
          </div>

          <div className="teletext-block teletext-block--blue">
            <h2 className="teletext-subtitle">WELCOME TO THE PAVILION</h2>
            <p className="teletext-text teletext-text--white">
              Take command of your cricket career!
              <br />
              Select an option below to continue.
            </p>
          </div>

          <MainMenu onNavigate={handleNavigate} />

          <div className="teletext-grid">
            <div className="teletext-stat">
              <div className="teletext-stat__label">VERSION</div>
              <div className="teletext-stat__value">0.0.1</div>
            </div>
            <div className="teletext-stat">
              <div className="teletext-stat__label">STATUS</div>
              <div className="teletext-stat__value teletext-text--green">ALPHA</div>
            </div>
          </div>
        </TeletextPage>
      )}

      {/* P200 - New Game */}
      {currentPage === 'P200' && (
        <TeletextPage pageNumber="P200" title="THE ASHES 2025">
          <div className="teletext-block teletext-block--yellow">
            <h2 className="teletext-subtitle" style={{ color: '#000000' }}>THE ASHES 2025</h2>
            <p className="teletext-text teletext-text--black" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
              ENGLAND vs AUSTRALIA
            </p>
          </div>

          <div className="teletext-block teletext-block--blue">
            <p className="teletext-text teletext-text--white">
              Experience the greatest rivalry in cricket!
            </p>
            <p className="teletext-text teletext-text--cyan" style={{ marginTop: '0.5rem' }}>
              5-DAY TEST MATCH SIMULATION
            </p>
            <ul className="teletext-list" style={{ marginTop: '0.5rem' }}>
              <li>REALISTIC TEST CRICKET ENGINE</li>
              <li>ENGLAND & AUSTRALIA SQUADS 2025</li>
              <li>MULTI-DAY, MULTI-INNINGS FORMAT</li>
              <li>SESSION BREAKS & SUMMARIES</li>
              <li>AUTHENTIC CEEFAX EXPERIENCE</li>
            </ul>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <TeletextButton color="green" onClick={() => handleNavigate('P350')}>
              🏏 START ASHES 2025 🏏
            </TeletextButton>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <TeletextButton color="red" onClick={() => handleNavigate('P100')}>
              ◄ BACK TO MAIN MENU
            </TeletextButton>
          </div>
        </TeletextPage>
      )}

      {/* P300 - Match Day (Old T20 format - kept for reference) */}
      {currentPage === 'P300' && (
        <LiveMatch onNavigate={handleNavigate} />
      )}

      {/* P350 - The Ashes 2025 Test Match */}
      {currentPage === 'P350' && (
        <TestMatchLive onNavigate={handleNavigate} />
      )}

      {/* P400 - Team Selection */}
      {currentPage === 'P400' && (
        <TeletextPage pageNumber="P400" title="TEAM SELECTION">
          <div className="teletext-block teletext-block--blue">
            <h2 className="teletext-subtitle">SELECT YOUR PLAYING XI</h2>
            <p className="teletext-text teletext-text--white">
              Choose your best team for the match
            </p>
          </div>

          <div className="teletext-block">
            <h3 className="teletext-subtitle">AVAILABLE PLAYERS</h3>
            <ul className="teletext-list">
              <li>J. ANDERSON - ALL-ROUNDER - FORM: EXCELLENT</li>
              <li>J. ROOT - BATSMAN - FORM: GOOD</li>
              <li>B. STOKES - ALL-ROUNDER - FORM: EXCELLENT</li>
              <li>J. BAIRSTOW - WICKET-KEEPER - FORM: FAIR</li>
              <li>M. WOOD - BOWLER - FORM: GOOD</li>
            </ul>
          </div>

          <div className="teletext-block teletext-block--red">
            <p className="teletext-text teletext-text--white">
              ⚠ TEAM SELECTION COMING SOON ⚠
            </p>
          </div>

          <TeletextButton color="red" onClick={() => handleNavigate('P100')}>
            ◄ BACK TO MAIN MENU
          </TeletextButton>
        </TeletextPage>
      )}

      {/* P500 - Statistics */}
      {currentPage === 'P500' && (
        <TeletextPage pageNumber="P500" title="CAREER STATISTICS">
          <div className="teletext-block teletext-block--magenta">
            <h2 className="teletext-subtitle">YOUR CAREER STATS</h2>
          </div>

          <div className="teletext-grid">
            <div className="teletext-stat">
              <div className="teletext-stat__label">MATCHES</div>
              <div className="teletext-stat__value">0</div>
            </div>
            <div className="teletext-stat">
              <div className="teletext-stat__label">WINS</div>
              <div className="teletext-stat__value teletext-text--green">0</div>
            </div>
            <div className="teletext-stat">
              <div className="teletext-stat__label">LOSSES</div>
              <div className="teletext-stat__value teletext-text--red">0</div>
            </div>
            <div className="teletext-stat">
              <div className="teletext-stat__label">WIN RATE</div>
              <div className="teletext-stat__value">0%</div>
            </div>
          </div>

          <div className="teletext-block">
            <h3 className="teletext-subtitle">TOP PERFORMERS</h3>
            <ul className="teletext-list">
              <li>NO MATCHES PLAYED YET</li>
              <li>START A CAREER TO SEE STATS</li>
            </ul>
          </div>

          <TeletextButton color="red" onClick={() => handleNavigate('P100')}>
            ◄ BACK TO MAIN MENU
          </TeletextButton>
        </TeletextPage>
      )}

      {/* P600 - Options */}
      {currentPage === 'P600' && (
        <TeletextPage pageNumber="P600" title="GAME OPTIONS">
          <div className="teletext-block teletext-block--red">
            <h2 className="teletext-subtitle">SETTINGS & OPTIONS</h2>
          </div>

          <div className="teletext-block">
            <h3 className="teletext-subtitle">DISPLAY SETTINGS</h3>
            <ul className="teletext-list">
              <li>SCANLINE EFFECT: ON</li>
              <li>CRT MODE: ENABLED</li>
              <li>SOUND EFFECTS: OFF</li>
              <li>COMMENTARY: ENABLED</li>
            </ul>
          </div>

          <div className="teletext-block">
            <h3 className="teletext-subtitle">GAME INFORMATION</h3>
            <ul className="teletext-list">
              <li>VERSION: 0.0.1 ALPHA</li>
              <li>BUILD: DEVELOPMENT</li>
              <li>CEEFAX AESTHETIC: 1985 STYLE</li>
            </ul>
          </div>

          <div className="teletext-block teletext-block--cyan">
            <p className="teletext-text teletext-text--black">
              🏏 AUTHENTIC BBC CEEFAX EXPERIENCE 🏏
            </p>
          </div>

          <TeletextButton color="red" onClick={() => handleNavigate('P100')}>
            ◄ BACK TO MAIN MENU
          </TeletextButton>
        </TeletextPage>
      )}
    </>
  )
}

export default App
