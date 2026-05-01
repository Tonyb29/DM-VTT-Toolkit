// pf2e-parser.ts
// Pathfinder 2e (Remaster) Stat Block → Foundry VTT pf2e NPC JSON
// Schema reverse-engineered from Foundry pf2e v7.12.2 / core v13.351
// Supports: Archives of Nethys text format, PDF paste (Unicode action symbols)

const PF2E_CORE_VER = '13.351';
const PF2E_SYS_VER  = '7.12.2';

// ─── Maps ────────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<string, string> = {
  tiny: 'tiny', small: 'sm', medium: 'med', large: 'lg', huge: 'huge', gargantuan: 'grg',
};

const TRADITION_ABILITY: Record<string, string> = {
  arcane: 'int', divine: 'wis', occult: 'cha', primal: 'wis', focus: 'wis',
};

const ACTION_IMG: Record<string, string> = {
  passive:  'systems/pf2e/icons/actions/Passive.webp',
  action1:  'systems/pf2e/icons/actions/OneAction.webp',
  action2:  'systems/pf2e/icons/actions/TwoActions.webp',
  action3:  'systems/pf2e/icons/actions/ThreeActions.webp',
  reaction: 'systems/pf2e/icons/actions/Reaction.webp',
  free:     'systems/pf2e/icons/actions/FreeAction.webp',
};

const SKILL_SLUG: Record<string, string> = {
  acrobatics: 'acrobatics', arcana: 'arcana', athletics: 'athletics',
  crafting: 'crafting', deception: 'deception', diplomacy: 'diplomacy',
  intimidation: 'intimidation', medicine: 'medicine', nature: 'nature',
  occultism: 'occultism', performance: 'performance', religion: 'religion',
  society: 'society', stealth: 'stealth', survival: 'survival', thievery: 'thievery',
  lore: 'lore',
};

const SIZE_TAGS      = new Set(['tiny','small','medium','large','huge','gargantuan']);
const RARITY_TAGS    = new Set(['uncommon','rare','unique']);
const ALIGN_ABBREV   = new Set(['lg','ln','le','ng','nn','ne','cg','cn','ce']);

// PF2e Remaster (2023): alignment + most spell school tags removed; energy types remapped
// "illusion" kept — valid as an action descriptor trait (distinct from spell school tag)
const REMASTER_REMOVED_TRAITS = new Set([
  'evil','good','lawful','chaotic',
  'necromancy','evocation','transmutation','abjuration',
  'conjuration','divination','enchantment',
]);
// These traits are renamed in Remaster, not removed
const REMASTER_TRAIT_MAP: Record<string, string> = {
  'negative': 'void', 'positive': 'vitality',
};
// Attack damage roll types — "spirit" is valid; "unholy"/"holy" are not valid damageType values
const REMASTER_ROLL_TYPE_MAP: Record<string, string> = {
  'evil': 'spirit', 'good': 'spirit',
  'negative': 'void', 'positive': 'vitality',
};
// Immunity/weakness/resistance types — "holy" and "unholy" ARE valid here
const REMASTER_ENERGY_TYPE_MAP: Record<string, string> = {
  'evil': 'unholy', 'good': 'holy',
  'negative': 'void', 'positive': 'vitality',
};

function remasterTrait(t: string): string | null {
  if (REMASTER_REMOVED_TRAITS.has(t)) return null;
  return REMASTER_TRAIT_MAP[t] ?? t;
}
function remasterDamageRollType(t: string): string {
  return REMASTER_ROLL_TYPE_MAP[t.toLowerCase()] ?? t;
}
function remasterEnergyType(t: string): string {
  return REMASTER_ENERGY_TYPE_MAP[t.toLowerCase()] ?? t;
}

// Keywords that are clearly not ability-line starters
// Spellcasting lines (arcane/divine/etc.) are handled before the ability check, so
// tradition words are intentionally excluded here — they can be valid ability name starts
const NON_ABILITY_PREFIXES = /^(melee|ranged|speed\s|ac\s|hp\s|perception\s|languages\s|skills\s|str\s|items\s)/i;

// Split by comma while respecting parentheses — prevents "(at will, good only)" from splitting
function splitCommaRespectingParens(str: string): string[] {
  const result: string[] = [];
  let depth = 0, cur = '';
  for (const ch of str) {
    if (ch === '(') { depth++; cur += ch; }
    else if (ch === ')') { depth--; cur += ch; }
    else if (ch === ',' && depth === 0) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  if (cur) result.push(cur);
  return result;
}

// Lines that start a new section — NOT description continuations
const NEW_SECTION = /^(melee|ranged|speed\s|ac\s|hp\s|perception\s|languages\s|skills\s|str\s|items\s|arcane|divine|occult|primal|focus)/i;
// Lines that are clearly inside an ability description
const CONTINUATION_STARTS = /^(trigger|effect|requirements|critical success|success|failure|critical failure|frequency|duration|range|area|targets|saving throw|defense|activate|special|heightened)/i;

function isContinuationLine(line: string): boolean {
  if (!line.trim()) return false;
  if (NEW_SECTION.test(line)) return false;
  // New ability with action tag → new item, not continuation
  if (/^[A-Z][A-Za-z0-9 ''\-+]+?\s+\[[^\]]+\]/.test(line)) return false;
  // Known PF2e ability sub-fields
  if (CONTINUATION_STARTS.test(line)) return true;
  // Lowercase or dash start → continuation text
  if (/^[a-z—–]/.test(line)) return true;
  // Common sentence starters that appear in multi-line descriptions
  if (/^(The |A |An |This |These |That |Those |It |Its |They |Their |If |When |While |On |In |At |For |As |Each |Any |All |Both |One |Two |Three )/i.test(line)) return true;
  return false;
}

