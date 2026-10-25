// Vehicles from R. Talsorian's "The 12 Days of Vehiclemas" (DLC v1.0, Dec 2025), entered by hand from
// the PDF's text. Spot-check against the book before running a table on them.
//
// Speeds: `combat` is MOVE per turn; `narrative` is miles per hour. SP is the vehicle's armor SP.
// `baseType` and `upgrades` are the book's own wording, so they can be matched by name to the system's
// compendium once we know how it stores vehicles.

export type VehicleCategory = 'Land' | 'Air' | 'Sea'

export interface CyberVehicle {
  name: string
  page: number                 // page in the PDF
  maker: string
  category: VehicleCategory
  baseType: string             // e.g. "Compact Groundcar"
  cost: number                 // eb
  priceCategory: string
  nomadAccess: number | null   // Moto rank, null if N/A
  sdp: number
  seats: number
  sp: number
  combatSpeed: number          // MOVE
  narrativeMph: number
  upgrades: string[]
  equipment: string[]          // onboard items that come with it
  incompatible: string[]       // upgrades it can't take
  notes: string
  // A second movement mode (VMW Aerojeep flying, Moray surface vs submerged)
  alt?: { label: string; combatSpeed: number; narrativeMph: number }
}

export const CYBER_VEHICLES: CyberVehicle[] = [
  {
    name: 'AmeriCar Armadillo', page: 3, maker: 'AmeriCar', category: 'Land', baseType: 'Compact Groundcar',
    cost: 41000, priceCategory: 'Super Luxury', nomadAccess: 6, sdp: 70, seats: 6, sp: 13, combatSpeed: 20, narrativeMph: 100,
    upgrades: ['Armored Chassis', 'Bulletproof Glass x2', 'Heavy Chassis', 'Housing Upgrade', 'Reinforced Tires', 'Seating Upgrade'],
    equipment: [], incompatible: [],
    notes: 'The safest, strongest RV ever produced; the vehicle of choice for nomads on the road and corporate campers.',
  },
  {
    name: 'New American Motors Ambunaught m2', page: 4, maker: 'New American Motors', category: 'Land', baseType: 'Compact Groundcar',
    cost: 56000, priceCategory: 'Super Luxury', nomadAccess: 7, sdp: 70, seats: 2, sp: 13, combatSpeed: 20, narrativeMph: 100,
    upgrades: ['Armored Chassis', 'Bulletproof Glass', 'Heavy Chassis', 'Hover Upgrade', 'Reinforced Tires', 'Sealed Environment'],
    equipment: ['Cryopumps x2', 'Medscanner', 'Medtech Bag', 'Tech Bag', 'Techscanner'], incompatible: [],
    notes: 'REO Meatwagon ambulance. Two seats for working paramedics; the medical bay holds beds for up to four patients.',
  },
  {
    name: 'TetraCorp America Luxus 15', page: 5, maker: 'TetraCorp America', category: 'Land', baseType: 'Compact Groundcar',
    cost: 45000, priceCategory: 'Super Luxury', nomadAccess: 6, sdp: 50, seats: 8, sp: 13, combatSpeed: 20, narrativeMph: 100,
    upgrades: ['Armored Chassis', 'Bulletproof Glass x2', 'Sealed Environment', 'Security Upgrade (no cloaking feature)'],
    equipment: ['Hammered Industries Drink Master 3000'], incompatible: [],
    notes: 'Corporate stretch limo with an armored, sealed cab.',
  },
  {
    name: 'Zonda R400 Trail', page: 6, maker: 'Zonda', category: 'Land', baseType: 'Roadbike',
    cost: 850, priceCategory: 'Expensive', nomadAccess: 1, sdp: 16, seats: 1, sp: 0, combatSpeed: 10, narrativeMph: 30,
    upgrades: [], equipment: [], incompatible: ['Seating Upgrade'],
    notes: 'Entry-level motorcycle. With the AV Engine Upgrade it can fly but its movement rates stay the same. Its Combat and Narrative Speed cannot be Tech Upgraded.',
  },
  {
    name: 'Dayton M405 AdZep', page: 7, maker: 'Dayton Aeronautics', category: 'Air', baseType: 'Aerozep',
    cost: 26000, priceCategory: 'Super Luxury', nomadAccess: 5, sdp: 35, seats: 2, sp: 0, combatSpeed: 15, narrativeMph: 60,
    upgrades: ['Communications Center'], equipment: [], incompatible: [],
    notes: 'A flying billboard with only one room.',
  },
  {
    name: 'Dayton Sky Queen', page: 8, maker: 'Dayton Aeronautics', category: 'Air', baseType: 'Aerozep',
    cost: 4961000, priceCategory: 'Super Luxury', nomadAccess: null, sdp: 500, seats: 216, sp: 13, combatSpeed: 20, narrativeMph: 100,
    upgrades: ['Aerozep Selfsealing Gasbag', 'Armored Chassis', 'Bulletproof Glass x2', 'Communications Center', 'Hangar x2', 'Heavy Chassis',
      'Onboard Rocket Pod x4', 'Sealed Environment', 'Titanic Hull', 'Vehicle Heavy Weapon Mount x2 (w/ Rhinemetall EMG-86 Railgun x2)'],
    equipment: ['Hangar 1: TetraCorp America Luxus 15 with AV-4 Engine Upgrade',
      'Hangar 2: Helicopter with Armored Chassis, Bulletproof Glass x2, Heavy Chassis, NOS, Onboard Machine Gun, Onboard Rocket Pod, Vehicle Heavy Weapon Mount (w/ Rhinemetall EMG-86 Railgun)'],
    incompatible: [],
    notes: '50 rooms, 26 luxury rooms and 14 complex rooms. Typical loadout: 50 standard passenger rooms, 25 luxury passenger rooms, captain\'s quarters, 3 bars, 2 restaurants, conference center, nightclub, gym, recreation deck, pool deck, bridge, cargo bay and 3 crew bunk rooms. Can serve as a faction Headquarters (No Place Like Home DLC) without changing its price.',
  },
  {
    name: 'Militech F-152 Autocopter', page: 10, maker: 'Militech', category: 'Air', baseType: 'Helicopter',
    cost: 31000, priceCategory: 'Super Luxury', nomadAccess: 4, sdp: 35, seats: 1, sp: 0, combatSpeed: 40, narrativeMph: 200,
    upgrades: ['Onboard Machine Gun'], equipment: [], incompatible: ['Bulletproof Glass', 'Seating Upgrade', 'Sealed Environment', 'Security Upgrade'],
    notes: 'Small aerial combat vehicle with an open cockpit, used by police forces and mercenaries.',
  },
  {
    name: 'VMW Aerojeep', page: 11, maker: 'VMW', category: 'Land', baseType: 'Compact Groundcar',
    cost: 44000, priceCategory: 'Super Luxury', nomadAccess: 6, sdp: 70, seats: 6, sp: 0, combatSpeed: 20, narrativeMph: 100,
    upgrades: ['AV-4 Engine Upgrade', 'Heavy Chassis', 'Seating Upgrade', 'Vehicle Heavy Weapon Mount (empty at purchase)'],
    equipment: [], incompatible: ['Bulletproof Glass', 'Sealed Environment', 'Security Upgrade'],
    alt: { label: 'Air', combatSpeed: 40, narrativeMph: 200 },
    notes: 'Open-cockpit military workhorse. Moves at the ground speed on land and the air speed when flying.',
  },
  {
    name: 'Hydrosubsidium Bimac', page: 12, maker: 'Hydrosubsidium Inc.', category: 'Sea', baseType: 'Jetski',
    cost: 32000, priceCategory: 'Super Luxury', nomadAccess: 4, sdp: 35, seats: 2, sp: 0, combatSpeed: 20, narrativeMph: 60,
    upgrades: ['Enhanced Interface Plug Integration', 'NOS', 'Onboard Machine Gun', 'Security Upgrade'], equipment: [], incompatible: [],
    notes: 'Tandem-seat magnetic-propulsion hydro-ski built for covert operations; the security system hides it after the crew disembarks.',
  },
  {
    name: 'Highland Defense Ullapool Raider', page: 13, maker: 'Highland Defense Co.', category: 'Sea', baseType: 'Speedboat',
    cost: 32000, priceCategory: 'Super Luxury', nomadAccess: 6, sdp: 35, seats: 5, sp: 13, combatSpeed: 20, narrativeMph: 60,
    upgrades: ['Armored Chassis', 'Onboard Rocket Pod'], equipment: [], incompatible: ['Sealed Environment', 'Bulletproof Glass', 'Heavy Chassis', 'Submersible Upgrade'],
    notes: 'Light, fast boat for close-shore and river operations.',
  },
  {
    name: 'Thelas Tríaina Patrol Boat', page: 14, maker: 'Thelas Nation', category: 'Sea', baseType: 'Speedboat',
    cost: 42000, priceCategory: 'Super Luxury', nomadAccess: 6, sdp: 50, seats: 6, sp: 13, combatSpeed: 20, narrativeMph: 60,
    upgrades: ['Armored Chassis', 'Bulletproof Glass', 'Combat Plow', 'Onboard Machine Gun x2', 'Reinforced Hull', 'Sealed Environment', 'Seating Upgrade'],
    equipment: [], incompatible: ['Submersible Upgrade'],
    notes: 'Thelas Marines harbor patrol boat. Stays afloat even when punctured. Mine-clearing boats usually add a torpedo launcher (Onboard Rocket Pod).',
  },
  {
    name: 'Zetatech Moray', page: 15, maker: 'Zetatech', category: 'Sea', baseType: 'Speedboat',
    cost: 42000, priceCategory: 'Super Luxury', nomadAccess: 6, sdp: 70, seats: 4, sp: 0, combatSpeed: 20, narrativeMph: 60,
    upgrades: ['Heavy Chassis', 'NOS', 'Onboard Rocket Pod (torpedo pod)', 'Submersible Upgrade'], equipment: [], incompatible: [],
    alt: { label: 'Submerged', combatSpeed: 20, narrativeMph: 60 },
    notes: 'Fighter sub. Cannot dive more than 300 m/yds below the surface.',
  },
]

