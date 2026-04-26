// roll20-exporter.ts
// Transforms a Foundry VTT actor object → DMToolkit Roll20 JSON format.
// Compatible with DMToolkit-Roll20-Importer.js (D&D 5e 2014 sheet).

const R20_SIZE_MAP: Record<string, string> = {
  tiny: 'Tiny', sm: 'Small', med: 'Medium',
  lg: 'Large', huge: 'Huge', grg: 'Gargantuan',
};

const R20_SKILL_ABILITY: Record<string, string> = {
  acr:'dex', ani:'wis', arc:'int', ath:'str', dec:'cha', his:'int',
  ins:'wis', itm:'cha', inv:'int', med:'wis', nat:'int', prc:'wis',
  prf:'cha', per:'cha', rel:'int', slt:'dex', ste:'dex', sur:'wis',
};

// Roll20 5e sheet uses lowercase joined names for skills
const R20_SKILL_KEY: Record<string, string> = {
  acr:'acrobatics',    ani:'animalhandling', arc:'arcana',
  ath:'athletics',     dec:'deception',      his:'history',
  ins:'insight',       itm:'intimidation',   inv:'investigation',
  med:'medicine',      nat:'nature',         prc:'perception',
  prf:'performance',   per:'persuasion',     rel:'religion',
  slt:'sleightofhand', ste:'stealth',        sur:'survival',
};

const ABILITY_KEYS = ['str','dex','con','int','wis','cha'];

const ABILITY_FULL: Record<string,string> = {
  str:'intelligence',dex:'dexterity',con:'constitution',
  int:'intelligence',wis:'wisdom',cha:'charisma',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const r20Mod  = (score: number) => Math.floor((score - 10) / 2);
const r20Sign = (n: number)     => n >= 0 ? `+${n}` : String(n);

const r20PB = (cr: number): number => {
  if (cr < 5)  return 2;
  if (cr < 9)  return 3;
  if (cr < 13) return 4;
  if (cr < 17) return 5;
  return 6;
};

const r20CrStr = (cr: number): string => {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25)  return '1/4';
  if (cr === 0.5)   return '1/2';
  return String(Math.round(cr));
};

const r20Strip = (html: string): string =>
  (html ?? '')
    .replace(/<\/p>/gi,' ').replace(/<br\s*\/?>/gi,' ')
    .replace(/<[^>]+>/g,'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ').trim();

const r20JoinTrait = (obj: any): string =>
  [...(obj?.value ?? []), ...(obj?.custom ? [obj.custom] : [])].join(', ');

// ─── Attack extraction from description text ──────────────────────────────────
// Parses "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 14 (2d8 + 5) bludgeoning damage."
const extractAttack = (desc: string) => {
  const atkM = desc.match(/(Melee or Ranged|Melee|Ranged)\s+(?:Weapon\s+|Spell\s+)?Attack(?:\s+Roll)?:\s+([+-]\d+)\s+to\s+hit/i);
  if (!atkM) return null;

  const rawType = atkM[1].toLowerCase();
  const type    = rawType.includes('ranged') && !rawType.includes('melee') ? 'Ranged' : 'Melee';
  const tohit   = atkM[2].startsWith('+') || atkM[2].startsWith('-') ? atkM[2] : `+${atkM[2]}`;

  const reachM  = desc.match(/reach\s+(\d+)\s*ft/i);
  const rangeM  = desc.match(/range\s+(\d+)(?:\/(\d+))?\s*ft/i);
  const distance = reachM   ? `${reachM[1]} ft.`
    : rangeM && rangeM[2]   ? `${rangeM[1]}/${rangeM[2]} ft.`
    : rangeM                ? `${rangeM[1]} ft.`
    : '5 ft.';

  const targetM = desc.match(/,\s*(one\s+[^.,]+)/i);
  const target  = targetM ? targetM[1].trim() : 'one target';

  const dmgM = desc.match(/Hit:\s+\d+\s+\(([^)]+)\)\s+([\w ]+?)\s+damage/i);
  if (!dmgM) return null;
  const dmg1  = dmgM[1].replace(/\s+/g, '');
  const type1 = dmgM[2].trim().split(/\s+/)[0];

  const dmg2M = desc.match(/plus\s+\d+\s+\(([^)]+)\)\s+([\w ]+?)\s+damage/i);
  const dmg2  = dmg2M ? dmg2M[1].replace(/\s+/g, '') : undefined;
  const type2 = dmg2M ? dmg2M[2].trim().split(/\s+/)[0] : undefined;

  return { type, tohit, distance, target, dmg1, type1, ...(dmg2 ? { dmg2, type2 } : {}) };
};

