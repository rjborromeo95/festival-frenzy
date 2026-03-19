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
 *  - 10 tickets = 1 VP at round end
 *  - Fame level 5 unlocks new stage placement between rounds
 *  - After 4 years, highest VP wins (tiebreak: most tickets)
 */

import { useState, useCallback, useEffect, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
// ARTIST DATA (75 artists from spreadsheet)
// ═══════════════════════════════════════════════════════════
const ALL_ARTISTS = [{"name":"Kara Okay","fame":0,"vp":2,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Pop","tickets":2,"effect":"+1 Personal Event"},{"name":"Sadchild","fame":0,"vp":2,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":1,"genre":"Pop","tickets":2,"effect":"+1 Fame"},{"name":"Mikerophone","fame":0,"vp":2,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Pop","tickets":2,"effect":""},{"name":"Rebecca Black","fame":1,"vp":3,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Pop","tickets":2,"effect":""},{"name":"Pitbull","fame":1,"vp":3,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Pop","tickets":2,"effect":"Sign 1 artist from the artist deck or the available artist pool."},{"name":"Chappell Roan","fame":2,"vp":4,"campCost":1,"securityCost":2,"cateringCost":0,"portalooCost":1,"genre":"Pop","tickets":3,"effect":"+1 Fame"},{"name":"Sabrina Carpenter","fame":2,"vp":4,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":1,"genre":"Pop","tickets":3,"effect":"+1 Personal Event"},{"name":"RAYE","fame":2,"vp":4,"campCost":1,"securityCost":2,"cateringCost":1,"portalooCost":0,"genre":"Pop","tickets":3,"effect":""},{"name":"Nelly","fame":3,"vp":5,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":2,"genre":"Pop, Hip Hop","tickets":4,"effect":"+1 Personal Event"},{"name":"Harry Styles","fame":3,"vp":5,"campCost":2,"securityCost":2,"cateringCost":0,"portalooCost":1,"genre":"Pop","tickets":4,"effect":"+1 Fame"},{"name":"Billie Eilish","fame":4,"vp":6,"campCost":1,"securityCost":3,"cateringCost":0,"portalooCost":1,"genre":"Pop","tickets":4,"effect":"Sign 1 artist from the artist deck or the available artist pool."},{"name":"Beyonce","fame":4,"vp":6,"campCost":1,"securityCost":2,"cateringCost":1,"portalooCost":1,"genre":"Pop","tickets":4,"effect":"+1 Fame"},{"name":"Olivia Dean","fame":4,"vp":6,"campCost":1,"securityCost":3,"cateringCost":1,"portalooCost":0,"genre":"Pop","tickets":4,"effect":""},{"name":"Coldplay","fame":5,"vp":7,"campCost":1,"securityCost":3,"cateringCost":2,"portalooCost":1,"genre":"Pop, Rock","tickets":5,"effect":"Round End: 1 VP / Fame"},{"name":"Lady Gaga","fame":5,"vp":7,"campCost":2,"securityCost":2,"cateringCost":2,"portalooCost":1,"genre":"Pop, Electronic","tickets":5,"effect":"Round End: 1 VP / Event"},{"name":"Sitting Ducks","fame":0,"vp":2,"campCost":0,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Rock","tickets":2,"effect":""},{"name":"Beabadoobee","fame":0,"vp":2,"campCost":0,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Rock","tickets":2,"effect":"+1 Amenity"},{"name":"Limp Bizkit","fame":0,"vp":2,"campCost":0,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Rock","tickets":2,"effect":""},{"name":"Wet Leg","fame":1,"vp":3,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Rock","tickets":2,"effect":"+1 Fame"},{"name":"Heart","fame":1,"vp":3,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Rock","tickets":2,"effect":""},{"name":"No Doubt","fame":2,"vp":4,"campCost":1,"securityCost":0,"cateringCost":1,"portalooCost":2,"genre":"Rock","tickets":3,"effect":"Sign one artist. You may refresh the available artists before or after you draw."},{"name":"Weezer","fame":2,"vp":4,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":2,"genre":"Rock","tickets":3,"effect":"+1 VP"},{"name":"Beastie Boys","fame":3,"vp":5,"campCost":1,"securityCost":0,"cateringCost":1,"portalooCost":2,"genre":"Rock, Hip Hop","tickets":3,"effect":"+1 Security"},{"name":"The Kooks","fame":3,"vp":5,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":2,"genre":"Rock","tickets":4,"effect":"+1 Fame"},{"name":"Slipknot","fame":3,"vp":5,"campCost":1,"securityCost":2,"cateringCost":0,"portalooCost":2,"genre":"Rock","tickets":4,"effect":"Sign one artist. You may refresh the available artists before or after you draw."},{"name":"Olivia Rodrigo","fame":3,"vp":5,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":2,"genre":"Rock, Pop","tickets":4,"effect":"Sign one artist. You may refresh the available artists before or after you draw."},{"name":"Radiohead","fame":4,"vp":6,"campCost":1,"securityCost":0,"cateringCost":2,"portalooCost":2,"genre":"Rock, Electronic","tickets":4,"effect":""},{"name":"Arctic Monkeys","fame":4,"vp":6,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":2,"genre":"Rock","tickets":4,"effect":""},{"name":"Foo Fighters","fame":5,"vp":7,"campCost":2,"securityCost":2,"cateringCost":1,"portalooCost":2,"genre":"Rock","tickets":5,"effect":"Round End: 2 VP / Rock headliner (including this one)"},{"name":"Fleetwood Mac","fame":5,"vp":7,"campCost":2,"securityCost":1,"cateringCost":1,"portalooCost":3,"genre":"Rock","tickets":5,"effect":"Round End: 5 VP"},{"name":"Lil Angry","fame":0,"vp":2,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop","tickets":2,"effect":""},{"name":"Loosey Goosey","fame":0,"vp":2,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop, Pop","tickets":2,"effect":"+1 Security"},{"name":"Knucks","fame":0,"vp":2,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop","tickets":2,"effect":"+1 Fame"},{"name":"Eve","fame":1,"vp":5,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop","tickets":4,"effect":"+1 Negative Event"},{"name":"KAYTRANADA","fame":1,"vp":3,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop, Electronic","tickets":2,"effect":"+1 Security. Place this turn."},{"name":"Lil Dicky","fame":1,"vp":3,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop","tickets":2,"effect":"+1 Security. Place this turn."},{"name":"Mos Def","fame":2,"vp":4,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":0,"genre":"Hip Hop","tickets":3,"effect":"+1 Fame"},{"name":"Loyle Carner","fame":2,"vp":6,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":1,"genre":"Hip Hop, Rock","tickets":5,"effect":"+1 Negative Event"},{"name":"Little Simz","fame":3,"vp":5,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":1,"genre":"Hip Hop","tickets":3,"effect":""},{"name":"Dave","fame":3,"vp":5,"campCost":1,"securityCost":2,"cateringCost":1,"portalooCost":0,"genre":"Hip Hop","tickets":3,"effect":"+1 Amenity"},{"name":"Missy Elliott","fame":4,"vp":6,"campCost":1,"securityCost":2,"cateringCost":1,"portalooCost":1,"genre":"Hip Hop","tickets":4,"effect":""},{"name":"Lauryn Hill","fame":4,"vp":6,"campCost":2,"securityCost":2,"cateringCost":1,"portalooCost":0,"genre":"Hip Hop","tickets":4,"effect":"+1 Fame"},{"name":"Nas","fame":4,"vp":6,"campCost":2,"securityCost":3,"cateringCost":0,"portalooCost":0,"genre":"Hip Hop","tickets":4,"effect":""},{"name":"Kendrick Lamar","fame":5,"vp":7,"campCost":2,"securityCost":3,"cateringCost":1,"portalooCost":1,"genre":"Hip Hop","tickets":5,"effect":"Gain 2 VP whenever you play a security this round."},{"name":"Eminem","fame":5,"vp":7,"campCost":3,"securityCost":3,"cateringCost":1,"portalooCost":0,"genre":"Hip Hop","tickets":5,"effect":"At the end of this round: +2VP / Negative Event Avoided"},{"name":"CRUEL MISTRESS","fame":0,"vp":2,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":0,"genre":"Electronic","tickets":2,"effect":"+4 ticket sales"},{"name":"808 DYLAN","fame":0,"vp":2,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":0,"genre":"Electronic","tickets":2,"effect":"+1 Amenity"},{"name":"Horsegiirl","fame":0,"vp":2,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":0,"genre":"Electronic","tickets":2,"effect":"+1 Fame"},{"name":"The Chainsmokers","fame":1,"vp":3,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":0,"genre":"Electronic","tickets":2,"effect":"+4 ticket sales"},{"name":"Avesie","fame":1,"vp":3,"campCost":1,"securityCost":0,"cateringCost":1,"portalooCost":0,"genre":"Electronic","tickets":2,"effect":"Draw two artists from either the available artist pool or deck. Sign one."},{"name":"Flume","fame":2,"vp":4,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":1,"genre":"Electronic, Hip Hop","tickets":3,"effect":"+1 Amenity"},{"name":"Fred Again..","fame":2,"vp":4,"campCost":2,"securityCost":1,"cateringCost":0,"portalooCost":1,"genre":"Electronic","tickets":3,"effect":""},{"name":"Peggy Gou","fame":2,"vp":4,"campCost":2,"securityCost":0,"cateringCost":2,"portalooCost":0,"genre":"Electronic","tickets":3,"effect":"Draw two artists from either the available artist pool or deck. Sign one."},{"name":"Chase & Status","fame":2,"vp":4,"campCost":2,"securityCost":1,"cateringCost":1,"portalooCost":0,"genre":"Electronic","tickets":3,"effect":""},{"name":"Charli XCX","fame":3,"vp":5,"campCost":2,"securityCost":0,"cateringCost":0,"portalooCost":2,"genre":"Electronic, Pop","tickets":3,"effect":"+1 Event"},{"name":"The Chemical Brothers","fame":3,"vp":5,"campCost":2,"securityCost":2,"cateringCost":0,"portalooCost":0,"genre":"Electronic","tickets":3,"effect":"Draw two artists from either the available artist pool or deck. Sign one."},{"name":"Linkin Park","fame":3,"vp":5,"campCost":2,"securityCost":1,"cateringCost":1,"portalooCost":0,"genre":"Electronic, Rock","tickets":3,"effect":"Sign one artist. You may refresh the available artists before or after you draw."},{"name":"Skrillex","fame":3,"vp":5,"campCost":3,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Electronic","tickets":3,"effect":""},{"name":"Daft Punk","fame":5,"vp":7,"campCost":3,"securityCost":0,"cateringCost":2,"portalooCost":2,"genre":"Electronic","tickets":5,"effect":"Round End: Pick 1 artist to discard from your hand. Gain their VP."},{"name":"Fatboy Slim","fame":5,"vp":7,"campCost":3,"securityCost":1,"cateringCost":2,"portalooCost":1,"genre":"Electronic","tickets":5,"effect":"Round End: 2 VP / Unique genres at your festival"},{"name":"Bruised Brothers","fame":0,"vp":2,"campCost":0,"securityCost":0,"cateringCost":0,"portalooCost":1,"genre":"Indie","tickets":2,"effect":"+1 Security"},{"name":"Ayle","fame":0,"vp":2,"campCost":0,"securityCost":0,"cateringCost":1,"portalooCost":1,"genre":"Indie, Hip Hop","tickets":2,"effect":"Sign one artist. You may refresh the available artists before or after you draw."},{"name":"Mickey Raven","fame":0,"vp":2,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":1,"genre":"Indie","tickets":2,"effect":""},{"name":"Christine & The Queens","fame":1,"vp":3,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":2,"genre":"Indie","tickets":3,"effect":"+1 Amenity"},{"name":"The Kooks","fame":1,"vp":3,"campCost":0,"securityCost":1,"cateringCost":0,"portalooCost":1,"genre":"Indie","tickets":2,"effect":""},{"name":"Mitski","fame":2,"vp":4,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":1,"genre":"Indie","tickets":3,"effect":"+1 Security"},{"name":"CMAT","fame":2,"vp":4,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":2,"genre":"Indie, Pop","tickets":3,"effect":"+1 Fame"},{"name":"Florence & The Machine","fame":2,"vp":4,"campCost":1,"securityCost":0,"cateringCost":1,"portalooCost":1,"genre":"Indie","tickets":3,"effect":"+5 ticket sales"},{"name":"Lana Del Rey","fame":3,"vp":5,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":2,"genre":"Indie","tickets":3,"effect":"+1 Global event"},{"name":"Hozier","fame":3,"vp":4,"campCost":1,"securityCost":0,"cateringCost":0,"portalooCost":2,"genre":"Indie","tickets":3,"effect":"+1 VP"},{"name":"Joy Division","fame":4,"vp":6,"campCost":1,"securityCost":1,"cateringCost":1,"portalooCost":2,"genre":"Indie","tickets":4,"effect":""},{"name":"Tame Impala","fame":4,"vp":6,"campCost":2,"securityCost":0,"cateringCost":1,"portalooCost":2,"genre":"Indie, Electronic","tickets":4,"effect":"+1 Amenity"},{"name":"The Strokes","fame":4,"vp":6,"campCost":1,"securityCost":1,"cateringCost":0,"portalooCost":3,"genre":"Indie","tickets":4,"effect":""},{"name":"Gorillaz","fame":5,"vp":7,"campCost":1,"securityCost":2,"cateringCost":2,"portalooCost":2,"genre":"Indie","tickets":5,"effect":"Gain 1VP per existing campsite in your festival."},{"name":"The Cure","fame":5,"vp":7,"campCost":1,"securityCost":2,"cateringCost":1,"portalooCost":3,"genre":"Indie, Rock","tickets":5,"effect":"Immediately book another Indie or Rock artist."}];

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const HEX_SIZE = 22;
const GRID_COLS = 13;
const GRID_ROWS = 13;
const AMENITY_TYPES = ["campsite", "portaloo", "security", "catering"];
const AMENITY_LABELS = { campsite: "Campsite", portaloo: "Portaloo", security: "Security", catering: "Catering Van" };
const AMENITY_ICONS = { campsite: "⛺", portaloo: "🚻", security: "💪", catering: "🍔" };
const AMENITY_COLORS = { campsite: "#4ade80", portaloo: "#60a5fa", security: "#f87171", catering: "#fbbf24" };
const DICE_OPTIONS = ["campsite", "portaloo", "security", "catering", "catering_or_portaloo", "security_or_campsite"];
const TURNS_PER_YEAR = { 1: 6, 2: 7, 3: 8, 4: 9 };
const FAME_MAX = 5;
const GENRE_COLORS = { Pop: "#ec4899", Rock: "#ef4444", Electronic: "#94a3b8", "Hip Hop": "#f97316", Indie: "#22c55e" };
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
  { name: "Local Talent", desc: "Give a local artist their first big break", req: "Play a 0 Fame artist as a headliner", rewards: { 1: 5, 2: 5, 3: 10 }, tierRewards: null },
  { name: "Popstars", desc: "Go all-in on Pop music", req: "Feature a full Pop lineup", rewards: { 1: 4, 2: 5, 3: 3 }, tierRewards: null },
  { name: "Rock On", desc: "Go all-in on Rock music", req: "Feature a full Rock lineup", rewards: { 1: 4, 2: 5, 3: 3 }, tierRewards: null },
  { name: "Disc Jockeys", desc: "Go all-in on Electronic music", req: "Feature a full Electronic lineup", rewards: { 1: 4, 2: 5, 3: 3 }, tierRewards: null },
  { name: "Fire Verses", desc: "Go all-in on Hip Hop music", req: "Feature a full Hip Hop lineup", rewards: { 1: 4, 2: 5, 3: 3 }, tierRewards: null },
  { name: "Indiependent", desc: "Go all-in on Indie music", req: "Feature a full Indie lineup", rewards: { 1: 4, 2: 5, 3: 3 }, tierRewards: null },
  { name: "Eclectic", desc: "Feature different genres", req: "Lineups with at least 3 different genres", rewards: { 1: 4, 2: 4, 3: 3 }, tierRewards: null },
  { name: "Friends in Special Places", desc: "Let a special guest complete the lineup", req: "Finish a lineup with a special guest", rewards: null, tierRewards: { low: 4, mid: 8, high: 12 } },
];

