import { useEffect, useMemo, useRef, useState } from 'react'
import { BACKGROUNDS, MASCOTS, WEAPONS } from './assetsList'

export default function Scene({ backgroundNo, mascotNo, weaponNo }) {
  const trackRef = useRef(null)

  // 0-based target index
  const targetBgIndex = backgroundNo ? backgroundNo - 1 : null

  // AUTO mascot/weapon：null 就自己循环；有号码就固定
  const [autoMascotIdx, setAutoMascotIdx] = useState(0)
  const [autoWeaponIdx, setAutoWeaponIdx] = useState(0)

  useEffect(() => {
    if (mascotNo) return
    const t = setInterval(() => {
      setAutoMascotIdx(i => (i + 1) % MASCOTS.length)
    }, 120)
    return () => clearInterval(t)
  }, [mascotNo])

  useEffect(() => {
    if (weaponNo) return
    const t = setInterval(() => {
      setAutoWeaponIdx(i => (i + 1) % WEAPONS.length)
    }, 120)
    return () => clearInterval(t)
  }, [weaponNo])

  const mascotSrc = mascotNo ? MASCOTS[mascotNo - 1] : MASCOTS[autoMascotIdx]
  const weaponSrc = weaponNo ? WEAPONS[weaponNo - 1] : WEAPONS[autoWeaponIdx]

  // 背景 tiles 做两轮，滚动无缝
  const tiles = useMemo(() => [...BACKGROUNDS, ...BACKGROUNDS], [])

  // ✅ Advanced：当 targetBgIndex 有值时，慢慢滑到目标
  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    // 没选背景 => AUTO：加上无限滚 class
    if (targetBgIndex === null) {
      el.classList.add('track-auto')
      el.style.transition = 'none'
      el.style.transform = '' // 交给 animation
      return
    }

    // 有选背景 => 从当前滚动位置“接管”并 ease-out 滑到目标
    // 1) 读取当前 translateX
    const computed = getComputedStyle(el).transform
    let currentX = 0
    if (computed && computed !== 'none') {
      const values = computed.match(/matrix\((.+)\)/)?.[1]?.split(',') || null
      if (values) currentX = parseFloat(values[4]) || 0
    }

    // 2) 停掉无限滚，锁住当前帧
    el.classList.remove('track-auto')
    el.style.transition = 'none'
    el.style.transform = `translateX(${currentX}px)`

    // 3) 下一帧开始 ease-out 滑动到目标
    requestAnimationFrame(() => {
      const tileW = window.innerWidth // 你 bg-tile 是 100vw
      const N = BACKGROUNDS.length

      // 当前在第几格（用 currentX 估算）
      // 注意：我们的动画方向是向右移动（translateX 增加）
      const currentIndex = ((Math.round(currentX / tileW) % N) + N) % N

      // 计算“往右走”到目标需要走几格（至少 1~N）
      let deltaTiles = (targetBgIndex - currentIndex + N) % N
      if (deltaTiles === 0) deltaTiles = N

      // 走这些格子，让它滑过去再停
      const targetX = currentX + deltaTiles * tileW

      // duration 可按距离决定（越远越久）
      const duration = Math.min(3000, 600 + deltaTiles * 500)

      el.style.transition = `transform ${duration}ms cubic-bezier(.12,.85,.18,1)` // ease-out
      el.style.transform = `translateX(${targetX}px)`
    })
  }, [targetBgIndex])

  return (
    <div className="scene">
      <div className="scene-bg">
        {/* ✅ 背景带：永远存在；AUTO 时滚；选了就滑到目标 */}
        <div ref={trackRef} className="bg-track track-auto">
          {tiles.map((src, idx) => (
            <div key={idx} className="bg-tile" style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>

        {/* ✅ 前景叠在正中 */}
        <div className="fg-center stack">
          <img className="fg-img mascot" src={mascotSrc} alt="mascot" />
          <img className="fg-img weapon" src={weaponSrc} alt="weapon" />
        </div>
      </div>
    </div>
  )
}
