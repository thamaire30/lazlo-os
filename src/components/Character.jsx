import { useEffect, useRef, useState } from 'react'

// ─── Evolution stages ────────────────────────────────────────────────────────
export const STAGES = [
  { minLvl:1,  name:'L\'Étudiant',   sub:'Perdu mais motivé',         color:'#888',   glow:'rgba(136,136,136,0.25)', particles:0 },
  { minLvl:4,  name:'L\'Apprenti',   sub:'La flamme commence',        color:'#7ecf60', glow:'rgba(126,207,96,0.3)',   particles:2 },
  { minLvl:7,  name:'Le Bâtisseur',  sub:'Les systèmes se mettent en place', color:'#c8f135', glow:'rgba(200,241,53,0.4)',  particles:4 },
  { minLvl:11, name:'L\'Opérateur',  sub:'Le feu est contrôlé',       color:'#f5c842', glow:'rgba(245,200,66,0.5)',   particles:6 },
  { minLvl:16, name:'Le Libre',      sub:'Indépendant. Enfin.',        color:'#ff9d00', glow:'rgba(255,157,0,0.55)',   particles:8 },
  { minLvl:21, name:'La Légende',    sub:'Irréductible.',              color:'#ff6b35', glow:'rgba(255,107,53,0.6)',   particles:12 },
]

export function getStage(level) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (level >= STAGES[i].minLvl) return { ...STAGES[i], stageIdx: i }
  }
  return { ...STAGES[0], stageIdx: 0 }
}

// ─── Pixel art character ──────────────────────────────────────────────────────
// Each pixel row is a string: '.' = empty, '#' = body, 'G' = glow/energy, 'A' = armor
const PIXEL_FRAMES = {
  0: [ // Étudiant
    '..###..',
    '.#####.',
    '.#O#O#.',
    '.#####.',
    '..###..',
    '..###..',
    '.#####.',
    '#.###.#',
    '#.###.#',
    '..###..',
    '..#.#..',
    '.##.##.',
  ],
  1: [ // Apprenti
    '..GGG..',
    '.G###G.',
    '.#O#O#.',
    '.G###G.',
    '..G#G..',
    '..###..',
    '.#####.',
    'G.###.G',
    'G.###.G',
    '..###..',
    '..#.#..',
    '.##.##.',
  ],
  2: [ // Bâtisseur
    '.GGGGG.',
    'G#####G',
    'G#O#O#G',
    'G#####G',
    '.G###G.',
    '.GAAAG.',
    'GAAAAAG',
    'G.AAA.G',
    'G.AAA.G',
    '.GAAAG.',
    '..G.G..',
    '.GG.GG.',
  ],
  3: [ // Opérateur
    'GGGGGGG',
    'G#####G',
    'G#O#O#G',
    'G#####G',
    'GGGGGGG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'G.GAG.G',
    'GGAGAGG',
  ],
  4: [ // Le Libre
    'GGGGGGG',
    'G#####G',
    'G#O#O#G',
    'G#####G',
    'GGGGGGG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GGGAGGG',
    'GGGAGGG',
  ],
  5: [ // Légende
    'GGGGGGG',
    'G#####G',
    'G#O#O#G',
    'G#####G',
    'GGGGGGG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GAAAAAG',
    'GGGGGGG',
    'GGGGGGG',
  ],
}