// ─── ID Generation ────────────────────────────────────────────────────────────

function djb2(s: string): number {
  let h = 5381;
  for (const c of s) h = ((h << 5) + h) ^ c.charCodeAt(0);
  return h >>> 0;
}

function makeId(prefix: string, actor: string, item: string): string {
  const a = djb2(`pf2|${prefix}|${actor}|${item}`).toString(16).padStart(8, '0');
  const b = djb2(`${item}|${prefix}|${actor}`).toString(16).padStart(8, '0');
  return (a + b).slice(0, 16);
}

// ─── Text Normalization ───────────────────────────────────────────────────────

function normalizeSymbols(text: string): string {
  return text
    .replace(/◆◆◆/g, '[three-actions]')
    .replace(/◆◆/g,  '[two-actions]')
    .replace(/◆/g,   '[one-action]')
    .replace(/↺/g,   '[reaction]')
    .replace(/◇/g,   '[free-action]')
    .replace(/\[>>>\]/g, '[three-actions]')
    .replace(/\[>>\]/g,  '[two-actions]')
    .replace(/\[>\]/g,   '[one-action]')
    .replace(/\[1\]/g, '[one-action]')
    .replace(/\[2\]/g, '[two-actions]')
    .replace(/\[3\]/g, '[three-actions]')
    .replace(/\[R\]/gi, '[reaction]')
    .replace(/\[F\]/gi, '[free-action]');
}

function actionTagToMeta(tag: string): { type: string; value: number | null; img: string } {
  switch (tag) {
    case '[one-action]':    return { type: 'action',   value: 1,    img: ACTION_IMG.action1 };
    case '[two-actions]':   return { type: 'action',   value: 2,    img: ACTION_IMG.action2 };
    case '[three-actions]': return { type: 'action',   value: 3,    img: ACTION_IMG.action3 };
    case '[reaction]':      return { type: 'reaction', value: null, img: ACTION_IMG.reaction };
    case '[free-action]':   return { type: 'free',     value: null, img: ACTION_IMG.free };
    default:                return { type: 'passive',  value: null, img: ACTION_IMG.passive };
  }
}

// ─── Shared Item Skeleton ─────────────────────────────────────────────────────

function itemSkeleton(id: string, name: string, type: string, sort: number, img: string) {
  return {
    _id: id, img, name, sort, type,
    effects: [], folder: null, flags: {}, ownership: { default: 0 },
    _stats: {
      compendiumSource: null, duplicateSource: null, exportSource: null,
      coreVersion: PF2E_CORE_VER, systemId: 'pf2e', systemVersion: PF2E_SYS_VER,
      lastModifiedBy: null,
    },
  };
}

function migration() { return { version: 0.955, previous: null }; }

// ─── Attack Trait Normalization ───────────────────────────────────────────────

function normalizeAttackTrait(raw: string): string {
  const t = raw.trim().toLowerCase();
  const m = (re: RegExp) => t.match(re);
  if (m(/^reach[-\s](\d+)/))       return `reach-${m(/^reach[-\s](\d+)/)![1]}`;
  if (m(/^thrown[-\s](\d+)/))      return `thrown-${m(/^thrown[-\s](\d+)/)![1]}`;
  if (m(/^deadly[-\s](d\d+)/))     return `deadly-${m(/^deadly[-\s](d\d+)/)![1]}`;
  if (m(/^fatal[-\s](d\d+)/))      return `fatal-${m(/^fatal[-\s](d\d+)/)![1]}`;
  if (m(/^versatile[-\s]([sbpfce])/)) return `versatile-${m(/^versatile[-\s]([sbpfce])/)![1]}`;
  if (m(/^reload[-\s](\d+)/))      return `reload-${m(/^reload[-\s](\d+)/)![1]}`;
  return t.replace(/\s+/g, '-');
}

// ─── Damage Roll Parser ───────────────────────────────────────────────────────

interface DmgRoll { damage: string; damageType: string; category: string | null; }

function parseDamage(raw: string): DmgRoll[] {
  const results: DmgRoll[] = [];
  const parts = raw.split(/\s+(?:plus|and)\s+/i);
  for (const part of parts) {
    const p = part.trim();
    const persistent = /\bpersistent\b/i.test(p);
    const clean = p.replace(/\bpersistent\b/gi, '').replace(/[()]/g, '').trim();
    const m = clean.match(/^(\d+d\d+(?:[+-]\d+)?|\d+)\s+([a-z]+(?:\s+[a-z]+)?)/i);
    if (m) results.push({ damage: m[1], damageType: remasterDamageRollType(m[2].toLowerCase().trim()), category: persistent ? 'persistent' : null });
  }
  return results;
}

// ─── Melee / Ranged Attack Builder ────────────────────────────────────────────

