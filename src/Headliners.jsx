/**
 * HEADLINERS — A Festival-Building Board Game Prototype
 * =====================================================
 * Build the biggest and best festival over 4 years (rounds).
 * 2–5 players compete to earn Victory Points through ticket sales,
 * amenity placement, artist booking, and fame.
 *
 * Core mechanics:
 *  - Hex-grid festival board (13×13) with stage placement
 *  - 1 action per turn: Pick Amenity (dice), Move Amenity, or Book/Reserve Artist
 *  - Artists have costs (fame + amenities), genres, VP, tickets, and effects
 *  - 3 artists per stage; the 3rd is the Headliner (effect triggers twice)
 *  - First full lineup bonus: +5 tickets
 *  - Campsites generate 5 tickets each
 *  - 10 tickets = 1 VP at year end
 *  - Fame level 5 unlocks new stage placement between rounds
 *  - After 4 years, highest VP wins (tiebreak: most tickets)
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// ARTIST DATA (75 artists from spreadsheet)
// ═══════════════════════════════════════════════════════════
const ALL_ARTISTS = [{"name": "Kara Okay", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "+1 Global Event"}, {"name": "Sadchild", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 2, "effect": "+1 ticket sale for all players"}, {"name": "Mikerophone", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Rebecca Black", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Jamiroquai", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop, Funk", "tickets": 2, "effect": "+1 Fame if you have played 2 Pop artists this year"}, {"name": "Chappell Roan", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Clairo", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Indie", "tickets": 3, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "RAYE", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Nelly", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Pop, Hip Hop", "tickets": 4, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "Harry Styles", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "+Fame"}, {"name": "Billie Eilish", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 3, "cateringCost": 0, "portalooCost": 1, "genre": "Pop, Electronic", "tickets": 4, "effect": "Sign 1 artist from the artist deck or the available artist pool."}, {"name": "Beyonce", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "+1 Fame if you have played 2 Pop artists this year"}, {"name": "Olivia Dean", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 4, "effect": ""}, {"name": "Coldplay", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 3, "cateringCost": 2, "portalooCost": 1, "genre": "Pop, Rock", "tickets": 5, "effect": "Year End: '+1 VP / Fame gained this year"}, {"name": "Lady Gaga", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Pop", "tickets": 5, "effect": "Year End: '+1 VP if you have the highest Fame. '+3 VP if you have the highest Fame AND the most tickets."}, {"name": "Sitting Ducks", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "All players draw 1 artist from the artist deck"}, {"name": "Beababdoobee", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Limp Bizkit", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Wet Leg", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Heart", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Vampire Weekend", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Indie", "tickets": 3, "effect": "Roll all Amenity dice. Sell 1 ticket for each unique amenity shown"}, {"name": "Rage Against the Machine", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Rock, Funk", "tickets": 3, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Beastie Boys", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Hip Hop", "tickets": 3, "effect": "+1 ticket / Negative Event this year"}, {"name": "Muse", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "+1 Fame"}, {"name": "Slipknot", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Olivia Rodrigo", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Pop", "tickets": 4, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "Radiohead", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Rock, Electronic", "tickets": 4, "effect": ""}, {"name": "Arctic Monkeys", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": ""}, {"name": "Foo Fighters", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 5, "effect": "Year End: Roll all 5 Amenity Dice. +1VP for each unique amenity that shows"}, {"name": "Fleetwood Mac", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 3, "genre": "Rock", "tickets": 5, "effect": "Year End: Roll all 5 dice. +1 VP per die showing the most common result"}, {"name": "Lil Angry", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Loosey Goosey", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Pop", "tickets": 2, "effect": "+1 Negative Global Event"}, {"name": "Knucks", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Eve", "fame": 1, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": "+1 Negative Personal Event"}, {"name": "KAYTRANADA", "fame": 1, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Electronic", "tickets": 4, "effect": "+1 Negative Personal Event"}, {"name": "Lil Dicky", "fame": 1, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": "+1 Security. Place this turn."}, {"name": "Snoop Dogg", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop, Funk", "tickets": 3, "effect": ""}, {"name": "Loyle Carner", "fame": 2, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Hip Hop, Rock", "tickets": 5, "effect": "+1 Negative Personal Event"}, {"name": "Little Simz", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop, Indie", "tickets": 3, "effect": "+1 Fame"}, {"name": "Dave", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 3, "effect": "+1 Amenity"}, {"name": "Missy Elliott", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Lauryn Hill", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Nas", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 3, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Kendrick Lamar", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 3, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 5, "effect": "Year End: +1 VP / Negative Event avoided this year"}, {"name": "Eminem", "fame": 5, "vp": 7, "campCost": 3, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 5, "effect": "Year End: +1 VP / Negative Event that hit you this year"}, {"name": "CRUEL MISTRESS", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket sale for all players"}, {"name": "808 DYLAN", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 Global Event"}, {"name": "Horsegiirl", "fame": 0, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "The Chainsmokers", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "CHVRCHES", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Indie", "tickets": 2, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "Flume", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Electronic, Hip Hop", "tickets": 3, "effect": ""}, {"name": "Opolopo", "fame": 2, "vp": 4, "campCost": 2, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Funk", "tickets": 3, "effect": ""}, {"name": "Peggy Gou", "fame": 2, "vp": 4, "campCost": 2, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "Chase & Status", "fame": 2, "vp": 4, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": ""}, {"name": "Charli XCX", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Electronic, Pop", "tickets": 3, "effect": "+1 Event"}, {"name": "The Chemical Brothers", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "Draw two artists from either the available artist pool or deck. Sign one."}, {"name": "Linkin Park", "fame": 3, "vp": 5, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Rock", "tickets": 3, "effect": "+1 Fame"}, {"name": "Skrillex", "fame": 3, "vp": 5, "campCost": 3, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic", "tickets": 3, "effect": ""}, {"name": "Daft Punk", "fame": 5, "vp": 7, "campCost": 3, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Electronic", "tickets": 5, "effect": "Year End: '+1 VP / 3 Amenities"}, {"name": "Fatboy Slim", "fame": 5, "vp": 7, "campCost": 3, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Electronic", "tickets": 5, "effect": "Year End: '+1 VP / Council Objective that is currently giving you a benefit"}, {"name": "Bruised Brothers", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Ayle", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie, Hip Hop", "tickets": 2, "effect": "Sign one artist. You may refresh the available artists before or after you draw."}, {"name": "Mickey Raven", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "+1 Global Event"}, {"name": "Christine & The Queens", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "The Kooks", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Mitski", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "+1 Security"}, {"name": "CMAT", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie, Pop", "tickets": 3, "effect": "+1 Global Event"}, {"name": "Florence & The Machine", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "+5 ticket sales"}, {"name": "Lana Del Rey", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": "+1 Fame"}, {"name": "Hozier", "fame": 3, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": "+1 VP"}, {"name": "Joy Division", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Indie", "tickets": 4, "effect": ""}, {"name": "Tame Impala", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Indie, Electronic", "tickets": 4, "effect": "+1 Amenity"}, {"name": "The Strokes", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 3, "genre": "Indie", "tickets": 4, "effect": ""}, {"name": "Gorillaz", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 2, "cateringCost": 2, "portalooCost": 2, "genre": "Indie", "tickets": 5, "effect": "Gain 1VP per existing campsite in your festival."}, {"name": "The Cure", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 3, "genre": "Indie, Rock", "tickets": 5, "effect": "Immediately book another Indie or Rock artist."}, {"name": "Bella Labelle", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "All players draw 1 artist from the artist deck."}, {"name": "Redcar", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "All players draw 1 artist from the artist deck"}, {"name": "Backseat", "fame": 0, "vp": 2, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": ""}, {"name": "Vulfpeck", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "+1 Amenity"}, {"name": "War", "fame": 1, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "+1 Security"}, {"name": "Cameo", "fame": 1, "vp": 3, "campCost": 0, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": ""}, {"name": "Khruangbin", "fame": 2, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Electronic", "tickets": 3, "effect": "Draw two artists from either the available artist pool or deck. Sign one."}, {"name": "Sly & The Family Stone", "fame": 2, "vp": 4, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Funk", "tickets": 3, "effect": "+1 VP"}, {"name": "Betty Davis", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Funk, Rock", "tickets": 4, "effect": "+1 Amenity"}, {"name": "Thundercat", "fame": 3, "vp": 5, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+4 ticket sales"}, {"name": "Earth, Wind & Fire", "fame": 4, "vp": 6, "campCost": 0, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk", "tickets": 4, "effect": ""}, {"name": "Chaka Khan", "fame": 4, "vp": 6, "campCost": 2, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+1 Event"}, {"name": "Nile Rogers & Chic", "fame": 4, "vp": 6, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+1 Fame"}, {"name": "Silk Sonic", "fame": 5, "vp": 7, "campCost": 2, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk", "tickets": 5, "effect": ""}, {"name": "Prince", "fame": 5, "vp": 7, "campCost": 1, "securityCost": 2, "cateringCost": 3, "portalooCost": 1, "genre": "Funk", "tickets": 5, "effect": ""}];

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const HEX_SIZE = 22;
const GRID_COLS = 13;
const GRID_ROWS = 13;
const AMENITY_TYPES = ["campsite", "security", "catering", "portaloo"];
const AMENITY_LABELS = { campsite: "Campsite", portaloo: "Portaloo", security: "Security", catering: "Catering Van" };
const AMENITY_ICONS = { campsite: "⛺", portaloo: "🚽", security: "👮‍♀️", catering: "🍔" };
const AMENITY_COLORS = { campsite: "#4ade80", portaloo: "#60a5fa", security: "#f87171", catering: "#fbbf24" };
const DICE_OPTIONS = ["campsite", "portaloo", "security", "catering", "catering_or_portaloo", "security_or_campsite", "fame"];
const TURNS_PER_YEAR = { 1: 6, 2: 7, 3: 8, 4: 9 };
const FAME_MAX = 5;
const GENRE_COLORS = { Pop: "#ec4899", Rock: "#ef4444", Electronic: "#94a3b8", "Hip Hop": "#f97316", Indie: "#22c55e", Funk: "#a855f7" };
const ALL_GENRES = ["Pop", "Rock", "Electronic", "Hip Hop", "Indie", "Funk"];

function generateMicrotrends() {
  const shuffled = shuffle([...ALL_GENRES]);
  return [{ genre: shuffled[0], claimedBy: null }, { genre: shuffled[1], claimedBy: null }];
}
const STAGE_NAMES = [
  "The Pyramid","The Beacon","Sunset Strip","The Warehouse","Neon Tent",
  "Echo Chamber","Thunder Dome","The Lighthouse","Starlight Arena","Cloud Nine",
  "The Cavern","Solar Stage","Bass Cathedral","The Orchid","Iron Forge",
  "Moonlit Meadow","The Hive","Crystal Palace","Wildfire Ring","The Oasis"
];
const STAGE_COLORS = [
  "#e11d48","#7c3aed","#0891b2","#16a34a","#ea580c",
  "#c026d3","#2563eb","#ca8a04","#dc2626","#059669",
  "#8b5cf6","#d97706","#0d9488","#be185d","#4f46e5"
];
const RANDOM_NAMES = [
  "Glastonbury 2.0","Mudstock","Basswave","Sunblaze","Neon Fields",
  "Echo Valley","Thunderdome","Starlight Meadow","Cosmic Grove","Rhythmia",
  "Pulse Festival","Wildfire Fest","Dreamscape","Horizon Fest","Moonrise",
  "Voltage","Zenith Fest","Solstice Sound","Inferno Fest","Aurora Nights"
];
const AI_NAMES = ["RoboFest","AutoStage","ByteBeats","CyberGrove","NeuralNights"];

const ALL_OBJECTIVES = [
  { name: "Popstars", genre: "Pop", desc: "Feature full Pop lineups", req: "All 3 artists on a stage are Pop", reward1: "Draw 1 Pop artist from pool at round start", reward2: "+1 Fame + draw 1 Pop artist" },
  { name: "Rock On", genre: "Rock", desc: "Feature full Rock lineups", req: "All 3 artists on a stage are Rock", reward1: "Roll 3 dice at round start, +1 ticket per Fame shown", reward2: "+1 Fame + roll 3 dice" },
  { name: "Disc Jockeys", genre: "Electronic", desc: "Feature full Electronic lineups", req: "All 3 artists on a stage are Electronic", reward1: "Place 1 free amenity at round start", reward2: "+1 Fame + place 1 free amenity" },
  { name: "Fire Verses", genre: "Hip Hop", desc: "Feature full Hip Hop lineups", req: "All 3 artists on a stage are Hip Hop", reward1: "Peek at top 3 events, discard 1", reward2: "+1 Fame + peek at top 3 events" },
  { name: "Indiependent", genre: "Indie", desc: "Feature full Indie lineups", req: "All 3 artists on a stage are Indie", reward1: "Every other player gains +1 ticket", reward2: "+1 Fame + every other player gains +1 ticket" },
  { name: "Funk Town", genre: "Funk", desc: "Feature full Funk lineups", req: "All 3 artists on a stage are Funk", reward1: "Draw 1 card from deck to hand", reward2: "+1 Fame + draw 1 card from deck" },
];

const FAME_VP = { 0: 0, 1: 1, 2: 3, 3: 6, 4: 10, 5: 15 };

const ALL_GOALS = [
  { id: "royal_flush", name: "Royal Flush", trackKey: "portalooRefreshes",
    req1: "Refresh the artist pool with a portaloo once", req1Target: 1, req1Benefit: "Draw 1 artist from deck",
    req2: "Refresh the pool with a portaloo 3 times", req2Target: 3,
    req3: "Refresh the pool with a portaloo 5 times", req3Target: 5 },
  { id: "marketing_gimmicks", name: "Marketing Gimmicks", trackKey: "fameDieRolls",
    req1: "Gain Fame from the amenity dice once", req1Target: 1, req1Benefit: "Draw 1 artist from deck",
    req2: "Gain Fame from the amenity dice 3 times", req2Target: 3,
    req3: "Gain Fame from the amenity dice 5 times", req3Target: 5 },
  { id: "its_a_sign", name: "It's a Sign", trackKey: "artistsSigned",
    req1: "Sign an artist to hand once", req1Target: 1, req1Benefit: "Draw 1 artist from deck",
    req2: "Sign an artist to hand 4 times", req2Target: 4,
    req3: "Sign an artist to hand 7 times", req3Target: 7 },
  { id: "government_catering", name: "Government Catering", trackKey: "councilsBought",
    req1: "Buy a council objective with catering once", req1Target: 1, req1Benefit: "Draw 1 artist from deck",
    req2: "Buy a council objective with catering 3 times", req2Target: 3,
    req3: "Buy a council objective with catering 5 times", req3Target: 5 },
  { id: "locking_it_down", name: "Locking it Down", trackKey: "eventsBlocked",
    req1: "Avoid 1 event with security", req1Target: 1, req1Benefit: "Draw 1 artist from deck",
    req2: "Avoid 3 events with security", req2Target: 3,
    req3: "Avoid 5 events with security", req3Target: 5 },
];

const ALL_COUNCIL_OBJECTIVES = [
  { id: "ticket_evaders", name: "Ticket Evaders", flavour: "The council are worried about people sneaking in.", req: "Security on the 2 outermost layers", benefit: "+1 ticket/security on edge", tBenefit: "+1 Fame/security on edge" },
  { id: "toxic_waste", name: "Toxic Waste", flavour: "Locals are worried about strange smells.", req: "No portaloos on outside edge", benefit: "+1 ticket/portaloo not on edge", tBenefit: "+1 Fame/portaloo not on edge" },
  { id: "put_a_lid", name: "Put a Lid on it", flavour: "Campers don't want to live next to a toilet.", req: "1 tile gap between portaloos and campsites", benefit: "+1 ticket/campsite not next to portaloo", tBenefit: "+1 Fame/campsite not next to portaloo" },
  { id: "crowd_control", name: "Crowd Control", flavour: "People won't come if they don't feel safe.", req: "Security beside stage", benefit: "+2 VP/3 security next to stage", tBenefit: "+1 Fame/3 security next to stage" },
  { id: "food_courts", name: "Food Courts", flavour: "Showcase local specialties.", req: "Group 3 catering vans together", benefit: "+5 VP/3 catering", tBenefit: "+1 Fame/3 catering" },
  { id: "local_breweries", name: "Local Breweries", flavour: "Attract local breweries.", req: "Catering van next to stage", benefit: "+1 ticket/catering next to stage", tBenefit: "+1 Fame/catering next to stage" },
  { id: "groovin_circles", name: "Groovin' Circles", flavour: "The dance area will be cramped.", req: "Keep all tiles beside stage empty", benefit: "+2 tickets/qualifying stage", tBenefit: "+1 Fame/qualifying stage" },
  { id: "sniffer_dogs", name: "Sniffer Dogs", flavour: "Stamp down on illegal substances.", req: "2 security beside each other", benefit: "+1 VP/security pair", tBenefit: "+1 Fame/security adj to security" },
  { id: "special_sauce", name: "Special Sauce", flavour: "Keep herbs and spices secret.", req: "Security and catering next to each other", benefit: "+1 ticket/security-catering pair", tBenefit: "+1 Fame/security adj to catering" },
  { id: "in_n_out", name: "In-N-Out", flavour: "Strategic food and toilets.", req: "Portaloos and catering next to each other", benefit: "+2 tickets/portaloo adj to catering", tBenefit: "+1 Fame/portaloo adj to catering" },
  { id: "quiet_camping", name: "Quiet Camping", flavour: "Campers should sleep well.", req: "Campsite at least 3 tiles from stage", benefit: "+1 VP/campsite 3+ from stage", tBenefit: "+1 Fame/campsite 3+ from stage" },
  { id: "glamping", name: "Glamping", flavour: "Exclusive camping areas.", req: "Campsite and security next to each other", benefit: "+1 ticket/campsite-security pair", tBenefit: "+1 Fame/campsite adj to security" },
  { id: "luxury_loos", name: "Luxury Loos", flavour: "The council like 2 ply toilet roll.", req: "Portaloos beside security", benefit: "+1 ticket/portaloo adj to security", tBenefit: "+1 Fame/portaloo adj to security" },
  { id: "number_one_fans", name: "Number One Fans", flavour: "More portaloos near stages.", req: "Portaloos beside stages", benefit: "+1 ticket/portaloo beside stage", tBenefit: "+1 Fame/3 portaloos" },
  { id: "form_a_line", name: "Form a Line", flavour: "The council want an orderly food area.", req: "Catering vans in a straight line (min 2)", benefit: "+1 ticket per extra catering in line", tBenefit: "+1 Fame if 2+ catering in a line" },
  { id: "noise_complaints", name: "Noise Complaints", flavour: "Concern from neighbours.", req: "No amenities on outer edge (min 3)", benefit: "+1 ticket/2 amenities not on edge", tBenefit: "+1 Fame/2 amenities not on edge" },
  { id: "multiple_entrances", name: "Multiple Entrances", flavour: "Crowd calming measures.", req: "Security at stage + security at edge in line", benefit: "+3 VP per qualifying pair", tBenefit: "+1 Fame per qualifying pair" },
  { id: "reheating_fish", name: "Reheating Fish", flavour: "Campers might complain about food stalls.", req: "Campsites 3+ tiles from catering", benefit: "+2 VP/campsite 3+ from catering", tBenefit: "+1 Fame/campsite 3+ from catering" },
  { id: "eat_local", name: "Eat Local", flavour: "Food close to camp.", req: "Catering and campsite next to each other", benefit: "+1 VP/campsite adj to catering", tBenefit: "+1 Fame/campsite adj to catering" },
  { id: "thieves_night", name: "Thieves in the Night", flavour: "Worried about thieves.", req: "Campsites around security", benefit: "+1 VP/3 campsites surrounding security", tBenefit: "+1 Fame/3 security" },
  { id: "meat_the_law", name: "Meat the Law", flavour: "Look after the catering vans.", req: "Catering vans around security", benefit: "+3 VP/3 catering surrounding security", tBenefit: "+1 Fame/3 security" },
  { id: "orderly_queues", name: "Orderly Queues", flavour: "Order around the catering vans.", req: "Security + catering in line with 2 empty tiles", benefit: "+1 ticket per qualifying pair", tBenefit: "+1 Fame per qualifying pair" },
  { id: "sit_downs", name: "Sit Downs and Stand Ups", flavour: "The council want urinals.", req: "Two portaloos next to each other", benefit: "+3 tickets/portaloo pair", tBenefit: "+1 Fame/portaloo pair" },
  { id: "yours_or_mine", name: "Yours or Mine?", flavour: "Festival goers like bigger campsites.", req: "Three campsites next to each other", benefit: "+5 tickets/3 campsite cluster", tBenefit: "+1 Fame/3 campsite cluster" },
  { id: "chef_beef", name: "Chef Beef", flavour: "Rival food vendors want their own space.", req: "Catering 5+ tiles from another catering", benefit: "+1 ticket/isolated catering", tBenefit: "" },
  { id: "show_of_power", name: "Show of Power", flavour: "A lone guard commands respect.", req: "Security with no adjacent amenities", benefit: "+2 tickets/isolated security", tBenefit: "" },
  { id: "keep_the_peace", name: "Keep the Peace", flavour: "Spacing out campers keeps everyone happy.", req: "2+ campsites with 1 empty tile gap", benefit: "+1 ticket/spaced campsite pair", tBenefit: "" },
];

const ALL_EVENTS = [
  { name: "Album Release", color: "green", desc: "A random artist at your festival has released an album.", cond: "played_artist", result: "+1 VP", apply: (pd) => ({ vp: 1 }) },
  { name: "Food Glorious Food", color: "green", desc: "People love the food!", cond: "has_catering", result: "+2 tickets per catering van", apply: (pd) => ({ tickets: (pd.amenities||[]).filter(a=>a.type==="catering").length * 2 }) },
  { name: "Legendary Guitar Solo", color: "green", desc: "A rock artist was a huge hit.", cond: "has_rock", result: "+1 VP", apply: (pd) => ({ vp: 1 }) },
  { name: "Sunny Weekend", color: "green", desc: "Good weather brings more sales.", cond: null, result: "+5 tickets", apply: () => ({ tickets: 5 }) },
  { name: "Trending Artist", color: "green", desc: "One of your headliners is surprisingly popular.", cond: "has_headliner", result: "+10 tickets", apply: () => ({ tickets: 10 }) },
  { name: "Happy Campers", color: "green", desc: "More people in your campsites this year.", cond: null, result: "+1 ticket per campsite", apply: (pd) => ({ tickets: (pd.amenities||[]).filter(a=>a.type==="campsite").length }) },
  { name: "It's Lit", color: "green", desc: "Spectacular stage lighting!", cond: "has_headliner", result: "+1 VP", apply: () => ({ vp: 1 }) },
  { name: "Going Mainstream", color: "green", desc: "A pop artist nailed their set.", cond: "has_pop", result: "+1 VP", apply: () => ({ vp: 1 }) },
  { name: "Pop Idols", color: "green", desc: "A pop headliner had a legendary performance.", cond: "has_pop_headliner", result: "+3 VP", apply: () => ({ vp: 3 }) },
  { name: "We Built This City…", color: "green", desc: "A rock headliner had a legendary performance.", cond: "has_rock_headliner", result: "+2 VP", apply: () => ({ vp: 2 }) },
  { name: "Bartenders with Flair", color: "green", desc: "Your catering vans know how to juggle cocktails.", cond: "catering_near_stage", result: "+1 VP", apply: () => ({ vp: 1 }) },
  { name: "On their Best Behaviour", color: "green", desc: "Festival-goers were surprisingly nice.", cond: "security_per_stage", result: "+1 VP", apply: () => ({ vp: 1 }) },
  { name: "Blocked Toilets", color: "red", desc: "One of your portaloos backs up.", cond: null, result: "Lose 1 portaloo or -1 Fame", avoidable: true, apply: (pd) => { const p = (pd.amenities||[]).filter(a=>a.type==="portaloo"); return p.length > 0 ? { removeAmenity: "portaloo" } : { fame: -1 }; } },
  { name: "Food Poisoning", color: "red", desc: "Your food vans served medium rare chicken.", cond: null, result: "Lose 1 catering or -1 Fame", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="catering"); return c.length > 0 ? { removeAmenity: "catering" } : { fame: -1 }; } },
  { name: "Powerful Gusts", color: "red", desc: "Campsites on a hill get battered.", cond: "campsite_above_stage", result: "Lose 1 campsite or -1 Fame", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="campsite"); return c.length > 0 ? { removeAmenity: "campsite" } : { fame: -1 }; } },
  { name: "Flooding", color: "red", desc: "Campers in the valley wake up in a bog.", cond: "campsite_below_stage", result: "Lose 1 campsite or -1 Fame", avoidable: true, apply: (pd) => { const c = (pd.amenities||[]).filter(a=>a.type==="campsite"); return c.length > 0 ? { removeAmenity: "campsite" } : { fame: -1 }; } },
  { name: "Speakers on Fire", color: "red", desc: "A speaker stops working during a set.", cond: null, result: "Lose half tickets of 1 artist or -1 Fame", avoidable: true, apply: (pd) => { const arts = (pd.stageArtists||[]).flat(); if (arts.length > 0) { const a = arts[Math.floor(Math.random()*arts.length)]; return { tickets: -Math.floor(a.tickets/2) }; } return { fame: -1 }; } },
  { name: "Thieves Among Us", color: "red", desc: "Campers complain about lost earrings.", cond: "campsites_gt_security", result: "-1 Fame", avoidable: true, apply: () => ({ fame: -1 }) },
  { name: "TED Talk on Stage", color: "red", desc: "A headliner uses their set for politics.", cond: "has_headliner", result: "-1 Fame", avoidable: false, apply: () => ({ fame: -1 }) },
  { name: "Rowdy Crowd", color: "red", desc: "A fight erupted in the crowd.", cond: null, result: "-2 tickets per act", avoidable: true, apply: (pd) => ({ tickets: -(pd.stageArtists||[]).flat().length * 2 }) },
  { name: "Passed Out", color: "red", desc: "Someone fainted in the crowd.", cond: "less_than_4_security", result: "-1 Fame", avoidable: false, apply: () => ({ fame: -1 }) },
  { name: "Agent Fallout", color: "red", desc: "You had an argument with an artist agent.", cond: "has_hand", result: "Lose 1/3 of hand (min 1)", avoidable: true, apply: (pd) => { const h = (pd.hand||[]).length; return { discardHand: Math.max(1, Math.floor(h/3)) }; } },
  { name: "Dehydration", color: "red", desc: "Long water queues.", cond: null, result: "-1 or -2 Fame based on level", avoidable: true, apply: (pd) => ({ fame: (pd.fame||0) >= 4 ? -2 : -1 }) },
];
/** Check if an event's condition is met for a player */
function eventConditionMet(evt, pd) {
  if (!evt.cond) return true;
  const sa = (pd.stageArtists || []), allA = sa.flat(), am = pd.amenities || [];
  const cnt = (t) => am.filter(a => a.type === t).length;
  switch (evt.cond) {
    case "played_artist": return allA.length > 0;
    case "has_catering": return cnt("catering") > 0;
    case "has_rock": return allA.some(a => getGenres(a.genre).includes("Rock"));
    case "has_headliner": return sa.some(s => s.length === 3);
    case "has_pop": return allA.some(a => getGenres(a.genre).includes("Pop"));
    case "has_pop_headliner": return sa.some(s => s.length === 3 && getGenres(s[2].genre).includes("Pop"));
    case "has_rock_headliner": return sa.some(s => s.length === 3 && getGenres(s[2].genre).includes("Rock"));
    case "catering_near_stage": return (pd.stages||[]).some(st => { const sh = getStageHexes(st.col,st.row); return am.some(a => a.type==="catering" && sh.some(h => areAdjacent(a.col,a.row,h.col,h.row))); });
    case "security_per_stage": return (pd.stages||[]).every(st => { const sh = getStageHexes(st.col,st.row); return am.filter(a => a.type==="security" && sh.some(h => areAdjacent(a.col,a.row,h.col,h.row))).length >= 1; });
    case "campsite_above_stage": return am.some(a => a.type==="campsite" && (pd.stages||[]).some(s => a.row < s.row));
    case "campsite_below_stage": return am.some(a => a.type==="campsite" && (pd.stages||[]).some(s => a.row > s.row));
    case "campsites_gt_security": return cnt("campsite") > cnt("security");
    case "less_than_4_security": return cnt("security") < 4;
    case "has_hand": return (pd.hand||[]).length > 0;
    default: return true;
  }
}

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hexToPixel(c, r) { const w = Math.sqrt(3) * HEX_SIZE; const h = 2 * HEX_SIZE; return { x: c * w + (r % 2 === 1 ? w / 2 : 0) + w / 2 + 4, y: r * (h * 0.75) + h / 2 + 4 }; }
function hexPoints(cx, cy, s) { const p = []; for (let i = 0; i < 6; i++) { const a = (Math.PI / 180) * (60 * i - 30); p.push(`${cx + s * Math.cos(a)},${cy + s * Math.sin(a)}`); } return p.join(" "); }
function getStageHexes(cc, cr) {
  const n = cr % 2 === 0 ? [[-1,-1],[0,-1],[-1,0],[1,0],[-1,1],[0,1]] : [[0,-1],[1,-1],[-1,0],[1,0],[0,1],[1,1]];
  const h = [{ col: cc, row: cr }]; for (const [dc, dr] of n) h.push({ col: cc + dc, row: cr + dr });
  return h.filter(x => x.col >= 0 && x.col < GRID_COLS && x.row >= 0 && x.row < GRID_ROWS);
}
function stageFullyInBounds(c, r) { const h = getStageHexes(c, r); return h.length === 7 && h.every(x => x.col >= 0 && x.col < GRID_COLS && x.row >= 0 && x.row < GRID_ROWS); }
function stageWouldOverlap(c, r, stages) { const nh = getStageHexes(c, r); for (const s of stages) { const eh = getStageHexes(s.col, s.row); for (const a of nh) for (const b of eh) if (a.col === b.col && a.row === b.row) return true; } return false; }
function isOnStage(c, r, stages) { for (const s of stages) { if (getStageHexes(s.col, s.row).some(h => h.col === c && h.row === r)) return true; } return false; }
function rollDice() { return shuffle([...DICE_OPTIONS]).slice(0, 5); }
function diceNeedReroll(dice) { if (dice.length < 3) return true; const faces = new Set(dice); return faces.size === 1; }
function getGenres(genre) { return genre.split(",").map(g => g.trim()); }

