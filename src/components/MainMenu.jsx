import React from 'react'
import TeletextButton from './TeletextButton'

/**
 * MainMenu Component
 * Classic teletext main menu with numbered options
 */
const MainMenu = ({ onNavigate }) => {
  const menuItems = [
    { number: '1', page: 'P100', label: 'MAIN MENU', color: 'cyan' },
    { number: '2', page: 'P200', label: 'NEW GAME', color: 'green' },
    { number: '3', page: 'P300', label: 'MATCH DAY', color: 'yellow' },
    { number: '4', page: 'P400', label: 'TEAM SELECTION', color: 'blue' },
    { number: '5', page: 'P500', label: 'STATISTICS', color: 'magenta' },
    { number: '6', page: 'P600', label: 'OPTIONS', color: 'red' },
  ]

  return (
    <div className="teletext-main-menu">
      <div className="teletext-menu-grid">
        {menuItems.map((item) => (
          <div 
            key={item.number}
            className={`teletext-menu-item teletext-menu-item--${item.color}`}
            onClick={() => onNavigate(item.page)}
          >
            <div className="teletext-menu-item__number">{item.number}</div>
            <div className="teletext-menu-item__label">{item.label}</div>
          </div>
        ))}
      </div>
      
      <div className="teletext-menu-instruction">
        <p className="teletext-text--white teletext-flash">
          PRESS NUMBER TO CONTINUE
        </p>
      </div>
    </div>
  )
}

export default MainMenu
