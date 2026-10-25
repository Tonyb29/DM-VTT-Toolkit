// Relationships between the Eldoria leaders.
//
// RELATIONS: each leader's own view of other leaders, taken from the Allies / Rivals / Complicated
// Relationships blocks in "Realms United-Gathering Darkness.txt" (directional: A's view of B).
// REPORTS_TO: Cogoria's chain of command, taken from each Cogoria NPC's bio. The first name is the
// primary boss; a second name is a secondary supervisor named in the same bio.

import type { NpcRelation } from './campaign-builder-data'

export const ELDORIA_RELATIONS: Record<string, NpcRelation[]> = {
  "High Elder Elysara Windrune": [
    { with: "High Chancellor Thalren Moonshadow", kind: "ally", note: "Shares a vision for peace and unity, and their collaboration on Lumaria's Council is seamless." },
    { with: "Archmage Alaric Silverwind", kind: "ally", note: "They share a deep respect for balancing magic with governance, and Elysara relies on Alaric's expertise in arcane matters." },
    { with: "High King Torvald Ironheart", kind: "rival", note: "She disapproves of his militaristic ways and believes his focus on dominance undermines unity." },
    { with: "LUKAS — Director of Cogoria", kind: "complicated", note: "Respects his technological contributions but finds his pragmatism cold and his disregard for tradition troubling." },
  ],
  "High Chancellor Thalren Moonshadow": [
    { with: "Ice Queen Freya Frostbane", kind: "ally", note: "Thalren and Freya share a quiet understanding, rooted in their appreciation for stability and order." },
    { with: "High Jarl Bjorn Frostbeard", kind: "rival", note: "Finds Bjorn too brutish and shortsighted in his approach to governance." },
    { with: "Queen Marcella Sandsinger", kind: "complicated", note: "Sees her as overly opportunistic, though he can't deny her charm or ability to sway alliances." },
  ],
  "Grand Arbiter Selene Starweaver": [
    { with: "High Druidess Elowen Galewind", kind: "ally", note: "Shares an affinity for balance and believes nature and governance must coexist." },
    { with: "Sun King Raedan Sunstrider", kind: "rival", note: "She considers his boldness reckless and dismisses his ambitions as selfish." },
    { with: "Valeria Swiftspark", kind: "complicated", note: "Both admire innovation, but their approaches differ wildly, leading to heated philosophical debates." },
  ],
  "Archdruid Caladria Stormbloom": [
    { with: "Windcaller Aria Skywhisper", kind: "ally", note: "Deeply connected through their mutual devotion to preserving nature, they often collaborate." },
    { with: "Chancellor Amelia Gearhart", kind: "rival", note: "Sees Cogoria's use of Ragolyte as an abuse of the planet's resources." },
    { with: "Lady Seraphina Nightshade", kind: "complicated", note: "Shares a respect for magical traditions but distrusts her darker inclinations." },
  ],
  "High King Torvald Ironheart": [
    { with: "General Asher Stormbreaker", kind: "ally", note: "They share a respect for strength, seeing military might as the key to survival." },
    { with: "High Elder Elysara Windrune", kind: "rival", note: "Considers her overly idealistic and weak, preferring action to diplomacy." },
    { with: "High Jarl Bjorn Frostbeard", kind: "complicated", note: "Their shared warrior mentality creates an alliance, but their differing strategies often lead to friction." },
  ],
  "Queen Astrid Emberbane": [
    { with: "Ice Queen Freya Frostbane", kind: "ally", note: "A grudging respect exists between them, as both value power and resilience." },
    { with: "Grand Arbiter Selene Starweaver", kind: "rival", note: "Dismisses Selene's talk of balance and considers her views weak." },
    { with: "Queen Marcella Sandsinger", kind: "complicated", note: "They share a cunning nature, leading to both collaboration and rivalry in political games." },
  ],
  "Chief Engineer Magnus Geargrind": [
    { with: "LUKAS — Director of Cogoria", kind: "ally", note: "A mutual respect for engineering brilliance makes them natural collaborators." },
    { with: "Archdruid Caladria Stormbloom", kind: "rival", note: "Magnus dismisses her as overly sentimental, while she views his work as destructive." },
    { with: "Grand Alchemist Isadora Everbloom", kind: "complicated", note: "Their rivalry in crafting and innovation oscillates between respect and hostility." },
  ],
  "Dragonlord Valeria Flamescale": [
    { with: "Sun King Raedan Sunstrider", kind: "ally", note: "Both share a fiery passion for dominance and bold leadership." },
    { with: "Archmage Alaric Silverwind", kind: "rival", note: "She considers his calculated, magical methods too slow compared to raw power." },
    { with: "High Druidess Elowen Galewind", kind: "complicated", note: "Their vastly differing philosophies cause friction, though there's an unspoken respect for each other's convictions." },
  ],
  "Archmage Alaric Silverwind": [
    { with: "High Elder Elysara Windrune", kind: "ally", note: "A partnership founded on wisdom and unity." },
    { with: "High King Torvald Ironheart", kind: "rival", note: "Believes Torvald's approach is brutish and detrimental to society's future." },
    { with: "Sun King Raedan Sunstrider", kind: "complicated", note: "Values his ambition but finds his fiery methods reckless." },
  ],
  "Lady Seraphina Nightshade": [
    { with: "Ice Queen Freya Frostbane", kind: "ally", note: "Shares a love of intrigue and uses alliances to further her goals." },
    { with: "Grand Arbiter Selene Starweaver", kind: "rival", note: "Views her as too self-righteous to understand the complexities of power." },
    { with: "Valeria Swiftspark", kind: "complicated", note: "A mix of admiration and competition exists between them." },
  ],
  "High Arcanist Orion Stormweaver": [
    { with: "Grand Alchemist Isadora Everbloom", kind: "ally", note: "A kindred spirit in innovation and experimentation." },
    { with: "Dragonlord Valeria Flamescale", kind: "rival", note: "Finds her reliance on raw power distasteful." },
    { with: "LUKAS — Director of Cogoria", kind: "complicated", note: "Intrigued by his technology but wary of its potential misuse." },
  ],
  "Grand Alchemist Isadora Everbloom": [
    { with: "Archmage Isabelle Cogswell", kind: "ally", note: "A collaboration of science and magic leads to groundbreaking advancements." },
    { with: "Chief Engineer Magnus Geargrind", kind: "rival", note: "Their debates over innovation often escalate into fierce arguments." },
    { with: "Queen Marcella Sandsinger", kind: "complicated", note: "Finds her business acumen both frustrating and inspiring." },
  ],
  "Sun King Raedan Sunstrider": [
    { with: "Dragonlord Valeria Flamescale", kind: "ally", note: "Their fiery temperaments align, and they often collaborate on military campaigns and displays of dominance." },
    { with: "Archmage Alaric Silverwind", kind: "rival", note: "Sees him as overly cautious and believes Alaric's intellectualism is a barrier to progress." },
    { with: "Grand Arbiter Selene Starweaver", kind: "complicated", note: "Raedan respects her wisdom but feels constrained by her balanced approach." },
  ],
  "Queen Marcella Sandsinger": [
    { with: "High Chancellor Thalren Moonshadow", kind: "ally", note: "A pragmatic alliance formed through shared political maneuvering and mutual respect for diplomacy." },
    { with: "Ice Queen Freya Frostbane", kind: "rival", note: "Views her as cold and unyielding, a direct contrast to Marcella's adaptability and cunning." },
    { with: "Lady Seraphina Nightshade", kind: "complicated", note: "Both share an appetite for power and intrigue, leading to a mix of collaboration and competition." },
  ],
  "High Priestess Seraphia Sunfire": [
    { with: "High Druidess Elowen Galewind", kind: "ally", note: "Shares a reverence for nature, although Seraphia's devotion is rooted in solar divinity rather than earth-bound spirituality." },
    { with: "Thane Erik Coldforge", kind: "rival", note: "Considers his blunt practicality uninspired and unworthy of the divine ideals she upholds." },
    { with: "Valeria Swiftspark", kind: "complicated", note: "Fascinated by her brilliance but uneasy with her reliance on machinery over divine guidance." },
  ],
  "General Asher Stormbreaker": [
    { with: "High King Torvald Ironheart", kind: "ally", note: "Shares a warrior's code and respects his strength in battle." },
    { with: "LUKAS — Director of Cogoria", kind: "rival", note: "Distrusts Cogoria's technomancy, believing it makes soldiers weak and dependent." },
    { with: "High Jarl Bjorn Frostbeard", kind: "complicated", note: "A rival on the battlefield but one with whom he shares a grudging respect." },
  ],
  "High Jarl Bjorn Frostbeard": [
    { with: "General Asher Stormbreaker", kind: "ally", note: "Their shared love of combat has led to an unspoken bond." },
    { with: "High Chancellor Thalren Moonshadow", kind: "rival", note: "Views him as too soft and overly bureaucratic." },
    { with: "Queen Astrid Emberbane", kind: "complicated", note: "They admire each other's strength but frequently clash over methods of leadership." },
  ],
  "Ice Queen Freya Frostbane": [
    { with: "Lady Seraphina Nightshade", kind: "ally", note: "Finds her darkness intriguing and sees potential in an alliance steeped in mystery and cunning." },
    { with: "Queen Marcella Sandsinger", kind: "rival", note: "Freya finds her frivolous and unworthy of her power." },
    { with: "High Chancellor Thalren Moonshadow", kind: "complicated", note: "While they often butt heads, Freya secretly admires his strategic mind." },
  ],
  "Thane Erik Coldforge": [
    { with: "LUKAS — Director of Cogoria", kind: "ally", note: "Respects Lucas for his practicality and believes his technology could benefit Frostholm's harsh climate." },
    { with: "Sun King Raedan Sunstrider", kind: "rival", note: "Finds him arrogant and reckless, qualities Erik despises in a leader." },
    { with: "High Priestess Seraphia Sunfire", kind: "complicated", note: "Their differing ideals have led to philosophical debates, though neither fully discounts the other's perspective." },
  ],
  "Frost Shaman Ingrid Icecaller": [
    { with: "High Druidess Elowen Galewind", kind: "ally", note: "A spiritual bond exists between their nature-based practices, even though their elements differ." },
    { with: "Archmage Isabelle Cogswell", kind: "rival", note: "Distrusts her reliance on artificial magic rather than the natural flow of the world." },
    { with: "Grand Alchemist Isadora Everbloom", kind: "complicated", note: "Mutual respect for their knowledge but frequent clashes over methodology." },
  ],
  "High Druidess Elowen Galewind": [
    { with: "Archdruid Caladria Stormbloom", kind: "ally", note: "Kindred spirits who share a vision for natural harmony." },
    { with: "LUKAS — Director of Cogoria", kind: "rival", note: "Considers his technological advancements an affront to nature." },
    { with: "Queen Astrid Emberbane", kind: "complicated", note: "Respects her strength but mistrusts her motivations." },
  ],
  "Lord Arwyn Stormwing": [
    { with: "Windcaller Aria Skywhisper", kind: "ally", note: "Together, they form the heart of Zephyria's leadership, balancing diplomacy and action." },
    { with: "Dragonlord Valeria Flamescale", kind: "rival", note: "Views her aggression as a threat to Zephyria's peaceful ways." },
    { with: "Queen Marcella Sandsinger", kind: "complicated", note: "Finds her cunning admirable but questions her loyalty to allies." },
  ],
  "Windcaller Aria Skywhisper": [
    { with: "Grovekeeper Brynja Leafsong", kind: "ally", note: "A partnership rooted in their shared connection to the natural world." },
    { with: "Chief Engineer Magnus Geargrind", kind: "rival", note: "Considers his work dangerous and a threat to their way of life." },
    { with: "Sun King Raedan Sunstrider", kind: "complicated", note: "Both admire each other's passion, though their goals frequently diverge." },
  ],
  "Grovekeeper Brynja Leafsong": [
    { with: "High Elder Elysara Windrune", kind: "ally", note: "Shares a connection to the earth and an emphasis on preservation." },
    { with: "Chancellor Amelia Gearhart", kind: "rival", note: "Deeply mistrusts her reliance on mining and industrialization." },
    { with: "Frost Shaman Ingrid Icecaller", kind: "complicated", note: "Although they share a reverence for nature, their elemental focus occasionally causes friction." },
  ],
  "LUKAS — Director of Cogoria": [
    { with: "Chief Engineer Magnus Geargrind", kind: "ally", note: "Both are staunch advocates for technological advancement, and they often collaborate." },
    { with: "High Druidess Elowen Galewind", kind: "rival", note: "Finds her naturalist beliefs outdated and an obstacle to progress." },
  ],
  "Valeria Swiftspark": [
    { with: "Grand Alchemist Isadora Everbloom", kind: "ally", note: "Their shared interest in experimentation and innovation makes them close collaborators." },
    { with: "Archdruid Caladria Stormbloom", kind: "rival", note: "Views her as an obstacle to Cogoria's growth, dismissing her environmental concerns as outdated." },
    { with: "Ice Queen Freya Frostbane", kind: "complicated", note: "They have a mutual respect for efficiency and leadership but fundamentally differ in their worldview." },
  ],
  "Chancellor Amelia Gearhart": [
    { with: "LUKAS — Director of Cogoria", kind: "ally", note: "Shares his vision for industrial and technological progress and works closely to implement his policies." },
    { with: "Windcaller Aria Skywhisper", kind: "rival", note: "Sees her nomadic ways as inefficient and counterproductive to societal progress." },
    { with: "Queen Marcella Sandsinger", kind: "complicated", note: "They often collaborate on trade agreements but view each other warily due to their differing priorities." },
  ],
  "Archmage Isabelle Cogswell": [
    { with: "Archmage Alaric Silverwind", kind: "ally", note: "They share an intellectual bond and often exchange theories and discoveries." },
    { with: "High Jarl Bjorn Frostbeard", kind: "rival", note: "Views his lack of appreciation for arcane and technological innovation as a sign of backwardness." },
    { with: "Frost Shaman Ingrid Icecaller", kind: "complicated", note: "Both respect each other's command of their respective arts, though they approach magic from vastly different philosophies." },
  ],
}

