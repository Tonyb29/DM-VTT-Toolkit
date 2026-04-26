# DM Toolkit — dmtoolkit.org

A browser-based toolkit for Dungeon Masters. Convert D&D 5e stat blocks, build encounters, manage campaign worlds, create magic items, track celestial events, and build player options — all from a single-page app with no server required.

**Live site:** [dmtoolkit.org](https://dmtoolkit.org)
**Current version:** v1.1 (Phase 21 complete)
**License:** [CC BY-NC 4.0](LICENSE) — free for personal use; commercial use requires written permission

---

## VTT Export Targets

| Platform | Format | Status |
|---|---|---|
| **Foundry VTT** (dnd5e v4.0+) | Actor JSON + macro | ✅ Full support |
| **Fantasy Grounds Unity** | 2024 XML | ✅ Full support |
| **Roll20** (D&D 5e 2014 sheet) | NPC JSON + API script | ✅ Full support |

---

## Tabs

### Tab 1 — Stat Block Parser
Paste any D&D 5e stat block and get a Foundry actor JSON, FGU XML, and Roll20 JSON — ready to import.

**Input modes:**
- **Text** — paste raw stat block text
- **Image** — upload a screenshot; Claude extracts the text via vision
- **URL** — paste a page URL; fetches and extracts stat block (static HTML only)
- **Name** — enter a monster name; Claude generates the canonical stat block from training data
- **✨ AI** — enter any name + target CR; Claude builds a fully custom stat block at exactly that CR

**What gets parsed:**
- Name, size, type, alignment, AC, HP (with formula), speed (all movement types)
- All ability score layout formats; saving throws, skills, senses, languages, CR + XP
- Damage resistances / immunities / vulnerabilities (2014 and 2024 formats)
- Condition immunities, conditional resistances
- Melee/ranged attacks → weapon items with attack activities
- Saving throw actions, traits, reactions, bonus actions, legendary actions, lair actions
- Recharge, N/Day, short rest / long rest recovery
- Slot-based spellcasting (2014), innate (At Will/N/Day), 2024 frequency format, dual casters
- ~160 SRD spells auto-resolved for school + level
- Sidekick format (Tasha's)

**Export:** Platform selector tab row — choose **Foundry VTT** · **Fantasy Grounds** · **Roll20** — one panel shown at a time. Foundry panel also includes Add to Encounter Builder.

---

### Tab 2 — Batch Processor
Parse multiple stat blocks at once, or generate a list of monsters by name with AI.

- **Text mode** — separate blocks with `---`; parse an entire bestiary page in one pass
- **Names mode** — sequential Claude generation with cancel, per-card reroll, structured context (CR, race, role, theme)
- Result cards show accuracy score, stat summary, and per-card errors
- **Export:** Foundry macro (all actors) · bulk JSON · FGU XML · Send all to Encounter Builder

---

### Tab 3 — Encounter Builder
Collect parsed creatures into named encounter groups and balance them against your party.

- Multiple named encounters; rename/delete via sidebar
- Add from Parser or Batch Processor; re-adding increments quantity
- Per-creature quantity controls; party size + level difficulty panel
- Live XP budget bar — Easy / Medium / Hard / Deadly thresholds with colored badge
- **Export:** Foundry macro (creates actors + loads combat tracker)

---

### Tab 4 — Campaign Builder
Import a full campaign world into Foundry in 5 macro steps.

1. **Folders** — journal and actor folder structure
2. **Journals** — world lore entries
3. **NPC Actors** — leader actors per continent
4. **Creature Actors** — full embedded stat blocks; optional AI generation
5. **AI NPC Stat Blocks** — Claude generates and patches all NPC actors in-place

All macros are update-in-place safe. Includes the Eldoria: Echoes of the Aether preset (7 continents, 28 NPC leaders, 19 creatures) and a blank preset.

**AI Generate** — describe your campaign in plain language; Claude builds the full preset.

---

### Tab 5 — ✦ Magic Items
Create Foundry-ready magic item JSON in three modes.

- **Text** — paste any description; Claude extracts all fields
- **✨ AI Generate** — describe your idea; Claude designs the full item
- **Builder** — structured form; no API call needed

Supports: magic weapons, armor, wondrous items, consumables (potions/scrolls/wands/rods/ammunition). Charges + recharge, attunement, rarity, HTML description. Per-feature feat items (draggable) in `Magic Items → [Name] → Features/` folder.

---

### Tab 6 — ✦ Celestial Calculator
Track moon phases, celestial events, and generate installable Foundry modules.

- Live SVG night sky with accurate moon phase shading
- Phase cards, boons & pitfalls, year event calendar
- Moon + calendar editor — add/remove/edit moons, custom boons/pitfalls
- **✨ AI Sky Description** — poetic read-aloud for DMs
- **Export to Foundry** — generates a complete installable module ZIP with in-game Night Sky panel

**Manifest URL:** `https://raw.githubusercontent.com/Tonyb29/Celestial-Calendar/main/module.json`

---

### Tab 7 — ✦ Player Tools
Build player-facing options for Foundry in four sub-tabs.

- **Class Creator** — full class with advancements, features, subclass levels
- **Subclass Creator** — subclass items with feature progressions
- **Species Creator** — species/race items with traits
- **Background Creator** — background items with features and skill proficiencies

Each sub-tab includes an **✨ AI Assistant** that generates a complete template from a plain-language description.

---

## Roll20 Import Setup

The Roll20 export requires installing our free API script in your campaign (Pro account required).

1. Download [DMToolkit-Roll20-Importer.js](DMToolkit-Roll20-Importer.js)
2. In Roll20: **Game Settings → API Scripts → New Script** → paste contents → Save
3. Use the **D&D 5e by Roll20 (2014)** character sheet

**Each import:**
1. Copy Roll20 JSON from the parser
2. Create a Handout in Roll20, paste JSON into its GM Notes field
3. In chat: `!dmtimport handout|YourHandoutName`

---

## Development

```bash
npm install
```

**Start dev server:**
```bash
pkill -f vite 2>/dev/null; sleep 1; nohup npx vite --port 3000 --force > /tmp/vite-fresh.log 2>&1 &
```

**Access from Windows (WSL2):**
- `http://localhost:3000` (WSL2 port mirroring)
- `http://172.26.183.195:3000` (WSL2 VM IP — may change on reboot)

> **WSL2 note:** Vite's file watcher doesn't reliably HMR on `/mnt/c/`. Always kill and restart after changes. Use `--force` to clear the dependency cache.

---

## Project Structure

```
/
├── src/
│   └── App.tsx                          # Tab host — all 7 tabs, encounter state, theme
├── parser-versions/
│   ├── dnd-parser-v20-stable.tsx        # Core parser + StatBlockParser component (Tab 1)
│   ├── batch-processor.tsx              # Batch Processor + AI Name Mode (Tab 2)
│   ├── encounter-builder.tsx            # Encounter Builder (Tab 3)
│   ├── campaign-builder.tsx             # Campaign Builder UI (Tab 4)
│   ├── campaign-builder-data.ts         # CampaignPreset interface + macro builders
│   ├── campaign-eldoria-preset.ts       # ELDORIA_PRESET + BLANK_PRESET
│   ├── magic-item-creator.tsx           # Magic Item Creator (Tab 5)
│   ├── celestial-calculator.tsx         # Celestial Calculator + Night Sky (Tab 6)
│   ├── celestial-foundry-export.ts      # Foundry module ZIP generator
│   ├── character-options.tsx            # Player Tools — Class/Subclass/Species/Background (Tab 7)
│   ├── class-importer.tsx               # Class import template parser (used by Player Tools)
│   ├── fantasy-grounds-exporter.ts      # FGU 2024 XML formatter
│   ├── roll20-exporter.ts               # Roll20 D&D 5e 2014 JSON formatter
│   ├── claude-api.ts                    # Anthropic SDK — all AI calls isolated here
│   └── settings-modal.tsx              # API key management
├── DMToolkit-Roll20-Importer.js         # Roll20 API script (install once per campaign)
├── public/
│   ├── about.html                       # Landing + feature overview page
│   ├── privacy.html
│   └── _headers                         # Cloudflare CSP headers
├── vite.config.ts
└── README.md
```

---

## Roadmap

| Phase | Feature | Status |
|---|---|---|
| 9 | Custom Class Importer | ✅ Complete |
| 10 | Fantasy Grounds Unity export | ✅ Complete — user validated |
| 11 | Batch Processor | ✅ Complete |
| 12/13 | OCR + AI parsing (image/URL/name) | ✅ Complete |
| 14 | Batch AI Name Mode + reroll | ✅ Complete |
| 14b/c | Campaign Builder AI NPCs + creature stat blocks | ✅ Complete |
| 15 | Generic CampaignPreset architecture | ✅ Complete |
| 15b | Encounter Builder + AI Custom CR + difficulty | ✅ Complete |
| 15c | AI Campaign Generator + Import/Export JSON | ✅ Complete |
| 16 | AI Class Assistant | ✅ Complete |
| 17 | Campaign editor — add/edit/delete all entities | ✅ Complete |
| 18 | Magic Item Creator (Tab 5) | ✅ Complete |
| 18b | Celestial Calculator (Tab 6) — night sky, moons, calendar, Foundry module | ✅ Complete |
| 19 | Player Tools (Tab 7) — Class, Subclass, Species, Background creators | ✅ Complete |
| 20 | Roll20 NPC JSON export + API importer script | ✅ Complete |
| 21 | Theme system — Settings modal picker; all 7 tabs theme-aware via CSS vars | ✅ Complete |
| 21b | Platform selector — tabbed Foundry / FGU / Roll20 export in parser | ✅ Complete |
| 21c | About page hub — game system cards (D&D live, PF2e in progress, Draw Steel coming) | ✅ Complete |
| — | Draw Steel (MCDM) system support | 🔜 Planned v2 |
| — | Pathfinder 2e system support | 🔄 In Progress |
| — | Desktop app (Electron/Tauri) | ⏸ Deferred |

---

## Game System Roadmap

| System | Market | Status | Notes |
|---|---|---|---|
| **D&D 5e (2014/2024)** | ~45% | ✅ Live | Core product — 7 tools, all 3 VTTs |
| **Pathfinder 2e** | ~10-15% | 🔄 In Progress | Remaster edition; Foundry target |
| **Draw Steel (MCDM)** | Growing | 🔜 Planned v2 | First-mover window; no Demiplane deal |
| **Daggerheart** | Growing | ⏸ Watch | Demiplane official Foundry system |
| **Cyberpunk Red** | Niche | ⏸ Deferred | Demiplane publisher + Roll20 deal |
| **Vampire: The Masquerade** | Medium | ⏸ Watch | Demiplane nexus deal |

---

## Known Limitations

- Spell descriptions are empty — items created by name; link to compendium in Foundry manually
- Spells not in `SPELL_META` have blank school and default level 0
- URL import works on static HTML only — D&D Beyond / GM Binder are JS-rendered
- Roll20 export targets the D&D 5e 2014 sheet only (2024 sheet not yet supported)
- API key stored in `localStorage` — BYOK model; no backend proxy currently
