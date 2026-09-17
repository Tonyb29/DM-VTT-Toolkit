import React, { useState } from 'react'
import { Copy, Download, FileText, RotateCcw, CheckCircle } from 'lucide-react'
import {
  parseCyberpunkRedPC, toCyberpunkRedFoundryCharacter, buildCyberpunkRedCharacterMacro,
  CPRPlayerCharacter, PC_STAT_KEYS, LIFEPATH_FIELDS,
} from '../parser-versions/cyberpunk-red-pc-parser'

const T = {
  bg: '#08050a', surface: '#120c16', surface2: '#1a1220',
  border: '#2a1f36', accent: '#f0e000', accentBright: '#ffff40',
  text: '#e8e0f0', textMuted: '#8878a0', textDim: '#544868',
  cyan: '#00e5ff', red: '#ff2060', green: '#40e070', gold: '#f0e000',
}

const PLACEHOLDER = `NAME: Gasket
ROLE: Tech
ROLE RANK: 4
STATS: INT 7, REF 5, DEX 5, TECH 8, COOL 5, WILL 6, LUCK 7, MOVE 5, BODY 6, EMP 8
HP: 40
HUMANITY: 80
SKILLS: Basic Tech 6, Electronics/Security Tech 6, Cybertech 4, Land Vehicle Tech 3, Weaponstech 4, Athletics 2, First Aid 2, Evasion 2, Conversation 2
WEAPONS: Medium Pistol (2d6), Combat Knife (1d6)
ARMOR: Light Armorjack (Head 11, Body 11)
CYBERWARE: Cyberoptic, Neural Link
GEAR: Toolkit, Agent
CULTURAL ORIGIN: Night City
PERSONALITY: Curious and methodical, talks to machines more than people
FAMILY BACKGROUND: Nomad pack, left the convoy at 19
VALUED POSSESSION: Dad's old multitool
LIFE GOALS: Build something the city can't take away from her
NOTES: Any freeform notes about the character.`

export default function CyberpunkRedPCApp() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<CPRPlayerCharacter | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const reset = () => { setInput(''); setParsed(null); setError('') }

  const handleParse = () => {
    if (!input.trim()) return
    setError('')
    const pc = parseCyberpunkRedPC(input.trim())
    if (!pc) { setError('Could not parse — check the format.'); return }
    setParsed(pc)
  }

  const foundryActor = parsed ? toCyberpunkRedFoundryCharacter(parsed) : null
  const macro = foundryActor ? buildCyberpunkRedCharacterMacro(foundryActor) : ''
  const nonZeroSkills = parsed ? Array.from(parsed.skillLevels.entries()).filter(([, lvl]) => lvl > 0) : []
  const filledLifepath = parsed ? LIFEPATH_FIELDS.filter(([, key]) => parsed.lifepath[key]) : []

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, marginBottom: 18, maxWidth: 640 }}>
        Paste a full player character below to generate a real Foundry <b style={{ color: T.text }}>"character"</b> actor —
        all 63 Core skills included at the levels you specify (everything else defaults to 0),
        plus stats, HP, Humanity, Role, gear, and lifepath fields.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: parsed ? '1fr 1fr' : '1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>
            PASTE PLAYER CHARACTER
            <span style={{ fontWeight: 400, marginLeft: 6, fontSize: 11 }}>
              — label:value format (NAME, ROLE, STATS, HP, HUMANITY, SKILLS, WEAPONS, ARMOR, CYBERWARE, GEAR, plus lifepath labels)
            </span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            style={{ width: '100%', height: 380, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12, color: T.text, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
          />
          <button
            onClick={handleParse}
            disabled={!input.trim()}
            style={{ width: '100%', marginTop: 8, background: input.trim() ? T.red : T.surface2, color: '#fff', border: `1px solid ${input.trim() ? T.red : T.border}`, borderRadius: 7, padding: '9px 0', fontSize: 14, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default' }}
          >
            Build Character
          </button>

          {error && (
            <div style={{ marginTop: 10, background: `${T.red}18`, border: `1px solid ${T.red}44`, borderRadius: 7, padding: '8px 12px', fontSize: 12, color: T.red }}>
              {error}
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

        {parsed && foundryActor && (
          <div>
            <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 700, color: T.gold }}>{parsed.name}</span>
                {parsed.role && <span style={{ fontSize: 11, color: T.cyan, background: `${T.cyan}18`, border: `1px solid ${T.border}`, borderRadius: 4, padding: '2px 7px' }}>{parsed.role} (Rank {parsed.roleRank})</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 6, marginBottom: 12 }}>
                {PC_STAT_KEYS.map(k => (
                  <div key={k} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{parsed.stats[k]}</div>
                    <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.red }}>{parsed.hp}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>HP</div>
                </div>
                <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.cyan }}>{parsed.humanity}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>Humanity</div>
                </div>
              </div>

              {nonZeroSkills.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Skills Above 0 ({nonZeroSkills.length} of 63)</div>
                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>
                    {nonZeroSkills.map(([name, lvl]) => `${name} ${lvl}`).join(' · ')}
                  </div>
                </div>
              )}

              {parsed.weapons.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Weapons</div>
                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>
                    {parsed.weapons.map(w => `${w.name} (${w.damage})`).join(' · ')}
                  </div>
                </div>
              )}

              {(parsed.armor.length > 0 || parsed.cyberware.length > 0 || parsed.gear.length > 0) && (
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: filledLifepath.length ? 10 : 0 }}>
                  {parsed.armor.length > 0 && <div>Armor: {parsed.armor.map(a => `${a.name} (Head ${a.headSp}/Body ${a.bodySp})`).join(', ')}</div>}
                  {parsed.cyberware.length > 0 && <div>Cyberware: {parsed.cyberware.join(', ')}</div>}
                  {parsed.gear.length > 0 && <div>Gear: {parsed.gear.join(', ')}</div>}
                </div>
              )}

              {filledLifepath.length > 0 && (
                <div style={{ fontSize: 11.5, color: T.textMuted, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                  {filledLifepath.map(([label, key]) => (
                    <div key={key} style={{ marginBottom: 4 }}>
                      <span style={{ color: T.textDim, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em' }}>{label}: </span>
                      <span style={{ color: T.text }}>{parsed.lifepath[key]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => copyText(macro, 'macro')}
                style={{ background: T.red, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
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
                  <Download size={12} /> Download JSON
                </button>
              </div>
            </div>

            <div style={{ marginTop: 14, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>Recommended: Download JSON, then import in Foundry</div>
              <ol style={{ margin: 0, paddingLeft: 16 }}>
                <li>Actors sidebar → the Import icon in the directory header</li>
                <li>Select the downloaded .json file</li>
              </ol>
              <div style={{ marginTop: 6, color: T.textDim }}>Or use the macro (Macro Type must be "Script", not "Chat"). Skill list/levels match the Core rulebook — Weapons/Armor/Cyberware/Gear use simplified fields; adjust exact stats on the sheet after import if needed.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
