import { useState } from 'react'
import { useLocalStorage } from '../hooks/useStorage.js'
import { PLANNER_BLOCKS, DAYS_SHORT, getWeekDates, todayKey } from '../data/constants.js'

const today = todayKey()

function getWeekLabel(dates) {
  const opts = { day:'numeric', month:'short' }
  const s = new Date(dates[0]).toLocaleDateString('fr-FR', opts)
  const e = new Date(dates[6]).toLocaleDateString('fr-FR', opts)
  return `${s} – ${e}`
}

function dayProgress(dayData) {
  if (!dayData) return 0
  const all = PLANNER_BLOCKS.flatMap(b => dayData.blocks?.[b.id] || [])
  if (!all.length) return 0
  return Math.round((all.filter(i => i.done).length / all.length) * 100)
}

export default function Planner({ addXp }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [planner, setPlanner]       = useLocalStorage('lazlo_planner', {})
  const [selectedDay, setSelectedDay] = useState(today)
  const [addingBlock, setAddingBlock] = useState(null) // block id
  const [newItemText, setNewItemText] = useState('')
  const [newItemDur,  setNewItemDur]  = useState(25)
  const [showReview, setShowReview]   = useState(false)
  const [reviewText,  setReviewText]  = useState('')
  const [weekPacteInput, setWeekPacteInput] = useState('')
  const [editingPacte, setEditingPacte] = useState(false)

  const weekDates = getWeekDates(weekOffset)
  const weekKey   = weekDates[0]
  const weekData  = planner[weekKey] || {}

  const getDay = (dateStr) => weekData[dateStr] || { priority:'', blocks:{} }

  const setDay = (dateStr, updater) => {
    setPlanner(p => ({
      ...p,
      [weekKey]: {
        ...p[weekKey],
        [dateStr]: updater(getDay(dateStr)),
      }
    }))
  }

  const addItem = (dateStr, blockId) => {
    if (!newItemText.trim()) return
    const item = {
      id: Date.now(),
      text: newItemText.trim(),
      duration: newItemDur,
      done: false,
    }
    setDay(dateStr, d => ({
      ...d,
      blocks: {
        ...d.blocks,
        [blockId]: [...(d.blocks[blockId] || []), item],
      }
    }))
    setNewItemText('')
    setAddingBlock(null)
    addXp(5)
  }

  const toggleItem = (dateStr, blockId, itemId) => {
    setDay(dateStr, d => {
      const items = d.blocks?.[blockId] || []
      const wasUndone = !items.find(i => i.id === itemId)?.done
      if (wasUndone) addXp(15)
      return {
        ...d,
        blocks: {
          ...d.blocks,
          [blockId]: items.map(i => i.id === itemId ? {...i, done: !i.done} : i),
        }
      }
    })
  }

  const removeItem = (dateStr, blockId, itemId) => {
    setDay(dateStr, d => ({
      ...d,
      blocks: {
        ...d.blocks,
        [blockId]: (d.blocks?.[blockId] || []).filter(i => i.id !== itemId),
      }
    }))
  }

  const setPriority = (dateStr, val) => {
    setDay(dateStr, d => ({ ...d, priority: val }))
  }

  const saveWeekPacte = () => {
    setPlanner(p => ({
      ...p,
      [weekKey]: { ...p[weekKey], pacte: weekPacteInput },
    }))
    setEditingPacte(false)
  }

  const weekPacte = planner[weekKey]?.pacte || ''
  const dayData   = getDay(selectedDay)
  const selDateObj = new Date(selectedDay)
  const selDayName = DAYS_SHORT[selDateObj.getDay() === 0 ? 6 : selDateObj.getDay() - 1]

  // Block total minutes for selected day
  const blockMinutes = (blockId) => {
    return (dayData.blocks?.[blockId] || []).reduce((s, i) => s + (i.duration || 0), 0)
  }

  const DURATIONS = [10, 15, 20, 25, 30, 45, 60, 90]

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
        <div>
          <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px' }}>// PLANNING SEMAINE</div>
          <div style={{ fontSize:'11px', color:'#383838', marginTop:'2px' }}>{getWeekLabel(weekDates)}</div>
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          <button onClick={() => setWeekOffset(o => o-1)} style={{
            padding:'5px 10px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:'7px',
            cursor:'pointer', color:'#555', fontSize:'14px' }}>←</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} style={{
              padding:'5px 8px', background:'rgba(200,241,53,0.08)',
              border:'1px solid rgba(200,241,53,0.2)', borderRadius:'7px',
              cursor:'pointer', color:'#c8f135', fontSize:'10px', fontFamily:"'Space Mono'" }}>
              Auj.
            </button>
          )}
          <button onClick={() => setWeekOffset(o => o+1)} style={{
            padding:'5px 10px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:'7px',
            cursor:'pointer', color:'#555', fontSize:'14px' }}>→</button>
        </div>
      </div>

      {/* Weekly Pacte */}
      <div style={{ marginBottom:'16px', padding:'12px 14px', borderRadius:'10px',
        background: weekPacte ? 'rgba(200,241,53,0.05)' : 'rgba(255,255,255,0.02)',
        border:`1px solid ${weekPacte ? 'rgba(200,241,53,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
        <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'6px' }}>
          ENGAGEMENT DE LA SEMAINE
        </div>
        {editingPacte ? (
          <div style={{ display:'flex', gap:'8px' }}>
            <input
              autoFocus
              value={weekPacteInput}
              onChange={e => setWeekPacteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveWeekPacte()}
              placeholder="ex: finir le chapitre anapath + appeler 2 contacts"
              style={{ flex:1, padding:'8px 12px', background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(200,241,53,0.3)', borderRadius:'7px',
                color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'12px' }} />
            <button onClick={saveWeekPacte} style={{ padding:'8px 14px', background:'#c8f135',
              border:'none', borderRadius:'7px', cursor:'pointer', color:'#0a0a0a',
              fontFamily:"'Bebas Neue'", fontSize:'14px' }}>OK</button>
          </div>
        ) : (
          <div onClick={() => { setWeekPacteInput(weekPacte); setEditingPacte(true) }}
            style={{ cursor:'pointer', fontSize:'12px',
              color: weekPacte ? '#c8f135' : '#333', fontStyle: weekPacte ? 'normal' : 'italic' }}>
            {weekPacte || 'Tape ton engagement pour cette semaine... →'}
          </div>
        )}
      </div>

      {/* Day selector */}
      <div style={{ display:'flex', gap:'5px', marginBottom:'16px', overflowX:'auto', paddingBottom:'2px' }}>
        {weekDates.map((date, i) => {
          const prog = dayProgress(getDay(date))
          const isToday = date === today
          const isSel   = date === selectedDay
          const dayNum  = new Date(date).getDate()
          return (
            <button key={date} onClick={() => setSelectedDay(date)} style={{
              flexShrink:0, minWidth:'48px', padding:'8px 6px', borderRadius:'10px',
              cursor:'pointer', border:'none',
              background: isSel
                ? 'rgba(200,241,53,0.15)'
                : isToday
                  ? 'rgba(200,241,53,0.06)'
                  : 'rgba(255,255,255,0.02)',
              outline: isSel ? '1.5px solid #c8f135' : isToday ? '1px solid rgba(200,241,53,0.2)' : '1px solid rgba(255,255,255,0.05)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
            }}>
              <span style={{ fontSize:'9px', color: isSel ? '#c8f135' : '#444' }}>{DAYS_SHORT[i]}</span>
              <span style={{ fontFamily:"'Bebas Neue'", fontSize:'16px',
                color: isSel ? '#c8f135' : isToday ? '#888' : '#555' }}>{dayNum}</span>
              {/* Progress dot */}
              {prog > 0 ? (
                <div style={{ width:'20px', height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px' }}>
                  <div style={{ width:`${prog}%`, height:'100%', borderRadius:'2px',
                    background: prog === 100 ? '#c8f135' : prog > 50 ? '#f5a623' : '#555' }} />
                </div>
              ) : (
                <div style={{ width:'20px', height:'3px', background:'transparent' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day */}
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'12px' }}>
        // {selDayName.toUpperCase()} {new Date(selectedDay).toLocaleDateString('fr-FR', { day:'numeric', month:'long' })}
        {selectedDay === today && <span style={{ color:'#c8f135', marginLeft:'8px' }}>— AUJOURD'HUI</span>}
      </div>

      {/* Priority */}
      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'9px', color:'#f5a623', letterSpacing:'1px', marginBottom:'6px' }}>
          🎯 PRIORITÉ DU JOUR — LA 1 SEULE CHOSE QUI COMPTE
        </div>
        <input
          value={dayData.priority || ''}
          onChange={e => setPriority(selectedDay, e.target.value)}
          placeholder="ex: finir le chapitre anapath avant 18h"
          style={{ width:'100%', padding:'10px 14px', background:'rgba(245,166,35,0.05)',
            border:'1px solid rgba(245,166,35,0.2)', borderRadius:'9px',
            color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'12px' }} />
      </div>

      {/* Blocks */}
      {PLANNER_BLOCKS.map(block => {
        const items   = dayData.blocks?.[block.id] || []
        const doneN   = items.filter(i => i.done).length
        const totalMin = blockMinutes(block.id)
        const isAdding = addingBlock === block.id

        return (
          <div key={block.id} style={{ marginBottom:'14px' }}>
            {/* Block header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:'8px', padding:'8px 12px', borderRadius:'9px',
              background:`${block.color}0a`, border:`1px solid ${block.color}18` }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'13px' }}>{block.label}</span>
                <span style={{ fontSize:'9px', color:'#444' }}>{block.sub}</span>
                {totalMin > 0 && (
                  <span style={{ fontSize:'9px', color: block.color, opacity:0.7 }}>
                    {totalMin}min planifiés
                  </span>
                )}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                {items.length > 0 && (
                  <span style={{ fontSize:'9px', color: doneN===items.length ? block.color : '#444' }}>
                    {doneN}/{items.length}
                  </span>
                )}
                <button onClick={() => setAddingBlock(isAdding ? null : block.id)} style={{
                  padding:'3px 9px', background: isAdding ? `${block.color}20` : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${isAdding ? block.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:'7px', cursor:'pointer',
                  color: isAdding ? block.color : '#555', fontSize:'12px' }}>
                  {isAdding ? '✕' : '+'}
                </button>
              </div>
            </div>

            {/* Items */}
            {items.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 12px', marginBottom:'4px', borderRadius:'8px',
                background:'rgba(255,255,255,0.02)', border:`1px solid ${item.done ? `${block.color}20` : 'rgba(255,255,255,0.05)'}`,
                opacity: item.done ? 0.5 : 1, transition:'all 0.2s' }}>
                <button onClick={() => toggleItem(selectedDay, block.id, item.id)} style={{
                  width:'18px', height:'18px', borderRadius:'5px', flexShrink:0, border:'none', cursor:'pointer',
                  background: item.done ? block.color : 'transparent',
                  outline:`2px solid ${item.done ? block.color : '#2a2a2a'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'10px', color:'#0a0a0a', transition:'all 0.15s' }}>
                  {item.done ? '✓' : ''}
                </button>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'12px', color: item.done ? '#444' : '#ddd',
                    textDecoration: item.done ? 'line-through' : 'none',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {item.text}
                  </div>
                  {item.duration > 0 && (
                    <div style={{ fontSize:'9px', color:'#333', marginTop:'1px' }}>{item.duration}min</div>
                  )}
                </div>
                <button onClick={() => removeItem(selectedDay, block.id, item.id)} style={{
                  background:'transparent', border:'none', color:'#2a2a2a', cursor:'pointer',
                  fontSize:'14px', padding:'2px 4px', flexShrink:0 }}>✕</button>
              </div>
            ))}

            {/* Add form */}
            {isAdding && (
              <div className="fade-in" style={{ padding:'10px 12px', borderRadius:'9px',
                background:'rgba(255,255,255,0.03)', border:`1px solid ${block.color}25`, marginTop:'4px' }}>
                <input
                  autoFocus
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem(selectedDay, block.id)}
                  placeholder="Ajouter une tâche..."
                  style={{ width:'100%', padding:'8px 12px', marginBottom:'8px',
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
                    borderRadius:'7px', color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'12px' }} />
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => setNewItemDur(d)} style={{
                      padding:'4px 9px', borderRadius:'14px', cursor:'pointer', border:'none',
                      background: newItemDur===d ? block.color : 'rgba(255,255,255,0.05)',
                      color: newItemDur===d ? '#0a0a0a' : '#555', fontSize:'10px',
                      fontFamily:"'Space Mono'", fontWeight: newItemDur===d ? '700' : '400',
                    }}>{d}m</button>
                  ))}
                </div>
                <button onClick={() => addItem(selectedDay, block.id)} style={{
                  width:'100%', padding:'8px', background: block.color, border:'none',
                  borderRadius:'7px', cursor:'pointer', color:'#0a0a0a',
                  fontFamily:"'Bebas Neue'", fontSize:'14px', letterSpacing:'1px' }}>
                  AJOUTER +5 XP
                </button>
              </div>
            )}

            {items.length === 0 && !isAdding && (
              <div onClick={() => setAddingBlock(block.id)}
                style={{ padding:'8px 12px', fontSize:'10px', color:'#2a2a2a',
                  cursor:'pointer', fontStyle:'italic' }}>
                → Ajouter une tâche pour ce bloc
              </div>
            )}
          </div>
        )
      })}

      {/* Daily progress summary */}
      {(() => {
        const prog = dayProgress(dayData)
        const allItems = PLANNER_BLOCKS.flatMap(b => dayData.blocks?.[b.id] || [])
        if (!allItems.length) return null
        const doneN = allItems.filter(i => i.done).length
        const totalMin = allItems.reduce((s, i) => s + (i.duration || 0), 0)
        return (
          <div style={{ padding:'12px 14px', borderRadius:'10px', marginTop:'4px',
            background: prog === 100 ? 'rgba(200,241,53,0.08)' : 'rgba(255,255,255,0.02)',
            border:`1px solid ${prog === 100 ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <div style={{ fontSize:'10px', color: prog === 100 ? '#c8f135' : '#555' }}>
                {prog === 100 ? '✓ JOURNÉE COMPLÈTE' : `${doneN} / ${allItems.length} tâches — ${totalMin}min planifiés`}
              </div>
              <div style={{ fontSize:'10px', color: prog === 100 ? '#c8f135' : '#444' }}>{prog}%</div>
            </div>
            <div style={{ height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'2px' }}>
              <div style={{ width:`${prog}%`, height:'100%', borderRadius:'2px', transition:'width 0.5s',
                background: prog === 100 ? '#c8f135' : prog > 60 ? '#f5a623' : '#555' }} />
            </div>
          </div>
        )
      })()}

      {/* Week review toggle */}
      <div style={{ marginTop:'20px' }}>
        <button onClick={() => setShowReview(!showReview)} style={{
          width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'9px', padding:'10px 14px', cursor:'pointer',
          color:'#444', fontFamily:"'Space Mono'", fontSize:'10px',
          display:'flex', justifyContent:'space-between' }}>
          <span>// BILAN DE SEMAINE</span>
          <span>{showReview ? '▲' : '▼'}</span>
        </button>
        {showReview && (
          <div className="fade-in" style={{ marginTop:'8px', padding:'14px', borderRadius:'10px',
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>
              CE QUE J'AI APPRIS SUR MOI CETTE SEMAINE
            </div>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Qu'est-ce qui a bien marché ? Qu'est-ce qui t'a ralenti ? Quoi changer la semaine prochaine ?"
              rows={4}
              style={{ width:'100%', padding:'10px 12px',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
                borderRadius:'8px', color:'#e8f5e0', fontFamily:"'Space Mono'", fontSize:'12px',
                resize:'none', lineHeight:'1.6' }} />
            <button onClick={() => {
              if (!reviewText.trim()) return
              setPlanner(p => ({
                ...p,
                [weekKey]: { ...p[weekKey], review: reviewText.trim(), reviewDate: today }
              }))
              setReviewText('')
              addXp(30)
              setShowReview(false)
            }} style={{ marginTop:'8px', width:'100%', padding:'10px', background:'rgba(200,241,53,0.1)',
              border:'1px solid rgba(200,241,53,0.25)', borderRadius:'8px',
              cursor:'pointer', color:'#c8f135', fontFamily:"'Bebas Neue'", fontSize:'14px', letterSpacing:'1px' }}>
              SAUVEGARDER +30 XP
            </button>
            {planner[weekKey]?.review && (
              <div style={{ marginTop:'10px', padding:'10px 12px', borderRadius:'8px',
                background:'rgba(200,241,53,0.04)', border:'1px solid rgba(200,241,53,0.1)',
                fontSize:'11px', color:'#888', lineHeight:'1.6', fontStyle:'italic' }}>
                "{planner[weekKey].review}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
