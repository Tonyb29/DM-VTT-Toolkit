// pf2e-app.tsx
// Pathfinder 2e Stat Block Parser — Foundry VTT JSON Exporter
// Standalone tool at dmtoolkit.org/pathfinder

import { useState, useRef, useCallback } from 'react'
import { Copy, Download, FileJson, FileText, Loader, RotateCcw, Sparkles, Settings, Key, CheckCircle, AlertTriangle, Trash2, Shield, ExternalLink, ChevronDown, ChevronRight, X, Zap, RefreshCw, Layers, Link } from 'lucide-react'
import { parsePF2eStatBlock } from '../parser-versions/pf2e-parser'
import { hasApiKey, getApiKey, setApiKey, clearApiKey, generatePF2eStatBlock, extractPF2eStatBlockFromUrl } from '../parser-versions/claude-api'

// ─── Themes ───────────────────────────────────────────────────────────────────
const PF2E_THEMES = {
  ember: {
    label: 'Ember',
    swatch: '#c45500',
    bg: '#0b0805', surface: '#180e06', surface2: '#221509',
    border: '#3d2008', accent: '#c45500', accentBright: '#e06010',
    accentDim: '#2d1200', accentText: '#d4a855', gold: '#d4a855',
    goldDim: '#7a5c22', text: '#ede0c8', textMuted: '#8b7050',
    textDim: '#5a4030', green: '#5a9a5a', red: '#c05050', blue: '#5080b0',
  },
  verdant: {
    label: 'Verdant',
    swatch: '#2d7a2d',
    bg: '#060c06', surface: '#0a150a', surface2: '#0e1e0e',
    border: '#1a3a1a', accent: '#2d7a2d', accentBright: '#3da03d',
    accentDim: '#0a1f0a', accentText: '#7ec87e', gold: '#7ec87e',
    goldDim: '#3a6a3a', text: '#d4ecd4', textMuted: '#6a946a',
    textDim: '#3a5a3a', green: '#5a9a5a', red: '#c05050', blue: '#5080b0',
  },
  arcane: {
    label: 'Arcane',
    swatch: '#6633cc',
    bg: '#080610', surface: '#100c1e', surface2: '#181230',
    border: '#2d1f5a', accent: '#6633cc', accentBright: '#8855ee',
    accentDim: '#1a0f3a', accentText: '#c4a0f0', gold: '#c4a0f0',
    goldDim: '#6a4a9a', text: '#e8e0f8', textMuted: '#8070a8',
    textDim: '#4a3a70', green: '#5a9a5a', red: '#c05050', blue: '#7090d0',
  },
  iron: {
    label: 'Iron',
    swatch: '#607080',
    bg: '#08090a', surface: '#111418', surface2: '#181d22',
    border: '#2a3040', accent: '#607080', accentBright: '#7a90a8',
    accentDim: '#1a2030', accentText: '#a8bcd0', gold: '#a8bcd0',
    goldDim: '#4a5a6a', text: '#d8e0e8', textMuted: '#708090',
    textDim: '#405060', green: '#5a9a5a', red: '#c05050', blue: '#5080b0',
  },
} as const
type PF2EThemeKey = keyof typeof PF2E_THEMES
const THEME_STORAGE_KEY = 'pf2e_theme'

// Module-level T — swapped on theme change; triggers re-render via state
let T = PF2E_THEMES[(localStorage.getItem(THEME_STORAGE_KEY) as PF2EThemeKey) ?? 'ember'] ?? PF2E_THEMES.ember

// ─── Action Cost Symbol ───────────────────────────────────────────────────────
function actionSymbol(type: string, value: number | null): string {
  if (type === 'reaction') return '↺'
  if (type === 'free')     return '◇'
  if (type === 'passive')  return ''
  return '◆'.repeat(value ?? 1)
}

// ─── Trait Badge ──────────────────────────────────────────────────────────────
function traitColor(trait: string): string {
  if (['chaotic','evil'].includes(trait))            return '#8b0000'
  if (['lawful','good'].includes(trait))             return '#1a4a8a'
  if (['neutral'].includes(trait))                   return '#4a4a4a'
  if (['uncommon'].includes(trait))                  return '#7a3a10'
  if (['rare'].includes(trait))                      return '#4a1a6a'
  if (['unique'].includes(trait))                    return '#6a1a1a'
  return '#2d1200'
}

function TraitBadge({ trait }: { trait: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: traitColor(trait),
      border: `1px solid ${T.accentBright}55`,
      color: T.accentText,
      borderRadius: 3,
      padding: '1px 7px',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
    }}>
      {trait}
    </span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ borderTop: `1px solid ${T.border}`, margin: '8px 0' }} />
}

