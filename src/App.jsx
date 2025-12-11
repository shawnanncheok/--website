import { useState, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import ScenePage from './ScenePage.jsx'
import AdminPage from './AdminPage.jsx'

const BACKGROUNDS = [
  '/images/bg1.jpg',
  '/images/bg2.jpg',
  '/images/bg3.jpg',
]

const MASCOTS = [
  '/images/mascot1.png',
  '/images/mascot2.png',
]

const WEAPONS = [
  '/images/weapon1.png',
  '/images/weapon2.png',
]

export default function App() {
  const [adminSelection, setAdminSelection] = useState({
    background: null,
    mascot: null,
    weapon: null,
  })

  // 只要有任意一个格子有值，就停动画
  const isRunning = useMemo(() => {
    return !(
      adminSelection.background ||
      adminSelection.mascot ||
      adminSelection.weapon
    )
  }, [adminSelection])

  // 切换选中的格子（再点一次取消）
  function toggleField(field, list) {
    setAdminSelection(prev => {
      // 随机选一个
      const random = list[Math.floor(Math.random() * list.length)]

      // 如果已经有选了，再点就清空
      if (prev[field]) {
        return { ...prev, [field]: null }
      }

      return { ...prev, [field]: random }
    })
  }

  function clearAll() {
    setAdminSelection({
      background: null,
      mascot: null,
      weapon: null,
    })
  }

  return (
    <Routes>
      {/* Screen 主页 */}
      <Route
        path="/"
        element={
          <ScenePage
            isRunning={isRunning}
            background={adminSelection.background}
            mascot={adminSelection.mascot}
            weapon={adminSelection.weapon}
          />
        }
      />

      {/* Admin 控制页 */}
      <Route
        path="/admin"
        element={
          <AdminPage
            selection={adminSelection}
            onToggleBackground={() => toggleField('background', BACKGROUNDS)}
            onToggleMascot={() => toggleField('mascot', MASCOTS)}
            onToggleWeapon={() => toggleField('weapon', WEAPONS)}
            onClearAll={clearAll}
          />
        }
      />
    </Routes>
  )
}
