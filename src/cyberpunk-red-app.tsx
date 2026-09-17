import React, { useRef, useState } from 'react'
import {
  Copy, Download, FileText, Loader, RotateCcw, Sparkles, Settings,
  Key, CheckCircle, AlertTriangle, X, Image as ImageIcon, UserSquare2, ScanLine, Contact,
} from 'lucide-react'
import {
  parseCyberpunkRedStatBlock, toCyberpunkRedFoundryActor, buildCyberpunkRedImportMacro,
  CPRNpc, STAT_KEYS,
} from '../parser-versions/cyberpunk-red-parser'
import {
  hasApiKey, getApiKey, setApiKey, clearApiKey,
  generateCyberpunkRedStatBlock, extractCyberpunkRedStatBlockFromImage,
} from '../parser-versions/claude-api'
import CharacterBuilder from './cyberpunk-red-character-builder'
import CyberpunkRedPCApp from './cyberpunk-red-pc-app'

const T = {
  bg: '#08050a', surface: '#120c16', surface2: '#1a1220',
  border: '#2a1f36', accent: '#f0e000', accentBright: '#ffff40',
  text: '#e8e0f0', textMuted: '#8878a0', textDim: '#544868',
  cyan: '#00e5ff', red: '#ff2060', green: '#40e070', gold: '#f0e000',
}

type Mode = 'text' | 'name' | 'image'

const PLACEHOLDER = `NAME: Booster Ganger
ROLE: Solo
STATS: INT 5, REF 6, DEX 6, TECH 4, COOL 6, WILL 5, LUCK 5, MOVE 6, BODY 7, EMP 4
HP: 40
SP: 11
SKILLS: Athletics +4, Brawling +6, Concentration +4, Evasion +6, Handgun +8, Perception +6, Persuasion +4, Stealth +6
WEAPONS: Medium Pistol (2d6), Knife (1d6)
ARMOR: Light Armorjack
CYBERWARE: Cyberaudio Suite, Skinweave
NOTES: Roams in packs of 3-5, prefers ambush tactics.`

// ─── API Key Modal ─────────────────────────────────────────────────────────────

function ApiKeyModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
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
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{ color: T.cyan }}>
              Get a key →
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={save}
            style={{ flex: 1, background: saved ? T.green : T.accent, color: '#000', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
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

function StatPreview({ npc }: { npc: CPRNpc }) {
  return (
    <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 700, color: T.accent }}>{npc.name}</span>
        {npc.role && <span style={{ fontSize: 11, color: T.cyan, background: `${T.cyan}18`, border: `1px solid ${T.border}`, borderRadius: 4, padding: '2px 7px' }}>{npc.role}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 6, marginBottom: 12 }}>
        {STAT_KEYS.map(k => (
          <div key={k} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{npc.stats[k]}</div>
            <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.red }}>{npc.hp}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>HP</div>
        </div>
        <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.cyan }}>{npc.sp}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>SP</div>
        </div>
      </div>

      {npc.skills.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Skills</div>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>
            {npc.skills.map(s => `${s.name} +${s.level}`).join(' · ')}
          </div>
        </div>
      )}

      {npc.weapons.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Weapons</div>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>
            {npc.weapons.map(w => `${w.name} (${w.damage})`).join(' · ')}
          </div>
        </div>
      )}

      {(npc.armor.length > 0 || npc.cyberware.length > 0) && (
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {npc.armor.length > 0 && <div>Armor: {npc.armor.join(', ')}</div>}
          {npc.cyberware.length > 0 && <div>Cyberware: {npc.cyberware.join(', ')}</div>}
        </div>
      )}
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────────────────────

type Tool = 'parser' | 'character' | 'pc'

