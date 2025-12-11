export default function Scene({ isRunning, background, mascot, weapon }) {
  // 有选背景就用选的，没有就用默认
  const bgStyle = {
    backgroundImage: `url(${background || '/images/default-bg.jpg'})`,
  }

  return (
    <div className="scene">
      <div
        className={`scene-bg ${isRunning ? 'bg-running' : 'bg-stopped'}`}
        style={bgStyle}
      >
        <img
          className={`center-img left ${isRunning ? 'img-running-left' : ''}`}
          src={mascot || '/images/default-mascot.png'}
          alt="mascot"
        />
        <img
          className={`center-img right ${isRunning ? 'img-running-right' : ''}`}
          src={weapon || '/images/default-weapon.png'}
          alt="weapon"
        />
      </div>
    </div>
  )
}
