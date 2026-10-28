// campaign-cyberpunk-test-preset.ts
// A small Cyberpunk RED campaign for testing the Campaign Builder's folders, journals, NPC bios
// and @Actor links in Foundry — 7 NPCs, 2 districts, no creatures. Runs Steps 1, 2, 3 and 6 only
// (Steps 4 and 5 are D&D stat-block steps). NPCs are bare 'mook' actors; the bio goes in the
// Notes field. Names and factions are invented.

import { CampaignPreset, NpcDef } from './campaign-builder-data'

const IMG = 'icons/svg/mystery-man.svg'
const link = (n: string, label = n) => `@Actor[${n}]{${label}}`

const npc = (n: Omit<NpcDef, 'race' | 'alignment' | 'creatureType' | 'img'>): NpcDef => ({
  race: '', alignment: '', creatureType: '', img: IMG, ...n,
})

const CYBERPUNK_NPCS: NpcDef[] = [
  // ── WATSON ───────────────────────────────────────────────
  npc({
    name: 'Marlowe "Mama" Okafor',
    title: 'Fixer — runs the Watson night market',
    continent: 'Watson',
    cls: 'Fixer', cr: 7,
    statText: `NAME: Marlowe "Mama" Okafor
ROLE: Fixer
STATS: INT 7, REF 5, DEX 5, TECH 5, COOL 8, WILL 7, LUCK 6, MOVE 4, BODY 5, EMP 7
HP: 35
SP: 7
SKILLS: Bribery +7, Business +6, Conversation +7, Human Perception +8, Library Search +5, Perception +6, Persuasion +8, Streetwise +9, Handgun +4, Evasion +4
WEAPONS: Medium Pistol (2d6)
ARMOR: Light Armorjack
CYBERWARE: Neural Link, Interface Plugs
NOTES: Never raises her voice. Keeps a paper ledger because it cannot be hacked.`,
    bio: `<p><strong>Mama Okafor</strong> has run the Kabuki night market for twenty years and has never been robbed twice. Every gig in Watson passes through her ledger, and she takes a cut of all of them.</p><p>Her people: ${link('Dex Calloway')} keeps the peace and ${link('Juno Park')} keeps the lights on. She and ${link('Lt. Ana Reyes')} have an understanding that neither will admit to.</p>`,
    appearance: 'Heavyset, silver cornrows, a chrome cane she does not need. Always eating something.',
    relationships: 'Boss of Dex, Juno and Rook. Pays Lt. Reyes for quiet nights.',
    relations: [
      { with: 'Lt. Ana Reyes', kind: 'complicated', note: 'Pays her for quiet streets, and Reyes pretends not to know where the money comes from.' },
      { with: 'Sal "Two-Tone" Benedetti', kind: 'rival', note: 'He keeps trying to move product through her market without paying the table fee.' },
    ],
  }),
  npc({
    name: 'Dex Calloway',
    title: 'Solo — Mama Okafor\'s enforcer',
    continent: 'Watson',
    cls: 'Solo', cr: 6,
    statText: `NAME: Dex Calloway
ROLE: Solo
STATS: INT 5, REF 8, DEX 7, TECH 4, COOL 7, WILL 6, LUCK 5, MOVE 6, BODY 8, EMP 4
HP: 50
SP: 11
SKILLS: Athletics +5, Brawling +6, Concentration +5, Evasion +6, Handgun +8, Perception +6, Shoulder Arms +7, Stealth +4, Tactics +5, Resist Torture/Drugs +5
WEAPONS: Heavy Pistol (3d6), Assault Rifle (5d6)
ARMOR: Light Armorjack
CYBERWARE: Neural Link, Cybereye, Cyberaudio Suite
NOTES: Fights to end the argument, not to win it. Does not drink on shift.`,
    bio: `<p><strong>Dex</strong> is ex-military and says little. He settles disputes in the market so Mama never has to raise her voice.</p>`,
    appearance: 'Tall, shaved head, mirrored cybereyes, a long coat over body armor.',
    relationships: 'Loyal to Mama. Distrusts anyone from the Heywood gangs.',
    reportsTo: ['Marlowe "Mama" Okafor'],
    relations: [
      { with: 'Juno Park', kind: 'ally', note: 'Juno patches his cyberware at cost and he walks her home after late jobs.' },
      { with: 'Sal "Two-Tone" Benedetti', kind: 'rival', note: 'Sal\'s crew tried to shake down a stall last month. Dex has not forgotten.' },
    ],
  }),
  npc({
    name: 'Juno Park',
    title: 'Netrunner — market security and data broker',
    continent: 'Watson',
    cls: 'Netrunner', cr: 5,
    statText: `NAME: Juno Park
ROLE: Netrunner
STATS: INT 8, REF 6, DEX 6, TECH 6, COOL 5, WILL 6, LUCK 5, MOVE 5, BODY 4, EMP 5
HP: 30
SP: 7
SKILLS: Basic Tech +5, Concentration +5, Electronics/Security Tech +6, Evasion +4, Library Search +5, Perception +5, Handgun +3, Stealth +4
WEAPONS: Medium Pistol (2d6)
ARMOR: Light Armorjack
CYBERWARE: Neural Link, Interface Plugs
NOTES: Sells data; does not keep it. Reads the contents later, if at all.`,
    bio: `<p><strong>Juno</strong> runs the market's cameras, payment rails and quiet little data-selling side business. ${link('Rook')} builds her decks.</p>`,
    appearance: 'Slight, neon-green hair, a Neural Link port she keeps covered with a sticker.',
    relationships: 'Works for Mama. Close with Rook; borrows protection from Dex.',
    reportsTo: ['Marlowe "Mama" Okafor'],
    relations: [
      { with: 'Rook', kind: 'ally', note: 'Rook builds her decks and she covers his debts.' },
      { with: 'Victor Hale', kind: 'complicated', note: 'Sold him a data package once and has been wondering ever since what he did with it.' },
    ],
  }),
  npc({
    name: 'Rook',
    title: 'Tech — deck builder and gear mender',
    continent: 'Watson',
    cls: 'Tech', cr: 4,
    statText: `NAME: Rook
ROLE: Tech
STATS: INT 6, REF 5, DEX 6, TECH 8, COOL 4, WILL 5, LUCK 4, MOVE 5, BODY 5, EMP 5
HP: 35
SP: 4
SKILLS: Basic Tech +6, Cybertech +5, Electronics/Security Tech +5, Weaponstech +5, Land Vehicle Tech +4, Perception +4, Streetwise +3, Handgun +3
WEAPONS: Medium Pistol (2d6)
ARMOR: Leathers
CYBERWARE: Cyberarm
NOTES: Works out of a shipping container. Never gives his real name.`,
    bio: `<p><strong>Rook</strong> works out of a shipping container behind the market. If it can be repaired or rebuilt, it gets done there. Nobody knows his real name.</p>`,
    appearance: 'Short, grease-stained, wears a welding visor pushed up on his forehead.',
    relationships: 'Answers to Mama on paper; actually answers to Juno.',
    reportsTo: ['Marlowe "Mama" Okafor', 'Juno Park'],
    relations: [
      { with: 'Juno Park', kind: 'ally', note: 'His best customer and his best friend.' },
    ],
  }),

  // ── HEYWOOD ──────────────────────────────────────────────
  npc({
    name: 'Lt. Ana Reyes',
    title: 'NCPD Lieutenant — Heywood precinct',
    continent: 'Heywood',
    cls: 'Lawman', cr: 6,
    statText: `NAME: Lt. Ana Reyes
ROLE: Lawman
STATS: INT 6, REF 6, DEX 6, TECH 4, COOL 7, WILL 7, LUCK 5, MOVE 5, BODY 6, EMP 5
HP: 40
SP: 11
SKILLS: Athletics +4, Brawling +4, Conversation +5, Criminology +6, Deduction +6, Handgun +7, Human Perception +6, Interrogation +6, Perception +6, Tracking +5
WEAPONS: Heavy Pistol (3d6)
ARMOR: Light Armorjack
CYBERWARE: Cyberaudio Suite
NOTES: Still keeps a notebook of everything she cannot prove.`,
    bio: `<p><strong>Reyes</strong> is one of the few cops in Heywood who still tries. She looks the other way for ${link('Marlowe "Mama" Okafor', 'Mama Okafor')} because it keeps Watson quieter than it would be otherwise, and she hates that it works.</p><p>She wants ${link('Sal "Two-Tone" Benedetti', 'Sal')} in a cell and ${link('Victor Hale')} off the street.</p>`,
    appearance: 'Mid-forties, tired eyes, a tailored coat that has seen better years.',
    relationships: 'Takes quiet money from Mama. Wants Sal and Hale gone.',
    relations: [
      { with: 'Marlowe "Mama" Okafor', kind: 'complicated', note: 'She knows it is a bribe and keeps telling herself it is a retainer.' },
      { with: 'Sal "Two-Tone" Benedetti', kind: 'rival', note: 'Has two open cases on him and no witnesses willing to testify.' },
      { with: 'Victor Hale', kind: 'rival', note: 'Hale\'s lawyers have already killed three of her investigations.' },
    ],
  }),
  npc({
    name: 'Sal "Two-Tone" Benedetti',
    title: 'Boss of Los Cuervos — Heywood street gang',
    continent: 'Heywood',
    cls: 'Nomad', cr: 5,
    statText: `NAME: Sal "Two-Tone" Benedetti
ROLE: Nomad
STATS: INT 5, REF 8, DEX 7, TECH 4, COOL 6, WILL 5, LUCK 6, MOVE 7, BODY 6, EMP 4
HP: 40
SP: 7
SKILLS: Athletics +4, Brawling +5, Drive Land Vehicle +6, Evasion +6, Handgun +6, Persuasion +4, Melee Weapon +5, Perception +4, Streetwise +5
WEAPONS: Medium Pistol (2d6), Knife (1d6)
ARMOR: Leathers
CYBERWARE: Cyberaudio Suite
NOTES: Always in motion. Brags about jobs he did not do.`,
    bio: `<p><strong>Sal</strong> inherited the gang from his brother and has been proving he deserves it ever since. He wants a table at ${link('Marlowe "Mama" Okafor', 'Mama Okafor')}'s market and has not worked out that she knows exactly why he wants it.</p>`,
    appearance: 'Wiry, half-black half-white dyed hair, a gold-capped grin, always in motion.',
    relationships: 'Wants into Mama\'s market. Cooperates with Hale when it pays.',
    relations: [
      { with: 'Victor Hale', kind: 'ally', note: 'Hale pays him to make problems vanish and does not ask how.' },
      { with: 'Dex Calloway', kind: 'rival', note: 'Dex humiliated one of his lieutenants in front of the whole market.' },
      { with: 'Lt. Ana Reyes', kind: 'rival', note: 'She is the one cop he cannot buy.' },
    ],
  }),
  npc({
    name: 'Victor Hale',
    title: 'Regional Security Director — Kessler-Brandt Corporation',
    continent: 'Heywood',
    cls: 'Exec', cr: 8,
    statText: `NAME: Victor Hale
ROLE: Exec
STATS: INT 7, REF 4, DEX 4, TECH 4, COOL 8, WILL 7, LUCK 5, MOVE 4, BODY 4, EMP 4
HP: 30
SP: 11
SKILLS: Bribery +6, Business +8, Conversation +6, Human Perception +7, Library Search +5, Persuasion +7, Perception +5, Streetwise +3, Handgun +3
WEAPONS: Medium Pistol (2d6)
ARMOR: Light Armorjack
CYBERWARE: Neural Link, Cyberaudio Suite
NOTES: Never touches anything dirty himself. Smiles the same way every time.`,
    bio: `<p><strong>Hale</strong> oversees corporate security for the Heywood arcology. He never touches anything dirty himself; ${link('Sal "Two-Tone" Benedetti', 'Sal')} does that for him. He is quietly interested in ${link('Juno Park')} and what she may have sold him by accident.</p>`,
    appearance: 'Immaculate suit, soft voice, a smile that never changes.',
    relationships: 'Pays Sal for deniable work. Watches Juno. Out of reach of Reyes.',
    relations: [
      { with: 'Sal "Two-Tone" Benedetti', kind: 'ally', note: 'An arrangement of convenience that Hale would drop the moment it became inconvenient.' },
      { with: 'Lt. Ana Reyes', kind: 'rival', note: 'Treats her as an irritant to be managed through legal channels.' },
      { with: 'Juno Park', kind: 'complicated', note: 'Her data package may be the one thing he cannot afford to have on the open market.' },
    ],
  }),
]