function PixelChar({ stageIdx, color, glowColor, attackFlash, size = 7 }) {
  const frame = PIXEL_FRAMES[stageIdx] || PIXEL_FRAMES[0]
  const eyeColor = attackFlash ? '#ff4444' : color

  return (
    <div style={{ display:'inline-block', imageRendering:'pixelated' }}>
      {frame.map((row, ri) => (
        <div key={ri} style={{ display:'flex' }}>
          {row.split('').map((px, ci) => {
            let bg = 'transparent'
            if (px === '#') bg = color === '#888' ? '#4a4a4a' : '#2a3a1a'
            if (px === 'O') bg = eyeColor
            if (px === 'G') bg = glowColor.replace('0.', '0.7').replace('rgba', 'rgba')
            if (px === 'A') bg = color

            const isGlow = px === 'G'
            const isEye  = px === 'O'
            return (
              <div key={ci} style={{
                width: size, height: size,
                background: bg,
                boxShadow: isGlow ? `0 0 ${size}px ${glowColor}` : isEye ? `0 0 4px ${eyeColor}` : 'none',
                transition: 'background 0.15s, box-shadow 0.15s',
              }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Floating particle ───────────────────────────────────────────────────────
function Particle({ color, delay, duration, x, size }) {
  return (
    <div style={{
      position:'absolute',
      left:`${x}%`,
      bottom:'0%',
      width: size, height: size,
      borderRadius:'50%',
      background: color,
      boxShadow:`0 0 6px ${color}`,
      animation:`particleFloat ${duration}s ease-in ${delay}s infinite`,
      opacity:0,
      pointerEvents:'none',
    }} />
  )
}

// ─── Wings (stage 4+) ────────────────────────────────────────────────────────
function Wings({ color, glow }) {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
      {/* Left wing */}
      <div style={{
        position:'absolute', top:'20%', left:'-30px', width:'30px', height:'50px',
        background:`linear-gradient(135deg, transparent, ${color}40, ${color}80)`,
        clipPath:'polygon(100% 0%, 0% 50%, 100% 100%)',
        animation:'wingFlap 2s ease-in-out infinite',
        filter:`drop-shadow(0 0 4px ${color})`,
      }} />
      {/* Right wing */}
      <div style={{
        position:'absolute', top:'20%', right:'-30px', width:'30px', height:'50px',
        background:`linear-gradient(225deg, transparent, ${color}40, ${color}80)`,
        clipPath:'polygon(0% 0%, 100% 50%, 0% 100%)',
        animation:'wingFlap 2s ease-in-out infinite alternate',
        filter:`drop-shadow(0 0 4px ${color})`,
      }} />
    </div>
  )
}

// ─── Crown (stage 5) ─────────────────────────────────────────────────────────
function Crown({ color }) {
  return (
    <div style={{
      position:'absolute', top:'-18px', left:'50%', transform:'translateX(-50%)',
      fontSize:'18px', animation:'crownPulse 1.5s ease-in-out infinite',
      filter:`drop-shadow(0 0 8px ${color})`,
      pointerEvents:'none',
    }}>👑</div>
  )
}

// ─── Main Character component ────────────────────────────────────────────────
export default function Character({ level, xp, needed, attackFlash, size = 'md' }) {
  const stage = getStage(level)
  const { color, glow: glowColor, particles, stageIdx } = stage
  const px = size === 'sm' ? 5 : size === 'lg' ? 9 : 7

  // Generate stable particles based on stage
  const particleList = Array.from({ length: particles }, (_, i) => ({
    id: i,
    x: 10 + (i * 80 / Math.max(particles - 1, 1)),
    delay: i * (2 / Math.max(particles, 1)),
    duration: 2 + (i % 3) * 0.7,
    size: 3 + (i % 3) * 2,
  }))

  const ringCount = stageIdx // 0 = none, 1 = 1 ring, etc.

  return (
    <div style={{ position:'relative', display:'inline-flex', flexDirection:'column', alignItems:'center' }}>
      <style>{`
        @keyframes charFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes charAttack { 0%{transform:scale(1) translateY(0)} 20%{transform:scale(1.15) translateY(-4px)} 50%{transform:scale(0.95) translateY(2px)} 100%{transform:scale(1) translateY(0)} }
        @keyframes particleFloat { 0%{transform:translateY(0) scale(1);opacity:0} 10%{opacity:1} 80%{opacity:0.6} 100%{transform:translateY(-60px) scale(0.3);opacity:0} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.08);opacity:0.8} }
        @keyframes wingFlap { 0%,100%{transform:skewY(-10deg) scaleX(0.9)} 50%{transform:skewY(5deg) scaleX(1.1)} }
        @keyframes crownPulse { 0%,100%{transform:translateX(-50%) translateY(0) rotate(-5deg)} 50%{transform:translateX(-50%) translateY(-4px) rotate(5deg)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px ${glowColor},0 0 40px ${glowColor}} 50%{box-shadow:0 0 30px ${glowColor},0 0 60px ${glowColor},0 0 80px ${glowColor}} }
        @keyframes legendAura { 0%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(30deg) brightness(1.2)} 100%{filter:hue-rotate(0deg) brightness(1)} }
      `}</style>

      {/* Outer aura rings */}
      {Array.from({ length: Math.min(ringCount, 3) }).map((_, i) => (
        <div key={i} style={{
          position:'absolute',
          inset: `-${(i+1) * 12}px`,
          borderRadius:'50%',
          border:`1px solid ${glowColor.replace('0.', `${0.5 - i*0.1}.`)}`,
          animation:`ringPulse ${1.5 + i*0.4}s ease-in-out ${i*0.2}s infinite`,
          pointerEvents:'none',
        }} />
      ))}

      {/* Character wrapper */}
      <div style={{
        position:'relative', padding:'8px',
        animation: attackFlash
          ? 'charAttack 0.4s ease forwards'
          : `charFloat ${2 + stageIdx * 0.2}s ease-in-out infinite`,
        filter: stageIdx >= 5 ? 'none' : undefined,
      }}>

        {/* Wings for stage 4+ */}
        {stageIdx >= 4 && <Wings color={color} glow={glowColor} />}

        {/* Crown for stage 5 */}
        {stageIdx >= 5 && <Crown color={color} />}

        {/* Pixel character */}
        <div style={{
          animation: stageIdx >= 5 ? 'legendAura 3s ease-in-out infinite' : 'none',
          filter: stageIdx >= 2 ? `drop-shadow(0 0 ${4 + stageIdx * 3}px ${color})` : 'none',
        }}>
          <PixelChar stageIdx={stageIdx} color={color} glowColor={glowColor} attackFlash={attackFlash} size={px} />
        </div>

        {/* Glow overlay for high stages */}
        {stageIdx >= 3 && (
          <div style={{
            position:'absolute', inset:0,
            borderRadius:'50%',
            background:`radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            animation:'glowPulse 2s ease-in-out infinite',
            pointerEvents:'none', mixBlendMode:'screen',
          }} />
        )}
      </div>

      {/* Particles */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible' }}>
        {particleList.map(p => (
          <Particle key={p.id} color={color} delay={p.delay} duration={p.duration} x={p.x} size={p.size} />
        ))}
      </div>
    </div>
  )
}
