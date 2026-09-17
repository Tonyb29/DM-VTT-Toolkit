import React, { useState } from 'react'
import {
  Copy, Download, FileText, RotateCcw, CheckCircle, Wand2, PlusCircle, Trash2,
  ChevronRight, ChevronLeft, AlertTriangle, ClipboardCheck,
} from 'lucide-react'
import {
  toCyberpunkRedFoundryCharacter, buildCyberpunkRedCharacterMacro,
  SKILL_CATALOG, PC_STAT_KEYS, PCStatKey, LIFEPATH_FIELDS, CPRPlayerCharacter,
} from '../parser-versions/cyberpunk-red-pc-parser'
import { STEPS as CB_STEPS, STORAGE_KEY as CB_STORAGE_KEY, SavedState as CBSavedState, buildBio as cbBuildBio } from './cyberpunk-red-character-builder'

const T = {
  bg: '#08050a', surface: '#120c16', surface2: '#1a1220',
  border: '#2a1f36', accent: '#f0e000', accentBright: '#ffff40',
  text: '#e8e0f0', textMuted: '#8878a0', textDim: '#544868',
  cyan: '#00e5ff', red: '#ff2060', green: '#40e070', gold: '#f0e000',
}

// Role Ability names are confirmed for Tech ("Maker", from the real Gasket
// export) and Exec ("Teamwork", from the corebook text you sent). The rest
// are from training knowledge, not verified against a real export or the
// book — flag anything that looks wrong and I'll fix it.
const ROLES: { t: string; d: string; ability: string; confirmed: boolean }[] = [
  { t: 'Rockerboy', d: 'You perform, and the performance is the weapon — a voice and a following people rally behind.', ability: 'Charismatic Impact', confirmed: false },
  { t: 'Solo', d: 'Combat is your trade, and you charge for it. Reflex-driven, weapon-focused.', ability: 'Combat Awareness', confirmed: false },
  { t: 'Netrunner', d: 'The real fight happens in the net. Intelligence and Technique carry you further than a gun.', ability: 'Interface', confirmed: false },
  { t: 'Tech', d: 'You build, fix, and improve — usually with parts that weren’t meant to go together.', ability: 'Maker', confirmed: true },
  { t: 'Medtech', d: 'You keep people alive when the dice say they shouldn’t be. Technique and a steady hand.', ability: 'Medicine', confirmed: false },
  { t: 'Media', d: 'You chase the story other people would rather stayed buried. Intelligence and nerve.', ability: 'Credibility', confirmed: true },
  { t: 'Lawman', d: 'You still believe in the badge — procedure and backup when things go bad.', ability: 'Backup', confirmed: true },
  { t: 'Exec', d: 'You move resources and people other Roles can’t touch. Cool under pressure.', ability: 'Teamwork', confirmed: true },
  { t: 'Fixer', d: 'You know a guy who does that. Connections are your whole toolkit.', ability: 'Operator', confirmed: true },
  { t: 'Nomad', d: 'Family, convoy, and the open road. You can drive it and you can fix it.', ability: 'Moto', confirmed: false },
]

type WizWeapon = { name: string; damage: string }
type WizArmor = { name: string; headSp: number; bodySp: number }

type WizState = {
  step: number
  name: string
  role: string
  roleAbility: string
  roleRank: number
  stats: Record<PCStatKey, number>
  skillLevels: Record<string, number>
  weapons: WizWeapon[]
  armor: WizArmor[]
  cyberware: string[]
  gear: string[]
  hp: number
  humanity: number
  lifepath: Record<string, string>
  notes: string
  importedFromBuilder: boolean
}

const WIZ_STORAGE_KEY = 'cpr-pc-create-v1'
const STEP_IDS = ['start', 'role', 'attributes', 'skills', 'gear', 'review'] as const
type StepId = typeof STEP_IDS[number]
const STEP_LABELS: Record<StepId, string> = {
  start: 'Start', role: 'Role', attributes: 'Attributes', skills: 'Skills',
  gear: 'Gear & Cyberware', review: 'Review & Export',
}

