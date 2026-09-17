import React, { useState } from 'react'
import { Check, Copy, Dices, FileDown, RotateCcw, Shuffle, Star } from 'lucide-react'

const T = {
  bg: '#08050a', surface: '#120c16', surface2: '#1a1220',
  border: '#2a1f36', accent: '#f0e000', accentBright: '#ffff40',
  text: '#e8e0f0', textMuted: '#8878a0', textDim: '#544868',
  cyan: '#00e5ff', red: '#ff2060', green: '#40e070', gold: '#f0e000',
}

export type Option = { t: string; d: string; cue: string }
export type Step = { id: string; title: string; eyebrow: string; sub: string; options: Option[]; roleGate?: string }

export const STEPS: Step[] = [
  {
    id: 'homeland', title: 'Where Did You Grow Up?', eyebrow: 'Homeland',
    sub: 'Every edgerunner carries their block with them, whether they left it behind or never could. Pick the streets — or district — that raised you.',
    options: [
      { t: 'Combat Zone Sprawl', d: 'You grew up in a district the city stopped policing years ago. Boostergangs ran the corners; salvage crews ran the economy.', cue: "Play it wary. You clock exits before you sit down, and loud noises don't startle you — they just narrow your focus." },
      { t: 'Corporate Arcology', d: 'Raised inside a megabuilding owned wall-to-wall by one corp. Nannybots, NDAs, and elevators that sorted people by floor before anything else.', cue: 'Play it clipped and controlled. You default to corporate manners even in a gunfight, and it unnerves people.' },
      { t: 'Downtown Sprawl Block', d: 'A dense, loud, multilingual neighborhood stacked twelve businesses high. You learned to read a street in three seconds flat.', cue: 'Play it street-fluent — you code-switch constantly and always seem to know a guy.' },
      { t: 'Farm Belt Township', d: 'A small agricultural town outside the metroplex, contracted three times over to a food conglomerate before you were born.', cue: 'Play it plainspoken and patient. City noise still gets under your skin a little, even years later.' },
      { t: 'Nomad Convoy', d: 'Home was wherever the pack parked that week. Family was measured in trucks, not square footage.', cue: 'Play it clannish. You trust a shared meal more than a signed contract, and you always know where the exits and the horizon are.' },
      { t: 'Free State Border Town', d: 'A scrappy settlement outside full corporate control — independence that cost plenty in services nobody else had to live without.', cue: 'Play it self-reliant to a fault. You fix things yourself before you’d ever think to ask.' },
      { t: 'Flooded Coastal Ruin', d: 'A drowned pre-Collapse district, scavenged block by block. You read tide charts and structural cracks before you read anything else.', cue: 'Play it opportunistic and a little superstitious about water and weather.' },
      { t: 'Vertical Squat-Stack', d: "A self-governed high-rise nobody official claimed anymore. Elevators didn't work; the community did — mostly.", cue: "Play it communal. You default to 'we' before 'I,' and you notice who's missing from a room." },
      { t: 'Orbital Platform', d: 'A rare childhood spent on a corporate orbital colony. You remember exactly what real gravity felt like the first time you touched ground.', cue: "Play it a half-step removed from Earth culture — references land a beat late, and heights don't bother you at all." },
      { t: 'Highway Drifter Circuit', d: 'No fixed address, ever — your family chased gigs and seasons from town to town.', cue: "Play it rootless and adaptable. You've said goodbye enough times that you keep the ritual short." },
    ],
  },
  {
    id: 'tongue', title: "What's Your Native Tongue?", eyebrow: 'Native Tongue',
    sub: "Everyone on the street speaks Streetslang — that's just how business gets done. But you grew up with something else at home first.",
    options: [
      { t: 'North American Roots', d: 'English, Spanish, French, or another tongue that came from this side of the old border lines.', cue: 'Play it with the odd idiom that doesn’t quite translate, and let it slip out under stress.' },
      { t: 'Latin American Roots', d: 'Spanish, Portuguese, Guaraní, or a language carried down through the generations before you.', cue: 'Play it warm with family and formal with strangers — the language shift is audible.' },
      { t: 'European Roots', d: 'German, Italian, Polish, Russian — whichever old-world tongue survived the family’s move.', cue: 'Play it a little nostalgic for a place you may have never actually seen.' },
      { t: 'Middle Eastern / North African Roots', d: 'Arabic, Farsi, Hebrew, or Turkish spoken at your kitchen table growing up.', cue: 'Play it code-switching mid-sentence without noticing you’re doing it.' },
      { t: 'Sub-Saharan African Roots', d: 'Swahili, Yoruba, Hausa, or another home language passed down alongside Streetslang.', cue: 'Play it rhythmically — your Streetslang has a cadence people can place even if they can’t name it.' },
      { t: 'South Asian Roots', d: 'Hindi, Urdu, Bengali, Tamil, or another mother tongue from home.', cue: 'Play it precise — you translate carefully, because a mistranslation once actually mattered.' },
      { t: 'Southeast Asian Roots', d: 'Vietnamese, Filipino, Khmer, Indonesian, or a similar home language.', cue: 'Play it quick to switch languages depending on who’s listening and who isn’t supposed to be.' },
      { t: 'East Asian Roots', d: 'Mandarin, Cantonese, Japanese, Korean, or Mongolian — whatever you grew up hearing first.', cue: 'Play it formal in address, informal in argument — the register shift tells people how mad you actually are.' },
      { t: 'Pacific Islander Roots', d: 'Hawaiian, Maori, Tahitian, or another island tongue that’s rarer on the street than most.', cue: 'Play it a little protective of the language — you don’t perform it for strangers.' },
      { t: 'Streetslang Only', d: 'No real second language — Streetslang genuinely is your first language, and that says something too.', cue: 'Play it fluent in the street and slightly lost anywhere that assumes you speak something else.' },
    ],
  },
  {
    id: 'family', title: 'What Kind of Family Raised You?', eyebrow: 'Household',
    sub: 'Whoever raised you — blood, crew, or corp-appointed guardian — shaped what you think is normal to risk, and how far up or down the ladder you started out.',
    options: [
      { t: 'Executive Dynasty', d: 'Private security, a name-brand school, a house with more rooms than people to fill them. You grew up assuming problems get solved by someone else, and it took you a while to unlearn that.', cue: "Play it entitled in small, unconscious ways — you're startled when the world doesn't defer to you, and you're working on not showing it." },
      { t: 'Corporate Climbers', d: 'Parents who measured love in contract renewals and always had one eye on the next promotion. Comfortable, but conditional — you learned early that performance was the price of belonging.', cue: "Play it performance-conscious. You still flinch at being 'reviewed,' even informally." },
      { t: 'Street-Level Hustlers', d: 'Parents who ran angles — some legal, most not — to keep the lights on. Nobody starved, but nobody relaxed either.', cue: 'Play it quick with a con and quicker to spot one being run on you.' },
      { t: 'Nomad Pack Blood', d: 'Family meant the whole convoy, not just the people who share your last name. You learned to drive and to fight around the same age, and you were never actually alone.', cue: 'Play it loyal to your circle first, rules and laws a distant second.' },
      { t: 'Gang-Affiliated', d: "Colors meant protection, obligation, and a debt that doesn't expire just because you left the block. You were fed, but you were also property, in a way you're still working out how you feel about.", cue: 'Play it with old reflexes — respect and disrespect both register instantly and physically.' },
      { t: 'Off-Grid Survivalists', d: 'A family that trusted almost no one outside itself, on principle, for reasons that turned out to be pretty good ones. You never went hungry, but you also never met a stranger who stayed one.', cue: 'Play it guarded. You count exits in every room and you never say more than you have to.' },
      { t: 'Warren Stack Raised', d: 'A cramped conapt stacked forty floors up in a megastructure nobody outside called home. Kibble and scop for dinner most nights, but a whole floor of neighbors who functioned like an extended family.', cue: 'Play it communal by instinct — you assume shared resources and shared watch, and you’re thrown by people who don’t operate that way.' },
      { t: 'Reclaimer Pioneers', d: 'Your family didn’t just survive the road — they stopped and rebuilt something out of a dead town nobody else wanted. Hard, simple, and something close to proud.', cue: 'Play it practical and unsentimental about hardship — you’ve rebuilt things before and you’ll do it again.' },
      { t: 'Street Orphaned', d: 'No real family to speak of — you were raised by whoever was around that week, and you learned fast that nobody was coming to save you but you.', cue: 'Play it self-sufficient to a fault, and quietly surprised whenever someone actually follows through on a promise.' },
      { t: 'Media Lineage', d: "You grew up performing for a feed, one way or another — a family already used to being watched.", cue: "Play it a little performative even at rest. Part of you is always aware there could be an audience." },
    ],
  },
  {
    id: 'crisis', title: 'What Happened to Your Family?', eyebrow: 'Family Crisis',
    sub: "The world's still digging out from a war that ended a lot of families along the way. Something happened to yours, and it's part of why you are who you are now.",
    options: [
      { t: 'Betrayed', d: 'Someone your family trusted — a partner, a friend, blood — took everything and disappeared. You’ve never fully trusted a handshake since.', cue: 'Play it slow to extend real trust, and quick to notice the exact moment someone’s angling for it.' },
      { t: 'Mismanaged', d: 'No villain in this one — just years of bad decisions that quietly added up until there was nothing left.', cue: 'Play it obsessively careful with resources, money, and planning, almost to a fault.' },
      { t: 'Exiled', d: 'Driven out of a home, a nation, or a Corporation that decided it didn’t want your family anymore. You grew up as the family that used to belong somewhere.', cue: 'Play it wary of institutions and the people who run them, on principle.' },
      { t: 'Imprisoned', d: 'Your family got locked up, one way or another, and you’re the one who got out. That freedom comes with weight.', cue: 'Play it claustrophobic about confinement — literal or otherwise — in ways you don’t always explain.' },
      { t: 'Vanished', d: "Gone, all of them, without a note or a body or an answer. You're the last one carrying the name.", cue: 'Play it unsettled by unresolved endings — you need to know how things finish, even small ones.' },
      { t: 'Killed', d: "You're the only survivor of whatever happened, and you still don't talk about the details.", cue: 'Play it protective of the people around you now, sometimes past the point they find comfortable.' },
      { t: 'Entangled', d: "Your family is bound up in something bigger than any one of you — a crime outfit, a movement, an old obligation — and it isn't done with you yet.", cue: 'Play it aware that someone, somewhere, still considers you owed to a cause you didn’t choose.' },
      { t: 'Scattered', d: "Plain bad luck split everyone up, and you genuinely don't know where most of your family ended up.", cue: 'Play it low-key hopeful in a way you don’t advertise — you clock resemblances in strangers more than you’d admit.' },
      { t: 'Feuding', d: 'A grudge older than you are, passed down like an heirloom nobody wanted. You inherited enemies before you inherited anything else.', cue: 'Play it wary around a specific name, family, or symbol that means nothing to anyone else in the room.' },
      { t: 'Indebted', d: "You inherited an obligation that was never yours to begin with, and you're the one stuck paying it off.", cue: 'Play it quietly resentful of debts, even ones you understand you’re obligated to honor.' },
    ],
  },
  {
    id: 'friend', title: "Who's Always Had Your Back?", eyebrow: 'Closest Ally',
    sub: "Not everyone in your life is a threat waiting to happen. Somebody's actually stuck around.",
    options: [
      { t: 'Like an Older Sibling', d: 'Looked out for you before you were able to look out for yourself, and still checks in more than you ask them to.', cue: 'Play it a little bristly about their advice, even when — especially when — they’re right.' },
      { t: 'Like a Younger Sibling', d: 'You’re the one who taught them how the world actually works, and you still feel responsible for how they turn out.', cue: 'Play it protective past the point that’s strictly your business anymore.' },
      { t: 'A Mentor', d: 'Showed you the thing you’re actually good at, back before you knew it was a thing you were good at.', cue: 'Play it deferential to their opinion even now, whether or not you’d admit it.' },
      { t: 'A Trusted Partner', d: 'Someone you’ve run enough jobs with to trust blind, no explanation needed.', cue: 'Play it shorthand-fluent with them — half your conversations are unfinished sentences the other one completes.' },
      { t: 'A Former Lover', d: 'The romance ended somewhere along the way. The loyalty never did.', cue: 'Play it carefully casual about the history whenever it comes up in front of other people.' },
      { t: 'A Reformed Enemy', d: 'Used to want you dead. Somehow ended up in your corner instead, and neither of you fully trusts how that happened.', cue: 'Play it a little surprised, every time, that this one actually held.' },
      { t: 'A Parent Figure', d: 'Not blood, but they raised the part of you that matters most.', cue: 'Play it protective of them specifically, in a way that surprises people who’ve only seen your hard edges.' },
      { t: 'A Childhood Friend', d: 'Knew you before any of this — the job, the reputation, the chrome. Still around, still calls you by the old name.', cue: 'Play it visibly more relaxed and unguarded whenever they’re actually in the room.' },
      { t: 'A Street Contact', d: 'Knows things, owes you, or you owe them — the relationship runs on favors more than affection, but it’s solid.', cue: 'Play it transactional but genuinely warm underneath, in a way that confuses people who expect one or the other.' },
      { t: 'A Kindred Spirit', d: 'Nothing in common on paper. Everything in common where it actually counts.', cue: 'Play it easily read by them and almost nobody else — they finish your sentences and you let them.' },
    ],
  },
  {
    id: 'enemy', title: "Who's Still Got a Grudge?", eyebrow: 'Old Grudge',
    sub: "You've made at least one enemy on the way to becoming who you are. Here's the one that actually matters — and what they can throw at you if it ever comes to a head.",
    options: [
      { t: 'An Ex-Friend', d: 'You cost them status or face once, publicly, and they’ve never let it go. They’ll come alone, if they come at all — but they’ll come.', cue: 'Play it dismissive of the threat in conversation and quietly watchful of it in practice.' },
      { t: 'An Ex-Lover', d: 'A breakup that cost more than a relationship — a friend, a reputation, a piece of you. Still just them, still bitter, still capable of surprising you.', cue: 'Play it careful never to bring them up first, and visibly tense when someone else does.' },
      { t: 'An Estranged Relative', d: 'A public humiliation neither of you has ever forgiven. Might bring one loyal friend along if it comes to blows.', cue: 'Play it stiff and formal any time family comes up in conversation, no exceptions.' },
      { t: 'A Childhood Rival', d: 'Called you a coward once, meant it, and has spent years making sure you remember. Might show up backed by a few old friends.', cue: 'Play it competitive by reflex whenever this specific person is mentioned, even about things that don’t matter.' },
      { t: 'Someone Who Worked for You', d: 'They deserted or betrayed you at the worst possible moment, and they’ve since built a crew of their own.', cue: 'Play it slow to delegate or trust subordinates now, for reasons you don’t always explain.' },
      { t: 'Someone You Worked For', d: 'You turned down their offer once — a job, a deal, something more personal — and they don’t forgive being told no. They can point a whole gang at you.', cue: 'Play it cautious about turning down offers from powerful people now, even when you probably should.' },
      { t: 'A Former Partner', d: 'You simply never got along, and now the law — or something like it — sits on their side of the argument.', cue: 'Play it careful around uniforms and badges specifically, more than the situation always warrants.' },
      { t: 'A Corporate Rival', d: 'A professional or romantic rivalry with real institutional weight behind it now. Not personal to them anymore — just business, which somehow makes it worse.', cue: 'Play it wary of anything with a corporate logo attached, reflexively.' },
      { t: 'A Political Enemy', d: 'You crossed a government official once, and they’ve since acquired a corporation’s worth of resources to make you regret it.', cue: 'Play it cautious in any official or bureaucratic setting, like the walls might be listening.' },
      { t: 'A Framed Grudge', d: 'One of you set the other up for something they didn’t do. You’re honestly not sure anymore which of you it was. An entire city’s worth of trouble could come from this.', cue: 'Play it evasive about the specifics of what actually happened — even you’re not sure you’d come out looking good.' },
    ],
  },
  {
    id: 'loveAffair', title: 'What Happened to Your Last Love?', eyebrow: 'Tragic Love',
    sub: "It wouldn't be Cyberpunk without at least one that ended badly. This is the one you still think about.",
    options: [
      { t: 'Died in an Accident', d: 'Nothing dramatic, no villain to blame. Just gone, one ordinary day.', cue: 'Play it calm about the subject right up until something small and unrelated sets it off.' },
      { t: 'Vanished', d: 'No note, no body, no answer — just an absence you’ve never been able to close.', cue: 'Play it unable to fully let go — you still half-expect to see them in a crowd.' },
      { t: 'It Just Didn’t Work', d: 'No tragedy, no villain — just two people who drifted past each other and never found their way back.', cue: 'Play it wistful rather than bitter, which somehow makes people ask more questions.' },
      { t: 'A Vendetta Got in the Way', d: 'Your priorities cost you the relationship, and some nights you’re not sure you’d choose differently.', cue: 'Play it defensive about the choice if anyone brings it up, like you’re still arguing your side.' },
      { t: 'Kidnapped', d: 'Taken, and you’ve never confirmed whether they’re still out there somewhere.', cue: 'Play it unable to fully rest — a part of you is always still looking.' },
      { t: 'Went Cyberpsycho', d: 'You watched them stop being who they were, piece by piece, until there was nothing left to save.', cue: 'Play it watchful of cyberware and its limits, in yourself and in everyone around you.' },
      { t: 'Took Their Own Life', d: 'And you still run the what-ifs on a loop you can’t quite switch off.', cue: 'Play it quietly attentive to anyone who seems to be struggling, more than the situation calls for.' },
      { t: 'Killed in a Fight', d: 'One that, in your quieter moments, you’re fairly sure should have been yours to finish.', cue: 'Play it overprotective in any fight involving someone you care about now.' },
      { t: 'Cut Out by a Rival', d: 'Someone else made a better play, and you watched it happen in real time.', cue: 'Play it competitive and a little insecure about rivals for anyone’s attention now.' },
      { t: 'Imprisoned or Exiled', d: 'Gone, but not gone-gone — which some days feels worse than a clean ending would have.', cue: 'Play it unresolved and restless about it, like the story isn’t actually finished yet.' },
    ],
  },
  {
    id: 'temperament', title: "What's Your Temperament?", eyebrow: 'Temperament',
    sub: 'Everyone who spends five minutes with you walks away with an impression. What is it?',
    options: [
      { t: 'Calculating', d: 'You watch before you act, and you rarely show your hand until the moment it matters.', cue: 'Play it a beat slower to react in conversation — you’re always running the angles first.' },
      { t: 'Live Wire', d: 'You burn bright and loud, chasing whatever the next rush is.', cue: 'Play it restless in stillness — quiet rooms make you itch for something to happen.' },
      { t: 'Steady Hand', d: 'Competent, dependable, and three steps ahead with a plan nobody asked you to make.', cue: 'Play it unbothered by chaos — you’re already organizing it in your head.' },
      { t: 'Wary', d: 'You assume the worst about a situation until it proves you wrong, and it rarely does.', cue: 'Play it slow to relax in new spaces, scanning long after everyone else has settled in.' },
      { t: 'Warm', d: 'Genuinely easy to like, and you’ve learned exactly how useful that can be.', cue: 'Play it disarming on purpose — the friendliness is real and it’s also a tool.' },
      { t: 'Blunt', d: 'You say what you mean, and you’ve stopped apologizing for the fallout.', cue: 'Play it visibly impatient with people who dance around a point.' },
      { t: 'Detached', d: 'Hard to read, harder to rattle — people never quite know where they stand with you.', cue: 'Play it flat-affect in moments that would make anyone else react.' },
      { t: 'Driven', d: 'Everything you do serves the goal. Small talk is a resource you’re not willing to spend.', cue: 'Play it visibly redirecting conversations back toward whatever you actually came for.' },
      { t: 'Playful', d: 'You treat most of this like it’s still a game, even on the days it clearly isn’t.', cue: 'Play it grinning at the worst possible moments — it’s a defense mechanism and you know it.' },
      { t: 'Guarded', d: 'Polite on the surface, walled off underneath, and very selective about who gets past that.', cue: 'Play it pleasant but vague about anything personal, redirecting smoothly every time.' },
    ],
  },
  {
    id: 'age', title: 'How Old Are You?', eyebrow: 'Age',
    sub: "Age here is less a number than a resume — how many jobs you've survived, and how much of yourself you've traded for that.",
    options: [
      { t: 'Green (late teens)', d: "Barely out from under someone else's roof, and still finding out the world doesn't grade on a curve.", cue: "Play it hungry and a little too confident. You haven't lost enough yet to be careful." },
      { t: 'Rising (early-to-mid 20s)', d: 'Enough scars to have a reputation starting to form, good or bad.', cue: "Play it ambitious. You're building a name and you know exactly which jobs are 'beneath' the name you want." },
      { t: 'Seasoned (late 20s–30s)', d: 'A full resume of jobs gone right and jobs gone very wrong, and you can tell the difference before anyone else can.', cue: "Play it calm under pressure — you've already had the worst day, probably more than once." },
      { t: 'Veteran (40s)', d: "You've outlived several street legends who were better than you at this. That's not nothing.", cue: "Play it economical with effort and words. You've stopped proving things to people who won't remember." },
      { t: 'Old Guard (50+)', d: "Chrome held together with willpower, spite, and a maintenance plan you can't quite afford anymore.", cue: "Play it wry and unhurried. Nothing rattles you that hasn't already happened twice." },
    ],
  },
  {
    id: 'war', title: 'What Was the War to You?', eyebrow: 'Conflict',
    sub: 'The city carries scars from a corporate war that leveled blocks and rewrote skylines. Everyone has a relationship to it, even the ones too young to remember.',
    options: [
      { t: 'Frontline', d: 'You actually fought — corp militia, mercenary contract, or just a neighborhood that armed itself and held a line.', cue: 'Play it hyper-alert to sightlines and cover, even in a quiet room. Old habits.' },
      { t: 'Homefront Survivor', d: 'The war came to your block. You spent it digging people out of rubble instead of running.', cue: 'Play it protective of civilians and short-tempered with anyone who treats violence casually.' },
      { t: 'Profiteer', d: "You made money off the chaos — salvage, black market medicine, information — and didn't fire a shot.", cue: "Play it pragmatic to a fault. You genuinely don't see the moral difference people expect you to see." },
      { t: 'Sheltered', d: 'Family or corporate connections kept you insulated from the worst of it, and you know how lucky that makes you.', cue: "Play it a little guilty and overcompensating — you take risks now you didn't have to take then." },
      { t: 'Too Young to Remember', d: 'The war is a history unit and a scarred skyline to you, not a memory.', cue: 'Play it impatient with veterans who expect the war to still mean something to everyone.' },
      { t: 'Deserter', d: 'You were in it, and you ran. Somebody, somewhere, still has paperwork on that.', cue: 'Play it evasive about your past and quick to change the subject when the war comes up.' },
    ],
  },
  {
    id: 'role', title: "What's Your Calling?", eyebrow: 'Role',
    sub: "The thing you're known for on the street — the job that shapes how you solve every other problem.",
    options: [
      { t: 'Rockerboy', d: "You perform, and the performance is the weapon — a voice, a following, a message people can't ignore.", cue: "Play it magnetic. You address the room even when you're talking to one person." },
      { t: 'Solo', d: 'Violence is a trade you’re very, very good at, and you charge accordingly.', cue: "Play it economical and controlled. You don't posture — you just get closer to being ready than everyone else." },
      { t: 'Netrunner', d: "The real fight happens in the net, and you're already three moves ahead of whoever's watching the cameras.", cue: 'Play it distracted-looking half the time — part of your attention is always somewhere else.' },
      { t: 'Tech', d: "You fix what's broken and improve what isn't, usually with parts that weren't meant to go together.", cue: 'Play it hands-first. You narrate mechanical problems out loud without meaning to.' },
      { t: 'Medtech', d: "You patch people up, on or off the books, and you've seen enough trauma to be unbothered by most of it.", cue: 'Play it calm and clinical in a crisis — you triage a room instinctively.' },
      { t: 'Media', d: 'You chase the story other people would rather stayed buried.', cue: "Play it curious past the point of comfort. You ask the question everyone else is too polite to ask." },
      { t: 'Lawman', d: 'You still believe in the badge, or at least in the idea it’s supposed to represent.', cue: "Play it procedural, even when the situation clearly doesn't deserve it." },
      { t: 'Exec', d: "You climb corporate ladders and you're good at making other people's failures visible and your own invisible.", cue: "Play it composed and calculating — you're always quietly assessing who's useful in the room." },
      { t: 'Fixer', d: "You don't do the job — you know who does, and you take a cut for the introduction.", cue: 'Play it socially frictionless. You remember names, debts, and favors better than anyone.' },
      { t: 'Nomad', d: 'Family, convoy, and the open road matter more to you than any city ever will.', cue: 'Play it plainspoken and loyal to your pack above almost anything else.' },
    ],
  },
  {
    id: 'execType', title: 'What Kind of Corp Do You Work For?', eyebrow: 'Corp Type', roleGate: 'Exec',
    sub: 'Every Exec climbs a ladder that belongs to somebody. This is the industry yours is built on.',
    options: [
      { t: 'Financial', d: 'Your Corp moves money — banking, investment, insurance, the machinery behind everyone else’s machinery.', cue: 'Play it reflexively aware of the cost of everything, out loud, even when nobody asked.' },
      { t: 'Media & Communications', d: 'Your Corp controls what people see, hear, and believe — networks, data feeds, the narrative itself.', cue: 'Play it image-conscious about how a moment will be spun, even in private conversation.' },
      { t: 'Cybertech & Medical', d: 'Your Corp builds the chrome and the cures — cyberware, prosthetics, the hardware people trust with their bodies.', cue: 'Play it clinically curious about anyone’s visible cyberware, cataloguing it without meaning to.' },
      { t: 'Pharmaceuticals & Biotech', d: 'Your Corp makes what keeps people alive, functional, or numb — and prices it accordingly.', cue: 'Play it a little too comfortable discussing what a life is worth in eddies.' },
      { t: 'General Consumables', d: 'Your Corp makes what people eat, wear, and use every day — unglamorous, and everywhere.', cue: 'Play it surprisingly proud of a product line most people would consider beneath you.' },
      { t: 'Energy Production', d: 'Your Corp keeps the lights on for half the city, and knows exactly what leverage that buys.', cue: 'Play it quietly aware you could make someone’s week very dark, and never actually say it.' },
      { t: 'Personal Electronics & Robotics', d: 'Your Corp builds the gear people carry, wear, and trust with their daily lives.', cue: 'Play it evaluating everyone’s tech like a walking product review.' },
      { t: 'Corporate Services', d: 'Your Corp sells other Corporations the tools to run themselves — consulting, security, infrastructure.', cue: 'Play it fluent in corporate jargon even outside the office, and a little oblivious to how that sounds.' },
      { t: 'Consumer Services', d: 'Your Corp sells experiences and convenience directly to people — hospitality, entertainment, retail at scale.', cue: 'Play it customer-service smooth even in situations that clearly don’t call for it.' },
      { t: 'Real Estate & Construction', d: 'Your Corp decides what gets built, torn down, and who gets to live there.', cue: 'Play it appraising every building you walk into, out of old habit.' },
    ],
  },
  {
    id: 'execDivision', title: 'What Division Do You Work In?', eyebrow: 'Division', roleGate: 'Exec',
    sub: 'Every Corp has departments, and yours decided what kind of problems you solve.',
    options: [
      { t: 'Procurement', d: 'You source what the Corp needs, from whoever has it, however that has to happen.', cue: 'Play it always working an angle on where to get something cheaper or faster.' },
      { t: 'Manufacturing', d: 'You keep production running, on schedule, over budget concerns, over almost anything else.', cue: 'Play it impatient with delays and inefficiency, even in casual life.' },
      { t: 'Research and Development', d: 'You work on what’s next, often before it’s legal, safe, or fully understood.', cue: 'Play it curious to the point of recklessness about how things work.' },
      { t: 'Human Resources', d: 'You manage people as a resource — hiring, firing, and the quiet work of making problems disappear.', cue: 'Play it unsettlingly calm about difficult personnel decisions.' },
      { t: 'Public Affairs / Publicity / Advertising', d: 'You manage what the public believes about your Corp, true or not.', cue: 'Play it instinctively reframing bad news into something sellable, mid-sentence.' },
      { t: 'Mergers and Acquisitions', d: 'You make companies disappear into other companies, and you’re good at making it look friendly.', cue: 'Play it appraising, like you’re always quietly pricing out the room.' },
    ],
  },
  {
    id: 'execEthics', title: 'How Good or Bad Is Your Corp?', eyebrow: 'Corp Ethics', roleGate: 'Exec',
    sub: 'Not every Corp is a monster. Not every Corp isn’t, either. This is where yours actually falls.',
    options: [
      { t: 'Genuinely Good', d: 'Your Corp actually operates on ethical practice, and actually means it — rare enough that people notice.', cue: 'Play it a little defensive when people assume the worst of your employer.' },
      { t: 'Fair and Honest', d: 'Your Corp runs a clean, honest business, consistently, without needing a PR department to convince anyone.', cue: 'Play it straightforward in negotiations, almost to a fault.' },
      { t: 'Mostly Clean', d: 'Your Corp slips into something unethical occasionally, but it’s rare, and it bothers people when it happens.', cue: 'Play it uncomfortable when the Corp’s rare bad moves come up in conversation.' },
      { t: 'Rule-Bender', d: 'Your Corp will bend what it has to in order to get what it needs, and doesn’t lose sleep over it.', cue: 'Play it pragmatic about ethics — rules are guidelines, not walls.' },
      { t: 'Ruthless', d: 'Your Corp is profit-centered and willing to do real harm to protect that profit.', cue: 'Play it coldly practical about consequences that would bother most people.' },
      { t: 'Rotten to the Core', d: 'Your Corp will do anything — illegal, unethical, or worse — as a matter of routine business.', cue: 'Play it unbothered by things that should probably bother you, and a little aware of that.' },
    ],
  },
  {
    id: 'execReach', title: 'Where Is Your Corp Based?', eyebrow: 'Corp Reach', roleGate: 'Exec',
    sub: 'How far your Corp’s name actually reaches shapes how far your own reputation travels with it.',
    options: [
      { t: 'One City', d: 'Your Corp is a local institution — well known here, and basically unknown everywhere else.', cue: 'Play it surprised and a little thrown whenever someone outside your city recognizes the Corp name.' },
      { t: 'Several Cities', d: 'Your Corp operates across a handful of cities, big enough to matter, small enough to still be personal.', cue: 'Play it name-dropping other city offices casually, like everyone should know them too.' },
      { t: 'Statewide', d: 'Your Corp’s name means something across the whole state, not just your corner of it.', cue: 'Play it a little proprietary about your Corp’s territory.' },
      { t: 'National', d: 'Your Corp operates nationwide — a real institution, with real weight behind its name.', cue: 'Play it casually confident that your Corp’s name will open doors almost anywhere in the country.' },
      { t: 'International (Select Cities)', d: 'Your Corp has offices in a handful of major cities worldwide — global, but not everywhere.', cue: 'Play it well-traveled and a little detached from any one specific place.' },
      { t: 'International (Everywhere)', d: 'Your Corp has a footprint essentially everywhere that matters. You represent something genuinely massive.', cue: 'Play it a little numb to scale — a million-eddy decision barely registers as a big deal.' },
    ],
  },
  {
    id: 'execThreat', title: "Who's Gunning for Your Group?", eyebrow: 'Corp Threat', roleGate: 'Exec',
    sub: 'Nobody climbs without somebody trying to knock them back down. This is who’s circling.',
    options: [
      { t: 'A Rival Corp', d: 'A direct competitor in your industry wants your Corp’s market share, and isn’t picky about how they get it.', cue: 'Play it instantly suspicious of anyone connected to that rival Corp’s name.' },
      { t: 'Law Enforcement', d: 'Someone with a badge has your Corp’s activities on a watch list, and your name might be on the file too.', cue: 'Play it careful around anything official-looking, more than the situation strictly requires.' },
      { t: 'Local Media', d: 'A reporter or outlet has decided your Corp is their next big exposé, and they’re digging.', cue: 'Play it guarded around journalists and anyone asking too many casual questions.' },
      { t: 'Internal Feud', d: 'A rival division inside your own company is working against you, quietly, from the inside.', cue: 'Play it watchful in your own office, more than anywhere else.' },
      { t: 'Local Government', d: 'A city official or agency has decided your Corp is a problem worth solving.', cue: 'Play it politically careful, weighing every public statement twice.' },
      { t: 'A Hostile Takeover', d: 'A bigger international player has your Corp in their sights and is circling for an acquisition nobody asked for.', cue: 'Play it privately anxious about job security, however composed you look on the surface.' },
    ],
  },
  {
    id: 'execBoss', title: "What's Your Relationship With Your Boss?", eyebrow: 'Your Boss', roleGate: 'Exec',
    sub: 'Every Exec answers to somebody. This is what that actually looks like day to day.',
    options: [
      { t: 'A Mentor With Enemies', d: 'Your Boss genuinely mentors you — but their own rivals are a problem you’ve inherited along with the guidance.', cue: 'Play it loyal to your Boss specifically, and wary of anyone known to be their enemy.' },
      { t: 'Hands-Off', d: 'Your Boss gives you total freedom and pointedly doesn’t ask what you’re doing with it.', cue: 'Play it used to operating with zero oversight, and a little thrown when someone actually checks your work.' },
      { t: 'A Micromanager', d: 'Your Boss meddles constantly, second-guessing decisions that were never theirs to make.', cue: 'Play it quietly, chronically irritated by unnecessary oversight.' },
      { t: 'Unpredictable', d: 'Your Boss swings between paranoid and volatile, and you’ve learned to read the warning signs early.', cue: 'Play it hyper-attuned to someone’s mood shifting, watching for the tell before it happens.' },
      { t: 'Genuinely in Your Corner', d: 'Your Boss is solid — watches your back against rivals and actually means it.', cue: 'Play it fiercely loyal to your Boss specifically, defending them even when it costs you.' },
      { t: 'Quietly Plotting Against You', d: 'Your Boss sees your rise as a threat and is already working an angle to cut you down.', cue: 'Play it outwardly deferential to your Boss and privately building a plan B.' },
    ],
  },
  {
    id: 'fixerType', title: 'What Kind of Fixer Are You?', eyebrow: 'Fixer Type', roleGate: 'Fixer',
    sub: 'Every Fixer moves something between people who need it and people who have it. This is your specific angle.',
    options: [
      { t: 'Gang Broker', d: 'You negotiate deals between rival gangs — gray-zone work nobody else survives brokering twice.', cue: 'Play it neutral by necessity, careful never to visibly favor one side over another.' },
      { t: 'Rare Goods Procurer', d: 'You source hard-to-find items for a small, particular, well-paying clientele.', cue: 'Play it quietly proud of your sourcing network, dropping hints about it without ever naming names.' },
      { t: 'Talent Agent', d: 'You broker Solo and Tech services as their agent, taking a cut off every placement you land.', cue: 'Play it constantly evaluating people’s skills, like you’re always building a mental roster.' },
      { t: 'Night Market Supplier', d: 'You keep everyday goods moving into the Night Markets — food, medicine, the unglamorous necessities.', cue: 'Play it logistically minded, thinking in inventory and supply lines even in casual conversation.' },
      { t: 'Black Market Runner', d: 'You move the genuinely illegal stuff — street drugs, milspec hardware, things that get people killed.', cue: 'Play it carefully compartmentalized — you never know more about a deal than you need to.' },
      { t: 'Parts Broker', d: 'You supply Techs and Medtechs with the parts and medical supplies they can’t get through normal channels.', cue: 'Play it fluent in technical jargon you learned secondhand from your clients.' },
      { t: 'Market Operator', d: 'You run the day-to-day of several Night Markets without owning a piece of any of them.', cue: 'Play it constantly working the room, greeting half the vendors by name.' },
      { t: 'Heavy Equipment Broker', d: 'You arrange use contracts for military vehicles, aircraft, and heavy machinery.', cue: 'Play it name-dropping specs and capabilities like other people talk about the weather.' },
      { t: 'Scavenger Fence', d: 'You move goods for scavenger crews raiding Corps and Combat Zones, no questions asked about where it came from.', cue: 'Play it incurious on purpose — you’ve trained yourself not to ask the obvious follow-up.' },
      { t: 'Exclusive Agent', d: 'You work solely for one Media personality, Rockerboy, or Nomad Pack, and your fortunes rise and fall with theirs.', cue: 'Play it fiercely protective of your one client’s interests, sometimes past the point of your own.' },
    ],
  },
  {
    id: 'fixerPartner', title: 'Got a Partner, or Work Alone?', eyebrow: 'Partner', roleGate: 'Fixer',
    sub: "Some Fixers split the risk and the take. Some don't trust anyone enough to.",
    options: [
      { t: 'Got a Partner', d: "Someone shares the risk and the take with you, and covers you when a deal goes sideways.", cue: 'Play it reflexively checking in with your partner before committing to anything major.' },
      { t: 'Work Alone', d: "Nobody to split the take with — and nobody to watch your back when a deal goes bad, either.", cue: "Play it self-reliant to a fault, uncomfortable delegating even small parts of a job." },
    ],
  },
  {
    id: 'fixerOffice', title: 'What’s Your "Office" Like?', eyebrow: 'Office', roleGate: 'Fixer',
    sub: "Every Fixer needs somewhere to work out of, even if 'somewhere' changes by the week.",
    options: [
      { t: 'No Fixed Office', d: 'You stay mobile on purpose — nowhere to raid, nowhere to stake out.', cue: 'Play it restless about staying anywhere too long, even in casual social settings.' },
      { t: 'A Bar Booth', d: 'A specific table at a specific bar is basically yours, and everyone who matters knows it.', cue: 'Play it territorial about your booth, mildly irritated if someone else is sitting in it.' },
      { t: 'Dead Drops Only', d: 'Data Pool messages and anonymous drops — you avoid face-to-face whenever you can manage it.', cue: 'Play it visibly uncomfortable in unavoidable in-person meetings.' },
      { t: 'A Spare Room', d: 'Tucked into a warehouse, shop, or clinic that officially does something else entirely.', cue: 'Play it protective of the cover business, careful not to let the two worlds visibly overlap.' },
      { t: 'An Abandoned Building', d: 'Otherwise empty, which suits you and your clientele just fine.', cue: 'Play it unbothered by squalor that would put most people off — it’s just the office to you.' },
      { t: 'A Cube Hotel Lobby', d: 'You basically live in the lobby, and the staff have stopped asking questions.', cue: 'Play it on a first-name basis with hotel staff, security, and half the regulars.' },
    ],
  },
  {
    id: 'fixerClients', title: 'Who Are Your Side Clients?', eyebrow: 'Side Clients', roleGate: 'Fixer',
    sub: 'Beyond the main hustle, there’s a regular crowd that keeps coming back to you specifically.',
    options: [
      { t: 'Rockerboys & Medias', d: 'They use you to land gigs, contacts, and the occasional favor nobody else can pull off.', cue: 'Play it a little starstruck underneath the professionalism, even after all this time.' },
      { t: 'Local Gangers', d: 'They protect your work and your home turf in exchange for what you can get them.', cue: 'Play it comfortable in gang spaces most people would find genuinely dangerous.' },
      { t: 'Corporate Execs', d: 'They use you for black-project procurement they can’t put on any official books.', cue: 'Play it deliberately vague about corporate clients, even to people you otherwise trust.' },
      { t: 'Solos & Combat Types', d: 'They use you to find work and make contacts they can’t reach on their own.', cue: 'Play it quick to assess anyone’s combat capability out of old professional habit.' },
      { t: 'Nomads & Fellow Fixers', d: 'They use you to broker transactions and deals across territory you know better than they do.', cue: 'Play it collegial and competitive with other Fixers in equal measure.' },
      { t: 'Politicos & Execs', d: 'They depend on you for information more than goods — you know things before the news does.', cue: 'Play it careful about what you reveal you know, and when.' },
    ],
  },
  {
    id: 'fixerThreat', title: "Who's Gunning for You?", eyebrow: 'Fixer Threat', roleGate: 'Fixer',
    sub: "Moving between that many people and that much product, someone's eventually going to have a problem with you.",
    options: [
      { t: 'Territorial Gangers', d: 'A Combat Zone gang wants you working exclusively for them, and they’re not asking nicely twice.', cue: 'Play it evasive about your schedule and movements in gang territory.' },
      { t: 'Rival Fixers', d: 'Someone’s actively working to poach your client list out from under you.', cue: 'Play it protective of client relationships, name-dropping loyalty when it’s useful.' },
      { t: 'Controlling Execs', d: 'A Corporation wants you on retainer, exclusively, whether that’s actually your choice or not.', cue: 'Play it wary of any offer that sounds a little too generous to be optional.' },
      { t: 'Loose-End Cleanup', d: 'An enemy of a former client wants you gone before you can talk about what you saw.', cue: 'Play it watchful in a way that seems paranoid until someone learns why.' },
      { t: 'A Burned Client', d: 'Someone thinks you screwed them over on a deal, and they’ve never let it go.', cue: 'Play it tense whenever that specific deal or client comes up, even in passing.' },
      { t: 'A Resource Rival', d: 'A rival Fixer is actively trying to outmaneuver you for the same parts and supplies.', cue: 'Play it competitive and quietly territorial about your supply lines.' },
    ],
  },
  {
    id: 'lawmanPosition', title: 'What Is Your Position on the Force?', eyebrow: 'Position', roleGate: 'Lawman',
    sub: 'Every badge does a different job. This is the specific work that made you who you are.',
    options: [
      { t: 'Guard', d: 'Static posts and checkpoints — unglamorous, but you know exactly what’s supposed to be where.', cue: 'Play it procedural and detail-obsessed about anything out of place.' },
      { t: 'Standard Beat or Patrol', d: 'A regular route, on foot or in a car — you’re the public face of the badge for a whole neighborhood.', cue: 'Play it recognizably friendly to locals, on a first-name basis with half the block.' },
      { t: 'Criminal Investigation', d: 'Building cases, following leads, the slow paperwork side of catching people who don’t want to be caught.', cue: 'Play it patient and detail-fixated, noticing inconsistencies in casual conversation.' },
      { t: 'Special Weapons and Tactics', d: 'The breach team — you’re called in after talking has already failed.', cue: 'Play it economical with words and hyper-aware of entry points in any room.' },
      { t: 'Motor Patrol', d: 'Highways and vehicle pursuit — more road than street, longer shifts, longer sightlines.', cue: 'Play it restless indoors, more comfortable behind a wheel than on foot.' },
      { t: 'Internal Affairs', d: 'You investigate your own, which makes you nobody’s favorite face in the building.', cue: 'Play it isolated among other Lawmen, used to being watched more than trusted.' },
    ],
  },
  {
    id: 'lawmanJurisdiction', title: "How Wide Is Your Group's Jurisdiction?", eyebrow: 'Jurisdiction', roleGate: 'Lawman',
    sub: 'Where you actually have authority shapes what kind of trouble finds you.',
    options: [
      { t: 'Corporate Zones', d: 'You police the people who technically outrank you, and everyone involved knows it.', cue: 'Play it deferential to corporate authority in a way that occasionally makes your own job harder.' },
      { t: 'Standard City Patrol Zone', d: 'Ordinary neighborhoods, ordinary problems — the baseline of the job most people imagine.', cue: 'Play it steady and unshaken by the routine chaos of an average shift.' },
      { t: 'Combat Zones', d: 'The parts of the city everyone else has given up on. You didn’t.', cue: 'Play it grimly unsurprised by anything, no matter how bad it gets.' },
      { t: 'Outer City', d: 'The sprawl past where anyone official really wants to patrol.', cue: 'Play it self-reliant — backup is a long way off out here, and you know it.' },
      { t: 'Recovery Zones', d: 'Areas still being rebuilt, where patrol work tangles constantly with reconstruction politics.', cue: 'Play it caught between enforcing the law and protecting people trying to rebuild their lives.' },
      { t: 'Open Highways', d: 'The roads between everywhere — long shifts, high speeds, and nobody around if it goes wrong.', cue: 'Play it hyper-alert to vehicles and traffic patterns, even off duty.' },
    ],
  },
  {
    id: 'lawmanCorruption', title: 'How Corrupt Is Your Group?', eyebrow: 'Corruption', roleGate: 'Lawman',
    sub: 'Not every badge means the same thing. This is what yours actually stands for, day to day.',
    options: [
      { t: 'Genuinely Clean', d: 'Fair, honest policing with real ethical standards behind it — and you’re proud of that.', cue: 'Play it a little defensive when people assume every cop is dirty.' },
      { t: 'Fair but Hard', d: 'Honest policing, but no mercy once someone’s crossed the line.', cue: 'Play it rigid about consequences, even for minor infractions.' },
      { t: 'Mostly Clean', d: 'Slips into something unethical occasionally, but it’s rare enough to still be the exception.', cue: 'Play it uncomfortable when those rare slips come up in conversation.' },
      { t: 'Rule-Bender', d: 'Willing to bend any rule necessary to get the bad guys, paperwork be damned.', cue: 'Play it pragmatic about procedure — results matter more than the method.' },
      { t: 'Ruthless', d: 'Determined to control the street, even if that means breaking the same laws you enforce.', cue: 'Play it coldly practical about tactics that would trouble most people.' },
      { t: 'Totally Corrupt', d: 'Bribes, illegal business, unethical work — routine, and barely worth commenting on anymore.', cue: 'Play it unbothered by corruption that should probably still bother you.' },
    ],
  },
  {
    id: 'lawmanThreat', title: "Who's Gunning for Your Group?", eyebrow: 'Lawman Threat', roleGate: 'Lawman',
    sub: 'Wearing the badge makes you a target for a specific kind of enemy.',
    options: [
      { t: 'Organized Crime', d: 'A crime family considers your unit a standing problem, and they play the long game.', cue: 'Play it careful about who you trust with your schedule and movements.' },
      { t: 'Boostergangs', d: 'A gang has your unit on their list, loud and immediate about it.', cue: 'Play it tactically alert in gang territory, more than the situation always requires.' },
      { t: 'A Police Accountability Group', d: 'Activists and watchdogs are building a case against your unit specifically.', cue: 'Play it self-conscious about how your actions will look after the fact.' },
      { t: 'Dirty Politicians', d: 'Someone with political power wants your unit’s investigations to quietly stop.', cue: 'Play it wary of anyone in office being unusually friendly to you.' },
      { t: 'Smugglers', d: 'A smuggling operation has decided your unit is bad for business and worth removing.', cue: 'Play it suspicious of unmarked vehicles and cargo more than most people would be.' },
      { t: 'Street Criminals', d: 'Plain street-level crime has it out for you personally, not just the badge.', cue: 'Play it recognizable and a little exposed walking through certain blocks off duty.' },
    ],
  },
  {
    id: 'lawmanTarget', title: "Who Is Your Group's Major Target?", eyebrow: 'Major Target', roleGate: 'Lawman',
    sub: 'Every unit has a white whale — the thing you’re actually building your career around taking down.',
    options: [
      { t: 'Organized Crime', d: 'Your unit has been building a case against a crime family for longer than you’ve been on it.', cue: 'Play it fixated on this one investigation, bringing it up more than strictly necessary.' },
      { t: 'Boostergangs', d: 'You’ve made gang suppression your unit’s whole reason for being.', cue: 'Play it able to rattle off gang names, colors, and turf lines like a second language.' },
      { t: 'Drug Runners', d: 'You’re working the supply chains, trying to choke off product before it hits the street.', cue: 'Play it clinically knowledgeable about drugs and their effects, purely from the job.' },
      { t: 'Dirty Politicians', d: 'You’re after corruption in office, which makes your job more dangerous than most people realize.', cue: 'Play it cynical about anyone with real political power, on principle.' },
      { t: 'Smugglers', d: 'You track what’s moving in and out of the city that shouldn’t be.', cue: 'Play it detail-obsessed about logistics, routes, and shipping patterns.' },
      { t: 'Street Crime', d: 'You focus on the everyday crime that actually touches most people’s lives.', cue: 'Play it grounded and community-focused, more invested in the neighborhood than the headlines.' },
    ],
  },
  {
    id: 'mediaType', title: 'What Kind of Media Are You?', eyebrow: 'Media Type', roleGate: 'Media',
    sub: 'Every Media chases the truth in a different format. This is yours.',
    options: [
      { t: 'Blogger', d: 'Independent and unfiltered — you run on volume and speed, publishing before the story’s even finished happening.', cue: 'Play it constantly half-distracted, already drafting the next post in your head.' },
      { t: 'Writer (Books)', d: 'Long-form and deliberate — built to outlast a single news cycle by design.', cue: 'Play it patient and a little dismissive of stories that don’t have room to breathe.' },
      { t: 'Videographer', d: 'Visuals do the talking — edited footage is your real voice, more than anything you say out loud.', cue: 'Play it constantly framing the room, mentally shot-listing conversations as they happen.' },
      { t: 'Documentarian', d: 'Long-form investigation packaged as story — months per project, depth over speed.', cue: 'Play it slow to commit to an opinion out loud until you’ve fully worked the angle.' },
      { t: 'Investigative Reporter', d: 'You chase the story other people would rather stayed buried, however long it takes.', cue: 'Play it unable to let a loose thread go, even in conversations that have nothing to do with work.' },
      { t: 'Street Scribe', d: 'You write for and about the street itself, passed hand to hand as much as it’s ever posted online.', cue: 'Play it fluent in whatever the block is actually talking about, before it’s anywhere else.' },
    ],
  },
  {
    id: 'mediaReach', title: 'How Does Your Work Reach the Public?', eyebrow: 'Media Reach', roleGate: 'Media',
    sub: 'The format you publish through shapes who actually sees what you make.',
    options: [
      { t: 'Monthly Magazine', d: 'A print or data publication people actually wait for, issue to issue.', cue: 'Play it deadline-driven, thinking in monthly cycles even about unrelated plans.' },
      { t: 'Blog', d: 'Self-published, self-controlled, and immediate — nobody between you and the post button.', cue: 'Play it a little defensive about editorial independence, even when nobody’s challenged it.' },
      { t: 'Mainstream Vid Feed', d: 'A real channel slot with real production behind it, and real oversight that comes with that.', cue: 'Play it camera-aware, subtly performing even in unrecorded conversation.' },
      { t: 'News Channel', d: 'A formal broadcast outlet, with the structure, editors, and institutional weight that implies.', cue: 'Play it careful with wording, like everything you say might get quoted.' },
      { t: '"Book" Sales', d: 'Physical or data-slab copies people actually buy and keep — a rarer kind of staying power.', cue: 'Play it a little precious about your published work, protective of it in conversation.' },
      { t: 'Screamsheets', d: 'Cheap, disposable street-level print that somehow everyone still reads.', cue: 'Play it street-fluent and unpretentious about the medium — you know exactly who reads this and why.' },
    ],
  },
  {
    id: 'mediaEthics', title: 'How Ethical Are You?', eyebrow: 'Media Ethics', roleGate: 'Media',
    sub: 'Not every byline means the same thing. This is what yours actually stands for.',
    options: [
      { t: 'Verified Truth Only', d: 'Fair, honest, strict standards — you only report what you can actually prove.', cue: 'Play it a little rigid about sourcing, even in casual conversation.' },
      { t: 'Honest but Loose', d: 'Fair reporting, but you’ll run on rumor and hearsay when it’s all you’ve got.', cue: 'Play it quick to caveat a claim with "allegedly," out of old habit.' },
      { t: 'Mostly Clean', d: 'You slip occasionally, but rarely enough that it still counts as having standards.', cue: 'Play it uncomfortable when those rare slips come up.' },
      { t: 'Rule-Bender for the Right Reasons', d: 'Willing to bend the rules, but only against people who’ve genuinely got it coming.', cue: 'Play it self-righteous about the ends justifying the means, at least in this one area.' },
      { t: 'Muckraker', d: 'Ruthless and determined to make it big, even if that means breaking the law to get the story.', cue: 'Play it visibly hungry for the next big scoop, past the point that’s comfortable to watch.' },
      { t: 'Pen for Hire', d: 'Totally corrupt — bribable, and your reporting goes to whoever pays the most.', cue: 'Play it transactional about the truth itself, and mildly annoyed when people expect otherwise.' },
    ],
  },
  {
    id: 'mediaStories', title: 'What Types of Stories Do You Want to Tell?', eyebrow: 'Media Focus', roleGate: 'Media',
    sub: 'Every Media has a beat — the kind of story they keep coming back to.',
    options: [
      { t: 'Political Intrigue', d: 'You chase power plays, backroom deals, and the people who think nobody’s watching.', cue: 'Play it cynical about anyone in office, reflexively.' },
      { t: 'Ecological Impact', d: 'You cover what the War and the Corps did to the world itself, and who’s still doing it.', cue: 'Play it quietly angry about environmental damage most people have stopped noticing.' },
      { t: 'Celebrity News', d: 'You track the famous and the infamous, and you know which lines they don’t want crossed.', cue: 'Play it fluent in who’s who, dropping names like it’s nothing.' },
      { t: 'Corporate Takedowns', d: 'You build cases against Corporations that think they’re untouchable.', cue: 'Play it methodical and patient, building a story like a legal case.' },
      { t: 'Editorials', d: 'You write opinion, not just fact — your byline comes with a point of view people expect.', cue: 'Play it opinionated by default, quick to state a position even off the clock.' },
      { t: 'Propaganda', d: 'You write what someone needs people to believe, and you’re very good at making it land.', cue: 'Play it persuasive in ordinary conversation, almost without trying.' },
    ],
  },
  {
    id: 'medtechType', title: 'What Kind of Medtech Are You?', eyebrow: 'Medtech Type', roleGate: 'Medtech',
    sub: 'Every Medtech patches people up in a different way. This is your specialty.',
    options: [
      { t: 'Surgeon', d: 'You open people up and put them back together, cyberware and all, with a steady hand and no hesitation.', cue: 'Play it clinically calm in situations that would panic almost anyone else.' },
      { t: 'General Practitioner', d: 'You handle the everyday stuff — checkups, minor injuries, the unglamorous baseline of keeping people alive.', cue: 'Play it warmly bedside, the kind of doctor people actually trust with small worries.' },
      { t: 'Trauma Medic', d: 'You work the worst moment of someone’s day, stabilizing what you can before it’s too late.', cue: 'Play it fast and decisive under pressure, impatient with hesitation in a crisis.' },
      { t: 'Psychiatrist', d: 'You treat the mind, not the body — which in this city is its own kind of trauma work.', cue: 'Play it quietly reading people’s mental state in every conversation, on reflex.' },
      { t: 'Cyberpsycho Therapist', d: 'You work with people on the edge of losing themselves to their own chrome, before it’s too late.', cue: 'Play it watchful of anyone’s cyberware ratio, out of professional habit.' },
      { t: 'Ripperdoc', d: 'You install and maintain cyberware on the black market, no questions, no judgment, no real oversight.', cue: 'Play it unfazed by illegal or dangerous requests — you’ve heard worse.' },
      { t: 'Cryosystems Operator', d: 'You manage cryotanks and stasis systems, keeping people alive in the space between alive and dead.', cue: 'Play it precise and a little detached, thinking in exact numbers and timings.' },
      { t: 'Pharmacist', d: 'You synthesize and dispense what keeps people functional, numb, or alive, and you know exactly what everything does.', cue: 'Play it quietly encyclopedic about drug interactions, even in casual talk.' },
      { t: 'Bodysculptor', d: 'You reshape people’s bodies by choice, not necessity — cosmetic work that still requires real surgical skill.', cue: 'Play it aesthetically opinionated, evaluating people’s appearance like a professional.' },
      { t: 'Forensic Pathologist', d: 'You read bodies after the fact, telling the story of what happened to someone who can’t tell it themselves.', cue: 'Play it unnervingly matter-of-fact about death and injury in conversation.' },
    ],
  },
  {
    id: 'medtechPartner', title: 'Got a Partner, or Work Alone?', eyebrow: 'Partner', roleGate: 'Medtech',
    sub: "Some Medtechs work a table with someone else's hands helping. Some don't trust anyone else's hands at all.",
    options: [
      { t: 'Work Alone', d: 'Nobody else’s hands in the work — which means nobody to blame, and nobody to help, when it goes wrong.', cue: 'Play it uncomfortable delegating even simple parts of a procedure.' },
      { t: 'Got a Partner', d: 'Someone else scrubs in with you, every time — a second set of hands you trust completely.', cue: 'Play it reflexively coordinating with your partner, even in conversations that have nothing to do with work.' },
    ],
  },
  {
    id: 'medtechWorkspace', title: "What's Your Workspace Like?", eyebrow: 'Workspace', roleGate: 'Medtech',
    sub: 'Where you actually do the work says a lot about how the work gets done.',
    options: [
      { t: 'Sterilized Like Clockwork', d: 'Cleaned every single morning, without fail, no matter what happened the night before.', cue: 'Play it slightly compulsive about cleanliness, even outside the workspace.' },
      { t: 'Comfortably Outdated', d: 'Not state-of-the-art anymore, but it’s yours, and you know exactly where everything is.', cue: 'Play it stubbornly attached to old equipment that still gets the job done.' },
      { t: 'Dual-Purpose Cryo', d: 'Your cryo equipment doubles as a drink cooler when it’s not saving a life.', cue: 'Play it casually irreverent about equipment other Medtechs treat with more reverence.' },
      { t: 'Compact and Disposable', d: 'Everything single-use, stored compacted, ready to deploy and just as ready to vanish.', cue: 'Play it efficient and minimalist, uncomfortable with clutter or excess.' },
      { t: 'Rougher Than Patients Expect', d: 'Not as clean as most people hoped, walking in — but you get results anyway.', cue: 'Play it unbothered by a patient’s visible nerves about the setting.' },
      { t: 'Meticulously Organized', d: 'Sharpened, sterilized, and arranged with real precision — everything exactly where it should be.', cue: 'Play it quietly irritated when someone disturbs your setup.' },
    ],
  },
  {
    id: 'medtechClients', title: 'Who Are Your Main Clients?', eyebrow: 'Clients', roleGate: 'Medtech',
    sub: 'Most Medtechs have a regular pipeline of who actually ends up on the table.',
    options: [
      { t: 'Fixer Referrals', d: 'Local Fixers send clients your way, and take their cut for the introduction.', cue: 'Play it professionally friendly with the Fixers who keep your table full.' },
      { t: 'Local Gangers', d: 'A gang protects your work area or home in exchange for medical help when they need it.', cue: 'Play it calm and unbothered in gang spaces most people would find tense.' },
      { t: 'Corporate Black-Project Work', d: 'Execs bring you medical work they can’t put through official channels.', cue: 'Play it deliberately incurious about the corporate politics behind a job.' },
      { t: 'Solos & Combat Types', d: 'Fighters and mercs come to you for patch-ups they’d rather not explain at a hospital.', cue: 'Play it unfazed by combat trauma most doctors would find alarming.' },
      { t: 'Nomads & Fixers', d: 'Nomad packs and Fixers bring you their wounded, trusting you over anywhere official.', cue: 'Play it warmly familiar with a specific Nomad pack or crew.' },
      { t: 'Trauma Team Contract', d: 'You do paramedical work under a Trauma Team contract — high stakes, high pay, strict protocol.', cue: 'Play it procedural and protocol-driven, even off the clock.' },
    ],
  },
  {
    id: 'medtechSupplies', title: 'Where Do You Get Your Supplies?', eyebrow: 'Supplies', roleGate: 'Medtech',
    sub: 'Medical supplies aren’t always easy to come by legally. This is how you actually keep stocked.',
    options: [
      { t: 'Scavenged Stashes', d: 'You scavenge medical supplies out of abandoned City Zones, whatever you can find.', cue: 'Play it resourceful and a little magpie-like about spotting useful salvage.' },
      { t: 'Battlefield Stripping', d: 'You strip parts and supplies from bodies after firefights — grim, but it keeps you stocked.', cue: 'Play it unsentimental about where your supplies actually came from.' },
      { t: 'Fixer Trade', d: 'A local Fixer keeps you supplied in exchange for medical work on their people.', cue: 'Play it transactional but reliable with your Fixer contact.' },
      { t: 'Corporate/Trauma Team Supply', d: 'Execs or a Trauma Team contract keep you stocked in exchange for your services.', cue: 'Play it aware of exactly how replaceable that supply chain makes you.' },
      { t: 'A Warehouse Backdoor', d: 'You’ve got an unofficial way into a Corporate or hospital supply warehouse.', cue: 'Play it cagey about exactly how that access works, even with people you trust.' },
      { t: 'Night Market Deals', d: 'You hit the Night Markets and score whatever deals you can find, week to week.', cue: 'Play it always browsing, even off duty — you never really stop shopping for supplies.' },
    ],
  },
  {
    id: 'netrunnerType', title: 'What Kind of Runner Are You?', eyebrow: 'Runner Type', roleGate: 'Netrunner',
    sub: 'Every Netrunner has a reason they jack in. This is yours.',
    options: [
      { t: 'Freelance Hacker', d: "You hack for hire — whoever pays gets the job, no questions about their reasons.", cue: 'Play it transactional about the work, careful never to get personally invested in a client’s cause.' },
      { t: 'Corporate Clone Runner', d: 'You hack for the Corp that owns your contract, one indistinguishable cog among many.', cue: 'Play it institutionally cautious, watching what you say even in casual company.' },
      { t: 'Hacktivist', d: 'You crack systems specifically to expose the people who thought they were untouchable.', cue: 'Play it principled about targets, refusing jobs that don’t serve the cause.' },
      { t: 'Thrill Cracker', d: 'You crack systems purely for the challenge — the money and the cause are both secondary to the puzzle.', cue: 'Play it visibly more excited by a hard system than by the payout.' },
      { t: 'Team Freelancer', d: 'You run as part of a regular crew, splitting jobs and covering each other’s blind spots.', cue: 'Play it reflexively coordinating with absent crewmates, even on solo jobs.' },
      { t: 'Retained Specialist', d: 'You hack on call for a Media, politico, or Lawman who brings you in exactly when they need you.', cue: 'Play it discreet about your retainer, careful not to name who actually signs your checks.' },
    ],
  },
  {
    id: 'netrunnerPartner', title: 'Got a Partner, or Work Alone?', eyebrow: 'Partner', roleGate: 'Netrunner',
    sub: 'Running the NET alone means nobody watching your meat while your mind’s somewhere else. Running with a partner means trusting them with your body while you’re gone.',
    options: [
      { t: 'Work Alone', d: 'Nobody watches your body while you’re jacked in — which means nobody’s there if something goes wrong on either side.', cue: 'Play it paranoid about your physical surroundings before you ever jack in.' },
      { t: 'Got a Partner', d: 'Someone guards your body while your mind’s in the Architecture, and you trust them completely to do it.', cue: 'Play it noticeably calmer jacking in when your partner’s actually present.' },
    ],
  },
  {
    id: 'netrunnerClients', title: 'Who Are Some of Your Other Clients?', eyebrow: 'Other Clients', roleGate: 'Netrunner',
    sub: 'Beyond the main gig, there’s a regular crowd that keeps hiring you specifically.',
    options: [
      { t: 'Fixer Referrals', d: 'Local Fixers send clients your way and take a cut for the introduction.', cue: 'Play it professionally cordial with the Fixers who keep you working.' },
      { t: 'Ganger Protection Trade', d: 'A gang protects your workspace while you sweep for NET threats, in exchange for your services.', cue: 'Play it calm in gang spaces most people would find tense.' },
      { t: 'Corporate Black-Project Work', d: 'Execs bring you work they can’t put through official channels.', cue: 'Play it deliberately incurious about the politics behind a corporate job.' },
      { t: 'Solo Security Contracts', d: 'Solos and other combat types hire you to keep their personal systems secure.', cue: 'Play it a little protective of clients whose lives genuinely depend on your work.' },
      { t: 'Nomad & Fixer Family Systems', d: 'You keep Nomad and Fixer family networks secure, trusted with more than most outsiders ever get.', cue: 'Play it warmly loyal to a specific family or crew’s systems.' },
      { t: 'Freelance Data Broker', d: 'You work for yourself, selling whatever data you can find on the open NET.', cue: 'Play it constantly evaluating information for resale value, even in casual conversation.' },
    ],
  },
  {
    id: 'netrunnerPrograms', title: 'Where Do You Get Your Programs?', eyebrow: 'Programs', roleGate: 'Netrunner',
    sub: 'Good software is hard to come by legally. This is how you actually stay equipped.',
    options: [
      { t: 'Abandoned Zone Digging', d: 'You dig through old abandoned City Zones for forgotten software caches.', cue: 'Play it resourceful and a little obsessive about digital archaeology.' },
      { t: 'Brain-Burn Looting', d: 'You steal programs from other Netrunners you’ve brain-burned — grim, but it works.', cue: 'Play it coldly practical about where your software actually came from.' },
      { t: 'Fixer Supply Trade', d: 'A local Fixer supplies you with programs in exchange for hack work.', cue: 'Play it transactional but reliable with your Fixer contact.' },
      { t: 'Corporate Supply Trade', d: 'Execs supply you with programs in exchange for your services.', cue: 'Play it aware of exactly how replaceable that arrangement makes you.' },
      { t: 'Warehouse Backdoors', d: 'You’ve got unofficial access into a few Corporate warehouses.', cue: 'Play it cagey about exactly how that access works, even with people you trust.' },
      { t: 'Night Market Deals', d: 'You hit the Night Markets and score programs whenever you can find them.', cue: 'Play it always browsing, even off the clock.' },
    ],
  },
  {
    id: 'netrunnerThreat', title: "Who's Gunning for You?", eyebrow: 'Runner Threat', roleGate: 'Netrunner',
    sub: 'Cracking systems for a living means someone, somewhere, wants you off the NET permanently.',
    options: [
      { t: 'Something in the NET', d: 'You think it might be a rogue AI or a NET Ghost. Either way, it’s bad news, and it knows your handle.', cue: 'Play it visibly uneasy jacking into unfamiliar Architecture.' },
      { t: 'Rival Netrunners', d: 'Other Runners just don’t like you, and they’re not shy about making that a problem.', cue: 'Play it competitive and a little paranoid about other Runners in a room.' },
      { t: 'Controlling Corporates', d: 'A Corporation wants you working for them exclusively, whether or not that’s actually your choice.', cue: 'Play it wary of offers that sound a little too generous to be optional.' },
      { t: 'Black Hat Hunters', d: 'Lawmen consider you an illegal black hat and are actively building a case to bust you.', cue: 'Play it careful about digital footprint, even in conversations that have nothing to do with work.' },
      { t: 'A Burned Client', d: 'An old client thinks you screwed them over, and they’ve never let it go.', cue: 'Play it tense whenever that specific job or client comes up.' },
      { t: 'A Possessive Client', d: 'A Fixer or other client wants your services exclusively, and doesn’t take no gracefully.', cue: 'Play it cautious about how much freedom you actually have to turn down work.' },
    ],
  },
  {
    id: 'nomadPackSize', title: 'How Big Is Your Pack?', eyebrow: 'Pack Size', roleGate: 'Nomad',
    sub: 'Every Pack is family, but the scale of that family changes everything about how it operates.',
    options: [
      { t: 'A Single Extended Tribe', d: 'One close-knit extended family, small enough that everyone genuinely knows everyone.', cue: 'Play it intensely personal about Pack matters — nothing about the family is abstract to you.' },
      { t: 'A Couple Dozen', d: 'Small and tight, a scale where reputation inside the Pack still spreads by word of mouth alone.', cue: 'Play it familiar and informal, even about Pack business.' },
      { t: 'Forty or Fifty', d: 'Big enough now that the Pack needs real structure and roles to function.', cue: 'Play it aware of your specific place in a hierarchy, even a loose one.' },
      { t: 'A Hundred or More', d: 'A genuine rolling community, not just a convoy anymore.', cue: 'Play it a little formal about Pack protocol — there are too many people now for pure improvisation.' },
      { t: 'A Blood Family', d: 'Hundreds strong — a real institution with its own history, reputation, and weight on The Street.', cue: 'Play it proud of the Family name, dropping it like it should mean something to whoever’s listening.' },
      { t: 'An Affiliated Family', d: 'Several Blood Families bound together — massive, political, and complicated in ways smaller Packs never have to worry about.', cue: 'Play it politically minded about inter-Family relationships, even in casual conversation.' },
    ],
  },
  {
    id: 'nomadDomain', title: "Is Your Pack Based on Land, Air, or Sea?", eyebrow: 'Domain', roleGate: 'Nomad',
    sub: 'Not every Pack rides the highway. Where your family actually operates shapes everything about how you move.',
    options: [
      { t: 'Land', d: 'The classic highway convoy — trucks, vans, bikes, and the open road between safe zones.', cue: 'Play it restless indoors, most at ease with a road stretching out ahead of you.' },
      { t: 'Air', d: 'Your Pack keeps the Deltajock supply lines open, running sky routes to the Orbital Highriders and beyond.', cue: 'Play it casually unbothered by heights and altitude that would unsettle most people.' },
      { t: 'Sea', d: 'Your Pack runs the container-ship convoys that keep coastal trade moving.', cue: 'Play it comfortable with open water and unstable footing in a way landlocked people notice.' },
    ],
  },
  {
    id: 'nomadJob', title: 'What Do You Do for Your Pack?', eyebrow: 'Pack Role', roleGate: 'Nomad',
    sub: 'Every member of the Pack pulls their weight somehow. This is yours.',
    options: [
      { t: 'Scout', d: 'You negotiate and scout ahead — the Pack’s first contact with anyone new.', cue: 'Play it socially fluent and quick to read a stranger’s intentions.' },
      { t: 'Outrider', d: 'You handle protection and weapons — the Pack’s answer when the road gets dangerous.', cue: 'Play it constantly scanning terrain and sightlines, even off duty.' },
      { t: 'Transport Pilot/Driver', d: 'You drive or pilot, keeping the Pack’s vehicles moving safely between stops.', cue: 'Play it deeply attached to whatever you drive, treating it like a member of the family.' },
      { t: 'Loadmaster', d: 'You move large cargo — the trucker keeping the Pack’s freight business running.', cue: 'Play it practical and logistics-minded, thinking in weight and cargo space.' },
      { t: 'Solo Smuggler', d: 'You run solo smuggling jobs the rest of the Pack doesn’t need to know the details of.', cue: 'Play it comfortable operating alone, even though you’d never say the Pack doesn’t have your back.' },
      { t: 'Procurement', d: 'You source fuel, vehicles, and parts — keeping the Pack supplied and running.', cue: 'Play it always working an angle on where to get something the Pack needs, cheaper or faster.' },
    ],
  },
  {
    id: 'nomadPhilosophy', title: "What's Your Pack's Overall Philosophy?", eyebrow: 'Pack Philosophy', roleGate: 'Nomad',
    sub: 'Not every Pack operates the same way. This is what yours actually stands for.',
    options: [
      { t: 'Genuinely Good', d: 'Your Pack works for good, accepts outsiders, and just wants to get along with the world.', cue: 'Play it warmly open to strangers, more trusting than most Nomads bother to be.' },
      { t: 'Family Business', d: 'Fair and honest, run like a family concern — a Pack that keeps its word.', cue: 'Play it straightforward in dealings, treating your word as a real commitment.' },
      { t: 'Mostly Clean', d: 'Slips into something unethical occasionally, but rare enough that it still counts as standards.', cue: 'Play it uncomfortable when those rare slips come up.' },
      { t: 'Rule-Bender', d: 'Willing to bend any rule that gets in the way of what the Pack actually needs.', cue: 'Play it pragmatic about the Pack’s survival over outside notions of fairness.' },
      { t: 'Ruthless', d: 'Self-centered and willing to do real harm if it gets the Pack ahead.', cue: 'Play it coldly practical about anything that isn’t Pack business.' },
      { t: 'Highway Terror', d: 'Your Pack rages up and down the highways — killing, looting, and terrorizing whoever’s in the way.', cue: 'Play it unbothered by a reputation that makes most people afraid of your Pack’s colors.' },
    ],
  },
  {
    id: 'nomadThreat', title: "Who's Gunning for Your Pack?", eyebrow: 'Pack Threat', roleGate: 'Nomad',
    sub: 'Life on the road means someone, somewhere, has a problem with your Family.',
    options: [
      { t: 'Organized Crime', d: 'A crime family considers your Pack a standing problem on their territory.', cue: 'Play it careful about which roads and towns your Pack avoids, and why.' },
      { t: 'Boostergangs', d: 'A gang has decided your Pack is worth robbing or driving off.', cue: 'Play it tactically alert passing through gang-controlled stretches of road.' },
      { t: 'Drug Runners', d: 'A smuggling operation sees your routes as competition or opportunity.', cue: 'Play it suspicious of unfamiliar convoys sharing your route.' },
      { t: 'Dirty Politicians', d: 'Someone with political power wants your Pack’s activities shut down or controlled.', cue: 'Play it wary of checkpoints and officials more than most Nomads bother to be.' },
      { t: 'A Rival Pack', d: 'Another Pack in the same business sees you as competition worth eliminating.', cue: 'Play it competitive and territorial about routes and contracts.' },
      { t: 'Dirty Cops', d: 'Corrupt Lawmen shake down or harass your Pack whenever they get the chance.', cue: 'Play it resigned and quietly bitter about corrupt checkpoints.' },
    ],
  },
  {
    id: 'rockerboyType', title: 'What Kind of Rockerboy Are You?', eyebrow: 'Rockerboy Type', roleGate: 'Rockerboy',
    sub: 'Every Rockerboy has a medium. This is yours.',
    options: [
      { t: 'Musician', d: 'You write, play, and perform your own music, live and loud whenever you can manage it.', cue: 'Play it always half-composing, tapping out rhythms without noticing you’re doing it.' },
      { t: 'Slam Poet', d: 'Your words alone are the whole performance, no instrument between you and the crowd.', cue: 'Play it precise and rhythmic even in ordinary speech.' },
      { t: 'Street Artist', d: 'The city itself is your canvas — murals, tags, installations that say something before anyone reads a word.', cue: 'Play it constantly evaluating walls and surfaces as potential canvas.' },
      { t: 'Performance Artist', d: 'Your body and presence are the art — uncomfortable, provocative, hard to look away from.', cue: 'Play it unusually comfortable with silence and stillness other people find awkward.' },
      { t: 'Comedian', d: 'You make people laugh at exactly the things they’d rather not think about.', cue: 'Play it reflexively finding the joke in tense situations, sometimes at the worst moment.' },
      { t: 'Orator', d: 'You speak, and people listen — speeches, sermons, rallies, whatever the moment calls for.', cue: 'Play it naturally commanding a room’s attention just by starting to talk.' },
      { t: 'Politico', d: 'You organize and agitate, turning performance into actual political pressure.', cue: 'Play it strategic about every public appearance, thinking several moves ahead.' },
      { t: 'Rap Artist', d: 'Bars and flow are your weapon — sharp, fast, and built to spread.', cue: 'Play it quick with wordplay, almost compulsively, even in casual conversation.' },
      { t: 'DJ', d: 'You control a room’s energy through sound, reading a crowd in real time and feeding it back to them.', cue: 'Play it hyper-aware of a room’s mood, adjusting your own energy to match or shift it.' },
      { t: 'Idoru', d: 'You perform as a synthetic or heavily augmented persona — as much a construct as a person, by design.', cue: 'Play it deliberately blurring the line between your performance self and your private self.' },
    ],
  },
  {
    id: 'rockerboyAct', title: 'Are You in a Group, or a Solo Act?', eyebrow: 'Act', roleGate: 'Rockerboy',
    sub: 'Some Rockerboys share the stage. Some own it alone.',
    options: [
      { t: 'Group Act', d: 'You perform as part of a group, sharing both the spotlight and the risk.', cue: 'Play it reflexively covering for and defending your group, even outside performances.' },
      { t: 'Solo Act', d: 'It’s just you up there — full credit, full blame, full control.', cue: 'Play it uncomfortable sharing creative control, even in situations that call for it.' },
    ],
  },
  {
    id: 'rockerboyVenue', title: 'Where Do You Perform?', eyebrow: 'Venue', roleGate: 'Rockerboy',
    sub: 'Every scene has its rooms. This is where you actually built your name.',
    options: [
      { t: 'Alternative Cafes', d: 'Small, intimate spaces that reward substance over spectacle.', cue: 'Play it more comfortable in small, close crowds than big anonymous ones.' },
      { t: 'Private Clubs', d: 'Exclusive rooms with a curated crowd who already know who you are.', cue: 'Play it a little precious about who’s "worthy" of your performance.' },
      { t: 'Seedy Dive Bars', d: 'Rough rooms, rougher crowds, but audiences that tell you the unfiltered truth.', cue: 'Play it unbothered by hostile or indifferent crowds — you’ve won over worse.' },
      { t: 'Guerrilla Performances', d: 'Unpermitted, unannounced, wherever you can set up before someone shuts it down.', cue: 'Play it constantly scanning for exits and authority figures, even mid-performance.' },
      { t: 'Nightclubs Around the City', d: 'The circuit — bigger rooms, bigger crowds, a real reputation to maintain.', cue: 'Play it professionally polished, treating every set like it matters for your career.' },
      { t: 'On the Data Pool', d: 'Your stage is entirely digital — streamed, uploaded, and judged by numbers instead of a room’s energy.', cue: 'Play it a little detached from live crowd reactions, more attuned to how something will play back later.' },
    ],
  },
  {
    id: 'rockerboyThreat', title: "Who's Gunning for You or Your Group?", eyebrow: 'Rockerboy Threat', roleGate: 'Rockerboy',
    sub: 'Getting a following means getting enemies. This is yours.',
    options: [
      { t: 'A Wronged Former Member', d: 'An old group member thinks you did them dirty on the way up, and they’re not wrong to be angry.', cue: 'Play it evasive about the split whenever it comes up in interviews or conversation.' },
      { t: 'A Rival Act', d: 'A competing group or artist is actively trying to steal your market share.', cue: 'Play it competitive and a little petty about this one specific rival.' },
      { t: 'Corporate Enemies', d: 'A Corporation doesn’t like your message, and they have real resources to make that a problem.', cue: 'Play it defiant about the message, even when it would be safer to soften it.' },
      { t: 'A Hostile Critic', d: 'A critic or influencer has made tearing you down their whole personal brand.', cue: 'Play it visibly needled by this one specific critic, more than the stakes really justify.' },
      { t: 'A Threatened Elder Star', d: 'An older, established star feels threatened by your rising fame and is working to keep you down.', cue: 'Play it performatively respectful in public and privately dismissive of them.' },
      { t: 'A Personal Vendetta', d: 'A romantic interest or media figure wants revenge for something that was never really about the career.', cue: 'Play it guarded about your personal life whenever this specific person comes up.' },
    ],
  },
  {
    id: 'soloType', title: 'What Kind of Solo Are You?', eyebrow: 'Solo Type', roleGate: 'Solo',
    sub: 'Every Solo sells violence a little differently. This is your specialty.',
    options: [
      { t: 'Bodyguard', d: 'You protect people for a living — reactive work, standing between your client and whatever comes for them.', cue: 'Play it constantly positioning yourself between your client and any potential threat, without thinking about it.' },
      { t: 'Street Muscle for Hire', d: 'You provide intimidation and protection at the street level, no corporate polish required.', cue: 'Play it physically present in a room — you take up space on purpose.' },
      { t: 'Corporate Enforcer (Moonlighting)', d: 'You handle a Corp’s dirty work by day and take freelance jobs on the side.', cue: 'Play it compartmentalized about the two halves of your work, careful not to let them overlap.' },
      { t: 'Black Ops Agent', d: 'You handle deniable operations, corporate or freelance, that officially never happened.', cue: 'Play it deliberately vague about your actual employment history.' },
      { t: 'Vigilante for Hire', d: 'You take jobs that read as justice, even when they’re paid for like anything else.', cue: 'Play it self-righteous about your targets, even when the money is the real reason.' },
      { t: 'Assassin/Hitman', d: 'You take the job nobody else wants to be responsible for.', cue: 'Play it unnervingly calm discussing violence in the abstract.' },
    ],
  },
  {
    id: 'soloMorality', title: "What's Your Moral Compass Like?", eyebrow: 'Moral Compass', roleGate: 'Solo',
    sub: 'Everyone doing this job draws the line somewhere different. This is where yours actually falls.',
    options: [
      { t: 'Takes Out the Bad Guys', d: 'You genuinely work for good, choosing targets you believe actually deserve it.', cue: 'Play it selective about jobs, willing to walk away from money that doesn’t sit right.' },
      { t: 'Spares the Innocent', d: 'You’ll do the job, but the elderly, kids, and pets are always off the table, no exceptions.', cue: 'Play it visibly, immediately hostile toward anyone who threatens a bystander.' },
      { t: 'Mostly Clean', d: 'You slip into something unethical occasionally, but rare enough that it still counts as standards.', cue: 'Play it uncomfortable when those rare slips come up.' },
      { t: 'Ruthless for Profit', d: 'You work for anyone, any job, as long as the money’s right.', cue: 'Play it transactional about violence — it’s just the job, nothing personal.' },
      { t: 'Rule-Bender', d: 'You’ll bend the rules, and the law, whenever it gets the job done faster.', cue: 'Play it pragmatic about legality — it’s a suggestion, not a limit.' },
      { t: 'Totally Evil', d: 'Illegal, unethical work is routine for you — and honestly, you enjoy it.', cue: 'Play it unsettlingly cheerful about violence that should probably bother you.' },
    ],
  },
  {
    id: 'soloTerritory', title: "What's Your Operational Territory?", eyebrow: 'Territory', roleGate: 'Solo',
    sub: 'Where you actually work shapes who you know, who you’ve crossed, and who’s still watching.',
    options: [
      { t: 'A Corporate Zone', d: 'You operate within a specific Corporate Zone, playing by its particular set of rules.', cue: 'Play it fluent in corporate etiquette, even when the job itself is anything but polite.' },
      { t: 'Combat Zones', d: 'You work where the city’s already given up, which means fewer rules and fewer witnesses.', cue: 'Play it grimly unsurprised by anything, even on a bad day.' },
      { t: 'The Whole City', d: 'You go wherever the job takes you, with no fixed territory to call home turf.', cue: 'Play it adaptable to unfamiliar neighborhoods, reading a new area fast.' },
      { t: "A Single Corporation's Territory", d: 'You work exclusively within one Corp’s sphere of influence and protection.', cue: 'Play it loyal to that Corp’s interests, even in situations that don’t officially involve them.' },
      { t: "A Fixer's Territory", d: 'You operate within the territory of one particular Fixer or contact who keeps you working.', cue: 'Play it deferential to that Fixer specifically, more than to anyone else in your professional life.' },
      { t: 'Wherever the Money Takes You', d: 'No fixed territory — you go where the job pays, full stop.', cue: 'Play it rootless and unattached to any one place, professionally and personally.' },
    ],
  },
  {
    id: 'soloThreat', title: "Who's Gunning for You?", eyebrow: 'Solo Threat', roleGate: 'Solo',
    sub: 'This line of work makes enemies as a matter of course. This is the one that actually matters.',
    options: [
      { t: 'An Angered Corporation', d: 'A Corp you crossed on a job hasn’t forgotten, and they have real resources to spend on you.', cue: 'Play it wary of anything with that Corp’s branding on it.' },
      { t: 'A Tackled Boostergang', d: 'A gang you took down earlier wants payback, loudly and specifically.', cue: 'Play it tactically alert in that gang’s territory, more than anywhere else.' },
      { t: 'Corrupt or Mistaken Lawmen', d: 'Some Lawmen think you’re guilty of something — correctly or not — and they’re not letting it go.', cue: 'Play it cautious around badges, even when you’re not currently doing anything wrong.' },
      { t: 'A Rival Corp Solo', d: 'Another Corp’s enforcer sees you as competition worth eliminating.', cue: 'Play it professionally competitive and a little obsessive about this one specific rival.' },
      { t: 'A Threatened Fixer', d: 'A Fixer has started seeing you as a liability instead of an asset.', cue: 'Play it careful about how much you actually reveal to Fixers now.' },
      { t: 'A Nemesis Solo', d: 'Another Solo has decided this is personal, and neither of you fully remembers who started it.', cue: 'Play it fixated on this one rival in a way that occasionally clouds your judgment.' },
    ],
  },
  {
    id: 'techType', title: 'What Kind of Tech Are You?', eyebrow: 'Tech Type', roleGate: 'Tech',
    sub: 'Every Tech has a specialty they came up building or fixing. This is yours.',
    options: [
      { t: 'Cyberware Technician', d: 'You install, maintain, and modify cyberware — the hardware people trust with their own bodies.', cue: 'Play it clinically curious about anyone’s visible chrome, cataloguing it without meaning to.' },
      { t: 'Vehicle Mechanic', d: 'You keep cars, bikes, and trucks running long past when they should have died.', cue: 'Play it attentive to engine sounds and mechanical tells most people never notice.' },
      { t: 'Jack of All Trades', d: 'You fix a little of everything, never quite a specialist, always useful.', cue: 'Play it quick to volunteer for problems outside your stated expertise, because you probably can fix it.' },
      { t: 'Small Electronics Technician', d: 'You repair and modify the everyday gear people actually carry — Agents, radios, personal tech.', cue: 'Play it fidgety with small objects in your hands, always half-tinkering.' },
      { t: 'Weaponsmith', d: 'You build and maintain weapons, from street pieces to serious hardware.', cue: 'Play it evaluating everyone’s weapon like a professional the moment you see it.' },
      { t: 'Crazy Inventor', d: 'You build things nobody asked for, some of which even work as intended.', cue: 'Play it excitable about half-finished projects you insist are almost ready.' },
      { t: 'Robot and Drone Mechanic', d: 'You keep the city’s automated hardware running — drones, bots, and everything in between.', cue: 'Play it talking to machines like they can hear you, out of long habit.' },
      { t: 'Heavy Machinery Mechanic', d: 'You work on the big stuff — industrial equipment, construction rigs, things that could crush a person.', cue: 'Play it physically imposing in how you handle tools, built for heavier work than most Techs.' },
      { t: 'Scavenger', d: 'You find value in what everyone else already wrote off, salvaging usable tech from the wreckage.', cue: 'Play it magpie-like about spotting salvageable parts, even in unrelated conversations.' },
      { t: 'Nautical Mechanic', d: 'You keep boats, ships, and anything that floats actually seaworthy.', cue: 'Play it more at ease around water and unstable footing than most landlocked people.' },
    ],
  },
  {
    id: 'techPartner', title: 'Got a Partner, or Work Alone?', eyebrow: 'Partner', roleGate: 'Tech',
    sub: 'Some Techs work best with a second set of hands. Some can’t stand anyone else touching their tools.',
    options: [
      { t: 'Work Alone', d: 'Nobody else touches your tools or your work — full credit, full blame, exactly how you like it.', cue: 'Play it possessive of your workspace and tools, uncomfortable when someone else handles them.' },
      { t: 'Got a Partner', d: 'Someone else works alongside you, and you’ve built a real rhythm together.', cue: 'Play it reflexively narrating what you’re doing, like your partner’s still in the room even when they’re not.' },
    ],
  },
  {
    id: 'techWorkspace', title: "What's Your Workspace Like?", eyebrow: 'Workspace', roleGate: 'Tech',
    sub: 'Where you actually build and fix things says a lot about how your mind works.',
    options: [
      { t: 'A Blueprint Mess', d: 'Strewn with paper schematics that only make sense to you, in an order only you understand.', cue: 'Play it able to locate anything instantly in what looks like total chaos to everyone else.' },
      { t: 'Color-Coded Nightmare', d: 'Everything’s technically organized by color, and it’s still somehow incomprehensible to visitors.', cue: 'Play it mildly offended when someone calls your system confusing.' },
      { t: 'Digital and Backed Up', d: 'Fully digital, obsessively backed up every single day without fail.', cue: 'Play it visibly anxious about data loss, checking backups more than strictly necessary.' },
      { t: 'Designed on Your Agent', d: 'You do all your real design work on your Agent, workspace be damned.', cue: 'Play it constantly sketching or annotating on your Agent, even mid-conversation.' },
      { t: 'A Hoarder’s Stockpile', d: 'You keep everything, just in case — and it usually does come in handy eventually.', cue: 'Play it defensive about your stockpile whenever someone calls it clutter.' },
      { t: 'A Personal Filing System', d: 'Only you understand how anything is actually organized, and that’s exactly how you like it.', cue: 'Play it faintly territorial when someone tries to "help" reorganize your space.' },
    ],
  },
  {
    id: 'techClients', title: 'Who Are Your Main Clients?', eyebrow: 'Clients', roleGate: 'Tech',
    sub: 'Most Techs have a regular pipeline of who actually brings them work.',
    options: [
      { t: 'Fixer Referrals', d: 'Local Fixers send clients your way and take their cut for the introduction.', cue: 'Play it professionally cordial with the Fixers who keep your bench full.' },
      { t: 'Local Gangers', d: 'A gang protects your work area or home in exchange for repairs when they need them.', cue: 'Play it calm and unbothered in gang spaces most people would find tense.' },
      { t: 'Corporate Black-Project Work', d: 'Execs bring you work they can’t put through official channels.', cue: 'Play it deliberately incurious about the politics behind a corporate job.' },
      { t: 'Solo Weapon Upkeep', d: 'Solos and combat types rely on you to keep their gear in working order.', cue: 'Play it aware of exactly how much a client’s life depends on your work holding up.' },
      { t: 'Nomad "Found" Tech', d: 'Nomads and Fixers bring you salvaged tech to repair, no questions about where it came from.', cue: 'Play it incurious on purpose about the provenance of what lands on your bench.' },
      { t: 'Self-Employed Inventor', d: 'You work for yourself, selling whatever you invent or repair directly.', cue: 'Play it quietly proud of your own work, a little precious about pricing it fairly.' },
    ],
  },
  {
    id: 'techSupplies', title: 'Where Do You Get Your Supplies?', eyebrow: 'Supplies', roleGate: 'Tech',
    sub: 'Good parts aren’t always easy to come by legally. This is how you actually stay stocked.',
    options: [
      { t: 'Scavenged Wreckage', d: 'You scavenge parts out of abandoned City Zones, whatever’s left to find.', cue: 'Play it resourceful and a little magpie-like about spotting useful salvage.' },
      { t: 'Battlefield Stripping', d: 'You strip gear from bodies after firefights — grim, but it keeps your bench stocked.', cue: 'Play it unsentimental about where your parts actually came from.' },
      { t: 'Fixer Supply Trade', d: 'A local Fixer brings you supplies in exchange for repair work.', cue: 'Play it transactional but reliable with your Fixer contact.' },
      { t: 'Corporate Supply Trade', d: 'Execs supply you with parts and materials in exchange for your services.', cue: 'Play it aware of exactly how replaceable that arrangement makes you.' },
      { t: 'Warehouse Backdoors', d: 'You’ve got an unofficial way into a few Corporate warehouses.', cue: 'Play it cagey about exactly how that access works, even with people you trust.' },
      { t: 'Night Market Deals', d: 'You hit the Night Markets and score whatever deals you can find, whenever you can.', cue: 'Play it always browsing, even off duty — you never really stop shopping for parts.' },
    ],
  },
  {
    id: 'techThreat', title: "Who's Gunning for You?", eyebrow: 'Tech Threat', roleGate: 'Tech',
    sub: 'Building and fixing things for a living still makes you enemies. This is yours.',
    options: [
      { t: 'Territorial Gangers', d: 'A Combat Zone gang wants you working for them exclusively, and they’re not asking nicely.', cue: 'Play it evasive about your schedule and location in gang territory.' },
      { t: 'A Rival Tech', d: 'Another Tech is actively trying to poach your customers out from under you.', cue: 'Play it protective of client relationships, quick to badmouth this one specific rival.' },
      { t: 'Controlling Corporates', d: 'A Corporation wants you working for them exclusively, whether or not that’s actually your choice.', cue: 'Play it wary of offers that sound a little too generous to be optional.' },
      { t: 'A Threatened Manufacturer', d: 'A larger manufacturer sees your mods as a real threat to their business and wants you stopped.', cue: 'Play it defensive about your own designs whenever a big brand name comes up.' },
      { t: 'A Burned Client', d: 'An old client thinks you screwed them over, and they’ve never let it go.', cue: 'Play it tense whenever that specific job or client comes up.' },
      { t: 'A Resource Rival', d: 'A rival Tech is actively trying to outmaneuver you for the same parts and supplies.', cue: 'Play it competitive and quietly territorial about your supply lines.' },
    ],
  },
  {
    id: 'style', title: "What's Your Signature Look?", eyebrow: 'Style',
    sub: 'How you present is armor and message both. Pick the version of yourself people recognize on sight — clothes, hair, all of it.',
    options: [
      { t: 'Chrome-Forward', d: 'Visible cyberware worn openly, almost like jewelry — you want people to clock what you can do. Hair kept short and out of the way of the hardware.', cue: 'Play it unbothered by stares. You move like the chrome is just part of you, because it is.' },
      { t: 'Analog Throwback', d: 'Deliberately low-tech — real fabric, real leather, minimal visible augmentation. Hair long and simply kept, nothing engineered about it.', cue: 'Play it a little stubborn about the old ways, even when the new ways would be easier.' },
      { t: 'Corporate-Clean', d: 'Pressed, branded, unremarkable on purpose — you blend into a boardroom as easily as a back alley. Hair neat, exact, never a strand out of place.', cue: 'Play it controlled and neutral-faced. Your emotions are information you choose to release.' },
      { t: 'Scavenger-Punk', d: "Patched gear, salvaged tech, and DIY mods that shouldn't work but do. Hair self-cut, uneven, maybe a streak of color from whatever dye you could scavenge.", cue: "Play it inventive and a little chaotic — you'll jury-rig a solution before you'd wait for the right part." },
      { t: 'Street-Formal', d: "A look that says 'I dress up for violence' — sharp lines built for a fight, not a party. Hair slicked back or shaved tight, nothing an opponent can grab.", cue: 'Play it deliberate about presentation, like every entrance is staged.' },
      { t: 'Subcultural', d: 'Full commitment to a scene — rocker, tech-priest, whatever tribe claimed you first. Hair styled as a badge of that scene, unmistakable at a glance.', cue: 'Play it tribal. You clock other members of your scene instantly, and outsiders slightly less patiently.' },
    ],
  },
  {
    id: 'drive', title: 'What Are Your Life Goals?', eyebrow: 'Motivation',
    sub: "You know your history, your style, your turbulent love life. This is what you actually want out of all of it — the thing that gets you out of bed for a job, not the cover story.",
    options: [
      { t: 'Debt', d: "You owe someone, and they collect. Every job is partly about making that number smaller.", cue: 'Play it a little tense around money talk, even for small amounts.' },
      { t: 'Family', d: "Blood or chosen, someone depends on what you bring home, and that's not negotiable.", cue: 'Play it protective past the point of caution when family comes up.' },
      { t: 'Reputation', d: "The name matters more than the paycheck. You turn down easy money that doesn't build the legend.", cue: 'Play it image-conscious — you think about how a choice will read before you make it.' },
      { t: 'Revenge', d: "Someone's still breathing who shouldn't be, and you haven't forgotten it, no matter how long it's been.", cue: "Play it patient about the one thing you're not patient about at all." },
      { t: 'Escape', d: "One more job and you're gone for good — you've said that before, and you'll probably say it again.", cue: "Play it restless. You're always half-planning an exit, from the job and from the city." },
      { t: 'Belief', d: 'A cause, a crew, or a code you actually follow, even when it costs you.', cue: "Play it principled in ways that occasionally get in your own way, and you wouldn't have it otherwise." },
      { t: 'Power', d: "Real control — over your own life first, and eventually over the people who used to control it.", cue: 'Play it constantly reading a room for who actually holds leverage, even in casual company.' },
      { t: 'Reclamation', d: "Something that's rightfully yours is in someone else's hands, and you intend to get it back — whatever that takes.", cue: 'Play it fixated on the specific thing, in a way that surprises people who don’t know the history.' },
      { t: 'Fear', d: 'You want to become someone nobody in their right mind crosses twice.', cue: 'Play it deliberately intimidating in small, controlled doses — the reputation is a tool, not an accident.' },
      { t: 'A Clean Break', d: "You want to bury the person you used to be so completely that nobody can dig them back up.", cue: "Play it evasive about your past, with a redirect ready before anyone finishes the question." },
    ],
  },
  {
    id: 'scar', title: "What's Your Defining Scar?", eyebrow: 'Turning Point',
    sub: 'Physical or otherwise — the one event people can trace a line back to when they try to explain who you became.',
    options: [
      { t: 'A Job Gone Wrong', d: "A run that cost someone their life, and you've never fully squared whether it was your call that did it.", cue: 'Play it careful with plans now — you double-check what you used to trust.' },
      { t: 'A Piece of Chrome', d: "Cyberware that replaced something you lost, and some days it still doesn't feel like it's yours.", cue: "Play it occasionally distant from that part of your body, like it's on loan." },
      { t: 'A Betrayal', d: 'Someone you trusted with your life used that trust against you, once, and that was enough.', cue: 'Play it slow to extend trust now, and quick to notice when someone’s angling for it.' },
      { t: 'A Corp That Got Away With It', d: 'A company ruined something — a person, a place, a life — and faced no consequences at all.', cue: 'Play it with a low simmer of anger near anything corporate-branded.' },
      { t: 'A Debt in Favors', d: "You're still paying off something you didn't fully agree to, one job at a time.", cue: 'Play it quietly resentful of obligations, even ones you understand you owe.' },
      { t: 'A Name Left Behind', d: "You used to be someone else, on paper or in practice, and you don't answer to that name anymore.", cue: 'Play it evasive about your past, with a well-rehearsed redirect ready.' },
    ],
  },
  {
    id: 'rep', title: 'How Does the Street Know You?', eyebrow: 'Reputation',
    sub: "Before anyone meets you, they've usually heard something. Pick the version of your story that gets around.",
    options: [
      { t: 'The One Who Walked Away', d: "A job everyone assumed was a death sentence, and you're the reason it isn't a very good story anymore.", cue: 'Play it modest about it in a way that only makes people ask more questions.' },
      { t: 'The Signature Move', d: 'A weapon, a tactic, or a tell people recognize on sight, whether or not they can see your face.', cue: "Play it a little proud of the tell — you don't hide it even when it'd be smarter to." },
      { t: "The Rumor That's Mostly True", d: "A story's been going around, and you gave up correcting the details a while ago.", cue: 'Play it amused rather than annoyed when people bring up the rumor.' },
      { t: 'The Wanted Face', d: "Somebody's feed still has your picture up, and it's not flattering.", cue: 'Play it cautious in public spaces with cameras, out of habit more than fear.' },
      { t: 'Word of Mouth Only', d: "No records, no photos — just stories that don't quite agree with each other, which is how you like it.", cue: 'Play it deliberately hard to pin down, even in casual conversation.' },
      { t: 'Everybody Owes Somebody', d: 'Between favors given and favors taken, your name is tangled through half the fixers in the city.', cue: 'Play it socially confident — you know you can call in a favor almost anywhere you go.' },
    ],
  },
  {
    id: 'detail', title: "What's Your Signature Detail?", eyebrow: 'Signature Detail',
    sub: 'One small thing about your look people always remember — the detail that shows up in every description of you, for better or worse.',
    options: [
      { t: 'Real Ink', d: 'Actual tattoos, not a cyberware sleeve — something permanent you chose on purpose.', cue: 'Play it willing to show the ink and explain it, at least the parts you’re willing to explain.' },
      { t: 'Eyewear That Never Comes Off', d: 'Tinted, mirrored, or just permanently perched — nobody’s seen your eyes in years.', cue: 'Play it a little unsettling to talk to. People can’t read what you’re reacting to.' },
      { t: 'An Unexplained Scar', d: 'Earned somewhere you don’t talk about, and everyone’s stopped asking.', cue: 'Play it deflecting smoothly, every single time, with a different half-answer.' },
      { t: 'Heavy Piercings', d: 'A lot of them, and they’re not really about fashion.', cue: 'Play it fidgeting with one when you’re thinking — it’s a tell people learn to read.' },
      { t: 'Reinforced Hands', d: 'Knuckle plating, heavy rings, or worse — your hands look like they’ve done things.', cue: 'Play it conscious of where your hands are in a room, out of old habit.' },
      { t: 'A Grin With Hardware in It', d: 'A grill, filed teeth, or a stud you click against your teeth when you’re thinking.', cue: 'Play it using the smile as punctuation — it lands differently once people notice what’s in it.' },
      { t: 'Fingerless Gloves, Always', d: 'Practical or performative, you never take them off, even indoors.', cue: 'Play it oddly exposed on the rare occasion they come off — people notice immediately.' },
      { t: 'Obvious Cybereyes', d: 'Worn open, not hidden — a lens click or color shift gives away what you’re looking at.', cue: 'Play it unblinking in moments where a human would flinch.' },
      { t: 'A Signature Scent', d: 'Cheap or expensive, it announces you before you walk into a room.', cue: 'Play it noticed — people comment on it, place you by it in the dark.' },
      { t: 'Nothing Flashy At All', d: 'And that restraint, in a city like this, is the tell.', cue: 'Play it disarmingly plain — people relax around you because you don’t look like a threat, which is exactly the point.' },
    ],
  },
  {
    id: 'value', title: 'What Do You Value Most?', eyebrow: 'Core Value',
    sub: 'Everyone’s got something they’d burn a bridge — or a building — to protect. This is yours, and how it colors the way you see other people.',
    options: [
      { t: 'Money', d: 'You don’t romanticize it, and you don’t trust anyone who claims they don’t want it too.', cue: 'Play it transactional by default — you assume everyone has a price until proven otherwise.' },
      { t: 'Your Word', d: 'A promise from you means something, in a city where that’s rare enough to be dangerous.', cue: 'Play it visibly uncomfortable breaking even a small commitment.' },
      { t: 'Honesty', d: 'You’d rather deliver a hard truth than a comfortable lie, and you expect the same back.', cue: 'Play it blunt in moments where tact would be easier.' },
      { t: 'Knowledge', d: 'What you know is worth more to you than what you own.', cue: 'Play it collecting information reflexively, even when it costs you socially.' },
      { t: 'Vengeance', d: 'Somebody’s got a debt with you, and you intend to collect eventually.', cue: 'Play it patient about the one thing you’re never patient about otherwise.' },
      { t: 'Love', d: 'The people you’ve chosen matter more than the job, the money, or the mission.', cue: 'Play it softer around the people who’ve earned it, visibly so.' },
      { t: 'Power', d: 'Being able to make things happen matters more to you than being liked.', cue: 'Play it constantly reading a room for who actually holds leverage.' },
      { t: 'Family', d: 'Blood or chosen, the people you call family come before almost anything else.', cue: 'Play it protective past the point other people find reasonable.' },
      { t: 'Friendship', d: 'You measure a life by the people in it, not the résumé.', cue: 'Play it generous with your time in ways that sometimes cost you.' },
      { t: 'Nothing, Anymore', d: 'You used to value something. Something happened. You stay neutral now, and it’s safer that way.', cue: 'Play it deliberately even-keeled — enthusiasm reads as a liability to you now.' },
    ],
  },
  {
    id: 'person', title: "Who Would You Never Leave Behind?", eyebrow: 'Valued Person',
    sub: 'If it came down to it — the job, or them — there’s no question which one you’d choose.',
    options: [
      { t: 'A Parent', d: 'Whatever your history, they’re still the person you’d drop everything for.', cue: 'Play it visibly softer whenever they come up in conversation.' },
      { t: 'A Sibling', d: 'Blood or chosen, they’re the one person who’s known you the whole way through.', cue: 'Play it protective and a little competitive, in the specific way siblings are.' },
      { t: 'A Lover', d: 'Someone you’d reroute an entire plan around without a second thought.', cue: 'Play it distracted whenever they might be in danger, even hypothetically.' },
      { t: 'A Friend', d: 'Not family by blood, but the kind of loyalty that doesn’t need explaining.', cue: 'Play it fiercely loyal in ways that sometimes surprise people who don’t know the history.' },
      { t: 'Yourself', d: 'You’ve learned the hard way that you’re the only one guaranteed to show up.', cue: 'Play it self-reliant to a fault — accepting help doesn’t come naturally.' },
      { t: 'A Pet or Companion', d: 'Something living that depends on you completely, and asks for nothing complicated back.', cue: 'Play it visibly gentler around them than around almost anyone else.' },
      { t: 'A Mentor', d: 'Someone who taught you the thing you’re actually good at, and never stopped mattering.', cue: 'Play it deferential to their memory or presence, even years later.' },
      { t: 'A Public Figure', d: 'Someone you’ve never met who still shaped who you decided to become.', cue: 'Play it a little embarrassed when people find out how much they mean to you.' },
      { t: 'A Personal Hero', d: 'Not famous — just someone who proved a certain kind of life was possible.', cue: 'Play it quietly guided by “what would they do” in moments that matter.' },
      { t: 'No One', d: 'And you’d rather keep it that way.', cue: 'Play it genuinely unbothered by that fact — or not quite as unbothered as you let on.' },
    ],
  },
  {
    id: 'possession', title: "What Would You Never Leave Behind?", eyebrow: 'Valued Possession',
    sub: 'If the building’s on fire and you’ve got ten seconds, this is what you’re grabbing.',
    options: [
      { t: 'A Weapon', d: 'Not because it’s the best one you own — because of where it’s been with you.', cue: 'Play it maintaining it obsessively, more than the job strictly requires.' },
      { t: 'A Tool', d: 'The one that’s gotten you out of more trouble than any weapon ever has.', cue: 'Play it reaching for it reflexively before you’ve even decided you need it.' },
      { t: 'A Piece of Clothing', d: 'Worn soft with use, and not for sale at any price.', cue: 'Play it protective of it in ways that seem disproportionate to strangers.' },
      { t: 'A Photograph', d: 'Physical, not a file — something that can’t be deleted from across the net.', cue: 'Play it keeping it somewhere close, somewhere it’d survive if you didn’t.' },
      { t: 'A Book or Diary', d: 'Words that matter more to you than the story anyone else would guess.', cue: 'Play it cagey about the contents if anyone asks to read it.' },
      { t: 'A Recording', d: 'A voice, a song, a message — something you replay more than you’d admit.', cue: 'Play it visibly affected whenever it plays, even in company.' },
      { t: 'A Musical Instrument', d: 'The one part of your life that isn’t about the job at all.', cue: 'Play it decompressing with it after violence, like a reset switch.' },
      { t: 'A Piece of Jewelry', d: 'Cheap or priceless, its value has nothing to do with the market rate.', cue: 'Play it touching it absently in moments of stress.' },
      { t: 'A Childhood Toy', d: 'Battered, useless, and completely non-negotiable.', cue: 'Play it a little defensive if anyone mocks it — that reaction is instant and real.' },
      { t: 'A Letter', d: 'Never sent, or never answered — either way, you’ve kept it.', cue: 'Play it unwilling to say who it’s from or what it says, even under pressure.' },
    ],
  },
]

