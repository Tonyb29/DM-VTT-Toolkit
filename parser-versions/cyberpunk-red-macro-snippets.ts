// JavaScript source shared by the PC and NPC Foundry import macros.
//
// Both macros are generated as plain-JS strings that run inside Foundry, so
// the code they have in common is kept here as strings (String.raw, so regex
// backslashes pass through untouched) and interpolated into each macro. Keep
// these free of backticks and "${" — they are spliced into template literals.

// Defines (inside the macro's async IIFE): squash, packNames, byKey,
// loadPacks(), find(name, type?), fromDoc(doc, extra?).
//
// Item packs are discovered rather than hard-coded: every Item pack from the
// cyberpunk-red-core system (core packs first, so core wins a name clash).
// Names are matched "squashed" (letters and digits only) because the system's
// own naming differs from stat-block naming ("Bullet Proof Shield" vs
// "Bulletproof Shield"). A name like "Very Heavy Pistol (Basic)" is also
// indexed as "Basic Very Heavy Pistol".
export const PACK_LOOKUP_JS = String.raw`
  const squash = n => n.toLowerCase().replace(/[^a-z0-9]/g, '');
  const packNames = [];
  const byKey = new Map();
  const add = (k, doc) => { if (!byKey.has(k)) byKey.set(k, doc); };
  const loadPacks = async () => {
    const itemPacks = game.packs
      .filter(pk => pk.documentName === 'Item' &&
        (pk.collection.startsWith('cyberpunk-red-core.') || pk.metadata?.system === 'cyberpunk-red-core'))
      .sort((a, b) => (b.collection.includes('.core_') ? 1 : 0) - (a.collection.includes('.core_') ? 1 : 0));
    for (const pk of itemPacks) {
      packNames.push(pk.collection);
      for (const doc of await pk.getDocuments()) {
        add(squash(doc.name), doc);
        const m = doc.name.match(/^(.*?)\s*\((.*)\)\s*$/);
        if (m) add(squash(m[2] + ' ' + m[1]), doc);
      }
    }
    console.info('Cyberpunk RED import: searched Item packs', packNames);
  };
  const find = (name, type) => {
    const base = name
      .replace(/\s+x\s*\d+\s*$/i, '')
      .replace(/^program:\s*/i, '')
      .replace(/\bvh\b/gi, 'very heavy');
    const tries = [base, base.replace(/\s*\(.*\)\s*$/, ''), base.replace(/\s+(ammunition|ammo)$/i, '')];
    for (const t of tries) {
      const doc = byKey.get(squash(t));
      if (doc && (!type || doc.type === type)) return doc;
    }
    return null;
  };
  const fromDoc = (doc, extra = {}) => {
    const src = doc.toObject();
    return {
      _id: foundry.utils.randomID(16), name: src.name, type: src.type, img: src.img,
      system: { ...src.system, equipped: 'equipped', ...extra },
      effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: {},
    };
  };
`;

// Defines linkInstalledCyberware(created) -> number installed.
//
// Foundational cyberware (Neural Link, Cybereye...) has slots that options of
// the same cyberware type install into. The system records an install on the
// PARENT only: installedItems.list gets the option's item id and usedSlots
// grows by the option's size; the option item itself is unchanged. That needs
// the ids Foundry assigned on import, so it runs after Actor.create.
export const INSTALL_LINK_JS = String.raw`
  const linkInstalledCyberware = async created => {
    let installedCount = 0;
    try {
      const cyberware = created.items.filter(i => i.type === 'cyberware');
      const placed = new Set();
      const updates = [];
      for (const parent of cyberware) {
        const slotInfo = parent.system.installedItems;
        if (!parent.system.isFoundational || !slotInfo?.allowed || !(slotInfo.allowedTypes || []).includes('cyberware')) continue;
        const list = [...(slotInfo.list || [])];
        let used = slotInfo.usedSlots || 0;
        for (const opt of cyberware) {
          if (opt.id === parent.id || placed.has(opt.id) || opt.system.isFoundational) continue;
          if (opt.system.type !== parent.system.type) continue;
          const size = opt.system.size ?? 1;
          if (used + size > (slotInfo.slots || 0)) continue;
          list.push(opt.id); used += size; placed.add(opt.id); installedCount++;
        }
        if (list.length > (slotInfo.list || []).length) {
          updates.push({ _id: parent.id, 'system.installedItems.list': list, 'system.installedItems.usedSlots': used });
        }
      }
      if (updates.length) await created.updateEmbeddedDocuments('Item', updates);
    } catch (e) {
      console.warn('Cyberpunk RED cyberware install-linking failed; items are on the actor but not slotted.', e);
    }
    return installedCount;
  };
`;