function defaultState(): WizState {
  return {
    step: 0, name: '', role: '', roleAbility: '', roleRank: 4,
    stats: Object.fromEntries(PC_STAT_KEYS.map(k => [k, 5])) as Record<PCStatKey, number>,
    skillLevels: {}, weapons: [], armor: [], cyberware: [], gear: [],
    hp: 30, humanity: 50, lifepath: {}, notes: '', importedFromBuilder: false,
  }
}

function loadWiz(): WizState {
  try {
    const raw = localStorage.getItem(WIZ_STORAGE_KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return defaultState()
}
function saveWiz(s: WizState) {
  try { localStorage.setItem(WIZ_STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

// Maps a completed Character Builder dossier onto PC Create's lifepath
// fields. Not every Character Builder pick has a clean PC-sheet home, so
// the full generated bio always goes into Notes as a readable fallback.
function dossierToLifepath(picks: Record<string, number>): Record<string, string> {
  const opt = (id: string) => {
    const step = CB_STEPS.find(s => s.id === id)
    const idx = picks[id]
    return step && idx !== undefined ? step.options[idx].t : ''
  }
  const out: Record<string, string> = {}
  if (opt('homeland')) out.childhoodEnvironment = opt('homeland')
  if (opt('family')) out.familyBackground = opt('family')
  if (opt('temperament')) out.personality = opt('temperament')
  if (opt('style')) out.clothingStyle = opt('style')
  if (opt('detail')) out.affectations = opt('detail')
  if (opt('value')) out.valueMost = opt('value')
  if (opt('person')) out.valuedPerson = opt('person')
  if (opt('possession')) out.valuedPossession = opt('possession')
  if (opt('drive')) out.lifeGoals = opt('drive')
  if (opt('scar')) out.familyCrisis = opt('scar')
  if (opt('rep')) out.roleLifepath = opt('rep')
  return out
}

function readCharacterBuilderDossier(): { role: string; bio: string; lifepath: Record<string, string> } | null {
  try {
    const raw = localStorage.getItem(CB_STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as CBSavedState
    if (!saved?.picks) return null
    const complete = CB_STEPS.every(s => saved.picks[s.id] !== undefined)
    if (!complete) return null
    const roleStep = CB_STEPS.find(s => s.id === 'role')
    const role = roleStep ? roleStep.options[saved.picks.role].t : ''
    return { role, bio: cbBuildBio(saved.picks), lifepath: dossierToLifepath(saved.picks) }
  } catch {
    return null
  }
}

const navBtn = (disabled: boolean, primary = false): React.CSSProperties => ({
  fontWeight: 700, fontSize: 13, letterSpacing: '0.02em', textTransform: 'uppercase',
  background: primary ? (disabled ? T.surface2 : T.text) : 'transparent',
  color: primary ? (disabled ? T.textDim : '#000') : T.text,
  border: `1px solid ${primary ? (disabled ? T.border : T.text) : T.border}`,
  padding: '9px 18px', borderRadius: 7, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
  display: 'flex', alignItems: 'center', gap: 6,
})

const fieldBox: React.CSSProperties = {
  background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '7px 9px',
  color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
}

export default function CyberpunkRedPCApp() {
  const [state, setState] = useState<WizState>(loadWiz)
  const [toast, setToast] = useState('')

  const update = (patch: Partial<WizState>) => {
    const next = { ...state, ...patch }
    setState(next)
    saveWiz(next)
  }
  const goto = (step: number) => update({ step: Math.max(0, Math.min(STEP_IDS.length - 1, step)) })
  const flashToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 1800) }

  const resetAll = () => {
    const fresh = defaultState()
    setState(fresh)
    saveWiz(fresh)
    flashToast('Cleared')
  }

  const dossier = readCharacterBuilderDossier()
  const currentStepId = STEP_IDS[state.step]

  const importDossier = () => {
    if (!dossier) return
    update({ role: dossier.role, lifepath: dossier.lifepath, notes: dossier.bio, importedFromBuilder: true, step: 1 })
    flashToast('Background imported from Character Builder')
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, maxWidth: 620 }}>
          A guided, step-by-step player character creator — Role, Attributes, Skills, Gear, then export a real
          Foundry character actor for your DM to import.
        </div>
        <button onClick={resetAll} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${T.red}55`, color: T.red, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', padding: '7px 12px', borderRadius: 7, cursor: 'pointer' }}>
          <RotateCcw size={12} /> Start Over
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '190px minmax(0,1fr)', gap: 18, alignItems: 'start' }} className="cpr-pc-layout">
        <nav style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, position: 'sticky', top: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textDim, marginBottom: 8, fontWeight: 600 }}>Character Creation</div>
          {STEP_IDS.map((id, i) => (
            <div
              key={id}
              onClick={() => goto(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', cursor: 'pointer',
                borderLeft: `2px solid ${i === state.step ? T.red : 'transparent'}`,
                background: i === state.step ? T.surface2 : 'transparent',
                fontSize: 13, color: i === state.step ? T.text : T.textMuted,
              }}
            >
              <div style={{
                width: 20, height: 20, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${T.border}`, color: T.textDim, fontSize: 10, fontFamily: 'monospace', borderRadius: 4,
              }}>{i + 1}</div>
              <div>{STEP_LABELS[id]}</div>
            </div>
          ))}
        </nav>

        <main style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, minHeight: 460 }}>
          {currentStepId === 'start' && (
            <StartStep state={state} update={update} dossier={dossier} onImport={importDossier} onNext={() => goto(1)} />
          )}
          {currentStepId === 'role' && (
            <RoleStep state={state} update={update} onBack={() => goto(0)} onNext={() => goto(2)} />
          )}
          {currentStepId === 'attributes' && (
            <AttributesStep state={state} update={update} onBack={() => goto(1)} onNext={() => goto(3)} />
          )}
          {currentStepId === 'skills' && (
            <SkillsStep state={state} update={update} onBack={() => goto(2)} onNext={() => goto(4)} />
          )}
          {currentStepId === 'gear' && (
            <GearStep state={state} update={update} onBack={() => goto(3)} onNext={() => goto(5)} />
          )}
          {currentStepId === 'review' && (
            <ReviewStep state={state} onBack={() => goto(4)} onCopy={flashToast} />
          )}
        </main>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: T.gold, color: '#000', fontSize: 12, fontWeight: 600, padding: '9px 16px', borderRadius: 6, zIndex: 20 }}>
          {toast}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cpr-pc-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Step 1: Start ──────────────────────────────────────────────────────────