const FAME_MULTIPLIER = { 0: 0.5, 1: 0.75, 2: 1, 3: 1.5, 4: 1.75, 5: 2 };

const ALL_COUNCIL_OBJECTIVES = [
  { id: "ticket_evaders", name: "Ticket Evaders", flavour: "The council are worried about people sneaking in.", req: "At least 2 security on the 2 outermost layers", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "toxic_waste", name: "Toxic Waste", flavour: "Locals are worried about strange smells.", req: "No portaloos on outside edge (min 2 portaloos)", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "put_a_lid", name: "Put a Lid on it", flavour: "Campers don't want to live next to a toilet.", req: "1 tile gap between portaloos and campsites", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "crowd_control", name: "Crowd Control", flavour: "People won't come if they don't feel safe.", req: "2 Security next to each stage", benefit: "+3 tickets/campsite", type: "per", per: "campsite", value: 3 },
  { id: "food_courts", name: "Food Courts", flavour: "Showcase local specialties.", req: "Group 3 catering vans together", benefit: "+1 Fame/3 catering", type: "fame_per", per: 3, amenity: "catering", value: 1 },
  { id: "local_breweries", name: "Local Breweries", flavour: "Attract local breweries.", req: "At least 2 catering beside a stage", benefit: "+3 tickets/catering", type: "per", per: "catering", value: 3 },
  { id: "groovin_circles", name: "Groovin' Circles", flavour: "The dance area will be cramped.", req: "Keep all tiles beside stage empty", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "sniffer_dogs", name: "Sniffer Dogs", flavour: "Stamp down on illegal substances.", req: "2 security beside each other (min 4)", benefit: "+1 VP/2 security", type: "vp_per", per: "security", divisor: 2, value: 1 },
  { id: "special_sauce", name: "Special Sauce", flavour: "Keep herbs and spices secret.", req: "Security and catering next to each other", benefit: "+1 VP/2 catering", type: "vp_per", per: "catering", divisor: 2, value: 1 },
  { id: "in_n_out", name: "In-N-Out", flavour: "Strategic food and toilets.", req: "Max 1 tile between portaloos and catering", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "quiet_camping", name: "Quiet Camping", flavour: "Campers should sleep well.", req: "Min 2 tile distance campsites to stages", benefit: "+1 VP/2 campsites", type: "vp_per", per: "campsite", divisor: 2, value: 1 },
  { id: "glamping", name: "Glamping", flavour: "Exclusive camping areas.", req: "Campsite and security next to each other", benefit: "+2 tickets/2 campsites", type: "ticket_per", per: "campsite", divisor: 2, value: 2 },
  { id: "luxury_loos", name: "Luxury Loos", flavour: "Locally grown lavender.", req: "Portaloos beside Security", benefit: "+3 tickets/portaloo", type: "per", per: "portaloo", value: 3 },
  { id: "number_one_fans", name: "Number One Fans", flavour: "More portaloos are better.", req: "Own more portaloos than stages", benefit: "+1 Fame/3 portaloos", type: "fame_per", per: 3, amenity: "portaloo", value: 1 },
  { id: "nimby", name: "NIMBY", flavour: "Keep the festival contained.", req: "Do not open new stages", benefit: "+1 Fame when declining", type: "special" },
  { id: "noise_complaints", name: "Noise Complaints", flavour: "Concern from neighbours.", req: "No amenities on outer edge (min 3)", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "multiple_entrances", name: "Multiple Entrances", flavour: "Crowd calming measures.", req: "Security at stage + security at edge in line", benefit: "+5 tickets", type: "flat", value: 5 },
  { id: "crowd_filtering", name: "Crowd Filtering", flavour: "Multiple exits for each stage.", req: "At least 2 security beside each stage", benefit: "+1 Fame/3 security", type: "fame_per", per: 3, amenity: "security", value: 1 },
  { id: "eat_local", name: "Eat Local", flavour: "Food close to camp.", req: "Catering and campsite next to each other", benefit: "+1 ticket/2 campsites", type: "ticket_per", per: "campsite", divisor: 2, value: 1 },
  { id: "thieves_night", name: "Thieves in the Night", flavour: "Worried about thieves.", req: "More security than campsites (min 2 sec)", benefit: "+3 tickets/security", type: "per", per: "security", value: 3 },
  { id: "meat_the_law", name: "Meat the Law", flavour: "Look after the catering vans.", req: "More security than catering (min 2 sec)", benefit: "+1 VP/2 security", type: "vp_per", per: "security", divisor: 2, value: 1 },
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

/** Evaluate if a council objective is active for a player's board state */
function isCouncilActive(obj, pd) {
  const am = pd.amenities || [];
  const stages = pd.stages || [];
  const count = (t) => am.filter(a => a.type === t).length;
  const ofType = (t) => am.filter(a => a.type === t);

  switch (obj.id) {
    case "ticket_evaders": {
      const secOnOuter = am.filter(a => a.type === "security" && (isEdgeHex(a.col, a.row) || getHexNeighbours(a.col, a.row).some(n => isEdgeHex(n.col, n.row)))).length;
      return count("security") >= 2 && secOnOuter >= 2;
    }
    case "toxic_waste": {
      if (count("portaloo") < 2) return false;
      return !ofType("portaloo").some(a => isEdgeHex(a.col, a.row));
    }
    case "put_a_lid": {
      if (count("portaloo") < 1 || count("campsite") < 1) return false;
      for (const p of ofType("portaloo")) for (const c of ofType("campsite")) if (areAdjacent(p.col, p.row, c.col, c.row)) return false;
      return true;
    }
    case "crowd_control": {
      if (count("security") < 2) return false;
      return stages.every(s => { const nb = getHexNeighbours(s.col, s.row); const adj = am.filter(a => a.type === "security" && nb.some(n => n.col === a.col && n.row === a.row)); return adj.length >= 2; });
    }
    case "food_courts": {
      if (count("catering") < 3) return false;
      for (const c of ofType("catering")) { const nb = getHexNeighbours(c.col, c.row); const adjCat = ofType("catering").filter(o => o !== c && nb.some(n => n.col === o.col && n.row === o.row)); if (adjCat.length >= 2) return true; }
      return false;
    }
    case "local_breweries": {
      if (count("catering") < 2) return false;
      return stages.some(s => { const stHexes = getStageHexes(s.col, s.row); const adj = ofType("catering").filter(a => stHexes.some(h => areAdjacent(a.col, a.row, h.col, h.row))); return adj.length >= 2; });
    }
    case "groovin_circles": {
      return stages.every(s => { const stHexes = getStageHexes(s.col, s.row); for (const h of stHexes) { const nb = getHexNeighbours(h.col, h.row); for (const n of nb) { if (stHexes.some(sh => sh.col === n.col && sh.row === n.row)) continue; if (am.some(a => a.col === n.col && a.row === n.row)) return false; } } return true; });
    }
    case "sniffer_dogs": {
      if (count("security") < 4) return false;
      const secs = ofType("security");
      return secs.some(s => secs.some(o => o !== s && areAdjacent(s.col, s.row, o.col, o.row)));
    }
    case "special_sauce": {
      return ofType("security").some(s => ofType("catering").some(c => areAdjacent(s.col, s.row, c.col, c.row)));
    }
    case "in_n_out": {
      if (count("portaloo") < 1 || count("catering") < 1) return false;
      for (const p of ofType("portaloo")) for (const c of ofType("catering")) if (hexDistance(p.col, p.row, c.col, c.row) <= 1) return true;
      return false; // actually <=1 means adjacent, let's use <=2 for "max 1 tile distance"
    }
    case "quiet_camping": {
      if (count("campsite") < 1) return false;
      return ofType("campsite").every(c => stages.every(s => hexDistance(c.col, c.row, s.col, s.row) >= 2));
    }
    case "glamping": {
      return ofType("campsite").some(c => ofType("security").some(s => areAdjacent(c.col, c.row, s.col, s.row)));
    }
    case "luxury_loos": {
      return ofType("portaloo").some(p => ofType("security").some(s => areAdjacent(p.col, p.row, s.col, s.row)));
    }
    case "number_one_fans": return count("portaloo") > stages.length;
    case "nimby": return true; // special: always "active" if they haven't opened stages
    case "noise_complaints": {
      if (am.length < 3) return false;
      return !am.some(a => isEdgeHex(a.col, a.row));
    }
    case "multiple_entrances": {
      return stages.some(s => { const stHexes = getStageHexes(s.col, s.row); const adjSec = ofType("security").filter(a => stHexes.some(h => areAdjacent(a.col, a.row, h.col, h.row))); const edgeSec = ofType("security").filter(a => isEdgeHex(a.col, a.row)); return adjSec.length >= 1 && edgeSec.length >= 1; });
    }
    case "crowd_filtering": {
      if (count("security") < 2) return false;
      return stages.every(s => { const stHexes = getStageHexes(s.col, s.row); const adj = ofType("security").filter(a => stHexes.some(h => areAdjacent(a.col, a.row, h.col, h.row))); return adj.length >= 2; });
    }
    case "eat_local": return ofType("catering").some(c => ofType("campsite").some(s => areAdjacent(c.col, c.row, s.col, s.row)));
    case "thieves_night": return count("security") >= 2 && count("security") > count("campsite");
    case "meat_the_law": return count("security") >= 2 && count("security") > count("catering");
    default: return false;
  }
}

/** Calculate passive benefit of an active council objective */
function calcCouncilBenefit(obj, pd) {
  const am = pd.amenities || [];
  const count = (t) => am.filter(a => a.type === t).length;
  if (!obj.type || obj.type === "special") return { tickets: 0, vp: 0, fame: 0 };
  if (obj.type === "flat") return { tickets: obj.value, vp: 0, fame: 0 };
  if (obj.type === "per") return { tickets: count(obj.per) * obj.value, vp: 0, fame: 0 };
  if (obj.type === "ticket_per") return { tickets: Math.floor(count(obj.per) / obj.divisor) * obj.value, vp: 0, fame: 0 };
  if (obj.type === "vp_per") return { tickets: 0, vp: Math.floor(count(obj.per) / obj.divisor) * obj.value, fame: 0 };
  if (obj.type === "fame_per") return { tickets: 0, vp: 0, fame: Math.floor(count(obj.amenity) / obj.per) * obj.value };
  return { tickets: 0, vp: 0, fame: 0 };
}
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
      {isCtr && <text x={x} y={y + 2} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">🎤</text>}
      {am && !isMF && <text x={x} y={y + 5} textAnchor="middle" fontSize="11">{AMENITY_ICONS[am.type]}</text>}
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
      {showCost && <div style={{ fontSize: 8, opacity: 0.85, marginTop: 2 }}>
        {artist.campCost > 0 && <span>⛺{artist.campCost} </span>}
        {artist.securityCost > 0 && <span>💪{artist.securityCost} </span>}
        {artist.cateringCost > 0 && <span>🍔{artist.cateringCost} </span>}
        {artist.portalooCost > 0 && <span>🚻{artist.portalooCost}</span>}
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
        const label = isC ? (d === "catering_or_portaloo" ? "🍔 OR 🚻" : "💪 OR ⛺") : AMENITY_ICONS[d];
        const sub = isC ? (d === "catering_or_portaloo" ? "Van / Loo" : "Sec / Camp") : AMENITY_LABELS[d];
        return <button key={i} onClick={() => !disabled && onPick(i, d)} disabled={disabled} style={{
          width: 72, height: 80, borderRadius: 12, border: "2px solid #7c3aed",
          background: "linear-gradient(135deg, #1e1b4b, #312e81)", color: "#e9d5ff",
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
function aiPickDie(dice, pd) {
  const wanted = aiPickAmenityType(pd);
  // Find a die that gives the wanted type
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === wanted) return { idx: i, type: wanted };
    if (dice[i] === "catering_or_portaloo" && (wanted === "catering" || wanted === "portaloo")) return { idx: i, type: wanted };
    if (dice[i] === "security_or_campsite" && (wanted === "security" || wanted === "campsite")) return { idx: i, type: wanted };
  }
  // Fallback: pick first non-choice die, or resolve a choice
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "catering_or_portaloo") return { idx: i, type: "catering" };
    if (dice[i] === "security_or_campsite") return { idx: i, type: "security" };
    return { idx: i, type: dice[i] };
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

  // Score each option
  let bookScore = 0, amenityScore = 0, reserveScore = 0;

  // Can we book anything?
  const bookable = artistPool.filter(a => canAffordArtist(a, pd));
  const handBookable = (pd.hand || []).filter(a => canAffordArtist(a, pd));
  if ((bookable.length > 0 || handBookable.length > 0) && openStages.length > 0) {
    const best = [...bookable, ...handBookable].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
    bookScore = 15 + (best ? best.vp * 2 + best.tickets : 0) + (year >= 3 ? 10 : 0);
  }

  // Amenity score: higher if we have few amenities
  amenityScore = Math.max(0, 8 - totalAmenities) * 3 + (counts.security < 2 ? 8 : 0) + (counts.campsite < 2 ? 6 : 0);

  // Reserve score: if we can't book but pool has good stuff
  if (openStages.length > 0) {
    const bestPool = [...artistPool].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
    reserveScore = bestPool ? (bestPool.vp + bestPool.tickets) * 1.5 : 0;
    if (bookable.length === 0 && handBookable.length === 0) reserveScore += 10;
  }

  // Add randomness
  bookScore += Math.random() * 5;
  amenityScore += Math.random() * 5;
  reserveScore += Math.random() * 5;

  if (bookScore >= amenityScore && bookScore >= reserveScore && (bookable.length > 0 || handBookable.length > 0) && openStages.length > 0) {
    // Book best available
    const allBookable = [...bookable.map((a, i) => ({ a, src: "pool", idx: artistPool.indexOf(a) })), ...handBookable.map((a, i) => ({ a, src: "hand", idx: (pd.hand || []).indexOf(a) }))];
    allBookable.sort((x, y) => (y.a.vp + y.a.tickets) - (x.a.vp + x.a.tickets));
    const pick = allBookable[0];
    const stageIdx = sa.findIndex(s => s.length < 3);
    return { action: "book", source: pick.src, artistIdx: pick.idx, stageIdx };
  }
  if (reserveScore > amenityScore && artistPool.length > 0) {
    // Reserve best from pool
    const scored = artistPool.map((a, i) => ({ i, s: a.vp * 2 + a.tickets + (a.fame <= pd.fame ? 5 : 0) + Math.random() * 3 }));
    scored.sort((a, b) => b.s - a.s);
    return { action: "reserve", poolIdx: scored[0].i };
  }
  // Default: pick amenity
  return { action: "amenity" };
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
  const [selectedDie, setSelectedDie] = useState(null);
  const [choiceAmenity, setChoiceAmenity] = useState(null);
  const [placingAmenity, setPlacingAmenity] = useState(null);
  const [placingStage, setPlacingStage] = useState(false);
  const [movingFrom, setMovingFrom] = useState(null);
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
  const [showObjectives, setShowObjectives] = useState(false);
  const [showStageDetail, setShowStageDetail] = useState(null);

  // Council objectives
  const [councilDeck, setCouncilDeck] = useState([]);
  const [playerCouncils, setPlayerCouncils] = useState({}); // { playerId: [{ obj, active, fameGranted }] }
  const [showCouncilFame, setShowCouncilFame] = useState(null); // { name, festival } for notification
  const [viewingPlayerId, setViewingPlayerId] = useState(null);

  // Events system
  const [eventDeck, setEventDeck] = useState([]);
  const [globalEvents, setGlobalEvents] = useState([]); // 3 drawn at year start — { event, revealed: false }
  const [playerPersonalEvents, setPlayerPersonalEvents] = useState({}); // { pid: [event] }
  const [eventPhasePlayer, setEventPhasePlayer] = useState(0); // which player is resolving events
  const [eventPhaseResults, setEventPhaseResults] = useState(null); // resolved events for display // null = current player, or another player's id // { stageIdx, playerId }

  // Logging
  const addLog = useCallback((label, text) => setGameLog(p => [...p, { label, text, type: "entry" }]), []);
  const addLogH = useCallback((text, ht) => setGameLog(p => [...p, { text, type: "header", ht: ht || "turn" }]), []);

  // Derived
  const currentPlayerId = turnOrder[currentPlayerIdx];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentPD = playerData[currentPlayerId] || {};
  const noTurnsLeft = currentPlayerId !== undefined && (turnsLeft[currentPlayerId] || 0) <= 0;

  // ─── Ticket calc ───
  /** Compute effective fame for a player: stages + council fame bonuses + artist effects, capped at 5 */
  const calcFame = useCallback((pd, councils) => {
    let f = (pd.stages || []).length; // 1 fame per stage
    // Council fame bonuses
    (councils || []).forEach(co => {
      if (co.active && co.obj.type === "fame_per") {
        const b = calcCouncilBenefit(co.obj, pd);
        f += b.fame;
      }
    });
    // Base fame from effects (already stored in pd.baseFame from artist effects like +1 Fame)
    f += pd.baseFame || 0;
    return Math.min(FAME_MAX, f);
  }, []);

  const recalcTickets = useCallback(() => {
    setPlayerData(prev => {
      const next = { ...prev };
      for (const pid of Object.keys(next)) {
        const pd = next[pid];
        let t = pd.amenities.filter(a => a.type === "campsite").length * 5;
        (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets; }));
        t += pd.bonusTickets || 0;
        // Council ticket benefits
        const councils = playerCouncils[pid] || [];
        councils.forEach(co => {
          if (co.active) {
            const b = calcCouncilBenefit(co.obj, pd);
            t += b.tickets;
          }
        });
        // Compute fame
        const fame = calcFame(pd, councils);
        next[pid] = { ...pd, tickets: t, rawTickets: t, fame };
      }
      return next;
    });
  }, [playerCouncils, calcFame]);

  // ─── Deck management ───
  function drawFromDeck(count = 1) {
    let deck = [...artistDeck];
    let disc = [...discardPile];
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc); disc = [];
      }
      if (deck.length > 0) drawn.push(deck.pop());
    }
    setArtistDeck(deck); setDiscardPile(disc);
    return drawn;
  }

  function refillPool() {
    let deck = [...artistDeck]; let disc = [...discardPile]; let pool = [...artistPool];
    while (pool.length < 5) {
      if (deck.length === 0 && disc.length > 0) { deck = shuffle(disc); disc = []; }
      if (deck.length === 0) break;
      pool.push(deck.pop());
    }
    setArtistDeck(deck); setDiscardPile(disc); setArtistPool(pool);
  }

  function refreshPool() {
    let disc = [...discardPile, ...artistPool];
    let deck = [...artistDeck];
    let pool = [];
    while (pool.length < 5) {
      if (deck.length === 0 && disc.length > 0) { deck = shuffle(disc); disc = []; }
      if (deck.length === 0) break;
      pool.push(deck.pop());
    }
    setArtistPool(pool); setArtistDeck(deck); setDiscardPile(disc);
  }

  // ─── Apply artist effects ───
  function applyEffect(artist, pid, times = 1) {
    const eff = (artist.effect || "").trim();
    if (!eff) return;
    for (let t = 0; t < times; t++) {
      const el = eff.toLowerCase();
      if (el.includes("+1 fame")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("Effect", `${artist.name}: +1 Fame`);
      }
      if (el.includes("+1 vp") || el.includes("+1vp")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 1 } }));
        addLog("Effect", `${artist.name}: +1 VP`);
      }
      if (el.includes("+1 security")) {
        addLog("Effect", `${artist.name}: +1 Security (place on board)`);
        // Simplified: auto-add security to amenity count conceptually — player should place, but for prototype:
        // We'll note it in log. Full placement would need sub-action flow.
      }
      if (el.includes("+1 amenity")) {
        addLog("Effect", `${artist.name}: +1 Amenity (player chooses type & places)`);
      }
      if (el.includes("+4 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 4 } }));
        addLog("Effect", `${artist.name}: +4 ticket sales`);
      }
      if (el.includes("+5 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 5 } }));
        addLog("Effect", `${artist.name}: +5 ticket sales`);
      }
      if (el.includes("+1 personal event") || el.includes("+1 negative event") || el.includes("+1 global event") || el.includes("+1 event")) {
        addLog("Effect", `${artist.name}: ${eff} (Events phase — earmarked)`);
      }
      if (el.includes("sign 1 artist") || el.includes("sign one artist") || el.includes("draw two artists")) {
        addLog("Effect", `${artist.name}: ${eff} (signing effect — earmarked for future)`);
      }
      if (el.includes("round end")) {
        addLog("Effect", `${artist.name}: ${eff} (triggers at round end)`);
      }
      if (el.includes("gain 1vp per existing campsite")) {
        const camps = (playerData[pid]?.amenities || []).filter(a => a.type === "campsite").length;
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + camps } }));
        addLog("Effect", `${artist.name}: +${camps} VP (1 per campsite)`);
      }
      if (el.includes("gain 2 vp whenever you play a security")) {
        addLog("Effect", `${artist.name}: Gain 2 VP per security played this round (tracked)`);
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
      const isHeadliner = sa[stageIdx].length === 3;
      const isFullLineup = sa[stageIdx].length === 3;
      pd.stageArtists = sa;

      // Check first full lineup bonus
      if (isFullLineup && !firstFullLineup) {
        pd.bonusTickets = (pd.bonusTickets || 0) + 5;
        setFirstFullLineup(true);
        addLog("🎪 FIRST!", `${players.find(p => p.id === pid)?.festivalName} released the first full lineup! +5 tickets!`);
      }

      return { ...prev, [pid]: pd };
    });

    const pd = playerData[pid];
    const sa = pd.stageArtists || pd.stages.map(() => []);
    const slotCount = (sa[stageIdx] || []).length + 1;
    const isHeadliner = slotCount === 3;

    if (isHeadliner) {
      setShowHeadliner({ artist, festival: players.find(p => p.id === pid)?.festivalName });
      addLog("🌟 HEADLINER", `${artist.name} headlines at ${players.find(p => p.id === pid)?.festivalName}!`);
      applyEffect(artist, pid, 2);
    } else {
      applyEffect(artist, pid, 1);
    }
    addLog(players.find(p => p.id === pid)?.festivalName, `booked ${artist.name} to Stage ${stageIdx + 1}${isHeadliner ? " as HEADLINER!" : ""}`);
    recalcTickets();
  }

  // ─── Evaluate objectives for a player ───
  function evaluateObjective(obj, pd) {
    if (!obj) return 0;
    const sa = pd.stageArtists || [];
    let bonus = 0;
    const genreTarget = { Popstars: "Pop", "Rock On": "Rock", "Disc Jockeys": "Electronic", "Fire Verses": "Hip Hop", Indiependent: "Indie" };

    if (obj.name === "Local Talent") {
      // Each stage where headliner (3rd artist) has fame 0
      let count = 0;
      sa.forEach(s => { if (s.length === 3 && s[2].fame === 0) count++; });
      if (count >= 1) bonus += obj.rewards[1];
      if (count >= 2) bonus += obj.rewards[2];
      if (count >= 3) bonus += obj.rewards[3];
    } else if (genreTarget[obj.name]) {
      // Full lineup where all 3 share the target genre
      const g = genreTarget[obj.name];
      let count = 0;
      sa.forEach(s => { if (s.length === 3 && s.every(a => getGenres(a.genre).includes(g))) count++; });
      if (count >= 1) bonus += obj.rewards[1];
      if (count >= 2) bonus += obj.rewards[2];
      if (count >= 3) bonus += obj.rewards[3];
    } else if (obj.name === "Eclectic") {
      // Lineups with at least 3 different genres among the 3 artists
      let count = 0;
      sa.forEach(s => { if (s.length === 3) { const gs = new Set(); s.forEach(a => getGenres(a.genre).forEach(g => gs.add(g))); if (gs.size >= 3) count++; } });
      if (count >= 1) bonus += obj.rewards[1];
      if (count >= 2) bonus += obj.rewards[2];
      if (count >= 3) bonus += obj.rewards[3];
    } else if (obj.name === "Friends in Special Places") {
      // A lineup finished with a "special guest" — interpreted as headliner fame tiers
      sa.forEach(s => {
        if (s.length === 3) {
          const hl = s[2];
          if (hl.fame <= 1) bonus += obj.tierRewards.low;
          else if (hl.fame <= 3) bonus += obj.tierRewards.mid;
          else bonus += obj.tierRewards.high;
        }
      });
    }
    return bonus;
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
    const data = {}; players.forEach(p => { data[p.id] = { stages: [], amenities: [], fame: 0, baseFame: 0, vp: 0, tickets: 0, rawTickets: 0, setupAmenity: null, hand: [], stageArtists: [], bonusTickets: 0, stageNames: [], stageColors: [] }; });
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
    const objDeck = shuffle([...ALL_OBJECTIVES, ...ALL_OBJECTIVES]); // duplicates allowed but avoid same
    const assigned = {}; const usedNames = new Set();
    players.forEach(p => {
      const pick = objDeck.find(o => !usedNames.has(o.name));
      if (pick) { assigned[p.id] = pick; usedNames.add(pick.name); objDeck.splice(objDeck.indexOf(pick), 1); }
      else { assigned[p.id] = objDeck.pop(); } // fallback if more players than unique objectives
    });
    setPlayerObjectives(assigned);
    setObjectiveDeck(objDeck); setTrendingObjective(null);
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
    setYear(1); setDice(rollDice()); setPhase("game"); setShowTurnStart(true); setTurnAction(null); setActionTaken(false);
    // Init events
    const eDeck = shuffle([...ALL_EVENTS]);
    const ge = eDeck.splice(0, 3).map(e => ({ event: e, revealed: false }));
    setEventDeck(eDeck); setGlobalEvents(ge);
    const pe = {}; players.forEach(p => { pe[p.id] = []; }); setPlayerPersonalEvents(pe);
    addLog("🎭 Events", `3 global events drawn: ${ge.map(g => g.event.color === "green" ? "🟢 Positive" : "🔴 Negative").join(", ")}`);
    // Draw first trending objective
    const od = [...objectiveDeck]; const trend = od.length > 0 ? od.pop() : ALL_OBJECTIVES[Math.floor(Math.random() * ALL_OBJECTIVES.length)];
    setTrendingObjective(trend); setObjectiveDeck(od);
    addLog("📢 Trending", `Year 1 Trending Objective: ${trend.name} — ${trend.desc}`);
    recalcTickets(); addLogH("Year 1 Begins", "year"); addLogH(`${players[0]?.festivalName}'s Turn`, "turn");
  };

  useEffect(() => { if (phase === "game") recalcTickets(); }, [phase, recalcTickets]);

  // ═══════════════════════════════════════════════════════════
  // AI AUTO-PLAY
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const isCurrentAI = () => {
      if (phase === "setup") return players[setupIndex]?.isAI;
      if (phase === "game") return currentPlayer?.isAI;
      return false;
    };
    if (!isCurrentAI()) return;

    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    let cancelled = false;

    const runAI = async () => {
      await delay(600);
      if (cancelled) return;

      // ─── SETUP PHASE AI ───
      if (phase === "setup") {
        const pid = players[setupIndex]?.id;
        if (setupStep === "viewCouncil") { confirmViewCouncil(); return; }
        if (setupStep === "viewObjective") { confirmViewObjective(); return; }
        if (setupStep === "draftArtist") {
          if (setupDraftOptions.length >= 2) {
            const picks = aiDraftSelect(setupDraftOptions);
            setSetupDraftSelected(picks);
            await delay(400);
            if (cancelled) return;
            confirmSetupDraft();
          }
          return;
        }
        if (setupStep === "pickAmenity") {
          const choice = aiPickSetupAmenity();
          setSetupSelectedAmenity(choice);
          await delay(300);
          if (cancelled) return;
          confirmSetupAmenity();
          return;
        }
        if (setupStep === "placeStage") {
          const pd = playerData[pid] || {};
          const pos = aiFindStagePlacement(pd);
          handleSetupHexClick(pos.col, pos.row);
          return;
        }
        if (setupStep === "placeAmenity") {
          const pd = playerData[pid] || {};
          const pos = aiFindPlacement(pd);
          handleSetupHexClick(pos.col, pos.row);
          return;
        }
        if (setupStep === "confirm") {
          confirmSetupPlacement();
          return;
        }
      }

      // ─── GAME PHASE AI ───
      if (phase === "game") {
        // Dismiss turn start popup
        if (showTurnStart) { setShowTurnStart(false); await delay(500); if (cancelled) return; }
        // Dismiss headliner popup
        if (showHeadliner) { setShowHeadliner(null); await delay(300); if (cancelled) return; }
        // Dismiss council fame popup
        if (showCouncilFame) { setShowCouncilFame(null); await delay(300); if (cancelled) return; }

        if (noTurnsLeft || actionTaken) {
          endTurn();
          return;
        }

        const pd = playerData[currentPlayerId] || {};
        const decision = aiDecideTurn(pd, artistPool, dice, year);
        addLog("🤖 AI", `${currentPlayer?.festivalName} is thinking...`);
        await delay(500);
        if (cancelled) return;

        if (decision.action === "book") {
          const { source, artistIdx, stageIdx } = decision;
          if (source === "pool") {
            handleBookFromPool(artistIdx);
            await delay(400);
            if (cancelled) return;
            handleStageSelect(stageIdx);
          } else {
            handleBookFromHand(artistIdx);
            await delay(400);
            if (cancelled) return;
            handleStageSelect(stageIdx);
          }
          await delay(500);
          if (cancelled) return;
          endTurn();
          return;
        }
        if (decision.action === "reserve") {
          handleReserveFromPool(decision.poolIdx);
          await delay(500);
          if (cancelled) return;
          endTurn();
          return;
        }
        // Default: pick amenity
        handlePickAmenity();
        await delay(300);
        if (cancelled) return;
        const currentDice = dice.length > 0 ? dice : rollDice();
        const pick = aiPickDie(currentDice, pd);
        // Handle the die pick
        const dieVal = currentDice[pick.idx];
        if (dieVal === "catering_or_portaloo" || dieVal === "security_or_campsite") {
          handleDiePick(pick.idx, dieVal);
          await delay(300);
          if (cancelled) return;
          handleChoiceSelect(pick.type);
        } else {
          handleDiePick(pick.idx, dieVal);
        }
        await delay(400);
        if (cancelled) return;
        // Place the amenity
        const updPd = playerData[currentPlayerId] || {};
        const placement = aiFindPlacement(updPd);
        handleGameHexClick(placement.col, placement.row);
        await delay(400);
        if (cancelled) return;
        endTurn();
      }
    };

    runAI();
    return () => { cancelled = true; };
  });

  // ═══════════════════════════════════════════════════════════
  // TURN ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handlePickAmenity = () => { setTurnAction("pickAmenity"); if (dice.length === 0) setDice(rollDice()); };
  const handleDiePick = (idx, dv) => {
    if (dv === "catering_or_portaloo" || dv === "security_or_campsite") { setSelectedDie(idx); setChoiceAmenity(dv); }
    else { const nd = [...dice]; nd.splice(idx, 1); setDice(nd); setPlacingAmenity(dv); setSelectedDie(null); setChoiceAmenity(null); }
  };
  const handleChoiceSelect = (type) => { const nd = [...dice]; nd.splice(selectedDie, 1); setDice(nd); setPlacingAmenity(type); setSelectedDie(null); setChoiceAmenity(null); };
  const handleRerollDice = () => { setDice(rollDice()); addLog("Dice", "Rerolled all amenity dice"); };
  const handleMoveAmenity = () => { setTurnAction("moveAmenity"); setMovingFrom(null); };
  const handleArtistAction = () => { setTurnAction("artist"); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null); };

  const handleGameHexClick = (col, row) => {
    if (actionTaken) return;
    if (turnAction === "pickAmenity" && placingAmenity) {
      if (isOnStage(col, row, currentPD.stages) || currentPD.amenities.some(a => a.col === col && a.row === row)) return;
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: [...p[currentPlayerId].amenities, { col, row, type: placingAmenity }] } }));
      addLog(currentPlayer.festivalName, `placed ${AMENITY_LABELS[placingAmenity]} at (${col},${row})`);
      setPlacingAmenity(null); setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); recalcTickets();
    } else if (turnAction === "moveAmenity") {
      if (!movingFrom) { const am = currentPD.amenities.find(a => a.col === col && a.row === row); if (am) setMovingFrom({ col, row, type: am.type }); }
      else {
        if (isOnStage(col, row, currentPD.stages) || currentPD.amenities.some(a => a.col === col && a.row === row && !(a.col === movingFrom.col && a.row === movingFrom.row))) return;
        setPlayerData(p => { const na = p[currentPlayerId].amenities.filter(a => !(a.col === movingFrom.col && a.row === movingFrom.row)); na.push({ col, row, type: movingFrom.type }); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], amenities: na } }; });
        addLog(currentPlayer.festivalName, `moved ${AMENITY_LABELS[movingFrom.type]} to (${col},${row})`);
        setMovingFrom(null); setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); recalcTickets();
      }
    }
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
    if (!canAffordArtist(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "hand", handIdx: idx }); setArtistAction("pickStage");
  };
  const handleReserveFromPool = (idx) => {
    const artist = artistPool[idx];
    const newPool = [...artistPool]; newPool.splice(idx, 1); setArtistPool(newPool);
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, artist] } }));
    addLog(currentPlayer.festivalName, `reserved ${artist.name} from pool`);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    // Refill empty slot (not a full refresh)
    setTimeout(() => refillPool(), 100);
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
    setDeckDrawnCard(null); setDeckCardRevealed(false);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
  };
  const handleStageSelect = (stageIdx) => {
    if (!selectedArtist) return;
    const { artist, source, poolIdx, handIdx } = selectedArtist;
    // Remove from source
    if (source === "pool") {
      const newPool = [...artistPool]; newPool.splice(poolIdx, 1); setArtistPool(newPool);
      // Full refresh since booked from pool
      setTimeout(() => refreshPool(), 100);
    } else if (source === "hand") {
      setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(handIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
    }
    bookArtistToStage(artist, stageIdx, currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null);
  };

  // ═══════════════════════════════════════════════════════════
  // END TURN / ROUND END
  // ═══════════════════════════════════════════════════════════
  const endTurn = () => {
    addLog(currentPlayer?.festivalName || "?", "ended their turn");
    setTurnAction(null); setPlacingAmenity(null); setMovingFrom(null); setSelectedDie(null); setChoiceAmenity(null); setActionTaken(false); setArtistAction(null); setSelectedArtist(null); setShowHand(false); setDeckDrawnCard(null); setDeckCardRevealed(false); setViewingPlayerId(null);

    // Evaluate council objectives for current player before moving on
    evaluateCouncils(currentPlayerId);

    const findNext = () => {
      for (let i = currentPlayerIdx + 1; i < turnOrder.length; i++) if (turnsLeft[turnOrder[i]] > 0) return i;
      for (let i = 0; i < turnOrder.length; i++) if (turnsLeft[turnOrder[i]] > 0) return i;
      return -1;
    };
    const ni = findNext();
    if (ni < 0) { beginEventPhase(); return; }

    setCurrentPlayerIdx(ni);
    const np = players.find(p => p.id === turnOrder[ni]);
    addLogH(`${np?.festivalName || "?"}'s Turn`, "turn");
    setShowTurnStart(true);
  };

  /** Evaluate all council objectives for a player, update active states, grant first-time fame */
  function evaluateCouncils(pid) {
    const pd = playerData[pid];
    if (!pd) return;
    const councils = playerCouncils[pid] || [];
    let fameNotif = null;
    const updated = councils.map(co => {
      const wasActive = co.active;
      const nowActive = isCouncilActive(co.obj, pd);
      let fameGranted = co.fameGranted;
      if (nowActive && !wasActive && !fameGranted) {
        // First time completing this objective — +1 fame for this round
        fameGranted = true;
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: (p[pid].baseFame || 0) + 1 } }));
        fameNotif = co.obj.name;
        addLog("🔥 Council Fame", `${players.find(p => p.id === pid)?.festivalName} completed "${co.obj.name}" — +1 Fame!`);
      }
      return { ...co, active: nowActive, fameGranted };
    });
    setPlayerCouncils(prev => ({ ...prev, [pid]: updated }));
    if (fameNotif) {
      setShowCouncilFame({ name: fameNotif, festival: players.find(p => p.id === pid)?.festivalName });
    }
    recalcTickets();
  }

  /** Start the events phase — resolve events for each player */
  const beginEventPhase = () => {
    addLogH(`Year ${year} — Events Phase`, "round");
    // Resolve events for all players
    const results = {};
    players.forEach(p => {
      const pd = playerData[p.id];
      const secCount = (pd.amenities || []).filter(a => a.type === "security").length;
      // Gather all events: global + personal
      const allEvts = [
        ...globalEvents.map(g => g.event),
        ...(playerPersonalEvents[p.id] || [])
      ];
      // Separate by type, check conditions
      const positive = allEvts.filter(e => e.color === "green" && eventConditionMet(e, pd));
      const negativeAll = allEvts.filter(e => e.color === "red" && eventConditionMet(e, pd));
      // Security blocks negative events (1 security = 1 blocked)
      const blocked = negativeAll.slice(0, secCount);
      const negative = negativeAll.slice(secCount);
      results[p.id] = { positive, negative, blocked, secCount, totalNeg: negativeAll.length };
    });
    setEventPhaseResults(results);
    setEventPhasePlayer(0);
    setPhase("events");
  };

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
    // Apply events for current player
    const pid = players[eventPhasePlayer]?.id;
    if (pid !== undefined) applyEventsForPlayer(pid);
    if (eventPhasePlayer < players.length - 1) {
      setEventPhasePlayer(eventPhasePlayer + 1);
    } else {
      recalcTickets();
      beginRoundEnd();
    }
  };

  const beginRoundEnd = () => {
    // Evaluate councils one last time for all players
    players.forEach(p => evaluateCouncils(p.id));

    // Evaluate artist objectives and add bonus tickets
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        let objTickets = 0;
        const personalObj = playerObjectives[p.id];
        if (personalObj) objTickets += evaluateObjective(personalObj, pd);
        if (trendingObjective) objTickets += evaluateObjective(trendingObjective, pd);
        if (objTickets > 0) addLog(p.festivalName, `earned +${objTickets} tickets from artist objectives`);
        next[p.id] = { ...pd, bonusTickets: (pd.bonusTickets || 0) + objTickets };
      }
      return next;
    });

    setTimeout(() => {
      recalcTickets();
      setTimeout(() => {
        // Apply fame multiplier and snapshot
        const nat = { ...allTickets };
        setPlayerData(prev => {
          const next = { ...prev };
          for (const p of players) {
            let vpBonus = 0; const pd = next[p.id];
            const rawT = pd.tickets || 0;
            const mult = FAME_MULTIPLIER[Math.min(5, pd.fame || 0)] || 1;
            const fameT = Math.floor(rawT * mult);
            // Council VP bonuses
            let councilVP = 0;
            (playerCouncils[p.id] || []).forEach(co => {
              if (co.active) {
                const b = calcCouncilBenefit(co.obj, pd);
                councilVP += b.vp;
              }
            });
            vpBonus += councilVP;
            vpBonus += Math.floor(fameT / 10);
            // Round-end artist effects
            (pd.stageArtists || []).forEach((sa, si) => sa.forEach((a, ai) => {
              const eff = (a.effect || "").toLowerCase(); const isHL = ai === 2; const times = isHL ? 2 : 1;
              for (let t = 0; t < times; t++) {
                if (eff.includes("round end: 5 vp")) vpBonus += 5;
                if (eff.includes("round end: 1 vp / fame")) vpBonus += (pd.fame || 0);
                if (eff.includes("round end: 2 vp / rock headliner")) { vpBonus += 2 * (pd.stageArtists || []).filter(s => s.length === 3 && getGenres(s[2].genre).includes("Rock")).length; }
                if (eff.includes("round end: 2 vp / unique genres")) { const gs = new Set(); (pd.stageArtists || []).forEach(s => s.forEach(ar => getGenres(ar.genre).forEach(g => gs.add(g)))); vpBonus += 2 * gs.size; }
              }
            }));
            if (!nat[p.id]) nat[p.id] = {};
            nat[p.id][year] = { raw: rawT, fame: pd.fame, mult, final: fameT };
            addLog(p.festivalName, `Pre-fame: ${rawT} 🎟️ × ${mult} (Fame ${pd.fame}) = ${fameT} 🎟️`);
            next[p.id] = { ...pd, tickets: fameT, rawTickets: rawT, vp: (pd.vp || 0) + vpBonus };
          }
          return next;
        });
        setAllTickets(nat);
        setRevealIndex(0); setLeaderboardRevealed(false); setPhase("roundEnd"); addLogH(`Year ${year} — Round End`, "round");
      }, 50);
    }, 50);
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
    // Clear all stages: move booked artists to discard pile, reset bonus tickets
    let newDiscard = [...discardPile];
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        const allBooked = (pd.stageArtists || []).flat();
        newDiscard = [...newDiscard, ...allBooked];
        const emptyStages = (pd.stages || []).map(() => []);
        next[p.id] = { ...pd, stageArtists: emptyStages, bonusTickets: 0 };
      }
      return next;
    });
    setDiscardPile(newDiscard);
    addLog("🔄 New Year", "All stages cleared — artists moved to discard pile");

    // Deal new council objectives to players who had ALL councils active at end of previous year
    const cd = [...councilDeck];
    players.forEach(p => {
      const councils = playerCouncils[p.id] || [];
      if (councils.length > 0 && councils.every(c => c.active)) {
        if (cd.length > 0) {
          const newObj = cd.pop();
          setPlayerCouncils(prev => ({ ...prev, [p.id]: [...(prev[p.id] || []), { obj: newObj, active: false, fameGranted: false }] }));
          addLog("📋 Council", `${p.festivalName} completed all council objectives last year — new objective: ${newObj.name}`);
        }
      }
      // Reset fameGranted for the new year so first-time fame can trigger again for new objectives
    });
    setCouncilDeck(cd);

    const sorted = [...players].sort((a, b) => (allTickets[a.id]?.[year] || 0) - (allTickets[b.id]?.[year] || 0));
    const no = sorted.map(p => p.id); setTurnOrder(no); setCurrentPlayerIdx(0);
    const tl = {}; no.forEach(id => { tl[id] = TURNS_PER_YEAR[ny]; }); setTurnsLeft(tl);
    setDice(rollDice()); setPhase("game"); setShowTurnStart(true); setTurnAction(null); setActionTaken(false);
    // Draw 3 new global events for this year
    let eDk = [...eventDeck];
    if (eDk.length < 3) eDk = shuffle([...ALL_EVENTS]); // reshuffle if low
    const newGe = eDk.splice(0, 3).map(e => ({ event: e, revealed: false }));
    setEventDeck(eDk); setGlobalEvents(newGe);
    const pe = {}; players.forEach(p => { pe[p.id] = []; }); setPlayerPersonalEvents(pe);
    addLog("🎭 Events", `3 global events drawn: ${newGe.map(g => g.event.color === "green" ? "🟢 Positive" : "🔴 Negative").join(", ")}`);
    // Draw new trending objective
    const od = [...objectiveDeck]; const trend = od.length > 0 ? od.pop() : ALL_OBJECTIVES[Math.floor(Math.random() * ALL_OBJECTIVES.length)];
    setTrendingObjective(trend); setObjectiveDeck(od);
    addLog("📢 Trending", `Year ${ny} Trending Objective: ${trend.name} — ${trend.desc}`);
    recalcTickets(); addLogH(`Year ${ny} Begins`, "year");
    const fp = players.find(p => p.id === no[0]); if (fp) addLogH(`${fp.festivalName}'s Turn`, "turn");
  };

  const winner = useMemo(() => {
    if (phase !== "gameOver") return null;
    return [...players].sort((a, b) => { const vd = (playerData[b.id]?.vp || 0) - (playerData[a.id]?.vp || 0); if (vd !== 0) return vd; return Object.values(allTickets[b.id] || {}).reduce((s, v) => s + v, 0) - Object.values(allTickets[a.id] || {}).reduce((s, v) => s + v, 0); })[0];
  }, [phase, players, playerData, allTickets]);

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════
  const CS = { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflow: "hidden" };
  const card = { background: "rgba(15,14,26,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: 24, backdropFilter: "blur(10px)" };
  const bp = { padding: "10px 24px", borderRadius: 10, border: "none", fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", cursor: "pointer", fontSize: 14, transition: "all 0.2s" };
  const bs = { ...bp, background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed" };
  const bd = { ...bp, background: "linear-gradient(135deg, #dc2626, #b91c1c)" };
  const logBtn = <button onClick={() => setShowLog(!showLog)} style={{ position: "fixed", top: 16, right: 16, zIndex: 999, padding: "8px 16px", borderRadius: 10, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>📜 Log</button>;
  const discardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowDiscard(true)} style={{ position: "fixed", top: 16, right: showLog ? 384 : 80, zIndex: 999, padding: "8px 16px", borderRadius: 10, border: "1px solid #6b7280", background: "rgba(107,114,128,0.2)", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🗑️ Discard</button> : null;
  const anim = <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes headlinerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } } @keyframes affordPulse { 0%,100% { box-shadow: 0 0 4px rgba(251,191,36,0.3); } 50% { box-shadow: 0 0 16px rgba(251,191,36,0.7); } } .obj-hover-parent:hover .obj-hover-tip { display: block !important; }`}</style>;

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
              <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 8 }}>First time completed: +1 🔥 Fame for the round!</p>
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
              {obj.rewards && <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 11 }}>1 stage: +{obj.rewards[1]} 🎟️</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 11 }}>2 stages: +{obj.rewards[2]} 🎟️</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 11 }}>3 stages: +{obj.rewards[3]} 🎟️</span>
              </div>}
              {obj.tierRewards && <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 11 }}>0-1 Fame HL: +{obj.tierRewards.low} 🎟️</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 11 }}>2-3 Fame HL: +{obj.tierRewards.mid} 🎟️</span>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 11 }}>4-5 Fame HL: +{obj.tierRewards.high} 🎟️</span>
              </div>}
            </div>
            <button onClick={confirmViewObjective} style={{ ...bp, width: "100%" }}>Got it! Continue to Draft →</button>
          </div> : null;
        })()}
        {setupStep === "draftArtist" && <div style={{ ...card, maxWidth: 700, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 8 }}>Draft your starting artists</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>Choose <strong style={{ color: "#fbbf24" }}>2</strong> of these 4 artists for your hand. The rest go back into the deck.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {setupDraftOptions.map((a, i) => <ArtistCard key={i} artist={a} showCost selected={(setupDraftSelected || []).includes(i)} onClick={() => toggleDraftSelection(i)} />)}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>{(setupDraftSelected || []).length}/2 selected</p>
          <button onClick={confirmSetupDraft} disabled={(setupDraftSelected || []).length !== 2} style={{ ...bp, width: "100%", opacity: (setupDraftSelected || []).length === 2 ? 1 : 0.4 }}>Draft 2 Artists →</button>
        </div>}
        {setupStep === "pickAmenity" && <div style={{ ...card, maxWidth: 480, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 16 }}>Choose your starting amenity</h3>
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
      {showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowHeadliner(null)}>
        <div style={{ textAlign: "center", animation: "headlinerPulse 1s infinite" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟🎤🌟</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24", margin: "0 0 8px" }}>HEADLINER!</h1>
          <h2 style={{ fontSize: 28, color: "#e9d5ff", margin: "0 0 8px" }}>{showHeadliner.artist.name}</h2>
          <p style={{ color: "#c4b5fd", fontSize: 16 }}>Headlines at {showHeadliner.festival}!</p>
          <p style={{ color: "#fbbf24", fontSize: 14, marginTop: 8 }}>Effect triggers TWICE! ✨✨</p>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 16 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Stage detail popup */}
      {showStageDetail && (() => {
        const sd = showStageDetail;
        const pd = playerData[sd.playerId] || {};
        const sa = (pd.stageArtists || [])[sd.stageIdx] || [];
        const sName = (pd.stageNames || [])[sd.stageIdx] || `Stage ${sd.stageIdx + 1}`;
        const sColor = (pd.stageColors || [])[sd.stageIdx] || "#7c3aed";
        const totalTickets = sa.reduce((s, a) => s + a.tickets, 0);
        const totalVP = sa.reduce((s, a) => s + a.vp, 0);
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowStageDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: `2px solid ${sColor}`, borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", textAlign: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: sColor, margin: "0 auto 8px" }} />
            <h2 style={{ color: sColor, fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{sName}</h2>
            <p style={{ color: "#8b5cf6", fontSize: 12, margin: "0 0 16px" }}>{sa.length === 3 ? "Full Lineup! 🎉" : `${sa.length}/3 artists booked`}</p>
            {sa.length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>No artists booked yet.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {sa.map((a, ai) => {
                const isHL = ai === 2;
                return <div key={ai} style={{ padding: 12, borderRadius: 12, background: genreGradient(a.genre), color: "#fff", textAlign: "left", position: "relative", border: isHL ? "2px solid #fbbf24" : "2px solid transparent" }}>
                  {isHL && <div style={{ position: "absolute", top: -8, right: 10, background: "#fbbf24", color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 8, textTransform: "uppercase" }}>⭐ Headliner</div>}
                  <div style={{ fontWeight: 800, fontSize: 15, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{a.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{a.genre} • 🔥 Fame {a.fame}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12 }}>
                    <span>🎟️ {a.tickets} tickets</span>
                    <span>⭐ {a.vp} VP</span>
                  </div>
                  {a.effect && <div style={{ fontSize: 10, fontStyle: "italic", marginTop: 4, opacity: 0.9 }}>✨ {a.effect}{isHL ? " (×2)" : ""}</div>}
                </div>;
              })}
            </div>
            {sa.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "10px 0", borderTop: "1px solid #2a2a4a" }}>
              <span style={{ color: "#e9d5ff", fontSize: 14 }}>🎟️ Total: <strong style={{ color: "#fbbf24" }}>{totalTickets}</strong> tickets</span>
              <span style={{ color: "#e9d5ff", fontSize: 14 }}>⭐ Total: <strong style={{ color: "#fbbf24" }}>{totalVP}</strong> VP</span>
            </div>}
            <button onClick={() => setShowStageDetail(null)} style={{ ...bp, marginTop: 12 }}>Close</button>
          </div>
        </div>;
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
      {/* Turn start popup */}
      {showTurnStart && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 440, animation: "fadeSlideIn 0.3s" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, margin: "0 0 8px" }}>🎪 {currentPlayer?.festivalName}</h2>
          <p style={{ color: "#c4b5fd", fontSize: 16 }}>Year {year} — <strong style={{ color: "#fbbf24" }}>{turnsLeft[currentPlayerId]}</strong> turns left</p>
          {trendingObjective && <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 1 }}>📢 Trending: {trendingObjective.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{trendingObjective.req}</div>
          </div>}
          {playerObjectives[currentPlayerId] && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 1 }}>🎯 Your Objective: {playerObjectives[currentPlayerId].name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{playerObjectives[currentPlayerId].req}</div>
          </div>}
          <button onClick={() => setShowTurnStart(false)} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      {/* Choice popup for OR dice */}
      {choiceAmenity && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 360 }}><h3 style={{ color: "#c4b5fd", marginBottom: 16 }}>Choose one:</h3>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {choiceAmenity === "catering_or_portaloo" ? <><button onClick={() => handleChoiceSelect("catering")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🍔<br /><span style={{ fontSize: 12 }}>Catering</span></button><button onClick={() => handleChoiceSelect("portaloo")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🚻<br /><span style={{ fontSize: 12 }}>Portaloo</span></button></> : <><button onClick={() => handleChoiceSelect("security")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>💪<br /><span style={{ fontSize: 12 }}>Security</span></button><button onClick={() => handleChoiceSelect("campsite")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>⛺<br /><span style={{ fontSize: 12 }}>Campsite</span></button></>}
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
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>{AMENITY_TYPES.map(t => { const c = (pd.amenities || []).filter(a => a.type === t).length; return c > 0 ? <span key={t} style={{ marginRight: 6 }}>{AMENITY_ICONS[t]}×{c}</span> : null; })}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🎤 {(pd.stageArtists || []).flat().length} artists • 🃏 {(pd.hand || []).length} in hand</div>
            </div>); })}
          <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "rgba(124,58,237,0.1)", fontSize: 11, color: "#8b5cf6" }}>
            📦 Deck: {artistDeck.length} • 🗑️ Discard: {discardPile.length}
          </div>
          {/* Trending Objective */}
          {trendingObjective && <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", position: "relative", cursor: "help" }} className="obj-hover-parent">
            <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>📢 Trending</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#e9d5ff" }}>{trendingObjective.name}</div>
            <div className="obj-hover-tip" style={{ position: "absolute", left: "105%", top: 0, width: 240, padding: 12, borderRadius: 12, background: "#1a1a2e", border: "1px solid #fbbf24", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 100, display: "none", textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>{trendingObjective.name}</div>
              <div style={{ fontSize: 10, color: "#e9d5ff", marginBottom: 6 }}>{trendingObjective.desc}</div>
              <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 4 }}>📌 Requirement: {trendingObjective.req}</div>
              {trendingObjective.rewards && <div style={{ fontSize: 9, color: "#94a3b8" }}>1 stage: +{trendingObjective.rewards[1]}🎟️ • 2: +{trendingObjective.rewards[2]}🎟️ • 3: +{trendingObjective.rewards[3]}🎟️</div>}
              {trendingObjective.tierRewards && <div style={{ fontSize: 9, color: "#94a3b8" }}>0-1★: +{trendingObjective.tierRewards.low}🎟️ • 2-3★: +{trendingObjective.tierRewards.mid}🎟️ • 4-5★: +{trendingObjective.tierRewards.high}🎟️</div>}
            </div>
          </div>}
          {/* Personal Objective */}
          {playerObjectives[currentPlayerId] && (() => { const obj = playerObjectives[currentPlayerId]; return <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", position: "relative", cursor: "help" }} className="obj-hover-parent">
            <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎯 Your Objective</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#e9d5ff" }}>{obj.name}</div>
            <div className="obj-hover-tip" style={{ position: "absolute", left: "105%", top: 0, width: 240, padding: 12, borderRadius: 12, background: "#1a1a2e", border: "1px solid #7c3aed", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 100, display: "none", textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", marginBottom: 4 }}>{obj.name}</div>
              <div style={{ fontSize: 10, color: "#e9d5ff", marginBottom: 6 }}>{obj.desc}</div>
              <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 4 }}>📌 Requirement: {obj.req}</div>
              {obj.rewards && <div style={{ fontSize: 9, color: "#94a3b8" }}>1 stage: +{obj.rewards[1]}🎟️ • 2: +{obj.rewards[2]}🎟️ • 3: +{obj.rewards[3]}🎟️</div>}
              {obj.tierRewards && <div style={{ fontSize: 9, color: "#94a3b8" }}>0-1★: +{obj.tierRewards.low}🎟️ • 2-3★: +{obj.tierRewards.mid}🎟️ • 4-5★: +{obj.tierRewards.high}🎟️</div>}
            </div>
          </div>; })()}
          {/* Council Objectives */}
          {(playerCouncils[currentPlayerId] || []).length > 0 && <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>📋 Council</div>
            {(playerCouncils[currentPlayerId] || []).map((co, ci) => (
              <div key={ci} style={{ padding: 6, borderRadius: 8, marginBottom: 4, background: co.active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)", border: `1px solid ${co.active ? "#22c55e50" : "#ef444450"}`, position: "relative", cursor: "help" }} className="obj-hover-parent">
                <div style={{ fontSize: 10, fontWeight: 700, color: co.active ? "#4ade80" : "#f87171" }}>{co.active ? "✅" : "❌"} {co.obj.name}</div>
                <div style={{ fontSize: 9, color: "#94a3b8" }}>{co.obj.benefit}</div>
                <div className="obj-hover-tip" style={{ position: "absolute", left: "105%", top: 0, width: 240, padding: 12, borderRadius: 12, background: "#1a1a2e", border: `1px solid ${co.active ? "#22c55e" : "#ef4444"}`, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 100, display: "none", textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: co.active ? "#4ade80" : "#f87171", marginBottom: 4 }}>{co.obj.name}</div>
                  <div style={{ fontSize: 10, color: "#e9d5ff", fontStyle: "italic", marginBottom: 6 }}>"{co.obj.flavour}"</div>
                  <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 4 }}>📌 Requirement: {co.obj.req}</div>
                  <div style={{ fontSize: 10, color: "#4ade80" }}>Passive: {co.obj.benefit}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 4 }}>Status: {co.active ? "Active ✅" : "Inactive ❌"}{co.fameGranted ? " • Fame granted" : ""}</div>
                </div>
              </div>
            ))}
          </div>}
          {/* Fame breakdown */}
          <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: "rgba(251,191,36,0.08)", fontSize: 10, color: "#fbbf24" }}>
            🔥 Fame {currentPD.fame || 0} → ×{FAME_MULTIPLIER[Math.min(5, currentPD.fame || 0)]} tickets
          </div>
          {/* Global Events Preview */}
          {globalEvents.length > 0 && <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: "rgba(124,58,237,0.06)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>🎭 Year Events</div>
            <div style={{ display: "flex", gap: 4 }}>
              {globalEvents.map((g, i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 6, background: g.event.color === "green" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)", border: `1px solid ${g.event.color === "green" ? "#22c55e" : "#ef4444"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                {g.event.color === "green" ? "🟢" : "🔴"}
              </div>)}
            </div>
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>Details revealed during Events Phase</div>
          </div>}
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
              <button onClick={endTurn} style={{ ...bd, marginTop: 8 }}>End Turn →</button>
            </div>}

            {!actionTaken && !turnAction && !noTurnsLeft && <div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handlePickAmenity} style={bp}>🎲 Pick Amenity</button>
                <button onClick={handleMoveAmenity} style={bs}>↔️ Move Amenity</button>
                <button onClick={handleArtistAction} style={{ ...bs, background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(249,115,22,0.3))", border: "1px solid #ec4899" }}>🎤 Book / Reserve Artist</button>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}><button onClick={endTurn} style={bd}>End Turn →</button></div>
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

            {/* Artist Action */}
            {!actionTaken && turnAction === "artist" && artistAction === null && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎤 Choose an artist action:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setArtistAction("bookPool")} style={{ ...bs, fontSize: 12 }}>📋 Book from Pool</button>
                <button onClick={() => setArtistAction("bookHand")} disabled={handCards.length === 0} style={{ ...bs, fontSize: 12, opacity: handCards.length === 0 ? 0.4 : 1 }}>🃏 Book from Hand</button>
                <button onClick={() => setArtistAction("reservePool")} style={{ ...bs, fontSize: 12 }}>📥 Reserve from Pool</button>
                <button onClick={() => handleReserveFromDeck()} style={{ ...bs, fontSize: 12 }}>📦 Reserve from Deck</button>
              </div>
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "bookPool" && !selectedArtist && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 8 }}>Click an artist from the pool to book them:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => <ArtistCard key={i} artist={a} showCost small affordable={canAffordArtist(a, currentPD)} disabled={!canAffordArtist(a, currentPD)} onClick={() => handleBookFromPool(i)} />)}
              </div>
              <button onClick={() => setArtistAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Back</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "bookHand" && !selectedArtist && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 8 }}>Click an artist from your hand to book them:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small affordable={canAffordArtist(a, currentPD)} disabled={!canAffordArtist(a, currentPD)} onClick={() => handleBookFromHand(i)} />)}
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
  if (phase === "events") {
    const evtPlayer = players[eventPhasePlayer];
    const evtRes = evtPlayer ? eventPhaseResults?.[evtPlayer.id] : null;
    return (
    <div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🎭 Events Phase — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{evtPlayer?.festivalName}'s Festival</h3>
          {evtRes && <>
            <div style={{ marginBottom: 12, padding: 8, borderRadius: 10, background: "rgba(124,58,237,0.1)", fontSize: 12, color: "#94a3b8" }}>
              💪 Security: {evtRes.secCount} • 🔴 Negative events: {evtRes.totalNeg} • 🛡️ Blocked: {evtRes.blocked.length}
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
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>🔴 Negative Events ({evtRes.negative.length})</div>
              {evtRes.negative.map((e, i) => <div key={i} style={{ padding: 8, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", marginBottom: 4, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{e.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.desc}</div>
                <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 2 }}>{e.result}</div>
              </div>)}
            </div>}
            {evtRes.blocked.length > 0 && <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 6 }}>🛡️ Blocked by Security ({evtRes.blocked.length})</div>
              {evtRes.blocked.map((e, i) => <div key={i} style={{ padding: 6, borderRadius: 8, background: "rgba(96,165,250,0.1)", border: "1px solid #3b82f640", marginBottom: 4, textAlign: "left", opacity: 0.6 }}>
                <div style={{ fontSize: 11, color: "#60a5fa", textDecoration: "line-through" }}>{e.name} — {e.result}</div>
              </div>)}
            </div>}
            {evtRes.positive.length === 0 && evtRes.negative.length === 0 && evtRes.blocked.length === 0 && <p style={{ color: "#64748b", fontSize: 14 }}>No events affected this festival.</p>}
          </>}
          <button onClick={advanceEventPhase} style={bp}>{eventPhasePlayer < players.length - 1 ? `Apply & Next Player →` : `Apply & Go to Scoring →`}</button>
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
  if (phase === "gameOver") return (
    <div style={CS}>{logBtn}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #fbbf24, #f472b6, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🏆 GAME OVER</h1>
          {winner && <div style={{ marginBottom: 24 }}><p style={{ color: "#fbbf24", fontSize: 22, fontWeight: 700 }}>{winner.festivalName} Wins!</p><p style={{ color: "#8b5cf6", fontSize: 14 }}>with {playerData[winner.id]?.vp || 0} VP</p></div>}
          <button onClick={() => { setPhase("lobby"); setGameLog([]); setAllTickets({}); setYear(1); }} style={{ ...bp, marginTop: 24 }}>Play Again 🎪</button>
        </div>
      </div>{anim}</div>
  );

  return null;
}
