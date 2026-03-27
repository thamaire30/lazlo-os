import { useState, useRef, useEffect } from 'react'
import { COACH_SYSTEM } from '../data/constants.js'

const SUGGESTIONS = [
  "Pourquoi je procrastine autant ?",
  "Comment faire des tunes étudiant en médecine ?",
  "Donne-moi un plan pour cette semaine",
  "J'ai pas envie de bosser aujourd'hui",
  "Comment builder mon réseau dès maintenant ?",
  "Quelle compétence apprendre en parallèle de la médecine ?",
]

// Simple markdown-like formatting
function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        // Bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <div key={i} style={{ marginBottom: line === '' ? '6px' : '0' }}>
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} style={{ color:'#c8f135', fontWeight:'700' }}>{part.slice(2,-2)}</strong>
              }
              // Arrow list items
              if (part.startsWith('→') || part.startsWith('- ')) {
                return <span key={j} style={{ color:'#aaa' }}>{part}</span>
              }
              return <span key={j}>{part}</span>
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function Coach({ coachHistory, setCoachHistory }) {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [copied,  setCopied]  = useState(null)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [coachHistory, loading])

  const send = async (msg) => {
    const text = (msg || input).trim()
    if (!text || loading) return
    setError('')
    setInput('')
    const newHistory = [...coachHistory, { role:'user', content:text }]
    setCoachHistory(newHistory)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:600,
          system:COACH_SYSTEM,
          messages: newHistory.slice(-20),
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `Erreur ${res.status}`)
      }
      const data = await res.json()
      const reply = data.content?.[0]?.text || '...'
      setCoachHistory(h => [...h, { role:'assistant', content:reply }])
    } catch (e) {
      setCoachHistory(h => [...h, { role:'assistant', content:`Erreur : ${e.message}` }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const copyMsg = (text, idx) => {
    navigator.clipboard?.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 1500)
  }

  const clearHistory = () => { if (confirm("Effacer l'historique ?")) setCoachHistory([]) }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', height:'calc(100dvh - 160px)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
        <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px' }}>// LAZLO — COACH IA PERSONNEL</div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          {coachHistory.length > 0 && (
            <span style={{ fontSize:'9px', color:'#2a2a2a' }}>{coachHistory.length / 2 | 0} échanges</span>
          )}
          {coachHistory.length > 0 &&
            <button onClick={clearHistory} style={{ background:'transparent', border:'none',
              color:'#333', cursor:'pointer', fontSize:'10px', fontFamily:"'Space Mono'" }}>
              Effacer
            </button>}
        </div>
      </div>
      <div style={{ fontSize:'11px', color:'#c8f135', marginBottom:'12px', fontStyle:'italic' }}>
        Il connaît ton profil. Il ne te ménage pas.
      </div>

      {/* Chat */}
      <div style={{ flex:1, overflowY:'auto', marginBottom:'10px', display:'flex', flexDirection:'column', gap:'8px' }}>
        {coachHistory.length === 0 && (
          <div style={{ fontSize:'13px', color:'#333', fontStyle:'italic', textAlign:'center', marginTop:'30px' }}>
            Dis-moi ce qui bloque.<br/>Ou pose-moi une vraie question.
          </div>
        )}
        {coachHistory.map((m, i) => (
          <div key={i} style={{ position:'relative' }}
            onMouseEnter={e => e.currentTarget.querySelector('.copy-btn').style.opacity='1'}
            onMouseLeave={e => e.currentTarget.querySelector('.copy-btn').style.opacity='0'}>
            <div style={{
              alignSelf: m.role==='user' ? 'flex-end' : 'flex-start',
              maxWidth:'86%', marginLeft: m.role==='user' ? 'auto' : '0',
              padding:'10px 13px', lineHeight:'1.6',
              borderRadius: m.role==='user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: m.role==='user' ? 'rgba(200,241,53,0.1)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${m.role==='user' ? 'rgba(200,241,53,0.22)' : 'rgba(255,255,255,0.06)'}`,
              fontSize:'13px', color: m.role==='user' ? '#c8f135' : '#ddd',
            }}>
              {m.role === 'assistant' ? <MessageText text={m.content} /> : m.content}
            </div>
            <button className="copy-btn" onClick={() => copyMsg(m.content, i)} style={{
              position:'absolute', top:'6px', right: m.role==='user' ? 'auto' : '6px',
              left: m.role==='user' ? '6px' : 'auto',
              background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'5px',
              padding:'3px 7px', cursor:'pointer', color:'#666', fontSize:'9px',
              opacity:'0', transition:'opacity 0.15s', fontFamily:"'Space Mono'",
            }}>
              {copied===i ? '✓' : 'copy'}
            </button>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf:'flex-start', padding:'10px 14px', borderRadius:'12px',
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
            fontSize:'12px', color:'#444' }}>
            <span className="blink">LAZLO réfléchit...</span>
          </div>
        )}
        {error && <div style={{ fontSize:'11px', color:'#ff6432', textAlign:'center' }}>{error}</div>}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {coachHistory.length < 2 && (
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', marginBottom:'10px', paddingBottom:'4px' }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding:'6px 11px', background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.08)', borderRadius:'18px',
              cursor:'pointer', color:'#444', fontFamily:"'Space Mono'",
              fontSize:'10px', whiteSpace:'nowrap', flexShrink:0,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display:'flex', gap:'8px' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder="Parle à LAZLO... (Entrée = envoyer, Shift+Entrée = nouvelle ligne)"
          rows={2}
          style={{ flex:1, padding:'11px 14px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.09)', borderRadius:'9px',
            color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'13px',
            resize:'none', lineHeight:'1.5' }} />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          padding:'11px 18px', background: input.trim() ? '#c8f135' : 'rgba(255,255,255,0.05)',
          border:'none', borderRadius:'9px', cursor:'pointer',
          color: input.trim() ? '#0a0a0a' : '#333',
          fontFamily:"'Bebas Neue'", fontSize:'16px', letterSpacing:'1px', transition:'all 0.15s',
          alignSelf:'flex-end',
        }}>GO</button>
      </div>
    </div>
  )
}