function StartStep({ state, update, dossier, onImport, onNext }: {
  state: WizState; update: (p: Partial<WizState>) => void
  dossier: { role: string; bio: string; lifepath: Record<string, string> } | null
  onImport: () => void; onNext: () => void
}) {
  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.red, fontWeight: 700 }}>Start</div>
      <h2 style={{ margin: '6px 0 6px', fontSize: 22, color: T.text }}>Name Your Edgerunner</h2>
      <p style={{ margin: '0 0 16px', color: T.textMuted, fontSize: 13.5, maxWidth: '60ch', lineHeight: 1.5 }}>
        Then either bring in a finished background from Character Builder, or start fresh here.
      </p>

      <div style={{ marginBottom: 20, maxWidth: 360 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textDim, textTransform: 'uppercase', marginBottom: 5 }}>Character Name</div>
        <input
          value={state.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="Handle or full name"
          style={{ ...fieldBox, width: '100%', fontSize: 14 }}
        />
      </div>

      {dossier ? (
        <div style={{ background: T.surface2, border: `1px solid ${T.gold}55`, borderRadius: 8, padding: '16px 18px', marginBottom: 18, maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Wand2 size={14} color={T.gold} />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Background Found in Character Builder</div>
          </div>
          <div style={{ fontSize: 12, color: T.cyan, marginBottom: 6 }}>Role: {dossier.role}</div>
          <p style={{ fontSize: 12.5, color: T.text, lineHeight: 1.6, margin: '0 0 12px' }}>{dossier.bio}</p>
          <button onClick={onImport} disabled={!state.name.trim()} style={navBtn(!state.name.trim(), true)}>
            <ClipboardCheck size={13} /> Import This Background
          </button>
          {!state.name.trim() && <div style={{ fontSize: 11, color: T.textDim, marginTop: 6 }}>Enter a name above first.</div>}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: T.textDim, marginBottom: 18, maxWidth: 500, lineHeight: 1.5 }}>
          No completed Character Builder dossier found in this browser. Build one on the Character Builder tab first if
          you want to import a background — or just continue on your own.
        </div>
      )}

      <button onClick={onNext} disabled={!state.name.trim()} style={navBtn(!state.name.trim(), true)}>
        Start Fresh <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ─── Step 2: Role ───────────────────────────────────────────────────────────

function RoleStep({ state, update, onBack, onNext }: {
  state: WizState; update: (p: Partial<WizState>) => void; onBack: () => void; onNext: () => void
}) {
  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.red, fontWeight: 700 }}>Step 2 of 6</div>
      <h2 style={{ margin: '6px 0 6px', fontSize: 22, color: T.text }}>Pick Your Role</h2>
      <p style={{ margin: '0 0 16px', color: T.textMuted, fontSize: 13.5, maxWidth: '60ch', lineHeight: 1.5 }}>
        Your Role sets your Role Ability and shapes which stats/skills matter most.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10, marginBottom: 18 }} className="cpr-pc-grid">
        {ROLES.map(r => (
          <button
            key={r.t}
            onClick={() => update({ role: r.t, roleAbility: r.ability })}
            style={{
              textAlign: 'left', background: state.role === r.t ? `${T.red}14` : T.surface2,
              border: `1px solid ${state.role === r.t ? T.red : T.border}`,
              padding: '12px 14px', borderRadius: 8, cursor: 'pointer', color: T.text,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              {r.t}
              <span style={{ fontSize: 10, fontWeight: 400, color: T.cyan }}>{r.ability}{!r.confirmed && <span title="Not yet verified against the core book" style={{ color: T.gold }}> ?</span>}</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>{r.d}</div>
          </button>
        ))}
      </div>

      {state.role && !ROLES.find(r => r.t === state.role)?.confirmed && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: `${T.gold}14`, border: `1px solid ${T.gold}44`, borderRadius: 7, padding: '9px 12px', fontSize: 11.5, color: T.text, lineHeight: 1.5, marginBottom: 16, maxWidth: 500 }}>
          <AlertTriangle size={13} color={T.gold} style={{ flex: 'none', marginTop: 1 }} />
          <div>"{state.roleAbility}" for {state.role} is from general knowledge, not verified against the core book or a real export — double check the name before relying on it.</div>
        </div>
      )}

      <div style={{ marginBottom: 20, maxWidth: 220 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textDim, textTransform: 'uppercase', marginBottom: 5 }}>
          Role Rank <span style={{ color: T.textDim, fontWeight: 400, textTransform: 'none' }}>(confirm against your core rulebook)</span>
        </div>
        <input
          type="number" min={0} max={10}
          value={state.roleRank}
          onChange={e => update({ roleRank: parseInt(e.target.value, 10) || 0 })}
          style={{ ...fieldBox, width: 80 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={navBtn(false)}><ChevronLeft size={14} /> Back</button>
        <button onClick={onNext} disabled={!state.role} style={navBtn(!state.role, true)}>Next <ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Step 3: Attributes ─────────────────────────────────────────────────────

function PlaceholderBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: `${T.gold}14`, border: `1px solid ${T.gold}44`, borderRadius: 7, padding: '10px 12px', fontSize: 12, color: T.text, lineHeight: 1.5, marginBottom: 18 }}>
      <AlertTriangle size={14} color={T.gold} style={{ flex: 'none', marginTop: 1 }} />
      <div>{children}</div>
    </div>
  )
}

