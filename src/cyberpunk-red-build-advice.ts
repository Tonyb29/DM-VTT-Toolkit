// Role-aware build advice for the PC Creator: which of the ten pre-rolled stat
// spreads suit a Role, and how to spend skill points once the stats are known.
//
// This is directional guidance in our own words, not rules text. The weights
// say "how much does this stat tend to matter to this Role"; the two build
// styles per Role are common ways to play it, each with a few signature
// skills to push. Skill names must exist in that Role's career-skill pool
// (ROLE_SKILL_SETS in cyberpunk-red-pc-app.tsx).

import { SKILL_CATALOG } from '../parser-versions/cyberpunk-red-pc-parser'

export type StatKey = 'int' | 'ref' | 'dex' | 'tech' | 'cool' | 'will' | 'luck' | 'move' | 'body' | 'emp'
export type Stats = Record<StatKey, number>

export type BuildStyle = {
  name: string
  blurb: string
  boost: Partial<Record<StatKey, number>>
  extra: string[]
}

export type RoleAdvice = {
  summary: string
  weights: Partial<Record<StatKey, number>>
  core: string[]
  styles: [BuildStyle, BuildStyle]
}

export const ROLE_ADVICE: Record<string, RoleAdvice> = {
  Solo: {
    summary: 'Fights for a living — quick reactions and the toughness to survive the answer.',
    weights: { ref: 3, body: 3, dex: 2, will: 2, cool: 1, move: 1 },
    core: ['Evasion', 'Perception', 'Tactics', 'Athletics', 'Concentration'],
    styles: [
      { name: 'Gunner', blurb: 'Win it at range: high REF turns every firearm skill into a real threat.', boost: { ref: 2 }, extra: ['Handgun', 'Shoulder Arms', 'Autofire'] },
      { name: 'Bruiser', blurb: 'Win it up close: BODY and DEX carry a melee or brawling fighter.', boost: { body: 1, dex: 1 }, extra: ['Brawling', 'Melee Weapon', 'Resist Torture/Drugs'] },
    ],
  },
  Netrunner: {
    summary: 'Lives in the Net — INT and TECH drive almost everything, WILL keeps you standing.',
    weights: { int: 3, tech: 3, will: 2, ref: 2, dex: 1, cool: 1 },
    core: ['Electronics/Security Tech', 'Cryptography', 'Library Search', 'Perception', 'Concentration'],
    styles: [
      { name: 'Data Hound', blurb: 'Stay home and out-think everyone: research, decryption, and knowing things.', boost: { int: 2 }, extra: ['Education', 'Conceal/Reveal Object', 'Basic Tech'] },
      { name: 'Field Runner', blurb: 'Go on-site: slip in, jack in, get out — needs body skills as much as net skills.', boost: { dex: 1, ref: 1 }, extra: ['Stealth', 'Evasion', 'Handgun'] },
    ],
  },
  Tech: {
    summary: 'Builds and fixes everything — TECH and INT first, steady hands second.',
    weights: { tech: 3, int: 3, dex: 2, ref: 1, cool: 1, will: 1 },
    core: ['Basic Tech', 'Electronics/Security Tech', 'Weaponstech', 'Cybertech', 'Perception'],
    styles: [
      { name: 'Gearhead', blurb: 'Hands-on and mobile: vehicles, quick fixes, and staying alive on the job site.', boost: { dex: 1, ref: 1 }, extra: ['Land Vehicle Tech', 'Athletics', 'Evasion'] },
      { name: 'Lab Rat', blurb: 'Bench-bound inventor: chemistry, theory, and long concentration.', boost: { int: 2 }, extra: ['Education', 'Science (Chemistry)', 'Concentration'] },
    ],
  },
  Medtech: {
    summary: 'Keeps people alive — TECH for the work, EMP and WILL for the patient and the pressure.',
    weights: { tech: 3, int: 2, emp: 2, will: 2, dex: 1, cool: 1 },
    core: ['First Aid', 'Paramedic', 'Cybertech', 'Perception', 'Human Perception'],
    styles: [
      { name: 'Field Medic', blurb: 'Patch people mid-fight: mobility and nerve under fire.', boost: { dex: 1, will: 1 }, extra: ['Evasion', 'Athletics', 'Resist Torture/Drugs'] },
      { name: 'Clinic Doc', blurb: 'Run the practice: diagnosis, drugs, and a deep medical knowledge base.', boost: { int: 2 }, extra: ['Science (Chemistry)', 'Education', 'Deduction'] },
    ],
  },
  Rockerboy: {
    summary: 'The performance is the weapon — COOL and EMP draw a crowd, TECH covers the craft.',
    weights: { cool: 3, emp: 2, tech: 2, dex: 1, will: 1, int: 1 },
    core: ['Persuasion', 'Play Instrument', 'Composition', 'Wardrobe & Style', 'Conversation'],
    styles: [
      { name: 'Frontperson', blurb: 'The face of the movement: charm, image, and reading the room.', boost: { cool: 1, emp: 1 }, extra: ['Personal Grooming', 'Streetwise', 'Human Perception'] },
      { name: 'Street Fighter', blurb: 'Gets heard the hard way: a performer who can hold their own in a scrap.', boost: { dex: 1, body: 1 }, extra: ['Handgun', 'Brawling', 'Evasion'] },
    ],
  },
  Exec: {
    summary: 'Moves money and people — INT and COOL, with enough EMP to read who matters.',
    weights: { int: 3, cool: 3, emp: 2, will: 1, ref: 1 },
    core: ['Business', 'Persuasion', 'Conversation', 'Human Perception', 'Accounting'],
    styles: [
      { name: 'Dealmaker', blurb: 'Wins in the boardroom: paperwork, polish, and listening between the lines.', boost: { emp: 1, int: 1 }, extra: ['Bureaucracy', 'Personal Grooming', 'Lip Reading'] },
      { name: 'Corp Operator', blurb: 'Handles the dirty end personally: low profile, quick draw, clean exit.', boost: { ref: 1, dex: 1 }, extra: ['Handgun', 'Evasion', 'Stealth'] },
    ],
  },
  Fixer: {
    summary: 'Knows a guy for everything — COOL and INT to work the deal, EMP to read the buyer.',
    weights: { cool: 3, int: 2, emp: 2, dex: 1, ref: 1 },
    core: ['Streetwise', 'Trading', 'Bribery', 'Persuasion', 'Conversation'],
    styles: [
      { name: 'Broker', blurb: 'Moves goods and favors: business sense, paperwork, and sizing people up.', boost: { int: 1, emp: 1 }, extra: ['Business', 'Forgery', 'Human Perception'] },
      { name: 'Street Boss', blurb: 'Runs the block: reputation backed by someone who can actually fight.', boost: { ref: 1, dex: 1 }, extra: ['Handgun', 'Brawling', 'Evasion'] },
    ],
  },
  Lawman: {
    summary: 'Procedure plus backup — REF for the sidearm, INT to build a case.',
    weights: { ref: 3, int: 2, dex: 2, body: 2, cool: 2, will: 1 },
    core: ['Handgun', 'Criminology', 'Deduction', 'Perception', 'Interrogation'],
    styles: [
      { name: 'Patrol Officer', blurb: 'First through the door: firearms, fitness, and a steady response.', boost: { ref: 1, body: 1 }, extra: ['Shoulder Arms', 'Athletics', 'Brawling'] },
      { name: 'Detective', blurb: 'Solves it sitting down: read people, follow the trail, stay patient.', boost: { int: 1, emp: 1 }, extra: ['Human Perception', 'Tracking', 'Conversation'] },
    ],
  },
  Media: {
    summary: 'Digs up the story — INT and EMP first, the nerve to publish it second.',
    weights: { int: 3, emp: 2, cool: 2, tech: 1, will: 1, ref: 1 },
    core: ['Persuasion', 'Human Perception', 'Library Search', 'Composition', 'Conversation'],
    styles: [
      { name: 'Investigator', blurb: 'Digs where nobody wants you: deduction, lip reading, and getting in unseen.', boost: { int: 1, emp: 1 }, extra: ['Deduction', 'Lip Reading', 'Stealth'] },
      { name: 'Broadcaster', blurb: 'Gets the story out: the camera, the audience, and the right palms greased.', boost: { cool: 1, tech: 1 }, extra: ['Photography/Film', 'Bribery', 'Education'] },
    ],
  },
  Nomad: {
    summary: 'Drive it, fix it, defend the pack — REF behind the wheel, BODY and WILL for the road.',
    weights: { ref: 3, dex: 2, body: 2, will: 2, int: 1, cool: 1 },
    core: ['Drive Land Vehicle', 'Wilderness Survival', 'Perception', 'Evasion', 'Trading'],
    styles: [
      { name: 'Road Warrior', blurb: 'Defends the convoy: guns and fists when the road gets ugly.', boost: { ref: 1, body: 1 }, extra: ['Handgun', 'Brawling', 'Athletics'] },
      { name: 'Pack Scout', blurb: 'Reads the land ahead: tracking, quiet movement, and animal sense.', boost: { int: 1, dex: 1 }, extra: ['Tracking', 'Stealth', 'Animal Handling'] },
    ],
  },
}

