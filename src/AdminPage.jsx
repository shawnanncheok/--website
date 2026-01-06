import { Link } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'


function NumberStrip({ count, activeIndex = null, onPick }) {
  const arr = Array.from({ length: count }, (_, i) => i)


  return (
    <div className="num-strip">
      {arr.map(i => (
        <button
          key={i}
          type="button"
          className={`num-pill ${activeIndex === i ? 'active' : ''}`}
          onClick={() => onPick?.(i)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}

export default function AdminPage({
  selection,
  onToggleBackground,
  onToggleMascot,
  onToggleWeapon,
  onClearAll,

  // ✅ 新增：由 App 传进来
  onPickBackground,
  onPickMascot,
  onPickWeapon,
}) {
  const BG_COUNT = 4
  const MASCOT_COUNT = 6
  const WEAPON_COUNT = 6

  const deleteBg = () => selection.background && onToggleBackground()
  const deleteMascot = () => selection.mascot && onToggleMascot()
  const deleteWeapon = () => selection.weapon && onToggleWeapon()

const submit = async () => {
  console.log('🔥 submit clicked', selection)

  try {
    const ref = doc(db, 'control', 'current')

    const payload = {
      background: selection.background ?? null,
      mascot: selection.mascot ?? null,
      weapon: selection.weapon ?? null,
      running: !(selection.background || selection.mascot || selection.weapon),
      updatedAt: Date.now(),

      // ✅ 关键：按下 submit 才让 Scene 开始监听
      listenEnabled: true,
    }

    await setDoc(ref, payload, { merge: true })
    console.log('✅ after setDoc', payload)
  } catch (err) {
    console.error('❌ Submit failed:', err)
    alert(err?.message || String(err))
  }
}




  return (
    <div className="page admin-page">
      <div className="admin-card admin-v2">
        <div className="admin-top">
          <h1 className="admin-title">Admin Control</h1>
          <Link to="/" className="admin-link">
            Back to Scene
          </Link>
        </div>

        <div className="admin-pickers">
          {/* Background */}
          <div className="pick-col">
            <div className="pick-head">
              <div className="pick-title">Background</div>
              <div className="pick-count">{BG_COUNT}</div>
            </div>

            <NumberStrip
              count={BG_COUNT}
              onPick={(i) => onPickBackground?.(i)}   // ✅ 点号码=选第 i 张
            />

            <div className="pick-actions">
              <button className="btn small" onClick={deleteBg}>Delete</button>
            </div>
          </div>

          {/* Mascot */}
          <div className="pick-col">
            <div className="pick-head">
              <div className="pick-title">Mascot</div>
              <div className="pick-count">{MASCOT_COUNT}</div>
            </div>

            <NumberStrip
              count={MASCOT_COUNT}
              onPick={(i) => onPickMascot?.(i)}       // ✅ 点号码=选第 i 张
            />

            <div className="pick-actions">
              <button className="btn small" onClick={deleteMascot}>Delete</button>
            </div>
          </div>

          {/* Weapon */}
          <div className="pick-col">
            <div className="pick-head">
              <div className="pick-title">Weapon</div>
              <div className="pick-count">{WEAPON_COUNT}</div>
            </div>

            <NumberStrip
              count={WEAPON_COUNT}
              onPick={(i) => onPickWeapon?.(i)}       // ✅ 点号码=选第 i 张
            />

            <div className="pick-actions">
              <button className="btn small" onClick={deleteWeapon}>Delete</button>
            </div>
          </div>
        </div>

        {/* 预览 */}
        <div className="admin-preview">
          <div className="preview-item">
            <div className="preview-label">Background</div>
            <div className="preview-box">
              {selection.background ? (
                <img className="preview-img cover" src={selection.background} alt="" />
              ) : (
                <div className="preview-empty">AUTO</div>
              )}
            </div>
          </div>

          <div className="preview-item">
            <div className="preview-label">Mascot</div>
            <div className="preview-box">
              {selection.mascot ? (
                <img className="preview-img contain" src={selection.mascot} alt="" />
              ) : (
                <div className="preview-empty">AUTO</div>
              )}
            </div>
          </div>

          <div className="preview-item">
            <div className="preview-label">Weapon</div>
            <div className="preview-box">
              {selection.weapon ? (
                <img className="preview-img contain" src={selection.weapon} alt="" />
              ) : (
                <div className="preview-empty">AUTO</div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-bottom">
          <button type="button" className="btn" onClick={submit}>Submit</button>
          <button type="button" className="btn danger" onClick={onClearAll}>Clear All</button>
        </div>

        <p className="admin-tip">
          规则：三个都清空 = 画面开始快速滚动；只要选到任何一个 = 停止滚动并固定显示。
        </p>
      </div>
    </div>
  )
}