// Some steps only apply to a specific Role (e.g. an Exec's corp/division
// questions don't make sense for a Nomad) — this resolves the picked Role
// and filters them out. Order is preserved from STEPS, so a role-gated
// step always slots in right after the 'role' step where it's defined.
export function activeSteps(picks: Record<string, number>): Step[] {
  const roleIdx = picks['role']
  const roleStep = STEPS.find(s => s.id === 'role')
  const roleName = roleStep && roleIdx !== undefined ? roleStep.options[roleIdx].t : undefined
  return STEPS.filter(s => !s.roleGate || s.roleGate === roleName)
}

type RoleBuild = { primary: string; skills: string; light: string; note: string }

const ROLE_BUILDS: Record<string, RoleBuild> = {
  Rockerboy: {
    primary: 'COOL and EMP — you move a room and read its mood before anyone else does.',
    skills: 'Perform (whatever your art is), Persuasion, Wardrobe & Style.',
    light: 'Combat and tech skills — you’re a headliner, not a hitter.',
    note: 'Your Role Ability is about rallying people around you, so let your background’s Drive or Reputation pick decide what your following actually gets you.',
  },
  Solo: {
    primary: 'REF above everything else — it’s the stat that should look freakish on the sheet.',
    skills: 'One weapon skill (Handgun, Rifle, or Martial Arts) maxed — pick the one your background’s Style/Homeland points toward.',
    light: 'Streetwise, Human Perception, Interrogation — keep these low if you’re playing him green. That gap between "can shoot" and "can’t read a threat" is the whole bit.',
    note: 'Your Role Ability is battlefield instinct — reflavor it as pure muscle memory from drills, not trauma.',
  },
  Netrunner: {
    primary: 'INT and TECH — the net doesn’t care how tough you are.',
    skills: 'Interface and a Programming/Electronics skill.',
    light: 'Physical combat skills and COOL-based social skills — you win from a terminal, not a firefight.',
    note: 'Your Role Ability lets you pull off net actions no one else at the table can — lean into a background pick (Homeland or Family) that explains where you learned to code.',
  },
  Tech: {
    primary: 'TECH first, INT second — you fix things nobody else understands.',
    skills: 'Basic Tech plus one specialty (Cybertech, Land Vehicle Tech, Weaponstech — whatever matches your Style).',
    light: 'Social and stealth skills — you’re useful because of what you can build, not who you know.',
    note: 'Your Role Ability lets you field-rig repairs under pressure — great fit if your Family Style pick was hands-on (Off-Grid Survivalists, Street-Level Hustlers).',
  },
  Medtech: {
    primary: 'TECH and INT — steady hands and a fast diagnosis.',
    skills: 'First Aid / Paramedic, plus Human Perception for reading a patient.',
    light: 'Combat skills — you keep people alive, you don’t usually start the fight.',
    note: 'Your Role Ability keeps someone breathing when the dice say they shouldn’t — pairs well with a Scar pick like "A Job Gone Wrong."',
  },
  Media: {
    primary: 'INT and COOL — you find the story and you don’t flinch chasing it.',
    skills: 'Human Perception, Persuasion, Investigation.',
    light: 'Combat and tech skills — your leverage is what you know, not what you can shoot or fix.',
    note: 'Your Role Ability breaks a story wide open — your Drive pick (Reputation especially) should tell you what kind of stories you chase.',
  },
  Lawman: {
    primary: 'COOL and REF — procedure under pressure.',
    skills: 'Handgun, Interrogation, Tactics.',
    light: 'Criminal-adjacent skills like Streetwise — you’re playing this straight, at least at first.',
    note: 'Your Role Ability pulls in backup when things go bad — a nice mechanical hook if your War pick was "Frontline" or "Homefront Survivor."',
  },
  Exec: {
    primary: 'COOL and INT — composure and a read on leverage.',
    skills: 'Persuasion, Trading, Teamwork.',
    light: 'Combat skills — you win the room, you don’t win the fight.',
    note: 'Your Role Ability moves resources other Roles can’t touch — your Family Style pick (Corporate Climbers especially) should explain who you can still call.',
  },
  Fixer: {
    primary: 'COOL and EMP — people skills are your whole toolkit.',
    skills: 'Trading, Streetwise, Personal Grooming or Wardrobe & Style.',
    light: 'Combat skills — you know a guy who does that, you don’t do it yourself.',
    note: 'Your Role Ability gets your hands on gear other people can’t find — your Reputation pick ("Everybody Owes Somebody" especially) is basically already this.',
  },
  Nomad: {
    primary: 'REF and TECH — you can drive it and you can fix it.',
    skills: 'Driving, Basic Tech, a Survival-type skill.',
    light: 'Corporate/social-climbing skills — the convoy doesn’t care about your boardroom manners.',
    note: 'Your Role Ability is your pack showing up when you call — pairs naturally with a Nomad Convoy Homeland or Nomad Pack Blood Family pick.',
  },
}

