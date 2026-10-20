// Cyberpets from R. Talsorian's "Your New Best Friend" (DLC v1.1, Oct 2024), as ready-to-load
// stat blocks for the NPC tool. Entered by hand from the PDF's text, so spot-check a pet against the
// book before running a table on it.
//
// The book's "Skill Bases" already include the governing stat (the Mooks and Grunts rule), but
// Foundry adds the stat again at roll time, so petToStatBlockText() subtracts it. That is why
// "Evasion 12" on a Datarabbit (DEX 8) becomes "Evasion +4".

import { SKILL_CATALOG } from './cyberpunk-red-pc-parser'

export interface CyberpetAttack { name: string; cn: number; rof: number; damage: string }

export interface Cyberpet {
  name: string
  level: 'Mook' | 'Hardened Mook' | 'Hardened Lieutenant' | 'Mini-Boss'
  cost: string
  lifestyle: string
  slots: number
  stats: { int: number; ref: number; dex: number; tech: number; cool: number; will: number; move: number; body: number; emp: number }
  seriouslyWounded: number
  deathSave: number
  hp: number
  attacks: CyberpetAttack[]
  armor: { name: string; head: number; body: number }
  skillBases: Record<string, number>
  cyberware: string[]
  abilities: string[]
}

export const CYBERPETS: Cyberpet[] = [
  {
    name: 'Datarabbit', level: 'Mook', cost: '1,000eb (Very Expensive)', lifestyle: 'Generic Prepak', slots: 2,
    stats: { int: 2, ref: 8, dex: 8, tech: 2, cool: 2, will: 2, move: 10, body: 3, emp: 2 },
    seriouslyWounded: 5, deathSave: 5, hp: 10,
    attacks: [{ name: 'Teeth', cn: 8, rof: 2, damage: '2d6' }, { name: 'Brawling Attack', cn: 8, rof: 2, damage: '1d6' }],
    armor: { name: 'Subdermal Armor', head: 11, body: 11 },
    skillBases: { Athletics: 10, Endurance: 8, Evasion: 12, 'Human Perception': 8, Perception: 10, Stealth: 10, 'Wilderness Survival': 10 },
    cyberware: ['TUp (Independent Mounting) Homing Tracer Cyberfinger', 'TUp (+1 Option Slot) Cybereye w/ Chipware Compartment & Hardened Cybereye Casing', 'Subdermal Armor'],
    abilities: ['The eye is an EMP-protected storage locker for sensitive memory chips; the rabbit can be released to hide the data and found later with the implanted tracer.'],
  },
  {
    name: 'Forever Turtle', level: 'Hardened Mook', cost: '2,000eb (Very Expensive)', lifestyle: 'Good Prepak', slots: 2,
    stats: { int: 2, ref: 2, dex: 3, tech: 2, cool: 3, will: 4, move: 3, body: 2, emp: 2 },
    seriouslyWounded: 7, deathSave: 2, hp: 15,
    attacks: [{ name: 'Combat Jaw', cn: 8, rof: 1, damage: '4d6' }, { name: 'Brawling Attack', cn: 5, rof: 2, damage: '1d6' }],
    armor: { name: 'Hardened Shell', head: 0, body: 11 },
    skillBases: { Athletics: 5, Brawling: 5, Evasion: 12, 'Human Perception': 8, 'Melee Weapon': 8, Perception: 10, Stealth: 10, 'Wilderness Survival': 10 },
    cyberware: ['Combat Jaw', 'Hardened Shell (Subdermal Armor)', 'Trauma Response Nanomatrix'],
    abilities: ['Protection: a Forever Turtle can draw its head and limbs into its shell. When it does, its Hardened Shell protects its head too, and it cannot be targeted by Aimed Shots.'],
  },
  {
    name: 'Neon Newt', level: 'Hardened Mook', cost: '2,000eb (Very Expensive)', lifestyle: 'Good Prepak', slots: 1,
    stats: { int: 1, ref: 4, dex: 5, tech: 2, cool: 3, will: 2, move: 5, body: 2, emp: 2 },
    seriouslyWounded: 10, deathSave: 3, hp: 20,
    attacks: [{ name: 'Flamebreath', cn: 8, rof: 2, damage: '1d6' }, { name: 'Acid Secretion', cn: 5, rof: 2, damage: '0' }],
    armor: { name: 'None', head: 0, body: 0 },
    skillBases: { Athletics: 5, Brawling: 5, Contortionist: 12, Evasion: 12, 'Human Perception': 4, 'Heavy Weapons': 8, 'Melee Weapon': 7, Perception: 12, Stealth: 10, 'Wilderness Survival': 10 },
    cyberware: [],
    abilities: [
      'Acid Secretion: on a successful attack (made with Brawling, not Melee Weapon) the acid does no damage but lowers the SP of all worn armor by 1.',
      'Flamebreath: acts like a Flamethrower (CP:R page 348) and cannot be used if it was activated on the Newt\'s last Turn.',
    ],
  },
  {
    name: 'Obsidian Ocelot', level: 'Hardened Lieutenant', cost: '4,000eb (Luxury)', lifestyle: 'Fresh Food', slots: 3,
    stats: { int: 3, ref: 9, dex: 8, tech: 2, cool: 2, will: 4, move: 8, body: 5, emp: 2 },
    seriouslyWounded: 20, deathSave: 5, hp: 40,
    attacks: [{ name: 'Combat Jaw', cn: 15, rof: 1, damage: '4d6' }, { name: 'Cat Claws', cn: 15, rof: 2, damage: '3d6' }],
    armor: { name: 'TUp Subdermal Armor', head: 12, body: 12 },
    skillBases: { Athletics: 16, Brawling: 13, Endurance: 8, Evasion: 15, 'Human Perception': 8, 'Melee Weapon': 15, Perception: 12, Stealth: 15, Tactics: 12, Tracking: 13, 'Wilderness Survival': 10 },
    cyberware: ['Combat Jaw', 'TUp (Animal Compatibility) FBC Chameleon Coating', 'TUp (+1 SP) Subdermal Armor'],
    abilities: ['Combat Awareness: not technically a Solo, but it can use the Combat Awareness Role Ability (CP:R page 146) at Rank 5.'],
  },
  {
    name: 'Cyberbear', level: 'Mini-Boss', cost: '20,000eb (Super Luxury)', lifestyle: 'Fresh Food x2', slots: 3,
    stats: { int: 3, ref: 8, dex: 8, tech: 6, cool: 5, will: 8, move: 6, body: 10, emp: 5 },
    seriouslyWounded: 28, deathSave: 10, hp: 55,
    attacks: [{ name: 'Bear Claw', cn: 16, rof: 2, damage: '3d6' }, { name: 'Combat Jaw', cn: 16, rof: 1, damage: '4d6' }],
    armor: { name: 'TUp Subdermal Armor', head: 13, body: 13 },
    skillBases: { Athletics: 14, Brawling: 16, Concentration: 10, Evasion: 10, 'Human Perception': 7, 'Martial Arts (Cyberbear)': 10, 'Melee Weapon': 16, Perception: 11, Persuasion: 7, 'Resist Torture/Drugs': 15, Stealth: 10, 'Wilderness Survival': 14 },
    cyberware: ['Combat Jaw', 'Grafted Muscle & Bone Lace', 'Neural Link w/ Chipware Socket & Pain Editor', 'TUp (+2 SP, Requires BODY 10) Subdermal Armor'],
    abilities: [
      'Cyberbear martial art (innate, cannot be learned or imitated):',
      'Recovery (bear is knocked prone): when it uses Get Up it can try to beat DV13 with the Martial Arts Special Move Resolution; on success that Get Up costs no Action.',
      'Cyberbear Three-Arm Strike (two Bear Claw hits on the same target this turn, once per Turn): beat DV15 or take 5 damage directly to HP from the brain tumor. On success choose one: grapple or end a grapple with the target; attack the target again with a Bear Claw or Combat Jaw; cause a random Body Critical Injury; reduce the SP of all the target\'s worn armor by 4.',
    ],
  },
  {
    name: 'Cyberboa', level: 'Hardened Lieutenant', cost: '4,000eb (Luxury)', lifestyle: 'Fresh Food', slots: 3,
    stats: { int: 3, ref: 5, dex: 9, tech: 3, cool: 4, will: 4, move: 4, body: 7, emp: 1 },
    seriouslyWounded: 20, deathSave: 7, hp: 40,
    attacks: [{ name: 'Airhypo Vampyres', cn: 15, rof: 2, damage: '1d6' }, { name: 'Brawling Attack', cn: 16, rof: 2, damage: '3d6' }],
    armor: { name: 'TUp Subdermal Armor', head: 12, body: 12 },
    skillBases: { Athletics: 11, Brawling: 16, Contortionist: 11, Endurance: 8, Evasion: 14, 'Human Perception': 4, 'Melee Weapon': 15, Perception: 10, Stealth: 13, Tracking: 10, 'Wilderness Survival': 12 },
    cyberware: ['TUp ("Third Eye" Mounted) Flashbulb', 'Neural Link w/ Chipware Socket & Pain Editor', 'TUp (+1 SP) Subdermal Armor', 'TUp (Airhypo) Vampyres'],
    abilities: ['Airhypo Vampyres: when it hits with its Vampyres (even for no damage) it pumps a loaded substance into the target. A mouth compartment holds up to 5 doses of one Biotoxin, Poison or Streetdrug.'],
  },
  {
    name: 'Cyberrat', level: 'Mook', cost: '1,000eb (Very Expensive)', lifestyle: 'Generic Prepak', slots: 2,
    stats: { int: 3, ref: 6, dex: 8, tech: 3, cool: 2, will: 4, move: 9, body: 3, emp: 2 },
    seriouslyWounded: 5, deathSave: 5, hp: 10,
    attacks: [{ name: 'Venom Fangs/Claws', cn: 12, rof: 2, damage: '1d6' }, { name: 'Brawling Attack', cn: 5, rof: 2, damage: '1d6' }],
    armor: { name: 'Skinweave', head: 7, body: 7 },
    skillBases: { Athletics: 10, Brawling: 5, Concentration: 8, Endurance: 6, Evasion: 12, 'Human Perception': 8, 'Melee Weapon': 12, Perception: 10, Stealth: 15, 'Wilderness Survival': 10 },
    cyberware: ['Cyberaudio w/ Audio Recorder', 'Cybereye w/ MicroVideo', 'Neural Link w/ Chipware Socket & Memory Chip', 'Skinweave'],
    abilities: [
      'Venom Fangs/Claws: when it hits (even for no damage) the target must beat a DV13 Resist Torture/Drugs Check or take 1d6 extra damage directly to HP.',
      'The Cyberrat\'s Brawling Skill Base is lower than its DEX on purpose: its size hurts its paw-to-hand combat. Its Brawling shows as +0 here, so use a flat 5 if you want the book value.',
    ],
  },
  {
    name: 'Cyberwolf', level: 'Hardened Lieutenant', cost: '4,000eb (Luxury)', lifestyle: 'Good Prepak', slots: 3,
    stats: { int: 3, ref: 7, dex: 8, tech: 2, cool: 2, will: 4, move: 7, body: 5, emp: 2 },
    seriouslyWounded: 20, deathSave: 5, hp: 40,
    attacks: [{ name: 'Combat Jaw', cn: 12, rof: 1, damage: '4d6' }, { name: 'Claws', cn: 12, rof: 2, damage: '2d6' }],
    armor: { name: 'Light Armorjack', head: 0, body: 11 },
    skillBases: { Athletics: 13, Brawling: 14, Concentration: 6, Endurance: 8, Evasion: 13, 'Human Perception': 8, 'Melee Weapon': 12, Perception: 10, Stealth: 10, Tactics: 14, Tracking: 16, 'Wilderness Survival': 12 },
    cyberware: ['TUp (+1d6 damage vs target the Cyberwolf is grappling) Combat Jaw', 'Cyberaudio Suite w/Internal Agent', 'Cybereye w/Chyron & Targeting Scope'],
    abilities: ['Combat Awareness: not technically a Solo, but it can use the Combat Awareness Role Ability (CP:R page 146) at Rank 3 while within 20 m/yds of another Cyberwolf in its pack.'],
  },
]

