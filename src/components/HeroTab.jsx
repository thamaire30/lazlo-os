import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useStorage.js'
import Character, { getStage, STAGES } from './Character.jsx'
import { XP_TO_NEXT_LEVEL, todayKey } from '../data/constants.js'

// ─── Boss definitions ─────────────────────────────────────────────────────────
const DAILY_BOSSES = [
  { name:'La Procrastination', emoji:'🐌', desc:'Elle ralentit tout. Elle murmure "demain".',      color:'#8b7355', hp: 200 },
  { name:'La Distraction',     emoji:'📱', desc:'100 notifications. Zéro résultat.',              color:'#5b8baa', hp: 200 },
  { name:'Le Doute',           emoji:'🌫️', desc:'Il t\'empêche de commencer.',                   color:'#7a7a9a', hp: 200 },
  { name:'La Fatigue',         emoji:'😴', desc:'Elle te dit de reporter à demain.',              color:'#6b5b7a', hp: 200 },
  { name:'Le Perfectionnisme', emoji:'♾️', desc:'L\'ennemi du fait. Le frère du rien.',           color:'#aa8b5b', hp: 200 },
  { name:'L\'Imposter',        emoji:'🎭', desc:'Il dit que tu n\'as pas ta place.',              color:'#7a5b8b', hp: 200 },
  { name:'Le Confort',         emoji:'🛋️', desc:'La prison la plus douce qui soit.',             color:'#5b7a6b', hp: 200 },
]

const WEEKLY_BOSSES = [
  { name:'La Semaine Perdue',    emoji:'📅', desc:'7 jours. 0 progrès. C\'est possible.',         color:'#aa4444', hp: 1000 },
  { name:'Le Plateau',           emoji:'📉', desc:'Tu stagnais. La routine t\'a avalé.',           color:'#4455aa', hp: 1000 },
  { name:'La Médiocrité',        emoji:'😐', desc:'Le pire état : pas assez mauvais pour changer.', color:'#888855', hp: 1000 },
  { name:'L\'Auto-Saboteur',     emoji:'💣', desc:'C\'est toi. Mais la mauvaise version de toi.',  color:'#aa5544', hp: 1000 },
  { name:'Le Temps Volé',        emoji:'⏳', desc:'Chaque heure gaspillée est une dette.',         color:'#554488', hp: 1000 },
]

function getBoss(list, offset = 0) {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + offset
  return list[seed % list.length]
}

function getWeekSeed() {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  return Math.floor((d - jan1) / (1000 * 60 * 60 * 24 * 7))
}

