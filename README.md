# 🎪 Festival Frenzy

A digital board game where 2–5 players compete to build the ultimate music festival. Book artists, place amenities, manage your reputation, and outsell the competition across 4 rounds of strategic fun.

## 🎮 Play Now

Open `index.html` in any modern browser — no server, no install, no dependencies. The entire game is a single HTML file.

**[Play on GitHub Pages →](https://yourusername.github.io/festival-frenzy/)**
*(Update this link after enabling GitHub Pages in your repo settings)*

## 🎯 How to Play

Each round, players take turns performing one action:
- **Book an artist** onto a stage (costs amenities based on the artist's requirements)
- **Sign an artist** to your hand for later booking
- **Place an amenity** from your dice roll (campsites, portaloos, catering, security)

At the end of each round, your ticket sales are multiplied by your Fame level. Pay upkeep costs for your amenities and stages, then prepare for the next round.

After 4 rounds, the player with the most **Victory Points** wins.

## ✨ Features

- **75 artists** across 5 genres (Pop, Rock, Hip Hop, Electronic, Indie) with unique effects
- **Two difficulty modes** — Normal Deck and Hard Deck (higher VP, lower ticket sales)
- **Shorter Game option** for quicker sessions (6/7/8/9 turns vs 6/8/10/12)
- **AI opponents** with strategic decision-making
- **20 council objectives** with passive bonuses
- **5 artist objective types** for end-of-round VP
- **Global objectives** — first-come-first-served challenges each round
- **22 events** (positive and negative) with security prevention
- **Special guests**, headliner bonuses, and lineup completion rewards
- **Interactive draw/refresh mechanics** for artist effects
- **Hex grid board** with stage placement and amenity management
- **Between-rounds phase** — move amenities, open new stages, manage upkeep
- **Game log** — full turn-by-turn history accessible anytime
- **Data export** to Excel for post-game analysis
- **Mobile responsive** layout with touch-friendly controls
- **Tutorial system** for new players

## 🏗️ Game Structure

```
Round (×4)
├── Turns (6/8/10/12 per player per round)
│   └── Book Artist OR Sign Artist OR Place Amenity
├── Special Guests
├── Events (global + personal)
├── Ticket Sales (raw × Fame multiplier)
├── New Council Objectives (if completed)
├── Upkeep (pay to keep amenities/stages)
├── Leaderboard + VP for most tickets
└── Betwixt (move amenities + open stages)
```

## 🎵 Genres

| Genre | Colour | Focus |
|-------|--------|-------|
| Pop | 💗 Pink | Security, Events, Fame |
| Rock | ❤️ Red | Portaloos, Hand management |
| Hip Hop | 🧡 Orange | Security, Negative events |
| Electronic | 🩶 Silver | Campsites, Draw effects |
| Indie | 💚 Green | Portaloos, Amenities, VP |

## 📦 Tech Stack

- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript
- **Single file** — `index.html` contains everything
- **SheetJS CDN** for Excel export (loaded from cdnjs)
- **Google Fonts** — Righteous (headings) and Inter (body)

## 🚀 Deployment

### GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch**, root folder
4. Your game will be live at `https://yourusername.github.io/festival-frenzy/`

### Local
Just open `index.html` in a browser. That's it.

## 📊 Data Export

Click the 📊 Export button during or after a game to download a multi-sheet Excel file with round-by-round player data and artist performance stats.

## 📋 Game Log

Click the 📋 Log button in the header at any time to see a full turn-by-turn history of every action, effect, and consequence in the current game.

## 📄 License

MIT
