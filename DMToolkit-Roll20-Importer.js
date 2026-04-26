// DMToolkit-Roll20-Importer.js  v1.0.0
// Roll20 API script — imports D&D 5e NPC stat blocks from DM Toolkit JSON
// Compatible with: D&D 5e by Roll20 (2014 sheet)
//
// INSTALL:  Game Settings → API Scripts → New Script → paste this file → Save
// USAGE:
//   1. Parse a monster on dmtoolkit.org → copy the Roll20 JSON
//   2. In Roll20: create a Handout, paste JSON into the GM Notes field
//   3. In chat: !dmtimport handout|HandoutName
//
// Source: https://github.com/Tonyb29/DM-VTT-Toolkit
// License: CC BY-NC 4.0 — non-commercial use only

(() => {
  'use strict';

  const VERSION = '1.0.0';
  const CMD     = '!dmtimport';

  // ── Logging / chat ──────────────────────────────────────────────────────────
  const dbg   = (msg) => log(`[DMToolkit] ${msg}`);
  const wgm   = (who, msg) => sendChat('DMToolkit', `/w gm ${msg}`);
  const errGm = (who, msg) => sendChat('DMToolkit', `/w gm ❌ ${msg}`);

  // ── ID generator ────────────────────────────────────────────────────────────
  // Generates Roll20-style repeating section row IDs ("-" + 19 random chars)
  const genId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '-';
    for (let i = 0; i < 19; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const parseBonus = (v) => {
    if (typeof v === 'number') return v;
    const n = parseInt((String(v) || '0').replace(/[^-\d]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  };

  const calcAvg = (formula) => {
    if (!formula) return 0;
    const m = String(formula).match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!m) return parseInt(formula) || 0;
    return Math.floor(parseInt(m[1]) * (parseInt(m[2]) + 1) / 2 + parseInt(m[3] || '0'));
  };

  const decodeGmNotes = (raw) =>
    decodeURIComponent(raw)
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ').trim();

  // ── Attribute helpers ────────────────────────────────────────────────────────
  const setAttr = (charId, name, value, max) => {
    if (value === undefined || value === null) return;
    const existing = findObjs({ _type: 'attribute', _characterid: charId, name })[0];
    if (existing) {
      const upd = { current: String(value) };
      if (max !== undefined) upd.max = String(max);
      existing.setWithWorker(upd);
    } else {
      const attrs = { characterid: charId, name, current: String(value) };
      if (max !== undefined) attrs.max = String(max);
      createObj('attribute', attrs);
    }
  };

  // Create attributes for a repeating section row
  const setRep = (charId, section, rowId, attrs) => {
    Object.entries(attrs).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        createObj('attribute', {
          _characterid: charId,
          name:         `repeating_${section}_${rowId}_${k}`,
          current:      String(v),
        });
      }
    });
  };

  // ── XP table (DMG p.274) ─────────────────────────────────────────────────────
  const XP_BY_CR = {
    '0':10,'1/8':25,'1/4':50,'1/2':100,
    '1':200,'2':450,'3':700,'4':1100,'5':1800,
    '6':2300,'7':2900,'8':3900,'9':5000,'10':5900,
    '11':7200,'12':8400,'13':10000,'14':11500,'15':13000,
    '16':15000,'17':18000,'18':20000,'19':22000,'20':25000,
    '21':33000,'22':41000,'23':50000,'24':62000,'25':75000,
    '26':90000,'27':105000,'28':120000,'29':135000,'30':155000,
  };

  // ── Core importer ────────────────────────────────────────────────────────────
  const importNpc = (d, who) => {
    // Create the character sheet
    const char = createObj('character', { name: d.name || 'Unknown NPC' });
    if (!char) { errGm(who, `Failed to create character for "${d.name}".`); return; }
    const charId = char.id;
    dbg(`Created character "${d.name}" (${charId})`);

    // ── Flags & identity ───────────────────────────────────────────────────────
    setAttr(charId, 'npc',            1);
    setAttr(charId, 'character_name', d.name);
    setAttr(charId, 'npc_name',       d.name);
    if (d.size)      setAttr(charId, 'npc_size',      d.size);
    if (d.type)      setAttr(charId, 'npc_type',      d.type);
    if (d.alignment) setAttr(charId, 'npc_alignment', d.alignment);

    // ── AC ─────────────────────────────────────────────────────────────────────
    const acVal   = typeof d.ac === 'object' ? (d.ac.value ?? 10) : (d.ac ?? 10);
    const acNotes = typeof d.ac === 'object' ? (d.ac.notes || d.ac.type || '') : '';
    setAttr(charId, 'npc_ac',       acVal);
    setAttr(charId, 'npc_ac_notes', acNotes);
    setAttr(charId, 'npc_actype',   acNotes);

    // ── HP ─────────────────────────────────────────────────────────────────────
    const hpAvg  = typeof d.hp === 'object' ? (d.hp.average ?? 0) : (d.hp ?? 0);
    const hpForm = typeof d.hp === 'object' ? (d.hp.formula  ?? '') : '';
    setAttr(charId, 'hp',            hpAvg, hpAvg);
    setAttr(charId, 'npc_hp',        hpAvg);
    setAttr(charId, 'npc_hpbase',    hpAvg);
    setAttr(charId, 'npc_hpformula', hpForm);

    if (d.speed) setAttr(charId, 'npc_speed', d.speed);

    // ── Abilities ──────────────────────────────────────────────────────────────
    const ABILITY_FULL = {
      str:'strength', dex:'dexterity', con:'constitution',
      int:'intelligence', wis:'wisdom', cha:'charisma',
    };
    Object.entries(d.abilities || {}).forEach(([k, v]) => {
      const full = ABILITY_FULL[k.toLowerCase()] || k;
      setAttr(charId, full,           v);
      setAttr(charId, `${full}_base`, v);
    });

    // ── Saving throws ──────────────────────────────────────────────────────────
    Object.entries(d.saves || {}).forEach(([k, v]) => {
      const full = ABILITY_FULL[k.toLowerCase()] || k;
      setAttr(charId, `npc_save_${full}_bonus`, v);
    });

    // ── Skills ─────────────────────────────────────────────────────────────────
    Object.entries(d.skills || {}).forEach(([skillName, bonus]) => {
      const clean = skillName.toLowerCase().replace(/\s+/g, '');
      const num   = parseBonus(bonus);
      setAttr(charId, `npc_${clean}_bonus`, bonus);
      setAttr(charId, `npc_${clean}`,       String(num));
      setAttr(charId, `npc_${clean}_base`,  bonus);
    });

    // ── Defenses ───────────────────────────────────────────────────────────────
    if (d.damage_vulnerabilities) setAttr(charId, 'npc_vulnerabilities',      d.damage_vulnerabilities);
    if (d.damage_resistances)     setAttr(charId, 'npc_resistances',          d.damage_resistances);
    if (d.damage_immunities)      setAttr(charId, 'npc_immunities',           d.damage_immunities);
    if (d.condition_immunities)   setAttr(charId, 'npc_condition_immunities', d.condition_immunities);
    if (d.senses)                 setAttr(charId, 'npc_senses',               d.senses);
    if (d.languages)              setAttr(charId, 'npc_languages',            d.languages);

    // Show logic panel if creature has resistances, immunities, or legendary
    if (d.damage_resistances || d.damage_immunities || d.condition_immunities || d.legendary || d.mythic_actions) {
      setAttr(charId, 'npclogic_flag',      'on');
      setAttr(charId, 'npc_options-flag',   '1');
    }

    // ── CR / XP ────────────────────────────────────────────────────────────────
    if (d.cr !== undefined) {
      setAttr(charId, 'npc_challenge', String(d.cr));
      const xp = d.xp ?? XP_BY_CR[String(d.cr)];
      if (xp !== undefined) setAttr(charId, 'npc_xp', String(xp));
    }

    // ── Legendary actions ──────────────────────────────────────────────────────
    if (d.legendary?.count) {
      setAttr(charId, 'npc_legendary_actions', String(d.legendary.count));
    }

    // ── Mythic / lair actions ──────────────────────────────────────────────────
    if (d.mythic_actions) {
      setAttr(charId, 'npc_mythic_actions', '1');
      if (d.mythic_actions.desc) setAttr(charId, 'npc_mythic_actions_desc', d.mythic_actions.desc);
    }

    // ── Spellcasting ───────────────────────────────────────────────────────────
    const spellAbilMap = {
      intelligence: '@{intelligence_mod}+',
      wisdom:       '@{wisdom_mod}+',
      charisma:     '@{charisma_mod}+',
    };
    if (d.spellcasting_ability && d.spellcasting_ability.toLowerCase() !== 'none') {
      const spellAttrVal = spellAbilMap[d.spellcasting_ability.toLowerCase()] || d.spellcasting_ability;
      setAttr(charId, 'spellcasting_ability', spellAttrVal);
      setAttr(charId, 'npcspellcastingflag',  '1');
      setAttr(charId, 'caster_level',         String(d.caster_level || 0));
      for (let i = 1; i <= 9; i++) {
        const slots = (d.spell_slots || {})[String(i)] ?? 0;
        setAttr(charId, `lvl${i}_slots_total`, String(slots));
      }
    }

    // ── Repeating sections ─────────────────────────────────────────────────────

    // Traits
    (d.traits || []).forEach((trait) => {
      const rowId = genId();
      const desc  = trait.desc || '';
      createObj('attribute', { _characterid: charId, name: `repeating_npctrait_${rowId}_name`, current: trait.name });
      const da = createObj('attribute', { _characterid: charId, name: `repeating_npctrait_${rowId}_desc`, current: desc });
      if (da?.setWithWorker) da.setWithWorker({ current: desc });
    });

    // Actions (standard, legendary, mythic/lair)
    const addAction = (action, section) => {
      const rowId = genId();
      const base  = {
        name:             action.name || '',
        description:      action.desc || '',
        show_desc:        '1',
        attack_tohitrange:'+0',
        attack_crit:      '',
        attack_crit2:     '',
        attack_onhit:     '',
        damage_flag:      '',
      };

      if (action.attack) {
        const atk       = action.attack;
        const tohitNum  = parseBonus(atk.tohit);
        const tohitStr  = tohitNum >= 0 ? `+${tohitNum}` : `${tohitNum}`;
        const isRanged  = (atk.type || '').toLowerCase().includes('ranged');
        const dist      = atk.distance ?? atk.reach ?? atk.range;
        let tohitRange  = tohitStr;
        if (dist) tohitRange += isRanged ? `, Range ${dist}` : `, Reach ${dist}`;
        if (atk.target) tohitRange += `, ${atk.target}`;

        const avg1   = calcAvg(atk.dmg1);
        let onhit    = atk.dmg1 ? `${avg1} (${atk.dmg1}) ${atk.type1 || ''} damage` : '';
        if (atk.dmg2) onhit += ` plus ${calcAvg(atk.dmg2)} (${atk.dmg2}) ${atk.type2 || ''} damage`;

        Object.assign(base, {
          attack_flag:          'on',
          attack_tohit:         String(tohitNum),
          attack_tohitrange:    tohitRange,
          attack_damage:        atk.dmg1  || '',
          attack_damagetype:    atk.type1 || '',
          attack_damage2:       atk.dmg2  || '',
          attack_damagetype2:   atk.type2 || '',
          attack_crit:          atk.dmg1  || '',
          attack_crit2:         atk.dmg2  || '',
          attack_onhit:         onhit,
          attack_type:          atk.type  || '',
          attack_display_flag:  '{{attack=1}}',
          attack_options:       '{{attack=1}}',
          damage_flag:          `{{damage=1}} {{dmg1flag=1}}${atk.dmg2 ? ' {{dmg2flag=1}}' : ''} `,
        });
      }

      setRep(charId, section, rowId, base);
      dbg(`Added ${section}: ${action.name}`);
    };

    // Bonus actions
    const addBonusAction = (action) => {
      const rowId = genId();
      setRep(charId, 'npcbonusaction', rowId, {
        name:        action.name || '',
        description: action.desc || '',
        show_desc:   '1',
      });
    };

    // Reactions
    const addReaction = (reaction) => {
      const rowId = genId();
      const desc  = reaction.desc || '';
      createObj('attribute', { _characterid: charId, name: `repeating_npcreaction_${rowId}_name`, current: reaction.name });
      const da = createObj('attribute', { _characterid: charId, name: `repeating_npcreaction_${rowId}_desc`, current: desc });
      if (da?.setWithWorker) da.setWithWorker({ current: desc });
    };

    (d.actions           || []).forEach(a  => addAction(a,  'npcaction'));
    (d.bonus_actions     || []).forEach(addBonusAction);
    (d.reactions         || []).forEach(addReaction);
    (d.legendary?.actions || []).forEach(a => addAction(a,  'npcaction-l'));
    (d.mythic_actions?.actions || []).forEach(a => addAction(a, 'npcaction-m'));

    wgm(who, `✅ **${d.name}** imported! Find it in your Characters journal.`);
    dbg(`Import complete: ${d.name}`);
  };

  // ── Chat command listener ────────────────────────────────────────────────────
  on('ready', () => {
    dbg(`v${VERSION} ready. Command: ${CMD} handout|HandoutName`);

    on('chat:message', (msg) => {
      if (msg.type !== 'api' || !msg.content.startsWith(CMD)) return;

      const who   = msg.who || 'GM';
      const parts = msg.content.trim().split(/\s+/);

      if (parts.length < 2 || !parts[1].startsWith('handout|')) {
        wgm(who, `**DM Toolkit Importer** — Usage: \`!dmtimport handout|HandoutName\``);
        return;
      }

      const handoutName = parts[1].replace(/^handout\|/, '').trim();
      const handouts    = findObjs({ _type: 'handout', name: handoutName });

      if (!handouts.length) {
        errGm(who, `Handout "${handoutName}" not found. Check the name matches exactly (case-sensitive).`);
        return;
      }

      handouts[0].get('gmnotes', (raw) => {
        if (!raw || raw === 'null') {
          errGm(who, `Handout "${handoutName}" has no GM Notes. Paste your DM Toolkit JSON there first.`);
          return;
        }
        try {
          const json = decodeGmNotes(raw);
          const data = JSON.parse(json);
          importNpc(data, who);
        } catch (e) {
          errGm(who, `JSON parse error: ${e.message}. Make sure the GM Notes contain only the copied JSON from DM Toolkit (no extra text).`);
        }
      });
    });
  });

})();