const STAT_ORDER = ['int', 'ref', 'dex', 'tech', 'cool', 'will', 'luck', 'move', 'body', 'emp'] as const

function governingStat(skill: string): string {
  const exact = SKILL_CATALOG.find(s => s.name.toLowerCase() === skill.toLowerCase())
  if (exact) return exact.stat
  if (/martial arts/i.test(skill)) return 'dex'
  return 'ref'
}

// Label-format text that parseCyberpunkRedStatBlock() reads.
export function petToStatBlockText(pet: Cyberpet): string {
  const stats = { ...pet.stats, luck: 0 } as Record<string, number>
  const skills = Object.entries(pet.skillBases)
    .map(([name, base]) => `${name} +${Math.max(0, base - (stats[governingStat(name)] ?? 0))}`)
    .join(', ')
  const weapons = pet.attacks.map(a => `${a.name} (${a.damage})`).join(', ')
  const armor = pet.armor.head || pet.armor.body ? `${pet.armor.name} (Head ${pet.armor.head}, Body ${pet.armor.body})` : ''
  const notes = [
    `Cyberpet (${pet.level}). Cost ${pet.cost}; requires ${pet.lifestyle} lifestyle; ${pet.slots} cyberware slots.`,
    `Seriously Wounded ${pet.seriouslyWounded}, Death Save ${pet.deathSave}. Attack Combat Numbers: ${pet.attacks.map(a => `${a.name} C# ${a.cn} ROF ${a.rof}`).join('; ')}.`,
    ...pet.abilities,
    'From "Your New Best Friend" (R. Talsorian Games, 2024).',
  ].join(' ')
  return [
    `NAME: ${pet.name}`,
    `ROLE: ${pet.level} (Cyberpet)`,
    `STATS: ${STAT_ORDER.map(k => `${k.toUpperCase()} ${stats[k] ?? 0}`).join(', ')}`,
    `HP: ${pet.hp}`,
    `SP: ${Math.max(pet.armor.head, pet.armor.body)}`,
    `SKILLS: ${skills}`,
    `WEAPONS: ${weapons}`,
    `ARMOR: ${armor}`,
    `CYBERWARE: ${pet.cyberware.join(', ')}`,
    `NOTES: ${notes}`,
  ].join('\n')
}