const SKILL_STAT: Record<string, StatKey> = Object.fromEntries(
  SKILL_CATALOG.map(s => [s.name.toLowerCase(), s.stat as StatKey]),
)

const styleWeights = (a: RoleAdvice, s: BuildStyle) => {
  const w: Partial<Record<StatKey, number>> = { ...a.weights }
  for (const [k, v] of Object.entries(s.boost)) w[k as StatKey] = (w[k as StatKey] ?? 0) + (v ?? 0)
  return w
}

// Weighted average of the stats that matter for this Role/style (1–10 scale).
export function fitScore(weights: Partial<Record<StatKey, number>>, stats: Stats): number {
  let total = 0, sum = 0
  for (const [k, w] of Object.entries(weights)) { total += (w ?? 0) * stats[k as StatKey]; sum += w ?? 0 }
  return sum ? total / sum : 0
}

export function bestStyle(role: string, stats: Stats): { style: BuildStyle; score: number } | null {
  const advice = ROLE_ADVICE[role]
  if (!advice) return null
  const scored = advice.styles.map(style => ({ style, score: fitScore(styleWeights(advice, style), stats) }))
  return scored.sort((a, b) => b.score - a.score)[0]
}

export type ArrayFit = { roll: number; score: number; rank: number; tier: 'strong' | 'workable' | 'weak'; style: BuildStyle }

