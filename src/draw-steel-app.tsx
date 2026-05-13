import React, { useState, useRef, useCallback } from 'react'
import {
  Copy, Download, FileText, Loader, RotateCcw, Sparkles, Settings,
  Key, CheckCircle, AlertTriangle, Shield, ChevronDown, X, Link,
  Image as ImageIcon, Zap,
} from 'lucide-react'
import {
  parseDrawSteelStatBlock, toDrawSteelFoundryActor, buildDrawSteelImportMacro,
  DSActor,
} from '../parser-versions/draw-steel-parser'
import {
  hasApiKey, getApiKey, setApiKey, clearApiKey,
  generateDrawSteelStatBlock, extractDrawSteelStatBlockFromImage,
} from '../parser-versions/claude-api'

// ─── Themes ───────────────────────────────────────────────────────────────────

const DS_THEMES = {
  steel: {
    label: 'Steel',    swatch: '#4a9ebb',
    bg: '#060c12',     surface: '#0d1a24',  surface2: '#142233',
    border: '#1e3a4a', accent: '#4a9ebb',   accentBright: '#60c0e0',
    accentDim: '#0d2535', accentText: '#80d8f8', gold: '#d4a855',
    goldDim: '#7a5c22', text: '#cce8f5',    textMuted: '#6a90a8',
    textDim: '#3a5060', green: '#4a9a5a',   red: '#c05060',   blue: '#4a9ebb',
  },
  forge: {
    label: 'Forge',    swatch: '#c45500',
    bg: '#0b0805',     surface: '#180e06',  surface2: '#221509',
    border: '#3d2008', accent: '#c45500',   accentBright: '#e06010',
    accentDim: '#2d1200', accentText: '#d4a855', gold: '#d4a855',
    goldDim: '#7a5c22', text: '#ede0c8',    textMuted: '#8b7050',
    textDim: '#5a4030', green: '#5a9a5a',   red: '#c05050',   blue: '#5080b0',
  },
  void: {
    label: 'Void',     swatch: '#7c3aed',
    bg: '#05030a',     surface: '#120c1e',  surface2: '#1a122e',
    border: '#2d1a4a', accent: '#7c3aed',   accentBright: '#9a5cf0',
    accentDim: '#1a0a30', accentText: '#c084fc', gold: '#c084fc',
    goldDim: '#5a3080', text: '#ede0f8',    textMuted: '#8060a8',
    textDim: '#402860', green: '#5a8a5a',   red: '#b05070',   blue: '#5060c0',
  },
  iron: {
    label: 'Iron',     swatch: '#607080',
    bg: '#080a0c',     surface: '#111518',  surface2: '#182025',
    border: '#253035', accent: '#607080',   accentBright: '#809ab0',
    accentDim: '#151f28', accentText: '#a0c0d8', gold: '#a8a060',
    goldDim: '#504830', text: '#d0dce8',    textMuted: '#607080',
    textDim: '#303a42', green: '#4a8a5a',   red: '#aa4858',   blue: '#4a7090',
  },
} as const

type DSThemeKey = keyof typeof DS_THEMES
const THEME_STORAGE_KEY = 'ds_theme'

let T = DS_THEMES[(localStorage.getItem(THEME_STORAGE_KEY) as DSThemeKey) ?? 'steel'] ?? DS_THEMES.steel

type Mode = 'text' | 'name' | 'image'

// ─── API Key Modal ─────────────────────────────────────────────────────────────