function AttributesStep({ state, update, onBack, onNext }: {
  state: WizState; update: (p: Partial<WizState>) => void; onBack: () => void; onNext: () => void
}) {
  const setStat = (k: PCStatKey, v: number) => update({ stats: { ...state.stats, [k]: v } })
  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.red, fontWeight: 700 }}>Step 3 of 6</div>
      <h2 style={{ margin: '6px 0 6px', fontSize: 22, color: T.text }}>Set Your Attributes</h2>
      <PlaceholderBanner>
        Point-buy budget and per-point costs aren't wired in yet — enter your allocated values directly for now.
        Enter final values, not a budget spend; validation against the official point totals is coming.
      </PlaceholderBanner>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10, marginBottom: 20 }}>
        {PC_STAT_KEYS.map(k => (
          <div key={k} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{k}</div>
            <input
              type="number" value={state.stats[k]}
              onChange={e => setStat(k, parseInt(e.target.value, 10) || 0)}
              style={{ ...fieldBox, width: '100%', textAlign: 'center', fontSize: 16, fontWeight: 700, padding: '4px 2px' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textDim, textTransform: 'uppercase', marginBottom: 5 }}>HP</div>
          <input type="number" value={state.hp} onChange={e => update({ hp: parseInt(e.target.value, 10) || 0 })} style={{ ...fieldBox, width: 100 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.06em', color: T.textDim, textTransform: 'uppercase', marginBottom: 5 }}>
            Humanity <span style={{ fontWeight: 400, textTransform: 'none' }}>(usually EMP × 10)</span>
          </div>
          <input type="number" value={state.humanity} onChange={e => update({ humanity: parseInt(e.target.value, 10) || 0 })} style={{ ...fieldBox, width: 100 }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={navBtn(false)}><ChevronLeft size={14} /> Back</button>
        <button onClick={onNext} style={navBtn(false, true)}>Next <ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Step 4: Skills ─────────────────────────────────────────────────────────

function SkillsStep({ state, update, onBack, onNext }: {
  state: WizState; update: (p: Partial<WizState>) => void; onBack: () => void; onNext: () => void
}) {
  const categories = Array.from(new Set(SKILL_CATALOG.map(s => s.category)))
  const setLevel = (name: string, v: number) => update({ skillLevels: { ...state.skillLevels, [name]: v } })
  const nonZero = Object.values(state.skillLevels).filter(v => v > 0).length

  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.red, fontWeight: 700 }}>Step 4 of 6</div>
      <h2 style={{ margin: '6px 0 6px', fontSize: 22, color: T.text }}>Allocate Skill Points</h2>
      <PlaceholderBanner>
        Skill point budget and Role/Education bonuses aren't wired in yet — enter final skill levels directly.
        All {SKILL_CATALOG.length} Core skills are listed; anything left at 0 stays untrained. ({nonZero} above 0 so far.)
      </PlaceholderBanner>

      <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 6, marginBottom: 18 }}>
        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: T.textDim, textTransform: 'uppercase', marginBottom: 6, borderBottom: `1px solid ${T.border}`, paddingBottom: 4 }}>
              {cat.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
              {SKILL_CATALOG.filter(s => s.category === cat).map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '5px 8px' }}>
                  <div style={{ fontSize: 12, color: T.text }}>{s.name} <span style={{ color: T.textDim, fontSize: 10 }}>({s.stat.toUpperCase()})</span></div>
                  <input
                    type="number" min={0} value={state.skillLevels[s.name] ?? 0}
                    onChange={e => setLevel(s.name, parseInt(e.target.value, 10) || 0)}
                    style={{ ...fieldBox, width: 48, textAlign: 'center', padding: '3px 2px', fontSize: 12 }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={navBtn(false)}><ChevronLeft size={14} /> Back</button>
        <button onClick={onNext} style={navBtn(false, true)}>Next <ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Step 5: Gear & Cyberware ───────────────────────────────────────────────

function ChipList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.text, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 5, padding: '4px 8px' }}>
          {it}
          <Trash2 size={11} style={{ cursor: 'pointer', color: T.textDim }} onClick={() => onRemove(i)} />
        </span>
      ))}
    </div>
  )
}

