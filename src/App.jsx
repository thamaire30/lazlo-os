import { useState, useEffect } from 'react'
import { useLocalStorage } from './hooks/useStorage.js'
import { QUOTES, XP_TO_NEXT_LEVEL, pickDailyTasks, todayKey, getWeekDates } from './data/constants.js'
import Dashboard from './components/Dashboard.jsx'
import Builder from './components/Builder.jsx'
import Sprint from './components/Sprint.jsx'
import DeadlineTab from './components/DeadlineTab.jsx'
import Planner from './components/Planner.jsx'
import Coach from './components/Coach.jsx'
import Network from './components/Network.jsx'
import Patterns from './components/Patterns.jsx'
import Settings from './components/Settings.jsx'
import HeroTab from './components/HeroTab.jsx'
import Character, { getStage } from './components/Character.jsx'

const TABS = [
  ['dashboard', '⚡', 'Jour'],
  ['hero',      '🧬', 'Héro'],
  ['planner',   '📅', 'Plan'],
  ['sprint',    '🔥', 'Sprint'],
  ['deadline',  '⏰', 'Boss'],
  ['coach',     '🤖', 'LAZLO'],
  ['builder',   '🛠', 'Forge'],
  ['network',   '🔗', 'Réseau'],
  ['patterns',  '📊', 'Stats'],
  ['settings',  '⚙️', 'Config'],
]