// ─── Item → Roll20 action object ─────────────────────────────────────────────
const buildAction = (item: any): any => {
  const desc = r20Strip(item.system?.description?.value ?? '');
  const atk  = extractAttack(desc);
  if (!atk) return { name: item.name, desc };
  return {
    name: item.name,
    desc,
    attack: {
      type:     atk.type,
      tohit:    atk.tohit,
      distance: atk.distance,
      target:   atk.target,
      dmg1:     atk.dmg1,
      type1:    atk.type1,
      ...(atk.dmg2  ? { dmg2: atk.dmg2 }   : {}),
      ...(atk.type2 ? { type2: atk.type2 }  : {}),
    },
  };
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const toRoll20JSON = (actor: any): string => {
  const sys   = actor.system;
  const ab    = sys.abilities ?? {};
  const cr    = sys.details?.cr ?? 0;
  const pb    = r20PB(cr);
  const items: any[] = actor.items ?? [];

  // Type
  const typeVal = sys.details?.type?.value ?? 'humanoid';
  const subtype = sys.details?.type?.subtype ?? '';
  const typeStr = typeVal + (subtype ? ` (${subtype})` : '');

  // Speed
  const mv = sys.attributes?.movement ?? {};
  const speedParts: string[] = [];
  if (mv.walk)   speedParts.push(`${mv.walk} ft.`);
  if (mv.fly)    speedParts.push(`fly ${mv.fly} ft.${mv.hover ? ' (hover)' : ''}`);
  if (mv.swim)   speedParts.push(`swim ${mv.swim} ft.`);
  if (mv.burrow) speedParts.push(`burrow ${mv.burrow} ft.`);
  if (mv.climb)  speedParts.push(`climb ${mv.climb} ft.`);

  // Abilities
  const abilities: Record<string,number> = {};
  for (const k of ABILITY_KEYS) abilities[k] = ab[k]?.value ?? 10;

  // Saves
  const saves: Record<string,string> = {};
  for (const k of ABILITY_KEYS) {
    if (ab[k]?.proficient) saves[k] = r20Sign(r20Mod(ab[k].value ?? 10) + pb);
  }

  // Skills
  const skillsObj = sys.skills ?? {};
  const skills: Record<string,string> = {};
  for (const [key, r20key] of Object.entries(R20_SKILL_KEY)) {
    const sk = skillsObj[key];
    if (sk?.value > 0) {
      const abilKey = R20_SKILL_ABILITY[key] ?? 'str';
      skills[r20key] = r20Sign(r20Mod(ab[abilKey]?.value ?? 10) + pb * sk.value);
    }
  }

  // Senses
  const senseRanges = sys.attributes?.senses?.ranges ?? {};
  const senseParts: string[] = [];
  if (senseRanges.darkvision)  senseParts.push(`darkvision ${senseRanges.darkvision} ft.`);
  if (senseRanges.blindsight)  senseParts.push(`blindsight ${senseRanges.blindsight} ft.`);
  if (senseRanges.tremorsense) senseParts.push(`tremorsense ${senseRanges.tremorsense} ft.`);
  if (senseRanges.truesight)   senseParts.push(`truesight ${senseRanges.truesight} ft.`);
  if (sys.attributes?.senses?.special) senseParts.push(sys.attributes.senses.special);
  const prcVal      = skillsObj.prc?.value ?? 0;
  const passivePerc = 10 + r20Mod(ab.wis?.value ?? 10) + (prcVal > 0 ? pb * prcVal : 0);
  senseParts.push(`passive Perception ${passivePerc}`);

  // Languages
  const tr = sys.traits ?? {};
  const languages = r20JoinTrait(tr.languages);

  // Item categorisation
  const activType   = (i: any) => i.system?.activation?.type ?? '';
  const isSpell     = (i: any) => i.type === 'spell';
  const traitItems     = items.filter(i => !isSpell(i) && activType(i) === '');
  const actionItems    = items.filter(i => !isSpell(i) && activType(i) === 'action');
  const bonusItems     = items.filter(i => !isSpell(i) && activType(i) === 'bonus');
  const reactionItems  = items.filter(i => !isSpell(i) && activType(i) === 'reaction');
  const legendaryItems = items.filter(i => !isSpell(i) && activType(i) === 'legendary');
  const lairItems      = items.filter(i => !isSpell(i) && (activType(i) === 'lair' || activType(i) === 'special'));
  const spellItems     = items.filter(isSpell);

  // Spellcasting
  let spellcastingAbility = '';
  let casterLevel = 0;
  const spellSlots: Record<string,number> = {};

  if (spellItems.length > 0) {
    const spellAbil = sys.attributes?.spellcasting || 'int';
    spellcastingAbility = { int:'Intelligence', wis:'Wisdom', cha:'Charisma' }[spellAbil] ?? 'Intelligence';
    const sysSplots = sys.spells ?? {};
    for (let i = 1; i <= 9; i++) {
      const max = sysSplots[`spell${i}`]?.override ?? sysSplots[`spell${i}`]?.value ?? 0;
      if (max > 0) spellSlots[String(i)] = max;
    }
    casterLevel = Math.max(...Object.keys(spellSlots).map(Number), 0) * 2;

    // Append spellcasting trait
    const spellMod = r20Mod(ab[spellAbil]?.value ?? 10);
    const spellDC  = 8 + pb + spellMod;
    const spellAtk = r20Sign(pb + spellMod);
    const atwill   = spellItems.filter((s: any) => s.system?.method === 'atwill');
    const innate   = spellItems.filter((s: any) => s.system?.method === 'innate');
    const prepared = spellItems.filter((s: any) => s.system?.method === 'spell');
    const parts: string[] = [`Spell attack ${spellAtk}, save DC ${spellDC}.`];
    if (atwill.length)   parts.push(`At will: ${atwill.map((s: any) => s.name).join(', ')}.`);
    if (innate.length)   parts.push(`${innate.map((s: any) => s.name).join(', ')}.`);
    if (prepared.length) parts.push(`Spells: ${prepared.map((s: any) => s.name).join(', ')}.`);
    traitItems.push({ name: 'Spellcasting', system: { description: { value: parts.join(' ') }, activation: { type: '' } } });
  }

  // Legendary count
  const legCount  = sys.resources?.legact?.max ?? legendaryItems.length;
  const lairExist = lairItems.length > 0;

  // ── Assemble ───────────────────────────────────────────────────────────────
  const out: any = {
    name:      actor.name,
    size:      R20_SIZE_MAP[sys.traits?.size ?? ''] ?? 'Medium',
    type:      typeStr,
    alignment: sys.details?.alignment ?? '',
    ac:        { value: sys.attributes?.ac?.flat ?? sys.attributes?.ac?.value ?? 10, notes: '' },
    hp:        { average: sys.attributes?.hp?.value ?? 0, formula: sys.attributes?.hp?.formula ?? '' },
    speed:     speedParts.join(', ') || '30 ft.',
    abilities,
  };

  if (Object.keys(saves).length)  out.saves  = saves;
  if (Object.keys(skills).length) out.skills = skills;

  const dv = r20JoinTrait(tr.dv);
  const dr = r20JoinTrait(tr.dr);
  const di = r20JoinTrait(tr.di);
  const ci = r20JoinTrait(tr.ci);
  if (dv) out.damage_vulnerabilities = dv;
  if (dr) out.damage_resistances     = dr;
  if (di) out.damage_immunities      = di;
  if (ci) out.condition_immunities   = ci;

  out.senses = senseParts.join(', ');
  if (languages) out.languages = languages;
  out.cr = r20CrStr(cr);
  out.xp = sys.details?.xp?.value ?? 0;

  if (traitItems.length)    out.traits        = traitItems.map(i => ({ name: i.name, desc: r20Strip(i.system?.description?.value ?? '') }));
  if (actionItems.length)   out.actions        = actionItems.map(buildAction);
  if (bonusItems.length)    out.bonus_actions  = bonusItems.map(buildAction);
  if (reactionItems.length) out.reactions      = reactionItems.map(buildAction);

  if (legendaryItems.length || legCount) {
    out.legendary = {
      count:   legCount,
      actions: legendaryItems.map(buildAction),
    };
  }

  if (lairExist) {
    out.mythic_actions = {
      desc:    'On initiative count 20 (losing initiative ties), the creature takes a lair action.',
      actions: lairItems.map(i => ({ name: i.name, desc: r20Strip(i.system?.description?.value ?? '') })),
    };
  }

  if (spellcastingAbility) {
    out.spellcasting_ability = spellcastingAbility;
    out.caster_level         = casterLevel;
    if (Object.keys(spellSlots).length) out.spell_slots = spellSlots;
  }

  return JSON.stringify(out, null, 2);
};
