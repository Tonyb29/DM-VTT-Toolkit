// cyberpunk-red-parser.ts
// Parse Cyberpunk RED NPC stat blocks (plain-text label format) into
// Foundry VTT actor JSON for the "Cyberpunk RED - Core" system (mook type).

const CPR_SYS_ID  = 'cyberpunk-red-core';
const CPR_SYS_VER = '2.0.0';
const CPR_CORE_VER = '13.351';

// ─── Types ────────────────────────────────────────────────────────────────────

export const STAT_KEYS = ['int', 'ref', 'dex', 'tech', 'cool', 'will', 'luck', 'move', 'body', 'emp'] as const;
export type StatKey = typeof STAT_KEYS[number];

export interface CPRSkill {
  name: string;
  level: number;
  stat: StatKey;
}

export interface CPRWeapon {
  name: string;
  damage: string;
  rof: number;
  isRanged: boolean;
  handsReq: number;
}

export interface CPRNpc {
  name: string;
  role: string;
  stats: Record<StatKey, number>;
  hp: number;
  sp: number;
  skills: CPRSkill[];
  weapons: CPRWeapon[];
  armor: string[];
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

// Best-effort skill → governing stat table (Cyberpunk RED core rulebook).
// Not exhaustive — anything unrecognized defaults to 'ref'. Adjust on the
// Foundry sheet after import if a skill lands under the wrong stat.
const SKILL_STAT: Record<string, StatKey> = {
  athletics: 'dex', brawling: 'body', endurance: 'body', 'resist torture/drugs': 'will',
  acting: 'cool', bribery: 'cool', interrogation: 'cool', persuasion: 'cool',
  streetwise: 'cool', trading: 'cool', 'wardrobe & style': 'cool',
  contortionist: 'dex', dance: 'dex', evasion: 'dex', stealth: 'dex',
  conversation: 'emp', 'human perception': 'emp', leadership: 'emp',
  'personal grooming': 'emp', riding: 'emp',
  accounting: 'int', 'animal handling': 'int', bureaucracy: 'int', business: 'int',
  composition: 'int', 'conceal/reveal object': 'int', criminology: 'int',
  cryptography: 'int', deduction: 'int', education: 'int', gamble: 'int',
  language: 'int', 'library search': 'int', 'local expert': 'int',
  perception: 'int', science: 'int', tactics: 'int', 'wilderness survival': 'int',
  autofire: 'ref', 'drive land vehicle': 'ref', handgun: 'ref', 'heavy weapons': 'ref',
  'martial arts': 'ref', 'melee weapon': 'ref', 'pilot air vehicle': 'ref',
  'pilot sea vehicle': 'ref', 'shoulder arms': 'ref',
  'air vehicle tech': 'tech', 'basic tech': 'tech', cybertech: 'tech',
  demolitions: 'tech', 'electronics/security tech': 'tech', 'first aid': 'tech',
  forgery: 'tech', 'land vehicle tech': 'tech', 'paint/draw/sculpt': 'tech',
  paramedic: 'tech', 'photography/film': 'tech', 'pick lock': 'tech',
  'pick pocket': 'tech', 'play instrument': 'tech', 'sea vehicle tech': 'tech',
  weaponstech: 'tech',
};

function skillStat(name: string): StatKey {
  return SKILL_STAT[name.trim().toLowerCase()] ?? 'ref';
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

function parseSkills(raw: string): CPRSkill[] {
  return parseCsvList(raw).map(entry => {
    const m = entry.match(/^(.+?)\s*\+(\d+)$/);
    const name = (m ? m[1] : entry).trim();
    const level = m ? parseInt(m[2], 10) : 0;
    return { name, level, stat: skillStat(name) };
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

export function parseCyberpunkRedStatBlock(text: string): CPRNpc | null {
  if (!text?.trim()) return null;
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
  const armor = parseCsvList(findLabel(lines, 'ARMOR'));
  const cyberware = parseCsvList(findLabel(lines, 'CYBERWARE'));
  const notes = findLabel(lines, 'NOTES');

  return { name: name || 'Unknown NPC', role, stats, hp, sp, skills, weapons, armor, cyberware, notes };
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
    system: { level: skill.level, stat: skill.stat, core: false, basic: false },
  };
}

function weaponItem(weapon: CPRWeapon, actorName: string, idx: number) {
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
    },
  };
}

function armorItem(name: string, sp: number, actorName: string, idx: number) {
  return {
    _id: makeId(actorName, name, idx),
    name,
    type: 'armor',
    img: 'icons/svg/shield.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: { systemId: CPR_SYS_ID, systemVersion: CPR_SYS_VER, coreVersion: CPR_CORE_VER, createdTime: null, modifiedTime: null, lastModifiedBy: null },
    system: {
      isBodyLocation: true,
      isHeadLocation: false,
      isShield: false,
      bodyLocation: { sp, ablation: 0 },
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
    ...npc.armor.map((a, i) => armorItem(a, npc.sp, npc.name, i)),
    ...npc.cyberware.map((c, i) => cyberwareItem(c, npc.name, i)),
  ];

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
      information: {
        alias: npc.role,
        notes: npc.notes,
      },
    },
    items,
  };
}

// ─── Macro Builder ────────────────────────────────────────────────────────────

export function buildCyberpunkRedImportMacro(actor: Record<string, unknown>): string {
  const json = JSON.stringify(actor, null, 2);
  return `// Cyberpunk RED Import Macro — generated by dmtoolkit.org
// Requires: Foundry VTT + "Cyberpunk RED - Core" system
// Run in Foundry's macro editor (Ctrl+Enter or Execute)
(async () => {
  const actorData = ${json};

  const existing = game.actors.getName(actorData.name);
  if (existing) {
    await existing.delete();
    ui.notifications.info('Replaced existing actor: ' + actorData.name);
  }

  const created = await Actor.create(actorData);
  if (created) {
    ui.notifications.info('✓ Created: ' + created.name);
  } else {
    ui.notifications.error('Failed to create actor — check system compatibility.');
  }
})();`;
}
