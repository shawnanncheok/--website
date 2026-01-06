import { useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ScenePage from './ScenePage.jsx'
import AdminPage from './AdminPage.jsx'
import './App.css'
import { BACKGROUNDS, MASCOTS, WEAPONS } from './assetsList'


export default function App() {
  const [selection, setSelection] = useState({
    background: null,
    mascot: null,
    weapon: null,
  })

  // 规则：只要选了任意一个，就停止跑动；全空才跑动
  const isRunning = useMemo(() => {
    return !(selection.background || selection.mascot || selection.weapon)
  }, [selection])

  // ✅ 保留你原本的随机/取消逻辑（checkbox 或 random 按钮用）
  function pickRandom(field, list) {
    setSelection(prev => {
      if (prev[field]) return { ...prev, [field]: null } // 再点一次清空
      const random = list[Math.floor(Math.random() * list.length)]
      return { ...prev, [field]: random }
    })
  }

  // ✅ 新增：按号码选指定图片（不会 random）
  function pickByIndex(field, list, index) {
    setSelection(prev => {
      const img = list[index]
      if (!img) return prev
      return { ...prev, [field]: img }
    })
  }

  // ✅ 这三个就是你要传给 AdminPage 的
  const onPickBackground = (index) => pickByIndex('background', BACKGROUNDS, index)
  const onPickMascot = (index) => pickByIndex('mascot', MASCOTS, index)
  const onPickWeapon = (index) => pickByIndex('weapon', WEAPONS, index)

  function clearAll() {
    setSelection({ background: null, mascot: null, weapon: null })
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ScenePage
            isRunning={isRunning}
            background={selection.background}
            mascot={selection.mascot}
            weapon={selection.weapon}
          />
        }
      />

      <Route
        path="/admin"
        element={
          <AdminPage
            selection={selection}
            onToggleBackground={() => pickRandom('background', BACKGROUNDS)}
            onToggleMascot={() => pickRandom('mascot', MASCOTS)}
            onToggleWeapon={() => pickRandom('weapon', WEAPONS)}
            onClearAll={clearAll}

            // ✅ 新增：号码按钮用这个
            onPickBackground={onPickBackground}
            onPickMascot={onPickMascot}
            onPickWeapon={onPickWeapon}
          />
        }
      />
    </Routes>
  )
}