export const CYBERPUNK_TEST_PRESET: CampaignPreset = {
  id: 'cpr-test',
  system: 'cpr',
  name: 'Night City: Test Campaign',
  description: 'Cyberpunk RED test campaign for folders, journals and links',
  rootJournalFolderName: 'World Lore',
  creatureFolderName: 'Night City — Creatures',
  journalFolders: [
    { name: 'Night City Campaign',       type: 'JournalEntry', color: '#be185d' },
    { name: 'World Lore',                type: 'JournalEntry', parentName: 'Night City Campaign', color: '#1e3a5f' },
    { name: 'Continents',                type: 'JournalEntry', parentName: 'World Lore',          color: '#1e4a6f' },
    { name: 'Factions & Organizations',  type: 'JournalEntry', parentName: 'Night City Campaign', color: '#2a1a4c' },
    { name: 'Plot & Story',              type: 'JournalEntry', parentName: 'Night City Campaign', color: '#4c1a1a' },
  ],
  actorFolders: [
    { name: 'Night City — NPCs', type: 'Actor', color: '#be185d' },
    { name: 'Watson',            type: 'Actor', parentName: 'Night City — NPCs', color: '#1a4c2a' },
    { name: 'Heywood',           type: 'Actor', parentName: 'Night City — NPCs', color: '#7c1a1a' },
  ],
  npcs: CYBERPUNK_NPCS,
  creatures: [],
  continents: [
    {
      name: 'Watson', theme: 'Immigrant district, markets and rooftop gardens',
      geography: 'Dense, crowded and vertical, with the Kabuki night market at its centre.',
      culture: 'Loyalty is local. Everyone owes someone.',
      locations: ['Kabuki Night Market', 'Rook\'s Container Workshop', 'The Rooftop Gardens'],
    },
    {
      name: 'Heywood', theme: 'Gangs, corporate arcologies and old money',
      geography: 'A mix of gated corporate blocks and streets that belong to the gangs.',
      culture: 'The corporations pay for peace, and the gangs sell it to them.',
      locations: ['Kessler-Brandt Arcology', 'Heywood Precinct House', 'Los Cuervos Garage'],
    },
  ],
  journals: [
    {
      name: 'Night City Overview', folder: 'World Lore',
      pages: [
        {
          name: 'The Two Districts',
          html: `<h1>The Two Districts</h1><p>This test campaign has two districts and seven people to connect them.</p><ul><li><strong>Watson</strong> — ${link('Marlowe "Mama" Okafor', 'Mama Okafor')} and her crew (${link('Dex Calloway')}, ${link('Juno Park')}, ${link('Rook')}).</li><li><strong>Heywood</strong> — ${link('Lt. Ana Reyes')}, ${link('Sal "Two-Tone" Benedetti', 'Sal Benedetti')}, ${link('Victor Hale')}.</li></ul>`,
        },
      ],
    },
    {
      name: 'Kessler-Brandt Corporation', folder: 'Factions & Organizations',
      pages: [
        {
          name: 'Overview',
          html: `<h1>Kessler-Brandt Corporation</h1><p>A mid-sized security and logistics firm with a Heywood arcology. Local operations are run by ${link('Victor Hale')}, who uses ${link('Sal "Two-Tone" Benedetti', 'Los Cuervos')} for work he would rather not have on his books.</p>`,
        },
      ],
    },
    {
      name: 'The Data Package', folder: 'Plot & Story',
      pages: [
        {
          name: 'Hook',
          html: `<h1>The Data Package</h1><p>${link('Juno Park')} once sold ${link('Victor Hale')} a data package without reading the contents. Hale has since realised what was in it. ${link('Lt. Ana Reyes')} would like a copy; ${link('Marlowe "Mama" Okafor', 'Mama Okafor')} would like it not to exist.</p>`,
        },
      ],
    },
  ],
}