export const STORAGE_KEY = 'cpr-character-builder-v1'

export type SavedState = { step: number; picks: Record<string, number>; mode: Record<string, 'choose' | 'roll'> }

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.picks) return parsed
    }
  } catch { /* ignore */ }
  return { step: 0, picks: {}, mode: {} }
}

function saveState(s: SavedState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

export function buildBio(picks: Record<string, number>) {
  const opt = (id: string) => (picks[id] !== undefined ? STEPS.find(s => s.id === id)!.options[picks[id]] : null)
  const homeland = opt('homeland'), family = opt('family'), age = opt('age'), war = opt('war')
  const role = opt('role'), style = opt('style'), drive = opt('drive'), scar = opt('scar'), rep = opt('rep')

  const l1 = `You came up in ${homeland ? homeland.t.toLowerCase() : 'a city block like any other'}, raised by ${family ? family.t.toLowerCase() : 'whoever was around'}. ` +
    (age ? `These days you run ${age.t.split(' (')[0].toLowerCase()}, ` : '') +
    (war ? `and the war left you as ${war.t.toLowerCase()}.` : 'and the details of the war matter less to you than what came after.')
  const l2 = `You work as ${role ? `a ${role.t}` : 'a hired gun of no fixed specialty'}, ` +
    (style ? `dressed ${style.t.toLowerCase()}, ` : '') +
    (drive ? `chasing ${drive.t.toLowerCase()} more than anything else.` : 'chasing whatever the next job pays.')
  const l3 = (scar ? `The thing that changed you was ${scar.t.toLowerCase()}. ` : '') +
    (rep ? `On the street, you're known as ${rep.t.toLowerCase()}.` : "On the street, nobody's quite sure what to make of you yet.")
  return `${l1} ${l2} ${l3}`
}

function DieFace({ value, spinning }: { value: number | string; spinning: boolean }) {
  return (
    <div
      style={{
        width: 84, height: 84, border: `2px solid ${T.border}`, background: T.surface2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, fontWeight: 700, color: T.gold, transform: 'rotate(45deg)',
        transition: spinning ? undefined : 'transform 0.2s',
        borderRadius: 10,
      }}
    >
      <span style={{ transform: 'rotate(-45deg)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

export default function CharacterBuilder() {
  const [state, setState] = useState<SavedState>(loadState)
  const [rolling, setRolling] = useState(false)
  const [dieFace, setDieFace] = useState<number | string>('?')
  const [toast, setToast] = useState('')

  const update = (next: SavedState) => { setState(next); saveState(next) }

  const flashToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
  }

  const choose = (stepId: string, idx: number) => {
    update({ ...state, picks: { ...state.picks, [stepId]: idx } })
  }

  const setMode = (stepId: string, mode: 'choose' | 'roll') => {
    update({ ...state, mode: { ...state.mode, [stepId]: mode } })
  }

  const roll = (step: Step) => {
    if (rolling) return
    setRolling(true)
    const n = step.options.length
    let ticks = 0
    const iv = setInterval(() => {
      setDieFace(1 + Math.floor(Math.random() * n))
      ticks++
      if (ticks >= 9) {
        clearInterval(iv)
        const result = Math.floor(Math.random() * n)
        setDieFace(result + 1)
        setRolling(false)
        choose(step.id, result)
      }
    }, 55)
  }

  const randomizeAll = () => {
    // Role first, since which other steps are even active depends on it.
    // The loop below must NOT re-roll 'role' itself — it's one of the
    // active steps too, and re-rolling it there would land on a different
    // Role than the one used to pick which role-gated steps to randomize,
    // desyncing the two (e.g. Exec's extra steps get rolled, then role
    // flips to Netrunner, leaving Netrunner's steps never touched).
    const roleStep = STEPS.find(s => s.id === 'role')!
    const picks: Record<string, number> = { role: Math.floor(Math.random() * roleStep.options.length) }
    for (const s of activeSteps(picks)) {
      if (s.id === 'role') continue
      picks[s.id] = Math.floor(Math.random() * s.options.length)
    }
    update({ ...state, picks, step: activeSteps(picks).length })
    flashToast('Full lifepath rolled')
  }

  const resetAll = () => {
    update({ step: 0, picks: {}, mode: {} })
    flashToast('Cleared')
  }

  const goto = (idx: number) => update({ ...state, step: idx })

  const steps = activeSteps(state.picks)
  const complete = steps.every(s => state.picks[s.id] !== undefined)
  const atSummary = state.step >= steps.length

  const copyDossier = () => {
    const opt = (id: string) => STEPS.find(s => s.id === id)!.options[state.picks[id]]
    const roleBuild = ROLE_BUILDS[opt('role').t]
    const text = 'EDGERUNNER DOSSIER\n' +
      steps.map(s => `${s.eyebrow}: ${opt(s.id).t}`).join('\n') +
      '\n\n' + buildBio(state.picks) +
      '\n\nROLEPLAY CUES\n' + steps.map(s => `- ${opt(s.id).cue}`).join('\n') +
      (roleBuild
        ? `\n\nSUGGESTED BUILD DIRECTION (${opt('role').t})\n` +
          `Prioritize: ${roleBuild.primary}\n` +
          `Key Skills: ${roleBuild.skills}\n` +
          `Keep Light: ${roleBuild.light}\n` +
          `Background Tie-In: ${roleBuild.note}\n` +
          `(Directional guidance only — check your core rulebook or GM for exact point totals.)`
        : '')
    navigator.clipboard.writeText(text)
      .then(() => flashToast('Dossier copied to clipboard'))
      .catch(() => flashToast('Copy failed — select text manually'))
  }

  const railItem = (label: string, idx: number, active: boolean, done: boolean, locked = false) => (
    <div
      key={label}
      onClick={() => { if (!locked) goto(idx) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', cursor: locked ? 'default' : 'pointer',
        borderLeft: `2px solid ${active ? T.red : 'transparent'}`,
        background: active ? T.surface2 : 'transparent',
        fontSize: 13, color: active ? T.text : T.textMuted, opacity: locked ? 0.45 : 1,
      }}
    >
      <div style={{
        width: 20, height: 20, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${done ? T.red : T.border}`, background: done ? `${T.red}22` : 'transparent',
        color: done ? T.gold : T.textDim, fontSize: 10, fontFamily: 'monospace', borderRadius: 4,
      }}>
        {done ? <Check size={11} /> : (idx === steps.length ? <Star size={11} /> : idx + 1)}
      </div>
      <div>{label}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 40px' }}>
      <div className="cpr-print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, maxWidth: 560 }}>
          A background &amp; roleplay generator — nine lifepath questions, each with a pick-a-description or roll-a-die option.
          Built for new players who don&apos;t know the setting yet.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={randomizeAll} style={btnGhost}>
            <Shuffle size={12} /> Roll Everything
          </button>
          <button onClick={resetAll} style={{ ...btnGhost, color: T.red, borderColor: `${T.red}55` }}>
            <RotateCcw size={12} /> Start Over
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr) 280px', gap: 18, alignItems: 'start' }} className="cpr-cb-layout">
        <nav className="cpr-print-hide" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, position: 'sticky', top: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 8, fontWeight: 600 }}>Lifepath</div>
          {steps.map((s, i) => railItem(s.eyebrow, i, i === state.step && !atSummary, state.picks[s.id] !== undefined))}
          {railItem('Dossier', steps.length, atSummary, false, !complete)}
        </nav>

        <main className="cpr-cb-stage" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, minHeight: 460, display: 'flex', flexDirection: 'column' }}>
          {atSummary ? (
            <Summary
              state={state}
              onEdit={() => goto(0)}
              onReroll={randomizeAll}
              onCopy={copyDossier}
              complete={complete}
            />
          ) : (
            <StepView
              step={steps[state.step]}
              stepIndex={state.step}
              totalSteps={steps.length}
              mode={state.mode[steps[state.step].id] || 'choose'}
              picked={state.picks[steps[state.step].id]}
              dieFace={dieFace}
              rolling={rolling}
              onMode={m => setMode(steps[state.step].id, m)}
              onPick={idx => choose(steps[state.step].id, idx)}
              onRoll={() => roll(steps[state.step])}
              onBack={() => goto(Math.max(0, state.step - 1))}
              onNext={() => goto(Math.min(steps.length, state.step + 1))}
            />
          )}
        </main>

        <aside className="cpr-print-hide" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, position: 'sticky', top: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 10, fontWeight: 600 }}>Dossier</div>
          {steps.map(s => {
            const pick = state.picks[s.id]
            return (
              <div key={s.id} style={{ padding: '7px 0', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.textDim }}>{s.eyebrow}</div>
                <div style={{ fontSize: 12.5, marginTop: 2, color: pick === undefined ? T.textDim : T.text, fontStyle: pick === undefined ? 'italic' : 'normal' }}>
                  {pick !== undefined ? s.options[pick].t : '— pending'}
                </div>
              </div>
            )
          })}
        </aside>
      </div>

      {toast && (
        <div className="cpr-print-hide" style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: T.gold, color: '#000', fontSize: 12, fontWeight: 600, padding: '9px 16px',
          borderRadius: 6, zIndex: 20,
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .cpr-cb-layout { grid-template-columns: 1fr !important; }
        }
        .cpr-print-only { display: none; }
        @media print {
          body, .cpr-app-root { background: #fff !important; }
          .cpr-print-hide { display: none !important; }
          .cpr-cb-stage { background: #fff !important; border: none !important; min-height: 0 !important; }
          .cpr-print-only { display: block !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  )
}

const btnGhost: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'transparent', border: `1px solid ${T.border}`, color: T.textMuted,
  fontSize: 11.5, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
  padding: '7px 12px', borderRadius: 7, cursor: 'pointer',
}

function StepView({
  step, stepIndex, totalSteps, mode, picked, dieFace, rolling, onMode, onPick, onRoll, onBack, onNext,
}: {
  step: Step; stepIndex: number; totalSteps: number; mode: 'choose' | 'roll'; picked?: number
  dieFace: number | string; rolling: boolean
  onMode: (m: 'choose' | 'roll') => void
  onPick: (idx: number) => void
  onRoll: () => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <>
      <div style={{ padding: '22px 24px 16px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.red, fontWeight: 700 }}>{step.eyebrow}</div>
        <h2 style={{ margin: '6px 0 6px', fontSize: 22, color: T.text }}>{step.title}</h2>
        <p style={{ margin: 0, color: T.textMuted, fontSize: 13.5, maxWidth: '60ch', lineHeight: 1.5 }}>{step.sub}</p>
        <div style={{ display: 'flex', border: `1px solid ${T.border}`, width: 'fit-content', marginTop: 14, borderRadius: 7, overflow: 'hidden' }}>
          {(['choose', 'roll'] as const).map(m => (
            <button
              key={m}
              onClick={() => onMode(m)}
              style={{
                fontSize: 11.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                background: mode === m ? T.red : 'transparent', color: mode === m ? '#fff' : T.textMuted,
                border: 'none', padding: '7px 14px', cursor: 'pointer',
              }}
            >
              {m === 'choose' ? 'Choose' : `Roll d${step.options.length}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 24px', flex: 1 }}>
        {mode === 'choose' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }} className="cpr-cb-grid">
            {step.options.map((o, i) => (
              <button
                key={o.t}
                onClick={() => onPick(i)}
                style={{
                  textAlign: 'left', background: picked === i ? `${T.red}14` : T.surface2,
                  border: `1px solid ${picked === i ? T.red : T.border}`,
                  padding: '12px 14px', borderRadius: 8, cursor: 'pointer', color: T.text,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {o.t}
                  <small style={{ color: T.textDim, fontWeight: 400, fontFamily: 'monospace', fontSize: 10.5 }}>{i + 1}/{step.options.length}</small>
                </div>
                <div style={{ marginTop: 5, fontSize: 12.5, color: T.textMuted, lineHeight: 1.45 }}>{o.d}</div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <DieFace value={picked !== undefined ? picked + 1 : dieFace} spinning={rolling} />
            <button onClick={onRoll} disabled={rolling} style={{
              display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, letterSpacing: '0.03em', textTransform: 'uppercase',
              background: rolling ? T.surface2 : T.red, color: rolling ? T.textMuted : '#fff', border: 'none', padding: '11px 24px',
              borderRadius: 8, cursor: rolling ? 'default' : 'pointer', boxShadow: rolling ? 'none' : `0 0 18px ${T.red}55`,
            }}>
              <Dices size={15} /> Roll the Dice
            </button>
            <div style={{ fontSize: 10.5, color: T.textDim, fontFamily: 'monospace' }}>1d{step.options.length} — tap to randomize this entry</div>
            {picked !== undefined && (
              <div style={{ width: '100%', maxWidth: 480, background: T.surface2, border: `1px solid ${T.red}`, borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.gold }}>{picked + 1}. {step.options[picked].t}</div>
                <div style={{ marginTop: 5, fontSize: 12.5, color: T.text, lineHeight: 1.5 }}>{step.options[picked].d}</div>
              </div>
            )}
            <div style={{ width: '100%', maxWidth: 480, fontFamily: 'monospace', fontSize: 11, color: T.textDim, borderTop: `1px dashed ${T.border}`, paddingTop: 10, marginTop: 4 }}>
              {step.options.map((o, i) => (
                <div key={o.t} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
                  <b style={{ color: T.textMuted, width: 16, flex: 'none' }}>{i + 1}</b><span>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} disabled={stepIndex === 0} style={navBtn(stepIndex === 0)}>← Back</button>
        <button onClick={onNext} disabled={picked === undefined} style={navBtn(picked === undefined, true)}>
          {stepIndex === totalSteps - 1 ? 'View Dossier →' : 'Next →'}
        </button>
      </div>
    </>
  )
}

function navBtn(disabled: boolean, primary = false): React.CSSProperties {
  return {
    fontWeight: 700, fontSize: 13, letterSpacing: '0.02em', textTransform: 'uppercase',
    background: primary ? (disabled ? T.surface2 : T.text) : 'transparent',
    color: primary ? (disabled ? T.textDim : '#000') : T.text,
    border: `1px solid ${primary ? (disabled ? T.border : T.text) : T.border}`,
    padding: '9px 18px', borderRadius: 7, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
  }
}

function Summary({
  state, onEdit, onReroll, onCopy, complete,
}: { state: SavedState; onEdit: () => void; onReroll: () => void; onCopy: () => void; complete: boolean }) {
  if (!complete) {
    return (
      <div style={{ padding: 26 }}>
        <h2 style={{ margin: '0 0 8px', color: T.text }}>Not Finished Yet</h2>
        <p style={{ color: T.textMuted, fontSize: 13.5 }}>Fill in every entry on the Lifepath rail to unlock your full dossier.</p>
        <button onClick={onEdit} style={navBtn(false, true)}>← Back to Build</button>
      </div>
    )
  }

  const steps = activeSteps(state.picks)
  const opt = (id: string) => STEPS.find(s => s.id === id)!.options[state.picks[id]]
  const role = opt('role')
  const build = ROLE_BUILDS[role.t]

  return (
    <>
      <div className="cpr-print-hide" style={{ padding: '24px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', borderBottom: `2px solid ${T.red}`, paddingBottom: 14, marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 26, color: T.text }}>Character Dossier</h2>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: T.red, color: '#fff', padding: '6px 12px', borderRadius: 6, boxShadow: `0 0 14px ${T.red}66` }}>{role.t}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {steps.map(s => (
            <span key={s.id} style={{ fontSize: 11, color: T.cyan, border: `1px solid ${T.cyan}`, padding: '4px 10px', borderRadius: 5 }}>{opt(s.id).t}</span>
          ))}
        </div>

        <div style={{ background: T.surface2, borderLeft: `3px solid ${T.gold}`, padding: '16px 18px', fontSize: 14, lineHeight: 1.7, marginBottom: 22, borderRadius: '0 8px 8px 0' }}>
          {buildBio(state.picks)}
        </div>

        <div style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, fontWeight: 700, marginBottom: 10 }}>Roleplay Cues</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12, marginBottom: 22 }} className="cpr-cb-grid">
          {steps.map(s => (
            <div key={s.id} style={{ background: T.surface2, border: `1px solid ${T.border}`, padding: '12px 14px', borderRadius: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textDim, textTransform: 'uppercase' }}>{s.eyebrow} — {opt(s.id).t}</div>
              <div style={{ fontSize: 12.5, marginTop: 5, lineHeight: 1.5, color: T.text }}>{opt(s.id).cue}</div>
            </div>
          ))}
        </div>

        {build && (
          <>
            <div style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              Suggested Build Direction
              <span style={{ fontSize: 10, letterSpacing: 0, textTransform: 'none', color: T.textDim, fontWeight: 400 }}>— {role.t}</span>
            </div>
            <div style={{ background: T.surface2, border: `1px solid ${T.red}55`, borderRadius: 8, padding: '16px 18px', marginBottom: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 }} className="cpr-cb-grid">
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Prioritize</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.text }}>{build.primary}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Key Skills</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.text }}>{build.skills}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Keep Light</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.textMuted }}>{build.light}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.cyan, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Background Tie-In</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: T.text }}>{build.note}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: T.textDim, marginBottom: 22, fontStyle: 'italic' }}>
              Directional guidance only — check your core rulebook or GM for exact point totals and Role Ability rules.
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} style={{ ...navBtn(false, true), display: 'flex', alignItems: 'center', gap: 7 }}>
            <FileDown size={13} /> Download Character Sheet (PDF)
          </button>
          <button onClick={onCopy} style={{ ...navBtn(false), display: 'flex', alignItems: 'center', gap: 7 }}>
            <Copy size={13} /> Copy Dossier as Text
          </button>
          <button onClick={onEdit} style={navBtn(false)}>← Edit Answers</button>
          <button onClick={onReroll} style={navBtn(false)}>Reroll Everything</button>
        </div>
      </div>

      <PrintSheet state={state} />
    </>
  )
}