/** Get hex neighbours of a given hex */
function getHexNeighbours(col, row) {
  const n = row % 2 === 0 ? [[-1,-1],[0,-1],[-1,0],[1,0],[-1,1],[0,1]] : [[0,-1],[1,-1],[-1,0],[1,0],[0,1],[1,1]];
  return n.map(([dc,dr]) => ({ col: col+dc, row: row+dr })).filter(h => h.col >= 0 && h.col < GRID_COLS && h.row >= 0 && h.row < GRID_ROWS);
}

/** Check if a hex is on the outer edge of the grid */
function isEdgeHex(col, row) { return col === 0 || col === GRID_COLS - 1 || row === 0 || row === GRID_ROWS - 1; }

/** Check if two hexes are adjacent */
function areAdjacent(c1, r1, c2, r2) {
  return getHexNeighbours(c1, r1).some(h => h.col === c2 && h.row === r2);
}

/** Hex distance (axial) */
function hexDistance(c1, r1, c2, r2) {
  // Convert offset to cube coords
  const toCube = (c, r) => { const x = c - (r - (r & 1)) / 2; const z = r; const y = -x - z; return { x, y, z }; };
  const a = toCube(c1, r1), b = toCube(c2, r2);
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}

/** Evaluate council objective benefit — always active, counts qualifying amenities */
function evalCouncilObjective(obj, pd, isTrending) {
  const am = pd.amenities || [];
  const stages = pd.stages || [];
  const ofType = (t) => am.filter(a => a.type === t);
  const cnt = (t) => ofType(t).length;
  let count = 0;

  const stageAdj = (a) => stages.some(s => getStageHexes(s.col, s.row).some(h => areAdjacent(a.col, a.row, h.col, h.row)));
  const isEdgeOrNearEdge = (a) => isEdgeHex(a.col, a.row) || getHexNeighbours(a.col, a.row).some(n => isEdgeHex(n.col, n.row));

  switch (obj.id) {
    case "ticket_evaders": count = ofType("security").filter(a => isEdgeOrNearEdge(a)).length; break;
    case "toxic_waste": count = ofType("portaloo").filter(a => !isEdgeHex(a.col, a.row)).length; break;
    case "put_a_lid": count = ofType("campsite").filter(c => !ofType("portaloo").some(p => areAdjacent(c.col, c.row, p.col, p.row))).length; break;
    case "crowd_control": count = ofType("security").filter(a => stageAdj(a)).length; break;
    case "food_courts": {
      const cats = ofType("catering"); const used = new Set();
      for (const c of cats) { if (used.has(`${c.col},${c.row}`)) continue; const adj = cats.filter(o => o !== c && !used.has(`${o.col},${o.row}`) && areAdjacent(c.col, c.row, o.col, o.row)); if (adj.length >= 2) { count++; used.add(`${c.col},${c.row}`); adj.slice(0, 2).forEach(a => used.add(`${a.col},${a.row}`)); } }
      break;
    }
    case "local_breweries": count = ofType("catering").filter(a => stageAdj(a)).length; break;
    case "groovin_circles": {
      count = stages.filter(s => { const sh = getStageHexes(s.col, s.row); return !sh.some(h => getHexNeighbours(h.col, h.row).some(n => !sh.some(x => x.col === n.col && x.row === n.row) && am.some(a => a.col === n.col && a.row === n.row))); }).length;
      break;
    }
    case "sniffer_dogs": { const secs = ofType("security"); const used = new Set(); for (const s of secs) { if (used.has(`${s.col},${s.row}`)) continue; for (const o of secs) { if (s === o || used.has(`${o.col},${o.row}`)) continue; if (areAdjacent(s.col, s.row, o.col, o.row)) { count++; used.add(`${s.col},${s.row}`); used.add(`${o.col},${o.row}`); break; } } } break; }
    case "special_sauce": { const secs2 = ofType("security"); const cats2 = ofType("catering"); const usedS = new Set(); const usedC = new Set(); for (const s of secs2) { if (usedS.has(`${s.col},${s.row}`)) continue; for (const c of cats2) { if (usedC.has(`${c.col},${c.row}`)) continue; if (areAdjacent(s.col, s.row, c.col, c.row)) { count++; usedS.add(`${s.col},${s.row}`); usedC.add(`${c.col},${c.row}`); break; } } } break; }
    case "in_n_out": count = ofType("portaloo").filter(p => ofType("catering").some(c => areAdjacent(p.col, p.row, c.col, c.row))).length; break;
    case "quiet_camping": count = ofType("campsite").filter(c => stages.length === 0 || stages.every(s => hexDistance(c.col, c.row, s.col, s.row) >= 3)).length; break;
    case "glamping": { const camps3 = ofType("campsite"); const secs3 = ofType("security"); const usedCa = new Set(); const usedSe = new Set(); for (const c of camps3) { if (usedCa.has(`${c.col},${c.row}`)) continue; for (const s of secs3) { if (usedSe.has(`${s.col},${s.row}`)) continue; if (areAdjacent(c.col, c.row, s.col, s.row)) { count++; usedCa.add(`${c.col},${c.row}`); usedSe.add(`${s.col},${s.row}`); break; } } } break; }
    case "luxury_loos": count = ofType("portaloo").filter(p => ofType("security").some(s => areAdjacent(p.col, p.row, s.col, s.row))).length; break;
    case "number_one_fans": count = ofType("portaloo").filter(p => stageAdj(p)).length; break;
    case "form_a_line": { const cats3 = ofType("catering"); if (cats3.length < 2) break; /* Count max line of catering in any hex direction */ const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]; let maxLine = 0; for (const c of cats3) { for (const [dc,dr] of dirs) { let len = 1; let nc = c.col + dc, nr = c.row + dr; while (cats3.some(x => x.col === nc && x.row === nr)) { len++; nc += dc; nr += dr; } maxLine = Math.max(maxLine, len); } } count = maxLine >= 2 ? maxLine : 0; break; }
    case "noise_complaints": count = Math.floor(am.filter(a => !isEdgeHex(a.col, a.row)).length / 2); break;
    case "multiple_entrances": { const as2 = ofType("security").filter(a => stageAdj(a)); const es = ofType("security").filter(a => isEdgeHex(a.col, a.row)); count = Math.min(as2.length, es.length); break; }
    case "reheating_fish": count = cnt("catering") > 0 ? ofType("campsite").filter(c => ofType("catering").every(f => hexDistance(c.col, c.row, f.col, f.row) >= 3)).length : 0; break;
    case "eat_local": count = ofType("campsite").filter(c => ofType("catering").some(f => areAdjacent(c.col, c.row, f.col, f.row))).length; break;
    case "thieves_night": { const secs4 = ofType("security"); count = secs4.reduce((sum, s) => sum + ofType("campsite").filter(c => areAdjacent(c.col, c.row, s.col, s.row)).length, 0); count = Math.floor(count / 3); break; }
    case "meat_the_law": { const secs5 = ofType("security"); count = secs5.reduce((sum, s) => sum + ofType("catering").filter(c => areAdjacent(c.col, c.row, s.col, s.row)).length, 0); count = Math.floor(count / 3); break; }
    case "orderly_queues": count = ofType("security").filter(s => ofType("catering").some(c => hexDistance(s.col, s.row, c.col, c.row) === 3)).length; break;
    case "sit_downs": { const ps = ofType("portaloo"); const used = new Set(); for (const p of ps) { if (used.has(`${p.col},${p.row}`)) continue; for (const q of ps) { if (p === q || used.has(`${q.col},${q.row}`)) continue; if (areAdjacent(p.col, p.row, q.col, q.row)) { count++; used.add(`${p.col},${p.row}`); used.add(`${q.col},${q.row}`); break; } } } break; }
    case "yours_or_mine": { const cs = ofType("campsite"); const visited = new Set(); for (const c of cs) { if (visited.has(`${c.col},${c.row}`)) continue; const adj = cs.filter(o => o !== c && !visited.has(`${o.col},${o.row}`) && areAdjacent(c.col, c.row, o.col, o.row)); if (adj.length >= 2) { count++; visited.add(`${c.col},${c.row}`); adj.slice(0, 2).forEach(a => visited.add(`${a.col},${a.row}`)); } } break; }
    case "chef_beef": count = cnt("catering") >= 2 ? ofType("catering").filter(c => ofType("catering").every(o => o === c || hexDistance(c.col, c.row, o.col, o.row) >= 5)).length : 0; break;
    case "show_of_power": count = ofType("security").filter(s => !am.some(a => a !== s && areAdjacent(s.col, s.row, a.col, a.row))).length; break;
    case "keep_the_peace": { const camps4 = ofType("campsite"); const used2 = new Set(); for (const c of camps4) { if (used2.has(`${c.col},${c.row}`)) continue; for (const o of camps4) { if (c === o || used2.has(`${o.col},${o.row}`)) continue; if (hexDistance(c.col, c.row, o.col, o.row) === 2) { count++; used2.add(`${c.col},${c.row}`); used2.add(`${o.col},${o.row}`); break; } } } break; }
    default: break;
  }

  const r = { active: true, tickets: 0, vp: 0, fame: 0, count };
  if (isTrending) { r.fame = count > 0 ? 1 : 0; return r; }

  switch (obj.id) {
    case "ticket_evaders": case "toxic_waste": case "put_a_lid": case "local_breweries": case "luxury_loos": case "number_one_fans": r.tickets = count; break;
    case "crowd_control": r.vp = Math.floor(count / 3) * 2; break;
    case "food_courts": r.vp = count * 5; break;
    case "groovin_circles": r.tickets = count * 2; break;
    case "sniffer_dogs": r.vp = count; break;
    case "special_sauce": case "glamping": r.tickets = count; break;
    case "in_n_out": r.tickets = count * 2; break;
    case "quiet_camping": r.vp = count; break;
    case "form_a_line": r.tickets = count >= 2 ? count - 1 : 0; break;
    case "noise_complaints": r.tickets = count; break;
    case "multiple_entrances": r.vp = count * 3; break;
    case "reheating_fish": r.vp = count * 2; break;
    case "eat_local": r.vp = count; break;
    case "thieves_night": r.vp = count; break;
    case "meat_the_law": r.vp = count * 3; break;
    case "orderly_queues": r.tickets = count; break;
    case "sit_downs": r.tickets = count * 3; break;
    case "yours_or_mine": r.tickets = count * 5; break;
    case "chef_beef": r.tickets = count; break;
    case "show_of_power": r.tickets = count * 2; break;
    case "keep_the_peace": r.tickets = count; break;
    default: break;
  }
  return r;
}

function isCouncilActive(obj, pd) { return true; }
function calcCouncilBenefit(obj, pd, isTrending) { const r = evalCouncilObjective(obj, pd, isTrending); return { tickets: r.tickets, vp: r.vp, fame: r.fame }; }
function genreGradient(genre) {
  const gs = getGenres(genre);
  if (gs.length === 1) return GENRE_COLORS[gs[0]] || "#6b7280";
  return `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)`;
}
function canAffordArtist(artist, pd) {
  if (pd.fame < artist.fame) return false;
  const counts = { campsite: 0, security: 0, catering: 0, portaloo: 0 };
  pd.amenities.forEach(a => counts[a.type]++);
  return counts.campsite >= artist.campCost && counts.security >= artist.securityCost && counts.catering >= artist.cateringCost && counts.portaloo >= artist.portalooCost;
}
function getAvailableStages(pd) {
  return pd.stages.filter((_, i) => (pd.stageArtists?.[i] || []).length < 3);
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════
function HexGrid({ stages, amenities, onHexClick, placingStage, hoverHex, onHexHover, movingFrom, stageColors, onCenterClick }) {
  const w = Math.sqrt(3) * HEX_SIZE, h = 2 * HEX_SIZE;
  const svgW = GRID_COLS * w + w / 2 + 8, svgH = GRID_ROWS * (h * 0.75) + h * 0.25 + 8;
  // Map each hex to its stage index for coloring
  const hexStageMap = useMemo(() => {
    const m = {};
    stages.forEach((st, si) => getStageHexes(st.col, st.row).forEach(x => { m[`${x.col},${x.row}`] = si; }));
    return m;
  }, [stages]);
  const centerSet = useMemo(() => new Set(stages.map(s => `${s.col},${s.row}`)), [stages]);
  const amenMap = useMemo(() => { const m = {}; amenities.forEach(a => m[`${a.col},${a.row}`] = a); return m; }, [amenities]);
  let prevHexes = []; if (placingStage && hoverHex && stageFullyInBounds(hoverHex.col, hoverHex.row)) prevHexes = getStageHexes(hoverHex.col, hoverHex.row);
  const prevSet = new Set(prevHexes.map(h => `${h.col},${h.row}`));
  const sc = stageColors || [];
  const els = [];
  for (let r = 0; r < GRID_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) {
    const { x, y } = hexToPixel(c, r); const k = `${c},${r}`;
    const si = hexStageMap[k]; const isSt = si !== undefined; const isCtr = centerSet.has(k);
    const am = amenMap[k]; const isPv = prevSet.has(k);
    const isMF = movingFrom && movingFrom.col === c && movingFrom.row === r;
    const baseColor = isSt && sc[si] ? sc[si] : "#7c3aed";
    let fill = "#1a1a2e", stroke = "#2a2a4a", sw = 1, op = 1;
    if (isSt) { fill = baseColor + "30"; stroke = baseColor; sw = 1.5; }
    if (isCtr) { fill = baseColor + "60"; stroke = baseColor; sw = 2; }
    if (isPv) { fill = "#4c1d95"; stroke = "#c4b5fd"; sw = 2; op = 0.7; }
    if (isMF) { fill = "#92400e"; stroke = "#fbbf24"; sw = 2; }
    els.push(<g key={k} onClick={() => { if (isCtr && onCenterClick) { onCenterClick(si); } else { onHexClick?.(c, r); } }} onMouseEnter={() => onHexHover?.({ col: c, row: r })} onMouseLeave={() => onHexHover?.(null)} style={{ cursor: "pointer" }}>
      <polygon points={hexPoints(x, y, HEX_SIZE)} fill={fill} stroke={stroke} strokeWidth={sw} opacity={op} />
      {isCtr && <text x={x} y={y + 3} textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">🎤</text>}
      {am && !isMF && <text x={x} y={y + 6} textAnchor="middle" fontSize="18">{AMENITY_ICONS[am.type]}</text>}
    </g>);
  }
  return <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ maxWidth: "100%", maxHeight: "100%" }}><rect width={svgW} height={svgH} fill="transparent" />{els}</svg>;
}

function ArtistCard({ artist, onClick, small, disabled, selected, showCost, affordable }) {
  const gs = getGenres(artist.genre);
  const bg = gs.length === 1 ? GENRE_COLORS[gs[0]] || "#6b7280" : null;
  const grad = gs.length > 1 ? `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)` : undefined;
  const sz = small ? { width: 110, minHeight: 90, padding: "6px 8px", fontSize: 10 } : { width: 150, minHeight: 130, padding: "8px 10px", fontSize: 11 };
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      ...sz, borderRadius: 10, border: selected ? "2px solid #fbbf24" : affordable ? "2px solid rgba(251,191,36,0.5)" : "2px solid rgba(255,255,255,0.15)",
      background: grad || bg, color: "#fff", cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1, display: "flex", flexDirection: "column", gap: 2,
      position: "relative", overflow: "hidden", transition: "all 0.15s", flexShrink: 0,
      boxShadow: selected ? "0 0 12px rgba(251,191,36,0.4)" : "0 2px 8px rgba(0,0,0,0.3)",
      animation: affordable && !disabled && !selected ? "affordPulse 2s ease-in-out infinite" : "none",
    }}>
      <div style={{ fontWeight: 800, fontSize: small ? 10 : 12, lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{artist.name}</div>
      <div style={{ fontSize: small ? 8 : 9, opacity: 0.9 }}>🔥{artist.fame} • {artist.genre}</div>
      <div style={{ fontSize: small ? 8 : 9, display: "flex", gap: 4, flexWrap: "wrap" }}>
        <span>🎟️{artist.tickets}</span><span>⭐{artist.vp}VP</span>
      </div>
      {showCost && <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
        {artist.campCost > 0 && <span>⛺{artist.campCost} </span>}
        {artist.securityCost > 0 && <span>👮‍♀️{artist.securityCost} </span>}
        {artist.cateringCost > 0 && <span>🍔{artist.cateringCost} </span>}
        {artist.portalooCost > 0 && <span>🚽{artist.portalooCost}</span>}
      </div>}
      {artist.effect && <div style={{ fontSize: small ? 7 : 8, fontStyle: "italic", opacity: 0.9, marginTop: "auto", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>✨ {artist.effect}</div>}
    </div>
  );
}

function DiceDisplay({ dice, onPick, disabled, onReroll, canReroll }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
      {dice.map((d, i) => {
        const isC = d === "catering_or_portaloo" || d === "security_or_campsite";
        const isFame = d === "fame";
        const label = isFame ? "🔥" : isC ? (d === "catering_or_portaloo" ? "🍔 OR 🚽" : "👮‍♀️ OR ⛺") : AMENITY_ICONS[d];
        const sub = isFame ? "Fame" : isC ? (d === "catering_or_portaloo" ? "Van / Loo" : "Sec / Camp") : AMENITY_LABELS[d];
        return <button key={i} onClick={() => !disabled && onPick(i, d)} disabled={disabled} style={{
          width: 72, height: 80, borderRadius: 12, border: isFame ? "2px solid #fbbf24" : "2px solid #7c3aed",
          background: isFame ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)", color: isFame ? "#fbbf24" : "#e9d5ff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 2, cursor: disabled ? "default" : "pointer", fontSize: 22,
          opacity: disabled ? 0.4 : 1, transition: "all 0.2s",
        }}><span>{label}</span><span style={{ fontSize: 9, opacity: 0.8 }}>{sub}</span></button>;
      })}
      {canReroll && <button onClick={onReroll} style={{
        width: 72, height: 80, borderRadius: 12, border: "2px dashed #fbbf24",
        background: "rgba(251,191,36,0.15)", color: "#fbbf24",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: 14, fontWeight: 700, gap: 2,
      }}>🔄<span style={{ fontSize: 9 }}>Reroll All</span></button>}
    </div>
  );
}

function DiceRollOverlay({ pendingRoll, onRoll, onComplete, sfx }) {
  const [rolling, setRolling] = useState(false);
  const [animFrames, setAnimFrames] = useState([]);
  const [finalResults, setFinalResults] = useState(null);

  const doRoll = () => {
    if (rolling) return;
    setRolling(true);
    sfx?.placeAmenity();
    // Animate 6 frames of random dice, then settle
    let frame = 0;
    const iv = setInterval(() => {
      setAnimFrames(shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingRoll.count));
      frame++;
      if (frame >= 8) {
        clearInterval(iv);
        const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingRoll.count);
        setFinalResults(results);
        setAnimFrames([]);
        setRolling(false);
        onRoll(results);
      }
    }, 120);
  };

  const display = finalResults || (rolling ? animFrames : null);
  const diceLabel = (d) => {
    if (d === "fame") return "🔥";
    if (d === "catering_or_portaloo") return "🍔/🚽";
    if (d === "security_or_campsite") return "👮‍♀️/⛺";
    return AMENITY_ICONS[d] || d;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 500, width: "100%", border: "2px solid #7c3aed", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
        <div style={{ fontSize: 16, color: "#c4b5fd", marginBottom: 4 }}>{pendingRoll.artistName}</div>
        <h2 style={{ color: "#fbbf24", fontSize: 24, margin: "0 0 16px" }}>🎲 Roll {pendingRoll.count} Dice!</h2>
        {!display && <button onClick={doRoll} style={{
          padding: "16px 40px", borderRadius: 14, border: "2px solid #fbbf24",
          background: "linear-gradient(135deg, #422006, #713f12)", color: "#fbbf24",
          fontSize: 20, fontWeight: 800, cursor: "pointer",
          animation: "pulse 1.5s infinite",
        }}>🎲 ROLL!</button>}
        {display && <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {display.map((d, i) => <div key={i} style={{
            width: 64, height: 70, borderRadius: 12,
            border: d === "fame" ? "2px solid #fbbf24" : "2px solid #7c3aed",
            background: d === "fame" ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)",
            color: d === "fame" ? "#fbbf24" : "#e9d5ff",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontSize: 24, transition: rolling ? "none" : "all 0.3s",
            transform: rolling ? `rotate(${Math.random() * 20 - 10}deg)` : "none",
          }}><span>{diceLabel(d)}</span></div>)}
        </div>}
        {finalResults && !rolling && <>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{pendingRoll.resultText?.(finalResults) || ""}</div>
          <button onClick={() => onComplete(finalResults)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>Continue →</button>
        </>}
      </div>
    </div>
  );
}

function GameLog({ log, onClose }) {
  const groups = []; let cur = null;
  for (const e of log) { if (e.type === "header") { cur = { header: e, entries: [] }; groups.push(cur); } else { if (!cur) { cur = { header: null, entries: [] }; groups.push(cur); } cur.entries.push(e); } }
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#0f0e1a", borderLeft: "2px solid #7c3aed", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(124,58,237,0.3)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a4a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#c4b5fd" }}>📜 Game Log</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {groups.length === 0 && <p style={{ color: "#6b7280", fontSize: 13, padding: 8 }}>No events yet.</p>}
        {groups.map((g, i) => <div key={i} style={{ marginBottom: 16 }}>
          {g.header && <div style={{ padding: "6px 10px", marginBottom: 6, borderRadius: 8, background: g.header.ht === "year" ? "rgba(251,191,36,0.15)" : g.header.ht === "round" ? "rgba(248,113,113,0.15)" : "rgba(124,58,237,0.15)", borderLeft: `3px solid ${g.header.ht === "year" ? "#fbbf24" : g.header.ht === "round" ? "#f87171" : "#7c3aed"}` }}>
            <span style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: g.header.ht === "year" ? "#fbbf24" : g.header.ht === "round" ? "#f87171" : "#c4b5fd" }}>{g.header.text}</span>
          </div>}
          {g.entries.map((e, j) => <div key={j} style={{ marginBottom: 4, marginLeft: 8, padding: "5px 10px", background: "rgba(124,58,237,0.06)", borderRadius: 6, fontSize: 12, color: "#d1d5db", borderLeft: "2px solid #3b3564" }}>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{e.label}</span>
            <span style={{ marginLeft: 6, color: "#94a3b8" }}>{e.text}</span>
          </div>)}
        </div>)}
      </div>
    </div>
  );
}