function GearStep({ state, update, onBack, onNext }: {
  state: WizState; update: (p: Partial<WizState>) => void; onBack: () => void; onNext: () => void
}) {
  const [wName, setWName] = useState(''); const [wDmg, setWDmg] = useState('2d6')
  const [aName, setAName] = useState(''); const [aHead, setAHead] = useState(11); const [aBody, setABody] = useState(11)
  const [cName, setCName] = useState('')
  const [gName, setGName] = useState('')

  const addWeapon = () => { if (!wName.trim()) return; update({ weapons: [...state.weapons, { name: wName.trim(), damage: wDmg.trim() || '1d6' }] }); setWName('') }
  const addArmor = () => { if (!aName.trim()) return; update({ armor: [...state.armor, { name: aName.trim(), headSp: aHead, bodySp: aBody }] }); setAName('') }
  const addCyberware = () => { if (!cName.trim()) return; update({ cyberware: [...state.cyberware, cName.trim()] }); setCName('') }
  const addGear = () => { if (!gName.trim()) return; update({ gear: [...state.gear, gName.trim()] }); setGName('') }

  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.red, fontWeight: 700 }}>Step 5 of 6</div>
      <h2 style={{ margin: '6px 0 6px', fontSize: 22, color: T.text }}>Gear & Cyberware</h2>
      <p style={{ margin: '0 0 16px', color: T.textMuted, fontSize: 13.5 }}>Add what your character is carrying and installed with.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }} className="cpr-pc-grid">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', marginBottom: 8 }}>Weapons</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={wName} onChange={e => setWName(e.target.value)} placeholder="Medium Pistol" style={{ ...fieldBox, flex: 1 }} />
            <input value={wDmg} onChange={e => setWDmg(e.target.value)} placeholder="2d6" style={{ ...fieldBox, width: 60 }} />
            <button onClick={addWeapon} style={{ ...navBtn(false), padding: '7px 10px' }}><PlusCircle size={14} /></button>
          </div>
          <ChipList items={state.weapons.map(w => `${w.name} (${w.damage})`)} onRemove={i => update({ weapons: state.weapons.filter((_, idx) => idx !== i) })} />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', marginBottom: 8 }}>Armor</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={aName} onChange={e => setAName(e.target.value)} placeholder="Light Armorjack" style={{ ...fieldBox, flex: 1 }} />
            <input type="number" value={aHead} onChange={e => setAHead(parseInt(e.target.value, 10) || 0)} style={{ ...fieldBox, width: 48 }} title="Head SP" />
            <input type="number" value={aBody} onChange={e => setABody(parseInt(e.target.value, 10) || 0)} style={{ ...fieldBox, width: 48 }} title="Body SP" />
            <button onClick={addArmor} style={{ ...navBtn(false), padding: '7px 10px' }}><PlusCircle size={14} /></button>
          </div>
          <ChipList items={state.armor.map(a => `${a.name} (Head ${a.headSp}/Body ${a.bodySp})`)} onRemove={i => update({ armor: state.armor.filter((_, idx) => idx !== i) })} />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', marginBottom: 8 }}>Cyberware</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={cName} onChange={e => setCName(e.target.value)} placeholder="Cyberoptic" style={{ ...fieldBox, flex: 1 }} />
            <button onClick={addCyberware} style={{ ...navBtn(false), padding: '7px 10px' }}><PlusCircle size={14} /></button>
          </div>
          <ChipList items={state.cyberware} onRemove={i => update({ cyberware: state.cyberware.filter((_, idx) => idx !== i) })} />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', marginBottom: 8 }}>Gear</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Agent, Toolkit..." style={{ ...fieldBox, flex: 1 }} />
            <button onClick={addGear} style={{ ...navBtn(false), padding: '7px 10px' }}><PlusCircle size={14} /></button>
          </div>
          <ChipList items={state.gear} onRemove={i => update({ gear: state.gear.filter((_, idx) => idx !== i) })} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button onClick={onBack} style={navBtn(false)}><ChevronLeft size={14} /> Back</button>
        <button onClick={onNext} style={navBtn(false, true)}>Next <ChevronRight size={14} /></button>
      </div>
    </div>
  )
}