export interface VehicleUpgrade { name: string; motoRank: number; availability: string; effect: string }

export const NEW_VEHICLE_UPGRADES: VehicleUpgrade[] = [
  { name: 'Aerozep Selfsealing Gasbag', motoRank: 7, availability: 'Aerozep', effect: "Reinforces the vehicle's weak points so they cannot be targeted by an Aimed Shot." },
  { name: 'Hangar', motoRank: 7, availability: 'Aerozep, Yacht', effect: 'A safe parking space for one non-yacht, non-aerozep vehicle (hangar, landing pad or davit frame). Passengers with access can enter or exit a parked vehicle without taking an Action. Multiple upgrades can be installed.' },
  { name: 'Reinforced Hull/Tires', motoRank: 1, availability: 'All Land and Sea Vehicles', effect: "Reinforces the vehicle's weak points so they cannot be targeted by an Aimed Shot." },
  { name: 'Sealed Environment', motoRank: 1, availability: 'All Vehicles', effect: 'Anyone inside is protected from toxic gases, fumes and aerosolized attacks from outside. If any window is destroyed the benefit is lost until repaired.' },
  { name: 'Submersible Upgrade', motoRank: 5, availability: 'All Land and Sea Vehicles except Bikes and Jetskis', effect: 'Waterproofs the vehicle and adds a submersible engine so it can travel underwater at Speedboat speed. Piloted with Pilot Sea Vehicle while submerged.' },
  { name: 'Titanic Hull', motoRank: 7, availability: 'Aerozep, Yacht', effect: 'Adds SDP that scales with room count: 1-4 rooms +100, 5-8 rooms +180, 9-12 rooms +250, 13+ rooms +380.' },
]