export default function App() {
  const [tab, setTab]           = useState('dashboard')
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [xpFlash, setXpFlash]   = useState(null)
  const [attackFlash, setAttackFlash] = useState(false)

  // ── Persistent state ──────────────────────────────────────────────────────
  const [xp,          setXp]          = useLocalStorage('lazlo_xp', 0)
  const [level,       setLevel]       = useLocalStorage('lazlo_level', 1)
  const [streak,      setStreak]      = useLocalStorage('lazlo_streak', 0)
  const [lastActive,  setLastActive]  = useLocalStorage('lazlo_last_active', '')
  const [dailyTasks,  setDailyTasks]  = useLocalStorage('lazlo_daily_tasks', [])
  const [dailyDate,   setDailyDate]   = useLocalStorage('lazlo_daily_date', '')
  const [customBank,  setCustomBank]  = useLocalStorage('lazlo_custom_task_bank', [])
  const [history,     setHistory]     = useLocalStorage('lazlo_history', [])
  const [network,     setNetwork]     = useLocalStorage('lazlo_network', [
    { id:1, name:'Thomas D.', type:'Dev / Tech',   status:'À recontacter', heat:80, notes:'', lastContact:'' },
    { id:2, name:'Sarah M.',  type:'Marketing',    status:'Nouveau',       heat:40, notes:'', lastContact:'' },
    { id:3, name:'Kevin L.',  type:'Entrepreneur', status:'Fort potentiel',heat:95, notes:'', lastContact:'' },
  ])
  const [coachHistory, setCoachHistory] = useLocalStorage('lazlo_coach_history', [])
  const [apiKey,       setApiKey]       = useLocalStorage('lazlo_api_key', '')
  const [settings,     setSettings]     = useLocalStorage('lazlo_settings', {
    notifications:false, dailyReset:'06:00', showStreak:true, compactMode:false,
  })
  const [weeklyScores, setWeeklyScores] = useLocalStorage('lazlo_weekly_scores', {})

  // ── XP tracking for boss system ───────────────────────────────────────────
  const [dailyXpLog,  setDailyXpLog]  = useLocalStorage('lazlo_daily_xp_log', { date:'', earned:0 })
  const [weeklyXpLog, setWeeklyXpLog] = useLocalStorage('lazlo_weekly_xp_log', { weekKey:'', earned:0 })

  const today   = todayKey()
  const weekKey = getWeekDates(0)[0]

  const dailyXpEarned  = dailyXpLog.date  === today    ? dailyXpLog.earned  : 0
  const weeklyXpEarned = weeklyXpLog.weekKey === weekKey ? weeklyXpLog.earned : 0

  // ── Daily tasks refresh ───────────────────────────────────────────────────
  useEffect(() => {
    if (dailyDate !== today) {
      if (dailyDate && dailyTasks.length > 0) {
        const donePct = Math.round((dailyTasks.filter(t=>t.done).length / dailyTasks.length) * 100)
        setHistory(h => [{ date:dailyDate, score:donePct, xpEarned:dailyTasks.filter(t=>t.done).reduce((s,t)=>s+t.xp,0) }, ...h].slice(0,60))
        setWeeklyScores(ws => ({ ...ws, [dailyDate]:donePct }))
      }
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1)
      const yKey = yesterday.toISOString().split('T')[0]
      if (lastActive===yKey || lastActive===today) {
        setStreak(s => lastActive===today ? s : s+1)
      } else if (lastActive && lastActive!==today) {
        setStreak(1)
      }
      setLastActive(today)
      setDailyDate(today)
      setDailyTasks(pickDailyTasks(customBank))
    } else {
      setLastActive(today)
    }
  }, [])

  // ── XP + Level up ─────────────────────────────────────────────────────────
  const addXp = (amount) => {
    const isGain = amount > 0

    // XP flash
    const flashId = Date.now()
    setXpFlash({ amount, id:flashId })
    setTimeout(() => setXpFlash(f => f?.id===flashId ? null : f), 1500)

    // Attack flash on character
    if (isGain) {
      setAttackFlash(true)
      setTimeout(() => setAttackFlash(false), 400)
    }

    // Track daily/weekly XP earned
    if (isGain) {
      setDailyXpLog(log => ({
        date: today,
        earned: (log.date===today ? log.earned : 0) + amount,
      }))
      setWeeklyXpLog(log => ({
        weekKey,
        earned: (log.weekKey===weekKey ? log.earned : 0) + amount,
      }))
    }

    setXp(x => {
      const next = x + amount
      if (next < 0) return 0
      const needed = XP_TO_NEXT_LEVEL(level)
      if (isGain && next >= needed) {
        setLevel(l => l+1)
        return next - needed
      }
      return next
    })
  }

  const toggleTask = (id) => {
    setDailyTasks(ts => ts.map(t => {
      if (t.id===id && !t.done) { addXp(t.xp); return { ...t, done:true } }
      if (t.id===id && t.done)  return { ...t, done:false }
      return t
    }))
  }

  const refreshDailyTasks = () => setDailyTasks(pickDailyTasks(customBank))

  // ── Quote ticker ──────────────────────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setQuoteIdx(q => (q+1) % QUOTES.length), 6000)
    return () => clearInterval(i)
  }, [])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const needed      = XP_TO_NEXT_LEVEL(level)
  const progress    = Math.min((xp/needed)*100, 100)
  const doneTasks   = dailyTasks.filter(t=>t.done).length
  const urgentCount = dailyTasks.filter(t=>t.urgent&&!t.done).length
  const stage       = getStage(level)

  // ── Nav style ─────────────────────────────────────────────────────────────
  const tabStyle = (t) => ({
    display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
    padding:'8px 0', flex:1, border:'none', cursor:'pointer', background:'transparent',
    color: tab===t ? '#c8f135' : '#444',
    borderTop: tab===t ? `2px solid #c8f135` : '2px solid transparent',
    transition:'all 0.15s', fontFamily:"'Space Mono', monospace", minWidth:0,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'#080c0a', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 15px rgba(200,241,53,0.15)} 50%{box-shadow:0 0 30px rgba(200,241,53,0.35)} }
        @keyframes blink { 50%{opacity:0.2} }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes ticker { from{transform:translateX(100vw)} to{transform:translateX(-100%)} }
        .ticker { animation: ticker 20s linear infinite; white-space:nowrap; display:inline-block; }
        @keyframes xpPop { 0%{opacity:0;transform:translateY(0) scale(0.7)} 20%{opacity:1;transform:translateY(-8px) scale(1.1)} 80%{opacity:1;transform:translateY(-16px) scale(1)} 100%{opacity:0;transform:translateY(-24px) scale(0.9)} }
        .xp-pop { animation: xpPop 1.4s ease forwards; }
        @keyframes levelGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        input, textarea { outline:none; }
        input:focus, textarea:focus { border-color:#c8f135 !important; }
        button:active { transform:scale(0.97); }
        .row-hover:hover { background:rgba(200,241,53,0.05) !important; cursor:pointer; }
        input::placeholder, textarea::placeholder { color:#333; }
        * { -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(200,241,53,0.15); border-radius:2px; }
      `}</style>

      {/* Grid bg */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:'linear-gradient(rgba(200,241,53,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,241,53,0.025) 1px,transparent 1px)',
        backgroundSize:'40px 40px' }} />

      {/* XP flash */}
      {xpFlash && (
        <div key={xpFlash.id} className="xp-pop" style={{
          position:'fixed', top:'80px', right:'16px', zIndex:100,
          fontFamily:"'Bebas Neue'", fontSize:'22px', letterSpacing:'2px',
          color: xpFlash.amount>0 ? '#c8f135' : '#ff6432',
          textShadow: xpFlash.amount>0 ? '0 0 12px rgba(200,241,53,0.6)' : '0 0 12px rgba(255,100,50,0.6)',
          pointerEvents:'none',
        }}>
          {xpFlash.amount>0 ? '+' : ''}{xpFlash.amount} XP
        </div>
      )}

      {/* Top bar */}
      <div style={{ position:'relative', zIndex:10, background:'rgba(8,12,10,0.96)', backdropFilter:'blur(12px)',
        borderBottom:`1px solid ${stage.color}22`, padding:'10px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {/* Mini character in top bar */}
          <div style={{ transform:'scale(0.55)', transformOrigin:'left center', marginRight:'-8px' }}>
            <Character level={level} xp={xp} needed={needed} attackFlash={attackFlash} size="sm" />
          </div>
          <div>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'18px', letterSpacing:'2px', color:stage.color, lineHeight:1 }}>
              LAZLO OS
            </div>
            {settings.showStreak && streak>0 &&
              <div style={{ fontSize:'9px', color:'#f5a623' }}>🔥 {streak} jour{streak>1?'s':''} de streak</div>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div>
            <div style={{ fontSize:'9px', color:'#444', marginBottom:'3px', textAlign:'right' }}>
              LVL {level} · {stage.name}
            </div>
            <div style={{ width:'90px', height:'3px', background:'#1a1a1a', borderRadius:'2px' }}>
              <div style={{ width:`${progress}%`, height:'100%', background:stage.color,
                borderRadius:'2px', transition:'width 0.6s',
                boxShadow:`0 0 6px ${stage.color}80` }} />
            </div>
          </div>
          <div style={{ background:`${stage.color}14`, border:`1px solid ${stage.color}35`,
            borderRadius:'16px', padding:'3px 10px', fontSize:'10px', color:stage.color }}>
            {doneTasks}/{dailyTasks.length}
          </div>
        </div>
      </div>

      {/* Quote ticker */}
      <div style={{ overflow:'hidden', height:'24px', display:'flex', alignItems:'center',
        background:'rgba(200,241,53,0.02)', borderBottom:'1px solid rgba(200,241,53,0.06)', flexShrink:0 }}>
        <span className="ticker" key={quoteIdx} style={{ fontSize:'10px', color:'rgba(200,241,53,0.4)', letterSpacing:'0.5px' }}>
          {QUOTES[quoteIdx]}
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflowY:'auto', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:'680px', margin:'0 auto', padding:'16px 14px 8px' }}>
          {tab==='dashboard' && <Dashboard tasks={dailyTasks} onToggle={toggleTask} onRefresh={refreshDailyTasks} xp={xp} level={level} streak={streak} history={history} />}
          {tab==='hero'      && <HeroTab level={level} xp={xp} dailyXpEarned={dailyXpEarned} weeklyXpEarned={weeklyXpEarned} addXp={addXp} attackFlash={attackFlash} />}
          {tab==='planner'   && <Planner addXp={addXp} />}
          {tab==='builder'   && <Builder customBank={customBank} setCustomBank={setCustomBank} dailyTasks={dailyTasks} setDailyTasks={setDailyTasks} addXp={addXp} />}
          {tab==='sprint'    && <Sprint addXp={addXp} />}
          {tab==='deadline'  && <DeadlineTab addXp={addXp} />}
          {tab==='coach'     && <Coach coachHistory={coachHistory} setCoachHistory={setCoachHistory} />}
          {tab==='network'   && <Network network={network} setNetwork={setNetwork} addXp={addXp} />}
          {tab==='patterns'  && <Patterns history={history} weeklyScores={weeklyScores} dailyTasks={dailyTasks} xp={xp} level={level} streak={streak} />}
          {tab==='settings'  && <Settings apiKey={apiKey} setApiKey={setApiKey} settings={settings} setSettings={setSettings} xp={xp} level={level} streak={streak} />}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background:'rgba(8,12,10,0.97)', backdropFilter:'blur(12px)',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        paddingBottom:'env(safe-area-inset-bottom,0px)', flexShrink:0, zIndex:10, position:'relative',
        overflowX:'auto' }}>
        <div style={{ display:'flex', minWidth:'100%', width:'max-content' }}>
          {TABS.map(([t, icon, label]) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              <div style={{ position:'relative', lineHeight:1 }}>
                <span style={{ fontSize:'16px' }}>{icon}</span>
                {t==='dashboard' && urgentCount>0 && tab!=='dashboard' && (
                  <span style={{
                    position:'absolute', top:'-4px', right:'-6px',
                    width:'14px', height:'14px', borderRadius:'50%',
                    background:'#ff6432', fontSize:'8px', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:"'Bebas Neue'", letterSpacing:0,
                  }}>{urgentCount}</span>
                )}
                {t==='hero' && (dailyXpEarned >= 200 || weeklyXpEarned >= 1000) && (
                  <span style={{
                    position:'absolute', top:'-4px', right:'-6px',
                    width:'14px', height:'14px', borderRadius:'50%',
                    background:'#f5a623', fontSize:'8px', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    animation:'levelGlow 1s ease-in-out infinite',
                  }}>!</span>
                )}
              </div>
              <span style={{ fontSize:'8px', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
