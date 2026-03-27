import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useStorage.js'
import { SHAME_QUOTES, WIN_QUOTES } from '../data/constants.js'

const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const XP_GAIN = { 10: 40, 15: 55, 20: 70, 30: 90, 45: 120, 60: 150, 90: 200 }
const XP_LOSE = { 10: 20, 15: 28, 20: 35, 30: 45, 45: 60, 60: 75, 90: 100 }

export default function DeadlineTab({ addXp }) {
  const [label,    setLabel]    = useState('')
  const [minutes,  setMinutes]  = useState(25)
  const [pacte,    setPacte]    = useState('')
  const [active,   setActive]   = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [phase,    setPhase]    = useState('setup') // setup | running | success | failed
  const [shameMsg, setShameMsg] = useState('')
  const [winMsg,   setWinMsg]   = useState('')

  const [deadlineLog, setDeadlineLog] = useLocalStorage('lazlo_deadline_log', [])
  const [showLog,    setShowLog]      = useState(false)

  const timerRef  = useRef(null)
  const totalSecs = useRef(0)

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setActive(false)
            handleFail()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [active])

  const launch = () => {
    if (!label.trim()) return
    const secs = minutes * 60
    totalSecs.current = secs
    setTimeLeft(secs)
    setActive(true)
    setPhase('running')
    setShameMsg('')
    setWinMsg('')
  }

  const handleFail = () => {
    const xpLost = XP_LOSE[minutes] || 45
    addXp(-xpLost)
    const msg = pick(SHAME_QUOTES)
    setShameMsg(msg)
    setPhase('failed')
    setDeadlineLog(l => [{
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      label, minutes,
      pacte: pacte || null,
      result: 'fail',
      xp: -xpLost,
    }, ...l].slice(0, 40))
  }

  const handleSuccess = () => {
    clearInterval(timerRef.current)
    setActive(false)
    const elapsed = totalSecs.current - timeLeft
    const baseXp = XP_GAIN[minutes] || 90
    // Bonus XP for finishing early (up to 30% bonus)
    const earlyBonus = Math.round(baseXp * 0.3 * (timeLeft / totalSecs.current))
    const totalXp = baseXp + earlyBonus
    addXp(totalXp)
    const msg = pick(WIN_QUOTES)
    setWinMsg(msg)
    setPhase('success')
    setDeadlineLog(l => [{
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      label, minutes,
      pacte: pacte || null,
      result: 'win',
      xp: totalXp,
      earlyBonus,
    }, ...l].slice(0, 40))
  }

  const reset = () => {
    setPhase('setup')
    setLabel('')
    setPacte('')
    setActive(false)
    setTimeLeft(0)
  }

  const pct = totalSecs.current > 0 ? (timeLeft / totalSecs.current) * 100 : 0
  const danger = timeLeft < 60 && active
  const xpGain = XP_GAIN[minutes] || 90
  const xpLose = XP_LOSE[minutes] || 45

  // Stats
  const wins  = deadlineLog.filter(d => d.result === 'win').length
  const fails = deadlineLog.filter(d => d.result === 'fail').length
  const total = wins + fails
  const reliability = total > 0 ? Math.round((wins / total) * 100) : null

  // ── PHASE: SUCCESS ──────────────────────────────────────────────────────────
  if (phase === 'success') return (
    <div className="fade-in" style={{ textAlign:'center', padding:'32px 20px' }}>
      <div style={{ fontSize:'52px', marginBottom:'12px' }}>🎯</div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'32px', color:'#c8f135', letterSpacing:'2px', marginBottom:'6px' }}>
        DEADLINE TENUE
      </div>
      <div style={{ fontSize:'13px', color:'#888', marginBottom:'6px', fontStyle:'italic' }}>
        "{label}"
      </div>
      {pacte && (
        <div style={{ margin:'12px auto', maxWidth:'320px', padding:'10px 14px', borderRadius:'10px',
          background:'rgba(200,241,53,0.06)', border:'1px solid rgba(200,241,53,0.2)',
          fontSize:'11px', color:'#c8f135' }}>
          ✓ Pacte tenu. Tu n'as pas à te punir.
        </div>
      )}
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'48px', color:'#c8f135', letterSpacing:'2px', marginBottom:'4px' }}>
        +{deadlineLog[0]?.xp || xpGain} XP
      </div>
      {(deadlineLog[0]?.earlyBonus || 0) > 0 && (
        <div style={{ fontSize:'11px', color:'#666', marginBottom:'16px' }}>
          dont +{deadlineLog[0].earlyBonus} XP bonus (terminé en avance)
        </div>
      )}
      <div style={{ fontSize:'13px', color:'#555', lineHeight:'1.6', marginBottom:'28px', maxWidth:'280px', margin:'0 auto 28px' }}>
        {winMsg}
      </div>
      <button onClick={reset} style={{ padding:'14px 36px', background:'#c8f135', border:'none',
        borderRadius:'12px', cursor:'pointer', color:'#0a0a0a',
        fontFamily:"'Bebas Neue'", fontSize:'20px', letterSpacing:'2px' }}>
        CONTINUER
      </button>
    </div>
  )

  // ── PHASE: FAILED ───────────────────────────────────────────────────────────
  if (phase === 'failed') return (
    <div className="fade-in" style={{ textAlign:'center', padding:'32px 20px' }}>
      <div style={{ fontSize:'52px', marginBottom:'12px' }}>💀</div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'32px', color:'#ff6432', letterSpacing:'2px', marginBottom:'6px' }}>
        DEADLINE RATÉE
      </div>
      <div style={{ fontSize:'13px', color:'#666', marginBottom:'16px', fontStyle:'italic' }}>
        "{label}"
      </div>

      {/* XP penalty */}
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'42px', color:'#ff6432', letterSpacing:'2px', marginBottom:'4px' }}>
        -{xpLose} XP
      </div>
      <div style={{ fontSize:'10px', color:'#444', marginBottom:'20px' }}>déduits de ton compte</div>

      {/* Shame message */}
      <div style={{ margin:'0 auto 20px', maxWidth:'300px', padding:'12px 16px', borderRadius:'10px',
        background:'rgba(255,100,50,0.07)', border:'1px solid rgba(255,100,50,0.2)',
        fontSize:'13px', color:'#cc5533', lineHeight:'1.6', fontStyle:'italic' }}>
        "{shameMsg}"
      </div>

      {/* Pacte reminder */}
      {pacte && (
        <div style={{ margin:'0 auto 24px', maxWidth:'300px', padding:'12px 16px', borderRadius:'10px',
          background:'rgba(255,100,50,0.05)', border:'1px solid rgba(255,100,50,0.15)' }}>
          <div style={{ fontSize:'9px', color:'#ff6432', letterSpacing:'1px', marginBottom:'6px' }}>
            TON PACTE — À EXÉCUTER MAINTENANT
          </div>
          <div style={{ fontSize:'13px', color:'#cc5533', lineHeight:'1.5' }}>
            "{pacte}"
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
        <button onClick={launch} style={{ padding:'12px 24px', background:'rgba(255,100,50,0.1)',
          border:'1px solid rgba(255,100,50,0.3)', borderRadius:'10px', cursor:'pointer',
          color:'#ff6432', fontFamily:"'Bebas Neue'", fontSize:'16px', letterSpacing:'1px' }}>
          RELANCER
        </button>
        <button onClick={reset} style={{ padding:'12px 20px', background:'rgba(255,255,255,0.03)',
          border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', cursor:'pointer',
          color:'#444', fontFamily:"'Space Mono'", fontSize:'11px' }}>
          Abandonner
        </button>
      </div>
    </div>
  )

  // ── PHASE: RUNNING ──────────────────────────────────────────────────────────
  if (phase === 'running') return (
    <div className="fade-in" style={{ textAlign:'center', padding:'20px 10px' }}>
      <div style={{ fontSize:'10px', letterSpacing:'2px', marginBottom:'8px',
        color: danger ? '#ff6432' : '#c8f135' }}
        className={danger ? 'blink' : ''}>
        {danger ? '⚡ DERNIÈRE MINUTE — FINIS.' : '⏰ DEADLINE ACTIVE'}
      </div>
      <div style={{ fontSize:'14px', color:'#666', marginBottom:'6px', fontStyle:'italic' }}>
        "{label}"
      </div>

      {/* Pacte reminder during run */}
      {pacte && (
        <div style={{ margin:'0 auto 16px', maxWidth:'300px', padding:'8px 12px', borderRadius:'8px',
          background: danger ? 'rgba(255,100,50,0.12)' : 'rgba(255,255,255,0.03)',
          border:`1px solid ${danger ? 'rgba(255,100,50,0.3)' : 'rgba(255,255,255,0.07)'}`,
          fontSize:'10px', color: danger ? '#ff6432' : '#444', lineHeight:'1.5' }}>
          <span style={{ opacity:0.6 }}>Si tu rates : </span>
          "{pacte}"
        </div>
      )}

      {/* Ring */}
      <div style={{ position:'relative', width:'190px', height:'190px', margin:'0 auto 16px' }}>
        <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <circle cx="50" cy="50" r="44" fill="none"
            stroke={danger ? '#ff6432' : '#c8f135'} strokeWidth="5"
            strokeDasharray={`${2*Math.PI*44}`}
            strokeDashoffset={`${2*Math.PI*44*(1-pct/100)}`}
            strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'44px', letterSpacing:'2px',
            color: danger ? '#ff6432' : '#e8f5e0',
            textShadow: danger ? '0 0 25px rgba(255,100,50,0.6)' : 'none',
            transition:'color 0.3s' }}>
            {fmt(timeLeft)}
          </div>
          <div style={{ fontSize:'9px', color:'#444' }}>restant</div>
        </div>
      </div>

      {/* XP stakes reminder */}
      <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginBottom:'20px' }}>
        <div style={{ padding:'6px 14px', borderRadius:'8px',
          background:'rgba(200,241,53,0.08)', border:'1px solid rgba(200,241,53,0.2)',
          fontSize:'12px', color:'#c8f135', fontFamily:"'Bebas Neue'", letterSpacing:'1px' }}>
          +{xpGain} XP si tu finis
        </div>
        <div style={{ padding:'6px 14px', borderRadius:'8px',
          background:'rgba(255,100,50,0.06)', border:'1px solid rgba(255,100,50,0.15)',
          fontSize:'12px', color:'#ff6432', fontFamily:"'Bebas Neue'", letterSpacing:'1px' }}>
          -{xpLose} XP si tu rates
        </div>
      </div>

      <button onClick={handleSuccess} style={{ width:'100%', maxWidth:'300px', padding:'15px',
        background:'#c8f135', border:'none', borderRadius:'10px', cursor:'pointer',
        color:'#0a0a0a', fontFamily:"'Bebas Neue'", fontSize:'20px', letterSpacing:'2px', marginBottom:'10px' }}>
        ✓ MISSION ACCOMPLIE
      </button>
      <div style={{ fontSize:'9px', color:'#333' }}>
        Terminer tôt = bonus XP — Expirer = -{xpLose} XP
      </div>
    </div>
  )

  // ── PHASE: SETUP ────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'4px' }}>// DEADLINE ARTIFICIELLE</div>
      <p style={{ color:'#383838', fontSize:'12px', marginBottom:'18px', lineHeight:'1.6' }}>
        Crée l'urgence. Déclare les enjeux. Exécute ou paie le prix.
      </p>

      {/* Stats bar */}
      {total > 0 && (
        <div style={{ display:'flex', gap:'8px', marginBottom:'18px' }}>
          <div style={{ flex:1, padding:'10px 12px', borderRadius:'9px', textAlign:'center',
            background:'rgba(200,241,53,0.05)', border:'1px solid rgba(200,241,53,0.15)' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'22px', color:'#c8f135' }}>{wins}</div>
            <div style={{ fontSize:'9px', color:'#555' }}>TENUES</div>
          </div>
          <div style={{ flex:1, padding:'10px 12px', borderRadius:'9px', textAlign:'center',
            background:'rgba(255,100,50,0.05)', border:'1px solid rgba(255,100,50,0.1)' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'22px', color:'#ff6432' }}>{fails}</div>
            <div style={{ fontSize:'9px', color:'#555' }}>RATÉES</div>
          </div>
          <div style={{ flex:1, padding:'10px 12px', borderRadius:'9px', textAlign:'center',
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'22px',
              color: reliability >= 70 ? '#c8f135' : reliability >= 40 ? '#f5a623' : '#ff6432' }}>
              {reliability}%
            </div>
            <div style={{ fontSize:'9px', color:'#555' }}>FIABILITÉ</div>
          </div>
        </div>
      )}

      {/* Task */}
      <div style={{ marginBottom:'14px' }}>
        <div style={{ fontSize:'9px', color:'#444', letterSpacing:'1px', marginBottom:'8px' }}>01 — LA TÂCHE</div>
        <input value={label} onChange={e => setLabel(e.target.value)}
          placeholder="ex: finir l'intro de la dissert de physio"
          onKeyDown={e => e.key === 'Enter' && label.trim() && pacte && launch()}
          style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.09)', borderRadius:'9px',
            color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'13px' }} />
      </div>

      {/* Duration */}
      <div style={{ marginBottom:'14px' }}>
        <div style={{ fontSize:'9px', color:'#444', letterSpacing:'1px', marginBottom:'8px' }}>02 — DURÉE</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
          {[10, 15, 20, 25, 30, 45, 60, 90].map(m => (
            <button key={m} onClick={() => setMinutes(m)} style={{
              padding:'7px 14px', borderRadius:'18px', cursor:'pointer',
              background: minutes===m ? '#c8f135' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${minutes===m ? '#c8f135' : 'rgba(255,255,255,0.08)'}`,
              color: minutes===m ? '#0a0a0a' : '#666',
              fontFamily:"'Space Mono'", fontSize:'12px',
              fontWeight: minutes===m ? '700' : '400',
            }}>{m}min</button>
          ))}
        </div>
      </div>

      {/* PACTE — psychological core */}
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'9px', color:'#ff6432', letterSpacing:'1px', marginBottom:'6px' }}>
          03 — PACTE (obligatoire)
        </div>
        <div style={{ fontSize:'10px', color:'#383838', marginBottom:'8px', lineHeight:'1.6' }}>
          Si tu rates cette deadline, tu te punis de :
        </div>
        <input value={pacte} onChange={e => setPacte(e.target.value)}
          placeholder="ex: pas de réseaux sociaux ce soir / 20 pompes maintenant / je le dis à mon pote"
          style={{ width:'100%', padding:'11px 14px', background:'rgba(255,100,50,0.04)',
            border:`1px solid ${pacte ? 'rgba(255,100,50,0.3)' : 'rgba(255,100,50,0.12)'}`,
            borderRadius:'9px', color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'12px' }} />
        <div style={{ fontSize:'9px', color:'#383838', marginTop:'5px', lineHeight:'1.5' }}>
          Ton cerveau ne distingue pas une vraie punition d'une fausse. Sois précis.
        </div>
      </div>

      {/* XP stakes preview */}
      {label.trim() && pacte.trim() && (
        <div className="fade-in" style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
          <div style={{ flex:1, padding:'10px', borderRadius:'9px', textAlign:'center',
            background:'rgba(200,241,53,0.07)', border:'1px solid rgba(200,241,53,0.2)' }}>
            <div style={{ fontSize:'9px', color:'#555', marginBottom:'4px' }}>TU GAGNES</div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'24px', color:'#c8f135' }}>+{xpGain} XP</div>
          </div>
          <div style={{ flex:1, padding:'10px', borderRadius:'9px', textAlign:'center',
            background:'rgba(255,100,50,0.05)', border:'1px solid rgba(255,100,50,0.15)' }}>
            <div style={{ fontSize:'9px', color:'#555', marginBottom:'4px' }}>OU TU PERDS</div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'24px', color:'#ff6432' }}>-{xpLose} XP</div>
          </div>
        </div>
      )}

      <button onClick={launch} disabled={!label.trim() || !pacte.trim()} style={{
        width:'100%', padding:'15px',
        background: (label.trim() && pacte.trim()) ? '#c8f135' : 'rgba(255,255,255,0.04)',
        border:'none', borderRadius:'10px',
        cursor: (label.trim() && pacte.trim()) ? 'pointer' : 'not-allowed',
        color: (label.trim() && pacte.trim()) ? '#0a0a0a' : '#333',
        fontFamily:"'Bebas Neue'", fontSize:'20px', letterSpacing:'2px', transition:'all 0.2s',
        marginBottom:'20px',
      }}>
          {!pacte.trim() ? "DÉCLARE TON PACTE D'ABORD" : `LANCER — ${minutes}MIN`}
      </button>

      {/* Log */}
      {deadlineLog.length > 0 && (
        <div>
          <button onClick={() => setShowLog(!showLog)} style={{
            width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'8px', padding:'8px', cursor:'pointer',
            color:'#444', fontFamily:"'Space Mono'", fontSize:'10px',
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span>// HISTORIQUE ({deadlineLog.length})</span>
            <span>{showLog ? '▲' : '▼'}</span>
          </button>
          {showLog && (
            <div className="fade-in" style={{ marginTop:'8px' }}>
              {deadlineLog.slice(0, 10).map(d => (
                <div key={d.id} style={{ padding:'10px 12px', marginBottom:'6px', borderRadius:'8px',
                  background:'rgba(255,255,255,0.02)', border:`1px solid ${d.result==='win' ? 'rgba(200,241,53,0.1)' : 'rgba(255,100,50,0.1)'}`,
                  display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'12px', color:'#aaa', marginBottom:'3px',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {d.result === 'win' ? '✓' : '✕'} {d.label}
                    </div>
                    {d.pacte && d.result === 'fail' && (
                      <div style={{ fontSize:'9px', color:'#ff6432', lineHeight:'1.4' }}>
                        Pacte : "{d.pacte}"
                      </div>
                    )}
                    <div style={{ fontSize:'9px', color:'#333', marginTop:'2px' }}>{d.date} · {d.minutes}min</div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue'", fontSize:'16px', flexShrink:0,
                    color: d.result === 'win' ? '#c8f135' : '#ff6432' }}>
                    {d.result === 'win' ? '+' : ''}{d.xp} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
