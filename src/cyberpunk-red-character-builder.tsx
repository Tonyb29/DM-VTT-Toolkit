import React, { useState } from 'react'
import { Check, Copy, Dices, RotateCcw, Shuffle, Star } from 'lucide-react'

const T = {
  bg: '#08050a', surface: '#120c16', surface2: '#1a1220',
  border: '#2a1f36', accent: '#f0e000', accentBright: '#ffff40',
  text: '#e8e0f0', textMuted: '#8878a0', textDim: '#544868',
  cyan: '#00e5ff', red: '#ff2060', green: '#40e070', gold: '#f0e000',
}

type Option = { t: string; d: string; cue: string }
type Step = { id: string; title: string; eyebrow: string; sub: string; options: Option[] }

const STEPS: Step[] = [
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
    id: 'family', title: 'What Kind of Family Raised You?', eyebrow: 'Household',
    sub: 'Whoever raised you — blood, crew, or corp-appointed guardian — shaped what you think is normal to risk.',
    options: [
      { t: 'Corporate Climbers', d: 'Parents who measured love in contract renewals and always had one eye on the next promotion.', cue: "Play it performance-conscious. You still flinch at being 'reviewed,' even informally." },
      { t: 'Street-Level Hustlers', d: 'Parents who ran angles — some legal, most not — to keep the lights on.', cue: 'Play it quick with a con and quicker to spot one being run on you.' },
      { t: 'Nomad Pack Blood', d: 'Family meant the whole convoy, not just the people who share your last name.', cue: 'Play it loyal to your circle first, rules and laws a distant second.' },
      { t: 'Gang-Affiliated', d: "Colors meant protection, obligation, and a debt that doesn't expire just because you left the block.", cue: 'Play it with old reflexes — respect and disrespect both register instantly and physically.' },
      { t: 'Off-Grid Survivalists', d: 'A family that trusted almost no one outside itself, on principle, for reasons that turned out to be pretty good ones.', cue: 'Play it guarded. You count exits in every room and you never say more than you have to.' },
      { t: 'Media Lineage', d: "You grew up performing for a feed, one way or another — a family already used to being watched.", cue: "Play it a little performative even at rest. Part of you is always aware there could be an audience." },
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
    id: 'style', title: "What's Your Signature Look?", eyebrow: 'Style',
    sub: 'How you present is armor and message both. Pick the version of yourself people recognize on sight.',
    options: [
      { t: 'Chrome-Forward', d: 'Visible cyberware worn openly, almost like jewelry — you want people to clock what you can do.', cue: 'Play it unbothered by stares. You move like the chrome is just part of you, because it is.' },
      { t: 'Analog Throwback', d: 'Deliberately low-tech — real fabric, real leather, minimal visible augmentation.', cue: 'Play it a little stubborn about the old ways, even when the new ways would be easier.' },
      { t: 'Corporate-Clean', d: 'Pressed, branded, unremarkable on purpose — you blend into a boardroom as easily as a back alley.', cue: 'Play it controlled and neutral-faced. Your emotions are information you choose to release.' },
      { t: 'Scavenger-Punk', d: "Patched gear, salvaged tech, and DIY mods that shouldn't work but do.", cue: "Play it inventive and a little chaotic — you'll jury-rig a solution before you'd wait for the right part." },
      { t: 'Street-Formal', d: "A look that says 'I dress up for violence' — sharp lines built for a fight, not a party.", cue: 'Play it deliberate about presentation, like every entrance is staged.' },
      { t: 'Subcultural', d: 'Full commitment to a scene — rocker, tech-priest, whatever tribe claimed you first.', cue: 'Play it tribal. You clock other members of your scene instantly, and outsiders slightly less patiently.' },
    ],
  },
  {
    id: 'drive', title: 'What Drives You?', eyebrow: 'Motivation',
    sub: "The thing that actually gets you out of bed for a job — not the cover story, the real one.",
    options: [
      { t: 'Debt', d: "You owe someone, and they collect. Every job is partly about making that number smaller.", cue: 'Play it a little tense around money talk, even for small amounts.' },
      { t: 'Family', d: "Blood or chosen, someone depends on what you bring home, and that's not negotiable.", cue: 'Play it protective past the point of caution when family comes up.' },
      { t: 'Reputation', d: "The name matters more than the paycheck. You turn down easy money that doesn't build the legend.", cue: 'Play it image-conscious — you think about how a choice will read before you make it.' },
      { t: 'Revenge', d: "Someone's still breathing who shouldn't be, and you haven't forgotten it, no matter how long it's been.", cue: "Play it patient about the one thing you're not patient about at all." },
      { t: 'Escape', d: "One more job and you're gone for good — you've said that before, and you'll probably say it again.", cue: "Play it restless. You're always half-planning an exit, from the job and from the city." },
      { t: 'Belief', d: 'A cause, a crew, or a code you actually follow, even when it costs you.', cue: "Play it principled in ways that occasionally get in your own way, and you wouldn't have it otherwise." },
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
]

const STORAGE_KEY = 'cpr-character-builder-v1'

type SavedState = { step: number; picks: Record<string, number>; mode: Record<string, 'choose' | 'roll'> }

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

function buildBio(picks: Record<string, number>) {
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
    const picks: Record<string, number> = {}
    STEPS.forEach(s => { picks[s.id] = Math.floor(Math.random() * s.options.length) })
    update({ ...state, picks, step: STEPS.length })
    flashToast('Full lifepath rolled')
  }

  const resetAll = () => {
    update({ step: 0, picks: {}, mode: {} })
    flashToast('Cleared')
  }

  const goto = (idx: number) => update({ ...state, step: idx })

  const complete = Object.keys(state.picks).length >= STEPS.length
  const atSummary = state.step >= STEPS.length

  const copyDossier = () => {
    const opt = (id: string) => STEPS.find(s => s.id === id)!.options[state.picks[id]]
    const text = 'EDGERUNNER DOSSIER\n' +
      STEPS.map(s => `${s.eyebrow}: ${opt(s.id).t}`).join('\n') +
      '\n\n' + buildBio(state.picks) +
      '\n\nROLEPLAY CUES\n' + STEPS.map(s => `- ${opt(s.id).cue}`).join('\n')
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
        {done ? <Check size={11} /> : (idx === STEPS.length ? <Star size={11} /> : idx + 1)}
      </div>
      <div>{label}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
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
        <nav style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, position: 'sticky', top: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 8, fontWeight: 600 }}>Lifepath</div>
          {STEPS.map((s, i) => railItem(s.eyebrow, i, i === state.step && !atSummary, state.picks[s.id] !== undefined))}
          {railItem('Dossier', STEPS.length, atSummary, false, !complete)}
        </nav>

        <main style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, minHeight: 460, display: 'flex', flexDirection: 'column' }}>
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
              step={STEPS[state.step]}
              stepIndex={state.step}
              mode={state.mode[STEPS[state.step].id] || 'choose'}
              picked={state.picks[STEPS[state.step].id]}
              dieFace={dieFace}
              rolling={rolling}
              onMode={m => setMode(STEPS[state.step].id, m)}
              onPick={idx => choose(STEPS[state.step].id, idx)}
              onRoll={() => roll(STEPS[state.step])}
              onBack={() => goto(Math.max(0, state.step - 1))}
              onNext={() => goto(Math.min(STEPS.length, state.step + 1))}
            />
          )}
        </main>

        <aside style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, position: 'sticky', top: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 10, fontWeight: 600 }}>Dossier</div>
          {STEPS.map(s => {
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
        <div style={{
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
  step, stepIndex, mode, picked, dieFace, rolling, onMode, onPick, onRoll, onBack, onNext,
}: {
  step: Step; stepIndex: number; mode: 'choose' | 'roll'; picked?: number
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
          {stepIndex === STEPS.length - 1 ? 'View Dossier →' : 'Next →'}
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

  const opt = (id: string) => STEPS.find(s => s.id === id)!.options[state.picks[id]]
  const role = opt('role')

  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', borderBottom: `2px solid ${T.red}`, paddingBottom: 14, marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 26, color: T.text }}>Character Dossier</h2>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: T.red, color: '#fff', padding: '6px 12px', borderRadius: 6, boxShadow: `0 0 14px ${T.red}66` }}>{role.t}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {STEPS.map(s => (
          <span key={s.id} style={{ fontSize: 11, color: T.cyan, border: `1px solid ${T.cyan}`, padding: '4px 10px', borderRadius: 5 }}>{opt(s.id).t}</span>
        ))}
      </div>

      <div style={{ background: T.surface2, borderLeft: `3px solid ${T.gold}`, padding: '16px 18px', fontSize: 14, lineHeight: 1.7, marginBottom: 22, borderRadius: '0 8px 8px 0' }}>
        {buildBio(state.picks)}
      </div>

      <div style={{ fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted, fontWeight: 700, marginBottom: 10 }}>Roleplay Cues</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12, marginBottom: 22 }} className="cpr-cb-grid">
        {STEPS.map(s => (
          <div key={s.id} style={{ background: T.surface2, border: `1px solid ${T.border}`, padding: '12px 14px', borderRadius: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textDim, textTransform: 'uppercase' }}>{s.eyebrow} — {opt(s.id).t}</div>
            <div style={{ fontSize: 12.5, marginTop: 5, lineHeight: 1.5, color: T.text }}>{opt(s.id).cue}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onCopy} style={{ ...navBtn(false, true), display: 'flex', alignItems: 'center', gap: 7 }}>
          <Copy size={13} /> Copy Dossier as Text
        </button>
        <button onClick={onEdit} style={navBtn(false)}>← Edit Answers</button>
        <button onClick={onReroll} style={navBtn(false)}>Reroll Everything</button>
      </div>
    </div>
  )
}