function buildMeleeItem(line: string, actor: string, sort: number): object | null {
  // Melee/Ranged [action?] name +N (traits), Damage ...
  const m = line.match(
    /^(Melee|Ranged)\s+(?:\[[^\]]+\]\s+)?(.+?)\s+([+-]\d+)(?:\s+\[[^\]]+\])?\s*(?:\(([^)]*)\))?\s*[,;]\s*Damage\s+(.+)/i
  );
  if (!m) return null;
  const [, weaponType, rawName, bonusStr, traitStr, damageStr] = m;
  const name    = rawName.trim();
  const bonus   = parseInt(bonusStr, 10);
  const ranged  = weaponType.toLowerCase() === 'ranged';
  const rawTraits = (traitStr ?? '').split(',').map(t => t.trim()).filter(Boolean);

  const traits: string[]  = [];
  const effects: string[] = [];
  let rangeIncrement: number | null = null;

  for (const rt of rawTraits) {
    const lower = rt.toLowerCase();
    if (/^range\s+(?:increment\s+)?(\d+)/.test(lower)) {
      const rm = lower.match(/(\d+)/);
      if (rm) rangeIncrement = parseInt(rm[1], 10);
    } else if (/^(grab|improved grab|knockdown|push|pull)$/.test(lower)) {
      effects.push(lower.replace(/\s+/g, '-'));
    } else {
      const normalized = normalizeAttackTrait(rt);
      if (!REMASTER_REMOVED_TRAITS.has(normalized)) traits.push(normalized);
    }
  }

  const dmgRolls = parseDamage(damageStr);
  const damageRolls: Record<string, DmgRoll> = {};
  for (const roll of dmgRolls) {
    const key = makeId('roll', actor, name + roll.damageType + (roll.category ?? '')).slice(0, 20);
    damageRolls[key] = roll;
  }

  const id = makeId('melee', actor, name);
  return {
    ...itemSkeleton(id, name, 'melee', sort, 'systems/pf2e/icons/default-icons/melee.svg'),
    system: {
      attackEffects: { value: effects },
      bonus: { value: bonus },
      damageRolls,
      description: { value: '', gm: '' },
      publication: { license: 'OGL', remaster: false, title: '', authors: '' },
      range: ranged && rangeIncrement ? { increment: rangeIncrement, max: null } : null,
      rules: [], slug: null,
      traits: { value: traits, otherTags: [], config: {} },
      _migration: migration(),
      action: 'strike', area: null, subjectToMAP: true,
    },
  };
}

// ─── Spellcasting Builder ─────────────────────────────────────────────────────

interface SpellEntry { name: string; rank: number; atWill: boolean; perDay: number | null; heightenedTo: number | null; slotCount: number | null; }

function emptySlots() {
  const s: Record<string, { prepared: Array<{id:string}>; value: number; max: number }> = {};
  for (let i = 0; i <= 11; i++) s[`slot${i}`] = { prepared: [], value: 0, max: 0 };
  return s;
}

