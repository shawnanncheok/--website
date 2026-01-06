import { useEffect, useMemo, useState } from 'react'
import { BACKGROUNDS, MASCOTS, WEAPONS } from './assetsList'

export default function Scene({ background, mascot, weapon }) {
  const fixedBg = background || null
  const bgRunning = fixedBg == null  // ✅ 背景没选就一直滚

  const [autoMascot, setAutoMascot] = useState(MASCOTS[0])
  const [autoWeapon, setAutoWeapon] = useState(WEAPONS[0])

  // ✅ mascot 为 null 才自动换（不看 isRunning）
  useEffect(() => {
    if (mascot) return
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % MASCOTS.length
      setAutoMascot(MASCOTS[i])
    }, 120)
    return () => clearInterval(t)
  }, [mascot])

  // ✅ weapon 为 null 才自动换（不看 isRunning）
  useEffect(() => {
    if (weapon) return
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % WEAPONS.length
      setAutoWeapon(WEAPONS[i])
    }, 120)
    return () => clearInterval(t)
  }, [weapon])

  const bgTiles = useMemo(() => [...BACKGROUNDS, ...BACKGROUNDS], [])

  return (
    <div className="scene">
      <div className={`scene-bg ${bgRunning ? 'bg-running' : 'bg-stopped'}`}
        style={
          fixedBg
            ? { backgroundImage: `url(${fixedBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {!fixedBg && (
          <div className="bg-track">
            {bgTiles.map((src, idx) => (
              <div key={idx} className="bg-tile" style={{ backgroundImage: `url(${src})` }} />
            ))}
          </div>
        )}

        <div className="fg-center stack">
          <img className="fg-img mascot" src={mascot || autoMascot} alt="mascot" />
          <img className="fg-img weapon" src={weapon || autoWeapon} alt="weapon" />
        </div>
      </div>
    </div>
  )
}
