export default function Patterns({ history, weeklyScores, dailyTasks, xp, level, streak }) {
  const last7 = (() => {
    const days = []
    for (let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const key = d.toISOString().split('T')[0]
      const label = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][d.getDay()]
      days.push({ key, label, score: weeklyScores[key] ?? null })
    }
    return days
  })()

  const activeDays = last7.filter(d => d.score !== null)
  const avgScore = activeDays.length
    ? Math.round(activeDays.reduce((s,d) => s+(d.score||0), 0) / activeDays.length)
    : 0

  const totalXpAllTime = history.reduce((s,h) => s+(h.xpEarned||0), 0) + xp

  // Best day
  const bestDay = history.length
    ? history.reduce((best, h) => (!best || h.score > best.score) ? h : best, null)
    : null

  const maxBar = 72 // px

  return (
    <div className="fade-in">
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'14px' }}>// STATS & PATTERNS</div>

      {/* Key numbers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'18px' }}>
        {[
          ['XP TOTAL',   totalXpAllTime, '#c8f135'],
          ['NIVEAU',     level,          '#5ba4f5'],
          ['STREAK',     `${streak} 🔥`, '#f5a623'],
          ['MOY. 7J',    `${avgScore}%`, '#c47ef5'],
        ].map(([l,v,c]) => (
          <div key={l} style={{ padding:'12px', borderRadius:'10px', textAlign:'center',
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'9px', color:'#444', marginBottom:'5px', letterSpacing:'0.5px' }}>{l}</div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'26px', color:c, letterSpacing:'1px' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* 7-day bar chart — fixed height calculation */}
      <div style={{ padding:'14px', borderRadius:'10px', marginBottom:'14px',
        background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'14px' }}>
          PRODUCTIVITÉ — 7 DERNIERS JOURS
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:`${maxBar + 20}px` }}>
          {last7.map((d, i) => {
            const barH = d.score !== null ? Math.max(Math.round(d.score * maxBar / 100), 4) : 4
            const isToday = i === 6
            const barColor = d.score === null ? '#1a1a1a'
              : d.score > 70 ? '#c8f135'
              : d.score > 40 ? '#f5a623'
              : '#555'
            return (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%', gap:'4px' }}>
                {d.score !== null && (
                  <div style={{ fontSize:'8px', color:'#c8f135', opacity:0.7 }}>{d.score}%</div>
                )}
                <div style={{ width:'100%', borderRadius:'3px 3px 0 0',
                  height:`${barH}px`,
                  background: barColor,
                  boxShadow: isToday && d.score > 0 ? `0 0 8px ${barColor}60` : 'none',
                  transition:'height 0.5s' }} />
                <div style={{ fontSize:'9px', color: d.score !== null ? (isToday ? '#c8f135' : '#666') : '#2a2a2a' }}>
                  {d.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Best day */}
      {bestDay && (
        <div style={{ padding:'12px 14px', borderRadius:'10px', marginBottom:'14px',
          background:'rgba(200,241,53,0.04)', border:'1px solid rgba(200,241,53,0.12)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'4px' }}>MEILLEURE JOURNÉE</div>
            <div style={{ fontSize:'12px', color:'#888' }}>{bestDay.date}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'24px', color:'#c8f135' }}>{bestDay.score}%</div>
            <div style={{ fontSize:'10px', color:'#555' }}>+{bestDay.xpEarned||0} XP</div>
          </div>
        </div>
      )}

      {/* Profile insights */}
      <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>TES PATTERNS</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'18px' }}>
        {[
          ['⚡ Peak time',   '14h–18h',    'Ton window doré. Protège-le.'],
          ['😴 Zone morte',  'Matin',      'Tâches légères seulement.'],
          ['🔥 Kryptonite',  'Rêveries',   'Note-les, libère le reste.'],
          ['💡 Superpower',  'Systèmes',   'Automatise ce qui coûte.'],
          ['⏰ Méthode',     'Deadlines',  "Crée l'urgence artificielle."],
          ['🧠 Style',       'Seul/Focus', 'Protège tes blocs solo.'],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ padding:'12px', borderRadius:'9px',
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize:'16px', marginBottom:'5px' }}>{icon}</div>
            <div style={{ fontSize:'11px', fontWeight:'700', color:'#c8f135', marginBottom:'3px' }}>{title}</div>
            <div style={{ fontSize:'10px', color:'#444', lineHeight:'1.4' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>HISTORIQUE</div>
          {history.slice(0,10).map((h,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'8px 12px', marginBottom:'4px', borderRadius:'8px',
              background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:'11px', color:'#3a3a3a' }}>{h.date}</span>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'10px', color:'#c8f135' }}>+{h.xpEarned || 0} XP</span>
                <div style={{ width:'50px', height:'3px', background:'#111', borderRadius:'2px' }}>
                  <div style={{ width:`${h.score||0}%`, height:'100%', borderRadius:'2px',
                    background: (h.score||0) > 70 ? '#c8f135' : (h.score||0) > 40 ? '#f5a623' : '#333' }} />
                </div>
                <span style={{ fontSize:'9px', color:'#3a3a3a', width:'28px' }}>{h.score||0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length === 0 && (
        <div style={{ textAlign:'center', padding:'20px', color:'#2a2a2a', fontSize:'12px' }}>
          Les stats s'afficheront après ta première journée complète.
        </div>
      )}
    </div>
  )
}