function DiscardViewer({ discard, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f0e1a", border: "1px solid #7c3aed", borderRadius: 16, padding: 20, maxWidth: 700, maxHeight: "80vh", overflowY: "auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "#c4b5fd", margin: 0 }}>🗑️ Discard Pile ({discard.length} artists)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {discard.length === 0 ? <p style={{ color: "#6b7280" }}>No discarded artists yet.</p> :
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {discard.map((a, i) => <ArtistCard key={i} artist={a} small showCost />)}
          </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI ENGINE
// ═══════════════════════════════════════════════════════════

/** Find a valid hex to place an amenity (not on stage, not occupied) */
function aiFindPlacement(pd) {
  const occupied = new Set();
  (pd.amenities || []).forEach(a => occupied.add(`${a.col},${a.row}`));
  (pd.stages || []).forEach(s => getStageHexes(s.col, s.row).forEach(h => occupied.add(`${h.col},${h.row}`)));
  // Prefer tiles near stages but not on them
  const candidates = [];
  for (let r = 0; r < GRID_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) {
    if (!occupied.has(`${c},${r}`)) {
      let nearStage = 0;
      (pd.stages || []).forEach(s => { if (hexDistance(c, r, s.col, s.row) <= 3) nearStage++; });
      candidates.push({ col: c, row: r, score: nearStage * 10 + Math.random() * 5 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || { col: 6, row: 6 };
}

/** Find a valid stage placement position */
function aiFindStagePlacement(pd) {
  const candidates = [];
  for (let r = 2; r < GRID_ROWS - 2; r++) for (let c = 2; c < GRID_COLS - 2; c++) {
    if (stageFullyInBounds(c, r) && !stageWouldOverlap(c, r, pd.stages || [])) {
      // Prefer center-ish, away from other stages
      const distCenter = Math.abs(c - 6) + Math.abs(r - 6);
      let minStageDist = 99;
      (pd.stages || []).forEach(s => { const d = hexDistance(c, r, s.col, s.row); if (d < minStageDist) minStageDist = d; });
      candidates.push({ col: c, row: r, score: -distCenter + (minStageDist > 4 ? 10 : 0) + Math.random() * 3 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || { col: 6, row: 6 };
}

/** AI picks the best amenity type to take, considering what it needs most */
function aiPickAmenityType(pd) {
  const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  (pd.amenities || []).forEach(a => counts[a.type]++);
  // Priority: security for events, campsites for tickets, then balance
  const needs = [
    { type: "security", need: Math.max(0, 3 - counts.security) * 10 + Math.random() * 3 },
    { type: "campsite", need: Math.max(0, 4 - counts.campsite) * 8 + Math.random() * 3 },
    { type: "catering", need: Math.max(0, 2 - counts.catering) * 6 + Math.random() * 3 },
    { type: "portaloo", need: Math.max(0, 2 - counts.portaloo) * 5 + Math.random() * 3 },
  ];
  needs.sort((a, b) => b.need - a.need);
  return needs[0].type;
}

/** AI decides which die to pick from available dice */
function aiPickDie(dice, pd, preferredType) {
  const wanted = preferredType || aiPickAmenityType(pd);
  // Find a die that gives the wanted type
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === wanted) return { idx: i, type: wanted };
    if (dice[i] === "catering_or_portaloo" && (wanted === "catering" || wanted === "portaloo")) return { idx: i, type: wanted };
    if (dice[i] === "security_or_campsite" && (wanted === "security" || wanted === "campsite")) return { idx: i, type: wanted };
  }
  // Fallback: pick fame die if available (free fame is good)
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "fame") return { idx: i, type: "fame" };
  }
  // Fallback: pick first available
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "catering_or_portaloo") return { idx: i, type: "catering" };
    if (dice[i] === "security_or_campsite") return { idx: i, type: "security" };
    if (dice[i] !== "fame") return { idx: i, type: dice[i] };
  }
  return { idx: 0, type: dice[0] || "campsite" };
}

/** AI selects which draft artists to keep (indices) */
function aiDraftSelect(options) {
  // Prefer one low-fame (playable soon) and one high-fame (for later)
  const scored = options.map((a, i) => ({
    idx: i, score: a.vp * 2 + a.tickets * 3 + (a.effect ? 5 : 0) + (a.fame <= 1 ? 10 : 0) + Math.random() * 3
  }));
  scored.sort((a, b) => b.score - a.score);
  return [scored[0].idx, scored[1].idx];
}

/** AI decides which amenity to pick in setup */
function aiPickSetupAmenity() {
  const r = Math.random();
  if (r < 0.35) return "security";
  if (r < 0.6) return "campsite";
  if (r < 0.8) return "portaloo";
  return "catering";
}

/** AI decides what to do on its turn: returns { action, ... } */
function aiDecideTurn(pd, artistPool, dice, year) {
  const sa = pd.stageArtists || [];
  const openStages = sa.filter(s => s.length < 3);
  const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  (pd.amenities || []).forEach(a => counts[a.type]++);
  const totalAmenities = Object.values(counts).reduce((s, v) => s + v, 0);
  const fame = pd.fame || 0;

  // Find bookable artists — check against current fame level
  const bookablePool = artistPool.filter(a => a.fame <= fame && counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost);
  const bookableHand = (pd.hand || []).filter(a => a.fame <= fame && counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost);
  const hasOpenStage = openStages.length > 0;

  // PRIORITY 1: Always try to book if possible — filling stages is critical
  if ((bookablePool.length > 0 || bookableHand.length > 0) && hasOpenStage) {
    const allBookable = [
      ...bookablePool.map(a => ({ a, src: "pool", idx: artistPool.indexOf(a) })),
      ...bookableHand.map(a => ({ a, src: "hand", idx: (pd.hand || []).indexOf(a) }))
    ];
    // Score: prefer high VP+tickets, prefer filling stages that are close to 3 (headliner!), prefer low fame cost
    allBookable.sort((x, y) => {
      // Prioritize putting 3rd artist on a stage (headliner bonus)
      const xStage = sa.findIndex(s => s.length === 2 && s.length < 3);
      const yStage = sa.findIndex(s => s.length === 2 && s.length < 3);
      const xScore = (x.a.vp * 3 + x.a.tickets * 2) + (x.a.effect ? 5 : 0);
      const yScore = (y.a.vp * 3 + y.a.tickets * 2) + (y.a.effect ? 5 : 0);
      return yScore - xScore;
    });
    const pick = allBookable[0];
    // Prefer stage closest to full (2/3 → headliner!)
    let bestStage = sa.findIndex(s => s.length === 2);
    if (bestStage < 0) bestStage = sa.findIndex(s => s.length === 1);
    if (bestStage < 0) bestStage = sa.findIndex(s => s.length === 0);
    if (bestStage < 0) bestStage = 0;
    return { action: "book", source: pick.src, artistIdx: pick.idx, stageIdx: bestStage };
  }

  // PRIORITY 2: Reserve a good artist if we can't book but hand is small
  const handSize = (pd.hand || []).length;
  if (hasOpenStage && handSize < 3 && artistPool.length > 0) {
    // Reserve the most valuable artist we could afford soon
    const scored = artistPool.map((a, i) => {
      let s = a.vp * 2 + a.tickets;
      if (a.fame <= fame) s += 15; // can afford fame-wise
      if (a.fame <= fame + 1) s += 8; // almost affordable
      s += Math.random() * 3;
      return { i, s };
    });
    scored.sort((a, b) => b.s - a.s);
    // Only reserve if it's a good pick, otherwise get amenities
    if (scored[0].s > 10) return { action: "reserve", poolIdx: scored[0].i };
  }

  // PRIORITY 3: Get amenities — but be strategic about what we need
  // Check what amenities would unlock the most artists
  const neededForArtists = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  [...artistPool, ...(pd.hand || [])].forEach(a => {
    if (a.fame <= fame + 1) { // artists we could afford soon
      if (a.campCost > counts.campsite) neededForArtists.campsite++;
      if (a.securityCost > counts.security) neededForArtists.security++;
      if (a.cateringCost > counts.catering) neededForArtists.catering++;
      if (a.portalooCost > counts.portaloo) neededForArtists.portaloo++;
    }
  });

  return { action: "amenity", preferredType: Object.entries(neededForArtists).sort((a, b) => b[1] - a[1])[0]?.[0] };
}

// ═══════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════
export default function Headliners() {
  // Phase management
  const [phase, setPhase] = useState("lobby");
  const [players, setPlayers] = useState([{ id: 0, name: "Player 1", festivalName: "", isAI: false }, { id: 1, name: "Player 2", festivalName: "", isAI: false }]);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerData, setPlayerData] = useState({});
  const [setupIndex, setSetupIndex] = useState(0);
  const [setupStep, setSetupStep] = useState("pickAmenity");
  const [setupSelectedAmenity, setSetupSelectedAmenity] = useState(null);

  // Game state
  const [year, setYear] = useState(1);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState({});
  const [dice, setDice] = useState([]);
  const [turnAction, setTurnAction] = useState(null);
  const [actionTaken, setActionTaken] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState(null);

  // Goals system
  const [activeGoals, setActiveGoals] = useState([]); // [{ goal, setAsideArtists: [fame3, fame5], req2ClaimedBy: null, req3ClaimedBy: null }]
  const [goalProgress, setGoalProgress] = useState({}); // { playerId: { portalooRefreshes: 0, fameDieRolls: 0, ... } }
  const [goalReq1Claimed, setGoalReq1Claimed] = useState({}); // { goalId: { playerId: true } } — tracks who claimed req1
  const [selectedDie, setSelectedDie] = useState(null);
  const [choiceAmenity, setChoiceAmenity] = useState(null);
  const [placingAmenity, setPlacingAmenity] = useState(null);
  const [placingStage, setPlacingStage] = useState(false);
  const [movingFrom, setMovingFrom] = useState(null);
  const [movedThisTurn, setMovedThisTurn] = useState(false);
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null); // { count, results, rolled, pid, artistName, callback }
  const [hoverHex, setHoverHex] = useState(null);
  const [showTurnStart, setShowTurnStart] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [allTickets, setAllTickets] = useState({});
  const [revealIndex, setRevealIndex] = useState(0);
  const [leaderboardRevealed, setLeaderboardRevealed] = useState(false);

  // Pre-round
  const [preRoundIndex, setPreRoundIndex] = useState(0);
  const [preRoundStep, setPreRoundStep] = useState("notify");
  const [displacedAmenities, setDisplacedAmenities] = useState([]);
  const [displacedPlaceIdx, setDisplacedPlaceIdx] = useState(0);

  // Artist system
  const [artistDeck, setArtistDeck] = useState([]);
  const [artistPool, setArtistPool] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [showDiscard, setShowDiscard] = useState(false);
  const [firstFullLineup, setFirstFullLineup] = useState(false);

  // Artist action sub-states
  const [artistAction, setArtistAction] = useState(null); // "bookFromPool","bookFromHand","reserveFromPool","reserveFromDeck","pickStage"
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedStageIdx, setSelectedStageIdx] = useState(null);
  const [showHeadliner, setShowHeadliner] = useState(null); // { artist, festival }
  const [showBookedArtist, setShowBookedArtist] = useState(null); // { artist, stageName, isHeadliner, festival }
  const [floatingBonuses, setFloatingBonuses] = useState([]); // [{ id, text, color, x }]
  const [showHand, setShowHand] = useState(false);
  const [deckDrawnCard, setDeckDrawnCard] = useState(null); // card drawn from deck awaiting confirm
  const [deckCardRevealed, setDeckCardRevealed] = useState(false);

  // Setup artist draft
  const [setupDraftOptions, setSetupDraftOptions] = useState([]); // 4 cards offered to current setup player
  const [setupDraftSelected, setSetupDraftSelected] = useState(null);
  const [draftRemaining0, setDraftRemaining0] = useState([]); // pool of 0-fame artists for drafting
  const [draftRemaining5, setDraftRemaining5] = useState([]); // pool of 5-fame artists for drafting
  const [undraftedArtists, setUndraftedArtists] = useState([]); // unchosen draft cards to shuffle back

  // Objectives
  const [objectiveDeck, setObjectiveDeck] = useState([]);
  const [playerObjectives, setPlayerObjectives] = useState({}); // { playerId: objective }
  const [trendingObjective, setTrendingObjective] = useState(null);
  const [microtrends, setMicrotrends] = useState([]); // [{ genre, claimedBy: null }]
  const [trendingCouncil, setTrendingCouncil] = useState(null); // a council objective used as trending
  const [showObjectives, setShowObjectives] = useState(false);
  const [showStageDetail, setShowStageDetail] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("my"); // "my" or "trending"
  const [showYearAnnouncement, setShowYearAnnouncement] = useState(false);

  // Council objectives
  const [councilDeck, setCouncilDeck] = useState([]);
  const [playerCouncils, setPlayerCouncils] = useState({}); // { playerId: [{ obj, active, fameGranted }] }
  const [showCouncilFame, setShowCouncilFame] = useState(null); // { name, festival } for notification
  const [viewingPlayerId, setViewingPlayerId] = useState(null);

  // Pending effects queue (for effects that need player interaction)
  const [pendingEffect, setPendingEffect] = useState(null); // { type: "placeAmenity"|"placeSpecific"|"signArtist", amenityType?, artistName? }
  const [pendingEffectPid, setPendingEffectPid] = useState(null);
  const [deferPoolRefresh, setDeferPoolRefresh] = useState(false);
  const [poolRefreshedByEffect, setPoolRefreshedByEffect] = useState(false);

  // Special Guest phase
  const [specialGuestPlayer, setSpecialGuestPlayer] = useState(0); // index in players array
  const [specialGuestCard, setSpecialGuestCard] = useState(null); // the drawn artist
  const [specialGuestEligible, setSpecialGuestEligible] = useState([]); // stage indices with 2/3 artists

  // Events system
  const [eventDeck, setEventDeck] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]); // 3 drawn at year start — { event, revealed: false }
  const [playerPersonalEvents, setPlayerPersonalEvents] = useState({}); // { pid: [event] }
  const [eventPhasePlayer, setEventPhasePlayer] = useState(0);
  const [eventPhaseResults, setEventPhaseResults] = useState(null);
  const [eventPhaseStep, setEventPhaseStep] = useState("delegate"); // "delegate" or "results"
  const [securityDelegation, setSecurityDelegation] = useState(0);

  // Logging
  const addLog = useCallback((label, text) => setGameLog(p => [...p, { label, text, type: "entry" }]), []);
  const addLogH = useCallback((text, ht) => setGameLog(p => [...p, { text, type: "header", ht: ht || "turn" }]), []);

  const floatCounter = useRef(0);

  // ─── Sound Effects (Web Audio API) ───
  const audioCtx = useRef(null);
  const getCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);
  const playTone = useCallback((freq, dur, type = "sine", vol = 0.15) => {
    try {
      const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }, [getCtx]);
  const sfx = useMemo(() => ({
    placeAmenity: () => { playTone(800, 0.08, "sine", 0.12); setTimeout(() => playTone(600, 0.06, "sine", 0.08), 60); },
    bookArtist: () => { playTone(523, 0.1, "triangle", 0.15); setTimeout(() => playTone(659, 0.1, "triangle", 0.15), 80); setTimeout(() => playTone(784, 0.15, "triangle", 0.12), 160); },
    headliner: () => { playTone(523, 0.1, "triangle", 0.18); setTimeout(() => playTone(659, 0.08, "triangle", 0.16), 100); setTimeout(() => playTone(784, 0.08, "triangle", 0.16), 180); setTimeout(() => playTone(1047, 0.25, "triangle", 0.2), 260); },
    gainVP: () => { playTone(880, 0.12, "sine", 0.1); setTimeout(() => playTone(1100, 0.1, "sine", 0.08), 80); },
    gainTickets: () => { playTone(660, 0.08, "square", 0.06); setTimeout(() => playTone(770, 0.1, "square", 0.05), 70); },
    gainFame: () => { playTone(440, 0.12, "sawtooth", 0.08); setTimeout(() => playTone(660, 0.15, "sawtooth", 0.1), 100); setTimeout(() => playTone(880, 0.2, "sawtooth", 0.08), 200); },
    placeStage: () => { playTone(330, 0.15, "triangle", 0.12); setTimeout(() => playTone(440, 0.12, "triangle", 0.1), 120); setTimeout(() => playTone(550, 0.2, "triangle", 0.12), 220); },
  }), [playTone]);
  const showFloatingBonus = useCallback((text, color) => {
    const id = Date.now() + Math.random();
    const offset = (floatCounter.current % 4) * 50; // stagger by 50px each
    floatCounter.current++;
    setFloatingBonuses(p => [...p, { id, text, color: color || "#fbbf24", offset }]);
    setTimeout(() => setFloatingBonuses(p => p.filter(b => b.id !== id)), 2200);
  }, []);

  // Derived
  const currentPlayerId = turnOrder[currentPlayerIdx];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPD = playerData[currentPlayerId] || {};
  const noTurnsLeft = currentPlayerId !== undefined && (turnsLeft[currentPlayerId] || 0) <= 0;

  // ─── Ticket calc ───
  /** Compute effective fame for a player: stages + council fame bonuses + artist effects, capped at 5 */
  const calcFame = useCallback((pd, councils) => {
    let f = 0; // no passive fame from stages
    // Trending council fame bonus (applies to all players)
    if (trendingCouncil) {
      const tb = evalCouncilObjective(trendingCouncil, pd, true);
      if (tb.active) f += tb.fame;
    }
    // Base fame from effects (already stored in pd.baseFame from artist effects like +1 Fame)
    f += pd.baseFame || 0;
    return Math.min(FAME_MAX, f);
  }, [trendingCouncil]);

  const recalcTickets = useCallback(() => {
    setPlayerData(prev => {
      const next = { ...prev };
      for (const pid of Object.keys(next)) {
        const pd = next[pid];
        if (!pd || !pd.amenities) continue;
        let t = pd.amenities.filter(a => a.type === "campsite").length * 2;
        (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets; }));
        t += pd.bonusTickets || 0;
        // Council ticket benefits (personal councils)
        const councils = playerCouncils[pid] || [];
        councils.forEach(co => {
          if (co.active) {
            const b = calcCouncilBenefit(co.obj, pd, false);
            t += b.tickets;
          }
        });
        // Trending council benefit (fame-based, applied to all players)
        if (trendingCouncil) {
          const tb = calcCouncilBenefit(trendingCouncil, pd, true);
          // Fame from trending council added to baseFame dynamically would be complex,
          // so we track it in the fame calc via councils
        }
        // Compute fame
        const fame = calcFame(pd, councils);
        next[pid] = { ...pd, tickets: t, rawTickets: t, fame };
      }
      return next;
    });
  }, [playerCouncils, calcFame]);

  // ─── Deck management ───
  /** Get names of all artists currently in use (on stages, in hands, in pool) */
  /** Check if placing security triggers Kendrick-style VP bonus */
  function checkSecurityVPBonus(pid, amenityType) {
    if (amenityType !== "security") return;
    const pd = playerData[pid];
    if (pd && pd.vpPerSecurity > 0) {
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + p[pid].vpPerSecurity } }));
      addLog("Effect", `+${pd.vpPerSecurity} VP from security placement!`);
      showFloatingBonus(`+${pd.vpPerSecurity} ⭐ (security)`, "#c4b5fd");
    }
  }

  /** Get names of all artists currently in use (on stages, in hands, in pool) */
  function getInUseNames() {
    const names = new Set();
    artistPool.forEach(a => names.add(a.name));
    for (const pid of Object.keys(playerData)) {
      const pd = playerData[pid];
      (pd.hand || []).forEach(a => names.add(a.name));
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => names.add(a.name)));
    }
    return names;
  }

  function drawFromDeck(count = 1) {
    const inUse = getInUseNames();
    let deck = [...artistDeck];
    let disc = [...discardPile];
    const drawn = [];
    for (let i = 0; i < count; i++) {
      // Filter deck to exclude in-use artists
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name))); disc = disc.filter(a => inUse.has(a.name));
      }
      // Skip any in-use artists at top of deck
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) {
        disc.push(deck.pop());
      }
      if (deck.length > 0) {
        const card = deck.pop();
        drawn.push(card);
        inUse.add(card.name); // prevent drawing same card twice in one batch
      }
    }
    setArtistDeck(deck); setDiscardPile(disc);
    return drawn;
  }

  function refillPool(overridePool) {
    const inUse = getInUseNames();
    let deck = [...artistDeck]; let disc = [...discardPile]; let pool = overridePool ? [...overridePool] : [...artistPool];
    pool.forEach(a => inUse.add(a.name));
    while (pool.length < 5) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name)));
        disc = disc.filter(a => inUse.has(a.name));
      }
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
      if (deck.length === 0) break;
      const card = deck.pop();
      pool.push(card);
      inUse.add(card.name);
    }
    setArtistDeck(deck); setDiscardPile(disc); setArtistPool(pool);
  }

  function refreshPool() {
    const inUse = getInUseNames();
    // Remove current pool names from in-use since they're going back to discard
    artistPool.forEach(a => inUse.delete(a.name));
    let disc = [...discardPile, ...artistPool];
    let deck = [...artistDeck];
    let pool = [];
    while (pool.length < 5) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name)));
        disc = disc.filter(a => inUse.has(a.name));
      }
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
      if (deck.length === 0) break;
      const card = deck.pop();
      pool.push(card);
      inUse.add(card.name);
    }
    setArtistPool(pool); setArtistDeck(deck); setDiscardPile(disc);
  }

  /** Trigger an effect dice roll — shows the overlay and calls callback with results */
  /** Track goal progress and check milestones */
  function trackGoalProgress(pid, trackKey) {
    setGoalProgress(prev => {
      const next = { ...prev, [pid]: { ...prev[pid], [trackKey]: (prev[pid]?.[trackKey] || 0) + 1 } };
      const newVal = next[pid][trackKey];
      // Check each active goal
      activeGoals.forEach((ag, gi) => {
        if (ag.goal.trackKey !== trackKey) return;
        const pName = players.find(p => p.id === pid)?.festivalName || "?";
        // Req 1 — all players can achieve
        if (newVal >= ag.goal.req1Target) {
          setGoalReq1Claimed(prev2 => {
            if (prev2[ag.goal.id]?.[pid]) return prev2; // already claimed
            const drawn = drawFromDeck(1);
            if (drawn.length > 0) {
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
              addLog("🏆 Goal", `${pName} achieved "${ag.goal.name}" Req 1 → drew ${drawn[0].name}!`);
              showFloatingBonus("🏆 Goal!", "#fbbf24");
            }
            return { ...prev2, [ag.goal.id]: { ...(prev2[ag.goal.id] || {}), [pid]: true } };
          });
        }
        // Req 2 — first player only
        if (newVal >= ag.goal.req2Target && !ag.req2ClaimedBy) {
          setActiveGoals(prevG => prevG.map((g, i) => i === gi ? { ...g, req2ClaimedBy: pid } : g));
          if (ag.rewardType === "artist" && ag.setAsideArtists[0]) {
            const prize = ag.setAsideArtists[0];
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), { ...prize, freePlay: true }] } }));
            addLog("🏆 Goal", `${pName} FIRST to achieve "${ag.goal.name}" Req 2 → won ${prize.name}! (plays free)`);
            showFloatingBonus(`🏆 ${prize.name}!`, "#fbbf24"); sfx.headliner();
          } else {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 5 } }));
            addLog("🏆 Goal", `${pName} FIRST to achieve "${ag.goal.name}" Req 2 → +5 VP!`);
            showFloatingBonus("🏆 +5 ⭐!", "#fbbf24"); sfx.headliner();
          }
        }
        // Req 3 — first player only
        if (newVal >= ag.goal.req3Target && !ag.req3ClaimedBy) {
          setActiveGoals(prevG => prevG.map((g, i) => i === gi ? { ...g, req3ClaimedBy: pid } : g));
          if (ag.rewardType === "artist" && ag.setAsideArtists[1]) {
            const prize = ag.setAsideArtists[1];
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), { ...prize, freePlay: true }] } }));
            addLog("🏆 Goal", `${pName} FIRST to achieve "${ag.goal.name}" Req 3 → won ${prize.name}! (plays free)`);
            showFloatingBonus(`🏆🌟 ${prize.name}!`, "#fbbf24"); sfx.headliner();
          } else {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 10 } }));
            addLog("🏆 Goal", `${pName} FIRST to achieve "${ag.goal.name}" Req 3 → +10 VP!`);
            showFloatingBonus("🏆🌟 +10 ⭐!", "#fbbf24"); sfx.headliner();
          }
        }
      });
      return next;
    });
  }

  /** Check if an artist is free to play (won from goal) */
  function canAffordArtistOrFree(artist, pd) {
    if (artist.freePlay) return true;
    return canAffordArtist(artist, pd);
  }

  function triggerDiceRoll(count, pid, artistName, resultText, callback) {
    setPendingDiceRoll({ count, pid, artistName, resultText, callback, rolled: false });
  }

  // ─── Apply artist effects ───
  function applyEffect(artist, pid, times = 1) {
    const eff = (artist.effect || "").trim();
    if (!eff) return;
    const el = eff.toLowerCase();
    // For effects that are cumulative (VP, fame, tickets, events), apply `times` iterations
    // For interactive effects (sign, draw, place), scale the amount instead of looping
    for (let t = 0; t < times; t++) {
      // === Fame effects ===
      if (el.includes("+fame") || (el.includes("+1 fame") && !el.includes("fame if"))) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("Effect", `${artist.name}: +1 Fame`);
        showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
      }
      // "+1 Fame if you have played 2 [Genre] artists this year"
      if (el.includes("fame if you have played 2")) {
        const genreMatch = eff.match(/played 2 (\w+) artists/i);
        if (genreMatch) {
          const targetGenre = genreMatch[1];
          const pd = playerData[pid];
          const count = (pd.stageArtists || []).flat().filter(a => getGenres(a.genre).includes(targetGenre)).length;
          if (count >= 2) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
            addLog("Effect", `${artist.name}: +1 Fame (2+ ${targetGenre} artists!)`);
            showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
          } else {
            addLog("Effect", `${artist.name}: Need 2 ${targetGenre} artists (have ${count})`);
          }
        }
      }
      // === VP effects ===
      if ((el.includes("+1 vp") || el.includes("+1vp")) && !el.includes("vp /") && !el.includes("vp per") && !el.includes("vp if")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 1 } }));
        addLog("Effect", `${artist.name}: +1 VP`); showFloatingBonus("+1 ⭐", "#c4b5fd");
      }
      if (el.includes("gain 1vp per existing campsite")) {
        const camps = (playerData[pid]?.amenities || []).filter(a => a.type === "campsite").length;
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + camps } }));
        addLog("Effect", `${artist.name}: +${camps} VP (1 per campsite)`);
      }
      // === Ticket effects ===
      if (el.includes("+4 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 4 } }));
        addLog("Effect", `${artist.name}: +4 ticket sales`); showFloatingBonus("+4 🎟️", "#fbbf24");
      }
      if (el.includes("+5 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 5 } }));
        addLog("Effect", `${artist.name}: +5 ticket sales`); showFloatingBonus("+5 🎟️", "#fbbf24");
      }
      // "+1 ticket sale for all players"
      if (el.includes("ticket sale for all players") || el.includes("ticket sales for all players")) {
        players.forEach(p => {
          setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: (prev[p.id].bonusTickets || 0) + 1 } }));
        });
        addLog("Effect", `${artist.name}: +1 ticket for ALL players!`);
        showFloatingBonus("+1 🎟️ all!", "#fbbf24");
      }
      // "+1 ticket sale / Current Fame Level"
      if (el.includes("ticket sale / current fame") || el.includes("ticket / current fame")) {
        const fame = playerData[pid]?.fame || 0;
        if (fame > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fame } }));
          addLog("Effect", `${artist.name}: +${fame} tickets (1 per Fame level)`);
          showFloatingBonus(`+${fame} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / Negative Event this year"
      if (el.includes("ticket / negative event this year") || el.includes("ticket / negative event")) {
        const negCount = (playerPersonalEvents[pid] || []).filter(e => e.color === "red").length + globalEvents.filter(g => g.event.color === "red").length;
        if (negCount > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + negCount } }));
          addLog("Effect", `${artist.name}: +${negCount} tickets (1 per negative event)`);
          showFloatingBonus(`+${negCount} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / amenity adjacent to this artist's stage"
      if (el.includes("ticket / amenity adjacent") || el.includes("ticket/ amenity adjacent")) {
        const pd = playerData[pid];
        // Find which stage this artist is on
        let adjCount = 0;
        (pd.stageArtists || []).forEach((sa, si) => {
          if (sa.some(a => a.name === artist.name)) {
            const stageHexes = getStageHexes(pd.stages[si]?.col, pd.stages[si]?.row);
            adjCount = (pd.amenities || []).filter(am => stageHexes.some(h => areAdjacent(am.col, am.row, h.col, h.row))).length;
          }
        });
        if (adjCount > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + adjCount } }));
          addLog("Effect", `${artist.name}: +${adjCount} tickets (amenities near stage)`);
          showFloatingBonus(`+${adjCount} 🎟️`, "#fbbf24");
        }
      }
      // === Event effects ===
      if (el.includes("+1 negative personal event")) {
        const negEvents = ALL_EVENTS.filter(e => e.color === "red");
        const drawn = negEvents[Math.floor(Math.random() * negEvents.length)];
        if (drawn) { setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] })); }
        addLog("Effect", `${artist.name}: +1 🔴 Negative Personal Event`);
      }
      if (el.includes("+1 negative global event")) {
        const negEvents = ALL_EVENTS.filter(e => e.color === "red");
        const drawn = negEvents[Math.floor(Math.random() * negEvents.length)];
        if (drawn) { setGlobalEvents(prev => [...prev, { event: drawn, revealed: false }]); }
        addLog("Effect", `${artist.name}: +1 🔴 Negative Global Event added`);
      }
      if (el.includes("+1 global event") && !el.includes("negative")) {
        const allEvt = ALL_EVENTS;
        const drawn = allEvt[Math.floor(Math.random() * allEvt.length)];
        if (drawn) { setGlobalEvents(prev => [...prev, { event: drawn, revealed: false }]); }
        addLog("Effect", `${artist.name}: +1 Global Event (${drawn?.color === "green" ? "🟢" : "🔴"})`);
      }
      if (el.includes("+1 event") && !el.includes("personal") && !el.includes("negative") && !el.includes("global")) {
        const posEvents = ALL_EVENTS.filter(e => e.color === "green");
        const drawn = posEvents[Math.floor(Math.random() * posEvents.length)];
        if (drawn) { setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] })); }
        addLog("Effect", `${artist.name}: +1 Event drawn`);
      }
      // === All players draw ===
      if (el.includes("all players draw 1 artist")) {
        players.forEach(p => {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), ...drawn] } }));
            addLog("Effect", `${artist.name}: ${players.find(pl => pl.id === p.id)?.festivalName} drew ${drawn[0].name}`);
          }
        });
        showFloatingBonus("🃏 All draw!", "#c4b5fd");
      }
    }
    // Interactive effects — scale by times instead of looping (setPendingEffect can only hold one)
    if (el.includes("+1 security") && el.includes("place")) {
      setPendingEffect({ type: "placeSpecific", amenityType: "security", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Security — place on your board!`);
    } else if (el.includes("+1 security")) {
      setPendingEffect({ type: "placeSpecific", amenityType: "security", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Security — place on your board!`);
    }
    if (el.includes("+1 amenity")) {
      setPendingEffect({ type: "placeAmenity", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Amenity — choose and place!`);
    }
    if (el.includes("sign 1 artist") || el.includes("sign one artist")) {
      // Headliner: sign `times` artists (draw times cards from pool/deck)
      setPendingEffect({ type: "signArtist", artistName: artist.name, canRefresh: el.includes("refresh"), signCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Sign ${times} artist${times > 1 ? "s" : ""} from pool or deck!`);
    }
    if (el.includes("draw two artists")) {
      // Headliner: draw 2*times, pick times to keep
      const drawCount = 2 * times;
      const drawn = drawFromDeck(drawCount);
      if (drawn.length > 0) {
        setPendingEffect({ type: "pickFromDrawn", drawn, artistName: artist.name, keepCount: times });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Drew ${drawn.length} artists — pick ${times} to keep!`);
      }
    }
    if (el.includes("immediately book another")) {
      setPendingEffect({ type: "signArtist", artistName: artist.name, canRefresh: false, signCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Immediately book ${times > 1 ? times + " artists" : "another artist"}!`);
    }
    if (el.includes("year end")) {
      addLog("Effect", `${artist.name}: ${eff} (triggers at year end)`);
    }
    // Dice roll effects — "Roll X dice" patterns
    const rollMatch = el.match(/roll (\d+) dice/);
    if (rollMatch) {
      const rollCount = parseInt(rollMatch[1]);
      if (el.includes("each fame") && el.includes("ticket")) {
        triggerDiceRoll(rollCount, pid, artist.name,
          (results) => { const fameCount = results.filter(d => d === "fame").length; return `🔥 ${fameCount} Fame dice = +${fameCount} tickets`; },
          (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fameCount } })); showFloatingBonus(`+${fameCount} 🎟️`, "#fbbf24"); } recalcTickets(); }
        );
      } else if (el.includes("most common") || el.includes("best streak")) {
        triggerDiceRoll(rollCount, pid, artist.name,
          (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); return `Best streak: ${best} = +${best} VP`; },
          (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); if (best > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + best } })); showFloatingBonus(`+${best} ⭐`, "#c4b5fd"); sfx.gainVP(); } recalcTickets(); }
        );
      } else if (el.includes("unique") && el.includes("ticket")) {
        triggerDiceRoll(rollCount, pid, artist.name,
          (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} tickets`; },
          (results) => { const unique = new Set(results).size; if (unique > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + unique } })); showFloatingBonus(`+${unique} 🎟️`, "#fbbf24"); } recalcTickets(); }
        );
      } else if (el.includes("unique") && el.includes("vp")) {
        triggerDiceRoll(rollCount, pid, artist.name,
          (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} VP`; },
          (results) => { const unique = new Set(results).size; if (unique > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + unique } })); showFloatingBonus(`+${unique} ⭐`, "#c4b5fd"); sfx.gainVP(); } recalcTickets(); }
        );
      } else {
        // Generic roll — just show results
        triggerDiceRoll(rollCount, pid, artist.name,
          (results) => `Rolled: ${results.map(d => d === "fame" ? "🔥" : AMENITY_ICONS[d] || d).join(" ")}`,
          () => { recalcTickets(); }
        );
      }
    }
    recalcTickets();
  }

  // ─── Book artist to stage ───
  function bookArtistToStage(artist, stageIdx, pid) {
    setPlayerData(prev => {
      const pd = { ...prev[pid] };
      const sa = [...(pd.stageArtists || pd.stages.map(() => []))];
      sa[stageIdx] = [...(sa[stageIdx] || []), artist];
      const isFullLineup = sa[stageIdx].length === 3;
      pd.stageArtists = sa;
      // Artist VP is NOT awarded on booking — tallied at year end
      if (isFullLineup && !firstFullLineup) {
        pd.bonusTickets = (pd.bonusTickets || 0) + 5;
        setFirstFullLineup(true);
        addLog("🎪 FIRST!", `${players.find(p => p.id === pid)?.festivalName} released the first full lineup! +5 tickets!`);
        showFloatingBonus("+5 🎟️ First Lineup!", "#4ade80");
      }
      // Full lineup bonus: draw 1 personal event (not doubled by headliner)
      if (isFullLineup) {
        const allEvts = [...ALL_EVENTS];
        const drawn = allEvts[Math.floor(Math.random() * allEvts.length)];
        if (drawn) {
          setPlayerPersonalEvents(prev => ({ ...prev, [pid]: [...(prev[pid] || []), drawn] }));
          addLog("🎤 Full Lineup", `${players.find(p => p.id === pid)?.festivalName} completed a lineup → drew 1 personal event (${drawn.color === "green" ? "🟢" : "🔴"})`);
        }
      }
      return { ...prev, [pid]: pd };
    });

    const pd = playerData[pid];
    const sa = pd.stageArtists || pd.stages.map(() => []);
    const slotCount = (sa[stageIdx] || []).length + 1;
    const isHeadliner = slotCount === 3;
    const sName = (pd.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    const festival = players.find(p => p.id === pid)?.festivalName;

    // Show the booking popup (headliner popup takes priority if headliner)
    if (isHeadliner) {
      setShowHeadliner({ artist, festival });
      addLog("🌟 HEADLINER", `${artist.name} headlines at ${festival}!`);
      sfx.headliner();
      applyEffect(artist, pid, 1);
    } else {
      setShowBookedArtist({ artist, stageName: sName, isHeadliner: false, festival });
      sfx.bookArtist();
      applyEffect(artist, pid, 1);
    }

    // Floating bonuses for VP and tickets
    // VP tallied at year end — show ticket bonus only
    if (artist.tickets > 0) { showFloatingBonus(`+${artist.tickets} 🎟️`, "#fbbf24"); sfx.gainTickets(); }

    addLog(festival, `booked ${artist.name} to ${sName}${isHeadliner ? " as HEADLINER!" : ""}`);

    // Check microtrends — first player to book matching genre claims it
    setMicrotrends(prev => prev.map(mt => {
      if (mt.claimedBy !== null) return mt;
      if (getGenres(artist.genre).includes(mt.genre)) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("🎵 Microtrend", `${festival} claimed "${mt.genre}" microtrend → +1 🔥 Fame!`);
        showFloatingBonus(`🎵 ${mt.genre} Microtrend!`, GENRE_COLORS[mt.genre] || "#fbbf24");
        return { ...mt, claimedBy: pid };
      }
      return mt;
    }));

    recalcTickets();
  }

  // ─── Evaluate objectives for a player ───
  /** Count how many full lineups match a genre objective */
  function countGenreLineups(obj, pd) {
    if (!obj || !obj.genre) return { count: 0, genre: null };
    const sa = pd.stageArtists || [];
    let count = 0;
    sa.forEach(s => { if (s.length === 3 && s.every(a => getGenres(a.genre).includes(obj.genre))) count++; });
    return { count, genre: obj.genre };
  }

  /** Apply objective rewards at the start of a round */
  function applyObjectiveRewards() {
    players.forEach(p => {
      const obj = playerObjectives[p.id];
      if (!obj) return;
      const pd = playerData[p.id];
      const { count, genre } = countGenreLineups(obj, pd);
      if (count === 0) return;
      if (count >= 2) {
        setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], baseFame: Math.min(FAME_MAX, (prev[p.id].baseFame || 0) + 1) } }));
        addLog(p.festivalName, `🎯 ${obj.name}: 2+ ${genre} lineups → +1 Fame!`);
      }
      switch (genre) {
        case "Pop": {
          const popInPool = artistPool.filter(a => getGenres(a.genre).includes("Pop"));
          if (popInPool.length > 0) {
            const pick = popInPool[Math.floor(Math.random() * popInPool.length)];
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), pick] } }));
            setArtistPool(prev => prev.filter(a => a !== pick));
            addLog(p.festivalName, `🎯 ${obj.name}: Drew ${pick.name} from pool!`);
          }
          break;
        }
        case "Rock": {
          const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 3);
          const fameCount = results.filter(d => d === "fame").length;
          if (fameCount > 0) setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: (prev[p.id].bonusTickets || 0) + fameCount } }));
          addLog(p.festivalName, `🎯 ${obj.name}: Rolled 3 dice → ${fameCount} Fame → +${fameCount} tickets`);
          break;
        }
        case "Electronic": {
          const pos = aiFindPlacement(pd);
          if (pos) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], amenities: [...prev[p.id].amenities, { col: pos.col, row: pos.row, type: "campsite" }] } }));
            addLog(p.festivalName, `🎯 ${obj.name}: Placed free ⛺ campsite!`);
          }
          break;
        }
        case "Hip Hop": {
          setPlayerPersonalEvents(prev => {
            const evts = [...(prev[p.id] || [])];
            const negIdx = evts.findIndex(e => e.color === "red");
            if (negIdx >= 0) { evts.splice(negIdx, 1); addLog(p.festivalName, `🎯 ${obj.name}: Discarded 1 negative event!`); }
            else { addLog(p.festivalName, `🎯 ${obj.name}: No negative events to discard`); }
            return { ...prev, [p.id]: evts };
          });
          break;
        }
        case "Indie": {
          players.forEach(op => {
            if (op.id !== p.id) setPlayerData(prev => ({ ...prev, [op.id]: { ...prev[op.id], bonusTickets: (prev[op.id].bonusTickets || 0) + 1 } }));
          });
          addLog(p.festivalName, `🎯 ${obj.name}: Every other player gains +1 ticket!`);
          break;
        }
        case "Funk": {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), ...drawn] } }));
            addLog(p.festivalName, `🎯 ${obj.name}: Drew ${drawn[0].name} from deck!`);
          }
          break;
        }
      }
    });
    recalcTickets();
  }

  // ═══════════════════════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════════════════════
  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    const np = []; for (let i = 0; i < count; i++) np.push(players[i] || { id: i, name: `Player ${i + 1}`, festivalName: "", isAI: false });
    setPlayers(np.map((p, i) => ({ ...p, id: i })));
  };
  const randomizeName = (idx) => { const n = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]; setPlayers(p => p.map((pp, i) => i === idx ? { ...pp, festivalName: n } : pp)); };
  const canStartSetup = players.every(p => p.festivalName.trim().length > 0);

  const startSetup = () => {
    const data = {}; players.forEach(p => { data[p.id] = { stages: [], amenities: [], fame: 0, baseFame: 0, vpPerSecurity: 0, vp: 0, tickets: 0, rawTickets: 0, setupAmenity: null, hand: [], stageArtists: [], bonusTickets: 0, stageNames: [], stageColors: [] }; });
    setPlayerData(data); setSetupIndex(0); setSetupSelectedAmenity(null);
    // Assign council objectives (1 per player, unique)
    const cDeck = shuffle([...ALL_COUNCIL_OBJECTIVES]);
    const pCouncils = {};
    players.forEach(p => {
      const co = cDeck.pop();
      pCouncils[p.id] = co ? [{ obj: co, active: false, fameGranted: false }] : [];
    });
    setPlayerCouncils(pCouncils); setCouncilDeck(cDeck);
    // Separate 0-fame and 5-fame artists for drafting
    const all = shuffle([...ALL_ARTISTS]);
    const fame0 = shuffle(all.filter(a => a.fame === 0));
    const fame5 = shuffle(all.filter(a => a.fame === 5));
    setDraftRemaining0(fame0); setDraftRemaining5(fame5); setUndraftedArtists([]);
    setArtistDeck([]); setArtistPool([]); setDiscardPile([]); setFirstFullLineup(false);
    // Assign unique objectives to each player
    const objDeck = shuffle([...ALL_OBJECTIVES]);
    const assigned = {}; const usedNames = new Set();
    players.forEach(p => {
      const pick = objDeck.find(o => !usedNames.has(o.name));
      if (pick) { assigned[p.id] = pick; usedNames.add(pick.name); objDeck.splice(objDeck.indexOf(pick), 1); }
      else { assigned[p.id] = objDeck.pop(); } // fallback if more players than unique objectives
    });
    setPlayerObjectives(assigned);
    setObjectiveDeck(objDeck); setTrendingObjective(null);

    // Initialize Goals — draw 2 random goals, set aside 2 artists per goal
    const goalPool = shuffle([...ALL_GOALS]);
    const selectedGoals = goalPool.slice(0, 2);
    const fame3Artists = shuffle(all.filter(a => a.fame === 3));
    const fame5Artists = shuffle(all.filter(a => a.fame === 5));
    const goals = selectedGoals.map((goal, gi) => {
      if (gi === 0) {
        // First goal: artist prizes
        const f3 = fame3Artists[0];
        const f5 = fame5Artists[0];
        return { goal, rewardType: "artist", setAsideArtists: [f3, f5], req2ClaimedBy: null, req3ClaimedBy: null };
      } else {
        // Second goal: VP prizes (+5 VP req2, +10 VP req3)
        return { goal, rewardType: "vp", setAsideArtists: [], req2ClaimedBy: null, req3ClaimedBy: null };
      }
    });
    setActiveGoals(goals);
    // Remove set-aside artists from the draft pools (only first goal has them)
    const setAsideNames = new Set(goals.flatMap(g => g.setAsideArtists.map(a => a.name)));
    setDraftRemaining0(fame0.filter(a => !setAsideNames.has(a.name)));
    setDraftRemaining5(fame5.filter(a => !setAsideNames.has(a.name)));
    // Init goal progress for all players
    const gp = {};
    players.forEach(p => { gp[p.id] = { portalooRefreshes: 0, fameDieRolls: 0, artistsSigned: 0, councilsBought: 0, eventsBlocked: 0 }; });
    setGoalProgress(gp);
    setGoalReq1Claimed({});
    addLog("🏆 Goals", `${goals.map(g => g.goal.name).join(" & ")} — race begins!`);

    // Start at council reveal
    setSetupStep("viewCouncil");
    setSetupDraftOptions([]); setSetupDraftSelected([]);
    setPhase("setup"); addLogH("Setup Phase", "year");
  };

  // ═══════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════
  const currentSetupPlayer = players[setupIndex];

  const confirmViewCouncil = () => {
    const co = (playerCouncils[currentSetupPlayer.id] || [])[0];
    if (co) addLog(currentSetupPlayer.festivalName, `received council objective: ${co.obj.name}`);
    setSetupStep("viewObjective");
  };

  const confirmViewObjective = () => {
    addLog(currentSetupPlayer.festivalName, `received objective: ${playerObjectives[currentSetupPlayer.id]?.name}`);
    // Prepare this player's draft options
    setSetupDraftOptions([...draftRemaining0.slice(0, 2), ...draftRemaining5.slice(0, 2)]);
    setSetupDraftSelected([]);
    setSetupStep("draftArtist");
  };

  const confirmSetupAmenity = () => {
    setPlayerData(p => ({ ...p, [currentSetupPlayer.id]: { ...p[currentSetupPlayer.id], setupAmenity: setupSelectedAmenity } }));
    addLog(currentSetupPlayer.festivalName, `chose ${AMENITY_LABELS[setupSelectedAmenity]}`);
    setSetupStep("placeStage");
  };

  const toggleDraftSelection = (idx) => {
    setSetupDraftSelected(prev => {
      const arr = prev || [];
      if (arr.includes(idx)) return arr.filter(i => i !== idx);
      if (arr.length >= 2) return arr; // max 2
      return [...arr, idx];
    });
  };

  const confirmSetupDraft = () => {
    const selected = setupDraftSelected || [];
    if (selected.length !== 2) return;
    const chosen = selected.map(i => setupDraftOptions[i]);
    // Add both to player hand
    setPlayerData(p => ({ ...p, [currentSetupPlayer.id]: { ...p[currentSetupPlayer.id], hand: [...p[currentSetupPlayer.id].hand, ...chosen] } }));
    chosen.forEach(c => addLog(currentSetupPlayer.festivalName, `drafted ${c.name} (${c.genre})`));
    // Collect unchosen back
    const unchosen = setupDraftOptions.filter((_, i) => !selected.includes(i));
    setUndraftedArtists(prev => [...prev, ...unchosen]);
    // Advance the draft pools past the 2 we offered from each
    const newR0 = draftRemaining0.slice(2);
    const newR5 = draftRemaining5.slice(2);
    setDraftRemaining0(newR0); setDraftRemaining5(newR5);
    setSetupDraftOptions([]); setSetupDraftSelected([]);
    setSetupStep("pickAmenity");
  };
  const handleSetupHexClick = (col, row) => {
    const pid = currentSetupPlayer.id; const pd = playerData[pid];
    if (setupStep === "placeStage") {
      if (!stageFullyInBounds(col, row) || stageWouldOverlap(col, row, pd.stages)) return;
      const usedNames = pd.stageNames || [];
      const availNames = STAGE_NAMES.filter(n => !usedNames.includes(n));
      const sName = availNames[Math.floor(Math.random() * availNames.length)] || `Stage ${pd.stages.length + 1}`;
      const sColor = STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)];
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], stages: [...p[pid].stages, { col, row }], stageArtists: [...(p[pid].stageArtists || []), []], stageNames: [...(p[pid].stageNames || []), sName], stageColors: [...(p[pid].stageColors || []), sColor] } }));
      setSetupStep("placeAmenity");
    } else if (setupStep === "placeAmenity") {
      const updPD = playerData[pid];
      if (isOnStage(col, row, updPD.stages)) return;
      if (updPD.amenities.some(a => a.col === col && a.row === row)) return;
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], amenities: [...p[pid].amenities, { col, row, type: p[pid].setupAmenity }] } }));
      setSetupStep("confirm");
    }
  };
  const confirmSetupPlacement = () => {
    addLog(currentSetupPlayer.festivalName, `placed stage and ${AMENITY_LABELS[playerData[currentSetupPlayer.id].setupAmenity]}`);
    sfx.placeStage();
    if (setupIndex < players.length - 1) {
      const nextIdx = setupIndex + 1;
      setSetupIndex(nextIdx); setSetupSelectedAmenity(null);
      setSetupDraftOptions([]); setSetupDraftSelected([]);
      setSetupStep("viewCouncil");
    } else startGame();
  };
  const undoSetupPlacement = () => {
    const pid = currentSetupPlayer.id;
    if (setupStep === "confirm") { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], amenities: p[pid].amenities.slice(0, -1) } })); setSetupStep("placeAmenity"); }
    else if (setupStep === "placeAmenity") { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], stages: p[pid].stages.slice(0, -1), stageArtists: (p[pid].stageArtists || []).slice(0, -1), stageNames: (p[pid].stageNames || []).slice(0, -1), stageColors: (p[pid].stageColors || []).slice(0, -1) } })); setSetupStep("placeStage"); }
  };

  // ═══════════════════════════════════════════════════════════
  // GAME START
  // ═══════════════════════════════════════════════════════════
  const startGame = () => {
    // Build the full deck: all artists minus those drafted by players
    const draftedNames = new Set();
    players.forEach(p => { (playerData[p.id]?.hand || []).forEach(a => draftedNames.add(a.name)); });
    const remainingArtists = ALL_ARTISTS.filter(a => !draftedNames.has(a.name));
    // Shuffle undrafted offers back in with the rest
    const fullDeck = shuffle([...remainingArtists]);
    const pool = fullDeck.splice(0, 5);
    setArtistDeck(fullDeck); setArtistPool(pool); setDiscardPile([]);

    const order = players.map(p => p.id); setTurnOrder(order); setCurrentPlayerIdx(0);
    const tl = {}; order.forEach(id => { tl[id] = TURNS_PER_YEAR[1]; }); setTurnsLeft(tl);
    setYear(1); setDice(rollDice()); setPhase("game"); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    // Init events
    const eDeck = shuffle([...ALL_EVENTS]);
    const ge = eDeck.splice(0, 3).map(e => ({ event: e, revealed: false }));
    setEventDeck(eDeck); setGlobalEvents(ge);
    const pe = {}; players.forEach(p => { pe[p.id] = []; }); setPlayerPersonalEvents(pe);
    addLog("🎭 Events", `3 global events drawn: ${ge.map(g => g.event.color === "green" ? "🟢 Positive" : "🔴 Negative").join(", ")}`);
    // Init microtrends
    const mt = generateMicrotrends();
    setMicrotrends(mt);
    addLog("🎵 Microtrends", `Book a ${mt[0].genre} artist • Book a ${mt[1].genre} artist`);
    // Draw trending council objective
    const tcPool = ALL_COUNCIL_OBJECTIVES.filter(c => !Object.values(playerCouncils).flat().some(pc => pc.obj?.id === c.id));
    const tc = tcPool.length > 0 ? tcPool[Math.floor(Math.random() * tcPool.length)] : ALL_COUNCIL_OBJECTIVES[0];
    setTrendingCouncil(tc);
    addLog("📋 Trending Council", `${tc.name} — ${tc.tBenefit}`);
    recalcTickets(); addLogH("Year 1 Begins", "year"); addLogH(`${players[0]?.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

  // recalcTickets called explicitly — no useEffect needed

  // ═══════════════════════════════════════════════════════════
  // AI AUTO-PLAY (ref-based to prevent re-trigger loops)
  // ═══════════════════════════════════════════════════════════
  const aiProcessing = useRef(false);
  const aiTimer = useRef(null);

  const isCurrentPlayerAI = () => {
    if (phase === "setup") return players[setupIndex]?.isAI;
    if (phase === "game") return currentPlayer?.isAI;
    return false;
  };

  // Single AI step function — does ONE thing then returns. Called repeatedly via setTimeout.
  const aiStep = () => {
    if (aiProcessing.current) return;
    if (!isCurrentPlayerAI()) return;
    aiProcessing.current = true;

    const scheduleNext = (ms = 500) => {
      aiProcessing.current = false;
      aiTimer.current = setTimeout(() => aiStep(), ms);
    };

    // ─── Handle pending effects for AI ───
    if (pendingEffect && pendingEffectPid !== null) {
      const pid = pendingEffectPid;
      const pd = playerData[pid] || {};
      const pe = pendingEffect;
      if (pe.type === "placeSpecific" || (pe.type === "placeAmenity" && pe.chosenType)) {
        const pos = aiFindPlacement(pd);
        const aType = pe.amenityType || pe.chosenType;
        setPlayerData(p => {
          const updated = { ...p[pid], amenities: [...p[pid].amenities, { col: pos.col, row: pos.row, type: aType }] };
          if (aType === "security" && p[pid].vpPerSecurity > 0) {
            updated.vp = (updated.vp || 0) + p[pid].vpPerSecurity;
          }
          return { ...p, [pid]: updated };
        });
        addLog("🤖 AI", `Placed bonus ${AMENITY_LABELS[aType]}`);
        const remaining = (pe.placeCount || 1) - 1;
        if (remaining > 0) {
          if (pe.type === "placeAmenity") setPendingEffect({ ...pe, placeCount: remaining, chosenType: null });
          else setPendingEffect({ ...pe, placeCount: remaining });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        recalcTickets();
        scheduleNext(400); return;
      }
      if (pe.type === "placeAmenity" && !pe.chosenType) {
        const choice = aiPickAmenityType(pd);
        setPendingEffect({ ...pe, chosenType: choice });
        scheduleNext(300); return;
      }
      if (pe.type === "signArtist") {
        const remaining = pe.signCount || 1;
        if (artistPool.length > 0) {
          const best = [...artistPool].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
          const idx = artistPool.indexOf(best);
          const np = [...artistPool]; np.splice(idx, 1);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
          addLog("🤖 AI", `Signed ${best.name} from pool`);
          trackGoalProgress(pid, "artistsSigned");
          refillPool(np);
        }
        if (remaining > 1) {
          setPendingEffect({ ...pe, signCount: remaining - 1 });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        scheduleNext(400); return;
      }
      if (pe.type === "pickFromDrawn" && pe.drawn?.length > 0) {
        const best = pe.drawn.sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
        const other = pe.drawn.filter(a => a !== best);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
        setDiscardPile(prev => [...prev, ...other]);
        addLog("🤖 AI", `Kept ${best.name}`);
        trackGoalProgress(pid, "artistsSigned");
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(400); return;
      }
      // Fallback: clear unknown pending effect
      setPendingEffect(null); setPendingEffectPid(null);
      scheduleNext(200); return;
    }

    // ─── SETUP PHASE ───
    if (phase === "setup") {
      const pid = players[setupIndex]?.id;
      if (setupStep === "viewCouncil") { confirmViewCouncil(); scheduleNext(400); return; }
      if (setupStep === "viewObjective") { confirmViewObjective(); scheduleNext(400); return; }
      if (setupStep === "draftArtist" && setupDraftOptions.length >= 2) {
        const picks = aiDraftSelect(setupDraftOptions);
        setSetupDraftSelected(picks);
        // Need to call confirmSetupDraft after state updates
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupDraft(); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "pickAmenity") {
        setSetupSelectedAmenity(aiPickSetupAmenity());
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupAmenity(); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "placeStage") {
        const pd = playerData[pid] || {};
        const pos = aiFindStagePlacement(pd);
        handleSetupHexClick(pos.col, pos.row);
        scheduleNext(400); return;
      }
      if (setupStep === "placeAmenity") {
        const pd = playerData[pid] || {};
        const pos = aiFindPlacement(pd);
        handleSetupHexClick(pos.col, pos.row);
        scheduleNext(400); return;
      }
      if (setupStep === "confirm") { confirmSetupPlacement(); scheduleNext(600); return; }
      aiProcessing.current = false; return;
    }

    // ─── GAME PHASE ───
    if (phase === "game") {
      if (showYearAnnouncement) { setShowYearAnnouncement(false); setShowTurnStart(true); scheduleNext(500); return; }
      if (pendingDiceRoll) {
        const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingDiceRoll.count);
        if (pendingDiceRoll.callback) pendingDiceRoll.callback(results);
        setPendingDiceRoll(null);
        scheduleNext(500); return;
      }
      if (showTurnStart) { setShowTurnStart(false); scheduleNext(500); return; }
      if (showHeadliner) { setShowHeadliner(null); scheduleNext(300); return; }
      if (showBookedArtist) { setShowBookedArtist(null); scheduleNext(300); return; }
      if (showCouncilFame) { setShowCouncilFame(null); scheduleNext(300); return; }

      if (noTurnsLeft || actionTaken) { endTurn(); aiProcessing.current = false; return; }

      // Decide and execute ONE action
      const pd = playerData[currentPlayerId] || {};
      const decision = aiDecideTurn(pd, artistPool, dice, year);
      addLog("🤖 AI", `${currentPlayer?.festivalName} decides: ${decision.action}`);

      if (decision.action === "book") {
        const { source, artistIdx, stageIdx } = decision;
        let artist = null;
        if (source === "pool" && artistIdx < artistPool.length) {
          artist = artistPool[artistIdx];
          const newPool = [...artistPool]; newPool.splice(artistIdx, 1); setArtistPool(newPool);
          // Check if artist has sign/draw effect — defer refresh
          const hasSignEffect = (artist.effect || "").toLowerCase().match(/sign.*artist|draw.*artist/);
          if (hasSignEffect) { setDeferPoolRefresh(true); setPoolRefreshedByEffect(false); }
          else setTimeout(() => refreshPool(), 100);
        } else if (source === "hand" && artistIdx < (pd.hand || []).length) {
          artist = pd.hand[artistIdx];
          setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(artistIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
        }
        if (artist) {
          bookArtistToStage(artist, stageIdx, currentPlayerId);
          setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
          setActionTaken(true);
          addLog("🤖 AI", `Booked ${artist.name}`);
        } else {
          addLog("🤖 AI", "Booking failed — fallback to amenity");
          // Fallback amenity
          const cd2 = dice.length > 0 ? dice : rollDice();
          if (cd2.length > 0) {
            const pk = aiPickDie(cd2, pd, null);
            const nd2 = [...cd2]; nd2.splice(pk.idx, 1); setDice(nd2);
            if (pk.type === "fame") {
              setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
            } else {
              const pos2 = aiFindPlacement(pd);
              setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: [...p[currentPlayerId].amenities, { col: pos2.col, row: pos2.row, type: pk.type }] } }));
            }
            setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setActionTaken(true); recalcTickets();
          }
        }
        scheduleNext(800); return;
      }
      if (decision.action === "reserve") {
        handleReserveFromPool(decision.poolIdx);
        // actionTaken is now true, next step will endTurn
        scheduleNext(500); return;
      }
      // Default: pick amenity directly (skip the multi-step UI)
      const currentDice = dice.length > 0 ? dice : rollDice();
      if (currentDice.length === 0) { endTurn(); aiProcessing.current = false; return; }
      const pick = aiPickDie(currentDice, pd, decision.preferredType);
      const dieVal = currentDice[pick.idx];

      if (dieVal === "fame" || pick.type === "fame") {
        // Fame die
        const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
        setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
        addLog("🤖 AI", `Rolled 🔥 Fame!`);
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); recalcTickets();
        scheduleNext(500); return;
      }

      // Resolve die to amenity type — use the AI's preferred type for OR dice
      let amenityType = pick.type || dieVal;
      if (dieVal === "catering_or_portaloo") amenityType = pick.type || "catering";
      else if (dieVal === "security_or_campsite") amenityType = pick.type || "security";

      // Remove die, place amenity directly
      const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
      const pos = aiFindPlacement(pd);
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: [...p[currentPlayerId].amenities, { col: pos.col, row: pos.row, type: amenityType }] } }));
      addLog("🤖 AI", `Placed ${AMENITY_LABELS[amenityType]}`);
      checkSecurityVPBonus(currentPlayerId, amenityType);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
      setActionTaken(true); recalcTickets();
      scheduleNext(500); return;
    }

    aiProcessing.current = false;
  };

  // Trigger AI when it's an AI player's turn
  useEffect(() => {
    if (!isCurrentPlayerAI()) { aiProcessing.current = false; return; }
    // Safety: reset processing flag if somehow stuck
    const safetyTimer = setTimeout(() => { aiProcessing.current = false; }, 5000);
    if (aiProcessing.current) return;
    aiTimer.current = setTimeout(() => aiStep(), 700);
    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); clearTimeout(safetyTimer); };
  }, [phase, setupStep, setupIndex, currentPlayerIdx, showTurnStart, actionTaken, noTurnsLeft, pendingEffect, pendingDiceRoll, showHeadliner, showBookedArtist, showCouncilFame, showYearAnnouncement]);

  // ═══════════════════════════════════════════════════════════
  // TURN ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handlePickAmenity = () => { setTurnAction("pickAmenity"); if (dice.length === 0) setDice(rollDice()); };
  const handleDiePick = (idx, dv) => {
    takeUndoSnapshot();
    if (dv === "fame") {
      // Fame die: gain +1 Fame this round, use turn, no placement
      const nd = [...dice]; nd.splice(idx, 1); setDice(nd);
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
      addLog(currentPlayer.festivalName, `rolled 🔥 Fame! +1 Fame this year`);
      trackGoalProgress(currentPlayerId, "fameDieRolls");
      showFloatingBonus("+1 🔥 Fame!", "#f97316");
      sfx.gainFame();
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); recalcTickets();
      return;
    }
    if (dv === "catering_or_portaloo" || dv === "security_or_campsite") { setSelectedDie(idx); setChoiceAmenity(dv); }
    else { const nd = [...dice]; nd.splice(idx, 1); setDice(nd); setPlacingAmenity(dv); setSelectedDie(null); setChoiceAmenity(null); }
  };
  const handleChoiceSelect = (type) => { const nd = [...dice]; nd.splice(selectedDie, 1); setDice(nd); setPlacingAmenity(type); setSelectedDie(null); setChoiceAmenity(null); };
  const handleRerollDice = () => { setDice(rollDice()); addLog("Dice", "Rerolled all amenity dice"); };
  const handleMoveAmenity = () => { takeUndoSnapshot(); setTurnAction("moveAmenity"); setMovingFrom(null); };
  const handleArtistAction = () => { takeUndoSnapshot(); setTurnAction("artist"); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null); };

  const handleGameHexClick = (col, row) => {
    if (actionTaken) return;
    if (turnAction === "pickAmenity" && placingAmenity) {
      if (isOnStage(col, row, currentPD.stages) || currentPD.amenities.some(a => a.col === col && a.row === row)) return;
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: [...p[currentPlayerId].amenities, { col, row, type: placingAmenity }] } }));
      addLog(currentPlayer.festivalName, `placed ${AMENITY_LABELS[placingAmenity]} at (${col},${row})`);
      checkSecurityVPBonus(currentPlayerId, placingAmenity);
      sfx.placeAmenity();
      setPlacingAmenity(null); setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); recalcTickets();
    } else if (turnAction === "moveAmenity") {
      if (!movingFrom) { const am = currentPD.amenities.find(a => a.col === col && a.row === row); if (am) setMovingFrom({ col, row, type: am.type }); }
      else {
        if (isOnStage(col, row, currentPD.stages) || currentPD.amenities.some(a => a.col === col && a.row === row && !(a.col === movingFrom.col && a.row === movingFrom.row))) return;
        setPlayerData(p => { const na = p[currentPlayerId].amenities.filter(a => !(a.col === movingFrom.col && a.row === movingFrom.row)); na.push({ col, row, type: movingFrom.type }); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: na } }; });
        addLog(currentPlayer.festivalName, `moved ${AMENITY_LABELS[movingFrom.type]} to (${col},${row})`);
        setMovingFrom(null); setMovedThisTurn(true); setTurnAction(null); recalcTickets();
      }
    }
  };

  /** Take a full undo snapshot of all mutable game state */
  const takeUndoSnapshot = () => {
    setUndoSnapshot({
      playerData: JSON.parse(JSON.stringify(playerData)),
      dice: [...dice],
      turnsLeft: { ...turnsLeft },
      artistPool: [...artistPool],
      artistDeck: [...artistDeck],
      discardPile: [...discardPile],
      microtrends: JSON.parse(JSON.stringify(microtrends)),
      goalProgress: JSON.parse(JSON.stringify(goalProgress)),
      goalReq1Claimed: JSON.parse(JSON.stringify(goalReq1Claimed)),
      activeGoals: JSON.parse(JSON.stringify(activeGoals)),
    });
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setPlayerData(undoSnapshot.playerData);
    setDice(undoSnapshot.dice);
    setTurnsLeft(undoSnapshot.turnsLeft);
    setArtistPool(undoSnapshot.artistPool);
    setArtistDeck(undoSnapshot.artistDeck);
    setDiscardPile(undoSnapshot.discardPile);
    setMicrotrends(undoSnapshot.microtrends);
    if (undoSnapshot.goalProgress) setGoalProgress(undoSnapshot.goalProgress);
    if (undoSnapshot.goalReq1Claimed) setGoalReq1Claimed(undoSnapshot.goalReq1Claimed);
    if (undoSnapshot.activeGoals) setActiveGoals(undoSnapshot.activeGoals);
    setActionTaken(false);
    setTurnAction(null);
    setPlacingAmenity(null);
    setMovingFrom(null);
    setMovedThisTurn(false);
    setSelectedArtist(null);
    setArtistAction(null);
    setPendingEffect(null);
    setPendingEffectPid(null);
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName, "↩️ Undid last action");
    recalcTickets();
  };

  // ─── Artist booking/reserving ───
  const handleBookFromPool = (idx) => {
    const artist = artistPool[idx];
    if (!canAffordArtist(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "pool", poolIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromHand = (idx) => {
    const artist = currentPD.hand[idx];
    if (!canAffordArtistOrFree(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "hand", handIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromDiscard = () => {
    if (discardPile.length === 0) return;
    const artist = discardPile[discardPile.length - 1]; // top of discard
    if (!canAffordArtist(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "discard", discardIdx: discardPile.length - 1 }); setArtistAction("pickStage");
  };
  const handleReserveFromPool = (idx) => {
    const artist = artistPool[idx];
    const newPool = [...artistPool]; newPool.splice(idx, 1);
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, artist] } }));
    addLog(currentPlayer.festivalName, `reserved ${artist.name} from pool`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    // Refill empty slot immediately with the already-spliced pool
    refillPool(newPool);
  };
  const handleReserveFromDeck = () => {
    // Draw a card but don't add to hand yet — let the player flip it
    const drawn = drawFromDeck(1);
    if (drawn.length === 0) { addLog("Deck", "No artists left to draw!"); return; }
    setDeckDrawnCard(drawn[0]);
    setDeckCardRevealed(false);
    setArtistAction("deckReveal");
  };
  const handleRevealDeckCard = () => { setDeckCardRevealed(true); };
  const handleConfirmDeckReserve = () => {
    if (!deckDrawnCard) return;
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, deckDrawnCard] } }));
    addLog(currentPlayer.festivalName, `reserved ${deckDrawnCard.name} from deck`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    setDeckDrawnCard(null); setDeckCardRevealed(false);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
  };
  const handleStageSelect = (stageIdx) => {
    if (!selectedArtist) return;
    const { artist, source, poolIdx, handIdx, discardIdx } = selectedArtist;
    // Remove from source
    if (source === "pool") {
      const newPool = [...artistPool]; newPool.splice(poolIdx, 1); setArtistPool(newPool);
      // Check if artist has a sign/draw effect that lets them interact with pool
      const hasSignEffect = (artist.effect || "").toLowerCase().match(/sign.*artist|draw.*artist/);
      if (hasSignEffect) {
        // Defer refresh — just remove the card, leave pool as-is until effect resolves or turn ends
        setDeferPoolRefresh(true);
        setPoolRefreshedByEffect(false);
      } else {
        // Normal: full refresh since booked from pool
        setTimeout(() => refreshPool(), 100);
      }
    } else if (source === "hand") {
      setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(handIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
    } else if (source === "discard") {
      // Remove from top of discard pile and grant +1 Fame
      const newDiscard = [...discardPile]; newDiscard.splice(discardIdx, 1); setDiscardPile(newDiscard);
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
      addLog(currentPlayer.festivalName, `booked ${artist.name} from discard pile → +1 🔥 Fame!`);
    }
    bookArtistToStage(artist, stageIdx, currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null);
  };

  // ═══════════════════════════════════════════════════════════
  // END TURN / ROUND END
  // ═══════════════════════════════════════════════════════════
  const endTurn = () => {
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName || "?", "ended their turn");
    setTurnAction(null); setPlacingAmenity(null); setMovingFrom(null); setMovedThisTurn(false); setSelectedDie(null); setChoiceAmenity(null); setActionTaken(false); setArtistAction(null); setSelectedArtist(null); setShowHand(false); setDeckDrawnCard(null); setDeckCardRevealed(false); setViewingPlayerId(null);
    setPendingEffect(null); setPendingEffectPid(null);

    // If pool refresh was deferred (artist had sign/draw effect from pool booking), do it now
    if (deferPoolRefresh) {
      refreshPool();
      setDeferPoolRefresh(false);
      setPoolRefreshedByEffect(false);
    }

    // Evaluate council objectives for current player before moving on
    evaluateCouncils(currentPlayerId);

    const findNext = () => {
      for (let i = currentPlayerIdx + 1; i < turnOrder.length; i++) if (turnsLeft[turnOrder[i]] > 0) return i;
      for (let i = 0; i < turnOrder.length; i++) if (turnsLeft[turnOrder[i]] > 0) return i;
      return -1;
    };
    const ni = findNext();
    if (ni < 0) { beginSpecialGuestPhase(); return; }

    setCurrentPlayerIdx(ni);
    const np = players.find(p => p.id === turnOrder[ni]);
    addLogH(`${np?.festivalName || "?"}'s Turn`, "turn");
    setShowTurnStart(true);
  };

  /** Evaluate all council objectives for a player, update active states, grant first-time fame */
  function evaluateCouncils(pid) {
    recalcTickets(); // councils are always active, just recalc benefits
  }

  /** Start the events phase — resolve events for each player */
  /** Start the Special Guest phase — check each player for eligible stages */
  const beginSpecialGuestPhase = () => {
    addLogH(`Year ${year} — Special Guests`, "round");
    setSpecialGuestPlayer(0);
    setSpecialGuestCard(null);
    setSpecialGuestEligible([]);
    setPhase("specialGuest");
  };

  /** Check if a player qualifies for a special guest and set up their turn */
  function setupSpecialGuestForPlayer(pIdx) {
    const p = players[pIdx];
    if (!p) { beginEventPhase(); return; }
    const pd = playerData[p.id] || {};
    const sa = pd.stageArtists || [];
    // Find stages with exactly 2 artists (2/3 full)
    const eligible = [];
    sa.forEach((s, i) => { if (s.length === 2) eligible.push(i); });
    if (eligible.length === 0) {
      addLog("🌟 Special Guest", `${p.festivalName} has no qualifying stages.`);
      // Move to next player
      if (pIdx < players.length - 1) {
        setSpecialGuestPlayer(pIdx + 1);
        setTimeout(() => setupSpecialGuestForPlayer(pIdx + 1), 100);
      } else {
        beginEventPhase();
      }
      return;
    }
    // Draw from deck
    const drawn = drawFromDeck(1);
    if (drawn.length === 0) {
      addLog("🌟 Special Guest", `Deck empty — no special guest available.`);
      if (pIdx < players.length - 1) { setSpecialGuestPlayer(pIdx + 1); setTimeout(() => setupSpecialGuestForPlayer(pIdx + 1), 100); }
      else beginEventPhase();
      return;
    }
    setSpecialGuestCard(drawn[0]);
    setSpecialGuestEligible(eligible);
    setSpecialGuestPlayer(pIdx);
  }

  /** Check if player can afford the special guest (ignoring fame requirement) */
  function canAffordSpecialGuest(artist, pd) {
    const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
    (pd.amenities || []).forEach(a => counts[a.type]++);
    return counts.campsite >= (artist.campCost || 0) &&
      counts.security >= (artist.securityCost || 0) &&
      counts.catering >= (artist.cateringCost || 0) &&
      counts.portaloo >= (artist.portalooCost || 0);
  }

  /** Place special guest on a stage — no headliner effect, just tickets */
  function placeSpecialGuest(stageIdx) {
    const p = players[specialGuestPlayer];
    const artist = specialGuestCard;
    if (!p || !artist) return;
    // Add artist to stage as 3rd slot (headliner position) but without double effect
    setPlayerData(prev => {
      const pd = { ...prev[p.id] };
      const sa = [...(pd.stageArtists || [])];
      sa[stageIdx] = [...(sa[stageIdx] || []), artist];
      pd.stageArtists = sa;
      return { ...prev, [p.id]: pd };
    });
    const sName = (playerData[p.id]?.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    addLog("🌟 Special Guest", `${artist.name} appears as special guest at ${p.festivalName}'s ${sName}! +${artist.tickets} 🎟️`);
    showFloatingBonus(`🌟 ${artist.name}!`, "#fbbf24");
    showFloatingBonus(`+${artist.tickets} 🎟️`, "#4ade80");
    setSpecialGuestCard(null);
    recalcTickets();
    // Advance to next player
    if (specialGuestPlayer < players.length - 1) {
      const next = specialGuestPlayer + 1;
      setSpecialGuestPlayer(next);
      setTimeout(() => setupSpecialGuestForPlayer(next), 600);
    } else {
      setTimeout(() => beginEventPhase(), 600);
    }
  }

  function declineSpecialGuest() {
    const p = players[specialGuestPlayer];
    const artist = specialGuestCard;
    if (artist) {
      setDiscardPile(prev => [...prev, artist]);
      addLog("🌟 Special Guest", `${p?.festivalName} declined ${artist.name}.`);
    }
    setSpecialGuestCard(null);
    if (specialGuestPlayer < players.length - 1) {
      const next = specialGuestPlayer + 1;
      setSpecialGuestPlayer(next);
      setTimeout(() => setupSpecialGuestForPlayer(next), 300);
    } else {
      setTimeout(() => beginEventPhase(), 300);
    }
  }

  const beginEventPhase = () => {
    addLogH(`Year ${year} — Events Phase`, "round");
    // Gather events for all players WITHOUT security blocking (players choose during their step)
    const results = {};
    players.forEach(p => {
      const pd = playerData[p.id];
      const allEvts = [
        ...globalEvents.map(g => g.event),
        ...(playerPersonalEvents[p.id] || [])
      ];
      const positive = allEvts.filter(e => e.color === "green" && eventConditionMet(e, pd));
      const negativeAll = allEvts.filter(e => e.color === "red" && eventConditionMet(e, pd));
      const secCount = (pd.amenities || []).filter(a => a.type === "security").length;
      // Don't block yet — player will choose during delegate step
      results[p.id] = { positive, negativeAll, blocked: [], negative: negativeAll, secCount, totalNeg: negativeAll.length };
    });
    setEventPhaseResults(results);
    setEventPhasePlayer(0);
    setEventPhaseStep("delegate");
    setSecurityDelegation(0);
    setPhase("events");
  };

  /** Player confirms security delegation — resolve which events are blocked */
  function confirmSecurityDelegation() {
    const pid = players[eventPhasePlayer]?.id;
    if (pid === undefined || pid === null || !eventPhaseResults) return;
    const res = { ...eventPhaseResults[pid] };
    const delegated = securityDelegation;
    // Remove delegated security from player board
    if (delegated > 0) {
      setPlayerData(p => {
        const ams = [...(p[pid].amenities || [])];
        let removed = 0;
        for (let i = ams.length - 1; i >= 0 && removed < delegated; i--) {
          if (ams[i].type === "security") { ams.splice(i, 1); removed++; }
        }
        return { ...p, [pid]: { ...p[pid], amenities: ams } };
      });
      addLog(players.find(p => p.id === pid)?.festivalName, `Delegated ${delegated} 👮‍♀️ security to block events (removed from board)`);
    }
    // Apply blocking
    res.blocked = res.negativeAll.slice(0, delegated);
    res.negative = res.negativeAll.slice(delegated);
    // Track goal progress for each blocked event
    for (let i = 0; i < delegated && i < res.negativeAll.length; i++) trackGoalProgress(pid, "eventsBlocked");
    // Create entirely new results object to ensure React detects the change
    const newResults = { ...eventPhaseResults, [pid]: { ...res } };
    setEventPhaseResults(newResults);
    setEventPhaseStep("results");
  }

  /** Apply resolved events to a player's data */
  function applyEventsForPlayer(pid) {
    const res = eventPhaseResults?.[pid];
    if (!res) return;
    // Apply positive events
    res.positive.forEach(evt => {
      const fx = evt.apply(playerData[pid]);
      if (fx.vp) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + fx.vp } }));
      if (fx.tickets) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fx.tickets } }));
      addLog(players.find(p=>p.id===pid)?.festivalName, `🟢 ${evt.name}: ${evt.result}`);
    });
    // Apply negative events (unblocked only)
    res.negative.forEach(evt => {
      const fx = evt.apply(playerData[pid]);
      if (fx.fame) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.max(0, (p[pid].baseFame || 0) + fx.fame) } }));
      if (fx.tickets) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fx.tickets } }));
      if (fx.vp) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + fx.vp } }));
      if (fx.removeAmenity) {
        setPlayerData(p => {
          const ams = [...(p[pid].amenities || [])];
          const idx = ams.findIndex(a => a.type === fx.removeAmenity);
          if (idx >= 0) ams.splice(idx, 1);
          return { ...p, [pid]: { ...p[pid], amenities: ams } };
        });
      }
      if (fx.discardHand) {
        setPlayerData(p => {
          const h = [...(p[pid].hand || [])];
          const removed = h.splice(0, fx.discardHand);
          setDiscardPile(prev => [...prev, ...removed]);
          return { ...p, [pid]: { ...p[pid], hand: h } };
        });
      }
      addLog(players.find(p=>p.id===pid)?.festivalName, `🔴 ${evt.name}: ${evt.result}`);
    });
    // Log blocked
    res.blocked.forEach(evt => {
      addLog(players.find(p=>p.id===pid)?.festivalName, `🛡️ Blocked: ${evt.name} (security)`);
    });
  }

  const advanceEventPhase = () => {
    const pid = players[eventPhasePlayer]?.id;
    if (pid !== undefined) applyEventsForPlayer(pid);
    if (eventPhasePlayer < players.length - 1) {
      const next = eventPhasePlayer + 1;
      setEventPhasePlayer(next);
      setEventPhaseStep("delegate");
      setSecurityDelegation(0);
    } else {
      recalcTickets();
      beginRoundEnd();
    }
  };

  const beginRoundEnd = () => {
    try {
      // Evaluate councils one last time for all players
      players.forEach(p => evaluateCouncils(p.id));

      // Apply fame multiplier and snapshot synchronously via functional state update
      setPlayerData(prev => {
        const next = { ...prev };
        const nat = { ...allTickets };
        for (const p of players) {
          let vpBonus = 0; const pd = next[p.id];
          if (!pd) continue;
          // Recalculate tickets inline
          let t = (pd.amenities || []).filter(a => a.type === "campsite").length * 2;
          (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets || 0; }));
          t += pd.bonusTickets || 0;
          (playerCouncils[p.id] || []).forEach(co => { if (co.active) { const b = calcCouncilBenefit(co.obj, pd, false); t += b.tickets; } });
          // Compute fame
          const fame = calcFame(pd, playerCouncils[p.id] || []);
          // Tally artist VP at year end
          let artistVP = 0;
          (pd.stageArtists || []).forEach(sa => sa.forEach(a => { artistVP += a.vp || 0; }));
          vpBonus += artistVP;
          if (artistVP > 0) addLog(p.festivalName, `Artist VP: +${artistVP} ⭐`);
          const rawT = t;
          const fameVP = FAME_VP[Math.min(5, fame)] || 0;
          const ticketVP = Math.floor(rawT / 10);
          vpBonus += fameVP;
          vpBonus += ticketVP;
          // Council VP bonuses
          let councilVP = 0;
          (playerCouncils[p.id] || []).forEach(co => {
            if (co.active) { const b = calcCouncilBenefit(co.obj, pd, false); councilVP += b.vp; }
          });
          vpBonus += councilVP;
          // Year-end artist effects
          (pd.stageArtists || []).forEach((sa, si) => sa.forEach((a, ai) => {
            try {
            const eff = (a.effect || "").toLowerCase();
            if (eff.includes("vp / fame gained")) {
              const fvp = pd.baseFame || 0;
              vpBonus += fvp; addLog(p.festivalName, `${a.name}: Year End → +${fvp} VP (Fame gained)`);
            }
            if (eff.includes("vp if you have the highest fame")) {
              const myFame = fame;
              const isHighest = players.every(op => op.id === p.id || calcFame(next[op.id] || {}, playerCouncils[op.id] || []) <= myFame);
              if (isHighest) {
                vpBonus += 1;
                const mostTickets = players.every(op => op.id === p.id || (next[op.id]?.tickets || 0) <= rawT);
                if (mostTickets) { vpBonus += 3; addLog(p.festivalName, `${a.name}: Year End → +4 VP (highest Fame + most tickets!)`); }
                else { addLog(p.festivalName, `${a.name}: Year End → +1 VP (highest Fame)`); }
              }
            }
            if (eff.includes("vp / negative event avoided")) {
              const evtRes = eventPhaseResults?.[p.id];
              const blocked = evtRes ? evtRes.blocked.length : 0;
              vpBonus += blocked; addLog(p.festivalName, `${a.name}: Year End → +${blocked} VP (events avoided)`);
            }
            if (eff.includes("vp / negative event that hit")) {
              const evtRes = eventPhaseResults?.[p.id];
              const hits = evtRes ? evtRes.negative.length : 0;
              vpBonus += hits; addLog(p.festivalName, `${a.name}: Year End → +${hits} VP (events endured)`);
            }
            if (eff.includes("vp / 3 amenities")) {
              const amCount = (pd.amenities || []).length;
              const bonus = Math.floor(amCount / 3);
              vpBonus += bonus; addLog(p.festivalName, `${a.name}: Year End → +${bonus} VP (${amCount} amenities / 3)`);
            }
            if (eff.includes("vp / council objective")) {
              const activeCouncils = (playerCouncils[p.id] || []).filter(co => evalCouncilObjective(co.obj, pd, false).count > 0).length;
              vpBonus += activeCouncils; addLog(p.festivalName, `${a.name}: Year End → +${activeCouncils} VP (councils with benefit)`);
            }
            if (eff.includes("roll all") && eff.includes("unique amenity")) {
              const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 5);
              const unique = new Set(results).size;
              vpBonus += unique; addLog(p.festivalName, `${a.name}: Year End 🎲 Rolled ${unique} unique → +${unique} VP`);
            }
            if (eff.includes("roll all") && eff.includes("most common")) {
              const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 5);
              const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
              const best = Math.max(...Object.values(counts));
              vpBonus += best; addLog(p.festivalName, `${a.name}: Year End 🎲 Best streak ${best} → +${best} VP`);
            }
            if (eff.includes("1vp per existing campsite") || eff.includes("1 vp per existing campsite")) {
              const camps = (pd.amenities || []).filter(am => am.type === "campsite").length;
              vpBonus += camps; addLog(p.festivalName, `${a.name}: Year End → +${camps} VP (campsites)`);
            }
            } catch(err) { console.error("Year-end effect error for", a?.name, err); }
          }));
          if (!nat[p.id]) nat[p.id] = {};
          nat[p.id][year] = { raw: rawT, fame, fameVP, ticketVP };
          addLog(p.festivalName, `🎟️ ${rawT} tickets → ${ticketVP} VP | 🔥 Fame ${fame} → ${fameVP} VP`);
          next[p.id] = { ...pd, tickets: rawT, rawTickets: rawT, fame, vp: (pd.vp || 0) + vpBonus };
        }
        setAllTickets(nat);
        return next;
      });
      setRevealIndex(0); setLeaderboardRevealed(false); setPhase("roundEnd"); addLogH(`Year ${year} — Year End`, "round");
    } catch(e) { console.error("beginRoundEnd error:", e); setPhase("roundEnd"); }
  };

  const sortedPlayersForReveal = useMemo(() => [...players].sort((a, b) => (playerData[a.id]?.tickets || 0) - (playerData[b.id]?.tickets || 0)), [players, playerData]);
  const revealNext = () => { if (revealIndex < players.length - 1) setRevealIndex(revealIndex + 1); else setLeaderboardRevealed(true); };
  const proceedFromRoundEnd = () => {
    if (year >= 4) { setPhase("gameOver"); addLogH("Game Over!", "round"); return; }
    const f5 = players.filter(p => (playerData[p.id]?.fame || 0) >= FAME_MAX);
    if (f5.length > 0) { setPreRoundIndex(0); setPreRoundStep("notify"); setDisplacedAmenities([]); setDisplacedPlaceIdx(0); setPhase("preRound"); }
    else startNextYear();
  };

  // Pre-round
  const preRoundPlayers = useMemo(() => players.filter(p => (playerData[p.id]?.fame || 0) >= FAME_MAX), [players, playerData]);
  const currentPreRoundPlayer = preRoundPlayers[preRoundIndex];
  const acceptNewStage = () => { setPlacingStage(true); setPreRoundStep("placeStage"); };
  const declineNewStage = () => { addLog(currentPreRoundPlayer?.festivalName || "", "declined new stage"); nextPreRound(); };
  const handlePreRoundHexClick = (col, row) => {
    if (!currentPreRoundPlayer) return; const pid = currentPreRoundPlayer.id; const pd = playerData[pid];
    if (preRoundStep === "placeStage") {
      if (!stageFullyInBounds(col, row) || stageWouldOverlap(col, row, pd.stages)) return;
      const sh = getStageHexes(col, row); const disp = pd.amenities.filter(a => sh.some(h => h.col === a.col && h.row === a.row));
      const rem = pd.amenities.filter(a => !sh.some(h => h.col === a.col && h.row === a.row));
      const usedN = pd.stageNames || [];
      const availN = STAGE_NAMES.filter(n => !usedN.includes(n));
      const sName = availN[Math.floor(Math.random() * availN.length)] || `Stage ${pd.stages.length + 1}`;
      const sColor = STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)];
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], stages: [...p[pid].stages, { col, row }], stageArtists: [...(p[pid].stageArtists || []), []], stageNames: [...(p[pid].stageNames || []), sName], stageColors: [...(p[pid].stageColors || []), sColor], amenities: rem } }));
      if (disp.length > 0) { setDisplacedAmenities(disp); setDisplacedPlaceIdx(0); setPreRoundStep("moveDisplaced"); } else setPreRoundStep("confirm");
      setPlacingStage(false); addLog(currentPreRoundPlayer.festivalName, `placed new stage`);
    } else if (preRoundStep === "moveDisplaced") {
      const updPD = playerData[pid]; if (isOnStage(col, row, updPD.stages) || updPD.amenities.some(a => a.col === col && a.row === row)) return;
      const am = displacedAmenities[displacedPlaceIdx];
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], amenities: [...p[pid].amenities, { col, row, type: am.type }] } }));
      if (displacedPlaceIdx < displacedAmenities.length - 1) setDisplacedPlaceIdx(displacedPlaceIdx + 1); else setPreRoundStep("confirm");
    }
  };
  const confirmPreRound = () => nextPreRound();
  const nextPreRound = () => { if (preRoundIndex < preRoundPlayers.length - 1) { setPreRoundIndex(preRoundIndex + 1); setPreRoundStep("notify"); setDisplacedAmenities([]); setDisplacedPlaceIdx(0); } else startNextYear(); };

  const startNextYear = () => {
    const ny = year + 1; setYear(ny);
    // Apply artist objective rewards from last year's lineups (BEFORE clearing stages)
    applyObjectiveRewards();
    // Clear all stages: move booked artists to discard pile, reset bonus tickets
    let newDiscard = [...discardPile];
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        const allBooked = (pd.stageArtists || []).flat();
        newDiscard = [...newDiscard, ...allBooked];
        const emptyStages = (pd.stages || []).map(() => []);
        next[p.id] = { ...pd, stageArtists: emptyStages, bonusTickets: 0, baseFame: 0, vpPerSecurity: 0 };
      }
      return next;
    });
    setDiscardPile(newDiscard);
    addLog("🔄 New Year", "All stages cleared — artists moved to discard pile");

    // Deal a new council objective to every player at the start of each year
    const cd = [...councilDeck];
    players.forEach(p => {
      if (cd.length > 0) {
        const newObj = cd.pop();
        setPlayerCouncils(prev => ({ ...prev, [p.id]: [...(prev[p.id] || []), { obj: newObj, active: true }] }));
        addLog("📋 Council", `${p.festivalName} receives new council objective: ${newObj.name}`);
      }
    });
    setCouncilDeck(cd);

    const sorted = [...players].sort((a, b) => (allTickets[a.id]?.[year] || 0) - (allTickets[b.id]?.[year] || 0));
    const no = sorted.map(p => p.id); setTurnOrder(no); setCurrentPlayerIdx(0);
    const tl = {}; no.forEach(id => { tl[id] = TURNS_PER_YEAR[ny]; }); setTurnsLeft(tl);
    setDice(rollDice()); setPhase("game"); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    // Draw 3 new global events for this year
    let eDk = [...eventDeck];
    if (eDk.length < 3) eDk = shuffle([...ALL_EVENTS]); // reshuffle if low
    const newGe = eDk.splice(0, 3).map(e => ({ event: e, revealed: false }));
    setEventDeck(eDk); setGlobalEvents(newGe);
    const pe = {}; players.forEach(p => { pe[p.id] = []; }); setPlayerPersonalEvents(pe);
    addLog("🎭 Events", `3 global events drawn: ${newGe.map(g => g.event.color === "green" ? "🟢 Positive" : "🔴 Negative").join(", ")}`);
    // New microtrends
    const mt = generateMicrotrends();
    setMicrotrends(mt);
    addLog("🎵 Microtrends", `Book a ${mt[0].genre} artist • Book a ${mt[1].genre} artist`);
    // Draw new trending council
    const tcPool = ALL_COUNCIL_OBJECTIVES.filter(c => c.id !== trendingCouncil?.id);
    const tc = tcPool[Math.floor(Math.random() * tcPool.length)] || ALL_COUNCIL_OBJECTIVES[0];
    setTrendingCouncil(tc);
    addLog("📋 Trending Council", `${tc.name} — ${tc.tBenefit}`);
    recalcTickets(); addLogH(`Year ${ny} Begins`, "year");
    const fp = players.find(p => p.id === no[0]); if (fp) addLogH(`${fp.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

  const winner = useMemo(() => {
    if (phase !== "gameOver") return null;
    return [...players].sort((a, b) => { const vd = (playerData[b.id]?.vp || 0) - (playerData[a.id]?.vp || 0); if (vd !== 0) return vd; return Object.values(allTickets[b.id] || {}).reduce((s, v) => s + v, 0) - Object.values(allTickets[a.id] || {}).reduce((s, v) => s + v, 0); })[0];
  }, [phase, players, playerData, allTickets]);

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════
  const CS = { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflowX: "hidden", zoom: 1.15 };
  const card = { background: "rgba(15,14,26,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: 24, backdropFilter: "blur(10px)" };
  const bp = { padding: "10px 24px", borderRadius: 10, border: "none", fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", cursor: "pointer", fontSize: 14, transition: "all 0.2s" };
  const bs = { ...bp, background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed" };
  const bd = { ...bp, background: "linear-gradient(135deg, #dc2626, #b91c1c)" };
  const logBtn = <button onClick={() => setShowLog(!showLog)} style={{ position: "fixed", top: 16, right: 16, zIndex: 999, padding: "8px 16px", borderRadius: 10, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>📜 Log</button>;
  const discardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowDiscard(true)} style={{ position: "fixed", top: 16, right: showLog ? 384 : 80, zIndex: 999, padding: "8px 16px", borderRadius: 10, border: "1px solid #6b7280", background: "rgba(107,114,128,0.2)", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🗑️ Discard</button> : null;
  const anim = <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes headlinerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } } @keyframes affordPulse { 0%,100% { box-shadow: 0 0 4px rgba(251,191,36,0.3); } 50% { box-shadow: 0 0 16px rgba(251,191,36,0.7); } } .obj-hover-parent:hover .obj-hover-tip { display: block !important; max-height: 300px !important; padding: 10px !important; margin-top: 8px !important; opacity: 1 !important; } @keyframes floatUp { 0% { opacity:1; transform:translateY(0) scale(1); } 50% { opacity:1; transform:translateY(-30px) scale(1.2); } 100% { opacity:0; transform:translateY(-60px) scale(0.8); } } @keyframes bookReveal { 0% { opacity:0; transform:scale(0.5) rotate(-5deg); } 50% { transform:scale(1.1) rotate(2deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } } @keyframes pulse { 0%,100% { transform:scale(1); box-shadow: 0 0 8px rgba(251,191,36,0.3); } 50% { transform:scale(1.05); box-shadow: 0 0 20px rgba(251,191,36,0.6); } }`}</style>;

  // ═══════════════════════════════════════════════════════════
  // RENDER: LOBBY
  // ═══════════════════════════════════════════════════════════
  if (phase === "lobby") return (
    <div style={CS}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #c4b5fd, #fbbf24, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -2 }}>🎪 HEADLINERS</h1>
        <p style={{ color: "#8b5cf6", fontSize: 16, marginTop: 8, letterSpacing: 4, textTransform: "uppercase" }}>Build the biggest festival</p>
      </div>
      <div style={{ ...card, maxWidth: 520, width: "100%" }}>
        <div style={{ marginBottom: 24 }}><label style={{ color: "#c4b5fd", fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>Number of Players</label>
          <div style={{ display: "flex", gap: 8 }}>{[2, 3, 4, 5].map(n => <button key={n} onClick={() => handlePlayerCountChange(n)} style={{ ...bs, background: playerCount === n ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.15)", flex: 1 }}>{n}</button>)}</div>
        </div>
        {players.map((p, i) => <div key={i} style={{ marginBottom: 16 }}><label style={{ color: "#a78bfa", fontWeight: 600, fontSize: 12, display: "block", marginBottom: 4 }}>Player {i + 1} {p.isAI ? <span style={{ color: "#fbbf24", fontSize: 10 }}>🤖 AI</span> : ""} — Festival Name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={p.festivalName} onChange={e => setPlayers(pr => pr.map((pp, ii) => ii === i ? { ...pp, festivalName: e.target.value } : pp))} placeholder={p.isAI ? "AI festival name..." : "Enter festival name..."} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: p.isAI ? "1px solid #fbbf24" : "1px solid #4c1d95", background: p.isAI ? "#1a1a10" : "#1a1a2e", color: "#e2e8f0", fontSize: 14, outline: "none" }} />
            <button onClick={() => randomizeName(i)} style={{ ...bs, padding: "10px 12px", fontSize: 16 }} title="Randomize">🎲</button>
            <button onClick={() => {
              setPlayers(pr => pr.map((pp, ii) => {
                if (ii !== i) return pp;
                const nowAI = !pp.isAI;
                return { ...pp, isAI: nowAI, festivalName: nowAI && !pp.festivalName ? AI_NAMES[i % AI_NAMES.length] : pp.festivalName };
              }));
            }} style={{ ...bs, padding: "10px 12px", fontSize: 14, background: p.isAI ? "rgba(251,191,36,0.3)" : "rgba(124,58,237,0.15)", border: p.isAI ? "1px solid #fbbf24" : "1px solid #7c3aed", color: p.isAI ? "#fbbf24" : "#c4b5fd" }} title="Toggle AI">🤖</button>
          </div></div>)}
        <button onClick={startSetup} disabled={!canStartSetup} style={{ ...bp, width: "100%", marginTop: 16, padding: "14px 24px", fontSize: 16, opacity: canStartSetup ? 1 : 0.4 }}>Start Setup →</button>
      </div>
    </div>{anim}</div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: SETUP
  // ═══════════════════════════════════════════════════════════
  if (phase === "setup") {
    const pd = playerData[currentSetupPlayer.id] || {};
    return (<div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, minHeight: "100vh" }}>
        <h2 style={{ color: "#c4b5fd", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🎪 Setup — {currentSetupPlayer.festivalName}</h2>
        <p style={{ color: "#8b5cf6", fontSize: 13, marginBottom: 20 }}>Player {setupIndex + 1} of {players.length}</p>
        {setupStep === "viewCouncil" && (() => {
          const councils = playerCouncils[currentSetupPlayer.id] || [];
          const co = councils[0];
          return co ? <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#22c55e", marginBottom: 8, fontSize: 20 }}>📋 Your Council Objective</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>This is a spatial objective — keep it satisfied on your board for passive bonuses!</p>
            <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(124,58,237,0.15))", border: "2px solid #22c55e", marginBottom: 16 }}>
              <h4 style={{ color: "#22c55e", fontSize: 18, margin: "0 0 6px" }}>{co.obj.name}</h4>
              <p style={{ color: "#e9d5ff", fontSize: 13, margin: "0 0 8px", fontStyle: "italic" }}>"{co.obj.flavour}"</p>
              <p style={{ color: "#c4b5fd", fontSize: 12, margin: "0 0 8px" }}>Requirement: {co.obj.req}</p>
              <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(34,197,94,0.2)", display: "inline-block" }}>
                <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>Passive: {co.obj.benefit}</span>
              </div>
              </div>
            <button onClick={confirmViewCouncil} style={{ ...bp, width: "100%" }}>Got it! Continue →</button>
          </div> : null;
        })()}
        {setupStep === "viewObjective" && (() => {
          const obj = playerObjectives[currentSetupPlayer.id];
          return obj ? <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#fbbf24", marginBottom: 8, fontSize: 20 }}>🎯 Your Secret Objective</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>This is your personal objective for the entire game. Only you can see it!</p>
            <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(124,58,237,0.15))", border: "2px solid #fbbf24", marginBottom: 16 }}>
              <h4 style={{ color: "#fbbf24", fontSize: 18, margin: "0 0 6px" }}>{obj.name}</h4>
              <p style={{ color: "#e9d5ff", fontSize: 14, margin: "0 0 8px" }}>{obj.desc}</p>
              <p style={{ color: "#c4b5fd", fontSize: 12, margin: "0 0 12px", fontStyle: "italic" }}>Requirement: {obj.req}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 11 }}>1st lineup: {obj.reward1}</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: 11 }}>2nd lineup: {obj.reward2}</span>
              </div>
            </div>
            <button onClick={confirmViewObjective} style={{ ...bp, width: "100%" }}>Got it! Continue to Draft →</button>
          </div> : null;
        })()}
        {setupStep === "draftArtist" && <div style={{ ...card, maxWidth: 700, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 8 }}>Draft your starting artists</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Choose <strong style={{ color: "#fbbf24" }}>2</strong> of these 4 artists for your hand. The rest go back into the deck.</p>
          {/* Objective reminders */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
            {playerObjectives[currentSetupPlayer.id] && <div style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", textAlign: "left", maxWidth: 220 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>🎯 Artist Objective</div>
              <div style={{ fontSize: 10, color: "#e9d5ff", fontWeight: 600 }}>{playerObjectives[currentSetupPlayer.id].name}</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>{playerObjectives[currentSetupPlayer.id].req}</div>
            </div>}
            {(playerCouncils[currentSetupPlayer.id] || []).map((co, ci) => <div key={ci} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", textAlign: "left", maxWidth: 220 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", textTransform: "uppercase" }}>📋 Council</div>
              <div style={{ fontSize: 10, color: "#e9d5ff", fontWeight: 600 }}>{co.obj.name}</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>{co.obj.benefit}</div>
            </div>)}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {setupDraftOptions.map((a, i) => <ArtistCard key={i} artist={a} showCost selected={(setupDraftSelected || []).includes(i)} onClick={() => toggleDraftSelection(i)} />)}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>{(setupDraftSelected || []).length}/2 selected</p>
          <button onClick={confirmSetupDraft} disabled={(setupDraftSelected || []).length !== 2} style={{ ...bp, width: "100%", opacity: (setupDraftSelected || []).length === 2 ? 1 : 0.4 }}>Draft 2 Artists →</button>
        </div>}
        {setupStep === "pickAmenity" && <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 12 }}>Choose your starting amenity</h3>
          {/* Council reminder — relevant for amenity choice */}
          {(playerCouncils[currentSetupPlayer.id] || []).map((co, ci) => <div key={ci} style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: 12, textAlign: "left" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", textTransform: "uppercase" }}>📋 Council Objective — consider this when placing!</div>
            <div style={{ fontSize: 11, color: "#e9d5ff", fontWeight: 600 }}>{co.obj.name}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Requires: {co.obj.req}</div>
            <div style={{ fontSize: 10, color: "#4ade80" }}>Passive: {co.obj.benefit}</div>
          </div>)}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{AMENITY_TYPES.map(t => <button key={t} onClick={() => setSetupSelectedAmenity(t)} style={{ padding: 16, borderRadius: 12, border: setupSelectedAmenity === t ? `2px solid ${AMENITY_COLORS[t]}` : "2px solid #2a2a4a", background: setupSelectedAmenity === t ? "rgba(124,58,237,0.2)" : "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 28 }}>{AMENITY_ICONS[t]}</div><div style={{ fontWeight: 600, marginTop: 4 }}>{AMENITY_LABELS[t]}</div></button>)}</div>
          <button onClick={confirmSetupAmenity} disabled={!setupSelectedAmenity} style={{ ...bp, marginTop: 20, width: "100%", opacity: setupSelectedAmenity ? 1 : 0.4 }}>Confirm →</button>
        </div>}
        {setupStep === "placeStage" && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#c4b5fd", margin: 0, fontSize: 14 }}>🎤 Click to place your stage</p></div><div style={{ display: "flex", justifyContent: "center" }}><HexGrid stages={pd.stages || []} amenities={pd.amenities || []} onHexClick={handleSetupHexClick} placingStage hoverHex={hoverHex} onHexHover={setHoverHex} /></div></div>}
        {setupStep === "placeAmenity" && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#c4b5fd", margin: 0, fontSize: 14 }}>{AMENITY_ICONS[pd.setupAmenity]} Place your {AMENITY_LABELS[pd.setupAmenity]} (not on stage)</p></div><div style={{ display: "flex", justifyContent: "center" }}><HexGrid stages={playerData[currentSetupPlayer.id]?.stages || []} amenities={playerData[currentSetupPlayer.id]?.amenities || []} onHexClick={handleSetupHexClick} onHexHover={setHoverHex} hoverHex={hoverHex} /></div><button onClick={undoSetupPlacement} style={{ ...bs, marginTop: 12 }}>↩ Undo</button></div>}
        {setupStep === "confirm" && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#34d399", margin: 0, fontSize: 14, fontWeight: 600 }}>✓ Confirm your placement.</p></div><div style={{ display: "flex", justifyContent: "center" }}><HexGrid stages={playerData[currentSetupPlayer.id]?.stages || []} amenities={playerData[currentSetupPlayer.id]?.amenities || []} onHexHover={setHoverHex} hoverHex={hoverHex} /></div><div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}><button onClick={undoSetupPlacement} style={bs}>↩ Undo</button><button onClick={confirmSetupPlacement} style={bp}>{setupIndex < players.length - 1 ? "Confirm & Next →" : "Confirm & Start 🎶"}</button></div></div>}
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME
  // ═══════════════════════════════════════════════════════════
  if (phase === "game") {
    const handCards = currentPD.hand || [];
    const stageArtists = currentPD.stageArtists || currentPD.stages?.map(() => []) || [];
    return (<div style={CS}>{logBtn}{discardBtn}
      {showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      {showDiscard && <DiscardViewer discard={discardPile} onClose={() => setShowDiscard(false)} />}
      {/* Headliner celebration */}
      {/* Dice Roll Overlay */}
      {pendingDiceRoll && <DiceRollOverlay
        pendingRoll={pendingDiceRoll}
        sfx={sfx}
        onRoll={(results) => setPendingDiceRoll(prev => ({ ...prev, results, rolled: true }))}
        onComplete={(results) => { if (pendingDiceRoll.callback) pendingDiceRoll.callback(results); setPendingDiceRoll(null); }}
      />}
      {showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowHeadliner(null)}>
        <div style={{ textAlign: "center", animation: "bookReveal 0.5s" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🌟🎤🌟</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24", margin: "0 0 12px", animation: "headlinerPulse 1s infinite" }}>HEADLINER!</h1>
          <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={showHeadliner.artist} showCost /></div>
          <p style={{ color: "#c4b5fd", fontSize: 16, marginBottom: 4 }}>Headlines at {showHeadliner.festival}!</p>
          {showHeadliner.artist.effect && <p style={{ color: "#fbbf24", fontSize: 14, padding: "8px 16px", borderRadius: 10, background: "rgba(251,191,36,0.1)", display: "inline-block" }}>✨ {showHeadliner.artist.effect}</p>}
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Booked artist popup (non-headliner) */}
      {showBookedArtist && !showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 945, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowBookedArtist(null)}>
        <div style={{ textAlign: "center", animation: "bookReveal 0.4s" }}>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 8 }}>🎤 Booked to {showBookedArtist.stageName}</p>
          <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={showBookedArtist.artist} showCost /></div>
          {showBookedArtist.artist.effect && <div style={{ marginTop: 4 }}>
            <p style={{ color: "#4ade80", fontSize: 13, padding: "6px 14px", borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "inline-block" }}>✨ {showBookedArtist.artist.effect}</p>
          </div>}
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Floating bonuses */}
      {floatingBonuses.map(fb => <div key={fb.id} style={{ position: "fixed", top: `calc(35% + ${fb.offset || 0}px)`, left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "floatUp 2.2s forwards" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: fb.color, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{fb.text}</span>
      </div>)}
      {/* Stage detail popup */}
      {showStageDetail && (() => {
        const sd = showStageDetail;
        const pd = playerData[sd.playerId] || {};
        const sa = (pd.stageArtists || [])[sd.stageIdx] || [];
        const sName = (pd.stageNames || [])[sd.stageIdx] || `Stage ${sd.stageIdx + 1}`;
        const sColor = (pd.stageColors || [])[sd.stageIdx] || "#7c3aed";
        const totalTickets = sa.reduce((s, a) => s + a.tickets, 0);
        const totalVP = sa.reduce((s, a) => s + a.vp, 0);
        const allGenres = new Set(); sa.forEach(a => getGenres(a.genre).forEach(g => allGenres.add(g)));
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowStageDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: `2px solid ${sColor}`, borderRadius: 20, padding: 28, maxWidth: 500, width: "100%", textAlign: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: sColor, margin: "0 auto 8px" }} />
            <h2 style={{ color: sColor, fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{sName}</h2>
            <p style={{ color: "#8b5cf6", fontSize: 12, margin: "0 0 8px" }}>{sa.length === 3 ? "🎉 Full Lineup!" : `${sa.length}/3 artists booked`}</p>
            {allGenres.size > 0 && <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
              {[...allGenres].map(g => <span key={g} style={{ padding: "3px 10px", borderRadius: 20, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 10, fontWeight: 700 }}>{g}</span>)}
            </div>}
            {sa.length === 0 && <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>No artists booked yet. Book artists to fill your lineup!</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {sa.map((a, ai) => {
                const isHL = ai === 2;
                const gs = getGenres(a.genre);
                return <div key={ai} style={{ padding: 14, borderRadius: 14, background: genreGradient(a.genre), color: "#fff", textAlign: "left", position: "relative", border: isHL ? "3px solid #fbbf24" : "2px solid rgba(255,255,255,0.1)", boxShadow: isHL ? "0 0 20px rgba(251,191,36,0.3)" : "0 2px 8px rgba(0,0,0,0.3)" }}>
                  {isHL && <div style={{ position: "absolute", top: -10, right: 12, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 10, textTransform: "uppercase", boxShadow: "0 2px 8px rgba(251,191,36,0.4)" }}>⭐ Headliner</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{a.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{gs.map(g => <span key={g} style={{ marginRight: 6 }}>{g}</span>)} • 🔥 {a.fame}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>🎟️ {a.tickets}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>⭐ {a.vp} VP</div>
                    </div>
                  </div>
                  {a.effect && <div style={{ fontSize: 11, marginTop: 8, padding: "5px 10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>✨ {a.effect}</div>}
                </div>;
              })}
            </div>
            {sa.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "12px 0", borderTop: "1px solid #2a2a4a", borderBottom: "1px solid #2a2a4a", marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>Tickets</div><div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>{totalTickets}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>VP</div><div style={{ fontSize: 22, fontWeight: 900, color: "#c4b5fd" }}>{totalVP}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>Genres</div><div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80" }}>{allGenres.size}</div></div>
            </div>}
            <button onClick={() => setShowStageDetail(null)} style={{ ...bp }}>Close</button>
          </div>
        </div>;
      })()}
      {/* Pending Effect Resolution */}
      {pendingEffect && pendingEffectPid === currentPlayerId && (() => {
        const pe = pendingEffect;
        const pid = pendingEffectPid;
        const pd = playerData[pid] || {};

        const handleEffectPlacement = (col, row) => {
          if (isOnStage(col, row, pd.stages) || pd.amenities.some(a => a.col === col && a.row === row)) return;
          const aType = pe.amenityType || pe.chosenType;
          if (!aType) return;
          setPlayerData(p => {
            const updated = { ...p[pid], amenities: [...p[pid].amenities, { col, row, type: aType }] };
            // Check Kendrick-style VP bonus inline
            if (aType === "security" && p[pid].vpPerSecurity > 0) {
              updated.vp = (updated.vp || 0) + p[pid].vpPerSecurity;
              addLog("Effect", `+${p[pid].vpPerSecurity} VP from security placement!`);
            }
            return { ...p, [pid]: updated };
          });
          addLog("Effect", `Placed bonus ${AMENITY_LABELS[aType]} at (${col},${row})`);
          sfx.placeAmenity();
          const remaining = (pe.placeCount || 1) - 1;
          if (remaining > 0) {
            if (pe.type === "placeAmenity") setPendingEffect({ ...pe, placeCount: remaining, chosenType: null });
            else setPendingEffect({ ...pe, placeCount: remaining });
          } else {
            setPendingEffect(null); setPendingEffectPid(null);
          }
          recalcTickets();
        };

        if (pe.type === "placeSpecific") {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", marginBottom: 12, padding: "12px 20px" }}>
              <p style={{ color: "#4ade80", margin: 0, fontSize: 14, fontWeight: 600 }}>✨ {pe.artistName}: Place your bonus {AMENITY_ICONS[pe.amenityType]} {AMENITY_LABELS[pe.amenityType]}!{(pe.placeCount || 1) > 1 ? ` (${pe.placeCount} remaining)` : ""}</p>
            </div>
            <HexGrid stages={pd.stages || []} amenities={pd.amenities || []} onHexClick={handleEffectPlacement} onHexHover={setHoverHex} hoverHex={hoverHex} stageColors={pd.stageColors || []} />
          </div>;
        }

        if (pe.type === "placeAmenity" && !pe.chosenType) {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Choose an amenity to place!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {AMENITY_TYPES.map(t => <button key={t} onClick={() => setPendingEffect({ ...pe, chosenType: t })} style={{ padding: 14, borderRadius: 10, border: "2px solid #2a2a4a", background: "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{AMENITY_ICONS[t]}</div>
                  <div style={{ fontWeight: 600, marginTop: 4, fontSize: 12 }}>{AMENITY_LABELS[t]}</div>
                </button>)}
              </div>
            </div>
          </div>;
        }

        if (pe.type === "placeAmenity" && pe.chosenType) {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", marginBottom: 12, padding: "12px 20px" }}>
              <p style={{ color: "#4ade80", margin: 0, fontSize: 14, fontWeight: 600 }}>✨ Place your bonus {AMENITY_ICONS[pe.chosenType]} {AMENITY_LABELS[pe.chosenType]}!</p>
            </div>
            <HexGrid stages={pd.stages || []} amenities={pd.amenities || []} onHexClick={handleEffectPlacement} onHexHover={setHoverHex} hoverHex={hoverHex} stageColors={pd.stageColors || []} />
          </div>;
        }

        if (pe.type === "signArtist") {
          const remaining = pe.signCount || 1;
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Sign {remaining} artist{remaining > 1 ? "s" : ""}!</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Pick an artist from the pool to add to your hand{remaining > 1 ? ` (${remaining} remaining)` : ""}:</p>
              {pe.canRefresh && !poolRefreshedByEffect && <button onClick={() => {
                refreshPool(); setPoolRefreshedByEffect(true);
                addLog("Effect", "Refreshed artist pool");
              }} style={{ ...bs, fontSize: 11, marginBottom: 10 }}>🔄 Refresh Pool First</button>}
              {poolRefreshedByEffect && <p style={{ color: "#4ade80", fontSize: 10, marginBottom: 8 }}>✓ Pool refreshed</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small onClick={() => {
                  const newPool = [...artistPool]; newPool.splice(i, 1);
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, a] } }));
                  addLog("Effect", `Signed ${a.name} from pool`);
                  trackGoalProgress(pid, "artistsSigned");
                  refillPool(newPool);
                  if (remaining > 1) {
                    setPendingEffect({ ...pe, signCount: remaining - 1 });
                  } else {
                    setPendingEffect(null); setPendingEffectPid(null);
                    setDeferPoolRefresh(false);
                  }
                }} />)}
              </div>
              <button onClick={() => {
                const drawn = drawFromDeck(1);
                if (drawn.length > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, drawn[0]] } })); addLog("Effect", `Signed ${drawn[0].name} from deck`); trackGoalProgress(pid, "artistsSigned"); }
                if (remaining > 1) {
                  setPendingEffect({ ...pe, signCount: remaining - 1 });
                } else {
                  setPendingEffect(null); setPendingEffectPid(null);
                  if (deferPoolRefresh) { refillPool(); setDeferPoolRefresh(false); }
                }
              }} style={{ ...bs, marginTop: 12, fontSize: 12 }}>📦 Draw from Deck instead</button>
            </div>
          </div>;
        }

        if (pe.type === "pickFromDrawn") {
          const keepCount = pe.keepCount || 1;
          const selected = pe.selected || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600 }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Pick {keepCount} to keep!</h3>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 10 }}>{selected.length}/{keepCount} selected</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {pe.drawn.map((a, i) => <ArtistCard key={i} artist={a} showCost
                  selected={selected.includes(i)}
                  onClick={() => {
                    if (keepCount === 1) {
                      // Single pick — instant
                      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, a] } }));
                      const other = pe.drawn.filter((_, j) => j !== i);
                      setDiscardPile(prev => [...prev, ...other]);
                      addLog("Effect", `Kept ${a.name}, discarded ${other.map(o => o.name).join(", ")}`);
                      trackGoalProgress(pid, "artistsSigned");
                      setPendingEffect(null); setPendingEffectPid(null);
                    } else {
                      // Multi pick — toggle selection
                      const newSel = selected.includes(i) ? selected.filter(s => s !== i) : [...selected, i];
                      if (newSel.length <= keepCount) setPendingEffect({ ...pe, selected: newSel });
                    }
                  }} />)}
              </div>
              {keepCount > 1 && selected.length === keepCount && <button onClick={() => {
                const kept = selected.map(i => pe.drawn[i]);
                const other = pe.drawn.filter((_, i) => !selected.includes(i));
                setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, ...kept] } }));
                setDiscardPile(prev => [...prev, ...other]);
                addLog("Effect", `Kept ${kept.map(a => a.name).join(", ")}`);
                kept.forEach(() => trackGoalProgress(pid, "artistsSigned"));
                setPendingEffect(null); setPendingEffectPid(null);
              }} style={{ ...bp, marginTop: 12 }}>Confirm Selection ✓</button>}
            </div>
          </div>;
        }

        return null;
      })()}
      {/* Council fame notification */}
      {showCouncilFame && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 940, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowCouncilFame(null)}>
        <div style={{ ...card, textAlign: "center", maxWidth: 400, animation: "fadeSlideIn 0.3s" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋🔥</div>
          <h2 style={{ color: "#22c55e", fontSize: 22, margin: "0 0 8px" }}>Council Objective Complete!</h2>
          <p style={{ color: "#e9d5ff", fontSize: 16 }}>"{showCouncilFame.name}"</p>
          <p style={{ color: "#fbbf24", fontSize: 14, marginTop: 8 }}>{showCouncilFame.festival} gains +1 Fame this round!</p>
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Year Announcement popup */}
      {showYearAnnouncement && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 920, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ ...card, textAlign: "center", maxWidth: 500, width: "100%", animation: "fadeSlideIn 0.4s" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎪📢</div>
          <h2 style={{ color: "#fbbf24", fontSize: 26, margin: "0 0 4px" }}>Year {year} — What's Trending</h2>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>Here's what the industry is buzzing about this year</p>
          {trendingCouncil && <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: 10, textAlign: "left" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1 }}>📋📢 Trending Council Objective</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginTop: 4 }}>{trendingCouncil.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{trendingCouncil.req}</div>
            <div style={{ fontSize: 11, color: "#fbbf24", marginTop: 4 }}>{trendingCouncil.tBenefit}</div>
          </div>}
          {microtrends.length > 0 && <div style={{ padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎵 Microtrends — First to Book → +1 Fame</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {microtrends.map((mt, i) => <span key={i} style={{ padding: "5px 14px", borderRadius: 20, background: GENRE_COLORS[mt.genre], color: "#fff", fontSize: 13, fontWeight: 700 }}>{mt.genre}</span>)}
            </div>
          </div>}
          <button onClick={() => { setShowYearAnnouncement(false); setShowTurnStart(true); }} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      {/* Turn start popup */}
      {showTurnStart && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 440, animation: "fadeSlideIn 0.3s" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, margin: "0 0 8px" }}>🎪 {currentPlayer?.festivalName}</h2>
          <p style={{ color: "#c4b5fd", fontSize: 16 }}>Year {year} — <strong style={{ color: "#fbbf24" }}>{turnsLeft[currentPlayerId]}</strong> turns left</p>
          {playerObjectives[currentPlayerId] && (() => {
            const obj = playerObjectives[currentPlayerId];
            const { count } = countGenreLineups(obj, playerData[currentPlayerId] || {});
            return <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 1 }}>🎯 Your Objective: {obj.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{obj.req}</div>
              <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4 }}>1st lineup: {obj.reward1}</div>
              <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>2nd lineup: {obj.reward2}</div>
              {count > 0 && <div style={{ fontSize: 10, color: "#4ade80", marginTop: 4, fontWeight: 700 }}>✅ {count} qualifying lineup{count > 1 ? "s" : ""} from last year!</div>}
            </div>;
          })()}
          {microtrends.some(mt => mt.claimedBy === null) && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎵 Microtrends (first to book → +1 Fame)</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {microtrends.filter(mt => mt.claimedBy === null).map((mt, i) => <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: GENRE_COLORS[mt.genre], color: "#fff", fontSize: 11, fontWeight: 700 }}>{mt.genre}</span>)}
            </div>
          </div>}
          {trendingCouncil && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1 }}>📋📢 Trending Council: {trendingCouncil.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{trendingCouncil.req}</div>
            <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>{trendingCouncil.tBenefit}</div>
          </div>}
          <button onClick={() => setShowTurnStart(false)} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      {/* Choice popup for OR dice */}
      {choiceAmenity && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 360 }}><h3 style={{ color: "#c4b5fd", marginBottom: 16 }}>Choose one:</h3>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {choiceAmenity === "catering_or_portaloo" ? <><button onClick={() => handleChoiceSelect("catering")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🍔<br /><span style={{ fontSize: 12 }}>Catering</span></button><button onClick={() => handleChoiceSelect("portaloo")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🚽<br /><span style={{ fontSize: 12 }}>Portaloo</span></button></> : <><button onClick={() => handleChoiceSelect("security")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>👮‍♀️<br /><span style={{ fontSize: 12 }}>Security</span></button><button onClick={() => handleChoiceSelect("campsite")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>⛺<br /><span style={{ fontSize: 12 }}>Campsite</span></button></>}
          </div></div>
      </div>}

      {/* Viewing another player's board */}
      {viewingPlayerId !== null && viewingPlayerId !== currentPlayerId && (() => {
        const vp = players.find(p => p.id === viewingPlayerId);
        const vpd = playerData[viewingPlayerId] || {};
        const vsa = vpd.stageArtists || vpd.stages?.map(() => []) || [];
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 890, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewingPlayerId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: "1px solid #fbbf24", borderRadius: 20, padding: 24, maxWidth: 800, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: "#fbbf24", fontSize: 20, margin: 0 }}>👁️ {vp?.festivalName}'s Festival</h2>
              <button onClick={() => setViewingPlayerId(null)} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🎟️ {vpd.tickets || 0} tickets</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>⭐ {vpd.vp || 0} VP</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🔥 Fame {vpd.fame || 0}</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🃏 {(vpd.hand || []).length} in hand</span>
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
              <HexGrid stages={vpd.stages || []} amenities={vpd.amenities || []} stageColors={vpd.stageColors || []} onCenterClick={(si) => setShowStageDetail({ stageIdx: si, playerId: viewingPlayerId })} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
                {(vpd.stages || []).map((_, si) => {
                  const sa = vsa[si] || [];
                  const sName = (vpd.stageNames || [])[si] || `Stage ${si + 1}`;
                  const sColor = (vpd.stageColors || [])[si] || "#7c3aed";
                  return <div key={si} style={{ padding: 8, borderRadius: 10, background: `${sColor}15`, border: `1px solid ${sColor}50` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: sColor, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: sColor, display: "inline-block" }} />{sName} {sa.length === 3 ? <span style={{ fontSize: 9, color: "#34d399" }}>✅</span> : <span style={{ fontSize: 9, color: "#94a3b8" }}>({sa.length}/3)</span>}
                    </div>
                    {sa.map((a, ai) => <div key={ai} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 2, background: genreGradient(a.genre), color: "#fff" }}>{ai === 2 ? "⭐ " : ""}{a.name} <span style={{ fontSize: 8, opacity: 0.7 }}>{a.vp}VP</span></div>)}
                    {sa.length === 0 && <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>Empty</div>}
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>;
      })()}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, padding: 16, borderRight: "1px solid #2a2a4a", overflowY: "auto", flexShrink: 0 }}>
          <h3 style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" }}>Year {year} of 4</h3>
          {players.map(p => { const pd = playerData[p.id] || {}; const ic = p.id === currentPlayerId; const isViewing = viewingPlayerId === p.id; return (
            <div key={p.id} onClick={() => setViewingPlayerId(p.id === currentPlayerId ? null : (viewingPlayerId === p.id ? null : p.id))} style={{ padding: 12, borderRadius: 12, marginBottom: 8, background: ic ? "rgba(124,58,237,0.2)" : isViewing ? "rgba(251,191,36,0.1)" : "rgba(15,14,26,0.6)", border: ic ? "1px solid #7c3aed" : isViewing ? "1px solid #fbbf24" : "1px solid transparent", cursor: ic ? "default" : "pointer", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: ic ? "#fbbf24" : "#c4b5fd", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{ic ? "▶ " : ""}{p.festivalName}{p.isAI ? " 🤖" : ""}</span>
                {!ic && <span style={{ fontSize: 9, color: isViewing ? "#fbbf24" : "#64748b" }}>{isViewing ? "👁️ viewing" : "👁️"}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <span>🎟️ {pd.tickets || 0}</span><span>⭐ {pd.vp || 0} VP</span>
                <span>🔥 Fame {pd.fame || 0}</span><span>🔄 {turnsLeft[p.id] || 0} turns</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{AMENITY_TYPES.map(t => { const c = (pd.amenities || []).filter(a => a.type === t).length; return c > 0 ? <span key={t} style={{ marginRight: 8 }}>{AMENITY_ICONS[t]}×{c}</span> : null; })}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🎤 {(pd.stageArtists || []).flat().length} artists • 🃏 {(pd.hand || []).length} in hand</div>
            </div>); })}
          <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "rgba(124,58,237,0.1)", fontSize: 11, color: "#8b5cf6" }}>
            📦 Deck: {artistDeck.length} • 🗑️ Discard: {discardPile.length}
          </div>
          {/* Sidebar Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            <button onClick={() => setSidebarTab("my")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "my" ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.08)", color: sidebarTab === "my" ? "#e9d5ff" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>🎯 My Festival</button>
            <button onClick={() => setSidebarTab("trending")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "trending" ? "rgba(251,191,36,0.3)" : "rgba(251,191,36,0.08)", color: sidebarTab === "trending" ? "#fbbf24" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>📢 Trending</button>
            <button onClick={() => setSidebarTab("goals")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "goals" ? "rgba(251,191,36,0.3)" : "rgba(251,191,36,0.08)", color: sidebarTab === "goals" ? "#fbbf24" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>🏆 Goals</button>
          </div>

          {sidebarTab === "my" && <>
            {/* Personal Objective */}
            {playerObjectives[currentPlayerId] && (() => { const obj = playerObjectives[currentPlayerId]; const { count } = countGenreLineups(obj, currentPD); return <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", position: "relative", cursor: "help" }} className="obj-hover-parent">
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎯 Your Objective</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e9d5ff" }}>{obj.name}</div>
              {count > 0 && <div style={{ fontSize: 9, color: "#4ade80", marginTop: 2 }}>✅ {count} qualifying lineup{count > 1 ? "s" : ""}</div>}
              <div className="obj-hover-tip" style={{ position: "relative", width: "100%", padding: 0, borderRadius: 10, maxHeight: 0, overflow: "hidden", transition: "all 0.2s", background: "#1a1a2e", border: "1px solid #7c3aed", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", marginBottom: 4 }}>{obj.name}</div>
                <div style={{ fontSize: 10, color: "#e9d5ff", marginBottom: 6 }}>{obj.desc}</div>
                <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 4 }}>📌 {obj.req}</div>
                <div style={{ fontSize: 10, color: "#4ade80" }}>1st lineup: {obj.reward1}</div>
                <div style={{ fontSize: 10, color: "#fbbf24" }}>2nd lineup: {obj.reward2}</div>
              </div>
            </div>; })()}
            {/* Council Objectives */}
            {(playerCouncils[currentPlayerId] || []).length > 0 && <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>📋 Council ({(playerCouncils[currentPlayerId] || []).length})</div>
              {(playerCouncils[currentPlayerId] || []).map((co, ci) => {
                const res = evalCouncilObjective(co.obj, currentPD, false);
                return <div key={ci} style={{ padding: 6, borderRadius: 8, marginBottom: 4, background: res.count > 0 ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.06)", border: `1px solid ${res.count > 0 ? "#22c55e50" : "#4c1d9540"}`, position: "relative", cursor: "help" }} className="obj-hover-parent">
                  <div style={{ fontSize: 10, fontWeight: 700, color: res.count > 0 ? "#4ade80" : "#94a3b8" }}>{co.obj.name}</div>
                  <div style={{ fontSize: 9, color: res.count > 0 ? "#4ade80" : "#64748b" }}>
                    {res.tickets > 0 && `+${res.tickets} 🎟️`}{res.vp > 0 && `+${res.vp} ⭐`}{res.count === 0 && "No qualifying amenities yet"}
                  </div>
                  <div className="obj-hover-tip" style={{ position: "relative", width: "100%", padding: 0, borderRadius: 10, maxHeight: 0, overflow: "hidden", transition: "all 0.2s", background: "#1a1a2e", border: "1px solid #22c55e", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>{co.obj.name}</div>
                    <div style={{ fontSize: 10, color: "#e9d5ff", fontStyle: "italic", marginBottom: 6 }}>"{co.obj.flavour}"</div>
                    <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 4 }}>📌 {co.obj.req}</div>
                    <div style={{ fontSize: 10, color: "#4ade80" }}>Benefit: {co.obj.benefit}</div>
                    <div style={{ fontSize: 9, color: "#fbbf24", marginTop: 4 }}>Qualifying: {res.count} → {res.tickets > 0 ? `+${res.tickets} tickets` : ""}{res.vp > 0 ? `+${res.vp} VP` : ""}</div>
                  </div>
                </div>;
              })}
            </div>}
            {/* Fame breakdown */}
            <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: "rgba(251,191,36,0.08)", fontSize: 10, color: "#fbbf24" }}>
              🔥 Fame {currentPD.fame || 0} → {FAME_VP[Math.min(5, currentPD.fame || 0)]} VP at year end
            </div>
          </>}

          {sidebarTab === "trending" && <>
            {/* Trending Council Objective */}
            {trendingCouncil && (() => {
              const tcRes = evalCouncilObjective(trendingCouncil, currentPD, true);
              return <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", cursor: "help" }} className="obj-hover-parent">
                <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>📋📢 Trending Council</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e9d5ff" }}>{trendingCouncil.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{trendingCouncil.req}</div>
                <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>{trendingCouncil.tBenefit}</div>
                {tcRes.fame > 0 && <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, marginTop: 2 }}>+{tcRes.fame} 🔥 Fame</div>}
                <div className="obj-hover-tip" style={{ position: "relative", width: "100%", padding: 0, borderRadius: 10, maxHeight: 0, overflow: "hidden", transition: "all 0.2s", background: "#1a1a2e", border: "1px solid #22c55e", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 4 }}>{trendingCouncil.name}</div>
                  <div style={{ fontSize: 10, color: "#e9d5ff", fontStyle: "italic", marginBottom: 6 }}>"{trendingCouncil.flavour}"</div>
                  <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 4 }}>📌 {trendingCouncil.req}</div>
                  <div style={{ fontSize: 10, color: "#fbbf24" }}>Trending: {trendingCouncil.tBenefit}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>All players benefit from this!</div>
                </div>
              </div>;
            })()}
            {/* Microtrends */}
            {microtrends.length > 0 && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>🎵 Microtrends</div>
              {microtrends.map((mt, i) => {
                const claimed = mt.claimedBy !== null;
                const claimer = claimed ? players.find(p => p.id === mt.claimedBy)?.festivalName : null;
                return <div key={i} style={{ padding: "5px 8px", borderRadius: 6, marginBottom: 4, background: claimed ? "rgba(107,114,128,0.15)" : `${GENRE_COLORS[mt.genre]}15`, border: `1px solid ${claimed ? "#4b5563" : GENRE_COLORS[mt.genre]}40`, opacity: claimed ? 0.5 : 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: claimed ? "#6b7280" : GENRE_COLORS[mt.genre] }}>
                    {claimed ? "✓" : "🔥"} Book a {mt.genre} artist
                  </div>
                  {claimed && <div style={{ fontSize: 9, color: "#6b7280" }}>Claimed by {claimer}</div>}
                  {!claimed && <div style={{ fontSize: 9, color: "#94a3b8" }}>First to book → +1 Fame</div>}
                </div>;
              })}
            </div>}
            {/* Global Events Preview */}
            {globalEvents.length > 0 && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎭 Year Events</div>
              <div style={{ display: "flex", gap: 4 }}>
                {globalEvents.map((g, i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: g.event.color === "green" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)", border: `1px solid ${g.event.color === "green" ? "#22c55e" : "#ef4444"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {g.event.color === "green" ? "🟢" : "🔴"}
                </div>)}
              </div>
              <div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>Revealed during Events Phase</div>
            </div>}
          </>}

          {sidebarTab === "goals" && <>
            {activeGoals.map((ag, gi) => {
              const g = ag.goal;
              const myProgress = goalProgress[currentPlayerId]?.[g.trackKey] || 0;
              const req1Done = goalReq1Claimed[g.id]?.[currentPlayerId];
              return <div key={gi} style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 6 }}>🏆 {g.name}</div>
                <div style={{ padding: 6, borderRadius: 6, marginBottom: 4, background: req1Done ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.06)", border: `1px solid ${req1Done ? "#22c55e40" : "#4c1d9540"}` }}>
                  <div style={{ fontSize: 10, color: req1Done ? "#4ade80" : "#c4b5fd" }}>{req1Done ? "✅" : "🎯"} {g.req1} ({myProgress}/{g.req1Target})</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{g.req1Benefit} (all players)</div>
                </div>
                <div style={{ padding: 6, borderRadius: 6, marginBottom: 4, background: ag.req2ClaimedBy !== null ? "rgba(107,114,128,0.15)" : "rgba(251,191,36,0.08)", border: `1px solid ${ag.req2ClaimedBy !== null ? "#4b556340" : "#fbbf2440"}`, opacity: ag.req2ClaimedBy !== null ? 0.6 : 1 }}>
                  <div style={{ fontSize: 10, color: ag.req2ClaimedBy !== null ? "#6b7280" : "#fbbf24" }}>
                    {ag.req2ClaimedBy !== null ? `✅ ${players.find(p => p.id === ag.req2ClaimedBy)?.festivalName}` : `🏁 ${g.req2}`} ({ag.req2ClaimedBy !== null ? "claimed" : `${myProgress}/${g.req2Target}`})
                  </div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{ag.rewardType === "artist" && ag.setAsideArtists[0] ? <>Prize: <strong style={{ color: "#e9d5ff" }}>{ag.setAsideArtists[0].name}</strong> (★{ag.setAsideArtists[0].fame} — plays free)</> : <>Prize: <strong style={{ color: "#e9d5ff" }}>+5 VP</strong></>}</div>
                </div>
                <div style={{ padding: 6, borderRadius: 6, background: ag.req3ClaimedBy !== null ? "rgba(107,114,128,0.15)" : "rgba(251,191,36,0.08)", border: `1px solid ${ag.req3ClaimedBy !== null ? "#4b556340" : "#fbbf2440"}`, opacity: ag.req3ClaimedBy !== null ? 0.6 : 1 }}>
                  <div style={{ fontSize: 10, color: ag.req3ClaimedBy !== null ? "#6b7280" : "#fbbf24" }}>
                    {ag.req3ClaimedBy !== null ? `✅ ${players.find(p => p.id === ag.req3ClaimedBy)?.festivalName}` : `🌟 ${g.req3}`} ({ag.req3ClaimedBy !== null ? "claimed" : `${myProgress}/${g.req3Target}`})
                  </div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{ag.rewardType === "artist" && ag.setAsideArtists[1] ? <>Prize: <strong style={{ color: "#fbbf24" }}>{ag.setAsideArtists[1].name}</strong> (★{ag.setAsideArtists[1].fame} — plays free)</> : <>Prize: <strong style={{ color: "#fbbf24" }}>+10 VP</strong></>}</div>
                </div>
                <div style={{ marginTop: 8, padding: 6, borderRadius: 6, background: "rgba(124,58,237,0.06)" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>All Players</div>
                  {players.map(p => {
                    const prog = goalProgress[p.id]?.[g.trackKey] || 0;
                    const maxTarget = g.req3Target;
                    const pct = Math.min(100, (prog / maxTarget) * 100);
                    const isMe = p.id === currentPlayerId;
                    return <div key={p.id} style={{ marginBottom: 3 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: isMe ? "#e9d5ff" : "#64748b" }}>
                        <span style={{ fontWeight: isMe ? 700 : 400 }}>{p.festivalName}</span>
                        <span>{prog}/{maxTarget}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "rgba(124,58,237,0.2)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: isMe ? "#fbbf24" : "#7c3aed", transition: "width 0.3s" }} />
                      </div>
                    </div>;
                  })}
                </div>
              </div>;
            })}
            {activeGoals.length === 0 && <p style={{ color: "#64748b", fontSize: 12, marginTop: 12 }}>No goals active.</p>}
          </>}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, overflow: "auto" }}>
          <div style={{ marginBottom: 8, textAlign: "center" }}>
            <h2 style={{ color: "#fbbf24", fontSize: 20, margin: 0 }}>{currentPlayer?.festivalName}'s Turn</h2>
            <p style={{ color: "#8b5cf6", fontSize: 12, margin: "4px 0" }}>{turnsLeft[currentPlayerId]} turns remaining</p>
          </div>

          {/* Board + stage artists */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
            <HexGrid stages={currentPD.stages || []} amenities={currentPD.amenities || []} onHexClick={handleGameHexClick} onHexHover={setHoverHex} hoverHex={hoverHex} movingFrom={movingFrom} stageColors={currentPD.stageColors || []} onCenterClick={(si) => setShowStageDetail({ stageIdx: si, playerId: currentPlayerId })} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
              {(currentPD.stages || []).map((_, si) => {
                const sa = stageArtists[si] || [];
                const sName = (currentPD.stageNames || [])[si] || `Stage ${si + 1}`;
                const sColor = (currentPD.stageColors || [])[si] || "#7c3aed";
                return <div key={si} style={{ padding: 10, borderRadius: 12, background: `${sColor}15`, border: artistAction === "pickStage" && sa.length < 3 ? `2px solid ${sColor}` : `1px solid ${sColor}50`, cursor: artistAction === "pickStage" ? "pointer" : "default", transition: "all 0.2s" }} onClick={() => artistAction === "pickStage" && sa.length < 3 && handleStageSelect(si)}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: sColor, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: sColor, display: "inline-block" }} />
                    {sName} {sa.length === 3 ? <span style={{ fontSize: 9, color: "#34d399" }}>✅ FULL</span> : <span style={{ fontSize: 9, color: "#94a3b8" }}>({sa.length}/3)</span>}
                  </div>
                  {sa.map((a, ai) => <div key={ai} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, marginBottom: 2, background: genreGradient(a.genre), color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{ai === 2 ? "⭐ " : ""}{a.name}</span>
                    <span style={{ fontSize: 8, opacity: 0.8 }}>{a.vp}VP</span>
                  </div>)}
                  {sa.length === 0 && <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>Empty</div>}
                  {sa.length < 3 && artistAction === "pickStage" && <div style={{ fontSize: 10, color: "#fbbf24", fontStyle: "italic", marginTop: 4 }}>↑ Click to book here</div>}
                </div>;
              })}
            </div>
          </div>

          {/* Available Artist Pool */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 6 }}>Available Artists ({artistPool.length})</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small
                affordable={canAffordArtist(a, currentPD)}
                disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                onClick={() => {
                  if (artistAction === null && !actionTaken) {
                    // Show book/reserve choice
                  }
                }}
              />)}
            </div>
          </div>

          {/* Player Hand */}
          {handCards.length > 0 && <div style={{ marginTop: 8 }}>
            <button onClick={() => setShowHand(!showHand)} style={{ ...bs, padding: "4px 12px", fontSize: 11, marginBottom: 6 }}>
              {showHand ? "Hide" : "Show"} Hand ({handCards.length} cards)
            </button>
            {showHand && <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small
                affordable={canAffordArtist(a, currentPD)}
                disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                onClick={() => artistAction === null && !actionTaken && handleBookFromHand(i)}
              />)}
            </div>}
          </div>}

          {/* Action bar */}
          <div style={{ ...card, width: "100%", maxWidth: 700, marginTop: 12, padding: 16, alignSelf: "center" }}>
            {actionTaken && !noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#34d399", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✓ Action complete! Review your board, then end your turn.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
                {undoSnapshot && <button onClick={handleUndo} style={{ ...bs, color: "#fbbf24", border: "1px solid #fbbf24", background: "rgba(251,191,36,0.1)" }}>↩️ Undo</button>}
                {!movedThisTurn && !turnAction && <button onClick={handleMoveAmenity} style={{ ...bs, fontSize: 12 }}>↔️ Move Amenity (free)</button>}
                <button onClick={() => { setUndoSnapshot(null); endTurn(); }} style={bd}>End Turn →</button>
              </div>
            </div>}

            {!actionTaken && !turnAction && !noTurnsLeft && <div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handlePickAmenity} style={bp}>🎲 Pick Amenity</button>
                {!movedThisTurn && <button onClick={handleMoveAmenity} style={bs}>↔️ Move Amenity (free)</button>}
                <button onClick={handleArtistAction} style={{ ...bs, background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(249,115,22,0.3))", border: "1px solid #ec4899" }}>🎤 Book / Reserve Artist</button>
                {(currentPD.amenities || []).some(a => a.type === "catering") && councilDeck.length > 0 && <button onClick={() => { takeUndoSnapshot(); setTurnAction("buyCouncil"); }} style={{ ...bs, background: "rgba(249,115,22,0.15)", border: "1px solid #f97316", color: "#f97316" }}>🍔 Buy Council Objective</button>}
              </div>
            </div>}

            {/* Pick Amenity */}
            {!actionTaken && turnAction === "pickAmenity" && !placingAmenity && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12 }}>Pick a die to claim an amenity:</p>
              <DiceDisplay dice={dice} onPick={handleDiePick} canReroll={diceNeedReroll(dice)} onReroll={handleRerollDice} />
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}
            {!actionTaken && turnAction === "pickAmenity" && placingAmenity && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#34d399", fontSize: 14, fontWeight: 600 }}>{AMENITY_ICONS[placingAmenity]} Place your {AMENITY_LABELS[placingAmenity]} on an empty hex</p>
            </div>}

            {/* Move Amenity */}
            {!actionTaken && turnAction === "moveAmenity" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600 }}>{movingFrom ? `Moving ${AMENITY_ICONS[movingFrom.type]} — click destination` : "Click an amenity to pick it up"}</p>
              <button onClick={() => { setTurnAction(null); setMovingFrom(null); }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button>
            </div>}

            {/* Buy Council Objective */}
            {!actionTaken && turnAction === "buyCouncil" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f97316", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🍔 Select a catering van on your board to sacrifice</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>You'll draw a new council objective from the deck.</p>
              <HexGrid stages={currentPD.stages || []} amenities={currentPD.amenities || []} stageColors={currentPD.stageColors || []} onHexClick={(col, row) => {
                const am = currentPD.amenities.find(a => a.col === col && a.row === row && a.type === "catering");
                if (!am) return;
                // Remove catering
                setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: p[currentPlayerId].amenities.filter(a => !(a.col === col && a.row === row && a.type === "catering")) } }));
                // Draw council objective
                const cd = [...councilDeck];
                if (cd.length > 0) {
                  const newObj = cd.pop();
                  setPlayerCouncils(prev => ({ ...prev, [currentPlayerId]: [...(prev[currentPlayerId] || []), { obj: newObj, active: true }] }));
                  setCouncilDeck(cd);
                  addLog(currentPlayer.festivalName, `Sacrificed 🍔 catering at (${col},${row}) → new council objective: ${newObj.name}`);
                  trackGoalProgress(currentPlayerId, "councilsBought");
                  showFloatingBonus(`📋 ${newObj.name}`, "#22c55e");
                  sfx.placeAmenity();
                }
                setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
                setTurnAction(null); setActionTaken(true); recalcTickets();
              }} onHexHover={setHoverHex} hoverHex={hoverHex} />
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}

            {/* Artist Action */}
            {!actionTaken && turnAction === "artist" && artistAction === null && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎤 Choose an artist action:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setArtistAction("bookPool")} style={{ ...bs, fontSize: 12 }}>📋 Book from Pool</button>
                <button onClick={() => setArtistAction("bookHand")} disabled={handCards.length === 0} style={{ ...bs, fontSize: 12, opacity: handCards.length === 0 ? 0.4 : 1 }}>🃏 Book from Hand</button>
                <button onClick={() => setArtistAction("bookDiscard")} disabled={discardPile.length === 0} style={{ ...bs, fontSize: 12, opacity: discardPile.length === 0 ? 0.4 : 1, background: "rgba(251,191,36,0.15)", border: "1px solid #fbbf24", color: "#fbbf24" }}>🗑️🔥 Book from Discard</button>
                <button onClick={() => setArtistAction("reservePool")} style={{ ...bs, fontSize: 12 }}>📥 Reserve from Pool</button>
                <button onClick={() => handleReserveFromDeck()} style={{ ...bs, fontSize: 12 }}>📦 Reserve from Deck</button>
              </div>
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "bookPool" && !selectedArtist && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 8 }}>Click an artist from the pool to book them:</p>
              {(currentPD.amenities || []).some(a => a.type === "portaloo") && <button onClick={() => setArtistAction("spendPortaloo")} style={{ ...bs, fontSize: 11, marginBottom: 10, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🚽 Spend a Portaloo to refresh the pool</button>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small affordable={canAffordArtist(a, currentPD)} disabled={!canAffordArtist(a, currentPD)} onClick={() => handleBookFromPool(i)} />)}
              </div>
              <button onClick={() => setArtistAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Back</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "spendPortaloo" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🚽 Select a portaloo on your board to sacrifice</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Click a portaloo on the hex grid to remove it and refresh the artist pool.</p>
              <HexGrid stages={currentPD.stages || []} amenities={currentPD.amenities || []} stageColors={currentPD.stageColors || []} onHexClick={(col, row) => {
                const am = currentPD.amenities.find(a => a.col === col && a.row === row && a.type === "portaloo");
                if (!am) return;
                setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: p[currentPlayerId].amenities.filter(a => !(a.col === col && a.row === row && a.type === "portaloo")) } }));
                addLog(currentPlayer.festivalName, `Sacrificed 🚽 portaloo at (${col},${row}) to refresh artist pool`);
                trackGoalProgress(currentPlayerId, "portalooRefreshes");
                sfx.placeAmenity();
                refreshPool();
                setArtistAction("bookPool");
                recalcTickets();
              }} onHexHover={setHoverHex} hoverHex={hoverHex} />
              <button onClick={() => setArtistAction("bookPool")} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "bookHand" && !selectedArtist && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 8 }}>Click an artist from your hand to book them:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small affordable={canAffordArtistOrFree(a, currentPD)} disabled={!canAffordArtistOrFree(a, currentPD)} onClick={() => handleBookFromHand(i)} />)}
              </div>
              <button onClick={() => setArtistAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Back</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "reservePool" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 8 }}>Click an artist from the pool to reserve them to your hand:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small onClick={() => handleReserveFromPool(i)} />)}
              </div>
              <button onClick={() => setArtistAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Back</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "bookDiscard" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 13, marginBottom: 4 }}>Book the top artist from the discard pile → <strong>+1 🔥 Fame!</strong></p>
              {discardPile.length > 0 ? (() => {
                const topArtist = discardPile[discardPile.length - 1];
                const affordable = canAffordArtist(topArtist, currentPD);
                const hasOpenStage = (currentPD.stageArtists || []).some(s => s.length < 3);
                return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <ArtistCard artist={topArtist} showCost affordable={affordable} />
                  {affordable && hasOpenStage ? <button onClick={handleBookFromDiscard} style={{ ...bp, background: "linear-gradient(135deg, #b45309, #92400e)" }}>Book {topArtist.name} 🔥</button>
                    : <p style={{ color: "#f87171", fontSize: 11 }}>{!affordable ? "Can't afford this artist" : "No open stages"}</p>}
                </div>;
              })() : <p style={{ color: "#64748b" }}>Discard pile is empty.</p>}
              <button onClick={() => setArtistAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Back</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "deckReveal" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 12 }}>You drew a card from the deck!</p>
              {!deckCardRevealed ? (
                <div onClick={handleRevealDeckCard} style={{
                  width: 150, height: 190, borderRadius: 12, margin: "0 auto", cursor: "pointer",
                  background: "linear-gradient(135deg, #312e81, #1e1b4b)", border: "2px solid #7c3aed",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)", transition: "transform 0.2s",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🎴</div>
                  <p style={{ color: "#c4b5fd", fontSize: 13, fontWeight: 600 }}>Click to reveal!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <ArtistCard artist={deckDrawnCard} showCost />
                  <button onClick={handleConfirmDeckReserve} style={bp}>Add to Hand ✓</button>
                </div>
              )}
              <button onClick={() => { if (deckDrawnCard) setArtistDeck(prev => [...prev, deckDrawnCard]); setArtistAction(null); setDeckDrawnCard(null); setDeckCardRevealed(false); }} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel (put back)</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "pickStage" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600 }}>Select a stage for {selectedArtist?.artist?.name} (click a stage on the right)</p>
              <button onClick={() => { setArtistAction(null); setSelectedArtist(null); }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button>
            </div>}

            {noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>⚠️ No turns remaining!</p>
              <button onClick={endTurn} style={{ ...bd, marginTop: 8 }}>End Turn →</button>
            </div>}
          </div>
        </div>
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: EVENTS (placeholder)
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // RENDER: SPECIAL GUEST PHASE
  // ═══════════════════════════════════════════════════════════
  if (phase === "specialGuest") {
    const sgPlayer = players[specialGuestPlayer];
    const sgPd = sgPlayer ? playerData[sgPlayer.id] : {};
    const sgArtist = specialGuestCard;
    const affordable = sgArtist ? canAffordSpecialGuest(sgArtist, sgPd) : false;

    // If no card drawn yet, trigger setup for current player
    if (!sgArtist && sgPlayer) {
      setTimeout(() => setupSpecialGuestForPlayer(specialGuestPlayer), 100);
    }

    return (
    <div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      {floatingBonuses.map(fb => <div key={fb.id} style={{ position: "fixed", top: `calc(35% + ${fb.offset || 0}px)`, left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "floatUp 2.2s forwards" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: fb.color, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{fb.text}</span>
      </div>)}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {sgArtist ? <div style={{ ...card, textAlign: "center", maxWidth: 520, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🌟 Special Guest — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{sgPlayer?.festivalName}</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>A special guest wants to headline! Fame level is ignored — you just need the amenities.</p>
          <div style={{ display: "inline-block", marginBottom: 16 }}><ArtistCard artist={sgArtist} showCost /></div>
          {affordable ? <>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>✅ You can afford this guest!</p>
            <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 8 }}>Choose a stage (must have exactly 2 artists):</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {specialGuestEligible.map(si => {
                const sName = (sgPd.stageNames || [])[si] || `Stage ${si + 1}`;
                const sColor = (sgPd.stageColors || [])[si] || "#7c3aed";
                const sa = (sgPd.stageArtists || [])[si] || [];
                return <button key={si} onClick={() => placeSpecialGuest(si)} style={{ padding: 12, borderRadius: 12, border: `2px solid ${sColor}`, background: `${sColor}20`, color: "#e2e8f0", cursor: "pointer", minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: sColor, fontSize: 13 }}>{sName}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{sa.map(a => a.name).join(", ")}</div>
                </button>;
              })}
            </div>
          </> : <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>❌ You can't afford this guest's amenity requirements.</p>}
          <button onClick={declineSpecialGuest} style={{ ...bs, fontSize: 13 }}>{affordable ? "Decline Guest" : "Continue →"}</button>
        </div> : <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24 }}>🌟 Special Guests</h2>
          <p style={{ color: "#8b5cf6", marginTop: 8 }}>Checking for eligible festivals...</p>
        </div>}
      </div>{anim}</div>
    );
  }

  if (phase === "events") {
    const evtPlayer = players[eventPhasePlayer];
    const evtRes = evtPlayer ? eventPhaseResults?.[evtPlayer.id] : null;
    const evtPd = evtPlayer ? playerData[evtPlayer.id] : {};
    const globalNegCount = globalEvents.filter(g => g.event.color === "red").length;
    const maxDelegate = evtRes ? Math.min(evtRes.secCount, evtRes.totalNeg) : 0;

    return (
    <div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🎭 Events Phase — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{evtPlayer?.festivalName}'s Festival</h3>

          {eventPhaseStep === "delegate" && evtRes && <>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.1)", marginBottom: 16, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#c4b5fd", marginBottom: 6 }}>You have <strong style={{ color: "#fbbf24" }}>{evtRes.secCount} 👮‍♀️ security</strong> on your board.</div>
              <div style={{ fontSize: 12, color: "#c4b5fd", marginBottom: 6 }}>There are <strong style={{ color: "#ef4444" }}>{globalNegCount} 🔴 global negative events</strong> this year.</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>You also have an unknown number of personal events. Negative events can cost you amenities, fame, and tickets.</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginBottom: 8 }}>How many security do you want to sacrifice to block negative events?</div>
              <div style={{ fontSize: 11, color: "#f87171", marginBottom: 12 }}>Sacrificed security will be removed from your board at random positions.</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                <button onClick={() => setSecurityDelegation(d => Math.max(0, d - 1))} disabled={securityDelegation <= 0} style={{ ...bs, padding: "8px 16px", fontSize: 18, opacity: securityDelegation <= 0 ? 0.3 : 1 }}>−</button>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", minWidth: 60, textAlign: "center" }}>{securityDelegation}</div>
                <button onClick={() => setSecurityDelegation(d => Math.min(maxDelegate, d + 1))} disabled={securityDelegation >= maxDelegate} style={{ ...bs, padding: "8px 16px", fontSize: 18, opacity: securityDelegation >= maxDelegate ? 0.3 : 1 }}>+</button>
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Max: {maxDelegate} (limited by security count and negative events)</div>
            </div>
            <button onClick={confirmSecurityDelegation} style={bp}>Confirm → Reveal Events</button>
          </>}

          {eventPhaseStep === "results" && evtRes && <>
            <div style={{ marginBottom: 12, padding: 8, borderRadius: 10, background: "rgba(124,58,237,0.1)", fontSize: 12, color: "#94a3b8" }}>
              👮‍♀️ Sacrificed: {securityDelegation} • 🔴 Total negative: {evtRes.totalNeg} • 🛡️ Blocked: {evtRes.blocked.length}
            </div>
            {evtRes.positive.length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 6 }}>🟢 Positive Events ({evtRes.positive.length})</div>
              {evtRes.positive.map((e, i) => <div key={i} style={{ padding: 8, borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40", marginBottom: 4, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.desc}</div>
                <div style={{ fontSize: 11, color: "#34d399", marginTop: 2 }}>{e.result}</div>
              </div>)}
            </div>}
            {evtRes.negative.length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>🔴 Unblocked Negative Events ({evtRes.negative.length})</div>
              {evtRes.negative.map((e, i) => <div key={i} style={{ padding: 8, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", marginBottom: 4, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.desc}</div>
                <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 2 }}>{e.result}</div>
              </div>)}
            </div>}
            {evtRes.blocked.length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 6 }}>🛡️ Blocked ({evtRes.blocked.length})</div>
              {evtRes.blocked.map((e, i) => <div key={i} style={{ padding: 6, borderRadius: 8, background: "rgba(96,165,250,0.1)", border: "1px solid #3b82f640", marginBottom: 4, textAlign: "left", opacity: 0.6 }}>
                <div style={{ fontSize: 11, color: "#60a5fa", textDecoration: "line-through" }}>{e.name} — {e.result}</div>
              </div>)}
            </div>}
            {evtRes.positive.length === 0 && evtRes.negative.length === 0 && evtRes.blocked.length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>No events affected this festival.</p>}
            <button onClick={advanceEventPhase} style={bp}>{eventPhasePlayer < players.length - 1 ? `Apply & Next Player →` : `Apply & Go to Scoring →`}</button>
          </>}
        </div>
      </div>{anim}</div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: ROUND END
  // ═══════════════════════════════════════════════════════════
  if (phase === "roundEnd") return (
    <div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, maxWidth: 600, width: "100%", textAlign: "center" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, marginBottom: 4 }}>🎉 Year {year} Complete!</h2>
          <p style={{ color: "#8b5cf6", marginBottom: 20, fontSize: 14 }}>Ticket sales revealed lowest → highest</p>
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: "2px solid #7c3aed" }}>
                <th style={{ padding: "6px 10px", textAlign: "left", color: "#c4b5fd" }}>Festival</th>
                {[1, 2, 3, 4].map(y => <th key={`r${y}`} colSpan={y <= year ? 2 : 1} style={{ padding: "6px 8px", textAlign: "center", color: y <= year ? "#c4b5fd" : "#3b3564", borderLeft: "1px solid #2a2a4a" }}>Yr {y}</th>)}
                <th style={{ padding: "6px 10px", textAlign: "center", color: "#fbbf24", borderLeft: "1px solid #2a2a4a" }}>VP</th>
              </tr>
              <tr style={{ borderBottom: "1px solid #2a2a4a" }}>
                <th />
                {[1, 2, 3, 4].map(y => y <= year ? <>{<th key={`pre${y}`} style={{ padding: "4px 6px", textAlign: "center", color: "#8b5cf6", fontSize: 9, borderLeft: "1px solid #2a2a4a" }}>Pre🔥</th>}{<th key={`post${y}`} style={{ padding: "4px 6px", textAlign: "center", color: "#fbbf24", fontSize: 9 }}>Post🔥</th>}</> : <th key={`e${y}`} style={{ borderLeft: "1px solid #2a2a4a" }} />)}
                <th />
              </tr></thead>
              <tbody>{sortedPlayersForReveal.map((p, idx) => {
                const rev = idx <= revealIndex;
                return <tr key={p.id} style={{ background: idx % 2 === 0 ? "rgba(124,58,237,0.08)" : "transparent", opacity: rev ? 1 : 0.2, transition: "opacity 0.5s" }}>
                  <td style={{ padding: "6px 10px", fontWeight: 600, fontSize: 12 }}>{rev ? p.festivalName : "???"}</td>
                  {[1, 2, 3, 4].map(y => {
                    if (y > year) return <td key={`e${y}`} style={{ padding: "6px 8px", textAlign: "center", color: "#3b3564", borderLeft: "1px solid #2a2a4a" }}>—</td>;
                    const td = allTickets[p.id]?.[y];
                    const raw = td?.raw ?? td ?? 0;
                    const final = td?.final ?? td ?? 0;
                    const fame = td?.fame ?? "?";
                    return rev ? <>{<td key={`pre${y}`} style={{ padding: "6px 6px", textAlign: "center", color: "#94a3b8", fontSize: 11, borderLeft: "1px solid #2a2a4a" }}>{raw}</td>}{<td key={`post${y}`} style={{ padding: "6px 6px", textAlign: "center", color: "#e2e8f0", fontWeight: 600, fontSize: 11 }}>{final}<span style={{ fontSize: 8, color: "#8b5cf6" }}> (🔥{fame})</span></td>}</> : <>{<td key={`pre${y}`} style={{ borderLeft: "1px solid #2a2a4a", textAlign: "center", color: "#3b3564" }}>?</td>}{<td key={`post${y}`} style={{ textAlign: "center", color: "#3b3564" }}>?</td>}</>;
                  })}
                  <td style={{ padding: "6px 10px", textAlign: "center", color: "#fbbf24", fontWeight: 700, borderLeft: "1px solid #2a2a4a" }}>{rev ? playerData[p.id]?.vp || 0 : "?"}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
          {!leaderboardRevealed ? <button onClick={revealNext} style={bp}>{revealIndex < players.length - 1 ? "Reveal Next 🥁" : "Reveal All! 🎉"}</button> : <button onClick={proceedFromRoundEnd} style={bp}>{year >= 4 ? "See Final Results 🏆" : "Continue →"}</button>}
        </div>
      </div>{anim}</div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: PRE-ROUND
  // ═══════════════════════════════════════════════════════════
  if (phase === "preRound") {
    const prp = currentPreRoundPlayer; const prpd = prp ? playerData[prp.id] : {};
    return (<div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {preRoundStep === "notify" && prp && <div style={{ ...card, textAlign: "center", maxWidth: 440 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 8 }}>🔥 {prp.festivalName}</h2>
          <p style={{ color: "#c4b5fd", fontSize: 16, marginBottom: 8 }}>Fame Level 5!</p>
          <p style={{ color: "#8b5cf6", fontSize: 14, marginBottom: 20 }}>Open a new stage!</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}><button onClick={declineNewStage} style={bs}>Decline</button><button onClick={acceptNewStage} style={bp}>Open New Stage 🎤</button></div>
        </div>}
        {preRoundStep === "placeStage" && prp && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#c4b5fd", margin: 0, fontSize: 14 }}>🎤 Place your new stage</p></div><HexGrid stages={prpd.stages || []} amenities={prpd.amenities || []} onHexClick={handlePreRoundHexClick} placingStage hoverHex={hoverHex} onHexHover={setHoverHex} /></div>}
        {preRoundStep === "moveDisplaced" && prp && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#fbbf24", margin: 0, fontSize: 14, fontWeight: 600 }}>Relocate {AMENITY_ICONS[displacedAmenities[displacedPlaceIdx]?.type]} {AMENITY_LABELS[displacedAmenities[displacedPlaceIdx]?.type]} ({displacedPlaceIdx + 1}/{displacedAmenities.length})</p></div><HexGrid stages={playerData[prp.id]?.stages || []} amenities={playerData[prp.id]?.amenities || []} onHexClick={handlePreRoundHexClick} onHexHover={setHoverHex} hoverHex={hoverHex} /></div>}
        {preRoundStep === "confirm" && prp && <div style={{ textAlign: "center" }}><div style={{ ...card, display: "inline-block", marginBottom: 12, padding: "10px 20px" }}><p style={{ color: "#34d399", margin: 0, fontSize: 14, fontWeight: 600 }}>✓ Confirm placement.</p></div><HexGrid stages={playerData[prp.id]?.stages || []} amenities={playerData[prp.id]?.amenities || []} onHexHover={setHoverHex} hoverHex={hoverHex} /><button onClick={confirmPreRound} style={{ ...bp, marginTop: 16 }}>Confirm ✓</button></div>}
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════════════════════════
  const exportGameData = () => {
    const rows = [];
    rows.push(["HEADLINERS — Game Summary"]);
    rows.push([`Winner: ${winner?.festivalName || "N/A"}`, `VP: ${winner ? playerData[winner.id]?.vp || 0 : 0}`]);
    rows.push([]);

    // Scoreboard
    const headers = ["Festival", "AI?"];
    for (let y = 1; y <= 4; y++) headers.push(`Yr${y} Raw Tickets`, `Yr${y} Fame`, `Yr${y} Multiplier`, `Yr${y} Final Tickets`);
    headers.push("Total VP");
    rows.push(headers);

    players.forEach(p => {
      const pd = playerData[p.id] || {};
      const row = [p.festivalName, p.isAI ? "Yes" : "No"];
      for (let y = 1; y <= 4; y++) {
        const td = allTickets[p.id]?.[y];
        if (td && typeof td === "object") { row.push(td.raw, td.fame, td.fameVP, td.ticketVP); }
        else { row.push(td || 0, "?", "?", td || 0); }
      }
      row.push(pd.vp || 0);
      rows.push(row);
    });

    rows.push([]); rows.push(["— Festival Details —"]); rows.push([]);

    players.forEach(p => {
      const pd = playerData[p.id] || {};
      rows.push([`Festival: ${p.festivalName}`, p.isAI ? "(AI)" : ""]);
      rows.push(["Final VP", pd.vp || 0, "Final Fame", pd.fame || 0, "Stages", (pd.stages || []).length]);
      rows.push([]);
      rows.push(["Amenity", "Count"]);
      AMENITY_TYPES.forEach(t => rows.push([AMENITY_LABELS[t], (pd.amenities || []).filter(a => a.type === t).length]));
      rows.push([]);

      (pd.stages || []).forEach((_, si) => {
        const sName = (pd.stageNames || [])[si] || `Stage ${si + 1}`;
        const sa = (pd.stageArtists || [])[si] || [];
        rows.push([`${sName} Lineup`]);
        if (sa.length === 0) { rows.push(["  (empty)"]); }
        else {
          rows.push(["  Artist", "Genre", "Fame", "Tickets", "VP", "Effect", "Role"]);
          sa.forEach((a, ai) => rows.push(["  " + a.name, a.genre, a.fame, a.tickets, a.vp, a.effect || "", ai === 2 ? "HEADLINER" : `Slot ${ai + 1}`]));
        }
        rows.push([]);
      });

      if ((pd.hand || []).length > 0) {
        rows.push(["Remaining Hand"]); rows.push(["  Artist", "Genre", "Fame", "VP"]);
        pd.hand.forEach(a => rows.push(["  " + a.name, a.genre, a.fame, a.vp]));
        rows.push([]);
      }
      const obj = playerObjectives[p.id];
      if (obj) rows.push(["Artist Objective", obj.name, obj.req]);
      (playerCouncils[p.id] || []).forEach(co => rows.push(["Council Objective", co.obj.name, co.obj.req, co.active ? "Active" : "Inactive", co.obj.benefit]));
      rows.push([]); rows.push(["───────────"]); rows.push([]);
    });

    rows.push(["— Game Log —"]);
    gameLog.forEach(e => {
      if (e.type === "header") rows.push([`[${(e.ht || "").toUpperCase()}] ${e.text}`]);
      else rows.push(["", e.label, e.text]);
    });

    const csv = rows.map(r => r.map(c => { const s = String(c ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s; }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `headliners_game_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (phase === "gameOver") return (
    <div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #fbbf24, #f472b6, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🏆 GAME OVER</h1>
          {winner && <div style={{ marginBottom: 24 }}><p style={{ color: "#fbbf24", fontSize: 22, fontWeight: 700 }}>{winner.festivalName} Wins!</p><p style={{ color: "#8b5cf6", fontSize: 14 }}>with {playerData[winner.id]?.vp || 0} VP</p></div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={exportGameData} style={{ ...bs, padding: "12px 20px", fontSize: 14 }}>📊 Download Game Data</button>
            <button onClick={() => { setPhase("lobby"); setGameLog([]); setAllTickets({}); setYear(1); }} style={{ ...bp, padding: "12px 20px", fontSize: 14 }}>Play Again 🎪</button>
          </div>
        </div>
      </div>{anim}</div>
  );

  return null;
}
