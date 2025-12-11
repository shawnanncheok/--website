export default function AdminPanel({
  selection,
  onToggleBackground,
  onToggleMascot,
  onToggleWeapon,
  onClearAll,
}) {
  return (
    <div className="admin-panel">
      <div className="admin-row">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={!!selection.background}
            onChange={onToggleBackground}
          />
          <span>背景（随机一张）</span>
        </label>
      </div>

      <div className="admin-row">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={!!selection.mascot}
            onChange={onToggleMascot}
          />
          <span>吉祥物</span>
        </label>
      </div>

      <div className="admin-row">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={!!selection.weapon}
            onChange={onToggleWeapon}
          />
          <span>武器</span>
        </label>
      </div>

      <button className="clear-btn" onClick={onClearAll}>
        Clear All
      </button>
    </div>
  )
}
