// campaign-cpr-step3.ts
// Step 3 for Cyberpunk RED campaigns: creates each district's NPCs as 'mook' actors from the same
// parser + actor builder + compendium matching the Cyberpunk NPC tool uses. NPCs without a stat
// block become bare mooks. The NPC's Rank (stored in `cr`) goes in the alias with the Role.

import type { CampaignPreset } from './campaign-builder-data'
import { parseCyberpunkRedStatBlock, toCyberpunkRedFoundryActor } from './cyberpunk-red-parser'
import { PACK_LOOKUP_JS, INSTALL_LINK_JS, AMMO_LINK_JS } from './cyberpunk-red-macro-snippets'

export function buildCprStep3Macro(districtName: string, preset: CampaignPreset): string {
  const npcs = preset.npcs.filter(n => n.continent === districtName)
  const actors = npcs.map(n => {
    const role = n.cls || n.title
    const alias = `${role}${n.cr ? ` · Rank ${n.cr}` : ''}`
    const bio = `<p><em>${n.title}</em></p>${n.bio}<p><em>Appearance:</em> ${n.appearance}</p><p><em>Relationships:</em> ${n.relationships}</p>`
    const parsed = n.statText ? parseCyberpunkRedStatBlock(n.statText) : null
    const base: Record<string, any> = parsed
      ? toCyberpunkRedFoundryActor(parsed)
      : { type: 'mook', img: 'icons/svg/mystery-man.svg', effects: [], flags: {}, ownership: { default: 0 }, system: {}, items: [] }
    base.name = n.name
    if (n.img && !/^icons\/svg\/mystery-man/.test(n.img)) base.img = n.img
    base.system = { ...base.system, information: { ...(base.system.information ?? {}), alias, notes: bio } }
    return { ...base, _subfolder: n.subfolder ?? null, _hasStats: !!parsed }
  })

  return `// Step 3 — ${districtName} NPCs (Cyberpunk RED) — safe to re-run: existing actors only get alias, bio and folder refreshed
(async () => {
  const af = name => game.folders.find(f => f.name === name && f.type === 'Actor');
  const folder = af(${JSON.stringify(districtName)});
  if (!folder) { ui.notifications.error(${JSON.stringify(`'${districtName}' folder not found — run Step 1 first.`)}); return; }
  const allActors = ${JSON.stringify(actors, null, 2)};

  ${PACK_LOOKUP_JS}
  ${INSTALL_LINK_JS}
  ${AMMO_LINK_JS}
  let packsReady = false;

  // Swap the parser's stub weapons / armor / cyberware for the real compendium items (see the NPC tool's import macro).
  const upgradeItems = items => {
    const out = [];
    for (const item of items) {
      if (item.type === 'weapon') {
        const doc = find(item.name, 'weapon') || find(item.name, 'cyberware');
        if (doc) { const b = fromDoc(doc); b.system = { ...b.system, damage: item.system.damage }; if (b.system.magazine) b.system.magazine.value = b.system.magazine.max; out.push(b); continue; }
      } else if (item.type === 'armor') {
        const halves = ['Body', 'Head'].map(loc => byKey.get(squash(item.name + ' ' + loc))).filter(Boolean);
        if (halves.length) {
          for (const doc of halves) {
            const b = fromDoc(doc);
            if (/\\(head\\)\\s*$/i.test(doc.name)) b.system.headLocation = { ...b.system.headLocation, sp: item.system.headLocation.sp };
            else b.system.bodyLocation = { ...b.system.bodyLocation, sp: item.system.bodyLocation.sp };
            out.push(b);
          }
          continue;
        }
      } else if (item.type === 'cyberware') {
        const doc = find(item.name, 'cyberware');
        if (doc) { out.push(fromDoc(doc)); continue; }
      }
      out.push(item);
    }
    return out;
  };

  let created = 0, updated = 0, withStats = 0, installed = 0, loaded = 0;
  for (const a of allActors) {
    const { _subfolder, _hasStats, ...actorData } = a;
    const folderId = _subfolder ? (af(_subfolder)?.id ?? folder.id) : folder.id;
    const existing = game.actors.getName(actorData.name);
    if (existing) {
      await existing.update({ 'system.information.alias': actorData.system.information.alias, 'system.information.notes': actorData.system.information.notes, folder: folderId });
      updated++;
      continue;
    }
    if (_hasStats) {
      if (!packsReady) { try { await loadPacks(); } catch (e) { console.warn('Cyberpunk RED compendium lookup failed, using stub items.', e); } packsReady = true; }
      actorData.items = upgradeItems(actorData.items);
      withStats++;
    }
    actorData.folder = folderId;
    const made = await Actor.create(actorData);
    if (made && _hasStats) { installed += await linkInstalledCyberware(made); loaded += await linkAmmo(made); }
    created++;
  }
  ui.notifications.info(\`✅ ${districtName}: \${created} created (\${withStats} with stat blocks), \${updated} updated.\`);
})();`
}
