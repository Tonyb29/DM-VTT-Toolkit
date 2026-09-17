// cyberpunk-red-pc-parser.ts
// Parse a labeled-text Cyberpunk RED player character into Foundry VTT
// actor JSON for the "Cyberpunk RED - Core" system (type "character").
//
// Schema reference: a real Foundry export of a "character" actor
// (coreVersion 12.343, systemVersion v0.92.4). Item shapes below are
// deliberately simplified — the CPR system's DataModel fills in schema
// defaults for any field a document omits, the same way our NPC "mook"
// exporter's sparse weapon/armor items already work when imported.

const CPR_SYS_ID  = 'cyberpunk-red-core';
const CPR_SYS_VER = 'v0.92.4';
const CPR_CORE_VER = '12.343';

export const PC_STAT_KEYS = ['int', 'ref', 'dex', 'tech', 'cool', 'will', 'luck', 'move', 'body', 'emp'] as const;
export type PCStatKey = typeof PC_STAT_KEYS[number];

// ─── Canonical skill catalog ───────────────────────────────────────────────
// Every Core-book skill with its governing stat, category, difficulty and
// page — extracted from a real character export so levels/metadata match
// what the Foundry system itself expects. Any skill not given an explicit
// level in the paste defaults to 0, same as a fresh character sheet.
export interface SkillDef {
  name: string; stat: PCStatKey; category: string; difficulty: string;
  basic: boolean; skillType: string; page: number;
}

