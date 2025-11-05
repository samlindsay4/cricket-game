import React, { useState } from 'react'
import './styles/teletext.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="teletext-page">
      <div className="teletext-page-number">P101</div>
      
      <div className="teletext-header">
        CRICKET CAPTAINCY MANAGER
      </div>

      <h1 className="teletext-title">
        ═══════════════════════════════════
        <br />
        CRICKET CAPTAINCY CAREER MANAGER
        <br />
        ═══════════════════════════════════
      </h1>

      <div className="teletext-block teletext-block--blue">
        <h2 className="teletext-subtitle">WELCOME TO THE PAVILION</h2>
        <p className="teletext-text teletext-text--white">
          Take command of your cricket career!
        </p>
      </div>

      <div className="teletext-separator"></div>

      <div className="teletext-block">
        <h3 className="teletext-subtitle">MAIN MENU</h3>
        <ul className="teletext-list">
          <li>NEW CAREER - Start your journey</li>
          <li>QUICK MATCH - Play a single game</li>
          <li>OPTIONS - Configure settings</li>
          <li>ABOUT - Game information</li>
        </ul>
      </div>

      <div className="teletext-separator"></div>

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

      <div className="teletext-block teletext-block--red">
        <p className="teletext-text teletext-text--white">
          🏏 DEVELOPMENT BUILD - Features coming soon! 🏏
        </p>
      </div>

      <div className="teletext-separator"></div>

      <div className="teletext-block">
        <h3 className="teletext-subtitle">GAME FEATURES (ROADMAP)</h3>
        <ul className="teletext-list">
          <li>Ball-by-ball match simulation</li>
          <li>Realistic player statistics</li>
          <li>Team management & tactics</li>
          <li>Career progression system</li>
          <li>Tournament competitions</li>
        </ul>
      </div>

      <div className="teletext-footer">
        <p className="teletext-text--cyan">
          Press any key to continue...
        </p>
        <p className="teletext-flash">█</p>
      </div>
    </div>
  )
}

export default App