function buildSpellcasting(line: string, actor: string, startSort: number): { entry: object; spells: object[] } | null {
  const hdr = line.match(
    /^(Arcane|Divine|Occult|Primal|Focus)\s+(Prepared|Innate|Spontaneous)\s+Spells?\s+DC\s+(\d+)(?:,?\s*attack\s+([+-]\d+))?/i
  );
  if (!hdr) return null;
  const [, tradRaw, prepRaw, dcStr, atkStr] = hdr;
  const tradition = tradRaw.toLowerCase();
  const prepared  = prepRaw.toLowerCase();
  const dc  = parseInt(dcStr, 10);
  const atk = atkStr ? parseInt(atkStr, 10) : dc - 8;
  const entryId = makeId('spellEntry', actor, `${tradRaw} ${prepRaw} Spells`);

  // Parse rank sections separated by semicolons after the header
  const afterHeader = line.slice(line.indexOf(';') + 1);
  const spellEntries: SpellEntry[] = [];
  let maxRank = 0;

  for (const section of afterHeader.split(/;\s*/)) {
    const s = section.trim();
    if (!s) continue;
    // Cantrips (Nth)
    const cantripM = s.match(/^Cantrips?\s+\((\d+)(?:st|nd|rd|th)\)\s+(.+)/i);
    if (cantripM) {
      const ht = parseInt(cantripM[1], 10);
      for (const n of cantripM[2].split(',').map(x => x.trim()).filter(Boolean)) {
        spellEntries.push({ name: n, rank: 0, atWill: true, perDay: null, heightenedTo: ht, slotCount: null });
      }
      continue;
    }
    // Constant (Nth) — always-active innate spells
    const constantM = s.match(/^Constant\s+\((\d+)(?:st|nd|rd|th)\)\s+(.+)/i);
    if (constantM) {
      const ht = parseInt(constantM[1], 10);
      for (const n of constantM[2].split(',').map(x => x.trim()).filter(Boolean)) {
        spellEntries.push({ name: n, rank: ht, atWill: true, perDay: null, heightenedTo: ht, slotCount: null });
      }
      continue;
    }
    // Nth spell(s) — optionally "(N slots)" for spontaneous e.g. "5th (3 slots) heal, sound burst"
    const rankM = s.match(/^(\d+)(?:st|nd|rd|th)\s+(?:\((\d+)\s*(?:slots?)?\)\s+)?(.+)/i);
    if (rankM) {
      const rank      = parseInt(rankM[1], 10);
      const slotCount = rankM[2] ? parseInt(rankM[2], 10) : null;
      if (rank > maxRank) maxRank = rank;
      for (const part of splitCommaRespectingParens(rankM[3]).map(p => p.trim()).filter(Boolean)) {
        // "at will" — may have extra notes: "(at will, good only)"
        const awM  = part.match(/^(.+?)\s*\(at\s+will[^)]*\)/i);
        // "N/day" explicit
        const dayM = part.match(/^(.+?)\s*\((\d+)\/day\)/i);
        // ×N or xN — shorthand for N/day (e.g. "plane shift (×2)")
        const mulM = part.match(/^(.+?)\s*\([×x](\d+)\)/i);
        const clean = part.replace(/\([^)]*\)/g, '').trim();
        if (awM)       spellEntries.push({ name: awM[1].trim(),  rank, atWill: true,  perDay: null,                heightenedTo: null, slotCount });
        else if (dayM) spellEntries.push({ name: dayM[1].trim(), rank, atWill: false, perDay: parseInt(dayM[2],10), heightenedTo: null, slotCount });
        else if (mulM) spellEntries.push({ name: mulM[1].trim(), rank, atWill: false, perDay: parseInt(mulM[2],10), heightenedTo: null, slotCount });
        else if (clean) spellEntries.push({ name: clean,         rank, atWill: false, perDay: null,                heightenedTo: null, slotCount });
      }
    }
  }

  const slots = emptySlots();
  if (prepared === 'prepared') {
    for (const se of spellEntries) {
      if (se.rank === 0) continue;
      const sk = `slot${se.rank}`;
      slots[sk].max++;
      slots[sk].value++;
      slots[sk].prepared.push({ id: makeId('spell', actor, se.name) });
    }
    const cCount = spellEntries.filter(s => s.rank === 0).length;
    if (cCount) slots.slot0.max = cCount;
  } else if (prepared === 'innate') {
    for (const se of spellEntries) {
      if (se.rank > 0 && !se.atWill) {
        const sk = `slot${se.rank}`;
        const uses = se.perDay ?? 1;
        slots[sk].max   += uses;
        slots[sk].value += uses;
      }
    }
  } else if (prepared === 'spontaneous') {
    // Slot count comes from "(N slots)" in the stat block; fall back to 1 per spell entry
    const rankSlotCounts: Record<number, number> = {};
    for (const se of spellEntries) {
      if (se.rank > 0 && !rankSlotCounts[se.rank]) {
        rankSlotCounts[se.rank] = se.slotCount ?? 1;
      }
    }
    for (const [rankStr, count] of Object.entries(rankSlotCounts)) {
      const sk = `slot${rankStr}`;
      slots[sk].max   = count;
      slots[sk].value = count;
    }
    const cCount = spellEntries.filter(s => s.rank === 0).length;
    if (cCount) { slots.slot0.max = cCount; slots.slot0.value = cCount; }
  }

  const entryName = `${tradRaw} ${prepRaw.charAt(0).toUpperCase() + prepRaw.slice(1)} Spells`;
  const entry = {
    ...itemSkeleton(entryId, entryName, 'spellcastingEntry', startSort, 'systems/pf2e/icons/default-icons/spellcastingEntry.svg'),
    system: {
      description: { gm: '', value: '' }, rules: [], slug: null,
      _migration: { version: 0.955, lastMigration: null, previous: null },
      traits: { otherTags: [] },
      publication: { title: '', authors: '', license: 'OGL', remaster: false },
      ability: { value: TRADITION_ABILITY[tradition] ?? 'cha' },
      spelldc: { value: atk, dc, mod: 0 },
      tradition: { value: tradition },
      prepared: { value: prepared, flexible: false },
      showSlotlessLevels: { value: false },
      proficiency: { value: 0 },
      slots,
      autoHeightenLevel: { value: prepared === 'innate' ? (maxRank || null) : null },
    },
  };

  const spells: object[] = [];
  let spellSort = startSort + 100000;
  for (const se of spellEntries) {
    const spellId = makeId('spell', actor, se.name);
    const ht      = se.heightenedTo ?? se.rank;
    const displayName = se.atWill  ? `${se.name} (At Will)`
                      : se.perDay  ? `${se.name} (${se.perDay}/day)`
                      : se.name;
    const slug = se.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    spells.push({
      ...itemSkeleton(spellId, displayName, 'spell', spellSort, `systems/pf2e/icons/spells/${slug}.webp`),
      system: {
        description: { gm: '', value: '' }, rules: [], slug,
        _migration: { version: 0.955, lastMigration: null, previous: null },
        traits: { otherTags: [], value: [], rarity: 'common', traditions: [] },
        publication: { title: '', authors: '', license: 'OGL', remaster: false },
        level: { value: se.rank },
        requirements: '', target: { value: '' }, range: { value: '' },
        area: null, time: { value: '' },
        duration: { value: '', sustained: false },
        damage: {}, defense: null, cost: { value: '' },
        location: { value: entryId, heightenedLevel: ht },
        counteraction: false,
      },
    });
    spellSort += 100000;
  }

  return { entry, spells };
}

// ─── Action Item Builder ──────────────────────────────────────────────────────

