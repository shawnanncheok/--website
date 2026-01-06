import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import Scene from './Scene.jsx'

const DEFAULT_STATE = {
  background: null,
  mascot: null,
  weapon: null,
  listenEnabled: false,
}

export default function ScenePage() {
  const [control, setControl] = useState(DEFAULT_STATE)
  const unsubRef = useRef(null)

  useEffect(() => {
    const ref = doc(db, 'control', 'current')

    // 1) 先读一次（不监听）
    ;(async () => {
      const snap = await getDoc(ref)
      if (!snap.exists()) return
      const data = snap.data()
      setControl({
        background: data.background ?? null,
        mascot: data.mascot ?? null,
        weapon: data.weapon ?? null,
        listenEnabled: data.listenEnabled ?? false,
      })

      // 2) 只有 listenEnabled=true 才开始 onSnapshot
      if (data.listenEnabled) {
        startListen(ref)
      }
    })().catch(console.error)

    // 清理
    return () => {
      if (unsubRef.current) unsubRef.current()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startListen(ref) {
    if (unsubRef.current) return // 已经在听就别重复
    unsubRef.current = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return
      const data = snap.data()

      // 如果未来你想“再次停止监听”，这里也能做
      if (!data.listenEnabled) return

      setControl(prev => ({
        ...prev,
        background: data.background ?? null,
        mascot: data.mascot ?? null,
        weapon: data.weapon ?? null,
        listenEnabled: true,
      }))
    })
  }

  return (
    <div className="page scene-page">
      <Scene
        background={control.background}
        mascot={control.mascot}
        weapon={control.weapon}
      />
    </div>
  )
}
