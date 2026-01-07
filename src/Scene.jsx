import { useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS, MASCOTS, WEAPONS } from "./assetsList";

/** path -> index（优先 regex，否则 endsWith） */
function indexFromPath(list, path, kind) {
  if (!path) return null;
  const p = String(path);

  const re =
    kind === "background"
      ? /(background|bg)\/(\d+)\.png$/
      : /(weapon|weapons)\/(\d+)\.png$/;

  const m = p.match(re);
  if (m) {
    const n = Number(m[2]);
    const idx = n - 1;
    return Number.isFinite(n) && idx >= 0 && idx < list.length ? idx : null;
  }

  const idx = list.findIndex((src) => p.endsWith(String(src)));
  return idx >= 0 ? idx : null;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export default function Scene({ background, mascot, weapon }) {
  /* =========================
     1) Mascot AUTO（null 才循环）
  ========================= */
  const [autoMascotIdx, setAutoMascotIdx] = useState(0);

  useEffect(() => {
    if (mascot) return;
    const t = setInterval(
      () => setAutoMascotIdx((i) => (i + 1) % MASCOTS.length),
      120
    );
    return () => clearInterval(t);
  }, [mascot]);

  const mascotSrc = mascot || MASCOTS[autoMascotIdx];

  /* =========================
     2) Background（向左滚 + 慢停）
     - 逻辑：pos 表示走了多少（向左 = pos 增加，track translateX = -pos）
  ========================= */
  const bgTrackRef = useRef(null);
  const targetBgIndex = useMemo(
    () => indexFromPath(BACKGROUNDS, background, "background"),
    [background]
  );

  const bgTiles = useMemo(
    () => [...BACKGROUNDS, ...BACKGROUNDS, ...BACKGROUNDS], // 3轮防黑屏
    []
  );

  const bgPosRef = useRef(0);
  const bgModeRef = useRef("auto"); // auto | stopping | fixed
  const bgStopRef = useRef(null);   // { fromPos, toPos, start, dur }
  const bgRafRef = useRef(0);
  const bgLastRef = useRef(0);

  // 背景 rAF 循环
  useEffect(() => {
    const track = bgTrackRef.current;
    if (!track) return;

    bgLastRef.current = performance.now();

    const loop = (now) => {
      const dt = Math.min(34, now - bgLastRef.current);
      bgLastRef.current = now;

      const tileW = window.innerWidth; // 你 bg-tile = 100vw
      const N = BACKGROUNDS.length;
      const period = N * tileW;

      const norm = (pos) => {
        let p = pos % period;
        if (p < 0) p += period;
        return p;
      };

      if (bgModeRef.current === "auto") {
        const speedPxPerSec = 900; // ✅ 背景速度可调
        const dp = (speedPxPerSec * dt) / 1000;
        bgPosRef.current = norm(bgPosRef.current + dp);
        track.style.transform = `translateX(${-bgPosRef.current}px)`;
      }

      if (bgModeRef.current === "stopping" && bgStopRef.current) {
        const { fromPos, toPos, start, dur } = bgStopRef.current;
        const t = Math.min(1, (now - start) / dur);
        const e = easeOutCubic(t);
        const pos = fromPos + (toPos - fromPos) * e;

        const p = norm(pos);
        bgPosRef.current = p;
        track.style.transform = `translateX(${-p}px)`;

        if (t >= 1) {
          bgModeRef.current = "fixed";
          bgStopRef.current = null;
        }
      }

      bgRafRef.current = requestAnimationFrame(loop);
    };

    bgRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(bgRafRef.current);
  }, []);

  // 背景：background 改变 => AUTO or 慢停到目标
  useEffect(() => {
    const track = bgTrackRef.current;
    if (!track) return;

    const tileW = window.innerWidth;
    const N = BACKGROUNDS.length;
    const period = N * tileW;

    const norm = (pos) => {
      let p = pos % period;
      if (p < 0) p += period;
      return p;
    };

    bgPosRef.current = norm(bgPosRef.current);

    // 1) null => 回 AUTO
    if (targetBgIndex === null) {
      bgModeRef.current = "auto";
      bgStopRef.current = null;
      return;
    }

    // 2) 有目标 => 慢停到 targetBgIndex
    const currentPos = bgPosRef.current;          // 0..period
    const targetPos = targetBgIndex * tileW;      // 对齐 tile 左边界
    let delta = (targetPos - currentPos + period) % period;

    // 如果太近，走一整轮更自然
    if (delta < tileW * 0.45) delta += period;

    const fromPos = currentPos;
    const toPos = currentPos + delta;
    const dur = Math.min(3200, Math.max(900, (delta / tileW) * 800));

    bgModeRef.current = "stopping";
    bgStopRef.current = { fromPos, toPos, start: performance.now(), dur };
  }, [targetBgIndex]);

  /* =========================
     3) Weapon Reel（向右滚 + 慢停）
     - 逻辑：pos 表示走了多少（向右 = pos 增加，但 track translateX = -pos 视觉向右）
  ========================= */
  const wpStageRef = useRef(null);
  const wpTrackRef = useRef(null);

  const targetWpIndex = useMemo(
    () => indexFromPath(WEAPONS, weapon, "weapon"),
    [weapon]
  );

  const wpTiles = useMemo(() => [...WEAPONS, ...WEAPONS, ...WEAPONS], []);

  const wpPosRef = useRef(0);
  const wpModeRef = useRef("auto"); // auto | stopping | fixed
  const wpStopRef = useRef(null);
  const wpRafRef = useRef(0);
  const wpLastRef = useRef(0);

  const showReel = () => {
    const stage = wpStageRef.current;
    if (!stage) return;
    stage.classList.remove("wp-fixed");
    stage.classList.add("wp-reel");
  };

  const showFixed = () => {
    const stage = wpStageRef.current;
    if (!stage) return;
    stage.classList.add("wp-fixed");
    stage.classList.remove("wp-reel");
  };

  // weapon rAF 循环
  useEffect(() => {
    const stage = wpStageRef.current;
    const track = wpTrackRef.current;
    if (!stage || !track) return;

    wpLastRef.current = performance.now();

    const loop = (now) => {
      const dt = Math.min(34, now - wpLastRef.current);
      wpLastRef.current = now;

      const w = stage.clientWidth || 1;
      const N = WEAPONS.length;
      const period = N * w;

      const norm = (pos) => {
        let p = pos % period;
        if (p < 0) p += period;
        return p;
      };

      if (wpModeRef.current === "auto") {
        const speedPxPerSec = 650;
        const dp = (speedPxPerSec * dt) / 1000;
        wpPosRef.current = norm(wpPosRef.current + dp);
        track.style.transform = `translateX(${-wpPosRef.current}px)`;
      }

      if (wpModeRef.current === "stopping" && wpStopRef.current) {
        const { fromPos, toPos, start, dur } = wpStopRef.current;
        const t = Math.min(1, (now - start) / dur);
        const e = easeOutCubic(t);
        const pos = fromPos + (toPos - fromPos) * e;

        const p = norm(pos);
        wpPosRef.current = p;
        track.style.transform = `translateX(${-p}px)`;

        if (t >= 1) {
          wpModeRef.current = "fixed";
          wpStopRef.current = null;
          showFixed();
        }
      }

      wpRafRef.current = requestAnimationFrame(loop);
    };

    wpRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(wpRafRef.current);
  }, []);

  // weapon 改变 => AUTO or 慢停
  useEffect(() => {
    const stage = wpStageRef.current;
    if (!stage) return;

    const w = stage.clientWidth || 1;
    const N = WEAPONS.length;
    const period = N * w;

    const norm = (pos) => {
      let p = pos % period;
      if (p < 0) p += period;
      return p;
    };

    wpPosRef.current = norm(wpPosRef.current);

    // 1) null => 回 AUTO
    if (targetWpIndex === null) {
      wpModeRef.current = "auto";
      wpStopRef.current = null;
      showReel();
      return;
    }

    // 2) 有目标 => 慢停
    showReel();

    const currentPos = wpPosRef.current;
    const targetPos = targetWpIndex * w;

    let delta = (targetPos - currentPos + period) % period;
    if (delta < w * 0.45) delta += period;

    const fromPos = currentPos;
    const toPos = currentPos + delta;
    const dur = Math.min(2600, Math.max(750, (delta / w) * 520));

    wpModeRef.current = "stopping";
    wpStopRef.current = { fromPos, toPos, start: performance.now(), dur };
  }, [targetWpIndex]);

  return (
    <div className="scene">
      <div className="scene-bg">
        {/* ✅ Background track（一定要有，不然 background 就 unused） */}
        <div ref={bgTrackRef} className="bg-track">
          {bgTiles.map((src, idx) => (
            <div
              key={idx}
              className="bg-tile"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="fg-center stack">
          <img className="fg-img mascot" src={mascotSrc} alt="mascot" />

          {/* ✅ Weapon Stage：里面永远渲染 reel + fixed */}
          <div ref={wpStageRef} className="weapon-stage wp-reel">
            <div ref={wpTrackRef} className="weapon-track">
              {wpTiles.map((src, idx) => (
                <div className="weapon-tile" key={idx}>
                  <img className="weapon-img" src={src} alt="" draggable="false" />
                </div>
              ))}
            </div>

            {/* 定格图：wp-fixed 时显示 */}
            <img
              className="weapon-fixed"
              src={weapon || ""}
              alt="weapon"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
