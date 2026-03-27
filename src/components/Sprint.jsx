import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useStorage.js'

const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

const ABANDON_COST = { 5:5, 15:12, 25:20, 45:35, 60:45 }

export default function Sprint({ addXp }) {
  const [phase,    setPhase]    = useState('setup')  // setup | commit | running | paused | finished
  const [duration, setDuration] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [task,     setTask]     = useState('')
  const [why,      setWhy]      = useState('')
  const [paused,   setPaused]   = useState(false)
  const [focusRating, setFocusRating] = useState(null)

  const [sprintLog, setSprintLog] = useLocalStorage('lazlo_sprint_log', [])

  const timerRef   = useRef(null)
  const totalRef   = useRef(0)
  const claimedRef = useRef(false)

  useEffect(() => {
    if (phase === 'running' && !paused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setPhase('finished')
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, paused])

  const startSprint = (mins, xpReward) => {
    setDuration({ mins, xpReward })
    setPhase('commit')
    setTask('')
    setWhy('')
    setFocusRating(null)
    claimedRef.current = false
  }

  const launch = () => {
    if (!task.trim()) return
    totalRef.current = duration.mins * 60
    setTimeLeft(duration.mins * 60)
    setPhase('running')
    setPaused(false)
  }

  const togglePause = () => setPaused(p => !p)

  const abandon = () => {
    clearInterval(timerRef.current)
    const cost = ABANDON_COST[duration.mins] || 20
    addXp(-cost)
    setSprintLog(l => [{
      id: Date.now(), date: new Date().toISOString().split('T')[0],
      mins: duration.mins, task, why,
      result: 'abandon', xp: -cost,
    }, ...l].slice(0, 40))
    setPhase('setup')
    setDuration(null)
    setPaused(false)
  }

  const claimXp = () => {
    if (claimedRef.current) return
    claimedRef.current = true
    const baseXp = duration.xpReward
    const focusBonus = focusRating ? [0, -10, 0, 10, 20, 35][focusRating] : 0
    const totalXp = baseXp + focusBonus
    addXp(totalXp)
    setSprintLog(l => [{
      id: Date.now(), date: new Date().toISOString().split('T')[0],
      mins: duration.mins, task, why,
      result: 'win', xp: totalXp, focusRating,
    }, ...l].slice(0, 40))
    setPhase('setup')
    setDuration(null)
    setFocusRating(null)
    setPaused(false)
  }

  const pct = totalRef.current > 0 ? ((totalRef.current - timeLeft) / totalRef.current) * 100 : 0
  const danger = timeLeft < 60 && phase === 'running'

  // Stats
  const wins = sprintLog.filter(s => s.result === 'win').length
  const abandons = sprintLog.filter(s => s.result === 'abandon').length
  const avgFocus = sprintLog.filter(s => s.focusRating).length
    ? Math.round(sprintLog.filter(s => s.focusRating).reduce((a, s) => a + s.focusRating, 0) / sprintLog.filter(s => s.focusRating).length * 10) / 10
    : null

  const SPRINTS = [
    { mins:5,  label:'⚡ Démarrage',  xp:20,  desc:"Juste pour briser l'inertie" },
    { mins:15, label:'🕒 Flash',      xp:35,  desc:'1 idée, chrono serré' },
    { mins:25, label:'🔥 Pomodoro',   xp:55,  desc:'La méthode classique' },
    { mins:45, label:'💪 Deep Work',  xp:85,  desc:'Focus total, une seule chose' },
    { mins:60, label:'🏆 Session Pro', xp:110, desc:"Quand t'es dans le flow" },
  ]

  // ── FINISHED ────────────────────────────────────────────────────────────────
  if (phase === 'finished') return (
    <div className="fade-in" style={{ textAlign:'center', padding:'30px 20px' }}>
      <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎯</div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'30px', color:'#c8f135', letterSpacing:'2px', marginBottom:'6px' }}>
        SPRINT TERMINÉ !
      </div>
      <div style={{ fontSize:'13px', color:'#666', fontStyle:'italic', marginBottom:'20px' }}>
        "{task}"
      </div>

      {/* Focus rating */}
      <div style={{ marginBottom:'24px' }}>
        <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>
          TON NIVEAU DE FOCUS RÉEL ?
        </div>
        <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
          {[
            { r:1, label:'💀', desc:'Nul' },
            { r:2, label:'😕', desc:'Moyen' },
            { r:3, label:'😐', desc:'Ok' },
            { r:4, label:'🔥', desc:'Bon' },
            { r:5, label:'⚡', desc:'Flow' },
          ].map(({ r, label, desc }) => (
            <button key={r} onClick={() => setFocusRating(r)} style={{
              padding:'10px 12px', borderRadius:'10px', cursor:'pointer', border:'none',
              background: focusRating===r ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)',
              outline: focusRating===r ? '1.5px solid #c8f135' : '1.5px solid transparent',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
            }}>
              <span style={{ fontSize:'20px' }}>{label}</span>
              <span style={{ fontSize:'9px', color: focusRating===r ? '#c8f135' : '#444' }}>{desc}</span>
            </button>
          ))}
        </div>
        {focusRating && (
          <div className="fade-in" style={{ fontSize:'10px', marginTop:'8px',
            color: focusRating >= 4 ? '#c8f135' : focusRating >= 3 ? '#f5a623' : '#ff6432' }}>
            {focusRating === 5 ? '+35 XP BONUS FLOW ⚡' :
             focusRating === 4 ? '+20 XP BONUS' :
             focusRating === 3 ? 'XP normal' :
             focusRating === 2 ? '-10 XP (honnêteté récompensée)' :
             "-10 XP — t'étais ailleurs, et tu le sais."}
          </div>
        )}
      </div>

      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'36px', color:'#c8f135', letterSpacing:'2px', marginBottom:'20px' }}>
        +{duration.xpReward + ([0,-10,0,10,20,35][focusRating||0])} XP
      </div>

      <button onClick={claimXp} style={{ padding:'14px 36px', background:'#c8f135', border:'none',
        borderRadius:'12px', cursor:'pointer', color:'#0a0a0a',
        fontFamily:"'Bebas Neue'", fontSize:'20px', letterSpacing:'2px' }}>
        ENCAISSER
      </button>
    </div>
  )

  // ── RUNNING / PAUSED ────────────────────────────────────────────────────────
  if (phase === 'running' || phase === 'paused') return (
    <div className="fade-in" style={{ textAlign:'center', padding:'24px 10px' }}>
      <div style={{ fontSize:'10px', letterSpacing:'2px', marginBottom:'8px',
        color: paused ? '#f5a623' : danger ? '#ff6432' : '#c8f135' }}
        className={(!paused && !danger) ? 'blink' : ''}>
        {paused ? '⏸ EN PAUSE — TU PERDS DU TEMPS' :
         danger ? '⚡ DERNIÈRE MINUTE — RESTE LÀ' :
         `● SPRINT ${duration?.mins}MIN — AUCUNE DISTRACTION`}
      </div>

      {task && (
        <div style={{ fontSize:'13px', color:'#555', marginBottom:'4px', fontStyle:'italic' }}>"{task}"</div>
      )}
      {why && (
        <div style={{ fontSize:'10px', color:'#333', marginBottom:'16px' }}>→ {why}</div>
      )}

      {/* Ring */}
      <div style={{ position:'relative', width:'180px', height:'180px', margin:'0 auto 16px' }}>
        <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          <circle cx="50" cy="50" r="44" fill="none"
            stroke={paused ? '#f5a623' : danger ? '#ff6432' : '#c8f135'} strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct/100)}`}
            strokeLinecap="round"
            style={{ transition: paused ? 'none' : 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'42px', letterSpacing:'2px',
            color: danger ? '#ff6432' : paused ? '#f5a623' : '#e8f5e0',
            textShadow: danger ? '0 0 20px rgba(255,100,50,0.5)' : 'none' }}>
            {fmt(timeLeft)}
          </div>
          <div style={{ fontSize:'10px', color:'#444' }}>restant</div>
        </div>
      </div>

      {/* Abandon cost warning */}
      <div style={{ fontSize:'9px', color:'#2a2a2a', marginBottom:'18px' }}>
        Abandon = -{ABANDON_COST[duration?.mins] || 20} XP déduits
      </div>

      <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
        <button onClick={togglePause} style={{
          padding:'11px 24px',
          background: paused ? 'rgba(200,241,53,0.1)' : 'rgba(245,166,35,0.08)',
          border:`1px solid ${paused ? 'rgba(200,241,53,0.3)' : 'rgba(245,166,35,0.2)'}`,
          borderRadius:'9px', cursor:'pointer',
          color: paused ? '#c8f135' : '#f5a623',
          fontFamily:"'Bebas Neue'", fontSize:'16px', letterSpacing:'1px' }}>
          {paused ? '▶ REPRENDRE' : '⏸ PAUSE'}
        </button>
        <button onClick={abandon} style={{ background:'transparent', border:'1px solid #1a1a1a',
          color:'#2a2a2a', borderRadius:'9px', padding:'11px 14px', cursor:'pointer',
          fontFamily:"'Space Mono'", fontSize:'10px' }}>
          Abandonner
        </button>
      </div>
    </div>
  )

  // ── COMMIT ──────────────────────────────────────────────────────────────────
  if (phase === 'commit') return (
    <div className="fade-in" style={{ padding:'4px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
        <button onClick={() => setPhase('setup')} style={{ background:'transparent', border:'none',
          color:'#444', cursor:'pointer', fontSize:'18px', padding:0 }}>←</button>
        <div>
          <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px' }}>// INTENTION DE SPRINT</div>
          <div style={{ fontSize:'11px', color:'#c8f135', marginTop:'2px' }}>
            {duration?.mins}min — +{duration?.xpReward} XP de base
          </div>
        </div>
      </div>

      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'9px', color:'#444', letterSpacing:'1px', marginBottom:'8px' }}>
          SUR QUOI TU TRAVAILLES ?
        </div>
        <input value={task} onChange={e => setTask(e.target.value)}
          autoFocus
          placeholder="ex: chapitre anapath — insuffisance rénale"
          style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.09)', borderRadius:'9px',
            color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'13px' }} />
      </div>

      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'9px', color:'#444', letterSpacing:'1px', marginBottom:'8px' }}>
          POURQUOI C'EST IMPORTANT MAINTENANT ?
        </div>
        <input value={why} onChange={e => setWhy(e.target.value)}
          placeholder="ex: exam dans 3 jours, je suis en retard"
          style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.09)', borderRadius:'9px',
            color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'12px' }} />
        <div style={{ fontSize:'9px', color:'#383838', marginTop:'6px' }}>
          Ton cerveau travaille mieux quand il sait pourquoi. Ce n'est pas optionnel.
        </div>
      </div>

      {/* Abandon cost warning */}
      <div style={{ padding:'10px 14px', borderRadius:'9px', marginBottom:'18px',
        background:'rgba(255,100,50,0.05)', border:'1px solid rgba(255,100,50,0.12)',
        fontSize:'10px', color:'#664', lineHeight:'1.6' }}>
        ⚠️ Si tu abandonnes ce sprint : <span style={{ color:'#ff6432' }}>-{ABANDON_COST[duration?.mins] || 20} XP</span> déduits.
        Le focus a un prix. L'abandon aussi.
      </div>

      <button onClick={launch} disabled={!task.trim()} style={{
        width:'100%', padding:'15px',
        background: task.trim() ? '#c8f135' : 'rgba(255,255,255,0.04)',
        border:'none', borderRadius:'10px',
        cursor: task.trim() ? 'pointer' : 'not-allowed',
        color: task.trim() ? '#0a0a0a' : '#333',
        fontFamily:"'Bebas Neue'", fontSize:'20px', letterSpacing:'2px', transition:'all 0.2s',
      }}>
        LANCER LE SPRINT
      </button>
    </div>
  )

  // ── SETUP ───────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'4px' }}>// MODE SPRINT</div>
      <p style={{ color:'#444', fontSize:'12px', marginBottom:'14px', lineHeight:'1.6' }}>
        Déclare ton intention avant de commencer. L'abandon coûte des XP.
      </p>

      {/* Stats */}
      {(wins + abandons) > 0 && (
        <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
          <div style={{ flex:1, padding:'8px', borderRadius:'9px', textAlign:'center',
            background:'rgba(200,241,53,0.05)', border:'1px solid rgba(200,241,53,0.12)' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'20px', color:'#c8f135' }}>{wins}</div>
            <div style={{ fontSize:'8px', color:'#444' }}>COMPLÉTÉS</div>
          </div>
          <div style={{ flex:1, padding:'8px', borderRadius:'9px', textAlign:'center',
            background:'rgba(255,100,50,0.04)', border:'1px solid rgba(255,100,50,0.1)' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'20px', color:'#ff6432' }}>{abandons}</div>
            <div style={{ fontSize:'8px', color:'#444' }}>ABANDONS</div>
          </div>
          {avgFocus && (
            <div style={{ flex:1, padding:'8px', borderRadius:'9px', textAlign:'center',
              background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:'20px', color:'#f5a623' }}>{avgFocus}/5</div>
              <div style={{ fontSize:'8px', color:'#444' }}>FOCUS MOY.</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {SPRINTS.map(s => (
          <button key={s.mins} onClick={() => startSprint(s.mins, s.xp)} style={{
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'10px', padding:'14px 16px', cursor:'pointer',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            color:'#e8f5e0', fontFamily:"'Space Mono'", transition:'all 0.15s',
          }}>
            <div>
              <div style={{ fontSize:'14px', fontWeight:'700', marginBottom:'2px' }}>
                {s.label} — {s.mins}min
              </div>
              <div style={{ fontSize:'10px', color:'#444' }}>
                {s.desc} · abandon = -{ABANDON_COST[s.mins]} XP
              </div>
            </div>
            <div style={{ color:'#c8f135', fontFamily:"'Bebas Neue'", fontSize:'20px', letterSpacing:'1px' }}>
              +{s.xp} XP
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
