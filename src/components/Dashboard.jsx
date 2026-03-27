import { CAT_META } from '../data/constants.js'

const S = {
  section: { fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'10px' },
  card: { padding:'14px 16px', marginBottom:'8px', borderRadius:'10px',
    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
    transition:'all 0.2s' },
}

export default function Dashboard({ tasks, onToggle, onRefresh, xp, level, streak, history }) {
  const done = tasks.filter(t => t.done).length
  const totalXpToday = tasks.filter(t => t.done).reduce((s, t) => s + t.xp, 0)
  const urgent = tasks.filter(t => t.urgent && !t.done)

  // Category breakdown
  const cats = Object.entries(CAT_META).map(([key, meta]) => {
    const catTasks = tasks.filter(t => t.category === key)
    if (!catTasks.length) return null
    const catDone = catTasks.filter(t => t.done).length
    return { key, meta, total: catTasks.length, done: catDone }
  }).filter(Boolean)

  return (
    <div className="fade-in">
      {/* Urgent banner */}
      {urgent.length > 0 && (
        <div style={{ padding:'10px 14px', marginBottom:'14px', borderRadius:'10px',
          background:'rgba(255,100,50,0.08)', border:'1px solid rgba(255,100,50,0.25)',
          fontSize:'12px', color:'#ff6432' }}>
          ⚡ {urgent.length} tâche{urgent.length>1?'s':''} urgente{urgent.length>1?'s':''} — commence par là.
        </div>
      )}

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'14px' }}>
        {[
          ['XP JOUR', `+${totalXpToday}`, '#c8f135'],
          ['TÂCHES',  `${done}/${tasks.length}`, '#5ba4f5'],
          ['STREAK',  `${streak}🔥`, '#f5a623'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ padding:'10px', borderRadius:'10px', textAlign:'center',
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'9px', color:'#444', marginBottom:'4px' }}>{label}</div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'22px', color, letterSpacing:'1px' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {cats.length > 0 && (
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', marginBottom:'18px', paddingBottom:'2px' }}>
          {cats.map(({ key, meta, total, done: catDone }) => (
            <div key={key} style={{ flexShrink:0, padding:'6px 10px', borderRadius:'8px',
              background:`${meta.color}0a`, border:`1px solid ${meta.color}20` }}>
              <div style={{ fontSize:'9px', color: meta.color, marginBottom:'4px', whiteSpace:'nowrap' }}>
                {meta.label}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'36px', height:'2px', background:'rgba(255,255,255,0.06)', borderRadius:'1px' }}>
                  <div style={{ width:`${(catDone/total)*100}%`, height:'100%', background:meta.color, borderRadius:'1px', transition:'width 0.4s' }} />
                </div>
                <span style={{ fontSize:'9px', color: catDone===total ? meta.color : '#333' }}>
                  {catDone}/{total}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={S.section}>// MISSIONS DU JOUR</div>
        <button onClick={onRefresh} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:'16px', padding:'3px 10px', cursor:'pointer', color:'#444',
          fontFamily:"'Space Mono'", fontSize:'10px' }}>↻ nouvelles</button>
      </div>

      {tasks.map(task => {
        const meta = CAT_META[task.category] || { label: task.category, color:'#888' }
        return (
          <div key={task.id} className="row-hover" onClick={() => onToggle(task.id)} style={{
            ...S.card,
            display:'flex', alignItems:'flex-start', gap:'12px',
            opacity: task.done ? 0.45 : 1,
            border: `1px solid ${task.done ? 'rgba(200,241,53,0.15)' : task.urgent ? 'rgba(255,100,50,0.2)' : 'rgba(255,255,255,0.06)'}`,
          }}>
            <div style={{ width:20, height:20, borderRadius:'6px', flexShrink:0, marginTop:'1px',
              background: task.done ? '#c8f135' : 'transparent',
              border:`2px solid ${task.done ? '#c8f135' : '#2a2a2a'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'11px', color:'#0a0a0a', transition:'all 0.15s' }}>
              {task.done ? '✓' : ''}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'6px', marginBottom:'5px' }}>
                <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'8px',
                  background:`${meta.color}15`, color:meta.color, border:`1px solid ${meta.color}25` }}>
                  {meta.label}
                </span>
                {task.source === 'custom' && <span style={{ fontSize:'9px', color:'#c47ef5' }}>✦ perso</span>}
                {task.urgent && !task.done && <span style={{ fontSize:'9px', color:'#ff6432' }}>⚡ URGENT</span>}
              </div>
              <div style={{ fontSize:'13px', lineHeight:'1.45', color: task.done ? '#444' : '#ddd',
                textDecoration: task.done ? 'line-through' : 'none' }}>{task.text}</div>
              <div style={{ fontSize:'10px', color:'#c8f135', marginTop:'4px' }}>+{task.xp} XP</div>
            </div>
          </div>
        )
      })}

      {done === tasks.length && tasks.length > 0 && (
        <div style={{ textAlign:'center', padding:'24px', marginTop:'8px', borderRadius:'12px',
          background:'rgba(200,241,53,0.06)', border:'1px solid rgba(200,241,53,0.2)',
          animation:'pulse 2s ease infinite' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'28px', color:'#c8f135', letterSpacing:'2px' }}>MISSIONS ACCOMPLIES</div>
          <div style={{ fontSize:'12px', color:'#666', marginTop:'4px' }}>Tu peux être fier. Pour aujourd'hui.</div>
        </div>
      )}

      {/* Recent history */}
      {history.length > 0 && (
        <div style={{ marginTop:'20px' }}>
          <div style={S.section}>// DERNIERS JOURS</div>
          {history.slice(0, 5).map((h, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 12px', marginBottom:'4px', borderRadius:'8px',
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:'11px', color:'#444' }}>{h.date}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'11px', color:'#c8f135' }}>+{h.xpEarned} XP</span>
                <div style={{ width:'60px', height:'3px', background:'#1a1a1a', borderRadius:'2px' }}>
                  <div style={{ width:`${h.score}%`, height:'100%', borderRadius:'2px',
                    background: h.score > 70 ? '#c8f135' : h.score > 40 ? '#f5a623' : '#555' }} />
                </div>
                <span style={{ fontSize:'10px', color:'#444' }}>{h.score}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
