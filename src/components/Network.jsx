import { useState } from 'react'

const inputStyle = {
  width:'100%', padding:'10px 13px', marginBottom:'8px',
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
  borderRadius:'8px', color:'#e8f5e0', fontFamily:"'Space Mono', monospace", fontSize:'12px',
}

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000*60*60*24))
  return diff
}

function ContactBadge({ lastContact }) {
  const days = daysSince(lastContact)
  if (days === null) return <span style={{ fontSize:'9px', color:'#333' }}>Jamais contacté</span>
  const color = days > 30 ? '#ff6432' : days > 14 ? '#f5a623' : '#c8f135'
  const label = days === 0 ? "Aujourd'hui" : days === 1 ? 'Hier' : `Il y a ${days}j`
  return (
    <span style={{ fontSize:'9px', padding:'2px 7px', borderRadius:'8px',
      background:`${color}15`, color, border:`1px solid ${color}25` }}>
      {label}{days > 30 ? ' ⚠️' : ''}
    </span>
  )
}

export default function Network({ network, setNetwork, addXp }) {
  const [form, setForm] = useState({ name:'', type:'', status:'Nouveau', notes:'' })
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const STATUSES = ['Nouveau', 'À recontacter', 'En discussion', 'Fort potentiel', 'Partenaire', 'Mentor']

  const add = () => {
    if (!form.name.trim()) return
    const c = { id:Date.now(), name:form.name, type:form.type, status:form.status,
      notes:form.notes, heat:20, lastContact: new Date().toISOString().split('T')[0] }
    setNetwork(n => [...n, c])
    addXp(30)
    setForm({ name:'', type:'', status:'Nouveau', notes:'' })
    setShowAdd(false)
  }

  const updateHeat = (id, delta) => {
    setNetwork(n => n.map(c => c.id===id ? {...c, heat: Math.max(0, Math.min(100, c.heat+delta))} : c))
  }

  const updateStatus = (id, status) => {
    setNetwork(n => n.map(c => c.id===id ? {...c, status} : c))
  }

  const markContacted = (id) => {
    setNetwork(n => n.map(c => c.id===id
      ? {...c, lastContact:new Date().toISOString().split('T')[0], heat:Math.min(100,c.heat+15)} : c))
    addXp(20)
  }

  const remove = (id) => {
    if (confirm('Supprimer ce contact ?')) setNetwork(n => n.filter(c => c.id!==id))
  }

  const sorted = [...network].sort((a,b) => b.heat - a.heat)

  // Cold contacts alert
  const coldCount = network.filter(c => daysSince(c.lastContact) > 30).length

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
        <div>
          <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px' }}>// RÉSEAU</div>
          <div style={{ fontSize:'11px', color:'#383838', marginTop:'2px' }}>Liberté stockée chez les autres</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding:'7px 14px', background: showAdd ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.04)',
          border:`1px solid ${showAdd ? 'rgba(200,241,53,0.3)' : 'rgba(255,255,255,0.09)'}`,
          borderRadius:'8px', cursor:'pointer', color: showAdd ? '#c8f135' : '#666',
          fontFamily:"'Space Mono'", fontSize:'11px',
        }}>{showAdd ? '✕ Fermer' : '+ Contact'}</button>
      </div>

      {/* Cold contacts alert */}
      {coldCount > 0 && (
        <div style={{ padding:'10px 14px', marginBottom:'12px', borderRadius:'9px',
          background:'rgba(255,100,50,0.07)', border:'1px solid rgba(255,100,50,0.2)',
          fontSize:'11px', color:'#ff6432', display:'flex', gap:'8px', alignItems:'center' }}>
          ⚠️ {coldCount} contact{coldCount>1?'s':''} sans nouvelles depuis +30j. Relance-les.
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <div className="fade-in" style={{ padding:'14px', borderRadius:'10px', marginBottom:'14px',
          background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
            placeholder="Nom" style={inputStyle} />
          <input value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}
            placeholder="Domaine (ex: Healthtech, Finance, Dev…)" style={inputStyle} />
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'8px' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setForm(f=>({...f,status:s}))} style={{
                padding:'5px 10px', borderRadius:'16px', cursor:'pointer', fontSize:'10px',
                fontFamily:"'Space Mono'",
                background: form.status===s ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.03)',
                border:`1px solid ${form.status===s ? 'rgba(200,241,53,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: form.status===s ? '#c8f135' : '#555',
              }}>{s}</button>
            ))}
          </div>
          <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Notes / contexte (optionnel)"
            rows={2}
            style={{ ...inputStyle, resize:'none', marginBottom:'10px' }} />
          <button onClick={add} style={{ width:'100%', padding:'11px', background:'#c8f135', border:'none',
            borderRadius:'8px', cursor:'pointer', color:'#0a0a0a',
            fontFamily:"'Bebas Neue'", fontSize:'16px', letterSpacing:'1px' }}>
            AJOUTER +30 XP
          </button>
        </div>
      )}

      {/* Contact list */}
      {sorted.map(c => (
        <div key={c.id} style={{ marginBottom:'8px' }}>
          <div className="row-hover" onClick={() => setExpanded(expanded===c.id ? null : c.id)} style={{
            padding:'12px 14px', borderRadius:'10px',
            background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
            transition:'all 0.15s',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
              <div>
                <div style={{ fontSize:'14px', fontWeight:'700', color:'#ddd' }}>{c.name}</div>
                <div style={{ fontSize:'10px', color:'#444', marginTop:'2px' }}>{c.type}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'10px', padding:'3px 9px', borderRadius:'12px', marginBottom:'4px',
                  background: c.heat > 80 ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)',
                  color: c.heat > 80 ? '#c8f135' : '#555',
                  border:`1px solid ${c.heat > 80 ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                  {c.status}
                </div>
                <ContactBadge lastContact={c.lastContact} />
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ fontSize:'9px', color:'#333', width:'36px' }}>HEAT</div>
              <div style={{ flex:1, height:'3px', background:'#111', borderRadius:'2px' }}>
                <div style={{ width:`${c.heat}%`, height:'100%', borderRadius:'2px', transition:'width 0.5s',
                  background: c.heat > 70 ? '#c8f135' : c.heat > 40 ? '#f5a623' : '#333' }} />
              </div>
              <div style={{ fontSize:'9px', color:'#333' }}>{c.heat}%</div>
            </div>
          </div>

          {/* Expanded actions */}
          {expanded === c.id && (
            <div className="fade-in" style={{ padding:'12px 14px', borderRadius:'0 0 10px 10px',
              background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.05)',
              borderTop:'none', marginTop:'-4px' }}>
              {c.notes && <div style={{ fontSize:'11px', color:'#444', marginBottom:'10px', lineHeight:'1.5' }}>"{c.notes}"</div>}

              {/* Status picker inline */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'10px' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(c.id, s)} style={{
                    padding:'4px 9px', borderRadius:'12px', cursor:'pointer', fontSize:'9px',
                    fontFamily:"'Space Mono'",
                    background: c.status===s ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${c.status===s ? 'rgba(200,241,53,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    color: c.status===s ? '#c8f135' : '#444',
                  }}>{s}</button>
                ))}
              </div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                <button onClick={() => markContacted(c.id)} style={{
                  padding:'7px 13px', background:'rgba(200,241,53,0.08)',
                  border:'1px solid rgba(200,241,53,0.2)', borderRadius:'8px',
                  cursor:'pointer', color:'#c8f135', fontFamily:"'Space Mono'", fontSize:'10px' }}>
                  ✓ Contacté aujourd'hui +20 XP
                </button>
                <button onClick={() => updateHeat(c.id, 10)} style={{
                  padding:'7px 11px', background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px',
                  cursor:'pointer', color:'#666', fontFamily:"'Space Mono'", fontSize:'10px' }}>
                  🔥 +Heat
                </button>
                <button onClick={() => updateHeat(c.id, -10)} style={{
                  padding:'7px 11px', background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px',
                  cursor:'pointer', color:'#444', fontFamily:"'Space Mono'", fontSize:'10px' }}>
                  ❄️ -Heat
                </button>
                <button onClick={() => remove(c.id)} style={{
                  padding:'7px 11px', background:'rgba(255,50,50,0.06)',
                  border:'1px solid rgba(255,50,50,0.15)', borderRadius:'8px',
                  cursor:'pointer', color:'#aa4444', fontFamily:"'Space Mono'", fontSize:'10px' }}>
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {network.length === 0 && (
        <div style={{ textAlign:'center', padding:'30px', color:'#333', fontSize:'12px' }}>
          Ton réseau est vide.<br/>Ajoute ton premier contact.
        </div>
      )}
    </div>
  )
}