// ─── Step 6: Review & Export ────────────────────────────────────────────────

function ReviewStep({ state, onBack, onCopy }: { state: WizState; onBack: () => void; onCopy: (msg: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null)

  const pc: CPRPlayerCharacter = {
    name: state.name || 'Unknown Edgerunner',
    role: state.role,
    roleAbility: state.roleAbility,
    roleRank: state.roleRank,
    stats: state.stats,
    hp: state.hp,
    humanity: state.humanity,
    skillLevels: new Map(Object.entries(state.skillLevels).filter(([, v]) => v > 0).map(([k, v]) => [k.toLowerCase(), v])),
    weapons: state.weapons.map(w => ({ name: w.name, damage: w.damage, isRanged: /pistol|rifle|shotgun|smg|heavy|bow|launcher/i.test(w.name), handsReq: /heavy|rifle|shotgun/i.test(w.name) ? 2 : 1 })),
    armor: state.armor,
    cyberware: state.cyberware,
    gear: state.gear,
    lifepath: state.lifepath,
    notes: state.notes,
  }

  const foundryActor = toCyberpunkRedFoundryCharacter(pc)
  const macro = buildCyberpunkRedCharacterMacro(foundryActor)
  const nonZeroSkills = Array.from(pc.skillLevels.entries())
  const filledLifepath = LIFEPATH_FIELDS.filter(([, key]) => pc.lifepath[key])

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); onCopy('Copied to clipboard'); setTimeout(() => setCopied(null), 1500) }).catch(() => onCopy('Copy failed — select manually'))
  }

  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', borderBottom: `2px solid ${T.red}`, paddingBottom: 14, marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 26, color: T.text }}>{pc.name}</h2>
        {pc.role && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', background: T.red, color: '#fff', padding: '6px 12px', borderRadius: 6 }}>{pc.role} — {pc.roleAbility} (Rank {pc.roleRank})</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 6, marginBottom: 16 }}>
        {PC_STAT_KEYS.map(k => (
          <div key={k} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{pc.stats[k]}</div>
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <div style={{ flex: 1, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.red }}>{pc.hp}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>HP</div>
        </div>
        <div style={{ flex: 1, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.cyan }}>{pc.humanity}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>Humanity</div>
        </div>
      </div>

      {nonZeroSkills.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Skills Above 0 ({nonZeroSkills.length} of {SKILL_CATALOG.length})</div>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>{nonZeroSkills.map(([n, l]) => `${n} ${l}`).join(' · ')}</div>
        </div>
      )}

      {(state.weapons.length > 0 || state.armor.length > 0 || state.cyberware.length > 0 || state.gear.length > 0) && (
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
          {state.weapons.length > 0 && <div>Weapons: {state.weapons.map(w => `${w.name} (${w.damage})`).join(', ')}</div>}
          {state.armor.length > 0 && <div>Armor: {state.armor.map(a => `${a.name} (Head ${a.headSp}/Body ${a.bodySp})`).join(', ')}</div>}
          {state.cyberware.length > 0 && <div>Cyberware: {state.cyberware.join(', ')}</div>}
          {state.gear.length > 0 && <div>Gear: {state.gear.join(', ')}</div>}
        </div>
      )}

      {filledLifepath.length > 0 && (
        <div style={{ fontSize: 11.5, color: T.textMuted, borderTop: `1px solid ${T.border}`, paddingTop: 10, marginBottom: 16 }}>
          {filledLifepath.map(([label, key]) => (
            <div key={key} style={{ marginBottom: 4 }}>
              <span style={{ color: T.textDim, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em' }}>{label}: </span>
              <span style={{ color: T.text }}>{pc.lifepath[key]}</span>
            </div>
          ))}
        </div>
      )}

      {pc.notes && (
        <div style={{ background: T.surface2, borderLeft: `3px solid ${T.gold}`, padding: '12px 14px', fontSize: 12.5, lineHeight: 1.6, marginBottom: 20, borderRadius: '0 8px 8px 0', color: T.text }}>
          {pc.notes}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <button onClick={() => copyText(macro, 'macro')} style={{ background: T.red, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          {copied === 'macro' ? <CheckCircle size={14} /> : <Copy size={14} />} {copied === 'macro' ? 'Copied!' : 'Copy Import Macro (for your DM)'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => copyText(JSON.stringify(foundryActor, null, 2), 'json')} style={{ flex: 1, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {copied === 'json' ? <CheckCircle size={12} /> : <FileText size={12} />} {copied === 'json' ? 'Copied!' : 'Copy JSON'}
          </button>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(foundryActor, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `${pc.name.replace(/\s+/g, '-').toLowerCase()}.json`
            a.click()
          }} style={{ flex: 1, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Download size={12} /> Download JSON
          </button>
        </div>
      </div>

      <button onClick={onBack} style={navBtn(false)}><ChevronLeft size={14} /> Back</button>
    </div>
  )
}