// Rank every pre-rolled spread for a Role. Tiers are relative (top three, middle
// four, bottom three) — every spread is playable, this just shows which fit best.
export function rankArrays(role: string, arrays: { roll: number; values: Stats }[]): Record<number, ArrayFit> | null {
  if (!ROLE_ADVICE[role]) return null
  const scored = arrays.map(a => ({ roll: a.roll, ...bestStyle(role, a.values)! }))
  scored.sort((a, b) => b.score - a.score || a.roll - b.roll)
  const out: Record<number, ArrayFit> = {}
  scored.forEach((s, i) => {
    out[s.roll] = { roll: s.roll, score: s.score, rank: i + 1, tier: i < 3 ? 'strong' : i < 7 ? 'workable' : 'weak', style: s.style }
  })
  return out
}

export type StatCall = { stat: StatKey; value: number }
export function statCallouts(role: string, stats: Stats): { strengths: StatCall[]; weakSpots: StatCall[] } {
  const advice = ROLE_ADVICE[role]
  if (!advice) return { strengths: [], weakSpots: [] }
  const keyStats = Object.entries(advice.weights).filter(([, w]) => (w ?? 0) >= 2).map(([k]) => k as StatKey)
  const calls = keyStats.map(stat => ({ stat, value: stats[stat] }))
  return {
    strengths: calls.filter(c => c.value >= 7).sort((a, b) => b.value - a.value),
    weakSpots: calls.filter(c => c.value <= 4).sort((a, b) => a.value - b.value),
  }
}

export type Pool = { points: number; min: number; max: number; default: number; skills: string[] }
export type SkillSpread = { style: BuildStyle; levels: Record<string, number>; top: string[]; mid: string[]; low: string[] }

// Spend the pool across the career skills: signature skills to the max, the next
// tier at the default, the rest at the minimum — sized so the total hits the pool
// exactly. The middle tier goes to skills governed by this spread's strongest stats.
export function suggestSkillSpread(role: string, stats: Stats, pool: Pool): SkillSpread | null {
  const advice = ROLE_ADVICE[role]
  const best = bestStyle(role, stats)
  if (!advice || !best) return null
  const inPool = (n: string) => pool.skills.includes(n)
  const sixes = Array.from(new Set([...advice.core, ...best.style.extra])).filter(inPool)

  // How many skills sit at max (a) / default (b) / min (c) so the sum is exact.
  const n = pool.skills.length
  let pick: { a: number; b: number } | null = null
  for (let a = 0; a <= n; a++) {
    for (let b = 0; a + b <= n; b++) {
      const c = n - a - b
      if (a * pool.max + b * pool.default + c * pool.min !== pool.points) continue
      if (!pick || Math.abs(a - sixes.length) < Math.abs(pick.a - sixes.length)) pick = { a, b }
    }
  }
  if (!pick) return null

  const top = sixes.slice(0, pick.a)
  const weights = styleWeights(advice, best.style)
  const rest = pool.skills.filter(s => !top.includes(s))
  const scoreOf = (s: string) => {
    const stat = SKILL_STAT[s.toLowerCase()]
    return stat ? stats[stat] + (weights[stat] ?? 0) * 0.25 : 0
  }
  // Fill any shortfall in the top tier, then the mid tier, by strongest governing stat.
  const ranked = [...rest].sort((x, y) => scoreOf(y) - scoreOf(x) || pool.skills.indexOf(x) - pool.skills.indexOf(y))
  while (top.length < pick.a && ranked.length) top.push(ranked.shift()!)
  const mid = ranked.slice(0, pick.b)
  const low = ranked.slice(pick.b)

  const levels: Record<string, number> = {}
  top.forEach(s => (levels[s] = pool.max))
  mid.forEach(s => (levels[s] = pool.default))
  low.forEach(s => (levels[s] = pool.min))
  return { style: best.style, levels, top, mid, low }
}