export const SKILL_CATALOG: SkillDef[] = [
  { name: "Basic Tech", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 140 },
  { name: "Melee Weapon", stat: 'dex', category: 'fightingSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 137 },
  { name: "Martial Arts (Karate)", stat: 'dex', category: 'fightingSkills', difficulty: 'difficult', basic: false, skillType: 'specialization', page: 137 },
  { name: "Athletics", stat: 'dex', category: 'bodySkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 131 },
  { name: "Trading", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 139 },
  { name: "Electronics/Security Tech", stat: 'tech', category: 'techniqueSkills', difficulty: 'difficult', basic: false, skillType: 'generic', page: 141 },
  { name: "Animal Handling", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 133 },
  { name: "Resist Torture/Drugs", stat: 'will', category: 'bodySkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 132 },
  { name: "First Aid", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 141 },
  { name: "Paint/Draw/Sculpt", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 141 },
  { name: "Bureaucracy", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 133 },
  { name: "Riding", stat: 'ref', category: 'controlSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 133 },
  { name: "Gamble", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 135 },
  { name: "Evasion", stat: 'dex', category: 'fightingSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 137 },
  { name: "Conversation", stat: 'emp', category: 'socialSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 138 },
  { name: "Local Expert (Your Home)", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 135 },
  { name: "Land Vehicle Tech", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 141 },
  { name: "Streetwise", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 139 },
  { name: "Contortionist", stat: 'dex', category: 'bodySkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 131 },
  { name: "Human Perception", stat: 'emp', category: 'socialSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 139 },
  { name: "Criminology", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 134 },
  { name: "Composition", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 134 },
  { name: "Cybertech", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 140 },
  { name: "Language (Streetslang)", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: true, skillType: 'language', page: 135 },
  { name: "Photography/Film", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 141 },
  { name: "Accounting", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 133 },
  { name: "Sea Vehicle Tech", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 142 },
  { name: "Wardrobe & Style", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 139 },
  { name: "Cryptography", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 134 },
  { name: "Deduction", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 134 },
  { name: "Pilot Sea Vehicle", stat: 'ref', category: 'controlSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 132 },
  { name: "Heavy Weapons", stat: 'ref', category: 'rangedweaponSkills', difficulty: 'difficult', basic: false, skillType: 'generic', page: 137 },
  { name: "Drive Land Vehicle", stat: 'ref', category: 'controlSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 132 },
  { name: "Shoulder Arms", stat: 'ref', category: 'rangedweaponSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 138 },
  { name: "Autofire", stat: 'ref', category: 'rangedweaponSkills', difficulty: 'difficult', basic: false, skillType: 'generic', page: 138 },
  { name: "Weaponstech", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 142 },
  { name: "Interrogation", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 139 },
  { name: "Tracking", stat: 'int', category: 'awarenessSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 131 },
  { name: "Library Search", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 135 },
  { name: "Pick Pocket", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 142 },
  { name: "Persuasion", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 139 },
  { name: "Archery", stat: 'ref', category: 'rangedweaponSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 137 },
  { name: "Endurance", stat: 'will', category: 'bodySkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 132 },
  { name: "Concentration", stat: 'will', category: 'awarenessSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 131 },
  { name: "Personal Grooming", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 139 },
  { name: "Brawling", stat: 'dex', category: 'fightingSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 136 },
  { name: "Demolitions", stat: 'tech', category: 'techniqueSkills', difficulty: 'difficult', basic: false, skillType: 'generic', page: 140 },
  { name: "Business", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 134 },
  { name: "Wilderness Survival", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 136 },
  { name: "Handgun", stat: 'ref', category: 'rangedweaponSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 137 },
  { name: "Education", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 135 },
  { name: "Perception", stat: 'int', category: 'awarenessSkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 131 },
  { name: "Lip Reading", stat: 'int', category: 'awarenessSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 131 },
  { name: "Bribery", stat: 'cool', category: 'socialSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 138 },
  { name: "Pick Lock", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 142 },
  { name: "Conceal/Reveal Object", stat: 'int', category: 'awarenessSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 131 },
  { name: "Acting", stat: 'cool', category: 'performanceSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 137 },
  { name: "Play Instrument", stat: 'tech', category: 'performanceSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 137 },
  { name: "Air Vehicle Tech", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 140 },
  { name: "Pilot Air Vehicle", stat: 'ref', category: 'controlSkills', difficulty: 'difficult', basic: false, skillType: 'generic', page: 132 },
  { name: "Forgery", stat: 'tech', category: 'techniqueSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 141 },
  { name: "Tactics", stat: 'int', category: 'educationSkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 136 },
  { name: "Stealth", stat: 'dex', category: 'bodySkills', difficulty: 'typical', basic: true, skillType: 'generic', page: 132 },
  { name: "Paramedic", stat: 'tech', category: 'techniqueSkills', difficulty: 'difficult', basic: false, skillType: 'generic', page: 141 },
  { name: "Dance", stat: 'dex', category: 'bodySkills', difficulty: 'typical', basic: false, skillType: 'generic', page: 132 },
  { name: "Science (Chemistry)", stat: 'int', category: 'educationSkills', difficulty: 'difficult', basic: false, skillType: 'specialization', page: 136 },
];

// ─── Types ────────────────────────────────────────────────────────────────
export interface PCWeapon { name: string; damage: string; isRanged: boolean; handsReq: number; }
export interface PCArmor { name: string; headSp: number; bodySp: number; }

export const LIFEPATH_FIELDS = [
  ['CULTURAL ORIGIN', 'culturalOrigin'],
  ['PERSONALITY', 'personality'],
  ['CLOTHING STYLE', 'clothingStyle'],
  ['HAIR STYLE', 'hairStyle'],
  ['AFFECTATIONS', 'affectations'],
  ['VALUE MOST', 'valueMost'],
  ['VALUED PERSON', 'valuedPerson'],
  ['VALUED POSSESSION', 'valuedPossession'],
  ['FAMILY BACKGROUND', 'familyBackground'],
  ['CHILDHOOD ENVIRONMENT', 'childhoodEnvironment'],
  ['FAMILY CRISIS', 'familyCrisis'],
  ['LIFE GOALS', 'lifeGoals'],
  ['FRIENDS', 'friends'],
  ['ENEMIES', 'enemies'],
  ['TRAGIC LOVE AFFAIRS', 'tragicLoveAffairs'],
  ['ABOUT PEOPLE', 'aboutPeople'],
  ['ROLE LIFEPATH', 'roleLifepath'],
] as const;

export interface CPRPlayerCharacter {
  name: string;
  role: string;
  roleAbility?: string;
  roleRank: number;
  stats: Record<PCStatKey, number>;
  hp: number;
  humanity: number;
  skillLevels: Map<string, number>;
  weapons: PCWeapon[];
  armor: PCArmor[];
  cyberware: string[];
  gear: string[];
  lifepath: Record<string, string>;
  notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function makeId(a: string, b: string, idx: number): string {
  return (djb2(`pc|${a}|${b}|${idx}`).toString(16).padStart(8, '0') +
          djb2(`pc|${idx}|${b}|${a}~`).toString(16).padStart(8, '0')).slice(0, 16);
}

function findLabel(text: string, label: string): string {
  const re = new RegExp(`^${label}\\s*:\\s*(.*)$`, 'im');
  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function parseCsvList(raw: string): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Splits on commas that are NOT inside parentheses — needed for ARMOR entries
// like "Light Armorjack (Head 11, Body 11), Kevlar (Head 4, Body 4)".
function splitTopLevel(raw: string): string[] {
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

function parsePCStats(raw: string): Record<PCStatKey, number> {
  const stats = {} as Record<PCStatKey, number>;
  for (const key of PC_STAT_KEYS) stats[key] = 5;
  for (const part of raw.split(',')) {
    const m = part.trim().match(/^([A-Za-z]+)\s+(-?\d+)$/);
    if (!m) continue;
    const key = m[1].toLowerCase() as PCStatKey;
    if (PC_STAT_KEYS.includes(key)) stats[key] = parseInt(m[2], 10);
  }
  return stats;
}

function parseSkillLevels(raw: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of parseCsvList(raw)) {
    const m = entry.match(/^(.+?)\s+\+?(\d+)$/);
    if (!m) continue;
    map.set(m[1].trim().toLowerCase(), parseInt(m[2], 10));
  }
  return map;
}

function parsePCWeapons(raw: string): PCWeapon[] {
  return splitTopLevel(raw).map(entry => {
    const m = entry.match(/^(.+?)\s*\(([^)]*)\)\s*$/);
    const name = (m ? m[1] : entry).trim();
    const damage = m ? m[2].trim() : '1d6';
    const isRanged = /pistol|rifle|shotgun|smg|heavy|bow|launcher|flamethrower/i.test(name);
    return { name, damage: damage || '1d6', isRanged, handsReq: /heavy|rifle|shotgun/i.test(name) ? 2 : 1 };
  });
}

function parsePCArmor(raw: string): PCArmor[] {
  return splitTopLevel(raw).map(entry => {
    const m = entry.match(/^(.+?)\s*\(\s*Head\s*(\d+)\s*,\s*Body\s*(\d+)\s*\)\s*$/i);
    if (m) return { name: m[1].trim(), headSp: parseInt(m[2], 10), bodySp: parseInt(m[3], 10) };
    const single = entry.match(/^(.+?)\s*\(\s*(\d+)\s*SP\s*\)\s*$/i);
    if (single) return { name: single[1].trim(), headSp: parseInt(single[2], 10), bodySp: parseInt(single[2], 10) };
    return { name: entry.trim(), headSp: 0, bodySp: 0 };
  }).filter(a => a.name);
}

// ─── Main Parser ────────────────────────────────────────────────────────────
export function parseCyberpunkRedPC(text: string): CPRPlayerCharacter | null {
  if (!text?.trim()) return null;

  let name = findLabel(text, 'NAME');
  if (!name) name = text.split('\n').map(l => l.trim()).find(Boolean)?.replace(/^#+\s*/, '') || 'Unknown Edgerunner';

  const role = findLabel(text, 'ROLE');
  const roleRank = parseInt(findLabel(text, 'ROLE RANK'), 10) || 4;
  const stats = parsePCStats(findLabel(text, 'STATS'));
  const hp = parseInt(findLabel(text, 'HP'), 10) || 30;
  const humanityRaw = findLabel(text, 'HUMANITY');
  const humanity = humanityRaw ? parseInt(humanityRaw, 10) || stats.emp * 10 : stats.emp * 10;
  const skillLevels = parseSkillLevels(findLabel(text, 'SKILLS'));
  const weapons = parsePCWeapons(findLabel(text, 'WEAPONS'));
  const armor = parsePCArmor(findLabel(text, 'ARMOR'));
  const cyberware = parseCsvList(findLabel(text, 'CYBERWARE'));
  const gear = parseCsvList(findLabel(text, 'GEAR'));
  const notes = findLabel(text, 'NOTES');

  const lifepath: Record<string, string> = {};
  for (const [label, key] of LIFEPATH_FIELDS) {
    const v = findLabel(text, label);
    if (v) lifepath[key] = v;
  }

  return { name, role, roleRank, stats, hp, humanity, skillLevels, weapons, armor, cyberware, gear, lifepath, notes };
}

// ─── Foundry Exporter ───────────────────────────────────────────────────────
const _stats = () => ({
  compendiumSource: null, duplicateSource: null,
  coreVersion: CPR_CORE_VER, systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER,
  createdTime: null, modifiedTime: null, lastModifiedBy: null,
});

function skillItems(pc: CPRPlayerCharacter) {
  return SKILL_CATALOG.map((def, i) => ({
    _id: makeId(pc.name, def.name, i),
    name: def.name,
    img: 'icons/svg/item-bag.svg',
    type: 'skill',
    system: {
      basic: def.basic, category: def.category, core: true,
      description: { value: '' }, difficulty: def.difficulty, favorite: false,
      level: pc.skillLevels.get(def.name.toLowerCase()) ?? 0,
      skillType: def.skillType, source: { book: 'Core', page: def.page }, stat: def.stat,
    },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}, _stats: _stats(),
  }));
}

function roleItem(pc: CPRPlayerCharacter) {
  return {
    _id: makeId(pc.name, 'role', 0),
    name: pc.role || 'Rockerboy',
    img: 'systems/cyberpunk-red-core/icons/compendium/default/Default_Role.svg',
    type: 'role',
    system: {
      abilities: [], addRoleAbilityRank: true, bonusRatio: 1, bonuses: [],
      description: { value: '' }, favorite: false, hasRoll: false, isSituational: false,
      mainRoleAbility: pc.roleAbility || '', onByDefault: false, rank: pc.roleRank, skill: '--',
      source: { book: 'Core', page: 0 }, stat: '--', universalBonuses: [],
    },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}, _stats: _stats(),
  };
}

// A weapon we built ourselves (not pulled from Foundry's compendium) still
// needs *some* magazine value or it imports empty — best-effort by
// archetype, not book-accurate capacity.
function defaultMagazine(w: PCWeapon): number {
  if (!w.isRanged) return 0;
  const n = w.name.toLowerCase();
  if (/shotgun/.test(n)) return 4;
  if (/smg/.test(n)) return 30;
  if (/rifle/.test(n)) return 25;
  if (/launcher|grenade|heavy/.test(n)) return 1;
  if (/pistol/.test(n)) return 12;
  return 10;
}

// Foundry defaults weaponSkill to Handgun when it isn't set explicitly,
// which is wrong for anything melee.
function defaultWeaponSkill(w: PCWeapon): string {
  const n = w.name.toLowerCase();
  if (!w.isRanged) return 'Melee Weapon';
  if (/shotgun|rifle/.test(n)) return 'Shoulder Arms';
  if (/smg|autofire/.test(n)) return 'Autofire';
  if (/launcher|grenade|heavy/.test(n)) return 'Heavy Weapons';
  if (/bow/.test(n)) return 'Archery';
  return 'Handgun';
}

function weaponItems(pc: CPRPlayerCharacter) {
  return pc.weapons.map((w, i) => {
    const mag = defaultMagazine(w);
    return {
      _id: makeId(pc.name, w.name, i),
      name: w.name,
      img: 'icons/svg/sword.svg',
      type: 'weapon',
      system: {
        damage: w.damage, rof: 1, isRanged: w.isRanged, handsReq: w.handsReq, equipped: 'equipped',
        description: { value: '' }, favorite: false, quality: 'standard', price: { market: 0 },
        source: { book: 'Core', page: 0 }, magazine: { value: mag, max: mag },
        weaponSkill: defaultWeaponSkill(w),
      },
      effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}, _stats: _stats(),
    };
  });
}

function armorItems(pc: CPRPlayerCharacter) {
  return pc.armor.map((a, i) => ({
    _id: makeId(pc.name, a.name, i),
    name: a.name,
    img: 'icons/svg/shield.svg',
    type: 'armor',
    system: {
      isBodyLocation: true, isHeadLocation: true, isShield: false,
      bodyLocation: { sp: a.bodySp, ablation: 0 }, headLocation: { sp: a.headSp, ablation: 0 },
      equipped: 'equipped', description: { value: '' }, favorite: false, price: { market: 0 },
      source: { book: 'Core', page: 0 },
    },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}, _stats: _stats(),
  }));
}

function cyberwareItems(pc: CPRPlayerCharacter) {
  return pc.cyberware.map((name, i) => ({
    _id: makeId(pc.name, name, i),
    name, img: 'icons/svg/eye.svg', type: 'cyberware',
    system: { equipped: 'equipped', description: { value: '' }, favorite: false, price: { market: 0 } },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}, _stats: _stats(),
  }));
}

function gearItems(pc: CPRPlayerCharacter) {
  return pc.gear.map((name, i) => ({
    _id: makeId(pc.name, name, i),
    name, img: 'icons/svg/item-bag.svg', type: 'gear',
    system: { amount: 1, equipped: 'equipped', description: { value: '' }, favorite: false, price: { market: 0 } },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {}, _stats: _stats(),
  }));
}

export function toCyberpunkRedFoundryCharacter(pc: CPRPlayerCharacter): Record<string, unknown> {
  const items = [
    ...skillItems(pc), roleItem(pc), ...weaponItems(pc), ...armorItems(pc),
    ...cyberwareItems(pc), ...gearItems(pc),
  ];

  const lifepath: Record<string, string> = {};
  for (const [, key] of LIFEPATH_FIELDS) lifepath[key] = pc.lifepath[key] || '';

  // Foundry's CPR system tracks "current" SP as a separate actor-level pool
  // (system.externalData), not something derived from the armor item — an
  // equipped armor item still blocks 0 damage until this is set.
  const maxHeadSp = pc.armor.reduce((m, a) => Math.max(m, a.headSp), 0);
  const maxBodySp = pc.armor.reduce((m, a) => Math.max(m, a.bodySp), 0);

  return {
    _id: makeId(pc.name, 'actor', 0),
    name: pc.name, type: 'character', img: 'icons/svg/mystery-man.svg',
    effects: [], folder: null, flags: {}, ownership: { default: 0 }, _stats: _stats(),
    system: {
      externalData: {
        currentArmorHead: { value: maxHeadSp, max: maxHeadSp },
        currentArmorBody: { value: maxBodySp, max: maxBodySp },
      },
      stats: {
        int: { value: pc.stats.int }, ref: { value: pc.stats.ref }, dex: { value: pc.stats.dex },
        tech: { value: pc.stats.tech }, cool: { value: pc.stats.cool }, will: { value: pc.stats.will },
        luck: { value: pc.stats.luck, max: pc.stats.luck }, move: { value: pc.stats.move },
        body: { value: pc.stats.body }, emp: { value: pc.stats.emp, max: pc.stats.emp },
      },
      derivedStats: {
        hp: { value: pc.hp, max: pc.hp, transactions: [] },
        humanity: { value: pc.humanity, max: pc.humanity, transactions: [] },
        seriouslyWounded: Math.floor(pc.hp / 2),
        deathSave: { basePenalty: 0, penalty: 0, value: 0 },
        // Foundry recalculates run/walk from MOVE on load — these are just a
        // reasonable starting snapshot, not load-bearing.
        run: { value: pc.stats.move * 3 }, walk: { value: pc.stats.move * 2 },
      },
      information: { alias: '', description: '', history: '', notes: pc.notes },
      reputation: { transactions: [], value: 0 },
      roleInfo: { activeRole: pc.role, activeNetRole: '' },
      wealth: { transactions: [], value: 0 },
      improvementPoints: { transactions: [], value: 0 },
      lifepath,
      lifestyle: {
        extras: { cost: 0, description: '' }, fashion: { desription: '' },
        housing: { cost: 0, description: '' }, lifeStyle: { cost: 0, description: '' },
        traumaTeam: { cost: 0, description: '' },
      },
    },
    items,
  };
}

export function buildCyberpunkRedCharacterMacro(actor: Record<string, unknown>): string {
  const json = JSON.stringify(actor, null, 2);
  return `// Cyberpunk RED PC Import Macro — generated by dmtoolkit.org
// Requires: Foundry VTT + "Cyberpunk RED - Core" system
// Macro Type must be set to "Script" (not "Chat") — see the macro's Type dropdown
(async () => {
  const actorData = ${json};

  // Weapons built by this tool are simplified stubs (name, damage, rof,
  // handsReq) — no dvTable, no correct weaponSkill, no loaded magazine.
  // If the actual weapon exists in the system's core compendium, swap in
  // its real data (keeping our parsed damage, in case it's non-standard).
  // Named cyberweapons usually aren't in core_weapons at all — they live in
  // core_cyberware as isWeapon items with their combat stats already
  // attached, so that's checked second.
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
    const weaponCount = actorData.items.filter(i => i.type === 'weapon').length;
    ui.notifications.info(\`✓ Created: \${created.name} — \${weaponCount} weapons (\${weaponMatches} from compendium, \${weaponCustom} custom-built)\`);
  } else {
    ui.notifications.error('Failed to create actor — check system compatibility.');
  }
})();`;
}
