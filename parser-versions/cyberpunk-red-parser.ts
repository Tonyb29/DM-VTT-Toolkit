// cyberpunk-red-parser.ts
// Parse Cyberpunk RED NPC stat blocks (plain-text label format) into
// Foundry VTT actor JSON for the "Cyberpunk RED - Core" system (mook type).

import { SKILL_CATALOG, SkillDef } from './cyberpunk-red-pc-parser';

const CPR_SYS_ID  = 'cyberpunk-red-core';
const CPR_SYS_VER = 'v0.92.4';
const CPR_CORE_VER = '12.343';

// ─── Types ────────────────────────────────────────────────────────────────────

export const STAT_KEYS = ['int', 'ref', 'dex', 'tech', 'cool', 'will', 'luck', 'move', 'body', 'emp'] as const;
export type StatKey = typeof STAT_KEYS[number];

export interface CPRSkill {
  name: string;
  level: number;
  stat: StatKey;
  category: string;
  difficulty: string;
  skillType: string;
  recognized: boolean;
}

export interface CPRWeapon {
  name: string;
  damage: string;
  rof: number;
  isRanged: boolean;
  handsReq: number;
}

export interface CPRArmor {
  name: string;
  headSp: number;
  bodySp: number;
}

export interface CPRNpc {
  name: string;
  role: string;
  stats: Record<StatKey, number>;
  hp: number;
  sp: number;
  skills: CPRSkill[];
  weapons: CPRWeapon[];
  armor: CPRArmor[];
  cyberware: string[];
  notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeId(actorName: string, itemName: string, idx: number): string {
  const a = djb2(`cpr|actor|${actorName}|${itemName}|${idx}`).toString(16).padStart(8, '0');
  const b = djb2(`cpr|item|${idx}|${itemName}|${actorName}`).toString(16).padStart(8, '0');
  return (a + b).slice(0, 16);
}

// Skill → full definition (stat, category, difficulty, skillType), sourced
// from the same canonical catalog used by the PC Create tool (extracted
// from a real Foundry character export — the game's own data, not a
// guessed mapping). Missing category/difficulty entirely — not just a
// wrong stat — is what leaves every skill filed under "awarenessSkills"
// on the sheet, since that's the schema's own default when the field is
// never set.
const SKILL_DEF_BY_NAME: Record<string, SkillDef> = Object.fromEntries(
  SKILL_CATALOG.map(s => [s.name.toLowerCase(), s])
);

// "Language (Native)" and "Local Expert (Your Home)" style entries name a
// player-chosen specialization the catalog can't enumerate in advance —
// neither is in Foundry's own compendium under that exact name either.
// Both patterns are consistently INT / educationSkills in the core book,
// so that's the fallback rather than the generic unrecognized default.
const SPECIALIZATION_FALLBACK: [RegExp, Omit<SkillDef, 'name' | 'page'>][] = [
  [/^Language\s*\(.+\)$/i, { stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: true, skillType: 'language' }],
  [/^Local Expert\s*\(.+\)$/i, { stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: true, skillType: 'generic' }],
  [/^Science\s*\(.+\)$/i, { stat: 'int', category: 'educationSkills', difficulty: 'difficult', basic: false, skillType: 'specialization' }],
  [/^Martial Arts\s*\(.+\)$/i, { stat: 'dex', category: 'fightingSkills', difficulty: 'difficult', basic: false, skillType: 'specialization' }],
];

function skillDef(name: string): { def: Omit<SkillDef, 'name' | 'page'>; recognized: boolean } {
  const exact = SKILL_DEF_BY_NAME[name.trim().toLowerCase()];
  if (exact) return { def: exact, recognized: true };
  for (const [re, fallback] of SPECIALIZATION_FALLBACK) {
    if (re.test(name.trim())) return { def: fallback, recognized: true };
  }
  return { def: { stat: 'ref', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic' }, recognized: false };
}

function findLabel(lines: string[], label: string): string {
  const re = new RegExp(`^${label}\\s*:\\s*(.*)$`, 'i');
  for (const line of lines) {
    const m = line.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

function parseCsvList(raw: string): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Splits on commas that are NOT inside parentheses — a single line like
// "Cyberarm x2 (Popup Grenade Launcher x2, Popup Heavy SMG, Wolvers)" is one
// cyberware item, not three; a naive comma split breaks it apart.
function splitTopLevel(raw: string): string[] {
  if (!raw) return [];
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of raw) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// Parses "Name", "Name (Head N, Body N)", or "Name (N SP)" armor entries —
// the same syntax the PC Create tool accepts — so a single armor piece
// carries separate head/body SP instead of one merged number.
function parseArmorEntries(raw: string, fallbackSp: number): CPRArmor[] {
  return splitTopLevel(raw).map(entry => {
    const both = entry.match(/^(.+?)\s*\(\s*Head\s*(\d+)\s*,\s*Body\s*(\d+)\s*\)\s*$/i);
    if (both) return { name: both[1].trim(), headSp: parseInt(both[2], 10), bodySp: parseInt(both[3], 10) };
    const single = entry.match(/^(.+?)\s*\(\s*(\d+)\s*SP\s*\)\s*$/i);
    if (single) return { name: single[1].trim(), headSp: parseInt(single[2], 10), bodySp: parseInt(single[2], 10) };
    return { name: entry.trim(), headSp: fallbackSp, bodySp: fallbackSp };
  }).filter(a => a.name);
}

function parseStats(raw: string): Record<StatKey, number> {
  const stats = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) stats[key] = 5;
  if (!raw) return stats;
  const parts = raw.split(',');
  for (const part of parts) {
    const m = part.trim().match(/^([A-Za-z]+)\s+(-?\d+)$/);
    if (!m) continue;
    const key = m[1].toLowerCase() as StatKey;
    if (STAT_KEYS.includes(key)) stats[key] = parseInt(m[2], 10);
  }
  return stats;
}

// Label-format skills use "Name +N" — N is already a raw skill rank (this
// tool's own convention, matching how Foundry stores skill.level), not a
// book "Skill Base" total, so no stat subtraction happens here.
function parseSkills(raw: string): CPRSkill[] {
  return parseCsvList(raw).map(entry => {
    const m = entry.match(/^(.+?)\s*\+(\d+)$/);
    const name = (m ? m[1] : entry).trim();
    const level = m ? parseInt(m[2], 10) : 0;
    const { def, recognized } = skillDef(name);
    return { name, level, stat: def.stat, category: def.category, difficulty: def.difficulty, skillType: def.skillType, recognized };
  });
}

function parseWeapons(raw: string): CPRWeapon[] {
  return parseCsvList(raw).map(entry => {
    const m = entry.match(/^(.+?)\s*\(([^)]*)\)\s*$/);
    const name = (m ? m[1] : entry).trim();
    const damage = m ? m[2].trim() : '1d6';
    const isRanged = /\d\s*m|pistol|rifle|shotgun|smg|heavy|bow|launcher/i.test(name);
    return { name, damage: damage || '1d6', rof: 1, isRanged, handsReq: /heavy|rifle|shotgun/i.test(name) ? 2 : 1 };
  });
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

function parseLabelFormat(text: string): CPRNpc | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  let name = findLabel(lines, 'NAME');
  if (!name) name = lines[0].replace(/^#+\s*/, '').trim();

  const role = findLabel(lines, 'ROLE');
  const stats = parseStats(findLabel(lines, 'STATS'));
  const hp = parseInt(findLabel(lines, 'HP'), 10) || 30;
  const sp = parseInt(findLabel(lines, 'SP'), 10) || 0;
  const skills = parseSkills(findLabel(lines, 'SKILLS'));
  const weapons = parseWeapons(findLabel(lines, 'WEAPONS'));
  const armor = parseArmorEntries(findLabel(lines, 'ARMOR'), sp);
  const cyberware = splitTopLevel(findLabel(lines, 'CYBERWARE'));
  const notes = findLabel(lines, 'NOTES');

  return { name: name || 'Unknown NPC', role, stats, hp, sp, skills, weapons, armor, cyberware, notes };
}

// Grabs the next number (or an em-dash/hyphen standing in for "N/A") that
// follows `labelPattern` anywhere after `fromIndex`, regardless of whether
// the label and its value landed on the same line or separate lines in the
// clipboard text — real-world copy/paste from a rendered page doesn't
// reliably preserve one layout. Returns null (and an unchanged cursor) if
// the label isn't found at all, so callers can leave a field at its default
// without derailing the rest of the parse.
function grabNumberAfter(text: string, fromIndex: number, labelPattern: string): { value: number | null; end: number } {
  const re = new RegExp(`\\b(?:${labelPattern})\\b\\s*:?\\s*(-?\\d+|\\u2014|-)`, 'i');
  const m = re.exec(text.slice(fromIndex));
  if (!m) return { value: null, end: fromIndex };
  const raw = m[1];
  const value = /^-?\d+$/.test(raw) ? parseInt(raw, 10) : 0;
  return { value, end: fromIndex + (m.index as number) + m[0].length };
}

// Finds `labelPattern` as a whole line (allowing trailing junk on that same
// line) starting the line-scan from `fromIndex`; returns the line index
// after the label line, or null if not found within the given lines.
function findLineIndex(lines: string[], fromIdx: number, labelPattern: string): number | null {
  const re = new RegExp(`^(?:${labelPattern})\\b`, 'i');
  for (let i = fromIdx; i < lines.length; i++) {
    if (re.test(lines[i])) return i;
  }
  return null;
}

// Parses the plain-text layout produced when copying an NPC stat block
// directly off a rendered character-builder page (e.g. Demiplane Nexus).
// Real clipboard output from a page like that doesn't reliably keep every
// "label" and its "value" on two clean separate lines the way retyping it
// would — so attribute/HP extraction below is whitespace-agnostic (a
// label's value can be on the same line or the next) rather than assuming
// strict line-by-line pairing. Tolerates extra page chrome (tooltips,
// intro paragraphs) before/after the block, and — if several NPCs were
// copied at once — parses only the first one found.
function parseDemiplaneStatBlock(rawText: string): CPRNpc | null {
  // Normalize invisible/odd whitespace that a real clipboard paste can carry
  // (non-breaking spaces, zero-width chars) which would otherwise break
  // strict text matching.
  const text = rawText
    .replace(/ /g, ' ')
    .replace(/[​‌‍﻿]/g, '');

  const STAT_ABBR = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];

  const introMatch = /\bINT\b/i.exec(text);
  if (!introMatch) return null;

  const precedingLines = text.slice(0, introMatch.index).split('\n').map(l => l.trim()).filter(Boolean);
  const name = precedingLines.length ? precedingLines[precedingLines.length - 1] : 'Unknown NPC';

  const stats = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) stats[key] = 0;

  let cursor = introMatch.index;
  for (const abbr of STAT_ABBR) {
    const { value, end } = grabNumberAfter(text, cursor, abbr);
    if (value === null) continue; // leave default 0, don't move the cursor
    stats[abbr.toLowerCase() as StatKey] = value;
    cursor = end;
  }

  const hpGrab = grabNumberAfter(text, cursor, 'Hit\\s+Points');
  const hp = hpGrab.value ?? 30;
  if (hpGrab.value !== null) cursor = hpGrab.end;

  // Skip past Seriously Wounded / Death Save if present — not needed, but
  // advancing the cursor keeps later section searches from re-matching them.
  const swGrab = grabNumberAfter(text, cursor, 'Seriously\\s+Wounded');
  if (swGrab.value !== null) cursor = swGrab.end;
  const dsGrab = grabNumberAfter(text, cursor, 'Death\\s+Save');
  if (dsGrab.value !== null) cursor = dsGrab.end;

  // From here on, work line-by-line over the remaining text — these
  // sections are free-form lists rather than single scalar values.
  const rest = text.slice(cursor);
  const lines = rest.split('\n').map(l => l.trim()).filter(Boolean);
  let idx = 0;

  const weapons: CPRWeapon[] = [];
  const weaponsIdx = findLineIndex(lines, idx, 'Weapons');
  if (weaponsIdx !== null) {
    idx = weaponsIdx + 1;
    const weaponLines: string[] = [];
    while (idx < lines.length && !/^armor\s*:/i.test(lines[idx])) {
      weaponLines.push(lines[idx]);
      idx++;
    }
    for (let i = 0; i + 1 < weaponLines.length; i += 2) {
      const wName = weaponLines[i];
      const damage = weaponLines[i + 1];
      const isRanged = /pistol|rifle|shotgun|smg|launcher|bow|flamethrower/i.test(wName);
      weapons.push({ name: wName, damage, rof: 1, isRanged, handsReq: /heavy|rifle|shotgun|flamethrower/i.test(wName) ? 2 : 1 });
    }
  }

  const armor: CPRArmor[] = [];
  let sp = 0;
  if (idx < lines.length && /^armor\s*:/i.test(lines[idx])) {
    const m = lines[idx].match(/^armor\s*:\s*(.+)$/i);
    const armorName = m ? m[1].trim() : 'Armor';
    const armorRest = lines.slice(idx).join(' ');
    idx++;
    const headM = armorRest.match(/\bHead\b\s*:?\s*(\d+)\s*SP/i);
    const bodyM = armorRest.match(/\bBody\b\s*:?\s*(\d+)\s*SP/i);
    const headSp = headM ? parseInt(headM[1], 10) : 0;
    const bodySp = bodyM ? parseInt(bodyM[1], 10) : 0;
    armor.push({ name: armorName, headSp, bodySp });
    sp = bodySp || headSp;
    // Skip past whichever Head/Body lines we consumed via the join-scan above.
    while (idx < lines.length && (/^head\b/i.test(lines[idx]) || /^body\b/i.test(lines[idx]) || /^\d+\s*SP$/i.test(lines[idx]))) idx++;
  }

  // Book "Skill Bases" are STAT + Skill combined already (the Mooks and
  // Grunts intro says so outright), but Foundry adds STAT itself at roll
  // time — so the level we store has to be the book total MINUS the
  // governing stat, clamped at 0, or every roll comes out doubled.
  let skills: CPRSkill[] = [];
  const skillsIdx = findLineIndex(lines, idx, 'Skill\\s+Bases');
  if (skillsIdx !== null) {
    idx = skillsIdx + 1;
    const skillLines: string[] = [];
    while (idx < lines.length && !/^cyberware/i.test(lines[idx])) {
      skillLines.push(lines[idx]);
      idx++;
    }
    skills = parseCsvList(skillLines.join(' ')).map(entry => {
      const m = entry.match(/^(.+?)\s+(\d+)$/);
      const skillName = (m ? m[1] : entry).trim();
      const bookTotal = m ? parseInt(m[2], 10) : 0;
      const { def, recognized } = skillDef(skillName);
      const level = Math.max(0, bookTotal - stats[def.stat]);
      return { name: skillName, level, stat: def.stat, category: def.category, difficulty: def.difficulty, skillType: def.skillType, recognized };
    });
  }

  let cyberware: string[] = [];
  const equipIdx = findLineIndex(lines, idx, 'Cyberware(?:\\s+Special\\s+Equipment)?');
  if (equipIdx !== null) {
    idx = equipIdx + 1;
    const equipLines: string[] = [];
    while (idx < lines.length && !(idx + 1 < lines.length && lines[idx + 1].toUpperCase() === 'INT') && !/\bINT\b/i.test(lines[idx])) {
      equipLines.push(lines[idx]);
      idx++;
    }
    cyberware = splitTopLevel(equipLines.join(' '));
  }

  return { name: name || 'Unknown NPC', role: '', stats, hp, sp, skills, weapons, armor, cyberware, notes: '' };
}

export function parseCyberpunkRedStatBlock(text: string): CPRNpc | null {
  if (!text?.trim()) return null;

  // Explicit "LABEL: value" format (this tool's own paste template) takes priority.
  if (/^\s*(NAME|STATS)\s*:/im.test(text)) {
    return parseLabelFormat(text);
  }

  // Otherwise try the unlabeled multi-line layout copied straight off a
  // character-builder page (Demiplane Nexus and similar).
  const demiplane = parseDemiplaneStatBlock(text);
  if (demiplane) return demiplane;

  // Last resort — best-effort label parse even without a clear marker.
  return parseLabelFormat(text);
}

// ─── Foundry Exporter ─────────────────────────────────────────────────────────

function skillItem(skill: CPRSkill, actorName: string, idx: number) {
  return {
    _id: makeId(actorName, skill.name, idx),
    name: skill.name,
    type: 'skill',
    img: 'icons/svg/book.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: { systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER, coreVersion: CPR_CORE_VER, createdTime: null, modifiedTime: null, lastModifiedBy: null },
    system: {
      level: skill.level, stat: skill.stat, category: skill.category,
      difficulty: skill.difficulty, skillType: skill.skillType, core: false, basic: false,
    },
  };
}

// A weapon that isn't in the Foundry compendium (see the macro's runtime
// lookup below) still needs *some* magazine value or it imports empty —
// this is a best-effort default by archetype, not book-accurate capacity.
function defaultMagazine(weapon: CPRWeapon): number {
  if (!weapon.isRanged) return 0;
  const n = weapon.name.toLowerCase();
  if (/shotgun/.test(n)) return 4;
  if (/smg/.test(n)) return 30;
  if (/rifle/.test(n)) return 25;
  if (/launcher|grenade|heavy/.test(n)) return 1;
  if (/pistol/.test(n)) return 12;
  return 10;
}

// Foundry's weapon item defaults weaponSkill to Handgun when it isn't set
// explicitly — which is exactly wrong for anything melee. Named cyberweapons
// (claws, snakes, etc.) read as melee by name even though CPRWeapon.isRanged
// already filters most of these out.
function defaultWeaponSkill(weapon: CPRWeapon): string {
  const n = weapon.name.toLowerCase();
  if (!weapon.isRanged) return 'Melee Weapon';
  if (/shotgun|rifle/.test(n)) return 'Shoulder Arms';
  if (/smg|autofire/.test(n)) return 'Autofire';
  if (/launcher|grenade|heavy/.test(n)) return 'Heavy Weapons';
  if (/bow/.test(n)) return 'Archery';
  return 'Handgun';
}

function weaponItem(weapon: CPRWeapon, actorName: string, idx: number) {
  const mag = defaultMagazine(weapon);
  return {
    _id: makeId(actorName, weapon.name, idx),
    name: weapon.name,
    type: 'weapon',
    img: 'icons/svg/sword.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: { systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER, coreVersion: CPR_CORE_VER, createdTime: null, modifiedTime: null, lastModifiedBy: null },
    system: {
      damage: weapon.damage,
      rof: weapon.rof,
      isRanged: weapon.isRanged,
      handsReq: weapon.handsReq,
      equipped: 'equipped',
      magazine: { value: mag, max: mag },
      weaponSkill: defaultWeaponSkill(weapon),
    },
  };
}

function armorItem(armor: CPRArmor, actorName: string, idx: number) {
  return {
    _id: makeId(actorName, armor.name, idx),
    name: armor.name,
    type: 'armor',
    img: 'icons/svg/shield.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: { systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER, coreVersion: CPR_CORE_VER, createdTime: null, modifiedTime: null, lastModifiedBy: null },
    system: {
      isBodyLocation: true,
      isHeadLocation: true,
      isShield: false,
      bodyLocation: { sp: armor.bodySp, ablation: 0 },
      headLocation: { sp: armor.headSp, ablation: 0 },
      equipped: 'equipped',
    },
  };
}

function cyberwareItem(name: string, actorName: string, idx: number) {
  return {
    _id: makeId(actorName, name, idx),
    name,
    type: 'cyberware',
    img: 'icons/svg/eye.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: { systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER, coreVersion: CPR_CORE_VER, createdTime: null, modifiedTime: null, lastModifiedBy: null },
    system: { equipped: 'equipped' },
  };
}

export function toCyberpunkRedFoundryActor(npc: CPRNpc): Record<string, unknown> {
  const actorId = makeId(npc.name, 'actor', 0);
  const items = [
    ...npc.skills.map((s, i) => skillItem(s, npc.name, i)),
    ...npc.weapons.map((w, i) => weaponItem(w, npc.name, i)),
    ...npc.armor.map((a, i) => armorItem(a, npc.name, i)),
    ...npc.cyberware.map((c, i) => cyberwareItem(c, npc.name, i)),
  ];

  // Foundry's CPR system tracks "current" SP as a separate actor-level
  // pool (system.externalData), not something it derives from the armor
  // item automatically — an equipped armor item with SP 11 still blocks
  // 0 damage until this is set. Take the best (max) SP per location
  // across all armor entries, matching "wear your best piece" logic.
  const maxHeadSp = npc.armor.reduce((m, a) => Math.max(m, a.headSp), 0);
  const maxBodySp = npc.armor.reduce((m, a) => Math.max(m, a.bodySp), 0);

  return {
    _id: actorId,
    name: npc.name,
    type: 'mook',
    img: 'icons/svg/mystery-man.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: { systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER, coreVersion: CPR_CORE_VER, createdTime: null, modifiedTime: null, lastModifiedBy: null },
    system: {
      stats: Object.fromEntries(STAT_KEYS.map(k => [k, { value: npc.stats[k] }])),
      derivedStats: {
        hp: { value: npc.hp, max: npc.hp },
        seriouslyWounded: Math.floor(npc.hp / 2),
        humanity: { value: 50, max: 50 },
      },
      externalData: {
        currentArmorHead: { value: maxHeadSp, max: maxHeadSp },
        currentArmorBody: { value: maxBodySp, max: maxBodySp },
      },
      information: {
        alias: npc.role,
        notes: npc.notes,
      },
    },
    items,
  };
}

// ─── Macro Builder ────────────────────────────────────────────────────────────

export function buildCyberpunkRedImportMacro(actor: Record<string, unknown>, npc: CPRNpc): string {
  const json = JSON.stringify(actor, null, 2);
  const unrecognized = JSON.stringify(npc.skills.filter(s => !s.recognized).map(s => s.name));
  return `// Cyberpunk RED Import Macro — generated by dmtoolkit.org
// Requires: Foundry VTT + "Cyberpunk RED - Core" system
// Macro Type must be set to "Script" (not "Chat") — see the macro's Type dropdown
(async () => {
  const actorData = ${json};
  const unrecognizedSkills = ${unrecognized};

  // Reuse an existing "Mooks"-ish folder rather than scattering NPCs across
  // near-duplicate folders (e.g. "Mooks & ICE" already exists in the world).
  let folder = game.folders.find(f => f.type === 'Actor' && /mook/i.test(f.name));
  if (!folder) folder = await Folder.create({ name: 'Mooks', type: 'Actor', color: '#ff2060' });
  actorData.folder = folder.id;

  // Weapons built by this tool are simplified stubs (name, damage, rof,
  // handsReq) — no dvTable, no correct weaponSkill, no loaded magazine.
  // If the actual weapon exists in the system's core compendium, swap in
  // its real data (keeping our parsed damage, in case Poor/Excellent
  // Quality changed it from the stock value). Named cyberweapons (claws,
  // snakes, popup launchers) usually aren't in core_weapons at all — they
  // live in core_cyberware as isWeapon items with their combat stats
  // already attached, so that's checked second.
  let weaponMatches = 0, weaponCustom = 0;
  try {
    const normalize = s => s.toLowerCase().replace(/^(poor|excellent)\\s+quality\\s+/, '').trim();
    const findMatch = (list, target) =>
      list.find(w => normalize(w.name) === target) ||
      list.find(w => target.includes(normalize(w.name)) || normalize(w.name).includes(target));

    const weaponsPack = game.packs.get('cyberpunk-red-core.core_weapons');
    const compendiumWeapons = weaponsPack ? await weaponsPack.getDocuments() : [];
    const cyberwarePack = game.packs.get('cyberpunk-red-core.core_cyberware');
    const cyberweapons = cyberwarePack
      ? (await cyberwarePack.getDocuments()).filter(c => c.system?.isWeapon)
      : [];

    for (const item of actorData.items) {
      if (item.type !== 'weapon') continue;
      const target = normalize(item.name);
      let match = findMatch(compendiumWeapons, target) || findMatch(cyberweapons, target);
      if (match) {
        const src = match.toObject();
        item.img = src.img;
        item.system = { ...src.system, damage: item.system.damage, equipped: 'equipped' };
        if (item.system.magazine) item.system.magazine.value = item.system.magazine.max;
        weaponMatches++;
      } else {
        weaponCustom++;
      }
    }
  } catch (e) {
    console.warn('Cyberpunk RED weapon compendium lookup failed, using simplified weapons.', e);
  }

  // Never silently delete an existing actor — someone may have hand-tuned
  // it since the last import. Ask, and default to "no".
  const existing = game.actors.filter(a => a.name === actorData.name);
  if (existing.length) {
    const proceed = await Dialog.confirm({
      title: 'Actor Already Exists',
      content: \`<p>\${existing.length} actor(s) named "\${actorData.name}" already exist.</p>
                 <p>Import as a new copy alongside them? (Cancel to stop and rename/delete manually.)</p>\`,
      yes: () => true, no: () => false, defaultYes: false,
    });
    if (!proceed) { ui.notifications.warn('Import cancelled — no changes made.'); return; }
    actorData.name = \`\${actorData.name} (imported \${new Date().toLocaleDateString()})\`;
  }

  const created = await Actor.create(actorData);
  if (created) {
    const skillCount = actorData.items.filter(i => i.type === 'skill').length;
    const weaponCount = actorData.items.filter(i => i.type === 'weapon').length;
    let msg = \`✓ Created: \${created.name} — \${skillCount} skills, \${weaponCount} weapons (\${weaponMatches} from compendium, \${weaponCustom} custom-built)\`;
    if (unrecognizedSkills.length) msg += \`. \${unrecognizedSkills.length} skill name(s) not recognized — defaulted to REF.\`;
    ui.notifications.info(msg);
    if (unrecognizedSkills.length) console.warn('Cyberpunk RED import — unrecognized skills (defaulted to REF, check governing stat manually):', unrecognizedSkills);
  } else {
    ui.notifications.error('Failed to create actor — check system compatibility.');
  }
})();`;
}