// "Moto Rank Required" in the book is the Nomad Moto Role Ability rank.
export const NEW_VEHICLE_ROOMS = [
  { name: 'Luxury Vehicle Room', cost: 'Double the base room cost when bought during construction', effect: 'Aesthetics only: a room suitable for a king, CEO or diplomat. The Housing Capacity Nomad Upgrade at Moto Rank 5+ can upgrade an existing room to Luxury.' },
  { name: 'Complex Vehicle Room', cost: 'Triple the base or luxury room cost during construction', effect: 'A large multipurpose room. Adds three times the usual seats for the vehicle (6 for Aerozeps and Cabin Cruisers, 12 for Yachts). Housing Capacity at Moto Rank 7+ can upgrade an existing room to Complex.' },
]

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function vehicleDescription(v: CyberVehicle): string {
  const list = (items: string[]) => items.length ? `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
  return [
    `<p>${esc(v.notes)}</p>`,
    `<p><strong>Maker:</strong> ${esc(v.maker)} &middot; <strong>Type:</strong> ${esc(v.baseType)} &middot; <strong>Price:</strong> ${v.cost.toLocaleString('en-US')}eb (${esc(v.priceCategory)})` +
      (v.nomadAccess !== null ? ` &middot; <strong>Nomad Access:</strong> Moto Rank ${v.nomadAccess}` : '') + '</p>',
    `<p><strong>Armor SP:</strong> ${v.sp}${v.alt ? ` &middot; <strong>${esc(v.alt.label)} speed:</strong> ${v.alt.combatSpeed} MOVE, ${v.alt.narrativeMph} MPH / ${Math.round(v.alt.narrativeMph * 1.609)} KPH` : ''}</p>`,
    v.upgrades.length ? `<p><strong>Comes with:</strong></p>${list(v.upgrades)}` : '',
    v.equipment.length ? `<p><strong>Onboard equipment:</strong></p>${list(v.equipment)}` : '',
    v.incompatible.length ? `<p><strong>Incompatible with:</strong> ${esc(v.incompatible.join(', '))}</p>` : '',
  ].join('')
}

// Foundry macro that creates the vehicles as Items plus a Mook actor for each in a "Vehiclemas Vehicles" folder. The vehicle Item
// shape (sdp, seats, speedCombat, speedNarrative, price.market, installedItems) comes from the
// system's own Gyrocopter export. Where the compendium has the vehicle's base type it is used as the
// template (icon, upgrade slots); otherwise a Gyrocopter-shaped default is used. Upgrades found in the
// compendium are installed; the rest stay in the description. Safe to re-run: existing vehicles of the same name are updated.
export function buildVehicleImportMacro(vehicles: CyberVehicle[] = CYBER_VEHICLES): string {
  const data = vehicles.map(v => ({
    name: v.name, baseType: v.baseType, category: v.category, sdp: v.sdp, seats: v.seats, speedCombat: v.combatSpeed,
    speedNarrative: `${v.narrativeMph} MPH / ${Math.round(v.narrativeMph * 1.609)} KPH`, cost: v.cost, page: v.page, sp: v.sp,
    upgrades: v.upgrades, description: vehicleDescription(v),
  }))
  return `// Cyberpunk RED — The 12 Days of Vehiclemas vehicles (generated by dmtoolkit.org)
// Requires the "Cyberpunk RED - Core" system. Macro type must be Script. Safe to re-run.
(async () => {
  const vehicles = ${JSON.stringify(data, null, 2)};
  const FOLDER = 'Vehiclemas Vehicles';
  const squash = n => n.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Compendium lookups: a base-type template for each vehicle, and which upgrade names exist.
  const packs = game.packs.filter(p => p.documentName === 'Item' && p.collection.startsWith('cyberpunk-red-core.'));
  const templates = new Map(), upgradeDocs = new Map();
  for (const pk of packs) {
    for (const d of await pk.getDocuments()) {
      if (d.type === 'vehicle' && !templates.has(squash(d.name))) templates.set(squash(d.name), d);
      if (d.type === 'itemUpgrade' && !upgradeDocs.has(squash(d.name))) upgradeDocs.set(squash(d.name), d);
    }
  }

  const folder = game.folders.find(f => f.name === FOLDER && f.type === 'Item')
    ?? await Folder.create({ name: FOLDER, type: 'Item' });

  const actorFolder = game.folders.find(f => f.name === FOLDER && f.type === 'Actor')
    ?? await Folder.create({ name: FOLDER, type: 'Actor' });

  const fallbackImg = 'systems/cyberpunk-red-core/icons/compendium/vehicles/helicopter.svg';
  let actorsCreated = 0, actorsUpdated = 0, created = 0, updated = 0, templated = 0, upgradesFound = 0, upgradesTotal = 0;
  for (const v of vehicles) {
    const tpl = templates.get(squash(v.baseType));
    if (tpl) templated++;
    const base = tpl ? tpl.toObject() : { img: fallbackImg, system: {
      brand: '', concealable: { concealable: false, isConcealed: false }, favorite: false,
      installedItems: { allowed: true, allowedTypes: ['itemUpgrade'], list: [], slots: 3, usedSlots: 0 },
    } };
    const system = foundry.utils.mergeObject(foundry.utils.deepClone(base.system), {
      description: { value: v.description },
      price: { market: v.cost },
      sdp: v.sdp, seats: v.seats, speedCombat: v.speedCombat, speedNarrative: v.speedNarrative,
      source: { book: 'The 12 Days of Vehiclemas', page: v.page },
    });
    system.installedItems = { allowed: true, allowedTypes: ['itemUpgrade'], list: [], slots: system.installedItems?.slots ?? 3, usedSlots: 0 };
    // Install the upgrades the compendium has, the way the compendium vehicles carry them: the upgrade
    // items go in flags.cprInstallTree and their ids in installedItems.list. Others stay description-only.
    const tree = [];
    for (const u of v.upgrades) {
      upgradesTotal++;
      const count = Number((u.match(/\\s+x(\\d+)$/i) || [])[1] || 1);
      const udoc = upgradeDocs.get(squash(u.replace(/\\s+x\\d+$/i, '').replace(/\\s*\\(.*\\)\\s*$/, '')));
      if (!udoc) continue;
      upgradesFound++;
      for (let n = 0; n < count; n++) { const o = udoc.toObject(); o._id = foundry.utils.randomID(); delete o.folder; tree.push(o); }
    }
    system.installedItems.list = tree.map(o => o._id);
    const existing = game.items.find(i => i.type === 'vehicle' && i.name === v.name && i.folder?.id === folder.id);
    let item;
    if (existing) { await existing.update({ img: base.img, system, 'flags.cprInstallTree': tree }); item = existing; updated++; }
    else { item = await Item.create({ name: v.name, type: 'vehicle', img: base.img, folder: folder.id, system, flags: { cprInstallTree: tree } }); created++; }

    // A Mook actor stand-in so the vehicle can be dropped on the map as a token. HP = SDP, armor = SP.
    // The vehicle Item is carried inside it. Re-runs update the stats and leave the actor's items alone.
    const stats = { derivedStats: { hp: { value: v.sdp, max: v.sdp }, seriouslyWounded: Math.ceil(v.sdp / 2) },
      externalData: { currentArmorHead: { value: v.sp, max: v.sp }, currentArmorBody: { value: v.sp, max: v.sp } },
      information: { alias: 'Vehicle', notes: v.description } };
    const actor = game.actors.find(a => a.type === 'mook' && a.name === v.name && a.folder?.id === actorFolder.id);
    if (actor) { await actor.update({ img: base.img, 'prototypeToken.texture.src': base.img, system: stats }); actorsUpdated++; }
    else {
      await Actor.create({ name: v.name, type: 'mook', img: base.img, folder: actorFolder.id, system: stats,
        prototypeToken: { name: v.name, texture: { src: base.img }, actorLink: true }, items: [item.toObject()] });
      actorsCreated++;
    }
  }
  ui.notifications.info(\`✅ Vehiclemas vehicles: \${created} created, \${updated} updated in the "\${FOLDER}" item folder (\${templated} used a compendium base-type template). Installed \${upgradesFound}/\${upgradesTotal} listed upgrades from the compendium; the rest are in each description. Actors: \${actorsCreated} created, \${actorsUpdated} updated.\`);
})();`
}