// ─── Stat Block Preview ───────────────────────────────────────────────────────
function StatBlockPreview({ actor }: { actor: any }) {
  const sys  = actor.system
  const atts = sys.attributes
  const det  = sys.details

  const formatMod = (n: number) => n >= 0 ? `+${n}` : `${n}`

  const meleeItems   = actor.items.filter((i: any) => i.type === 'melee')
  const actionItems  = actor.items.filter((i: any) => i.type === 'action')
  const spellEntries = actor.items.filter((i: any) => i.type === 'spellcastingEntry')
  const spellItems   = actor.items.filter((i: any) => i.type === 'spell')

  const senseStr = [
    ...(sys.perception.senses ?? []).map((s: any) => {
      const parts = [s.type.replace(/([A-Z])/g, ' $1').toLowerCase().trim()]
      if (s.acuity) parts.push(`(${s.acuity}`)
      if (s.range)  parts[parts.length - 1] += `, ${s.range} ft`
      if (s.acuity) parts[parts.length - 1] += ')'
      return parts.join(' ')
    }),
  ].join(', ')

  const speedStr = [
    `${atts.speed.value} ft`,
    ...(atts.speed.otherSpeeds ?? []).map((s: any) => `${s.type} ${s.value} ft`),
  ].join(', ')

  const skillStr = Object.entries(sys.skills as Record<string, {base:number}>)
    .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${formatMod(v.base)}`)
    .join(', ')

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 6,
      padding: '14px 16px',
      fontFamily: 'system-ui, sans-serif',
      fontSize: 13,
      color: T.text,
      lineHeight: 1.5,
    }}>
      {/* Name + Level */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: T.accentText, fontFamily: "'Cinzel', serif", letterSpacing: '0.5px' }}>
          {actor.name}
        </span>
        <span style={{
          background: T.accentDim, border: `1px solid ${T.accent}66`,
          color: T.accentText, borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 700,
        }}>
          Level {det.level.value}
        </span>
      </div>

      {/* Traits */}
      {sys.traits.value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {sys.traits.rarity !== 'common' && <TraitBadge trait={sys.traits.rarity} />}
          {sys.traits.value.map((t: string) => <TraitBadge key={t} trait={t} />)}
          <span style={{
            background: '#1a1a2a', border: `1px solid #33366644`,
            color: '#8898aa', borderRadius: 3, padding: '1px 7px', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.4px',
          }}>
            {sys.traits.size.value === 'med' ? 'Medium' :
             sys.traits.size.value === 'lg' ? 'Large' :
             sys.traits.size.value === 'sm' ? 'Small' :
             sys.traits.size.value.charAt(0).toUpperCase() + sys.traits.size.value.slice(1)}
          </span>
        </div>
      )}

      <Divider />

      {/* Perception + Languages */}
      <div style={{ marginBottom: 2 }}>
        <span style={{ color: T.textMuted, fontWeight: 600 }}>Perception </span>
        <span style={{ color: T.text }}>{formatMod(sys.perception.mod)}</span>
        {senseStr && <span style={{ color: T.textMuted }}>;  {senseStr}</span>}
      </div>
      {det.languages.value.length > 0 && (
        <div style={{ marginBottom: 2 }}>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Languages </span>
          <span style={{ color: T.text }}>{det.languages.value.join(', ')}</span>
        </div>
      )}
      {skillStr && (
        <div style={{ marginBottom: 2 }}>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Skills </span>
          <span style={{ color: T.text }}>{skillStr}</span>
        </div>
      )}

      {/* Ability Scores */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6, marginBottom: 2 }}>
        {(['str','dex','con','int','wis','cha'] as const).map(ab => (
          <div key={ab} style={{ textAlign: 'center' }}>
            <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{ab}</div>
            <div style={{ color: T.text, fontWeight: 600 }}>{formatMod(sys.abilities[ab].mod)}</div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Defenses */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 4 }}>
        <div>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>AC </span>
          <span style={{ color: T.text, fontWeight: 700 }}>{atts.ac.value}</span>
          {atts.ac.details && <span style={{ color: T.textMuted }}> ({atts.ac.details})</span>}
        </div>
        <div>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Fort </span>
          <span style={{ color: T.text }}>{formatMod(sys.saves.fortitude.value)}</span>
          <span style={{ color: T.textDim }}>,  </span>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Ref </span>
          <span style={{ color: T.text }}>{formatMod(sys.saves.reflex.value)}</span>
          <span style={{ color: T.textDim }}>,  </span>
          <span style={{ color: T.textMuted, fontWeight: 600 }}>Will </span>
          <span style={{ color: T.text }}>{formatMod(sys.saves.will.value)}</span>
        </div>
      </div>
      <div style={{ marginBottom: 2 }}>
        <span style={{ color: T.textMuted, fontWeight: 600 }}>HP </span>
        <span style={{ color: T.text, fontWeight: 700 }}>{atts.hp.max}</span>
        {atts.hp.details && <span style={{ color: T.textMuted }}> ({atts.hp.details})</span>}
        {(atts.immunities ?? []).length > 0 && (
          <>
            <span style={{ color: T.textDim }}>; </span>
            <span style={{ color: T.textMuted, fontWeight: 600 }}>Immunities </span>
            <span style={{ color: T.text }}>{atts.immunities.map((i: any) => i.type).join(', ')}</span>
          </>
        )}
        {(atts.weaknesses ?? []).length > 0 && (
          <>
            <span style={{ color: T.textDim }}>; </span>
            <span style={{ color: T.textMuted, fontWeight: 600 }}>Weaknesses </span>
            <span style={{ color: T.text }}>{atts.weaknesses.map((w: any) => `${w.type} ${w.value}`).join(', ')}</span>
          </>
        )}
        {(atts.resistances ?? []).length > 0 && (
          <>
            <span style={{ color: T.textDim }}>; </span>
            <span style={{ color: T.textMuted, fontWeight: 600 }}>Resistances </span>
            <span style={{ color: T.text }}>{atts.resistances.map((r: any) => `${r.type} ${r.value}`).join(', ')}</span>
          </>
        )}
      </div>
      {atts.allSaves?.value && (
        <div style={{ color: T.textMuted, fontSize: 12 }}>{atts.allSaves.value}</div>
      )}

      <Divider />

      {/* Speed */}
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: T.textMuted, fontWeight: 600 }}>Speed </span>
        <span style={{ color: T.text }}>{speedStr}</span>
      </div>

      {/* Melee/Ranged attacks */}
      {meleeItems.map((item: any) => {
        const dmgRolls = Object.values(item.system.damageRolls) as any[]
        const dmgStr = dmgRolls.map((r: any) =>
          `${r.damage} ${r.category === 'persistent' ? 'persistent ' : ''}${r.damageType}`
        ).join(' plus ')
        const traits = item.system.traits.value as string[]
        const isRanged = item.system.range !== null
        return (
          <div key={item._id} style={{ marginBottom: 3 }}>
            <span style={{ color: T.accentText }}>◆ </span>
            <span style={{ fontWeight: 600, color: T.text }}>{isRanged ? 'Ranged' : 'Melee'} </span>
            <span style={{ color: T.text }}>{item.name} </span>
            <span style={{ color: T.accentText, fontWeight: 600 }}>+{item.system.bonus.value}</span>
            {traits.length > 0 && <span style={{ color: T.textMuted }}> ({traits.join(', ')})</span>}
            <span style={{ color: T.textDim }}>,  </span>
            <span style={{ color: T.textMuted, fontWeight: 600 }}>Damage </span>
            <span style={{ color: T.text }}>{dmgStr}</span>
          </div>
        )
      })}

      {/* Spellcasting */}
      {spellEntries.map((entry: any) => {
        const spells = spellItems.filter((s: any) => s.system.location.value === entry._id)
        const byRank: Record<number, string[]> = {}
        for (const sp of spells) {
          const rank = sp.system.level.value as number
          if (!byRank[rank]) byRank[rank] = []
          byRank[rank].push(sp.name)
        }
        const rankLabels = ['Cantrips', '1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th']
        const atk = entry.system.spelldc.value
        const dc  = entry.system.spelldc.dc
        return (
          <div key={entry._id} style={{ marginTop: 8, marginBottom: 4 }}>
            <div>
              <span style={{ fontWeight: 700, color: T.accentText }}>{entry.name} </span>
              <span style={{ color: T.textMuted }}>DC {dc}, </span>
              <span style={{ color: T.textMuted }}>attack +{atk}</span>
            </div>
            {Object.entries(byRank).sort(([a],[b]) => +a - +b).map(([rank, names]) => (
              <div key={rank} style={{ paddingLeft: 12, color: T.textMuted, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: T.textMuted }}>
                  {rankLabels[+rank] ?? `${rank}th`}{' '}
                </span>
                <span style={{ color: T.text }}>{names.join(', ')}</span>
              </div>
            ))}
          </div>
        )
      })}

      {/* Actions */}
      {actionItems.length > 0 && (
        <>
          <Divider />
          {actionItems.map((item: any) => {
            const sym = actionSymbol(item.system.actionType.value, item.system.actions.value)
            const traits = (item.system.traits.value as string[]).filter(Boolean)
            const desc = item.system.description.value?.replace(/<[^>]+>/g, '').trim()
            return (
              <div key={item._id} style={{ marginBottom: 3 }}>
                {sym && <span style={{ color: T.accentText, marginRight: 4 }}>{sym}</span>}
                <span style={{ fontWeight: 600, color: T.text }}>{item.name}</span>
                {traits.length > 0 && (
                  <span style={{ color: T.textMuted, fontSize: 11 }}> ({traits.join(', ')})</span>
                )}
                {desc && <span style={{ color: T.textMuted, fontSize: 12 }}>  {desc}</span>}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

// ─── Batch Processor ─────────────────────────────────────────────────────────
type BatchResult = {
  index: number
  name: string
  level: number | null
  errors: string[]
  actor: any
  sourceName?: string
}
type BatchProgress = { current: number; total: number; currentName: string }

function BatchTab() {
  const [mode, setMode]             = useState<'text' | 'names'>('text')
  const [input, setInput]           = useState('')
  const [namesInput, setNamesInput] = useState('')
  const [context, setContext]       = useState('')
  const [results, setResults]       = useState<BatchResult[]>([])
  const [running, setRunning]       = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState<BatchProgress | null>(null)
  const [rerolling, setRerolling]   = useState<number | null>(null)
  const [copiedIdx, setCopiedIdx]   = useState<number | null>(null)
  const [copiedMacro, setCopiedMacro] = useState(false)
  const cancelledRef = useRef(false)

  const writeClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fbCopy(text))
    } else { fbCopy(text) }
  }
  const fbCopy = (text: string) => {
    const el = document.createElement('textarea')
    el.value = text; el.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
    document.body.appendChild(el); el.focus(); el.select()
    document.execCommand('copy'); document.body.removeChild(el)
  }

  const splitBlocks = (text: string) =>
    text.split(/^---+\s*$/m).map(b => b.trim()).filter(Boolean)

  const runAll = () => {
    setRunning(true)
    setTimeout(() => {
      const out: BatchResult[] = splitBlocks(input).map((block, i) => {
        const actor = parsePF2eStatBlock(block) as any
        return {
          index: i,
          name: (actor?.name as string) ?? block.split('\n').find(l => l.trim()) ?? `Block ${i + 1}`,
          level: (actor?.system?.details?.level?.value as number) ?? null,
          errors: actor ? [] : ['Could not parse stat block'],
          actor,
        }
      })
      setResults(out)
      setRunning(false)
    }, 50)
  }

  const runNameBatch = async () => {
    const names = namesInput.split('\n').map(n => n.trim()).filter(Boolean)
    if (!names.length) return
    cancelledRef.current = false
    setGenerating(true); setResults([])
    const out: BatchResult[] = []
    for (let i = 0; i < names.length; i++) {
      if (cancelledRef.current) break
      setGenProgress({ current: i + 1, total: names.length, currentName: names[i] })
      try {
        const text  = await generatePF2eStatBlock(names[i], context.trim() || undefined)
        const actor = parsePF2eStatBlock(text) as any
        out.push({
          index: i,
          name: (actor?.name as string) ?? names[i],
          level: (actor?.system?.details?.level?.value as number) ?? null,
          errors: actor ? [] : ['Generation succeeded but parse failed'],
          actor, sourceName: names[i],
        })
      } catch (err: any) {
        out.push({ index: i, name: names[i], level: null, errors: [`Generation failed: ${err.message}`], actor: null, sourceName: names[i] })
      }
      setResults([...out])
    }
    setGenerating(false); setGenProgress(null)
  }

  const cancelGeneration = () => { cancelledRef.current = true }

  const reroll = async (idx: number, sourceName: string) => {
    setRerolling(idx)
    try {
      const text  = await generatePF2eStatBlock(sourceName, context.trim() || undefined)
      const actor = parsePF2eStatBlock(text) as any
      setResults(prev => prev.map(r => r.index !== idx ? r : {
        ...r,
        name: (actor?.name as string) ?? sourceName,
        level: (actor?.system?.details?.level?.value as number) ?? null,
        errors: actor ? [] : ['Parse failed after regeneration'],
        actor,
      }))
    } catch (err: any) {
      setResults(prev => prev.map(r => r.index !== idx ? r : { ...r, errors: [`Generation failed: ${err.message}`] }))
    }
    setRerolling(null)
  }

  const buildMacro = () => {
    const actors = results.filter(r => r.actor).map(r => r.actor)
    if (!actors.length) return null
    return [
      `// PF2e Batch Import Macro`,
      `// Generated by DM VTT Toolkit — dmtoolkit.org | ${actors.length} actor${actors.length !== 1 ? 's' : ''}`,
      `// Paste into a new Foundry macro and run it.`,
      ``,
      `const actors = ${JSON.stringify(actors, null, 2)};`,
      ``,
      `const created = await Actor.createDocuments(actors);`,
      `ui.notifications.info(\`✅ Imported \${created.length} actor\${created.length !== 1 ? 's' : ''} successfully.\`);`,
    ].join('\n')
  }

  const copyMacro = () => {
    const script = buildMacro(); if (!script) return
    writeClipboard(script); setCopiedMacro(true)
    setTimeout(() => setCopiedMacro(false), 3000)
  }

  const downloadAll = () => {
    const actors = results.filter(r => r.actor).map(r => r.actor); if (!actors.length) return
    const blob = new Blob([JSON.stringify(actors, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'pf2e-batch-import.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const copyOne = (r: BatchResult, idx: number) => {
    if (!r.actor) return
    writeClipboard(JSON.stringify(r.actor, null, 2))
    setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500)
  }

  const clearAll = () => { setResults([]); setInput(''); setNamesInput('') }

  const parsedCount = results.filter(r => r.actor).length
  const errorCount  = results.filter(r => r.errors.length > 0).length
  const nameCount   = namesInput.split('\n').map(n => n.trim()).filter(Boolean).length

  const modeBtn = (m: 'text' | 'names', label: string, icon: React.ReactNode) => (
    <button onClick={() => { setMode(m); setResults([]) }} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
      background: mode === m ? T.accent : T.surface2,
      color: mode === m ? '#fff' : T.textMuted,
      fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
    }}>
      {icon} {label}
    </button>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {modeBtn('text',  'Text',        <FileText size={14} />)}
        {modeBtn('names', '✨ AI Names', <Sparkles size={14} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* ── Input panel ──────────────────────────────────────────────── */}
        <div>
          {mode === 'text' ? (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16 }}>
              <div style={{ color: T.text, fontWeight: 600, marginBottom: 4 }}>Paste Multiple Stat Blocks</div>
              <div style={{ color: T.textDim, fontSize: 12, marginBottom: 8 }}>
                Separate each stat block with a line containing only{' '}
                <code style={{ background: T.surface2, padding: '0 4px', borderRadius: 2, color: T.accentText }}>---</code>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={"Goblin Warrior  Creature 1\nChaotic, Evil, Goblin, Humanoid\n...\n\n---\n\nOrc Brute  Creature 3\nChaotic, Evil, Humanoid, Orc\n..."}
                style={{
                  width: '100%', minHeight: 340, background: T.surface2,
                  border: `1px solid ${T.border}`, borderRadius: 5,
                  color: T.text, padding: '10px 12px', fontSize: 12,
                  fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                  boxSizing: 'border-box', lineHeight: 1.5,
                }}
                onFocus={e => (e.target.style.borderColor = T.accent)}
                onBlur={e  => (e.target.style.borderColor = T.border)}
              />
              <button
                onClick={runAll}
                disabled={running || !input.trim()}
                style={{
                  marginTop: 10, width: '100%',
                  background: input.trim() && !running ? T.accent : T.surface2,
                  border: 'none', borderRadius: 5, color: '#fff',
                  padding: '9px 0', cursor: input.trim() && !running ? 'pointer' : 'not-allowed',
                  fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: input.trim() && !running ? `0 0 12px ${T.accent}44` : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Zap size={16} /> {running ? 'Parsing…' : 'Parse All Blocks'}
              </button>
            </div>
          ) : (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', color: T.text, fontWeight: 600, marginBottom: 4 }}>Creature Names</label>
                <div style={{ color: T.textDim, fontSize: 12, marginBottom: 6 }}>One name per line — Claude generates a full PF2e stat block for each.</div>
                <textarea
                  value={namesInput}
                  onChange={e => setNamesInput(e.target.value)}
                  placeholder={"Frost Linnorm\nVulture Lich\nCrystal Golem Guardian\nBlood Mage Cultist"}
                  style={{
                    width: '100%', minHeight: 160, background: T.surface2,
                    border: `1px solid ${T.border}`, borderRadius: 5,
                    color: T.text, padding: '9px 12px', fontSize: 13,
                    fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', lineHeight: 1.5,
                  }}
                  onFocus={e => (e.target.style.borderColor = T.accent)}
                  onBlur={e  => (e.target.style.borderColor = T.border)}
                />
                {namesInput.trim() && (
                  <div style={{ color: T.textDim, fontSize: 12, marginTop: 4 }}>
                    {nameCount} name{nameCount !== 1 ? 's' : ''} queued
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  CONTEXT <span style={{ color: T.textDim, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Level, role, abilities… e.g. Level 12 elite, uses cold magic and a breath weapon"
                  style={{
                    width: '100%', minHeight: 80, background: T.surface2,
                    border: `1px solid ${T.border}`, borderRadius: 5,
                    color: T.text, padding: '9px 12px', fontSize: 12,
                    fontFamily: 'system-ui, sans-serif', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', lineHeight: 1.5,
                  }}
                  onFocus={e => (e.target.style.borderColor = T.accent)}
                  onBlur={e  => (e.target.style.borderColor = T.border)}
                />
                <div style={{ color: T.textDim, fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
                  Tips: <span style={{ color: T.textMuted }}>Level</span> (most important, e.g. <em>Level 8</em>),{' '}
                  <span style={{ color: T.textMuted }}>creature type</span> (e.g. <em>undead, construct</em>),{' '}
                  <span style={{ color: T.textMuted }}>role</span> (e.g. <em>elite guard, ambush predator</em>),{' '}
                  <span style={{ color: T.textMuted }}>abilities</span> (e.g. <em>fire magic, grab, trample</em>)
                </div>
              </div>

              {!hasApiKey() && (
                <div style={{
                  background: '#2a1800', border: `1px solid ${T.accent}44`,
                  borderRadius: 4, padding: '8px 12px', color: T.accentText, fontSize: 12,
                }}>
                  ⚠ No API key set — open Settings (⚙) in the header to add your Claude key.
                </div>
              )}

              {generating && genProgress && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: T.textMuted, fontSize: 12 }}>
                      Generating {genProgress.current} of {genProgress.total} —{' '}
                      <span style={{ color: T.accentText }}>{genProgress.currentName}</span>
                    </span>
                    <button onClick={cancelGeneration} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: T.red, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <X size={12} /> Cancel
                    </button>
                  </div>
                  <div style={{ background: T.surface2, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      background: T.accent, height: '100%', borderRadius: 4,
                      width: `${(genProgress.current / genProgress.total) * 100}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )}

              <button
                onClick={runNameBatch}
                disabled={generating || !namesInput.trim() || !hasApiKey()}
                style={{
                  background: !generating && namesInput.trim() && hasApiKey() ? T.accent : T.surface2,
                  border: 'none', borderRadius: 5, color: '#fff',
                  padding: '9px 0', cursor: !generating && namesInput.trim() && hasApiKey() ? 'pointer' : 'not-allowed',
                  fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: !generating && namesInput.trim() && hasApiKey() ? `0 0 12px ${T.accent}44` : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Sparkles size={16} />
                {generating
                  ? `Generating ${genProgress?.current ?? 0} of ${genProgress?.total ?? nameCount}…`
                  : `Generate ${nameCount || ''} Stat Block${nameCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}

          {/* Summary bar */}
          {results.length > 0 && (
            <div style={{
              marginTop: 12, background: T.surface,
              border: `1px solid ${T.blue}44`, borderRadius: 6, padding: 14,
            }}>
              <div style={{ color: T.blue, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                {results.length} {mode === 'names' ? 'generated' : 'block'}{results.length !== 1 ? 's' : ''}
                {generating && <span style={{ color: T.accentText, marginLeft: 8, fontSize: 12 }}>(in progress…)</span>}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: T.green }}>✓ {parsedCount} ok</span>
                <span style={{ color: T.red }}>✗ {errorCount} failed</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={copyMacro} disabled={!parsedCount} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: copiedMacro ? '#16a34a' : T.accentDim,
                  border: `1px solid ${copiedMacro ? '#16a34a' : T.accent}66`,
                  borderRadius: 4, color: copiedMacro ? '#fff' : T.accentText,
                  padding: '5px 12px', cursor: parsedCount ? 'pointer' : 'not-allowed',
                  fontSize: 12, fontWeight: 600, opacity: parsedCount ? 1 : 0.4,
                  transition: 'all 0.15s',
                }}>
                  <Copy size={12} /> {copiedMacro ? 'Copied!' : `Copy Macro (${parsedCount})`}
                </button>
                <button onClick={downloadAll} disabled={!parsedCount} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: T.surface2, border: `1px solid ${T.border}`,
                  borderRadius: 4, color: T.textMuted,
                  padding: '5px 12px', cursor: parsedCount ? 'pointer' : 'not-allowed',
                  fontSize: 12, fontWeight: 600, opacity: parsedCount ? 1 : 0.4,
                }}>
                  <Download size={12} /> Download JSON
                </button>
                <button onClick={clearAll} style={{
                  display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
                  background: 'none', border: `1px solid ${T.border}`,
                  borderRadius: 4, color: T.textDim,
                  padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}>
                  <X size={12} /> Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Results panel ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.length === 0 && !generating && (
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 6, padding: 40, textAlign: 'center',
              color: T.textDim, fontSize: 13,
            }}>
              {mode === 'names'
                ? 'Enter names on the left and click Generate — results appear here as each stat block is created.'
                : 'Results will appear here after parsing.'}
            </div>
          )}
          {results.map(r => {
            const hasErr     = r.errors.length > 0
            const borderClr  = hasErr ? `${T.red}55` : `${T.green}44`
            const statusClr  = hasErr ? T.red : T.green
            return (
              <div key={r.index} style={{
                background: T.surface, border: `1px solid ${borderClr}`,
                borderRadius: 6, padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: statusClr, fontWeight: 700 }}>{hasErr ? '✗' : '✓'}</span>
                    <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{r.name}</span>
                    {r.sourceName && r.sourceName !== r.name && (
                      <span style={{ color: T.textDim, fontSize: 11 }}>({r.sourceName})</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.sourceName && (
                      <button
                        onClick={() => reroll(r.index, r.sourceName!)}
                        disabled={rerolling === r.index || generating}
                        title="Regenerate this stat block"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: T.accentDim, border: `1px solid ${T.accent}44`,
                          borderRadius: 4, color: T.accentText, fontSize: 11,
                          padding: '3px 8px', cursor: rerolling === r.index || generating ? 'not-allowed' : 'pointer',
                          opacity: rerolling === r.index || generating ? 0.5 : 1,
                        }}
                      >
                        <RefreshCw size={11} /> {rerolling === r.index ? 'Rolling…' : 'Reroll'}
                      </button>
                    )}
                    {r.actor && (
                      <button
                        onClick={() => copyOne(r, r.index)}
                        title="Copy Foundry JSON"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: copiedIdx === r.index ? '#16a34a' : T.surface2,
                          border: `1px solid ${copiedIdx === r.index ? '#16a34a' : T.border}`,
                          borderRadius: 4, color: copiedIdx === r.index ? '#fff' : T.textMuted,
                          fontSize: 11, padding: '3px 8px', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Copy size={11} /> {copiedIdx === r.index ? 'Copied' : 'JSON'}
                      </button>
                    )}
                  </div>
                </div>

                {r.actor && !hasErr && (() => {
                  const sys   = r.actor.system
                  const parts: string[] = []
                  const lvl = sys?.details?.level?.value
                  if (lvl !== undefined && lvl !== null) parts.push(`Level ${lvl}`)
                  const hp  = sys?.attributes?.hp?.max;     if (hp)  parts.push(`HP ${hp}`)
                  const ac  = sys?.attributes?.ac?.value;   if (ac)  parts.push(`AC ${ac}`)
                  const spd = sys?.attributes?.speed?.value; if (spd) parts.push(`Speed ${spd} ft`)
                  return parts.length ? (
                    <div style={{ color: T.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                      {parts.join(' · ')}
                    </div>
                  ) : null
                })()}

                {r.errors.map((e, i) => (
                  <div key={i} style={{
                    marginTop: 6, background: '#2d0808', border: `1px solid #8b202066`,
                    borderRadius: 3, padding: '4px 8px', color: '#f87171', fontSize: 11,
                  }}>{e}</div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function ApiKeyModal({ onClose, onSaved, themeKey, onThemeChange }: {
  onClose: () => void
  onSaved: () => void
  themeKey: PF2EThemeKey
  onThemeChange: (k: PF2EThemeKey) => void
}) {
  const [keyInput, setKeyInput]       = useState('')
  const [saved, setSaved]             = useState(false)
  const [hasKey, setHasKey]           = useState(hasApiKey())
  const [showWalkthrough, setShowWalkthrough] = useState(!hasApiKey())

  const save = () => {
    if (!keyInput.trim()) return
    setApiKey(keyInput.trim())
    setKeyInput('')
    setHasKey(true)
    setSaved(true)
    onSaved()
    setTimeout(() => setSaved(false), 2000)
  }

  const remove = () => {
    clearApiKey()
    setHasKey(false)
    setKeyInput('')
    onSaved()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
        width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px 24px 20px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.accentText, fontWeight: 700, fontSize: 17 }}>
              <Key size={18} style={{ color: T.accent }} /> Settings
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>
              <X size={20} />
            </button>
          </div>

          {/* Theme picker */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: T.text, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Theme</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.keys(PF2E_THEMES) as PF2EThemeKey[]).map(k => {
                const th = PF2E_THEMES[k]
                const active = themeKey === k
                return (
                  <button key={k} onClick={() => onThemeChange(k)} style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '10px 6px', borderRadius: 8, cursor: 'pointer',
                    background: active ? `${th.accent}22` : T.surface2,
                    border: `2px solid ${active ? th.accent : T.border}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: th.swatch,
                      boxShadow: active ? `0 0 10px ${th.swatch}88` : 'none',
                      border: `2px solid ${active ? '#fff4' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }} />
                    <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? T.text : T.textDim }}>
                      {th.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Security badge */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#0a1f0f', border: '1px solid #166534',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          }}>
            <Shield size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: '#86efac', lineHeight: 1.6 }}>
              <strong>Your key stays in your browser.</strong> It is stored only in this
              device's local storage, sent directly to Anthropic's servers when you use
              an AI feature, and <strong>never transmitted to or logged by this app.</strong>
            </div>
          </div>

          {/* API Key section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>Claude API Key</label>

            {/* Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              padding: '8px 12px', borderRadius: 6,
              background: hasKey ? '#052e16' : T.surface2,
              border: `1px solid ${hasKey ? '#166534' : T.border}`,
              color: hasKey ? '#4ade80' : T.textMuted,
            }}>
              {hasKey
                ? <><CheckCircle size={14} /> API key is saved — AI features are enabled</>
                : <><AlertTriangle size={14} /> No API key — AI features are disabled</>}
            </div>

            {/* Input */}
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="sk-ant-api03-..."
              style={{
                background: T.bg, color: T.text, fontSize: 13,
                borderRadius: 6, padding: '8px 12px',
                border: `1px solid ${T.border}`, outline: 'none',
                fontFamily: 'monospace', width: '100%', boxSizing: 'border-box',
              }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={save}
                disabled={!keyInput.trim()}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: saved ? '#065f46' : T.accent,
                  border: 'none', borderRadius: 6, color: '#fff',
                  fontSize: 13, fontWeight: 600, padding: '8px 0', cursor: 'pointer',
                  opacity: !keyInput.trim() ? 0.4 : 1, transition: 'background 0.15s',
                }}
              >
                {saved ? <><CheckCircle size={14} /> Saved!</> : <><Key size={14} /> Save Key</>}
              </button>
              {hasKey && (
                <button onClick={remove} title="Remove saved key" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(127,29,29,0.4)', border: '1px solid #7f1d1d',
                  borderRadius: 6, color: '#fca5a5', fontSize: 13,
                  fontWeight: 600, padding: '8px 12px', cursor: 'pointer',
                }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Walkthrough — collapsible */}
          <div style={{ marginTop: 16, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setShowWalkthrough(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: T.bg, border: 'none', cursor: 'pointer',
                color: T.textMuted, fontSize: 13, fontWeight: 600,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {showWalkthrough ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                How to get a free API key
              </span>
              <span style={{ fontSize: 11, color: T.textDim, fontWeight: 400 }}>~2 minutes</span>
            </button>

            {showWalkthrough && (
              <div style={{ padding: '4px 14px 14px', background: T.surface2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {([
                    ['1', '#7c3aed', 'Go to console.anthropic.com', 'Click "Sign up" — it\'s free to create an account.'],
                    ['2', '#0369a1', 'Open the API Keys page', 'In the left sidebar, click "API Keys".'],
                    ['3', '#065f46', 'Create a new key', 'Click "Create Key", give it any name (e.g. "PF2e Toolkit"), then click "Create".'],
                    ['4', '#b45309', 'Copy the key', 'It starts with sk-ant-api03-… Copy it now — it\'s only shown once.'],
                    ['5', '#be185d', 'Add a small credit', 'Go to "Billing" and add $5. This covers hundreds of stat block generations.'],
                    ['6', '#166534', 'Paste it above', 'Paste the key into the field above and click Save Key.'],
                  ] as [string, string, string, string][]).map(([num, color, title, desc]) => (
                    <div key={num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', background: color,
                        color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{num}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 2 }}>{title}</div>
                        <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                  <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6,
                    color: T.textMuted, fontSize: 12, fontWeight: 600, padding: '7px 0',
                    textDecoration: 'none', marginTop: 4,
                  }}>
                    <ExternalLink size={12} /> Open console.anthropic.com
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
type Mode = 'text' | 'name' | 'image' | 'url'

export default function PF2eApp() {
  const [appTab, setAppTab]       = useState<'parser' | 'batch'>('parser')
  const [themeKey, setThemeKey]   = useState<PF2EThemeKey>(
    () => (localStorage.getItem(THEME_STORAGE_KEY) as PF2EThemeKey) ?? 'ember'
  )
  const selectTheme = (k: PF2EThemeKey) => {
    localStorage.setItem(THEME_STORAGE_KEY, k)
    T = PF2E_THEMES[k]
    setThemeKey(k)
  }
  const [mode, setMode]           = useState<Mode>('text')
  const [input, setInput]         = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameContext, setNameContext] = useState('')
  const [urlInput, setUrlInput]   = useState('')
  const [actor, setActor]         = useState<any>(null)
  const [error, setError]         = useState('')
  const [copied, setCopied]           = useState(false)
  const [copiedMacro, setCopiedMacro] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySet, setApiKeySet]   = useState(hasApiKey())
  const fileRef = useRef<HTMLInputElement>(null)

  const jsonOutput = actor ? JSON.stringify(actor, null, 2) : ''

  const parse = useCallback(() => {
    if (!input.trim()) return
    setError('')
    const result = parsePF2eStatBlock(input)
    if (!result || !result.name) {
      setError('Could not parse stat block. Make sure it starts with "Name  Creature N" and includes AC, HP, and saves.')
      setActor(null)
    } else {
      setActor(result)
    }
  }, [input])

  const reset = () => {
    setInput('')
    setActor(null)
    setError('')
  }

  const writeClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
  }
  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;left:-9999px;top:-9999px'
    document.body.appendChild(el)
    el.focus(); el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  const copy = () => {
    writeClipboard(jsonOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyMacro = () => {
    const creatureName = actor?.name ?? 'Creature'
    const macro = `// PF2e Import Macro — ${creatureName}
// Paste into Foundry VTT → Macros → New Script Macro → Run
const existing = game.actors.getName("${creatureName}");
if (existing) {
  ui.notifications.warn("${creatureName} already exists in the Actors tab — import skipped.");
} else {
  await Actor.createDocuments([${jsonOutput}]);
  ui.notifications.info("✅ ${creatureName} imported successfully!");
}`
    writeClipboard(macro)
    setCopiedMacro(true)
    setTimeout(() => setCopiedMacro(false), 2000)
  }

  const download = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${(actor?.name ?? 'creature').toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!hasApiKey()) { setShowApiKey(true); return }
    const reader = new FileReader()
    reader.onload = async () => {
      setLoading(true)
      setError('')
      try {
        const { extractStatBlockFromImage } = await import('../parser-versions/claude-api')
        const text = await extractStatBlockFromImage(reader.result as string)
        setInput(text)
        const result = parsePF2eStatBlock(text)
        if (result?.name) setActor(result)
        else setError('Image extracted but could not parse result. Check the text and try again.')
      } catch (err: any) {
        setError(err?.message ?? 'Image extraction failed.')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleNameGenerate = async () => {
    if (!nameInput.trim()) return
    if (!hasApiKey()) { setShowApiKey(true); return }
    setLoading(true)
    setError('')
    try {
      const { generatePF2eStatBlock } = await import('../parser-versions/claude-api')
      const text = await generatePF2eStatBlock(nameInput.trim(), nameContext.trim() || undefined)
      setInput(text)
      const result = parsePF2eStatBlock(text)
      if (result?.name) setActor(result)
      else setError('AI generated text but could not parse result. You can edit the text below and re-parse.')
    } catch (err: any) {
      setError(err?.message ?? 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlExtract = async () => {
    if (!urlInput.trim()) return
    if (!hasApiKey()) { setShowApiKey(true); return }
    setLoading(true)
    setError('')
    try {
      const text = await extractPF2eStatBlockFromUrl(urlInput.trim())
      setInput(text)
      const result = parsePF2eStatBlock(text)
      if (result?.name) setActor(result)
      else setError('Extracted text from URL but could not parse a stat block. You can edit the text below and re-parse.')
    } catch (err: any) {
      setError(err?.message ?? 'URL extraction failed.')
    } finally {
      setLoading(false)
    }
  }

  const modeBtn = (m: Mode, label: string, icon: React.ReactNode) => (
    <button onClick={() => setMode(m)} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 5, border: 'none', cursor: 'pointer',
      background: mode === m ? T.accent : T.surface2,
      color: mode === m ? '#fff' : T.textMuted,
      fontWeight: 600, fontSize: 13,
      transition: 'all 0.15s',
    }}>
      {icon} {label}
    </button>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, ${T.accentDim}ee 0%, ${T.bg} 100%)`,
        borderBottom: `1px solid ${T.accent}44`,
        boxShadow: `0 2px 20px ${T.accent}18, inset 0 1px 0 ${T.accent}30`,
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 24,
            color: T.accentText, letterSpacing: '1px',
            textShadow: `0 1px 0 ${T.accent}88, 0 2px 6px rgba(0,0,0,0.7)`,
          }}>
            ⚙ PF2e Toolkit
          </span>
          <span style={{
            background: `${T.accentDim}`, border: `1px solid ${T.accent}44`,
            color: T.goldDim, borderRadius: 4, padding: '1px 8px', fontSize: 11, fontWeight: 600,
          }}>
            BETA
          </span>
          <span style={{ color: T.textDim, fontSize: 12 }}>
            Pathfinder 2e → Foundry VTT
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="https://ko-fi.com/tonyb29" target="_blank" rel="noopener noreferrer" style={{
            background: '#ff5f5f', border: 'none', borderRadius: 5,
            color: '#fff', fontSize: 12, fontWeight: 600,
            padding: '5px 10px', cursor: 'pointer', textDecoration: 'none',
          }}>
            ☕ Support
          </a>
          <a href="/about.html" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: `1px solid ${T.border}`,
            borderRadius: 5, padding: '5px 10px', cursor: 'pointer',
            color: T.textMuted, fontSize: 12, textDecoration: 'none',
          }}>
            ← Hub
          </a>
          <button onClick={() => setShowApiKey(true)} title="API key settings" style={{
            background: 'none', border: `1px solid ${T.accent}44`,
            borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
            color: apiKeySet ? T.green : T.textMuted,
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
          }}>
            <Settings size={15} />
            {apiKeySet ? 'API ✓' : 'API'}
          </button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0,
      }}>
        {(['parser', 'batch'] as const).map(t => {
          const active = appTab === t
          const labels: Record<string, string> = { parser: 'Parser', batch: 'Batch' }
          const icons:  Record<string, React.ReactNode> = {
            parser: <FileText size={14} />,
            batch:  <Layers size={14} />,
          }
          return (
            <button key={t} onClick={() => setAppTab(t)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', border: 'none', cursor: 'pointer',
              background: 'none',
              color: active ? T.accentText : T.textMuted,
              fontWeight: active ? 700 : 400,
              fontSize: 13,
              borderBottom: active ? `2px solid ${T.accent}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {icons[t]} {labels[t]}
            </button>
          )
        })}
        <div style={{ marginLeft: 'auto', padding: '8px 0' }}>
          <span style={{ color: T.textDim, fontSize: 11 }}>
            {appTab === 'parser'
              ? 'Paste a PF2e (Remaster) stat block → Foundry-ready NPC actor'
              : 'Parse many stat blocks at once, or generate creatures by name with AI'}
          </span>
        </div>
      </div>

      {/* ── Batch tab ───────────────────────────────────────────────────── */}
      {appTab === 'batch' && <BatchTab />}

      {/* ── Parser body ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: appTab === 'parser' ? 'block' : 'none' }}>

        {/* Mode buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {modeBtn('text',  'Text',      <FileText size={14} />)}
          {modeBtn('url',   'URL',       <Link size={14} />)}
          {modeBtn('name',  '✨ AI Name', <Sparkles size={14} />)}
          {modeBtn('image', 'Image',     <FileJson size={14} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: actor ? '1fr 1fr' : '1fr', gap: 20 }}>

          {/* ── Input panel ─────────────────────────────────────────────── */}
          <div>
            {mode === 'text' && (
              <>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Paste a PF2e stat block here…\n\nExample:\n\nDrow Fighter  Creature 1\nChaotic, Evil, Drow, Elf, Humanoid\nPerception +6; darkvision\nLanguages Elven, Sakvroth\nSkills Acrobatics +7, Athletics +5, Stealth +7\nStr +2, Dex +4, Con +2, Int +0, Wis +1, Cha +0\n\nAC 18; Fort +7, Ref +9, Will +4\nHP 18; Immunities sleep\n\nSpeed 30 feet\nMelee [one-action] rapier +9 (deadly d8, finesse), Damage 1d6+2 piercing\n\nAttack of Opportunity [reaction]\nSkewer [two-actions] Strike with rapier, deal 1d6 bleed.`}
                  style={{
                    width: '100%', minHeight: 340, background: T.surface,
                    border: `1px solid ${T.border}`, borderRadius: 6,
                    color: T.text, padding: '10px 12px', fontSize: 13,
                    fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', lineHeight: 1.5,
                  }}
                  onFocus={e => (e.target.style.borderColor = T.accent)}
                  onBlur={e  => (e.target.style.borderColor = T.border)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) parse()
                  }}
                />
                <div style={{ color: T.textDim, fontSize: 11, marginTop: 4 }}>
                  Ctrl+Enter to parse
                </div>
              </>
            )}

            {mode === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    PAGE URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUrlExtract() }}
                    placeholder="https://2e.aonprd.com/Monsters.aspx?ID=…"
                    style={{
                      width: '100%', background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 6, color: T.text, padding: '9px 12px', fontSize: 13,
                      outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
                    }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e  => (e.target.style.borderColor = T.border)}
                  />
                  <div style={{ color: T.textDim, fontSize: 11, marginTop: 5, lineHeight: 1.6 }}>
                    Paste a URL from <strong style={{ color: T.textMuted }}>Archives of Nethys</strong> or any page with a PF2e stat block.
                    Claude fetches the page and extracts the stat block — requires an API key.
                  </div>
                </div>
                <button
                  onClick={handleUrlExtract}
                  disabled={!urlInput.trim() || loading}
                  style={{
                    background: urlInput.trim() && !loading ? T.accent : T.surface2,
                    border: 'none', borderRadius: 5, color: '#fff',
                    padding: '9px 20px', cursor: urlInput.trim() && !loading ? 'pointer' : 'not-allowed',
                    fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                    alignSelf: 'flex-start',
                    boxShadow: urlInput.trim() && !loading ? `0 0 12px ${T.accent}44` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? <><Loader size={14} className="animate-spin" /> Fetching…</> : <><Link size={14} /> Extract from URL</>}
                </button>
                {input && (
                  <div>
                    <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 4 }}>Extracted text (editable):</div>
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      style={{
                        width: '100%', minHeight: 220, background: T.surface,
                        border: `1px solid ${T.border}`, borderRadius: 6,
                        color: T.text, padding: '10px 12px', fontSize: 12,
                        fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box', lineHeight: 1.5,
                      }}
                    />
                    <button
                      onClick={parse}
                      style={{
                        marginTop: 6, background: T.surface2, border: `1px solid ${T.border}`,
                        borderRadius: 5, color: T.textMuted, padding: '6px 14px',
                        cursor: 'pointer', fontSize: 13,
                      }}
                    >
                      Re-parse
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === 'image' && (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  minHeight: 200, background: T.surface, border: `2px dashed ${T.border}`,
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: 'pointer', color: T.textMuted,
                }}
              >
                <FileJson size={32} />
                <div>Click to upload a stat block image</div>
                <div style={{ fontSize: 12 }}>PNG, JPG, WEBP — requires API key</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </div>
            )}

            {mode === 'name' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    CREATURE NAME
                  </label>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="e.g. Frost Wyvern, Goblin Shaman, Ancient Lich…"
                    onKeyDown={e => { if (e.key === 'Enter') handleNameGenerate() }}
                    style={{
                      width: '100%', background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: 6, color: T.text, padding: '9px 12px', fontSize: 13,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e  => (e.target.style.borderColor = T.border)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: T.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    CONTEXT <span style={{ color: T.textDim, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    value={nameContext}
                    onChange={e => setNameContext(e.target.value)}
                    placeholder="Level, role, abilities, setting… e.g. Level 8 elite guard, uses a halberd and a defensive shield reaction"
                    style={{
                      width: '100%', minHeight: 100, background: T.surface,
                      border: `1px solid ${T.border}`, borderRadius: 6,
                      color: T.text, padding: '9px 12px', fontSize: 13,
                      fontFamily: 'system-ui, sans-serif', resize: 'vertical', outline: 'none',
                      boxSizing: 'border-box', lineHeight: 1.5,
                    }}
                    onFocus={e => (e.target.style.borderColor = T.accent)}
                    onBlur={e  => (e.target.style.borderColor = T.border)}
                  />
                </div>
                <button
                  onClick={handleNameGenerate}
                  disabled={!nameInput.trim() || loading}
                  style={{
                    background: nameInput.trim() && !loading ? T.accent : T.surface2,
                    border: 'none', borderRadius: 5, color: '#fff',
                    padding: '9px 20px', cursor: nameInput.trim() && !loading ? 'pointer' : 'not-allowed',
                    fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                    alignSelf: 'flex-start',
                    boxShadow: nameInput.trim() && !loading ? `0 0 12px ${T.accent}44` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {loading ? <><Loader size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate Creature</>}
                </button>
                {input && (
                  <div>
                    <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 4 }}>Generated text (editable):</div>
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      style={{
                        width: '100%', minHeight: 220, background: T.surface,
                        border: `1px solid ${T.border}`, borderRadius: 6,
                        color: T.text, padding: '10px 12px', fontSize: 12,
                        fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box', lineHeight: 1.5,
                      }}
                    />
                    <button
                      onClick={parse}
                      style={{
                        marginTop: 6, background: T.surface2, border: `1px solid ${T.border}`,
                        borderRadius: 5, color: T.textMuted, padding: '6px 14px',
                        cursor: 'pointer', fontSize: 13,
                      }}
                    >
                      Re-parse
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Extracted text preview (after image) */}
            {mode === 'image' && input && (
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  width: '100%', minHeight: 200, background: T.surface,
                  border: `1px solid ${T.border}`, borderRadius: 6, marginTop: 10,
                  color: T.text, padding: '10px 12px', fontSize: 12,
                  fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 10, background: '#2d0808', border: `1px solid #8b2020`,
                borderRadius: 5, padding: '8px 12px', color: '#f87171', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Buttons (text + image modes only — name/url modes have their own buttons) */}
            {mode !== 'name' && mode !== 'url' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={parse}
                  disabled={!input.trim() || loading}
                  style={{
                    background: input.trim() && !loading ? T.accent : T.surface2,
                    border: 'none', borderRadius: 5, color: '#fff',
                    padding: '8px 20px', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                    boxShadow: input.trim() && !loading ? `0 0 12px ${T.accent}44` : 'none',
                  }}
                >
                  {loading ? <><Loader size={14} className="animate-spin" /> Parsing…</> : 'Parse → Foundry JSON'}
                </button>
                {(input || actor) && (
                  <button onClick={reset} style={{
                    background: 'none', border: `1px solid ${T.border}`,
                    borderRadius: 5, color: T.textMuted, padding: '8px 14px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
                  }}>
                    <RotateCcw size={13} /> Reset
                  </button>
                )}
              </div>
            )}
            {(mode === 'name' || mode === 'url') && (input || actor) && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={reset} style={{
                  background: 'none', border: `1px solid ${T.border}`,
                  borderRadius: 5, color: T.textMuted, padding: '8px 14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
                }}>
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
            )}
          </div>

          {/* ── Output panel ────────────────────────────────────────────── */}
          {actor && (
            <div>
              {/* Stat block preview */}
              <StatBlockPreview actor={actor} />

              {/* JSON output */}
              <div style={{ marginTop: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 8,
                }}>
                  <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 600 }}>
                    FOUNDRY JSON — ready to import
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button onClick={copyMacro} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: copiedMacro ? '#16a34a' : T.accentDim,
                      border: `1px solid ${copiedMacro ? '#16a34a' : T.accent}66`,
                      borderRadius: 4, color: copiedMacro ? '#fff' : T.accentText,
                      padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      transition: 'all 0.15s',
                    }}>
                      <Copy size={12} /> {copiedMacro ? 'Copied!' : 'Copy Import Macro'}
                    </button>
                    <button onClick={copy} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: copied ? '#16a34a' : T.surface2,
                      border: `1px solid ${copied ? '#16a34a' : T.border}`,
                      borderRadius: 4, color: copied ? '#fff' : T.textMuted,
                      padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      transition: 'all 0.15s',
                    }}>
                      <Copy size={12} /> {copied ? 'Copied!' : 'Copy JSON'}
                    </button>
                    <button onClick={download} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: T.surface2, border: `1px solid ${T.border}`,
                      borderRadius: 4, color: T.textMuted,
                      padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}>
                      <Download size={12} /> Download
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={jsonOutput}
                  style={{
                    width: '100%', minHeight: 280, background: T.surface,
                    border: `1px solid ${T.border}`, borderRadius: 6,
                    color: '#a3c4a3', padding: '10px 12px', fontSize: 11,
                    fontFamily: 'monospace', resize: 'vertical', outline: 'none',
                    boxSizing: 'border-box', lineHeight: 1.4,
                  }}
                />
              </div>

              {/* Import instructions */}
              <div style={{
                marginTop: 12, background: T.surface2,
                border: `1px solid ${T.border}`,
                borderRadius: 5, padding: '10px 14px', fontSize: 12, color: T.textMuted,
              }}>
                <div style={{ fontWeight: 600, color: T.accentText, marginBottom: 4 }}>How to import into Foundry</div>
                <div>1. In Foundry → Actors tab → <strong>Create Actor → choose NPC</strong></div>
                <div>2. Open the new NPC sheet → header menu → <strong>Import Data</strong> → select the JSON file</div>
                <div style={{ color: T.textDim, paddingLeft: 12, fontSize: 11, marginTop: 2 }}>
                  ⚠ Must be NPC type — PF2e won't import NPC data into a character or hazard actor
                </div>
                <div style={{ marginTop: 6, color: T.textMuted, fontSize: 11 }}>
                  <strong>Macro (easiest):</strong>{' '}
                  <code style={{ color: T.gold, background: T.bg, padding: '0 3px', borderRadius: 2 }}>Actor.createDocuments([JSON.parse(`…`)])</code>
                  {' '}— creates the correct type automatically, no manual step needed
                </div>
                <div style={{ marginTop: 6, color: T.textDim, fontSize: 11 }}>
                  ℹ️ PF2e requires a token on an active scene to roll skills &amp; attacks — drag the actor onto the scene first.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showApiKey && <ApiKeyModal onClose={() => setShowApiKey(false)} onSaved={() => setApiKeySet(hasApiKey())} themeKey={themeKey} onThemeChange={selectTheme} />}
    </div>
  )
}
