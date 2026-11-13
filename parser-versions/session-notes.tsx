// session-notes.tsx — Session Notes panel for the Campaign Builder
// Flow: transcript (from the local Audio Transcriber) or .md notes → AI draft → DM edits → .md export,
// next-session to-do list, and a Foundry macro that writes a "Session Log" journal (update-in-place safe).
// Sessions live in localStorage per campaign; the .md files remain the source of truth.
import React, { useEffect, useRef, useState } from 'react'
import { Copy, Check, Download, Upload, Plus, Trash2, Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { generateSessionNotesFromTranscript, generateNextSessionTodo, hasApiKey } from './claude-api'

export type SessionEntry = {
  id: string
  date: string      // YYYY-MM-DD
  title: string
  notes: string     // markdown
  todo: string      // markdown: to-do for the NEXT session
}

const lsKey = (campaignId: string) => `dnd_session_notes_${campaignId}`

function loadSessions(campaignId: string): SessionEntry[] {
  try {
    const raw = localStorage.getItem(lsKey(campaignId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function saveSessions(campaignId: string, sessions: SessionEntry[]) {
  try { localStorage.setItem(lsKey(campaignId), JSON.stringify(sessions)) } catch { /* storage blocked */ }
}

// ─── Markdown → HTML (small subset: headings, lists, checkboxes, tables, bold/italic/code) ─────
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
}
export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null } }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) { closeList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue }
    if (/^\s*\|.*\|\s*$/.test(line)) {                       // table block
      closeList()
      const rows: string[] = []
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++ }
      i--
      const cells = (r: string) => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      const body = rows.filter(r => !/^\s*\|[\s:|-]+\|\s*$/.test(r))
      out.push('<table>' + body.map((r, idx) =>
        '<tr>' + cells(r).map(c => idx === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</table>')
      continue
    }
    const task = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)$/)
    const ul = line.match(/^\s*[-*]\s+(.*)$/)
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (task) { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul' } out.push(`<li>${task[1] === ' ' ? '☐' : '☑'} ${inline(task[2])}</li>`); continue }
    if (ul)   { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul' } out.push(`<li>${inline(ul[1])}</li>`); continue }
    if (ol)   { if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol' } out.push(`<li>${inline(ol[1])}</li>`); continue }
    closeList()
    if (line.trim() === '') continue
    out.push(`<p>${inline(line)}</p>`)
  }
  closeList()
  return out.join('\n')
}

// ─── Foundry macro ─────────────────────────────────────────────────────────────
// Creates or updates one journal ("Session Log") with a page per session plus a "Next Session To-Do" page
// (the to-do of the newest session). Safe to re-run: pages are matched by name and updated in place.
export function buildSessionLogMacro(campaignName: string, folderName: string, sessions: SessionEntry[]): string {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const pages = sorted.map(s => ({
    name: `${s.date} — ${s.title || 'Session'}`,
    type: 'text', text: { content: markdownToHtml(s.notes || '<em>No notes yet.</em>'), format: 1 },
  }))
  const latest = sorted[sorted.length - 1]
  if (latest?.todo.trim()) {
    pages.push({ name: 'Next Session To-Do', type: 'text', text: { content: markdownToHtml(latest.todo), format: 1 } })
  }
  return `// Session Log — ${campaignName} — safe to re-run: pages with the same name are updated in place, nothing is deleted
(async () => {
  const folder = game.folders.find(f => f.name === ${JSON.stringify(folderName)} && f.type === 'JournalEntry');
  const folderId = folder?.id ?? null;
  const pages = ${JSON.stringify(pages, null, 2)};
  let entry = game.journal.find(e => e.name === 'Session Log' && (e.folder?.id ?? null) === folderId);
  if (!entry) { entry = await JournalEntry.create({ name: 'Session Log', folder: folderId, pages: [] }); }
  let created = 0, updated = 0;
  for (const p of pages) {
    const page = entry.pages.getName(p.name);
    if (page) { await page.update({ 'text.content': p.text.content }); updated++; }
    else { await entry.createEmbeddedDocuments('JournalEntryPage', [p]); created++; }
  }
  ui.notifications.info('✅ Session Log: ' + created + ' pages created, ' + updated + ' updated.');
})();`
}

// ─── File helpers ──────────────────────────────────────────────────────────────
function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
function sessionToMarkdown(s: SessionEntry): string {
  return `${s.notes.trim()}\n\n---\n\n# To-do for the next session\n\n${s.todo.trim() || '_None yet._'}\n`
}
const today = () => new Date().toISOString().slice(0, 10)
const uid = () => Math.random().toString(36).slice(2, 10)

// ─── Component ─────────────────────────────────────────────────────────────────
const box = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20, marginBottom: 16 } as const
const input = { background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', fontSize: 12 } as const
const area = { ...input, width: '100%', minHeight: 220, resize: 'vertical' as const, boxSizing: 'border-box' as const }
const btn = (bg: string, disabled = false) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, background: disabled ? '#334155' : bg, color: '#fff', border: 'none',
  borderRadius: 6, padding: '6px 12px', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600,
} as const)