export const ELDORIA_REPORTS_TO: Record<string, string[]> = {
  "Chancellor Amelia Gearhart": ["LUKAS — Director of Cogoria"],
  "Grand Engineer Maximus Steelborne": ["Chancellor Amelia Gearhart"],
  "High Magister Victor Ironforge": ["Chancellor Amelia Gearhart"],
  "Prime Technomancer Sophia Gearheart": ["Chancellor Amelia Gearhart"],
  "Master Artificer Alexander Gearsmith": ["Chancellor Amelia Gearhart"],
  "Petra Ironwheel": ["Grand Engineer Maximus Steelborne"],
  "Drennar Cogsworth": ["Grand Engineer Maximus Steelborne"],
  "Finn Brasswick": ["Petra Ironwheel", "Drennar Cogsworth"],
  "Archmage Isabelle Cogswell": ["High Magister Victor Ironforge"],
  "Oliver Steamfizzle": ["High Magister Victor Ironforge"],
  "Lyria Runecast": ["Archmage Isabelle Cogswell", "Oliver Steamfizzle"],
  "Valeria Swiftspark": ["Prime Technomancer Sophia Gearheart"],
  "Sera Voidmantle": ["Valeria Swiftspark", "Prime Technomancer Sophia Gearheart"],
  "Aurora Clockwise": ["Master Artificer Alexander Gearsmith"],
  "Torvin Emberlatch": ["Aurora Clockwise", "Master Artificer Alexander Gearsmith"],
}
