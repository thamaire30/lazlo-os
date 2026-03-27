import { useState } from 'react'
import { CAT_META, BUILDER_ACTIONS, BUILDER_DURATIONS, BUILDER_INTENSITIES } from '../data/constants.js'

const inputStyle = {
  width:'100%', padding:'11px 14px',
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:'9px', color:'#e8f5e0', fontFamily:"'Space Mono', monospace", fontSize:'13px',
}

const Block = ({ selected, onClick, color, children }) => (
  <button onClick={onClick} style={{
    padding:'8px 13px', borderRadius:'9px', cursor:'pointer',
    background: selected ? (color ? `${color}20` : 'rgba(200,241,53,0.14)') : 'rgba(255,255,255,0.03)',
    border:`1.5px solid ${selected ? (color||'#c8f135') : 'rgba(255,255,255,0.08)'}`,
    color: selected ? (color||'#c8f135') : '#555',
    fontFamily:"'Space Mono', monospace", fontSize:'12px',
    transition:'all 0.15s', textAlign:'left',
  }}>{children}</button>
)

const Step = ({ n, title, children }) => (
  <div style={{ marginBottom:'20px' }} className="fade-in">
    <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1.5px', marginBottom:'10px' }}>
      {String(n).padStart(2,'0')} — {title}
    </div>
    {children}
  </div>
)

