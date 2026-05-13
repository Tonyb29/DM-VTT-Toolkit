// draw-steel-parser.ts
// Parse Draw Steel (MCDM) stat blocks in SteelCompendium markdown format
// → Foundry VTT actor JSON for the draw-steel game system (MetaMorphic-Digital v1.0.0+)

const DS_CORE_VER = '13.351';
const DS_SYS_VER  = '1.0.0';
const DS_SYS_ID   = 'draw-steel';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DSPowerRoll {
  characteristic: string;
  tier1: string;
  tier2: string;
  tier3: string;
}

export interface DSAbility {
  name: string;
  emojiPrefix: string;
  category: 'basic' | 'signature' | 'malice' | 'villain';
  maliceCost: number;           // 0 if not a malice ability
  villainActionNum: number;     // 0 if not a villain action
  actionType: string;           // 'action' | 'maneuver' | 'triggered' | 'free' | 'none'
  actionCost: number;           // number of actions (1, 2, 3) or 0
  keywords: string[];
  distance: string;
  target: string;
  trigger: string;
  powerRoll: DSPowerRoll | null;
  effect: string;
  special: string;
}

export interface DSActor {
  name: string;
  level: number;
  ev: number;
  stamina: number;
  speed: number;
  sizeValue: number;
  sizeMod: string;
  stability: number;
  freeStrike: number;
  might: number;
  agility: number;
  reason: number;
  intuition: number;
  presence: number;
  ancestry: string[];
  roles: string[];
  immunities: string[];
  weaknesses: string[];
  abilities: DSAbility[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeId(actorName: string, itemName: string, idx: number): string {
  const a = djb2(`ds|actor|${actorName}|${itemName}|${idx}`).toString(16).padStart(8, '0');
  const b = djb2(`ds|item|${idx}|${itemName}|${actorName}`).toString(16).padStart(8, '0');
  return (a + b).slice(0, 16);
}

function parseFrontmatter(text: string): Record<string, unknown> {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let arrayMode = false;
  const arr: string[] = [];

  for (const line of lines) {
    const arrItem = line.match(/^\s+-\s+(.+)$/);
    const kvMatch = line.match(/^([\w_]+):\s*(.*)$/);
    if (arrItem && arrayMode) {
      arr.push(arrItem[1].trim());
    } else if (kvMatch) {
      if (arrayMode && currentKey) {
        result[currentKey] = [...arr];
        arr.length = 0;
        arrayMode = false;
      }
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === '') {
        arrayMode = true;
      } else {
        const n = Number(val);
        result[currentKey] = isNaN(n) ? val : n;
      }
    }
  }
  if (arrayMode && currentKey) result[currentKey] = [...arr];
  return result;
}

function parseSize(raw: string | number): { sizeValue: number; sizeMod: string } {
  const s = String(raw).trim();
  const match = s.match(/^(\d+)([A-Za-z]?)$/);
  if (match) {
    return { sizeValue: parseInt(match[1]) || 1, sizeMod: match[2].toUpperCase() || 'M' };
  }
  const namedMap: Record<string, { sizeValue: number; sizeMod: string }> = {
    tiny: { sizeValue: 1, sizeMod: 'T' },
    small: { sizeValue: 1, sizeMod: 'S' },
    medium: { sizeValue: 1, sizeMod: 'M' },
    large: { sizeValue: 2, sizeMod: 'L' },
    huge: { sizeValue: 3, sizeMod: 'H' },
    gargantuan: { sizeValue: 4, sizeMod: 'G' },
  };
  return namedMap[s.toLowerCase()] ?? { sizeValue: 1, sizeMod: 'M' };
}

function normalizeChar(raw: string): string {
  const m: Record<string, string> = {
    might: 'might', mgt: 'might',
    agility: 'agility', agi: 'agility',
    reason: 'reason', res: 'reason',
    intuition: 'intuition', int: 'intuition', intu: 'intuition',
    presence: 'presence', pre: 'presence',
  };
  return m[raw.toLowerCase()] ?? raw.toLowerCase();
}

const EMOJI_CATEGORY: Record<string, 'basic' | 'signature' | 'villain' | 'basic'> = {
  '⭐': 'signature',
  '⭐️': 'signature',
  '☠': 'villain',
  '☠️': 'villain',
};

function parseActionType(line: string): { actionType: string; actionCost: number } {
  const lower = line.toLowerCase();
  if (/free\s+maneuver|free\s+action/.test(lower)) return { actionType: 'free', actionCost: 0 };
  if (/triggered\s+action|trigger/.test(lower)) return { actionType: 'triggered', actionCost: 0 };
  if (/maneuver/.test(lower)) return { actionType: 'maneuver', actionCost: 1 };
  if (/no\s+action/.test(lower)) return { actionType: 'none', actionCost: 0 };
  const actionMatch = line.match(/(\d+)\s+action/i);
  if (actionMatch) return { actionType: 'action', actionCost: parseInt(actionMatch[1]) };
  return { actionType: 'action', actionCost: 1 };
}

// ─── Ability Block Parser ─────────────────────────────────────────────────────

function parseAbilityBlock(blockText: string): DSAbility | null {
  // Strip blockquote prefix from each line
  const lines = blockText
    .split('\n')
    .map(l => l.replace(/^>\s?/, '').trimEnd())
    .filter((l, i, arr) => !(l === '' && (i === 0 || arr[i - 1] === '')));

  if (!lines.length) return null;

  // Find the heading line (#### or ## or **)
  const headingLine = lines.find(l => /^#{1,6}\s/.test(l) || /^\*\*[^*]/.test(l));
  if (!headingLine) return null;

  const headingText = headingLine.replace(/^#{1,6}\s+/, '').trim();

  // Extract emoji prefix
  const emojiMatch = headingText.match(/^([🗡🏹🔳❇❗⭐☠🌀✦🗲⚡💀🔥❄🌊⚔🛡🎯🔮🌿🌀][️]?)\s*/u);
  const emojiPrefix = emojiMatch ? emojiMatch[1] : '';
  let rawName = headingText.replace(/^[🗡🏹🔳❇❗⭐☠🌀✦🗲⚡💀🔥❄🌊⚔🛡🎯🔮🌿🌀][️]?\s*/u, '').trim();

  // Extract annotations from name
  let category: DSAbility['category'] = EMOJI_CATEGORY[emojiPrefix] ?? 'basic';
  let maliceCost = 0;
  let villainActionNum = 0;

  const sigMatch = rawName.match(/\s*\(Signature\s+Ability\)/i);
  if (sigMatch) { category = 'signature'; rawName = rawName.replace(sigMatch[0], '').trim(); }

  const maliceMatch = rawName.match(/\s*\((\d+)\s+Malice\)/i);
  if (maliceMatch) { category = 'malice'; maliceCost = parseInt(maliceMatch[1]); rawName = rawName.replace(maliceMatch[0], '').trim(); }

  const villainMatch = rawName.match(/\s*\(Villain\s+Action\s+(\d+)\)/i);
  if (villainMatch) { category = 'villain'; villainActionNum = parseInt(villainMatch[1]); rawName = rawName.replace(villainMatch[0], '').trim(); }

  const name = rawName;

  // Second line: keywords (italic) — *Keywords: Attack, Melee, Weapon* or *Attack, Melee*
  let keywords: string[] = [];
  const kwLine = lines.find(l => /^\*[^*]/.test(l));
  if (kwLine) {
    const kwText = kwLine.replace(/^\*+/, '').replace(/\*+$/, '').trim();
    const withoutLabel = kwText.replace(/^keywords?\s*:\s*/i, '');
    keywords = withoutLabel.split(/[,·•|]/).map(k => k.trim().toLowerCase()).filter(Boolean);
  }

  // Action / distance / target line: "**1 Action** | Ranged 10 | One creature"
  let actionType = 'action';
  let actionCost = 1;
  let distance = '';
  let target = '';
  const actionLine = lines.find(l => /\*\*\d+\s+action|free\s+maneuver|triggered\s+action|maneuver|no\s+action/i.test(l));
  if (actionLine) {
    const parts = actionLine.replace(/\*\*/g, '').split(/\s*\|\s*/);
    if (parts[0]) ({ actionType, actionCost } = parseActionType(parts[0]));
    if (parts[1]) distance = parts[1].trim();
    if (parts[2]) target = parts[2].trim();
  }

  // Trigger line
  let trigger = '';
  const triggerLine = lines.find(l => /^\*\*Trigger\*\*|^Trigger:/i.test(l));
  if (triggerLine) trigger = triggerLine.replace(/^\*\*Trigger\*\*\s*:?\s*|^Trigger:\s*/i, '').trim();

  // Power Roll
  let powerRoll: DSPowerRoll | null = null;
  const prHeaderIdx = lines.findIndex(l => /power\s+roll/i.test(l));
  if (prHeaderIdx >= 0) {
    const prHeader = lines[prHeaderIdx];
    const charMatch = prHeader.match(/\+\s*([A-Za-z]+)/);
    const characteristic = charMatch ? normalizeChar(charMatch[1]) : 'might';

    const tierLines = lines.slice(prHeaderIdx + 1).filter(l => /^[-–•]\s*(≤|<=|\d)/.test(l));
    const parseTier = (i: number) => {
      if (!tierLines[i]) return '';
      return tierLines[i].replace(/^[-–•]\s*(≤\d+|<=\d+|\d+[-–]\d+|\d+\+)\s*:\s*/, '').trim();
    };
    powerRoll = { characteristic, tier1: parseTier(0), tier2: parseTier(1), tier3: parseTier(2) };
  }

  // Effect line (after power roll tiers)
  let effect = '';
  const effectIdx = lines.findIndex(l => /^\*\*Effect\*\*|^Effect:/i.test(l));
  if (effectIdx >= 0) {
    const effectParts = [lines[effectIdx].replace(/^\*\*Effect\*\*\s*:?\s*|^Effect:\s*/i, '').trim()];
    for (let i = effectIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^\*\*|^#{1,6}\s/.test(l)) break;
      effectParts.push(l);
    }
    effect = effectParts.filter(Boolean).join(' ').trim();
  }

  // Special line
  let special = '';
  const specialIdx = lines.findIndex(l => /^\*\*Special\*\*|^Special:/i.test(l));
  if (specialIdx >= 0) {
    special = lines[specialIdx].replace(/^\*\*Special\*\*\s*:?\s*|^Special:\s*/i, '').trim();
  }

  return {
    name, emojiPrefix, category, maliceCost, villainActionNum,
    actionType, actionCost, keywords,
    distance, target, trigger,
    powerRoll, effect, special,
  };
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseDrawSteelStatBlock(text: string): DSActor | null {
  if (!text?.trim()) return null;

  const fm = parseFrontmatter(text);
  const bodyText = text.replace(/^---[\s\S]*?---\s*\n/, '');

  // Derive name from frontmatter or first # heading
  let name = (fm['name'] as string) ?? '';
  if (!name) {
    const h1 = bodyText.match(/^#\s+(.+)$/m);
    name = h1 ? h1[1].trim() : 'Unknown Creature';
  }

  const n = (key: string, def = 0) => typeof fm[key] === 'number' ? fm[key] as number : def;
  const a = (key: string): string[] => Array.isArray(fm[key]) ? fm[key] as string[] : typeof fm[key] === 'string' ? [fm[key] as string] : [];

  const sizeRaw = fm['size'] ?? '1M';
  const { sizeValue, sizeMod } = parseSize(sizeRaw as string | number);

  // Parse immunities / weaknesses from frontmatter lists
  const immunities = a('immunities');
  const weaknesses = a('weaknesses');

  // Extract ability blocks separated by <!-- --> or >---
  const blockSections = bodyText.split(/<!--\s*-->|^---$/m);
  const abilities: DSAbility[] = [];
  for (const section of blockSections) {
    const trimmed = section.trim();
    // Only parse sections that look like blockquotes
    if (!trimmed.startsWith('>')) continue;
    const ability = parseAbilityBlock(trimmed);
    if (ability) abilities.push(ability);
  }

  return {
    name,
    level: n('level', 1),
    ev: n('ev', 0),
    stamina: n('stamina', 10),
    speed: n('speed', 5),
    sizeValue,
    sizeMod,
    stability: n('stability', 0),
    freeStrike: n('free_strike', 2),
    might: n('might', 0),
    agility: n('agility', 0),
    reason: n('reason', 0),
    intuition: n('intuition', 0),
    presence: n('presence', 0),
    ancestry: a('ancestry'),
    roles: a('roles'),
    immunities,
    weaknesses,
    abilities,
  };
}

// ─── Foundry Exporter ─────────────────────────────────────────────────────────

function abilityItem(ability: DSAbility, actorName: string, idx: number) {
  return {
    _id: makeId(actorName, ability.name, idx),
    name: ability.name,
    type: 'ability',
    img: 'icons/svg/mystery-man.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: {
      systemId: DS_SYS_ID,
      systemVersion: DS_SYS_VER,
      coreVersion: DS_CORE_VER,
      createdTime: null,
      modifiedTime: null,
      lastModifiedBy: null,
    },
    system: {
      actionType: ability.actionType,
      actionCost: ability.actionCost,
      category: ability.category,
      maliceCost: ability.maliceCost,
      villainActionNum: ability.villainActionNum,
      keywords: ability.keywords,
      distance: ability.distance,
      target: ability.target,
      trigger: ability.trigger,
      powerRoll: ability.powerRoll ?? null,
      effect: ability.effect,
      special: ability.special,
    },
  };
}

export function toDrawSteelFoundryActor(ds: DSActor): Record<string, unknown> {
  const actorId = makeId(ds.name, 'actor', 0);
  const items = ds.abilities.map((ab, i) => abilityItem(ab, ds.name, i));

  return {
    _id: actorId,
    name: ds.name,
    type: 'npc',
    img: 'icons/svg/mystery-man.svg',
    effects: [],
    folder: null,
    flags: {},
    ownership: { default: 0 },
    _stats: {
      systemId: DS_SYS_ID,
      systemVersion: DS_SYS_VER,
      coreVersion: DS_CORE_VER,
      createdTime: null,
      modifiedTime: null,
      lastModifiedBy: null,
    },
    system: {
      level: ds.level,
      ev: ds.ev,
      stamina: { value: ds.stamina, max: ds.stamina },
      speed: { value: ds.speed },
      size: { value: ds.sizeValue, mod: ds.sizeMod },
      stability: ds.stability,
      freeStrike: ds.freeStrike,
      characteristics: {
        might: ds.might,
        agility: ds.agility,
        reason: ds.reason,
        intuition: ds.intuition,
        presence: ds.presence,
      },
      keywords: ds.ancestry.map(a => a.toLowerCase()).concat(ds.roles.map(r => r.toLowerCase())),
      roles: ds.roles.map(r => ({ type: r.toLowerCase(), isLeader: false })),
      immunities: ds.immunities,
      weaknesses: ds.weaknesses,
    },
    items,
  };
}

// ─── Macro Builder ────────────────────────────────────────────────────────────

export function buildDrawSteelImportMacro(actor: Record<string, unknown>): string {
  const json = JSON.stringify(actor, null, 2);
  return `// Draw Steel Import Macro — generated by dmtoolkit.org
// Requires: Foundry VTT + draw-steel system (MetaMorphic-Digital) v1.0.0+
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
    ui.notifications.info('✓ Created: ' + created.name + ' (Level ' + actorData.system.level + ')');
  } else {
    ui.notifications.error('Failed to create actor — check system compatibility.');
  }
})();`;
}
