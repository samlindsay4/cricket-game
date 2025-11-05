# Cricket Captaincy Career Manager

A retro-styled cricket management game with Ceefax/teletext aesthetic, built as a Progressive Web App using React and Vite.

## 🏏 Project Overview

Cricket Captaincy Career Manager is a ball-by-ball cricket simulation game that puts you in control of a cricket team's destiny. Make tactical decisions, manage your squad, and lead your team to glory - all presented in a nostalgic teletext style reminiscent of BBC Ceefax sports pages from the 1980s and 90s.

## ✨ Features

### Implemented
- **Authentic Ceefax UI**: Complete teletext aesthetic with Press Start 2P font
- **Page-based navigation**: Six teletext pages (P100-P600) with live clock
- **Loading screen**: Ceefax-style startup sequence
- **Interactive menu**: Numbered options with colorful blocks
- **Match scorecard**: Teletext-style score display with batting and bowling stats
- **Visual effects**: Scanline overlay, CRT borders, and flashing text
- **Responsive design**: Mobile-friendly while maintaining retro aesthetic
- **PWA ready**: Installable with offline support

### Planned
- **Ball-by-ball match simulation** - Realistic cricket action with detailed commentary
- **Player attribute system** - Deep stats for batting, bowling, fielding, and mental attributes
- **Career mode** - Build your legacy as a cricket captain over multiple seasons
- **Tournament play** - Compete in leagues and knockout competitions
- **Team management** - Select your XI, set batting order, and manage tactics

## 🎨 Ceefax Aesthetic Design

The game features an **authentic BBC Ceefax/Teletext visual style** from the 1980s:

### Color Palette
- **Classic 8-color teletext palette**: Black (#000000), Red (#FF0000), Green (#00FF00), Yellow (#FFFF00), Blue (#0000FF), Magenta (#FF00FF), Cyan (#00FFFF), White (#FFFFFF)
- **Solid color blocks**: Vibrant background colors matching original Ceefax pages
- **High contrast**: Text optimized for readability on colored backgrounds

### Typography
- **Press Start 2P font**: Authentic chunky, pixelated teletext-style font from Google Fonts
- **Monospace layout**: Character grid-based spacing for authentic teletext feel
- **All uppercase**: Text formatting matches teletext limitations

### Page System
The game uses a page-based navigation system modeled after real Ceefax:
- **P100**: Main Menu - Hub for all game sections
- **P200**: New Game - Start a new career or quick match
- **P300**: Match Day - Live scores and match action
- **P400**: Team Selection - Choose your playing XI
- **P500**: Statistics - Career stats and records
- **P600**: Options - Game settings and information

Each page includes:
- Page number and title in header (e.g., "P300 MATCH DAY")
- Live date and time display
- Navigation hints in footer (◄ PREV, MENU, NEXT ►)

### Visual Effects
- **Scanline effect**: Subtle horizontal lines mimicking CRT display
- **CRT borders**: Rounded corners and glow effect on main container
- **Flashing text**: Animated cursor and important notifications
- **Loading screen**: Ceefax-style startup sequence with progress bar

### UI Components
- **Blocky buttons**: Color-inverted hover effects
- **Numbered menu grid**: 6 colorful options (1-6) for easy navigation
- **Match scorecard**: Authentic teletext table format with team colors
- **Stats panels**: Color-coded information blocks

### Layout Structure
- **Fixed-width container**: Mimics old TV aspect ratio (80-90 characters wide)
- **Grid-based design**: Aligned to character grid for authentic look
- **Black background**: High contrast teletext appearance
- **Responsive scaling**: Maintains retro aesthetic on mobile devices

### Design Philosophy
The aesthetic is designed to feel like using a BBC Micro or watching Ceefax on an old TV in 1985, while remaining functional and accessible on modern screens.

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

## 🎮 How to Navigate

The game uses a classic teletext page system. Navigate between pages by:

1. **From Main Menu (P100)**: Click on any numbered option (1-6) to jump to that page
2. **Navigation buttons**: Use the ◄ PREV, MENU, and NEXT ► buttons in the footer (currently display only)
3. **Back buttons**: Each page has a "BACK TO MAIN MENU" button to return to P100

### Page Directory
- **P100** - Main Menu: Central hub with access to all features
- **P200** - New Game: Start a career or quick match (in development)
- **P300** - Match Day: Live cricket scores and match action
- **P400** - Team Selection: Choose your playing XI (in development)
- **P500** - Statistics: View your career stats and records
- **P600** - Options: Game settings and information

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
- [x] Press Start 2P font integration
- [x] Complete page system with 6 pages (P100-P600)
- [x] Loading screen with startup sequence
- [x] Live clock and date display
- [x] Interactive main menu component
- [x] Match scorecard component
- [x] Teletext button components
- [x] Scanline and CRT visual effects
- [x] Responsive design for mobile
- [x] Match simulation framework
- [x] Player attribute system
- [x] Probability engine framework
- [ ] Complete match simulation logic
- [ ] Commentary system refinement
- [ ] Match statistics tracking

### Phase 2: User Interface
- [x] Main menu page (P100)
- [x] Match view screen (P300)
- [x] Live scorecard display
- [x] Statistics page (P500)
- [x] Options page (P600)
- [ ] Ball-by-ball commentary display
- [ ] Player selection interface (P400)
- [ ] Team management screens (P200)
- [ ] Full statistics and records pages

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