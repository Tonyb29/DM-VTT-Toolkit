import{c as Z}from"./claude-api-CYPUqmYA.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce=Z("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]),j=String.raw`
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
`,K=String.raw`
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
`,Y=String.raw`
  const linkAmmo = async created => {
    let loaded = 0;
    try {
      const ammo = created.items.filter(i => i.type === 'ammo');
      if (!ammo.length) return 0;
      const updates = [];
      for (const w of created.items.filter(i => i.type === 'weapon')) {
        const slot = w.system.installedItems;
        if (!slot?.allowed || !(slot.allowedTypes || []).includes('ammo')) continue;
        if ((slot.list || []).length) continue;
        const want = w.system.ammoVariety || [];
        const match = ammo.find(a => want.includes(a.system.variety));
        if (!match) continue;
        updates.push({
          _id: w.id,
          'system.installedItems.list': [match.id],
          'system.installedItems.usedSlots': (slot.usedSlots || 0) + 1,
          'system.magazine.ammoData': match.toObject(),
          'system.magazine.value': w.system.magazine?.max ?? 0,
        });
        loaded++;
      }
      if (updates.length) await created.updateEmbeddedDocuments('Item', updates);
    } catch (e) {
      console.warn('Cyberpunk RED ammo loading failed; ammo is on the actor but not loaded into the weapon.', e);
    }
    return loaded;
  };
`,Q="cyberpunk-red-core",X="v0.92.4",ee="12.343",Ie=["int","ref","dex","tech","cool","will","luck","move","body","emp"],G=[{name:"Basic Tech",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:140},{name:"Melee Weapon",stat:"dex",category:"fightingSkills",difficulty:"typical",basic:!1,skillType:"generic",page:137},{name:"Martial Arts (Karate)",stat:"dex",category:"fightingSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:137},{name:"Athletics",stat:"dex",category:"bodySkills",difficulty:"typical",basic:!0,skillType:"generic",page:131},{name:"Trading",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!1,skillType:"generic",page:139},{name:"Electronics/Security Tech",stat:"tech",category:"techniqueSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:141},{name:"Animal Handling",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:133},{name:"Resist Torture/Drugs",stat:"will",category:"bodySkills",difficulty:"typical",basic:!1,skillType:"generic",page:132},{name:"First Aid",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!0,skillType:"generic",page:141},{name:"Paint/Draw/Sculpt",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:141},{name:"Bureaucracy",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:133},{name:"Riding",stat:"ref",category:"controlSkills",difficulty:"typical",basic:!1,skillType:"generic",page:133},{name:"Gamble",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:135},{name:"Evasion",stat:"dex",category:"fightingSkills",difficulty:"typical",basic:!0,skillType:"generic",page:137},{name:"Conversation",stat:"emp",category:"socialSkills",difficulty:"typical",basic:!0,skillType:"generic",page:138},{name:"Local Expert (Your Home)",stat:"int",category:"educationSkills",difficulty:"typical",basic:!0,skillType:"generic",page:135},{name:"Land Vehicle Tech",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:141},{name:"Streetwise",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!1,skillType:"generic",page:139},{name:"Contortionist",stat:"dex",category:"bodySkills",difficulty:"typical",basic:!1,skillType:"generic",page:131},{name:"Human Perception",stat:"emp",category:"socialSkills",difficulty:"typical",basic:!0,skillType:"generic",page:139},{name:"Criminology",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:134},{name:"Composition",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:134},{name:"Cybertech",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:140},{name:"Language (Streetslang)",stat:"int",category:"educationSkills",difficulty:"typical",basic:!0,skillType:"language",page:135},{name:"Photography/Film",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:141},{name:"Accounting",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:133},{name:"Sea Vehicle Tech",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:142},{name:"Wardrobe & Style",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!1,skillType:"generic",page:139},{name:"Cryptography",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:134},{name:"Deduction",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:134},{name:"Pilot Sea Vehicle",stat:"ref",category:"controlSkills",difficulty:"typical",basic:!1,skillType:"generic",page:132},{name:"Heavy Weapons",stat:"ref",category:"rangedweaponSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:137},{name:"Drive Land Vehicle",stat:"ref",category:"controlSkills",difficulty:"typical",basic:!1,skillType:"generic",page:132},{name:"Shoulder Arms",stat:"ref",category:"rangedweaponSkills",difficulty:"typical",basic:!1,skillType:"generic",page:138},{name:"Autofire",stat:"ref",category:"rangedweaponSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:138},{name:"Weaponstech",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:142},{name:"Interrogation",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!1,skillType:"generic",page:139},{name:"Tracking",stat:"int",category:"awarenessSkills",difficulty:"typical",basic:!1,skillType:"generic",page:131},{name:"Library Search",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:135},{name:"Pick Pocket",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:142},{name:"Persuasion",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!0,skillType:"generic",page:139},{name:"Archery",stat:"ref",category:"rangedweaponSkills",difficulty:"typical",basic:!1,skillType:"generic",page:137},{name:"Endurance",stat:"will",category:"bodySkills",difficulty:"typical",basic:!1,skillType:"generic",page:132},{name:"Concentration",stat:"will",category:"awarenessSkills",difficulty:"typical",basic:!0,skillType:"generic",page:131},{name:"Personal Grooming",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!1,skillType:"generic",page:139},{name:"Brawling",stat:"dex",category:"fightingSkills",difficulty:"typical",basic:!0,skillType:"generic",page:136},{name:"Demolitions",stat:"tech",category:"techniqueSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:140},{name:"Business",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:134},{name:"Wilderness Survival",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:136},{name:"Handgun",stat:"ref",category:"rangedweaponSkills",difficulty:"typical",basic:!1,skillType:"generic",page:137},{name:"Education",stat:"int",category:"educationSkills",difficulty:"typical",basic:!0,skillType:"generic",page:135},{name:"Perception",stat:"int",category:"awarenessSkills",difficulty:"typical",basic:!0,skillType:"generic",page:131},{name:"Lip Reading",stat:"int",category:"awarenessSkills",difficulty:"typical",basic:!1,skillType:"generic",page:131},{name:"Bribery",stat:"cool",category:"socialSkills",difficulty:"typical",basic:!1,skillType:"generic",page:138},{name:"Pick Lock",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:142},{name:"Conceal/Reveal Object",stat:"int",category:"awarenessSkills",difficulty:"typical",basic:!1,skillType:"generic",page:131},{name:"Acting",stat:"cool",category:"performanceSkills",difficulty:"typical",basic:!1,skillType:"generic",page:137},{name:"Play Instrument",stat:"tech",category:"performanceSkills",difficulty:"typical",basic:!1,skillType:"generic",page:137},{name:"Air Vehicle Tech",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:140},{name:"Pilot Air Vehicle",stat:"ref",category:"controlSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:132},{name:"Forgery",stat:"tech",category:"techniqueSkills",difficulty:"typical",basic:!1,skillType:"generic",page:141},{name:"Tactics",stat:"int",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic",page:136},{name:"Stealth",stat:"dex",category:"bodySkills",difficulty:"typical",basic:!0,skillType:"generic",page:132},{name:"Paramedic",stat:"tech",category:"techniqueSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:141},{name:"Dance",stat:"dex",category:"bodySkills",difficulty:"typical",basic:!1,skillType:"generic",page:132},{name:"Science (Chemistry)",stat:"int",category:"educationSkills",difficulty:"difficult",basic:!1,skillType:"generic",page:136}],te=[["CULTURAL ORIGIN","culturalOrigin"],["PERSONALITY","personality"],["CLOTHING STYLE","clothingStyle"],["HAIR STYLE","hairStyle"],["AFFECTATIONS","affectations"],["VALUE MOST","valueMost"],["VALUED PERSON","valuedPerson"],["VALUED POSSESSION","valuedPossession"],["FAMILY BACKGROUND","familyBackground"],["CHILDHOOD ENVIRONMENT","childhoodEnvironment"],["FAMILY CRISIS","familyCrisis"],["LIFE GOALS","lifeGoals"],["FRIENDS","friends"],["ENEMIES","enemies"],["TRAGIC LOVE AFFAIRS","tragicLoveAffairs"],["ABOUT PEOPLE","aboutPeople"],["ROLE LIFEPATH","roleLifepath"]];function W(e){let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;return Math.abs(t)}function g(e,t,a){return(W(`pc|${e}|${t}|${a}`).toString(16).padStart(8,"0")+W(`pc|${a}|${t}|${e}~`).toString(16).padStart(8,"0")).slice(0,16)}const h=()=>({compendiumSource:null,duplicateSource:null,coreVersion:ee,systemId:Q,systemVersion:X,createdTime:null,modifiedTime:null,lastModifiedBy:null});function ae(e){return G.map((t,a)=>({_id:g(e.name,t.name,a),name:t.name,img:"icons/svg/item-bag.svg",type:"skill",system:{basic:t.basic,category:t.category,core:!0,description:{value:""},difficulty:t.difficulty,favorite:!1,level:e.skillLevels.get(t.name.toLowerCase())??0,skillType:t.skillType,source:{book:"Core",page:t.page},stat:t.stat},effects:[],folder:null,sort:0,ownership:{default:0},flags:{},_stats:h()}))}function se(e){return{_id:g(e.name,"role",0),name:e.role||"Rockerboy",img:"systems/cyberpunk-red-core/icons/compendium/default/Default_Role.svg",type:"role",system:{abilities:[],addRoleAbilityRank:!0,bonusRatio:1,bonuses:[],description:{value:""},favorite:!1,hasRoll:!1,isSituational:!1,mainRoleAbility:e.roleAbility||"",onByDefault:!1,rank:e.roleRank,skill:"--",source:{book:"Core",page:0},stat:"--",universalBonuses:[]},effects:[],folder:null,sort:0,ownership:{default:0},flags:{},_stats:h()}}function ie(e){if(!e.isRanged)return 0;const t=e.name.toLowerCase();return/smg/.test(t)?/heavy/.test(t)?40:30:/pistol/.test(t)?/heavy/.test(t)?8:12:/sniper/.test(t)?4:/rifle/.test(t)?25:/shotgun/.test(t)?4:/grenade/.test(t)?2:/launcher|heavy/.test(t)?1:10}function ne(e){const t=e.name.toLowerCase();return e.isRanged?/pistol|smg/.test(t)?"Handgun":/shotgun|rifle/.test(t)?"Shoulder Arms":/launcher|grenade|heavy/.test(t)?"Heavy Weapons":/bow/.test(t)?"Archery":"Handgun":"Melee Weapon"}function oe(e){return e.weapons.map((t,a)=>{const s=ie(t);return{_id:g(e.name,t.name,a),name:t.name,img:"icons/svg/sword.svg",type:"weapon",system:{damage:t.damage,rof:1,isRanged:t.isRanged,handsReq:t.handsReq,equipped:"equipped",description:{value:""},favorite:!1,quality:"standard",price:{market:0},source:{book:"Core",page:0},magazine:{value:s,max:s},weaponSkill:ne(t)},effects:[],folder:null,sort:0,ownership:{default:0},flags:{},_stats:h()}})}function re(e){return e.armor.map((t,a)=>({_id:g(e.name,t.name,a),name:t.name,img:"icons/svg/shield.svg",type:"armor",system:{isBodyLocation:!0,isHeadLocation:!0,isShield:!1,bodyLocation:{sp:t.bodySp,ablation:0},headLocation:{sp:t.headSp,ablation:0},equipped:"equipped",description:{value:""},favorite:!1,price:{market:0},source:{book:"Core",page:0}},effects:[],folder:null,sort:0,ownership:{default:0},flags:{},_stats:h()}))}function le(e){return e.cyberware.map((t,a)=>({_id:g(e.name,t,a),name:t,img:"icons/svg/eye.svg",type:"cyberware",system:{equipped:"equipped",description:{value:""},favorite:!1,price:{market:0}},effects:[],folder:null,sort:0,ownership:{default:0},flags:{},_stats:h()}))}function ce(e){return e.gear.map((t,a)=>({_id:g(e.name,t,a),name:t,img:"icons/svg/item-bag.svg",type:"gear",system:{amount:1,equipped:"equipped",description:{value:""},favorite:!1,price:{market:0}},effects:[],folder:null,sort:0,ownership:{default:0},flags:{},_stats:h()}))}function Le(e){const t=[...ae(e),se(e),...oe(e),...re(e),...le(e),...ce(e)],a={};for(const[,n]of te)a[n]=e.lifepath[n]||"";const s=e.armor.reduce((n,r)=>Math.max(n,r.headSp),0),i=e.armor.reduce((n,r)=>Math.max(n,r.bodySp),0);return{_id:g(e.name,"actor",0),name:e.name,type:"character",img:"icons/svg/mystery-man.svg",effects:[],folder:null,flags:e.humanityExplicit?{}:{dmtoolkit:{chromeHumanity:!0}},ownership:{default:0},_stats:h(),system:{externalData:{currentArmorHead:{value:s,max:s},currentArmorBody:{value:i,max:i}},stats:{int:{value:e.stats.int},ref:{value:e.stats.ref},dex:{value:e.stats.dex},tech:{value:e.stats.tech},cool:{value:e.stats.cool},will:{value:e.stats.will},luck:{value:e.stats.luck,max:e.stats.luck},move:{value:e.stats.move},body:{value:e.stats.body},emp:{value:e.stats.emp,max:e.stats.emp}},derivedStats:{hp:{value:e.hp,max:e.hp,transactions:[]},humanity:{value:e.humanity,max:e.humanity,transactions:[]},seriouslyWounded:Math.ceil(e.hp/2),deathSave:{basePenalty:0,penalty:0,value:e.stats.body}},information:{alias:"",description:e.notes,history:"",notes:e.playerNotes||""},reputation:{transactions:[],value:0},roleInfo:{activeRole:e.role,activeNetRole:""},wealth:{transactions:[],value:0},improvementPoints:{transactions:[],value:0},lifepath:a,lifestyle:{extras:{cost:0,description:""},fashion:{desription:""},housing:{cost:0,description:""},lifeStyle:{cost:0,description:""},traumaTeam:{cost:0,description:""}}},items:t}}function xe(e){return`// Cyberpunk RED PC Import Macro — generated by dmtoolkit.org
// Requires: Foundry VTT + "Cyberpunk RED - Core" system
// Macro Type must be set to "Script" (not "Chat") — see the macro's Type dropdown
(async () => {
  const actorData = ${JSON.stringify(e,null,2)};

  // Weapons built by this tool are simplified stubs (name, damage, rof,
  // handsReq) — no dvTable, no correct weaponSkill, no loaded magazine.
  // If the actual weapon exists in the system's core compendium, swap in
  // its real data (keeping our parsed damage, in case it's non-standard).
  // Named cyberweapons usually aren't in core_weapons at all — they live in
  // core_cyberware as isWeapon items with their combat stats already
  // attached, so that's checked second.
  let weaponMatches = 0, weaponCustom = 0, cyberweaponMatches = 0;
  try {
    const normalize = s => s.toLowerCase().replace(/^(poor|excellent)\\s+quality\\s+/, '').trim();
    const findMatch = (list, target) =>
      list.find(w => normalize(w.name) === target) ||
      list.find(w => target.includes(normalize(w.name)) || normalize(w.name).includes(target));

    const weaponsPack = game.packs.get('cyberpunk-red-core.core_weapons');
    const compendiumWeapons = weaponsPack ? await weaponsPack.getDocuments() : [];
    const cyberwarePack = game.packs.get('cyberpunk-red-core.core_cyberware');
    const cyberweapons = cyberwarePack
      ? (await cyberwarePack.getDocuments()).filter(c => c.system?.isWeapon)
      : [];

    for (const item of actorData.items) {
      if (item.type === 'weapon') {
        const target = normalize(item.name);
        let match = findMatch(compendiumWeapons, target) || findMatch(cyberweapons, target);
        if (match) {
          const src = match.toObject();
          item.img = src.img;
          item.system = { ...src.system, damage: item.system.damage, equipped: 'equipped' };
          if (item.system.magazine) item.system.magazine.value = item.system.magazine.max;
          weaponMatches++;
        } else {
          weaponCustom++;
        }
      } else if (item.type === 'cyberware') {
        // Named combat cyberware (Wolvers, Cybersnake, Popup Grenade
        // Launcher...) is a bare cyberware item with no isWeapon/damage/
        // weaponSkill data unless we fill it in from the compendium — left
        // alone, Foundry's sheet defaults its unset weaponSkill to Handgun.
        const target = normalize(item.name);
        const match = findMatch(cyberweapons, target);
        if (match) {
          const src = match.toObject();
          item.img = src.img;
          item.system = { ...src.system, equipped: 'equipped' };
          cyberweaponMatches++;
        }
      }
    }
  } catch (e) {
    console.warn('Cyberpunk RED weapon compendium lookup failed, using simplified weapons.', e);
  }

  // Everything that isn't a weapon is exported as a bare stub (cyberware,
  // gear, armor). Swap each for the real item(s) from the Cyberpunk RED Item
  // compendiums by name, so they get the right type, stats and icon. The
  // pack names don't match ours 1:1, so lookups are by squashed name
  // (letters/digits only) and a few shapes are handled explicitly:
  //  - ammo is "Very Heavy Pistol (Basic)", ours is "Basic VH Pistol Ammunition x30"
  //  - armor is two items, "Light Armorjack (Body)" + "(Head)"
  //  - programs are plain ("Sword"), ours carry a "Program: " prefix
  //  - an outfit is separate pieces ("Generic Chic Top", "Leisurewear Footwear")
  // Packs are discovered, not hard-coded; unmatched names are logged (F12).
  ${j}
  let packMatches = 0, retyped = 0, expanded = 0, roleMatched = false;
  const misses = [];
  try {
    await loadPacks();

    const cat = /\\s+(bottoms?|tops?|footwear|jacket|jewelry|hat|glasses|mirrorshades|contact lenses)$/i;
    const outfitPieces = inner => {
      const docs = [];
      for (const group of inner.split(',')) {
        const parts = group.split('/').map(x => x.trim()).filter(Boolean);
        if (!parts.length) continue;
        const prefix = parts[0].replace(cat, '');
        parts.forEach((part, idx) => {
          const full = idx > 0 && cat.test(' ' + part) ? prefix + ' ' + part : part;
          const doc = [full, full.replace(/tops$/i, 'Top'), full.replace(/s$/i, '')]
            .map(c => find(c, 'clothing')).find(Boolean);
          if (doc) docs.push(doc); else misses.push(full);
        });
      }
      return docs;
    };

    const out = [];
    for (const item of actorData.items) {
      if (item.type === 'role') {
        // Swap our stub for the real Role from the compendium (abilities,
        // description, icon), keeping the rank chosen in the builder.
        const rolesPack = game.packs.get('cyberpunk-red-core.core_roles');
        const roleDoc = rolesPack
          ? (await rolesPack.getDocuments()).find(d => d.type === 'role' && d.name.toLowerCase() === item.name.toLowerCase())
          : find(item.name, 'role');
        if (roleDoc) {
          const real = fromDoc(roleDoc, { rank: item.system.rank });
          delete real.system.equipped;
          if (!real.system.mainRoleAbility) real.system.mainRoleAbility = item.system.mainRoleAbility;
          out.push(real);
          roleMatched = true;
        } else {
          misses.push('Role: ' + item.name);
          out.push(item);
        }
        continue;
      }
      if (!['gear', 'cyberware', 'armor'].includes(item.type)) { out.push(item); continue; }
      const qty = Number((item.name.match(/\\sx\\s*(\\d+)\\s*$/i) || [])[1]) || 1;

      if (item.type === 'armor') {
        const halves = ['Body', 'Head'].map(loc => byKey.get(squash(item.name + ' ' + loc))).filter(Boolean);
        if (halves.length) { halves.forEach(d => out.push(fromDoc(d))); packMatches += halves.length; continue; }
      }
      const outfit = item.type === 'gear' && item.name.match(/outfit\\s*\\((.*)\\)\\s*$/i);
      if (outfit) {
        const pieces = outfitPieces(outfit[1]);
        if (pieces.length) { pieces.forEach(d => out.push(fromDoc(d))); expanded += pieces.length; continue; }
      }
      const doc = find(item.name);
      if (doc) {
        out.push(fromDoc(doc, doc.type === 'ammo' || qty > 1 ? { amount: qty } : {}));
        packMatches++;
        continue;
      }
      misses.push(item.name);
      if (item.type === 'gear') {
        // No pack match — at least file it under the right category.
        if (/ammunition|ammo\\b/i.test(item.name)) {
          item.type = 'ammo'; item.system.amount = qty; retyped++;
        } else if (/\\boutfit\\b|\\bclothing\\b|\\bjacket\\b|\\bfootwear\\b/i.test(item.name)) {
          item.type = 'clothing'; retyped++;
        } else if (/\\bshield\\b/i.test(item.name)) {
          item.type = 'armor';
          item.system = {
            isBodyLocation: false, isHeadLocation: false, isShield: true,
            bodyLocation: { sp: 0, ablation: 0 }, headLocation: { sp: 0, ablation: 0 },
            shieldHitPoints: { value: 10, max: 10 },
            equipped: 'equipped', description: { value: '' }, favorite: false, price: { market: 0 },
            source: { book: 'Core', page: 0 },
          };
          retyped++;
        }
      }
      out.push(item);
    }
    actorData.items = out;
    if (misses.length) console.warn('Cyberpunk RED import: no compendium match for', misses);
  } catch (e) {
    console.warn('Cyberpunk RED item compendium lookup failed, leaving stub items.', e);
  }

  // Humanity from installed chrome (Core Book, cyberware chapter). Foundry
  // never recomputes these stored values, so they have to be right here.
  //  - base = EMP x 10 (the EMP chosen in the builder is the pre-chrome one)
  //  - value = base - sum of each piece's STATIC Humanity Loss (creation uses
  //    the preset number, never the dice)
  //  - max drops by 2 per piece that costs Humanity (4 for borgware); a piece
  //    with 0 Humanity Loss doesn't lower it
  //  - EMP is the tens place of Humanity (and its max follows the max)
  // Skipped when the text gave an explicit HUMANITY, which we trust as-is.
  let humanityNote = '';
  try {
    if (actorData.flags?.dmtoolkit?.chromeHumanity) {
      let hlTotal = 0, maxLoss = 0, pieces = 0;
      for (const it of actorData.items) {
        if (it.type !== 'cyberware') continue;
        const hl = Number(it.system?.humanityLoss?.static) || 0;
        if (hl <= 0) continue;
        hlTotal += hl; pieces++;
        maxLoss += /borg/i.test(String(it.system?.type || '')) ? 4 : 2;
      }
      if (hlTotal > 0) {
        const hum = actorData.system.derivedStats.humanity;
        const base = hum.max;
        hum.value = Math.max(0, base - hlTotal);
        hum.max = Math.max(0, base - maxLoss);
        actorData.system.stats.emp.value = Math.floor(hum.value / 10);
        actorData.system.stats.emp.max = Math.floor(hum.max / 10);
        humanityNote = \`. Humanity \${hum.value}/\${hum.max} after \${hlTotal} loss from \${pieces} piece(s), EMP \${actorData.system.stats.emp.value}\`;
      }
    }
  } catch (e) {
    console.warn('Cyberpunk RED Humanity-from-chrome calculation failed; leaving Humanity at EMP x 10.', e);
  }
  if (actorData.flags) delete actorData.flags.dmtoolkit;

  // Never silently delete an existing actor — someone may have hand-tuned
  // it since the last import. Ask, and default to "no".
  const existing = game.actors.filter(a => a.name === actorData.name);
  if (existing.length) {
    const proceed = await Dialog.confirm({
      title: 'Actor Already Exists',
      content: \`<p>\${existing.length} actor(s) named "\${actorData.name}" already exist.</p>
                 <p>Import as a new copy alongside them? (Cancel to stop and rename/delete manually.)</p>\`,
      yes: () => true, no: () => false, defaultYes: false,
    });
    if (!proceed) { ui.notifications.warn('Import cancelled — no changes made.'); return; }
    actorData.name = \`\${actorData.name} (imported \${new Date().toLocaleDateString()})\`;
  }

  const created = await Actor.create(actorData);

  ${K}
  const installedCount = created ? await linkInstalledCyberware(created) : 0;

  ${Y}
  const loadedCount = created ? await linkAmmo(created) : 0;

  if (created) {
    const weaponCount = actorData.items.filter(i => i.type === 'weapon').length;
    let msg = \`✓ Created: \${created.name} — \${weaponCount} weapons (\${weaponMatches} from compendium, \${weaponCustom} custom-built)\`;
    if (cyberweaponMatches) msg += \`, \${cyberweaponMatches} combat cyberware matched to compendium\`;
    msg += \`. Other items: \${packMatches} from compendium\${expanded ? \`, \${expanded} outfit pieces\` : ''}, \${retyped} re-filed by name\${misses.length ? \`; no match: \${misses.join(', ')}\` : ''}\`;
    msg += roleMatched ? '. Role matched to compendium' : '. Role left as a stub (no compendium match)';
    if (installedCount) msg += \`. \${installedCount} cyberware option(s) installed into foundational pieces\`;
    msg += humanityNote;
    if (loadedCount) msg += \`. \${loadedCount} weapon(s) loaded with ammo\`;
    ui.notifications.info(msg);
    created.sheet.render(true);
  } else {
    ui.notifications.error('Failed to create actor — check system compatibility.');
  }
})();`}const w="cyberpunk-red-core",S="v0.92.4",v="12.343",R=["int","ref","dex","tech","cool","will","luck","move","body","emp"];function F(e){let t=5381;for(let a=0;a<e.length;a++)t=(t<<5)+t+e.charCodeAt(a)|0;return Math.abs(t)}function T(e,t,a){const s=F(`cpr|actor|${e}|${t}|${a}`).toString(16).padStart(8,"0"),i=F(`cpr|item|${a}|${t}|${e}`).toString(16).padStart(8,"0");return(s+i).slice(0,16)}const me=Object.fromEntries(G.map(e=>[e.name.toLowerCase(),e])),de=[[/^Language\s*\(.+\)$/i,{stat:"int",category:"educationSkills",difficulty:"typical",basic:!0,skillType:"language"}],[/^Local Expert\s*\(.+\)$/i,{stat:"int",category:"educationSkills",difficulty:"typical",basic:!0,skillType:"generic"}],[/^Science\s*\(.+\)$/i,{stat:"int",category:"educationSkills",difficulty:"difficult",basic:!1,skillType:"generic"}],[/^Martial Arts\s*\(.+\)$/i,{stat:"dex",category:"fightingSkills",difficulty:"difficult",basic:!1,skillType:"generic"}]];function U(e){const t=me[e.trim().toLowerCase()];if(t)return{def:t,recognized:!0};for(const[a,s]of de)if(a.test(e.trim()))return{def:s,recognized:!0};return{def:{stat:"ref",category:"educationSkills",difficulty:"typical",basic:!1,skillType:"generic"},recognized:!1}}function p(e,t){const a=new RegExp(`^${t}\\s*:\\s*(.*)$`,"i");for(const s of e){const i=s.match(a);if(i)return i[1].trim()}return""}function E(e){return e?e.split(",").map(t=>t.trim()).filter(Boolean):[]}function A(e){if(!e)return[];const t=[];let a=0,s="";for(const i of e)i==="("&&a++,i===")"&&(a=Math.max(0,a-1)),i===","&&a===0?(t.push(s.trim()),s=""):s+=i;return s.trim()&&t.push(s.trim()),t}function ue(e,t){return A(e).map(a=>{const s=a.match(/^(.+?)\s*\(\s*Head\s*(\d+)\s*,\s*Body\s*(\d+)\s*\)\s*$/i);if(s)return{name:s[1].trim(),headSp:parseInt(s[2],10),bodySp:parseInt(s[3],10)};const i=a.match(/^(.+?)\s*\(\s*(\d+)\s*SP\s*\)\s*$/i);return i?{name:i[1].trim(),headSp:parseInt(i[2],10),bodySp:parseInt(i[2],10)}:{name:a.trim(),headSp:t,bodySp:t}}).filter(a=>a.name)}function pe(e){const t={};for(const s of R)t[s]=5;if(!e)return t;const a=e.split(",");for(const s of a){const i=s.trim().match(/^([A-Za-z]+)\s+(-?\d+)$/);if(!i)continue;const n=i[1].toLowerCase();R.includes(n)&&(t[n]=parseInt(i[2],10))}return t}function fe(e){return E(e).map(t=>{const a=t.match(/^(.+?)\s*\+?\s*(\d+)$/),s=(a?a[1]:t).trim(),i=a?parseInt(a[2],10):0,{def:n,recognized:r}=U(s);return{name:s,level:i,stat:n.stat,category:n.category,difficulty:n.difficulty,skillType:n.skillType,recognized:r}})}function ye(e){return E(e).map(t=>{const a=t.match(/^(.+?)\s*\(([^)]*)\)\s*$/)||t.match(/^(.+?)\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*$/i),s=(a?a[1]:t).trim(),i=a?a[2].trim():"1d6",n=/\d\s*m|pistol|rifle|shotgun|smg|heavy|bow|launcher|flame/i.test(s);return{name:s,damage:i||"1d6",rof:1,isRanged:n,handsReq:/heavy|rifle|shotgun/i.test(s)?2:1}})}function V(e){const t=e.split(`
`).map($=>$.trim()).filter(Boolean);if(!t.length)return null;let a=p(t,"NAME");a||(a=t[0].replace(/^#+\s*/,"").trim());const s=p(t,"ROLE"),i=pe(p(t,"STATS")),n=parseInt(p(t,"HP"),10)||30,r=parseInt(p(t,"SP"),10)||0,u=fe(p(t,"SKILLS")),k=ye(p(t,"WEAPONS")),M=ue(p(t,"ARMOR"),r),C=A(p(t,"CYBERWARE")),I=p(t,"NOTES");return{name:a||"Unknown NPC",role:s,stats:i,hp:n,sp:r,skills:u,weapons:k,armor:M,cyberware:C,notes:I}}function x(e,t,a){const i=new RegExp(`\\b(?:${a})\\b\\s*:?\\s*(-?\\d+|\\u2014|-)`,"i").exec(e.slice(t));if(!i)return{value:null,end:t};const n=i[1];return{value:/^-?\d+$/.test(n)?parseInt(n,10):0,end:t+i.index+i[0].length}}function D(e,t,a){const s=new RegExp(`^(?:${a})\\b`,"i");for(let i=t;i<e.length;i++)if(s.test(e[i]))return i;return null}function ge(e){const t=e.replace(/ /g," ").replace(/[​‌‍﻿]/g,""),a=["INT","REF","DEX","TECH","COOL","WILL","LUCK","MOVE","BODY","EMP"],s=/\bINT\b/i.exec(t);if(!s)return null;const i=t.slice(0,s.index).split(`
`).map(c=>c.trim()).filter(Boolean),n=i.length?i[i.length-1]:"Unknown NPC",r={};for(const c of R)r[c]=0;let u=s.index;for(const c of a){const{value:d,end:m}=x(t,u,c);d!==null&&(r[c.toLowerCase()]=d,u=m)}const k=x(t,u,"Hit\\s+Points"),M=k.value??30;k.value!==null&&(u=k.end);const C=x(t,u,"Seriously\\s+Wounded");C.value!==null&&(u=C.end);const I=x(t,u,"Death\\s+Save");I.value!==null&&(u=I.end);const l=t.slice(u).split(`
`).map(c=>c.trim()).filter(Boolean);let o=0;const P=[],q=D(l,o,"Weapons");if(q!==null){o=q+1;const c=[];for(;o<l.length&&!/^armor\s*:/i.test(l[o]);)c.push(l[o]),o++;for(let d=0;d+1<c.length;d+=2){const m=c[d],y=c[d+1],b=/pistol|rifle|shotgun|smg|launcher|bow|flamethrower/i.test(m);P.push({name:m,damage:y,rof:1,isRanged:b,handsReq:/heavy|rifle|shotgun|flamethrower/i.test(m)?2:1})}}const _=[];let N=0;if(o<l.length&&/^armor\s*:/i.test(l[o])){const c=l[o].match(/^armor\s*:\s*(.+)$/i),d=c?c[1].trim():"Armor",m=l.slice(o).join(" ");o++;const y=m.match(/\bHead\b\s*:?\s*(\d+)\s*SP/i),b=m.match(/\bBody\b\s*:?\s*(\d+)\s*SP/i),f=y?parseInt(y[1],10):0,L=b?parseInt(b[1],10):0;for(_.push({name:d,headSp:f,bodySp:L}),N=L||f;o<l.length&&(/^head\b/i.test(l[o])||/^body\b/i.test(l[o])||/^\d+\s*SP$/i.test(l[o]));)o++}let B=[];const H=D(l,o,"Skill\\s+Bases");if(H!==null){o=H+1;const c=[];for(;o<l.length&&!/^cyberware/i.test(l[o]);)c.push(l[o]),o++;B=E(c.join(" ")).map(d=>{const m=d.match(/^(.+?)\s+(\d+)$/),y=(m?m[1]:d).trim(),b=m?parseInt(m[2],10):0,{def:f,recognized:L}=U(y),J=Math.max(0,b-r[f.stat]);return{name:y,level:J,stat:f.stat,category:f.category,difficulty:f.difficulty,skillType:f.skillType,recognized:L}})}let z=[];const O=D(l,o,"Cyberware(?:\\s+Special\\s+Equipment)?");if(O!==null){o=O+1;const c=[];for(;o<l.length&&!(o+1<l.length&&l[o+1].toUpperCase()==="INT")&&!/\bINT\b/i.test(l[o]);)c.push(l[o]),o++;z=A(c.join(" "))}return{name:n||"Unknown NPC",role:"",stats:r,hp:M,sp:N,skills:B,weapons:P,armor:_,cyberware:z,notes:""}}function Re(e){if(!(e!=null&&e.trim()))return null;if(/^\s*(NAME|STATS)\s*:/im.test(e))return V(e);const t=ge(e);return t||V(e)}function he(e,t,a){return{_id:T(t,e.name,a),name:e.name,type:"skill",img:"icons/svg/book.svg",effects:[],folder:null,flags:{},ownership:{default:0},_stats:{systemId:w,systemVersion:S,coreVersion:v,createdTime:null,modifiedTime:null,lastModifiedBy:null},system:{level:e.level,stat:e.stat,category:e.category,difficulty:e.difficulty,skillType:e.skillType,core:!1,basic:!1}}}function be(e){if(!e.isRanged)return 0;const t=e.name.toLowerCase();return/smg/.test(t)?/heavy/.test(t)?40:30:/pistol/.test(t)?/heavy/.test(t)?8:12:/sniper/.test(t)?4:/rifle/.test(t)?25:/shotgun/.test(t)?4:/grenade/.test(t)?2:/launcher|heavy/.test(t)?1:10}function ke(e){const t=e.name.toLowerCase();return e.isRanged?/flame/.test(t)?"Heavy Weapons":/pistol|smg/.test(t)?"Handgun":/shotgun|rifle/.test(t)?"Shoulder Arms":/launcher|grenade|heavy/.test(t)?"Heavy Weapons":/bow/.test(t)?"Archery":"Handgun":/brawling/.test(t)?"Brawling":"Melee Weapon"}function we(e,t,a){const s=be(e);return{_id:T(t,e.name,a),name:e.name,type:"weapon",img:"icons/svg/sword.svg",effects:[],folder:null,flags:{},ownership:{default:0},_stats:{systemId:w,systemVersion:S,coreVersion:v,createdTime:null,modifiedTime:null,lastModifiedBy:null},system:{damage:e.damage,rof:e.rof,isRanged:e.isRanged,handsReq:e.handsReq,equipped:"equipped",magazine:{value:s,max:s},weaponSkill:ke(e)}}}function Se(e,t,a){return{_id:T(t,e.name,a),name:e.name,type:"armor",img:"icons/svg/shield.svg",effects:[],folder:null,flags:{},ownership:{default:0},_stats:{systemId:w,systemVersion:S,coreVersion:v,createdTime:null,modifiedTime:null,lastModifiedBy:null},system:{isBodyLocation:!0,isHeadLocation:!0,isShield:!1,bodyLocation:{sp:e.bodySp,ablation:0},headLocation:{sp:e.headSp,ablation:0},equipped:"equipped"}}}function ve(e,t,a){return{_id:T(t,e,a),name:e,type:"cyberware",img:"icons/svg/eye.svg",effects:[],folder:null,flags:{},ownership:{default:0},_stats:{systemId:w,systemVersion:S,coreVersion:v,createdTime:null,modifiedTime:null,lastModifiedBy:null},system:{equipped:"equipped"}}}function Me(e){const t=T(e.name,"actor",0),a=[...e.skills.map((n,r)=>he(n,e.name,r)),...e.weapons.map((n,r)=>we(n,e.name,r)),...e.armor.map((n,r)=>Se(n,e.name,r)),...e.cyberware.map((n,r)=>ve(n,e.name,r))],s=e.armor.reduce((n,r)=>Math.max(n,r.headSp),0),i=e.armor.reduce((n,r)=>Math.max(n,r.bodySp),0);return{_id:t,name:e.name,type:"mook",img:"icons/svg/mystery-man.svg",effects:[],folder:null,flags:{},ownership:{default:0},_stats:{systemId:w,systemVersion:S,coreVersion:v,createdTime:null,modifiedTime:null,lastModifiedBy:null},system:{stats:Object.fromEntries(R.map(n=>[n,{value:e.stats[n]}])),derivedStats:{hp:{value:e.hp,max:e.hp},seriouslyWounded:Math.ceil(e.hp/2),humanity:{value:e.stats.emp*10,max:e.stats.emp*10}},externalData:{currentArmorHead:{value:s,max:s},currentArmorBody:{value:i,max:i}},information:{alias:e.role,notes:e.notes}},items:a}}function De(e,t){const a=JSON.stringify(e,null,2),s=JSON.stringify(t.skills.filter(i=>!i.recognized).map(i=>i.name));return`// Cyberpunk RED Import Macro — generated by dmtoolkit.org
// Requires: Foundry VTT + "Cyberpunk RED - Core" system
// Macro Type must be set to "Script" (not "Chat") — see the macro's Type dropdown
(async () => {
  const actorData = ${a};
  const unrecognizedSkills = ${s};

  // Reuse an existing "Mooks"-ish folder rather than scattering NPCs across
  // near-duplicate folders (e.g. "Mooks & ICE" already exists in the world).
  let folder = game.folders.find(f => f.type === 'Actor' && /mook/i.test(f.name));
  if (!folder) folder = await Folder.create({ name: 'Mooks', type: 'Actor', color: '#ff2060' });
  actorData.folder = folder.id;

  // Weapons built by this tool are simplified stubs (name, damage, rof,
  // handsReq) — no dvTable, no correct weaponSkill, no loaded magazine.
  // If the actual weapon exists in the system's core compendium, swap in
  // its real data (keeping our parsed damage, in case Poor/Excellent
  // Quality changed it from the stock value). Named cyberweapons (claws,
  // snakes, popup launchers) usually aren't in core_weapons at all — they
  // live in core_cyberware as isWeapon items with their combat stats
  // already attached, so that's checked second.
  let weaponMatches = 0, weaponCustom = 0, cyberweaponMatches = 0;
  const matchedCyber = new Set();
  try {
    const normalize = s => s.toLowerCase().replace(/^(poor|excellent)\\s+quality\\s+/, '').trim();
    const findMatch = (list, target) =>
      list.find(w => normalize(w.name) === target) ||
      list.find(w => target.includes(normalize(w.name)) || normalize(w.name).includes(target));

    const weaponsPack = game.packs.get('cyberpunk-red-core.core_weapons');
    const compendiumWeapons = weaponsPack ? await weaponsPack.getDocuments() : [];
    const cyberwarePack = game.packs.get('cyberpunk-red-core.core_cyberware');
    const cyberweapons = cyberwarePack
      ? (await cyberwarePack.getDocuments()).filter(c => c.system?.isWeapon)
      : [];

    for (const item of actorData.items) {
      if (item.type === 'weapon') {
        const target = normalize(item.name);
        let match = findMatch(compendiumWeapons, target) || findMatch(cyberweapons, target);
        if (match) {
          const src = match.toObject();
          item.img = src.img;
          item.system = { ...src.system, damage: item.system.damage, equipped: 'equipped' };
          if (item.system.magazine) item.system.magazine.value = item.system.magazine.max;
          weaponMatches++;
        } else {
          weaponCustom++;
        }
      } else if (item.type === 'cyberware') {
        // Named combat cyberware (Wolvers, Cybersnake, Popup Grenade
        // Launcher...) is parsed off the CYBERWARE line, not WEAPONS, so it
        // never goes through the weapon branch above and is created as a
        // bare cyberware item with no isWeapon/damage/weaponSkill data —
        // which is exactly what makes Foundry's sheet default its (unset)
        // weaponSkill to Handgun, even for something like Wolvers claws.
        const target = normalize(item.name);
        const match = findMatch(cyberweapons, target);
        if (match) {
          const src = match.toObject();
          item.img = src.img;
          item.system = { ...src.system, equipped: 'equipped' };
          cyberweaponMatches++;
          matchedCyber.add(item);
        }
      }
    }
  } catch (e) {
    console.warn('Cyberpunk RED weapon compendium lookup failed, using simplified weapons.', e);
  }

  // Armor and the rest of the cyberware: swap the tool's bare stubs for the
  // real compendium items (right type, stats, icon). The system stores armor
  // as two items, "Light Armorjack (Body)" and "(Head)", so a matched armor
  // entry becomes that pair — with the SP this stat block actually states,
  // in case it differs from the stock value. Combat cyberware was handled
  // above; anything unmatched stays as the stub.
  ${j}
  let armorMatches = 0, cyberMatches = 0;
  const unmatched = [];
  try {
    await loadPacks();
    const out = [];
    for (const item of actorData.items) {
      if (item.type === 'armor') {
        const halves = ['Body', 'Head'].map(loc => byKey.get(squash(item.name + ' ' + loc))).filter(Boolean);
        if (halves.length) {
          for (const doc of halves) {
            const built = fromDoc(doc);
            if (/\\(head\\)\\s*$/i.test(doc.name)) built.system.headLocation = { ...built.system.headLocation, sp: item.system.headLocation.sp };
            else built.system.bodyLocation = { ...built.system.bodyLocation, sp: item.system.bodyLocation.sp };
            out.push(built);
          }
          armorMatches += halves.length;
          continue;
        }
        unmatched.push(item.name);
      } else if (item.type === 'cyberware' && !matchedCyber.has(item)) {
        const doc = find(item.name, 'cyberware');
        if (doc) { out.push(fromDoc(doc)); cyberMatches++; continue; }
        unmatched.push(item.name);
      }
      out.push(item);
    }
    actorData.items = out;
    if (unmatched.length) console.warn('Cyberpunk RED import: no compendium match for', unmatched);
  } catch (e) {
    console.warn('Cyberpunk RED armor/cyberware compendium lookup failed, using simplified items.', e);
  }

  // Never silently delete an existing actor — someone may have hand-tuned
  // it since the last import. Ask, and default to "no".
  const existing = game.actors.filter(a => a.name === actorData.name);
  if (existing.length) {
    const proceed = await Dialog.confirm({
      title: 'Actor Already Exists',
      content: \`<p>\${existing.length} actor(s) named "\${actorData.name}" already exist.</p>
                 <p>Import as a new copy alongside them? (Cancel to stop and rename/delete manually.)</p>\`,
      yes: () => true, no: () => false, defaultYes: false,
    });
    if (!proceed) { ui.notifications.warn('Import cancelled — no changes made.'); return; }
    actorData.name = \`\${actorData.name} (imported \${new Date().toLocaleDateString()})\`;
  }

  const created = await Actor.create(actorData);
  ${K}
  const installedCount = created ? await linkInstalledCyberware(created) : 0;

  ${Y}
  const loadedCount = created ? await linkAmmo(created) : 0;
  if (created) {
    const skillCount = actorData.items.filter(i => i.type === 'skill').length;
    const weaponCount = actorData.items.filter(i => i.type === 'weapon').length;
    let msg = \`✓ Created: \${created.name} — \${skillCount} skills, \${weaponCount} weapons (\${weaponMatches} from compendium, \${weaponCustom} custom-built)\`;
    if (cyberweaponMatches) msg += \`, \${cyberweaponMatches} combat cyberware matched to compendium\`;
    if (armorMatches) msg += \`, \${armorMatches} armor piece(s) from compendium\`;
    if (cyberMatches) msg += \`, \${cyberMatches} cyberware from compendium\`;
    if (installedCount) msg += \`, \${installedCount} cyberware option(s) installed\`;
    if (unmatched.length) msg += \`; no compendium match: \${unmatched.join(', ')}\`;
    if (unrecognizedSkills.length) msg += \`. \${unrecognizedSkills.length} skill name(s) not recognized — defaulted to REF.\`;
    if (loadedCount) msg += \`. \${loadedCount} weapon(s) loaded with ammo\`;
    ui.notifications.info(msg);
    created.sheet.render(true);
    if (unrecognizedSkills.length) console.warn('Cyberpunk RED import — unrecognized skills (defaulted to REF, check governing stat manually):', unrecognizedSkills);
  } else {
    ui.notifications.error('Failed to create actor — check system compatibility.');
  }
})();`}export{Y as A,Ce as C,K as I,te as L,j as P,G as S,Ie as a,Le as b,xe as c,De as d,R as e,Re as p,Me as t};
