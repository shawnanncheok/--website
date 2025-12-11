import { Link } from 'react-router-dom'
import Scene from './Scene.jsx'

export default function ScenePage({ isRunning, background, mascot, weapon }) {
  return (
    <div className="page scene-page">
      <Scene
        isRunning={isRunning}
        background={background}
        mascot={mascot}
        weapon={weapon}
      />

      {/* 方便开发时切去 admin，用的时候可以关掉这行 */}
      <Link to="/admin" className="page-link">
        Go to Admin
      </Link>
    </div>
  )
}
