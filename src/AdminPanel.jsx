import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export default function AdminPanel({ onClearAll }) {
  // 号码：null 表示不选（AUTO）
  const [bgNo, setBgNo] = useState(null)        // 1..4
  const [mascotNo, setMascotNo] = useState(null) // 1..6
  const [weaponNo, setWeaponNo] = useState(null) // 1..6

  // 生成号码按钮
  const renderNumbers = (count, value, setValue) => {
    return (
      <div className="num-strip">
        {Array.from({ length: count }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            className={`num-pill ${value === n ? 'active' : ''}`}
            onClick={() => setValue(prev => (prev === n ? null : n))} // 再点一次取消
          >
            {n}
          </button>
        ))}
      </div>
    )
  }

  async function handleSubmit() {
    const ref = doc(db, 'control', 'current')

    // Firestore 存“名字/路径”，Scene 直接用 public 路径显示
    const payload = {
      background: bgNo ? `/assets/background/${bgNo}.png` : null,
      mascot: mascotNo ? `/assets/mascot/${mascotNo}.png` : null,
      weapon: weaponNo ? `/assets/weapons/${weaponNo}.png` : null,
      running: !(bgNo || mascotNo || weaponNo), // 全空才跑
      updatedAt: Date.now(),
    }

    await setDoc(ref, payload, { merge: true })
    console.log('Submitted to Firestore:', payload)
  }

  function handleClearAllLocal() {
    setBgNo(null)
    setMascotNo(null)
    setWeaponNo(null)

    // 如果你还要清 Scene（写回 Firestore）
    // 可以直接调用 onClearAll 或自己 setDoc 全 null
    onClearAll?.()
  }

  return (
    <div className="admin-panel">
      <div className="admin-row">
        <div className="admin-label">Background (1–4)</div>
        {renderNumbers(4, bgNo, setBgNo)}
        <button className="btn small" onClick={() => setBgNo(null)}>Delete</button>
      </div>

      <div className="admin-row">
        <div className="admin-label">Mascot (1–6)</div>
        {renderNumbers(6, mascotNo, setMascotNo)}
        <button className="btn small" onClick={() => setMascotNo(null)}>Delete</button>
      </div>

      <div className="admin-row">
        <div className="admin-label">Weapon (1–6)</div>
        {renderNumbers(6, weaponNo, setWeaponNo)}
        <button className="btn small" onClick={() => setWeaponNo(null)}>Delete</button>
      </div>

      <div className="admin-bottom">
        <button className="btn" onClick={handleSubmit}>Submit</button>
        <button className="btn danger" onClick={handleClearAllLocal}>Clear All</button>
      </div>
    </div>
  )
}
