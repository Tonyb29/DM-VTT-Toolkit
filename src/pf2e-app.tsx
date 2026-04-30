// pf2e-app.tsx
// Pathfinder 2e Stat Block Parser — Foundry VTT JSON Exporter
// Standalone tool at dmtoolkit.org/pathfinder

import { useState, useRef, useCallback } from 'react'
import { Copy, Download, FileJson, FileText, Loader, RotateCcw, Sparkles, Settings, Key, CheckCircle, AlertTriangle, Trash2, Shield, ExternalLink, ChevronDown, ChevronRight, X } from 'lucide-react'
import { parsePF2eStatBlock } from '../parser-versions/pf2e-parser'
import { hasApiKey, getApiKey, setApiKey, clearApiKey } from '../parser-versions/claude-api'

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#0b0805',
  surface:     '#180e06',
  surface2:    '#221509',
  border:      '#3d2008',
  accent:      '#c45500',
  accentBright:'#e06010',
  accentDim:   '#2d1200',
  accentText:  '#d4a855',
  gold:        '#d4a855',
  goldDim:     '#7a5c22',
  text:        '#ede0c8',
  textMuted:   '#8b7050',
  textDim:     '#5a4030',
  green:       '#5a9a5a',
  red:         '#c05050',
  blue:        '#5080b0',
}

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

// ─── Settings Modal ───────────────────────────────────────────────────────────
function ApiKeyModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
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
type Mode = 'text' | 'name' | 'image'

export default function PF2eApp() {
  const [mode, setMode]           = useState<Mode>('text')
  const [input, setInput]         = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameContext, setNameContext] = useState('')
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

  const copy = () => {
    navigator.clipboard.writeText(jsonOutput)
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
    navigator.clipboard.writeText(macro)
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

      {/* ── Tab description ─────────────────────────────────────────────── */}
      <div style={{
        background: `${T.accentDim}66`, borderBottom: `1px solid ${T.border}`,
        padding: '6px 24px',
      }}>
        <span style={{ color: T.goldDim, fontSize: 12 }}>
          Paste a PF2e (Remaster) stat block and get a Foundry-ready NPC actor — attacks, actions, spells, and all.
        </span>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>

        {/* Mode buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {modeBtn('text',  'Text',      <FileText size={14} />)}
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

            {/* Buttons (text + image modes only — name mode has its own generate button) */}
            {mode !== 'name' && (
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
            {mode === 'name' && (input || actor) && (
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

      {showApiKey && <ApiKeyModal onClose={() => setShowApiKey(false)} onSaved={() => setApiKeySet(hasApiKey())} />}
    </div>
  )
}
