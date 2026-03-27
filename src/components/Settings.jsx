import { useState } from 'react'
import { clearAllData } from '../hooks/useStorage.js'

const Row = ({ label, desc, children }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'13px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
    <div>
      <div style={{ fontSize:'13px', color:'#ccc' }}>{label}</div>
      {desc && <div style={{ fontSize:'10px', color:'#3a3a3a', marginTop:'2px' }}>{desc}</div>}
    </div>
    <div style={{ flexShrink:0, marginLeft:'12px' }}>{children}</div>
  </div>
)

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{
    width:'42px', height:'24px', borderRadius:'12px', border:'none', cursor:'pointer',
    background: on ? '#c8f135' : 'rgba(255,255,255,0.1)',
    position:'relative', transition:'background 0.2s',
  }}>
    <div style={{
      position:'absolute', top:'3px', left: on ? '21px' : '3px',
      width:'18px', height:'18px', borderRadius:'50%',
      background: on ? '#0a0a0a' : '#444', transition:'left 0.2s',
    }} />
  </button>
)

export default function Settings({ apiKey, setApiKey, settings, setSettings, xp, level, streak }) {
  const [keyVisible, setKeyVisible] = useState(false)
  const [keyInput, setKeyInput] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const saveKey = () => {
    setApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => {
    if (confirm('Effacer TOUTES les données ? Cette action est irréversible.')) {
      clearAllData()
      window.location.reload()
    }
  }

  const exportData = () => {
    const data = {}
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k.startsWith('lazlo_')) {
        try { data[k] = JSON.parse(localStorage.getItem(k)) } catch { data[k] = localStorage.getItem(k) }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `lazlo-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        Object.entries(data).forEach(([k,v]) => {
          if (k.startsWith('lazlo_')) localStorage.setItem(k, JSON.stringify(v))
        })
        alert('Import réussi ! Recharge l\'app.')
        window.location.reload()
      } catch { alert('Fichier invalide.') }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fade-in">
      <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'14px' }}>// CONFIGURATION</div>

      {/* Profile summary */}
      <div style={{ padding:'14px 16px', borderRadius:'10px', marginBottom:'20px',
        background:'rgba(200,241,53,0.05)', border:'1px solid rgba(200,241,53,0.15)' }}>
        <div style={{ fontSize:'9px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>TON PROFIL</div>
        <div style={{ display:'flex', justifyContent:'space-around' }}>
          {[['LVL', level, '#c8f135'], ['XP', xp, '#5ba4f5'], ['🔥', streak, '#f5a623']].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:'24px', color:c }}>{v}</div>
              <div style={{ fontSize:'9px', color:'#444' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vercel info */}
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'6px' }}>LAZLO — COACH IA</div>
        <div style={{ padding:'13px', borderRadius:'10px',
          background:'rgba(200,241,53,0.05)', border:'1px solid rgba(200,241,53,0.15)',
          fontSize:'11px', color:'#666', lineHeight:'1.8' }}>
          La clé API est configurée côté serveur Vercel.<br/>
          Pour la changer : <span style={{ color:'#c8f135' }}>vercel.com</span> → ton projet<br/>
          → Settings → Environment Variables<br/>
          → <span style={{ color:'#c8f135' }}>ANTHROPIC_API_KEY</span>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'4px' }}>PRÉFÉRENCES</div>
        <Row label="Afficher le streak" desc="Barre de jours consécutifs">
          <Toggle on={settings.showStreak} onChange={v => setSettings(s=>({...s,showStreak:v}))} />
        </Row>
        <Row label="Mode compact" desc="Interface plus dense">
          <Toggle on={settings.compactMode} onChange={v => setSettings(s=>({...s,compactMode:v}))} />
        </Row>
      </div>

      {/* Data */}
      <div>
        <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', marginBottom:'10px' }}>DONNÉES</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <button onClick={exportData} style={{ padding:'11px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', cursor:'pointer',
            color:'#888', fontFamily:"'Space Mono'", fontSize:'12px' }}>
            ↓ Exporter mes données (JSON)
          </button>
          <label style={{ padding:'11px', background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', cursor:'pointer',
            color:'#888', fontFamily:"'Space Mono'", fontSize:'12px', textAlign:'center', display:'block' }}>
            ↑ Importer une sauvegarde
            <input type="file" accept=".json" onChange={importData} style={{ display:'none' }} />
          </label>
          <button onClick={reset} style={{ padding:'11px', background:'rgba(255,50,50,0.06)',
            border:'1px solid rgba(255,50,50,0.15)', borderRadius:'9px', cursor:'pointer',
            color:'#aa4444', fontFamily:"'Space Mono'", fontSize:'12px' }}>
            ✕ Réinitialiser toutes les données
          </button>
        </div>
      </div>

      <div style={{ marginTop:'24px', padding:'12px', borderRadius:'8px',
        background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize:'9px', color:'#2a2a2a', lineHeight:'1.7' }}>
          LAZLO OS v1.0 — Toutes les données sont stockées localement sur ton appareil.<br/>
          Rien n'est envoyé à des serveurs tiers sauf les messages à LAZLO (API Anthropic).
        </div>
      </div>
    </div>
  )
}
