# 🎪 HEADLINERS

**A festival-building board game prototype.** Build the biggest and best music festival over 4 years, competing against 2–5 players for Victory Points through ticket sales, artist bookings, and fame.

## 🎮 How to Play

### Setup
1. **Choose players** (2–5) and name your festivals
2. **Receive your Council Objective** — a spatial board challenge with passive bonuses
3. **Receive your Artist Objective** — a lineup-building goal for bonus tickets
4. **Draft 2 starting artists** from a pool of 4 (2 rookies + 2 legends)
5. **Pick a starting amenity** (Campsite, Portaloo, Security, or Catering Van)
6. **Place your stage** and amenity on the hex grid

### Each Turn (1 action)
- **🎲 Pick Amenity** — Roll 5 dice showing amenity types, pick one and place it on your board
- **↔️ Move Amenity** — Relocate one existing amenity to a new tile
- **🎤 Book/Reserve Artist** — Book an artist to a stage (must meet fame + amenity costs) or reserve one to your hand for later

### Artists & Genres
75 unique artists across 5 genres:
- 🩷 **Pop** — Security-focused costs
- ❤️ **Rock** — Portaloo-focused costs
- 🩶 **Electronic** — Campsite-focused costs
- 🧡 **Hip Hop** — Security-focused costs
- 💚 **Indie** — Portaloo-focused costs

Each stage holds 3 artists. The 3rd artist is the **Headliner** — their effect triggers twice!

### Events Phase
After all turns, 3 global events are revealed. Security blocks negative events (1 security = 1 negative blocked). Positive events give VP and tickets; negative events can remove amenities, reduce fame, or cost tickets.

### Scoring
- Campsites generate 5 tickets each
- Artists generate tickets based on their card
- Council objectives provide passive ticket/VP/fame bonuses
- Fame multiplies your ticket total: 0🔥 = ×0.5, 1🔥 = ×0.75, 2🔥 = ×1, 3🔥 = ×1.5, 4🔥 = ×1.75, 5🔥 = ×2
- 10 tickets = 1 VP at round end

### Winning
After 4 years, the player with the most VP wins. Ties broken by most total tickets.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/headliners.git
cd headliners
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
headliners/
├── index.html              # Entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── LICENSE                 # MIT License
├── .gitignore
├── README.md
└── src/
    ├── main.jsx            # React entry point
    └── Headliners.jsx      # Complete game component (~1850 lines)
```

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Pure CSS-in-JS** — No external UI libraries
- **SVG** — Hex grid rendering

## 🎯 Game Features

| Feature | Status |
|---------|--------|
| 2–5 player hot-seat | ✅ |
| 13×13 hex grid with stage placement | ✅ |
| Amenity dice with reroll mechanic | ✅ |
| 75 artists across 5 genres | ✅ |
| Artist booking/reserving system | ✅ |
| Deck draw with card flip reveal | ✅ |
| Artist pool with refresh mechanics | ✅ |
| Headliner celebrations | ✅ |
| Artist effects engine | ✅ |
| 8 artist objectives (personal + trending) | ✅ |
| 21 council objectives with spatial evaluation | ✅ |
| Fame system (stages + effects + councils) | ✅ |
| Fame multiplier on ticket sales | ✅ |
| 23 events (positive & negative) | ✅ |
| Security blocks negative events | ✅ |
| Pre/post fame leaderboard | ✅ |
| View other players' boards | ✅ |
| Hover tooltips on objectives | ✅ |
| Coloured stages with random names | ✅ |
| Stage lineup detail popup | ✅ |
| Turn-by-turn game log | ✅ |
| Discard pile viewer | ✅ |
| New stage from Fame 5 | ✅ |

## 📝 License

MIT — see [LICENSE](LICENSE) for details.
