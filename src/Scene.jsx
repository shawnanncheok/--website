import { useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS, MASCOTS, WEAPONS } from "./assetsList";

// path -> index（兼容 /--website/ 前缀，只比对结尾）
function indexFromPath(list, path) {
  if (!path) return null;
  const p = String(path);
  const idx = list.findIndex((src) => p.endsWith(String(src)));
  return idx >= 0 ? idx : null;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function Scene({ background, mascot, weapon }) {
  const trackRef = useRef(null);

  // 目标背景 index（0-based），null = AUTO
  const targetBgIndex = useMemo(
    () => indexFromPath(BACKGROUNDS, background),
    [background]
  );

  // AUTO mascot/weapon：null 才循环
  const [autoMascotIdx, setAutoMascotIdx] = useState(0);
  const [autoWeaponIdx, setAutoWeaponIdx] = useState(0);

  useEffect(() => {
    if (mascot) return;
    const t = setInterval(
      () => setAutoMascotIdx((i) => (i + 1) % MASCOTS.length),
      120
    );
    return () => clearInterval(t);
  }, [mascot]);

  useEffect(() => {
    if (weapon) return;
    const t = setInterval(
      () => setAutoWeaponIdx((i) => (i + 1) % WEAPONS.length),
      120
    );
    return () => clearInterval(t);
  }, [weapon]);

  const mascotSrc = mascot || MASCOTS[autoMascotIdx];
  const weaponSrc = weapon || WEAPONS[autoWeaponIdx];

  // 背景 tiles 做两轮（无缝）
  const tiles = useMemo(
  () => [...BACKGROUNDS, ...BACKGROUNDS, ...BACKGROUNDS],
    []
  )

  // ===== 背景滚动（JS 控制）=====
  const xRef = useRef(0);                 // 当前 translateX（负数：向左滚）
  const rafRef = useRef(0);
  const modeRef = useRef("auto");         // "auto" | "stopping"
  const stopAnimRef = useRef(null);       // { fromX, toX, start, dur }

  // 每帧更新 transform
  const applyX = (x) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transform = `translateX(${x}px)`;
  };

  // 主 rAF 循环：auto 时一直滚；stopping 时 ease 到目标
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let last = performance.now();

    const loop = (now) => {
      const dt = Math.min(40, now - last); // 防抖
      last = now;

      const tileW = el.parentElement?.clientWidth || window.innerWidth;
      const N = BACKGROUNDS.length;
      const period = N * tileW;

      // AUTO：匀速向左滚
      if (modeRef.current === "auto") {
        const speed = tileW / 300; // 每 ms 移动多少 px（可调：越大越快）
        let x = xRef.current - speed * dt;

        // wrap：保持在 [-period, 0] 区间更稳
        if (x <= -period) x += period;
        xRef.current = x;
        applyX(x);
      }

      // STOPPING：ease 到 toX
      if (modeRef.current === "stopping" && stopAnimRef.current) {
        const { fromX, toX, start, dur } = stopAnimRef.current;
        const t = Math.min(1, (now - start) / dur);
        const e = easeOutCubic(t);
        const x = fromX + (toX - fromX) * e;
        xRef.current = x;
        applyX(x);

        if (t >= 1) {
          // 完成后定格
          modeRef.current = "fixed";
          stopAnimRef.current = null;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // submit 改了 background => 决定 AUTO or 慢停
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const tileW = el.parentElement?.clientWidth || window.innerWidth;
    const N = BACKGROUNDS.length;
    const period = N * tileW;

    // 1) background = null => 回到 AUTO
    if (targetBgIndex === null) {
      modeRef.current = "auto";
      stopAnimRef.current = null;
      return;
    }

    // 2) 有目标 => 从当前 pos 继续向左走一段，然后停在目标 tile 的边界
    // 当前走了多少（pos 为 [0, period)）
    const pos = ((-xRef.current) % period + period) % period;

    // 目标位置（pos 也在 [0, period)）
    const targetPos = targetBgIndex * tileW;

    // 需要再走多少才能对齐目标（继续向左滚）
    let delta = (targetPos - pos + period) % period;

    // 如果刚好已经在目标边界附近，还是让它再走一轮更自然
    if (delta < tileW * 0.6) delta += period;

    const fromX = xRef.current;
    const toX = fromX - delta; // 向左 => x 更负

    // 距离越远 duration 越久（可调）
    const dur = Math.min(3500, Math.max(900, (delta / tileW) * 700));

    modeRef.current = "stopping";
    stopAnimRef.current = {
      fromX,
      toX,
      start: performance.now(),
      dur,
    };
  }, [targetBgIndex]);

  return (
    <div className="scene">
      <div className="scene-bg">
        <div ref={trackRef} className="bg-track">
          {tiles.map((src, idx) => (
            <div
              key={idx}
              className="bg-tile"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="fg-center stack">
          <img className="fg-img mascot" src={mascotSrc} alt="mascot" />
          <img className="fg-img weapon" src={weaponSrc} alt="weapon" />
        </div>
      </div>
    </div>
  );
}
