// pf2e-app.tsx
// Pathfinder 2e Stat Block Parser — Foundry VTT JSON Exporter
// Standalone tool at dmtoolkit.org/pathfinder

import { useState, useRef, useCallback } from 'react'
import { Copy, Download, FileJson, FileText, Loader, RotateCcw, ExternalLink } from 'lucide-react'
import { parsePF2eStatBlock } from '../parser-versions/pf2e-parser'
import { hasApiKey, getApiKey } from '../parser-versions/claude-api'

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
function ApiKeyModal({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState(getApiKey() ?? '')
  const save = () => {
    if (key.trim()) {
      import('../parser-versions/claude-api').then(m => m.setApiKey(key.trim()))
    }
    onClose()
  }
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: 24, width: 360, maxWidth: '90vw',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, color: T.accentText, marginBottom: 12 }}>Claude API Key</div>
        <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 10 }}>
          Required for AI stat block generation. Stored locally in your browser.
        </div>
        <input
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{
            width: '100%', background: T.surface2, border: `1px solid ${T.border}`,
            borderRadius: 4, color: T.text, padding: '7px 10px', fontSize: 13,
            outline: 'none', boxSizing: 'border-box', marginBottom: 12,
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'none', border: `1px solid ${T.border}`, borderRadius: 4,
            color: T.textMuted, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
          }}>Cancel</button>
          <button onClick={save} style={{
            background: T.accent, border: 'none', borderRadius: 4,
            color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>Save</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
type Mode = 'text' | 'image'

export default function PF2eApp() {
  const [mode, setMode]           = useState<Mode>('text')
  const [input, setInput]         = useState('')
  const [actor, setActor]         = useState<any>(null)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
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
          <button onClick={() => setShowApiKey(true)} style={{
            background: 'none', border: `1px solid ${T.border}`,
            borderRadius: 5, padding: '5px 10px', cursor: 'pointer',
            color: hasApiKey() ? T.green : T.textMuted, fontSize: 12,
          }}>
            {hasApiKey() ? '✓ API Key' : '⚙ API Key'}
          </button>
          <a href="https://ko-fi.com/tonyb29" target="_blank" rel="noopener noreferrer" style={{
            background: '#ff5f5f', border: 'none', borderRadius: 5,
            color: '#fff', fontSize: 12, fontWeight: 600,
            padding: '5px 10px', cursor: 'pointer', textDecoration: 'none',
          }}>
            ☕ Support
          </a>
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: `1px solid ${T.border}`,
            borderRadius: 5, padding: '5px 10px', cursor: 'pointer',
            color: T.textMuted, fontSize: 12, textDecoration: 'none',
          }}>
            <ExternalLink size={12} /> D&D Tool
          </a>
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
          {modeBtn('text',  'Text',  <FileText size={14} />)}
          {modeBtn('image', 'Image', <FileJson size={14} />)}
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

            {/* Buttons */}
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
                <div>1. Open Foundry → Actors tab → Create Actor → NPC</div>
                <div>2. Open the actor sheet → drag the JSON file onto it, <em>or</em></div>
                <div>3. Use a macro: <code style={{ color: T.gold, background: T.bg, padding: '0 4px', borderRadius: 2 }}>Actor.create(JSON.parse(`…`))</code></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showApiKey && <ApiKeyModal onClose={() => setShowApiKey(false)} />}
    </div>
  )
}