export default function CyberpunkRedApp() {
  const [tool, setTool] = useState<Tool>('parser')
  const [mode, setMode] = useState<Mode>('text')
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [nameCtx, setNameCtx] = useState('')
  const [parsed, setParsed] = useState<CPRNpc | null>(null)
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyPresent, setApiKeyPresent] = useState(hasApiKey())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const reset = () => {
    setInput(''); setNameInput(''); setNameCtx('')
    setParsed(null); setRawText(''); setError('')
  }

  const processText = (text: string) => {
    setError('')
    const npc = parseCyberpunkRedStatBlock(text)
    if (!npc) { setError('Could not parse stat block — check the format.'); return }
    setParsed(npc)
    setRawText(text)
  }

  const handleTextParse = () => {
    if (!input.trim()) return
    processText(input.trim())
  }

  const handleNameGenerate = async () => {
    if (!nameInput.trim()) return
    if (!hasApiKey()) { setShowSettings(true); return }
    setLoading(true); setError('')
    try {
      const text = await generateCyberpunkRedStatBlock(nameInput.trim(), nameCtx)
      setRawText(text)
      const npc = parseCyberpunkRedStatBlock(text)
      if (!npc) throw new Error('AI returned text that could not be parsed.')
      setParsed(npc)
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
        const text = await extractCyberpunkRedStatBlockFromImage(dataUrl)
        setRawText(text)
        const npc = parseCyberpunkRedStatBlock(text)
        if (!npc) throw new Error('AI returned text that could not be parsed.')
        setParsed(npc)
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

  const foundryActor = parsed ? toCyberpunkRedFoundryActor(parsed) : null
  const macro = foundryActor ? buildCyberpunkRedImportMacro(foundryActor) : ''

  return (
    <div className="cpr-app-root" style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {showSettings && (
        <ApiKeyModal
          onClose={() => setShowSettings(false)}
          onSaved={() => setApiKeyPresent(hasApiKey())}
        />
      )}

      <header className="cpr-print-hide" style={{ borderBottom: `1px solid ${T.border}`, background: `linear-gradient(180deg, ${T.surface} 0%, ${T.bg} 100%)`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, letterSpacing: '0.5px' }}>
          ▲ Cyberpunk RED Toolkit
        </span>
        <div style={{ display: 'flex', gap: 4, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, padding: 3 }}>
          {([['parser', 'NPC Parser', ScanLine], ['character', 'Character Builder', UserSquare2], ['pc', 'PC Create', Contact]] as [Tool, string, React.ElementType][]).map(([tId, label, Icon]) => (
            <button
              key={tId}
              onClick={() => setTool(tId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: tool === tId ? T.accent : 'transparent',
                color: tool === tId ? '#000' : T.textMuted,
              }}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {tool === 'parser' && (
            <span style={{ fontSize: 11, color: T.textDim, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '2px 8px' }}>Foundry VTT</span>
          )}
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

      {tool === 'character' ? (
        <CharacterBuilder />
      ) : tool === 'pc' ? (
        <CyberpunkRedPCApp />
      ) : (
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
                color: mode === m ? '#000' : T.textMuted,
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
                    PASTE NPC STAT BLOCK
                    <span style={{ fontWeight: 400, marginLeft: 6, fontSize: 11 }}>— label:value format (NAME, ROLE, STATS, HP, SP, SKILLS, WEAPONS, ARMOR, CYBERWARE, NOTES), or paste a single stat block copied straight off a character-builder page like Demiplane Nexus</span>
                  </div>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={PLACEHOLDER}
                    style={{ width: '100%', height: 320, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, color: T.text, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                </div>
                <button
                  onClick={handleTextParse}
                  disabled={!input.trim()}
                  style={{ width: '100%', background: input.trim() ? T.accent : T.surface2, color: input.trim() ? '#000' : T.textMuted, border: `1px solid ${input.trim() ? T.accent : T.border}`, borderRadius: 7, padding: '9px 0', fontSize: 14, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default' }}
                >
                  Parse Stat Block
                </button>
              </>
            )}

            {mode === 'name' && (
              <>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>NPC NAME / CONCEPT</div>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNameGenerate()}
                  placeholder="Booster Ganger, Corp Security Guard, Netrunner Fixer..."
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 12px', color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                />
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>CONTEXT <span style={{ fontWeight: 400 }}>(optional)</span></div>
                <textarea
                  value={nameCtx}
                  onChange={e => setNameCtx(e.target.value)}
                  placeholder="Low-level street muscle for a Night City booster gang. Melee-focused, cheap cyberware."
                  rows={3}
                  style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: '9px 12px', color: T.text, fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                />
                {!apiKeyPresent && (
                  <div style={{ background: T.surface, border: `1px solid ${T.gold}44`, borderRadius: 7, padding: '8px 12px', fontSize: 12, color: T.gold, marginBottom: 10 }}>
                    ⚠ API key required — <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: T.cyan, cursor: 'pointer', fontSize: 12, padding: 0 }}>open Settings</button>
                  </div>
                )}
                <button
                  onClick={handleNameGenerate}
                  disabled={loading || !nameInput.trim()}
                  style={{ width: '100%', background: T.accent, color: '#000', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 14, fontWeight: 700, cursor: loading || !nameInput.trim() ? 'default' : 'pointer', opacity: loading || !nameInput.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
                    ⚠ API key required — <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: T.cyan, cursor: 'pointer', fontSize: 12, padding: 0 }}>open Settings</button>
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
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, fontWeight: 600 }}>GENERATED STAT BLOCK</div>
                <textarea
                  value={rawText}
                  onChange={e => { setRawText(e.target.value); const n = parseCyberpunkRedStatBlock(e.target.value); if (n) setParsed(n) }}
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
              <StatPreview npc={parsed} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => copyText(macro, 'macro')}
                  style={{ background: T.accent, color: '#000', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
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

              <div style={{ marginTop: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>How to import</div>
                <ol style={{ margin: 0, paddingLeft: 16 }}>
                  <li>Copy the import macro above</li>
                  <li>In Foundry, open a macro (hotbar → New Macro → Script)</li>
                  <li>Paste and click Execute</li>
                  <li>Find the actor in the Actors sidebar (type: Mook)</li>
                </ol>
                <div style={{ marginTop: 6, color: T.textDim }}>Requires: Foundry VTT + "Cyberpunk RED - Core" system. Skill-to-stat mapping is best-effort — adjust on the sheet if a skill lands under the wrong stat.</div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