function ApiKeyModal({ onClose, onSaved, themeKey, onThemeChange }: {
  onClose: () => void
  onSaved: () => void
  themeKey: DSThemeKey
  onThemeChange: (k: DSThemeKey) => void
}) {
  const [draft, setDraft] = useState(getApiKey())
  const [saved, setSaved] = useState(false)

  const save = () => {
    setApiKey(draft)
    setSaved(true)
    setTimeout(() => { setSaved(false); onSaved(); onClose() }, 800)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, width: 420, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: T.text, fontSize: 16, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} color={T.accent} /> Settings
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted }}>
            <X size={18} />
          </button>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>
            <Key size={11} style={{ marginRight: 4 }} />CLAUDE API KEY
          </label>
          <input
            type="password"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="sk-ant-..."
            style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 6, padding: '8px 10px', color: T.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
          <p style={{ margin: '6px 0 0', fontSize: 11, color: T.textMuted }}>
            Required for AI Name mode and Image mode. Stored in your browser only.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{ color: T.accent }}>
              Get a key →
            </a>
          </p>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>THEME</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {(Object.keys(DS_THEMES) as DSThemeKey[]).map(k => (
              <button
                key={k}
                title={DS_THEMES[k].label}
                onClick={() => onThemeChange(k)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  background: DS_THEMES[k].swatch,
                  border: `3px solid ${k === themeKey ? T.text : 'transparent'}`,
                  boxShadow: k === themeKey ? `0 0 0 1px ${T.border}` : 'none',
                  transition: 'border-color 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={save}
            style={{ flex: 1, background: saved ? T.green : T.accent, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
          {getApiKey() && (
            <button
              onClick={() => { clearApiKey(); setDraft(''); }}
              style={{ background: T.surface2, color: T.red, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 14px', fontSize: 13, cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Stat Preview ──────────────────────────────────────────────────────────────

function StatPreview({ ds }: { ds: DSActor }) {
  const char = (val: number) => (val >= 0 ? `+${val}` : `${val}`)

  return (
    <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: T.accentText }}>{ds.name}</span>
        <span style={{ fontSize: 12, color: T.textMuted }}>Level {ds.level}</span>
        {ds.roles.length > 0 && <span style={{ fontSize: 11, color: T.accent, background: T.accentDim, border: `1px solid ${T.border}`, borderRadius: 4, padding: '2px 7px' }}>{ds.roles.join(' / ')}</span>}
        {ds.ancestry.length > 0 && <span style={{ fontSize: 11, color: T.textMuted }}>{ds.ancestry.join(', ')}</span>}
      </div>

      {/* Core stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6, marginBottom: 12 }}>
        {[
          { label: 'Stamina', val: ds.stamina },
          { label: 'Speed', val: ds.speed },
          { label: 'Size', val: `${ds.sizeValue}${ds.sizeMod}` },
          { label: 'Stability', val: ds.stability },
          { label: 'Free Strike', val: ds.freeStrike },
          { label: 'EV', val: ds.ev },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{val}</div>
            <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: '0.03em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Characteristics */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {(['might', 'agility', 'reason', 'intuition', 'presence'] as const).map(ch => (
          <div key={ch} style={{ flex: '1 1 60px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.accentBright }}>{char(ds[ch])}</div>
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{ch.slice(0, 3)}</div>
          </div>
        ))}
      </div>

      {/* Abilities */}
      {ds.abilities.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Abilities ({ds.abilities.length})</div>
          {ds.abilities.map((ab, i) => (
            <div key={i} style={{ marginBottom: 8, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{ab.emojiPrefix || '⚔'}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{ab.name}</span>
                {ab.category !== 'basic' && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 3, padding: '1px 6px',
                    background: ab.category === 'signature' ? `${T.gold}22` : ab.category === 'villain' ? `${T.red}22` : `${T.accent}22`,
                    color: ab.category === 'signature' ? T.gold : ab.category === 'villain' ? T.red : T.accentText,
                    border: `1px solid ${ab.category === 'signature' ? T.goldDim : ab.category === 'villain' ? T.red + '55' : T.border}`,
                    textTransform: 'uppercase',
                  }}>
                    {ab.category === 'malice' ? `${ab.maliceCost} Malice` : ab.category === 'villain' ? `Villain ${ab.villainActionNum}` : ab.category}
                  </span>
                )}
              </div>
              {ab.keywords.length > 0 && (
                <div style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic', marginBottom: 3 }}>
                  {ab.keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' · ')}
                </div>
              )}
              <div style={{ fontSize: 11, color: T.textDim }}>
                {ab.actionCost > 0 ? `${ab.actionCost} Action` : ab.actionType}
                {ab.distance && ` · ${ab.distance}`}
                {ab.target && ` · ${ab.target}`}
              </div>
              {ab.powerRoll && (
                <div style={{ marginTop: 6, fontSize: 11 }}>
                  <span style={{ color: T.textMuted }}>Power Roll +{ab.powerRoll.characteristic.slice(0, 3).toUpperCase()}: </span>
                  <span style={{ color: T.red }}>≤11: {ab.powerRoll.tier1}</span>
                  <span style={{ color: T.textMuted }}> · </span>
                  <span style={{ color: T.gold }}>12-16: {ab.powerRoll.tier2}</span>
                  <span style={{ color: T.textMuted }}> · </span>
                  <span style={{ color: T.green }}>17+: {ab.powerRoll.tier3}</span>
                </div>
              )}
              {ab.effect && <div style={{ marginTop: 4, fontSize: 11, color: T.textMuted, fontStyle: 'italic' }}>{ab.effect}</div>}
            </div>
          ))}
        </div>
      )}

      {(ds.immunities.length > 0 || ds.weaknesses.length > 0) && (
        <div style={{ marginTop: 8, fontSize: 12, color: T.textMuted }}>
          {ds.immunities.length > 0 && <span>Immune: {ds.immunities.join(', ')} </span>}
          {ds.weaknesses.length > 0 && <span>Weakness: {ds.weaknesses.join(', ')}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function DrawSteelApp() {
  const [themeKey, setThemeKey] = useState<DSThemeKey>(() => (localStorage.getItem(THEME_STORAGE_KEY) as DSThemeKey) ?? 'steel')
  const [mode, setMode] = useState<Mode>('text')
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameCtx, setNameCtx] = useState('')
  const [parsed, setParsed] = useState<DSActor | null>(null)
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyPresent, setApiKeyPresent] = useState(hasApiKey())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectTheme = (k: DSThemeKey) => {
    localStorage.setItem(THEME_STORAGE_KEY, k)
    T = DS_THEMES[k]
    setThemeKey(k)
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const reset = () => {
    setInput(''); setNameInput(''); setNameCtx('')
    setParsed(null); setRawText(''); setError('')
  }

  const processText = useCallback((text: string) => {
    setError('')
    const actor = parseDrawSteelStatBlock(text)
    if (!actor) { setError('Could not parse stat block — check the format.'); return }
    setParsed(actor)
    setRawText(text)
  }, [])

  const handleTextParse = () => {
    if (!input.trim()) return
    processText(input.trim())
  }

  const handleNameGenerate = async () => {
    if (!nameInput.trim()) return
    if (!hasApiKey()) { setShowSettings(true); return }
    setLoading(true); setError('')
    try {
      const text = await generateDrawSteelStatBlock(nameInput.trim(), nameCtx)
      setRawText(text)
      const actor = parseDrawSteelStatBlock(text)
      if (!actor) throw new Error('AI returned text that could not be parsed.')
      setParsed(actor)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed.')
    } finally { setLoading(false) }
  }

  const handleImageUpload = async (file: File) => {
    if (!hasApiKey()) { setShowSettings(true); return }
    setLoading(true); setError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const dataUrl = ev.target?.result as string
        const text = await extractDrawSteelStatBlockFromImage(dataUrl)
        setRawText(text)
        const actor = parseDrawSteelStatBlock(text)
        if (!actor) throw new Error('AI returned text that could not be parsed.')
        setParsed(actor)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Image extraction failed.')
      } finally { setLoading(false) }
    }
    reader.readAsDataURL(file)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleImageUpload(file)
  }

  const foundryActor = parsed ? toDrawSteelFoundryActor(parsed) : null
  const macro = foundryActor ? buildDrawSteelImportMacro(foundryActor) : ''

  const s: React.CSSProperties & Record<string, string> = {
    '--bg': T.bg, '--surface': T.surface, '--surface2': T.surface2,
    '--border': T.border, '--accent': T.accent, '--text': T.text,
    '--text-muted': T.textMuted,
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif', ...s }}>
      {showSettings && (
        <ApiKeyModal
          onClose={() => setShowSettings(false)}
          onSaved={() => setApiKeyPresent(hasApiKey())}
          themeKey={themeKey}
          onThemeChange={selectTheme}
        />
      )}

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${T.border}`, background: `linear-gradient(180deg, ${T.surface} 0%, ${T.bg} 100%)`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/about.html" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: T.textMuted, letterSpacing: '0.5px' }}>⚔ DM VTT Toolkit</span>
        </a>
        <span style={{ color: T.textDim }}>›</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: T.accentText, letterSpacing: '0.5px' }}>
          ⚡ Draw Steel
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: T.textDim, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '2px 8px' }}>Foundry VTT</span>
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: apiKeyPresent ? T.green : T.textMuted, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}
          >
            <Settings size={13} />
            {apiKeyPresent ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, padding: 3, width: 'fit-content' }}>
          {([['text', 'Text', FileText], ['name', '✨ AI Name', Sparkles], ['image', 'Image', ImageIcon]] as [Mode, string, React.ElementType][]).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: mode === m ? T.accent : 'transparent',
                color: mode === m ? '#fff' : T.textMuted,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: parsed ? '1fr 1fr' : '1fr', gap: 20 }}>

          {/* Input panel */}
          <div>
            {mode === 'text' && (
              <>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>
                    PASTE STAT BLOCK
                    <span style={{ fontWeight: 400, marginLeft: 6, fontSize: 11 }}>— SteelCompendium markdown format (YAML frontmatter + blockquote abilities)</span>
                  </div>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={'---\nname: Goblin Sniper\nlevel: 1\nev: 8\nstamina: 20\nspeed: 5\nsize: 1M\nstability: 0\nmight: -1\nagility: 2\nreason: 0\nintuition: 1\npresence: 0\nfree_strike: 2\nancestry:\n  - Goblin\nroles:\n  - Ambusher\n---\n\n> #### 🏹 Shortbow\n> *Attack, Ranged, Weapon*\n>\n> **1 Action** | Ranged 10 | One creature\n>\n> **Power Roll** + Agility:\n> - ≤11: 3 damage\n> - 12-16: 5 damage\n> - 17+: 8 damage'}
                    style={{ width: '100%', height: 320, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, color: T.text, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                </div>
                <button
                  onClick={handleTextParse}
                  disabled={!input.trim()}
                  style={{ width: '100%', background: input.trim() ? T.accent : T.surface2, color: input.trim() ? '#fff' : T.textMuted, border: `1px solid ${input.trim() ? T.accent : T.border}`, borderRadius: 7, padding: '9px 0', fontSize: 14, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default', transition: 'background 0.15s' }}
                >
                  Parse Stat Block
                </button>
              </>
            )}

            {mode === 'name' && (
              <>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>CREATURE NAME</div>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameGenerate()}
                  placeholder="Goblin Sniper, Iron Golem, Elder Dragon..."
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 12px', color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                />
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>CONTEXT <span style={{ fontWeight: 400 }}>(optional)</span></div>
                <textarea
                  value={nameCtx}
                  onChange={e => setNameCtx(e.target.value)}
                  placeholder="Level 3 ambusher, part of a goblin warband. Uses hit-and-run tactics."
                  rows={3}
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 12px', color: T.text, fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                />
                {!apiKeyPresent && (
                  <div style={{ background: T.surface, border: `1px solid ${T.gold}44`, borderRadius: 7, padding: '8px 12px', fontSize: 12, color: T.gold, marginBottom: 10 }}>
                    ⚠ API key required — <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: T.accent, cursor: 'pointer', fontSize: 12, padding: 0 }}>open Settings</button>
                  </div>
                )}
                <button
                  onClick={handleNameGenerate}
                  disabled={loading || !nameInput.trim()}
                  style={{ width: '100%', background: T.accent, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 14, fontWeight: 700, cursor: loading || !nameInput.trim() ? 'default' : 'pointer', opacity: loading || !nameInput.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles size={14} /> Generate with AI</>}
                </button>
              </>
            )}

            {mode === 'image' && (
              <>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${T.border}`, borderRadius: 10, padding: 48,
                    textAlign: 'center', cursor: 'pointer', color: T.textMuted,
                    background: T.surface, marginBottom: 12,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <ImageIcon size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop image here or click to browse</div>
                  <div style={{ fontSize: 12 }}>PNG, JPG, WebP · AI extracts the stat block</div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
                </div>
                {!apiKeyPresent && (
                  <div style={{ background: T.surface, border: `1px solid ${T.gold}44`, borderRadius: 7, padding: '8px 12px', fontSize: 12, color: T.gold }}>
                    ⚠ API key required — <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: T.accent, cursor: 'pointer', fontSize: 12, padding: 0 }}>open Settings</button>
                  </div>
                )}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.textMuted, fontSize: 13, marginTop: 12 }}>
                    <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Extracting stat block...
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{ marginTop: 10, background: `${T.red}18`, border: `1px solid ${T.red}44`, borderRadius: 7, padding: '8px 12px', fontSize: 12, color: T.red }}>
                {error}
              </div>
            )}

            {/* Raw text area (after generation) */}
            {rawText && mode === 'name' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, fontWeight: 600 }}>GENERATED MARKDOWN</div>
                <textarea
                  value={rawText}
                  onChange={e => { setRawText(e.target.value); const a = parseDrawSteelStatBlock(e.target.value); if (a) setParsed(a) }}
                  style={{ width: '100%', height: 200, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: 10, color: T.textMuted, fontSize: 11, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {parsed && (
              <button
                onClick={reset}
                style={{ marginTop: 10, background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 14px', fontSize: 12, color: T.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Output panel */}
          {parsed && foundryActor && (
            <div>
              <StatPreview ds={parsed} />

              {/* Export buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => copyText(macro, 'macro')}
                  style={{ background: T.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                >
                  {copied === 'macro' ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied === 'macro' ? 'Copied!' : 'Copy Import Macro'}
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => copyText(JSON.stringify(foundryActor, null, 2), 'json')}
                    style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {copied === 'json' ? <CheckCircle size={12} /> : <FileText size={12} />}
                    {copied === 'json' ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(foundryActor, null, 2)], { type: 'application/json' })
                      const a = document.createElement('a')
                      a.href = URL.createObjectURL(blob)
                      a.download = `${parsed.name.replace(/\s+/g, '-').toLowerCase()}.json`
                      a.click()
                    }}
                    style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>

              {/* Macro instructions */}
              <div style={{ marginTop: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>How to import</div>
                <ol style={{ margin: 0, paddingLeft: 16 }}>
                  <li>Copy the import macro above</li>
                  <li>In Foundry, open a macro (hotbar → New Macro → Script)</li>
                  <li>Paste and click Execute</li>
                  <li>Find the actor in the Actors sidebar</li>
                </ol>
                <div style={{ marginTop: 6, color: T.textDim }}>Requires: Foundry VTT + draw-steel system (MetaMorphic-Digital) v1.0.0+</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