// ─── HP Bar ───────────────────────────────────────────────────────────────────
function HpBar({ current, max, color, danger }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const barColor = pct > 60 ? color : pct > 30 ? '#f5a623' : '#ff4444'
  return (
    <div style={{ width:'100%', height:'10px', background:'rgba(0,0,0,0.4)',
      borderRadius:'5px', border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
      <div style={{
        width:`${pct}%`, height:'100%', borderRadius:'5px', transition:'width 0.8s ease',
        background:`linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
        boxShadow: danger ? `0 0 8px ${barColor}` : 'none',
        animation: danger ? 'bossDanger 0.5s ease infinite' : 'none',
      }} />
    </div>
  )
}

// ─── Boss Card ────────────────────────────────────────────────────────────────
function BossCard({ boss, hpLeft, maxHp, onClaim, slain, bonusClaimed, label, bonus }) {
  const pct = Math.max(0, (hpLeft / maxHp) * 100)
  const isAlmostDead = pct < 20 && pct > 0
  const isDead = hpLeft <= 0

  return (
    <div style={{ padding:'16px', borderRadius:'12px', marginBottom:'12px',
      background: isDead
        ? 'rgba(200,241,53,0.06)'
        : `rgba(${boss.color.replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.08)`,
      border:`1px solid ${isDead ? 'rgba(200,241,53,0.25)' : `${boss.color}40`}`,
      transition:'all 0.5s' }}>

      {/* Boss header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{
            fontSize:'32px',
            animation: isDead ? 'none' : isAlmostDead ? 'bossShake 0.3s ease infinite' : 'bossFloat 2s ease-in-out infinite',
            filter: isDead ? 'grayscale(1) opacity(0.4)' : undefined,
          }}>
            {boss.emoji}
          </div>
          <div>
            <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'2px' }}>{label}</div>
            <div style={{ fontSize:'16px', fontFamily:"'Bebas Neue'", color: isDead ? '#c8f135' : '#ddd',
              letterSpacing:'1px' }}>
              {isDead ? '✓ ' : ''}{boss.name}
            </div>
            <div style={{ fontSize:'10px', color:'#444', marginTop:'1px', fontStyle:'italic' }}>{boss.desc}</div>
          </div>
        </div>
        {isDead && !bonusClaimed && (
          <button onClick={onClaim} style={{ padding:'8px 14px', background:'#c8f135', border:'none',
            borderRadius:'8px', cursor:'pointer', color:'#0a0a0a',
            fontFamily:"'Bebas Neue'", fontSize:'14px', letterSpacing:'1px',
            animation:'pulse 1.5s ease infinite' }}>
            +{bonus} XP
          </button>
        )}
        {bonusClaimed && (
          <div style={{ fontSize:'10px', color:'#c8f135', textAlign:'right' }}>
            ✓ bonus<br/>encaissé
          </div>
        )}
      </div>

      {/* HP bar */}
      {!isDead ? (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
            <span style={{ fontSize:'9px', color:'#555' }}>PV</span>
            <span style={{ fontSize:'9px', color: isAlmostDead ? '#ff4444' : '#555',
              animation: isAlmostDead ? 'blink 0.5s infinite' : 'none' }}>
              {Math.max(0, hpLeft)} / {maxHp}
            </span>
          </div>
          <HpBar current={hpLeft} max={maxHp} color={boss.color} danger={isAlmostDead} />
          <div style={{ fontSize:'9px', color:'#383838', marginTop:'5px' }}>
            Chaque XP gagné = 1 dégât. Gagne {maxHp} XP pour le vaincre.
          </div>
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'8px 0' }}>
          <div style={{ fontSize:'12px', color:'#c8f135', fontFamily:"'Bebas Neue'", letterSpacing:'2px' }}>
            BOSS VAINCU 💀
          </div>
          <div style={{ fontSize:'10px', color:'#555', marginTop:'2px' }}>
            {bonusClaimed ? `+${bonus} XP encaissés` : `Réclame ton bonus de +${bonus} XP`}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Evolution timeline ───────────────────────────────────────────────────────
function EvolutionPath({ currentLevel }) {
  return (
    <div style={{ padding:'14px', borderRadius:'11px', marginBottom:'14px',
      background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'12px' }}>
        CHEMIN D'ÉVOLUTION
      </div>
      {STAGES.map((stage, i) => {
        const unlocked = currentLevel >= stage.minLvl
        const isCurrent = getStage(currentLevel).name === stage.name
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            {/* Line */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', flexShrink:0,
                background: unlocked ? stage.color : '#1a1a1a',
                border:`2px solid ${unlocked ? stage.color : '#2a2a2a'}`,
                boxShadow: isCurrent ? `0 0 10px ${stage.color}` : 'none',
                transition:'all 0.5s' }} />
              {i < STAGES.length - 1 && (
                <div style={{ width:'1px', height:'16px',
                  background: unlocked && currentLevel >= STAGES[i+1]?.minLvl
                    ? stage.color : '#1a1a1a' }} />
              )}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:'12px', fontWeight:isCurrent?700:400,
                  color: unlocked ? stage.color : '#333',
                  fontFamily: isCurrent ? "'Bebas Neue'" : 'inherit',
                  letterSpacing: isCurrent ? '1px' : 0,
                }}>
                  {stage.name} {isCurrent && '← TU ES ICI'}
                </div>
                <div style={{ fontSize:'9px', color: unlocked ? '#555' : '#2a2a2a' }}>
                  Niv. {stage.minLvl}
                </div>
              </div>
              {isCurrent && (
                <div style={{ fontSize:'10px', color:'#444', marginTop:'2px', fontStyle:'italic' }}>
                  {stage.sub}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main HeroTab ─────────────────────────────────────────────────────────────
export default function HeroTab({ level, xp, dailyXpEarned, weeklyXpEarned, addXp, attackFlash }) {
  const needed = XP_TO_NEXT_LEVEL(level)
  const stage  = getStage(level)

  // Boss state persistence
  const [bossState, setBossState] = useLocalStorage('lazlo_boss_state', {
    dailyDate: '',
    dailySlain: false,
    dailyBonusClaimed: false,
    weekSeed: -1,
    weeklySlain: false,
    weeklyBonusClaimed: false,
  })

  const today    = todayKey()
  const weekSeed = getWeekSeed()

  // Reset daily boss if new day
  const isNewDay = bossState.dailyDate !== today
  const dailyState = isNewDay
    ? { ...bossState, dailyDate: today, dailySlain: false, dailyBonusClaimed: false }
    : bossState

  // Reset weekly boss if new week
  const isNewWeek = bossState.weekSeed !== weekSeed
  const effectiveState = isNewWeek
    ? { ...dailyState, weekSeed, weeklySlain: false, weeklyBonusClaimed: false }
    : dailyState

  useEffect(() => {
    if (isNewDay || isNewWeek) setBossState(effectiveState)
  }, [isNewDay, isNewWeek])

  const dailyBoss   = getBoss(DAILY_BOSSES)
  const weeklyBoss  = getBoss(WEEKLY_BOSSES, weekSeed)
  const dailyHp     = Math.max(0, dailyBoss.hp - dailyXpEarned)
  const weeklyHp    = Math.max(0, weeklyBoss.hp - weeklyXpEarned)

  const dailySlain  = dailyHp <= 0
  const weeklySlain = weeklyHp <= 0

  // Auto-mark slain
  useEffect(() => {
    if (dailySlain && !effectiveState.dailySlain) {
      setBossState(s => ({ ...s, dailySlain: true }))
    }
    if (weeklySlain && !effectiveState.weeklySlain) {
      setBossState(s => ({ ...s, weeklySlain: true }))
    }
  }, [dailySlain, weeklySlain])

  const claimDailyBonus = () => {
    addXp(50)
    setBossState(s => ({ ...s, dailyBonusClaimed: true }))
  }
  const claimWeeklyBonus = () => {
    addXp(300)
    setBossState(s => ({ ...s, weeklyBonusClaimed: true }))
  }

  const progressToNextStage = () => {
    const next = STAGES.find(s => s.minLvl > level)
    if (!next) return null
    return { name: next.name, lvlNeeded: next.minLvl, lvlsLeft: next.minLvl - level }
  }
  const nextStage = progressToNextStage()

  return (
    <div className="fade-in">
      <style>{`
        @keyframes bossFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-5px) rotate(3deg)} }
        @keyframes bossShake { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        @keyframes bossDanger { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes levelUpStar { 0%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1.2)} 100%{opacity:0;transform:scale(0.8) translateY(-20px)} }
      `}</style>

      {/* ── Character display ── */}
      <div style={{ textAlign:'center', padding:'24px 0 16px', position:'relative' }}>
        {/* Background glow */}
        <div style={{
          position:'absolute', inset:0,
          background:`radial-gradient(ellipse at 50% 50%, ${stage.glow} 0%, transparent 70%)`,
          pointerEvents:'none',
        }} />

        <div style={{ position:'relative', display:'inline-block' }}>
          <Character level={level} xp={xp} needed={needed} attackFlash={attackFlash} size="lg" />
        </div>

        {/* Stage name */}
        <div style={{ marginTop:'16px' }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'26px', color: stage.color,
            letterSpacing:'3px', lineHeight:1,
            textShadow:`0 0 20px ${stage.color}` }}>
            {stage.name.toUpperCase()}
          </div>
          <div style={{ fontSize:'11px', color:'#444', fontStyle:'italic', marginTop:'4px' }}>
            {stage.sub}
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ maxWidth:'260px', margin:'14px auto 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
            <span style={{ fontSize:'9px', color:'#555' }}>Niveau {level}</span>
            <span style={{ fontSize:'9px', color: stage.color }}>{xp} / {needed} XP</span>
          </div>
          <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px' }}>
            <div style={{ width:`${Math.min((xp/needed)*100, 100)}%`, height:'100%',
              background:`linear-gradient(90deg, ${stage.color}88, ${stage.color})`,
              borderRadius:'3px', transition:'width 0.6s ease',
              boxShadow:`0 0 6px ${stage.color}80` }} />
          </div>
          {nextStage && (
            <div style={{ fontSize:'9px', color:'#2a2a2a', marginTop:'4px', textAlign:'right' }}>
              → {stage.name !== getStage(level).name ? '' : nextStage.lvlsLeft} niveaux avant {nextStage.name}
            </div>
          )}
        </div>
      </div>

      {/* ── Daily/Weekly XP progress ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
        <div style={{ padding:'12px', borderRadius:'10px',
          background: dailySlain ? 'rgba(200,241,53,0.08)' : 'rgba(255,255,255,0.02)',
          border:`1px solid ${dailySlain ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
          <div style={{ fontSize:'9px', color:'#555', marginBottom:'5px' }}>XP AUJOURD'HUI</div>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'24px',
            color: dailySlain ? '#c8f135' : '#888', letterSpacing:'1px' }}>
            {dailyXpEarned} <span style={{ fontSize:'14px', color:'#444' }}>/ 200</span>
          </div>
          <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', marginTop:'6px' }}>
            <div style={{ width:`${Math.min((dailyXpEarned/200)*100,100)}%`, height:'100%',
              background: dailySlain ? '#c8f135' : '#444', borderRadius:'2px', transition:'width 0.5s' }} />
          </div>
          {dailySlain && <div style={{ fontSize:'9px', color:'#c8f135', marginTop:'3px' }}>Boss quotidien vaincu !</div>}
        </div>

        <div style={{ padding:'12px', borderRadius:'10px',
          background: weeklySlain ? 'rgba(200,241,53,0.08)' : 'rgba(255,255,255,0.02)',
          border:`1px solid ${weeklySlain ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
          <div style={{ fontSize:'9px', color:'#555', marginBottom:'5px' }}>XP CETTE SEMAINE</div>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:'24px',
            color: weeklySlain ? '#c8f135' : '#888', letterSpacing:'1px' }}>
            {weeklyXpEarned} <span style={{ fontSize:'14px', color:'#444' }}>/ 1000</span>
          </div>
          <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px', marginTop:'6px' }}>
            <div style={{ width:`${Math.min((weeklyXpEarned/1000)*100,100)}%`, height:'100%',
              background: weeklySlain ? '#c8f135' : '#444', borderRadius:'2px', transition:'width 0.5s' }} />
          </div>
          {weeklySlain && <div style={{ fontSize:'9px', color:'#c8f135', marginTop:'3px' }}>Boss hebdo vaincu !</div>}
        </div>
      </div>

      {/* ── Bosses ── */}
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>
        // BOSS À VAINCRE
      </div>

      <BossCard
        boss={dailyBoss}
        hpLeft={dailyHp}
        maxHp={dailyBoss.hp}
        slain={dailySlain}
        onClaim={claimDailyBonus}
        bonusClaimed={effectiveState.dailyBonusClaimed}
        label="BOSS QUOTIDIEN — RESET DEMAIN"
        bonus={50}
      />
      <BossCard
        boss={weeklyBoss}
        hpLeft={weeklyHp}
        maxHp={weeklyBoss.hp}
        slain={weeklySlain}
        onClaim={claimWeeklyBonus}
        bonusClaimed={effectiveState.weeklyBonusClaimed}
        label="BOSS HEBDOMADAIRE — RESET LUNDI"
        bonus={300}
      />

      {/* ── Evolution path ── */}
      <EvolutionPath currentLevel={level} />

      {/* ── Stats personnage ── */}
      <div style={{ padding:'14px', borderRadius:'11px',
        background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>
          STATS DU PERSONNAGE
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
          {[
            ['NIVEAU', level, stage.color],
            ['STADE', stage.stageIdx + 1 + ' / ' + STAGES.length, stage.color],
            ['PUISSANCE', level * 10 + '%', stage.color],
          ].map(([l, v, c]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:'20px', color:c }}>{v}</div>
              <div style={{ fontSize:'8px', color:'#3a3a3a', letterSpacing:'0.5px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