function buildActionItem(
  name: string, tag: string | null, traitStr: string,
  desc: string, actor: string, sort: number
): object {
  const { type, value, img } = tag ? actionTagToMeta(tag) : { type: 'passive', value: null, img: ACTION_IMG.passive };

  let category: string;
  if (type === 'passive') {
    const nl = name.toLowerCase();
    if (/coven|swarm mind|telepathy|shared senses/.test(nl)) category = 'interaction';
    else if (/saves|blindness|vision|resist|immune|regen|ward/.test(nl)) category = 'defensive';
    else category = 'defensive';
  } else if (type === 'reaction') {
    category = 'defensive';
  } else {
    category = 'offensive';
  }

  const traits = traitStr
    ? traitStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        .map(remasterTrait).filter((t): t is string => t !== null)
    : [];

  return {
    ...itemSkeleton(makeId('action', actor, name), name, 'action', sort, img),
    system: {
      actionType: { value: type },
      actions: { value },
      category,
      description: { value: desc ? `<p>${desc}</p>` : '', gm: '' },
      publication: { license: 'OGL', remaster: false, title: '', authors: '' },
      rules: [], slug: null,
      traits: { value: traits, otherTags: [] },
      _migration: migration(),
    },
  };
}

// ─── Sense Parser ─────────────────────────────────────────────────────────────

function parseSenses(senseStr: string): Array<{ type: string; acuity?: string; range?: number }> {
  const result: Array<{ type: string; acuity?: string; range?: number }> = [];
  for (const raw of senseStr.split(',').map(s => s.trim()).filter(Boolean)) {
    const lower = raw.toLowerCase();
    if (/darkvision/.test(lower)) { result.push({ type: 'darkvision' }); continue; }
    if (/greater darkvision/.test(lower)) { result.push({ type: 'greaterDarkvision' }); continue; }
    if (/low-?light vision/.test(lower)) { result.push({ type: 'lowLightVision' }); continue; }
    // ranged sense: scent (imprecise, 30 feet), tremorsense (precise, 60 feet)
    const m = lower.match(/^(scent|tremorsense|echolocation|lifesense|spiritsense|wavesense|mindsense|bloodsense|thermal sense)(?:\s+(\d+)\s*feet?|\s*\(([^)]*)\))?$/);
    if (m) {
      const type   = m[1].replace(/\s+/g, '');
      const detail = m[3] ?? '';
      const acuity = /\bprecise\b/.test(detail) ? 'precise' : 'imprecise';
      const range  = m[2] ?? detail.match(/(\d+)/)?.[1];
      result.push({ type, acuity, ...(range ? { range: parseInt(range as string, 10) } : {}) });
    }
  }
  return result;
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

export interface PF2eActor { [key: string]: unknown }

