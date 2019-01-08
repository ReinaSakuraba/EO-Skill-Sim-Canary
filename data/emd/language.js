const skillNameTrans = [
  [  0, "Herbology", ""],
  [  1, "Dendrology", ""],
  [  2, "Mineralogy", ""],
  [  3, "Proficiency", ""],
  [  4, "Double Strike", ""],
  [  5, "Vanguard", ""],
  [  6, "Power Boost", ""],
  [  7, "Iron Wall", ""],
  [  8, "Expertise", ""],
  [  9, "Spiral Slice", ""],
  [ 10, "Penetrate", ""],
  [ 11, "Initiative", ""],
  [ 12, "Blazing Link", ""],
  [ 13, "Freezing Link", ""],
  [ 14, "Electric Link", ""],
  [ 15, "Power Break", ""],
  [ 16, "Mind Break", ""],
  [ 17, "Enlightenment", ""],
  [ 18, "Sword Tempest", ""],
  [ 19, "Swift Stab", ""],
  [ 20, "Improved Link", ""],
  [ 21, "Link Mastery", ""],
  [ 22, "Proficiency", ""],
  [ 23, "HP Up", ""],
  [ 24, "Provoke", ""],
  [ 25, "Shield Smite", ""],
  [ 26, "Defense Boost", ""],
  [ 27, "Refresh", ""],
  [ 28, "Expertise", ""],
  [ 29, "HP Regen", ""],
  [ 30, "Desperado", ""],
  [ 31, "Cover", ""],
  [ 32, "Shield Bash", ""],
  [ 33, "Fire Wall", ""],
  [ 34, "Ice Wall", ""],
  [ 35, "Volt Wall", ""],
  [ 36, "Enlightenment", ""],
  [ 37, "Aegis", ""],
  [ 38, "Diversion", ""],
  [ 39, "Full Guard", ""],
  [ 40, "Divine Wall", ""],
  [ 41, "Proficiency", ""],
  [ 42, "Gun Mastery", ""],
  [ 43, "Leg Snipe", ""],
  [ 44, "Arm Snipe", ""],
  [ 45, "Medic Bullet", ""],
  [ 46, "Expertise", ""],
  [ 47, "Double Strike", ""],
  [ 48, "Scattershot", ""],
  [ 49, "Pinpoint Shot", ""],
  [ 50, "Snipe", ""],
  [ 51, "Head Snipe", ""],
  [ 52, "Fire Rounds", ""],
  [ 53, "Ice Rounds", ""],
  [ 54, "Volt Rounds", ""],
  [ 55, "Enlightenment", ""],
  [ 56, "Ricochet", ""],
  [ 57, "Rifle Shot", ""],
  [ 58, "Stunning Shot", ""],
  [ 59, "Charged Shot", ""],
  [ 60, "Proficiency", ""],
  [ 61, "Fireball Rune", ""],
  [ 62, "Ice Lance Rune", ""],
  [ 63, "Lightning Rune", ""],
  [ 64, "Runic Gleam", ""],
  [ 65, "TP Boost", ""],
  [ 66, "Expertise", ""],
  [ 67, "Flame Rune", ""],
  [ 68, "Glacier Rune", ""],
  [ 69, "Storm Rune", ""],
  [ 70, "Runic Shield", ""],
  [ 71, "Runic Guidance", ""],
  [ 72, "Free Energy", ""],
  [ 73, "Runic Flare", ""],
  [ 74, "Enlightenment", ""],
  [ 75, "Inferno Rune", ""],
  [ 76, "Blizzard Rune", ""],
  [ 77, "Galvanic Rune", ""],
  [ 78, "Rune Mastery", ""],
  [ 79, "Proficiency", ""],
  [ 80, "Healing", ""],
  [ 81, "Refresh", ""],
  [ 82, "Treat", ""],
  [ 83, "Steady Hands", ""],
  [ 84, "Heavy Strike", ""],
  [ 85, "Expertise", ""],
  [ 86, "Full Heal", ""],
  [ 87, "Party Heal", ""],
  [ 88, "Revive", ""],
  [ 89, "Group Therapy", ""],
  [ 90, "Full Refresh", ""],
  [ 91, "TP Boost", ""],
  [ 92, "Knockout Blow", ""],
  [ 93, "Enlightenment", ""],
  [ 94, "Auto-Heal", ""],
  [ 95, "Auto-Revive", ""],
  [ 96, "Heal Mastery", ""],
  [ 97, "Star Drop", ""],
  [ 98, "Proficiency", ""],
  [ 99, "Regen Waltz", ""],
  [100, "Attack Tango", ""],
  [101, "Counter Samba", ""],
  [102, "Fan Dance", ""],
  [103, "Expertise", ""],
  [104, "Fresh Waltz", ""],
  [105, "Healing Step", ""],
  [106, "Guard Tango", ""],
  [107, "Chase Samba", ""],
  [108, "Sword Dance", ""],
  [109, "AGI Boost", ""],
  [110, "Blast Save", ""],
  [111, "Enlightenment", ""],
  [112, "Wide Dance", ""],
  [113, "Energy Tango", ""],
  [114, "Trick Samba", ""],
  [115, "Mist Dance", ""],
  [116, "Quick Step", ""],
  [117, "Proficiency", ""],
  [118, "Sapping Curse", ""],
  [119, "Poison Curse", ""],
  [120, "Abdomen Curse", ""],
  [121, "Immobile Curse", ""],
  [122, "Power Word", ""],
  [123, "Expertise", ""],
  [124, "Frailty Curse", ""],
  [125, "Torpor Curse", ""],
  [126, "Cranial Curse", ""],
  [127, "Revenge", ""],
  [128, "Evil Eye", ""],
  [129, "Suicide Word", ""],
  [130, "Enlightenment", ""],
  [131, "Curse Mastery", ""],
  [132, "Corrupt Curse", ""],
  [133, "Pain Storm", ""],
  [134, "Conflict Word", ""],
  [135, "Muting Word", ""],
  [136, "Proficiency", ""],
  [137, "Concealment", ""],
  [138, "Ninpo: Daggers", ""],
  [139, "Shadow Bind", ""],
  [140, "Ninpo: Divert", ""],
  [141, "Expertise", ""],
  [142, "Ninpo: Smoke", ""],
  [143, "Ninpo: Flight", ""],
  [144, "Ninpo: Caltrops", ""],
  [145, "Ninpo: Mirror", ""],
  [146, "Hawk Strike", ""],
  [147, "Ninpo: Decoy", ""],
  [148, "Water Beetle", ""],
  [149, "Enlightenment", ""],
  [150, "Acrobatics", ""],
  [151, "Beheading", ""],
  [152, "Drawing Slice", ""],
  [153, "Headstart", ""],
  [154, "Body Swap", ""],
  [155, "Proficiency", ""],
  [156, "Nobility Proof", ""],
  [157, "Attack Order", ""],
  [158, "Guard Order", ""],
  [159, "Reinforce", ""],
  [160, "Expertise", ""],
  [161, "Negotiation", ""],
  [162, "Fire Arms", ""],
  [163, "Freeze Arms", ""],
  [164, "Shock Arms", ""],
  [165, "Protect Order", ""],
  [166, "Prevent Order", ""],
  [167, "Monarch March", ""],
  [168, "Enlightenment", ""],
  [169, "Inspire", ""],
  [170, "Regal Radiance", ""],
  [171, "Ad Nihilo", ""],
  [172, "Encourage", ""],
  [173, "Royal Decree", ""],
  [174, "Proficiency", ""],
  [175, "Rock Toss", ""],
  [176, "Binding Strike", ""],
  [177, "Strike Boost", ""],
  [178, "Expertise", ""],
  [179, "Blowback", ""],
  [180, "Insect Killer", ""],
  [181, "Animal Killer", ""],
  [182, "Plant Killer", ""],
  [183, "Dragon Killer", ""],
  [184, "Untrap", ""],
  [185, "Restore Ability", ""],
  [186, "Water Walk", ""],
  [187, "Enlightenment", ""],
  [188, "Airstrike", ""],
  [189, "Haste Self", ""],
  [190, "Slow Monster", ""],
  [191, "Dig", ""],
];

const skillDescTrans = [

];

const skillHeaderTrans = [

];

const classNameTrans = [
  [ 0, "Landsknecht", ""],
  [ 1,   "Protector", ""],
  [ 2,      "Gunner", ""],
  [ 3,  "Runemaster", ""],
  [ 4,       "Medic", ""],
  [ 5,      "Dancer", ""],
  [ 6,       "Hexer", ""],
  [ 7,       "Ninja", ""],
  [ 8,   "Sovereign", ""],
  [ 9,    "Wanderer", ""]
];
