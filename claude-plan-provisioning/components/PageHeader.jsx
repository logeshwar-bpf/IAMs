/**
 * PageHeader — renders the sticky .topbar with title, subtitle, and optional actions.
 * Mirrors Global IAM's <PageHeader> component.
 */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-sub">{subtitle}</p>}
      </div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </div>
  );
}
