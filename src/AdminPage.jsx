import { Link } from 'react-router-dom'
import AdminPanel from './AdminPanel.jsx'

export default function AdminPage({
  selection,
  onToggleBackground,
  onToggleMascot,
  onToggleWeapon,
  onClearAll,
}) {
  return (
    <div className="page admin-page">
      <h1 className="page-title">Admin Panel</h1>

      <AdminPanel
        selection={selection}
        onToggleBackground={onToggleBackground}
        onToggleMascot={onToggleMascot}
        onToggleWeapon={onToggleWeapon}
        onClearAll={onClearAll}
      />

      <Link to="/" className="page-link">
        Go to Screen
      </Link>
    </div>
  )
}
