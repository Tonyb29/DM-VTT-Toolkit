import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { CYBER_VEHICLES, NEW_VEHICLE_UPGRADES, buildVehicleImportMacro } from '../parser-versions/cyberpunk-red-vehicles'

const T = {
  bg: '#08050a', surface: '#120c16', surface2: '#1a1220',
  border: '#2a1f36', accent: '#f0e000',
  text: '#e8e0f0', textMuted: '#8878a0', textDim: '#544868',
  cyan: '#00e5ff', green: '#40e070',
}

export default function CyberpunkRedVehiclesApp() {
  const [copied, setCopied] = useState(false)

  const copyMacro = () => {
    const macro = buildVehicleImportMacro()
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.clipboard) navigator.clipboard.writeText(macro).then(done).catch(() => fallbackCopy(macro, done))
    else fallbackCopy(macro, done)
  }
  const fallbackCopy = (text: string, done: () => void) => {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.focus(); ta.select()
    document.execCommand('copy'); document.body.removeChild(ta); done()
  }

  const cell: React.CSSProperties = { padding: '6px 10px', fontSize: 12, color: T.text, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }
  const head: React.CSSProperties = { ...cell, color: T.textMuted, fontWeight: 700, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', color: T.text }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Vehicles — The 12 Days of Vehiclemas</h2>
      <p style={{ margin: '0 0 16px', color: T.textMuted, fontSize: 13 }}>
        12 vehicles from R. Talsorian's free holiday DLC (Dec 2025), ready to import as Foundry items. Entered by hand from the PDF,
        so spot-check a vehicle against the book before using it at the table.
      </p>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 8 }}>Get them into Foundry</div>
        <ol style={{ margin: '0 0 12px', paddingLeft: 20, fontSize: 12.5, color: T.textMuted, lineHeight: 1.7 }}>
          <li>Click <b style={{ color: T.text }}>Copy import macro</b> below.</li>
          <li>In Foundry, open the <b style={{ color: T.text }}>Macro Directory</b> and create a macro. Set its <b style={{ color: T.text }}>Type to Script</b> and paste the code in.</li>
          <li>Run it. The 12 vehicles appear in two places, both in a folder called <i>Vehiclemas Vehicles</i>: the <b style={{ color: T.text }}>Items</b> sidebar (to give one to a character, drag it onto their sheet) and the <b style={{ color: T.text }}>Actors</b> sidebar.</li>
          <li>For the map, drag a vehicle from the <b style={{ color: T.text }}>Actors</b> sidebar onto the scene. It is a Mook whose HP is the vehicle's SDP and whose armor is its SP, with the vehicle item inside.</li>
        </ol>
        <button onClick={copyMacro} style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.accent, color: '#000', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy import macro'}
        </button>
        <div style={{ fontSize: 11, color: T.textDim, marginTop: 10, lineHeight: 1.5 }}>
          Safe to re-run: vehicles with the same name are updated, not duplicated. Upgrades such as Armored Chassis are listed in each
          vehicle's description and are not installed automatically. Armor SP is also in the description, since the vehicle item itself has no SP field.
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: T.surface }}>
          <thead>
            <tr>
              {['Vehicle', 'Type', 'Cost', 'SDP', 'Seats', 'SP', 'Move', 'Speed'].map(h => <th key={h} style={{ ...head, textAlign: 'left' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {CYBER_VEHICLES.map(v => (
              <tr key={v.name} title={v.notes}>
                <td style={{ ...cell, color: T.cyan, fontWeight: 600 }}>{v.name}</td>
                <td style={cell}>{v.baseType}</td>
                <td style={cell}>{v.cost.toLocaleString('en-US')}eb</td>
                <td style={cell}>{v.sdp}</td>
                <td style={cell}>{v.seats}</td>
                <td style={cell}>{v.sp}</td>
                <td style={cell}>{v.combatSpeed}{v.alt ? ` / ${v.alt.combatSpeed}` : ''}</td>
                <td style={cell}>{v.narrativeMph} mph{v.alt ? ` / ${v.alt.narrativeMph}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 8 }}>New vehicle upgrades in this DLC</div>
        <div style={{ fontSize: 11.5, color: T.textDim, marginBottom: 8 }}>Reference only for now — these are not imported.</div>
        {NEW_VEHICLE_UPGRADES.map(u => (
          <div key={u.name} style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, lineHeight: 1.5 }}>
            <b style={{ color: T.text }}>{u.name}</b> (Moto Rank {u.motoRank}, {u.availability}) — {u.effect}
          </div>
        ))}
      </div>
    </div>
  )
}