export function SessionNotesPanel({ campaignId, campaignName, journalFolderName }: {
  campaignId: string; campaignName: string; journalFolderName: string
}) {
  const [open, setOpen] = useState(false)
  const [sessions, setSessions] = useState<SessionEntry[]>(() => loadSessions(campaignId))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [context, setContext] = useState('')
  const [busy, setBusy] = useState<'' | 'notes' | 'todo'>('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const mdInput = useRef<HTMLInputElement>(null)
  const txtInput = useRef<HTMLInputElement>(null)

  useEffect(() => { setSessions(loadSessions(campaignId)); setSelectedId(null) }, [campaignId])
  useEffect(() => { saveSessions(campaignId, sessions) }, [campaignId, sessions])

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
  const current = sessions.find(s => s.id === selectedId) ?? null
  const patch = (p: Partial<SessionEntry>) => setSessions(ss => ss.map(s => s.id === selectedId ? { ...s, ...p } : s))

  const addSession = (init?: Partial<SessionEntry>) => {
    const s: SessionEntry = { id: uid(), date: today(), title: '', notes: '', todo: '', ...init }
    setSessions(ss => [...ss, s]); setSelectedId(s.id)
  }
  const removeSession = () => {
    if (!current || !window.confirm(`Delete the session "${current.date} ${current.title}" from this browser? Export it first if you want to keep it.`)) return
    setSessions(ss => ss.filter(s => s.id !== current.id)); setSelectedId(null)
  }

  const readFile = (file: File, cb: (text: string, name: string) => void) => {
    const r = new FileReader(); r.onload = () => cb(String(r.result ?? ''), file.name); r.readAsText(file)
  }
  const importMd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    readFile(f, (text, name) => {
      const date = name.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? today()
      const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? name.replace(/\.md$/i, '')
      const [notes, todo] = text.split(/\n#\s+To-do for the next session\s*\n/i)
      addSession({ date, title, notes: notes.replace(/\n---\s*$/, '').trim(), todo: (todo ?? '').trim() })
    })
    e.target.value = ''
  }
  const importTranscript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    readFile(f, text => setTranscript(text)); e.target.value = ''
  }

  const run = async (kind: 'notes' | 'todo') => {
    setError('')
    if (!hasApiKey()) { setError('No API key configured — open Settings (⚙) to add your Claude key.'); return }
    setBusy(kind)
    try {
      if (kind === 'notes') {
        if (!transcript.trim()) throw new Error('Paste or load a transcript first.')
        let id = selectedId
        if (!id) { const s: SessionEntry = { id: uid(), date: today(), title: '', notes: '', todo: '' }; setSessions(ss => [...ss, s]); id = s.id; setSelectedId(id) }
        const md = await generateSessionNotesFromTranscript(transcript, campaignName, context)
        const title = md.match(/^#\s+(.+)$/m)?.[1]?.trim()
        setSessions(ss => ss.map(s => s.id === id ? { ...s, notes: md, title: s.title || (title && !/^session notes$/i.test(title) ? title : '') } : s))
      } else {
        if (!current?.notes.trim()) throw new Error('Select a session with notes first.')
        const earlier = sorted.find(s => s.date < current.date && s.todo.trim())
        const todo = await generateNextSessionTodo(current.notes, campaignName, earlier?.todo)
        patch({ todo })
      }
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally { setBusy('') }
  }

  const macro = buildSessionLogMacro(campaignName, journalFolderName, sessions)
  const copyMacro = () => {
    navigator.clipboard.writeText(macro).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  return (
    <div style={{ ...box, border: '1px solid #f59e0b' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Session Notes &amp; Next-Session Plan</span>
        <span style={{ color: '#64748b', fontSize: 12 }}>{sessions.length} saved in this browser</span>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: '#64748b', fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
            Transcribe the recording in the local Audio Transcriber, load the transcript here, let Claude draft the notes, edit them, then generate the to-do for next session.
            Export the .md to keep your files current, and copy the macro to write a <strong>Session Log</strong> journal into Foundry.
            Sessions are stored only in this browser — export .md files as your backup. Claude never changes lore on its own; suggested lore changes are listed separately for you to approve.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <button style={btn('#d97706')} onClick={() => addSession()}><Plus size={13} /> New session</button>
            <button style={btn('#475569')} onClick={() => mdInput.current?.click()}><Upload size={13} /> Import notes .md</button>
            <button style={btn('#475569')} onClick={() => txtInput.current?.click()}><Upload size={13} /> Load transcript .txt</button>
            <button style={btn('#475569', !sessions.length)} disabled={!sessions.length}
              onClick={() => download(`${slug(campaignName)}-session-log.md`, [...sessions].sort((a, b) => a.date.localeCompare(b.date)).map(sessionToMarkdown).join('\n\n=====\n\n'))}>
              <Download size={13} /> Export all .md
            </button>
            <button style={btn(copied ? '#065f46' : '#7c3aed', !sessions.length)} disabled={!sessions.length} onClick={copyMacro}>
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy Foundry macro'}
            </button>
            <input ref={mdInput} type="file" accept=".md,.txt,text/markdown" style={{ display: 'none' }} onChange={importMd} />
            <input ref={txtInput} type="file" accept=".txt" style={{ display: 'none' }} onChange={importTranscript} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>
              Transcript (from the Audio Transcriber){transcript ? ` — ${transcript.length.toLocaleString()} characters` : ''}
            </label>
            <textarea style={{ ...area, minHeight: 90 }} value={transcript} onChange={e => setTranscript(e.target.value)}
              placeholder="Paste or load the transcript text here. It is sent to Claude only when you press Draft notes." />
            <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', margin: '8px 0 4px' }}>
              Context for Claude (optional: player names and characters, who is who, last session's summary)
            </label>
            <textarea style={{ ...area, minHeight: 60 }} value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. Phil plays Diavol (paladin). Bob plays the gnome. Elysara Windrune is the High Elder of Lumaria." />
            <div style={{ marginTop: 8 }}>
              <button style={btn('#d97706', busy !== '' || !transcript.trim())} disabled={busy !== '' || !transcript.trim()} onClick={() => run('notes')}>
                <Sparkles size={13} /> {busy === 'notes' ? 'Drafting…' : (current ? 'Draft notes into selected session' : 'Draft notes (new session)')}
              </button>
            </div>
          </div>

          {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 10 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 220, minWidth: 200 }}>
              <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Sessions</div>
              {sorted.length === 0 && <div style={{ color: '#64748b', fontSize: 12 }}>None yet. Create one or import a .md file.</div>}
              {sorted.map(s => (
                <div key={s.id} onClick={() => setSelectedId(s.id)}
                  style={{ padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginBottom: 4,
                    background: s.id === selectedId ? '#334155' : 'transparent', color: s.id === selectedId ? '#f1f5f9' : '#cbd5e1' }}>
                  {s.date}{s.title ? ` — ${s.title}` : ''}
                </div>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 320 }}>
              {!current && <div style={{ color: '#64748b', fontSize: 12 }}>Select or create a session to edit it.</div>}
              {current && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input type="date" style={input} value={current.date} onChange={e => patch({ date: e.target.value })} />
                    <input style={{ ...input, flex: 1, minWidth: 160 }} placeholder="Session title" value={current.title} onChange={e => patch({ title: e.target.value })} />
                    <button style={btn('#475569')} onClick={() => download(`${current.date}-${slug(current.title || 'session')}.md`, sessionToMarkdown(current))}><Download size={13} /> .md</button>
                    <button style={btn('#991b1b')} onClick={removeSession}><Trash2 size={13} /></button>
                  </div>
                  <label style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 4 }}>Session notes (Markdown)</label>
                  <textarea style={area} value={current.notes} onChange={e => patch({ notes: e.target.value })} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 4px' }}>
                    <label style={{ color: '#94a3b8', fontSize: 12 }}>To-do for the next session (Markdown)</label>
                    <button style={btn('#d97706', busy !== '' || !current.notes.trim())} disabled={busy !== '' || !current.notes.trim()} onClick={() => run('todo')}>
                      <Sparkles size={13} /> {busy === 'todo' ? 'Generating…' : 'Generate to-do from notes'}
                    </button>
                  </div>
                  <textarea style={{ ...area, minHeight: 160 }} value={current.todo} onChange={e => patch({ todo: e.target.value })} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