const ATTRS: [string, string][] = [
  ['INT', 'Intelligence'], ['REF', 'Reflexes'], ['DEX', 'Dexterity'], ['TECH', 'Technique'], ['COOL', 'Cool'],
  ['WILL', 'Willpower'], ['LUCK', 'Luck'], ['MOVE', 'Movement'], ['BODY', 'Body'], ['EMP', 'Empathy'],
]

function PrintSheet({ state }: { state: SavedState }) {
  const steps = activeSteps(state.picks)
  const opt = (id: string) => STEPS.find(s => s.id === id)!.options[state.picks[id]]
  const role = opt('role')
  const build = ROLE_BUILDS[role.t]
  const lifepathRows: [string, string][] = steps.map(s => [s.eyebrow, opt(s.id).t])

  return (
    <div className="cpr-print-only" style={{ background: '#fff', color: '#111', fontFamily: 'Georgia, "Times New Roman", serif', padding: '0.4in' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '3px solid #111', paddingBottom: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>Cyberpunk RED — Edgerunner Character Sheet</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 24 }}>Handle: <span style={{ borderBottom: '1px solid #111', display: 'inline-block', minWidth: 220 }}>&nbsp;</span></h1>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <div>Role: <b>{role.t}</b></div>
          <div>Role Ability: <span style={{ borderBottom: '1px solid #111', display: 'inline-block', minWidth: 160 }}>&nbsp;</span></div>
        </div>
      </div>

      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Attributes</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {ATTRS.map(([abbr, full]) => {
          const highlighted = !!build && build.primary.includes(abbr)
          return (
            <div key={abbr} title={full} style={{
              width: 62, border: `2px solid ${highlighted ? '#111' : '#999'}`, borderRadius: 4,
              textAlign: 'center', padding: '6px 2px', background: highlighted ? '#eee' : '#fff',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700 }}>{abbr}{highlighted ? ' ★' : ''}</div>
              <div style={{ height: 22, borderBottom: '1px solid #999', marginTop: 4 }} />
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Key Skills to Prioritize</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, marginBottom: 8 }}>{build ? build.skills : 'Pick skills that match your Role.'}</div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Keep Light</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>{build ? build.light : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Other Skills (fill in)</div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 10 }}>
              <div style={{ flex: 1, borderBottom: '1px solid #999', height: 14 }} />
              <div style={{ width: 34, borderBottom: '1px solid #999', height: 14 }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Lifepath</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
        <tbody>
          {lifepathRows.map(([k, v], i) => (
            <tr key={k} style={{ background: i % 2 === 0 ? '#f4f4f4' : '#fff' }}>
              <td style={{ padding: '4px 8px', fontWeight: 700, width: 140, border: '1px solid #ccc' }}>{k}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Background</div>
      <p style={{ fontSize: 12.5, lineHeight: 1.6, marginTop: 0, marginBottom: 16 }}>{buildBio(state.picks)}</p>

      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: 6, fontWeight: 700 }}>Roleplay Notes</div>
      <ul style={{ fontSize: 12, lineHeight: 1.7, marginTop: 0, paddingLeft: 18, marginBottom: 16 }}>
        {steps.map(s => <li key={s.id}>{opt(s.id).cue}</li>)}
      </ul>

      <div style={{ fontSize: 9.5, color: '#777', borderTop: '1px solid #ccc', paddingTop: 8 }}>
        Generated with Edgerunner Builder at dmtoolkit.org/cyberpunk-red — skill/attribute priorities are directional
        guidance only. Confirm exact point totals and Role Ability rules against your core rulebook or GM.
      </div>
    </div>
  )
}
