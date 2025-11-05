# Cricket Captaincy Career Manager

A retro-styled cricket management game with Ceefax/teletext aesthetic, built as a Progressive Web App using React and Vite.

## 🏏 Project Overview

Cricket Captaincy Career Manager is a ball-by-ball cricket simulation game that puts you in control of a cricket team's destiny. Make tactical decisions, manage your squad, and lead your team to glory - all presented in a nostalgic teletext style reminiscent of BBC Ceefax sports pages from the 1980s and 90s.

## ✨ Features (Planned)

- **Ball-by-ball match simulation** - Realistic cricket action with detailed commentary
- **Player attribute system** - Deep stats for batting, bowling, fielding, and mental attributes
- **Career mode** - Build your legacy as a cricket captain over multiple seasons
- **Tournament play** - Compete in leagues and knockout competitions
- **Team management** - Select your XI, set batting order, and manage tactics
- **Ceefax aesthetic** - Authentic teletext styling with classic color palette
- **Progressive Web App** - Install on any device, play offline

## 🎨 Ceefax Aesthetic Design

The game features an authentic teletext/Ceefax visual style:

- **Classic teletext color palette**: Black, Red, Green, Yellow, Blue, Magenta, Cyan, White
- **Monospace typography**: Courier-style font mimicking teletext character grid
- **Block-color backgrounds**: Solid color blocks like the original Ceefax pages
- **Page-based layout**: Information presented in traditional teletext page format
- **Retro UI elements**: Borders, separators, and navigation styled after 1980s teletext

## 🛠️ Technology Stack

- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool and dev server
- **PWA (vite-plugin-pwa)** - Progressive Web App capabilities with offline support
- **JavaScript (ES6+)** - Modern JavaScript features
- **CSS3** - Custom teletext-inspired styling

## 📁 Project Structure

```
cricket-game/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── cricket-icon.svg       # App icons
├── src/
│   ├── engine/                # Match simulation logic
│   │   ├── matchSimulator.js  # Ball-by-ball simulation
│   │   ├── playerStats.js     # Player attribute system
│   │   └── probabilityEngine.js # Probability calculations
│   ├── components/            # React UI components
│   ├── styles/                # CSS styling
│   │   └── teletext.css       # Ceefax aesthetic styles
│   ├── data/                  # Game data
│   │   ├── players.json       # Player database
│   │   └── teams.json         # Team configurations
│   ├── utils/                 # Helper functions
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── index.html                # HTML template
├── vite.config.js            # Vite & PWA configuration
└── package.json              # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/samlindsay4/cricket-game.git
cd cricket-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy.

### Preview Production Build

```bash
npm run preview
```

## 🎮 Game Mechanics

### Match Simulation Engine

The match engine uses a sophisticated probability-based system:

1. **Player Attributes**: Each player has ratings for batting (timing, power, technique, temperament), bowling (pace, accuracy, variation, stamina), fielding (catching, throwing, agility), and mental (concentration, pressure handling, adaptability)

2. **Probability Calculations**: Ball outcomes are determined by comparing batsman vs bowler ratings, adjusted for:
   - Player form and confidence
   - Match situation (overs remaining, required run rate)
   - Batting/bowling styles
   - Pitch and weather conditions

3. **Realistic Outcomes**: The engine simulates various cricket events:
   - Scoring: Dot balls, singles, twos, threes, fours, sixes
   - Wickets: Bowled, caught, LBW, run out, stumped, hit wicket
   - Extras: Wides, no balls, byes, leg byes

4. **Commentary System**: Dynamic ball-by-ball commentary based on match events

### Player Development

Players have dynamic attributes that change over time:
- **Age**: Players peak between 25-32, improve when younger, decline when older
- **Form**: Recent performance affects short-term ability
- **Confidence**: Match results impact mental state
- **Career Stats**: Comprehensive statistics tracked across all matches

## 🗺️ Development Roadmap

### Phase 1: Match Engine (Current)
- [x] Basic project structure and PWA setup
- [x] Ceefax aesthetic styling
- [x] Match simulation framework
- [x] Player attribute system
- [x] Probability engine framework
- [ ] Complete match simulation logic
- [ ] Commentary system refinement
- [ ] Match statistics tracking

### Phase 2: User Interface
- [ ] Match view screen
- [ ] Live scoreboard
- [ ] Ball-by-ball commentary display
- [ ] Player selection interface
- [ ] Team management screens
- [ ] Statistics and records pages

### Phase 3: Career Mode
- [ ] Career progression system
- [ ] Multi-season play
- [ ] Player development over time
- [ ] Transfer market
- [ ] Tournament structures
- [ ] Achievement system

### Phase 4: PWA Optimization
- [ ] Offline mode implementation
- [ ] Background sync for saves
- [ ] Push notifications for match events
- [ ] App installation prompts
- [ ] Performance optimization
- [ ] Multi-device sync

### Phase 5: Advanced Features
- [ ] Multiplayer functionality
- [ ] Custom team creation
- [ ] Historical matches replay
- [ ] Advanced statistics and analytics
- [ ] Mod support for custom content

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open issues for bugs or feature requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by classic cricket management games
- BBC Ceefax aesthetic
- Cricket statistics from various sources

## 📞 Contact

Created by [@samlindsay4](https://github.com/samlindsay4)

---

**Note**: This is currently in early alpha development. Features are being actively developed and the game is not yet playable.