export default function Builder({ customBank, setCustomBank, dailyTasks, setDailyTasks, addXp }) {
  const [b, setB] = useState({ category:'', action:'', duration:'', intensity:'', subject:'', urgent:false })
  const [flash, setFlash] = useState('')

  const selAction    = (BUILDER_ACTIONS[b.category]||[]).find(a => a.id === b.action)
  const selDuration  = BUILDER_DURATIONS.find(d => d.id === b.duration)
  const selIntensity = BUILDER_INTENSITIES.find(i => i.id === b.intensity)
  const computedXP   = selDuration && selIntensity ? Math.round(selDuration.xpBase * selIntensity.mult) : null
  const previewText  = selAction && b.subject && selDuration
    ? `${selAction.verb} ${b.subject} — ${b.duration}min` : null
  const canCreate    = b.category && b.action && b.duration && b.intensity && b.subject.trim()

  const addToDay = () => {
    if (!canCreate) return
    const task = {
      id: Date.now(), text: previewText, xp: computedXP,
      urgent: b.urgent, done: false, category: b.category, source: 'custom',
    }
    setDailyTasks(ts => [...ts, task])
    setB({ category:'', action:'', duration:'', intensity:'', subject:'', urgent:false })
    setFlash('day')
    setTimeout(() => setFlash(''), 2000)
  }

  const saveToBank = () => {
    if (!canCreate) return
    const task = {
      id: Date.now(), text: previewText, xp: computedXP,
      urgent: b.urgent, category: b.category, source: 'custom',
    }
    setCustomBank(cb => [...cb, task])
    addXp(10)
    setB({ category:'', action:'', duration:'', intensity:'', subject:'', urgent:false })
    setFlash('bank')
    setTimeout(() => setFlash(''), 2000)
  }

  const removeFromBank = (id) => setCustomBank(cb => cb.filter(t => t.id !== id))

  return (
    <div className="fade-in">
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'4px' }}>// TASK BUILDER</div>
      <div style={{ fontSize:'12px', color:'#383838', marginBottom:'20px' }}>
        Combine les blocs → l'XP se calcule automatiquement
      </div>

      <Step n={1} title="CATÉGORIE">
        <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
          {Object.entries(CAT_META).map(([key, meta]) => (
            <Block key={key} selected={b.category===key} color={meta.color}
              onClick={() => setB(v => ({...v, category:key, action:''}))}>
              {meta.label}
            </Block>
          ))}
        </div>
      </Step>

      {b.category && (
        <Step n={2} title="TYPE D'ACTION">
          <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
            {(BUILDER_ACTIONS[b.category]||[]).map(a => (
              <Block key={a.id} selected={b.action===a.id}
                onClick={() => setB(v => ({...v, action:a.id}))}>
                {a.label}
              </Block>
            ))}
          </div>
        </Step>
      )}

      {b.action && (
        <Step n={3} title="SUJET / CONTENU">
          <input value={b.subject} onChange={e => setB(v=>({...v, subject:e.target.value}))}
            placeholder={b.category==='medecine' ? "ex: l'insuffisance rénale aiguë" :
              b.category==='business' ? "ex: ma startup de téléconsultation" :
              b.category==='invest' ? "ex: les ETF World" :
              b.category==='skills' ? "ex: la psychologie des foules" :
              "ex: ma discipline matinale"}
            style={inputStyle} />
        </Step>
      )}

      {b.subject && (
        <Step n={4} title="DURÉE">
          <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
            {BUILDER_DURATIONS.map(d => (
              <Block key={d.id} selected={b.duration===d.id}
                onClick={() => setB(v=>({...v, duration:d.id}))}>
                {d.label}
              </Block>
            ))}
          </div>
        </Step>
      )}

      {b.duration && (
        <Step n={5} title="INTENSITÉ">
          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
            {BUILDER_INTENSITIES.map(i => (
              <button key={i.id} onClick={() => setB(v=>({...v, intensity:i.id}))} style={{
                padding:'11px 14px', borderRadius:'9px', cursor:'pointer',
                background: b.intensity===i.id ? 'rgba(200,241,53,0.1)' : 'rgba(255,255,255,0.02)',
                border:`1.5px solid ${b.intensity===i.id ? '#c8f135' : 'rgba(255,255,255,0.06)'}`,
                color: b.intensity===i.id ? '#c8f135' : '#555',
                fontFamily:"'Space Mono'", fontSize:'12px',
                display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.15s',
              }}>
                <span>{i.label}</span>
                <span style={{ fontSize:'10px', opacity:0.6 }}>{i.desc}</span>
              </button>
            ))}
          </div>
        </Step>
      )}

      {b.intensity && (
        <Step n={6} title="PRIORITÉ">
          <button onClick={() => setB(v=>({...v, urgent:!v.urgent}))} style={{
            padding:'9px 18px', borderRadius:'9px', cursor:'pointer',
            background: b.urgent ? 'rgba(255,100,50,0.1)' : 'rgba(255,255,255,0.02)',
            border:`1.5px solid ${b.urgent ? '#ff6432' : 'rgba(255,255,255,0.06)'}`,
            color: b.urgent ? '#ff6432' : '#444',
            fontFamily:"'Space Mono'", fontSize:'12px', transition:'all 0.15s',
          }}>
            {b.urgent ? '⚡ URGENT — passe en priorité' : '→ Pas urgent (normal)'}
          </button>
        </Step>
      )}

      {/* Preview */}
      {previewText && computedXP && (
        <div className="fade-in" style={{ padding:'14px 16px', marginBottom:'14px', borderRadius:'11px',
          background:'rgba(200,241,53,0.06)', border:'1px solid rgba(200,241,53,0.22)' }}>
          <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'8px' }}>APERÇU</div>
          <div style={{ display:'flex', gap:'6px', marginBottom:'8px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'8px',
              background:`${CAT_META[b.category].color}15`, color:CAT_META[b.category].color,
              border:`1px solid ${CAT_META[b.category].color}25` }}>
              {CAT_META[b.category].label}
            </span>
            {b.urgent && <span style={{ fontSize:'9px', color:'#ff6432' }}>⚡ URGENT</span>}
          </div>
          <div style={{ fontSize:'13px', color:'#ddd', lineHeight:'1.4', marginBottom:'10px' }}>{previewText}</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:"'Bebas Neue'", fontSize:'26px', color:'#c8f135', letterSpacing:'2px' }}>+{computedXP} XP</span>
            <span style={{ fontSize:'10px', color:'#444' }}>{b.duration}min · {selIntensity?.label}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {canCreate && (
        <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'28px' }}>
          <button onClick={addToDay} style={{ width:'100%', padding:'14px',
            background: flash==='day' ? '#a8d120' : '#c8f135', border:'none', borderRadius:'10px',
            cursor:'pointer', color:'#0a0a0a', fontFamily:"'Bebas Neue'", fontSize:'18px', letterSpacing:'2px',
            transition:'all 0.2s' }}>
            {flash==='day' ? '✓ AJOUTÉE AU DASHBOARD !' : '→ AJOUTER AUJOURD\'HUI'}
          </button>
          <button onClick={saveToBank} style={{ width:'100%', padding:'12px',
            background: flash==='bank' ? 'rgba(196,126,245,0.2)' : 'rgba(196,126,245,0.08)',
            border:'1.5px solid rgba(196,126,245,0.4)', borderRadius:'10px',
            cursor:'pointer', color:'#c47ef5', fontFamily:"'Bebas Neue'", fontSize:'15px', letterSpacing:'1px',
            transition:'all 0.2s' }}>
            {flash==='bank' ? '✓ SAUVEGARDÉE DANS TA BANQUE !' : '✦ SAUVEGARDER DANS MA BANQUE +10 XP'}
          </button>
        </div>
      )}

      {/* Custom bank */}
      {customBank.length > 0 && (
        <div>
          <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>
            // MA BANQUE DE TÂCHES PERSO ({customBank.length})
          </div>
          <div style={{ fontSize:'11px', color:'#383838', marginBottom:'12px' }}>
            Ces tâches apparaissent automatiquement dans tes missions quotidiennes.
          </div>
          {customBank.map(t => {
            const meta = CAT_META[t.category]
            return (
              <div key={t.id} style={{ padding:'11px 14px', marginBottom:'6px', borderRadius:'9px',
                background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)',
                display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'8px', marginBottom:'5px', display:'inline-block',
                    background:`${meta.color}15`, color:meta.color }}>
                    {meta.label}
                  </span>
                  <div style={{ fontSize:'12px', color:'#aaa', lineHeight:'1.3', marginTop:'3px' }}>{t.text}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                  <span style={{ color:'#c8f135', fontFamily:"'Bebas Neue'", fontSize:'16px' }}>+{t.xp}</span>
                  <button onClick={() => removeFromBank(t.id)} style={{ background:'transparent', border:'none',
                    color:'#333', cursor:'pointer', fontSize:'14px', padding:'2px 6px' }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