export function parsePF2eStatBlock(rawText: string): PF2eActor | null {
  if (!rawText?.trim()) return null;

  const text  = normalizeSymbols(rawText.replace(/\r\n|\r/g, '\n'));
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 3) return null;

  // ── Name & Level ─────────────────────────────────────────────────────────
  let name  = '';
  let level = 0;
  const lvlM = lines[0].match(/^(.+?)\s{2,}Creature\s+([+-]?\d+)$/i)
            || lines[0].match(/^(.+?)\s+Creature\s+([+-]?\d+)$/i);
  if (lvlM) {
    name  = lvlM[1].trim();
    level = parseInt(lvlM[2], 10);
  } else {
    name = lines[0];
    for (let i = 1; i < Math.min(lines.length, 5); i++) {
      const m = lines[i].match(/^Creature\s+([+-]?\d+)$/i);
      if (m) { level = parseInt(m[1], 10); break; }
    }
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let size = 'med', rarity = 'common';
  const traits: string[]  = [];
  let perceptionMod = 0;
  const senses: Array<{ type: string; acuity?: string; range?: number }> = [];
  const languages: string[] = [];
  const skills: Record<string, { base: number }> = {};
  const abilities: Record<string, { mod: number }> = {
    str: { mod: 0 }, dex: { mod: 0 }, con: { mod: 0 },
    int: { mod: 0 }, wis: { mod: 0 }, cha: { mod: 0 },
  };
  let acVal = 10, acDetails = '';
  let fort = 0, ref = 0, will = 0, allSaves = '';
  let hpMax = 0, hpDetails = '';
  const immunities:   Array<{ type: string }> = [];
  const weaknesses:   Array<{ type: string; value: number }> = [];
  const resistances:  Array<{ type: string; value: number; exceptions?: string[] }> = [];
  let languageDetails = '';
  let speedVal = 25;
  const otherSpeeds: Array<{ type: string; value: number }> = [];
  const items: object[] = [];
  let sort = 100000;
  let inOffense = false; // set when Speed line is seen
  let seenHP    = false; // set when HP line is seen — abilities are valid from here on

  // ── Line Loop ─────────────────────────────────────────────────────────────
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // ── Traits line (line 1 or within first few lines, comma-sep, no label) ──
    if (!inOffense && i <= 4 && /^(chaotic|lawful|neutral|good|evil|common|uncommon|rare|unique|tiny|small|medium|large|huge|gargantuan|lg|ln|le|ng|nn|ne|cg|cn|ce)\b/i.test(line)) {
      for (const p of line.split(/[\s,]+/).map(s => s.trim().toLowerCase()).filter(Boolean)) {
        if (RARITY_TAGS.has(p))   { rarity = p; continue; }
        if (SIZE_TAGS.has(p))     { size = SIZE_MAP[p] ?? 'med'; continue; }
        if (ALIGN_ABBREV.has(p))  continue;
        if (p) traits.push(p.replace(/\s+/g, '-'));
      }
      continue;
    }

    // ── Perception ────────────────────────────────────────────────────────
    if (/^perception\s+[+-]\d+/i.test(line)) {
      const m = line.match(/^perception\s+([+-]\d+)(?:;\s*(.+))?/i);
      if (m) {
        perceptionMod = parseInt(m[1], 10);
        if (m[2]) senses.push(...parseSenses(m[2]));
      }
      continue;
    }

    // ── Languages ─────────────────────────────────────────────────────────
    if (/^languages\s+/i.test(line)) {
      const raw = line.replace(/^languages\s+/i, '');
      const [langPart, ...rest] = raw.split(';');
      for (const l of langPart.split(',').map(x => x.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean))
        languages.push(l);
      // Text after semicolon (e.g. "telepathy 100 feet") goes to languages.details
      if (rest.length) languageDetails = rest.join(';').trim();
      continue;
    }

    // ── Skills ────────────────────────────────────────────────────────────
    if (/^skills\s+/i.test(line)) {
      const raw = line.replace(/^skills\s+/i, '');
      for (const part of raw.split(',').map(p => p.trim())) {
        const m = part.match(/^([a-z\s]+?)\s+([+-]\d+)/i);
        if (m) {
          const slug = SKILL_SLUG[m[1].trim().toLowerCase()] ?? m[1].trim().toLowerCase().replace(/\s+/g, '-');
          skills[slug] = { base: parseInt(m[2], 10) };
        }
      }
      continue;
    }

    // ── Ability Scores ────────────────────────────────────────────────────
    if (/^str\s+[+-]\d+/i.test(line)) {
      // Handles both comma-separated "Str +5, Dex +6" and space-separated "Str +5 Dex +6"
      for (const m of [...line.matchAll(/\b(str|dex|con|int|wis|cha)\s+([+-]\d+)/gi)])
        abilities[m[1].toLowerCase()] = { mod: parseInt(m[2], 10) };
      continue;
    }

    // ── AC + Saves ────────────────────────────────────────────────────────
    if (/^ac\s+\d+/i.test(line)) {
      const m = line.match(/^AC\s+(\d+)(?:,?\s*([^;]+?))?;\s*Fort\s+([+-]\d+),?\s*Ref\s+([+-]\d+),?\s*Will\s+([+-]\d+)(.*)?$/i);
      if (m) {
        acVal = parseInt(m[1], 10);
        acDetails = (m[2] ?? '').trim();
        fort  = parseInt(m[3], 10);
        ref   = parseInt(m[4], 10);
        will  = parseInt(m[5], 10);
        if (m[6]) allSaves = m[6].replace(/^[;,\s]+/, '').trim();
      }
      continue;
    }

    // ── HP, Immunities, Weaknesses, Resistances ───────────────────────────
    if (/^hp\s+\d+/i.test(line)) {
      seenHP = true;
      const sections = line.split(/;\s*/);
      const hpM = sections[0].match(/^HP\s+(\d+)(?:,\s*(.+))?/i);
      if (hpM) { hpMax = parseInt(hpM[1], 10); hpDetails = (hpM[2] ?? '').trim(); }
      for (let s = 1; s < sections.length; s++) {
        const sec = sections[s].trim();
        if (/^immunities?\s+/i.test(sec)) {
          for (const t of sec.replace(/^immunities?\s+/i, '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean))
            immunities.push({ type: remasterEnergyType(t.replace(/\s+/g, '-')) });
        } else if (/^weaknesses?\s+/i.test(sec)) {
          for (const w of sec.replace(/^weaknesses?\s+/i, '').split(',').map(x => x.trim())) {
            const wm = w.match(/^(.+?)\s+(\d+)$/);
            if (wm) weaknesses.push({ type: remasterEnergyType(wm[1].toLowerCase().replace(/\s+/g, '-')), value: parseInt(wm[2], 10) });
          }
        } else if (/^resistances?\s+/i.test(sec)) {
          for (const r of sec.replace(/^resistances?\s+/i, '').split(',').map(x => x.trim())) {
            const rm = r.match(/^(.+?)\s+(\d+)(?:\s+\(except\s+([^)]+)\))?$/i);
            if (rm) {
              const res: { type: string; value: number; exceptions?: string[] } = {
                type: remasterEnergyType(rm[1].toLowerCase().replace(/\s+/g, '-')),
                value: parseInt(rm[2], 10),
              };
              if (rm[3]) res.exceptions = rm[3].split(/,?\s+and\s+|,\s*/).map((e: string) => e.toLowerCase().trim());
              resistances.push(res);
            }
          }
        }
      }
      continue;
    }

    // ── Speed ─────────────────────────────────────────────────────────────
    if (/^speed\s+/i.test(line)) {
      inOffense = true;
      const raw = line.replace(/^speed\s+/i, '');
      for (const part of raw.split(',').map(p => p.trim())) {
        const typeM = part.match(/^(fly|swim|burrow|climb)\s+(\d+)\s*feet?/i);
        const baseM = part.match(/^(\d+)\s*feet?/i);
        if (typeM) otherSpeeds.push({ type: typeM[1].toLowerCase(), value: parseInt(typeM[2], 10) });
        else if (baseM) speedVal = parseInt(baseM[1], 10);
      }
      continue;
    }

    // ── Melee / Ranged ────────────────────────────────────────────────────
    if (/^(melee|ranged)\s+/i.test(line)) {
      inOffense = true;
      const item = buildMeleeItem(line, name, sort);
      if (item) { items.push(item); sort += 100000; }
      continue;
    }

    // ── Spellcasting ──────────────────────────────────────────────────────
    if (/^(arcane|divine|occult|primal|focus)\s+(prepared|innate|spontaneous)\s+spells?/i.test(line)) {
      inOffense = true;
      const result = buildSpellcasting(line, name, sort);
      if (result) {
        items.push(result.entry, ...result.spells);
        sort += (result.spells.length + 2) * 100000;
      }
      continue;
    }

    // ── Devotion / Focus Spells (class-specific: "Champion Devotion Spells DC 20...") ──
    if (/^.+?\s+(devotion|focus)\s+spells?\s+DC\s+\d+/i.test(line)) {
      inOffense = true;
      const hdr = line.match(/^(.+?)\s+(Devotion|Focus)\s+Spells?\s+DC\s+(\d+)(?:,\s*\d+\s*Focus\s+Points?)?(?:,?\s*attack\s+([+-]\d+))?/i);
      if (hdr) {
        const entryLabel = `${hdr[1].trim()} ${hdr[2]} Spells`;
        const dc  = parseInt(hdr[3], 10);
        const atk = hdr[4] ? parseInt(hdr[4], 10) : dc - 8;
        // Synthesise a fake spellcasting line and reuse buildSpellcasting by building a
        // minimal focus entry directly
        const entryId = makeId('spellEntry', name, entryLabel);
        const slots = emptySlots();
        const afterHeader = line.slice(line.indexOf(';') + 1);
        const focusSpells: object[] = [];
        let spellSort = sort + 100000;
        for (const section of afterHeader.split(/;\s*/)) {
          const s = section.trim();
          if (!s) continue;
          const rankM = s.match(/^(\d+)(?:st|nd|rd|th)\s+(.+)/i);
          if (rankM) {
            const rank = parseInt(rankM[1], 10);
            for (const spellName of rankM[2].split(',').map(p => p.trim()).filter(Boolean)) {
              const spellId = makeId('spell', name, spellName);
              const slug = spellName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              focusSpells.push({
                ...itemSkeleton(spellId, spellName, 'spell', spellSort, `systems/pf2e/icons/spells/${slug}.webp`),
                system: {
                  description: { gm: '', value: '' }, rules: [], slug,
                  _migration: { version: 0.955, lastMigration: null, previous: null },
                  traits: { otherTags: [], value: ['focus'], rarity: 'common', traditions: [] },
                  publication: { title: '', authors: '', license: 'ORC', remaster: true },
                  level: { value: rank },
                  requirements: '', target: { value: '' }, range: { value: '' },
                  area: null, time: { value: '' },
                  duration: { value: '', sustained: false },
                  damage: {}, defense: null, cost: { value: '' },
                  location: { value: entryId, heightenedLevel: rank },
                  counteraction: false,
                },
              });
              spellSort += 100000;
            }
          }
        }
        const entry = {
          ...itemSkeleton(entryId, entryLabel, 'spellcastingEntry', sort, 'systems/pf2e/icons/default-icons/spellcastingEntry.svg'),
          system: {
            description: { gm: '', value: '' }, rules: [], slug: null,
            _migration: { version: 0.955, lastMigration: null, previous: null },
            traits: { otherTags: [] },
            publication: { title: '', authors: '', license: 'ORC', remaster: true },
            ability: { value: 'cha' },
            spelldc: { value: atk, dc, mod: 0 },
            tradition: { value: 'divine' },
            prepared: { value: 'focus', flexible: false },
            showSlotlessLevels: { value: false },
            proficiency: { value: 0 },
            slots,
            autoHeightenLevel: { value: null },
          },
        };
        items.push(entry, ...focusSpells);
        sort += (focusSpells.length + 2) * 100000;
      }
      continue;
    }

    // ── Named Actions / Abilities ─────────────────────────────────────────
    // Pattern: "Name [action-tag] (optional traits) optional description"
    //       or "Name [action-tag]"  (no description)
    // Multi-line: look ahead and collect continuation lines into description
    if (inOffense || seenHP) {
      const m = line.match(/^([A-Z][A-Za-z0-9 ''\-+]+?)\s+(\[[^\]]+\])(?:\s+\(([^)]+)\))?\s*(.*)?$/);
      if (m && !NON_ABILITY_PREFIXES.test(m[1])) {
        let desc = (m[4] ?? '').trim();
        while (i + 1 < lines.length && isContinuationLine(lines[i + 1])) {
          i++;
          desc += (desc ? ' ' : '') + lines[i];
        }
        items.push(buildActionItem(m[1].trim(), m[2], m[3] ?? '', desc, name, sort));
        sort += 100000;
        continue;
      }
      // Passive with traits (no action bracket): "Name (traits) description"
      // Name must not contain digits or +/- to avoid catching "Jaws +32 (traits) Damage..."
      const ptm = line.match(/^([A-Z][A-Za-z ''\-]+?)\s+\(([^)]+)\)\s+(.+)$/);
      if (ptm && !NON_ABILITY_PREFIXES.test(ptm[1]) && ptm[3].length > 3) {
        let desc = ptm[3].trim();
        while (i + 1 < lines.length && isContinuationLine(lines[i + 1])) {
          i++;
          desc += ' ' + lines[i];
        }
        items.push(buildActionItem(ptm[1].trim(), null, ptm[2], desc, name, sort));
        sort += 100000;
        continue;
      }
      // Passive ability: "Name   Description text" (two+ spaces between name and desc)
      const pm = line.match(/^([A-Z][A-Za-z0-9 ''\-+]+?)\s{2,}(.+)$/);
      if (pm && !NON_ABILITY_PREFIXES.test(pm[1]) && pm[2].length > 5) {
        let desc = pm[2].trim();
        while (i + 1 < lines.length && isContinuationLine(lines[i + 1])) {
          i++;
          desc += ' ' + lines[i];
        }
        items.push(buildActionItem(pm[1].trim(), null, '', desc, name, sort));
        sort += 100000;
        continue;
      }
      // Standalone passive name — look ahead for description on next lines
      const snM = line.match(/^([A-Z][A-Za-z0-9 ''\-+]{3,})$/);
      if (snM && !NON_ABILITY_PREFIXES.test(snM[1]) && !snM[1].match(/^(Speed|Melee|Ranged|Arcane|Divine|Occult|Primal)/i)) {
        let desc = '';
        while (i + 1 < lines.length && isContinuationLine(lines[i + 1])) {
          i++;
          desc += (desc ? ' ' : '') + lines[i];
        }
        items.push(buildActionItem(snM[1].trim(), null, '', desc, name, sort));
        sort += 100000;
        continue;
      }
    }

    // ── allSaves continuation (e.g. "+1 status to all saves vs. magic") ──
    if (/^\+\d+\s+status/i.test(line)) {
      allSaves = allSaves ? `${allSaves}; ${line}` : line;
    }
  }

  // ── Token size from creature size ─────────────────────────────────────────
  const tokenSize = size === 'tiny' ? 0.5 : size === 'sm' ? 1 : size === 'med' ? 1
                  : size === 'lg' ? 2 : size === 'huge' ? 3 : 4; // grg = 4

  // ── Assemble Actor ────────────────────────────────────────────────────────
  const actor: PF2eActor = {
    img:  'systems/pf2e/icons/default-icons/npc.svg',
    name, type: 'npc',
    system: {
      abilities,
      attributes: {
        hp:       { value: hpMax, temp: 0, max: hpMax, details: hpDetails },
        ac:       { value: acVal, details: acDetails },
        allSaves: { value: allSaves },
        speed:    { value: speedVal, otherSpeeds, details: '' },
        ...(immunities.length  ? { immunities }  : {}),
        ...(weaknesses.length  ? { weaknesses }  : {}),
        ...(resistances.length ? { resistances } : {}),
      },
      details: {
        level:        { value: level },
        alliance:     'opposition',
        languages:    { value: languages, details: languageDetails },
        publicNotes:  '',
        privateNotes: '',
        blurb:        '',
        publication:  { title: '', authors: '', license: 'ORC', remaster: true },
      },
      initiative:  { statistic: 'perception' },
      perception:  { mod: perceptionMod, details: '', senses, vision: true },
      saves: {
        fortitude: { value: fort, saveDetail: '' },
        reflex:    { value: ref,  saveDetail: '' },
        will:      { value: will, saveDetail: '' },
      },
      skills,
      traits: { value: traits, rarity, size: { value: size } },
      resources: {},
      _migration: migration(),
    },
    items,
    effects:   [],
    folder:    null,
    flags:     { pf2e: {} },
    ownership: { default: 3 },
    prototypeToken: {
      name,
      displayName: 0,
      actorLink: false,
      width: tokenSize,
      height: tokenSize,
      texture: {
        src: 'systems/pf2e/icons/default-icons/npc.svg',
        anchorX: 0.5, anchorY: 0.5,
        offsetX: 0, offsetY: 0,
        fit: 'contain', scaleX: 1, scaleY: 1, rotation: 0,
        tint: '#ffffff', alphaThreshold: 0.75,
      },
      lockRotation: false, rotation: 0, alpha: 1,
      disposition: -1, displayBars: 0,
      bar1: { attribute: 'attributes.hp' },
      bar2: { attribute: null },
      light: {
        negative: false, priority: 0, alpha: 0.5, angle: 360,
        bright: 0, color: null, coloration: 1, dim: 0,
        attenuation: 0.5, luminosity: 0.5, saturation: 0, contrast: 0, shadows: 0,
        animation: { type: null, speed: 5, intensity: 5, reverse: false },
        darkness: { min: 0, max: 1 },
      },
      sight: {
        enabled: false, range: 0, angle: 360, visionMode: 'basic',
        color: null, attenuation: 0.1, brightness: 0, saturation: 0, contrast: 0,
      },
      detectionModes: [],
      flags: { pf2e: { linkToActorSize: true, autoscale: true } },
      randomImg: false, appendNumber: false, prependAdjective: false,
    },
    _stats: {
      compendiumSource: null, duplicateSource: null, exportSource: null,
      coreVersion: PF2E_CORE_VER, systemId: 'pf2e', systemVersion: PF2E_SYS_VER,
      lastModifiedBy: null,
    },
  };

  return actor;
}
